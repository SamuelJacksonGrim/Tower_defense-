import React from 'react';
import { PlacedTower, TargetingPriority } from '../types/game';
import { TOWERS_DATA } from '../data/gameData';
import { SimWorld } from '../sim/SimWorld';
import { X, ShieldAlert, Crosshair, ArrowUpCircle, DollarSign, Zap, Eye } from 'lucide-react';

interface TowerInspectorProps {
  tower: PlacedTower;
  sim: SimWorld;
  onClose: () => void;
  onUpgrade: (pathIndex: 0 | 1 | 2) => void;
  onSell: () => void;
  onPriorityChange: (priority: TargetingPriority) => void;
}

export const TowerInspector: React.FC<TowerInspectorProps> = ({
  tower,
  sim,
  onClose,
  onUpgrade,
  onSell,
  onPriorityChange
}) => {
  const def = TOWERS_DATA[tower.type];
  const stats = sim.getEffectiveTowerStats(tower);
  const refundGold = Math.round(tower.totalInvestedGold * 0.75);

  // Check 5/2/0 Lock status
  const primaryPathIndex = tower.pathRanks.findIndex(r => r >= 3);
  const hasLock = primaryPathIndex !== -1;

  const priorities: TargetingPriority[] = ['first', 'last', 'strongest', 'weakest', 'nearest'];

  return (
    <div className="absolute right-3 top-16 bottom-24 w-84 sm:w-96 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-4 flex flex-col z-30 text-slate-200 overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner border border-white/10"
            style={{ backgroundColor: `${def.color}33`, color: def.accentColor }}
          >
            {def.name[0]}
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-white leading-tight">{def.name}</h2>
            <p className="text-xs text-slate-400">{def.role}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 pt-3 custom-scrollbar text-xs">
        {/* Core Stats Overview */}
        <div className="grid grid-cols-4 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-center">
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Damage</div>
            <div className="font-bold text-sm text-emerald-400">{stats.damage}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Speed</div>
            <div className="font-bold text-sm text-sky-400">{stats.fireRate}/s</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Range</div>
            <div className="font-bold text-sm text-amber-400">{Math.round(stats.range)}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Est. DPS</div>
            <div className="font-bold text-sm text-purple-400">{stats.dps}</div>
          </div>
        </div>

        {/* Targeting Priority Selector */}
        <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-400 flex items-center gap-1.5 font-semibold text-[11px]">
              <Crosshair size={13} className="text-sky-400" /> Targeting Priority
            </span>
            <span className="text-[10px] text-sky-300 uppercase font-mono">{tower.targetPriority}</span>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {priorities.map(p => (
              <button
                key={p}
                onClick={() => onPriorityChange(p)}
                className={`py-1 rounded text-[10px] uppercase font-bold tracking-wider transition-all ${
                  tower.targetPriority === p
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-800/70 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* 5/2/0 Lock Notification Banner */}
        {hasLock && (
          <div className="flex items-center gap-2 p-2 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-300 text-[11px]">
            <ShieldAlert size={16} className="shrink-0 text-amber-400" />
            <div>
              <span className="font-bold">5/2/0 Specialization Active:</span> Path {primaryPathIndex + 1} chosen as Primary. Other branches capped at Tier 2.
            </div>
          </div>
        )}

        {/* 3 Branching Specialization Paths */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <ArrowUpCircle size={13} className="text-emerald-400" /> Specialization Paths
          </div>

          {def.paths.map((path, pIdx) => {
            const pathIndex = pIdx as 0 | 1 | 2;
            const currentRank = tower.pathRanks[pathIndex];
            const check = sim.canUpgradePath(tower.id, pathIndex);
            const nextTier = path.tiers[currentRank];

            return (
              <div
                key={path.name}
                className={`p-2.5 rounded-xl border transition-all ${
                  currentRank >= 3
                    ? 'bg-slate-950/80 border-sky-500/50 shadow-md'
                    : 'bg-slate-950/50 border-slate-800'
                }`}
              >
                {/* Path Header */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">
                      {path.name}
                    </span>
                    {currentRank >= 3 && (
                      <span className="bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[9px] px-1.5 py-0.2 rounded font-mono">
                        PRIMARY
                      </span>
                    )}
                  </div>
                  {/* Tier Indicator Pips (1 to 5) */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(tierNum => (
                      <div
                        key={tierNum}
                        className={`w-2.5 h-2.5 rounded-sm border ${
                          currentRank >= tierNum
                            ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]'
                            : (hasLock && tierNum > 2 && primaryPathIndex !== pathIndex
                                ? 'bg-red-950/40 border-red-900/50'
                                : 'bg-slate-800 border-slate-700')
                        }`}
                        title={`Tier ${tierNum}`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">{path.description}</p>

                {/* Upgrade Button / Max State */}
                {currentRank < 5 && nextTier ? (
                  <button
                    disabled={!check.allowed}
                    onClick={() => onUpgrade(pathIndex)}
                    className={`w-full py-1.5 px-3 rounded-lg flex items-center justify-between font-bold text-[11px] transition-all ${
                      check.allowed
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg hover:shadow-emerald-900/40 cursor-pointer'
                        : 'bg-slate-800/50 border border-slate-700/40 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-white font-medium">
                        T{currentRank + 1}: {nextTier.name}
                      </span>
                      <span className="text-[9px] font-normal text-slate-300">
                        {nextTier.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-xs ml-2 shrink-0">
                      <DollarSign size={12} className={check.allowed ? 'text-yellow-300' : 'text-slate-500'} />
                      <span>{check.cost}g</span>
                    </div>
                  </button>
                ) : (
                  <div className="w-full py-1 bg-slate-800/40 border border-slate-700/40 text-emerald-400 text-center rounded-lg font-bold text-[10px] tracking-wider uppercase">
                    Path Mastered (Tier 5)
                  </div>
                )}

                {/* Reason if upgrade blocked */}
                {!check.allowed && currentRank < 5 && check.reason && (
                  <div className="mt-1 text-[9px] text-amber-400/90 font-mono">
                    ⚠️ {check.reason}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer: Sell & Respec */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
        <div className="text-[10px] text-slate-400">
          <div>Invested: <span className="text-slate-200 font-mono font-bold">{tower.totalInvestedGold}g</span></div>
          <div>Kills: <span className="text-slate-200 font-mono font-bold">{tower.totalKills}</span></div>
        </div>
        <button
          onClick={onSell}
          className="px-3.5 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <DollarSign size={13} />
          <span>Sell (+{refundGold}g)</span>
        </button>
      </div>
    </div>
  );
};
