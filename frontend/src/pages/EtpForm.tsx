import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EtpService, DfdService, AIService, CadastrosService, type ETP, type DFD, type GenericOption } from '../services/api';
import { Save, ArrowLeft, Wand2, Loader2, Calculator, FileText } from 'lucide-react';

// --- Interfaces do Componente ---

interface AICardProps {
  title: string;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'gray';
  value: string;
  onChange: (value: string) => void;
  draft: string;
  onDraftChange: (value: string) => void;
  loading: boolean;
  onGenerate: () => void;
  placeholder: string;
}

export function EtpForm() {
  const { dfdId } = useParams();
  const navigate = useNavigate();
  
  // Estados de Dados
  const [dfd, setDfd] = useState<DFD | null>(null);
  const [etp, setEtp] = useState<ETP | null>(null);
  const [secretarias, setSecretarias] = useState<GenericOption[]>([]);
  const [dotacoes, setDotacoes] = useState<GenericOption[]>([]);
  
  // Estado da Tabela de Preços (Local)
  // Inicializamos com array vazio para evitar erros de map
  const [itensLocal, setItensLocal] = useState<NonNullable<DFD['itens']>>([]);

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'geral' | 'tecnico' | 'economico'>('geral');
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  const [conclusaoViabilidade, setConclusaoViabilidade] = useState('');
  // Inputs de Rascunho para IA
  const [drafts, setDrafts] = useState({
    necessidade: '', solucao: '', requisitos: '', motivacao: '', mercado: '', escolha: '', parcelamento: '', resultados: '', providencias: '', impactos: '', viabilidade: ''
  });

  useEffect(() => {
    if (dfdId) loadAllData(parseInt(dfdId));
  }, [dfdId]);

  async function loadAllData(id: number) {
    try {
      const [dfdData, secs, dots] = await Promise.all([
        DfdService.buscarPorId(id.toString()),
        CadastrosService.listarSecretarias(),
        CadastrosService.listarDotacoes()
      ]);
      
      setDfd(dfdData);
      setItensLocal(dfdData.itens || []); // Garante array
      setSecretarias(secs);
      setDotacoes(dots);

      // Busca ou Cria ETP
      let etpData = await EtpService.buscarPorDfd(id);
      if (!etpData) {
        if (confirm("ETP não encontrado. Deseja iniciar um novo?")) {
          etpData = await EtpService.criar({ dfd_id: id });
        } else {
          navigate('/processos');
          return;
        }
      }
      
      // Preenche valor padrão do PCA se vazio
      if (!etpData.previsao_pca) {
        etpData.previsao_pca = "Até o presente momento não havia sido publicado o Plano Anual de Contratações do município de Braúnas/MG.";
      }
      
      setEtp(etpData);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }

  // --- Handlers de Texto ---
  const handleEtpChange = (field: keyof ETP, value: string) => {
    if (etp) setEtp({ ...etp, [field]: value });
  };

  const handleDraftChange = (field: keyof typeof drafts, value: string) => {
    setDrafts(prev => ({ ...prev, [field]: value }));
  };

  // --- Handlers da Tabela de Preços ---
  const updateItemPrice = (index: number, novoPreco: number) => {
    const novosItens = [...itensLocal];
    novosItens[index].valor_unitario_estimado = novoPreco;
    setItensLocal(novosItens);
  };

  const calcularTotal = () => {
    return itensLocal.reduce((acc, item) => acc + (item.quantidade * item.valor_unitario_estimado), 0);
  };

  // --- IA Generators ---
  const runAI = async (field: keyof ETP, aiFunction: () => Promise<string>) => {
    if (!etp || !dfd) return;
    setAiLoading(field);
    try {
      const result = await aiFunction();
      handleEtpChange(field, result);
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar texto com IA");
    } finally {
      setAiLoading(null);
    }
  };

  // --- Actions ---
  const gerarTextoEstimativa = () => {
    if (!dfd || !etp) return;
    
    const total = calcularTotal();
    const totalFormatado = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    const secNome = secretarias.find(s => s.id === dfd.secretaria_id)?.nome || "Secretaria";
    
    // Tenta achar nome da dotação
    // Nota: dfd.dotacoes é array de objetos {dotacao_id: number}. Cruzamos com a lista completa.
    let dotInfos = "(Definir dotação)";
    if (dfd.dotacoes && dfd.dotacoes.length > 0) {
        const dotIds = dfd.dotacoes.map((d: any) => d.dotacao_id);
        const dotsEncontradas = dotacoes.filter(d => dotIds.includes(d.id));
        if (dotsEncontradas.length > 0) {
            dotInfos = dotsEncontradas.map(d => `${d.numero} (${d.nome})`).join(', ');
        }
    }

    let tabelaTxt = "ITEM | QTD | VALOR UNIT. | TOTAL\n--- | --- | --- | ---\n";
    itensLocal.forEach(i => {
      const totalItem = (i.quantidade * i.valor_unitario_estimado).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
      const unit = i.valor_unitario_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
      tabelaTxt += `${i.item_catalogo.nome} | ${i.quantidade} | R$ ${unit} | R$ ${totalItem}\n`;
    });

    const texto = `O preço estimado da contratação foi definido através da média obtida entre as pesquisas de preços em anexo, mediante a utilização dos parâmetros indicados no inciso I e II do Art. 23º da Lei Federal n° 14.133 de 2021.\n\nO valor total estimado para a contratação é de ${totalFormatado}, conforme detalhamento abaixo:\n\n${tabelaTxt}\n\nA despesa decorrente desta contratação correrá à conta das dotações orçamentárias vigentes, especificamente nas fichas indicadas pela ${secNome}: ${dotInfos}, ou outras que vierem a substituí-las, respeitando a disponibilidade financeira.`;

    handleEtpChange('estimativa_custos', texto);
  };

  const handleSave = async () => {
    if (!etp || !etp.id) return;
    setSaving(true);
    try {
      // 1. Salvar Preços no DFD
      const precosParaSalvar = itensLocal.map(i => ({ id: i.id, valor_unitario_estimado: i.valor_unitario_estimado }));
      await DfdService.atualizarPrecos(precosParaSalvar);

      // 2. Salvar ETP
      await EtpService.atualizar(etp.id, etp);
      
      alert("✅ ETP e Preços salvos com sucesso!");
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !dfd || !etp) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/processos')} className="p-2 hover:bg-gray-200 rounded-full transition"><ArrowLeft /></button>
          <div>
            <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded border border-orange-200">ETP</span>
            <h2 className="text-2xl font-bold text-gray-800">Processo {dfd.numero}</h2>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-sm disabled:opacity-70 transition">
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Salvar Tudo
        </button>
      </div>

      {/* Contexto Rápido */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6 text-sm border border-gray-200">
        <p><strong className="text-gray-700">Objeto:</strong> {dfd.objeto}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[
            { id: 'geral', label: '1. Visão Geral' },
            { id: 'tecnico', label: '2. Técnico & Solução' },
            { id: 'economico', label: '3. Econômico & Estimativa' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2 font-medium transition-all border-b-2 ${
              activeTab === tab.id 
                ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* TAB 1: GERAL */}
        {activeTab === 'geral' && (
          <>
            <AICard 
              title="1. Descrição da Necessidade" 
              color="red"
              value={etp.descricao_necessidade || ''}
              onChange={(v) => handleEtpChange('descricao_necessidade', v)}
              draft={drafts.necessidade}
              onDraftChange={(v) => handleDraftChange('necessidade', v)}
              loading={aiLoading === 'descricao_necessidade'}
              onGenerate={() => runAI('descricao_necessidade', () => AIService.gerarNecessidade(dfd.objeto, dfd.justificativa, drafts.necessidade))}
              placeholder="Fatos novos (ex: surto de dengue)..."
            />
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-700 mb-2">2. Previsão no PCA</h3>
              <textarea 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 outline-none transition" 
                rows={2} 
                value={etp.previsao_pca || ''}
                onChange={e => handleEtpChange('previsao_pca', e.target.value)}
              />
            </div>

            <AICard 
              title="5. Motivação da Contratação" 
              color="yellow"
              value={etp.motivacao_contratacao || ''}
              onChange={(v) => handleEtpChange('motivacao_contratacao', v)}
              draft={drafts.motivacao}
              onDraftChange={(v) => handleDraftChange('motivacao', v)}
              loading={aiLoading === 'motivacao_contratacao'}
              onGenerate={() => runAI('motivacao_contratacao', () => AIService.gerarMotivacao(dfd.objeto, drafts.motivacao))}
              placeholder="Motivo específico (ex: atender recomendação MP)..."
            />

            <AICard 
              title="12. Providências Prévias" 
              color="gray"
              value={etp.providencias_previas || ''}
              onChange={v => handleEtpChange('providencias_previas', v)}
              draft={drafts.providencias}
              onDraftChange={v => handleDraftChange('providencias', v)}
              loading={aiLoading === 'providencias_previas'}
              onGenerate={() => runAI('providencias_previas', () => AIService.gerarProvidencias(dfd.objeto, drafts.providencias, ""))}
              placeholder="Deixe vazio para padrão (Só fiscais) ou cite obras necessárias..."
            />
          </>
        )}

        {/* TAB 2: TÉCNICO */}
        {activeTab === 'tecnico' && (
          <>
            <AICard 
              title="3. Descrição da Solução" 
              color="blue"
              value={etp.descricao_solucao || ''}
              onChange={(v) => handleEtpChange('descricao_solucao', v)}
              draft={drafts.solucao}
              onDraftChange={(v) => handleDraftChange('solucao', v)}
              loading={aiLoading === 'descricao_solucao'}
              onGenerate={() => runAI('descricao_solucao', () => AIService.gerarSolucao(dfd.objeto, etp.requisitos_tecnicos || '', drafts.solucao))}
              placeholder="Instruções de logística (ex: entrega parcelada)..."
            />

            <AICard 
              title="4. Requisitos Técnicos" 
              color="green"
              value={etp.requisitos_tecnicos || ''}
              onChange={(v) => handleEtpChange('requisitos_tecnicos', v)}
              draft={drafts.requisitos}
              onDraftChange={(v) => handleDraftChange('requisitos', v)}
              loading={aiLoading === 'requisitos_tecnicos'}
              onGenerate={() => runAI('requisitos_tecnicos', () => AIService.gerarRequisitos(dfd.objeto, etp.descricao_solucao || '', drafts.requisitos))}
              placeholder="Exigências (ex: garantia 12 meses)..."
            />

            <AICard 
              title="13. Impactos Ambientais" 
              color="green"
              value={etp.impactos_ambientais || ''}
              onChange={v => handleEtpChange('impactos_ambientais', v)}
              draft={drafts.impactos}
              onDraftChange={v => handleDraftChange('impactos', v)}
              loading={aiLoading === 'impactos_ambientais'}
              onGenerate={() => runAI('impactos_ambientais', () => AIService.gerarImpactos(dfd.objeto, drafts.impactos, ""))}
              placeholder="Especifique o resíduo (ex: infectante) ou deixe vazio para padrão..."
            />
          </>
        )}

        {/* TAB 3: ECONÔMICO */}
        {activeTab === 'economico' && (
          <>
            <AICard 
              title="6. Levantamento de Mercado" 
              color="gray"
              value={etp.levantamento_mercado || ''}
              onChange={(v) => handleEtpChange('levantamento_mercado', v)}
              draft={drafts.mercado}
              onDraftChange={(v) => handleDraftChange('mercado', v)}
              loading={aiLoading === 'levantamento_mercado'}
              onGenerate={() => runAI('levantamento_mercado', () => AIService.gerarLevantamento(dfd.objeto, drafts.mercado))}
              placeholder="Onde pesquisou? (ex: Banco de Preços)..."
            />

            <AICard 
              title="7. Justificativa da Escolha" 
              color="gray"
              value={etp.justificativa_escolha || ''}
              onChange={(v) => handleEtpChange('justificativa_escolha', v)}
              draft={drafts.escolha}
              onDraftChange={(v) => handleDraftChange('escolha', v)}
              loading={aiLoading === 'justificativa_escolha'}
              onGenerate={() => runAI('justificativa_escolha', () => AIService.gerarEscolha(dfd.objeto, etp.levantamento_mercado || '', drafts.escolha))}
              placeholder="Motivo da escolha..."
            />

            <AICard 
              title="10. Justificativa do Parcelamento" 
              color="yellow"
              value={etp.justificativa_parcelamento || ''}
              onChange={v => handleEtpChange('justificativa_parcelamento', v)}
              draft={drafts.parcelamento}
              onDraftChange={v => handleDraftChange('parcelamento', v)}
              loading={aiLoading === 'justificativa_parcelamento'}
              onGenerate={() => runAI('justificativa_parcelamento', () => AIService.gerarParcelamento(dfd.objeto, drafts.parcelamento, ""))}
              placeholder="Deixe vazio para parcelamento padrão (Súmula 247 TCU) ou justifique o lote único..."
            />

            <AICard 
              title="11. Demonstrativo de Resultados Pretendidos" 
              color="green"
              value={etp.demonstrativo_resultados || ''}
              onChange={v => handleEtpChange('demonstrativo_resultados', v)}
              draft={drafts.resultados}
              onDraftChange={v => handleDraftChange('resultados', v)}
              loading={aiLoading === 'demonstrativo_resultados'}
              onGenerate={() => runAI('demonstrativo_resultados', () => AIService.gerarResultados(dfd.objeto, drafts.resultados, ""))}
              placeholder="Ex: reduzir filas, evitar quebra de equipamentos..."
            />
            
            {/* CARD 14: VIABILIDADE (GRAND FINALE) */}
            <AICard 
              title="14. Viabilidade da Contratação" 
              color="green" 
              value={conclusaoViabilidade} // Usamos o estado local que criamos no Passo 1
              onChange={v => setConclusaoViabilidade(v)} 
              draft={drafts.viabilidade}
              onDraftChange={v => handleDraftChange('viabilidade', v)}
              loading={aiLoading === 'viabilidade'}
              onGenerate={() => runAI('viabilidade', () => AIService.gerarViabilidade(dfd?.objeto || '', drafts.viabilidade, ""))}
              placeholder="Ressalvas finais ou deixe vazio para conclusão padrão..."
            />

            {/* CHECKBOX FINAL (Salva no Banco) */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex items-start gap-3 mt-4 mb-4">
                <input 
                    type="checkbox" 
                    id="check-viabilidade" 
                    className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-green-500 border-gray-300"
                    checked={etp?.viabilidade || false}
                    onChange={e => handleEtpChange('viabilidade', e.target.checked as any)} 
                />
                <div>
                    <label htmlFor="check-viabilidade" className="font-bold text-green-900 cursor-pointer select-none">
                        DECLARO A VIABILIDADE DA CONTRATAÇÃO
                    </label>
                    <p className="text-sm text-green-800">
                        Com base nos estudos técnicos preliminares realizados, declaro que a contratação é técnica, econômica e legalmente viável.
                    </p>
                </div>
            </div>

            {/* CARD 9: TABELA DE CUSTOS */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-800 overflow-hidden">
              <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2"><Calculator size={18}/> 9. Estimativa de Custos</h3>
                <button onClick={gerarTextoEstimativa} className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded flex items-center gap-1 transition">
                  <FileText size={14}/> Gerar Texto
                </button>
              </div>
              
              <div className="p-6">
                {/* Tabela */}
                <div className="overflow-x-auto mb-6 border rounded-lg">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 uppercase">
                      <tr>
                        <th className="p-3">Item</th>
                        <th className="p-3 text-center">Und.</th>
                        <th className="p-3 text-center">Qtd.</th>
                        <th className="p-3 w-40">Unitário (R$)</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {itensLocal.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="p-3 font-medium">{item.item_catalogo.nome}</td>
                          <td className="p-3 text-center">{item.item_catalogo.unidade_medida}</td>
                          <td className="p-3 text-center">{item.quantidade}</td>
                          <td className="p-3">
                            <input 
                              type="number" 
                              step="0.01"
                              className="w-full p-1.5 border border-gray-300 rounded focus:border-blue-500 outline-none"
                              value={item.valor_unitario_estimado}
                              onChange={e => updateItemPrice(idx, parseFloat(e.target.value))}
                            />
                          </td>
                          <td className="p-3 text-right font-bold text-gray-700">
                            {(item.quantidade * item.valor_unitario_estimado).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 font-bold border-t">
                      <tr>
                        <td colSpan={4} className="p-3 text-right text-gray-600">TOTAL GERAL:</td>
                        <td className="p-3 text-right text-green-600 text-lg">
                          {calcularTotal().toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <label className="block text-sm font-bold text-gray-700 mb-1">Texto Jurídico da Estimativa</label>
                <textarea 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none transition"
                  rows={6}
                  value={etp.estimativa_custos || ''}
                  onChange={e => handleEtpChange('estimativa_custos', e.target.value)}
                />
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
}

// --- Subcomponente de Card com IA (Tipado) ---
function AICard({ title, color, value, onChange, draft, onDraftChange, loading, onGenerate, placeholder }: AICardProps) {
  const colorClasses = {
    red: 'border-red-200 bg-red-50 text-red-900',
    blue: 'border-blue-200 bg-blue-50 text-blue-900',
    green: 'border-green-200 bg-green-50 text-green-900',
    yellow: 'border-yellow-200 bg-yellow-50 text-yellow-900',
    gray: 'border-gray-200 bg-gray-50 text-gray-900',
  };
  
  const headerColors = {
    red: 'bg-red-600', blue: 'bg-blue-600', green: 'bg-green-600', yellow: 'bg-yellow-600', gray: 'bg-gray-700'
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden`}>
      <div className={`${headerColors[color]} text-white px-6 py-3 flex justify-between items-center`}>
        <h3 className="font-bold">{title}</h3>
        <span className="text-xs bg-white/20 px-2 py-1 rounded flex items-center gap-1"><Wand2 size={12}/> IA</span>
      </div>
      <div className="p-6">
        <div className={`flex gap-2 p-3 rounded-lg mb-4 ${colorClasses[color]}`}>
          <input 
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder-current placeholder-opacity-70"
            placeholder={placeholder}
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
          />
          <button 
            onClick={onGenerate} 
            disabled={loading}
            className="bg-white/80 hover:bg-white text-xs px-3 py-1.5 rounded shadow-sm transition disabled:opacity-50 flex items-center gap-1 font-medium"
          >
            {loading ? <Loader2 size={12} className="animate-spin"/> : <Wand2 size={12}/>} Gerar
          </button>
        </div>
        <textarea 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 outline-none transition"
          style={{ borderColor: color }} // Nota: Em CSS real usaria classe focus:ring-color
          rows={5}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}