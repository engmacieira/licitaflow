from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.repositories.etp_repository import ETPRepository
from app.schemas.etp_schema import ETPCreate, ETPUpdate, ETPResponse

router = APIRouter(
    prefix="/etps",
    tags=["ETP (Estudo Técnico Preliminar)"]
)

@router.get("/dfd/{dfd_id}", response_model=ETPResponse)
def get_etp_by_dfd(dfd_id: int, db: Session = Depends(get_db)):
    """Busca o ETP de um DFD. Retorna 404 se não existir."""
    etp = ETPRepository.get_by_dfd(db, dfd_id)
    if not etp:
        raise HTTPException(status_code=404, detail="ETP não encontrado para este DFD")
    return etp

@router.post("/", response_model=ETPResponse, status_code=status.HTTP_201_CREATED)
def create_etp(etp: ETPCreate, db: Session = Depends(get_db)):
    """Cria a estrutura inicial do ETP."""
    # Verifica se já existe (regra de negócio: 1 DFD = 1 ETP)
    existente = ETPRepository.get_by_dfd(db, etp.dfd_id)
    if existente:
        raise HTTPException(status_code=400, detail="Já existe um ETP para este DFD")
    return ETPRepository.create(db, etp)

@router.put("/{etp_id}", response_model=ETPResponse)
def update_etp(etp_id: int, etp_update: ETPUpdate, db: Session = Depends(get_db)):
    """Salva os textos (IA) no ETP."""
    update_data = etp_update.model_dump(exclude_unset=True)
    updated = ETPRepository.update(db, etp_id, update_data)
    if not updated:
        raise HTTPException(status_code=404, detail="ETP não encontrado")
    return updated