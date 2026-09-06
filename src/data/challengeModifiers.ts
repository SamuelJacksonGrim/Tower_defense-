import { ChallengeModifierDef, ChallengeModifierId } from '../types/game';

export const HELL_MODIFIERS: Record<ChallengeModifierId, ChallengeModifierDef> = {
  DOUBLE_SPAWN: {
    id: 'DOUBLE_SPAWN',
    name: 'Double Spawn',
    description: 'Enemies spawn 100% faster from the void gates.',
    icon: '⚡',
    scoreMultiplier: 1.35,
    color: '#f59e0b'
  },
  IRON_SKIN: {
    id: 'IRON_SKIN',
    name: 'Iron Skin',
    description: 'All enemies gain +50% physical and elemental armor.',
    icon: '🛡️',
    scoreMultiplier: 1.30,
    color: '#94a3b8'
  },
  BLOOD_PRICE: {
    id: 'BLOOD_PRICE',
    name: 'Blood Price',
    description: 'Tower placement and upgrade costs increased by +25%.',
    icon: '🩸',
    scoreMultiplier: 1.25,
    color: '#ef4444'
  },
  NO_MERCY: {
    id: 'NO_MERCY',
    name: 'No Mercy',
    description: 'Breaching enemies deal double damage to citadel lives.',
    icon: '☠️',
    scoreMultiplier: 1.40,
    color: '#dc2626'
  },
  FROZEN_TIME: {
    id: 'FROZEN_TIME',
    name: 'Frozen Time',
    description: 'Tower attack speed and fire rate reduced by 20%.',
    icon: '⏳',
    scoreMultiplier: 1.30,
    color: '#38bdf8'
  }
};

export const HELL_MODIFIERS_LIST = Object.values(HELL_MODIFIERS);
