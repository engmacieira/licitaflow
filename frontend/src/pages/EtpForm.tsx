import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EtpService, DfdService, AIService, CadastrosService, type ETP, type DFD, type GenericOption, type ItemETP } from '../services/api';
import { Save, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

// Import dos novos componentes modulares
import { AICard } from '../components/AICard';
import { EtpCostTable } from '../components/etp/EtpCostTable';

export function EtpForm() {
  const { dfdId } = useParams();
  const navigate = useNavigate();
  
  // --- Estados ---
  const [dfd, setDfd] = useState<DFD | null>(null);
  const [etp, setEtp] = useState<ETP | null>(null);
  const [unidades, setUnidades] = useState<GenericOption[]>([]);
  const [dotacoes, setDotacoes] = useState<GenericOption[]>([]);
  const [itensLocal, setItensLocal] = useState<ItemETP[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'geral' | 'tecnico' | 'economico'>('geral');
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  const [drafts, setDrafts] = useState({
    necessidade: '', solucao: '', requisitos: '', motivacao: '', 
    mercado: '', escolha: '', parcelamento: '', resultados: '', 
    providencias: '', impactos: '', viabilidade: ''
  });

  // --- Efeitos ---
  useEffect(() => {
    if (dfdId) loadAllData(parseInt(dfdId));
  }, [dfdId]);

  // --- Carregamento ---
  async function loadAllData(id: number) {
    try {
      const [dfdData, uns, dots] = await Promise.all([
        DfdService.buscarPorId(id.toString()),
        CadastrosService.listarUnidades(),
        CadastrosService.listarDotacoes()
      ]);
      setDfd(dfdData);
      setUnidades(uns);
      setDotacoes(dots);

      const etpData = await EtpService.buscarPorDfd(id);
      if (!etpData) {
        alert("Este DFD não possui ETP. Redirecionando para o Planejamento.");
        navigate('/planejamento');
        return;
      }
      setEtp(etpData);
      if (etpData.itens) setItensLocal(etpData.itens);

    } catch (error) {
      console.error(error);
      alert("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }

  // --- Lógica de Negócio ---
  const handleEtpChange = (field: keyof ETP, value: any) => etp && setEtp({ ...etp, [field]: value });
  const handleDraftChange = (field: keyof typeof drafts, value: string) => setDrafts(prev => ({ ...prev, [field]: value }));

  const updateItemPrice = (index: number, newPrice: number) => {
    const novos = [...itensLocal];
    novos[index].valor_unitario_referencia = newPrice;
    setItensLocal(novos);
  };

  const calcularTotal = () => itensLocal.reduce((acc, i) => acc + (i.quantidade_total * i.valor_unitario_referencia), 0);

  // --- Integração IA ---
  const runAI = async (field: keyof ETP, aiFunction: () => Promise<string>) => {
    if (!etp || !dfd) return;
    setAiLoading(field);
    try {
      const result = await aiFunction();
      handleEtpChange(field, result);
    } catch { alert("Erro na IA"); } finally { setAiLoading(null); }
  };

  const gerarTextoEstimativa = () => {
    if (!dfd) return;
    const total = calcularTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const unidadeNome = unidades.find(u => u.id === dfd.unidade_requisitante_id)?.nome || "Secretaria";
    
    let tb = "ITEM | QTD | UNIT | TOTAL\n---|---|---|---\n";
    itensLocal.forEach(i => tb += `${i.catalogo_item.nome} | ${i.quantidade_total} | ${i.valor_unitario_referencia} | ${i.quantidade_total * i.valor_unitario_referencia}\n`);
    
    handleEtpChange('estimativa_custos', `Valor total estimado de ${total} para atender à ${unidadeNome}.\n\n${tb}`);
  };

  const handleSave = async () => {
    if (!etp?.id) return;
    setSaving(true);
    try {
      await EtpService.atualizarPrecos(itensLocal.map(i => ({ id: i.id, valor_unitario_referencia: i.valor_unitario_referencia })));
      await EtpService.atualizar(etp.id, etp);
      alert("✅ Salvo com sucesso!");
    } catch { alert("Erro ao salvar."); } finally { setSaving(false); }
  };

  if (loading || !etp || !dfd) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="w-full max-w-[1920px] mx-auto pb-24 px-6 transition-all duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center mb-8 pt-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/planejamento')} 
            className="p-2.5 bg-white hover:bg-gray-100 rounded-full transition shadow-sm border border-gray-200 group"
            title="Voltar ao Planejamento"
          >
            <ArrowLeft className="text-gray-500 group-hover:text-blue-600 transition-colors" size={20} />
          </button>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase">
                    Planejamento #{etp.id}
                </span>
                <span className="text-[10px] font-bold tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 uppercase">
                    Origem: DFD {dfd.numero}/{dfd.ano}
                </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Estudo Técnico Preliminar</h2>
          </div>
        </div>

        <button 
          onClick={handleSave} 
          disabled={saving} 
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 font-bold disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} 
          Salvar Alterações
        </button>
      </div>

      {/* --- NAVEGAÇÃO (TABS) --- */}
      <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm w-fit">
        {[
            { id: 'geral', label: '1. Visão Geral' },
            { id: 'tecnico', label: '2. Técnico & Solução' },
            { id: 'economico', label: '3. Econômico & Viabilidade' }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)} 
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- CONTEÚDO DAS ABAS --- */}
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* === ABA 1: GERAL === */}
        {activeTab === 'geral' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Coluna Esquerda */}
            <div className="space-y-8">
                <AICard 
                  title="1. Descrição da Necessidade" color="red"
                  value={etp.descricao_necessidade || ''} onChange={v => handleEtpChange('descricao_necessidade', v)}
                  draft={drafts.necessidade} onDraftChange={v => handleDraftChange('necessidade', v)}
                  loading={aiLoading === 'descricao_necessidade'}
                  onGenerate={() => runAI('descricao_necessidade', () => AIService.gerarNecessidade(dfd.objeto, dfd.justificativa, drafts.necessidade))}
                  placeholder="Descreva o problema a ser resolvido com detalhes..."
                />
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition duration-300 group">
                  <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide group-hover:text-gray-900 transition-colors">
                    2. Previsão no PCA
                  </h3>
                  <textarea 
                    className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 outline-none transition text-gray-700 bg-gray-50 focus:bg-white resize-y min-h-[120px]" 
                    rows={4} 
                    value={etp.previsao_pca || ''} 
                    onChange={e => handleEtpChange('previsao_pca', e.target.value)}
                  />
                </div>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-8">
                <AICard 
                  title="5. Motivação da Contratação" color="yellow"
                  value={etp.motivacao_contratacao || ''} onChange={v => handleEtpChange('motivacao_contratacao', v)}
                  draft={drafts.motivacao} onDraftChange={v => handleDraftChange('motivacao', v)}
                  loading={aiLoading === 'motivacao_contratacao'}
                  onGenerate={() => runAI('motivacao_contratacao', () => AIService.gerarMotivacao(dfd.objeto, drafts.motivacao))}
                  placeholder="Qual o interesse público envolvido? Por que agora?"
                />

                <AICard 
                  title="12. Providências Prévias" color="gray"
                  value={etp.providencias_previas || ''} onChange={v => handleEtpChange('providencias_previas', v)}
                  draft={drafts.providencias} onDraftChange={v => handleDraftChange('providencias', v)}
                  loading={aiLoading === 'providencias_previas'}
                  onGenerate={() => runAI('providencias_previas', () => AIService.gerarProvidencias(dfd.objeto, drafts.providencias, ""))}
                  placeholder="Adequações físicas, elétricas, designação de fiscais..."
                />
            </div>
          </div>
        )}

        {/* === ABA 2: TÉCNICO === */}
        {activeTab === 'tecnico' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-8">
                <AICard 
                  title="3. Descrição da Solução" color="blue"
                  value={etp.descricao_solucao || ''} onChange={v => handleEtpChange('descricao_solucao', v)}
                  draft={drafts.solucao} onDraftChange={v => handleDraftChange('solucao', v)}
                  loading={aiLoading === 'descricao_solucao'}
                  onGenerate={() => runAI('descricao_solucao', () => AIService.gerarSolucao(dfd.objeto, etp.requisitos_tecnicos || '', drafts.solucao))}
                  placeholder="Especificações, logística de entrega, prazos..."
                />

                <AICard 
                  title="13. Impactos Ambientais" color="green"
                  value={etp.impactos_ambientais || ''} onChange={v => handleEtpChange('impactos_ambientais', v)}
                  draft={drafts.impactos} onDraftChange={v => handleDraftChange('impactos', v)}
                  loading={aiLoading === 'impactos_ambientais'}
                  onGenerate={() => runAI('impactos_ambientais', () => AIService.gerarImpactos(dfd.objeto, drafts.impactos, ""))}
                  placeholder="Sustentabilidade, descarte de resíduos..."
                />
            </div>

            <div className="space-y-8">
                <AICard 
                  title="4. Requisitos Técnicos" color="green"
                  value={etp.requisitos_tecnicos || ''} onChange={v => handleEtpChange('requisitos_tecnicos', v)}
                  draft={drafts.requisitos} onDraftChange={v => handleDraftChange('requisitos', v)}
                  loading={aiLoading === 'requisitos_tecnicos'}
                  onGenerate={() => runAI('requisitos_tecnicos', () => AIService.gerarRequisitos(dfd.objeto, etp.descricao_solucao || '', drafts.requisitos))}
                  placeholder="Garantia, normas ABNT/Inmetro, qualificação técnica..."
                />
            </div>
          </div>
        )}

        {/* === ABA 3: ECONÔMICO === */}
        {activeTab === 'economico' && (
          <>
            {/* Linha Superior: Mercado e Escolha */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <AICard 
                  title="6. Levantamento de Mercado" color="gray"
                  value={etp.levantamento_mercado || ''} onChange={v => handleEtpChange('levantamento_mercado', v)}
                  draft={drafts.mercado} onDraftChange={v => handleDraftChange('mercado', v)}
                  loading={aiLoading === 'levantamento_mercado'}
                  onGenerate={() => runAI('levantamento_mercado', () => AIService.gerarLevantamento(dfd.objeto, drafts.mercado))}
                  placeholder="Fontes consultadas (Banco de Preços, Mídia, Fornecedores)..."
                />

                <AICard 
                  title="7. Justificativa da Escolha" color="gray"
                  value={etp.justificativa_escolha || ''} onChange={v => handleEtpChange('justificativa_escolha', v)}
                  draft={drafts.escolha} onDraftChange={v => handleDraftChange('escolha', v)}
                  loading={aiLoading === 'justificativa_escolha'}
                  onGenerate={() => runAI('justificativa_escolha', () => AIService.gerarEscolha(dfd.objeto, etp.levantamento_mercado || '', drafts.escolha))}
                  placeholder="Por que esta solução é a mais vantajosa para a administração?"
                />
            </div>

            {/* Linha do Meio: Parcelamento e Resultados */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <AICard 
                  title="10. Justificativa do Parcelamento" color="yellow"
                  value={etp.justificativa_parcelamento || ''} onChange={v => handleEtpChange('justificativa_parcelamento', v)}
                  draft={drafts.parcelamento} onDraftChange={v => handleDraftChange('parcelamento', v)}
                  loading={aiLoading === 'justificativa_parcelamento'}
                  onGenerate={() => runAI('justificativa_parcelamento', () => AIService.gerarParcelamento(dfd.objeto, drafts.parcelamento, ""))}
                  placeholder="Regra: Parcelamento (Súmula 247 TCU). Justifique se for lote único."
                />

                <AICard 
                  title="11. Demonstrativo de Resultados" color="green"
                  value={etp.demonstrativo_resultados || ''} onChange={v => handleEtpChange('demonstrativo_resultados', v)}
                  draft={drafts.resultados} onDraftChange={v => handleDraftChange('resultados', v)}
                  loading={aiLoading === 'demonstrativo_resultados'}
                  onGenerate={() => runAI('demonstrativo_resultados', () => AIService.gerarResultados(dfd.objeto, drafts.resultados, ""))}
                  placeholder="Ganhos esperados em eficiência, economia ou qualidade..."
                />
            </div>
            
            {/* Tabela de Custos (Modularizada - Full Width) */}
            <div className="w-full">
                <EtpCostTable 
                    itens={itensLocal}
                    onUpdatePrice={updateItemPrice}
                    totalGeral={calcularTotal()}
                    textValue={etp.estimativa_custos || ''}
                    onTextChange={v => handleEtpChange('estimativa_custos', v)}
                    onGenerateText={gerarTextoEstimativa}
                />
            </div>

            {/* Conclusão Final (Card de Destaque) */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-8 border border-emerald-100 shadow-sm mt-8">
                <h3 className="text-xl font-bold text-emerald-900 mb-6 flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-600" /> Conclusão do Estudo
                </h3>
                
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2">
                        <AICard 
                            title="14. Parecer de Viabilidade" color="green"
                            value={etp.conclusao_viabilidade || ''} onChange={v => handleEtpChange('conclusao_viabilidade', v)}
                            draft={drafts.viabilidade} onDraftChange={v => handleDraftChange('viabilidade', v)}
                            loading={aiLoading === 'viabilidade'}
                            onGenerate={() => runAI('viabilidade', () => AIService.gerarViabilidade(dfd.objeto, drafts.viabilidade, ""))}
                            placeholder="Conclusão final: A contratação é técnica e economicamente viável?"
                        />
                    </div>
                    
                    <div className="xl:col-span-1 flex flex-col justify-center">
                        <div 
                            className={`group cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 ${
                                etp.viabilidade 
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105' 
                                    : 'bg-white border-gray-200 text-gray-500 hover:border-emerald-300 hover:bg-emerald-50'
                            }`}
                            onClick={() => handleEtpChange('viabilidade', !etp.viabilidade)}
                        >
                            <div className="flex items-center gap-4 mb-2">
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    etp.viabilidade ? 'bg-white border-white text-emerald-600' : 'border-gray-300'
                                }`}>
                                    {etp.viabilidade && <CheckCircle2 size={20} strokeWidth={3} />}
                                </div>
                                <span className="font-bold text-lg">DECLARO VIÁVEL</span>
                            </div>
                            <p className={`text-sm ${etp.viabilidade ? 'text-emerald-100' : 'text-gray-400 group-hover:text-emerald-700'}`}>
                                Atesto que a contratação atende aos requisitos técnicos, econômicos e legais, recomendando o prosseguimento.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}