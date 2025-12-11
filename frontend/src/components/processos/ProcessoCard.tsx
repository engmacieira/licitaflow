import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, Building2, ArrowRight } from 'lucide-react';

// Definindo o que o Card espera receber
export interface ProcessoCardProps {
  data: {
    id: number;
    tipo_solicitacao: string;
    objeto: string;
    unidade_requisitante: string;
    status: string;
    created_at: string;
  };
}

export function ProcessoCard({ data }: ProcessoCardProps) {
  const navigate = useNavigate();

  // Função simples para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Cores dinâmicas para o status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'concluído': return 'bg-green-100 text-green-700 border-green-200';
      case 'em andamento': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'rascunho': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 flex flex-col justify-between h-full">
      
      {/* Topo do Card */}
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(data.status)}`}>
            {data.status}
          </div>
          <span className="text-gray-400 text-xs flex items-center gap-1">
            <Calendar size={12} />
            {formatDate(data.created_at)}
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {data.objeto}
        </h3>

        <div className="space-y-2 text-sm text-gray-500 mb-6">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-gray-400" />
            <span className="truncate">{data.unidade_requisitante}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-gray-400" />
            <span>{data.tipo_solicitacao}</span>
          </div>
        </div>
      </div>

      {/* Rodapé do Card */}
      <div className="pt-4 border-t border-gray-100 flex justify-end">
        <button 
          onClick={() => navigate(`/planejamento?dfd_id=${data.id}`)}
          className="text-sm font-semibold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all"
        >
          Acessar Planejamento <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}