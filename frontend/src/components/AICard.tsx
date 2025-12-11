import { Wand2, Loader2 } from 'lucide-react';

interface AICardProps {
  title: string;
  // ADICIONADO 'purple' NA LISTA DE CORES ACEITAS
  color: 'red' | 'blue' | 'green' | 'yellow' | 'gray' | 'purple'; 
  value: string;
  onChange: (value: string) => void;
  draft: string;
  onDraftChange: (value: string) => void;
  loading: boolean;
  onGenerate: () => void;
  placeholder: string;
}

export function AICard({ title, color, value, onChange, draft, onDraftChange, loading, onGenerate, placeholder }: AICardProps) {
  
  // Mapa de Cores (Adicionado o estilo para purple)
  const styles = {
    red:    { header: 'bg-red-600',    border: 'focus:ring-red-500',    input: 'bg-red-50 text-red-900 border-red-100' },
    blue:   { header: 'bg-blue-600',   border: 'focus:ring-blue-500',   input: 'bg-blue-50 text-blue-900 border-blue-100' },
    green:  { header: 'bg-green-600',  border: 'focus:ring-green-500',  input: 'bg-green-50 text-green-900 border-green-100' },
    yellow: { header: 'bg-yellow-600', border: 'focus:ring-yellow-500', input: 'bg-yellow-50 text-yellow-900 border-yellow-100' },
    gray:   { header: 'bg-gray-700',   border: 'focus:ring-gray-500',   input: 'bg-gray-50 text-gray-900 border-gray-200' },
    // Novo estilo Roxo
    purple: { header: 'bg-purple-600', border: 'focus:ring-purple-500', input: 'bg-purple-50 text-purple-900 border-purple-100' },
  };

  const currentStyle = styles[color];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className={`${currentStyle.header} text-white px-6 py-3 flex justify-between items-center`}>
        <h3 className="font-bold text-sm uppercase tracking-wide">{title}</h3>
        <span className="text-[10px] bg-white/20 px-2 py-1 rounded flex items-center gap-1 font-mono">
          <Wand2 size={12}/> IA POWERED
        </span>
      </div>

      <div className="p-6">
        <div className={`flex gap-2 p-1 pl-3 rounded-lg mb-4 border ${currentStyle.input} items-center`}>
          <input 
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder-current placeholder-opacity-60"
            placeholder={placeholder}
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onGenerate()} 
          />
          <button 
            onClick={onGenerate} 
            disabled={loading}
            className="bg-white/80 hover:bg-white text-xs px-4 py-2 rounded-md shadow-sm transition-all disabled:opacity-50 flex items-center gap-2 font-bold text-gray-700 active:scale-95"
          >
            {loading ? <Loader2 size={14} className="animate-spin"/> : <Wand2 size={14}/>} 
            Gerar Texto
          </button>
        </div>

        <textarea 
          className={`w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all text-gray-700 leading-relaxed ${currentStyle.border}`}
          rows={6}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="O texto gerado pela Inteligência Artificial aparecerá aqui para sua revisão..."
        />
      </div>
    </div>
  );
}