import { DailyTacticalChallengeDef, TowerType, WaveDef } from '../types/game';
import { MAPS } from './gameData';

export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Pseudo-random deterministic generator based on string seed
function seedRandom(seedStr: string): () => number {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  return () => {
    hash = (hash * 9301 + 49297) % 233280;
    return Math.abs(hash / 233280);
  };
}

export function generateDailyTacticalChallenge(dateKey = getTodayDateKey()): DailyTacticalChallengeDef {
  const rng = seedRandom(dateKey);

  const mapKeys = Object.keys(MAPS);
  const selectedMapId = mapKeys[Math.floor(rng() * mapKeys.length)] || 'ashen_caldera';
  const selectedMap = MAPS[selectedMapId];

  // Roster of restricted available towers (pick 4 distinct)
  const allTowers: TowerType[] = ['archer', 'cannon', 'frost', 'mage', 'ballista', 'tesla', 'mortar', 'flamethrower', 'obelisk', 'gatling'];
  const shuffledTowers = [...allTowers].sort(() => rng() - 0.5);
  const allowedTowers = shuffledTowers.slice(0, 4);

  // Pick 1 or 2 challenge modifiers
  const possibleModifiers: ('DOUBLE_SPAWN' | 'IRON_SKIN' | 'BLOOD_PRICE' | 'NO_MERCY' | 'FROZEN_TIME')[] = [
    'DOUBLE_SPAWN',
    'IRON_SKIN',
    'BLOOD_PRICE',
    'NO_MERCY',
    'FROZEN_TIME'
  ];
  const activeModifiers = [possibleModifiers[Math.floor(rng() * possibleModifiers.length)]];

  // Generate 8 balanced tactical waves
  const waves: WaveDef[] = [
    {
      waveIndex: 1,
      title: 'Scout Vanguard',
      groups: [
        { enemyType: 'grunt', count: 12, interval: 1.0, delay: 0 },
        { enemyType: 'runner', count: 6, interval: 0.8, delay: 5 }
      ],
      bonusReward: 60
    },
    {
      waveIndex: 2,
      title: 'Swarm Swell',
      groups: [
        { enemyType: 'swarm', count: 24, interval: 0.35, delay: 0 },
        { enemyType: 'grunt', count: 8, interval: 0.9, delay: 4 }
      ],
      bonusReward: 70
    },
    {
      waveIndex: 3,
      title: 'Sky Invasion',
      groups: [
        { enemyType: 'flyer', count: 10, interval: 0.9, delay: 0 },
        { enemyType: 'runner', count: 12, interval: 0.7, delay: 3 }
      ],
      bonusReward: 80
    },
    {
      waveIndex: 4,
      title: 'Iron Vanguard',
      groups: [
        { enemyType: 'armored', count: 6, interval: 1.8, delay: 0, hpMult: 1.2 },
        { enemyType: 'grunt', count: 14, interval: 0.7, delay: 2 }
      ],
      bonusReward: 90
    },
    {
      waveIndex: 5,
      title: 'Splitter Hive',
      groups: [
        { enemyType: 'splitter', count: 6, interval: 2.0, delay: 0 },
        { enemyType: 'flyer', count: 10, interval: 0.8, delay: 4 }
      ],
      bonusReward: 100
    },
    {
      waveIndex: 6,
      title: 'Leech Regrowth',
      groups: [
        { enemyType: 'leech', count: 8, interval: 1.4, delay: 0 },
        { enemyType: 'armored', count: 8, interval: 1.5, delay: 3 }
      ],
      bonusReward: 120
    },
    {
      waveIndex: 7,
      title: 'Combined Arms Incursion',
      groups: [
        { enemyType: 'armored', count: 10, interval: 1.2, delay: 0 },
        { enemyType: 'flyer', count: 14, interval: 0.7, delay: 2 },
        { enemyType: 'splitter', count: 6, interval: 1.8, delay: 4 }
      ],
      bonusReward: 140
    },
    {
      waveIndex: 8,
      title: 'Colossus Execution',
      groups: [
        { enemyType: 'boss', count: 1, interval: 4.0, delay: 0, hpMult: 1.4 },
        { enemyType: 'armored', count: 8, interval: 1.5, delay: 4 },
        { enemyType: 'flyer', count: 12, interval: 0.8, delay: 6 }
      ],
      bonusReward: 200
    }
  ];

  return {
    dateKey,
    title: `Operation ${selectedMap.name}`,
    subtitle: `Daily Tactical Protocol • ${dateKey}`,
    mapId: selectedMapId,
    waves,
    startingGold: 420,
    startingLives: 3,
    allowedTowers,
    activeModifiers,
    targetWaves: 8
  };
}

export interface DailyTacticalRecord {
  dateKey: string;
  bestWave: number;
  completed: boolean;
  totalDamage: number;
  fewestLeaks: number;
  score: number;
}

export function getDailyTacticalRecord(dateKey = getTodayDateKey()): DailyTacticalRecord | null {
  try {
    const raw = localStorage.getItem(`citadel_daily_record_${dateKey}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDailyTacticalRecord(record: DailyTacticalRecord) {
  try {
    localStorage.setItem(`citadel_daily_record_${record.dateKey}`, JSON.stringify(record));
  } catch {
    // ignore
  }
}
