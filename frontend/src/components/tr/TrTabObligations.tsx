import type { TR } from '../../services/api';
import { AICard } from '../AICard';
import { Gavel } from 'lucide-react';

interface TabProps {
  tr: TR;
  onChange: (field: keyof TR, value: string) => void;
  drafts: any;
  onDraftChange: (field: string, value: string) => void;
  onGenerate: (field: keyof TR, section: string) => void;
  loadingField: string | null;
}

export function TrTabObligations({ tr, onChange, drafts, onDraftChange, onGenerate, loadingField }: TabProps) {
  return (
    <div className="space-y-8">
        <div className="bg-red-50 p-6 rounded-xl border border-red-100 flex items-start gap-4">
            <Gavel className="text-red-600 mt-1" size={24} />
            <div>
                <h4 className="text-lg font-bold text-red-900">Atenção às Obrigações</h4>
                <p className="text-red-700 text-sm">
                    As obrigações abaixo vinculam a futura contratada.
                    A IA utiliza a <strong>Matriz de Riscos</strong> para sugerir cláusulas de mitigação.
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <AICard 
                title="11. Obrigações da Contratada" color="red"
                value={tr.obrigacoes_contratada || ''} onChange={v => onChange('obrigacoes_contratada', v)}
                draft={drafts.obrigacoes_contratada} onDraftChange={v => onDraftChange('obrigacoes_contratada', v)}
                loading={loadingField === 'obrigacoes_contratada'}
                onGenerate={() => onGenerate('obrigacoes_contratada', 'obrigacoes')}
                placeholder="Deveres da empresa..."
            />
            <AICard 
                title="12. Obrigações da Contratante" color="blue"
                value={tr.obrigacoes_contratante || ''} onChange={v => onChange('obrigacoes_contratante', v)}
                draft={drafts.obrigacoes_contratante} onDraftChange={v => onDraftChange('obrigacoes_contratante', v)}
                loading={loadingField === 'obrigacoes_contratante'}
                onGenerate={() => onGenerate('obrigacoes_contratante', 'obrigacoes')}
                placeholder="Deveres da Administração..."
            />
        </div>
    </div>
  );
}