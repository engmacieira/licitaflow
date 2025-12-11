import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    EtpService, 
    DfdService, 
    CadastrosService, 
    RiskService,
    type ETP, 
    type DFD, 
    type GenericOption, 
    type ItemETP,
    type MatrizRisco,
    type ItemRisco
} from '../services/api';
import { Save, ArrowLeft, Loader2, ScrollText, AlertTriangle } from 'lucide-react';

// IMPORTAÇÃO DOS MÓDULOS E COMPONENTES PIXEL
import { EtpTabGeneral } from '../components/etp/EtpTabGeneral';
import { EtpTabTechnical } from '../components/etp/EtpTabTechnical';
import { EtpTabEconomic } from '../components/etp/EtpTabEconomic';
import { RiskTable } from '../components/etp/RiskTable';
import { StickyFooter } from '../components/ui/StickyFooter'; // ✨ Novo
import { useToast } from '../contexts/ToastContext';       // ✨ Novo

export function EtpForm() {
  const { dfdId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast(); // Hook do Pixel
  
  // --- Estados de Dados ---
  const [dfd, setDfd] = useState<DFD | null>(null);
  const [etp, setEtp] = useState<ETP | null>(null);
  const [matrizRisco, setMatrizRisco] = useState<MatrizRisco | null>(null);
  
  // --- Estados Auxiliares ---
  const [unidades, setUnidades] = useState<GenericOption[]>([]);
  const [itensLocal, setItensLocal] = useState<ItemETP[]>([]);
  
  // --- Estados de UI ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [riskLoading, setRiskLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'geral' | 'tecnico' | 'economico' | 'riscos'>('geral');
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  const [drafts, setDrafts] = useState<any>({});

  useEffect(() => {
    if (dfdId) loadAllData(parseInt(dfdId));
  }, [dfdId]);

  async function loadAllData(id: number) {
    try {
      const [dfdData, uns] = await Promise.all([
        DfdService.buscarPorId(id.toString()),
        CadastrosService.listarUnidades()
      ]);
      setDfd(dfdData);
      setUnidades(uns);

      const etpData = await EtpService.buscarPorDfd(id);
      if (!etpData) {
        addToast("Este DFD ainda não foi consolidado. Redirecionando...", "error");
        navigate('/planejamento');
        return;
      }
      setEtp(etpData);
      if (etpData.itens) setItensLocal(etpData.itens);

      if (etpData.id) {
          const matriz = await RiskService.buscarPorEtp(etpData.id);
          setMatrizRisco(matriz);
      }

    } catch (error) {
      console.error(error);
      addToast("Erro ao carregar os dados do processo.", "error");
    } finally {
      setLoading(false);
    }
  }

  // --- Handlers Genéricos ---
  const handleEtpChange = (field: keyof ETP, value: any) => etp && setEtp({ ...etp, [field]: value });
  const handleDraftChange = (field: string, value: string) => setDrafts((prev: any) => ({ ...prev, [field]: value }));

  const runAI = async (field: keyof ETP, aiFunction: () => Promise<string>) => {
    if (!etp) return;
    setAiLoading(field as string);
    try {
      const result = await aiFunction();
      handleEtpChange(field, result);
      addToast("Sugestão gerada com sucesso!", "success");
    } catch { 
      addToast("Não foi possível gerar conteúdo com a IA. Tente novamente.", "error"); 
    } finally { 
      setAiLoading(null); 
    }
  };

  // --- Handlers Econômicos ---
  const updateItemPrice = (index: number, newPrice: number) => {
    const novos = [...itensLocal];
    novos[index].valor_unitario_referencia = newPrice;
    setItensLocal(novos);
  };

  const calcularTotal = () => itensLocal.reduce((acc, i) => acc + (i.quantidade_total * i.valor_unitario_referencia), 0);

  const gerarTextoEstimativa = () => {
    if (!dfd) return;
    const total = calcularTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const unidadeNome = unidades.find(u => u.id === dfd.unidade_requisitante_id)?.nome || "Demandantes";
    
    let tb = "ITEM | QTD | UNIT | TOTAL\n---|---|---|---\n";
    itensLocal.forEach(i => {
        const unit = i.valor_unitario_referencia.toLocaleString('pt-BR', {minimumFractionDigits: 2});
        const tot = (i.quantidade_total * i.valor_unitario_referencia).toLocaleString('pt-BR', {minimumFractionDigits: 2});
        tb += `${i.catalogo_item?.nome} | ${i.quantidade_total} | R$ ${unit} | R$ ${tot}\n`;
    });
    
    handleEtpChange('estimativa_custos', `Valor total estimado de ${total} para atender à ${unidadeNome}.\n\n${tb}\n\nValores obtidos mediante pesquisa de mercado anexa.`);
    addToast("Texto de estimativa gerado!", "success");
  };

  // --- Handlers de Risco ---
  const handleAddRisk = async (risco: ItemRisco) => {
      if (!matrizRisco) return;
      try {
        const novo = await RiskService.adicionar(matrizRisco.id, risco);
        setMatrizRisco(prev => prev ? ({...prev, riscos: [...prev.riscos, novo]}) : null);
        addToast("Risco adicionado à matriz.", "success");
      } catch {
        addToast("Erro ao adicionar risco.", "error");
      }
  };

  const handleRemoveRisk = async (id: number) => {
      try {
        await RiskService.remover(id);
        setMatrizRisco(prev => prev ? ({...prev, riscos: prev.riscos.filter(r => r.id !== id)}) : null);
        addToast("Risco removido.", "success");
      } catch {
        addToast("Erro ao remover risco.", "error");
      }
  };

  const handleGenerateRisks = async () => {
      if (!etp?.descricao_necessidade) {
        addToast("Por favor, preencha a 'Descrição da Necessidade' (Aba 1) antes de gerar riscos.", "warning");
        return;
      }
      setRiskLoading(true);
      try {
          const sugestoes = await RiskService.gerarComIA(etp.descricao_necessidade);
          if (matrizRisco) {
              const novosSalvos: ItemRisco[] = [];
              for (const s of sugestoes) {
                  const salvo = await RiskService.adicionar(matrizRisco.id, s);
                  novosSalvos.push(salvo);
              }
              setMatrizRisco(prev => prev ? ({...prev, riscos: [...prev.riscos, ...novosSalvos]}) : null);
              addToast(`${novosSalvos.length} riscos identificados e salvos!`, "success");
          }
      } catch (e) { 
        addToast("Erro ao gerar riscos com IA.", "error"); 
      } 
      finally { setRiskLoading(false); }
  };

  // --- Handler de Desvincular DFD ---
  const handleUnlinkDfd = async (idDfd: number) => {
      if (!etp?.id) return;
      if (!confirm("Tem certeza? Este DFD voltará para a lista de pendentes.")) return; // Mantendo confirm para ação destrutiva crítica
      try {
          await EtpService.desvincularDfd(etp.id, idDfd);
          addToast("DFD desvinculado com sucesso.", "success");
          loadAllData(Number(dfdId)); 
      } catch (e) { 
          addToast("Erro ao tentar desvincular DFD.", "error"); 
      }
  };

  const handleSave = async () => {
    if (!etp?.id) return;
    setSaving(true);
    try {
      await EtpService.atualizarPrecos(itensLocal.map(i => ({ id: i.id, valor_unitario_referencia: i.valor_unitario_referencia })));
      await EtpService.atualizar(etp.id, etp);
      addToast("Alterações salvas com sucesso!", "success");
    } catch { 
      addToast("Não foi possível salvar as alterações.", "error"); 
    } finally { 
      setSaving(false); 
    }
  };

  if (loading || !etp || !dfd) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  const tabProps = {
    etp, onChange: handleEtpChange, drafts, onDraftChange: handleDraftChange, onGenerate: runAI, loadingField: aiLoading
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto pb-32 px-6 transition-all duration-500">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 pt-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/planejamento')} className="p-2.5 bg-white hover:bg-gray-100 rounded-full transition shadow-sm border border-gray-200 group">
            <ArrowLeft className="text-gray-500 group-hover:text-blue-600" size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase">Planejamento #{etp.id}</span>
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 uppercase">Origem: DFD {dfd.numero}</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Estudo Técnico Preliminar</h2>
          </div>
        </div>

        {/* Atalhos Superiores (Apenas Navegação) */}
        <div className="flex gap-2">
            {etp.viabilidade && (
                <button 
                    onClick={() => navigate(`/tr/${etp.id}`)}
                    className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-xl hover:bg-slate-50 shadow-sm flex items-center gap-2 font-bold transition text-sm"
                >
                    <ScrollText size={18} /> Ir para Termo de Ref.
                </button>
            )}
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm w-fit overflow-x-auto">
        {[
            { id: 'geral', label: '1. Visão Geral' },
            { id: 'tecnico', label: '2. Técnico & Solução' },
            { id: 'economico', label: '3. Econômico & Viabilidade' },
            { id: 'riscos', label: '4. Gestão de Riscos' }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)} 
            className={`px-5 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO */}
      <div className="animate-in fade-in slide-in-from-bottom-4">
        {activeTab === 'geral' && (
            <EtpTabGeneral 
                {...tabProps} 
                dfdsVinculados={etp.dfds} 
                onUnlink={handleUnlinkDfd}
            />
        )}

        {activeTab === 'tecnico' && <EtpTabTechnical {...tabProps} />}

        {activeTab === 'economico' && (
            <EtpTabEconomic 
                {...tabProps}
                itens={itensLocal}
                onUpdatePrice={updateItemPrice}
                totalGeral={calcularTotal()}
                onGenerateCostText={gerarTextoEstimativa}
            />
        )}

        {activeTab === 'riscos' && matrizRisco && (
            <RiskTable 
                riscos={matrizRisco.riscos || []}
                onAdd={handleAddRisk}
                onRemove={handleRemoveRisk}
                onGenerate={handleGenerateRisks}
                loadingIA={riskLoading}
            />
        )}
      </div>

      {/* --- STICKY FOOTER (BARRA DE AÇÕES) --- */}
      <StickyFooter>
        <div className="flex items-center gap-2 text-sm text-gray-500">
           {saving ? (
             <>
                <Loader2 className="animate-spin text-indigo-600" size={16} />
                <span>Salvando alterações...</span>
             </>
           ) : (
             <>
                <AlertTriangle size={16} className="text-amber-500" />
                <span>Lembre-se de salvar antes de sair.</span>
             </>
           )}
        </div>
        
        <div className="flex gap-3">
            <button 
                onClick={() => navigate('/planejamento')} 
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
            >
                Cancelar
            </button>
            <button 
                onClick={handleSave} 
                disabled={saving} 
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
            >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
                {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
        </div>
      </StickyFooter>

    </div>
  );
}