from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.models.models import ETP, DFD, ItemETP, ETPEquipe, ETPDotacao, ItemDFD
from app.schemas.etp_schema import ETPCreate
from fastapi import HTTPException

class ETPRepository:
    
    @staticmethod
    def _get_etp_query(db: Session):
        """Query base que já carrega os relacionamentos necessários (Eager Loading)"""
        return db.query(ETP).options(
            joinedload(ETP.itens).joinedload(ItemETP.catalogo_item), # Traz Itens + Nome do Catálogo
            joinedload(ETP.equipe).joinedload(ETPEquipe.agente),     # Traz Equipe + Nomes
            joinedload(ETP.dotacoes).joinedload(ETPDotacao.dotacao)  # Traz Dotações + Detalhes
        )

    @staticmethod
    def get_by_id(db: Session, etp_id: int):
        return ETPRepository._get_etp_query(db).filter(ETP.id == etp_id, ETP.is_active == True).first()

    @staticmethod
    def get_by_dfd(db: Session, dfd_id: int):
        """Busca o ETP através de um dos DFDs vinculados."""
        dfd = db.query(DFD).filter(DFD.id == dfd_id).first()
        if dfd and dfd.etp_id:
            return ETPRepository._get_etp_query(db).filter(ETP.id == dfd.etp_id).first()
        return None

    @staticmethod
    def consolidar_dfds(db: Session, dfd_ids: list[int]):
        """
        Cria um ETP consolidando múltiplos DFDs.
        """
        # 1. Validar DFDs (com itens carregados)
        dfds = db.query(DFD).options(joinedload(DFD.itens)).filter(DFD.id.in_(dfd_ids)).all()
        
        if len(dfds) != len(dfd_ids):
            raise HTTPException(status_code=404, detail="Um ou mais DFDs não foram encontrados.")
            
        for dfd in dfds:
            if dfd.etp_id is not None:
                raise HTTPException(status_code=400, detail=f"O DFD {dfd.numero} já pertence a um ETP.")

        try:
            # 2. Criar ETP
            novo_etp = ETP(
                descricao_necessidade="ETP Consolidado - Aguardando geração de texto...",
                viabilidade=False
            )
            db.add(novo_etp)
            db.flush() 

            # 3. Vincular DFDs
            for dfd in dfds:
                dfd.etp_id = novo_etp.id
                dfd.status = "Em ETP"
            
            # 4. CONSOLIDAR ITENS (Soma)
            itens_map = {} # { catalogo_item_id: quantidade_total }
            
            for dfd in dfds:
                for item_dfd in dfd.itens:
                    cat_id = item_dfd.catalogo_item_id
                    # Converte para float para somar, se for Decimal
                    qtd = float(item_dfd.quantidade)
                    
                    if cat_id in itens_map:
                        itens_map[cat_id] += qtd
                    else:
                        itens_map[cat_id] = qtd
            
            # Salvar no Banco
            if not itens_map:
                print("⚠️  AVISO: Nenhum item encontrado nos DFDs para consolidar.")

            for cat_id, qtd_total in itens_map.items():
                item_etp = ItemETP(
                    etp_id=novo_etp.id,
                    catalogo_item_id=cat_id,
                    quantidade_total=qtd_total,
                    valor_unitario_referencia=0.0,
                    valor_total_estimado=0.0
                )
                db.add(item_etp)

            # 5. Consolidar Equipe e Dotações (Omitido para brevidade, mantenha o código anterior se quiser)
            # ... (código de equipe e dotações igual ao anterior) ...

            db.commit()
            
            # Retorna o objeto completo recarregado do banco
            return ETPRepository.get_by_id(db, novo_etp.id)

        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def update(db: Session, etp_id: int, etp_data: dict):
        db_etp = db.query(ETP).filter(ETP.id == etp_id).first()
        if not db_etp: return None
        
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

    @staticmethod
    def update_item_prices(db: Session, itens_data: list):
        try:
            for item in itens_data:
                db_item = db.query(ItemETP).filter(ItemETP.id == item.id).first()
                if db_item:
                    db_item.valor_unitario_referencia = item.valor_unitario_referencia
                    db_item.valor_total_estimado = float(db_item.quantidade_total) * item.valor_unitario_referencia
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e
        
    @staticmethod
    def unlink_dfd(db: Session, etp_id: int, dfd_id: int):
        """Remove o vínculo de um DFD com o ETP, devolvendo-o para o status de Rascunho."""
        dfd = db.query(DFD).filter(DFD.id == dfd_id, DFD.etp_id == etp_id).first()
        if not dfd:
            raise Exception("DFD não encontrado neste ETP.")
            
        dfd.etp_id = None
        dfd.status = "Rascunho"
        db.commit()
        return True

    @staticmethod
    def delete(db: Session, etp_id: int):
        """Soft Delete do ETP. Libera todos os DFDs vinculados."""
        etp = db.query(ETP).filter(ETP.id == etp_id).first()
        if not etp: return False
        
        # Libera os DFDs presos a este ETP
        for dfd in etp.dfds:
            dfd.etp_id = None
            dfd.status = "Rascunho"
            
        etp.is_active = False
        db.commit()
        return True