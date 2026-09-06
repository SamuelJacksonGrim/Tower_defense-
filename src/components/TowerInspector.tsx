import React, { useState } from 'react';
import { PlacedTower, TargetingPriority, EnemyInstance } from '../types/game';
import { TOWERS_DATA } from '../data/gameData';
import { SimWorld } from '../sim/SimWorld';
import { TDMath } from '../sim/TDMath';
import { BuildAnalyzer } from '../sim/BuildAnalyzer';
import { TowerComparisonModal } from './TowerComparisonModal';
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
  Info,
  Activity,
  Target,
  Zap,
  AlertTriangle,
  ArrowRightLeft,
  Award,
  Layers
} from 'lucide-react';

interface TowerInspectorProps {
  tower: PlacedTower;
  sim: SimWorld;
  onClose: () => void;
  onUpgrade: (pathIndex: 0 | 1 | 2) => void;
  onSell: () => void;
  onPriorityChange: (priority: TargetingPriority) => void;
  analyzedEnemy?: EnemyInstance | null;
  onClearAnalyzedEnemy?: () => void;
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
  onPriorityChange,
  analyzedEnemy = null,
  onClearAnalyzedEnemy
}) => {
  const [hoveredPathIndex, setHoveredPathIndex] = useState<0 | 1 | 2 | null>(null);
  const [activeTab, setActiveTab] = useState<'inspector' | 'build_advisor'>('inspector');
  const [isComparing, setIsComparing] = useState(false);

  const def = TOWERS_DATA[tower.type];
  const stats = sim.getEffectiveTowerStats(tower);
  const refundGold = Math.round(tower.totalInvestedGold * 0.75);

  // Exact Requested DPS & Efficiency metrics
  const lifetimeSec = Math.max(0.1, (sim.totalWaveActiveTime || 0) - (tower.placedAtTime || 0));
  const actualDps = Math.round((tower.totalDamageDealt / lifetimeSec) * 10) / 10;
  const theoreticalDps = stats.dps;
  const rawUptime = tower.activeCombatSeconds && lifetimeSec > 0
    ? Math.round((tower.activeCombatSeconds / lifetimeSec) * 1000) / 10
    : (theoreticalDps > 0 ? Math.min(100, Math.round((actualDps / theoreticalDps) * 1000) / 10) : 0);
  const uptime = Math.min(100, Math.max(0, rawUptime));
  const damagePerGold = (tower.totalDamageDealt / Math.max(1, tower.totalInvestedGold)).toFixed(2);

  // Percentile calculation across all placed towers
  const allEff = sim.towers.map(t => t.totalDamageDealt / Math.max(1, t.totalInvestedGold));
  const currentEff = tower.totalDamageDealt / Math.max(1, tower.totalInvestedGold);
  let percentile = 50;
  if (sim.towers.length > 1) {
    const belowCount = allEff.filter(e => e < currentEff).length;
    percentile = Math.round((belowCount / (sim.towers.length - 1)) * 100);
  } else {
    percentile = Math.min(99, Math.max(15, Math.round(Math.min(99, currentEff * 3.8))));
  }

  const getOrdinalSuffix = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const buildAnalysis = BuildAnalyzer.analyze(sim.towers);

  // Target Analysis calculations
  let enemyAnalysis = null;
  if (analyzedEnemy && analyzedEnemy.alive && !analyzedEnemy.leaked) {
    const dist = Math.round(Math.hypot(analyzedEnemy.x - tower.x, analyzedEnemy.y - tower.y));
    const inRange = dist <= stats.range;
    const calc = TDMath.calculateDamage(stats.damage, def.damageType, analyzedEnemy.armor, stats.pierce, false, stats.critMult, analyzedEnemy.status.markedDamageBonus);
    const effectiveDamage = calc.finalDamage;
    const mitigation = stats.damage > 0 ? Math.max(0, Math.round(((stats.damage - effectiveDamage) / stats.damage) * 100)) : 0;
    const effectiveDps = Math.max(1, Math.round(effectiveDamage * stats.fireRate));
    const ttk = (analyzedEnemy.hp / effectiveDps).toFixed(1);

    let advice = 'Target within active killzone.';
    if (!inRange) {
      advice = `Out of range (${dist}px vs ${Math.round(stats.range)}px max). Upgrade Range or reposition.`;
    } else if (mitigation >= 35) {
      advice = `High Armor (${analyzedEnemy.armor}) absorbs ${mitigation}% of ${def.damageType} damage. Recommend Armor Shredding or Lightning/Magic!`;
    } else if (analyzedEnemy.isFlying && !def.canTargetAir) {
      advice = 'Invalid Target: Flying demon is immune to ground artillery!';
    } else if (analyzedEnemy.status.freezeTimer > 0 && def.damageType === 'physical') {
      advice = '⚡ Shatter Ready: Physical impact triggers +60% bonus shatter burst!';
    } else if (analyzedEnemy.status.markedTimer > 0) {
      advice = '🎯 Marked Target: Takes +35% amplified damage and Execute bonus.';
    }

    enemyAnalysis = {
      name: analyzedEnemy.type.toUpperCase(),
      hp: Math.max(0, Math.round(analyzedEnemy.hp)),
      maxHp: analyzedEnemy.maxHp,
      armor: analyzedEnemy.armor,
      dist,
      inRange,
      effectiveDamage,
      mitigation,
      effectiveDps,
      ttk,
      advice
    };
  }

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
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsComparing(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 border border-sky-400/40 transition-all cursor-pointer"
            title="Compare with another tower or catalog"
          >
            <ArrowRightLeft size={12} />
            <span>Compare</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-1 pt-2 pb-1 border-b border-slate-800/80 shrink-0 text-xs">
        <button
          onClick={() => setActiveTab('inspector')}
          className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'inspector'
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          Upgrades & Status
        </button>
        <button
          onClick={() => setActiveTab('build_advisor')}
          className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'build_advisor'
              ? 'bg-indigo-600/30 text-indigo-200 shadow-sm border border-indigo-500/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Layers size={13} className="text-indigo-400" />
          <span>Build Advisor</span>
          {buildAnalysis.synergies.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-indigo-500 text-white font-mono text-[9px] flex items-center justify-center font-bold">
              {buildAnalysis.synergies.length}
            </span>
          )}
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pt-3 custom-scrollbar text-xs">
        {activeTab === 'build_advisor' ? (
          /* BUILD ADVISOR VIEW */
          <div className="space-y-3 animate-fade-in font-mono">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-indigo-950/80 to-slate-900/80 p-3 rounded-xl border border-indigo-500/40">
              <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Layers size={13} /> Sector Build Analysis
              </div>
              <p className="text-[11px] font-sans text-slate-300 leading-relaxed">
                Deterministic tactical fleet evaluation calculated directly from weapon archetypes and damage interactions.
              </p>
            </div>

            {/* Current Composition */}
            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 font-sans">
                Current Fleet Composition ({sim.towers.length} Towers)
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(buildAnalysis.composition).map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between p-1.5 bg-slate-950/60 rounded border border-slate-800/60 text-xs">
                    <span className="text-slate-300 truncate">{name}</span>
                    <span className="text-emerald-400 font-bold ml-2">×{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Synergies Active */}
            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider mb-2 font-sans flex items-center justify-between">
                <span>Active Synergies</span>
                <span className="text-[9px] text-slate-500">{buildAnalysis.synergies.length} Detected</span>
              </div>
              {buildAnalysis.synergies.length > 0 ? (
                <div className="space-y-2">
                  {buildAnalysis.synergies.map((syn, idx) => (
                    <div key={idx} className="p-2 bg-slate-950/70 rounded-lg border border-emerald-500/30 text-[11px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-emerald-300 font-bold flex items-center gap-1">
                          ✓ {syn.name}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          syn.rating === 'HIGH' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {syn.rating}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                        {syn.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 italic p-2 bg-slate-950/40 rounded border border-slate-800 font-sans">
                  No synergistic combinations active. Pair Frost with heavy physical or Snipers with executioners.
                </div>
              )}
            </div>

            {/* Tactical Weaknesses */}
            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider mb-2 font-sans">
                Tactical Weaknesses
              </div>
              {buildAnalysis.weaknesses.length > 0 ? (
                <div className="space-y-1.5">
                  {buildAnalysis.weaknesses.map((w, idx) => (
                    <div key={idx} className="p-2 bg-amber-950/30 rounded border border-amber-500/30 text-[11px] text-amber-200/90 font-sans flex items-start gap-1.5">
                      <span className="text-amber-400 shrink-0">⚠</span>
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-emerald-300 p-2 bg-emerald-950/20 rounded border border-emerald-500/30 font-sans">
                  ✓ Fleet has full anti-air, armor penetration, and area crowd-control coverage.
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-sky-400 tracking-wider mb-2 font-sans">
                Tactical Recommendations
              </div>
              <div className="space-y-1.5">
                {buildAnalysis.recommendations.map((rec, idx) => (
                  <div key={idx} className="p-2 bg-sky-950/30 rounded border border-sky-500/30 text-[11px] text-sky-200 font-sans flex items-start gap-1.5">
                    <span className="text-sky-400 shrink-0">→</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* STANDARD UPGRADE & STATUS INSPECTOR */
          <>
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

        {/* 2. Tower DPS in Practice & Combat Efficiency */}
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/90 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-200 flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">
              <Activity size={14} className="text-emerald-400" /> Tactical Combat Efficiency
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
              {percentile}{getOrdinalSuffix(percentile)} percentile
            </span>
          </div>

          {/* Detailed Metric Spec as requested */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-2">
            <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
              <div className="text-[9px] text-slate-400 font-sans uppercase">Lifetime</div>
              <div className="text-sm font-bold text-slate-200">{lifetimeSec.toFixed(1)}s</div>
            </div>
            <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
              <div className="text-[9px] text-slate-400 font-sans uppercase">Damage Dealt</div>
              <div className="text-sm font-bold text-slate-200">{tower.totalDamageDealt.toLocaleString()}</div>
            </div>

            <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
              <div className="text-[9px] text-slate-400 font-sans uppercase">Actual DPS</div>
              <div className={`text-sm font-bold ${actualDps >= theoreticalDps * 0.7 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {actualDps}
              </div>
            </div>
            <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
              <div className="text-[9px] text-slate-400 font-sans uppercase">Theoretical DPS</div>
              <div className="text-sm font-bold text-purple-400">{theoreticalDps}</div>
            </div>

            <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
              <div className="text-[9px] text-slate-400 font-sans uppercase">Combat Uptime</div>
              <div className={`text-sm font-bold ${uptime >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {uptime}%
              </div>
            </div>
            <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
              <div className="text-[9px] text-slate-400 font-sans uppercase">Kills</div>
              <div className="text-sm font-bold text-emerald-400">{tower.totalKills}</div>
            </div>

            <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
              <div className="text-[9px] text-slate-400 font-sans uppercase">Gold Invested</div>
              <div className="text-sm font-bold text-yellow-400">{tower.totalInvestedGold}g</div>
            </div>
            <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
              <div className="text-[9px] text-slate-400 font-sans uppercase">Damage / Gold</div>
              <div className="text-sm font-bold text-sky-400">{damagePerGold}</div>
            </div>
          </div>
        </div>

        {/* 3. "Why didn't my tower kill that?" Target Analysis */}
        <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-300 flex items-center gap-1.5 font-semibold text-[11px]">
              <Target size={13} className="text-sky-400" /> Target Analysis
            </span>
            {enemyAnalysis && (
              <button
                onClick={onClearAnalyzedEnemy}
                className="text-[9px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {enemyAnalysis ? (
            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-sky-500/30 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sky-300">{enemyAnalysis.name}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${enemyAnalysis.inRange ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'}`}>
                    {enemyAnalysis.inRange ? 'IN RANGE' : 'OUT OF RANGE'}
                  </span>
                </div>
                <span className="font-mono text-slate-300 text-[10px]">
                  {enemyAnalysis.hp} / {enemyAnalysis.maxHp} HP
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[10px]">
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                  <div className="text-[8px] text-slate-400 uppercase">Armor</div>
                  <div className="font-bold text-slate-200">🛡 {enemyAnalysis.armor}</div>
                </div>
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                  <div className="text-[8px] text-slate-400 uppercase">Per-Hit</div>
                  <div className="font-bold text-emerald-400">{enemyAnalysis.effectiveDamage} dmg</div>
                </div>
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                  <div className="text-[8px] text-slate-400 uppercase">Est. TTK</div>
                  <div className="font-bold text-amber-400">{enemyAnalysis.ttk}s</div>
                </div>
              </div>

              {enemyAnalysis.mitigation > 0 && (
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Armor Mitigation:</span>
                  <span className="text-amber-400 font-mono font-bold">-{enemyAnalysis.mitigation}% reduction</span>
                </div>
              )}

              <div className="text-[10px] text-sky-200 bg-sky-950/40 p-1.5 rounded border border-sky-800/40 flex items-start gap-1">
                <Info size={12} className="shrink-0 text-sky-400 mt-0.5" />
                <span>{enemyAnalysis.advice}</span>
              </div>
            </div>
          ) : (
            <div className="text-[10px] text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-800/50 flex items-center gap-2">
              <Crosshair size={14} className="text-slate-500 shrink-0" />
              <span>Tap any demon on the battlefield while this tower is selected to inspect hit damage, armor reduction, and Time-To-Kill.</span>
            </div>
          )}
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
          </>
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

      {/* Comparison Modal */}
      {isComparing && (
        <TowerComparisonModal
          primaryTower={tower}
          sim={sim}
          onClose={() => setIsComparing(false)}
        />
      )}
    </div>
  );
};
