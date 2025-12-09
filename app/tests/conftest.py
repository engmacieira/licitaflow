import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool # <--- IMPORTANTE
from fastapi.testclient import TestClient
from app.models.models import Base
from app.main import app
from app.core.database import get_db

# Banco em memória
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

# Configuração do Engine com StaticPool (O Segredo)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool # <--- OBRIGATÓRIO PARA TESTES EM MEMÓRIA
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """Cria as tabelas, entrega a sessão e destrói depois."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """Cliente de teste com Override de dependência."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass 

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()