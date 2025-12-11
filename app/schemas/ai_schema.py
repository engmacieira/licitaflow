from pydantic import BaseModel
from typing import Optional

class GenerateObjectRequest(BaseModel):
    draft_text: str
    user_instructions: Optional[str] = None

class GenerateJustificationRequest(BaseModel):
    object_text: str  # Obrigatório: A IA precisa saber O QUE está comprando
    draft_text: Optional[str] = None
    user_instructions: Optional[str] = None

class GenerateETPNeedRequest(BaseModel):
    dfd_object: str        # Contexto: O que é?
    dfd_justification: str # Contexto: Por que pediu no DFD?
    draft_text: Optional[str] = None       # Fatos novos (ex: surto de dengue)
    user_instructions: Optional[str] = None # Refinamento

class GenerateETPRequirementsRequest(BaseModel):
    dfd_object: str
    solution_description: str # Mantemos para compatibilidade, mesmo que o prompt foque no objeto
    draft_text: Optional[str] = None  # <--- CAMPO NOVO (Ex: "garantia de 5 anos")
    user_instructions: Optional[str] = None

class GenerateETPMotivationRequest(BaseModel):
    dfd_object: str
    draft_text: Optional[str] = None
    user_instructions: Optional[str] = None
    
class GenerateETPMarketAnalysisRequest(BaseModel):
    dfd_object: str
    draft_text: Optional[str] = None       # Ex: "Pesquisa no Banco de Preços"
    user_instructions: Optional[str] = None # Ex: "Justificar não adesão"

class GenerateETPChoiceJustificationRequest(BaseModel):
    dfd_object: str
    market_analysis_context: Optional[str] = None # O texto do tópico anterior ajuda a dar coerência
    draft_text: Optional[str] = None
    user_instructions: Optional[str] = None
    
class GenerateETPSolutionDescriptionRequest(BaseModel):
    dfd_object: str
    requirements_text: Optional[str] = None # Contexto novo: O que foi exigido?
    draft_text: Optional[str] = None        # Logística/Operação
    user_instructions: Optional[str] = None

class GenerateETPParcelingJustificationRequest(BaseModel):
    dfd_object: str
    draft_text: Optional[str] = None
    user_instructions: Optional[str] = None

class GenerateETPResultsRequest(BaseModel):
    dfd_object: str
    draft_text: Optional[str] = None
    user_instructions: Optional[str] = None
    
class GenerateETPPriorMeasuresRequest(BaseModel):
    dfd_object: str
    draft_text: Optional[str] = None
    user_instructions: Optional[str] = None
    
class GenerateETPEnvironmentalImpactsRequest(BaseModel):
    dfd_object: str
    draft_text: Optional[str] = None
    user_instructions: Optional[str] = None
    
class GenerateETPViabilityRequest(BaseModel):
    dfd_object: str
    draft_text: Optional[str] = None
    user_instructions: Optional[str] = None

class GenerateObjectResponse(BaseModel):
    result: str
    
class GenerateConsolidatedRequest(BaseModel):
    text_list: list[str]