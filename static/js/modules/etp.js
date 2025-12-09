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
        
        const [dfd, secretarias, dotacoes] = await Promise.all([
            API.dfd.buscarPorId(dfdId),
            API.cadastros.listarSecretarias(),
            API.cadastros.listarDotacoes()
        ]);

        const getSecNome = (id) => secretarias.find(s => s.id === id)?.nome || "Secretaria Solicitante";
        
        const getDotacaoTexto = () => {
            if(!dfd.dotacoes || dfd.dotacoes.length === 0) return "(Definir dotação)";
            return dfd.dotacoes.map(d => {
                const dotReal = dotacoes.find(x => x.id === d.dotacao_id);
                return dotReal ? `${dotReal.numero} (${dotReal.nome})` : d.dotacao_id;
            }).join(', ');
        };

        let linhasTabela = "";
        if (dfd.itens && dfd.itens.length > 0) {
            linhasTabela = dfd.itens.map((item, index) => `
                <tr>
                    <td>${item.item_catalogo ? item.item_catalogo.nome : 'Item ' + item.item_catalogo_id}</td>
                    <td class="text-center">${item.item_catalogo ? item.item_catalogo.unidade_medida : 'UN'}</td>
                    <td class="text-center">
                        <input type="number" class="form-control form-control-sm text-center qtd-item" 
                               data-index="${index}" value="${item.quantidade}" readonly>
                    </td>
                    <td>
                        <div class="input-group input-group-sm">
                            <span class="input-group-text">R$</span>
                            <input type="number" class="form-control valor-item" 
                                   data-id="${item.id}" data-index="${index}" 
                                   value="${item.valor_unitario_estimado}" 
                                   onchange="ETPController.recalcularTotal()" step="0.01">
                        </div>
                    </td>
                    <td class="text-end fw-bold">
                        R$ <span id="total-linha-${index}">0,00</span>
                    </td>
                </tr>
            `).join('');
        } else {
            linhasTabela = '<tr><td colspan="5" class="text-center text-muted">Nenhum item cadastrado no DFD.</td></tr>';
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

                    <div class="card mb-3 border-secondary">
                        <div class="card-header bg-secondary text-white">
                            7. Justificativa da Escolha da Solução (IA)
                        </div>
                        <div class="card-body">
                            <div class="ai-draft-box mb-2">
                                <input class="form-control mb-1" id="draft-escolha" placeholder="Motivo específico (ex: maior competitividade)...">
                                <button class="btn btn-sm btn-dark" onclick="ETPController.gerarJustificativaEscolhaIA()">✨ Defender SRP (Pregão)</button>
                                <span id="loading-escolha" class="spinner-ai" style="display:none"></span>
                            </div>
                            <textarea class="form-control" id="justificativa_escolha" rows="5">${etp.justificativa_escolha || ''}</textarea>
                        </div>
                    </div>

                    <div class="card mb-3 border-secondary">
                        <div class="card-header bg-secondary text-white">
                            8. Descrição da Solução Como um Todo (Ciclo de Vida - IA)
                        </div>
                        <div class="card-body">
                            <div class="ai-draft-box mb-2">
                                <label>Logística e Ciclo de Vida (Rascunho)</label>
                                <input class="form-control mb-1" id="draft-solucao-ciclo" placeholder="Ex: entrega parcelada na sede, descarte ecológico...">
                                <button class="btn btn-sm btn-light border" onclick="ETPController.gerarSolucaoCicloVidaIA()">✨ Definir Ciclo de Vida</button>
                                <span id="loading-sol-ciclo" class="spinner-ai" style="display:none"></span>
                            </div>
                            <textarea class="form-control" id="descricao_solucao" rows="6">${etp.descricao_solucao || ''}</textarea>
                        </div>
                    </div>

                    <div class="card mb-3 border-dark">
                        <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                            <span>9. Estimativa de Custos e Dotação</span>
                            <button class="btn btn-sm btn-light text-dark" onclick="ETPController.gerarTextoEstimativa()">
                                🔄 Gerar Texto com Base na Tabela
                            </button>
                        </div>
                        <div class="card-body">
                            
                            <h6 class="text-muted">Memória de Cálculo</h6>
                            <div class="table-responsive mb-3">
                                <table class="table table-bordered table-sm align-middle">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Descrição</th>
                                            <th width="80">Und.</th>
                                            <th width="100">Qtd.</th>
                                            <th width="150">Valor Unit.</th>
                                            <th width="150" class="text-end">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${linhasTabela}
                                    </tbody>
                                    <tfoot class="table-light">
                                        <tr>
                                            <td colspan="4" class="text-end fw-bold">VALOR TOTAL ESTIMADO:</td>
                                            <td class="text-end fw-bold text-success" id="grand-total" data-value="0">R$ 0,00</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            <small class="text-muted">⚠️ Ao salvar o ETP, os preços unitários acima serão atualizados no DFD automaticamente.</small>

                            <hr>

                            <label class="fw-bold mt-2">Texto da Estimativa (Jurídico)</label>
                            <textarea class="form-control" id="estimativa_custos" rows="8">${etp.estimativa_custos || ''}</textarea>
                        </div>
                    </div>

                    <div class="text-end"><button class="btn btn-success btn-lg" onclick="ETPController.salvar()">💾 Salvar ETP</button></div>
                </form>
            </div>
        `;
        ETPController.recalcularTotal();
    },

    salvar: async () => {
        const id = document.getElementById('etp_id').value;
        const dados = {
            descricao_necessidade: document.getElementById('necessidade').value,
            previsao_pca: document.getElementById('previsao_pca').value,
            descricao_solucao: document.getElementById('solucao').value,
            requisitos_tecnicos: document.getElementById('requisitos').value,
            motivacao_contratacao: document.getElementById('motivacao').value,
            levantamento_mercado: document.getElementById('levantamento_mercado').value,
            justificativa_escolha: document.getElementById('justificativa_escolha').value,
            descricao_solucao_ciclo_vida: document.getElementById('descricao_solucao').value,
            estimativa_custos: document.getElementById('estimativa_custos').value

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
    },
    gerarJustificativaEscolhaIA: async () => {
        const obj = document.getElementById('ctx-objeto').innerText;
        // Pegamos o texto gerado no passo anterior para dar contexto
        const mercadoCtx = document.getElementById('levantamento_mercado').value;
        const draft = document.getElementById('draft-escolha').value;
        
        document.getElementById('loading-escolha').style.display = 'inline-block';
        
        const res = await API.ai.gerarETPJustificativaEscolha(obj, mercadoCtx, draft, "");
        
        document.getElementById('loading-escolha').style.display = 'none';
        
        if (res && res.result) document.getElementById('justificativa_escolha').value = res.result;
    },
    gerarSolucaoCicloVidaIA: async () => {
        const obj = document.getElementById('ctx-objeto').innerText;
        // Pega os requisitos (Card 4) para garantir que a solução técnica bata com a especificação
        const req = document.getElementById('requisitos').value; 
        const draft = document.getElementById('draft-solucao-ciclo').value;

        // Validação simples
        if(!req) alert("Recomendação: Gere os Requisitos Técnicos (Item 4) antes para dar mais contexto à IA.");

        document.getElementById('loading-sol-ciclo').style.display = 'inline-block';
        
        // Chama a rota específica do Ciclo de Vida
        const res = await API.ai.gerarETPSolucaoDescricao(obj, req, draft, "");
        
        document.getElementById('loading-sol-ciclo').style.display = 'none';
        
        if(res && res.result) document.getElementById('descricao_solucao').value = res.result;
    },
    recalcularTotal: () => {
        let grandTotal = 0;
        const inputsValor = document.querySelectorAll('.valor-item');
        
        inputsValor.forEach(input => {
            const index = input.dataset.index;
            // Pega quantidade e valor (converte para float, ou 0 se vazio)
            const qtd = parseFloat(document.querySelector(`.qtd-item[data-index="${index}"]`).value) || 0;
            const valor = parseFloat(input.value) || 0;
            
            const totalLinha = qtd * valor;
            grandTotal += totalLinha;
            
            // Atualiza visualmente a linha (formatação R$)
            document.getElementById(`total-linha-${index}`).innerText = totalLinha.toLocaleString('pt-BR', {minimumFractionDigits: 2});
        });

        // Atualiza Total Geral
        const elTotal = document.getElementById('grand-total');
        elTotal.innerText = grandTotal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
        elTotal.dataset.value = grandTotal; // Guarda valor numérico para contas
    },

    gerarTextoEstimativa: () => {
        // Pega valores
        const total = parseFloat(document.getElementById('grand-total').dataset.value) || 0;
        const totalFormatado = total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
        const secretaria = document.getElementById('secretaria_nome').value;
        const dotacao = document.getElementById('dotacao_texto').value;

        // Monta Tabela em Texto (Para ficar bonito no documento final)
        let tabelaTexto = "";
        document.querySelectorAll('.valor-item').forEach(input => {
            const row = input.closest('tr');
            const nome = row.cells[0].innerText;
            const und = row.cells[1].innerText;
            const qtd = row.cells[2].querySelector('input').value;
            const val = parseFloat(input.value).toLocaleString('pt-BR', {minimumFractionDigits: 2});
            const tot = row.cells[4].innerText.replace("R$ ", ""); // Pega texto visual
            
            tabelaTexto += `- ${nome} (${und}): ${qtd} x R$ ${val} = R$ ${tot}\n`;
        });

        // Template Braúnas
        const texto = `O preço estimado da contratação foi definido através da média obtida entre as pesquisas de preços em anexo, mediante a utilização dos parâmetros indicados no inciso I e II do Art. 23º da Lei Federal n° 14.133 de 2021.

O valor total estimado para a contratação é de ${totalFormatado}, conforme detalhamento abaixo:

${tabelaTexto}

A despesa decorrente desta contratação correrá à conta das dotações orçamentárias vigentes, especificamente nas fichas indicadas pela ${secretaria}: ${dotacao}, ou outras que vierem a substituí-las, respeitando a disponibilidade financeira do exercício.`;

        document.getElementById('estimativa_custos').value = texto;
    },
};