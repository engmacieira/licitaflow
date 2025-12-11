import { Layers, Link, Trash2 } from 'lucide-react';
import { AICard } from '../AICard';
import { AIService, type ETP, type DfdSummary } from '../../services/api';

interface TabProps {
  etp: ETP;
  dfdsVinculados?: DfdSummary[]; 
  onChange: (field: keyof ETP, value: any) => void;
  drafts: any;
  onDraftChange: (field: string, value: string) => void;
  onGenerate: (field: keyof ETP, aiFn: () => Promise<string>) => void;
  loadingField: string | null;
  onUnlink: (dfdId: number) => void;
}

export function EtpTabGeneral({ etp, dfdsVinculados, onChange, drafts, onDraftChange, onGenerate, loadingField, onUnlink }: TabProps) {
  
  // Função auxiliar para decidir qual estratégia de IA usar para a Necessidade
  const handleGenerateNecessidade = () => {
    if (dfdsVinculados && dfdsVinculados.length > 0) {
        // Estratégia de Consolidação (se houver DFDs)
        const listaObjetos = dfdsVinculados.map(d => d.objeto);
        return AIService.gerarConsolidado(listaObjetos, 'objeto');
    } else {
        // Estratégia de Geração Criativa (baseada no rascunho)
        // Passamos strings vazias para obj/jus pois não temos DFD origem, apenas o draft do usuário
        return AIService.gerarNecessidade("", "", drafts.necessidade || "");
    }
  };

  // Função auxiliar para decidir qual estratégia de IA usar para a Motivação
  const handleGenerateMotivacao = () => {
    if (dfdsVinculados && dfdsVinculados.length > 0) {
        // Estratégia de Consolidação (se houver DFDs)
        const listaJustificativas = dfdsVinculados.map(d => d.justificativa);
        return AIService.gerarConsolidado(listaJustificativas, 'justificativa');
    } else {
        // Estratégia de Geração Criativa
        return AIService.gerarMotivacao(etp.descricao_necessidade || "", drafts.motivacao || "");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      
      {/* Coluna Esquerda: Contexto e Necessidade */}
      <div className="space-y-8">
        
        {/* Bloco de DFDs Vinculados */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2 mb-4">
                <Layers size={16} /> Demandas Consolidadas
            </h3>
            
            {!dfdsVinculados || dfdsVinculados.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                    Nenhum DFD vinculado a este ETP.
                </div>
            ) : (
                <div className="space-y-3">
                    {dfdsVinculados.map(d => (
                        <div key={d.id} className="flex justify-between items-center p-3 bg-blue-50/50 rounded-xl border border-blue-100 group hover:border-blue-300 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-lg border border-blue-100 text-blue-600">
                                    <Link size={16} />
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-gray-800">DFD #{d.numero}/{d.ano}</span>
                                    <span className="text-xs text-gray-500 line-clamp-1">{d.objeto}</span>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => onUnlink(d.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Desvincular esta demanda"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <p className="text-xs text-gray-400 mt-4 text-center">
                Gerencie as demandas na tela de "Planejamento".
            </p>
        </div>

        {/* 1. Descrição da Necessidade */}
        <AICard 
            title="1. Descrição da Necessidade" 
            color="blue"
            value={etp.descricao_necessidade || ''} 
            onChange={v => onChange('descricao_necessidade', v)}
            draft={drafts.necessidade} 
            onDraftChange={v => onDraftChange('necessidade', v)}
            loading={loadingField === 'descricao_necessidade'}
            onGenerate={() => onGenerate('descricao_necessidade', handleGenerateNecessidade)}
            placeholder="Descreva a necessidade de contratação ou clique em 'Gerar com IA' para unificar os objetos dos DFDs vinculados..."
        />
        
        {/* 2. Previsão no PCA (Trazido do código antigo) */}
        <AICard
            title="2. Previsão no PCA"
            color="gray"
            value={etp.previsao_pca || ''}
            onChange={v => onChange('previsao_pca', v)}
            loading={false}
            onGenerate={() => {}} // Sem IA por enquanto
            disableAI={true}      // Desabilita o botão
            placeholder="Informe a previsão no Plano de Contratações Anual..."
        />

      </div>

      {/* Coluna Direita: Motivação e Providências */}
      <div className="space-y-8">
        
        {/* 5. Motivação da Contratação */}
        <AICard 
            title="5. Motivação da Contratação" 
            color="orange"
            value={etp.motivacao_contratacao || ''} 
            onChange={v => onChange('motivacao_contratacao', v)}
            draft={drafts.motivacao} 
            onDraftChange={v => onDraftChange('motivacao', v)}
            loading={loadingField === 'motivacao_contratacao'}
            onGenerate={() => onGenerate('motivacao_contratacao', handleGenerateMotivacao)}
            placeholder="Justifique a contratação ou clique em 'Gerar com IA' para sintetizar as justificativas dos DFDs..."
        />

        {/* 12. Providências Prévias */}
        <AICard 
            title="12. Providências Prévias" 
            color="gray"
            value={etp.providencias_previas || ''} 
            onChange={v => onChange('providencias_previas', v)}
            draft={drafts.providencias} 
            onDraftChange={v => onDraftChange('providencias', v)}
            loading={loadingField === 'providencias_previas'}
            // CORREÇÃO FINAL: Passando os 3 argumentos exigidos pelo backend
            onGenerate={() => onGenerate('providencias_previas', () => AIService.gerarProvidencias(etp.descricao_necessidade || '', drafts.providencias || '', ''))}
            placeholder="Adequações físicas, elétricas, designação de equipe de fiscalização..."
        />
      </div>

    </div>
  );
}