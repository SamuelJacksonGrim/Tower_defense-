import { PlacedTower, BuildAnalysis, SynergyNotice } from '../types/game';
import { TOWERS_DATA } from '../data/gameData';

export class BuildAnalyzer {
  public static analyze(towers: PlacedTower[]): BuildAnalysis {
    const composition: Record<string, number> = {};
    for (const t of towers) {
      const def = TOWERS_DATA[t.type];
      const name = def?.name || t.type;
      composition[name] = (composition[name] || 0) + 1;
    }

    if (towers.length === 0) {
      return {
        composition: {},
        synergies: [],
        weaknesses: ['No defenses deployed yet.'],
        recommendations: ['Deploy a frontline Archer or Cannon near the first road bend.']
      };
    }

    const typeCounts: Record<string, number> = {};
    let totalTowers = towers.length;
    let antiAirCount = 0;
    let magicCount = 0;
    let aoeCount = 0;
    let controlCount = 0;
    let highArmorPiercingCount = 0;

    for (const t of towers) {
      typeCounts[t.type] = (typeCounts[t.type] || 0) + 1;
      const def = TOWERS_DATA[t.type];
      if (!def) continue;

      if (def.canTargetAir) antiAirCount++;
      if (def.damageType === 'magic' || def.damageType === 'lightning' || def.damageType === 'fire') magicCount++;
      if (def.splashRadius || def.chainCount || def.isConeFlamethrower || t.type === 'mortar' || t.type === 'tesla' || t.type === 'meteor') aoeCount++;
      if (def.slowPercent || t.type === 'frost' || t.type === 'gravity_well' || t.type === 'temporal') controlCount++;
      if (def.basePierce > 0 || def.damageType === 'true' || t.type === 'ballista' || t.type === 'obelisk' || t.type === 'alchemist') {
        highArmorPiercingCount++;
      }
    }

    // --- SYNERGY DETECTION ---
    const synergies: SynergyNotice[] = [];

    // 1. Freeze -> Shatter (Frost + heavy physical)
    const hasFrost = (typeCounts['frost'] || 0) > 0;
    const hasPhysicalHeavy = (typeCounts['cannon'] || 0) > 0 || (typeCounts['mortar'] || 0) > 0 || (typeCounts['ballista'] || 0) > 0 || (typeCounts['gatling'] || 0) > 0;
    if (hasFrost && hasPhysicalHeavy) {
      synergies.push({
        name: 'Freeze → Shatter',
        rating: 'HIGH',
        description: 'Physical impacts against frozen demons trigger +60% bonus shatter damage in an area.'
      });
    }

    // 2. Mark -> Execute (Ballista / Sharpshot Archer + Obelisk or heavy executioner)
    const hasMarker = (typeCounts['ballista'] || 0) > 0 || (typeCounts['archer'] || 0) > 0;
    const hasExecutor = (typeCounts['obelisk'] || 0) > 0 || (typeCounts['ballista'] || 0) > 0 || (typeCounts['cannon'] || 0) > 0;
    if (hasMarker && hasExecutor) {
      synergies.push({
        name: 'Mark → Execute',
        rating: 'HIGH',
        description: 'Snipers mark targets for +35% vulnerability, triggering fatal execute bursts on high-health demons.'
      });
    }

    // 3. Burn -> Ignite (Flamethrower / Meteor + fast cadence)
    const hasFire = (typeCounts['flamethrower'] || 0) > 0 || (typeCounts['meteor'] || 0) > 0;
    const hasCadence = (typeCounts['gatling'] || 0) > 0 || (typeCounts['archer'] || 0) > 0 || (typeCounts['tesla'] || 0) > 0;
    if (hasFire && hasCadence) {
      synergies.push({
        name: 'Burn → Ignite',
        rating: 'HIGH',
        description: 'Continuous flames prime enemies; rapid hits spark fiery explosions dealing true damage.'
      });
    }

    // 4. Poison -> Contaminate (Poison / Alchemist + AOE Mortar/Tesla)
    const hasPoison = (typeCounts['poison'] || 0) > 0 || (typeCounts['alchemist'] || 0) > 0;
    if (hasPoison && aoeCount > 0) {
      synergies.push({
        name: 'Poison → Contaminate',
        rating: 'HIGH',
        description: 'Toxic debuffs detonate on death or area impact, splashing acidic blight to nearby ranks.'
      });
    }

    // 5. Support Force Multiplier (Banner / Obsidian Idol / Temporal + Fleet)
    const hasSupport = (typeCounts['banner'] || 0) > 0 || (typeCounts['obsidian_idol'] || 0) > 0 || (typeCounts['temporal'] || 0) > 0;
    if (hasSupport && totalTowers >= 4) {
      synergies.push({
        name: 'Aura Force Multiplier',
        rating: 'MEDIUM',
        description: 'Command auras boost attack cadence and damage output across adjacent batteries.'
      });
    }

    // 6. Siphon Resonance (Tesla + Obelisk)
    if ((typeCounts['tesla'] || 0) > 0 && (typeCounts['obelisk'] || 0) > 0) {
      synergies.push({
        name: 'Ionic Overcharge',
        rating: 'MEDIUM',
        description: 'Chain lightning ionizes demons, increasing thermal beam ramp acceleration.'
      });
    }

    // --- WEAKNESS ANALYSIS ---
    const weaknesses: string[] = [];

    // Anti-Air check
    if (antiAirCount === 0) {
      weaknesses.push('No anti-air coverage (vulnerable to aerial Soot Wings)');
    } else if (antiAirCount / totalTowers < 0.25) {
      weaknesses.push('Low anti-air density (risk of air leaks on flying waves)');
    }

    // Armor penetration / Magic check
    if (magicCount === 0 && highArmorPiercingCount === 0) {
      weaknesses.push('Poor armor penetration & magic damage (high-armor Slag Plates will absorb fire)');
    }

    // AOE / Swarm check
    if (aoeCount === 0) {
      weaknesses.push('Heavy investment in single-target DPS (lacks swarm clear)');
    }

    // Crowd Control check
    if (controlCount === 0) {
      weaknesses.push('No speed control or displacement (fast Cinder Skitters may sprint past)');
    }

    // --- RECOMMENDATIONS (Derived from game rules) ---
    const recommendations: string[] = [];

    if (antiAirCount === 0 || antiAirCount / totalTowers < 0.25) {
      recommendations.push('Deploy Ballista or Archer Arbor to secure anti-air airspace.');
    }
    if (aoeCount === 0) {
      recommendations.push('Add Tesla or Mortar artillery to counter dense demon swarms.');
    }
    if (magicCount === 0 && highArmorPiercingCount === 0) {
      recommendations.push('Add Mage Tower or Alchemist to melt armored targets with energy.');
    }
    if (controlCount === 0) {
      recommendations.push('Place Frost Prism or Gravity Well at choke points to double weapon uptime.');
    }
    if (synergies.length === 0 && totalTowers >= 3) {
      recommendations.push('Pair Frost with Cannon or Mortar to unlock Freeze → Shatter synergy.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Balanced tactical composition. Focus gold into Tier 4/5 specialization upgrades.');
    }

    return {
      composition,
      synergies,
      weaknesses,
      recommendations
    };
  }
}
