import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DfdService, CadastrosService, AIService, type DFD, type GenericOption } from '../services/api';
import { Save, ArrowLeft, Wand2, Loader2 } from 'lucide-react';

export function DfdForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // Pega o ID da URL (se existir)
  const isEditing = !!id;     // Se tem ID, é edição

  // --- Estados do Formulário ---
  const [formData, setFormData] = useState<DFD>({
    numero: '',
    ano: 2024,
    data_req: new Date().toISOString().split('T')[0], // Hoje YYYY-MM-DD
    secretaria_id: 0,
    responsavel_id: 0,
    objeto: '',
    justificativa: ''
  });

  // --- Estados Auxiliares ---
  const [secretarias, setSecretarias] = useState<GenericOption[]>([]);
  const [agentes, setAgentes] = useState<GenericOption[]>([]);
  
  // --- Estados de UI (Loading) ---
  const [loading, setLoading] = useState(false);
  const [aiLoadingObj, setAiLoadingObj] = useState(false);
  const [aiLoadingJus, setAiLoadingJus] = useState(false);
  
  // --- Rascunhos para a IA ---
  const [draftObjeto, setDraftObjeto] = useState('');
  const [draftJustificativa, setDraftJustificativa] = useState('');

  // Carregar dados ao abrir a tela
  useEffect(() => {
    loadAuxData();
    if (isEditing) {
      loadDfdData(id);
    }
  }, [id]);

  async function loadAuxData() {
    try {
      const [secs, agts] = await Promise.all([
        CadastrosService.listarSecretarias(),
        CadastrosService.listarAgentes()
      ]);
      setSecretarias(secs);
      setAgentes(agts);
    } catch (error) {
      console.error("Erro ao carregar cadastros", error);
    }
  }

  async function loadDfdData(dfdId: string) {
    try {
      const data = await DfdService.buscarPorId(dfdId);
      setFormData(data);
    } catch (error) {
      alert("Erro ao carregar o DFD.");
      navigate('/processos');
    }
  }

  // --- Manipuladores de Eventos ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (isEditing && formData.id) {
        await DfdService.atualizar(formData.id, formData);
        alert("✅ DFD Atualizado com sucesso!");
      } else {
        await DfdService.criar(formData);
        alert("✅ DFD Criado com sucesso!");
      }
      navigate('/processos');
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  };

  // --- Integração com IA ---
  const handleGenerateObjeto = async () => {
    if (!draftObjeto) return alert("Digite um rascunho para a IA trabalhar.");
    setAiLoadingObj(true);
    try {
      const result = await AIService.gerarObjeto(draftObjeto, "Seja técnico e formal.");
      setFormData(prev => ({ ...prev, objeto: result }));
    } catch (e) {
      alert("Erro na IA");
    } finally {
      setAiLoadingObj(false);
    }
  };

  const handleGenerateJustificativa = async () => {
    if (!formData.objeto) return alert("O campo 'Objeto' precisa estar preenchido primeiro.");
    setAiLoadingJus(true);
    try {
      const result = await AIService.gerarJustificativa(formData.objeto, draftJustificativa);
      setFormData(prev => ({ ...prev, justificativa: result }));
    } catch (e) {
      alert("Erro na IA");
    } finally {
      setAiLoadingJus(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/processos')} className="p-2 hover:bg-gray-200 rounded-full transition">
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? `Editando DFD` : 'Novo Documento'}
          </h2>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          Salvar
        </button>
      </div>

      {/* Seção 1: Dados Básicos */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
          <input 
            name="numero" 
            value={formData.numero} 
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition"
            placeholder="Ex: 001/2024"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
          <input 
            type="number" 
            name="ano" 
            value={formData.ano} 
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Requisição</label>
          <input 
            type="date" 
            name="data_req" 
            value={formData.data_req} 
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition"
          />
        </div>
        
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Secretaria</label>
          <select 
            name="secretaria_id" 
            value={formData.secretaria_id} 
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg bg-white outline-none focus:border-blue-500 transition"
          >
            <option value={0}>Selecione...</option>
            {secretarias.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
          <select 
            name="responsavel_id" 
            value={formData.responsavel_id} 
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg bg-white outline-none focus:border-blue-500 transition"
          >
            <option value={0}>Selecione...</option>
            {agentes.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>
        </div>
      </div>

      {/* Seção 2: Objeto (IA) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
        <div className="flex justify-between items-center mb-3">
          <label className="text-lg font-semibold text-gray-800">Objeto da Contratação</label>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium flex items-center gap-1 border border-blue-200">
            <Wand2 size={12} /> IA Powered
          </span>
        </div>
        
        {/* Input Rascunho */}
        <div className="bg-blue-50 p-3 rounded-lg mb-3 border border-blue-100 flex gap-2">
          <input 
            value={draftObjeto}
            onChange={(e) => setDraftObjeto(e.target.value)}
            placeholder="Rascunho: O que você quer comprar? (ex: 50 cadeiras para escolas)"
            className="flex-1 bg-transparent border-none text-sm outline-none text-blue-900 placeholder-blue-300"
          />
          <button 
            onClick={handleGenerateObjeto}
            disabled={aiLoadingObj}
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-1"
          >
            {aiLoadingObj ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
            Gerar
          </button>
        </div>

        <textarea 
          name="objeto"
          value={formData.objeto}
          onChange={handleChange}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          placeholder="O texto final gerado pela IA aparecerá aqui..."
        />
      </div>

      {/* Seção 3: Justificativa (IA) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
        <div className="flex justify-between items-center mb-3">
          <label className="text-lg font-semibold text-gray-800">Justificativa da Necessidade</label>
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium flex items-center gap-1 border border-purple-200">
            <Wand2 size={12} /> IA Powered
          </span>
        </div>
        
        {/* Input Rascunho */}
        <div className="bg-purple-50 p-3 rounded-lg mb-3 border border-purple-100 flex gap-2">
          <input 
            value={draftJustificativa}
            onChange={(e) => setDraftJustificativa(e.target.value)}
            placeholder="Algum motivo específico? (ex: as atuais estão quebradas)"
            className="flex-1 bg-transparent border-none text-sm outline-none text-purple-900 placeholder-purple-300"
          />
          <button 
            onClick={handleGenerateJustificativa}
            disabled={aiLoadingJus}
            className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-md hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-1"
          >
            {aiLoadingJus ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
            Gerar
          </button>
        </div>

        <textarea 
          name="justificativa"
          value={formData.justificativa}
          onChange={handleChange}
          rows={5}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
          placeholder="A justificativa completa aparecerá aqui..."
        />
      </div>

    </div>
  );
}