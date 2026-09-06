import { TowerType, EnemyType } from '../types/game';
import { TOWERS_DATA, ENEMIES_DATA } from '../data/gameData';
import { TDMath } from './TDMath';

export interface BalanceBenchmarkResult {
  towerType: TowerType;
  pathRanks: [number, number, number];
  targetEnemy: EnemyType;
  totalRuns: number;
  totalCost: number;
  meanDps: number;
  medianDps: number;
  minDps: number;
  maxDps: number;
  averageTtkSeconds: number;
  damagePerGold: number;
  overkillWastePercent: number;
  armorMitigationPercent: number;
  dpsDistribution: number[];
}

export interface TowerComparisonBenchmark {
  configA: { towerType: TowerType; pathRanks: [number, number, number] };
  configB: { towerType: TowerType; pathRanks: [number, number, number] };
  targetEnemy: EnemyType;
  resultA: BalanceBenchmarkResult;
  resultB: BalanceBenchmarkResult;
  winnerDps: 'A' | 'B' | 'TIE';
  winnerEfficiency: 'A' | 'B' | 'TIE';
}

export class BalanceLaboratory {
  /**
   * Run empirical simulation across N trials (default: 500)
   * Measuring damage, crit variance, armor absorption, and time-to-kill.
   */
  public static runBenchmark(
    towerType: TowerType,
    pathRanks: [number, number, number],
    targetEnemyType: EnemyType,
    runs = 500
  ): BalanceBenchmarkResult {
    const def = TOWERS_DATA[towerType];
    const enemyDef = ENEMIES_DATA[targetEnemyType];

    // Compute tower stats given path ranks
    let damage = def.baseDamage;
    let fireRate = def.baseFireRate;
    let range = def.baseRange;
    let pierce = def.basePierce;
    let critChance = 0.05;
    let critMult = 1.5;
    let totalCost = def.cost;

    // Apply upgrade modifiers
    pathRanks.forEach((rank, pIdx) => {
      const path = def.paths[pIdx];
      for (let r = 0; r < rank; r++) {
        const tier = path.tiers[r];
        if (tier) {
          totalCost += tier.cost;
          if (tier.statMods.damage) damage += tier.statMods.damage;
          if (tier.statMods.fireRate) fireRate += tier.statMods.fireRate;
          if (tier.statMods.range) range += tier.statMods.range;
          if (tier.statMods.pierce) pierce += tier.statMods.pierce;
          if (tier.statMods.critChance) critChance += tier.statMods.critChance;
          if (tier.statMods.critMultiplier) critMult += tier.statMods.critMultiplier;
        }
      }
    });

    // Check anti-air capability
    const canHit = !enemyDef.isFlying || def.canTargetAir;
    if (!canHit) {
      return {
        towerType,
        pathRanks,
        targetEnemy: targetEnemyType,
        totalRuns: runs,
        totalCost,
        meanDps: 0,
        medianDps: 0,
        minDps: 0,
        maxDps: 0,
        averageTtkSeconds: 999,
        damagePerGold: 0,
        overkillWastePercent: 0,
        armorMitigationPercent: 100,
        dpsDistribution: new Array(10).fill(0)
      };
    }

    const dpsList: number[] = [];
    const ttkList: number[] = [];
    let totalDamageDealt = 0;
    let totalOverkillDamage = 0;
    let rawPotentialDamage = 0;

    for (let i = 0; i < runs; i++) {
      let enemyHp = enemyDef.hp;
      let combatTime = 0;
      let damageInFight = 0;
      const attackInterval = 1 / Math.max(0.01, fireRate);

      // Fight until enemy dies or 120s timeout
      while (enemyHp > 0 && combatTime < 120) {
        combatTime += attackInterval;
        const isCrit = Math.random() < critChance;
        const calc = TDMath.calculateDamage(
          damage,
          def.damageType,
          enemyDef.armor,
          pierce,
          isCrit,
          critMult,
          0
        );

        const hitDamage = calc.finalDamage;
        rawPotentialDamage += damage * (isCrit ? critMult : 1);

        if (hitDamage >= enemyHp) {
          totalOverkillDamage += (hitDamage - enemyHp);
          damageInFight += enemyHp;
          enemyHp = 0;
        } else {
          enemyHp -= hitDamage;
          damageInFight += hitDamage;
        }
      }

      const runDps = combatTime > 0 ? damageInFight / combatTime : 0;
      dpsList.push(runDps);
      ttkList.push(combatTime);
      totalDamageDealt += damageInFight;
    }

    // Statistics
    dpsList.sort((a, b) => a - b);
    const minDps = Math.round(dpsList[0] * 10) / 10;
    const maxDps = Math.round(dpsList[dpsList.length - 1] * 10) / 10;
    const medianDps = Math.round(dpsList[Math.floor(dpsList.length / 2)] * 10) / 10;
    const meanDps = Math.round((dpsList.reduce((acc, v) => acc + v, 0) / runs) * 10) / 10;

    const averageTtkSeconds = Math.round((ttkList.reduce((acc, v) => acc + v, 0) / runs) * 100) / 100;
    const damagePerGold = Math.round((totalDamageDealt / Math.max(1, totalCost * runs)) * 100) / 100;

    const overkillWastePercent = totalDamageDealt > 0
      ? Math.round((totalOverkillDamage / (totalDamageDealt + totalOverkillDamage)) * 100)
      : 0;

    const armorMitigationPercent = rawPotentialDamage > 0
      ? Math.max(0, Math.round(((rawPotentialDamage - (totalDamageDealt + totalOverkillDamage)) / rawPotentialDamage) * 100))
      : 0;

    // Build 10-bucket distribution
    const rangeSpan = Math.max(1, maxDps - minDps);
    const dpsDistribution = new Array(10).fill(0);
    for (const d of dpsList) {
      const bucket = Math.min(9, Math.floor(((d - minDps) / rangeSpan) * 10));
      dpsDistribution[bucket]++;
    }

    return {
      towerType,
      pathRanks,
      targetEnemy: targetEnemyType,
      totalRuns: runs,
      totalCost,
      meanDps,
      medianDps,
      minDps,
      maxDps,
      averageTtkSeconds,
      damagePerGold,
      overkillWastePercent,
      armorMitigationPercent,
      dpsDistribution
    };
  }

  /**
   * Compare two configurations across a representative gauntlet of demons
   */
  public static compare(
    configA: { towerType: TowerType; pathRanks: [number, number, number] },
    configB: { towerType: TowerType; pathRanks: [number, number, number] },
    enemyType: EnemyType = 'armored',
    runs = 500
  ): TowerComparisonBenchmark {
    const resultA = this.runBenchmark(configA.towerType, configA.pathRanks, enemyType, runs);
    const resultB = this.runBenchmark(configB.towerType, configB.pathRanks, enemyType, runs);

    let winnerDps: 'A' | 'B' | 'TIE' = 'TIE';
    if (resultA.meanDps > resultB.meanDps * 1.02) winnerDps = 'A';
    else if (resultB.meanDps > resultA.meanDps * 1.02) winnerDps = 'B';

    let winnerEfficiency: 'A' | 'B' | 'TIE' = 'TIE';
    if (resultA.damagePerGold > resultB.damagePerGold * 1.02) winnerEfficiency = 'A';
    else if (resultB.damagePerGold > resultA.damagePerGold * 1.02) winnerEfficiency = 'B';

    return {
      configA,
      configB,
      targetEnemy: enemyType,
      resultA,
      resultB,
      winnerDps,
      winnerEfficiency
    };
  }
}
