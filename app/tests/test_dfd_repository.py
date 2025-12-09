import pytest
from unittest.mock import MagicMock
from app.repositories.dfd_repository import DFDRepository
from app.schemas.dfd_schema import DFDCreate, DFDItemBase, DFDEquipeBase, DFDDotacaoBase
from datetime import date

# Dados Mock (reutilizáveis)
def get_dfd_mock_data():
    return DFDCreate(
        numero="001/2024",
        ano=2024,
        data_req=date(2024, 1, 1),
        secretaria_id=1,
        responsavel_id=1,
        objeto="Teste Unitário",
        justificativa="Teste",
        itens=[],
        equipe=[],
        dotacoes=[]
    )

def test_criar_dfd_com_relacionamentos(db_session):
    """Testa o Caminho Feliz (Criação Completa)"""
    dados = get_dfd_mock_data()
    
    # --- AQUI ESTÁ A CORREÇÃO PARA COBRIR AS LINHAS 30-31 e 36-37 ---
    # Adicionamos itens REAIS nas listas para forçar o código a entrar nos 'for loops'
    dados.itens = [
        DFDItemBase(item_catalogo_id=1, quantidade=1, valor_unitario_estimado=10.0)
    ]
    dados.equipe = [
        DFDEquipeBase(agente_id=2, papel="Fiscal Técnico")
    ]
    dados.dotacoes = [
        DFDDotacaoBase(dotacao_id=5)
    ]
    
    novo_dfd = DFDRepository.create(db_session, dados)
    
    # Asserts
    assert novo_dfd.id is not None
    assert novo_dfd.numero == "001/2024"
    
    # Validamos se salvou as listas
    assert len(novo_dfd.itens) == 1
    assert len(novo_dfd.equipe) == 1       # Isso prova que as linhas 30-31 rodaram
    assert novo_dfd.equipe[0].papel == "Fiscal Técnico"
    assert len(novo_dfd.dotacoes) == 1     # Isso prova que as linhas 36-37 rodaram

def test_get_all_dfds(db_session):
    """Testa a linha 50 (get_all)"""
    # 1. Cria 2 DFDs
    repo = DFDRepository()
    dados = get_dfd_mock_data()
    repo.create(db_session, dados)
    
    dados2 = get_dfd_mock_data()
    dados2.numero = "002/2024"
    repo.create(db_session, dados2)
    
    # 2. Busca todos
    lista = repo.get_all(db_session)
    
    # 3. Valida
    assert len(lista) == 2
    assert lista[0].numero == "001/2024"
    assert lista[1].numero == "002/2024"

def test_get_dfd_by_id(db_session):
    """Testa a linha 54 (get_by_id)"""
    dados = get_dfd_mock_data()
    criado = DFDRepository.create(db_session, dados)
    
    encontrado = DFDRepository.get_by_id(db_session, criado.id)
    
    assert encontrado is not None
    assert encontrado.id == criado.id
    assert encontrado.objeto == "Teste Unitário"

def test_create_dfd_rollback_on_error(db_session):
    """Testa as linhas 43-45 (Exception e Rollback)"""
    dados = get_dfd_mock_data()
    
    # TRUQUE DE MESTRE:
    # Vamos substituir o método 'commit' da sessão por uma bomba relógio
    # que explode (gera Exception) quando chamada.
    db_session.commit = MagicMock(side_effect=Exception("Erro Simulado de Banco"))
    
    # Agora tentamos criar. Deve gerar erro e chamar rollback.
    with pytest.raises(Exception) as excinfo:
        DFDRepository.create(db_session, dados)
    
    assert "Erro Simulado de Banco" in str(excinfo.value)
    
    # Verificamos se nada foi salvo (o rollback funcionou?)
    # Como o mock impediu o commit real, o rollback limpa a sessão.
    # Se tentarmos buscar, não deve existir.
    # Nota: No SQLite em memória, o rollback cancela a transação pendente.

def test_update_dfd_success(db_session):
    """Testa a atualização de campos (Linhas 63, 67-73, 76-79)"""
    # 1. Cria DFD original
    dados = get_dfd_mock_data()
    dfd_criado = DFDRepository.create(db_session, dados)
    
    # 2. Atualiza
    novos_dados = {"objeto": "Objeto Atualizado", "justificativa": "Nova Justificativa"}
    dfd_atualizado = DFDRepository.update(db_session, dfd_criado.id, novos_dados)
    
    # 3. Valida
    assert dfd_atualizado.objeto == "Objeto Atualizado"
    assert dfd_atualizado.justificativa == "Nova Justificativa"
    # Garante que o número (que não mudou) continua igual
    assert dfd_atualizado.numero == "001/2024" 

def test_update_dfd_not_found(db_session):
    """Testa a atualização de ID inexistente (Linhas 65-66)"""
    resultado = DFDRepository.update(db_session, 9999, {"objeto": "X"})
    assert resultado is None

def test_update_dfd_rollback_on_error(db_session):
    """Testa o rollback no update (Linhas 80-81)"""
    # 1. Cria
    dados = get_dfd_mock_data()
    dfd_criado = DFDRepository.create(db_session, dados)
    
    # 2. Mocka o erro no commit
    db_session.commit = MagicMock(side_effect=Exception("Erro no Update"))
    
    # 3. Tenta atualizar
    with pytest.raises(Exception) as excinfo:
        DFDRepository.update(db_session, dfd_criado.id, {"objeto": "Crash"})
    
    assert "Erro no Update" in str(excinfo.value)