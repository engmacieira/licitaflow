from app.core.database import SessionLocal, engine
from app.models import models

def seed():
    db = SessionLocal()
    
    # Limpeza (Opcional, se você já apagou o arquivo .db não precisa)
    # db.query(models.ItemDFD).delete()
    # db.query(models.DFD).delete()
    # db.query(models.CatalogoItem).delete()
    # db.query(models.Subgrupo).delete()
    # db.query(models.Grupo).delete()
    # db.query(models.Categoria).delete()
    # db.query(models.UnidadeRequisitante).delete()
    # db.query(models.AgenteResponsavel).delete()
    # db.commit()

    # 1. ESTRUTURA ORGANIZACIONAL (Hierarquia)
    if db.query(models.UnidadeRequisitante).count() == 0:
        print("🏢 Criando Unidades...")
        # Nível 1
        pref = models.UnidadeRequisitante(nome="Prefeitura Municipal de Braúnas", sigla="PMB", codigo_administrativo="01")
        db.add(pref)
        db.commit()
        
        # Nível 2
        sec_saude = models.UnidadeRequisitante(nome="Secretaria Municipal de Saúde", sigla="SMS", codigo_administrativo="02.01", unidade_pai_id=pref.id)
        sec_educ = models.UnidadeRequisitante(nome="Secretaria Municipal de Educação", sigla="SME", codigo_administrativo="02.02", unidade_pai_id=pref.id)
        sec_adm = models.UnidadeRequisitante(nome="Secretaria de Administração", sigla="SEMAD", codigo_administrativo="02.03", unidade_pai_id=pref.id)
        db.add_all([sec_saude, sec_educ, sec_adm])
        db.commit()

        # Nível 3
        dep_compras = models.UnidadeRequisitante(nome="Departamento de Compras", sigla="DCOMP", codigo_administrativo="02.03.01", unidade_pai_id=sec_adm.id)
        ubs_centro = models.UnidadeRequisitante(nome="UBS Centro", sigla="UBS-01", codigo_administrativo="02.01.01", unidade_pai_id=sec_saude.id)
        db.add_all([dep_compras, ubs_centro])
        db.commit()

    # 2. AGENTES
    if db.query(models.AgenteResponsavel).count() == 0:
        print("👤 Criando Agentes...")
        agentes = [
            models.AgenteResponsavel(nome="Matheus Macieira", cargo="Diretor de TI", email="matheus@braunas.mg.gov.br", matricula="1001"),
            models.AgenteResponsavel(nome="Ana Silva", cargo="Gerente de Compras", email="ana@braunas.mg.gov.br", matricula="1002"),
            models.AgenteResponsavel(nome="Carlos Souza", cargo="Secretário de Saúde", email="carlos@braunas.mg.gov.br", matricula="1003"),
        ]
        db.add_all(agentes)
        db.commit()

    # 3. TAXONOMIA E ITENS (CATALOGO)
    if db.query(models.Categoria).count() == 0:
        print("📦 Criando Catálogo Inteligente...")
        
        # Categoria (Material de Consumo - 30)
        cat_consumo = models.Categoria(nome="Material de Consumo", codigo_taxonomia="30")
        db.add(cat_consumo)
        db.commit()
        
        # Grupo (Material de Expediente - 16)
        grp_expediente = models.Grupo(nome="Material de Expediente", codigo="16", categoria_id=cat_consumo.id)
        db.add(grp_expediente)
        db.commit()
        
        # Subgrupo (Papéis - 01)
        sub_papeis = models.Subgrupo(nome="Papéis para Escritório", codigo="01", grupo_id=grp_expediente.id)
        db.add(sub_papeis)
        db.commit()
        
        # Itens
        itens = [
            models.CatalogoItem(
                nome_item="Papel A4 Alcalino",
                unidade_medida="RESMA",
                tipo="Consumo",
                codigo_catmat_catser="12345",
                numero_sequencial_taxonomia="0001",
                codigo_identificacao_completo="3016010001",
                descricao_detalhada="Papel formato A4 (210x297mm), gramatura 75g/m2, alcalino, cor branca, caixa com 500 folhas.",
                subgrupo_id=sub_papeis.id
            ),
            models.CatalogoItem(
                nome_item="Caneta Esferográfica Azul",
                unidade_medida="UN",
                tipo="Consumo",
                codigo_catmat_catser="67890",
                numero_sequencial_taxonomia="0002",
                codigo_identificacao_completo="3016010002",
                descricao_detalhada="Caneta esferográfica, material corpo plástico transparente, tipo ponta média, cor tinta azul.",
                subgrupo_id=sub_papeis.id
            )
        ]
        db.add_all(itens)
        db.commit()

    # 4. DOTAÇÕES
    if db.query(models.Dotacao).count() == 0:
        print("💰 Criando Dotações...")
        dots = [
            models.Dotacao(exercicio=2024, numero="02.01.10.301.0001.2.001", nome="Manutenção das Atividades de Saúde"),
            models.Dotacao(exercicio=2024, numero="02.03.04.122.0001.2.005", nome="Gestão Administrativa"),
        ]
        db.add_all(dots)
        db.commit()

    print("✅ Banco de dados populado com sucesso (Estrutura Nova)!")

if __name__ == "__main__":
    seed()