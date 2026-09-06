export type TowerType =
  | 'archer'
  | 'cannon'
  | 'frost'
  | 'mage'
  | 'ballista'
  | 'tesla'
  | 'mortar'
  | 'poison'
  | 'flamethrower'
  | 'gatling'
  | 'obelisk'
  | 'alchemist'
  | 'banner'
  | 'gold_mine'
  | 'rune'
  | 'spike_trap'
  | 'gravity_well'
  | 'portal'
  | 'summoner'
  | 'obsidian_idol'
  | 'meteor'
  | 'temporal';

export type TargetingPriority = 'first' | 'last' | 'strongest' | 'weakest' | 'nearest';

export type DamageType = 'physical' | 'magic' | 'cold' | 'lightning' | 'fire' | 'true' | 'spatial';

export interface TowerPathTier {
  name: string;
  cost: number;
  description: string;
  statMods?: {
    damage?: number;
    fireRate?: number;
    attackInterval?: number;
    range?: number;
    pierce?: number;
    critChance?: number;
    critMult?: number;
    splashRadius?: number;
    splashRatio?: number;
    slowPercent?: number;
    slowDuration?: number;
    chainCount?: number;
    bleedDps?: number;
    burnDps?: number;
  };
  specialMechanic?: string;
}

export interface TowerPathDef {
  name: string;
  description: string;
  tiers: TowerPathTier[]; // 5 tiers
}

export interface TowerDef {
  type: TowerType;
  name: string;
  role: string;
  description: string;
  baseCost: number;
  baseDamage: number;
  baseFireRate: number; // attacks per second
  baseRange: number; // in grid units / pixels
  basePierce: number;
  damageType: DamageType;
  defaultPriority: TargetingPriority;
  canTargetAir: boolean;
  canTargetGround: boolean;
  onlyAir?: boolean;
  splashRadius?: number;
  splashRatio?: number;
  chainCount?: number;
  chainFalloff?: number;
  slowPercent?: number;
  slowDuration?: number;
  isContinuousBeam?: boolean;
  isConeFlamethrower?: boolean;
  isSupportAura?: boolean;
  isMineIncome?: boolean;
  auraRadius?: number;
  auraBuff?: {
    damageBonus?: number;
    speedBonus?: number;
    armorReduction?: number;
  };
  paths: [TowerPathDef, TowerPathDef, TowerPathDef]; // Path 1, 2, 3
  color: string;
  accentColor: string;
  tacticalRole?: 'CONTROL' | 'BURST DPS' | 'AOE SPLASH' | 'SNIPER' | 'SUPPORT' | 'CHAIN LIGHTNING' | 'MELTER' | 'SIEGE';
  strongAgainst?: string[];
  weakAgainst?: string[];
  synergies?: string[];
}

export interface PlacedTower {
  id: string;
  type: TowerType;
  slotIndex: number;
  x: number;
  y: number;
  pathRanks: [number, number, number]; // 0..5 for pathA, pathB, pathC
  cooldown: number; // remaining seconds until next attack
  targetPriority: TargetingPriority;
  totalInvestedGold: number;
  totalKills: number;
  totalDamageDealt: number;
  activeCombatSeconds?: number;
  placedAtTime?: number;
  lockedTargetId?: string | null;
  beamRampTime?: number;
  flameAngle?: number;
  aimAngle: number;
}

export type EnemyArchetype =
  | 'grunt' // Ash Raider
  | 'runner' // Cinder Skitter
  | 'swarm' // Ember Mite
  | 'armored' // Slag Plate
  | 'flyer' // Soot Wing
  | 'boss' // Kiln Colossus, Dread Golem, etc.
  | 'splitter' // Ash Fiend
  | 'leech'; // Void Leech

export interface EnemyDef {
  type: EnemyArchetype;
  name: string;
  baseHp: number;
  baseSpeed: number;
  baseArmor: number;
  reward: number;
  role: string;
  isFlying: boolean;
  isBoss: boolean;
  size: number;
  color: string;
  description: string;
  weaknesses?: string[];
  resistances?: string[];
  behavior?: string;
  firstEncountered?: string;
  hpRank?: number; // 1-10
  armorRank?: number; // 1-10
  speedRank?: number; // 1-10
}

export interface StatusBag {
  slowMultipliers: number[];
  slowTimer: number;
  freezeTimer: number;
  stunTimer: number;
  rootTimer: number;
  groundedTimer: number;
  burnTimer: number;
  burnDps: number;
  poisonStacks: number;
  poisonTimer: number;
  poisonDps: number;
  bleedTimer: number;
  bleedDps: number;
  markedTimer: number;
  markedDamageBonus: number;
}

export interface EnemyInstance {
  id: string;
  type: EnemyArchetype;
  name: string;
  distance: number; // distance traveled along path (px)
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  armor: number;
  reward: number;
  isFlying: boolean;
  isBoss: boolean;
  size: number;
  color: string;
  alive: boolean;
  leaked: boolean;
  status: StatusBag;
}

export interface Projectile {
  id: string;
  sourceTowerId: string;
  targetEnemyId?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  targetX: number;
  targetY: number;
  damage: number;
  damageType: DamageType;
  pierceRemaining: number;
  splashRadius: number;
  splashRatio: number;
  statusEffects?: Partial<StatusBag>;
  color: string;
  radius: number;
  alive: boolean;
  isVolley?: boolean;
}

export interface LaserBeam {
  towerId: string;
  targetEnemyId: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  dps: number;
  color: string;
  width: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  isCrit?: boolean;
  damageType?: DamageType;
  isResisted?: boolean;
  tag?: string; // 'FIRE' | 'COLD' | 'LIGHTNING' | 'MAGIC' | 'CRIT' | 'RESISTED' | 'SHATTER' | 'IGNITE' | 'EXECUTE'
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  life: number;
  maxLife: number;
}

export interface MapSlot {
  x: number;
  y: number;
}

export type MapId = 'frontier_outpost' | 'ashen_caldera' | 'cold_hell_gate' | 'map1' | 'map2' | 'map3' | string;

export interface MapDef {
  id: string;
  name: string;
  region: string;
  description: string;
  waypoints: { x: number; y: number }[];
  slots: MapSlot[];
  theme: 'frontier' | 'caldera' | 'cold_hell';
  bgGradient: [string, string];
  pathColor: string;
  pathWidth: number;
}

export interface WaveGroup {
  enemyType: EnemyArchetype;
  count: number;
  interval: number; // seconds between spawns
  delay: number; // delay before this group starts spawning
  hpMult?: number;
  speedMult?: number;
}

export interface WaveDef {
  waveIndex: number;
  title: string;
  groups: WaveGroup[];
  bonusReward?: number;
}

export interface CampaignLevel {
  levelNumber: number;
  title: string;
  subtitle: string;
  mapId: string;
  storyIntro: string;
  storyOutro: string;
  bossName?: string;
  unlocksTower?: TowerType;
  waves: WaveDef[];
  startingGold: number;
  startingLives: number;
  recommendedTowers: TowerType[];
}

export interface DailyBounty {
  id: string;
  title: string;
  description: string;
  target: number;
  progress?: number;
  current?: number;
  rewardGold: number;
  rewardTechPoints: number;
  completed?: boolean;
  claimed: boolean;
}

export interface LoginReward {
  day: number;
  rewardText?: string;
  gold: number;
  techPoints: number;
  skinReward?: string;
  claimed?: boolean;
}

export interface TechNode {
  id: string;
  name: string;
  description: string;
  cost: number[]; // cost per tier
  costPerTier?: number[];
  maxTier: number;
  category: 'offense' | 'defense' | 'economy' | 'utility';
  icon: string;
}

export interface GameSaveState {
  campaignMaxLevel: number;
  levelStars: Record<number, number>; // levelNumber -> 0..3 stars
  unlockedTowers: TowerType[];
  gold?: number;
  goldBank?: number;
  techPoints: number;
  techTree: Record<string, number>; // nodeId -> tier
  highScoreWaves?: Record<string, number>;
  totalDemonsKilled?: number;
  loginStreak?: number;
  lastLoginDate?: string;
  loginRewards?: LoginReward[];
  bounties?: DailyBounty[];
  loginDay?: number;
  lastLoginTimestamp?: number;
  loginClaimedToday?: boolean;
  dailyBounties?: DailyBounty[];
  dailyBountyDate?: string;
  endlessHighScore?: number;
  endlessDemonsSlain?: number;
  removeAdsUnlocked?: boolean;
  removedAds?: boolean;
  soundMuted?: boolean;
  selectedSkin?: string;
  selectedTheme?: string;
}

export type ChallengeModifierId =
  | 'DOUBLE_SPAWN'
  | 'IRON_SKIN'
  | 'BLOOD_PRICE'
  | 'NO_MERCY'
  | 'FROZEN_TIME';

export interface ChallengeModifierDef {
  id: ChallengeModifierId;
  name: string;
  description: string;
  icon: string;
  scoreMultiplier: number;
  color: string;
}

export interface TowerPresetItem {
  towerType: TowerType;
  targetPathRanks: [number, number, number];
  priority: TargetingPriority;
  notes?: string;
}

export interface TowerPresetLoadout {
  id: string;
  name: string;
  description: string;
  icon: string;
  towers: TowerPresetItem[];
}

export interface DailyTacticalChallengeDef {
  dateKey: string;
  title: string;
  subtitle: string;
  mapId: string;
  waves: WaveDef[];
  startingGold: number;
  startingLives: number;
  allowedTowers: TowerType[];
  activeModifiers: ChallengeModifierId[];
  targetWaves: number;
}
