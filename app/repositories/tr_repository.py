from sqlalchemy.orm import Session, joinedload
from app.models.models import TR, MatrizRisco, ETP

class TRRepository:
    
    @staticmethod
    def get_by_etp(db: Session, etp_id: int):
        """
        Busca o TR vinculado ao ETP. 
        Se não existir, verifica se tem Matriz. Se tiver Matriz, cria o TR.
        """
        # 1. Acha a Matriz do ETP
        matriz = db.query(MatrizRisco).filter(MatrizRisco.etp_id == etp_id).first()
        if not matriz:
            return None # Não dá para ter TR sem Matriz (pela sua modelagem)

        # 2. Acha o TR vinculado à Matriz
        tr = db.query(TR).filter(TR.matriz_id == matriz.id).first()
        
        # 3. Se não existe, cria o rascunho inicial
        if not tr:
            tr = TR(matriz_id=matriz.id)
            db.add(tr)
            db.commit()
            db.refresh(tr)
        
        return tr

    @staticmethod
    def update(db: Session, tr_id: int, tr_data: dict):
        db_tr = db.query(TR).filter(TR.id == tr_id).first()
        if not db_tr: return None
        
        for key, value in tr_data.items():
            if hasattr(db_tr, key):
                setattr(db_tr, key, value)
        
        try:
            db.commit()
            db.refresh(db_tr)
            return db_tr
        except Exception as e:
            db.rollback()
            raise e