import React from 'react';
import { TowerType } from '../types/game';
import { TOWERS_DATA } from '../data/gameData';
import { Sparkles, Shield, ArrowRight, Zap, Target } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TowerDiscoveryModalProps {
  towerType: TowerType;
  onClose: () => void;
}

export const TowerDiscoveryModal: React.FC<TowerDiscoveryModalProps> = ({
  towerType,
  onClose
}) => {
  const def = TOWERS_DATA[towerType];

  React.useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // safe
    }
  }, []);

  if (!def) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-sky-500/60 rounded-2xl shadow-[0_0_50px_rgba(56,189,248,0.25)] p-6 text-center text-slate-200 overflow-hidden animate-scale-up">
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: def.accentColor }}
        />

        {/* Discovery Eyebrow Banner */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 text-xs font-bold uppercase tracking-widest mb-4">
          <Sparkles size={14} className="text-sky-400 animate-spin" />
          <span>Defender Discovered</span>
        </div>

        {/* Tower Emblem Visual */}
        <div className="relative my-3 flex items-center justify-center">
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-display font-black border-2 border-white/20 shadow-2xl animate-pulse"
            style={{ backgroundColor: `${def.color}44`, color: def.accentColor, borderColor: def.accentColor }}
          >
            {def.name[0]}
          </div>
        </div>

        {/* Name & Role */}
        <h2 className="font-display font-black text-2xl text-white tracking-wide uppercase mt-2">
          {def.name}
        </h2>
        <div className="text-sky-400 font-bold text-xs uppercase tracking-wider mb-4">
          {def.role}
        </div>

        {/* Tactical Identity Description */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-left space-y-2.5 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <Target size={15} className="text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Why does this tower exist?</span>
              <p className="text-slate-400 leading-relaxed">{def.description}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Shield size={15} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">When should I use it?</span>
              <p className="text-slate-400 leading-relaxed">
                {towerType === 'mage' && 'Deploy against heavy Slag Plate armored demons whose metal armor absorbs physical arrows.'}
                {towerType === 'ballista' && 'Deploy when airborne Soot Wings threaten to bypass your ground artillery.'}
                {towerType === 'tesla' && 'Deploy against tightly clustered swarms to trigger multi-target arcing lightning.'}
                {towerType === 'flamethrower' && 'Place at frontline chokepoints to continuously scorch high-density ground rushers.'}
                {towerType === 'mortar' && 'Position on rear perimeters to bombard distant clusters with long-range siege shells.'}
                {towerType === 'gatling' && 'Deploy against fast runners; continuous spinning fire shreds velocity and armor.'}
                {towerType === 'obelisk' && 'Focus laser on colossal bosses; uninterrupted focus exponentially amplifies damage.'}
                {!['mage', 'ballista', 'tesla', 'flamethrower', 'mortar', 'gatling', 'obelisk'].includes(towerType) &&
                  'Deploy to adapt your defensive line and exploit enemy vulnerabilities.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold uppercase tracking-wider rounded-xl transition-transform hover:scale-102 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-sky-500/30"
          >
            <span>Deploy Defender into Roster</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
