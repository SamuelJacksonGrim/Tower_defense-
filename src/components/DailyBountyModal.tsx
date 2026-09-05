import React from 'react';
import { DailyBounty, LoginReward } from '../types/game';
import { Trophy, Calendar, Check, Coins, Award, X, Sparkles } from 'lucide-react';
import { sound } from '../services/soundService';

interface DailyBountyModalProps {
  bounties: DailyBounty[];
  loginRewards: LoginReward[];
  loginStreak: number;
  onClaimBounty: (bountyId: string) => void;
  onClaimLoginReward: (day: number) => void;
  onClose: () => void;
}

export const DailyBountyModal: React.FC<DailyBountyModalProps> = ({
  bounties,
  loginRewards,
  loginStreak,
  onClaimBounty,
  onClaimLoginReward,
  onClose
}) => {
  const [activeTab, setActiveTab] = React.useState<'bounties' | 'calendar'>('bounties');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.2)] p-6 text-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
              <Trophy className="text-amber-400" size={20} />
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-white uppercase tracking-wider">
                Command Dispatch
              </h2>
              <div className="text-xs text-amber-400 font-bold">
                Tactical Bounties & Daily Garrison Rewards
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

        {/* Tab Switcher */}
        <div className="flex gap-2 my-3 shrink-0">
          <button
            onClick={() => setActiveTab('bounties')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'bounties'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Trophy size={14} />
            <span>Daily Bounties</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'calendar'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Calendar size={14} />
            <span>7-Day Protocol Calendar</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-2 space-y-3 pr-1 custom-scrollbar">
          {activeTab === 'bounties' ? (
            <div className="space-y-3">
              {bounties.map(b => {
                const prog = b.progress ?? b.current ?? 0;
                const isComplete = prog >= b.target;
                const percent = Math.min(100, Math.round((prog / b.target) * 100));

                return (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      b.claimed
                        ? 'bg-slate-950/40 border-slate-800/40 opacity-60'
                        : (isComplete
                            ? 'bg-amber-950/20 border-amber-500/50 shadow-md'
                            : 'bg-slate-950/60 border-slate-800')
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-sm text-white">{b.title}</h3>
                        <span className="text-[11px] font-mono text-slate-400 font-bold">
                          {prog} / {b.target}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{b.description}</p>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800 mb-2">
                        <div
                          className="bg-amber-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      {/* Reward Pills */}
                      <div className="flex items-center gap-2 text-xs font-mono font-bold">
                        <span className="flex items-center gap-1 text-yellow-400">
                          <Coins size={12} /> +{b.rewardGold} Gold
                        </span>
                        {b.rewardTechPoints > 0 && (
                          <span className="flex items-center gap-1 text-sky-400">
                            <Award size={12} /> +{b.rewardTechPoints} Tech Pts
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {b.claimed ? (
                        <div className="text-xs font-bold text-slate-500 bg-slate-800/40 px-3 py-1.5 rounded-xl border border-slate-700/30">
                          Claimed
                        </div>
                      ) : isComplete ? (
                        <button
                          onClick={() => {
                            sound.playCoin();
                            onClaimBounty(b.id);
                          }}
                          className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-500/30 cursor-pointer"
                        >
                          Claim Reward
                        </button>
                      ) : (
                        <div className="text-xs font-bold text-slate-500 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
                          In Progress
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {loginRewards.map(rew => {
                const isCurrent = rew.day === loginStreak;
                const canClaim = rew.day <= loginStreak && !rew.claimed;

                return (
                  <div
                    key={rew.day}
                    className={`p-3 rounded-xl border flex flex-col items-center text-center justify-between min-h-[120px] transition-all ${
                      rew.claimed
                        ? 'bg-slate-950/40 border-slate-800/40 opacity-50'
                        : (canClaim
                            ? 'bg-amber-950/30 border-amber-400 shadow-md ring-1 ring-amber-400'
                            : 'bg-slate-950/60 border-slate-800')
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Day {rew.day}
                    </div>

                    <div className="my-2">
                      <div className="font-mono font-bold text-sm text-yellow-300">
                        +{rew.gold} Gold
                      </div>
                      {rew.techPoints > 0 && (
                        <div className="font-mono text-xs text-sky-400 font-bold">
                          +{rew.techPoints} Tech Pts
                        </div>
                      )}
                    </div>

                    {rew.claimed ? (
                      <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <Check size={12} /> Claimed
                      </div>
                    ) : canClaim ? (
                      <button
                        onClick={() => {
                          sound.playCoin();
                          onClaimLoginReward(rew.day);
                        }}
                        className="w-full py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-[10px] font-black uppercase cursor-pointer"
                      >
                        Claim
                      </button>
                    ) : (
                      <div className="text-[10px] text-slate-600 font-semibold">
                        Locked
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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
