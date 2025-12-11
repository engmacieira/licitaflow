from pydantic import BaseModel, ConfigDict
from typing import Optional

class TRBase(BaseModel):
    fundamentacao: Optional[str] = None
    descricao_solucao: Optional[str] = None
    sustentabilidade: Optional[str] = None
    estrategia_execucao: Optional[str] = None
    gestao_contrato: Optional[str] = None
    criterio_recebimento: Optional[str] = None
    criterio_liquidacao: Optional[str] = None
    criterio_pagamento: Optional[str] = None
    forma_selecao: Optional[str] = None
    habilitacao: Optional[str] = None
    obrigacoes_contratante: Optional[str] = None
    obrigacoes_contratada: Optional[str] = None
    apresentacao_amostras: Optional[str] = None

class TRCreate(TRBase):
    pass # A criação é feita via vínculo com a Matriz

class TRUpdate(TRBase):
    pass

class TRResponse(TRBase):
    id: int
    matriz_id: int
    model_config = ConfigDict(from_attributes=True)

# Schema para o pedido de geração via IA
class GenerateTRRequest(BaseModel):
    etp_id: int
    section: str # Qual cláusula gerar? (ex: 'obrigacoes', 'pagamento')