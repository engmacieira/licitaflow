import { useNavigate } from 'react-router-dom';
import { FileText, Edit3, Eye, Calendar } from 'lucide-react';
import type { DFD } from '../../services/api';

interface ProcessoCardProps {
  dfd: DFD;
}

export function ProcessoCard({ dfd }: ProcessoCardProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <FileText size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">DFD {dfd.numero}/{dfd.ano}</span>
                {dfd.etp_id && (
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold border border-purple-200">
                        EM PLANEJAMENTO
                    </span>
                )}
            </div>
            <h3 className="text-lg font-bold text-gray-800 line-clamp-1" title={dfd.objeto}>
                {dfd.objeto}
            </h3>
          </div>
        </div>
        
        {/* Badge de Status ou Unidade */}
        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
            Unidade: {dfd.unidade_requisitante_id}
        </span>
      </div>

      <p className="text-gray-500 text-sm mb-6 line-clamp-2 min-h-[40px]">
        {dfd.justificativa}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
            <Calendar size={14} />
            {new Date(dfd.data_req).toLocaleDateString('pt-BR')}
        </div>

        <div className="flex gap-2">
            {/* Botão Editar DFD */}
            <button 
                onClick={() => navigate(`/dfd/${dfd.id}`)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar DFD"
            >
                <Edit3 size={18} />
            </button>

            {/* Botão Ver ETP (Se existir) */}
            {dfd.etp_id && (
                <button 
                    onClick={() => navigate(`/etp/${dfd.id}`)} // Navega via DFD
                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-bold transition-colors"
                >
                    <Eye size={14} /> Ver ETP
                </button>
            )}
        </div>
      </div>
    </div>
  );
}