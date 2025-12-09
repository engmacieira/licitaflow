from app.core.database import SessionLocal
from app.models.models import Secretaria, Agente, ItemCatalogo, Dotacao

def seed_data():
    db = SessionLocal()
    
    print("🌱 Semeando o banco de dados...")

    # 1. Verificar se já tem dados (para não duplicar se rodar 2x)
    if db.query(Secretaria).first():
        print("⚠️  O banco já parece ter dados. Pulando seed.")
        return

    # 2. Criar Secretarias
    sec_educacao = Secretaria(nome="Secretaria de Educação", sigla="SEDUC")
    sec_saude = Secretaria(nome="Secretaria de Saúde", sigla="SESAU")
    sec_obras = Secretaria(nome="Secretaria de Obras", sigla="SEMOB")
    
    db.add_all([sec_educacao, sec_saude, sec_obras])
    db.commit() # Salva para gerar os IDs

    # 3. Criar Agentes
    agente1 = Agente(
        nome="Matheus Desenvolvedor", 
        cargo="Analista TI", 
        matricula="1001", 
        email="matheus@licitaflow.com"
    )
    agente2 = Agente(
        nome="Mark Tech Lead", 
        cargo="Gerente de Projetos", 
        matricula="1002", 
        email="mark@licitaflow.com"
    )
    
    db.add_all([agente1, agente2])
    db.commit()

    # 4. Criar Itens de Catálogo (Simulação)
    item1 = ItemCatalogo(nome="Caneta Esferográfica Azul", unidade_medida="UN")
    item2 = ItemCatalogo(nome="Papel A4 Chamex", unidade_medida="RESMA")
    item3 = ItemCatalogo(nome="Serviço de Limpeza Predial", unidade_medida="H/HOMEM")
    item4 = ItemCatalogo(nome="Notebook Dell Latitude", unidade_medida="UN")

    db.add_all([item1, item2, item3, item4])
    
    # 5. Criar Dotações Orçamentárias
    dot1 = Dotacao(numero="2024.001.0001", nome="Manutenção Administrativa")
    dot2 = Dotacao(numero="2024.002.0005", nome="Investimento em TI")
    
    db.add_all([dot1, dot2])
    
    db.commit()
    print("✅ Banco populado com sucesso!")
    db.close()

if __name__ == "__main__":
    seed_data()