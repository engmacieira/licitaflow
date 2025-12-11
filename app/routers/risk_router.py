from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json

from app.core.database import get_db
from app.repositories.risk_repository import RiskRepository
from app.services.ai_service import AIService
from app.schemas.risk_schema import MatrizRiscoResponse, ItemRiscoCreate, ItemRiscoResponse, GenerateRisksRequest

router = APIRouter(prefix="/riscos", tags=["Matriz de Riscos"])
ai_service = AIService()

@router.get("/etp/{etp_id}", response_model=MatrizRiscoResponse)
def obter_matriz(etp_id: int, db: Session = Depends(get_db)):
    return RiskRepository.get_by_etp(db, etp_id)

@router.post("/item/{matriz_id}", response_model=ItemRiscoResponse)
def adicionar_risco(matriz_id: int, risco: ItemRiscoCreate, db: Session = Depends(get_db)):
    return RiskRepository.add_risk(db, matriz_id, risco.model_dump())

@router.delete("/item/{risk_id}")
def remover_risco(risk_id: int, db: Session = Depends(get_db)):
    success = RiskRepository.delete_risk(db, risk_id)
    if not success:
        raise HTTPException(status_code=404, detail="Risco não encontrado")
    return {"message": "Risco removido"}

@router.post("/generate", response_model=List[dict])
def gerar_sugestoes_risco(request: GenerateRisksRequest):
    """
    Gera sugestões de risco via IA. Retorna uma lista de objetos, não salva no banco ainda.
    """
    try:
        raw_text = ai_service.generate_risks(request.etp_object)
        # Limpeza básica caso a IA mande markdown
        clean_text = raw_text.replace("```json", "").replace("```", "").strip()
        riscos = json.loads(clean_text)
        return riscos
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na IA: {str(e)}")