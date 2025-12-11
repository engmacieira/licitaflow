from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.repositories.dfd_repository import DFDRepository
from app.schemas.dfd_schema import DFDCreate, DFDResponse, DFDUpdate, DFDItemUpdatePrice

# O prefixo define que todas as rotas aqui começam com /dfds
router = APIRouter(
    prefix="/dfds",
    tags=["DFDs (Documento de Formalização da Demanda)"]
)

@router.post("/", response_model=DFDResponse, status_code=status.HTTP_201_CREATED)
def create_dfd(dfd: DFDCreate, db: Session = Depends(get_db)):
    """
    Cria um novo DFD com seus itens, equipe e dotação.
    """
    return DFDRepository.create(db, dfd)

@router.get("/", response_model=List[DFDResponse])
def read_dfds(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Lista todos os DFDs ativos.
    """
    return DFDRepository.get_all(db, skip=skip, limit=limit)

@router.get("/{dfd_id}", response_model=DFDResponse)
def read_dfd(dfd_id: int, db: Session = Depends(get_db)):
    """
    Busca um DFD específico pelo ID.
    """
    db_dfd = DFDRepository.get_by_id(db, dfd_id)
    if db_dfd is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="DFD não encontrado"
        )
    return db_dfd

@router.put("/{dfd_id}", response_model=DFDResponse)
def update_dfd(dfd_id: int, dfd_update: DFDUpdate, db: Session = Depends(get_db)):
    """
    Atualiza um DFD existente (ex: salvando o texto gerado pela IA).
    """
    # Convertemos o schema para dict, removendo campos vazios (None)
    # exclude_unset=True é vital! Ele garante que só atualizamos o que foi enviado.
    update_data = dfd_update.model_dump(exclude_unset=True)
    
    updated_dfd = DFDRepository.update(db, dfd_id, update_data)
    
    if not updated_dfd:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="DFD não encontrado para atualização"
        )
        
    return updated_dfd

@router.put("/itens/precos", status_code=status.HTTP_200_OK)
def update_dfd_item_prices(itens: List[DFDItemUpdatePrice], db: Session = Depends(get_db)):
    """Recebe uma lista de {id, valor} e atualiza no banco."""
    DFDRepository.update_item_prices(db, itens)
    return {"message": "Preços atualizados com sucesso"}

@router.delete("/{dfd_id}")
def deletar_dfd(dfd_id: int, db: Session = Depends(get_db)):
    try:
        DFDRepository.delete(db, dfd_id)
        return {"message": "DFD enviado para lixeira."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))