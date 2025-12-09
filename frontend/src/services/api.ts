import axios from 'axios';

// --- Interfaces ---
export interface DFD {
    id?: number; // Opcional na criação
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

export interface GenericOption {
    id: number;
    nome: string;
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
    }
};

// --- Serviço de IA (Gemini) ---
export const AIService = {
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
    }
};

// --- Serviço de Dashboard ---
export const DashboardService = {
    getStats: async () => {
        const response = await api.get('/dfds/');
        const dfds = response.data;
        return {
            total_processos: dfds.length,
            concluidos: 0,
            economia: 0
        };
    }
};