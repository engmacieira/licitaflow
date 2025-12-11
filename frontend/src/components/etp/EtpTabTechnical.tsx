import { AICard } from '../AICard';
import { AIService, type ETP } from '../../services/api';

interface TabProps {
  etp: ETP;
  onChange: (field: keyof ETP, value: any) => void;
  drafts: any;
  onDraftChange: (field: string, value: string) => void;
  onGenerate: (field: keyof ETP, aiFn: () => Promise<string>) => void;
  loadingField: string | null;
}

export function EtpTabTechnical({ etp, onChange, drafts, onDraftChange, onGenerate, loadingField }: TabProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-8">
            <AICard 
                title="3. Descrição da Solução" color="blue"
                value={etp.descricao_solucao || ''} onChange={v => onChange('descricao_solucao', v)}
                draft={drafts.solucao} onDraftChange={v => onDraftChange('solucao', v)}
                loading={loadingField === 'descricao_solucao'}
                onGenerate={() => onGenerate('descricao_solucao', () => AIService.gerarSolucao(etp.descricao_necessidade || '', etp.requisitos_tecnicos || '', drafts.solucao))}
                placeholder="Especificações, logística de entrega, prazos..."
            />
            <AICard 
                title="13. Impactos Ambientais" color="green"
                value={etp.impactos_ambientais || ''} onChange={v => onChange('impactos_ambientais', v)}
                draft={drafts.impactos} onDraftChange={v => onDraftChange('impactos', v)}
                loading={loadingField === 'impactos_ambientais'}
                onGenerate={() => onGenerate('impactos_ambientais', () => AIService.gerarImpactos(etp.descricao_necessidade || '', drafts.impactos, ""))}
                placeholder="Sustentabilidade, descarte de resíduos..."
            />
        </div>
        <div className="space-y-8">
            <AICard 
                title="4. Requisitos Técnicos" color="green"
                value={etp.requisitos_tecnicos || ''} onChange={v => onChange('requisitos_tecnicos', v)}
                draft={drafts.requisitos} onDraftChange={v => onDraftChange('requisitos', v)}
                loading={loadingField === 'requisitos_tecnicos'}
                onGenerate={() => onGenerate('requisitos_tecnicos', () => AIService.gerarRequisitos(etp.descricao_necessidade || '', etp.descricao_solucao || '', drafts.requisitos))}
                placeholder="Garantia, normas ABNT/Inmetro, qualificação técnica..."
            />
        </div>
    </div>
  );
}