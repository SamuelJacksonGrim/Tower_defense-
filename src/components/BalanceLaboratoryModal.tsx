import React, { useState, useMemo } from 'react';
import { TowerType, EnemyType } from '../types/game';
import { TOWERS_DATA, ENEMIES_DATA } from '../data/gameData';
import { BalanceLaboratory, BalanceBenchmarkResult, TowerComparisonBenchmark } from '../sim/BalanceLaboratory';
import {
  X,
  FlaskConical,
  Play,
  TrendingUp,
  Shield,
  Coins,
  Crosshair,
  Award,
  Zap,
  BarChart3,
  Layers,
  ArrowRightLeft
} from 'lucide-react';

interface BalanceLaboratoryModalProps {
  onClose: () => void;
}

export const BalanceLaboratoryModal: React.FC<BalanceLaboratoryModalProps> = ({ onClose }) => {
  const [mode, setMode] = useState<'single' | 'comparison'>('single');

  // Single mode state
  const [selectedTower, setSelectedTower] = useState<TowerType>('cannon');
  const [pathRanks, setPathRanks] = useState<[number, number, number]>([3, 2, 0]);
  const [targetEnemy, setTargetEnemy] = useState<EnemyType>('armored');
  const [benchmarkResult, setBenchmarkResult] = useState<BalanceBenchmarkResult | null>(null);

  // Comparison mode state
  const [towerA, setTowerA] = useState<TowerType>('cannon');
  const [ranksA, setRanksA] = useState<[number, number, number]>([4, 2, 0]);
  const [towerB, setTowerB] = useState<TowerType>('ballista');
  const [ranksB, setRanksB] = useState<[number, number, number]>([0, 4, 2]);
  const [comparisonEnemy, setComparisonEnemy] = useState<EnemyType>('armored');
  const [comparisonResult, setComparisonResult] = useState<TowerComparisonBenchmark | null>(null);

  const [isRunning, setIsRunning] = useState(false);

  // Run single benchmark
  const handleRunSingle = () => {
    setIsRunning(true);
    setTimeout(() => {
      const result = BalanceLaboratory.runBenchmark(selectedTower, pathRanks, targetEnemy, 500);
      setBenchmarkResult(result);
      setIsRunning(false);
    }, 50);
  };

  // Run comparison benchmark
  const handleRunComparison = () => {
    setIsRunning(true);
    setTimeout(() => {
      const result = BalanceLaboratory.compare(
        { towerType: towerA, pathRanks: ranksA },
        { towerType: towerB, pathRanks: ranksB },
        comparisonEnemy,
        500
      );
      setComparisonResult(result);
      setIsRunning(false);
    }, 50);
  };

  // Safe path rank setter obeying 5/2/0 rule
  const updateRank = (
    current: [number, number, number],
    setFn: (r: [number, number, number]) => void,
    pIdx: 0 | 1 | 2,
    delta: number
  ) => {
    const next: [number, number, number] = [...current];
    const target = Math.max(0, Math.min(5, next[pIdx] + delta));

    // Check 5/2/0 lock
    if (target >= 3) {
      // Other two paths must be <= 2, and at most one can be > 0
      for (let i = 0; i < 3; i++) {
        if (i !== pIdx && next[i] > 2) next[i] = 2;
      }
      const otherNonZero = [0, 1, 2].filter(i => i !== pIdx && next[i] > 0);
      if (otherNonZero.length > 1) {
        next[otherNonZero[1]] = 0;
      }
    } else {
      const primaryIdx = next.findIndex(r => r >= 3);
      if (primaryIdx !== -1 && primaryIdx !== pIdx) {
        // We are on an off-path while primary exists. Check if third path is active
        const thirdIdx = [0, 1, 2].find(i => i !== primaryIdx && i !== pIdx)!;
        if (next[thirdIdx] > 0 && target > 0) {
          next[thirdIdx] = 0;
        }
      }
    }
    next[pIdx] = target;
    setFn(next);
  };

  const towerKeys = Object.keys(TOWERS_DATA) as TowerType[];
  const enemyKeys = Object.keys(ENEMIES_DATA) as EnemyType[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in text-slate-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center font-bold">
              <FlaskConical size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-white">Empirical Balance Laboratory</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Dev Bench • 500 Trials
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Run deterministic Monte-Carlo combat simulations to measure true DPS curves, TTK, and gold efficiency.
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

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 gap-2 text-xs shrink-0">
          <button
            onClick={() => setMode('single')}
            className={`px-4 py-2 font-bold uppercase tracking-wider rounded-t-lg transition-all cursor-pointer ${
              mode === 'single'
                ? 'bg-slate-900 text-purple-300 border-t border-x border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Single Tower Profiler
          </button>
          <button
            onClick={() => setMode('comparison')}
            className={`px-4 py-2 font-bold uppercase tracking-wider rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              mode === 'comparison'
                ? 'bg-slate-900 text-sky-300 border-t border-x border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft size={13} />
            <span>A / B Combat Gauntlet</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar space-y-4 text-xs">
          {mode === 'single' ? (
            /* SINGLE TOWER PROFILER */
            <div className="space-y-4">
              {/* Controls Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Tower Selection */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Select Tower Archetype
                  </div>
                  <select
                    value={selectedTower}
                    onChange={e => setSelectedTower(e.target.value as TowerType)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium cursor-pointer"
                  >
                    {towerKeys.map(k => (
                      <option key={k} value={k}>{TOWERS_DATA[k].name}</option>
                    ))}
                  </select>
                </div>

                {/* 5/2/0 Path Configuration */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    <span>Path Allocation</span>
                    <span className="text-purple-400 font-mono">
                      {pathRanks[0]}-{pathRanks[1]}-{pathRanks[2]}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map(idx => (
                      <div key={idx} className="bg-slate-900 p-2 rounded border border-slate-800 flex flex-col items-center">
                        <span className="text-[9px] text-slate-400 font-bold mb-1">Path {idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateRank(pathRanks, setPathRanks, idx as 0 | 1 | 2, -1)}
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-bold text-white font-mono">{pathRanks[idx]}</span>
                          <button
                            onClick={() => updateRank(pathRanks, setPathRanks, idx as 0 | 1 | 2, 1)}
                            className="w-6 h-6 rounded bg-purple-600/60 hover:bg-purple-600 text-white font-bold flex items-center justify-center cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Demon Target */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Simulated Opponent
                  </div>
                  <select
                    value={targetEnemy}
                    onChange={e => setTargetEnemy(e.target.value as EnemyType)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium cursor-pointer"
                  >
                    {enemyKeys.map(k => (
                      <option key={k} value={k}>
                        {ENEMIES_DATA[k].name} ({ENEMIES_DATA[k].hp} HP, {ENEMIES_DATA[k].armor} Armor)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleRunSingle}
                disabled={isRunning}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-950/50 cursor-pointer disabled:opacity-50"
              >
                <Play size={15} />
                <span>{isRunning ? 'Executing 500 Combat Trials...' : 'Run 500-Simulation Empirical Benchmark'}</span>
              </button>

              {/* Benchmark Results */}
              {benchmarkResult && (
                <div className="space-y-3 animate-fade-in font-mono">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
                      <div className="text-[9px] text-slate-400 uppercase font-sans">Mean Empirical DPS</div>
                      <div className="text-xl font-bold text-emerald-400 mt-0.5">{benchmarkResult.meanDps}</div>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
                      <div className="text-[9px] text-slate-400 uppercase font-sans">Median DPS</div>
                      <div className="text-xl font-bold text-sky-400 mt-0.5">{benchmarkResult.medianDps}</div>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
                      <div className="text-[9px] text-slate-400 uppercase font-sans">Average TTK</div>
                      <div className="text-xl font-bold text-amber-400 mt-0.5">{benchmarkResult.averageTtkSeconds}s</div>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
                      <div className="text-[9px] text-slate-400 uppercase font-sans">Damage / Gold</div>
                      <div className="text-xl font-bold text-purple-400 mt-0.5">{benchmarkResult.damagePerGold}</div>
                    </div>
                  </div>

                  {/* Secondary Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 font-sans">
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between">
                      <span className="text-slate-400">Total Investment Cost:</span>
                      <strong className="text-yellow-300 font-mono">{benchmarkResult.totalCost}g</strong>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between">
                      <span className="text-slate-400">Armor Mitigation Absorbed:</span>
                      <strong className="text-rose-400 font-mono">-{benchmarkResult.armorMitigationPercent}%</strong>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between">
                      <span className="text-slate-400">Overkill Damage Wasted:</span>
                      <strong className="text-amber-400 font-mono">{benchmarkResult.overkillWastePercent}%</strong>
                    </div>
                  </div>

                  {/* DPS Distribution Histogram */}
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2 font-sans">
                    <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold">
                      <span className="flex items-center gap-1.5"><BarChart3 size={14} className="text-purple-400" /> DPS Spread Histogram (Variance from Crits & Rounding)</span>
                      <span className="font-mono text-slate-400 text-[10px]">Min {benchmarkResult.minDps} — Max {benchmarkResult.maxDps}</span>
                    </div>
                    <div className="h-20 flex items-end gap-1.5 pt-2 px-2 bg-slate-900/60 rounded-lg border border-slate-800/80">
                      {benchmarkResult.dpsDistribution.map((count, i) => {
                        const maxCount = Math.max(1, ...benchmarkResult.dpsDistribution);
                        const pct = Math.round((count / maxCount) * 100);
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                            <div
                              className="w-full bg-purple-500/80 hover:bg-purple-400 transition-all rounded-t"
                              style={{ height: `${pct}%` }}
                            />
                            <span className="text-[8px] text-slate-500 font-mono">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* A / B COMBAT GAUNTLET */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Config A */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-sky-500/40 space-y-2">
                  <div className="text-[10px] uppercase font-bold text-sky-400 tracking-wider flex items-center justify-between">
                    <span>Configuration Alpha</span>
                    <span className="font-mono">{ranksA[0]}-{ranksA[1]}-{ranksA[2]}</span>
                  </div>
                  <select
                    value={towerA}
                    onChange={e => setTowerA(e.target.value as TowerType)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium cursor-pointer"
                  >
                    {towerKeys.map(k => (
                      <option key={k} value={k}>{TOWERS_DATA[k].name}</option>
                    ))}
                  </select>
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {[0, 1, 2].map(idx => (
                      <div key={idx} className="bg-slate-900 p-1.5 rounded border border-slate-800 flex flex-col items-center">
                        <span className="text-[8px] text-slate-400 font-bold mb-0.5">P{idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateRank(ranksA, setRanksA, idx as 0 | 1 | 2, -1)}
                            className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                          >-</button>
                          <span className="w-4 text-center font-bold text-white font-mono">{ranksA[idx]}</span>
                          <button
                            onClick={() => updateRank(ranksA, setRanksA, idx as 0 | 1 | 2, 1)}
                            className="w-5 h-5 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center justify-center cursor-pointer"
                          >+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Config B */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-purple-500/40 space-y-2">
                  <div className="text-[10px] uppercase font-bold text-purple-400 tracking-wider flex items-center justify-between">
                    <span>Configuration Beta</span>
                    <span className="font-mono">{ranksB[0]}-{ranksB[1]}-{ranksB[2]}</span>
                  </div>
                  <select
                    value={towerB}
                    onChange={e => setTowerB(e.target.value as TowerType)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium cursor-pointer"
                  >
                    {towerKeys.map(k => (
                      <option key={k} value={k}>{TOWERS_DATA[k].name}</option>
                    ))}
                  </select>
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {[0, 1, 2].map(idx => (
                      <div key={idx} className="bg-slate-900 p-1.5 rounded border border-slate-800 flex flex-col items-center">
                        <span className="text-[8px] text-slate-400 font-bold mb-0.5">P{idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateRank(ranksB, setRanksB, idx as 0 | 1 | 2, -1)}
                            className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                          >-</button>
                          <span className="w-4 text-center font-bold text-white font-mono">{ranksB[idx]}</span>
                          <button
                            onClick={() => updateRank(ranksB, setRanksB, idx as 0 | 1 | 2, 1)}
                            className="w-5 h-5 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center justify-center cursor-pointer"
                          >+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Shared Target */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Gauntlet Opponent:
                </div>
                <select
                  value={comparisonEnemy}
                  onChange={e => setComparisonEnemy(e.target.value as EnemyType)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium cursor-pointer"
                >
                  {enemyKeys.map(k => (
                    <option key={k} value={k}>
                      {ENEMIES_DATA[k].name} ({ENEMIES_DATA[k].hp} HP, {ENEMIES_DATA[k].armor} Armor)
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Button */}
              <button
                onClick={handleRunComparison}
                disabled={isRunning}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-sky-950/50 cursor-pointer disabled:opacity-50"
              >
                <ArrowRightLeft size={15} />
                <span>{isRunning ? 'Running Comparative Trials...' : 'Simulate Side-by-Side Balance Matchup'}</span>
              </button>

              {/* Comparison Results */}
              {comparisonResult && (
                <div className="space-y-3 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-sky-500/40">
                      <h3 className="font-bold text-sm text-sky-300 mb-1">
                        {TOWERS_DATA[towerA].name} ({ranksA.join('-')})
                      </h3>
                      <div className="text-xl font-bold font-mono text-white">{comparisonResult.resultA.meanDps} DPS</div>
                      <div className="text-[11px] text-slate-400 mt-1 font-mono">
                        {comparisonResult.resultA.damagePerGold} dmg/gold • {comparisonResult.resultA.averageTtkSeconds}s TTK
                      </div>
                      {comparisonResult.winnerDps === 'A' && (
                        <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 py-0.5 rounded">
                          ★ Raw DPS Champion
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-950/80 p-3 rounded-xl border border-purple-500/40">
                      <h3 className="font-bold text-sm text-purple-300 mb-1">
                        {TOWERS_DATA[towerB].name} ({ranksB.join('-')})
                      </h3>
                      <div className="text-xl font-bold font-mono text-white">{comparisonResult.resultB.meanDps} DPS</div>
                      <div className="text-[11px] text-slate-400 mt-1 font-mono">
                        {comparisonResult.resultB.damagePerGold} dmg/gold • {comparisonResult.resultB.averageTtkSeconds}s TTK
                      </div>
                      {comparisonResult.winnerDps === 'B' && (
                        <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 py-0.5 rounded">
                          ★ Raw DPS Champion
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
