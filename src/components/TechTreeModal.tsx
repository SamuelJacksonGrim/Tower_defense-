import React from 'react';
import { TECH_TREE } from '../data/gameData';
import { Sparkles, X, Check, ArrowUp, Zap, Shield, DollarSign } from 'lucide-react';
import { sound } from '../services/soundService';

interface TechTreeModalProps {
  techTree: Record<string, number>;
  techPoints: number;
  onUpgradeTech: (nodeId: string, cost: number) => void;
  onClose: () => void;
}

export const TechTreeModal: React.FC<TechTreeModalProps> = ({
  techTree,
  techPoints,
  onUpgradeTech,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-sky-500/40 rounded-2xl shadow-[0_0_50px_rgba(56,189,248,0.2)] p-6 text-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center">
              <Sparkles className="text-sky-400" size={20} />
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-white uppercase tracking-wider">
                Citadel Research Matrix
              </h2>
              <div className="text-xs text-sky-400 font-bold">
                Available Tech Points: <span className="font-mono text-sm text-yellow-300">{techPoints}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tech Grid */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 custom-scrollbar">
          {TECH_TREE.map(node => {
            const currentTier = techTree[node.id] || 0;
            const isMax = currentTier >= node.maxTier;
            const costArr = node.cost || node.costPerTier || [1, 2, 3, 4];
            const nextCost = !isMax ? (costArr[currentTier] || 1) : 0;
            const canAfford = !isMax && techPoints >= nextCost;

            return (
              <div
                key={node.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isMax
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm text-white">{node.name}</h3>
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {node.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2 leading-relaxed">{node.description}</p>

                  {/* Tier Indicators */}
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: node.maxTier }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-6 h-2 rounded-sm border ${
                          idx < currentTier
                            ? 'bg-sky-400 border-sky-300 shadow-[0_0_6px_rgba(56,189,248,0.5)]'
                            : 'bg-slate-800 border-slate-700'
                        }`}
                      />
                    ))}
                    <span className="text-[10px] text-slate-400 ml-1 font-mono">
                      Rank {currentTier}/{node.maxTier}
                    </span>
                  </div>
                </div>

                {/* Action */}
                <div className="shrink-0">
                  {isMax ? (
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-xl">
                      <Check size={14} />
                      <span>Maxed</span>
                    </div>
                  ) : (
                    <button
                      disabled={!canAfford}
                      onClick={() => {
                        sound.playUpgrade();
                        onUpgradeTech(node.id, nextCost);
                      }}
                      className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                        canAfford
                          ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/40 cursor-pointer'
                          : 'bg-slate-800/40 border border-slate-700/40 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <ArrowUp size={14} />
                      <span>Upgrade ({nextCost} Pts)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
          <span>Complete campaign sectors with 3 stars to earn more Tech Points.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
