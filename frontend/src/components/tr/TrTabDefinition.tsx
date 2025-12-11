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

export function TrTabDefinition({ tr, onChange, drafts, onDraftChange, onGenerate, loadingField }: TabProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Coluna Esquerda */}
        <div className="space-y-8">
            <AICard 
                title="1. Fundamentação da Contratação" color="gray"
                value={tr.fundamentacao || ''} onChange={v => onChange('fundamentacao', v)}
                draft={drafts.fundamentacao} onDraftChange={v => onDraftChange('fundamentacao', v)}
                loading={loadingField === 'fundamentacao'}
                onGenerate={() => onGenerate('fundamentacao', 'introducao')}
                placeholder="Justificativa legal e técnica resumida, alinhada ao ETP..."
            />
            
            <AICard 
                title="3. Critérios de Sustentabilidade" color="green"
                value={tr.sustentabilidade || ''} onChange={v => onChange('sustentabilidade', v)}
                draft={drafts.sustentabilidade} onDraftChange={v => onDraftChange('sustentabilidade', v)}
                loading={loadingField === 'sustentabilidade'}
                onGenerate={() => onGenerate('sustentabilidade', 'sustentabilidade')}
                placeholder="Requisitos ambientais, selo verde, logística reversa, descarte adequado..."
            />
        </div>

        {/* Coluna Direita */}
        <div className="space-y-8">
            <AICard 
                title="2. Descrição da Solução" color="blue"
                value={tr.descricao_solucao || ''} onChange={v => onChange('descricao_solucao', v)}
                draft={drafts.descricao_solucao} onDraftChange={v => onDraftChange('descricao_solucao', v)}
                loading={loadingField === 'descricao_solucao'}
                onGenerate={() => onGenerate('descricao_solucao', 'objeto')}
                placeholder="Detalhamento exato do que será entregue, especificações técnicas..."
            />
        </div>

    </div>
  );
}