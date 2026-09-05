import React, { useState } from 'react';
import { TOWERS_DATA, ENEMIES_DATA } from '../data/gameData';
import { TowerType, EnemyArchetype } from '../types/game';
import { BookOpen, Shield, Skull, X, Zap, Target, Crosshair, ArrowRight } from 'lucide-react';

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
                Authoritative specifications for Citadel Defenders and Demonata Incursions
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

        {/* Tab switch */}
        <div className="flex gap-2 my-3 shrink-0">
          <button
            onClick={() => setTab('towers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
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
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
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
                    className={`px-3 py-2 rounded-xl text-left text-xs font-bold transition-all shrink-0 md:shrink flex items-center gap-2 border ${
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
                    className={`px-3 py-2 rounded-xl text-left text-xs font-bold transition-all shrink-0 md:shrink flex items-center gap-2 border ${
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
          <div className="flex-1 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 overflow-y-auto custom-scrollbar">
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
                    <h3 className="font-display font-black text-xl text-white">
                      {activeTowerDef.name}
                    </h3>
                    <div className="text-xs text-sky-400 font-semibold">{activeTowerDef.role}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  {activeTowerDef.description}
                </p>

                {/* Base Stats */}
                <div className="grid grid-cols-4 gap-2 text-center bg-slate-900/40 p-2.5 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Cost</div>
                    <div className="font-mono font-bold text-yellow-300">{activeTowerDef.baseCost}g</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Damage</div>
                    <div className="font-mono font-bold text-emerald-400">{activeTowerDef.baseDamage}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Speed</div>
                    <div className="font-mono font-bold text-sky-400">{activeTowerDef.baseFireRate}/s</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Range</div>
                    <div className="font-mono font-bold text-purple-400">{activeTowerDef.baseRange}</div>
                  </div>
                </div>

                {/* 3 Specialization Paths */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Target size={14} className="text-emerald-400" /> 3 Specialization Branches (5/2/0 Lock)
                  </h4>
                  {activeTowerDef.paths.map((path, idx) => (
                    <div key={path.name} className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">
                          Path {idx + 1}: {path.name}
                        </span>
                        <span className="text-[10px] text-slate-400">{path.description}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5 pt-1">
                        {path.tiers.map((tier, tIdx) => (
                          <div key={tier.name} className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80 text-[11px]">
                            <div className="font-bold text-sky-300">T{tIdx + 1}: {tier.name}</div>
                            <div className="text-[10px] text-yellow-400 font-mono font-semibold">{tier.cost}g</div>
                            <div className="text-[10px] text-slate-400 leading-tight mt-1">{tier.description}</div>
                          </div>
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
                  <div className="grid grid-cols-4 gap-2 text-center bg-slate-900/40 p-2.5 rounded-xl border border-slate-800 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Base HP</div>
                      <div className="font-mono font-bold text-emerald-400">{activeEnemyDef.baseHp}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Speed</div>
                      <div className="font-mono font-bold text-sky-400">{activeEnemyDef.baseSpeed}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Armor</div>
                      <div className="font-mono font-bold text-amber-400">{activeEnemyDef.baseArmor}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Reward</div>
                      <div className="font-mono font-bold text-yellow-400">{activeEnemyDef.reward}g</div>
                    </div>
                  </div>

                  {/* Traits & Counter-tactics */}
                  <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="font-bold text-slate-200">Traits & Tactical Counters:</div>
                    <ul className="list-disc list-inside text-slate-400 space-y-1">
                      {activeEnemyDef.isFlying && (
                        <li className="text-sky-300">Airborne: Completely immune to ground artillery (Cannon, Mortar). Requires Ballista or Archer.</li>
                      )}
                      {activeEnemyDef.baseArmor > 0 && (
                        <li className="text-amber-300">Armored: Flat reduction against physical damage. Weak to Mage Tower magic penetration and Pyromancer burns.</li>
                      )}
                      {activeEnemyDef.type === 'splitter' && (
                        <li className="text-rose-300">Splitting: Spawns 2 Ember Mites upon death. Prepare Frost slows and splash defenses.</li>
                      )}
                      {activeEnemyDef.type === 'leech' && (
                        <li className="text-purple-300">Vampiric Leech: Rapidly regenerates health unless ignited with continuous fire damage.</li>
                      )}
                      {activeEnemyDef.isBoss && (
                        <li className="text-yellow-300">Boss Entity: Has 50% CC resistance against stun/freeze and 40% reduction against percentage-HP effects. Focus with Obelisk of Light.</li>
                      )}
                    </ul>
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
