from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
from datetime import date
from app.schemas.cadastro_schema import ItemCatalogoResponse, DotacaoResponse

# --- ITENS DO DFD ---
class DFDItemBase(BaseModel):
    catalogo_item_id: int 
    quantidade: float
    valor_unitario_estimado: float = 0.0

# --- EQUIPE E DOTAÇÃO ---
class DFDEquipeBase(BaseModel):
    agente_id: int
    papel: str

class DFDDotacaoBase(BaseModel):
    dotacao_id: int

# --- SCHEMAS DE RESPOSTA ---
class DFDItemResponse(DFDItemBase):
    id: int
    catalogo_item: Optional[ItemCatalogoResponse] = None 
    model_config = ConfigDict(from_attributes=True)

class DFDEquipeResponse(DFDEquipeBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class DFDDotacaoResponse(DFDDotacaoBase):
    id: int
    dotacao: Optional[DotacaoResponse] = None
    model_config = ConfigDict(from_attributes=True)

# --- DFD PRINCIPAL ---
class DFDBase(BaseModel):
    # Campos base compartilhados
    numero: Optional[int] = None
    numero_protocolo_string: Optional[str] = None
    ano: int
    data_req: date
    unidade_requisitante_id: int 
    responsavel_id: int
    
    objeto: Optional[str] = None
    justificativa: Optional[str] = None
    contratacao_vinculada: bool = False
    data_contratacao: Optional[str] = None
    etp_id: Optional[int] = None

# Criação
class DFDCreate(DFDBase):
    objeto: str
    justificativa: str
    # Listas Obrigatórias (podem ser vazias)
    itens: List[DFDItemBase]
    equipe: List[DFDEquipeBase]
    dotacoes: List[DFDDotacaoBase]

# Atualização (Onde estava o problema)
class DFDUpdate(BaseModel):
    # Permitimos atualizar TUDO que é editável
    numero: Optional[int] = None
    numero_protocolo_string: Optional[str] = None
    ano: Optional[int] = None
    data_req: Optional[date] = None
    
    unidade_requisitante_id: Optional[int] = None
    responsavel_id: Optional[int] = None
    
    objeto: Optional[str] = None
    justificativa: Optional[str] = None
    
    # --- A CORREÇÃO ESTÁ AQUI ---
    # Agora o Schema aceita receber as listas na atualização
    itens: Optional[List[DFDItemBase]] = None
    equipe: Optional[List[DFDEquipeBase]] = None
    dotacoes: Optional[List[DFDDotacaoBase]] = None

# Leitura (Resposta)
class DFDResponse(DFDBase):
    id: int
    is_active: bool
    
    itens: List[DFDItemResponse] = []
    equipe: List[DFDEquipeResponse] = []
    dotacoes: List[DFDDotacaoResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

# Atualização de Preço em Lote
class DFDItemUpdatePrice(BaseModel):
    id: int
    valor_unitario_estimado: float