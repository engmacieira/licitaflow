import { useState } from 'react';
import { Wallet, Plus, Trash2 } from 'lucide-react';
import type { GenericOption, DFDDotacao } from '../../services/api'; // Importe DFDDotacao

interface DfdDotacaoListProps {
  dotacoesSelecionadas: DFDDotacao[]; // Tipagem forte agora
  listaDisponivel: GenericOption[];
  onAdd: (dotacao: any) => void;
  onRemove: (index: number) => void;
}

export function DfdDotacaoList({ dotacoesSelecionadas, listaDisponivel, onAdd, onRemove }: DfdDotacaoListProps) {
  const [selectedId, setSelectedId] = useState<number>(0);

  const handleAdd = () => {
    if (!selectedId) return alert("Selecione uma dotação!");
    
    if (dotacoesSelecionadas?.some(d => d.dotacao_id === selectedId)) {
        return alert("Dotação já vinculada!");
    }

    const dotReal = listaDisponivel.find(d => d.id === selectedId);
    if (!dotReal) return;

    onAdd({
        dotacao_id: selectedId,
        // Salvamos auxiliares para exibição imediata antes de salvar/recarregar
        _numero: dotReal.numero,
        _nome: dotReal.nome,
        // Opcional: já injetar o objeto completo para consistência
        dotacao: dotReal 
    });
    setSelectedId(0);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="text-green-600" />
        <h3 className="text-lg font-bold text-gray-800">Dotação Orçamentária</h3>
      </div>

      <div className="flex gap-3 mb-4 p-4 bg-green-50 rounded-lg items-end">
        <div className="flex-1">
          <label className="text-xs font-bold text-green-800 uppercase">Ficha Orçamentária</label>
          <select 
            className="w-full p-2 border border-green-200 rounded mt-1 bg-white"
            value={selectedId}
            onChange={e => setSelectedId(Number(e.target.value))}
          >
            <option value={0}>Selecione a dotação...</option>
            {listaDisponivel.map(d => (
              <option key={d.id} value={d.id}>{d.numero} - {d.nome}</option>
            ))}
          </select>
        </div>
        <button onClick={handleAdd} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-1 transition shadow-sm active:scale-95">
          <Plus size={18} /> Vincular
        </button>
      </div>

      <ul className="space-y-2">
        {dotacoesSelecionadas && dotacoesSelecionadas.length > 0 ? (
            dotacoesSelecionadas.map((dot, idx) => {
                // LÓGICA DE EXIBIÇÃO ROBUSTA:
                // 1. Tenta pegar do objeto do banco (dot.dotacao)
                // 2. Se não tiver, tenta pegar do temporário local (dot._numero)
                // 3. Fallback para ID
                const numero = dot.dotacao?.numero || dot._numero;
                const nome = dot.dotacao?.nome || dot._nome;
                
                const label = numero ? `${numero} - ${nome}` : `Dotação ID ${dot.dotacao_id}`;
                
                return (
                    <li key={idx} className="flex justify-between items-center p-3 border border-green-100 rounded bg-white hover:shadow-sm transition">
                        <span className="font-mono text-gray-700 text-sm">{label}</span>
                        <button onClick={() => onRemove(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded transition">
                            <Trash2 size={16} />
                        </button>
                    </li>
                );
            })
        ) : (
            <p className="text-center text-gray-400 py-4 italic text-sm">Nenhuma dotação vinculada.</p>
        )}
      </ul>
    </div>
  );
}