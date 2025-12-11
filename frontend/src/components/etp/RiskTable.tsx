import { useState } from 'react';
import { Plus, Trash2, ShieldAlert, Wand2, Loader2 } from 'lucide-react';
import type { ItemRisco } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { EmptyState } from '../ui/EmptyState';

interface RiskTableProps {
  riscos: ItemRisco[];
  onAdd: (risco: ItemRisco) => void;
  onRemove: (id: number) => void;
  onGenerate: () => void;
  loadingIA: boolean;
}

export function RiskTable({ riscos, onAdd, onRemove, onGenerate, loadingIA }: RiskTableProps) {
  const { addToast } = useToast();
  
  const [novoRisco, setNovoRisco] = useState<ItemRisco>({
    descricao_risco: '',
    probabilidade: 'Baixa',
    impacto: 'Baixo',
    medida_preventiva: '',
    responsavel: 'Contratada'
  });

  const handleAddClick = () => {
    if (!novoRisco.descricao_risco.trim() || !novoRisco.medida_preventiva.trim()) {
        addToast("Preencha a descrição do risco e a medida preventiva.", "warning");
        return;
    }
    onAdd(novoRisco);
    setNovoRisco({ 
        descricao_risco: '', 
        probabilidade: 'Baixa', 
        impacto: 'Baixo', 
        medida_preventiva: '', 
        responsavel: 'Contratada' 
    }); 
  };

  // Removido o parâmetro 'type' que não estava sendo usado
  const getBadgeColor = (nivel: string) => {
    const isHigh = nivel === 'Alta' || nivel === 'Alto';
    const isMed = nivel === 'Média' || nivel === 'Médio';
    
    if (isHigh) return 'bg-red-100 text-red-700 border-red-200';
    if (isMed) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  return (
    <div className="space-y-6">
      
      {/* Botão de IA */}
      <div className="flex justify-end">
         <button 
            onClick={onGenerate}
            disabled={loadingIA}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-purple-200 transition-all active:scale-95 disabled:opacity-70"
          >
            {loadingIA ? <Loader2 className="animate-spin" size={18}/> : <Wand2 size={18}/>}
            {loadingIA ? "Analisando Riscos..." : "Identificar Riscos com IA"}
          </button>
      </div>

      {/* Lista de Riscos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {riscos.length === 0 ? (
           <div className="p-8">
             <EmptyState 
                title="Matriz de Riscos Vazia"
                description="Nenhum risco mapeado ainda. Use a IA para identificar riscos automaticamente ou adicione manualmente abaixo."
                icon={ShieldAlert}
             />
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                    <tr>
                        <th className="px-6 py-3">Risco / Evento</th>
                        <th className="px-6 py-3 text-center">Probabilidade</th>
                        <th className="px-6 py-3 text-center">Impacto</th>
                        <th className="px-6 py-3">Medida Preventiva</th>
                        <th className="px-6 py-3">Responsável</th>
                        <th className="px-6 py-3 text-center">Ação</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {riscos.map((r, i) => (
                        <tr key={r.id || i} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900 max-w-xs">{r.descricao_risco}</td>
                            <td className="px-6 py-4 text-center">
                                <span className={`px-2 py-1 rounded text-xs font-bold border ${getBadgeColor(r.probabilidade)}`}>
                                    {r.probabilidade}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={`px-2 py-1 rounded text-xs font-bold border ${getBadgeColor(r.impacto)}`}>
                                    {r.impacto}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600 max-w-xs">{r.medida_preventiva}</td>
                            <td className="px-6 py-4 text-gray-600">{r.responsavel}</td>
                            <td className="px-6 py-4 text-center">
                                <button 
                                    onClick={() => r.id && onRemove(r.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                    <Trash2 size={16}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Formulário de Adição (Card Destacado) */}
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
        <h4 className="text-sm font-bold text-gray-600 uppercase mb-4 flex items-center gap-2">
            <Plus size={16} /> Adicionar Risco Manualmente
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Descrição do Risco</label>
                <input 
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition bg-white" 
                    placeholder="Ex: Atraso na entrega..."
                    value={novoRisco.descricao_risco}
                    onChange={e => setNovoRisco({...novoRisco, descricao_risco: e.target.value})}
                />
            </div>
            
            <div className="md:col-span-2 space-y-1">
                 <label className="text-xs font-bold text-gray-500 uppercase">Probabilidade</label>
                 <select 
                    className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                    value={novoRisco.probabilidade}
                    // CORREÇÃO: Casting explícito para garantir que é um dos valores permitidos
                    onChange={e => setNovoRisco({...novoRisco, probabilidade: e.target.value as 'Baixa' | 'Média' | 'Alta'})}
                >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                </select>
            </div>

            <div className="md:col-span-2 space-y-1">
                 <label className="text-xs font-bold text-gray-500 uppercase">Impacto</label>
                 <select 
                    className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                    value={novoRisco.impacto}
                    // CORREÇÃO: Casting explícito aqui também
                    onChange={e => setNovoRisco({...novoRisco, impacto: e.target.value as 'Baixo' | 'Médio' | 'Alto'})}
                >
                    <option value="Baixo">Baixo</option>
                    <option value="Médio">Médio</option>
                    <option value="Alto">Alto</option>
                </select>
            </div>

            <div className="md:col-span-3 space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Medida Preventiva</label>
                <input 
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition bg-white" 
                    placeholder="Ex: Aplicar multa..."
                    value={novoRisco.medida_preventiva}
                    onChange={e => setNovoRisco({...novoRisco, medida_preventiva: e.target.value})}
                />
            </div>

            <div className="md:col-span-1">
                <button 
                    onClick={handleAddClick} 
                    className="w-full h-[42px] bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center transition shadow-sm active:scale-95"
                    title="Adicionar"
                >
                    <Plus size={24}/>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}