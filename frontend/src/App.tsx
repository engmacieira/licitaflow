import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { MeusProcessos } from './pages/MeusProcessos';
import { DfdForm } from './pages/DfdForm';
import { EtpForm } from './pages/EtpForm';
import { Planejamento } from './pages/Planejamento'; 
import { TrForm } from './pages/TrForm';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/processos" element={<MeusProcessos />} />
          <Route path="/novo-dfd" element={<DfdForm />} />
          <Route path="/dfd/:id" element={<DfdForm />} />
          <Route path="/planejamento" element={<Planejamento />} />
          <Route path="/etp/:dfdId" element={<EtpForm />} />
          <Route path="/tr/:etpId" element={<TrForm />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;