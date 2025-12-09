import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { MeusProcessos } from './pages/MeusProcessos';
import { DfdForm } from './pages/DfdForm';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/processos" element={<MeusProcessos />} />
          <Route path="/novo-dfd" element={<DfdForm />} />
          <Route path="/dfd/:id" element={<DfdForm />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;