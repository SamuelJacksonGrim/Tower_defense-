import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CampaignLevel, GameSaveState, PlacedTower, TowerType, TargetingPriority } from '../types/game';
import { SimWorld } from '../sim/SimWorld';
import { MAPS_DATA, TOWERS_DATA } from '../data/gameData';
import { GameCanvas } from './GameCanvas';
import { TowerBuildTray } from './TowerBuildTray';
import { TowerInspector } from './TowerInspector';
import { BattleVictoryModal } from './BattleVictoryModal';
import { BattleDefeatModal } from './BattleDefeatModal';
import { TowerDiscoveryModal } from './TowerDiscoveryModal';
import { sound } from '../services/soundService';
import {
  Heart,
  Coins,
  Play,
  Pause,
  FastForward,
  RotateCcw,
  Volume2,
  VolumeX,
  ArrowLeft,
  Skull,
  Radio,
  Grid3X3
} from 'lucide-react';

interface ActiveGameScreenProps {
  level: CampaignLevel;
  saveState: GameSaveState;
  onSaveProgress: (updatedSave: Partial<GameSaveState>) => void;
  onReturnToMap: () => void;
  onNextLevel?: () => void;
  bonusStartingGold?: number;
}

export const ActiveGameScreen: React.FC<ActiveGameScreenProps> = ({
  level,
  saveState,
  onSaveProgress,
  onReturnToMap,
  onNextLevel,
  bonusStartingGold = 0
}) => {
  const map = MAPS_DATA[level.mapId] || MAPS_DATA.map1;

  // UI Mirror State
  const [gold, setGold] = useState<number>(level.startingGold + bonusStartingGold + (saveState.removeAdsUnlocked ? 200 : 0));
  const [lives, setLives] = useState<number>(level.startingLives);
  const [currentWave, setCurrentWave] = useState<number>(1);
  const [waveActive, setWaveActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [gameSpeed, setGameSpeed] = useState<number>(1.0);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [autoStartWaves, setAutoStartWaves] = useState<boolean>(false);

  // Selection & Building State
  const [selectedTower, setSelectedTower] = useState<PlacedTower | null>(null);
  const [buildCandidateType, setBuildCandidateType] = useState<TowerType | null>(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [multiBuildMode, setMultiBuildMode] = useState<boolean>(false);
  const [showTacticalGrid, setShowTacticalGrid] = useState<boolean>(true);
  const [draggedTowerType, setDraggedTowerType] = useState<TowerType | null>(null);
  const [dragClientPos, setDragClientPos] = useState<{ clientX: number; clientY: number } | null>(null);

  // Modals & Banners
  const [victoryModalOpen, setVictoryModalOpen] = useState<boolean>(false);
  const [defeatModalOpen, setDefeatModalOpen] = useState<boolean>(false);
  const [discoveredTower, setDiscoveredTower] = useState<TowerType | null>(null);
  const [bossBanner, setBossBanner] = useState<string | null>(null);

  // Synchronously initialize simulation instance so frame 0 renders immediately
  const [sim, setSim] = useState<SimWorld>(() => {
    return new SimWorld(
      map,
      level.waves,
      level.startingGold + bonusStartingGold + (saveState.removeAdsUnlocked ? 200 : 0),
      level.startingLives,
      saveState.techTree
    );
  });

  const simRef = useRef<SimWorld>(sim);
  simRef.current = sim;

  // Attach event hooks to SimWorld instance
  const attachEvents = useCallback((targetSim: SimWorld) => {
    targetSim.events = {
      onGoldChanged: (g) => setGold(g),
      onLivesChanged: (l) => setLives(l),
      onWaveCompleted: (wIdx) => {
        setCurrentWave(wIdx + 1);
        setWaveActive(false);
        // Auto-start wave if enabled
        if (autoStartWaves && simRef.current && !simRef.current.allWavesCleared) {
          setTimeout(() => {
            if (simRef.current && !simRef.current.waveActive) {
              simRef.current.startNextWave();
              setWaveActive(true);
            }
          }, 800);
        }
      },
      onBossSpawned: (title) => {
        setBossBanner(title);
        setTimeout(() => setBossBanner(null), 4000);
      },
      onLevelVictory: () => {
        setVictoryModalOpen(true);
        if (level.unlocksTower && !saveState.unlockedTowers.includes(level.unlocksTower)) {
          const nextUnlocked = [...saveState.unlockedTowers, level.unlocksTower];
          onSaveProgress({
            unlockedTowers: nextUnlocked
          });
          setDiscoveredTower(level.unlocksTower);
        }
        const ratio = (simRef.current?.lives || 1) / (simRef.current?.maxLives || 20);
        const stars = ratio >= 0.9 ? 3 : (ratio >= 0.5 ? 2 : 1);
        const updatedStars = { ...saveState.levelStars, [level.levelNumber]: Math.max(saveState.levelStars[level.levelNumber] || 0, stars) };
        const nextMax = Math.max(saveState.campaignMaxLevel, level.levelNumber + 1);

        onSaveProgress({
          levelStars: updatedStars,
          campaignMaxLevel: nextMax,
          techPoints: saveState.techPoints + stars,
          totalDemonsKilled: saveState.totalDemonsKilled + (simRef.current?.stats.demonsSlain || 0)
        });
      },
      onLevelDefeat: () => {
        setDefeatModalOpen(true);
      }
    };
  }, [autoStartWaves, level, saveState, onSaveProgress]);

  // Hook events on initial load and when dependencies change
  useEffect(() => {
    attachEvents(sim);
  }, [attachEvents, sim]);

  // Reset or restart simulation
  const initSimulation = useCallback((bonusGold: number = 0) => {
    const activeMap = MAPS_DATA[level.mapId] || MAPS_DATA.map1;
    const newSim = new SimWorld(
      activeMap,
      level.waves,
      level.startingGold + bonusGold + (saveState.removeAdsUnlocked ? 200 : 0),
      level.startingLives,
      saveState.techTree
    );

    attachEvents(newSim);
    simRef.current = newSim;
    setSim(newSim);
    setGold(newSim.gold);
    setLives(newSim.lives);
    setCurrentWave(1);
    setWaveActive(false);
    setSelectedTower(null);
    setBuildCandidateType(null);
    setVictoryModalOpen(false);
    setDefeatModalOpen(false);
  }, [level, saveState, attachEvents]);

  // Trigger re-init only if level number or map changes
  useEffect(() => {
    initSimulation(bonusStartingGold);
  }, [level.levelNumber, level.mapId, initSimulation, bonusStartingGold]);

  // Window pointer listeners for smooth cross-component drag-to-deploy
  useEffect(() => {
    if (!draggedTowerType) return;

    const handlePointerMove = (e: PointerEvent) => {
      setDragClientPos({ clientX: e.clientX, clientY: e.clientY });
    };

    const handlePointerUp = () => {
      // Defer clearing so canvas drop handler receives the final coordinates
      setTimeout(() => {
        setDraggedTowerType(null);
        setDragClientPos(null);
      }, 30);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggedTowerType]);

  // Fixed Timestep Simulation Tick Loop (eliminates physics tunneling and lag at 2x/4x)
  useEffect(() => {
    let lastTime = performance.now();
    let accumulator = 0;
    let animFrame: number;
    const FIXED_DT = SimWorld.DT; // 1/30 = ~0.0333s

    const loop = (now: number) => {
      const elapsedSec = Math.min(0.2, (now - lastTime) / 1000);
      lastTime = now;

      if (simRef.current && !isPaused) {
        accumulator += elapsedSec * gameSpeed;
        let substeps = 0;
        while (accumulator >= FIXED_DT && substeps < 6) {
          simRef.current.tick(FIXED_DT);
          accumulator -= FIXED_DT;
          substeps++;
        }
        if (substeps >= 6) {
          accumulator = 0;
        }
      } else {
        accumulator = 0;
      }

      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [isPaused, gameSpeed]);

  // Hotkey handlers (1-9 to select candidate, Space to start wave / pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (simRef.current && !simRef.current.waveActive) {
          handleStartWave();
        } else {
          setIsPaused(p => !p);
        }
      } else if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < saveState.unlockedTowers.length) {
          setBuildCandidateType(saveState.unlockedTowers[idx]);
        }
      } else if (e.code === 'Escape') {
        setSelectedTower(null);
        setBuildCandidateType(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveState.unlockedTowers]);

  const handleStartWave = () => {
    if (simRef.current) {
      sound.playWaveStart();
      const started = simRef.current.startNextWave();
      if (started) {
        setWaveActive(true);
      }
    }
  };

  const handleSelectSlotToBuild = (slotIndex: number, candidateOverride?: TowerType) => {
    const typeToBuild = candidateOverride || buildCandidateType;
    if (!typeToBuild || !simRef.current) return;

    const placed = simRef.current.placeTower(typeToBuild, slotIndex);
    if (placed) {
      setSelectedSlotIndex(null);
      const def = TOWERS_DATA[typeToBuild];
      const cost = Math.round(def.baseCost * simRef.current.techModifiers.costDiscountMult);

      if (multiBuildMode && simRef.current.gold >= cost) {
        // Multi-build mode: keep tower type active for rapid placement across slots
        setSelectedTower(null);
      } else {
        setSelectedTower({ ...placed });
        setBuildCandidateType(null);
      }
    }
  };

  const handleBuildOnSelectedSlot = (type: TowerType) => {
    if (selectedSlotIndex !== null) {
      handleSelectSlotToBuild(selectedSlotIndex, type);
    } else {
      setBuildCandidateType(type);
      setSelectedTower(null);
    }
  };

  const handleUpgradePath = (pathIndex: 0 | 1 | 2) => {
    if (!selectedTower || !simRef.current) return;
    const success = simRef.current.upgradePath(selectedTower.id, pathIndex);
    if (success) {
      const updated = simRef.current.towers.find(t => t.id === selectedTower.id);
      if (updated) setSelectedTower({ ...updated });
    }
  };

  const handleSellTower = () => {
    if (!selectedTower || !simRef.current) return;
    simRef.current.sellTower(selectedTower.id);
    setSelectedTower(null);
  };

  const handlePriorityChange = (priority: TargetingPriority) => {
    if (!selectedTower || !simRef.current) return;
    simRef.current.setTowerPriority(selectedTower.id, priority);
    const updated = simRef.current.towers.find(t => t.id === selectedTower.id);
    if (updated) setSelectedTower({ ...updated });
  };

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setSoundMuted(muted);
  };

  return (
    <div className="relative w-full h-full bg-[#05070d] flex flex-col overflow-hidden select-none">
      {/* Top HUD Bar */}
      <div className="shrink-0 h-14 bg-slate-950/95 border-b border-slate-800/80 px-4 flex items-center justify-between z-20 backdrop-blur-md">
        {/* Left: Back button & Sector title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { sound.playClick(); onReturnToMap(); }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            title="Return to Map"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="font-display font-black text-sm text-white leading-tight">
              {level.levelNumber === 999 ? level.title : `Sector ${level.levelNumber}: ${level.title}`}
            </div>
            <div className="text-[10px] text-slate-400">{map.name}</div>
          </div>
        </div>

        {/* Center: Lives, Gold & Wave */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Lives */}
          <div className="flex items-center gap-1.5 font-mono font-bold text-sm text-rose-400 bg-rose-950/40 border border-rose-500/30 px-2.5 py-1 rounded-xl">
            <Heart size={16} className="fill-rose-500 text-rose-500 animate-pulse" />
            <span>{lives} / {simRef.current.maxLives}</span>
          </div>

          {/* Gold */}
          <div className="flex items-center gap-1.5 font-mono font-bold text-sm text-yellow-300 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-xl">
            <Coins size={16} className="text-yellow-400" />
            <span>{gold}g</span>
          </div>

          {/* Wave */}
          <div className="text-xs font-mono font-bold text-sky-300 bg-sky-950/40 border border-sky-500/30 px-2.5 py-1 rounded-xl">
            Wave {Math.min(currentWave, level.waves.length)} / {level.waves.length}
          </div>
        </div>

        {/* Right: Controls (Start Wave, Speed, Sound) */}
        <div className="flex items-center gap-2">
          {/* Start Wave Button */}
          {!waveActive && !simRef.current.allWavesCleared && (
            <button
              onClick={handleStartWave}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-950/40 flex items-center gap-1.5 cursor-pointer animate-pulse"
            >
              <Play size={13} className="fill-white" />
              <span>Deploy Wave</span>
            </button>
          )}

          {/* Auto-Start Waves Toggle */}
          <button
            onClick={() => setAutoStartWaves(a => !a)}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              autoStartWaves
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
            title="Auto-start subsequent waves immediately"
          >
            <Radio size={12} />
            <span>Auto</span>
          </button>

          {/* Pause / Resume */}
          <button
            onClick={() => { sound.playClick(); setIsPaused(p => !p); }}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              isPaused
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
          </button>

          {/* Speed Multiplier (1x, 2x, 4x) */}
          <button
            onClick={() => {
              sound.playClick();
              setGameSpeed(s => (s === 1.0 ? 2.0 : (s === 2.0 ? 4.0 : 1.0)));
            }}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sky-400 font-mono font-bold text-xs rounded-xl transition-colors cursor-pointer"
            title="Game Simulation Speed"
          >
            {gameSpeed}x
          </button>

          {/* Tactical Grid Toggle */}
          <button
            onClick={() => setShowTacticalGrid(g => !g)}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              showTacticalGrid
                ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400'
            }`}
            title={showTacticalGrid ? 'Tactical Grid (3-Block Perimeter) Visible' : 'Tactical Grid Hidden'}
          >
            <Grid3X3 size={16} />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title={soundMuted ? 'Unmute' : 'Mute'}
          >
            {soundMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* Boss Incursion Alert Banner */}
      {bossBanner && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-rose-950/90 border-2 border-rose-500 text-white font-display font-black text-sm uppercase px-6 py-2 rounded-2xl shadow-[0_0_30px_rgba(244,63,94,0.6)] flex items-center gap-2 animate-bounce">
          <Skull size={18} className="text-rose-400" />
          <span>ALERT: {bossBanner} Detected!</span>
        </div>
      )}

      {/* Main Canvas Battlefield */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-2">
        <GameCanvas
          sim={sim}
          selectedTower={selectedTower}
          onSelectTower={(t) => {
            setSelectedTower(t);
            if (t) setSelectedSlotIndex(null);
          }}
          buildCandidateType={buildCandidateType}
          onSelectSlotToBuild={handleSelectSlotToBuild}
          selectedSlotIndex={selectedSlotIndex}
          onSelectEmptySlot={(slotIdx) => {
            setSelectedSlotIndex(slotIdx);
            if (slotIdx !== null) setSelectedTower(null);
          }}
          showGrid={showTacticalGrid}
          draggedTowerType={draggedTowerType}
          dragClientPos={dragClientPos}
          onDropTowerOnSlot={(slotIdx, type) => handleSelectSlotToBuild(slotIdx, type)}
          onCancelDrag={() => {
            setDraggedTowerType(null);
            setDragClientPos(null);
          }}
        />

        {/* Selected Tower Detailed Inspector */}
        {selectedTower && (
          <TowerInspector
            tower={selectedTower}
            sim={sim}
            onClose={() => setSelectedTower(null)}
            onUpgrade={handleUpgradePath}
            onSell={handleSellTower}
            onPriorityChange={handlePriorityChange}
          />
        )}
      </div>

      {/* Bottom Commander Deck Tray */}
      <TowerBuildTray
        unlockedTowers={saveState.unlockedTowers}
        selectedCandidate={buildCandidateType}
        onSelectCandidate={(type) => {
          setBuildCandidateType(type);
          if (type) {
            setSelectedTower(null);
            if (selectedSlotIndex !== null) {
              handleSelectSlotToBuild(selectedSlotIndex, type);
            }
          }
        }}
        sim={sim}
        selectedSlotIndex={selectedSlotIndex}
        onBuildOnSelectedSlot={handleBuildOnSelectedSlot}
        multiBuildMode={multiBuildMode}
        onToggleMultiBuild={() => setMultiBuildMode(m => !m)}
        onCancelSlot={() => setSelectedSlotIndex(null)}
        onStartDragTower={(type, clientX, clientY) => {
          setDraggedTowerType(type);
          setDragClientPos({ clientX, clientY });
        }}
        draggedTowerType={draggedTowerType}
      />

      {/* Modals */}
      {victoryModalOpen && (
        <BattleVictoryModal
          level={level}
          livesRemaining={lives}
          maxLives={sim.maxLives}
          demonsSlain={sim.stats.demonsSlain}
          goldEarned={sim.stats.goldEarned}
          onNextLevel={() => {
            setVictoryModalOpen(false);
            if (onNextLevel) onNextLevel();
            else onReturnToMap();
          }}
          onReplay={() => initSimulation()}
          onReturnToMap={onReturnToMap}
        />
      )}

      {defeatModalOpen && (
        <BattleDefeatModal
          level={level}
          demonsSlain={sim.stats.demonsSlain}
          onRetry={(bonusGold = 0) => initSimulation(bonusGold)}
          onReturnToMap={onReturnToMap}
        />
      )}

      {discoveredTower && (
        <TowerDiscoveryModal
          towerType={discoveredTower}
          onClose={() => setDiscoveredTower(null)}
        />
      )}
    </div>
  );
};
