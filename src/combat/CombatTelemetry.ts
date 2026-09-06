import { TowerType, EnemyArchetype } from '../types/game';

export type CombatEventType =
  | 'TowerPlaced'
  | 'TowerUpgraded'
  | 'TowerSold'
  | 'EnemySpawned'
  | 'EnemyKilled'
  | 'DamageDealt'
  | 'EnemyLeaked'
  | 'WaveStarted'
  | 'WaveCompleted';

export interface CombatEvent {
  id: string;
  type: CombatEventType;
  timestamp: number;
  wave: number;
  towerType?: TowerType;
  towerId?: string;
  enemyType?: EnemyArchetype;
  enemyId?: string;
  amount?: number;
  meta?: Record<string, unknown>;
}

export interface WaveTelemetrySummary {
  waveIndex: number;
  waveTitle: string;
  durationSec: number;
  totalDamage: number;
  totalKills: number;
  leaks: number;
  goldEarned: number;
  goldSpent: number;
  goldRefunded: number;
  towerDps: Record<string, number>;
  towerDamage: Record<string, number>;
  towerKills: Record<string, number>;
}

export class CombatTelemetry {
  private events: CombatEvent[] = [];
  private currentWave = 1;
  private waveStartTime = 0;
  private waveActive = false;
  private idCounter = 0;

  // Active wave aggregations
  public waveTotalDamage = 0;
  public waveTotalKills = 0;
  public waveLeaks = 0;
  public waveGoldEarned = 0;
  public waveGoldSpent = 0;
  public waveGoldRefunded = 0;
  public waveTowerDamage: Record<string, number> = {};
  public waveTowerKills: Record<string, number> = {};

  // Lifetime run aggregations
  public runTotalDamage = 0;
  public runTotalKills = 0;
  public runLeaks = 0;
  public runGoldEarned = 0;
  public runGoldSpent = 0;
  public runGoldRefunded = 0;
  public runTowerDamage: Record<string, number> = {};
  public runTowerKills: Record<string, number> = {};

  // History of completed waves
  public waveHistory: WaveTelemetrySummary[] = [];

  public logEvent(type: CombatEventType, payload: Partial<Omit<CombatEvent, 'id' | 'timestamp' | 'type' | 'wave'>>) {
    const event: CombatEvent = {
      id: `evt_${this.idCounter++}`,
      type,
      timestamp: performance.now(),
      wave: this.currentWave,
      ...payload
    };

    // Keep memory bounded to recent 600 events
    if (this.events.length > 600) {
      this.events.shift();
    }
    this.events.push(event);

    // Update aggregations
    switch (type) {
      case 'DamageDealt': {
        const amt = payload.amount || 0;
        this.waveTotalDamage += amt;
        this.runTotalDamage += amt;
        if (payload.towerType) {
          this.waveTowerDamage[payload.towerType] = (this.waveTowerDamage[payload.towerType] || 0) + amt;
          this.runTowerDamage[payload.towerType] = (this.runTowerDamage[payload.towerType] || 0) + amt;
        }
        break;
      }
      case 'EnemyKilled': {
        this.waveTotalKills++;
        this.runTotalKills++;
        if (payload.towerType) {
          this.waveTowerKills[payload.towerType] = (this.waveTowerKills[payload.towerType] || 0) + 1;
          this.runTowerKills[payload.towerType] = (this.runTowerKills[payload.towerType] || 0) + 1;
        }
        break;
      }
      case 'EnemyLeaked': {
        this.waveLeaks++;
        this.runLeaks++;
        break;
      }
      case 'TowerPlaced':
      case 'TowerUpgraded': {
        const cost = payload.amount || 0;
        this.waveGoldSpent += cost;
        this.runGoldSpent += cost;
        break;
      }
      case 'TowerSold': {
        const refund = payload.amount || 0;
        this.waveGoldRefunded += refund;
        this.runGoldRefunded += refund;
        this.waveGoldEarned += refund;
        this.runGoldEarned += refund;
        break;
      }
    }
  }

  public onWaveStarted(waveIndex: number, waveTitle: string) {
    this.currentWave = waveIndex;
    this.waveStartTime = performance.now();
    this.waveActive = true;

    // Reset wave stats
    this.waveTotalDamage = 0;
    this.waveTotalKills = 0;
    this.waveLeaks = 0;
    this.waveGoldEarned = 0;
    this.waveGoldSpent = 0;
    this.waveGoldRefunded = 0;
    this.waveTowerDamage = {};
    this.waveTowerKills = {};

    this.logEvent('WaveStarted', { meta: { waveTitle } });
  }

  public onWaveCompleted(waveIndex: number, waveTitle: string): WaveTelemetrySummary {
    const durationSec = Math.max(1, (performance.now() - this.waveStartTime) / 1000);
    this.waveActive = false;

    // Calculate DPS per tower
    const towerDps: Record<string, number> = {};
    for (const [tType, dmg] of Object.entries(this.waveTowerDamage)) {
      towerDps[tType] = Math.round(dmg / durationSec);
    }

    const summary: WaveTelemetrySummary = {
      waveIndex,
      waveTitle,
      durationSec: Math.round(durationSec * 10) / 10,
      totalDamage: this.waveTotalDamage,
      totalKills: this.waveTotalKills,
      leaks: this.waveLeaks,
      goldEarned: this.waveGoldEarned,
      goldSpent: this.waveGoldSpent,
      goldRefunded: this.waveGoldRefunded,
      towerDps,
      towerDamage: { ...this.waveTowerDamage },
      towerKills: { ...this.waveTowerKills }
    };

    this.waveHistory.push(summary);
    this.logEvent('WaveCompleted', { meta: { summary } });
    return summary;
  }

  public getCurrentWaveDuration(): number {
    if (!this.waveActive) return 0;
    return (performance.now() - this.waveStartTime) / 1000;
  }

  public getCurrentWaveDps(): Record<string, number> {
    const dur = Math.max(1, this.getCurrentWaveDuration());
    const dps: Record<string, number> = {};
    for (const [tType, dmg] of Object.entries(this.waveTowerDamage)) {
      dps[tType] = Math.round(dmg / dur);
    }
    return dps;
  }

  public getRecentEvents(count = 20): CombatEvent[] {
    return this.events.slice(-count);
  }

  public reset() {
    this.events = [];
    this.currentWave = 1;
    this.waveTotalDamage = 0;
    this.waveTotalKills = 0;
    this.waveLeaks = 0;
    this.waveGoldEarned = 0;
    this.waveGoldSpent = 0;
    this.waveTowerDamage = {};
    this.waveTowerKills = {};
    this.runTotalDamage = 0;
    this.runTotalKills = 0;
    this.runLeaks = 0;
    this.runGoldEarned = 0;
    this.runGoldSpent = 0;
    this.runTowerDamage = {};
    this.runTowerKills = {};
    this.waveHistory = [];
  }
}
