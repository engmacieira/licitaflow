import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
  trend?: string;
  loading?: boolean; // ✨ Nova prop para estado de carregamento
}

export function StatCard({ title, value, icon, color, trend, loading = false }: StatCardProps) {
  // Mapas de cores refinados
  const styles = {
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100', ring: 'group-hover:ring-blue-100' },
    green:  { bg: 'bg-emerald-50',  text: 'text-emerald-600',  border: 'border-emerald-100', ring: 'group-hover:ring-emerald-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', ring: 'group-hover:ring-purple-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', ring: 'group-hover:ring-orange-100' },
  };

  const style = styles[color];

  if (loading) {
    return (
      <div className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm h-full">
        <div className="flex justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse" />
          <div className="w-16 h-6 rounded-full bg-gray-50 animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="w-24 h-4 rounded bg-gray-100 animate-pulse" />
          <div className="w-16 h-8 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className={`group p-6 rounded-2xl border ${style.border} bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:ring-4 ${style.ring}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${style.bg} ${style.text} transition-transform group-hover:scale-110 duration-300`}>
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800 mt-1 tracking-tight">{value}</h3>
      </div>
    </div>
  );
}