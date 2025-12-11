from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from app.schemas.cadastro_schema import ItemCatalogoResponse, AgenteResponsavelResponse, DotacaoResponse

# --- ITENS ESTRUTURAIS ---
class ItemETPBase(BaseModel):
    catalogo_item_id: int
    quantidade_total: float
    valor_unitario_referencia: float = 0.0
    valor_total_estimado: float = 0.0

class ItemETPUpdatePrice(BaseModel):
    id: int
    valor_unitario_referencia: float

class ItemETPResponse(ItemETPBase):
    id: int
    catalogo_item: Optional[ItemCatalogoResponse] = None # Isso garante que o nome do item vá pro frontend
    model_config = ConfigDict(from_attributes=True)

class ETPEquipeBase(BaseModel):
    agente_id: int
    papel: str

class ETPEquipeResponse(ETPEquipeBase):
    id: int
    agente: Optional[AgenteResponsavelResponse] = None
    model_config = ConfigDict(from_attributes=True)

class ETPDotacaoBase(BaseModel):
    dotacao_id: int

class ETPDotacaoResponse(ETPDotacaoBase):
    id: int
    dotacao: Optional[DotacaoResponse] = None
    model_config = ConfigDict(from_attributes=True)

# --- CONSOLIDAÇÃO ---
class ETPConsolidarRequest(BaseModel):
    dfd_ids: list[int]

# --- ETP PRINCIPAL ---
class ETPBase(BaseModel):
    descricao_necessidade: Optional[str] = None
    previsao_pca: Optional[str] = None
    requisitos_tecnicos: Optional[str] = None
    motivacao_contratacao: Optional[str] = None
    levantamento_mercado: Optional[str] = None
    justificativa_escolha: Optional[str] = None
    descricao_solucao: Optional[str] = None
    estimativa_custos: Optional[str] = None
    justificativa_parcelamento: Optional[str] = None
    demonstrativo_resultados: Optional[str] = None
    providencias_previas: Optional[str] = None
    impactos_ambientais: Optional[str] = None
    viabilidade: bool = False
    conclusao_viabilidade: Optional[str] = None

class ETPCreate(ETPBase):
    pass

class ETPUpdate(ETPBase):
    pass

class DfdSummaryResponse(BaseModel):
    id: int
    numero: Optional[int]
    ano: int
    objeto: Optional[str]
    justificativa: Optional[str]
    unidade_requisitante_id: int
    
class ETPResponse(ETPBase):
    id: int
    is_active: bool
    
    itens: List[ItemETPResponse] = []
    equipe: List[ETPEquipeResponse] = []
    dotacoes: List[ETPDotacaoResponse] = []
    
    # ADICIONADO: Lista dos DFDs que compõem este planejamento
    dfds: List[DfdSummaryResponse] = [] 
    
    model_config = ConfigDict(from_attributes=True)