from app.core.database import engine
from app.models.models import Base

def create_tables():
    print("🔨 Criando tabelas no banco de dados...")
    # Essa linha lê todos os modelos que herdam de 'Base' e cria as tabelas no banco
    Base.metadata.create_all(bind=engine)
    print("✅ Tabelas criadas com sucesso!")

if __name__ == "__main__":
    create_tables()