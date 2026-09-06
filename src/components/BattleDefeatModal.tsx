import React, { useState } from 'react';
import { Skull, RotateCcw, Map, Film, CheckCircle2, ShieldAlert, BarChart2 } from 'lucide-react';
import { CampaignLevel } from '../types/game';

interface BattleDefeatModalProps {
  level: CampaignLevel;
  demonsSlain: number;
  onRetry: (bonusGold?: number) => void;
  onReturnToMap: () => void;
  onViewSummary?: () => void;
}

export const BattleDefeatModal: React.FC<BattleDefeatModalProps> = ({
  level,
  demonsSlain,
  onRetry,
  onReturnToMap,
  onViewSummary
}) => {
  const [watchingAd, setWatchingAd] = useState(false);
  const [adGranted, setAdGranted] = useState(false);

  const handleWatchRewardedAd = () => {
    setWatchingAd(true);
    // Simulate short 2-second tactical supply transmission
    setTimeout(() => {
      setWatchingAd(false);
      setAdGranted(true);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-rose-500/50 rounded-2xl shadow-[0_0_50px_rgba(244,63,94,0.25)] p-6 text-center text-slate-200 animate-scale-up">
        {/* Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Skull Icon */}
        <div className="flex justify-center items-center my-3">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center shadow-lg animate-pulse">
            <Skull size={32} className="text-rose-400" />
          </div>
        </div>

        <h2 className="font-display font-black text-2xl text-white uppercase tracking-wider">
          Breach Overrun
        </h2>
        <p className="text-xs text-rose-400 font-semibold mb-3">
          Level {level.levelNumber}: {level.title}
        </p>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          The Demonata penetrated your defense line into the core realm. Review your tower composition, focus down armored tanks, and cover aerial pathways.
        </p>

        {/* Tactical Supply Rewarded Ad Option */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 mb-5 text-left">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
              <Film size={14} />
              <span>Tactical Air Drop (Optional Rewarded Aid)</span>
            </div>
            {adGranted && (
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 size={12} /> +200g Armed
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
            Call in emergency reserve munitions to restart this sector with +200 bonus Gold.
          </p>
          {!adGranted ? (
            <button
              onClick={handleWatchRewardedAd}
              disabled={watchingAd}
              className="w-full py-1.5 px-3 bg-sky-950 hover:bg-sky-900 border border-sky-500/50 text-sky-300 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Film size={13} />
              <span>{watchingAd ? 'Receiving Munitions Broadcast (2s)...' : 'Watch Brief Broadcast (+200g)'}</span>
            </button>
          ) : (
            <div className="text-xs text-emerald-400 font-medium">
              Munitions received! Your next attempt will start with extra gold.
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => onRetry(adGranted ? 200 : 0)}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-rose-900/40 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>Retry Sector {adGranted ? 'with +200g' : ''}</span>
          </button>

          {onViewSummary && (
            <button
              onClick={onViewSummary}
              className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <BarChart2 size={14} className="text-sky-400" />
              <span>View Combat Run Summary</span>
            </button>
          )}

          <button
            onClick={onReturnToMap}
            className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Map size={14} />
            <span>Return to Campaign Map</span>
          </button>
        </div>
      </div>
    </div>
  );
};
