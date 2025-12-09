from sqlalchemy.orm import Session
from typing import Type, List, TypeVar
from app.models.models import BaseModel

# T é um "Placeholder" que diz: "Aqui entra qualquer classe que seja um Modelo do Banco"
T = TypeVar("T", bound=BaseModel)

class CadastroRepository:
    
    @staticmethod
    def get_all(db: Session, model: Type[T]) -> List[T]:
        """Busca todos os registros ativos de uma tabela."""
        return db.query(model).filter(model.is_active == True).all()

    @staticmethod
    def get_by_id(db: Session, model: Type[T], id: int) -> T:
        """Busca um registro por ID."""
        return db.query(model).filter(model.id == id, model.is_active == True).first()

    @staticmethod
    def create(db: Session, model: Type[T], schema_data: dict) -> T:
        """Cria um novo registro genérico."""
        db_obj = model(**schema_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def delete(db: Session, model: Type[T], id: int) -> bool:
        """Soft Delete (apenas desativa)."""
        db_obj = db.query(model).filter(model.id == id).first()
        if db_obj:
            db_obj.is_active = False # Soft Delete
            db.commit()
            return True
        return False