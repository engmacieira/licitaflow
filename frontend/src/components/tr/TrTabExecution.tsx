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

export function TrTabExecution({ tr, onChange, drafts, onDraftChange, onGenerate, loadingField }: TabProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Card 4: Execução */}
        <AICard 
            title="4. Estratégia de Execução" 
            color="purple"
            value={tr.estrategia_execucao || ''} 
            onChange={v => onChange('estrategia_execucao', v)}
            draft={drafts.estrategia_execucao} 
            onDraftChange={v => onDraftChange('estrategia_execucao', v)}
            loading={loadingField === 'estrategia_execucao'}
            onGenerate={() => onGenerate('estrategia_execucao', 'execucao')}
            placeholder="Descreva como o serviço será executado ou o produto entregue, cronogramas, horários..."
        />

        {/* Card 5: Recebimento */}
        <AICard 
            title="5. Critérios de Recebimento" 
            color="orange"
            value={tr.criterio_recebimento || ''} 
            onChange={v => onChange('criterio_recebimento', v)}
            draft={drafts.criterio_recebimento} 
            onDraftChange={v => onDraftChange('criterio_recebimento', v)}
            loading={loadingField === 'criterio_recebimento'}
            onGenerate={() => onGenerate('criterio_recebimento', 'execucao')}
            placeholder="Defina como será o aceite provisório e definitivo, testes de qualidade e conformidade..."
        />

        {/* Card 6: Gestão (Largura Total) */}
        <div className="xl:col-span-2">
            <AICard 
                title="6. Gestão e Fiscalização do Contrato" 
                color="gray"
                value={tr.gestao_contrato || ''} 
                onChange={v => onChange('gestao_contrato', v)}
                draft={drafts.gestao_contrato} 
                onDraftChange={v => onDraftChange('gestao_contrato', v)}
                loading={loadingField === 'gestao_contrato'}
                onGenerate={() => onGenerate('gestao_contrato', 'fiscalizacao')}
                placeholder="Indique quem será o fiscal (ou equipe), suas atribuições e os procedimentos de acompanhamento..."
            />
        </div>
        
    </div>
  );
}