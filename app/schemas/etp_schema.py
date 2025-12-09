from pydantic import BaseModel, ConfigDict
from typing import Optional

# Base com todos os campos de texto do ETP (conforme seu models.py)
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

# Para criar, precisamos saber de qual DFD ele é
class ETPCreate(ETPBase):
    dfd_id: int

# Para atualizar, qualquer campo é opcional
class ETPUpdate(ETPBase):
    pass

# O que devolvemos para o frontend
class ETPResponse(ETPBase):
    id: int
    dfd_id: int
    is_active: bool
    
    model_config = ConfigDict(from_attributes=True)