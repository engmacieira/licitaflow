import axios from 'axios';

// --- Interfaces ---
export interface DFD {
    id?: number;
    numero: string;
    ano: number;
    data_req: string;
    secretaria_id: number;
    responsavel_id: number;
    objeto: string;
    justificativa: string;
    // Arrays opcionais para passar na validação do backend
    itens?: any[];
    equipe?: any[];
    dotacoes?: any[];
}

export interface ETP {
    id?: number;
    dfd_id: number;
    descricao_necessidade?: string;
    previsao_pca?: string;
    descricao_solucao?: string;
    requisitos_tecnicos?: string;
    motivacao_contratacao?: string;
    levantamento_mercado?: string;
    justificativa_escolha?: string;
    estimativa_custos?: string;
    justificativa_parcelamento?: string; // <--- O erro sumirá com isso
    demonstrativo_resultados?: string;
    providencias_previas?: string;
    impactos_ambientais?: string;
    viabilidade?: boolean;
}

export interface GenericOption {
    id: number;
    nome: string;
    numero?: string; // Para dotação
}

// --- Instância Axios ---
export const api = axios.create({
    baseURL: 'http://localhost:8000',
});

// --- Serviços de Cadastros (Selects) ---
export const CadastrosService = {
    listarSecretarias: async () => {
        const res = await api.get<GenericOption[]>('/cadastros/secretarias/');
        return res.data;
    },
    listarAgentes: async () => {
        const res = await api.get<GenericOption[]>('/cadastros/agentes/');
        return res.data;
    },
    listarDotacoes: async () => {
        const res = await api.get<GenericOption[]>('/cadastros/dotacoes/');
        return res.data;
    }
};

// --- Serviços de DFD (CRUD) ---
export const DfdService = {
    listar: async () => {
        const response = await api.get<DFD[]>('/dfds/');
        return response.data;
    },
    buscarPorId: async (id: string) => {
        const response = await api.get<DFD>(`/dfds/${id}`);
        return response.data;
    },
    criar: async (dados: DFD) => {
        // Envia arrays vazios para satisfazer o schema do Pydantic se necessário
        const payload = { ...dados, itens: [], equipe: [], dotacoes: [] };
        const response = await api.post<DFD>('/dfds/', payload);
        return response.data;
    },
    atualizar: async (id: number, dados: Partial<DFD>) => {
        const response = await api.put<DFD>(`/dfds/${id}`, dados);
        return response.data;
    },
    // Atualiza apenas os preços (Batch Update)
    atualizarPrecos: async (itens: { id: number; valor_unitario_estimado: number }[]) => {
        return (await api.put('/dfds/itens/precos', itens)).data;
    }
};

// --- Serviços de ETP (CRUD) ---
export const EtpService = {
    buscarPorDfd: async (dfdId: number) => {
        try {
            return (await api.get<ETP>(`/etps/dfd/${dfdId}`)).data;
        } catch (e) {
            return null; // Retorna null se 404
        }
    },
    criar: async (dados: { dfd_id: number }) => (await api.post<ETP>('/etps/', dados)).data,
    atualizar: async (id: number, dados: Partial<ETP>) => (await api.put<ETP>(`/etps/${id}`, dados)).data,
};

// --- Serviço de Dashboard ---
export const DashboardService = {
    getStats: async () => {
        const response = await api.get('/dfds/');
        const dfds = response.data;
        // Mock de economia e concluídos por enquanto
        return {
            total_processos: dfds.length,
            concluidos: 0,
            economia: 0
        };
    }
};

// --- Serviço de IA (Gemini) ---
export const AIService = {
    // DFD
    gerarObjeto: async (draft: string, instructions: string) => {
        const res = await api.post('/ai/generate/dfd-object', {
            draft_text: draft,
            user_instructions: instructions
        });
        return res.data.result;
    },
    gerarJustificativa: async (objeto: string, draft: string) => {
        const res = await api.post('/ai/generate/dfd-justification', {
            object_text: objeto,
            draft_text: draft
        });
        return res.data.result;
    },

    // ETP
    gerarNecessidade: async (obj: string, jus: string, draft: string) => 
        (await api.post('/ai/generate/etp-need', { dfd_object: obj, dfd_justification: jus, draft_text: draft })).data.result,

    gerarSolucao: async (obj: string, req: string, draft: string) => 
        (await api.post('/ai/generate/etp-solution-description', { dfd_object: obj, requirements_text: req, draft_text: draft })).data.result,

    gerarRequisitos: async (obj: string, sol: string, draft: string) => 
        (await api.post('/ai/generate/etp-requirements', { dfd_object: obj, solution_description: sol, draft_text: draft })).data.result,

    gerarMotivacao: async (obj: string, draft: string) => 
        (await api.post('/ai/generate/etp-motivation', { dfd_object: obj, draft_text: draft })).data.result,

    gerarLevantamento: async (obj: string, draft: string) => 
        (await api.post('/ai/generate/etp-market-analysis', { dfd_object: obj, draft_text: draft })).data.result,

    gerarEscolha: async (obj: string, merc: string, draft: string) => 
        (await api.post('/ai/generate/etp-choice-justification', { dfd_object: obj, market_analysis_context: merc, draft_text: draft })).data.result,

    gerarParcelamento: async (obj: string, draft: string, instr: string) => 
        (await api.post('/ai/generate/etp-parceling-justification', { dfd_object: obj, draft_text: draft, user_instructions: instr })).data.result,

    gerarResultados: async (obj: string, draft: string, instr: string) => 
        (await api.post('/ai/generate/etp-results', { dfd_object: obj, draft_text: draft, user_instructions: instr })).data.result,

    gerarProvidencias: async (obj: string, draft: string, instr: string) => 
        (await api.post('/ai/generate/etp-prior-measures', { dfd_object: obj, draft_text: draft, user_instructions: instr })).data.result,

    gerarImpactos: async (obj: string, draft: string, instr: string) => 
        (await api.post('/ai/generate/etp-environmental-impacts', { dfd_object: obj, draft_text: draft, user_instructions: instr })).data.result,

    gerarViabilidade: async (obj: string, draft: string, instr: string) => 
        (await api.post('/ai/generate/etp-viability', { dfd_object: obj, draft_text: draft, user_instructions: instr })).data.result,
};