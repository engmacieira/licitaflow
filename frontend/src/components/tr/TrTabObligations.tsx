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
        
        {/* Banner Informativo */}
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex items-start gap-4">
            <div className="bg-red-100 p-2 rounded-lg text-red-600">
                <Gavel size={24} />
            </div>
            <div>
                <h4 className="text-lg font-bold text-red-900">Obrigações Contratuais</h4>
                <p className="text-red-700 text-sm mt-1">
                    As cláusulas abaixo definem as responsabilidades de cada parte. 
                    A IA pode sugerir obrigações com base na natureza do objeto descrito no ETP.
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            
            {/* Obrigações da Contratada */}
            <AICard 
                title="10. Obrigações da Contratada" 
                color="purple"
                value={tr.obrigacoes_contratada || ''} 
                onChange={v => onChange('obrigacoes_contratada', v)}
                draft={drafts.obrigacoes_contratada} 
                onDraftChange={v => onDraftChange('obrigacoes_contratada', v)}
                loading={loadingField === 'obrigacoes_contratada'}
                onGenerate={() => onGenerate('obrigacoes_contratada', 'obrigacoes_contratada')}
                placeholder="Liste os deveres da empresa: cumprimento de prazos, sigilo, encargos trabalhistas, qualidade dos materiais..."
            />
            
            {/* Obrigações da Contratante */}
            <AICard 
                title="11. Obrigações da Contratante" 
                color="blue"
                value={tr.obrigacoes_contratante || ''} 
                onChange={v => onChange('obrigacoes_contratante', v)}
                draft={drafts.obrigacoes_contratante} 
                onDraftChange={v => onDraftChange('obrigacoes_contratante', v)}
                loading={loadingField === 'obrigacoes_contratante'}
                onGenerate={() => onGenerate('obrigacoes_contratante', 'obrigacoes_contratante')}
                placeholder="Deveres da Administração: permitir acesso ao local, fornecer dados, efetuar pagamentos, fiscalizar..."
            />

        </div>

    </div>
  );
}