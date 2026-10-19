import uuid
from decimal import Decimal
from typing import AsyncGenerator
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool
from httpx import AsyncClient, ASGITransport

from app.core.config import settings
from app.db.base import Base
from app.models.usuario import Usuario, RoleEnum
from app.models.material import Material, UnidadeMedida, Categoria
from app.models.localizacao import Localizacao, TipoLocalizacaoEnum
from app.models.obra import Obra
from app.core.security import get_password_hash, create_access_token
from app.main import app
from app.api.deps import get_db

# Lê URL de teste diretamente das configurações de ambiente
TEST_DATABASE_URL = settings.TEST_DATABASE_URL

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    future=True,
    poolclass=NullPool,
)

TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with TestingSessionLocal() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def seed_data(db_session: AsyncSession):
    """Cria fixtures básicas no banco de testes PostgreSQL com credenciais seguras."""
    # 1. Usuários
    admin = Usuario(
        id=uuid.uuid4(),
        nome="Admin Teste",
        email="admin@teste.com",
        senha_hash=get_password_hash("Senha@123"),
        role=RoleEnum.ADMIN,
        ativo=True,
    )
    almoxarife = Usuario(
        id=uuid.uuid4(),
        nome="Almoxarife Teste",
        email="almoxarife@teste.com",
        senha_hash=get_password_hash("Senha@123"),
        role=RoleEnum.ALMOXARIFE,
        ativo=True,
    )
    solicitante1 = Usuario(
        id=uuid.uuid4(),
        nome="Solicitante 1",
        email="solicitante1@teste.com",
        senha_hash=get_password_hash("Senha@123"),
        role=RoleEnum.SOLICITANTE,
        ativo=True,
    )
    solicitante2 = Usuario(
        id=uuid.uuid4(),
        nome="Solicitante 2",
        email="solicitante2@teste.com",
        senha_hash=get_password_hash("Senha@123"),
        role=RoleEnum.SOLICITANTE,
        ativo=True,
    )
    auditor = Usuario(
        id=uuid.uuid4(),
        nome="Auditor Teste",
        email="auditor@teste.com",
        senha_hash=get_password_hash("Senha@123"),
        role=RoleEnum.AUDITOR,
        ativo=True,
    )
    db_session.add_all([admin, almoxarife, solicitante1, solicitante2, auditor])

    # 2. Unidade e Categoria
    unidade = UnidadeMedida(sigla="UN", nome="Unidade", fracionavel=False)
    categoria = Categoria(nome="Elétrica Geral")
    db_session.add_all([unidade, categoria])
    await db_session.flush()

    # 3. Localização
    localizacao = Localizacao(
        id=uuid.uuid4(),
        codigo="ALMOX-01",
        nome="Almoxarifado Principal Teste",
        tipo=TipoLocalizacaoEnum.ALMOXARIFADO,
        ativo=True,
    )
    db_session.add(localizacao)

    # 4. Obra
    obra = Obra(
        id=uuid.uuid4(),
        codigo_obra="OBRA-ALPHA",
        nome="Obra Comercial Alpha",
        responsavel="Eng. Silva",
        ativa=True,
    )
    db_session.add(obra)

    # 5. Material
    material = Material(
        id=uuid.uuid4(),
        sku="CABO-FLEX-2.5",
        nome="Cabo Flexível 2.5mm",
        categoria_id=categoria.id,
        unidade_medida_id=unidade.id,
        estoque_minimo=Decimal("50.0000"),
        custo_medio_atual=Decimal("0.00"),
        ativo=True,
    )
    db_session.add(material)

    await db_session.commit()

    return {
        "admin": admin,
        "almoxarife": almoxarife,
        "solicitante1": solicitante1,
        "solicitante2": solicitante2,
        "auditor": auditor,
        "unidade": unidade,
        "categoria": categoria,
        "localizacao": localizacao,
        "obra": obra,
        "material": material,
    }


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()


def auth_headers_for(user: Usuario) -> dict:
    token = create_access_token(
        subject=user.email,
        role=user.role.value,
        user_id=str(user.id),
    )
    return {"Authorization": f"Bearer {token}"}
