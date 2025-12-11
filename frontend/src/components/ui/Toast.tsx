import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning'; // Exportando o tipo para reuso

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Configuração de cores e ícones
  const styles = {
    success: { bg: 'bg-emerald-600', icon: <CheckCircle size={20} /> },
    error: { bg: 'bg-red-600', icon: <XCircle size={20} /> },
    warning: { bg: 'bg-amber-500', icon: <AlertTriangle size={20} /> }, // Novo estilo!
  };

  const currentStyle = styles[type] || styles.success;

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${currentStyle.bg} animate-in slide-in-from-right-10 fade-in duration-300`}>
      {currentStyle.icon}
      <span className="font-medium text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded p-1 transition-colors">
        <X size={14}/>
      </button>
    </div>
  );
}