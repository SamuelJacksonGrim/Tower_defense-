import React, { useState, useEffect } from 'react';
import { CampaignLevel, GameSaveState, MapId, TowerType } from './src/types/game';
import { CAMPAIGN_LEVELS, DEFAULT_BOUNTIES, DEFAULT_LOGIN_REWARDS } from './src/data/gameData';
import { CampaignMap } from './src/components/CampaignMap';
import { ActiveGameScreen } from './src/components/ActiveGameScreen';
import { TechTreeModal } from './src/components/TechTreeModal';
import { DailyBountyModal } from './src/components/DailyBountyModal';
import { EndlessModeModal } from './src/components/EndlessModeModal';
import { CodexModal } from './src/components/CodexModal';
import { MonetizationModal } from './src/components/MonetizationModal';
import { BalanceLaboratoryModal } from './src/components/BalanceLaboratoryModal';
import { ReplayViewerModal } from './src/components/ReplayViewerModal';
import { sound } from './src/services/soundService';

const SAVE_STORAGE_KEY = 'towerdef_cold_hell_save_v1';

const INITIAL_SAVE_STATE: GameSaveState = {
  campaignMaxLevel: 1,
  levelStars: {},
  unlockedTowers: ['archer', 'cannon', 'frost'],
  techPoints: 3,
  techTree: {},
  highScoreWaves: {
    frontier_outpost: 0,
    ashen_caldera: 0,
    cold_hell_gate: 0
  },
  gold: 0,
  totalDemonsKilled: 0,
  loginStreak: 1,
  lastLoginDate: new Date().toISOString().split('T')[0],
  loginRewards: DEFAULT_LOGIN_REWARDS,
  bounties: DEFAULT_BOUNTIES,
  removeAdsUnlocked: false
};

export const App: React.FC = () => {
  const [saveState, setSaveState] = useState<GameSaveState>(() => {
    try {
      const stored = localStorage.getItem(SAVE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...INITIAL_SAVE_STATE,
          ...parsed,
          unlockedTowers: Array.isArray(parsed.unlockedTowers) && parsed.unlockedTowers.length > 0
            ? Array.from(new Set([...INITIAL_SAVE_STATE.unlockedTowers, ...parsed.unlockedTowers]))
            : INITIAL_SAVE_STATE.unlockedTowers,
          levelStars: { ...INITIAL_SAVE_STATE.levelStars, ...(parsed.levelStars || {}) },
          highScoreWaves: { ...INITIAL_SAVE_STATE.highScoreWaves, ...(parsed.highScoreWaves || {}) },
          techTree: { ...INITIAL_SAVE_STATE.techTree, ...(parsed.techTree || {}) },
          bounties: Array.isArray(parsed.bounties) && parsed.bounties.length > 0 ? parsed.bounties : INITIAL_SAVE_STATE.bounties,
          loginRewards: Array.isArray(parsed.loginRewards) && parsed.loginRewards.length > 0 ? parsed.loginRewards : INITIAL_SAVE_STATE.loginRewards
        };
      }
    } catch {
      // safe fallback if JSON parse fails
    }
    return INITIAL_SAVE_STATE;
  });

  const [activeScreen, setActiveScreen] = useState<'campaign_map' | 'active_game'>('campaign_map');
  const [activeLevel, setActiveLevel] = useState<CampaignLevel>(CAMPAIGN_LEVELS[0]);
  const [bonusGold, setBonusGold] = useState<number>(0);

  // Modals
  const [techTreeOpen, setTechTreeOpen] = useState<boolean>(false);
  const [bountiesOpen, setBountiesOpen] = useState<boolean>(false);
  const [endlessOpen, setEndlessOpen] = useState<boolean>(false);
  const [codexOpen, setCodexOpen] = useState<boolean>(false);
  const [storeOpen, setStoreOpen] = useState<boolean>(false);
  const [balanceLabOpen, setBalanceLabOpen] = useState<boolean>(false);
  const [replaysOpen, setReplaysOpen] = useState<boolean>(false);

  // Save changes to localStorage whenever saveState updates
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(saveState));
    } catch {
      // safe
    }
  }, [saveState]);

  const updateSaveState = (patch: Partial<GameSaveState>) => {
    setSaveState(prev => ({ ...prev, ...patch }));
  };

  const handleStartCampaignLevel = (level: CampaignLevel, extraGold: number = 0) => {
    setActiveLevel(level);
    setBonusGold(extraGold);
    setActiveScreen('active_game');
  };

  const handleNextLevel = () => {
    const nextLvlNum = activeLevel.levelNumber + 1;
    const nextLevel = CAMPAIGN_LEVELS.find(l => l.levelNumber === nextLvlNum);
    if (nextLevel) {
      setActiveLevel(nextLevel);
      setBonusGold(0);
      setActiveScreen('active_game');
    } else {
      setActiveScreen('campaign_map');
    }
  };

  const handleUpgradeTech = (nodeId: string, cost: number) => {
    if (saveState.techPoints < cost) return;
    const currentTier = saveState.techTree[nodeId] || 0;
    updateSaveState({
      techPoints: saveState.techPoints - cost,
      techTree: {
        ...saveState.techTree,
        [nodeId]: currentTier + 1
      }
    });
  };

  const handleClaimBounty = (bountyId: string) => {
    const bounty = saveState.bounties.find(b => b.id === bountyId);
    if (!bounty || bounty.claimed || bounty.progress < bounty.target) return;

    updateSaveState({
      bounties: saveState.bounties.map(b => b.id === bountyId ? { ...b, claimed: true } : b),
      techPoints: saveState.techPoints + bounty.rewardTechPoints
    });
  };

  const handleClaimLoginReward = (day: number) => {
    const rew = saveState.loginRewards.find(r => r.day === day);
    if (!rew || rew.claimed) return;

    updateSaveState({
      loginRewards: saveState.loginRewards.map(r => r.day === day ? { ...r, claimed: true } : r),
      techPoints: saveState.techPoints + rew.techPoints
    });
  };

  const handleUnlockRemoveAds = () => {
    updateSaveState({
      removeAdsUnlocked: true
    });
  };

  const handleRewardedAdWatch = () => {
    updateSaveState({
      techPoints: saveState.techPoints + 1
    });
  };

  return (
    <div className={`w-full ${activeScreen === 'active_game' ? 'h-screen overflow-hidden' : 'min-h-screen overflow-x-hidden flex flex-col'} bg-[#05070d] text-slate-200 font-sans`}>
      {activeScreen === 'campaign_map' ? (
        <CampaignMap
          saveState={saveState}
          onSelectLevel={(lvl) => handleStartCampaignLevel(lvl, 0)}
          onOpenTechTree={() => setTechTreeOpen(true)}
          onOpenEndless={() => setEndlessOpen(true)}
          onOpenBounties={() => setBountiesOpen(true)}
          onOpenCodex={() => setCodexOpen(true)}
          onOpenStore={() => setStoreOpen(true)}
          onOpenReplays={() => setReplaysOpen(true)}
          onOpenBalanceLab={() => setBalanceLabOpen(true)}
        />
      ) : (
        <ActiveGameScreen
          key={`game-${activeLevel.levelNumber}-${activeLevel.mapId}-${bonusGold}`}
          level={activeLevel}
          saveState={saveState}
          onSaveProgress={updateSaveState}
          onReturnToMap={() => setActiveScreen('campaign_map')}
          onNextLevel={handleNextLevel}
          bonusStartingGold={bonusGold}
        />
      )}

      {/* Tech Tree Modal */}
      {techTreeOpen && (
        <TechTreeModal
          techTree={saveState.techTree}
          techPoints={saveState.techPoints}
          onUpgradeTech={handleUpgradeTech}
          onClose={() => setTechTreeOpen(false)}
        />
      )}

      {/* Daily Bounties & 7-Day Calendar */}
      {bountiesOpen && (
        <DailyBountyModal
          bounties={saveState.bounties}
          loginRewards={saveState.loginRewards}
          loginStreak={saveState.loginStreak}
          onClaimBounty={handleClaimBounty}
          onClaimLoginReward={handleClaimLoginReward}
          onClose={() => setBountiesOpen(false)}
        />
      )}

      {/* Endless Mode Launch Modal */}
      {endlessOpen && (
        <EndlessModeModal
          highScoreWaves={saveState.highScoreWaves}
          onLaunchEndless={(endlessLevel) => {
            setEndlessOpen(false);
            handleStartCampaignLevel(endlessLevel, 0);
          }}
          onClose={() => setEndlessOpen(false)}
        />
      )}

      {/* Tactical Codex Encyclopedia */}
      {codexOpen && (
        <CodexModal
          onClose={() => setCodexOpen(false)}
        />
      )}

      {/* Armory Store / Monetization */}
      {storeOpen && (
        <MonetizationModal
          removeAdsUnlocked={saveState.removeAdsUnlocked}
          onUnlockRemoveAds={handleUnlockRemoveAds}
          onWatchRewardedAd={handleRewardedAdWatch}
          onClose={() => setStoreOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
