import type { TR } from '../../services/api';
import { AICard } from '../AICard';

interface TabProps {
  tr: TR;
  onChange: (field: keyof TR, value: string) => void;
  drafts: any;
  onDraftChange: (field: string, value: string) => void;
  onGenerate: (field: keyof TR, section: string) => void;
  loadingField: string | null;
}

export function TrTabPayment({ tr, onChange, drafts, onDraftChange, onGenerate, loadingField }: TabProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Coluna Esquerda: Financeiro */}
        <div className="space-y-8">
            <AICard 
                title="7. Critérios de Pagamento" 
                color="green"
                value={tr.criterio_pagamento || ''} 
                onChange={v => onChange('criterio_pagamento', v)}
                draft={drafts.criterio_pagamento} 
                onDraftChange={v => onDraftChange('criterio_pagamento', v)}
                loading={loadingField === 'criterio_pagamento'}
                onGenerate={() => onGenerate('criterio_pagamento', 'pagamento')}
                placeholder="Prazo para pagamento após ateste, cronograma de desembolso..."
            />
            
            <AICard 
                title="8. Liquidação da Despesa" 
                color="green"
                value={tr.criterio_liquidacao || ''} 
                onChange={v => onChange('criterio_liquidacao', v)}
                draft={drafts.criterio_liquidacao} 
                onDraftChange={v => onDraftChange('criterio_liquidacao', v)}
                loading={loadingField === 'criterio_liquidacao'}
                onGenerate={() => onGenerate('criterio_liquidacao', 'pagamento')}
                placeholder="Documentos exigidos para a nota fiscal, certidões necessárias..."
            />
        </div>

        {/* Coluna Direita: Seleção */}
        <div className="space-y-8">
            <AICard 
                title="9. Forma de Seleção" 
                color="blue"
                value={tr.forma_selecao || ''} 
                onChange={v => onChange('forma_selecao', v)}
                draft={drafts.forma_selecao} 
                onDraftChange={v => onDraftChange('forma_selecao', v)}
                loading={loadingField === 'forma_selecao'}
                onGenerate={() => onGenerate('forma_selecao', 'qualificacao')}
                placeholder="Ex: Pregão Eletrônico, Dispensa de Licitação, Inexigibilidade..."
            />
            
            <AICard 
                title="10. Habilitação e Qualificação" 
                color="blue"
                value={tr.habilitacao || ''} 
                onChange={v => onChange('habilitacao', v)}
                draft={drafts.habilitacao} 
                onDraftChange={v => onDraftChange('habilitacao', v)}
                loading={loadingField === 'habilitacao'}
                onGenerate={() => onGenerate('habilitacao', 'qualificacao')}
                placeholder="Qualificação técnica e econômico-financeira exigida..."
            />
        </div>

    </div>
  );
}