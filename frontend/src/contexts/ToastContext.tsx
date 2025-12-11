import { createContext, useContext, useState, type ReactNode } from 'react';
import { Toast, type ToastType } from '../components/ui/Toast'; 

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextData {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setMessages((state) => [...state, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setMessages((state) => state.filter((msg) => msg.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"> {/* pointer-events-none para não bloquear cliques abaixo se a área for grande, mas o Toast em si terá pointer-events-auto */}
        {messages.map((msg) => (
          <div key={msg.id} className="pointer-events-auto">
             <Toast
                message={msg.message}
                type={msg.type}
                onClose={() => removeToast(msg.id)}
             />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }
  return context;
}