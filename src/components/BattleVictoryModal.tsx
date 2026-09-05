import React, { useEffect } from 'react';
import { Star, Award, Coins, ArrowRight, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CampaignLevel } from '../types/game';

interface BattleVictoryModalProps {
  level: CampaignLevel;
  livesRemaining: number;
  maxLives: number;
  demonsSlain: number;
  goldEarned: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onReturnToMap: () => void;
}

export const BattleVictoryModal: React.FC<BattleVictoryModalProps> = ({
  level,
  livesRemaining,
  maxLives,
  demonsSlain,
  goldEarned,
  onNextLevel,
  onReplay,
  onReturnToMap
}) => {
  // Star calculation
  const ratio = livesRemaining / maxLives;
  const stars = ratio >= 0.9 ? 3 : (ratio >= 0.5 ? 2 : 1);
  const techPointsRewarded = stars;

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch {
      // safe
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/50 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.25)] p-6 text-center text-slate-200 animate-scale-up">
        {/* Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Stars Banner */}
        <div className="flex justify-center items-center gap-3 my-2">
          {[1, 2, 3].map(s => (
            <Star
              key={s}
              size={36}
              className={`transition-all duration-500 ${
                s <= stars
                  ? 'text-yellow-400 fill-yellow-400 scale-110 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]'
                  : 'text-slate-700 fill-slate-800'
              }`}
            />
          ))}
        </div>

        <h2 className="font-display font-black text-2xl text-white uppercase tracking-wider mt-2">
          Sector Cleared!
        </h2>
        <p className="text-xs text-emerald-400 font-semibold mb-4">
          Level {level.levelNumber}: {level.title}
        </p>

        {/* Story Outro */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3 text-xs text-slate-300 italic mb-4 leading-relaxed">
          "{level.storyOutro}"
        </div>

        {/* Rewards & Combat Stats */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-5">
          <div>
            <div className="text-[10px] text-slate-400 uppercase flex items-center justify-center gap-1">
              <Coins size={11} className="text-yellow-400" /> Gold
            </div>
            <div className="font-mono font-bold text-sm text-yellow-300">+{goldEarned}g</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase flex items-center justify-center gap-1">
              <Award size={11} className="text-sky-400" /> Tech Pts
            </div>
            <div className="font-mono font-bold text-sm text-sky-300">+{techPointsRewarded}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Demons Slain</div>
            <div className="font-mono font-bold text-sm text-rose-400">{demonsSlain}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={onNextLevel}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Next Sector</span>
            <ArrowRight size={16} />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onReplay}
              className="py-2 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Replay</span>
            </button>
            <button
              onClick={onReturnToMap}
              className="py-2 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Campaign Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
