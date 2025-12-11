import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ProcessoCard } from '../components/processos/ProcessoCard';
import { EmptyState } from '../components/ui/EmptyState';
import { FolderOpen, Plus, Loader2 } from 'lucide-react'; // RefreshCw removido
import { useToast } from '../contexts/ToastContext';

interface Dfd {
  id: number;
  tipo_solicitacao: string;
  objeto: string;
  unidade_requisitante: string;
  status: string;
  created_at: string;
}

export default function MeusProcessos() {
  const [dfds, setDfds] = useState<Dfd[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();

  async function loadDfds() {
    setLoading(true);
    try {
      const response = await api.get('/dfds/'); 
      setDfds(response.data);
    } catch (error) {
      addToast('Não foi possível carregar seus processos.', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDfds();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Meus Processos</h1>
          <p className="text-gray-500 mt-1">
            Gerencie e acompanhe seus Documentos de Formalização de Demanda.
          </p>
        </div>

        <button 
          onClick={() => navigate('/novo-dfd')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} />
          Novo DFD
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <p className="text-gray-400 font-medium animate-pulse">Buscando processos...</p>
        </div>
      ) : dfds.length === 0 ? (
        <EmptyState 
          title="Sua mesa está limpa!"
          description="Você ainda não possui nenhum Documento de Formalização de Demanda (DFD) cadastrado. Que tal iniciar um novo planejamento?"
          icon={FolderOpen}
          action={
            <button 
              onClick={() => navigate('/novo-dfd')}
              className="mt-2 text-blue-600 font-bold hover:text-blue-800 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
            >
              Começar Novo Processo &rarr;
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dfds.map((dfd) => (
            <ProcessoCard key={dfd.id} data={dfd} />
          ))}
        </div>
      )}
    </div>
  );
}