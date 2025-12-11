import { useNavigate } from 'react-router-dom';
import { FileText, Edit3, Eye, Calendar, ScrollText, Trash2 } from 'lucide-react';
import { DfdService, type DFD } from '../../services/api';

interface ProcessoCardProps {
  dfd: DFD;
  onDelete?: () => void; // Callback para avisar a lista que algo foi apagado
}

export function ProcessoCard({ dfd, onDelete }: ProcessoCardProps) {
  const navigate = useNavigate();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita clicar no card se tiver outro evento
    
    if (!confirm(`Tem certeza que deseja enviar o DFD ${dfd.numero} para a lixeira?`)) return;

    try {
        if (dfd.id) {
            await DfdService.excluir(dfd.id);
            if (onDelete) onDelete(); // Atualiza a tela pai
        }
    } catch (error: any) {
        alert("Erro ao excluir: " + (error.response?.data?.detail || "Tente novamente."));
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between h-full">
      
      {/* --- CABEÇALHO --- */}
      <div>
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FileText size={24} />
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        DFD {dfd.numero}/{dfd.ano}
                    </span>
                    {dfd.etp_id && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold border border-purple-200">
                            PLANEJAMENTO
                        </span>
                    )}
                </div>
                <h3 className="text-lg font-bold text-gray-800 line-clamp-1" title={dfd.objeto}>
                    {dfd.objeto}
                </h3>
            </div>
            </div>
            
            {/* Badge da Unidade */}
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200">
                Unid: {dfd.unidade_requisitante_id}
            </span>
        </div>

        <p className="text-gray-500 text-sm mb-6 line-clamp-2 min-h-[40px]">
            {dfd.justificativa}
        </p>
      </div>

      {/* --- RODAPÉ (AÇÕES) --- */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
            <Calendar size={14} />
            {new Date(dfd.data_req).toLocaleDateString('pt-BR')}
        </div>

        <div className="flex gap-2">
            {/* 1. BOTÃO EXCLUIR (Só se estiver solto/rascunho) */}
            {!dfd.etp_id && (
                <button 
                    onClick={handleDelete}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    title="Excluir DFD (Enviar para Lixeira)"
                >
                    <Trash2 size={18} />
                </button>
            )}

            {/* 2. BOTÃO EDITAR */}
            <button 
                onClick={() => navigate(`/dfd/${dfd.id}`)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                title="Editar DFD"
            >
                <Edit3 size={18} />
            </button>

            {/* 3. BOTÕES DO PROCESSO (ETP e TR) */}
            {dfd.etp_id && (
                <>
                    <button 
                        onClick={() => navigate(`/etp/${dfd.id}`)} // Navega via DFD
                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-bold transition-colors border border-purple-100"
                        title="Ver Estudo Técnico Preliminar"
                    >
                        <Eye size={14} /> ETP
                    </button>

                    <button 
                        onClick={() => navigate(`/tr/${dfd.etp_id}`)} // Navega via ID do ETP
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors border border-slate-200"
                        title="Ver Termo de Referência"
                    >
                        <ScrollText size={14} /> TR
                    </button>
                </>
            )}
        </div>
      </div>
    </div>
  );
}