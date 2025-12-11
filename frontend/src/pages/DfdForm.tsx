import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    DfdService, 
    CadastrosService, 
    AIService, 
    type DFD, 
    type GenericOption, 
    type ItemCatalogo 
} from '../services/api';
import { Save, ArrowLeft, Loader2, FileText, Calendar, User, Building2 } from 'lucide-react';

import { AICard } from '../components/AICard';
import { DfdItemsTable } from '../components/dfd/DfdItemsTable';
import { DfdDotacaoList } from '../components/dfd/DfdDotacaoList';
import { StickyFooter } from '../components/ui/StickyFooter'; 
import { useToast } from '../contexts/ToastContext';       

export function DfdForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToast } = useToast(); 
  const isEditing = !!id;

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

  const [unidades, setUnidades] = useState<GenericOption[]>([]);
  const [agentes, setAgentes] = useState<GenericOption[]>([]);
  const [catalogoItens, setCatalogoItens] = useState<ItemCatalogo[]>([]);
  const [listaDotacoes, setListaDotacoes] = useState<GenericOption[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<any>({});

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      const [u, a, c, d] = await Promise.all([
        CadastrosService.listarUnidades(),
        CadastrosService.listarAgentes(),
        CadastrosService.listarItens(), // CORREÇÃO 1: Nome correto do método
        CadastrosService.listarDotacoes()
      ]);
      setUnidades(u);
      setAgentes(a);
      setCatalogoItens(c);
      setListaDotacoes(d);

      if (isEditing) {
        const dados = await DfdService.buscarPorId(id!);
        if (dados) setFormData(dados);
        else {
            addToast("DFD não encontrado.", "error");
            navigate('/planejamento');
        }
      }
    } catch (error) {
      console.error(error);
      addToast("Erro ao carregar dados do formulário.", "error");
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    if (!formData.objeto || !formData.unidade_requisitante_id) {
      addToast("Por favor, preencha o Objeto e a Unidade Requisitante.", "warning");
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await DfdService.atualizar(Number(id), formData);
        addToast("DFD atualizado com sucesso!", "success");
      } else {
        await DfdService.criar(formData);
        addToast("DFD criado com sucesso!", "success");
      }
      navigate('/meus-processos'); 
    } catch (error) {
      console.error(error);
      addToast("Erro ao salvar o DFD. Tente novamente.", "error");
    } finally {
      setSaving(false);
    }
  };

  const runAI = async (field: 'objeto' | 'justificativa', aiFunction: () => Promise<string>) => {
    setAiLoading(field);
    try {
      const result = await aiFunction();
      setFormData((prev: DFD) => ({ ...prev, [field]: result })); // CORREÇÃO 3: Tipagem explícita
      addToast("Sugestão gerada com sucesso!", "success");
    } catch (error) {
      addToast("Erro na geração via IA. Verifique sua conexão.", "error");
    } finally {
      setAiLoading(null);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="w-full max-w-[1920px] mx-auto pb-32 px-6 transition-all duration-500">
      
      <div className="flex justify-between items-center mb-8 pt-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white hover:bg-gray-100 rounded-full transition shadow-sm border border-gray-200 group">
            <ArrowLeft className="text-gray-500 group-hover:text-blue-600" size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase">
                    {isEditing ? `Editando DFD #${formData.numero}` : 'Nova Requisição'}
                </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                Documento de Formalização
            </h2>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <FileText size={16} /> Dados Administrativos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Número / Ano</label>
                <div className="flex gap-2">
                    <input 
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.numero}
                        onChange={e => setFormData({...formData, numero: e.target.value})}
                        placeholder="001"
                    />
                    <input 
                        type="number"
                        className="w-24 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.ano}
                        onChange={e => setFormData({...formData, ano: parseInt(e.target.value)})}
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                    <Calendar size={12}/> Data da Requisição
                </label>
                <input 
                    type="date"
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.data_req}
                    onChange={e => setFormData({...formData, data_req: e.target.value})}
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                    <Building2 size={12}/> Unidade Requisitante
                </label>
                <select 
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                    value={formData.unidade_requisitante_id}
                    onChange={e => setFormData({...formData, unidade_requisitante_id: parseInt(e.target.value)})}
                >
                    <option value={0}>Selecione...</option>
                    {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                </select>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                    <User size={12}/> Responsável
                </label>
                <select 
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.responsavel_id}
                    onChange={e => setFormData({...formData, responsavel_id: parseInt(e.target.value)})}
                >
                    <option value={0}>Selecione...</option>
                    {agentes.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                </select>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        <AICard 
            title="Objeto da Contratação" 
            color="blue"
            value={formData.objeto} 
            onChange={v => setFormData((p: DFD) => ({...p, objeto: v}))} // CORREÇÃO 3
            draft={drafts.objeto} 
            onDraftChange={v => setDrafts((p: any) => ({...p, objeto: v}))}
            loading={aiLoading === 'objeto'}
            // CORREÇÃO 2: Adicionado argumento de instrução vazio
            onGenerate={() => runAI('objeto', () => AIService.gerarObjeto(drafts.objeto, ""))}
            placeholder="Descreva o que deve ser contratado de forma sucinta..."
        />
        
        <AICard 
            title="Justificativa da Necessidade" 
            color="purple"
            value={formData.justificativa} 
            onChange={v => setFormData((p: DFD) => ({...p, justificativa: v}))} // CORREÇÃO 3
            draft={drafts.justificativa} 
            onDraftChange={v => setDrafts((p: any) => ({...p, justificativa: v}))}
            loading={aiLoading === 'justificativa'}
            onGenerate={() => runAI('justificativa', () => AIService.gerarJustificativa(formData.objeto, drafts.justificativa))}
            placeholder="Explique o porquê desta contratação ser necessária para a administração..."
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
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

      <StickyFooter>
        <div className="flex items-center gap-2 text-sm text-gray-500">
           {saving ? (
             <>
                <Loader2 className="animate-spin text-blue-600" size={16} />
                <span>Salvando requisição...</span>
             </>
           ) : (
             <span>Preencha todos os campos obrigatórios (*).</span>
           )}
        </div>
        
        <div className="flex gap-3">
            <button 
                onClick={() => navigate('/meus-processos')} 
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
            >
                Cancelar
            </button>
            <button 
                onClick={handleSave} 
                disabled={saving} 
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70"
            >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
                {saving ? 'Salvando...' : 'Salvar DFD'}
            </button>
        </div>
      </StickyFooter>

    </div>
  );
}