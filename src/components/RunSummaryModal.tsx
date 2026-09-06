import React, { useState } from 'react';
import { SimWorld } from '../sim/SimWorld';
import { TOWERS_DATA } from '../data/gameData';
import {
  X,
  Award,
  Coins,
  ShieldCheck,
  ShieldAlert,
  BarChart2,
  CheckCircle2,
  Flame,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface RunSummaryModalProps {
  sim: SimWorld;
  onClose: () => void;
  onNextWave?: () => void;
  initialScope?: 'wave' | 'run';
}

export const RunSummaryModal: React.FC<RunSummaryModalProps> = ({
  sim,
  onClose,
  onNextWave,
  initialScope = 'run'
}) => {
  const telemetry = sim.telemetry;
  const lastWaveSummary = telemetry.waveHistory.length > 0
    ? telemetry.waveHistory[telemetry.waveHistory.length - 1]
    : null;

  const [scope, setScope] = useState<'wave' | 'run'>(
    initialScope === 'wave' && lastWaveSummary ? 'wave' : 'run'
  );

  // Compute stats based on active scope
  const isWave = scope === 'wave' && lastWaveSummary;

  const title = isWave
    ? `WAVE ${lastWaveSummary.waveIndex} COMPLETE`
    : `SECTOR RUN SUMMARY`;

  const totalDamage = isWave
    ? Math.max(1, lastWaveSummary.totalDamage)
    : Math.max(1, telemetry.runTotalDamage);

  const towerDamageMap = isWave
    ? lastWaveSummary.towerDamage
    : telemetry.runTowerDamage;

  const towerKillsMap = isWave
    ? lastWaveSummary.towerKills
    : telemetry.runTowerKills;

  const goldEarned = isWave ? lastWaveSummary.goldEarned : telemetry.runGoldEarned;
  const goldSpent = isWave ? lastWaveSummary.goldSpent : telemetry.runGoldSpent;
  const goldRefunded = isWave ? lastWaveSummary.goldRefunded : telemetry.runGoldRefunded;
  const leaks = isWave ? lastWaveSummary.leaks : telemetry.runLeaks;

  // Compute Damage Breakdown (Top 4 + Other)
  const sortedTowerDamage = Object.entries(towerDamageMap)
    .filter(([, dmg]) => dmg > 0)
    .sort(([, a], [, b]) => b - a);

  let displayedBreakdown: Array<{ name: string; pct: number; damage: number; color?: string }> = [];
  if (sortedTowerDamage.length <= 4) {
    displayedBreakdown = sortedTowerDamage.map(([tType, dmg]) => ({
      name: TOWERS_DATA[tType]?.name || tType,
      pct: Math.round((dmg / totalDamage) * 1000) / 10,
      damage: dmg,
      color: TOWERS_DATA[tType]?.color || '#94a3b8'
    }));
  } else {
    const top4 = sortedTowerDamage.slice(0, 4);
    const otherDmg = sortedTowerDamage.slice(4).reduce((sum, [, d]) => sum + d, 0);

    displayedBreakdown = top4.map(([tType, dmg]) => ({
      name: TOWERS_DATA[tType]?.name || tType,
      pct: Math.round((dmg / totalDamage) * 1000) / 10,
      damage: dmg,
      color: TOWERS_DATA[tType]?.color || '#94a3b8'
    }));

    if (otherDmg > 0) {
      displayedBreakdown.push({
        name: 'Other',
        pct: Math.round((otherDmg / totalDamage) * 1000) / 10,
        damage: otherDmg,
        color: '#64748b'
      });
    }
  }

  // Find Most Effective Tower (MVP)
  const mvpEntry = sortedTowerDamage[0];
  const mvpDef = mvpEntry ? TOWERS_DATA[mvpEntry[0]] : null;
  const mvpDamage = mvpEntry ? mvpEntry[1] : 0;
  const mvpKills = mvpEntry ? (towerKillsMap[mvpEntry[0]] || 0) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.6)] p-5 text-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div>
            <h2 className="font-display font-black text-lg text-white tracking-wider flex items-center gap-2">
              <BarChart2 size={18} className="text-sky-400" />
              {title}
            </h2>
            <p className="text-[11px] text-slate-400">
              Tactical performance telemetry & resource economics
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scope Selector */}
        {lastWaveSummary && (
          <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 my-3 shrink-0">
            <button
              onClick={() => setScope('wave')}
              className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                scope === 'wave'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Wave {lastWaveSummary.waveIndex}
            </button>
            <button
              onClick={() => setScope('run')}
              className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                scope === 'run'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Full Run
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 custom-scrollbar text-xs">
          {/* 1. DAMAGE Breakdown */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold text-slate-400">
              <span>Damage Distribution</span>
              <span className="font-mono text-slate-300 font-bold">{totalDamage.toLocaleString()} total</span>
            </div>

            {displayedBreakdown.length === 0 ? (
              <div className="text-slate-500 italic text-center py-2">
                No damage recorded during this cycle.
              </div>
            ) : (
              <div className="space-y-1.5">
                {displayedBreakdown.map(item => (
                  <div key={item.name} className="space-y-0.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-200 font-sans font-medium">{item.name}</span>
                      <span className="text-sky-300 font-bold">{item.pct.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(2, item.pct)}%`,
                          backgroundColor: item.color || '#38bdf8'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. MOST EFFECTIVE */}
          {mvpDef && (
            <div className="bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-slate-950/60 p-3 rounded-xl border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg border border-white/10 shadow-inner shrink-0"
                  style={{ backgroundColor: `${mvpDef.color}33`, color: mvpDef.accentColor }}
                >
                  ★
                </div>
                <div>
                  <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Award size={12} /> Most Effective
                  </div>
                  <div className="font-display font-bold text-sm text-white">
                    {mvpDef.name}
                  </div>
                  <div className="text-[11px] font-mono text-slate-300 flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">{mvpDamage.toLocaleString()} damage</span>
                    <span>•</span>
                    <span className="text-sky-400 font-bold">{mvpKills} kills</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. ECONOMY */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
              <Coins size={13} className="text-yellow-400" /> Economy
            </div>
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
                <div className="text-[9px] text-slate-400 font-sans uppercase">Gold Earned</div>
                <div className="text-sm font-bold text-yellow-300">+{goldEarned}g</div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
                <div className="text-[9px] text-slate-400 font-sans uppercase">Gold Spent</div>
                <div className="text-sm font-bold text-amber-400">{goldSpent}g</div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
                <div className="text-[9px] text-slate-400 font-sans uppercase">Gold Refunded</div>
                <div className="text-sm font-bold text-emerald-400">+{goldRefunded}g</div>
              </div>
            </div>
          </div>

          {/* 4. LEAKS */}
          <div className={`p-3 rounded-xl border flex items-center justify-between font-mono text-xs ${
            leaks === 0
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
          }`}>
            <div className="flex items-center gap-2 font-sans">
              {leaks === 0 ? (
                <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              ) : (
                <ShieldAlert size={16} className="text-rose-400 shrink-0" />
              )}
              <span className="font-bold">
                {leaks === 0 ? 'FLAWLESS DEFENSE' : 'PERIMETER BREACHES'}
              </span>
            </div>
            <div className="font-bold text-sm">
              LEAKS: {leaks}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 shrink-0 flex gap-2">
          {onNextWave && (
            <button
              onClick={() => {
                onClose();
                onNextWave();
              }}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-900/40 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Next Wave</span>
              <ArrowRight size={14} />
            </button>
          )}
          <button
            onClick={onClose}
            className={`${onNextWave ? 'px-4' : 'w-full'} py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer text-center`}
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
