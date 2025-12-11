// CORREÇÃO: Adicionado 'type' na importação
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
  trend?: string;
}

export function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  // Mapas de cores para fundo e texto
  const colors = {
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100' },
    green:  { bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
  };

  const style = colors[color];

  return (
    <div className={`p-6 rounded-2xl border ${style.border} bg-white shadow-sm hover:shadow-md transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${style.bg} ${style.text}`}>
          {icon}
        </div>
        {trend && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{trend}</span>}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800 mt-1">{value}</h3>
      </div>
    </div>
  );
}