from pydantic import BaseModel, ConfigDict
from typing import List, Optional

# --- Item de Risco Individual ---
class ItemRiscoBase(BaseModel):
    descricao_risco: str
    probabilidade: str # Baixa, Média, Alta
    impacto: str       # Baixo, Médio, Alto
    medida_preventiva: str
    responsavel: str   # Fiscal, Gestor, Contratada

class ItemRiscoCreate(ItemRiscoBase):
    pass

class ItemRiscoResponse(ItemRiscoBase):
    id: int
    matriz_id: int
    model_config = ConfigDict(from_attributes=True)

# --- Matriz de Risco (Container) ---
class MatrizRiscoBase(BaseModel):
    etp_id: int

class MatrizRiscoCreate(MatrizRiscoBase):
    pass

class MatrizRiscoResponse(MatrizRiscoBase):
    id: int
    riscos: List[ItemRiscoResponse] = []
    model_config = ConfigDict(from_attributes=True)

# --- IA Request ---
class GenerateRisksRequest(BaseModel):
    etp_object: str # O objeto do ETP para a IA analisar