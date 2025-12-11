from typing import List  # <--- O erro sumirá com este import
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.etp_repository import ETPRepository
from app.schemas.etp_schema import (
    ETPResponse, 
    ETPUpdate, 
    ETPConsolidarRequest, 
    ItemETPUpdatePrice
)

router = APIRouter(prefix="/etps", tags=["ETPs"])

@router.get("/dfd/{dfd_id}", response_model=ETPResponse)
def obter_etp_por_dfd(dfd_id: int, db: Session = Depends(get_db)):
    """
    Busca o ETP vinculado a um DFD.
    """
    etp = ETPRepository.get_by_dfd(db, dfd_id)
    if not etp:
        raise HTTPException(status_code=404, detail="ETP não encontrado para este DFD.")
    return etp

@router.post("/consolidar", response_model=ETPResponse, status_code=status.HTTP_201_CREATED)
def consolidar_etp(request: ETPConsolidarRequest, db: Session = Depends(get_db)):
    """
    Recebe uma lista de IDs de DFDs e cria um ETP unificado.
    """
    try:
        return ETPRepository.consolidar_dfds(db, request.dfd_ids)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{etp_id}", response_model=ETPResponse)
def atualizar_etp(etp_id: int, etp_data: ETPUpdate, db: Session = Depends(get_db)):
    """
    Atualiza os campos de texto do ETP (IA ou Manual).
    """
    etp = ETPRepository.update(db, etp_id, etp_data.model_dump(exclude_unset=True))
    if not etp:
        raise HTTPException(status_code=404, detail="ETP não encontrado")
    return etp

@router.put("/itens/precos")
def atualizar_precos_itens_etp(itens: List[ItemETPUpdatePrice], db: Session = Depends(get_db)):
    """
    Atualiza em lote os preços de referência dos itens do ETP.
    """
    try:
        ETPRepository.update_item_prices(db, itens)
        return {"message": "Preços atualizados com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.delete("/{etp_id}")
def deletar_etp(etp_id: int, db: Session = Depends(get_db)):
    ETPRepository.delete(db, etp_id)
    return {"message": "ETP excluído e DFDs liberados."}

@router.delete("/{etp_id}/unlink/{dfd_id}")
def desvincular_dfd(etp_id: int, dfd_id: int, db: Session = Depends(get_db)):
    try:
        ETPRepository.unlink_dfd(db, etp_id, dfd_id)
        return {"message": "DFD desvinculado com sucesso."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))