import {
  PlacedTower,
  EnemyInstance,
  Projectile,
  LaserBeam,
  FloatingText,
  Particle,
  MapDef,
  WaveDef,
  WaveGroup,
  EnemyArchetype,
  StatusBag
} from '../types/game';
import { TOWERS_DATA, ENEMIES_DATA } from '../data/gameData';
import { TDMath } from './TDMath';
import { sound } from '../services/soundService';

export interface SimEvents {
  onEnemyKilled?: (enemy: EnemyInstance) => void;
  onEnemyLeaked?: (enemy: EnemyInstance) => void;
  onLivesChanged?: (lives: number) => void;
  onGoldChanged?: (gold: number) => void;
  onWaveCompleted?: (waveIndex: number) => void;
  onBossSpawned?: (bossName: string) => void;
  onLevelVictory?: () => void;
  onLevelDefeat?: () => void;
}

export interface SimStats {
  demonsSlain: number;
  totalDamageDealt: number;
  goldEarned: number;
  livesLost: number;
}

export class SimWorld {
  public static readonly DT = 1 / 30; // 30Hz fixed simulation step
  public tickIndex: number = 0;
  public isPaused: boolean = false;
  public gameSpeed: number = 1.0; // 1x, 2x, 4x

  public map: MapDef;
  public pathLength: number;
  public waves: WaveDef[];
  public currentWaveIndex: number = 0;
  public waveTime: number = 0;
  public waveActive: boolean = false;
  public allWavesCleared: boolean = false;

  // Spawning scratch
  private activeSpawners: {
    group: WaveGroup;
    spawnedCount: number;
    timer: number;
  }[] = [];

  // Entities
  public towers: PlacedTower[] = [];
  public enemies: EnemyInstance[] = [];
  public projectiles: Projectile[] = [];
  public laserBeams: LaserBeam[] = [];
  public floatingTexts: FloatingText[] = [];
  public particles: Particle[] = [];

  // Economy & Lives
  public gold: number;
  public lives: number;
  public maxLives: number;

  // Meta & Tech tree modifiers
  public techModifiers: {
    physicalDmgMult: number;
    magicDmgMult: number;
    attackSpeedMult: number;
    rangeMult: number;
    slowBonusMult: number;
    startingGoldBonus: number;
    costDiscountMult: number;
    startingLivesBonus: number;
  };

  // Stats
  public stats: SimStats = {
    demonsSlain: 0,
    totalDamageDealt: 0,
    goldEarned: 0,
    livesLost: 0
  };

  public events: SimEvents = {};

  private idCounter = 1;

  constructor(
    map: MapDef,
    waves: WaveDef[],
    startingGold: number,
    startingLives: number,
    techTree: Record<string, number> = {},
    events: SimEvents = {}
  ) {
    this.map = map;
    this.pathLength = TDMath.getPathLength(map.waypoints);
    this.waves = waves;
    this.events = events;

    // Calculate tech tree modifiers
    const physTier = techTree['sharpened_heads'] || 0;
    const magicTier = techTree['arcane_infusion'] || 0;
    const slowTier = techTree['deep_freeze_flux'] || 0;
    const foundryTier = techTree['efficient_foundry'] || 0;
    const treasuryTier = techTree['war_treasury'] || 0;
    const bastionTier = techTree['reinforced_bastion'] || 0;
    const loaderTier = techTree['rapid_loader'] || 0;
    const scopeTier = techTree['surveyor_scope'] || 0;

    this.techModifiers = {
      physicalDmgMult: 1.0 + physTier * 0.05,
      magicDmgMult: 1.0 + magicTier * 0.06,
      slowBonusMult: 1.0 + slowTier * 0.10,
      costDiscountMult: Math.max(0.75, 1.0 - foundryTier * 0.04),
      startingGoldBonus: treasuryTier * 50,
      startingLivesBonus: bastionTier * 3,
      attackSpeedMult: 1.0 + loaderTier * 0.05,
      rangeMult: 1.0 + scopeTier * 0.06
    };

    this.gold = startingGold + this.techModifiers.startingGoldBonus;
    this.maxLives = startingLives + this.techModifiers.startingLivesBonus;
    this.lives = this.maxLives;
  }

  // --- TOWER MANAGEMENT ---

  /**
   * Check if placement slot is open and player has sufficient gold
   */
  public canPlaceTower(type: string, slotIndex: number): boolean {
    if (this.lives <= 0) return false;
    const slot = this.map.slots[slotIndex];
    if (!slot) return false;
    // Check if slot already occupied
    if (this.towers.some(t => t.slotIndex === slotIndex)) return false;

    const def = TOWERS_DATA[type];
    if (!def) return false;

    const finalCost = Math.round(def.baseCost * this.techModifiers.costDiscountMult);
    return this.gold >= finalCost;
  }

  public placeTower(type: string, slotIndex: number): PlacedTower | null {
    if (!this.canPlaceTower(type, slotIndex)) return null;

    const slot = this.map.slots[slotIndex];
    const def = TOWERS_DATA[type];
    const finalCost = Math.round(def.baseCost * this.techModifiers.costDiscountMult);

    this.gold -= finalCost;
    this.events.onGoldChanged?.(this.gold);
    sound.playPlaceTower();

    const tower: PlacedTower = {
      id: `tower_${this.idCounter++}`,
      type: def.type,
      slotIndex,
      x: slot.x,
      y: slot.y,
      pathRanks: [0, 0, 0],
      cooldown: 0,
      targetPriority: def.defaultPriority,
      totalInvestedGold: finalCost,
      totalKills: 0,
      totalDamageDealt: 0,
      aimAngle: 0
    };

    this.towers.push(tower);
    return tower;
  }

  /**
   * Check if upgrade can be purchased obeying the strict 5/2/0 lock rule:
   * "Once a player reaches Tier 3 in one path, the other two paths are capped at Tier 2."
   */
  public canUpgradePath(towerId: string, pathIndex: 0 | 1 | 2): { allowed: boolean; reason?: string; cost: number } {
    const tower = this.towers.find(t => t.id === towerId);
    if (!tower) return { allowed: false, reason: 'Tower not found', cost: 0 };

    const currentRank = tower.pathRanks[pathIndex];
    if (currentRank >= 5) return { allowed: false, reason: 'Path maxed out', cost: 0 };

    const def = TOWERS_DATA[tower.type];
    const nextTierDef = def.paths[pathIndex].tiers[currentRank];
    if (!nextTierDef) return { allowed: false, reason: 'No tier def', cost: 0 };

    const cost = Math.round(nextTierDef.cost * this.techModifiers.costDiscountMult);

    // Enforce 5/2/0 Path Lock from Shadow Codex
    // 1. If upgrading to Tier 3 or higher on this path:
    if (currentRank >= 2) {
      // Check if ANY OTHER path is already at Tier 3 or higher (Two T3s is illegal)
      for (let p = 0; p < 3; p++) {
        if (p !== pathIndex && tower.pathRanks[p] >= 3) {
          return {
            allowed: false,
            reason: 'Path locked! 5/2/0 rule allows only one primary path to exceed Tier 2.',
            cost
          };
        }
      }

      // Precursor rule: If BOTH other paths have upgrades, block T3 until one off-path is reset/sold
      const otherPathsWithUpgrades = [0, 1, 2].filter(p => p !== pathIndex && tower.pathRanks[p] > 0);
      if (otherPathsWithUpgrades.length > 1) {
        return {
          allowed: false,
          reason: '5/2/0 lock rule: A Tier 3+ tower can have at most one secondary path (max 5-2-0). Sell or reset one off-path first.',
          cost
        };
      }
    } else {
      // 2. Upgrading to Tier 1 or 2:
      // If a primary path (T3+) already exists:
      const primaryIdx = tower.pathRanks.findIndex(r => r >= 3);
      if (primaryIdx !== -1 && primaryIdx !== pathIndex) {
        // This is an off-path. Check if the OTHER off-path already has upgrades!
        const otherOffPath = [0, 1, 2].find(p => p !== primaryIdx && p !== pathIndex)!;
        if (tower.pathRanks[otherOffPath] > 0 && currentRank === 0) {
          return {
            allowed: false,
            reason: `5/2/0 lock rule: Secondary branch already active on Path ${otherOffPath + 1}. Third branch is locked at Tier 0.`,
            cost
          };
        }
      }
    }

    if (this.gold < cost) {
      return { allowed: false, reason: 'Insufficient Gold', cost };
    }

    return { allowed: true, cost };
  }

  public upgradePath(towerId: string, pathIndex: 0 | 1 | 2): boolean {
    const check = this.canUpgradePath(towerId, pathIndex);
    if (!check.allowed) return false;

    const tower = this.towers.find(t => t.id === towerId);
    if (!tower) return false;

    this.gold -= check.cost;
    tower.totalInvestedGold += check.cost;
    tower.pathRanks[pathIndex] += 1;

    this.events.onGoldChanged?.(this.gold);
    sound.playUpgrade();

    // Visual burst particles around tower
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      this.addParticle(
        tower.x,
        tower.y,
        Math.cos(angle) * 45,
        Math.sin(angle) * 45,
        TOWERS_DATA[tower.type].accentColor,
        3.5,
        0.4
      );
    }

    return true;
  }

  /**
   * Selling a tower refunds 75% of all invested gold (from Balancing Workbook page 2) and frees slot.
   */
  public sellTower(towerId: string, bonusRefundMult: number = 0): number {
    const idx = this.towers.findIndex(t => t.id === towerId);
    if (idx === -1) return 0;

    const tower = this.towers[idx];
    const refundRatio = Math.min(1.0, 0.75 + bonusRefundMult);
    const refund = Math.round(tower.totalInvestedGold * refundRatio);

    this.gold += refund;
    this.towers.splice(idx, 1);
    this.events.onGoldChanged?.(this.gold);
    sound.playCoin();

    this.addFloatingText(tower.x, tower.y, `+${refund}g`, '#facc15');
    return refund;
  }

  public setTowerPriority(towerId: string, priority: PlacedTower['targetPriority']) {
    const t = this.towers.find(tow => tow.id === towerId);
    if (t) t.targetPriority = priority;
  }

  /**
   * Get effective stats of a placed tower (accounting for base, 3 upgrade paths, and global tech)
   */
  public getEffectiveTowerStats(tower: PlacedTower) {
    const def = TOWERS_DATA[tower.type];
    let damage = def.baseDamage;
    let fireRate = def.baseFireRate * this.techModifiers.attackSpeedMult;
    let range = def.baseRange * this.techModifiers.rangeMult;
    let pierce = def.basePierce;
    let critChance = 0.05;
    let critMult = 2.0;
    let splashRadius = def.splashRadius || 0;
    let splashRatio = def.splashRatio || 0.55;
    let slowPercent = def.slowPercent || 0;
    let slowDuration = (def.slowDuration || 3.0) * this.techModifiers.slowBonusMult;
    let chainCount = def.chainCount || 0;
    let bleedDps = 0;
    let burnDps = 0;

    // Apply modifiers from each of the 3 paths up to current rank
    tower.pathRanks.forEach((rank, pIdx) => {
      const pathDef = def.paths[pIdx];
      for (let t = 0; t < rank; t++) {
        const tier = pathDef.tiers[t];
        if (tier.statMods) {
          if (tier.statMods.damage) damage = Math.max(damage, tier.statMods.damage);
          if (tier.statMods.fireRate) fireRate = Math.max(fireRate, tier.statMods.fireRate);
          if (tier.statMods.range) range = Math.max(range, tier.statMods.range);
          if (tier.statMods.pierce !== undefined) pierce = tier.statMods.pierce;
          if (tier.statMods.critChance) critChance = Math.max(critChance, tier.statMods.critChance);
          if (tier.statMods.critMult) critMult = Math.max(critMult, tier.statMods.critMult);
          if (tier.statMods.splashRadius) splashRadius = tier.statMods.splashRadius;
          if (tier.statMods.splashRatio) splashRatio = tier.statMods.splashRatio;
          if (tier.statMods.slowPercent) slowPercent = tier.statMods.slowPercent;
          if (tier.statMods.slowDuration) slowDuration = tier.statMods.slowDuration * this.techModifiers.slowBonusMult;
          if (tier.statMods.chainCount) chainCount = tier.statMods.chainCount;
          if (tier.statMods.bleedDps) bleedDps = tier.statMods.bleedDps;
          if (tier.statMods.burnDps) burnDps = tier.statMods.burnDps;
        }
      }
    });

    // Apply global tech damage multipliers
    if (def.damageType === 'physical') {
      damage *= this.techModifiers.physicalDmgMult;
    } else if (def.damageType === 'magic' || def.damageType === 'lightning') {
      damage *= this.techModifiers.magicDmgMult;
    }

    const interval = fireRate > 0 ? 1.0 / fireRate : 1.0;

    return {
      damage: Math.round(damage),
      fireRate: Math.round(fireRate * 100) / 100,
      attackInterval: interval,
      range,
      pierce,
      critChance,
      critMult,
      splashRadius,
      splashRatio,
      slowPercent,
      slowDuration,
      chainCount,
      bleedDps,
      burnDps,
      dps: Math.round(damage * fireRate * (1 + critChance * (critMult - 1)))
    };
  }

  // --- WAVE CONTROL ---

  public startNextWave(): boolean {
    if (this.waveActive || this.allWavesCleared || this.lives <= 0) return false;

    if (this.currentWaveIndex >= this.waves.length) {
      this.allWavesCleared = true;
      return false;
    }

    const currentWave = this.waves[this.currentWaveIndex];
    this.waveActive = true;
    this.waveTime = 0;

    // Check if boss wave
    const hasBoss = currentWave.groups.some(g => g.enemyType === 'boss');
    if (hasBoss) {
      sound.playBossAlert();
      this.events.onBossSpawned?.(currentWave.title);
    }

    // Initialize spawners
    this.activeSpawners = currentWave.groups.map(group => ({
      group,
      spawnedCount: 0,
      timer: group.delay
    }));

    return true;
  }

  // --- SIMULATION TICK (Fixed 30Hz) ---

  public tick(dt: number) {
    if (this.isPaused || this.lives <= 0) return;

    this.tickIndex++;

    // 1. Time & Wave Director
    if (this.waveActive) {
      this.waveTime += dt;
      this.stepWaveDirector(dt);
    }

    // 2. Enemy Movement (Step 4 in spec)
    this.stepEnemiesMove(dt);

    // 3. Tower Acquire & Fire (Step 7 & 8)
    this.stepTowers(dt);

    // 4. Projectiles Step (Step 9)
    this.stepProjectiles(dt);

    // 5. Beams & Cones Continuous (Step 10)
    this.stepContinuousWeapons(dt);

    // 6. DoT & Ground Effects (Step 11)
    this.stepDoTs(dt);

    // 7. Hard CC & Slows (Step 12)
    this.stepStatusEffects(dt);

    // 8. Death Resolution (Step 13)
    this.stepDeaths();

    // 9. Leaks / Base Lives (Step 14)
    this.stepLeaks();

    // 10. Floating Texts & Particles
    this.stepVisualFx(dt);

    // 11. Wave Clear Check
    this.checkWaveCompletion();
  }

  private stepWaveDirector(dt: number) {
    let anySpawnerActive = false;

    for (let i = 0; i < this.activeSpawners.length; i++) {
      const spawner = this.activeSpawners[i];
      if (spawner.spawnedCount >= spawner.group.count) continue;

      anySpawnerActive = true;
      spawner.timer -= dt;

      if (spawner.timer <= 0) {
        this.spawnEnemy(spawner.group.enemyType, spawner.group.hpMult, spawner.group.speedMult);
        spawner.spawnedCount++;
        spawner.timer = spawner.group.interval;
      }
    }
  }

  private spawnEnemy(type: EnemyArchetype, hpMult: number = 1.0, speedMult: number = 1.0): EnemyInstance {
    const def = ENEMIES_DATA[type] || ENEMIES_DATA.grunt;
    const p0 = this.map.waypoints[0];

    const maxHp = Math.round(def.baseHp * hpMult);

    const enemy: EnemyInstance = {
      id: `enemy_${this.idCounter++}`,
      type: def.type,
      name: def.name,
      distance: 0,
      x: p0.x,
      y: p0.y,
      hp: maxHp,
      maxHp,
      speed: def.baseSpeed * speedMult,
      armor: def.baseArmor,
      reward: def.reward,
      isFlying: def.isFlying,
      isBoss: def.isBoss,
      size: def.size,
      color: def.color,
      alive: true,
      leaked: false,
      status: {
        slowMultipliers: [],
        slowTimer: 0,
        freezeTimer: 0,
        stunTimer: 0,
        rootTimer: 0,
        groundedTimer: 0,
        burnTimer: 0,
        burnDps: 0,
        poisonStacks: 0,
        poisonTimer: 0,
        poisonDps: 0,
        bleedTimer: 0,
        bleedDps: 0,
        markedTimer: 0,
        markedDamageBonus: 0
      }
    };

    this.enemies.push(enemy);
    return enemy;
  }

  private stepEnemiesMove(dt: number) {
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      if (!enemy.alive || enemy.leaked) continue;

      // Check hard CC: Freeze, Stun, Root
      if (enemy.status.freezeTimer > 0 || enemy.status.stunTimer > 0 || enemy.status.rootTimer > 0) {
        // completely stopped
        continue;
      }

      // Compute multi-slow capped at 80%
      const slowMul = TDMath.calculateSlowMultiplier(enemy.status.slowMultipliers);
      const moveDistance = enemy.speed * dt * slowMul;

      enemy.distance += moveDistance;

      // Update 2D position along path
      const pos = TDMath.evaluatePath(this.map.waypoints, enemy.distance);
      enemy.x = pos.x;
      enemy.y = pos.y;
    }
  }

  private stepTowers(dt: number) {
    for (let i = 0; i < this.towers.length; i++) {
      const tower = this.towers[i];
      const stats = this.getEffectiveTowerStats(tower);
      const def = TOWERS_DATA[tower.type];

      if (tower.cooldown > 0) {
        tower.cooldown -= dt;
      }

      // Continuous beam weapons (Obelisk) handle acquiring in stepContinuousWeapons
      if (def.isContinuousBeam) continue;

      // If ready to fire:
      if (tower.cooldown <= 0) {
        const target = TDMath.selectTarget(
          tower,
          stats.range,
          this.enemies,
          def.canTargetAir,
          def.canTargetGround,
          def.onlyAir
        );

        if (target) {
          // Aim angle
          tower.aimAngle = Math.atan2(target.y - tower.y, target.x - tower.x);

          this.fireTower(tower, target, stats);
          tower.cooldown = stats.attackInterval;
        }
      }
    }
  }

  private fireTower(
    tower: PlacedTower,
    target: EnemyInstance,
    stats: ReturnType<typeof this.getEffectiveTowerStats>
  ) {
    const def = TOWERS_DATA[tower.type];

    // Sound effect
    if (tower.type === 'archer') sound.playArrow();
    else if (tower.type === 'cannon') sound.playExplosion(0.1);
    else if (tower.type === 'frost') sound.playFrost();
    else if (tower.type === 'mage') sound.playMagic();
    else if (tower.type === 'ballista') sound.playBallista();
    else if (tower.type === 'tesla') sound.playTesla();
    else if (tower.type === 'mortar') sound.playExplosion(0.2);
    else if (tower.type === 'gatling') sound.playArrow();

    // Check crit
    const isCrit = Math.random() < stats.critChance;

    if (tower.type === 'tesla') {
      // Chain lightning hitscan
      this.executeTeslaChain(tower, target, stats, isCrit);
      return;
    }

    if (tower.type === 'flamethrower') {
      // Continuous cone handled in continuous weapons
      return;
    }

    // Check Volley / Multi-shot upgrades
    const isVolley = tower.type === 'archer' && tower.pathRanks[2] >= 3;
    const arrowCount = tower.pathRanks[2] >= 5 ? 6 : (tower.pathRanks[2] >= 4 ? 3 : 1);

    if (arrowCount > 1) {
      // Fan of arrows
      const baseAngle = Math.atan2(target.y - tower.y, target.x - tower.x);
      const spread = 0.25; // radians
      for (let a = 0; a < arrowCount; a++) {
        const offset = (a - (arrowCount - 1) / 2) * spread;
        const angle = baseAngle + offset;
        const projSpeed = 450;
        this.projectiles.push({
          id: `proj_${this.idCounter++}`,
          sourceTowerId: tower.id,
          targetEnemyId: target.id,
          x: tower.x,
          y: tower.y,
          vx: Math.cos(angle) * projSpeed,
          vy: Math.sin(angle) * projSpeed,
          speed: projSpeed,
          targetX: target.x,
          targetY: target.y,
          damage: Math.round(stats.damage * (arrowCount > 1 ? 0.75 : 1)),
          damageType: def.damageType,
          pierceRemaining: stats.pierce,
          splashRadius: stats.splashRadius,
          splashRatio: stats.splashRatio,
          statusEffects: {
            slowTimer: stats.slowDuration,
            bleedDps: stats.bleedDps,
            burnDps: stats.burnDps
          },
          color: def.accentColor,
          radius: 3.5,
          alive: true,
          isVolley: true
        });
      }
      return;
    }

    // Standard Projectile
    const dx = target.x - tower.x;
    const dy = target.y - tower.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = tower.type === 'cannon' || tower.type === 'mortar' ? 280 : 500;

    this.projectiles.push({
      id: `proj_${this.idCounter++}`,
      sourceTowerId: tower.id,
      targetEnemyId: target.id,
      x: tower.x,
      y: tower.y,
      vx: dist > 0 ? (dx / dist) * speed : speed,
      vy: dist > 0 ? (dy / dist) * speed : 0,
      speed,
      targetX: target.x,
      targetY: target.y,
      damage: stats.damage,
      damageType: def.damageType,
      pierceRemaining: stats.pierce,
      splashRadius: stats.splashRadius,
      splashRatio: stats.splashRatio,
      statusEffects: {
        slowTimer: stats.slowDuration,
        bleedDps: stats.bleedDps,
        burnDps: stats.burnDps
      },
      color: def.accentColor,
      radius: tower.type === 'cannon' || tower.type === 'mortar' ? 6.0 : 4.0,
      alive: true
    });
  }

  private executeTeslaChain(
    tower: PlacedTower,
    firstTarget: EnemyInstance,
    stats: ReturnType<typeof this.getEffectiveTowerStats>,
    isCrit: boolean
  ) {
    const chainTargets: EnemyInstance[] = [firstTarget];
    let curr = firstTarget;

    const maxBounces = stats.chainCount;
    const maxJumpDistSq = 120 * 120;

    for (let b = 1; b < maxBounces; b++) {
      let nearestNext: EnemyInstance | null = null;
      let nearestDistSq = maxJumpDistSq;

      for (let e = 0; e < this.enemies.length; e++) {
        const candidate = this.enemies[e];
        if (!candidate.alive || candidate.leaked || chainTargets.includes(candidate)) continue;

        const dSq = TDMath.distSq(curr.x, curr.y, candidate.x, candidate.y);
        if (dSq < nearestDistSq) {
          nearestDistSq = dSq;
          nearestNext = candidate;
        }
      }

      if (nearestNext) {
        chainTargets.push(nearestNext);
        curr = nearestNext;
      } else {
        break;
      }
    }

    // Apply damage to all chained targets
    for (let i = 0; i < chainTargets.length; i++) {
      const target = chainTargets[i];
      const bounceDmg = TDMath.calculateChainDamage(stats.damage, i, 0.20);
      const res = TDMath.calculateDamage(
        bounceDmg,
        'lightning',
        target.armor,
        stats.pierce,
        isCrit,
        stats.critMult,
        target.status.markedDamageBonus
      );

      this.applyDamageToEnemy(target, res.finalDamage, res.isCrit, tower);

      // Spark particles
      for (let p = 0; p < 4; p++) {
        this.addParticle(
          target.x + (Math.random() * 12 - 6),
          target.y + (Math.random() * 12 - 6),
          (Math.random() - 0.5) * 60,
          (Math.random() - 0.5) * 60,
          '#facc15',
          2,
          0.25
        );
      }
    }
  }

  private stepProjectiles(dt: number) {
    for (let i = 0; i < this.projectiles.length; i++) {
      const p = this.projectiles[i];
      if (!p.alive) continue;

      // Homing toward target if valid
      const target = this.enemies.find(e => e.id === p.targetEnemyId && e.alive && !e.leaked);
      if (target) {
        p.targetX = target.x;
        p.targetY = target.y;
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          p.vx = (dx / dist) * p.speed;
          p.vy = (dy / dist) * p.speed;
        }
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Check collision
      const hitDistSq = (p.radius + 12) * (p.radius + 12);

      let collided = false;
      let hitEnemy: EnemyInstance | null = null;

      if (target && TDMath.distSq(p.x, p.y, target.x, target.y) <= hitDistSq) {
        collided = true;
        hitEnemy = target;
      } else {
        // Check collision with any living enemy
        for (let e = 0; e < this.enemies.length; e++) {
          const enemy = this.enemies[e];
          if (!enemy.alive || enemy.leaked) continue;

          if (TDMath.distSq(p.x, p.y, enemy.x, enemy.y) <= (p.radius + enemy.size) * (p.radius + enemy.size)) {
            collided = true;
            hitEnemy = enemy;
            break;
          }
        }
      }

      if (collided && hitEnemy) {
        this.resolveProjectileHit(p, hitEnemy);
      } else if (p.x < -100 || p.x > 1100 || p.y < -100 || p.y > 800) {
        p.alive = false;
      }
    }

    // In-place compaction of projectiles without allocating new arrays every frame
    let writeIdx = 0;
    for (let i = 0; i < this.projectiles.length; i++) {
      if (this.projectiles[i].alive) {
        this.projectiles[writeIdx++] = this.projectiles[i];
      }
    }
    this.projectiles.length = writeIdx;
  }

  private resolveProjectileHit(p: Projectile, directTarget: EnemyInstance) {
    const tower = this.towers.find(t => t.id === p.sourceTowerId);

    if (p.splashRadius > 0) {
      // Area splash damage
      sound.playExplosion(0.15);
      const splashSq = p.splashRadius * p.splashRadius;

      for (let i = 0; i < this.enemies.length; i++) {
        const e = this.enemies[i];
        if (!e.alive || e.leaked) continue;

        const dSq = TDMath.distSq(p.x, p.y, e.x, e.y);
        if (dSq <= splashSq) {
          const dist = Math.sqrt(dSq);
          const falloff = 1.0 - (dist / p.splashRadius) * (1.0 - p.splashRatio);
          const splashDmg = Math.round(p.damage * Math.max(0.3, falloff));

          const res = TDMath.calculateDamage(splashDmg, p.damageType, e.armor, 0, false, 2.0, e.status.markedDamageBonus);
          this.applyDamageToEnemy(e, res.finalDamage, false, tower);
        }
      }

      // Explosion particles
      for (let k = 0; k < 14; k++) {
        const angle = (Math.PI * 2 * k) / 14;
        const spd = 60 + Math.random() * 40;
        this.addParticle(
          p.x,
          p.y,
          Math.cos(angle) * spd,
          Math.sin(angle) * spd,
          '#fb923c',
          3.5,
          0.35
        );
      }

      p.alive = false;
    } else {
      // Single hit / pierce
      const res = TDMath.calculateDamage(p.damage, p.damageType, directTarget.armor, 0, false, 2.0, directTarget.status.markedDamageBonus);
      this.applyDamageToEnemy(directTarget, res.finalDamage, false, tower);

      // Apply slow / bleed
      if (p.statusEffects?.slowTimer && p.statusEffects.slowTimer > 0) {
        directTarget.status.slowMultipliers.push(0.30);
        directTarget.status.slowTimer = Math.max(directTarget.status.slowTimer, p.statusEffects.slowTimer);
      }
      if (p.statusEffects?.bleedDps && p.statusEffects.bleedDps > 0) {
        directTarget.status.bleedDps = p.statusEffects.bleedDps;
        directTarget.status.bleedTimer = 4.0;
      }

      if (p.pierceRemaining > 0) {
        p.pierceRemaining--;
      } else {
        p.alive = false;
      }
    }
  }

  private stepContinuousWeapons(dt: number) {
    this.laserBeams = [];

    for (let i = 0; i < this.towers.length; i++) {
      const tower = this.towers[i];
      const def = TOWERS_DATA[tower.type];
      const stats = this.getEffectiveTowerStats(tower);

      // Obelisk continuous laser
      if (def.isContinuousBeam) {
        // Find or maintain locked target
        let target = this.enemies.find(e => e.id === tower.lockedTargetId && e.alive && !e.leaked);
        const rangeSq = stats.range * stats.range;

        if (!target || TDMath.distSq(tower.x, tower.y, target.x, target.y) > rangeSq) {
          // Acquire new target
          target = TDMath.selectTarget(tower, stats.range, this.enemies, true, true, false);
          tower.lockedTargetId = target ? target.id : null;
          tower.beamRampTime = 0;
        }

        if (target) {
          tower.beamRampTime = (tower.beamRampTime || 0) + dt;
          // Ramp damage: base 20 up to 300+ based on continuous focus
          const rampMult = Math.min(6.0, 1.0 + tower.beamRampTime * 0.8);
          const currentDps = stats.damage * rampMult;
          const frameDamage = (currentDps * dt);

          const res = TDMath.calculateDamage(frameDamage, 'lightning', target.armor, stats.pierce, false, 2.0, target.status.markedDamageBonus);
          this.applyDamageToEnemy(target, res.finalDamage, false, tower);

          // Add visual beam
          this.laserBeams.push({
            towerId: tower.id,
            targetEnemyId: target.id,
            startX: tower.x,
            startY: tower.y,
            endX: target.x,
            endY: target.y,
            dps: currentDps,
            color: def.accentColor,
            width: Math.min(7, 2.5 + rampMult * 0.8)
          });
        }
      }

      // Flamethrower continuous cone
      if (def.isConeFlamethrower) {
        const target = TDMath.selectTarget(tower, stats.range, this.enemies, false, true, false);
        if (target) {
          tower.flameAngle = Math.atan2(target.y - tower.y, target.x - tower.x);
          const coneAngle = (Math.PI / 180) * 60; // 60 deg cone
          const halfCone = coneAngle / 2;
          const rangeSq = stats.range * stats.range;

          for (let e = 0; e < this.enemies.length; e++) {
            const enemy = this.enemies[e];
            if (!enemy.alive || enemy.leaked || enemy.isFlying) continue;

            const dSq = TDMath.distSq(tower.x, tower.y, enemy.x, enemy.y);
            if (dSq <= rangeSq) {
              const angleToEnemy = Math.atan2(enemy.y - tower.y, enemy.x - tower.x);
              let angleDiff = Math.abs(angleToEnemy - tower.flameAngle);
              if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

              if (angleDiff <= halfCone) {
                const tickDmg = stats.damage * 5 * dt; // 5 ticks/s
                const res = TDMath.calculateDamage(tickDmg, 'fire', enemy.armor, 0, false, 2.0, enemy.status.markedDamageBonus);
                this.applyDamageToEnemy(enemy, res.finalDamage, false, tower);

                // Apply burn DoT
                enemy.status.burnTimer = 3.0;
                enemy.status.burnDps = Math.max(enemy.status.burnDps, stats.damage * 1.5);
              }
            }
          }

          // Emit flame particles
          for (let p = 0; p < 2; p++) {
            const pAngle = tower.flameAngle + (Math.random() - 0.5) * halfCone;
            const pSpeed = 120 + Math.random() * 80;
            this.addParticle(
              tower.x + Math.cos(pAngle) * 16,
              tower.y + Math.sin(pAngle) * 16,
              Math.cos(pAngle) * pSpeed,
              Math.sin(pAngle) * pSpeed,
              Math.random() > 0.5 ? '#f97316' : '#ef4444',
              3 + Math.random() * 3,
              0.3
            );
          }
        }
      }
    }
  }

  private stepDoTs(dt: number) {
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (!e.alive || e.leaked) continue;

      // Burn
      if (e.status.burnTimer > 0) {
        e.status.burnTimer -= dt;
        const burnTick = e.status.burnDps * dt;
        this.applyDamageToEnemy(e, Math.max(1, Math.round(burnTick)), false);
      }

      // Bleed
      if (e.status.bleedTimer > 0) {
        e.status.bleedTimer -= dt;
        const bleedTick = e.status.bleedDps * dt;
        this.applyDamageToEnemy(e, Math.max(1, Math.round(bleedTick)), false);
      }

      // Void Leech regeneration
      if (e.type === 'leech' && e.status.burnTimer <= 0) {
        e.hp = Math.min(e.maxHp, e.hp + 12 * dt);
      }
    }
  }

  private stepStatusEffects(dt: number) {
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (!e.alive || e.leaked) continue;

      if (e.status.freezeTimer > 0) e.status.freezeTimer -= dt;
      if (e.status.stunTimer > 0) e.status.stunTimer -= dt;
      if (e.status.rootTimer > 0) e.status.rootTimer -= dt;
      if (e.status.groundedTimer > 0) {
        e.status.groundedTimer -= dt;
        if (e.status.groundedTimer <= 0) {
          e.isFlying = true;
        }
      }

      if (e.status.slowTimer > 0) {
        e.status.slowTimer -= dt;
        if (e.status.slowTimer <= 0) {
          e.status.slowMultipliers = [];
        }
      }
    }
  }

  public applyDamageToEnemy(enemy: EnemyInstance, amount: number, isCrit: boolean = false, sourceTower?: PlacedTower) {
    if (!enemy.alive || enemy.leaked || amount <= 0) return;

    enemy.hp -= amount;
    this.stats.totalDamageDealt += amount;

    if (sourceTower) {
      sourceTower.totalDamageDealt += amount;
    }

    // Floating text for big hits or crits
    if (amount >= 20 || isCrit || enemy.isBoss) {
      this.addFloatingText(enemy.x, enemy.y - 12, `-${amount}`, isCrit ? '#f43f5e' : '#f8fafc', isCrit);
    }

    if (enemy.hp <= 0) {
      this.handleEnemyDeath(enemy, sourceTower);
    }
  }

  private handleEnemyDeath(enemy: EnemyInstance, killerTower?: PlacedTower) {
    enemy.alive = false;
    this.stats.demonsSlain++;

    if (killerTower) {
      killerTower.totalKills++;
    }

    // Reward kill gold with Reward Growth formula (1.12 rate from workbook)
    const waveRewardMult = Math.pow(1.12, Math.min(15, this.currentWaveIndex) * 0.4);
    const killReward = Math.max(1, Math.round(enemy.reward * waveRewardMult));
    this.gold += killReward;
    this.stats.goldEarned += killReward;
    this.events.onGoldChanged?.(this.gold);
    this.events.onEnemyKilled?.(enemy);

    sound.playEnemyDeath(enemy.isBoss);

    // Ash Fiend Splitter mechanic: spawns 2 Ember Mites at current path location!
    if (enemy.type === 'splitter') {
      for (let s = 0; s < 2; s++) {
        const mite = this.spawnEnemy('swarm');
        mite.distance = Math.max(0, enemy.distance - 15 * s);
        const pos = TDMath.evaluatePath(this.map.waypoints, mite.distance);
        mite.x = pos.x;
        mite.y = pos.y;
      }
    }

    // Death particle burst
    const count = enemy.isBoss ? 24 : 8;
    for (let k = 0; k < count; k++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 30 + Math.random() * 70;
      this.addParticle(
        enemy.x,
        enemy.y,
        Math.cos(angle) * spd,
        Math.sin(angle) * spd,
        enemy.color,
        enemy.isBoss ? 4.5 : 2.5,
        0.45
      );
    }
  }

  private stepDeaths() {
    // In-place compaction of living enemies without reallocating arrays
    let writeIdx = 0;
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (e.alive && !e.leaked) {
        this.enemies[writeIdx++] = e;
      }
    }
    this.enemies.length = writeIdx;
  }

  private stepLeaks() {
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      if (!enemy.alive || enemy.leaked) continue;

      if (enemy.distance >= this.pathLength) {
        enemy.leaked = true;
        enemy.alive = false;

        const leakCost = enemy.isBoss ? 5 : 1;
        this.lives = Math.max(0, this.lives - leakCost);
        this.stats.livesLost += leakCost;

        this.events.onLivesChanged?.(this.lives);
        this.events.onEnemyLeaked?.(enemy);

        this.addFloatingText(enemy.x, enemy.y, `-${leakCost} HP`, '#ef4444');

        if (this.lives <= 0) {
          sound.playDefeat();
          this.events.onLevelDefeat?.();
          break;
        }
      }
    }
  }

  private stepVisualFx(dt: number) {
    // In-place step and compaction for floating texts
    let ftWrite = 0;
    for (let i = 0; i < this.floatingTexts.length; i++) {
      const ft = this.floatingTexts[i];
      ft.y -= 25 * dt;
      ft.life -= dt;
      if (ft.life > 0) {
        this.floatingTexts[ftWrite++] = ft;
      }
    }
    this.floatingTexts.length = ftWrite;

    // In-place step and compaction for particles
    let pWrite = 0;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life > 0) {
        this.particles[pWrite++] = p;
      }
    }
    this.particles.length = pWrite;
  }

  private checkWaveCompletion() {
    if (!this.waveActive || this.lives <= 0) return;

    // Check if all spawners finished and no living enemies remain
    const allSpawned = this.activeSpawners.every(s => s.spawnedCount >= s.group.count);
    let livingCount = 0;
    for (let i = 0; i < this.enemies.length; i++) {
      if (this.enemies[i].alive && !this.enemies[i].leaked) livingCount++;
    }

    if (allSpawned && livingCount === 0) {
      this.waveActive = false;

      // Wave completion gold bonus from workbook: 50 * 1.10^wave (Income Growth 1.10)
      const waveBonus = Math.round(50 * Math.pow(1.10, this.currentWaveIndex + 1));
      this.gold += waveBonus;
      this.events.onGoldChanged?.(this.gold);
      this.events.onWaveCompleted?.(this.currentWaveIndex + 1);

      this.addFloatingText(450, 200, `WAVE CLEARED! +${waveBonus} Gold`, '#22c55e');
      sound.playCoin();

      this.currentWaveIndex++;

      // Check if all waves completed
      if (this.currentWaveIndex >= this.waves.length) {
        this.allWavesCleared = true;
        sound.playVictory();
        this.events.onLevelVictory?.();
      }
    }
  }

  private ftIndex = 0;
  public addFloatingText(x: number, y: number, text: string, color: string, isCrit: boolean = false) {
    if (this.floatingTexts.length >= 40) {
      const ft = this.floatingTexts[this.ftIndex % 40];
      ft.x = x;
      ft.y = y;
      ft.text = text;
      ft.color = color;
      ft.life = 0.8;
      ft.maxLife = 0.8;
      ft.isCrit = isCrit;
      this.ftIndex++;
      return;
    }
    this.floatingTexts.push({
      id: `ft_${this.idCounter++}`,
      x,
      y,
      text,
      color,
      life: 0.8,
      maxLife: 0.8,
      isCrit
    });
  }

  private particleIndex = 0;
  public addParticle(x: number, y: number, vx: number, vy: number, color: string, radius: number, life: number = 0.4) {
    if (this.particles.length >= 200) {
      const p = this.particles[this.particleIndex % 200];
      p.x = x;
      p.y = y;
      p.vx = vx;
      p.vy = vy;
      p.color = color;
      p.radius = radius;
      p.life = life;
      p.maxLife = life;
      this.particleIndex++;
      return;
    }
    this.particles.push({
      id: `p_${this.idCounter++}`,
      x,
      y,
      vx,
      vy,
      color,
      radius,
      life,
      maxLife: life
    });
  }
}
