import { useState } from 'react';
import { Wallet, Plus, Trash2 } from 'lucide-react';
import type { GenericOption, DFDDotacao } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface DfdDotacaoListProps {
  dotacoesSelecionadas: DFDDotacao[];
  listaDisponivel: GenericOption[];
  onAdd: (dotacao: any) => void;
  onRemove: (index: number) => void;
}

export function DfdDotacaoList({ dotacoesSelecionadas, listaDisponivel, onAdd, onRemove }: DfdDotacaoListProps) {
  const { addToast } = useToast();
  const [selectedId, setSelectedId] = useState<number>(0);

  const handleAdd = () => {
    if (!selectedId) {
        addToast("Selecione uma dotação orçamentária.", "warning");
        return;
    }

    if (dotacoesSelecionadas?.some(d => d.dotacao_id === selectedId)) {
        addToast("Esta dotação já está vinculada ao documento.", "warning");
        return;
    }

    const dotReal = listaDisponivel.find(d => d.id === selectedId);
    if (!dotReal) return;

    onAdd({
        dotacao_id: selectedId,
        _numero: dotReal.numero,
        _nome: dotReal.nome,
        dotacao: dotReal
    });
    
    setSelectedId(0);
    addToast("Dotação vinculada!", "success");
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-full flex flex-col">
      
      {/* Cabeçalho */}
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
        <Wallet size={16} className="text-green-600"/> Fonte de Recursos / Dotação
      </h3>

      {/* Área de Seleção */}
      <div className="flex gap-2 mb-6">
        <select
            // CORREÇÃO: Adicionado 'min-w-0' para evitar que opções longas estourem o layout
            className="flex-1 min-w-0 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-green-500 outline-none transition appearance-none truncate"
            value={selectedId}
            onChange={e => setSelectedId(Number(e.target.value))}
        >
            <option value={0}>Selecione a fonte...</option>
            {listaDisponivel.map(opt => (
                <option key={opt.id} value={opt.id} className="truncate">
                    {opt.numero ? `${opt.numero} - ` : ''}{opt.nome}
                </option>
            ))}
        </select>
        <button
            onClick={handleAdd}
            className="bg-green-600 hover:bg-green-700 text-white p-2.5 rounded-lg transition-all shadow-sm active:scale-95 flex items-center justify-center w-12 shrink-0"
            title="Adicionar"
        >
            <Plus size={20} />
        </button>
      </div>

      {/* Lista de Itens */}
      <div className="flex-1 overflow-y-auto min-h-[150px] space-y-2 pr-1 custom-scrollbar">
        {!dotacoesSelecionadas || dotacoesSelecionadas.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl p-4">
                <Wallet size={32} className="mb-2 opacity-20" />
                <span className="text-xs">Nenhuma dotação vinculada.</span>
            </div>
        ) : (
            dotacoesSelecionadas.map((dot, idx) => {
                const dAny = dot as any; 
                const numero = dAny.dotacao?.numero || dAny._numero;
                const nome = dAny.dotacao?.nome || dAny._nome;
                const label = numero ? `${numero} - ${nome}` : `Dotação ID: ${dot.dotacao_id}`;

                return (
                    <div key={idx} className="flex justify-between items-center p-3 bg-green-50/30 border border-green-100 rounded-xl group hover:border-green-300 transition-all">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="min-w-[4px] h-8 bg-green-400 rounded-full" />
                            <span className="text-xs font-medium text-gray-700 truncate" title={label}>
                                {label}
                            </span>
                        </div>
                        <button
                            onClick={() => onRemove(idx)}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors shrink-0"
                            title="Remover item"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
}