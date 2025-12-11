import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DfdService, EtpService, type DFD } from '../services/api';
import { Layers, RefreshCcw, Loader2, Search, PackageOpen } from 'lucide-react'; // Removidos ArrowRight e Filter

// Componentes Pixel UI
import { DfdSelectableCard } from '../components/planejamento/DfdSelectableCard';
import { EmptyState } from '../components/ui/EmptyState';
import { StickyFooter } from '../components/ui/StickyFooter';
import { useToast } from '../contexts/ToastContext';

export function Planejamento() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  // Estados de Dados
  const [dfds, setDfds] = useState<DFD[]>([]);
  const [filteredDfds, setFilteredDfds] = useState<DFD[]>([]);
  
  // Estados de Controle
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    carregarDfds();
  }, []);

  // Filtro local em tempo real
  useEffect(() => {
    if (!searchTerm.trim()) {
        setFilteredDfds(dfds);
    } else {
        const lower = searchTerm.toLowerCase();
        setFilteredDfds(dfds.filter(d => 
            d.objeto.toLowerCase().includes(lower) || 
            d.unidade_requisitante_id.toString().includes(lower) || 
            d.numero.toString().includes(lower)
        ));
    }
  }, [searchTerm, dfds]);

  async function carregarDfds() {
    setLoading(true);
    try {
      const todos = await DfdService.listar();
      // Filtra apenas os que ainda NÃO viraram ETP (pendentes)
      const pendentes = todos.filter(d => !d.etp_id);
      setDfds(pendentes);
      setFilteredDfds(pendentes);
      setSelectedIds([]); // Limpa seleção ao recarregar
    } catch (error) {
      console.error(error);
      addToast("Erro ao carregar demandas pendentes.", "error");
    } finally {
      setLoading(false);
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleConsolidar = async () => {
    if (!selectedIds.length) return;
    
    setProcessing(true);
    try {
      // Chama o serviço que cria o ETP e vincula os DFDs selecionados
      const novoEtp = await EtpService.consolidar(selectedIds);
      
      addToast("ETP criado com sucesso! Redirecionando...", "success");
      
      // Pequeno delay para o usuário ver o toast antes de navegar
      setTimeout(() => {
          navigate(`/etp/${novoEtp.id || novoEtp}`); 
      }, 1000);

    } catch (error) {
      console.error(error);
      addToast("Falha ao consolidar demandas. Tente novamente.", "error");
      setProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto pb-32 px-6 transition-all duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 pt-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Layers className="text-indigo-600" /> Planejamento de Compras
          </h2>
          <p className="text-gray-500 mt-1">
            Selecione um ou mais Documentos de Formalização (DFD) para iniciar um Estudo Técnico Preliminar.
          </p>
        </div>
        
        {/* Barra de Filtros */}
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm w-full md:w-auto">
            <div className="flex items-center gap-2 px-3 text-gray-400">
                <Search size={18} />
            </div>
            <input 
                type="text"
                placeholder="Buscar por objeto, número..."
                className="bg-transparent border-none outline-none text-sm w-full md:w-64 text-gray-700 placeholder:text-gray-400"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            <button 
                onClick={carregarDfds} 
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                title="Atualizar lista"
            >
                <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
            </button>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="animate-in fade-in slide-in-from-bottom-4">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
                <p className="text-gray-400 font-medium animate-pulse">Carregando demandas...</p>
            </div>
        ) : filteredDfds.length === 0 ? (
            searchTerm ? (
                <div className="text-center py-20">
                    <p className="text-gray-500">Nenhuma demanda encontrada para "{searchTerm}".</p>
                    <button onClick={() => setSearchTerm('')} className="text-indigo-600 font-bold mt-2 hover:underline">Limpar filtros</button>
                </div>
            ) : (
                <EmptyState 
                    title="Tudo em dia!"
                    description="Não há Documentos de Formalização de Demanda pendentes de planejamento no momento."
                    icon={PackageOpen}
                    action={
                        <button onClick={() => navigate('/novo-dfd')} className="mt-4 text-indigo-600 font-bold hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors">
                            Criar Novo DFD
                        </button>
                    }
                />
            )
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDfds.map((dfd) => (
                    // Verificação de Segurança: Só renderiza se tiver ID
                    dfd.id && (
                        <DfdSelectableCard 
                            key={dfd.id} 
                            dfd={dfd} 
                            isSelected={selectedIds.includes(dfd.id)}
                            onToggle={() => toggleSelect(dfd.id!)} // Exclamação segura pois já verificamos
                        />
                    )
                ))}
            </div>
        )}
      </div>

      {/* BARRA FLUTUANTE DE AÇÃO (Só aparece se houver seleção) */}
      {selectedIds.length > 0 && (
          <StickyFooter>
            <div className="flex items-center gap-3">
                <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                    {selectedIds.length}
                </div>
                <span className="text-sm font-medium text-gray-700">
                    demandas selecionadas para unificação
                </span>
                <button 
                    onClick={() => setSelectedIds([])}
                    className="text-xs text-gray-400 hover:text-red-500 ml-2 underline"
                >
                    Cancelar seleção
                </button>
            </div>
            
            <button 
                onClick={handleConsolidar} 
                disabled={processing} 
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
            >
                {processing ? <Loader2 className="animate-spin" size={18} /> : <Layers size={18} />} 
                {processing ? 'Consolidando...' : 'Gerar ETP Unificado'}
            </button>
          </StickyFooter>
      )}

    </div>
  );
}