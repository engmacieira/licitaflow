from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.repositories.tr_repository import TRRepository
from app.repositories.etp_repository import ETPRepository
from app.repositories.risk_repository import RiskRepository
from app.services.ai_service import AIService
from app.schemas.tr_schema import TRResponse, TRUpdate, GenerateTRRequest

router = APIRouter(prefix="/trs", tags=["Termo de Referência"])
ai_service = AIService()

@router.get("/etp/{etp_id}", response_model=TRResponse)
def obter_tr_por_etp(etp_id: int, db: Session = Depends(get_db)):
    tr = TRRepository.get_by_etp(db, etp_id)
    if not tr:
        raise HTTPException(status_code=404, detail="Matriz de Riscos não encontrada. Crie a Matriz antes de gerar o TR.")
    return tr

@router.put("/{tr_id}", response_model=TRResponse)
def atualizar_tr(tr_id: int, tr_data: TRUpdate, db: Session = Depends(get_db)):
    return TRRepository.update(db, tr_id, tr_data.model_dump(exclude_unset=True))

@router.post("/generate/clause")
def gerar_clausula_ia(request: GenerateTRRequest, db: Session = Depends(get_db)):
    # 1. Buscar Contexto (ETP Completo + Riscos)
    etp = ETPRepository.get_by_id(db, request.etp_id)
    if not etp:
        raise HTTPException(status_code=404, detail="ETP não encontrado")
    
    # Prepara resumo do ETP para a IA
    etp_summary = f"Objeto: {etp.dfds[0].objeto if etp.dfds else 'N/A'}\nJustificativa: {etp.justificativa_escolha}\nSolução: {etp.descricao_solucao}"
    
    # Prepara resumo dos Riscos
    matriz = RiskRepository.get_by_etp(db, request.etp_id)
    risks_summary = "\n".join([f"- Risco: {r.descricao_risco} (Mitigação: {r.medida_preventiva})" for r in matriz.riscos])
    
    # 2. Chamar IA
    texto_gerado = ai_service.generate_tr_clause(request.section, etp_summary, risks_summary)
    
    return {"result": texto_gerado}