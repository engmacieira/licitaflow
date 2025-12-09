from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float, Date
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

# Base do SQLAlchemy
Base = declarative_base()

# --- MIXIN (PADRÃO DRY) ---
class BaseModel(Base):
    __abstract__ = True
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)

# --- CADASTROS BÁSICOS ---

class Secretaria(BaseModel):
    __tablename__ = "secretarias"
    nome = Column(String, nullable=False)
    sigla = Column(String, nullable=True)

class Agente(BaseModel):
    __tablename__ = "agentes"
    nome = Column(String, nullable=False)
    cargo = Column(String, nullable=True)
    matricula = Column(String, nullable=True)
    email = Column(String, unique=True, index=True)
    telefone = Column(String, nullable=True)

class ItemCatalogo(BaseModel):
    __tablename__ = "itens_catalogo"
    nome = Column(String, nullable=False)
    unidade_medida = Column(String, nullable=False)

class Dotacao(BaseModel):
    __tablename__ = "dotacoes"
    numero = Column(String, nullable=False)
    nome = Column(String, nullable=True)

# --- DOCUMENTOS DO FLUXO ---

class DFD(BaseModel):
    __tablename__ = "dfds"
    
    # Dados de Cabeçalho
    numero = Column(String, index=True)
    ano = Column(Integer)
    data_req = Column(Date)
    
    # Relacionamentos Simples (FK)
    secretaria_id = Column(Integer, ForeignKey("secretarias.id"))
    responsavel_id = Column(Integer, ForeignKey("agentes.id"))
    # REMOVIDO: dotacao_id (pois já temos a tabela de relacionamento N-N abaixo)
    
    # Campos de Texto
    objeto = Column(Text)
    justificativa = Column(Text)
    
    # Flags de fluxo
    contratacao_vinculada = Column(Boolean, default=False)
    data_contratacao = Column(Text, nullable=True) # Mantive Text conforme seu pedido
    
    # Relacionamentos Inversos (ORM)
    itens = relationship("DFDItem", back_populates="dfd")
    equipe = relationship("DFDEquipe", back_populates="dfd")
    
    # CORREÇÃO AQUI: Adicionada a relação com as dotações
    dotacoes = relationship("DFDDotacao", back_populates="dfd")
    
    etp = relationship("ETP", back_populates="dfd", uselist=False)

class DFDItem(BaseModel):
    __tablename__ = "dfd_itens"
    dfd_id = Column(Integer, ForeignKey("dfds.id"))
    item_catalogo_id = Column(Integer, ForeignKey("itens_catalogo.id"))
    quantidade = Column(Float)
    valor_unitario_estimado = Column(Float)
    
    dfd = relationship("DFD", back_populates="itens")
    item_catalogo = relationship("ItemCatalogo")

class DFDEquipe(BaseModel):
    __tablename__ = "dfd_equipe"
    dfd_id = Column(Integer, ForeignKey("dfds.id"))
    agente_id = Column(Integer, ForeignKey("agentes.id"))
    papel = Column(String)
    
    dfd = relationship("DFD", back_populates="equipe")
    agente = relationship("Agente")

class DFDDotacao(BaseModel):
    """Tabela Pivot: Dotacao DFD"""
    __tablename__ = "dfd_dotacoes" # CORREÇÃO: Grafia correta
    
    dfd_id = Column(Integer, ForeignKey("dfds.id"))
    dotacao_id = Column(Integer, ForeignKey("dotacoes.id"))
    
    # CORREÇÃO: back_populates aponta para 'dotacoes' no DFD, e não 'equipe'
    dfd = relationship("DFD", back_populates="dotacoes") 
    dotacao = relationship("Dotacao")

class ETP(BaseModel):
    __tablename__ = "etps"
    dfd_id = Column(Integer, ForeignKey("dfds.id"), unique=True)
    
    descricao_necessidade = Column(Text)
    previsao_pca = Column(Text)
    requisitos_tecnicos = Column(Text)
    motivacao_contratacao = Column(Text)
    levantamento_mercado = Column(Text)
    justificativa_escolha = Column(Text)
    descricao_solucao = Column(Text)
    estimativa_custos = Column(Text)
    justificativa_parcelamento = Column(Text)
    demonstrativo_resultados = Column(Text)
    providencias_previas = Column(Text)
    impactos_ambientais = Column(Text)
    viabilidade = Column(Boolean)
    
    dfd = relationship("DFD", back_populates="etp")
    matriz = relationship("MatrizRisco", back_populates="etp", uselist=False)

class MatrizRisco(BaseModel):
    __tablename__ = "matrizes_risco"
    etp_id = Column(Integer, ForeignKey("etps.id"), unique=True)
    
    riscos = relationship("ItemRisco", back_populates="matriz")
    
    etp = relationship("ETP", back_populates="matriz")
    tr = relationship("TR", back_populates="matriz", uselist=False)

class ItemRisco(BaseModel):
    __tablename__ = "itens_risco"
    matriz_id = Column(Integer, ForeignKey("matrizes_risco.id"))
    
    descricao_risco = Column(Text)
    probabilidade = Column(String)
    impacto = Column(String)
    medida_preventiva = Column(Text)
    responsavel = Column(Text)
    
    matriz = relationship("MatrizRisco", back_populates="riscos")

class TR(BaseModel):
    __tablename__ = "trs"
    matriz_id = Column(Integer, ForeignKey("matrizes_risco.id"), unique=True)
    
    fundamentacao = Column(Text)
    descricao_solucao = Column(Text)
    sustentabilidade = Column(Text)
    estrategia_execucao = Column(Text)
    gestao_contrato = Column(Text)
    criterio_recebimento = Column(Text)
    criterio_liquidacao = Column(Text)
    criterio_pagamento = Column(Text)
    forma_selecao = Column(Text)
    habilitacao = Column(Text)
    obrigacoes_contratante = Column(Text)
    obrigacoes_contratada = Column(Text)
    apresentacao_amostras = Column(Text)
    
    matriz = relationship("MatrizRisco", back_populates="tr")