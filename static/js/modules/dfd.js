const DFDController = {
    // --- LISTAGEM ---
    renderList: async () => {
        const app = document.getElementById('app-content');
        app.innerHTML = '<div class="text-center mt-5"><span class="spinner-ai"></span> Carregando...</div>';
        
        const dfds = await API.dfd.listar();

        if (!dfds || dfds.length === 0) {
            app.innerHTML = `
                <div class="container text-center mt-5">
                    <h3>Nenhum processo encontrado 😢</h3>
                    <button onclick="AppRouter.navegar('novo_dfd')" class="btn btn-primary">Criar Novo</button>
                </div>`;
            return;
        }

        let linhas = dfds.map(d => `
            <tr>
                <td>${d.numero}</td>
                <td>${d.objeto ? d.objeto.substring(0, 40) + '...' : '<em>Sem objeto</em>'}</td>
                <td>
                    <button class="btn btn-sm btn-info text-white" onclick="AppRouter.navegar('editar_dfd', ${d.id})">✏️ DFD</button>
                    <button class="btn btn-sm btn-warning text-dark" onclick="AppRouter.navegar('etp', ${d.id})">📄 ETP</button>
                </td>
            </tr>`).join('');

        app.innerHTML = `
            <div class="container">
                <h2>📁 Meus Processos</h2>
                <table class="table table-hover mt-3">
                    <thead class="table-dark"><tr><th>Número</th><th>Objeto</th><th>Ações</th></tr></thead>
                    <tbody>${linhas}</tbody>
                </table>
            </div>`;
    },

    // --- FORMULÁRIO (CREATE/EDIT) ---
    renderForm: async (idEdicao = null) => {
        const app = document.getElementById('app-content');
        const titulo = idEdicao ? "Editando DFD" : "Novo DFD";
        const btnAcao = idEdicao ? `DFDController.salvar(${idEdicao})` : `DFDController.salvar()`;
        
        // Renderiza HTML
        app.innerHTML = DFDController.getHtmlForm(titulo, btnAcao);
        
        // Carrega Selects
        await DFDController.carregarSelects();

        // Se for Edição, preenche dados
        if (idEdicao) {
            const dfd = await API.dfd.buscarPorId(idEdicao);
            if(dfd) {
                document.getElementById('numero').value = dfd.numero;
                document.getElementById('ano').value = dfd.ano;
                document.getElementById('data_req').value = dfd.data_req;
                document.getElementById('secretaria_id').value = dfd.secretaria_id;
                document.getElementById('responsavel_id').value = dfd.responsavel_id;
                document.getElementById('objeto').value = dfd.objeto || "";
                document.getElementById('justificativa').value = dfd.justificativa || "";
            }
        }
    },

    salvar: async (id = null) => {
        const dados = {
            numero: document.getElementById('numero').value,
            ano: document.getElementById('ano').value,
            data_req: document.getElementById('data_req').value,
            secretaria_id: document.getElementById('secretaria_id').value,
            responsavel_id: document.getElementById('responsavel_id').value,
            objeto: document.getElementById('objeto').value,
            justificativa: document.getElementById('justificativa').value,
            // Mock de listas obrigatórias
            itens: [{item_catalogo_id: 1, quantidade: 1, valor_unitario_estimado: 10}], equipe: [], dotacoes: [{dotacao_id: 1}]
        };

        let resp;
        if(id) resp = await API.dfd.atualizar(id, dados);
        else resp = await API.dfd.criar(dados);

        if(resp && resp.id) {
            alert("✅ Salvo com sucesso!");
            AppRouter.navegar('meus_processos');
        }
    },

    // --- IA METHODS ---
    gerarObjetoIA: async () => {
        const draft = document.getElementById('draft-objeto').value;
        const instr = document.getElementById('instrucoes-objeto').value;
        document.getElementById('loading-objeto').style.display = 'inline-block';
        const res = await API.ai.gerarObjeto(draft, instr);
        document.getElementById('loading-objeto').style.display = 'none';
        if(res && res.result) document.getElementById('objeto').value = res.result;
    },

    gerarJustificativaIA: async () => {
        const obj = document.getElementById('objeto').value;
        const draft = document.getElementById('draft-justificativa').value;
        document.getElementById('loading-jus').style.display = 'inline-block';
        const res = await API.ai.gerarJustificativa(obj, draft, "");
        document.getElementById('loading-jus').style.display = 'none';
        if(res && res.result) document.getElementById('justificativa').value = res.result;
    },

    // --- HELPERS ---
    carregarSelects: async () => {
        const [secretarias, agentes] = await Promise.all([API.cadastros.listarSecretarias(), API.cadastros.listarAgentes()]);
        const fill = (id, list) => {
            const el = document.getElementById(id);
            el.innerHTML = '<option disabled selected>Selecione...</option>';
            list.forEach(i => el.innerHTML += `<option value="${i.id}">${i.nome}</option>`);
        };
        fill('secretaria_id', secretarias);
        fill('responsavel_id', agentes);
    },

    // ... dentro de static/js/modules/dfd.js ...

    getHtmlForm: (titulo, onclickFn) => {
        return `
            <div class="container pb-5">
                <div class="d-flex justify-content-between mb-4">
                    <h2>📝 ${titulo}</h2>
                    <button class="btn btn-outline-secondary" onclick="AppRouter.navegar('meus_processos')">Voltar</button>
                </div>
                <form onsubmit="return false;">
                    <div class="card mb-3"><div class="card-body row g-3">
                        <div class="col-4"><label>Número</label><input class="form-control" id="numero"></div>
                        <div class="col-4"><label>Ano</label><input class="form-control" id="ano" value="2024"></div>
                        <div class="col-4"><label>Data</label><input type="date" class="form-control" id="data_req"></div>
                        <div class="col-6"><label>Secretaria</label><select class="form-select" id="secretaria_id"></select></div>
                        <div class="col-6"><label>Responsável</label><select class="form-select" id="responsavel_id"></select></div>
                    </div></div>
                    
                    <div class="card mb-3 border-primary"><div class="card-body">
                        <h5>Objeto (IA)</h5>
                        <div class="ai-draft-box mb-2">
                            <input class="form-control mb-1" id="draft-objeto" placeholder="Rascunho...">
                            <input class="form-control mb-1" id="instrucoes-objeto" placeholder="Instruções...">
                            <button class="btn btn-sm btn-dark" onclick="DFDController.gerarObjetoIA()">✨ Gerar</button>
                            <span id="loading-objeto" class="spinner-ai" style="display:none"></span>
                        </div>
                        <textarea class="form-control" id="objeto" rows="3"></textarea>
                    </div></div>

                    <div class="card mb-3 border-info"><div class="card-body">
                        <h5>Justificativa (IA)</h5>
                        <div class="ai-draft-box mb-2">
                            <input class="form-control mb-1" id="draft-justificativa" placeholder="Rascunho...">
                            <button class="btn btn-sm btn-dark" onclick="DFDController.gerarJustificativaIA()">✨ Gerar</button>
                            <span id="loading-jus" class="spinner-ai" style="display:none"></span>
                        </div>
                        <textarea class="form-control" id="justificativa" rows="4"></textarea>
                    </div></div>

                    <div class="text-end"><button class="btn btn-success btn-lg" onclick="${onclickFn}">💾 Salvar</button></div>
                </form>
            </div>
        `;
    }
};