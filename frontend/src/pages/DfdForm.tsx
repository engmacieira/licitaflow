import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DfdService, CadastrosService, AIService, type DFD, type GenericOption, type ItemCatalogo, type DFDItem } from '../services/api';
import { Save, ArrowLeft, Loader2, FileText } from 'lucide-react';

// Componentes Modulares
import { AICard } from '../components/AICard';
import { DfdItemsTable } from '../components/dfd/DfdItemsTable';
import { DfdDotacaoList } from '../components/dfd/DfdDotacaoList';

export function DfdForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  // Estados
  const [formData, setFormData] = useState<DFD>({
    numero: '',
    ano: new Date().getFullYear(),
    data_req: new Date().toISOString().split('T')[0],
    unidade_requisitante_id: 0,
    responsavel_id: 0,
    objeto: '',
    justificativa: '',
    itens: [],
    dotacoes: []
  });

  // Listas Auxiliares
  const [unidades, setUnidades] = useState<GenericOption[]>([]);
  const [agentes, setAgentes] = useState<GenericOption[]>([]);
  const [catalogoItens, setCatalogoItens] = useState<ItemCatalogo[]>([]);
  const [listaDotacoes, setListaDotacoes] = useState<GenericOption[]>([]);
  
  // UI
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  
  // Rascunhos IA
  const [drafts, setDrafts] = useState({ objeto: '', justificativa: '' });

  useEffect(() => {
    loadAuxData();
    if (isEditing) loadDfdData(id);
  }, [id]);

  async function loadAuxData() {
    try {
      const [uns, agts, itens, dots] = await Promise.all([
        CadastrosService.listarUnidades(),
        CadastrosService.listarAgentes(),
        CadastrosService.listarItens(),
        CadastrosService.listarDotacoes()
      ]);
      setUnidades(uns);
      setAgentes(agts);
      setCatalogoItens(itens);
      setListaDotacoes(dots);
    } catch (error) {
      console.error("Erro ao carregar cadastros", error);
    }
  }

  async function loadDfdData(dfdId: string) {
    try {
      const data = await DfdService.buscarPorId(dfdId);
      setFormData(data);
    } catch { alert("Erro ao carregar DFD."); navigate('/processos'); }
  }

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (isEditing && formData.id) {
        await DfdService.atualizar(formData.id, formData);
        alert("✅ DFD Atualizado!");
      } else {
        await DfdService.criar(formData);
        alert("✅ DFD Criado!");
      }
      navigate('/processos');
    } catch (error: any) {
      alert(`Erro: ${error.response?.data?.detail || "Erro ao salvar"}`);
    } finally {
      setLoading(false);
    }
  };

  // --- IA Integration ---
  const runAI = async (field: 'objeto' | 'justificativa', aiFn: () => Promise<string>) => {
    setAiLoading(field);
    try {
        const res = await aiFn();
        setFormData(prev => ({ ...prev, [field]: res }));
    } catch { alert("Erro na IA"); } finally { setAiLoading(null); }
  };

  return (
    // MUDANÇA: 'max-w-5xl mx-auto' -> 'w-full max-w-[1920px] mx-auto' 
    // (Damos um limite gigante de 1920px só pra não quebrar em monitores ultrawide 4k)
    <div className="w-full max-w-[1920px] mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/processos')} className="p-2 hover:bg-gray-200 rounded-full transition"><ArrowLeft size={24} className="text-gray-600" /></button>
          <div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 uppercase">Documento de Formalização</span>
            <h2 className="text-2xl font-bold text-gray-900 mt-1">{isEditing ? `Editando DFD #${formData.numero}` : 'Nova Demanda'}</h2>
          </div>
        </div>
        <button onClick={handleSave} disabled={loading} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm font-medium disabled:opacity-70">
          {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />} Salvar
        </button>
      </div>

      {/* 1. Identificação - GRID AJUSTADO PARA 4 COLUNAS EM TELAS GRANDES */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><FileText size={18}/> Identificação da Demanda</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Número</label>
                <input name="numero" value={formData.numero || ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Ex: 1" />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ano</label>
                <input type="number" name="ano" value={formData.ano} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data Requisição</label>
                <input type="date" name="data_req" value={formData.data_req} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
            </div>
            {/* Unidade e Responsável ocupam o resto */}
            <div className="md:col-span-2 xl:col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unidade Requisitante</label>
                <select name="unidade_requisitante_id" value={formData.unidade_requisitante_id} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition">
                    <option value={0}>Selecione...</option>
                    {unidades.map(u => <option key={u.id} value={u.id}>{u.sigla ? `${u.sigla} - ` : ''}{u.nome}</option>)}
                </select>
            </div>
            <div className="md:col-span-2 xl:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Responsável</label>
                <select name="responsavel_id" value={formData.responsavel_id} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition">
                    <option value={0}>Selecione...</option>
                    {agentes.map(a => <option key={a.id} value={a.id}>{a.nome} ({a.cargo || 'Servidor'})</option>)}
                </select>
            </div>
        </div>
      </div>

      {/* 2. Objeto e Justificativa (Lado a Lado em telas grandes) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AICard 
            title="Objeto da Contratação" color="blue"
            value={formData.objeto || ''} onChange={v => setFormData(p => ({...p, objeto: v}))}
            draft={drafts.objeto} onDraftChange={v => setDrafts(p => ({...p, objeto: v}))}
            loading={aiLoading === 'objeto'}
            onGenerate={() => runAI('objeto', () => AIService.gerarObjeto(drafts.objeto, "Seja técnico e formal."))}
            placeholder="Rascunho..."
        />

        <AICard 
            title="Justificativa da Necessidade" color="purple"
            value={formData.justificativa || ''} onChange={v => setFormData(p => ({...p, justificativa: v}))}
            draft={drafts.justificativa} onDraftChange={v => setDrafts(p => ({...p, justificativa: v}))}
            loading={aiLoading === 'justificativa'}
            onGenerate={() => runAI('justificativa', () => AIService.gerarJustificativa(formData.objeto, drafts.justificativa))}
            placeholder="Motivo..."
        />
      </div>

      {/* 3. Itens e Dotação (Lado a Lado em telas grandes) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
            <DfdItemsTable 
                itens={formData.itens || []} 
                catalogo={catalogoItens}
                onAdd={(newItem) => setFormData(prev => ({ ...prev, itens: [...(prev.itens || []), newItem] }))}
                onRemove={(idx) => setFormData(prev => ({ ...prev, itens: prev.itens?.filter((_, i) => i !== idx) }))}
            />
        </div>
        <div className="xl:col-span-1">
            <DfdDotacaoList 
                dotacoesSelecionadas={formData.dotacoes || []}
                listaDisponivel={listaDotacoes}
                onAdd={(newDot) => setFormData(prev => ({ ...prev, dotacoes: [...(prev.dotacoes || []), newDot] }))}
                onRemove={(idx) => setFormData(prev => ({ ...prev, dotacoes: prev.dotacoes?.filter((_, i) => i !== idx) }))}
            />
        </div>
      </div>

    </div>
  );
}