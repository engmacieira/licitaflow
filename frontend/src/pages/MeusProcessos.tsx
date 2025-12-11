import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DfdService, type DFD } from '../services/api';
import { FolderOpen, Plus } from 'lucide-react';
import { ProcessoCard } from '../components/processos/ProcessoCard';

export function MeusProcessos() {
  const navigate = useNavigate();
  const [processos, setProcessos] = useState<DFD[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await DfdService.listar();
      setProcessos(data);
    } catch (error) {
      alert("Erro ao carregar processos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto pb-20">
      
      <div className="flex justify-between items-end mb-8 pt-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FolderOpen className="text-blue-600" /> Meus Processos
          </h2>
          <p className="text-gray-500 mt-1">Gerencie suas demandas e acompanhe o status.</p>
        </div>
        
        <button 
            onClick={() => navigate('/novo-dfd')} 
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-bold"
        >
            <Plus size={20} /> Nova Demanda
        </button>
      </div>

      {loading ? (
        <div className="p-10 text-center text-gray-400">Carregando...</div>
      ) : processos.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 text-lg">Nenhum processo encontrado.</p>
            <button onClick={() => navigate('/novo-dfd')} className="mt-4 text-blue-600 font-bold hover:underline">
                Criar o primeiro agora
            </button>
        </div>
      ) : (
        // Grid Responsivo
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {processos.map(dfd => (
                <ProcessoCard 
                    key={dfd.id} 
                    dfd={dfd} 
                    onDelete={loadData} // <--- Passando a função de recarregar
                />
            ))}
        </div>
      )}
    </div>
  );
}