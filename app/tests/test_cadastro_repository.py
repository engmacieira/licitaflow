import pytest
from unittest.mock import MagicMock
from app.repositories.cadastro_repository import CadastroRepository
from app.models.models import Secretaria

def test_generic_create(db_session):
    """Testa se o método genérico cria um registro corretamente"""
    dados = {"nome": "Secretaria Teste", "sigla": "TESTE"}
    
    nova_sec = CadastroRepository.create(db_session, Secretaria, dados)
    
    assert nova_sec.id is not None
    assert nova_sec.nome == "Secretaria Teste"
    assert nova_sec.is_active is True

def test_generic_get_all(db_session):
    """Testa se busca a lista de ativos"""
    # 1. Cria 2 secretarias
    repo = CadastroRepository()
    dados1 = {"nome": "Sec 1", "sigla": "S1"}
    dados2 = {"nome": "Sec 2", "sigla": "S2"}
    
    repo.create(db_session, Secretaria, dados1)
    repo.create(db_session, Secretaria, dados2)
    
    # 2. Busca
    lista = repo.get_all(db_session, Secretaria)
    assert len(lista) == 2

def test_generic_get_by_id(db_session):
    """Testa a busca por ID"""
    dados = {"nome": "Sec ID", "sigla": "ID"}
    criada = CadastroRepository.create(db_session, Secretaria, dados)
    
    encontrada = CadastroRepository.get_by_id(db_session, Secretaria, criada.id)
    assert encontrada.nome == "Sec ID"

def test_generic_delete_soft(db_session):
    """Testa se o delete apenas desativa (Soft Delete)"""
    dados = {"nome": "Para Deletar", "sigla": "DEL"}
    criada = CadastroRepository.create(db_session, Secretaria, dados)
    
    # Executa delete
    resultado = CadastroRepository.delete(db_session, Secretaria, criada.id)
    assert resultado is True
    
    # Tenta buscar (O get_by_id filtra is_active=True, então deve vir None)
    busca = CadastroRepository.get_by_id(db_session, Secretaria, criada.id)
    assert busca is None
    
    # Verificação "Hard" no banco: O registro ainda deve existir, mas com is_active=False
    registro_banco = db_session.query(Secretaria).filter(Secretaria.id == criada.id).first()
    assert registro_banco is not None
    assert registro_banco.is_active is False

def test_generic_delete_not_found(db_session):
    """Testa tentar deletar ID que não existe"""
    resultado = CadastroRepository.delete(db_session, Secretaria, 999)
    assert resultado is False

# --- TESTE DE COBERTURA DE ERRO (ROLLBACK) ---
# Esse teste é vital para garantir que o "try...except" do seu repositório está coberto
# mesmo que a gente não tenha usado try/except no create do exemplo anterior,
# é boa prática caso você adicione no futuro. 
# Mas vamos focar no que existe: se o seu código repository não tem try/except explícito
# no create, o SQLAlchemy lança erro direto. 
# Se você implementou o repositório como eu mandei (simples), ele lança erro.
# Se quiser cobrir cenários de erro de banco, precisamos mockar.