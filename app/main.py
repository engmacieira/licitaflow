from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles # <--- Importe
from fastapi.responses import FileResponse  # <--- Importe
from app.routers import dfd_router, etp_router, ai_router, cadastro_router

app = FastAPI(
    title="LicitaFlow API",
    description="Sistema de Geração de Licitações com IA",
    version="0.1.0"
)

# 1. Montando a pasta estática
# Isso diz: "Tudo que estiver na pasta /static, sirva na URL /static"
app.mount("/static", StaticFiles(directory="static"), name="static")

# 2. Registrando as rotas da API
app.include_router(dfd_router.router)
app.include_router(etp_router.router)
app.include_router(ai_router.router)
app.include_router(cadastro_router.router)

# 3. Rota Raiz (Frontend)
# Ao invés de retornar JSON, retornamos o arquivo HTML principal
@app.get("/")
def read_root():
    return FileResponse("static/index.html")