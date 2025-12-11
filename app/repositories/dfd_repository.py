from sqlalchemy.orm import Session, joinedload
from app.models.models import DFD, ItemDFD, DFDEquipe, DFDDotacao
from app.schemas.dfd_schema import DFDCreate

class DFDRepository:
    
    @staticmethod
    def create(db: Session, dfd: DFDCreate):
        """
        Cria um DFD completo, salvando também seus itens, equipe e dotações.
        """
        try:
            # 1. Separa os dados principais
            dfd_data = dfd.model_dump(exclude={"itens", "equipe", "dotacoes"})
            
            # 2. Salva o DFD
            db_dfd = DFD(**dfd_data)
            db.add(db_dfd)
            db.flush() 
            
            # 3. Adiciona os Itens
            for item in dfd.itens:
                # O schema envia 'catalogo_item_id' agora
                db_item = ItemDFD(**item.model_dump(), dfd_id=db_dfd.id)
                db.add(db_item)
                
            # 4. Adiciona a Equipe
            for membro in dfd.equipe:
                db_membro = DFDEquipe(**membro.model_dump(), dfd_id=db_dfd.id)
                db.add(db_membro)
                
            # 5. Adiciona as Dotações
            for dotacao in dfd.dotacoes:
                db_dot = DFDDotacao(**dotacao.model_dump(), dfd_id=db_dfd.id)
                db.add(db_dot)
            
            db.commit()
            db.refresh(db_dfd)
            return db_dfd
            
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100):
        return db.query(DFD).filter(DFD.is_active == True).offset(skip).limit(limit).all()
    
    @staticmethod
    def update(db: Session, dfd_id: int, dfd_data: dict):
        """
        Atualiza um DFD existente, incluindo suas listas (itens, dotações, equipe).
        """
        db_dfd = db.query(DFD).filter(DFD.id == dfd_id, DFD.is_active == True).first()
        if not db_dfd: return None
        
        # 1. Separa Listas dos Dados Simples
        # Usamos pop() para remover do dicionário principal e tratar separadamente
        itens_data = dfd_data.pop('itens', None)
        equipe_data = dfd_data.pop('equipe', None)
        dotacoes_data = dfd_data.pop('dotacoes', None)
        
        try:
            # 2. Atualiza Campos Simples (Texto, Datas, IDs)
            for key, value in dfd_data.items():
                if hasattr(db_dfd, key):
                    setattr(db_dfd, key, value)
            
            # 3. Atualiza ITENS (Limpar e Recriar)
            if itens_data is not None:
                # Remove itens antigos (via relação do SQLAlchemy)
                db_dfd.itens.clear()
                # Adiciona novos
                for item in itens_data:
                    # item é um dict vindo do Pydantic
                    # Filtramos campos que não existem no model (ex: '_nome' do frontend)
                    clean_item = {k: v for k, v in item.items() if k in ['catalogo_item_id', 'quantidade', 'valor_unitario_estimado', 'complemento_descricao']}
                    db_item = ItemDFD(**clean_item)
                    db_dfd.itens.append(db_item)

            # 4. Atualiza DOTAÇÕES
            if dotacoes_data is not None:
                db_dfd.dotacoes.clear()
                for dot in dotacoes_data:
                    clean_dot = {k: v for k, v in dot.items() if k in ['dotacao_id']}
                    db_dot = DFDDotacao(**clean_dot)
                    db_dfd.dotacoes.append(db_dot)

            # 5. Atualiza EQUIPE
            if equipe_data is not None:
                db_dfd.equipe.clear()
                for eq in equipe_data:
                    clean_eq = {k: v for k, v in eq.items() if k in ['agente_id', 'papel']}
                    db_eq = DFDEquipe(**clean_eq)
                    db_dfd.equipe.append(db_eq)

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
                db_item = db.query(ItemDFD).filter(ItemDFD.id == item.id).first()
                if db_item:
                    db_item.valor_unitario_estimado = item.valor_unitario_estimado
            
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e
        
    @staticmethod
    def get_by_id(db: Session, dfd_id: int):
        return db.query(DFD).options(
            joinedload(DFD.itens).joinedload(ItemDFD.catalogo_item), # Carrega itens + nomes
            joinedload(DFD.dotacoes).joinedload(DFDDotacao.dotacao), # Carrega dotações + nomes
            joinedload(DFD.equipe).joinedload(DFDEquipe.agente)      # Carrega equipe + nomes
        ).filter(DFD.id == dfd_id, DFD.is_active == True).first()
        
    @staticmethod
    def delete(db: Session, dfd_id: int):
        """
        Realiza o Soft Delete. 
        Retorna False se não puder excluir (ex: já está em um ETP).
        """
        dfd = db.query(DFD).filter(DFD.id == dfd_id).first()
        if not dfd: return False
        
        # Trava de Segurança: Não apaga DFD que está em uso no planejamento
        if dfd.etp_id is not None:
            raise Exception("Não é possível excluir este DFD pois ele faz parte de um ETP. Desvincule-o primeiro.")
            
        dfd.is_active = False
        db.commit()
        return True