import { AICard } from '../AICard';
import { EtpCostTable } from './EtpCostTable';
import { AIService, type ETP, type ItemETP } from '../../services/api';
import { CheckCircle2 } from 'lucide-react';

interface TabProps {
  etp: ETP;
  onChange: (field: keyof ETP, value: any) => void;
  drafts: any;
  onDraftChange: (field: string, value: string) => void;
  onGenerate: (field: keyof ETP, aiFn: () => Promise<string>) => void;
  loadingField: string | null;
  // Props extras para Tabela de Custos
  itens: ItemETP[];
  onUpdatePrice: (idx: number, val: number) => void;
  totalGeral: number;
  onGenerateCostText: () => void;
}

export function EtpTabEconomic({ 
    etp, onChange, drafts, onDraftChange, onGenerate, loadingField,
    itens, onUpdatePrice, totalGeral, onGenerateCostText 
}: TabProps) {
  return (
    <>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <AICard 
                title="6. Levantamento de Mercado" color="gray"
                value={etp.levantamento_mercado || ''} onChange={v => onChange('levantamento_mercado', v)}
                draft={drafts.mercado} onDraftChange={v => onDraftChange('mercado', v)}
                loading={loadingField === 'levantamento_mercado'}
                onGenerate={() => onGenerate('levantamento_mercado', () => AIService.gerarLevantamento(etp.descricao_necessidade || '', drafts.mercado))}
                placeholder="Fontes consultadas (Banco de Preços, Fornecedores)..."
            />
            <AICard 
                title="7. Justificativa da Escolha" color="gray"
                value={etp.justificativa_escolha || ''} onChange={v => onChange('justificativa_escolha', v)}
                draft={drafts.escolha} onDraftChange={v => onDraftChange('escolha', v)}
                loading={loadingField === 'justificativa_escolha'}
                onGenerate={() => onGenerate('justificativa_escolha', () => AIService.gerarEscolha(etp.descricao_necessidade || '', etp.levantamento_mercado || '', drafts.escolha))}
                placeholder="Por que esta solução é a mais vantajosa?"
            />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
            <AICard 
                title="10. Justificativa do Parcelamento" color="yellow"
                value={etp.justificativa_parcelamento || ''} onChange={v => onChange('justificativa_parcelamento', v)}
                draft={drafts.parcelamento} onDraftChange={v => onDraftChange('parcelamento', v)}
                loading={loadingField === 'justificativa_parcelamento'}
                onGenerate={() => onGenerate('justificativa_parcelamento', () => AIService.gerarParcelamento(etp.descricao_necessidade || '', drafts.parcelamento, ""))}
                placeholder="Regra: Parcelamento. Justifique se for lote único."
            />
            <AICard 
                title="11. Demonstrativo de Resultados" color="green"
                value={etp.demonstrativo_resultados || ''} onChange={v => onChange('demonstrativo_resultados', v)}
                draft={drafts.resultados} onDraftChange={v => onDraftChange('resultados', v)}
                loading={loadingField === 'demonstrativo_resultados'}
                onGenerate={() => onGenerate('demonstrativo_resultados', () => AIService.gerarResultados(etp.descricao_necessidade || '', drafts.resultados, ""))}
                placeholder="Ganhos esperados em eficiência, economia ou qualidade..."
            />
        </div>
        
        {/* Tabela de Custos Modularizada */}
        <div className="w-full mt-8">
            <EtpCostTable 
                itens={itens}
                onUpdatePrice={onUpdatePrice}
                totalGeral={totalGeral}
                textValue={etp.estimativa_custos || ''}
                onTextChange={v => onChange('estimativa_custos', v)}
                onGenerateText={onGenerateCostText}
            />
        </div>

        {/* Viabilidade */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-8 border border-emerald-100 shadow-sm mt-8">
            <h3 className="text-xl font-bold text-emerald-900 mb-6 flex items-center gap-2">
                <CheckCircle2 className="text-emerald-600" /> Conclusão do Estudo
            </h3>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                    <AICard 
                        title="14. Parecer de Viabilidade" color="green"
                        value={etp.conclusao_viabilidade || ''} onChange={v => onChange('conclusao_viabilidade', v)}
                        draft={drafts.viabilidade} onDraftChange={v => onDraftChange('viabilidade', v)}
                        loading={loadingField === 'viabilidade'}
                        onGenerate={() => onGenerate('viabilidade', () => AIService.gerarViabilidade(etp.descricao_necessidade || '', drafts.viabilidade, ""))}
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
                        onClick={() => onChange('viabilidade', !etp.viabilidade)}
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
                            Atesto que a contratação atende aos requisitos técnicos, econômicos e legais.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </>
  );
}