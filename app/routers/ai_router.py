from fastapi import APIRouter, HTTPException, status
from app.schemas.ai_schema import (GenerateObjectRequest, GenerateObjectResponse, GenerateJustificationRequest, 
                                   GenerateETPNeedRequest, GenerateETPRequirementsRequest, GenerateETPMotivationRequest,
                                   GenerateETPMarketAnalysisRequest)
from app.services.ai_service import AIService

router = APIRouter(
    prefix="/ai",
    tags=["Integração IA (Gemini)"]
)

# Instanciamos o serviço (Singleton simples)
ai_service = AIService()

@router.post("/generate/dfd-object", response_model=GenerateObjectResponse)
def generate_dfd_object(request: GenerateObjectRequest):
    """
    Recebe um rascunho e retorna o texto do Objeto formatado no padrão Braúnas.
    """
    try:
        result_text = ai_service.generate_dfd_object(
            draft_text=request.draft_text,
            user_instructions=request.user_instructions
        )
        return GenerateObjectResponse(result=result_text)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
        
@router.post("/generate/dfd-justification", response_model=GenerateObjectResponse)
def generate_dfd_justification(request: GenerateJustificationRequest):
    """
    Gera a Justificativa baseada no Objeto e Rascunho, aplicando a Lei 14.133/2021.
    """
    try:
        result_text = ai_service.generate_dfd_justification(
            object_text=request.object_text,
            draft_text=request.draft_text,
            user_instructions=request.user_instructions
        )
        return GenerateObjectResponse(result=result_text)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/generate/etp-need", response_model=GenerateObjectResponse)
def generate_etp_need(request: GenerateETPNeedRequest):
    """
    Gera a Descrição da Necessidade do ETP (Foco em Riscos e Capacidade de Resposta).
    """
    try:
        result = ai_service.generate_etp_need(
            dfd_object=request.dfd_object,
            dfd_justification=request.dfd_justification,
            draft_text=request.draft_text,
            user_instructions=request.user_instructions
        )
        return GenerateObjectResponse(result=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/generate/etp-requirements", response_model=GenerateObjectResponse)
def generate_etp_requirements(request: GenerateETPRequirementsRequest):
    try:
        # Atualizamos a assinatura da chamada aqui
        result = ai_service.generate_etp_requirements(
            dfd_object=request.dfd_object,
            draft_text=request.draft_text, # <--- Passando o rascunho
            user_instructions=request.user_instructions
        )
        return GenerateObjectResponse(result=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/generate/etp-motivation", response_model=GenerateObjectResponse)
def generate_etp_motivation(request: GenerateETPMotivationRequest):
    try:
        result = ai_service.generate_etp_motivation(
            dfd_object=request.dfd_object,
            draft_text=request.draft_text,
            user_instructions=request.user_instructions
        )
        return GenerateObjectResponse(result=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/generate/etp-market-analysis", response_model=GenerateObjectResponse)
def generate_etp_market_analysis(request: GenerateETPMarketAnalysisRequest):
    try:
        result = ai_service.generate_etp_market_analysis(
            dfd_object=request.dfd_object,
            draft_text=request.draft_text,
            user_instructions=request.user_instructions
        )
        return GenerateObjectResponse(result=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))