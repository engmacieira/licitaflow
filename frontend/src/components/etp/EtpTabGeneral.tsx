import { Layers, Loader2, Wand2 } from 'lucide-react';
import { AICard } from '../AICard';
// CORREÇÃO: Importando DfdSummary e removendo DFD (se não for usado)
import { AIService, type ETP, type DfdSummary } from '../../services/api';

interface TabProps {
  etp: ETP;
  // CORREÇÃO: O tipo agora é DfdSummary[], compatível com o que vem do etp.dfds
  dfdsVinculados?: DfdSummary[]; 
  onChange: (field: keyof ETP, value: any) => void;
  drafts: any;
  onDraftChange: (field: string, value: string) => void;
  onGenerate: (field: keyof ETP, aiFn: () => Promise<string>) => void;
  loadingField: string | null;
  onUnlink: (dfdId: number) => void;
}

export function EtpTabGeneral({ etp, dfdsVinculados, onChange, drafts, onDraftChange, onGenerate, loadingField, onUnlink }: TabProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* Coluna Esquerda */}
      <div className="space-y-8">
        
        {/* LISTA DE DFDS VINCULADOS (COM DESVINCULAR) */}
        {dfdsVinculados && dfdsVinculados.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Layers size={18} className="text-blue-600"/> Demandas Vinculadas (Origem)
                </h3>
                <div className="space-y-2">
                    {dfdsVinculados.map(d => (
                        <div key={d.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition">
                            <div>
                                <span className="font-bold text-sm text-gray-700">DFD {d.numero}/{d.ano}</span>
                                <span className="mx-2 text-gray-300">|</span>
                                <span className="text-sm text-gray-600 line-clamp-1">{d.objeto}</span>
                            </div>
                            <button 
                                onClick={() => onUnlink(d.id)}
                                className="text-red-500 hover:text-red-700 text-xs font-bold px-3 py-1 hover:bg-red-50 rounded transition"
                                title="Remover este DFD do Planejamento"
                            >
                                Desvincular
                            </button>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-gray-400 mt-2 italic">
                    * Ao desvincular, lembre-se de revisar a Tabela de Custos manualmente.
                </p>
            </div>
        )}

        {/* CARD INTELIGENTE: NECESSIDADE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-red-600 text-white px-6 py-3 flex justify-between items-center">
                <h3 className="font-bold text-sm uppercase">1. Descrição da Necessidade (Objeto)</h3>
                <span className="text-[10px] bg-white/20 px-2 py-1 rounded flex items-center gap-1"><Wand2 size={12}/> IA</span>
            </div>
            <div className="p-6">
                {dfdsVinculados && dfdsVinculados.length > 0 && (
                    <div className="mb-4 bg-red-50 p-3 rounded-lg border border-red-100">
                        <button 
                            onClick={() => onGenerate('descricao_necessidade', () => {
                                const lista = dfdsVinculados.map(d => d.objeto) || [];
                                return AIService.gerarConsolidado(lista, 'objeto');
                            })}
                            disabled={!!loadingField}
                            className="w-full bg-white border border-red-200 text-red-700 hover:bg-red-100 px-3 py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition"
                        >
                            {loadingField === 'descricao_necessidade' ? <Loader2 className="animate-spin" size={14}/> : <Wand2 size={14}/>}
                            Unificar Objetos dos DFDs Automaticamente
                        </button>
                    </div>
                )}
                <textarea 
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition text-gray-700"
                    rows={6}
                    value={etp.descricao_necessidade || ''}
                    onChange={e => onChange('descricao_necessidade', e.target.value)}
                    placeholder="Descreva a necessidade unificada..."
                />
            </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition group">
            <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide group-hover:text-gray-900">2. Previsão no PCA</h3>
            <textarea 
            className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 outline-none transition text-sm bg-gray-50 focus:bg-white" 
            rows={4} value={etp.previsao_pca || ''} onChange={e => onChange('previsao_pca', e.target.value)}
            />
        </div>
      </div>

      {/* Coluna Direita */}
      <div className="space-y-8">
        {/* CARD INTELIGENTE: MOTIVAÇÃO */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-yellow-600 text-white px-6 py-3 flex justify-between items-center">
                <h3 className="font-bold text-sm uppercase">5. Motivação da Contratação</h3>
                <span className="text-[10px] bg-white/20 px-2 py-1 rounded flex items-center gap-1"><Wand2 size={12}/> IA</span>
            </div>
            <div className="p-6">
                {dfdsVinculados && dfdsVinculados.length > 0 && (
                    <div className="mb-4 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                        <button 
                            onClick={() => onGenerate('motivacao_contratacao', () => {
                                const lista = dfdsVinculados.map(d => d.justificativa) || [];
                                return AIService.gerarConsolidado(lista, 'justificativa');
                            })}
                            disabled={!!loadingField}
                            className="w-full bg-white border border-yellow-200 text-yellow-700 hover:bg-yellow-100 px-3 py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition"
                        >
                            {loadingField === 'motivacao_contratacao' ? <Loader2 className="animate-spin" size={14}/> : <Wand2 size={14}/>}
                            Sintetizar Justificativas (Ganho de Escala)
                        </button>
                    </div>
                )}
                <textarea 
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none transition text-gray-700"
                    rows={6} value={etp.motivacao_contratacao || ''}
                    onChange={e => onChange('motivacao_contratacao', e.target.value)}
                    placeholder="Motivação..."
                />
            </div>
        </div>

        <AICard 
            title="12. Providências Prévias" color="gray"
            value={etp.providencias_previas || ''} onChange={v => onChange('providencias_previas', v)}
            draft={drafts.providencias} onDraftChange={v => onDraftChange('providencias', v)}
            loading={loadingField === 'providencias_previas'}
            onGenerate={() => onGenerate('providencias_previas', () => AIService.gerarProvidencias(etp.descricao_necessidade || '', drafts.providencias, ""))}
            placeholder="Adequações físicas, elétricas, designação de fiscais..."
        />
      </div>
    </div>
  );
}