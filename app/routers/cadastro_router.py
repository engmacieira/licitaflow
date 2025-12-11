from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.repositories.cadastro_repository import CadastroRepository
from app.schemas.cadastro_schema import (
    UnidadeRequisitanteResponse, 
    AgenteResponsavelResponse, 
    ItemCatalogoResponse,
    DotacaoResponse
)

router = APIRouter(prefix="/cadastros", tags=["Cadastros"])

# Note a mudança: UnidadeRequisitanteResponse em vez de SecretariaResponse
@router.get("/secretarias/", response_model=List[UnidadeRequisitanteResponse])
def listar_secretarias(db: Session = Depends(get_db)):
    """
    Retorna a lista de Unidades Requisitantes (Secretarias/Departamentos).
    Mantivemos a rota /secretarias/ para não quebrar o frontend agora, 
    mas o ideal seria mudar para /unidades/.
    """
    return CadastroRepository.get_all_unidades(db)

@router.get("/agentes/", response_model=List[AgenteResponsavelResponse])
def listar_agentes(db: Session = Depends(get_db)):
    return CadastroRepository.get_all_agentes(db)

@router.get("/itens/", response_model=List[ItemCatalogoResponse])
def listar_itens(db: Session = Depends(get_db)):
    return CadastroRepository.get_all_itens(db)

@router.get("/dotacoes/", response_model=List[DotacaoResponse])
def listar_dotacoes(db: Session = Depends(get_db)):
    return CadastroRepository.get_all_dotacoes(db)