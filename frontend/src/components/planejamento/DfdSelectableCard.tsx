import { CheckSquare, Square } from 'lucide-react';
import type { DFD } from '../../services/api';

interface DfdSelectableCardProps {
  dfd: DFD;
  isSelected: boolean;
  onToggle: (id: number) => void;
}

export function DfdSelectableCard({ dfd, isSelected, onToggle }: DfdSelectableCardProps) {
  return (
    <div 
      onClick={() => dfd.id && onToggle(dfd.id)}
      className={`group relative p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
        isSelected 
          ? 'border-blue-500 bg-blue-50/30' 
          : 'border-gray-100 bg-white hover:border-blue-200'
      }`}
    >
      <div className="flex justify-between items-start">
          <div className="flex gap-4">
              {/* Checkbox Visual */}
              <div className={`mt-1 text-blue-600 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
                  {isSelected ? <CheckSquare size={24} /> : <Square size={24} />}
              </div>
              
              {/* Conteúdo */}
              <div>
                  <div className="flex items-center gap-2 mb-1">
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                          DFD {dfd.numero}/{dfd.ano}
                      </span>
                      <span className="text-xs text-gray-400">
                          {new Date(dfd.data_req).toLocaleDateString('pt-BR')}
                      </span>
                  </div>
                  
                  <h3 className="font-bold text-gray-800 text-lg mb-1">{dfd.objeto}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{dfd.justificativa}</p>
                  
                  {/* Resumo dos Itens */}
                  {dfd.itens && dfd.itens.length > 0 && (
                      <div className="mt-3 flex gap-2 flex-wrap">
                          {dfd.itens.slice(0, 3).map((item, idx) => (
                              <span key={idx} className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-100 font-medium">
                                  {item.quantidade}x {item.catalogo_item?.nome || 'Item'}
                              </span>
                          ))}
                          {dfd.itens.length > 3 && (
                              <span className="text-xs text-gray-400 self-center">+{dfd.itens.length - 3} itens</span>
                          )}
                      </div>
                  )}
              </div>
          </div>
          
          {/* Badge da Unidade */}
          <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                  Unidade ID: {dfd.unidade_requisitante_id}
              </span>
          </div>
      </div>
    </div>
  );
}