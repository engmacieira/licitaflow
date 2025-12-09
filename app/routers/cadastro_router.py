from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.models import Secretaria, Agente, ItemCatalogo, Dotacao
from app.repositories.cadastro_repository import CadastroRepository
from app.schemas import cadastro_schema

router = APIRouter(prefix="/cadastros")

# --- SECRETARIAS ---
@router.post("/secretarias/", response_model=cadastro_schema.SecretariaResponse, tags=["Secretarias"])
def create_secretaria(item: cadastro_schema.SecretariaCreate, db: Session = Depends(get_db)):
    return CadastroRepository.create(db, Secretaria, item.model_dump())

@router.get("/secretarias/", response_model=List[cadastro_schema.SecretariaResponse], tags=["Secretarias"])
def read_secretarias(db: Session = Depends(get_db)):
    return CadastroRepository.get_all(db, Secretaria)

@router.delete("/secretarias/{id}", tags=["Secretarias"])
def delete_secretaria(id: int, db: Session = Depends(get_db)):
    if not CadastroRepository.delete(db, Secretaria, id):
        raise HTTPException(status_code=404, detail="Secretaria não encontrada")
    return {"message": "Deletado com sucesso"}

# --- AGENTES ---
@router.post("/agentes/", response_model=cadastro_schema.AgenteResponse, tags=["Agentes"])
def create_agente(item: cadastro_schema.AgenteCreate, db: Session = Depends(get_db)):
    return CadastroRepository.create(db, Agente, item.model_dump())

@router.get("/agentes/", response_model=List[cadastro_schema.AgenteResponse], tags=["Agentes"])
def read_agentes(db: Session = Depends(get_db)):
    return CadastroRepository.get_all(db, Agente)

# --- ITENS CATÁLOGO ---
@router.post("/itens/", response_model=cadastro_schema.ItemCatalogoResponse, tags=["Itens"])
def create_item(item: cadastro_schema.ItemCatalogoCreate, db: Session = Depends(get_db)):
    return CadastroRepository.create(db, ItemCatalogo, item.model_dump())

@router.get("/itens/", response_model=List[cadastro_schema.ItemCatalogoResponse], tags=["Itens"])
def read_itens(db: Session = Depends(get_db)):
    return CadastroRepository.get_all(db, ItemCatalogo)

# --- DOTAÇÕES ---
@router.post("/dotacoes/", response_model=cadastro_schema.DotacaoResponse, tags=["Dotações"])
def create_dotacao(item: cadastro_schema.DotacaoCreate, db: Session = Depends(get_db)):
    return CadastroRepository.create(db, Dotacao, item.model_dump())

@router.get("/dotacoes/", response_model=List[cadastro_schema.DotacaoResponse], tags=["Dotações"])
def read_dotacoes(db: Session = Depends(get_db)):
    return CadastroRepository.get_all(db, Dotacao)