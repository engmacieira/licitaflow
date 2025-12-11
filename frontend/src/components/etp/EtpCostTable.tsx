import { Calculator, FileText } from 'lucide-react';
import type { ItemETP } from '../../services/api';

interface EtpCostTableProps {
  itens: ItemETP[];
  onUpdatePrice: (index: number, newPrice: number) => void;
  onGenerateText: () => void;
  textValue: string;
  onTextChange: (val: string) => void;
  totalGeral: number;
}

export function EtpCostTable({ itens, onUpdatePrice, onGenerateText, textValue, onTextChange, totalGeral }: EtpCostTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-800 overflow-hidden">
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2">
          <Calculator size={18} className="text-green-400"/> 
          9. Estimativa de Custos (Consolidada)
        </h3>
        <button 
          onClick={onGenerateText} 
          className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded flex items-center gap-1 transition border border-gray-600"
        >
          <FileText size={14}/> Gerar Texto Jurídico
        </button>
      </div>
      
      <div className="p-6">
        <div className="overflow-x-auto mb-6 border rounded-lg shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase font-semibold">
              <tr>
                <th className="p-4 border-b">Item (Catálogo)</th>
                <th className="p-4 border-b text-center">Unid.</th>
                <th className="p-4 border-b text-center">Qtd. Total</th>
                <th className="p-4 border-b w-48">Valor Unit. Ref. (R$)</th>
                <th className="p-4 border-b text-right">Total Est.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {itens.map((item, idx) => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-4">
                     <span className="block text-gray-900 font-medium">{item.catalogo_item?.nome || `Item ${item.catalogo_item_id}`}</span>
                     <span className="text-xs text-gray-400 font-mono">{item.catalogo_item?.codigo}</span>
                  </td>
                  <td className="p-4 text-center text-gray-500">{item.catalogo_item?.unidade_medida}</td>
                  <td className="p-4 text-center">
                    <span className="inline-block bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded text-xs">
                        {item.quantidade_total}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">R$</span>
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none transition font-medium text-gray-700"
                          value={item.valor_unitario_referencia}
                          onChange={e => onUpdatePrice(idx, parseFloat(e.target.value) || 0)}
                        />
                    </div>
                  </td>
                  <td className="p-4 text-right font-bold text-gray-800">
                    {(item.quantidade_total * item.valor_unitario_referencia).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-bold border-t">
              <tr>
                <td colSpan={4} className="p-4 text-right text-gray-600">VALOR TOTAL DA CONTRATAÇÃO:</td>
                <td className="p-4 text-right text-green-700 text-lg">
                  {totalGeral.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <FileText size={16}/> Fundamentação da Estimativa
            </label>
            <textarea 
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none transition text-gray-700"
              rows={4}
              value={textValue}
              onChange={e => onTextChange(e.target.value)}
              placeholder="Clique em 'Gerar Texto Jurídico' acima para preencher automaticamente..."
            />
        </div>
      </div>
    </div>
  );
}