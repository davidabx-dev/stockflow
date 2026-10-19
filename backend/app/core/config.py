import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "StockFlow"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8  # 8 horas
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Configuração de Sessão via Cookies HttpOnly (OWASP Session Management)
    COOKIE_SECURE: bool = False  # False em dev local (HTTP); True em produção (HTTPS)
    COOKIE_SAMESITE: str = "lax"  # Proteção contra ataques CSRF cross-origin

    # CORS & CSRF Trusted Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
    ]

    # Database
    DATABASE_URL: str
    SYNC_DATABASE_URL: str
    TEST_DATABASE_URL: str = ""
    MIGRATION_DATABASE_URL: str = ""

    # Admin padrão inicial para seed
    FIRST_ADMIN_EMAIL: str = "admin@stockflow.local"
    FIRST_ADMIN_PASSWORD: str
    FIRST_ADMIN_NOME: str = "Administrador do Sistema"

    @property
    def ACCESS_TOKEN_COOKIE_NAME(self) -> str:
        """Adota o prefixo seguro __Host- automaticamente em ambiente HTTPS/Produção."""
        return "__Host-stockflow_access_token" if self.COOKIE_SECURE else "stockflow_access_token"

    @property
    def REFRESH_TOKEN_COOKIE_NAME(self) -> str:
        """Adota o prefixo seguro __Host- automaticamente em ambiente HTTPS/Produção."""
        return "__Host-stockflow_refresh_token" if self.COOKIE_SECURE else "stockflow_refresh_token"

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow",
    )


settings = Settings()
