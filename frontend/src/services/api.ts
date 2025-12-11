import axios from 'axios';

// --- Interfaces ---

export interface ItemCatalogo {
    id: number;
    codigo?: string;
    nome: string;
    descricao?: string;
    unidade_medida: string;
    tipo: 'material' | 'servico';
    valor_referencia?: number;
}

export interface DFDItem {
    id?: number;
    catalogo_item_id: number;
    
    // CORREÇÃO: Renomeado de item_catalogo para catalogo_item
    catalogo_item?: ItemCatalogo; 
    
    quantidade: number;
    valor_unitario_estimado: number;
    
    // Campos auxiliares de front (opcionais)
    _nome?: string;
    _unidade?: string;
}

export interface DFDDotacao {
    id?: number;
    dotacao_id: number;
    dotacao?: GenericOption; // O objeto completo vindo do backend
    // Campos auxiliares locais
    _numero?: string;
    _nome?: string;
}

export interface DFD {
    id?: number;
    numero: string;
    numero_protocolo_string?: string;
    ano: number;
    data_req: string;
    
    unidade_requisitante_id: number; 
    responsavel_id: number;
    
    objeto: string;
    justificativa: string;
    
    itens?: DFDItem[];
    equipe?: any[];
    dotacoes?: DFDDotacao[];
    
    etp_id?: number;
    status?: string;
}

export interface ItemETP {
    id: number;
    catalogo_item_id: number;
    catalogo_item: ItemCatalogo; 
    quantidade_total: number;
    valor_unitario_referencia: number;
    valor_total_estimado: number;
}

export interface ETP {
    id?: number;
    dfd_id?: number; // Opcional agora
    
    itens?: ItemETP[]; 
    
    descricao_necessidade?: string;
    previsao_pca?: string;
    descricao_solucao?: string;
    requisitos_tecnicos?: string;
    motivacao_contratacao?: string;
    levantamento_mercado?: string;
    justificativa_escolha?: string;
    estimativa_custos?: string;
    justificativa_parcelamento?: string;
    demonstrativo_resultados?: string;
    providencias_previas?: string;
    impactos_ambientais?: string;
    viabilidade?: boolean;
    conclusao_viabilidade?: string;
}

export interface GenericOption {
    id: number;
    nome: string;
    sigla?: string;
    numero?: string;
    exercicio?: number;
    cargo?: string;
}

// --- Instância Axios ---
export const api = axios.create({
    baseURL: 'http://localhost:8000',
});

// --- Serviços ---

export const CadastrosService = {
    listarUnidades: async () => {
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
    },
    listarItens: async () => {
        const res = await api.get<ItemCatalogo[]>('/cadastros/itens/');
        return res.data;
    }
};

export const DfdService = {
    listar: async () => (await api.get<DFD[]>('/dfds/')).data,
    buscarPorId: async (id: string) => (await api.get<DFD>(`/dfds/${id}`)).data,
    criar: async (dados: DFD) => {
        const payload = { ...dados, itens: dados.itens || [], equipe: [], dotacoes: dados.dotacoes || [] };
        return (await api.post<DFD>('/dfds/', payload)).data;
    },
    atualizar: async (id: number, dados: Partial<DFD>) => (await api.put<DFD>(`/dfds/${id}`, dados)).data,
    atualizarPrecos: async (itens: { id: number; valor_unitario_estimado: number }[]) => 
        (await api.put('/dfds/itens/precos', itens)).data
};

export const EtpService = {
    buscarPorDfd: async (dfdId: number) => {
        try { return (await api.get<ETP>(`/etps/dfd/${dfdId}`)).data; } 
        catch (e) { return null; }
    },
    consolidar: async (dfdIds: number[]) => {
        const response = await api.post<ETP>('/etps/consolidar', { dfd_ids: dfdIds });
        return response.data;
    },
    criar: async (dados: { dfd_id: number }) => (await api.post<ETP>('/etps/', dados)).data,
    atualizar: async (id: number, dados: Partial<ETP>) => (await api.put<ETP>(`/etps/${id}`, dados)).data,
    atualizarPrecos: async (itens: { id: number; valor_unitario_referencia: number }[]) => 
        (await api.put('/etps/itens/precos', itens)).data,
};

export const AIService = {
    gerarObjeto: async (draft: string, instr: string) => 
        (await api.post('/ai/generate/dfd-object', { draft_text: draft, user_instructions: instr })).data.result,
    gerarJustificativa: async (obj: string, draft: string) => 
        (await api.post('/ai/generate/dfd-justification', { object_text: obj, draft_text: draft })).data.result,
    
    // ETP Methods
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

export const DashboardService = {
    getStats: async () => {
        const response = await api.get('/dfds/');
        return { total_processos: response.data.length, concluidos: 0, economia: 0 };
    }
};