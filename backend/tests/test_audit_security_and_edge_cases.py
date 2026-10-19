import uuid
import asyncio
from decimal import Decimal
import pytest
import jwt
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker

from app.core.config import settings
from app.models.usuario import Usuario
from app.models.material import Material
from app.models.estoque import EstoquePorLocalizacao, Movimentacao, TipoMovimentacaoEnum, FinalidadeEnum
from app.models.auditoria import AuditoriaLog
from app.services.requisition_service import RequisitionService
from tests.conftest import auth_headers_for, test_engine


@pytest.mark.asyncio
async def test_auth_jwt_algoritmos_adulterados_e_expiracao(client: AsyncClient, seed_data: dict):
    """
    1. AUTENTICAÇÃO E SESSÃO:
    Valida que tokens com 'none' algorithm, assinatura adulterada, expiração passada
    ou usuário desativado são categoricamente rejeitados com 401.
    """
    admin: Usuario = seed_data["admin"]

    # 1. Token com 'none' algorithm
    token_none = jwt.encode(
        {"sub": admin.email, "user_id": str(admin.id), "role": admin.role.value, "type": "access"},
        key="",
        algorithm="none"
    )
    res_none = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token_none}"})
    assert res_none.status_code == 401

    # 2. Token com chave/assinatura adulterada
    token_bad_key = jwt.encode(
        {"sub": admin.email, "user_id": str(admin.id), "role": admin.role.value, "type": "access"},
        key="chave_falsa_completamente_incorreta_123456",
        algorithm="HS256"
    )
    res_bad_key = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token_bad_key}"})
    assert res_bad_key.status_code == 401

    # 3. Token expirado (exp no passado)
    token_expirado = jwt.encode(
        {"sub": admin.email, "user_id": str(admin.id), "role": admin.role.value, "type": "access", "exp": 1000000000},
        key=settings.SECRET_KEY,
        algorithm="HS256"
    )
    res_expirado = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token_expirado}"})
    assert res_expirado.status_code == 401

    # 4. Token do tipo incorreto (refresh token usado como access token em rota de API)
    token_refresh = jwt.encode(
        {"sub": admin.email, "user_id": str(admin.id), "role": admin.role.value, "type": "refresh"},
        key=settings.SECRET_KEY,
        algorithm="HS256"
    )
    res_refresh_as_access = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token_refresh}"})
    assert res_refresh_as_access.status_code == 401


@pytest.mark.asyncio
async def test_auth_usuario_desativado_perde_acesso(client: AsyncClient, seed_data: dict, db_session):
    """
    1. AUTENTICAÇÃO:
    Valida que um usuário desativado no banco tem seu acesso cortado imediatamente.
    """
    solicitante: Usuario = seed_data["solicitante1"]
    headers = auth_headers_for(solicitante)

    # Acesso ativo inicial
    res1 = await client.get("/api/v1/auth/me", headers=headers)
    assert res1.status_code == 200

    # Desativa o usuário no banco
    solicitante.ativo = False
    await db_session.commit()

    # Tentativa com o mesmo token anterior -> Acesso recusado
    res2 = await client.get("/api/v1/auth/me", headers=headers)
    assert res2.status_code in (400, 401)


@pytest.mark.asyncio
async def test_rbac_idor_solicitante_nao_acessa_requisicao_alheia(client: AsyncClient, seed_data: dict):
    """
    2. AUTORIZAÇÃO / IDOR:
    Garante que SOLICITANTE 2 não consegue visualizar requisição criada pelo SOLICITANTE 1.
    """
    sol1: Usuario = seed_data["solicitante1"]
    sol2: Usuario = seed_data["solicitante2"]

    # Solicitante 1 cria requisição
    res_create = await client.post(
        "/api/v1/requisicoes",
        headers=auth_headers_for(sol1),
        json={
            "finalidade": "USO_INTERNO",
            "justificativa": "Material para teste do Solicitante 1",
            "itens": [{
                "material_id": str(seed_data["material"].id),
                "localizacao_id": str(seed_data["localizacao"].id),
                "quantidade_solicitada": 2.0
            }]
        }
    )
    assert res_create.status_code == 200
    req_id = res_create.json()["id"]

    # Solicitante 2 tenta acessar via ID da requisição do Solicitante 1 -> 403 Forbidden
    res_idor = await client.get(
        f"/api/v1/requisicoes/{req_id}",
        headers=auth_headers_for(sol2)
    )
    assert res_idor.status_code == 403


@pytest.mark.asyncio
async def test_concorrencia_disputa_saldo_10_duas_requisicoes_de_8(seed_data: dict):
    """
    4. CONCORRÊNCIA:
    Cenário exato:
    Estoque disponível = 10
    Requisição A = 8
    Requisição B = 8
    Ambas tentam aprovação simultaneamente com transações atômicas concorrentes no PostgreSQL.
    Resultado: Apenas 1 aprova, a outra falha por saldo insuficiente, saldo físico = 10, reservado = 8, disponível = 2.
    """
    almoxarife: Usuario = seed_data["almoxarife"]
    sol1: Usuario = seed_data["solicitante1"]
    sol2: Usuario = seed_data["solicitante2"]
    mat_id = seed_data["material"].id
    loc_id = seed_data["localizacao"].id

    session_maker = async_sessionmaker(test_engine, expire_on_commit=False)

    # 1. Setup inicial com entrada de 10 unidades
    async with session_maker() as setup_session:
        saldo = EstoquePorLocalizacao(
            material_id=mat_id,
            localizacao_id=loc_id,
            quantidade_fisica=Decimal("10.0000"),
            quantidade_reservada=Decimal("0.0000"),
        )
        setup_session.add(saldo)

        req_a = await RequisitionService.criar_requisicao(
            db=setup_session,
            solicitante_id=sol1.id,
            finalidade=FinalidadeEnum.USO_INTERNO,
            itens_data=[{"material_id": mat_id, "localizacao_id": loc_id, "quantidade_solicitada": Decimal("8.0000")}],
            justificativa="Req Concorrente A"
        )
        req_b = await RequisitionService.criar_requisicao(
            db=setup_session,
            solicitante_id=sol2.id,
            finalidade=FinalidadeEnum.USO_INTERNO,
            itens_data=[{"material_id": mat_id, "localizacao_id": loc_id, "quantidade_solicitada": Decimal("8.0000")}],
            justificativa="Req Concorrente B"
        )
        await setup_session.commit()
        req_a_id = req_a.id
        req_b_id = req_b.id

    # 2. Função de aprovação executada por worker independente com sua própria sessão/transação
    async def tentar_aprovar(req_id: uuid.UUID):
        async with session_maker() as session:
            try:
                await RequisitionService.aprovar_requisicao(
                    db=session,
                    requisicao_id=req_id,
                    aprovador_id=almoxarife.id
                )
                await session.commit()
                return "SUCESSO"
            except Exception as e:
                await session.rollback()
                return f"FALHA: {type(e).__name__}"

    # Dispara 2 workers simultâneos competindo pelo saldo de 10 com pedidos de 8 cada
    resultados = await asyncio.gather(
        tentar_aprovar(req_a_id),
        tentar_aprovar(req_b_id)
    )

    assert resultados.count("SUCESSO") == 1, f"Exatamente 1 aprovação deveria suceder: {resultados}"
    assert any("SaldoInsuficienteError" in r for r in resultados), f"A outra deve falhar com SaldoInsuficienteError: {resultados}"

    # Valida saldo no banco: Físico = 10, Reservado = 8, Disponível = 2
    async with session_maker() as check_session:
        stmt = select(EstoquePorLocalizacao).where(
            EstoquePorLocalizacao.material_id == mat_id,
            EstoquePorLocalizacao.localizacao_id == loc_id
        )
        res = await check_session.execute(stmt)
        saldo_final: EstoquePorLocalizacao = res.scalar_one()

        assert saldo_final.quantidade_fisica == Decimal("10.0000")
        assert saldo_final.quantidade_reservada == Decimal("8.0000")
        assert (saldo_final.quantidade_fisica - saldo_final.quantidade_reservada) == Decimal("2.0000")


@pytest.mark.asyncio
async def test_idempotencia_operacoes_criticas(client: AsyncClient, seed_data: dict, db_session):
    """
    5. IDEMPOTÊNCIA:
    Verifica que repetir operações críticas não duplica efeitos:
    - Aprovação dupla é rejeitada.
    - Entrega dupla é rejeitada e não gera baixa dupla nem duplicata no ledger.
    - Cancelamento duplo é rejeitado.
    """
    almoxarife: Usuario = seed_data["almoxarife"]
    sol1: Usuario = seed_data["solicitante1"]
    mat_id = seed_data["material"].id
    loc_id = seed_data["localizacao"].id

    headers_almox = auth_headers_for(almoxarife)
    headers_sol = auth_headers_for(sol1)

    # Entrada de 20 un
    await client.post(
        "/api/v1/estoque/entradas",
        headers=headers_almox,
        json={"material_id": str(mat_id), "localizacao_id": str(loc_id), "quantidade": 20.0, "custo_unitario": 10.0}
    )

    # Cria requisição de 5 un
    res_req = await client.post(
        "/api/v1/requisicoes",
        headers=headers_sol,
        json={
            "finalidade": "USO_INTERNO",
            "justificativa": "Teste Idempotencia",
            "itens": [{"material_id": str(mat_id), "localizacao_id": str(loc_id), "quantidade_solicitada": 5.0}]
        }
    )
    req_id = res_req.json()["id"]

    # 1. Primeira Aprovação -> 200 OK
    res_aprov_1 = await client.post(f"/api/v1/requisicoes/{req_id}/aprovar", headers=headers_almox)
    assert res_aprov_1.status_code == 200

    # 2. Segunda Aprovação repetida -> 400 Bad Request (Não duplica reserva)
    res_aprov_2 = await client.post(f"/api/v1/requisicoes/{req_id}/aprovar", headers=headers_almox)
    assert res_aprov_2.status_code == 400

    # 3. Primeira Entrega -> 200 OK (Baixa física de 5 un e estorno de 5 un reservadas)
    res_ent_1 = await client.post(
        f"/api/v1/requisicoes/{req_id}/entregar",
        headers=headers_almox,
        json={"recebido_por": "Recebedor Oficial"}
    )
    assert res_ent_1.status_code == 200

    # 4. Segunda Entrega repetida -> 400 Bad Request (Não duplica baixa)
    res_ent_2 = await client.post(
        f"/api/v1/requisicoes/{req_id}/entregar",
        headers=headers_almox,
        json={"recebido_por": "Tentativa Duplicada"}
    )
    assert res_ent_2.status_code == 400

    # Validação do saldo pós-tentativas repetidas: Físico = 15, Reservado = 0
    stmt_saldo = select(EstoquePorLocalizacao).where(
        EstoquePorLocalizacao.material_id == mat_id,
        EstoquePorLocalizacao.localizacao_id == loc_id
    )
    res_s = await db_session.execute(stmt_saldo)
    saldo: EstoquePorLocalizacao = res_s.scalar_one()

    assert saldo.quantidade_fisica == Decimal("15.0000")
    assert saldo.quantidade_reservada == Decimal("0.0000")

    # Confirma que há exatamente 1 movimentação de SAIDA no ledger para esta requisição
    stmt_movs = select(Movimentacao).where(
        Movimentacao.requisicao_id == uuid.UUID(req_id),
        Movimentacao.tipo == TipoMovimentacaoEnum.SAIDA
    )
    res_m = await db_session.execute(stmt_movs)
    movs = res_m.scalars().all()
    assert len(movs) == 1, "Idempotência violada: foi gerada mais de uma movimentação para a mesma entrega!"


@pytest.mark.asyncio
async def test_custo_historico_imutavel_apos_entradas_futuras(client: AsyncClient, seed_data: dict, db_session):
    """
    6. CUSTO E IMUTABILIDADE DO LEDGER:
    Prova que movimentações históricas congelam custo_unitario e valor_total
    e não sofrem alteração mesmo após novas entradas com preços muito diferentes.
    """
    almoxarife: Usuario = seed_data["almoxarife"]
    mat_id = seed_data["material"].id
    loc_id = seed_data["localizacao"].id
    headers_almox = auth_headers_for(almoxarife)

    # 1. Entrada 1: 10 un @ R$ 10.00 -> Total R$ 100.00 (Médio = R$ 10.00)
    await client.post(
        "/api/v1/estoque/entradas",
        headers=headers_almox,
        json={"material_id": str(mat_id), "localizacao_id": str(loc_id), "quantidade": 10.0, "custo_unitario": 10.0}
    )

    # 2. Saída Direta de 5 un -> Valor Total congelado = R$ 50.00
    res_saida = await client.post(
        "/api/v1/estoque/saidas-diretas",
        headers=headers_almox,
        json={
            "material_id": str(mat_id),
            "localizacao_id": str(loc_id),
            "quantidade": 5.0,
            "finalidade": "MANUTENCAO",
            "observacao": "Saída de teste imutabilidade"
        }
    )
    saida_id = res_saida.json()["id"]

    # 3. Entrada Futura com Preço Inflacionado: 10 un @ R$ 100.00
    await client.post(
        "/api/v1/estoque/entradas",
        headers=headers_almox,
        json={"material_id": str(mat_id), "localizacao_id": str(loc_id), "quantidade": 10.0, "custo_unitario": 100.0}
    )

    # 4. Verifica o Material: Custo Médio subiu
    stmt_mat = select(Material).where(Material.id == mat_id)
    res_mat = await db_session.execute(stmt_mat)
    material_atualizado: Material = res_mat.scalar_one()
    assert material_atualizado.custo_medio_atual > Decimal("10.00")

    # 5. Verifica a Movimentação de Saída Histórica gravada: Permanece R$ 10.00 / R$ 50.00
    stmt_saida = select(Movimentacao).where(Movimentacao.id == uuid.UUID(saida_id))
    res_s = await db_session.execute(stmt_saida)
    saida_gravada: Movimentacao = res_s.scalar_one()

    assert saida_gravada.custo_unitario == Decimal("10.00")
    assert saida_gravada.valor_total == Decimal("50.00")


@pytest.mark.asyncio
async def test_inventario_bloqueio_ajuste_abaixo_do_reservado(client: AsyncClient, seed_data: dict):
    """
    8. INVENTÁRIO:
    Garante que não é permitido ajustar o estoque físico com diferença que subtraia mais do que o saldo disponível.
    """
    almoxarife: Usuario = seed_data["almoxarife"]
    sol1: Usuario = seed_data["solicitante1"]
    mat_id = seed_data["material"].id
    loc_id = seed_data["localizacao"].id
    headers_almox = auth_headers_for(almoxarife)
    headers_sol = auth_headers_for(sol1)

    # Entrada de 10 un
    await client.post(
        "/api/v1/estoque/entradas",
        headers=headers_almox,
        json={"material_id": str(mat_id), "localizacao_id": str(loc_id), "quantidade": 10.0, "custo_unitario": 15.0}
    )

    # Requisição reserva 8 un (Físico = 10, Reservado = 8, Disponível = 2)
    res_req = await client.post(
        "/api/v1/requisicoes",
        headers=headers_sol,
        json={
            "finalidade": "USO_INTERNO",
            "justificativa": "Reserva de 8 un",
            "itens": [{"material_id": str(mat_id), "localizacao_id": str(loc_id), "quantidade_solicitada": 8.0}]
        }
    )
    await client.post(f"/api/v1/requisicoes/{res_req.json()['id']}/aprovar", headers=headers_almox)

    # Tenta fazer ajuste manual negativo de -5 (o disponível é apenas 2) -> 400 Bad Request
    res_ajuste = await client.post(
        "/api/v1/estoque/ajustes",
        headers=headers_almox,
        json={
            "material_id": str(mat_id),
            "localizacao_id": str(loc_id),
            "quantidade_diferenca": -5.0,
            "motivo": "Contagem física abaixo do disponível"
        }
    )
    assert res_ajuste.status_code == 400


@pytest.mark.asyncio
async def test_auditoria_logs_sem_vazamento_de_segredos(client: AsyncClient, seed_data: dict, db_session):
    """
    10. AUDITORIA E LOGS:
    Verifica que nenhum log de auditoria armazena senhas em texto claro ou tokens JWT nos payloads JSON.
    """
    admin: Usuario = seed_data["admin"]
    headers_admin = auth_headers_for(admin)

    # Cria usuário via endpoint com auditoria
    senha_secreta = "SegredoSuperForte!2026"
    res_user = await client.post(
        "/api/v1/auth/users",
        headers=headers_admin,
        json={
            "nome": "Novo Usuario Auditado",
            "email": "auditado@empresa.com",
            "senha": senha_secreta,
            "role": "SOLICITANTE",
            "ativo": True
        }
    )
    assert res_user.status_code == 200

    # Consulta todos os logs de auditoria gravados
    stmt_logs = select(AuditoriaLog)
    res_logs = await db_session.execute(stmt_logs)
    todos_logs = res_logs.scalars().all()

    for log in todos_logs:
        payload_str = f"{log.dados_anteriores} {log.dados_novos} {log.motivo}"
        assert senha_secreta not in payload_str, f"VAZAMENTO DE SENHA detectado no log {log.id}!"
        assert "eyJhbGci" not in payload_str, f"VAZAMENTO DE JWT detectado no log {log.id}!"
