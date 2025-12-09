from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env
load_dotenv()

# Pega a URL do banco. Se não achar, usa sqlite como fallback (segurança)
DATABASE_URL = os.getenv("DB_URL")

if not DATABASE_URL:
    raise ValueError("A variável DB_URL não foi definida no arquivo .env")

# Cria o Motor de Conexão
engine = create_engine(DATABASE_URL)

# Cria a Fábrica de Sessões
# Cada requisição do usuário vai ganhar uma sessão nova dessa fábrica
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependência (Isso vai ser usado em todo Endpoint do FastAPI)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()