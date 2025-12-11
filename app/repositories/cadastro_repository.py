from sqlalchemy.orm import Session
from app.models import models

class CadastroRepository:
    
    # --- Unidades (Antigas Secretarias) ---
    @staticmethod
    def get_all_unidades(db: Session):
        # Retorna todas as unidades. 
        # Dica: No futuro você pode filtrar só as que não têm 'unidade_pai_id' se quiser só secretarias
        return db.query(models.UnidadeRequisitante).filter(models.UnidadeRequisitante.is_active == True).all()

    # --- Agentes ---
    @staticmethod
    def get_all_agentes(db: Session):
        return db.query(models.AgenteResponsavel).filter(models.AgenteResponsavel.is_active == True).all()

    # --- Itens do Catálogo (Nova Estrutura) ---
    @staticmethod
    def get_all_itens(db: Session):
        itens = db.query(models.CatalogoItem).filter(models.CatalogoItem.is_active == True).all()
        
        resultado = []
        for i in itens:
            resultado.append({
                "id": i.id,
                "nome": i.nome_item, # Mapeia nome_item -> nome
                "unidade_medida": i.unidade_medida,
                "codigo": i.codigo_identificacao_completo,
                "descricao": i.descricao_detalhada,
                "tipo": i.tipo,
                "is_active": i.is_active # <--- ADICIONADO (Faltava isso!)
            })
        return resultado

    # --- Dotações ---
    @staticmethod
    def get_all_dotacoes(db: Session):
        return db.query(models.Dotacao).filter(models.Dotacao.is_active == True).all()