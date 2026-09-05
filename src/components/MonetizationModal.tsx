import React, { useState } from 'react';
import { ShieldCheck, Film, Check, X, Sparkles, Coins, Award } from 'lucide-react';
import { sound } from '../services/soundService';

interface MonetizationModalProps {
  removeAdsUnlocked: boolean;
  onUnlockRemoveAds: () => void;
  onWatchRewardedAd: () => void;
  onClose: () => void;
}

export const MonetizationModal: React.FC<MonetizationModalProps> = ({
  removeAdsUnlocked,
  onUnlockRemoveAds,
  onWatchRewardedAd,
  onClose
}) => {
  const [watching, setWatching] = useState(false);

  const handleSimulatePurchase = () => {
    sound.playVictory();
    onUnlockRemoveAds();
  };

  const handleWatchAd = () => {
    setWatching(true);
    setTimeout(() => {
      setWatching(false);
      sound.playCoin();
      onWatchRewardedAd();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.2)] p-6 text-slate-200 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
              <Coins className="text-amber-400" size={20} />
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-white uppercase tracking-wider">
                Citadel Armory Store
              </h2>
              <div className="text-xs text-amber-400 font-bold">
                Ethical Monetization • Zero Paywalls
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

        {/* Content */}
        <div className="py-4 space-y-4">
          {/* Supporter Pack: Remove Ads $1.99 */}
          <div className="p-4 rounded-xl border bg-slate-950/70 border-slate-800 hover:border-amber-500/50 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-amber-400" size={18} />
                <span className="font-bold text-sm text-white">Supporter Pack (Remove Ads)</span>
              </div>
              <span className="font-mono font-bold text-amber-400 text-sm">$1.99</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Permanently disables all interstitial prompts, awards golden Supporter Insignia, and grants +200 starting gold on every sector run.
            </p>
            {removeAdsUnlocked ? (
              <div className="flex items-center justify-center gap-1.5 py-2 bg-emerald-950/50 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-bold">
                <Check size={14} />
                <span>Unlocked & Active</span>
              </div>
            ) : (
              <button
                onClick={handleSimulatePurchase}
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
              >
                Purchase Supporter Pack ($1.99)
              </button>
            )}
          </div>

          {/* Optional Rewarded Ad: Bonus Gold */}
          <div className="p-4 rounded-xl border bg-slate-950/70 border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="text-sky-400" size={18} />
                <span className="font-bold text-sm text-white">Voluntary Tactical Transmission</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                Free
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Request an emergency munitions broadcast (2s simulated transmission) to receive +150 bonus gold for your treasury.
            </p>
            <button
              disabled={watching}
              onClick={handleWatchAd}
              className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {watching ? 'Receiving Broadcast (2s)...' : 'Watch Brief Transmission (+150g)'}
            </button>
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
