import React, { useState } from 'react';
import { MAPS_DATA } from '../data/gameData';
import { MapId, CampaignLevel, EnemyArchetype, WaveDef } from '../types/game';
import { Infinity, Play, Trophy, X, ShieldAlert, ArrowRight } from 'lucide-react';
import { sound } from '../services/soundService';

interface EndlessModeModalProps {
  highScoreWaves: Record<string, number>;
  onLaunchEndless: (levelConfig: CampaignLevel) => void;
  onClose: () => void;
}

export const EndlessModeModal: React.FC<EndlessModeModalProps> = ({
  highScoreWaves,
  onLaunchEndless,
  onClose
}) => {
  const [selectedMapId, setSelectedMapId] = useState<MapId>('frontier_outpost');

  const mapList: { id: MapId; name: string; desc: string; danger: string }[] = [
    {
      id: 'frontier_outpost',
      name: 'Frontier Outpost',
      desc: 'Single winding pass through defensive ramparts. Recommended for endurance setups.',
      danger: 'Moderate'
    },
    {
      id: 'ashen_caldera',
      name: 'Ashen Caldera',
      desc: 'Dual-curve lava valley with tight choke-points for splash artillery.',
      danger: 'High'
    },
    {
      id: 'cold_hell_gate',
      name: 'Cold Hell Gate',
      desc: 'Direct abyssal breach with rapid transit paths and multiple boss rifts.',
      danger: 'Extreme'
    }
  ];

  const handleStart = () => {
    sound.playClick();
    const map = MAPS_DATA[selectedMapId];

    // Generate endless wave container with procedural wave generation
    // We will supply 100 endless waves that scale dynamically!
    const endlessWaves: WaveDef[] = Array.from({ length: 100 }, (_, i) => {
      const waveNum = i + 1;
      const hpMult = Math.pow(1.06, waveNum - 1);
      const spdMult = Math.min(1.6, 1.0 + (waveNum - 1) * 0.012);
      const isBoss = waveNum % 5 === 0;

      const mainEnemyType: EnemyArchetype = isBoss
        ? 'boss'
        : (waveNum % 3 === 0 ? 'armored' : (waveNum % 2 === 0 ? 'runner' : 'grunt'));

      return {
        waveIndex: i,
        title: isBoss ? `Wave ${waveNum}: Abyssal Incursion` : `Wave ${waveNum}`,
        groups: [
          {
            enemyType: mainEnemyType,
            count: isBoss ? Math.max(1, Math.floor(waveNum / 10)) : 6 + Math.floor(waveNum * 0.8),
            interval: Math.max(0.35, 1.0 - waveNum * 0.01),
            delay: 0,
            hpMult,
            speedMult: spdMult
          },
          ...(waveNum >= 3 ? [{
            enemyType: 'flyer' as EnemyArchetype,
            count: Math.floor(waveNum * 0.6),
            interval: 0.8,
            delay: 3,
            hpMult,
            speedMult: spdMult
          }] : [])
        ]
      };
    });

    const endlessLevel: CampaignLevel = {
      levelNumber: 999,
      title: `Endless: ${map.name}`,
      subtitle: 'Survive infinite Demonata breaches',
      mapId: selectedMapId,
      startingGold: 450,
      startingLives: 25,
      waves: endlessWaves,
      recommendedTowers: ['archer', 'cannon', 'frost', 'mage', 'tesla', 'obelisk'],
      storyIntro: 'The gates of Cold Hell have fractured completely. Demonic hordes pour without end. Hold the perimeter as long as reality endures.',
      storyOutro: 'The defensive line has fallen, but your stand is etched into the annals of the Citadel.'
    };

    onLaunchEndless(endlessLevel);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-purple-500/40 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.2)] p-6 text-slate-200 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center">
              <Infinity className="text-purple-400" size={22} />
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-white uppercase tracking-wider">
                Endless Abyss Mode
              </h2>
              <div className="text-xs text-purple-400 font-bold">
                Infinite Waves • Exponential Demon Escalation
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Map Selection */}
        <div className="my-4 space-y-2.5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Select Battlefield
          </div>
          {mapList.map(m => {
            const isSelected = selectedMapId === m.id;
            const highWave = highScoreWaves[m.id] || 0;

            return (
              <div
                key={m.id}
                onClick={() => setSelectedMapId(m.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-purple-950/40 border-purple-500 shadow-md ring-1 ring-purple-400'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{m.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-purple-300">
                      {m.danger}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{m.desc}</div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <div className="text-[10px] text-slate-400 uppercase flex items-center justify-end gap-1">
                    <Trophy size={11} className="text-yellow-400" /> Best Wave
                  </div>
                  <div className="font-mono font-bold text-sm text-yellow-300">
                    Wave {highWave}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Rules */}
        <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl text-xs text-slate-400 space-y-1 mb-5">
          <div className="flex items-center gap-1.5 text-purple-300 font-bold">
            <ShieldAlert size={14} /> Endless Escalation Rules
          </div>
          <p>• Enemies gain +6% Health and +1.5% Speed each wave without ceiling.</p>
          <p>• Bosses arrive every 5 waves accompanied by aerial skirmishers.</p>
          <p>• Full 5/2/0 specialization path rules apply.</p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleStart}
            className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play size={16} className="fill-white" />
            <span>Launch Endless Run</span>
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
