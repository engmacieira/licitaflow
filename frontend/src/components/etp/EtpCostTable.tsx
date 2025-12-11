import { Calculator, FileText } from 'lucide-react'; // Removido DollarSign
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
    <div className="space-y-6">
      
      {/* Container da Tabela Visual */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <div className="bg-green-100 p-2 rounded-lg">
                <Calculator size={18} className="text-green-600"/> 
            </div>
            9. Estimativa de Custos (Consolidada)
          </h3>
          <button 
            onClick={onGenerateText} 
            className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition-colors border border-indigo-200"
          >
            <FileText size={14}/> Gerar Texto Jurídico
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 font-medium">Item / Catálogo</th>
                <th className="px-6 py-3 font-medium text-center">Qtd.</th>
                <th className="px-6 py-3 font-medium text-right">Valor Unit. Estimado</th>
                <th className="px-6 py-3 font-medium text-right">Valor Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {itens.length === 0 ? (
                 <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400">
                        Nenhum item vinculado a este ETP. Adicione itens no DFD.
                    </td>
                 </tr>
              ) : (
                itens.map((item, index) => (
                    <tr key={index} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-gray-900">
                        {item.catalogo_item?.nome || `Item ${index + 1}`}
                        <div className="text-xs text-gray-400 font-normal mt-0.5">Cód: {item.catalogo_item_id}</div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 bg-gray-50/30">
                        {item.quantidade_total}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="relative max-w-[140px] ml-auto">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">R$</span>
                            <input 
                                type="number" 
                                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-md text-right text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm font-medium"
                                value={item.valor_unitario_referencia}
                                onChange={(e) => onUpdatePrice(index, parseFloat(e.target.value) || 0)}
                            />
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-800">
                        {(item.quantidade_total * item.valor_unitario_referencia).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                    </td>
                    </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right text-sm font-bold text-gray-600 uppercase tracking-wide">
                    Valor Total da Contratação:
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-lg font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                    {totalGeral.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Área de Texto Justificativa */}
      <div className="space-y-2 pt-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <FileText size={16} className="text-gray-400"/> 
                Fundamentação da Estimativa (Pesquisa de Mercado)
            </label>
            <div className="relative">
                <textarea 
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-gray-700 shadow-sm"
                rows={5}
                value={textValue}
                onChange={e => onTextChange(e.target.value)}
                placeholder="Descreva a metodologia utilizada para chegar aos preços acima (ex: média, mediana, menor preço, painel de preços)... Dica: Clique no botão 'Gerar Texto Jurídico' acima para um rascunho automático."
                />
            </div>
      </div>
    </div>
  );
}