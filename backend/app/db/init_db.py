import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.usuario import Usuario, RoleEnum
from app.models.material import UnidadeMedida, Categoria, Subcategoria
from app.models.localizacao import Localizacao, TipoLocalizacaoEnum
from app.models.obra import Obra


async def init_db(db: AsyncSession) -> None:
    """
    Inicializa o banco com dados essenciais de seed.
    """
    # 1. Admin inicial
    stmt_admin = select(Usuario).where(Usuario.email == settings.FIRST_ADMIN_EMAIL)
    res_admin = await db.execute(stmt_admin)
    admin = res_admin.scalar_one_or_none()

    if not admin:
        admin = Usuario(
            nome=settings.FIRST_ADMIN_NOME,
            email=settings.FIRST_ADMIN_EMAIL,
            senha_hash=get_password_hash(settings.FIRST_ADMIN_PASSWORD),
            role=RoleEnum.ADMIN,
            ativo=True,
        )
        db.add(admin)

    # 2. Usuários padrão para demonstração/testes
    users_seed = [
        ("Almoxarife Principal", "almoxarife@stockflow.local", RoleEnum.ALMOXARIFE, "Almoxarife@2026!"),
        ("Engenheiro Solicitante 1", "solicitante1@stockflow.local", RoleEnum.SOLICITANTE, "Solicitante@2026!"),
        ("Engenheiro Solicitante 2", "solicitante2@stockflow.local", RoleEnum.SOLICITANTE, "Solicitante@2026!"),
        ("Auditor Fiscal", "auditor@stockflow.local", RoleEnum.AUDITOR, "Auditor@2026!"),
    ]

    for nome, email, role, senha in users_seed:
        stmt_u = select(Usuario).where(Usuario.email == email)
        res_u = await db.execute(stmt_u)
        if not res_u.scalar_one_or_none():
            u = Usuario(
                nome=nome,
                email=email,
                senha_hash=get_password_hash(senha),
                role=role,
                ativo=True,
            )
            db.add(u)

    # 3. Unidades de Medida
    unidades_seed = [
        ("UN", "Unidade", False),
        ("M", "Metro", True),
        ("KG", "Quilograma", True),
        ("CX", "Caixa", False),
        ("LT", "Litro", True),
        ("M2", "Metro Quadrado", True),
        ("M3", "Metro Cúbico", True),
        ("RL", "Rolo", False),
    ]
    for sigla, nome, frac in unidades_seed:
        stmt_un = select(UnidadeMedida).where(UnidadeMedida.sigla == sigla)
        res_un = await db.execute(stmt_un)
        if not res_un.scalar_one_or_none():
            unidade = UnidadeMedida(sigla=sigla, nome=nome, fracionavel=frac)
            db.add(unidade)

    # 4. Categorias e Subcategorias
    categorias_seed = [
        ("Elétrica", "Materiais e condutores elétricos", ["Cabos & Fios", "Disjuntores", "Iluminação", "Conectores"]),
        ("Hidráulica", "Tubulações e conexões hidráulicas", ["Tubos PVC", "Conexões", "Válvulas & Registros", "Bombas"]),
        ("Construção Civil", "Materiais básicos de obra", ["Cimento & Argamassa", "Aço & Ferragens", "Impermeabilizantes"]),
        ("EPIs & Ferramentas", "Proteção individual e ferramentas", ["Proteção Cabeça/Olhos", "Luvas & Botas", "Ferramentas Manuais"]),
    ]

    for cat_nome, cat_desc, subcats in categorias_seed:
        stmt_cat = select(Categoria).where(Categoria.nome == cat_nome)
        res_cat = await db.execute(stmt_cat)
        cat = res_cat.scalar_one_or_none()
        if not cat:
            cat = Categoria(nome=cat_nome, descricao=cat_desc)
            db.add(cat)
            await db.flush()

            for sub_nome in subcats:
                sub = Subcategoria(categoria_id=cat.id, nome=sub_nome)
                db.add(sub)

    # 5. Localização Padrão (Almoxarifado Central)
    stmt_loc = select(Localizacao).where(Localizacao.codigo == "ALMOX-CENTRAL")
    res_loc = await db.execute(stmt_loc)
    if not res_loc.scalar_one_or_none():
        loc = Localizacao(
            codigo="ALMOX-CENTRAL",
            nome="Almoxarifado Central Principal",
            tipo=TipoLocalizacaoEnum.ALMOXARIFADO,
            descricao="Galpão Principal de Distribuição",
            ativo=True,
        )
        db.add(loc)

    # 6. Obras de Exemplo
    obras_seed = [
        ("OBRA-01", "Residencial Jardins do Sol", "Av. das Flores, 1000", "Eng. Carlos Eduardo"),
        ("OBRA-02", "Centro Empresarial Alpha", "Rua Corporativa, 500", "Eng. Mariana Souza"),
    ]
    for cod, nome, end, resp in obras_seed:
        stmt_ob = select(Obra).where(Obra.codigo_obra == cod)
        res_ob = await db.execute(stmt_ob)
        if not res_ob.scalar_one_or_none():
            ob = Obra(
                codigo_obra=cod,
                nome=nome,
                endereco=end,
                responsavel=resp,
                ativa=True,
            )
            db.add(ob)

    await db.commit()
