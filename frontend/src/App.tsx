import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { MeusProcessos } from './pages/MeusProcessos';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/processos" element={<MeusProcessos />} />
          {/* Futuramente: <Route path="/novo-dfd" element={<NovoDfd />} /> */}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;