import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DfdService, EtpService, type DFD } from '../services/api';
import { Layers, ArrowRight, Filter, RefreshCcw } from 'lucide-react';
import { DfdSelectableCard } from '../components/planejamento/DfdSelectableCard'; // <--- Import novo

export function Planejamento() {
  const navigate = useNavigate();
  const [dfds, setDfds] = useState<DFD[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => { carregarDfds(); }, []);

  async function carregarDfds() {
    setLoading(true);
    try {
      const todos = await DfdService.listar();
      setDfds(todos.filter(d => !d.etp_id));
    } catch { alert("Erro ao carregar."); } 
    finally { setLoading(false); }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleConsolidar = async () => {
    if (!selectedIds.length) return;
    setProcessing(true);
    try {
      const novoEtp = await EtpService.consolidar(selectedIds);
      navigate(`/etp/${selectedIds[0]}`); // Redireciona via um dos DFDs
    } catch (e) { alert("Erro ao consolidar."); } 
    finally { setProcessing(false); }
  };

  return (
    // MUDANÇA 1: Removido 'max-w-6xl mx-auto'. Agora é 'w-full'.
    <div className="w-full pb-20">
      
      <div className="flex justify-between items-end mb-8 pt-2">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Layers className="text-blue-600" /> Painel de Consolidação
          </h2>
          <p className="text-gray-500 mt-1">Selecione demandas para agrupar em um Planejamento (ETP).</p>
        </div>
        <button onClick={handleConsolidar} disabled={!selectedIds.length || processing} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all">
            {processing ? 'Processando...' : 'Gerar ETP Unificado'} <ArrowRight size={20} />
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-4 items-center">
        <Filter size={18} className="text-gray-400" />
        <span className="text-sm font-medium text-gray-600">Filtrar:</span>
        <select className="bg-gray-50 border-none rounded px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-100"><option>Todas as Unidades</option></select>
        <div className="flex-1"></div>
        <button onClick={carregarDfds} className="p-2 hover:bg-gray-100 rounded-full text-gray-500" title="Atualizar"><RefreshCcw size={16}/></button>
      </div>

      {/* MUDANÇA 2: Grid responsivo que aproveita a largura. 
          1 coluna (mobile) -> 2 colunas (tablet) -> 3 colunas (desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? <p className="text-center text-gray-400 py-10 col-span-full">Carregando...</p> : 
         dfds.length === 0 ? <p className="text-center text-gray-400 py-10 bg-gray-50 rounded-lg border border-dashed col-span-full">Nenhuma demanda pendente.</p> :
         dfds.map(dfd => (
            <DfdSelectableCard 
                key={dfd.id} 
                dfd={dfd} 
                isSelected={selectedIds.includes(dfd.id!)} 
                onToggle={toggleSelect} 
            />
         ))
        }
      </div>
    </div>
  );
}