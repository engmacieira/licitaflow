import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: ReactNode; // Botão opcional
}

export function EmptyState({ title, description, icon: Icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-center animate-in fade-in zoom-in duration-300">
      <div className="bg-blue-50 p-6 rounded-full mb-6">
        <Icon size={48} className="text-blue-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 mb-8 max-w-sm leading-relaxed">
        {description}
      </p>
      {action && (
        <div className="transform hover:scale-105 transition-transform duration-200">
          {action}
        </div>
      )}
    </div>
  );
}