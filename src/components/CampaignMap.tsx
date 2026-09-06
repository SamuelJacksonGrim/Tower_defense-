import React, { useState } from 'react';
import { CAMPAIGN_LEVELS, MAPS_DATA, TOWERS_DATA } from '../data/gameData';
import { CampaignLevel, GameSaveState } from '../types/game';
import { Star, Skull, Lock, Play, Shield, Coins, Sparkles, Trophy, Volume2, VolumeX, Check, Flame, Snowflake, Mountain, Film, FlaskConical } from 'lucide-react';
import { sound } from '../services/soundService';

interface CampaignMapProps {
  saveState: GameSaveState;
  onSelectLevel: (level: CampaignLevel) => void;
  onOpenTechTree: () => void;
  onOpenEndless: () => void;
  onOpenBounties: () => void;
  onOpenCodex: () => void;
  onOpenStore: () => void;
  onOpenReplays: () => void;
  onOpenBalanceLab: () => void;
}

export const CampaignMap: React.FC<CampaignMapProps> = ({
  saveState,
  onSelectLevel,
  onOpenTechTree,
  onOpenEndless,
  onOpenBounties,
  onOpenCodex,
  onOpenStore,
  onOpenReplays,
  onOpenBalanceLab
}) => {
  const [selectedLevelNumber, setSelectedLevelNumber] = useState<number>(
    Math.min(20, saveState.campaignMaxLevel)
  );
  const [soundMuted, setSoundMuted] = useState<boolean>(() => sound.getMuted());

  const activeLevel = CAMPAIGN_LEVELS.find(l => l.levelNumber === selectedLevelNumber) || CAMPAIGN_LEVELS[0];
  const activeMap = MAPS_DATA[activeLevel.mapId] || MAPS_DATA.map1 || MAPS_DATA.frontier_outpost;

  // Region tabs
  const regions = [
    { id: 'frontier', name: '1. Frontier Breach', levelRange: [1, 5], icon: Mountain, color: 'emerald' },
    { id: 'caldera', name: '2. Ashen Caldera', levelRange: [6, 10], icon: Flame, color: 'rose' },
    { id: 'cold_hell', name: '3. Cold Hell Gate', levelRange: [11, 20], icon: Snowflake, color: 'sky' }
  ];

  const currentRegion = regions.find(r => selectedLevelNumber >= r.levelRange[0] && selectedLevelNumber <= r.levelRange[1]) || regions[0];

  const totalStars = Object.values(saveState.levelStars).reduce((sum, s) => sum + s, 0);

  // Check if any bounty or login reward is ready
  const hasUnclaimedBounties = saveState.bounties?.some(b => !b.claimed && ((b.progress ?? b.current ?? 0) >= b.target));
  const hasUnclaimedLogin = saveState.loginRewards?.some(r => !r.claimed);
  const hasPendingRewards = hasUnclaimedBounties || hasUnclaimedLogin;

  const handleNodeClick = (lvl: CampaignLevel) => {
    sound.playClick();
    if (selectedLevelNumber === lvl.levelNumber) {
      // Double tap / click already selected node to immediately deploy
      onSelectLevel(lvl);
    } else {
      setSelectedLevelNumber(lvl.levelNumber);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-[#05070d] text-slate-200 select-none">
      {/* 1. Top Header Bar */}
      <header className="shrink-0 bg-slate-950/95 border-b border-slate-800/90 px-3 sm:px-6 py-2.5 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left Branding */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-700 border border-sky-400/50 flex items-center justify-center font-display font-black text-white text-base shadow-[0_0_12px_rgba(56,189,248,0.3)]">
              TD
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-black text-sm sm:text-base text-white tracking-wider uppercase truncate">
                TOWERDEF
              </h1>
              <div className="text-[10px] text-sky-400 font-bold uppercase tracking-widest truncate">
                Breach of Cold Hell
              </div>
            </div>
          </div>

          {/* Right Action Controls: Scrollable on narrow screens */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
            {/* Audio Mute */}
            <button
              onClick={() => {
                const m = sound.toggleMute();
                setSoundMuted(m);
              }}
              className="p-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
              title={soundMuted ? 'Unmute Audio' : 'Mute Audio'}
              aria-label="Toggle Audio Mute"
            >
              {soundMuted ? <VolumeX size={15} className="text-rose-400" /> : <Volume2 size={15} className="text-emerald-400" />}
            </button>

            {/* Bounties Button */}
            <button
              onClick={() => { sound.playClick(); onOpenBounties(); }}
              className={`relative px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border ${hasPendingRewards ? 'border-amber-500/70 shadow-[0_0_12px_rgba(245,158,11,0.25)]' : 'border-slate-800'} rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer shrink-0`}
            >
              <Trophy size={13} className="text-amber-400" />
              <span className="hidden xs:inline">Bounties</span>
              {hasPendingRewards && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5" />
              )}
            </button>

            {/* Tech Tree */}
            <button
              onClick={() => { sound.playClick(); onOpenTechTree(); }}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <Sparkles size={13} className="text-sky-400" />
              <span className="hidden xs:inline">Tech</span>
            </button>

            {/* Endless */}
            <button
              onClick={() => { sound.playClick(); onOpenEndless(); }}
              className="px-2.5 py-1.5 bg-purple-950/60 hover:bg-purple-900/70 border border-purple-500/40 rounded-xl text-xs font-semibold text-purple-300 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <span>Endless</span>
            </button>

            {/* Codex */}
            <button
              onClick={() => { sound.playClick(); onOpenCodex(); }}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <span>Codex</span>
            </button>

            {/* Replay Theater */}
            <button
              onClick={() => { sound.playClick(); onOpenReplays(); }}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              title="Battle Recording & Replay Theater"
            >
              <Film size={13} className="text-amber-400" />
              <span className="hidden sm:inline">Replays</span>
            </button>

            {/* Balance Lab */}
            <button
              onClick={() => { sound.playClick(); onOpenBalanceLab(); }}
              className="px-2.5 py-1.5 bg-purple-950/60 hover:bg-purple-900/70 border border-purple-500/40 rounded-xl text-xs font-semibold text-purple-300 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              title="Empirical Balance Laboratory"
            >
              <FlaskConical size={13} className="text-purple-400" />
              <span className="hidden sm:inline">Lab</span>
            </button>

            {/* Store */}
            <button
              onClick={() => { sound.playClick(); onOpenStore(); }}
              className="px-2.5 py-1.5 bg-amber-950/60 hover:bg-amber-900/70 border border-amber-500/40 rounded-xl text-xs font-semibold text-amber-300 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <Coins size={13} />
              <span className="hidden sm:inline">Store</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Auto-Centered Stats Bar (Android Version, Stars, Tech Points, Progression) */}
      <div className="shrink-0 bg-slate-950/80 border-b border-slate-900 px-3 py-2 z-10">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs">
          {/* Android Version Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 border border-slate-800 rounded-full text-slate-400 font-medium shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
            <span className="text-[11px] tracking-wide">Android v1 Production</span>
          </div>

          {/* Stars Progress Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/30 border border-amber-500/40 rounded-full text-amber-300 font-bold shadow-sm">
            <Star size={12} className="fill-amber-400 text-amber-400 shrink-0" />
            <span>{totalStars} / 60 Stars</span>
            <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden ml-1 hidden sm:block">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full"
                style={{ width: `${Math.min(100, (totalStars / 60) * 100)}%` }}
              />
            </div>
          </div>

          {/* Tech Points Pill */}
          <button
            onClick={() => { sound.playClick(); onOpenTechTree(); }}
            className="flex items-center gap-1.5 px-3 py-1 bg-sky-950/30 border border-sky-500/40 rounded-full text-sky-300 font-bold hover:bg-sky-900/40 transition-colors cursor-pointer shadow-sm"
            title="Click to open Tech Tree"
          >
            <Sparkles size={12} className="text-sky-400 shrink-0" />
            <span>{saveState.techPoints} Tech Pts</span>
            <span className="text-[10px] text-sky-400/80 uppercase font-semibold hidden xs:inline">&rarr;</span>
          </button>

          {/* Demons Slain Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-950/30 border border-rose-500/30 rounded-full text-rose-300 font-bold shadow-sm">
            <Skull size={12} className="text-rose-400 shrink-0" />
            <span>{saveState.totalDemonsKilled || 0} Demons Slain</span>
          </div>
        </div>
      </div>

      {/* 3. Main Campaign Scrollable Workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-5 flex flex-col lg:flex-row gap-5 items-stretch">
        {/* Left Column: Sector Map & Mission Nodes */}
        <section className="flex-1 flex flex-col bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 sm:p-6 shadow-2xl relative min-h-[440px] sm:min-h-[500px]">
          {/* Region Tabs - Auto-centered */}
          <div className="flex items-center justify-center gap-2 mb-4 overflow-x-auto pb-1 max-w-2xl mx-auto w-full">
            {regions.map(r => {
              const isActive = currentRegion.id === r.id;
              const isRegionUnlocked = saveState.campaignMaxLevel >= r.levelRange[0];
              const Icon = r.icon;

              return (
                <button
                  key={r.id}
                  onClick={() => {
                    if (isRegionUnlocked) {
                      sound.playClick();
                      setSelectedLevelNumber(r.levelRange[0]);
                    }
                  }}
                  className={`px-3.5 py-2 rounded-xl font-display text-xs tracking-wider transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-sky-500 text-slate-950 font-black shadow-lg shadow-sky-500/25 scale-[1.02]'
                      : (isRegionUnlocked
                          ? 'bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                          : 'bg-slate-950/60 text-slate-600 border border-slate-900/80 cursor-not-allowed')
                  }`}
                >
                  {!isRegionUnlocked ? <Lock size={12} /> : <Icon size={13} />}
                  <span>{r.name}</span>
                </button>
              );
            })}
          </div>

          {/* Tactical Map Visualizer Stage */}
          <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-slate-950/90 rounded-xl border border-slate-900 p-4 sm:p-6 min-h-[300px]">
            {/* Ambient Biome Backing */}
            <div
              className="absolute inset-0 opacity-25 pointer-events-none transition-all duration-700"
              style={{
                background: currentRegion.id === 'caldera'
                  ? 'radial-gradient(circle at center, #7f1d1d 0%, #450a0a 40%, transparent 75%)'
                  : (currentRegion.id === 'cold_hell'
                      ? 'radial-gradient(circle at center, #0369a1 0%, #082f49 40%, transparent 75%)'
                      : 'radial-gradient(circle at center, #065f46 0%, #064e3b 40%, transparent 75%)')
              }}
            />

            {/* Tactical Grid Background lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

            {/* Region Title Watermark */}
            <div className="absolute top-3 left-4 text-[10px] font-mono tracking-widest text-slate-500 uppercase flex items-center gap-1.5 z-0">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
              <span>SECTOR GRID // {currentRegion.name.toUpperCase()}</span>
            </div>

            {/* Level Nodes - Auto Centered with connecting circuit layout */}
            <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-3 sm:gap-5 py-6">
              {CAMPAIGN_LEVELS
                .filter(l => l.levelNumber >= currentRegion.levelRange[0] && l.levelNumber <= currentRegion.levelRange[1])
                .map(lvl => {
                  const isUnlocked = lvl.levelNumber <= saveState.campaignMaxLevel;
                  const isSelected = lvl.levelNumber === selectedLevelNumber;
                  const stars = saveState.levelStars[lvl.levelNumber] || 0;
                  const isBoss = !!lvl.bossName;

                  return (
                    <button
                      key={lvl.levelNumber}
                      disabled={!isUnlocked}
                      onClick={() => handleNodeClick(lvl)}
                      className={`group relative flex flex-col items-center justify-between p-2.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'scale-105 shadow-[0_0_24px_rgba(56,189,248,0.45)] border-sky-400 bg-sky-950/80 z-20 ring-2 ring-sky-400/40'
                          : (isUnlocked
                              ? (isBoss
                                  ? 'border-rose-500/70 bg-rose-950/40 hover:border-rose-400 hover:scale-[1.03] shadow-md shadow-rose-950/30'
                                  : 'border-slate-700/80 bg-slate-900/80 hover:border-slate-500 hover:scale-[1.03] shadow-md')
                              : 'border-slate-800/40 bg-slate-950/40 opacity-40 cursor-not-allowed')
                      }`}
                      style={{
                        width: isBoss ? '104px' : '90px',
                        height: isBoss ? '108px' : '96px'
                      }}
                    >
                      {/* Boss Banner */}
                      {isBoss && (
                        <div className="absolute -top-2.5 bg-gradient-to-r from-rose-600 to-red-700 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-rose-400/40">
                          <Skull size={10} /> BOSS
                        </div>
                      )}

                      {/* Selected Indicator Pill */}
                      {isSelected && (
                        <div className="absolute -top-2 bg-sky-400 text-slate-950 text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full shadow-md flex items-center gap-0.5">
                          <Check size={8} /> ACTIVE
                        </div>
                      )}

                      {/* Top Header inside node */}
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        LVL {lvl.levelNumber}
                      </div>

                      {/* Center Number / Lock */}
                      <div className="flex items-center justify-center my-auto">
                        {isUnlocked ? (
                          <div className={`font-display font-black text-2xl ${isSelected ? 'text-sky-300' : (isBoss ? 'text-rose-200' : 'text-white')}`}>
                            {lvl.levelNumber}
                          </div>
                        ) : (
                          <Lock size={20} className="text-slate-600" />
                        )}
                      </div>

                      {/* Stars Footer */}
                      <div className="flex items-center gap-0.5 mt-auto">
                        {isUnlocked ? (
                          [1, 2, 3].map(s => (
                            <Star
                              key={s}
                              size={11}
                              className={s <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700 fill-slate-800'}
                            />
                          ))
                        ) : (
                          <span className="text-[9px] text-slate-600 uppercase font-semibold">Locked</span>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>

            {/* Map Stage Status Footer */}
            <div className="relative z-10 w-full pt-3 mt-auto border-t border-slate-900/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-slate-200 font-bold">{activeMap?.name}</span>
                <span>•</span>
                <span className="text-slate-400 text-[11px]">{activeMap?.description}</span>
              </div>
              <div className="text-[11px] text-sky-400/90 italic hidden sm:block">
                Tap selected node again to deploy
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Level Briefing Sidebar - Auto centered on mobile */}
        <aside className="w-full lg:w-96 shrink-0 bg-slate-950/90 border border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-2xl mx-auto lg:mx-0 max-w-xl lg:max-w-none">
          <div className="space-y-4">
            {/* Header */}
            <div>
              <div className="text-[11px] font-bold text-sky-400 uppercase tracking-widest mb-1 flex items-center justify-between">
                <span>Sector Briefing</span>
                <span className="font-mono text-slate-400">Level {activeLevel.levelNumber} of 20</span>
              </div>
              <h2 className="font-display font-black text-xl text-white leading-tight">
                {activeLevel.title}
              </h2>
              <div className="text-xs text-slate-400 mt-0.5">{activeLevel.subtitle}</div>
            </div>

            {/* Battlefield Sector Info */}
            <div className="bg-slate-900/70 border border-slate-800/80 p-3 rounded-xl text-xs space-y-1">
              <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Battlefield Sector</div>
              <div className="font-bold text-slate-200 text-sm">{activeMap?.name}</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">{activeMap?.description}</div>
            </div>

            {/* Story Intro Briefing */}
            <div className="bg-slate-900/40 border border-slate-800/60 p-3 rounded-xl text-xs text-slate-300 italic leading-relaxed">
              "{activeLevel.storyIntro}"
            </div>

            {/* Level Specs 3-column Grid */}
            <div className="grid grid-cols-3 gap-2 text-center bg-slate-900/70 p-3 rounded-xl border border-slate-800/80 text-xs">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Waves</div>
                <div className="font-mono font-black text-base text-sky-300">{activeLevel.waves.length}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Start Gold</div>
                <div className="font-mono font-black text-base text-yellow-300">{activeLevel.startingGold}g</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Lives</div>
                <div className="font-mono font-black text-base text-emerald-300">{activeLevel.startingLives}</div>
              </div>
            </div>

            {/* Recommended Towers */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Shield size={12} className="text-emerald-400" />
                <span>Recommended Defense Corpus</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeLevel.recommendedTowers.map(t => {
                  const tDef = TOWERS_DATA[t];
                  return (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-white/10 shadow-sm"
                      style={{ backgroundColor: `${tDef?.color || '#38bdf8'}22`, color: tDef?.accentColor || '#38bdf8' }}
                    >
                      {tDef?.name || t}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Unlock Opportunity Notice */}
            {activeLevel.unlocksTower && (
              <div className="p-3 bg-sky-950/40 border border-sky-500/40 rounded-xl text-xs text-sky-300 flex items-center gap-2.5">
                <Sparkles size={18} className="text-sky-400 shrink-0 animate-spin" />
                <div>
                  <div className="font-bold text-white">Victory Unlock Reward</div>
                  <div className="text-[11px] text-sky-300">
                    Evolves Citadel Armory with <span className="font-black text-sky-200">{TOWERS_DATA[activeLevel.unlocksTower]?.name}</span>!
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Launch Mission Button */}
          <div className="pt-4 mt-4 border-t border-slate-800/80">
            <button
              onClick={() => {
                sound.playClick();
                onSelectLevel(activeLevel);
              }}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-sky-950/60 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play size={16} className="fill-white" />
              <span>Deploy to Sector {activeLevel.levelNumber}</span>
            </button>
            <div className="text-center text-[10px] text-slate-500 mt-2">
              Combat Incursion • {activeLevel.startingGold}g Starting Gold • {activeLevel.startingLives} Citadel Lives
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

