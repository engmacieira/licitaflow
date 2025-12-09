/**
 * Módulo central de comunicação com a API.
 * Aqui centralizamos todas as chamadas fetch.
 */
const API_BASE_URL = ""; // Vazio porque estamos no mesmo dominio

const API = {
    // --- MÉTODOS GENÉRICOS ---
    async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            if (!response.ok) throw new Error(`Erro GET ${endpoint}`);
            return await response.json();
        } catch (error) {
            console.error(error);
            alert("Erro ao buscar dados. Veja o console.");
            return null;
        }
    },

    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || "Erro na requisição");
            }
            return await response.json();
        } catch (error) {
            console.error(error);
            alert(`Erro: ${error.message}`);
            return null;
        }
    },
    
    // --- CADASTROS ---
    cadastros: {
        listarSecretarias: () => API.get("/cadastros/secretarias/"),
        listarAgentes: () => API.get("/cadastros/agentes/"),
        listarItens: () => API.get("/cadastros/itens/"),
        listarDotacoes: () => API.get("/cadastros/dotacoes/")
    },

    // --- DFDs ---
    dfd: {
        listar: () => API.get("/dfds/"),
        criar: (dados) => API.post("/dfds/", dados),
        buscarPorId: (id) => API.get(`/dfds/${id}`),
        atualizar: (id, dados) => {
            // Implementação manual do PUT pois não fiz no genérico acima
            return fetch(`${API_BASE_URL}/dfds/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados)
            }).then(res => res.json());
        },
        atualizarPrecosItens: (listaItens) => {
             return fetch(`${API_BASE_URL}/dfds/itens/precos`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(listaItens)
            }).then(res => res.json());
        }
    },
    // --- ETPs ---
    etp: {
        buscarPorDfd: (dfdId) => API.get(`/etps/dfd/${dfdId}`),
        criar: (dados) => API.post("/etps/", dados),
        atualizar: (id, dados) => {
            return fetch(`${API_BASE_URL}/etps/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados)
            }).then(res => res.json());
        }
    },

    // --- IA (GEMINI) ---
    ai: {
        gerarObjeto: (draft, instructions) => API.post("/ai/generate/dfd-object", {
            draft_text: draft,
            user_instructions: instructions
        }),
        gerarJustificativa: (objText, draft, instructions) => API.post("/ai/generate/dfd-justification", {
            object_text: objText,
            draft_text: draft,
            user_instructions: instructions
        }),
        gerarETPNecessidade: (obj, jus, draft, instr) => API.post("/ai/generate/etp-need", {
            dfd_object: obj,
            dfd_justification: jus,
            draft_text: draft,
            user_instructions: instr
        }),
        gerarETPRequisitos: (obj, solucao, draft, instr) => API.post("/ai/generate/etp-requirements", {
            dfd_object: obj,
            solution_description: solucao, // Enviamos, mas o backend pode ignorar se quiser
            draft_text: draft,             // <--- O Rascunho entra aqui
            user_instructions: instr
        }),
        gerarETPMotivacao: (obj, draft, instr) => API.post("/ai/generate/etp-motivation", {
            dfd_object: obj,
            draft_text: draft,
            user_instructions: instr
        }),
        gerarETPLevantamento: (obj, draft, instr) => API.post("/ai/generate/etp-market-analysis", {
            dfd_object: obj,
            draft_text: draft,
            user_instructions: instr
        }),
        gerarETPJustificativaEscolha: (obj, mercadoCtx, draft, instr) => API.post("/ai/generate/etp-choice-justification", {
            dfd_object: obj,
            market_analysis_context: mercadoCtx,
            draft_text: draft,
            user_instructions: instr
        }),
        gerarETPSolucaoDescricao: (obj, req, draft, instr) => API.post("/ai/generate/etp-solution-description", {
            dfd_object: obj,
            requirements_text: req,
            draft_text: draft,
            user_instructions: instr
        })
    }
};

// Exporta para ser usado em outros arquivos (se estiver usando modules)
// Ou simplesmente deixa global carregando antes no HTML.
window.API = API;