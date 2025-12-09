from sqlalchemy.orm import Session
from app.models.models import ETP
from app.schemas.etp_schema import ETPCreate

class ETPRepository:
    
    @staticmethod
    def get_by_dfd(db: Session, dfd_id: int):
        """Busca o ETP vinculado a um DFD específico."""
        return db.query(ETP).filter(ETP.dfd_id == dfd_id, ETP.is_active == True).first()

    @staticmethod
    def create(db: Session, etp: ETPCreate):
        """Cria um novo ETP vinculado ao DFD."""
        db_etp = ETP(**etp.model_dump())
        db.add(db_etp)
        db.commit()
        db.refresh(db_etp)
        return db_etp

    @staticmethod
    def update(db: Session, etp_id: int, etp_data: dict):
        """Atualiza campos do ETP."""
        db_etp = db.query(ETP).filter(ETP.id == etp_id, ETP.is_active == True).first()
        
        if not db_etp:
            return None
        
        for key, value in etp_data.items():
            if hasattr(db_etp, key):
                setattr(db_etp, key, value)
        
        try:
            db.commit()
            db.refresh(db_etp)
            return db_etp
        except Exception as e:
            db.rollback()
            raise e