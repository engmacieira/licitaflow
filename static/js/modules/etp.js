const ETPController = {
    preparar: async (dfdId) => {
        let etp = await API.etp.buscarPorDfd(dfdId);
        if (etp) {
            ETPController.render(dfdId, etp);
        } else {
            if(confirm("Este DFD ainda não tem ETP. Deseja iniciar um agora?")) {
                const novo = await API.etp.criar({ dfd_id: dfdId });
                if(novo) ETPController.render(dfdId, novo);
            }
        }
    },

    render: async (dfdId, etp) => {
        const app = document.getElementById('app-content');
        app.innerHTML = '<div class="text-center mt-5"><span class="spinner-ai"></span> Carregando Contexto...</div>';
        
        // Agora o 'dfd' traz a lista de itens graças à mudança no Schema!
        const dfd = await API.dfd.buscarPorId(dfdId);

        // --- MONTAR TABELA DE ITENS (Visualização) ---
        let linhasItens = "";
        if (dfd.itens && dfd.itens.length > 0) {
            linhasItens = dfd.itens.map(i => `
                <tr>
                    <td>${i.item_catalogo ? i.item_catalogo.nome : 'Item ' + i.item_catalogo_id}</td>
                    <td>${i.item_catalogo ? i.item_catalogo.unidade_medida : 'UN'}</td>
                    <td class="text-center">${i.quantidade}</td>
                </tr>
            `).join('');
        } else {
            linhasItens = '<tr><td colspan="3" class="text-center text-muted">Nenhum item vinculado a este DFD.</td></tr>';
        }

        const TEXTO_PADRAO_PCA = "Até o presente momento não havia sido publicado o Plano Anual de Contratações do município de Braúnas/MG.";
        const valorPCA = etp.previsao_pca || TEXTO_PADRAO_PCA;

        app.innerHTML = `
            <div class="container pb-5">
                <div class="d-flex justify-content-between mb-4">
                    <h2>📄 ETP - Proc. ${dfd.numero}</h2>
                    <button class="btn btn-outline-secondary" onclick="AppRouter.navegar('meus_processos')">Voltar</button>
                </div>

                <div class="alert alert-secondary">
                    <strong>Contexto:</strong> <span id="ctx-objeto">${dfd.objeto}</span>
                    <input type="hidden" id="etp_id" value="${etp.id}">
                </div>

                <form onsubmit="return false;">
                    
                    <div class="card mb-3 border-danger">
                        <div class="card-header bg-danger text-white">1. Descrição da Necessidade (IA)</div>
                        <div class="card-body">
                            <div class="ai-draft-box mb-2">
                                <input class="form-control mb-1" id="draft-nec" placeholder="Fatos novos...">
                                <button class="btn btn-sm btn-dark" onclick="ETPController.gerarNecessidadeIA()">✨ Gerar</button>
                                <span id="loading-nec" class="spinner-ai" style="display:none"></span>
                            </div>
                            <textarea class="form-control" id="necessidade" rows="4">${etp.descricao_necessidade || ''}</textarea>
                        </div>
                    </div>

                    <div class="card mb-3 border-secondary">
                        <div class="card-header bg-light">2. Previsão no PCA</div>
                        <div class="card-body">
                            <textarea class="form-control" id="previsao_pca" rows="2">${valorPCA}</textarea>
                        </div>
                    </div>

                    <div class="card mb-3 border-primary">
                        <div class="card-header bg-primary text-white">3. Descrição da Solução (IA)</div>
                        <div class="card-body">
                            <div class="ai-draft-box mb-2">
                                <input class="form-control mb-1" id="draft-sol" placeholder="Instruções...">
                                <button class="btn btn-sm btn-dark" onclick="ETPController.gerarSolucaoIA()">✨ Gerar</button>
                                <span id="loading-sol" class="spinner-ai" style="display:none"></span>
                            </div>
                            <textarea class="form-control" id="solucao" rows="4">${etp.descricao_solucao || ''}</textarea>
                        </div>
                    </div>

                    <div class="card mb-3 border-success">
                        <div class="card-header bg-success text-white">4. Requisitos Técnicos (IA)</div>
                        <div class="card-body">
                            <div class="ai-draft-box mb-2">
                                <input class="form-control mb-1" id="draft-req" placeholder="Exigências...">
                                <button class="btn btn-sm btn-dark" onclick="ETPController.gerarRequisitosIA()">✨ Gerar</button>
                                <span id="loading-req" class="spinner-ai" style="display:none"></span>
                            </div>
                            <textarea class="form-control" id="requisitos" rows="4">${etp.requisitos_tecnicos || ''}</textarea>
                        </div>
                    </div>

                    <div class="card mb-3 border-warning">
                        <div class="card-header bg-warning text-dark">5. Motivação (IA)</div>
                        <div class="card-body">
                            <div class="ai-draft-box mb-2">
                                <input class="form-control mb-1" id="draft-mot" placeholder="Motivo específico...">
                                <button class="btn btn-sm btn-dark" onclick="ETPController.gerarMotivacaoIA()">✨ Fundamentar</button>
                                <span id="loading-mot" class="spinner-ai" style="display:none"></span>
                            </div>
                            <textarea class="form-control" id="motivacao" rows="4">${etp.motivacao_contratacao || ''}</textarea>
                        </div>
                    </div>

                    <div class="card mb-3">
                        <div class="card-header">6. Estimativa de Quantidade</div>
                        <div class="card-body">
                            <p class="text-muted small">Os itens abaixo foram definidos no DFD (Revisão da Demanda).</p>
                            
                            <table class="table table-bordered table-sm mb-3">
                                <thead class="table-light">
                                    <tr>
                                        <th>Item</th>
                                        <th>Unid.</th>
                                        <th class="text-center">Qtd. DFD</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${linhasItens}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="card mb-3 border-dark">
                        <div class="card-header bg-dark text-white">
                            6. Levantamento de Mercado (Estratégia)
                        </div>
                        <div class="card-body">
                            <div class="ai-draft-box mb-2">
                                <input class="form-control mb-1" id="draft-mercado" placeholder="Onde pesquisou? (Ex: Banco de Preços, Cotação Direta)...">
                                <button class="btn btn-sm btn-light border" onclick="ETPController.gerarLevantamentoIA()">✨ Definir Estratégia (SRP)</button>
                                <span id="loading-mercado" class="spinner-ai" style="display:none"></span>
                            </div>
                            <textarea class="form-control" id="levantamento_mercado" rows="6">${etp.levantamento_mercado || ''}</textarea>
                        </div>
                    </div>

                    <div class="text-end"><button class="btn btn-success btn-lg" onclick="ETPController.salvar()">💾 Salvar ETP</button></div>
                </form>
            </div>
        `;
    },

    salvar: async () => {
        const id = document.getElementById('etp_id').value;
        const dados = {
            descricao_necessidade: document.getElementById('necessidade').value,
            previsao_pca: document.getElementById('previsao_pca').value,
            descricao_solucao: document.getElementById('solucao').value,
            requisitos_tecnicos: document.getElementById('requisitos').value,
            motivacao_contratacao: document.getElementById('motivacao').value,
            levantamento_mercado: document.getElementById('levantamento_mercado').value
        };
        const resp = await API.etp.atualizar(id, dados);
        if(resp) alert("✅ ETP Salvo!");
    },

    // --- IA Actions (Mantidas iguais) ---
    gerarNecessidadeIA: async () => {
        const obj = document.getElementById('ctx-objeto').innerText;
        // Pega justificativa do span escondido ou busca de novo, aqui simplificado:
        const jus = ""; // Ideal buscar do contexto se tiver na tela
        const draft = document.getElementById('draft-nec').value;
        document.getElementById('loading-nec').style.display = 'inline-block';
        const res = await API.ai.gerarETPNecessidade(obj, jus, draft, "");
        document.getElementById('loading-nec').style.display = 'none';
        if(res && res.result) document.getElementById('necessidade').value = res.result;
    },
    // ... (Mantenha as outras funções gerarSolucaoIA, gerarRequisitosIA, gerarMotivacaoIA) ...
    gerarSolucaoIA: async () => {
        const obj = document.getElementById('ctx-objeto').innerText;
        const draft = document.getElementById('draft-sol').value;
        document.getElementById('loading-sol').style.display = 'inline-block';
        const res = await API.ai.gerarETPSolucao(obj, "", draft); // Jus vazio
        document.getElementById('loading-sol').style.display = 'none';
        if(res && res.result) document.getElementById('solucao').value = res.result;
    },
    gerarRequisitosIA: async () => {
        const obj = document.getElementById('ctx-objeto').innerText;
        const sol = document.getElementById('solucao').value;
        const draft = document.getElementById('draft-req').value;
        document.getElementById('loading-req').style.display = 'inline-block';
        const res = await API.ai.gerarETPRequisitos(obj, sol, draft, "");
        document.getElementById('loading-req').style.display = 'none';
        if(res && res.result) document.getElementById('requisitos').value = res.result;
    },
    gerarMotivacaoIA: async () => {
        const obj = document.getElementById('ctx-objeto').innerText;
        const draft = document.getElementById('draft-mot').value;
        document.getElementById('loading-mot').style.display = 'inline-block';
        const res = await API.ai.gerarETPMotivacao(obj, draft, "");
        document.getElementById('loading-mot').style.display = 'none';
        if(res && res.result) document.getElementById('motivacao').value = res.result;
    },
    gerarLevantamentoIA: async () => {
        const obj = document.getElementById('ctx-objeto').innerText;
        const draft = document.getElementById('draft-mercado').value;
        
        document.getElementById('loading-mercado').style.display = 'inline-block';
        
        const res = await API.ai.gerarETPLevantamento(obj, draft, "");
        
        document.getElementById('loading-mercado').style.display = 'none';
        
        if (res && res.result) document.getElementById('levantamento_mercado').value = res.result;
    }
};