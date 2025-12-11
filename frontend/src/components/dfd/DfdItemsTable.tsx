import { useState } from 'react';
import { ShoppingCart, Plus, Trash2, PackageSearch, Package } from 'lucide-react';
import type { DFDItem, ItemCatalogo } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { EmptyState } from '../ui/EmptyState';

interface DfdItemsTableProps {
  itens: DFDItem[];
  catalogo: ItemCatalogo[];
  onAdd: (item: DFDItem) => void;
  onRemove: (index: number) => void;
}

export function DfdItemsTable({ itens, catalogo, onAdd, onRemove }: DfdItemsTableProps) {
  const { addToast } = useToast();
  
  // Estado local do formulário
  const [selectedItemId, setSelectedItemId] = useState<number>(0);
  const [qtd, setQtd] = useState<number>(1);

  const handleAddItem = () => {
    if (!selectedItemId) {
        addToast("Selecione um item do catálogo.", "warning");
        return;
    }
    if (qtd <= 0) {
        addToast("A quantidade deve ser maior que zero.", "warning");
        return;
    }

    const itemReal = catalogo.find(i => i.id === selectedItemId);
    if (!itemReal) return;

    // Verifica se já existe na lista (opcional, mas boa prática de UX)
    if (itens.some(i => i.catalogo_item_id === selectedItemId)) {
        addToast("Este item já foi adicionado à lista.", "warning");
        return;
    }

    // Monta o objeto completo
    onAdd({
      catalogo_item_id: itemReal.id,
      quantidade: qtd,
      valor_unitario_estimado: 0, // Valor estimado inicial
      catalogo_item: itemReal // Para exibição imediata sem reload
    });

    addToast("Item adicionado com sucesso!", "success");
    
    // Reseta apenas o item, mantém a quantidade 1 por conveniência
    setSelectedItemId(0);
    setQtd(1);
  };

  return (
    <div className="space-y-6">
      
      {/* Container Principal */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <ShoppingCart size={16} className="text-orange-600"/> Itens da Requisição
        </h3>

        {/* Área de Adição (Formulário Inline) */}
        <div className="flex flex-col md:flex-row gap-3 items-end mb-6 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
            <div className="flex-1 w-full space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Catálogo de Materiais/Serviços</label>
                <div className="relative">
                    <select
                        className="w-full p-2.5 pl-9 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-orange-500 outline-none appearance-none transition shadow-sm"
                        value={selectedItemId}
                        onChange={e => setSelectedItemId(Number(e.target.value))}
                    >
                        <option value={0}>Selecione um item...</option>
                        {catalogo.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.nome} ({cat.unidade_medida})
                            </option>
                        ))}
                    </select>
                    <PackageSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>
            </div>

            <div className="w-full md:w-32 space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Quantidade</label>
                <input
                    type="number"
                    min="1"
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm text-center font-bold text-gray-700 focus:ring-2 focus:ring-orange-500 outline-none shadow-sm"
                    value={qtd}
                    onChange={e => setQtd(parseInt(e.target.value))}
                />
            </div>

            <button
                onClick={handleAddItem}
                className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-orange-200 active:scale-95"
            >
                <Plus size={18} /> Adicionar
            </button>
        </div>

        {/* Tabela de Itens */}
        {itens.length === 0 ? (
            <EmptyState 
                title="Lista de Itens Vazia"
                description="Adicione materiais ou serviços do catálogo acima para compor sua requisição."
                icon={Package}
            />
        ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 font-medium">Descrição do Item</th>
                            <th className="px-4 py-3 text-center font-medium">Unidade</th>
                            <th className="px-4 py-3 text-center font-medium">Qtd.</th>
                            <th className="px-4 py-3 text-right font-medium">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {itens.map((item, idx) => {
                            // Fallbacks seguros
                            const nome = item.catalogo_item?.nome || item._nome || "Item não identificado";
                            const unid = item.catalogo_item?.unidade_medida || item._unidade || "-";
                            
                            return (
                                <tr key={idx} className="hover:bg-orange-50/30 transition-colors group">
                                    <td className="px-4 py-3 font-medium text-gray-800">
                                        {nome}
                                        {item.catalogo_item_id && (
                                            <div className="text-[10px] text-gray-400 font-normal">ID: {item.catalogo_item_id}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center text-gray-500">
                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs border border-gray-200">
                                            {unid}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="font-bold text-orange-700 bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">
                                            {item.quantidade}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button 
                                            onClick={() => onRemove(idx)} 
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            title="Remover item"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
}