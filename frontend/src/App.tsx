import { BrowserRouter, Routes, Route } from 'react-router-dom';

// CORREÇÃO 1: Imports padrão (sem chaves) para componentes com 'export default'
import Layout from './components/Layout'; 
import MeusProcessos from './pages/MeusProcessos';

// Imports nomeados (com chaves) para os demais que usamos 'export function'
import { Dashboard } from './pages/Dashboard';
import { DfdForm } from './pages/DfdForm';
import { EtpForm } from './pages/EtpForm';
import { Planejamento } from './pages/Planejamento'; 
import { TrForm } from './pages/TrForm';

function App() {
  return (
    <BrowserRouter>
      {/* CORREÇÃO 2: Estrutura de Rotas Aninhadas para funcionar com o <Outlet /> do Layout */}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="meus-processos" element={<MeusProcessos />} />
          <Route path="novo-dfd" element={<DfdForm />} />
          <Route path="dfd/:id" element={<DfdForm />} />
          <Route path="planejamento" element={<Planejamento />} />
          <Route path="etp/:dfdId" element={<EtpForm />} />
          <Route path="tr/:etpId" element={<TrForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;