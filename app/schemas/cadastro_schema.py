from pydantic import BaseModel, ConfigDict
from typing import Optional, List

# --- SECRETARIAS ---
class SecretariaBase(BaseModel):
    nome: str
    sigla: Optional[str] = None

class SecretariaCreate(SecretariaBase):
    pass

class SecretariaResponse(SecretariaBase):
    id: int
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

# --- AGENTES ---
class AgenteBase(BaseModel):
    nome: str
    cargo: Optional[str] = None
    matricula: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None

class AgenteCreate(AgenteBase):
    pass

class AgenteResponse(AgenteBase):
    id: int
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

# --- ITENS CATÁLOGO ---
class ItemCatalogoBase(BaseModel):
    nome: str
    unidade_medida: str

class ItemCatalogoCreate(ItemCatalogoBase):
    pass

class ItemCatalogoResponse(ItemCatalogoBase):
    id: int
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

# --- DOTAÇÕES ---
class DotacaoBase(BaseModel):
    numero: str
    nome: Optional[str] = None

class DotacaoCreate(DotacaoBase):
    pass

class DotacaoResponse(DotacaoBase):
    id: int
    is_active: bool
    model_config = ConfigDict(from_attributes=True)