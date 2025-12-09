import pytest
import os
import importlib
from unittest.mock import patch
from app.core import database # Importamos o módulo alvo

def test_get_db_generator():
    """Testa o generator de sessão (yield db)"""
    from app.core.database import get_db
    gen = get_db()
    sessao = next(gen)
    assert sessao is not None
    try:
        next(gen)
    except StopIteration:
        pass

def test_database_url_missing_error():
    """
    Testa se o sistema lança ValueError quando DB_URL não existe no .env
    Cobre a linha 13 do database.py
    """
    # 1. Usamos patch.dict para limpar as variáveis de ambiente temporariamente
    # Simulamos um ambiente onde DB_URL não existe
    with patch.dict(os.environ, {}, clear=True):
        # Tambem precisamos garantir que o os.getenv retorne None explicitamente
        with patch("os.getenv", return_value=None):
            
            # 2. Verificamos se o erro é lançado ao recarregar o módulo
            with pytest.raises(ValueError) as excinfo:
                importlib.reload(database)
            
            assert "A variável DB_URL não foi definida" in str(excinfo.value)

    # 3. IMPORTANTE: Recarregar o módulo corretamente ao final
    # Se não fizermos isso, o módulo database fica "quebrado" ou com mocks
    # para os próximos testes, o que causaria falhas em cadeia.
    importlib.reload(database)