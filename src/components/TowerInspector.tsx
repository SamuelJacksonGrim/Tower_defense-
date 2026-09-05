import React, { useState } from 'react';
import { PlacedTower, TargetingPriority } from '../types/game';
import { TOWERS_DATA } from '../data/gameData';
import { SimWorld } from '../sim/SimWorld';
import {
  X,
  ShieldAlert,
  Crosshair,
  ArrowUpCircle,
  Coins,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Info
} from 'lucide-react';

interface TowerInspectorProps {
  tower: PlacedTower;
  sim: SimWorld;
  onClose: () => void;
  onUpgrade: (pathIndex: 0 | 1 | 2) => void;
  onSell: () => void;
  onPriorityChange: (priority: TargetingPriority) => void;
}

interface PriorityOption {
  id: TargetingPriority;
  label: string;
  description: string;
}

const PRIORITY_OPTIONS: PriorityOption[] = [
  { id: 'first', label: 'First', description: 'Closest to the exit gate' },
  { id: 'last', label: 'Last', description: 'Furthest behind in line' },
  { id: 'strongest', label: 'Strongest', description: 'Highest remaining HP' },
  { id: 'weakest', label: 'Weakest', description: 'Lowest remaining HP' },
  { id: 'nearest', label: 'Closest', description: 'Shortest euclidean distance to tower' }
];

export const TowerInspector: React.FC<TowerInspectorProps> = ({
  tower,
  sim,
  onClose,
  onUpgrade,
  onSell,
  onPriorityChange
}) => {
  const [hoveredPathIndex, setHoveredPathIndex] = useState<0 | 1 | 2 | null>(null);

  const def = TOWERS_DATA[tower.type];
  const stats = sim.getEffectiveTowerStats(tower);
  const refundGold = Math.round(tower.totalInvestedGold * 0.75);

  // Check 5/2/0 Lock status
  const primaryPathIndex = tower.pathRanks.findIndex(r => r >= 3);
  const hasLock = primaryPathIndex !== -1;

  // Active hypothetical preview if hovering an upgradeable path
  const hypotheticalStats =
    hoveredPathIndex !== null && tower.pathRanks[hoveredPathIndex] < 5
      ? sim.getHypotheticalUpgradeStats(tower, hoveredPathIndex)
      : null;

  const hoveredPathDef = hoveredPathIndex !== null ? def.paths[hoveredPathIndex] : null;
  const hoveredNextTier =
    hoveredPathIndex !== null && hoveredPathDef
      ? hoveredPathDef.tiers[tower.pathRanks[hoveredPathIndex]]
      : null;

  return (
    <div className="absolute right-3 top-16 bottom-20 w-88 sm:w-96 bg-slate-950/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-4 flex flex-col z-30 text-slate-200 overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner border border-white/10 shrink-0"
            style={{ backgroundColor: `${def.color}33`, color: def.accentColor }}
          >
            {def.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-base text-white leading-tight">{def.name}</h2>
              {def.tacticalRole && (
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {def.tacticalRole}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <span>Slot #{tower.slotIndex + 1}</span>
              <span>•</span>
              <span className="text-emerald-400 font-mono font-semibold">{tower.totalKills} kills</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 pt-3 custom-scrollbar text-xs">
        {/* Core Stats Overview */}
        <div className="grid grid-cols-4 gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 text-center">
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Damage</div>
            <div className="font-bold text-sm text-emerald-400 font-mono">{stats.damage}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Attack Rate</div>
            <div className="font-bold text-sm text-sky-400 font-mono">{stats.fireRate}/s</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Range</div>
            <div className="font-bold text-sm text-amber-400 font-mono">{Math.round(stats.range)}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">DPS</div>
            <div className="font-bold text-sm text-purple-400 font-mono">{stats.dps}</div>
          </div>
        </div>

        {/* 1. Tower Targeting Controls */}
        <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 flex items-center gap-1.5 font-semibold text-[11px]">
              <Crosshair size={13} className="text-sky-400" /> Targeting Priority
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 uppercase tracking-wider">
              {tower.targetPriority === 'nearest' ? 'Closest' : tower.targetPriority}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1">
            {PRIORITY_OPTIONS.map(opt => {
              const isSelected = tower.targetPriority === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onPriorityChange(opt.id)}
                  title={opt.description}
                  className={`py-1.5 px-1 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-900/40 border border-sky-400/50'
                      : 'bg-slate-800/70 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/40'
                  }`}
                >
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Live Upgrade Stat Comparison Box (Visible when hovering an upgrade tier) */}
        {hypotheticalStats && hoveredNextTier && hoveredPathIndex !== null && (
          <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-3 rounded-xl border border-sky-500/50 shadow-lg animate-fade-in">
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-sky-400" />
                <span className="font-bold text-white text-[11px] uppercase tracking-wide">
                  Upgrade Preview: {hoveredNextTier.name}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-yellow-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                COST: {Math.round(hoveredNextTier.cost * sim.techModifiers.costDiscountMult)}g
              </span>
            </div>

            <div className="space-y-1 font-mono text-[11px]">
              {/* Damage */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">Damage</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-300">{stats.damage}</span>
                  <ArrowRight size={11} className="text-slate-500" />
                  <span
                    className={`font-bold ${
                      hypotheticalStats.damage > stats.damage ? 'text-emerald-400' : 'text-slate-200'
                    }`}
                  >
                    {hypotheticalStats.damage}
                  </span>
                  {hypotheticalStats.damage > stats.damage && (
                    <span className="text-[10px] text-emerald-400 font-bold">
                      +{hypotheticalStats.damage - stats.damage}
                    </span>
                  )}
                </div>
              </div>

              {/* Attack Rate */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">Attack Rate</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-300">{stats.fireRate}/s</span>
                  <ArrowRight size={11} className="text-slate-500" />
                  <span
                    className={`font-bold ${
                      hypotheticalStats.fireRate > stats.fireRate ? 'text-sky-400' : 'text-slate-200'
                    }`}
                  >
                    {hypotheticalStats.fireRate}/s
                  </span>
                  {hypotheticalStats.fireRate > stats.fireRate && (
                    <span className="text-[10px] text-sky-400 font-bold">
                      +{(hypotheticalStats.fireRate - stats.fireRate).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Range */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">Range</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-300">{Math.round(stats.range)}</span>
                  <ArrowRight size={11} className="text-slate-500" />
                  <span
                    className={`font-bold ${
                      hypotheticalStats.range > stats.range ? 'text-amber-400' : 'text-slate-200'
                    }`}
                  >
                    {Math.round(hypotheticalStats.range)}
                  </span>
                  {hypotheticalStats.range > stats.range && (
                    <span className="text-[10px] text-amber-400 font-bold">
                      +{Math.round(hypotheticalStats.range - stats.range)}
                    </span>
                  )}
                </div>
              </div>

              {/* Splash Radius if applicable */}
              {(stats.splashRadius > 0 || hypotheticalStats.splashRadius > 0) && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans">Splash Area</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-300">{stats.splashRadius}px</span>
                    <ArrowRight size={11} className="text-slate-500" />
                    <span
                      className={`font-bold ${
                        hypotheticalStats.splashRadius > stats.splashRadius ? 'text-orange-400' : 'text-slate-200'
                      }`}
                    >
                      {hypotheticalStats.splashRadius}px
                    </span>
                    {hypotheticalStats.splashRadius > stats.splashRadius && (
                      <span className="text-[10px] text-orange-400 font-bold">
                        +{hypotheticalStats.splashRadius - stats.splashRadius}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* DPS */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span className="text-slate-400 font-sans">Est. DPS</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-300">{stats.dps}</span>
                  <ArrowRight size={11} className="text-slate-500" />
                  <span
                    className={`font-bold ${
                      hypotheticalStats.dps > stats.dps ? 'text-purple-400' : 'text-slate-200'
                    }`}
                  >
                    {hypotheticalStats.dps}
                  </span>
                  {hypotheticalStats.dps > stats.dps && (
                    <span className="text-[10px] text-purple-400 font-bold">
                      +{hypotheticalStats.dps - stats.dps}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5/2/0 Lock Notification Banner */}
        {hasLock && (
          <div className="flex items-center gap-2 p-2 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-300 text-[11px]">
            <ShieldAlert size={16} className="shrink-0 text-amber-400" />
            <div>
              <span className="font-bold">5/2/0 Specialization Active:</span> Path {primaryPathIndex + 1} chosen as
              Primary. Other branches capped at Tier 2.
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
                onMouseEnter={() => setHoveredPathIndex(pathIndex)}
                onMouseLeave={() => setHoveredPathIndex(null)}
                className={`p-2.5 rounded-xl border transition-all ${
                  hoveredPathIndex === pathIndex
                    ? 'border-sky-400/80 bg-slate-900/90 shadow-md'
                    : currentRank >= 3
                    ? 'bg-slate-900/80 border-sky-500/50'
                    : 'bg-slate-900/50 border-slate-800'
                }`}
              >
                {/* Path Header */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{path.name}</span>
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
                            : hasLock && tierNum > 2 && primaryPathIndex !== pathIndex
                            ? 'bg-red-950/40 border-red-900/50'
                            : 'bg-slate-800 border-slate-700'
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
                      <span className="text-[9px] font-normal text-slate-300">{nextTier.description}</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-xs ml-2 shrink-0">
                      <Coins size={12} className={check.allowed ? 'text-yellow-300' : 'text-slate-500'} />
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
                  <div className="mt-1 text-[9px] text-amber-400/90 font-mono">⚠️ {check.reason}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tactical Synergies (if available) */}
        {def.synergies && def.synergies.length > 0 && (
          <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-[10px] font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp size={12} /> Tactical Synergy
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">{def.synergies[0]}</p>
          </div>
        )}
      </div>

      {/* 5. Sell / Refund Clarity Footer */}
      <div className="pt-3 border-t border-slate-800 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px]">
            <span className="text-slate-400">Total Invested: </span>
            <span className="font-mono font-bold text-slate-200">{tower.totalInvestedGold}g</span>
          </div>
          <div className="text-[11px] font-mono font-bold text-amber-400">
            Refund: +{refundGold}g (75%)
          </div>
        </div>
        <button
          onClick={onSell}
          className="w-full py-2 bg-rose-950/70 hover:bg-rose-900/90 border border-rose-500/50 text-rose-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-rose-950/60"
        >
          <Coins size={14} className="text-yellow-400" />
          <span>Dismantle & Refund {refundGold} Gold</span>
        </button>
      </div>
    </div>
  );
};
