import React, { useState } from 'react';
import { PlacedTower, TowerType } from '../types/game';
import { TOWERS_DATA } from '../data/gameData';
import { SimWorld } from '../sim/SimWorld';
import {
  X,
  ArrowRightLeft,
  ShieldAlert,
  Zap,
  Crosshair,
  Coins,
  Activity,
  Check,
  ChevronRight
} from 'lucide-react';

interface TowerComparisonModalProps {
  primaryTower: PlacedTower;
  sim: SimWorld;
  onClose: () => void;
}

export const TowerComparisonModal: React.FC<TowerComparisonModalProps> = ({
  primaryTower,
  sim,
  onClose
}) => {
  const primaryDef = TOWERS_DATA[primaryTower.type];
  const primaryStats = sim.getEffectiveTowerStats(primaryTower);

  // List of other candidate towers (other placed towers, or catalog towers)
  const [comparisonTarget, setComparisonTarget] = useState<{
    isPlaced: boolean;
    placedTower?: PlacedTower;
    catalogType?: TowerType;
  }>(() => {
    const otherPlaced = sim.towers.find(t => t.id !== primaryTower.id);
    if (otherPlaced) {
      return { isPlaced: true, placedTower: otherPlaced };
    }
    const otherType = Object.keys(TOWERS_DATA).find(t => t !== primaryTower.type) as TowerType;
    return { isPlaced: false, catalogType: otherType || 'cannon' };
  });

  // Calculate secondary stats
  const secondaryDef = comparisonTarget.isPlaced && comparisonTarget.placedTower
    ? TOWERS_DATA[comparisonTarget.placedTower.type]
    : TOWERS_DATA[comparisonTarget.catalogType || 'cannon'];

  const secondaryStats = comparisonTarget.isPlaced && comparisonTarget.placedTower
    ? sim.getEffectiveTowerStats(comparisonTarget.placedTower)
    : {
        damage: secondaryDef.baseDamage,
        fireRate: secondaryDef.baseFireRate,
        range: secondaryDef.baseRange,
        pierce: secondaryDef.basePierce,
        critChance: 0,
        critMult: 1.5,
        dps: Math.round(secondaryDef.baseDamage * secondaryDef.baseFireRate)
      };

  const secondaryCost = comparisonTarget.isPlaced && comparisonTarget.placedTower
    ? comparisonTarget.placedTower.totalInvestedGold
    : secondaryDef.baseCost;

  // Rating helpers (1 to 4 stars)
  const getArmorRating = (tType: string, pierce: number, dmgType: string) => {
    if (dmgType === 'true' || tType === 'obelisk') return 4;
    if (dmgType === 'magic' || dmgType === 'lightning' || pierce >= 10) return 3;
    if (pierce > 0 || tType === 'ballista' || tType === 'gatling') return 2;
    return 1;
  };

  const getAoeRating = (tType: string) => {
    if (tType === 'mortar' || tType === 'meteor') return 4;
    if (tType === 'tesla' || tType === 'cannon' || tType === 'flamethrower') return 3;
    if (tType === 'poison' || tType === 'spike_trap') return 2;
    return 0;
  };

  const getControlRating = (tType: string) => {
    if (tType === 'temporal' || tType === 'gravity_well') return 4;
    if (tType === 'frost') return 3;
    if (tType === 'cannon' || tType === 'poison') return 2;
    return 1;
  };

  const pArmor = getArmorRating(primaryTower.type, primaryStats.pierce, primaryDef.damageType);
  const sArmor = getArmorRating(secondaryDef.type, secondaryStats.pierce, secondaryDef.damageType);

  const pAoe = getAoeRating(primaryTower.type);
  const sAoe = getAoeRating(secondaryDef.type);

  const pCtrl = getControlRating(primaryTower.type);
  const sCtrl = getControlRating(secondaryDef.type);

  const renderStars = (rating: number) => {
    if (rating === 0) return <span className="text-slate-500">—</span>;
    return (
      <span className="text-amber-400 font-mono tracking-tight">
        {'★'.repeat(rating)}
        <span className="text-slate-700">{'★'.repeat(4 - rating)}</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.6)] p-5 text-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
              <ArrowRightLeft size={16} />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-white uppercase tracking-wider">
                Tactical Tower Comparison
              </h2>
              <p className="text-[11px] text-slate-400">
                Side-by-side comparative specification, metrics, and specialization rating
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Selection Bar for Comparison Partner */}
        <div className="my-3 p-2 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0 text-xs">
          <span className="text-slate-400 font-sans text-[11px] shrink-0">Compare with:</span>
          {sim.towers
            .filter(t => t.id !== primaryTower.id)
            .map(t => {
              const d = TOWERS_DATA[t.type];
              const isSelected = comparisonTarget.isPlaced && comparisonTarget.placedTower?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setComparisonTarget({ isPlaced: true, placedTower: t })}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] shrink-0 flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-sky-600/30 border-sky-400 text-sky-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{d.name} (#{t.slotIndex + 1})</span>
                </button>
              );
            })}

          <span className="text-slate-600 font-mono">|</span>

          {Object.keys(TOWERS_DATA)
            .slice(0, 8)
            .map(tType => {
              const d = TOWERS_DATA[tType];
              const isSelected = !comparisonTarget.isPlaced && comparisonTarget.catalogType === tType;
              return (
                <button
                  key={tType}
                  onClick={() => setComparisonTarget({ isPlaced: false, catalogType: tType as TowerType })}
                  className={`px-2 py-1 rounded-lg font-mono text-[10px] shrink-0 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-purple-600/30 border-purple-400 text-purple-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{d.name} (Base)</span>
                </button>
              );
            })}
        </div>

        {/* Comparison Matrix Table */}
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar text-xs">
          <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 mb-3 text-center">
            {/* Tower A */}
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <div
                className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center font-bold text-lg border border-white/10 mb-1.5"
                style={{ backgroundColor: `${primaryDef.color}33`, color: primaryDef.accentColor }}
              >
                {primaryDef.name[0]}
              </div>
              <div className="font-display font-bold text-sm text-white">{primaryDef.name}</div>
              <div className="text-[10px] text-sky-400 font-mono">
                Slot #{primaryTower.slotIndex + 1} ({primaryTower.pathRanks.join('/')})
              </div>
            </div>

            {/* Metric Labels Header */}
            <div className="flex flex-col justify-center text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <span className="text-sky-400 font-bold text-xs">SPEC COMPARISON</span>
              <span>Direct Attribute Differential</span>
            </div>

            {/* Tower B */}
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <div
                className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center font-bold text-lg border border-white/10 mb-1.5"
                style={{ backgroundColor: `${secondaryDef.color}33`, color: secondaryDef.accentColor }}
              >
                {secondaryDef.name[0]}
              </div>
              <div className="font-display font-bold text-sm text-white">{secondaryDef.name}</div>
              <div className="text-[10px] text-purple-400 font-mono">
                {comparisonTarget.isPlaced
                  ? `Slot #${comparisonTarget.placedTower!.slotIndex + 1} (${comparisonTarget.placedTower!.pathRanks.join('/')})`
                  : 'Catalog Baseline'}
              </div>
            </div>
          </div>

          {/* Rows */}
          <div className="space-y-1.5 font-mono text-xs">
            {/* DPS */}
            <div className="grid grid-cols-3 gap-2 p-2 bg-slate-900/40 rounded-lg border border-slate-800/60 items-center text-center">
              <div className={`font-bold text-sm ${primaryStats.dps >= secondaryStats.dps ? 'text-emerald-400' : 'text-slate-300'}`}>
                {primaryStats.dps}
              </div>
              <div className="text-slate-400 font-sans text-[11px] uppercase font-semibold">Theoretical DPS</div>
              <div className={`font-bold text-sm ${secondaryStats.dps >= primaryStats.dps ? 'text-emerald-400' : 'text-slate-300'}`}>
                {secondaryStats.dps}
              </div>
            </div>

            {/* Range */}
            <div className="grid grid-cols-3 gap-2 p-2 bg-slate-900/40 rounded-lg border border-slate-800/60 items-center text-center">
              <div className={`font-bold ${primaryStats.range >= secondaryStats.range ? 'text-emerald-400' : 'text-slate-300'}`}>
                {Math.round(primaryStats.range)}px
              </div>
              <div className="text-slate-400 font-sans text-[11px] uppercase font-semibold">Effective Range</div>
              <div className={`font-bold ${secondaryStats.range >= primaryStats.range ? 'text-emerald-400' : 'text-slate-300'}`}>
                {Math.round(secondaryStats.range)}px
              </div>
            </div>

            {/* Fire Rate */}
            <div className="grid grid-cols-3 gap-2 p-2 bg-slate-900/40 rounded-lg border border-slate-800/60 items-center text-center">
              <div className={`font-bold ${primaryStats.fireRate >= secondaryStats.fireRate ? 'text-emerald-400' : 'text-slate-300'}`}>
                {primaryStats.fireRate}/s
              </div>
              <div className="text-slate-400 font-sans text-[11px] uppercase font-semibold">Attack Cadence</div>
              <div className={`font-bold ${secondaryStats.fireRate >= primaryStats.fireRate ? 'text-emerald-400' : 'text-slate-300'}`}>
                {secondaryStats.fireRate}/s
              </div>
            </div>

            {/* Target Capacity */}
            <div className="grid grid-cols-3 gap-2 p-2 bg-slate-900/40 rounded-lg border border-slate-800/60 items-center text-center">
              <div className="text-slate-200">
                {primaryDef.chainCount ? `${primaryDef.chainCount} Chain` : primaryDef.splashRadius ? 'AOE Area' : '1 Target'}
              </div>
              <div className="text-slate-400 font-sans text-[11px] uppercase font-semibold">Target Capacity</div>
              <div className="text-slate-200">
                {secondaryDef.chainCount ? `${secondaryDef.chainCount} Chain` : secondaryDef.splashRadius ? 'AOE Area' : '1 Target'}
              </div>
            </div>

            {/* Armor Rating */}
            <div className="grid grid-cols-3 gap-2 p-2 bg-slate-900/40 rounded-lg border border-slate-800/60 items-center text-center">
              <div>{renderStars(pArmor)}</div>
              <div className="text-slate-400 font-sans text-[11px] uppercase font-semibold">Armor Shred Rating</div>
              <div>{renderStars(sArmor)}</div>
            </div>

            {/* AoE Rating */}
            <div className="grid grid-cols-3 gap-2 p-2 bg-slate-900/40 rounded-lg border border-slate-800/60 items-center text-center">
              <div>{renderStars(pAoe)}</div>
              <div className="text-slate-400 font-sans text-[11px] uppercase font-semibold">AoE Rating</div>
              <div>{renderStars(sAoe)}</div>
            </div>

            {/* Crowd Control Rating */}
            <div className="grid grid-cols-3 gap-2 p-2 bg-slate-900/40 rounded-lg border border-slate-800/60 items-center text-center">
              <div>{renderStars(pCtrl)}</div>
              <div className="text-slate-400 font-sans text-[11px] uppercase font-semibold">Control Rating</div>
              <div>{renderStars(sCtrl)}</div>
            </div>

            {/* Invested Cost */}
            <div className="grid grid-cols-3 gap-2 p-2 bg-slate-900/40 rounded-lg border border-slate-800/60 items-center text-center">
              <div className="font-bold text-yellow-400">{primaryTower.totalInvestedGold}g</div>
              <div className="text-slate-400 font-sans text-[11px] uppercase font-semibold">Total Invested Cost</div>
              <div className="font-bold text-yellow-400">{secondaryCost}g</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
