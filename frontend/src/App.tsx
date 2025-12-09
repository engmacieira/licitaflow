import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { MeusProcessos } from './pages/MeusProcessos';
import { DfdForm } from './pages/DfdForm';
import { EtpForm } from './pages/EtpForm'; // <--- 1. Importe o componente

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/processos" element={<MeusProcessos />} />
          <Route path="/novo-dfd" element={<DfdForm />} />
          <Route path="/dfd/:id" element={<DfdForm />} />
          
          {/* 2. Registre a nova rota aqui */}
          <Route path="/etp/:dfdId" element={<EtpForm />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;