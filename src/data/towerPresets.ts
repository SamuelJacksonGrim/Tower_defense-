import { TowerPresetLoadout } from '../types/game';

export const DEFAULT_TOWER_PRESETS: TowerPresetLoadout[] = [
  {
    id: 'anti_boss',
    name: 'Boss Killer',
    description: 'Focused high single-target DPS and sustained armor-shredding laser.',
    icon: '🎯',
    towers: [
      { towerType: 'obelisk', targetPathRanks: [5, 2, 0], priority: 'strongest', notes: 'Continuous melting laser' },
      { towerType: 'ballista', targetPathRanks: [5, 2, 0], priority: 'strongest', notes: 'High pierce armor-cracker' },
      { towerType: 'frost', targetPathRanks: [2, 5, 0], priority: 'first', notes: 'Max perimeter slow control' }
    ]
  },
  {
    id: 'swarm_control',
    name: 'Swarm Demolition',
    description: 'Heavy area-of-effect blast craters and continuous cone incinerators.',
    icon: '💥',
    towers: [
      { towerType: 'mortar', targetPathRanks: [5, 2, 0], priority: 'first', notes: 'Massive splash damage' },
      { towerType: 'flamethrower', targetPathRanks: [5, 0, 2], priority: 'first', notes: 'Continuous burning cone' },
      { towerType: 'tesla', targetPathRanks: [2, 5, 0], priority: 'first', notes: 'High bounce chain arcs' }
    ]
  },
  {
    id: 'air_defense',
    name: 'Air Interceptor',
    description: 'High velocity anti-aerial tracking rounds and rapid anti-soot flak.',
    icon: '🦅',
    towers: [
      { towerType: 'archer', targetPathRanks: [5, 2, 0], priority: 'first', notes: 'Long range precision volleys' },
      { towerType: 'gatling', targetPathRanks: [5, 0, 2], priority: 'first', notes: 'Extreme rate of fire shredder' },
      { towerType: 'ballista', targetPathRanks: [2, 5, 0], priority: 'strongest', notes: 'Heavy sky piercing bolts' }
    ]
  },
  {
    id: 'economy_engine',
    name: 'War Treasury',
    description: 'Gold mining extraction engines protected by high-efficiency defense lines.',
    icon: '💰',
    towers: [
      { towerType: 'gold_mine', targetPathRanks: [5, 2, 0], priority: 'first', notes: 'Max passive gold extraction' },
      { towerType: 'cannon', targetPathRanks: [2, 5, 0], priority: 'first', notes: 'Cost-effective physical knockback' },
      { towerType: 'frost', targetPathRanks: [2, 0, 5], priority: 'first', notes: 'Budget slow zone' }
    ]
  }
];

const PRESETS_STORAGE_KEY = 'citadel_tower_loadouts';

export function loadSavedPresets(): TowerPresetLoadout[] {
  try {
    const raw = localStorage.getItem(PRESETS_STORAGE_KEY);
    if (!raw) return DEFAULT_TOWER_PRESETS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TOWER_PRESETS;
  } catch {
    return DEFAULT_TOWER_PRESETS;
  }
}

export function savePresets(presets: TowerPresetLoadout[]) {
  try {
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
  } catch {
    // ignore
  }
}
