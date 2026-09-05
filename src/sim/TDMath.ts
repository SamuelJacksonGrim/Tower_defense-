// Deterministic Combat & Targeting Math for TOWERDEF

import { EnemyInstance, PlacedTower, TargetingPriority, DamageType } from '../types/game';

export class TDMath {
  /**
   * Distance between two points
   */
  public static distSq(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return dx * dx + dy * dy;
  }

  public static dist(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(this.distSq(x1, y1, x2, y2));
  }

  /**
   * Armor formula with GemCraft Armor Constant (K = 50, recommended 40-60 in workbook):
   * netArmor = max(0, armor - pierce)
   * mitigation = K / (K + netArmor)
   * effective = max(1, dmg * mitigation)
   */
  public static calculateDamage(
    rawDamage: number,
    damageType: DamageType,
    enemyArmor: number,
    towerPierce: number = 0,
    isCrit: boolean = false,
    critMult: number = 2.0,
    takenAmp: number = 0
  ): { finalDamage: number; isCrit: boolean } {
    let dmg = rawDamage;
    if (isCrit) {
      dmg *= critMult;
    }

    let effectiveDamage = dmg;
    const K = 50; // GemCraft armor constant from workbook (40-60 range)

    if (damageType === 'physical') {
      const netArmor = Math.max(0, enemyArmor - towerPierce);
      const mitigation = K / (K + netArmor);
      effectiveDamage = Math.max(1, dmg * mitigation);
    } else if (damageType === 'magic' || damageType === 'true') {
      // Magic & true damage bypass physical armor
      effectiveDamage = dmg;
    } else {
      // Elemental (cold, lightning, fire, spatial): mitigated by half effective armor
      const netArmor = Math.max(0, (enemyArmor * 0.5) - towerPierce);
      const mitigation = K / (K + netArmor);
      effectiveDamage = Math.max(1, dmg * mitigation);
    }

    // Apply vulnerability / damage-taken amplification (Additive bucket from spec)
    if (takenAmp > 0) {
      effectiveDamage *= (1 + takenAmp);
    }

    return {
      finalDamage: Math.max(1, Math.round(effectiveDamage)),
      isCrit
    };
  }

  /**
   * Multiplicative slow stacking from Balancing Workbook & Spec:
   * slow = 1 - product(1 - slow_i), hard capped at 0.85 (85% max slow from workbook)
   */
  public static calculateSlowMultiplier(slowPercentages: number[]): number {
    if (!slowPercentages || slowPercentages.length === 0) return 1.0;

    let remaining = 1.0;
    for (const s of slowPercentages) {
      const clamped = Math.min(0.85, Math.max(0, s));
      remaining *= (1.0 - clamped);
    }

    const totalSlow = 1.0 - remaining;
    const cappedSlow = Math.min(0.85, totalSlow);
    return Math.max(0.15, 1.0 - cappedSlow);
  }

  /**
   * Chain lightning damage calculation:
   * damage * (1 - chainFalloff)^n (default falloff 0.20 from workbook)
   */
  public static calculateChainDamage(baseDamage: number, bounceIndex: number, falloff: number = 0.20): number {
    return Math.max(1, Math.round(baseDamage * Math.pow(1 - falloff, bounceIndex)));
  }

  // Waypoint path cache to avoid recalculating lengths and sqrt thousands of times/sec
  private static pathCacheMap = new WeakMap<{ x: number; y: number }[], {
    segmentLengths: number[];
    cumulativeDistances: number[];
    totalLength: number;
  }>();

  public static getOrCreatePathCache(waypoints: { x: number; y: number }[]) {
    let cache = this.pathCacheMap.get(waypoints);
    if (!cache) {
      const segmentLengths: number[] = [];
      const cumulativeDistances: number[] = [0];
      let totalLength = 0;

      for (let i = 0; i < waypoints.length - 1; i++) {
        const dx = waypoints[i + 1].x - waypoints[i].x;
        const dy = waypoints[i + 1].y - waypoints[i].y;
        const len = Math.sqrt(dx * dx + dy * dy);
        segmentLengths.push(len);
        totalLength += len;
        cumulativeDistances.push(totalLength);
      }

      cache = { segmentLengths, cumulativeDistances, totalLength };
      this.pathCacheMap.set(waypoints, cache);
    }
    return cache;
  }

  /**
   * Deterministic Target Selection (Zero heap allocation, single pass)
   */
  public static selectTarget(
    tower: PlacedTower,
    range: number,
    enemies: EnemyInstance[],
    canTargetAir: boolean,
    canTargetGround: boolean,
    onlyAir: boolean = false
  ): EnemyInstance | null {
    const rangeSq = range * range;
    const priority = tower.targetPriority;

    let best: EnemyInstance | null = null;
    let bestDist = 0;
    let bestDistSqFromTower = 0;
    let bestHp = 0;
    let bestIsBoss = false;

    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e.alive || e.leaked) continue;
      if (e.isFlying && !canTargetAir) continue;
      if (!e.isFlying && onlyAir) continue;
      if (!e.isFlying && !canTargetGround) continue;

      const dSq = this.distSq(tower.x, tower.y, e.x, e.y);
      if (dSq > rangeSq) continue;

      if (!best) {
        best = e;
        bestDist = e.distance;
        bestDistSqFromTower = dSq;
        bestHp = e.hp;
        bestIsBoss = !!e.isBoss;
        continue;
      }

      switch (priority) {
        case 'first':
          if (e.distance > bestDist) {
            best = e;
            bestDist = e.distance;
          }
          break;
        case 'last':
          if (e.distance < bestDist) {
            best = e;
            bestDist = e.distance;
          }
          break;
        case 'strongest':
          if (e.hp > bestHp) {
            best = e;
            bestHp = e.hp;
            bestDist = e.distance;
            bestIsBoss = !!e.isBoss;
          } else if (e.hp === bestHp) {
            if (e.isBoss && !bestIsBoss) {
              best = e;
              bestIsBoss = true;
              bestDist = e.distance;
            } else if (e.distance > bestDist) {
              best = e;
              bestDist = e.distance;
            }
          }
          break;
        case 'weakest':
          if (e.hp < bestHp) {
            best = e;
            bestHp = e.hp;
          }
          break;
        case 'nearest':
          if (dSq < bestDistSqFromTower) {
            best = e;
            bestDistSqFromTower = dSq;
          }
          break;
      }
    }

    return best;
  }

  /**
   * Path interpolation along list of 2D waypoints with zero array allocations per frame
   */
  public static evaluatePath(
    waypoints: { x: number; y: number }[],
    distance: number
  ): { x: number; y: number; angle: number; totalLength: number } {
    if (!waypoints || waypoints.length === 0) {
      return { x: 0, y: 0, angle: 0, totalLength: 0 };
    }

    const cache = this.getOrCreatePathCache(waypoints);
    const { segmentLengths, cumulativeDistances, totalLength } = cache;

    if (distance <= 0) {
      const p0 = waypoints[0];
      const p1 = waypoints[1] || p0;
      return { x: p0.x, y: p0.y, angle: Math.atan2(p1.y - p0.y, p1.x - p0.x), totalLength };
    }

    if (distance >= totalLength) {
      const pLast = waypoints[waypoints.length - 1];
      const pPrev = waypoints[waypoints.length - 2] || pLast;
      return { x: pLast.x, y: pLast.y, angle: Math.atan2(pLast.y - pPrev.y, pLast.x - pPrev.x), totalLength };
    }

    // Binary search or linear search through precomputed cumulative segments
    for (let i = 0; i < segmentLengths.length; i++) {
      const segStart = cumulativeDistances[i];
      const segEnd = cumulativeDistances[i + 1];

      if (distance <= segEnd) {
        const segLen = segmentLengths[i];
        const t = segLen > 0 ? (distance - segStart) / segLen : 0;
        const p0 = waypoints[i];
        const p1 = waypoints[i + 1];
        const x = p0.x + (p1.x - p0.x) * t;
        const y = p0.y + (p1.y - p0.y) * t;
        const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
        return { x, y, angle, totalLength };
      }
    }

    const last = waypoints[waypoints.length - 1];
    return { x: last.x, y: last.y, angle: 0, totalLength };
  }

  /**
   * Total length of waypoint path (cached)
   */
  public static getPathLength(waypoints: { x: number; y: number }[]): number {
    return this.getOrCreatePathCache(waypoints).totalLength;
  }
}
