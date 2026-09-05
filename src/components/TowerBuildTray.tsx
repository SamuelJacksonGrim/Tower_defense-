import React from 'react';
import { TowerType } from '../types/game';
import { TOWERS_DATA } from '../data/gameData';
import { SimWorld } from '../sim/SimWorld';
import { DollarSign, Layers, X, Sparkles } from 'lucide-react';

interface TowerBuildTrayProps {
  unlockedTowers: TowerType[];
  selectedCandidate: TowerType | null;
  onSelectCandidate: (type: TowerType | null) => void;
  sim: SimWorld;
  selectedSlotIndex?: number | null;
  onBuildOnSelectedSlot?: (type: TowerType) => void;
  multiBuildMode?: boolean;
  onToggleMultiBuild?: () => void;
  onCancelSlot?: () => void;
  onStartDragTower?: (type: TowerType, clientX: number, clientY: number) => void;
  draggedTowerType?: TowerType | null;
}

export const TowerBuildTray: React.FC<TowerBuildTrayProps> = ({
  unlockedTowers,
  selectedCandidate,
  onSelectCandidate,
  sim,
  selectedSlotIndex = null,
  onBuildOnSelectedSlot,
  multiBuildMode = false,
  onToggleMultiBuild,
  onCancelSlot,
  onStartDragTower,
  draggedTowerType = null
}) => {
  const handleCardClick = (type: TowerType, canAfford: boolean) => {
    if (!canAfford) return;

    if (selectedSlotIndex !== null && onBuildOnSelectedSlot) {
      onBuildOnSelectedSlot(type);
    } else {
      onSelectCandidate(selectedCandidate === type ? null : type);
    }
  };

  const handlePointerDown = (type: TowerType, canAfford: boolean, e: React.PointerEvent<HTMLButtonElement>) => {
    if (!canAfford || e.button !== 0) return;
    onStartDragTower?.(type, e.clientX, e.clientY);
  };

  return (
    <div className="w-full bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-md px-3 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 overflow-x-auto custom-scrollbar z-20">
      {/* Cards Scroller */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 w-full sm:w-auto">
        {unlockedTowers.map((type, idx) => {
          const def = TOWERS_DATA[type];
          if (!def) return null;

          const cost = Math.round(def.baseCost * sim.techModifiers.costDiscountMult);
          const canAfford = sim.gold >= cost;
          const isSelected = selectedCandidate === type;
          const isDragged = draggedTowerType === type;

          return (
            <button
              key={type}
              onClick={() => handleCardClick(type, canAfford)}
              onPointerDown={(e) => handlePointerDown(type, canAfford, e)}
              className={`relative flex flex-col items-center min-w-[76px] px-2.5 py-1.5 rounded-xl border transition-all select-none touch-none ${
                isDragged
                  ? 'bg-emerald-950/90 border-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.6)] scale-105 opacity-80'
                  : isSelected
                    ? 'bg-sky-950/80 border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.4)] scale-105'
                    : (canAfford
                        ? (selectedSlotIndex !== null
                            ? 'bg-sky-950/40 border-sky-500/60 hover:border-sky-400 hover:bg-sky-900/60 cursor-pointer animate-pulse'
                            : 'bg-slate-900/80 border-slate-700/70 hover:border-slate-500 hover:bg-slate-800/90 cursor-pointer')
                        : 'bg-slate-950/60 border-slate-800/40 opacity-50 cursor-not-allowed')
              }`}
              title={canAfford ? 'Click to select or click & drag onto battlefield mount' : 'Insufficient gold'}
            >
              {/* Keyboard Hotkey Badge */}
              <div className="absolute top-1 left-1.5 text-[8px] font-mono text-slate-500 font-bold">
                [{idx + 1}]
              </div>

              {/* Icon / Emblem */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm mb-1 shadow-inner border border-white/10"
                style={{ backgroundColor: `${def.color}33`, color: def.accentColor }}
              >
                {def.name[0]}
              </div>

              {/* Name */}
              <div className="text-[11px] font-bold text-slate-200 tracking-wide truncate max-w-[70px]">
                {def.name.split(' ')[0]}
              </div>

              {/* Cost */}
              <div className={`flex items-center text-[10px] font-mono font-bold mt-0.5 ${canAfford ? 'text-amber-400' : 'text-slate-500'}`}>
                <DollarSign size={10} />
                <span>{cost}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Right Controls / Context Status */}
      <div className="shrink-0 flex items-center gap-2 pl-2 sm:border-l border-slate-800 self-end sm:self-center">
        {selectedSlotIndex !== null ? (
          <div className="flex items-center gap-2 bg-sky-950/60 border border-sky-500/40 px-3 py-1 rounded-xl">
            <span className="text-xs text-sky-300 font-semibold flex items-center gap-1">
              <Sparkles size={13} className="text-sky-400 animate-pulse" />
              Mount #{selectedSlotIndex + 1} Selected: Tap Tower Above
            </span>
            <button
              onClick={onCancelSlot}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Cancel Selection"
            >
              <X size={13} />
            </button>
          </div>
        ) : selectedCandidate ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-400 font-medium hidden md:inline">
              Tap any defensive slot to deploy {TOWERS_DATA[selectedCandidate]?.name}
            </span>
            <button
              onClick={() => onSelectCandidate(null)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
          </div>
        ) : null}

        {/* Multi-Deploy Mode Toggle */}
        {onToggleMultiBuild && (
          <button
            onClick={onToggleMultiBuild}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              multiBuildMode
                ? 'bg-amber-950/70 border-amber-500 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
            title="Multi-Deploy: Keep tower selected to place multiple in a row"
          >
            <Layers size={13} />
            <span className="hidden sm:inline">Multi-Deploy</span>
          </button>
        )}
      </div>
    </div>
  );
};
