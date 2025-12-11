import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  FolderOpen,
  PieChart
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext'; // Já usando nosso Hook!

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleLogout = () => {
    // Simulação de logout
    addToast('Você saiu do sistema.', 'success');
    navigate('/login'); // Ajuste conforme sua rota de login
  };

  // Lista de links para facilitar manutenção (DRY - Don't Repeat Yourself)
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/meus-processos', label: 'Meus Processos', icon: FolderOpen },
    { path: '/planejamento', label: 'Planejamento', icon: PieChart },
    { path: '/novo-dfd', label: 'Novo DFD', icon: FileText }, // Exemplo
    { path: '/configuracoes', label: 'Configurações', icon: Settings },
  ];

  // Componente interno para os Links
  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex flex-col gap-2 p-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'} />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* --- Sidebar Desktop --- */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-30">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            L
          </div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">LicitaFlow</span>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <NavLinks />
        </div>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* --- Mobile Header --- */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            LF
          </div>
          <span className="font-bold text-gray-800">LicitaFlow</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} className="text-gray-600"/> : <Menu size={24} className="text-gray-600"/>}
        </button>
      </div>

      {/* --- Mobile Sidebar Overlay & Drawer --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col">
          {/* Backdrop Escuro */}
          <div 
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu Drawer */}
          <div className="relative w-3/4 max-w-xs bg-white h-full shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded-md hover:bg-gray-100">
                <X size={20} className="text-gray-500"/>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-2">
              <NavLinks onClick={() => setIsMobileMenuOpen(false)} />
            </div>

            <div className="p-4 border-t border-gray-100">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut size={20} />
                <span className="font-medium">Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Conteúdo Principal --- */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 animate-in fade-in duration-500">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

    </div>
  );
}