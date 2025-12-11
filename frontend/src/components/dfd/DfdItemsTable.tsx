import { useState } from 'react';
import { ShoppingCart, Plus, Trash2 } from 'lucide-react';
import type { DFDItem, ItemCatalogo } from '../../services/api';

interface DfdItemsTableProps {
  itens: DFDItem[];
  catalogo: ItemCatalogo[];
  onAdd: (item: DFDItem) => void;
  onRemove: (index: number) => void;
}

export function DfdItemsTable({ itens, catalogo, onAdd, onRemove }: DfdItemsTableProps) {
  // Estado local (O Pai não precisa saber disso)
  const [selectedItemId, setSelectedItemId] = useState<number>(0);
  const [qtd, setQtd] = useState<number>(1);

  const handleAddItem = () => {
    if (!selectedItemId) return alert("Selecione um item!");
    if (qtd <= 0) return alert("Quantidade inválida!");

    const itemReal = catalogo.find(i => i.id === selectedItemId);
    if (!itemReal) return;

    // Monta o objeto e manda para o Pai
    onAdd({
      catalogo_item_id: itemReal.id,
      quantidade: qtd,
      valor_unitario_estimado: 0,
      catalogo_item: itemReal // Para exibição
    });

    // Reseta form local
    setSelectedItemId(0);
    setQtd(1);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart className="text-orange-600" />
        <h3 className="text-lg font-bold text-gray-800">Itens da Demanda</h3>
      </div>

      {/* Form de Adição */}
      <div className="flex flex-col md:flex-row gap-3 mb-4 p-4 bg-orange-50 rounded-lg">
        <div className="flex-1">
          <label className="text-xs font-bold text-orange-800 uppercase">Item do Catálogo</label>
          <select 
            className="w-full p-2 border border-orange-200 rounded mt-1 bg-white"
            value={selectedItemId}
            onChange={e => setSelectedItemId(Number(e.target.value))}
          >
            <option value={0}>Selecione um item...</option>
            {catalogo.map(i => (
              <option key={i.id} value={i.id}>
                {i.codigo ? `[${i.codigo}] ` : ''}{i.nome} ({i.unidade_medida})
              </option>
            ))}
          </select>
        </div>
        <div className="w-32">
          <label className="text-xs font-bold text-orange-800 uppercase">Qtd.</label>
          <input 
            type="number" min="1"
            className="w-full p-2 border border-orange-200 rounded mt-1"
            value={qtd}
            onChange={e => setQtd(Number(e.target.value))}
          />
        </div>
        <div className="flex items-end">
          <button 
            onClick={handleAddItem}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 flex items-center gap-1 transition shadow-sm active:scale-95"
          >
            <Plus size={18} /> Adicionar
          </button>
        </div>
      </div>

      {/* Tabela de Listagem */}
      {itens && itens.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3">Descrição</th>
                <th className="p-3 text-center">Unid.</th>
                <th className="p-3 text-center">Qtd.</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {itens.map((item, idx) => {
                // Fallbacks para garantir exibição
                const nome = item.catalogo_item?.nome || item._nome || "Item";
                const unid = item.catalogo_item?.unidade_medida || item._unidade || "-";
                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-700">{nome}</td>
                    <td className="p-3 text-center text-gray-500">{unid}</td>
                    <td className="p-3 text-center font-bold bg-orange-50 text-orange-800 rounded">{item.quantidade}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => onRemove(idx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-gray-400">
          Nenhum item adicionado ainda.
        </div>
      )}
    </div>
  );
}