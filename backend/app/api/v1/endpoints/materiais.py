import uuid
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import (
    get_db,
    get_current_user,
    get_current_almoxarife_or_admin,
)
from app.models.usuario import Usuario
from app.models.material import Material, Categoria, Subcategoria, UnidadeMedida
from app.models.estoque import EstoquePorLocalizacao
from app.schemas.material import (
    MaterialCreate,
    MaterialUpdate,
    MaterialResponse,
    CategoriaCreate,
    CategoriaResponse,
    SubcategoriaCreate,
    SubcategoriaResponse,
    UnidadeMedidaCreate,
    UnidadeMedidaResponse,
)

router = APIRouter()


# ---------------- Unidades de Medida ---------------- #
@router.get("/unidades", response_model=List[UnidadeMedidaResponse])
async def list_unidades(db: AsyncSession = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    stmt = select(UnidadeMedida).order_by(UnidadeMedida.sigla)
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/unidades", response_model=UnidadeMedidaResponse)
async def create_unidade(
    body: UnidadeMedidaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_almoxarife_or_admin),
):
    unidade = UnidadeMedida(sigla=body.sigla.upper(), nome=body.nome, fracionavel=body.fracionavel)
    db.add(unidade)
    await db.commit()
    await db.refresh(unidade)
    return unidade


# ---------------- Categorias & Subcategorias ---------------- #
@router.get("/categorias", response_model=List[CategoriaResponse])
async def list_categorias(db: AsyncSession = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    stmt = select(Categoria).options(selectinload(Categoria.subcategorias)).order_by(Categoria.nome)
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/categorias", response_model=CategoriaResponse)
async def create_categoria(
    body: CategoriaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_almoxarife_or_admin),
):
    cat = Categoria(nome=body.nome, descricao=body.descricao)
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return cat


@router.post("/subcategorias", response_model=SubcategoriaResponse)
async def create_subcategoria(
    body: SubcategoriaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_almoxarife_or_admin),
):
    sub = Subcategoria(categoria_id=body.categoria_id, nome=body.nome, descricao=body.descricao)
    db.add(sub)
    await db.commit()
    await db.refresh(sub)
    return sub


# ---------------- Materiais ---------------- #
@router.get("", response_model=List[MaterialResponse])
async def list_materiais(
    busca: Optional[str] = Query(None, description="Busca por nome ou SKU"),
    categoria_id: Optional[int] = None,
    ativo: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    stmt = (
        select(Material)
        .options(
            selectinload(Material.categoria),
            selectinload(Material.subcategoria),
            selectinload(Material.unidade_medida),
            selectinload(Material.saldos_localizacao),
        )
        .order_by(Material.nome)
    )

    if busca:
        termo = f"%{busca}%"
        stmt = stmt.where(or_(Material.nome.ilike(termo), Material.sku.ilike(termo)))
    if categoria_id:
        stmt = stmt.where(Material.categoria_id == categoria_id)
    if ativo is not None:
        stmt = stmt.where(Material.ativo == ativo)

    res = await db.execute(stmt)
    materiais = res.scalars().all()

    # Preenche saldos agregados para resposta
    result = []
    for mat in materiais:
        qtd_fisica = sum((s.quantidade_fisica for s in mat.saldos_localizacao), Decimal("0.0000"))
        qtd_reservada = sum((s.quantidade_reservada for s in mat.saldos_localizacao), Decimal("0.0000"))
        disponivel = qtd_fisica - qtd_reservada

        mat_dict = {
            "id": mat.id,
            "sku": mat.sku,
            "nome": mat.nome,
            "descricao": mat.descricao,
            "categoria_id": mat.categoria_id,
            "subcategoria_id": mat.subcategoria_id,
            "unidade_medida_id": mat.unidade_medida_id,
            "estoque_minimo": mat.estoque_minimo,
            "custo_medio_atual": mat.custo_medio_atual,
            "ativo": mat.ativo,
            "categoria": mat.categoria,
            "subcategoria": mat.subcategoria,
            "unidade_medida": mat.unidade_medida,
            "quantidade_fisica_total": qtd_fisica,
            "quantidade_reservada_total": qtd_reservada,
            "quantidade_disponivel_total": disponivel,
        }
        result.append(mat_dict)

    return result


@router.post("", response_model=MaterialResponse)
async def create_material(
    body: MaterialCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_almoxarife_or_admin),
):
    stmt_exist = select(Material).where(Material.sku == body.sku)
    res = await db.execute(stmt_exist)
    if res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="SKU já cadastrado.")

    material = Material(
        sku=body.sku.upper().strip(),
        nome=body.nome.strip(),
        descricao=body.descricao,
        categoria_id=body.categoria_id,
        subcategoria_id=body.subcategoria_id,
        unidade_medida_id=body.unidade_medida_id,
        estoque_minimo=body.estoque_minimo,
        custo_medio_atual=Decimal("0.00"),
        ativo=True,
    )
    db.add(material)
    await db.commit()
    
    # Recarrega com relacionamentos
    stmt_reload = (
        select(Material)
        .options(
            selectinload(Material.categoria),
            selectinload(Material.subcategoria),
            selectinload(Material.unidade_medida),
            selectinload(Material.saldos_localizacao),
        )
        .where(Material.id == material.id)
    )
    res_reload = await db.execute(stmt_reload)
    mat = res_reload.scalar_one()
    
    return {
        "id": mat.id,
        "sku": mat.sku,
        "nome": mat.nome,
        "descricao": mat.descricao,
        "categoria_id": mat.categoria_id,
        "subcategoria_id": mat.subcategoria_id,
        "unidade_medida_id": mat.unidade_medida_id,
        "estoque_minimo": mat.estoque_minimo,
        "custo_medio_atual": mat.custo_medio_atual,
        "ativo": mat.ativo,
        "categoria": mat.categoria,
        "subcategoria": mat.subcategoria,
        "unidade_medida": mat.unidade_medida,
        "quantidade_fisica_total": Decimal("0.0000"),
        "quantidade_reservada_total": Decimal("0.0000"),
        "quantidade_disponivel_total": Decimal("0.0000"),
    }


@router.get("/{material_id}", response_model=MaterialResponse)
async def get_material(
    material_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    stmt = (
        select(Material)
        .options(
            selectinload(Material.categoria),
            selectinload(Material.subcategoria),
            selectinload(Material.unidade_medida),
            selectinload(Material.saldos_localizacao),
        )
        .where(Material.id == material_id)
    )
    res = await db.execute(stmt)
    mat = res.scalar_one_or_none()
    if not mat:
        raise HTTPException(status_code=404, detail="Material não encontrado.")

    qtd_fisica = sum((s.quantidade_fisica for s in mat.saldos_localizacao), Decimal("0.0000"))
    qtd_reservada = sum((s.quantidade_reservada for s in mat.saldos_localizacao), Decimal("0.0000"))
    disponivel = qtd_fisica - qtd_reservada

    return {
        "id": mat.id,
        "sku": mat.sku,
        "nome": mat.nome,
        "descricao": mat.descricao,
        "categoria_id": mat.categoria_id,
        "subcategoria_id": mat.subcategoria_id,
        "unidade_medida_id": mat.unidade_medida_id,
        "estoque_minimo": mat.estoque_minimo,
        "custo_medio_atual": mat.custo_medio_atual,
        "ativo": mat.ativo,
        "categoria": mat.categoria,
        "subcategoria": mat.subcategoria,
        "unidade_medida": mat.unidade_medida,
        "quantidade_fisica_total": qtd_fisica,
        "quantidade_reservada_total": qtd_reservada,
        "quantidade_disponivel_total": disponivel,
    }


@router.put("/{material_id}", response_model=MaterialResponse)
async def update_material(
    material_id: uuid.UUID,
    body: MaterialUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_almoxarife_or_admin),
):
    stmt = select(Material).where(Material.id == material_id)
    res = await db.execute(stmt)
    mat = res.scalar_one_or_none()
    if not mat:
        raise HTTPException(status_code=404, detail="Material não encontrado.")

    if body.sku is not None:
        mat.sku = body.sku.upper().strip()
    if body.nome is not None:
        mat.nome = body.nome.strip()
    if body.descricao is not None:
        mat.descricao = body.descricao
    if body.categoria_id is not None:
        mat.categoria_id = body.categoria_id
    if body.subcategoria_id is not None:
        mat.subcategoria_id = body.subcategoria_id
    if body.unidade_medida_id is not None:
        mat.unidade_medida_id = body.unidade_medida_id
    if body.estoque_minimo is not None:
        mat.estoque_minimo = body.estoque_minimo
    if body.ativo is not None:
        mat.ativo = body.ativo

    await db.commit()
    return await get_material(material_id, db, current_user)
