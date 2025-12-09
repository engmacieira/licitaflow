from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import date
from app.schemas.cadastro_schema import ItemCatalogoResponse

# --- SCHEMAS PARA ITENS E EQUIPE (Aninhados) ---

class DFDItemBase(BaseModel):
    item_catalogo_id: int
    quantidade: float
    valor_unitario_estimado: float

class DFDEquipeBase(BaseModel):
    agente_id: int
    papel: str

class DFDDotacaoBase(BaseModel):
    dotacao_id: int
    
# --- SCHEMAS DE RESPOSTA (A Mágica acontece aqui) ---

# 1. Definimos como o ITEM deve aparecer na resposta (com o nome do produto!)
class DFDItemResponse(DFDItemBase):
    id: int
    # Aqui fazemos a mágica: Trazemos o objeto ItemCatalogo completo
    item_catalogo: Optional[ItemCatalogoResponse] = None 
    
    model_config = ConfigDict(from_attributes=True)

class DFDEquipeResponse(DFDEquipeBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class DFDDotacaoResponse(DFDDotacaoBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- SCHEMAS PRINCIPAIS DO DFD ---

class DFDBase(BaseModel):
    numero: str
    ano: int
    data_req: date
    secretaria_id: int
    responsavel_id: int
    
    # ATENÇÃO: dotacao_id NÃO deve estar aqui, pois virou tabela N-N
    
    # Tornando opcional para evitar erro se o banco vier vazio
    objeto: Optional[str] = None
    justificativa: Optional[str] = None
    
    contratacao_vinculada: bool = False
    data_contratacao: Optional[str] = None

class DFDCreate(DFDBase):
    # Campos obrigatórios na criação
    objeto: str
    justificativa: str
    
    # Listas
    itens: List[DFDItemBase]
    equipe: List[DFDEquipeBase]
    dotacoes: List[DFDDotacaoBase]

class DFDUpdate(BaseModel):
    numero: Optional[str] = None
    objeto: Optional[str] = None
    justificativa: Optional[str] = None

class DFDResponse(DFDBase):
    id: int
    is_active: bool
    
class DFDItemUpdatePrice(BaseModel):
    id: int # ID do item (dfd_itens.id)
    valor_unitario_estimado: float
    
    itens: List[DFDItemResponse] = []
    equipe: List[DFDEquipeResponse] = []
    # Configuração necessária para ler do Banco
    model_config = ConfigDict(from_attributes=True)