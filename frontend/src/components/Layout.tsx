import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, FolderOpen, Settings, Ghost } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation(); // Hook para saber em qual URL estamos

  // Função auxiliar para estilizar o link ativo vs inativo
  const isActive = (path: string) => location.pathname === path
    ? "bg-blue-600 text-white shadow-md" // Estilo Ativo
    : "text-gray-400 hover:bg-gray-800 hover:text-white"; // Estilo Inativo

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-gray-900 text-white flex-col hidden md:flex shadow-xl">
        {/* Cabeçalho da Sidebar */}
        <div className="p-6 text-center border-b border-gray-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            LicitaFlow 🤖
          </h1>
          <p className="text-xs text-gray-500 mt-1">Gestão Inteligente v2.0</p>
        </div>

        {/* Menu de Navegação */}
        <nav className="flex-1 p-4 space-y-2">
          
          <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/')}`}>
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>

          {/* Nota: A rota /novo-dfd ainda vamos criar, mas o link já está pronto */}
          <Link to="/novo-dfd" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/novo-dfd')}`}>
            <FileText size={20} />
            <span className="font-medium">Novo DFD</span>
          </Link>

          <Link to="/processos" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/processos')}`}>
            <FolderOpen size={20} />
            <span className="font-medium">Meus Processos</span>
          </Link>

          <hr className="border-gray-800 my-4" />

          {/* Link desativado visualmente (opacity-50) para indicar "Em breve" */}
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all opacity-50 cursor-not-allowed text-gray-400`}>
            <Settings size={20} />
            <span className="font-medium">Cadastros</span>
          </div>
        </nav>

        {/* Rodapé da Sidebar (Perfil) */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition cursor-pointer">
            <div className="bg-purple-500 p-1.5 rounded-full">
               <Ghost size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-200">Matheus</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}