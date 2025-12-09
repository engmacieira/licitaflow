import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Hook de navegação
import { DfdService, type DFD } from '../services/api'; // Importação corrigida com 'type'
import { FileText, Edit, Trash2 } from 'lucide-react';

export function MeusProcessos() {
  const [processos, setProcessos] = useState<DFD[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Instância do navegador

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      const dados = await DfdService.listar();
      setProcessos(dados);
    } catch (error) {
      console.error("Erro ao carregar lista:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Carregando processos...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Meus Processos</h2>
        <button 
          onClick={() => navigate('/novo-dfd')} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
        >
          <FileText size={18} />
          Novo DFD
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Número</th>
              <th className="p-4 font-semibold text-gray-600">Objeto</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {processos.map((dfd) => (
              <tr key={dfd.id} className="hover:bg-gray-50 transition">
                <td className="p-4 font-medium text-blue-600">{dfd.numero}</td>
                <td className="p-4 text-gray-700">
                  {dfd.objeto || <span className="italic text-gray-400">Objeto não definido</span>}
                </td>
                <td className="p-4 text-right space-x-2">
                  {/* Botão de Editar levando para a rota dinâmica */}
                  <button 
                    onClick={() => navigate(`/dfd/${dfd.id}`)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" 
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  
                  {/* Botão de Excluir (lógica visual apenas por enquanto) */}
                  <button 
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition" 
                    title="Excluir"
                    onClick={() => alert("Funcionalidade de exclusão em breve!")}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            
            {processos.length === 0 && (
                <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-500">
                        Nenhum processo encontrado.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}