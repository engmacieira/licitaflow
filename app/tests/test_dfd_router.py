from fastapi import status

def test_criar_dfd_via_api(client):
    """
    Simula um POST /dfds/ enviando um JSON completo.
    """
    payload = {
        "numero": "001/2024",
        "ano": 2024,
        "data_req": "2024-01-01",
        "secretaria_id": 1,
        "responsavel_id": 1,
        "objeto": "Teste de Integração API",
        "justificativa": "Validando Router",
        "itens": [
            {"item_catalogo_id": 10, "quantidade": 5, "valor_unitario_estimado": 100.0}
        ],
        "equipe": [
            {"agente_id": 99, "papel": "Fiscal"}
        ],
        "dotacoes": [
            {"dotacao_id": 500}
        ]
    }
    
    response = client.post("/dfds/", json=payload)
    
    # Validações HTTP
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["numero"] == "001/2024"
    assert "id" in data
    assert data["id"] is not None

def test_listar_dfds(client):
    """
    Simula um GET /dfds/
    """
    # Primeiro criamos um DFD para ter o que listar
    payload = {
        "numero": "LISTA/2024", "ano": 2024, "data_req": "2024-01-01",
        "secretaria_id": 1, "responsavel_id": 1, "objeto": "Obj", "justificativa": "Jus",
        "itens": [], "equipe": [], "dotacoes": []
    }
    client.post("/dfds/", json=payload)
    
    # Agora pedimos a lista
    response = client.get("/dfds/")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["numero"] == "LISTA/2024"

def test_buscar_dfd_por_id(client):
    """
    Simula um GET /dfds/{id}
    """
    # 1. Criar
    payload = {
        "numero": "BUSCA/2024", "ano": 2024, "data_req": "2024-01-01",
        "secretaria_id": 1, "responsavel_id": 1, "objeto": "Obj", "justificativa": "Jus",
        "itens": [], "equipe": [], "dotacoes": []
    }
    resp_create = client.post("/dfds/", json=payload)
    dfd_id = resp_create.json()["id"]
    
    # 2. Buscar
    response = client.get(f"/dfds/{dfd_id}")
    
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["numero"] == "BUSCA/2024"

def test_buscar_dfd_inexistente_404(client):
    """
    Simula um erro 404 ao buscar ID que não existe
    """
    response = client.get("/dfds/99999")
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "DFD não encontrado"
    
def test_atualizar_dfd_sucesso(client):
    """Testa PUT /dfds/{id} (Caminho Feliz)"""
    # 1. Cria
    payload = {
        "numero": "UPD/2024", "ano": 2024, "data_req": "2024-01-01",
        "secretaria_id": 1, "responsavel_id": 1, "objeto": "Velho", "justificativa": "Jus",
        "itens": [], "equipe": [], "dotacoes": []
    }
    resp_create = client.post("/dfds/", json=payload)
    dfd_id = resp_create.json()["id"]
    
    # 2. Atualiza
    payload_update = {"objeto": "Novo Objeto via API"}
    resp_up = client.put(f"/dfds/{dfd_id}", json=payload_update)
    
    assert resp_up.status_code == status.HTTP_200_OK
    assert resp_up.json()["objeto"] == "Novo Objeto via API"

def test_atualizar_dfd_inexistente(client):
    """Testa PUT /dfds/{id} com ID errado (Erro 404)"""
    payload_update = {"objeto": "Fantasma"}
    resp = client.put("/dfds/99999", json=payload_update)
    
    assert resp.status_code == status.HTTP_404_NOT_FOUND
    assert resp.json()["detail"] == "DFD não encontrado para atualização"