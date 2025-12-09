from fastapi import status

# ... (Mantenha o teste test_crud_secretaria_via_api igual estava) ...

def test_crud_secretaria_via_api(client):
    # (Código igual ao anterior...)
    payload = {"nome": "Secretaria de Integração", "sigla": "SEINT"}
    response = client.post("/cadastros/secretarias/", json=payload)
    assert response.status_code == 200
    id_criado = response.json()["id"]
    
    response = client.get("/cadastros/secretarias/")
    assert response.status_code == 200
    
    response = client.delete(f"/cadastros/secretarias/{id_criado}")
    assert response.status_code == 200

def test_delete_secretaria_inexistente(client):
    response = client.delete("/cadastros/secretarias/99999")
    assert response.status_code == 404

# --- TESTES REFORÇADOS PARA COBRIR LINHAS 43 E 52 ---

def test_fluxo_agente(client):
    # Create
    client.post("/cadastros/agentes/", json={"nome": "Agente X"})
    # List (Linha crítica do router)
    resp = client.get("/cadastros/agentes/")
    assert resp.status_code == 200
    assert len(resp.json()) > 0

def test_fluxo_item_catalogo(client):
    # Create
    client.post("/cadastros/itens/", json={"nome": "Item Y", "unidade_medida": "UN"})
    # List (Cobre a linha 43 do router: read_itens)
    resp = client.get("/cadastros/itens/")
    assert resp.status_code == 200
    assert len(resp.json()) > 0

def test_fluxo_dotacao(client):
    # Create
    client.post("/cadastros/dotacoes/", json={"numero": "1.1.1", "nome": "Dot Z"})
    # List (Cobre a linha 52 do router: read_dotacoes)
    resp = client.get("/cadastros/dotacoes/")
    assert resp.status_code == 200
    assert len(resp.json()) > 0