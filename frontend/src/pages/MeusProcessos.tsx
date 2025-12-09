import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DfdService, type DFD } from '../services/api';
import { FileText, Edit, Trash2, FileCode, Plus } from 'lucide-react';

export function MeusProcessos() {
  const [processos, setProcessos] = useState<DFD[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      const dados = await DfdService.listar();
      setProcessos(dados);
    } catch (error) {
      console.error("Erro ao carregar lista:", error);
      alert("Erro de conexão com o backend.");
    } finally {
      setLoading(false);
    }
  }

  // Loading State mais bonito
  if (loading) return (
    <div className="flex justify-center items-center h-64 text-gray-500 gap-2">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
      Carregando processos...
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Meus Processos</h2>
          <p className="text-sm text-gray-500 mt-1">Gerencie seus Documentos de Formalização de Demanda</p>
        </div>
        <button 
          onClick={() => navigate('/novo-dfd')} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm font-medium"
        >
          <Plus size={20} />
          Novo DFD
        </button>
      </div>

      {/* Tabela de Processos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold text-gray-600 w-32">Número</th>
              <th className="p-4 font-semibold text-gray-600">Objeto</th>
              <th className="p-4 font-semibold text-gray-600 text-right w-48">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {processos.map((dfd) => (
              <tr key={dfd.id} className="hover:bg-gray-50 transition group">
                <td className="p-4 font-medium text-blue-600 whitespace-nowrap">
                  {dfd.numero}/{dfd.ano}
                </td>
                <td className="p-4 text-gray-700">
                  {dfd.objeto ? (
                    <span className="line-clamp-1" title={dfd.objeto}>{dfd.objeto}</span>
                  ) : (
                    <span className="italic text-gray-400">Objeto não definido</span>
                  )}
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  
                  {/* Botão EDITAR DFD */}
                  <button 
                    onClick={() => navigate(`/dfd/${dfd.id}`)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" 
                    title="Editar DFD"
                  >
                    <Edit size={18} />
                  </button>
                  
                  {/* Botão GERAR ETP (Novo!) */}
                  <button 
                    onClick={() => navigate(`/etp/${dfd.id}`)}
                    className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition" 
                    title="Gerar Estudo Técnico Preliminar (ETP)"
                  >
                    <FileCode size={18} />
                  </button>
                  
                  {/* Botão EXCLUIR (Mock) */}
                  <button 
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition" 
                    title="Excluir Processo"
                    onClick={() => {
                        if(confirm("Tem certeza que deseja excluir?")) alert("Em breve!");
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            
            {/* Estado Vazio */}
            {processos.length === 0 && (
                <tr>
                    <td colSpan={3} className="p-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-3">
                            <FileText size={48} className="text-gray-300" />
                            <p>Nenhum processo encontrado.</p>
                            <button 
                                onClick={() => navigate('/novo-dfd')}
                                className="text-blue-600 hover:underline text-sm"
                            >
                                Comece criando o seu primeiro DFD
                            </button>
                        </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}