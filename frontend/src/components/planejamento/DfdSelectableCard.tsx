import { CheckCircle2, Circle, Calendar, Building2, Package } from 'lucide-react';
import type { DFD } from '../../services/api';

interface DfdSelectableCardProps {
  dfd: DFD;
  isSelected: boolean;
  onToggle: (id: number) => void;
}

export function DfdSelectableCard({ dfd, isSelected, onToggle }: DfdSelectableCardProps) {
  
  // Formatação segura de data
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data n/d';
    // Tenta criar a data; se falhar, retorna a string original ou erro
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('pt-BR');
  };

  return (
    <div 
      // Garante que o ID existe antes de chamar o toggle
      onClick={() => dfd.id && onToggle(dfd.id)}
      className={`group relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col h-full ${
        isSelected 
          ? 'border-indigo-500 bg-indigo-50/30 shadow-md ring-1 ring-indigo-500' 
          : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1'
      }`}
    >
      {/* Cabeçalho: Seleção e Meta-dados */}
      <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
              {/* Checkbox Visual */}
              <div className={`transition-all duration-300 ${
                  isSelected ? 'text-indigo-600 scale-110' : 'text-gray-300 group-hover:text-indigo-400'
              }`}>
                  {/* CORREÇÃO: Removido 'weight="fill"', adicionado fill via classe se desejar preenchimento, ou apenas o ícone normal */}
                  {isSelected ? <CheckCircle2 size={24} className="fill-indigo-100" /> : <Circle size={24} />}
              </div>
              
              <div>
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      isSelected ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}>
                      DFD {dfd.numero}/{dfd.ano}
                  </span>
              </div>
          </div>
          
          {/* CORREÇÃO: Usando 'data_req' que existe na interface DFD */}
          <div className="flex items-center gap-1 text-xs text-gray-400" title="Data da Requisição">
              <Calendar size={14} />
              {formatDate(dfd.data_req)}
          </div>
      </div>
      
      {/* Conteúdo Principal */}
      <div className="flex-1 space-y-3">
          <h3 className={`font-bold text-lg leading-tight line-clamp-2 transition-colors ${
              isSelected ? 'text-indigo-900' : 'text-gray-800 group-hover:text-indigo-600'
          }`}>
              {dfd.objeto}
          </h3>
          
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
              {dfd.justificativa}
          </p>
      </div>

      {/* Rodapé: Itens e Unidade */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col gap-3">
          
          {/* Resumo de Itens */}
          {dfd.itens && dfd.itens.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                  {dfd.itens.slice(0, 2).map((item, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-md border border-orange-100 font-medium truncate max-w-[120px]">
                          <Package size={10} />
                          {item.quantidade}x {item.catalogo_item?.nome || 'Item'}
                      </span>
                  ))}
                  {dfd.itens.length > 2 && (
                      <span className="text-xs text-gray-400 self-center font-medium">
                          +{dfd.itens.length - 2} outros
                      </span>
                  )}
              </div>
          ) : (
              <span className="text-xs text-gray-400 italic">Sem itens vinculados</span>
          )}

          {/* Unidade Solicitante */}
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-2 rounded-lg self-start w-full">
              <Building2 size={14} className="text-gray-400" />
              <span className="truncate">
                  Unidade ID: {dfd.unidade_requisitante_id}
              </span>
          </div>
      </div>
    </div>
  );
}