import React, { useState } from 'react';
import { TOWERS_DATA, ENEMIES_DATA } from '../data/gameData';
import { TowerType, EnemyArchetype } from '../types/game';
import {
  BookOpen,
  Shield,
  Skull,
  X,
  Target,
  Crosshair,
  TrendingUp,
  AlertTriangle,
  Zap,
  MapPin,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface CodexModalProps {
  onClose: () => void;
}

export const CodexModal: React.FC<CodexModalProps> = ({ onClose }) => {
  const [tab, setTab] = useState<'towers' | 'enemies'>('towers');
  const [selectedTower, setSelectedTower] = useState<TowerType>('archer');
  const [selectedEnemy, setSelectedEnemy] = useState<EnemyArchetype>('grunt');

  const towerKeys = Object.keys(TOWERS_DATA) as TowerType[];
  const enemyKeys = Object.keys(ENEMIES_DATA) as EnemyArchetype[];

  const activeTowerDef = TOWERS_DATA[selectedTower];
  const activeEnemyDef = ENEMIES_DATA[selectedEnemy];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-6 text-slate-200 flex flex-col h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center">
              <BookOpen className="text-sky-400" size={20} />
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-white uppercase tracking-wider">
                Citadel Tactical Codex
              </h2>
              <div className="text-xs text-slate-400">
                Strategic specifications, vulnerabilities, and combat synergies
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 my-3 shrink-0">
          <button
            onClick={() => setTab('towers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              tab === 'towers'
                ? 'bg-sky-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Shield size={14} />
            <span>Citadel Towers ({towerKeys.length})</span>
          </button>
          <button
            onClick={() => setTab('enemies')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              tab === 'enemies'
                ? 'bg-rose-500 text-white font-black shadow-md'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Skull size={14} />
            <span>Demonata Bestiary ({enemyKeys.length})</span>
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden py-1">
          {/* List column */}
          <div className="w-full md:w-56 shrink-0 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto pr-1 custom-scrollbar">
            {tab === 'towers' ? (
              towerKeys.map(key => {
                const def = TOWERS_DATA[key];
                const isSelected = selectedTower === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedTower(key)}
                    className={`px-3 py-2 rounded-xl text-left text-xs font-bold transition-all shrink-0 md:shrink flex items-center gap-2 border cursor-pointer ${
                      isSelected
                        ? 'bg-sky-950/80 border-sky-400 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0"
                      style={{ backgroundColor: `${def.color}33`, color: def.accentColor }}
                    >
                      {def.name[0]}
                    </div>
                    <span className="truncate">{def.name}</span>
                  </button>
                );
              })
            ) : (
              enemyKeys.map(key => {
                const def = ENEMIES_DATA[key];
                const isSelected = selectedEnemy === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedEnemy(key)}
                    className={`px-3 py-2 rounded-xl text-left text-xs font-bold transition-all shrink-0 md:shrink flex items-center gap-2 border cursor-pointer ${
                      isSelected
                        ? 'bg-rose-950/80 border-rose-400 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: def.color }}
                    />
                    <span className="truncate">{def.name}</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Details column */}
          <div className="flex-1 overflow-y-auto pr-1.5 custom-scrollbar">
            {tab === 'towers' && activeTowerDef ? (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl border border-white/10"
                    style={{ backgroundColor: `${activeTowerDef.color}33`, color: activeTowerDef.accentColor }}
                  >
                    {activeTowerDef.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-black text-xl text-white">
                        {activeTowerDef.name}
                      </h3>
                      {activeTowerDef.tacticalRole && (
                        <span className="text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 px-2 py-0.5 rounded uppercase">
                          {activeTowerDef.tacticalRole}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-sky-400 font-semibold">{activeTowerDef.role}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  {activeTowerDef.description}
                </p>

                {/* Base Stats */}
                <div className="grid grid-cols-4 gap-2 text-center bg-slate-900/40 p-2.5 rounded-xl border border-slate-800 text-xs font-mono">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-sans">Base Cost</div>
                    <div className="font-bold text-yellow-400">{activeTowerDef.baseCost}g</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-sans">Damage</div>
                    <div className="font-bold text-emerald-400">{activeTowerDef.baseDamage}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-sans">Cadence</div>
                    <div className="font-bold text-sky-400">{activeTowerDef.baseFireRate}/s</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-sans">Range</div>
                    <div className="font-bold text-amber-400">{activeTowerDef.baseRange}px</div>
                  </div>
                </div>

                {/* Tactical Effectiveness (Strong vs / Weak vs) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-1.5 text-xs">
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>Strong Against</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(activeTowerDef.strongAgainst || ['Light Creeps', 'Demonic Infantry']).map((tgt, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-200 border border-emerald-500/20 text-[10px]"
                        >
                          {tgt}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl space-y-1.5 text-xs">
                    <div className="font-bold text-rose-300 flex items-center gap-1.5">
                      <XCircle size={14} className="text-rose-400" />
                      <span>Weak Against</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(activeTowerDef.weakAgainst || ['Armored Plates', 'Swarm Floods']).map((tgt, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-rose-900/40 text-rose-200 border border-rose-500/20 text-[10px]"
                        >
                          {tgt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tactical Synergies */}
                {activeTowerDef.synergies && activeTowerDef.synergies.length > 0 && (
                  <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5 text-xs">
                    <div className="font-bold text-sky-300 flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-sky-400" />
                      <span>Battlefield Synergies</span>
                    </div>
                    <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                      {activeTowerDef.synergies.map((syn, i) => (
                        <li key={i}>{syn}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 3 Specialization Paths */}
                <div className="space-y-2">
                  <div className="font-bold text-xs uppercase text-slate-300 tracking-wider">
                    Specialization Paths (5/2/0 Lock)
                  </div>
                  {activeTowerDef.paths.map((path, idx) => (
                    <div key={path.name} className="p-2.5 bg-slate-900/50 rounded-xl border border-slate-800 space-y-1">
                      <div className="font-bold text-white text-xs">
                        Path {idx + 1}: {path.name}
                      </div>
                      <div className="text-[11px] text-slate-400">{path.description}</div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {path.tiers.map((t, tIdx) => (
                          <span
                            key={t.name}
                            className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-300 border border-slate-700"
                          >
                            T{tIdx + 1}: {t.name} ({t.cost}g)
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              activeEnemyDef && (
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl border border-white/10"
                      style={{ backgroundColor: `${activeEnemyDef.color}33`, color: activeEnemyDef.color }}
                    >
                      <Skull size={24} />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-xl text-white">
                        {activeEnemyDef.name}
                      </h3>
                      <div className="text-xs text-rose-400 font-semibold">{activeEnemyDef.role}</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    {activeEnemyDef.description}
                  </p>

                  {/* Enemy Stats */}
                  <div className="grid grid-cols-4 gap-2 text-center bg-slate-900/40 p-2.5 rounded-xl border border-slate-800 text-xs font-mono">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-sans">Base HP</div>
                      <div className="font-bold text-emerald-400">{activeEnemyDef.baseHp}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-sans">Speed</div>
                      <div className="font-bold text-sky-400">{activeEnemyDef.baseSpeed}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-sans">Armor</div>
                      <div className="font-bold text-amber-400">{activeEnemyDef.baseArmor}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-sans">Reward</div>
                      <div className="font-bold text-yellow-400">{activeEnemyDef.reward}g</div>
                    </div>
                  </div>

                  {/* Threat Power Ranking Meters */}
                  <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="font-bold text-slate-200">Threat Power Profile:</div>

                    {/* HP Meter */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Endurance / HP Rank</span>
                        <span className="font-mono text-emerald-400">{activeEnemyDef.hpRank || 4}/10</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${((activeEnemyDef.hpRank || 4) / 10) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Armor Meter */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Armor Density</span>
                        <span className="font-mono text-amber-400">{activeEnemyDef.armorRank || 2}/10</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${((activeEnemyDef.armorRank || 2) / 10) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Speed Meter */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Speed / Sprint Velocity</span>
                        <span className="font-mono text-sky-400">{activeEnemyDef.speedRank || 5}/10</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-500 rounded-full"
                          style={{ width: `${((activeEnemyDef.speedRank || 5) / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Weaknesses & Resistances */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-1.5">
                      <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                        <Target size={14} className="text-emerald-400" />
                        <span>Vulnerabilities / Weaknesses</span>
                      </div>
                      <div className="space-y-1">
                        {(activeEnemyDef.weaknesses || ['Physical arrows', 'Frost slows']).map((w, i) => (
                          <div key={i} className="text-[11px] text-slate-300 flex items-start gap-1">
                            <span className="text-emerald-400">•</span>
                            <span>{w}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-1.5">
                      <div className="font-bold text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle size={14} className="text-amber-400" />
                        <span>Resistances & Immunities</span>
                      </div>
                      <div className="space-y-1">
                        {(activeEnemyDef.resistances || ['None']).map((r, i) => (
                          <div key={i} className="text-[11px] text-slate-300 flex items-start gap-1">
                            <span className="text-amber-400">•</span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Behavior & Origin */}
                  <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 text-xs">
                    {activeEnemyDef.behavior && (
                      <div>
                        <div className="font-bold text-slate-300 mb-0.5">Behavior:</div>
                        <p className="text-[11px] text-slate-400">{activeEnemyDef.behavior}</p>
                      </div>
                    )}
                    {activeEnemyDef.firstEncountered && (
                      <div className="flex items-center gap-1.5 text-[11px] text-sky-400 pt-1 border-t border-slate-800">
                        <MapPin size={13} />
                        <span>First Encountered: {activeEnemyDef.firstEncountered}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
