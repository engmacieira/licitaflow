from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Numeric, Date, CHAR
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

# --- MIXIN ---
class BaseModel(Base):
    __abstract__ = True
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)

# --- CADASTROS (Mantidos) ---
class UnidadeRequisitante(BaseModel):
    __tablename__ = "unidades_requisitantes"
    nome = Column(String(255), nullable=False, unique=True)
    sigla = Column(String(20), nullable=True) 
    codigo_administrativo = Column(String(20))
    unidade_pai_id = Column(Integer, ForeignKey("unidades_requisitantes.id"), nullable=True)
    sub_unidades = relationship("UnidadeRequisitante")

class AgenteResponsavel(BaseModel):
    __tablename__ = "agentes_responsaveis"
    nome = Column(String(255), nullable=False)
    cpf = Column(String(11), unique=True, nullable=True)
    email = Column(String(255), unique=True, index=True)
    telefone = Column(String(20), nullable=True)
    matricula = Column(String(50), nullable=True)
    cargo = Column(String(100), nullable=True)

class Fornecedor(BaseModel):
    __tablename__ = "fornecedores"
    razao_social = Column(String(255), nullable=False)
    nome_fantasia = Column(String(255))
    cpf_cnpj = Column(String(18), unique=True, nullable=False)
    email = Column(String(255))
    telefone = Column(String(20))

# --- TAXONOMIA (Mantida) ---
class Categoria(BaseModel):
    __tablename__ = "categorias"
    nome = Column(String(150), nullable=False, unique=True)
    codigo_taxonomia = Column(CHAR(2), nullable=False, unique=True)
    grupos = relationship("Grupo", back_populates="categoria")

class Grupo(BaseModel):
    __tablename__ = "grupos"
    categoria_id = Column(Integer, ForeignKey("categorias.id"), nullable=False)
    codigo = Column(CHAR(2), nullable=False)
    nome = Column(String(150), nullable=False)
    categoria = relationship("Categoria", back_populates="grupos")
    subgrupos = relationship("Subgrupo", back_populates="grupo")

class Subgrupo(BaseModel):
    __tablename__ = "subgrupos"
    grupo_id = Column(Integer, ForeignKey("grupos.id"), nullable=False)
    codigo = Column(CHAR(2), nullable=False)
    nome = Column(String(150), nullable=False)
    grupo = relationship("Grupo", back_populates="subgrupos")
    itens = relationship("CatalogoItem", back_populates="subgrupo")

class CatalogoItem(BaseModel):
    __tablename__ = "catalogo_itens"
    subgrupo_id = Column(Integer, ForeignKey("subgrupos.id"), nullable=False)
    nome_item = Column(String(255), nullable=False)
    unidade_medida = Column(String(50), nullable=False)
    tipo = Column(String(20), nullable=False)
    codigo_catmat_catser = Column(String(50))
    numero_sequencial_taxonomia = Column(CHAR(4), nullable=False)
    codigo_identificacao_completo = Column(String(10), unique=True)
    descricao_detalhada = Column(Text)
    subgrupo = relationship("Subgrupo", back_populates="itens")

# --- DOCUMENTOS (ALTERADOS) ---

class DFD(BaseModel):
    __tablename__ = "dfds"
    
    numero = Column(Integer, nullable=True)
    ano = Column(Integer, nullable=True)
    numero_protocolo_string = Column(String(50), index=True)
    
    data_req = Column(Date)
    descricao_sucinta = Column(String(255))
    objeto = Column(Text)
    justificativa = Column(Text)
    
    unidade_requisitante_id = Column(Integer, ForeignKey("unidades_requisitantes.id"))
    responsavel_id = Column(Integer, ForeignKey("agentes_responsaveis.id"))
    
    # MUDANÇA 1: DFD aponta para ETP (N:1)
    etp_id = Column(Integer, ForeignKey("etps.id"), nullable=True)
    
    contratacao_vinculada = Column(Boolean, default=False)
    data_contratacao = Column(Text, nullable=True)
    status = Column(String(50), default='Rascunho') 
    
    unidade_requisitante = relationship("UnidadeRequisitante")
    responsavel = relationship("AgenteResponsavel")
    
    itens = relationship("ItemDFD", back_populates="dfd", cascade="all, delete-orphan")
    equipe = relationship("DFDEquipe", back_populates="dfd")
    dotacoes = relationship("DFDDotacao", back_populates="dfd")
    
    # Relacionamento com ETP (Agora o DFD "pertence" a um Planejamento/ETP)
    etp = relationship("ETP", back_populates="dfds")

class ItemDFD(BaseModel):
    __tablename__ = "itens_dfd"
    dfd_id = Column(Integer, ForeignKey("dfds.id"))
    catalogo_item_id = Column(Integer, ForeignKey("catalogo_itens.id"))
    quantidade = Column(Numeric(15,3)) 
    valor_unitario_estimado = Column(Numeric(15,2))
    complemento_descricao = Column(Text, nullable=True)
    
    dfd = relationship("DFD", back_populates="itens")
    catalogo_item = relationship("CatalogoItem")

class DFDEquipe(BaseModel):
    __tablename__ = "dfd_equipe"
    dfd_id = Column(Integer, ForeignKey("dfds.id"))
    agente_id = Column(Integer, ForeignKey("agentes_responsaveis.id"))
    papel = Column(String(50))
    dfd = relationship("DFD", back_populates="equipe")
    agente = relationship("AgenteResponsavel")

class Dotacao(BaseModel):
    __tablename__ = "dotacoes"
    exercicio = Column(Integer, nullable=False)
    numero = Column(String(100), nullable=False)
    nome = Column(String(255), nullable=True)

class DFDDotacao(BaseModel):
    __tablename__ = "dfd_dotacoes"
    dfd_id = Column(Integer, ForeignKey("dfds.id"))
    dotacao_id = Column(Integer, ForeignKey("dotacoes.id"))
    dfd = relationship("DFD", back_populates="dotacoes")
    dotacao = relationship("Dotacao")

# --- ETP E PLANEJAMENTO (ALTERADOS) ---

class ETP(BaseModel):
    __tablename__ = "etps"
    
    # Campos de Texto (IA)
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
    conclusao_viabilidade = Column(Text)
    
    # Relacionamentos
    dfds = relationship("DFD", back_populates="etp") 
    itens = relationship("ItemETP", back_populates="etp", cascade="all, delete-orphan")
    
    # NOVOS RELACIONAMENTOS (Consolidação)
    equipe = relationship("ETPEquipe", back_populates="etp", cascade="all, delete-orphan")
    dotacoes = relationship("ETPDotacao", back_populates="etp", cascade="all, delete-orphan")
    
    matriz = relationship("MatrizRisco", back_populates="etp", uselist=False)

class ItemETP(BaseModel):
    __tablename__ = "itens_etp"
    etp_id = Column(Integer, ForeignKey("etps.id"))
    catalogo_item_id = Column(Integer, ForeignKey("catalogo_itens.id"))
    
    quantidade_total = Column(Numeric(15,3)) 
    valor_unitario_referencia = Column(Numeric(15,2))
    valor_total_estimado = Column(Numeric(15,2))
    
    etp = relationship("ETP", back_populates="itens")
    catalogo_item = relationship("CatalogoItem")

# --- NOVAS TABELAS ---

class ETPEquipe(BaseModel):
    """Equipe responsável pelo Planejamento (Pode ser a soma das equipes dos DFDs)"""
    __tablename__ = "etp_equipe"
    
    etp_id = Column(Integer, ForeignKey("etps.id"))
    agente_id = Column(Integer, ForeignKey("agentes_responsaveis.id"))
    papel = Column(String(50)) # Ex: 'Membro da Equipe de Planejamento'
    
    etp = relationship("ETP", back_populates="equipe")
    agente = relationship("AgenteResponsavel")

class ETPDotacao(BaseModel):
    """As dotações que cobrirão a despesa consolidada"""
    __tablename__ = "etp_dotacoes"
    
    etp_id = Column(Integer, ForeignKey("etps.id"))
    dotacao_id = Column(Integer, ForeignKey("dotacoes.id"))
    
    etp = relationship("ETP", back_populates="dotacoes")
    dotacao = relationship("Dotacao")

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
    probabilidade = Column(String(50))
    impacto = Column(String(50))
    medida_preventiva = Column(Text)
    responsavel = Column(Text)
    matriz = relationship("MatrizRisco", back_populates="riscos")

class TR(BaseModel):
    __tablename__ = "trs"
    matriz_id = Column(Integer, ForeignKey("matrizes_risco.id"), unique=True)
    fundamentacao = Column(Text)
    # ... outros campos ...
    matriz = relationship("MatrizRisco", back_populates="tr")