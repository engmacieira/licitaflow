import { useState } from 'react';
import { AlertTriangle, Plus, Trash2, ShieldAlert, Wand2, Loader2 } from 'lucide-react';
import type { ItemRisco } from '../../services/api';

interface RiskTableProps {
  riscos: ItemRisco[];
  onAdd: (risco: ItemRisco) => void;
  onRemove: (id: number) => void;
  onGenerate: () => void;
  loadingIA: boolean;
}

export function RiskTable({ riscos, onAdd, onRemove, onGenerate, loadingIA }: RiskTableProps) {
  // Estado local para o formulário de "Novo Risco"
  const [novoRisco, setNovoRisco] = useState<ItemRisco>({
    descricao_risco: '',
    probabilidade: 'Baixa',
    impacto: 'Baixo',
    medida_preventiva: '',
    responsavel: 'Contratada'
  });

  const handleAddClick = () => {
    if (!novoRisco.descricao_risco || !novoRisco.medida_preventiva) {
        return alert("Preencha a descrição e a medida preventiva.");
    }
    onAdd(novoRisco);
    setNovoRisco({ ...novoRisco, descricao_risco: '', medida_preventiva: '' }); // Limpa campos de texto
  };

  // Helper para cor das badges
  const getBadgeColor = (nivel: string) => {
    switch (nivel) {
        case 'Alta': return 'bg-red-100 text-red-800 border-red-200';
        case 'Alto': return 'bg-red-100 text-red-800 border-red-200';
        case 'Média': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Médio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-orange-200 overflow-hidden">
      {/* Header */}
      <div className="bg-orange-50 px-6 py-4 flex justify-between items-center border-b border-orange-100">
        <h3 className="font-bold text-orange-900 flex items-center gap-2">
            <ShieldAlert size={20} className="text-orange-600"/> 
            Matriz de Riscos (Obrigatório Lei 14.133/21)
        </h3>
        <button 
            onClick={onGenerate}
            disabled={loadingIA}
            className="text-xs bg-white border border-orange-300 text-orange-700 hover:bg-orange-100 px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition shadow-sm"
        >
            {loadingIA ? <Loader2 size={14} className="animate-spin"/> : <Wand2 size={14}/>}
            Identificar Riscos com IA
        </button>
      </div>

      <div className="p-6">
        
        {/* Tabela */}
        <div className="overflow-x-auto border rounded-lg mb-6">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase font-semibold">
                    <tr>
                        <th className="p-3 w-1/3">Risco / Evento</th>
                        <th className="p-3 text-center">Probab.</th>
                        <th className="p-3 text-center">Impacto</th>
                        <th className="p-3 w-1/3">Medida Preventiva (Mitigação)</th>
                        <th className="p-3">Responsável</th>
                        <th className="p-3 text-right">Ação</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {riscos.map((risco) => (
                        <tr key={risco.id} className="hover:bg-gray-50">
                            <td className="p-3 font-medium text-gray-800">{risco.descricao_risco}</td>
                            <td className="p-3 text-center">
                                <span className={`px-2 py-1 rounded text-xs font-bold border ${getBadgeColor(risco.probabilidade)}`}>
                                    {risco.probabilidade}
                                </span>
                            </td>
                            <td className="p-3 text-center">
                                <span className={`px-2 py-1 rounded text-xs font-bold border ${getBadgeColor(risco.impacto)}`}>
                                    {risco.impacto}
                                </span>
                            </td>
                            <td className="p-3 text-gray-600">{risco.medida_preventiva}</td>
                            <td className="p-3 text-gray-500">{risco.responsavel}</td>
                            <td className="p-3 text-right">
                                <button onClick={() => risco.id && onRemove(risco.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition">
                                    <Trash2 size={16}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                    {riscos.length === 0 && (
                        <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                                Nenhum risco mapeado. Use a IA ou adicione manualmente abaixo.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Formulário de Adição Manual */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Plus size={16}/> Adicionar Novo Risco</h4>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-4">
                    <label className="text-xs font-bold text-gray-500 uppercase">Descrição do Risco</label>
                    <input 
                        className="w-full p-2 border rounded text-sm mt-1" 
                        placeholder="Ex: Atraso na entrega..."
                        value={novoRisco.descricao_risco}
                        onChange={e => setNovoRisco({...novoRisco, descricao_risco: e.target.value})}
                    />
                </div>
                <div className="md:col-span-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Prob.</label>
                    <select 
                        className="w-full p-2 border rounded text-sm mt-1 bg-white"
                        value={novoRisco.probabilidade}
                        onChange={e => setNovoRisco({...novoRisco, probabilidade: e.target.value as any})}
                    >
                        <option>Baixa</option><option>Média</option><option>Alta</option>
                    </select>
                </div>
                <div className="md:col-span-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Impacto</label>
                    <select 
                        className="w-full p-2 border rounded text-sm mt-1 bg-white"
                        value={novoRisco.impacto}
                        onChange={e => setNovoRisco({...novoRisco, impacto: e.target.value as any})}
                    >
                        <option>Baixo</option><option>Médio</option><option>Alto</option>
                    </select>
                </div>
                <div className="md:col-span-3">
                    <label className="text-xs font-bold text-gray-500 uppercase">Medida Preventiva</label>
                    <input 
                        className="w-full p-2 border rounded text-sm mt-1" 
                        placeholder="Ex: Notificação..."
                        value={novoRisco.medida_preventiva}
                        onChange={e => setNovoRisco({...novoRisco, medida_preventiva: e.target.value})}
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Responsável</label>
                    <select 
                        className="w-full p-2 border rounded text-sm mt-1 bg-white"
                        value={novoRisco.responsavel}
                        onChange={e => setNovoRisco({...novoRisco, responsavel: e.target.value})}
                    >
                        <option>Contratada</option><option>Fiscal</option><option>Gestão</option>
                    </select>
                </div>
                <div className="md:col-span-1">
                    <button onClick={handleAddClick} className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition flex justify-center">
                        <Plus size={20}/>
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}