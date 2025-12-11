import { useState, useEffect } from 'react';
import { DashboardService } from '../services/api';
import { LayoutDashboard, CheckCircle2, TrendingUp, AlertCircle, RefreshCcw, BarChart3, PieChart } from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { useToast } from '../contexts/ToastContext'; // ✨ Contexto de Toast

export function Dashboard() {
  const [stats, setStats] = useState({ total_processos: 0, concluidos: 0, economia: 0 });
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const data = await DashboardService.getStats();
      setStats(data);
      // Opcional: addToast("Dados atualizados", "success"); // Pode ser muito ruidoso se for automático
    } catch (error) {
      console.error("Erro ao carregar dashboard", error);
      addToast("Não foi possível atualizar os dados do painel.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* Cabeçalho com Botão de Refresh */}
      <div className="flex justify-between items-end mb-8 pt-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
            <LayoutDashboard className="text-blue-600" /> Visão Geral
          </h2>
          <p className="text-gray-500 mt-1">Monitoramento em tempo real das aquisições municipais.</p>
        </div>
        <button 
          onClick={loadStats} 
          disabled={loading}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95 disabled:opacity-50"
          title="Atualizar dados"
        >
          <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Grid de Cards (Stats) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Processos Iniciados" 
          value={stats.total_processos} 
          icon={<LayoutDashboard size={24} />} 
          color="blue"
          trend="+12% este mês"
          loading={loading}
        />
        <StatCard 
          title="Concluídos" 
          value={stats.concluidos} 
          icon={<CheckCircle2 size={24} />} 
          color="green" 
          loading={loading}
        />
        <StatCard 
          title="Economia Estimada" 
          value={loading ? 0 : `R$ ${stats.economia.toLocaleString('pt-BR')}`} 
          icon={<TrendingUp size={24} />} 
          color="purple" 
          loading={loading}
        />
        <StatCard 
          title="Pendências" 
          value="0" 
          icon={<AlertCircle size={24} />} 
          color="orange" 
          loading={loading}
        />
      </div>

      {/* Área de Gráficos (Placeholders Melhorados) */}
      <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Placeholder 1 */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm min-h-[350px] flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-50 to-transparent opacity-50" />
            <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 size={32} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Despesas por Secretaria</h3>
            <p className="text-sm text-gray-500 max-w-xs mt-2">
                Em breve, visualize a distribuição de orçamento e gastos por unidade em tempo real.
            </p>
        </div>

        {/* Placeholder 2 */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm min-h-[350px] flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-bl from-purple-50 to-transparent opacity-50" />
            <div className="bg-purple-50 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                <PieChart size={32} className="text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Cronograma de Licitações</h3>
            <p className="text-sm text-gray-500 max-w-xs mt-2">
                Acompanhe o status e os prazos de todos os processos licitatórios em andamento.
            </p>
        </div>

      </div>
    </div>
  );
}