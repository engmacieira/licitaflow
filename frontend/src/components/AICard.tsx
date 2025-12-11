import { useState } from 'react';
import { Wand2, Loader2, Copy, Check } from 'lucide-react';

export interface AICardProps {
  title: string;
  // Adicionando 'orange' e 'gray' que estavam faltando
  color: 'blue' | 'red' | 'green' | 'yellow' | 'gray' | 'purple' | 'orange';
  value: string;
  onChange: (value: string) => void;
  draft?: string;
  onDraftChange?: (value: string) => void;
  loading: boolean;
  onGenerate: () => void;
  placeholder?: string;
  // Nova prop para esconder o botão de IA se necessário
  disableAI?: boolean;
}

export function AICard({ 
  title, 
  color, 
  value, 
  onChange, 
  draft, 
  onDraftChange, 
  loading, 
  onGenerate, 
  placeholder,
  disableAI = false 
}: AICardProps) {
  
  const [copied, setCopied] = useState(false);

  const colorMap = {
    blue:   { border: 'border-blue-200',   bg: 'bg-blue-50',   text: 'text-blue-700',   ring: 'focus:ring-blue-500' },
    green:  { border: 'border-green-200',  bg: 'bg-green-50',  text: 'text-green-700',  ring: 'focus:ring-green-500' },
    purple: { border: 'border-purple-200', bg: 'bg-purple-50', text: 'text-purple-700', ring: 'focus:ring-purple-500' },
    yellow: { border: 'border-yellow-200', bg: 'bg-yellow-50', text: 'text-yellow-700', ring: 'focus:ring-yellow-500' },
    red:    { border: 'border-red-200',    bg: 'bg-red-50',    text: 'text-red-700',    ring: 'focus:ring-red-500' },
    gray:   { border: 'border-gray-200',   bg: 'bg-gray-50',   text: 'text-gray-700',   ring: 'focus:ring-gray-500' },
    orange: { border: 'border-orange-200', bg: 'bg-orange-50', text: 'text-orange-700', ring: 'focus:ring-orange-500' },
  };

  const styles = colorMap[color] || colorMap.blue;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-white rounded-2xl border ${styles.border} shadow-sm overflow-hidden transition-all hover:shadow-md`}>
      <div className={`${styles.bg} px-4 py-3 border-b ${styles.border} flex justify-between items-center`}>
        <h3 className={`font-bold text-sm uppercase tracking-wide ${styles.text}`}>
          {title}
        </h3>
        
        {!disableAI && (
          <button 
            onClick={onGenerate}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-white/50 shadow-sm transition-all active:scale-95 disabled:opacity-50 ${styles.text} hover:bg-white/80`}
          >
            {loading ? <Loader2 className="animate-spin" size={14}/> : <Wand2 size={14}/>}
            {loading ? 'Gerando...' : 'Gerar com IA'}
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        <div className="relative">
          <textarea
            className={`w-full p-4 text-sm text-gray-700 bg-white border ${styles.border} rounded-xl focus:ring-2 ${styles.ring} focus:border-transparent outline-none transition-all resize-y min-h-[120px] leading-relaxed`}
            placeholder={placeholder || "Digite ou gere o conteúdo..."}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          {value && (
            <button 
              onClick={handleCopy}
              className="absolute bottom-3 right-3 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Copiar texto"
            >
              {copied ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}
            </button>
          )}
        </div>

        {!disableAI && draft !== undefined && onDraftChange && (
           <div className="relative">
             <input 
                type="text"
                className="w-full pl-3 pr-10 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-gray-600 placeholder:text-gray-300"
                placeholder="Dê uma instrução específica para a IA (opcional)..."
                value={draft}
                onChange={(e) => onDraftChange(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter') onGenerate(); }}
             />
             <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300">
               <Wand2 size={12} />
             </div>
           </div>
        )}
      </div>
    </div>
  );
}