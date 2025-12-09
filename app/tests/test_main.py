from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_root():
    """Testa a rota raiz '/' do main.py"""
    response = client.get("/")
    assert response.status_code == 200
    # Atualizamos a mensagem esperada para bater com o seu main.py atual
    assert response.json() == {"message": "API LicitaFlow Online! Acesse /docs para testar."}