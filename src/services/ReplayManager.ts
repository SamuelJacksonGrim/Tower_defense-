import { BattleReplay, ReplayAction, ChallengeModifierId } from '../types/game';

const REPLAY_STORAGE_KEY = 'citadel_battle_replays';

export class ReplayManager {
  private currentReplay: BattleReplay | null = null;
  private isRecording = false;

  public startRecording(
    mapId: string,
    startingGold: number,
    startingLives: number,
    modifiers: ChallengeModifierId[] = [],
    levelNumber?: number,
    levelTitle?: string
  ): BattleReplay {
    const replay: BattleReplay = {
      version: 1,
      id: `replay_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      levelNumber,
      levelTitle,
      mapId,
      startingGold,
      startingLives,
      modifiers,
      actions: []
    };

    this.currentReplay = replay;
    this.isRecording = true;
    return replay;
  }

  public recordAction(action: ReplayAction) {
    if (!this.isRecording || !this.currentReplay) return;
    this.currentReplay.actions.push(action);
  }

  public stopRecording(stats?: BattleReplay['stats']): BattleReplay | null {
    if (!this.currentReplay) return null;
    this.isRecording = false;
    if (stats) {
      this.currentReplay.stats = stats;
    }
    this.saveReplay(this.currentReplay);
    const completed = this.currentReplay;
    this.currentReplay = null;
    return completed;
  }

  public getCurrentReplay(): BattleReplay | null {
    return this.currentReplay;
  }

  public saveReplay(replay: BattleReplay) {
    try {
      const list = this.getSavedReplays();
      // Keep up to 20 replays
      const updated = [replay, ...list.filter(r => r.id !== replay.id)].slice(0, 20);
      localStorage.setItem(REPLAY_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // storage quota exceeded or disabled
    }
  }

  public getSavedReplays(): BattleReplay[] {
    try {
      const raw = localStorage.getItem(REPLAY_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public getReplayById(id: string): BattleReplay | null {
    return this.getSavedReplays().find(r => r.id === id) || null;
  }

  public exportReplayJson(replay: BattleReplay): string {
    return JSON.stringify(replay, null, 2);
  }

  public importReplayJson(jsonStr: string): BattleReplay {
    const parsed = JSON.parse(jsonStr) as BattleReplay;
    if (!parsed.id || !parsed.mapId || !Array.isArray(parsed.actions)) {
      throw new Error('Invalid replay format: missing required fields');
    }
    this.saveReplay(parsed);
    return parsed;
  }
}

export const replayManager = new ReplayManager();
