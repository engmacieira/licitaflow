import { useState, useEffect } from 'react';
import { DashboardService } from '../services/api';
import { LayoutDashboard, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';

export function Dashboard() {
  const [stats, setStats] = useState({ total_processos: 0, concluidos: 0, economia: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await DashboardService.getStats();
      setStats(data);
    } catch (error) {
      console.error("Erro ao carregar dashboard", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-10 text-center text-gray-400">Carregando painel...</div>;

  return (
    <div className="w-full max-w-[1920px] mx-auto pb-20">
      <div className="mb-8 pt-4">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <LayoutDashboard className="text-blue-600" /> Visão Geral
        </h2>
        <p className="text-gray-500 mt-1">Monitoramento em tempo real das aquisições municipais.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Processos Iniciados" 
          value={stats.total_processos} 
          icon={<LayoutDashboard size={24} />} 
          color="blue"
          trend="+12% este mês"
        />
        <StatCard 
          title="Concluídos" 
          value={stats.concluidos} 
          icon={<CheckCircle2 size={24} />} 
          color="green" 
        />
        <StatCard 
          title="Economia Estimada" 
          value={`R$ ${stats.economia}`} 
          icon={<TrendingUp size={24} />} 
          color="purple" 
        />
        <StatCard 
          title="Pendências" 
          value="0" 
          icon={<AlertCircle size={24} />} 
          color="orange" 
        />
      </div>

      {/* Exemplo de área para Gráficos Futuros */}
      <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[300px] flex items-center justify-center text-gray-400 border-dashed">
            Gráfico de Despesas por Secretaria (Em breve)
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[300px] flex items-center justify-center text-gray-400 border-dashed">
            Cronograma de Licitações (Em breve)
        </div>
      </div>
    </div>
  );
}