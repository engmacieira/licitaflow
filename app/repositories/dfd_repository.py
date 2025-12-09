from sqlalchemy.orm import Session
from app.models.models import DFD, DFDItem, DFDEquipe, DFDDotacao
from app.schemas.dfd_schema import DFDCreate

class DFDRepository:
    
    @staticmethod
    def create(db: Session, dfd: DFDCreate):
        """
        Cria um DFD completo, salvando também seus itens, equipe e dotações
        em uma única transação atômica.
        """
        try:
            # 1. Separa os dados principais do DFD (tira as listas)
            # ATENÇÃO: Mudamos de .dict() para .model_dump()
            dfd_data = dfd.model_dump(exclude={"itens", "equipe", "dotacoes"})
            
            # 2. Instancia o DFD Principal
            db_dfd = DFD(**dfd_data)
            db.add(db_dfd)
            db.flush() # Importante: Gera o ID do DFD sem commitar ainda
            
            # 3. Adiciona os Itens
            for item in dfd.itens:
                db_item = DFDItem(**item.model_dump(), dfd_id=db_dfd.id)
                db.add(db_item)
                
            # 4. Adiciona a Equipe
            for membro in dfd.equipe:
                db_membro = DFDEquipe(**membro.model_dump(), dfd_id=db_dfd.id)
                db.add(db_membro)
                
            # 5. Adiciona as Dotações
            for dotacao in dfd.dotacoes:
                db_dot = DFDDotacao(**dotacao.model_dump(), dfd_id=db_dfd.id)
                db.add(db_dot)
            
            # 6. Salva tudo de uma vez
            db.commit()
            db.refresh(db_dfd)
            return db_dfd
            
        except Exception as e:
            db.rollback() # Se der erro em qualquer parte, desfaz tudo
            raise e

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100):
        # Traz apenas os ativos (Soft Delete)
        return db.query(DFD).filter(DFD.is_active == True).offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, dfd_id: int):
        return db.query(DFD).filter(DFD.id == dfd_id, DFD.is_active == True).first()
    
    @staticmethod
    def update(db: Session, dfd_id: int, dfd_data: dict):
        """
        Atualiza os campos de um DFD existente.
        Recebe um dicionário com os campos que mudaram (ex: objeto, justificativa).
        """
        # 1. Busca o DFD no banco
        db_dfd = db.query(DFD).filter(DFD.id == dfd_id, DFD.is_active == True).first()
        
        if not db_dfd:
            return None # Retorna None se não achar
        
        # 2. Atualiza apenas os campos que vieram no dicionário
        for key, value in dfd_data.items():
            # Segurança: só atualiza se o campo existir no modelo
            if hasattr(db_dfd, key):
                setattr(db_dfd, key, value)
        
        # 3. Salva
        try:
            db.commit()
            db.refresh(db_dfd)
            return db_dfd
        except Exception as e:
            db.rollback()
            raise e
        
    @staticmethod
    def update_item_prices(db: Session, itens_data: list):
        """Atualiza o preço unitário de uma lista de itens."""
        try:
            for item in itens_data:
                # Busca o item no banco pelo ID dele
                db_item = db.query(DFDItem).filter(DFDItem.id == item.id).first()
                if db_item:
                    db_item.valor_unitario_estimado = item.valor_unitario_estimado
            
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e