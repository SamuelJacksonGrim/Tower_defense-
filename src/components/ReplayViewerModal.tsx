import React, { useState } from 'react';
import { BattleReplay, ReplayAction } from '../types/game';
import { replayManager } from '../services/ReplayManager';
import { MAPS, TOWERS_DATA } from '../data/gameData';
import {
  X,
  History,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Copy,
  Check,
  Film,
  Calendar,
  Layers,
  ChevronRight,
  Shield,
  Coins
} from 'lucide-react';

interface ReplayViewerModalProps {
  onClose: () => void;
  onLoadReplayInGame?: (replay: BattleReplay) => void;
}

export const ReplayViewerModal: React.FC<ReplayViewerModalProps> = ({
  onClose,
  onLoadReplayInGame
}) => {
  const [replays, setReplays] = useState<BattleReplay[]>(() => replayManager.getSavedReplays());
  const [selectedReplay, setSelectedReplay] = useState<BattleReplay | null>(() => (replays[0] || null));
  const [copied, setCopied] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');

  const handleCopyJson = () => {
    if (!selectedReplay) return;
    navigator.clipboard.writeText(replayManager.exportReplayJson(selectedReplay));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    try {
      setImportError('');
      const replay = replayManager.importReplayJson(importJsonText);
      const updated = replayManager.getSavedReplays();
      setReplays(updated);
      setSelectedReplay(replay);
      setIsImporting(false);
      setImportJsonText('');
    } catch (e: any) {
      setImportError(e.message || 'Failed to parse replay file.');
    }
  };

  const formatAction = (act: ReplayAction) => {
    const sec = (act.tick / 60).toFixed(1);
    switch (act.type) {
      case 'place_tower':
        return `Placed ${act.towerType ? TOWERS_DATA[act.towerType]?.name || act.towerType : 'Tower'} in Slot #${(act.slotIndex ?? 0) + 1}`;
      case 'upgrade_path':
        return `Upgraded Path ${(act.pathIndex ?? 0) + 1} on Tower Slot #${(act.slotIndex ?? 0) + 1}`;
      case 'sell_tower':
        return `Sold Tower in Slot #${(act.slotIndex ?? 0) + 1}`;
      case 'set_priority':
        return `Changed Priority to ${act.priority} on Slot #${(act.slotIndex ?? 0) + 1}`;
      case 'start_wave':
        return `Initiated Wave ${(act.waveIndex ?? 0) + 1}`;
      case 'set_speed':
        return `Switched Game Speed to ${act.speed}x`;
      default:
        return act.type;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in text-slate-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold">
              <Film size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-white">Battle Recording & Replay Theater</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Deterministic v1
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Review tick-by-tick combat action logs, export deterministic seed runs, or share battle histories.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImporting(!isImporting)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 cursor-pointer"
            >
              <Upload size={14} />
              <span>Import</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Import Drawer */}
        {isImporting && (
          <div className="p-4 bg-slate-950/95 border-b border-slate-800 space-y-3 shrink-0">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Paste Replay JSON Code</div>
            <textarea
              value={importJsonText}
              onChange={e => setImportJsonText(e.target.value)}
              placeholder='{"version": 1, "id": "replay_...", "actions": [...]}'
              className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
            {importError && <div className="text-xs text-rose-400 font-mono">⚠️ {importError}</div>}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsImporting(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-1.5 rounded-lg bg-amber-600 text-xs font-bold text-white hover:bg-amber-500 cursor-pointer"
              >
                Verify & Load Replay
              </button>
            </div>
          </div>
        )}

        {/* Master-Detail Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Replays List */}
          <div className="w-1/3 border-r border-slate-800 bg-slate-950/40 overflow-y-auto custom-scrollbar p-3 space-y-2">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-1">
              Saved Engagements ({replays.length})
            </div>
            {replays.length === 0 ? (
              <div className="text-center p-6 text-slate-500 text-xs italic">
                No battles recorded yet. Play any campaign mission or daily challenge to record deterministic replays automatically.
              </div>
            ) : (
              replays.map(r => {
                const isSelected = selectedReplay?.id === r.id;
                const mapDef = MAPS[r.mapId];
                const dateStr = new Date(r.timestamp).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedReplay(r)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 shadow-md text-white'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs truncate">
                        {r.levelTitle || mapDef?.name || 'Tactical Trial'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{r.actions.length} cmds</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{dateStr}</span>
                      {r.stats && (
                        <span className="text-emerald-400 font-mono font-bold">
                          Wave {r.stats.wavesCleared}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: Selected Replay Details & Timeline */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/60 p-4 space-y-4">
            {selectedReplay ? (
              <>
                {/* Replay Details Card */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-3 shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-white">
                        {selectedReplay.levelTitle || MAPS[selectedReplay.mapId]?.name || 'Mission Replay'}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>Map: {MAPS[selectedReplay.mapId]?.name}</span>
                        <span>•</span>
                        <span>Starting: {selectedReplay.startingGold}g</span>
                        <span>•</span>
                        <span>{selectedReplay.startingLives} Lives</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyJson}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 cursor-pointer"
                      >
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                      </button>
                    </div>
                  </div>

                  {selectedReplay.stats && (
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-center font-mono text-xs">
                      <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                        <div className="text-[9px] text-slate-400 font-sans uppercase">Waves</div>
                        <div className="font-bold text-white">{selectedReplay.stats.wavesCleared}</div>
                      </div>
                      <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                        <div className="text-[9px] text-slate-400 font-sans uppercase">Damage</div>
                        <div className="font-bold text-emerald-400">{selectedReplay.stats.totalDamage.toLocaleString()}</div>
                      </div>
                      <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                        <div className="text-[9px] text-slate-400 font-sans uppercase">Slain</div>
                        <div className="font-bold text-sky-400">{selectedReplay.stats.demonsSlain}</div>
                      </div>
                      <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                        <div className="text-[9px] text-slate-400 font-sans uppercase">Total Time</div>
                        <div className="font-bold text-amber-400">
                          {(selectedReplay.stats.totalTicks / 60).toFixed(1)}s
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Replay Actions Timeline */}
                <div className="flex-1 flex flex-col min-h-0 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <History size={14} className="text-amber-400" /> Command Stream Timeline ({selectedReplay.actions.length} Events)
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">60 ticks / sec</span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1.5 pt-2 pr-1 custom-scrollbar text-xs">
                    {selectedReplay.actions.length === 0 ? (
                      <div className="text-slate-500 italic p-4 text-center">
                        No tactical actions were logged in this engagement.
                      </div>
                    ) : (
                      selectedReplay.actions.map((act, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-slate-700"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-amber-400/90 w-14 shrink-0">
                              {(act.tick / 60).toFixed(1)}s
                            </span>
                            <span className="text-slate-200">{formatAction(act)}</span>
                          </div>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                            tick {act.tick}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-xs italic">
                Select a replay to review tactical decisions and event timelines.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
