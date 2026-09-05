import React, { useState } from 'react';
import { SimWorld } from '../sim/SimWorld';
import { TOWERS_DATA } from '../data/gameData';
import {
  Activity,
  X,
  Zap,
  Skull,
  Coins,
  ShieldAlert,
  Clock,
  History,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface TelemetryModalProps {
  sim: SimWorld;
  onClose: () => void;
}

export const TelemetryModal: React.FC<TelemetryModalProps> = ({ sim, onClose }) => {
  const [tab, setTab] = useState<'towers' | 'waves' | 'events'>('towers');
  const telemetry = sim.telemetry;

  const currentDps = telemetry.getCurrentWaveDps();
  const recentEvents = telemetry.getRecentEvents(30);

  const totalRunDamage = Math.max(1, telemetry.runTotalDamage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-5 text-slate-200 flex flex-col h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400">
              <Activity size={20} />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-white uppercase tracking-wider">
                Combat Telemetry & Balancing Monitor
              </h2>
              <p className="text-xs text-slate-400">
                Live simulation metrics, DPS distribution, and combat event logs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Global Summary KPI Bar */}
        <div className="grid grid-cols-5 gap-2 my-3 p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-xl text-center shrink-0 text-xs font-mono">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-sans">Run Damage</div>
            <div className="text-emerald-400 font-bold text-sm">{telemetry.runTotalDamage.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-sans">Total Kills</div>
            <div className="text-sky-400 font-bold text-sm">{telemetry.runTotalKills}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-sans">Leaks</div>
            <div className={`font-bold text-sm ${telemetry.runLeaks > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
              {telemetry.runLeaks}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-sans">Gold Spent</div>
            <div className="text-amber-400 font-bold text-sm">{telemetry.runGoldSpent}g</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-sans">Gold Earned</div>
            <div className="text-yellow-400 font-bold text-sm">{telemetry.runGoldEarned}g</div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 mb-3 shrink-0">
          <button
            onClick={() => setTab('towers')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              tab === 'towers'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <BarChart3 size={13} />
            <span>Tower DPS & Damage</span>
          </button>
          <button
            onClick={() => setTab('waves')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              tab === 'waves'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <History size={13} />
            <span>Wave History ({telemetry.waveHistory.length})</span>
          </button>
          <button
            onClick={() => setTab('events')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              tab === 'events'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Activity size={13} />
            <span>Live Event Stream</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar text-xs">
          {tab === 'towers' && (
            <div className="space-y-3">
              <div className="text-slate-400 text-xs">
                Aggregate damage contribution across all deployed defense classes:
              </div>

              <div className="space-y-2">
                {Object.entries(telemetry.runTowerDamage).length === 0 ? (
                  <div className="p-8 text-center text-slate-500 italic bg-slate-900/30 rounded-xl border border-slate-800">
                    No tower combat records yet. Launch a wave to measure live telemetry.
                  </div>
                ) : (
                  Object.entries(telemetry.runTowerDamage)
                    .sort(([, a], [, b]) => b - a)
                    .map(([tType, dmg]) => {
                      const def = TOWERS_DATA[tType];
                      const kills = telemetry.runTowerKills[tType] || 0;
                      const pct = Math.round((dmg / totalRunDamage) * 100);
                      const dps = currentDps[tType] || 0;

                      return (
                        <div
                          key={tType}
                          className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs"
                                style={{ backgroundColor: `${def?.color || '#38bdf8'}33`, color: def?.accentColor || '#38bdf8' }}
                              >
                                {def?.name[0] || tType[0].toUpperCase()}
                              </div>
                              <span className="font-bold text-white text-sm">{def?.name || tType}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({pct}% of total)</span>
                            </div>

                            <div className="flex items-center gap-4 font-mono">
                              <span className="text-sky-400">{dps} DPS</span>
                              <span className="text-emerald-400 font-bold">{dmg.toLocaleString()} DMG</span>
                              <span className="text-amber-400">{kills} kills</span>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.max(3, pct)}%`,
                                backgroundColor: def?.accentColor || '#a855f7'
                              }}
                            />
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {tab === 'waves' && (
            <div className="space-y-2">
              {telemetry.waveHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-500 italic bg-slate-900/30 rounded-xl border border-slate-800">
                  No completed waves logged yet. Complete wave incursions to review pacing analytics.
                </div>
              ) : (
                telemetry.waveHistory.map(summary => (
                  <div
                    key={summary.waveIndex}
                    className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white text-sm">
                        Wave {summary.waveIndex}: {summary.waveTitle}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <Clock size={12} />
                        <span>Duration: {summary.durationSec}s</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-mono">+{summary.goldEarned}g earned</span>
                        <span>•</span>
                        <span className="text-yellow-400 font-mono">-{summary.goldSpent}g invested</span>
                      </div>
                    </div>

                    <div className="text-right font-mono text-xs space-y-0.5">
                      <div className="text-emerald-400 font-bold">{summary.totalDamage.toLocaleString()} Total DMG</div>
                      <div className="text-sky-400">{summary.totalKills} Kills • {summary.leaks} Leaks</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'events' && (
            <div className="space-y-1 font-mono text-[11px]">
              {recentEvents.length === 0 ? (
                <div className="p-8 text-center text-slate-500 italic bg-slate-900/30 rounded-xl border border-slate-800">
                  No combat events captured yet.
                </div>
              ) : (
                recentEvents.slice().reverse().map(evt => (
                  <div
                    key={evt.id}
                    className="p-1.5 rounded bg-slate-950/40 border border-slate-800/60 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[10px]">W{evt.wave}</span>
                      <span
                        className={`font-bold uppercase text-[10px] px-1.5 py-0.2 rounded ${
                          evt.type === 'EnemyKilled'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : evt.type === 'EnemyLeaked'
                            ? 'bg-rose-500/20 text-rose-400'
                            : evt.type === 'TowerPlaced' || evt.type === 'TowerUpgraded'
                            ? 'bg-sky-500/20 text-sky-400'
                            : evt.type === 'DamageDealt'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {evt.type}
                      </span>
                      <span className="text-slate-300">
                        {evt.towerType && <span className="text-sky-300">[{evt.towerType}] </span>}
                        {evt.enemyType && <span className="text-rose-300">target:{evt.enemyType} </span>}
                        {evt.amount !== undefined && <span className="text-amber-300">{evt.amount} </span>}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-sans">
                      {Math.round(evt.timestamp % 100000)}ms
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center shrink-0">
          <button
            onClick={() => telemetry.reset()}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Reset Metrics
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
