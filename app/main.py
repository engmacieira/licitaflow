from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # <--- 1. Importar isso
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.routers import dfd_router, etp_router, ai_router, cadastro_router, risk_router, tr_router, system_router

app = FastAPI(
    title="LicitaFlow API",
    description="Sistema de Geração de Licitações com IA",
    version="0.1.0"
)

origins = [
    "http://localhost:5173", # Endereço do React (Vite)
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Permite GET, POST, PUT, DELETE, etc.
    allow_headers=["*"], # Permite enviar JSON e Tokens
)

# 1. Montando a pasta estática
# Isso diz: "Tudo que estiver na pasta /static, sirva na URL /static"
app.mount("/static", StaticFiles(directory="static"), name="static")

# 2. Registrando as rotas da API
app.include_router(dfd_router.router)
app.include_router(etp_router.router)
app.include_router(ai_router.router)
app.include_router(cadastro_router.router)
app.include_router(risk_router.router)
app.include_router(tr_router.router)
app.include_router(system_router.router)

# 3. Rota Raiz (Frontend)
# Ao invés de retornar JSON, retornamos o arquivo HTML principal
@app.get("/")
def read_root():
    return FileResponse("static/index.html")