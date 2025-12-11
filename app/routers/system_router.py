from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
# CORREÇÃO: Importando os modelos necessários
from app.models.models import DFD, ETP 

router = APIRouter(prefix="/system", tags=["Sistema"])

@router.delete("/cleanup")
def limpar_lixeira(db: Session = Depends(get_db)):
    """
    HARD DELETE: Apaga fisicamente registros marcados como is_active=False.
    CUIDADO: Irreversível.
    """
    try:
        # Apaga DFDs inativos
        rows_dfd = db.query(DFD).filter(DFD.is_active == False).delete()
        
        # Apaga ETPs inativos
        rows_etp = db.query(ETP).filter(ETP.is_active == False).delete()
        
        db.commit()
        return {
            "message": "Faxina concluída com sucesso.",
            "detalhes": {
                "dfds_apagados": rows_dfd,
                "etps_apagados": rows_etp
            }
        }
    except Exception as e:
        db.rollback()
        return {"error": f"Erro ao limpar lixeira: {str(e)}"}