import { useEffect, useState } from 'react';
import { DashboardService } from '../services/api';

export function Dashboard() {
  const [stats, setStats] = useState({ total_processos: 0, concluidos: 0, economia: 0 });

  useEffect(() => {
    DashboardService.getStats().then(setStats);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Processos Ativos</h3>
          <p className="text-4xl font-bold text-gray-800 mt-2">{stats.total_processos}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
          <h3 className="text-gray-500 text-sm font-medium">Concluídos (Mock)</h3>
          <p className="text-4xl font-bold text-gray-800 mt-2">{stats.concluidos}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500">
          <h3 className="text-gray-500 text-sm font-medium">Economia (Mock)</h3>
          <p className="text-4xl font-bold text-gray-800 mt-2">R$ {stats.economia}</p>
        </div>
      </div>
    </div>
  );
}