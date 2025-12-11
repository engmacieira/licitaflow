import { AICard } from '../AICard';
import { EtpCostTable } from './EtpCostTable';
import { AIService, type ETP, type ItemETP } from '../../services/api';
import { CheckCircle2, XCircle } from 'lucide-react';

interface TabProps {
  etp: ETP;
  onChange: (field: keyof ETP, value: any) => void;
  drafts: any;
  onDraftChange: (field: string, value: string) => void;
  onGenerate: (field: keyof ETP, aiFn: () => Promise<string>) => void;
  loadingField: string | null;
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
    <div className="space-y-8">
        
        {/* Seção Superior: Levantamento de Mercado */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <AICard 
                title="6. Levantamento de Mercado" color="gray"
                value={etp.levantamento_mercado || ''} onChange={v => onChange('levantamento_mercado', v)}
                draft={drafts.mercado} onDraftChange={v => onDraftChange('mercado', v)}
                loading={loadingField === 'levantamento_mercado'}
                onGenerate={() => onGenerate('levantamento_mercado', () => AIService.gerarLevantamento(etp.descricao_solucao || '', drafts.mercado))}
                placeholder="Descreva as alternativas de mercado analisadas..."
            />
            
            {/* Card de Decisão de Viabilidade */}
            <div className="flex flex-col h-full">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">14. Declaração de Viabilidade</h3>
                <div 
                    className={`flex-1 relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer group ${
                        etp.viabilidade 
                            ? 'bg-emerald-600 border-emerald-600 shadow-xl shadow-emerald-100' 
                            : 'bg-white border-gray-200 hover:border-emerald-300'
                    }`}
                    onClick={() => onChange('viabilidade', !etp.viabilidade)}
                >
                    {/* Background Pattern decorativo */}
                    {etp.viabilidade && (
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                    )}

                    <div className="relative p-8 flex flex-col items-center justify-center h-full text-center space-y-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                            etp.viabilidade 
                                ? 'bg-white text-emerald-600 scale-110 shadow-lg' 
                                : 'bg-gray-100 text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-500'
                        }`}>
                            {etp.viabilidade ? <CheckCircle2 size={32} strokeWidth={3} /> : <XCircle size={32} />}
                        </div>
                        
                        <div>
                            <h4 className={`text-2xl font-bold ${etp.viabilidade ? 'text-white' : 'text-gray-700'}`}>
                                {etp.viabilidade ? 'VIÁVEL' : 'PENDENTE / INVIÁVEL'}
                            </h4>
                            <p className={`mt-2 text-sm max-w-xs mx-auto ${etp.viabilidade ? 'text-emerald-100' : 'text-gray-500'}`}>
                                {etp.viabilidade 
                                    ? "Atesto que a contratação atende aos requisitos técnicos, econômicos e legais."
                                    : "Clique aqui para declarar a viabilidade técnica e econômica da contratação."
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Tabela Financeira Refatorada */}
        <EtpCostTable 
            itens={itens}
            onUpdatePrice={onUpdatePrice}
            totalGeral={totalGeral}
            onGenerateText={onGenerateCostText}
            textValue={etp.estimativa_custos || ''}
            onTextChange={v => onChange('estimativa_custos', v)}
        />
    </div>
  );
}