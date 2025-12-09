import axios from 'axios';

// --- 1. Exportando a Interface DFD (Obrigatório para o erro sumir) ---
export interface DFD {
    id: number;
    numero: string;
    objeto?: string;
    // Adicione outros campos se necessário, ex: secretaria_id, etc.
}

// --- 2. Instância do Axios ---
export const api = axios.create({
    baseURL: 'http://localhost:8000',
});

// --- 3. Serviço de DFDs ---
export const DfdService = {
    listar: async () => {
        // O <DFD[]> aqui diz para o TypeScript: "O que volta é uma lista de DFDs"
        const response = await api.get<DFD[]>('/dfds/');
        return response.data;
    }
};

// --- 4. Serviço de Dashboard ---
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