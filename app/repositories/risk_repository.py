from sqlalchemy.orm import Session, joinedload
from app.models.models import MatrizRisco, ItemRisco

class RiskRepository:
    
    @staticmethod
    def get_by_etp(db: Session, etp_id: int):
        """Busca a matriz de risco de um ETP (cria se não existir)."""
        matriz = db.query(MatrizRisco).options(joinedload(MatrizRisco.riscos))\
                   .filter(MatrizRisco.etp_id == etp_id).first()
        
        if not matriz:
            # Cria automaticamente se não existir
            matriz = MatrizRisco(etp_id=etp_id)
            db.add(matriz)
            db.commit()
            db.refresh(matriz)
        
        return matriz

    @staticmethod
    def add_risk(db: Session, matriz_id: int, risk_data: dict):
        """Adiciona um novo risco à matriz."""
        risco = ItemRisco(matriz_id=matriz_id, **risk_data)
        db.add(risco)
        db.commit()
        db.refresh(risco)
        return risco

    @staticmethod
    def delete_risk(db: Session, risk_id: int):
        """Remove um risco."""
        risco = db.query(ItemRisco).filter(ItemRisco.id == risk_id).first()
        if risco:
            db.delete(risco)
            db.commit()
            return True
        return False