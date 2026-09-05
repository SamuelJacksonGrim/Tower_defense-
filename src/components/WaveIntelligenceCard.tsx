import React, { useState } from 'react';
import { WaveDef, EnemyArchetype } from '../types/game';
import { ENEMIES_DATA } from '../data/gameData';
import {
  Skull,
  Play,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Wind,
  Zap,
  Flame,
  Crosshair
} from 'lucide-react';

interface WaveIntelligenceCardProps {
  waveIndex: number;
  totalWaves: number;
  waveDef: WaveDef | null;
  onDeployWave: () => void;
  isDeploying?: boolean;
}

export const WaveIntelligenceCard: React.FC<WaveIntelligenceCardProps> = ({
  waveIndex,
  totalWaves,
  waveDef,
  onDeployWave,
  isDeploying = false
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!waveDef) return null;

  // Aggregate enemy counts and identify tactical threats
  const enemyCounts: Record<EnemyArchetype, number> = {} as Record<EnemyArchetype, number>;
  let totalEnemies = 0;
  let hasArmored = false;
  let hasFlying = false;
  let hasFast = false;
  let hasSplitter = false;
  let hasLeech = false;
  let hasBoss = false;

  for (const group of waveDef.groups) {
    const count = group.count;
    totalEnemies += count;
    enemyCounts[group.enemyType] = (enemyCounts[group.enemyType] || 0) + count;

    const eDef = ENEMIES_DATA[group.enemyType];
    if (eDef) {
      if (eDef.baseArmor >= 4) hasArmored = true;
      if (eDef.isFlying) hasFlying = true;
      if (eDef.baseSpeed >= 125) hasFast = true;
      if (eDef.type === 'splitter') hasSplitter = true;
      if (eDef.type === 'leech') hasLeech = true;
      if (eDef.isBoss) hasBoss = true;
    }
  }

  return (
    <div className="absolute left-4 top-16 z-30 w-80 sm:w-88 bg-slate-950/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-3.5 text-slate-200 animate-slide-right">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Skull size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-xs text-white uppercase tracking-wider">
                WAVE {waveIndex} OF {totalWaves}
              </span>
              {hasBoss && (
                <span className="text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.5 rounded animate-pulse">
                  BOSS
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 font-medium truncate max-w-[170px]">
              {waveDef.title}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(e => !e)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse Intel' : 'Expand Intel'}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="pt-2.5 space-y-2.5 text-xs">
          {/* Enemy Breakdown List */}
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 flex items-center justify-between">
              <span>Hostile Incursion ({totalEnemies} demons)</span>
            </div>
            <div className="space-y-1 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
              {Object.entries(enemyCounts).map(([type, count]) => {
                const eDef = ENEMIES_DATA[type as EnemyArchetype] || ENEMIES_DATA.grunt;
                return (
                  <div
                    key={type}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/70 border border-slate-800/80"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: eDef.color }}
                      />
                      <span className="font-mono font-bold text-slate-200">
                        {count} × <span className="font-sans font-medium text-slate-300">{eDef.name}</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {eDef.role}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tactical Intelligence Warnings */}
          <div className="space-y-1 pt-1 border-t border-slate-800/80">
            {hasArmored && (
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-1 rounded border border-amber-500/30">
                <ShieldAlert size={12} className="shrink-0 text-amber-400" />
                <span>⚠ HEAVY ARMOR: Shrugs physical arrows; use Mage / Magic</span>
              </div>
            )}
            {hasFast && (
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-orange-400 bg-orange-950/40 px-2 py-1 rounded border border-orange-500/30">
                <Wind size={12} className="shrink-0 text-orange-400" />
                <span>⚠ FAST / SPEED THREAT: Sprinting creeps; deploy Frost</span>
              </div>
            )}
            {hasFlying && (
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-sky-400 bg-sky-950/40 px-2 py-1 rounded border border-sky-500/30">
                <Crosshair size={12} className="shrink-0 text-sky-400" />
                <span>⚠ AIRBORNE: Ground artillery cannot hit; use Ballista / Archer</span>
              </div>
            )}
            {hasSplitter && (
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-purple-400 bg-purple-950/40 px-2 py-1 rounded border border-purple-500/30">
                <Zap size={12} className="shrink-0 text-purple-400" />
                <span>⚠ SPLITTER: Splits into Ember Mites on death; ready AoE</span>
              </div>
            )}
            {hasLeech && (
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/30">
                <Flame size={12} className="shrink-0 text-emerald-400" />
                <span>⚠ VOID REGENERATION: Regenerates HP; counter with continuous burn</span>
              </div>
            )}
            {hasBoss && (
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-rose-400 bg-rose-950/40 px-2 py-1 rounded border border-rose-500/30">
                <AlertTriangle size={12} className="shrink-0 text-rose-400" />
                <span>⚠ COLOSSAL BOSS: Immense health pool; leaks cost 5 lives</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deploy Button */}
      <div className="mt-2.5 pt-2 border-t border-slate-800">
        <button
          onClick={onDeployWave}
          disabled={isDeploying}
          className="w-full py-2 px-3 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <Play size={13} className="fill-white" />
          <span>Launch Wave {waveIndex}</span>
        </button>
      </div>
    </div>
  );
};
