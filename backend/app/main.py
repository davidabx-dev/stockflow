from contextlib import asynccontextmanager
from typing import Optional
from urllib.parse import urlparse
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings
from app.core.exceptions import StockFlowException
from app.api.v1.router import api_router
from app.db.session import AsyncSessionLocal
from app.db.init_db import init_db


class CSRFOriginGuardMiddleware(BaseHTTPMiddleware):
    """
    Defesa em Profundidade contra CSRF (OWASP CSRF Prevention & W3C Fetch Metadata):
    Para métodos mutáveis (POST, PUT, DELETE, PATCH) utilizando cookies de autenticação:
    1. Se 'Sec-Fetch-Site' estiver presente:
       - 'cross-site' -> Bloqueia com HTTP 403 Forbidden.
       - 'same-origin' -> Permitido (origem estritamente idêntica).
       - 'same-site' -> Modelo de Ameaça StockFlow: subdomínios irmãos não são confiados cegamente;
         exige validação explícita do cabeçalho 'Origin' contra BACKEND_CORS_ORIGINS.
    2. Se 'Sec-Fetch-Site' estiver ausente (fallback para navegadores legados):
       - Valida cabeçalho 'Origin' contra BACKEND_CORS_ORIGINS (bloqueia 403 se não confiável).
       - Valida cabeçalho 'Referer' contra BACKEND_CORS_ORIGINS se Origin estiver ausente.
    3. Requisições sem cookies de autenticação (não autenticadas ou autenticadas via header Bearer)
       não sofrem restrição de ambient credentials pelo middleware CSRF, prosseguindo para a
       camada de autenticação (onde endpoints protegidos retornarão HTTP 401 Unauthorized se anônimos).
    """
    async def dispatch(self, request: Request, call_next):
        if request.method in ("POST", "PUT", "DELETE", "PATCH"):
            # Detecta se a requisição possui cookie de autenticação ativo
            has_auth_cookie = (
                settings.ACCESS_TOKEN_COOKIE_NAME in request.cookies
                or settings.REFRESH_TOKEN_COOKIE_NAME in request.cookies
            )

            if has_auth_cookie:
                sec_fetch_site = request.headers.get("sec-fetch-site")

                # 1. Avaliação prioritária via Fetch Metadata
                if sec_fetch_site:
                    sec_site = sec_fetch_site.strip().lower()
                    if sec_site == "cross-site":
                        return JSONResponse(
                            status_code=status.HTTP_403_FORBIDDEN,
                            content={"detail": "Requisição cross-site bloqueada por política de segurança CSRF (Sec-Fetch-Site)."}
                        )
                    elif sec_site == "same-origin":
                        return await call_next(request)
                    elif sec_site == "same-site":
                        # Threat model: subdomínios irmãos devem constar explicitamente em BACKEND_CORS_ORIGINS
                        origin = request.headers.get("origin")
                        if origin and origin not in settings.BACKEND_CORS_ORIGINS:
                            return JSONResponse(
                                status_code=status.HTTP_403_FORBIDDEN,
                                content={"detail": f"Origem same-site '{origin}' não autorizada por política de segurança CSRF."}
                            )
                        return await call_next(request)

                # 2. Fallback por Origin (quando Sec-Fetch-Site ausente)
                origin = request.headers.get("origin")
                if origin:
                    if origin not in settings.BACKEND_CORS_ORIGINS:
                        return JSONResponse(
                            status_code=status.HTTP_403_FORBIDDEN,
                            content={"detail": f"Origem '{origin}' não autorizada por política de segurança CSRF."}
                        )
                    return await call_next(request)

                # 3. Fallback por Referer (quando Origin e Sec-Fetch-Site ausentes)
                referer = request.headers.get("referer")
                if referer:
                    ref_origin = self._extract_origin(referer)
                    if ref_origin and ref_origin not in settings.BACKEND_CORS_ORIGINS:
                        return JSONResponse(
                            status_code=status.HTTP_403_FORBIDDEN,
                            content={"detail": f"Origem referenciada '{ref_origin}' não autorizada por política de segurança CSRF."}
                        )

        return await call_next(request)

    @staticmethod
    def _extract_origin(url: str) -> Optional[str]:
        """Extrai o esquema e domínio a partir de uma URL de Referer."""
        try:
            parsed = urlparse(url)
            if parsed.scheme and parsed.netloc:
                return f"{parsed.scheme}://{parsed.netloc}"
        except Exception:
            pass
        return None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Executa o seed inicial do banco de dados na inicialização
    async with AsyncSessionLocal() as db:
        await init_db(db)
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Sistema Profissional de Gestão de Estoque — Motor de Domínio e Checklist V3",
    version="3.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Middleware CSRF / Origin Guard (Defesa em Profundidade)
app.add_middleware(CSRFOriginGuardMiddleware)

# Configuração de CORS Restritivo
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(StockFlowException)
async def stockflow_exception_handler(request: Request, exc: StockFlowException):
    """
    Captura exceções de domínio do estoque e retorna respostas JSON padronizadas.
    """
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error_code": exc.code,
            "message": exc.message,
        },
    )


@app.get("/health", tags=["Health Check"])
async def health_check():
    """Healthcheck do serviço."""
    return {"status": "ok", "app": settings.PROJECT_NAME, "version": "3.0.0"}


app.include_router(api_router, prefix=settings.API_V1_STR)
