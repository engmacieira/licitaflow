import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TrService, type TR } from '../services/api';
import { Save, ArrowLeft, Loader2, ScrollText, AlertTriangle } from 'lucide-react';

// COMPONENTES MODULARES & PIXEL UI
import { TrTabDefinition } from '../components/tr/TrTabDefinition';
import { TrTabExecution } from '../components/tr/TrTabExecution';
import { TrTabPayment } from '../components/tr/TrTabPayment';
import { TrTabObligations } from '../components/tr/TrTabObligations';
import { StickyFooter } from '../components/ui/StickyFooter'; // ✨ Barra Fixa
import { useToast } from '../contexts/ToastContext';       // ✨ Notificações

export function TrForm() {
  const { etpId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  // Estados
  const [tr, setTr] = useState<TR | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'definicao' | 'execucao' | 'pagamento' | 'obrigacoes'>('definicao');
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (etpId) loadData(parseInt(etpId));
  }, [etpId]);

  async function loadData(id: number) {
    try {
      // Tenta buscar o TR. Se não existir, o backend deve criar ou retornar 404.
      // Assumindo que seu Service já trata a criação se necessário, ou retorna null.
      const trData = await TrService.buscarPorEtp(id);
      
      if (!trData) {
        addToast("Matriz de Riscos ou ETP incompleto. Finalize o planejamento antes.", "error");
        navigate(`/planejamento`); // Redireciona para segurança
        return;
      }
      setTr(trData);

    } catch (error) {
      console.error(error);
      addToast("Erro ao carregar o Termo de Referência.", "error");
    } finally {
      setLoading(false);
    }
  }

  const handleTrChange = (field: keyof TR, value: string) => {
    if (tr) setTr({ ...tr, [field]: value });
  };

  const handleDraftChange = (field: string, value: string) => {
    setDrafts(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!tr?.id) return;
    setSaving(true);
    try {
      await TrService.atualizar(tr.id, tr);
      addToast("Minuta do Termo de Referência salva com sucesso!", "success");
    } catch { 
      addToast("Não foi possível salvar a minuta.", "error"); 
    } finally { 
      setSaving(false); 
    }
  };

  const runAI = async (field: keyof TR, sectionType: string) => {
    if (!tr || !etpId) return;
    setAiLoading(field as string);
    try {
      const text = await TrService.gerarClausula(parseInt(etpId), sectionType);
      handleTrChange(field, text);
      addToast("Cláusula gerada pela IA Jurídica.", "success");
    } catch (e) {
      addToast("Erro ao gerar conteúdo com a IA.", "error");
    } finally {
      setAiLoading(null);
    }
  };

  if (loading || !tr) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-slate-600" size={40} /></div>;

  // Props comuns para todas as abas
  const tabProps = {
      tr, 
      onChange: handleTrChange, 
      drafts, 
      onDraftChange: handleDraftChange, 
      onGenerate: runAI, 
      loadingField: aiLoading
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto pb-32 px-6 transition-all duration-500">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 pt-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white hover:bg-gray-100 rounded-full transition shadow-sm border border-gray-200 group">
            <ArrowLeft className="text-gray-500 group-hover:text-slate-800" size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase">
                    Minuta Contratual
                </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <ScrollText className="text-slate-600"/> Termo de Referência
            </h2>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm w-fit overflow-x-auto">
        {[
            { id: 'definicao', label: '1. Definição do Objeto' },
            { id: 'execucao', label: '2. Execução e Recebimento' },
            { id: 'pagamento', label: '3. Pagamento e Seleção' },
            { id: 'obrigacoes', label: '4. Obrigações e Sanções' }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)} 
            className={`px-5 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-slate-100 text-slate-800 shadow-sm ring-1 ring-slate-200' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO MODULARIZADO */}
      <div className="animate-in fade-in slide-in-from-bottom-4">
        {activeTab === 'definicao' && <TrTabDefinition {...tabProps} />}
        {activeTab === 'execucao' && <TrTabExecution {...tabProps} />}
        {activeTab === 'pagamento' && <TrTabPayment {...tabProps} />}
        {activeTab === 'obrigacoes' && <TrTabObligations {...tabProps} />}
      </div>

      {/* --- STICKY FOOTER --- */}
      <StickyFooter>
        <div className="flex items-center gap-2 text-sm text-gray-500">
           {saving ? (
             <>
                <Loader2 className="animate-spin text-slate-600" size={16} />
                <span>Salvando minuta...</span>
             </>
           ) : (
             <>
                <AlertTriangle size={16} className="text-amber-500" />
                <span>Documento Jurídico. Revise antes de salvar.</span>
             </>
           )}
        </div>
        
        <div className="flex gap-3">
            <button 
                onClick={() => navigate(-1)} 
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
            >
                Voltar
            </button>
            <button 
                onClick={handleSave} 
                disabled={saving} 
                className="bg-slate-800 text-white px-6 py-2.5 rounded-lg hover:bg-slate-900 shadow-lg shadow-slate-300 font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
            >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
                {saving ? 'Salvando...' : 'Salvar Minuta'}
            </button>
        </div>
      </StickyFooter>

    </div>
  );
}