import { TowerDef, EnemyDef, MapDef, CampaignLevel, DailyBounty, TechNode, LoginReward } from '../types/game';

// Tower Corpus definitions
export const TOWERS_DATA: Record<string, TowerDef> = {
  archer: {
    type: 'archer',
    name: 'Archer Arbor',
    role: 'Reliable Single-Target DPS',
    description: 'Fast, dependable physical arrows. Baseline backbone against lightly armored demonata.',
    baseCost: 70,
    baseDamage: 8,
    baseFireRate: 1.67,
    baseRange: 140,
    basePierce: 0,
    damageType: 'physical',
    defaultPriority: 'first',
    canTargetAir: true,
    canTargetGround: true,
    color: '#10b981',
    accentColor: '#34d399',
    tacticalRole: 'BURST DPS',
    strongAgainst: ['Cinder Skitter', 'Soot Wing', 'Ash Raider'],
    weakAgainst: ['Slag Plate', 'Dense Swarms'],
    synergies: ['Frost Prism slow clumps targets for Sharpshot crits', 'Damage Amplification Auras'],
    paths: [
      {
        name: 'Rapidfire',
        description: 'Increases arrow frequency to ridiculous speeds.',
        tiers: [
          { name: 'Scout String', cost: 45, description: '+15% Attack Speed', statMods: { fireRate: 1.95 } },
          { name: 'Twin Draw', cost: 85, description: '+25% Attack Speed, +2 Damage', statMods: { fireRate: 2.3, damage: 10 } },
          { name: 'Recurve Bow', cost: 140, description: '+35% Attack Speed, +4 Damage', statMods: { fireRate: 3.1, damage: 14 } },
          { name: 'Quickbow Nest', cost: 220, description: 'High-cadence mechanical burst (4.55/s).', statMods: { fireRate: 4.55, damage: 16 } },
          { name: 'Hurricane Rig', cost: 380, description: 'Dual-String Stream: Fires two arrows simultaneously at 8.33/s.', statMods: { fireRate: 8.33, damage: 22, range: 190 }, specialMechanic: 'Dual Arrow Stream' }
        ]
      },
      {
        name: 'Sharpshot',
        description: 'Heavy critical strikes and armor bypass.',
        tiers: [
          { name: 'Broadhead', cost: 50, description: '+4 Damage, +10 Range', statMods: { damage: 12, range: 150 } },
          { name: 'Precision Sight', cost: 95, description: '+10% Crit Chance (2x Damage)', statMods: { damage: 18, critChance: 0.15, critMult: 2.0 } },
          { name: 'Eagle Eye', cost: 160, description: '+20% Crit Chance, +30 Range', statMods: { damage: 28, critChance: 0.25, critMult: 2.2, range: 180 } },
          { name: 'Deadeye Spire', cost: 250, description: 'Precision Strike: +15% Crit Chance for 2.5x critical damage.', statMods: { damage: 52, critChance: 0.35, critMult: 2.5, range: 200 } },
          { name: 'Eagle-Eye Keep', cost: 420, description: 'Arterial Puncture: +35% Crit. Crits inflict 30% armor-ignoring bleed.', statMods: { damage: 110, critChance: 0.50, critMult: 3.0, range: 248, bleedDps: 35 }, specialMechanic: 'Arterial Bleed' }
        ]
      },
      {
        name: 'Volley',
        description: 'Multi-target coverage against clusters.',
        tiers: [
          { name: 'Fletched Quiver', cost: 45, description: '+10 Range, +2 Damage', statMods: { damage: 10, range: 150 } },
          { name: 'Split Shot', cost: 90, description: 'Every 5th arrow fires 2 arrows', statMods: { damage: 14 } },
          { name: 'Arrow Fan', cost: 155, description: 'Fires 2 arrows simultaneously', statMods: { damage: 20, fireRate: 1.8 } },
          { name: 'Marksman Cluster', cost: 240, description: 'Triple Salvo: Every 4th attack fires a 3-arrow fan hitting 3 enemies.', statMods: { damage: 26, fireRate: 2.0 } },
          { name: 'Arrow Storm Citadel', cost: 450, description: 'Endless Salvo: Fires 6 arrows in an arc. Hits have 25% chance to instant reset.', statMods: { damage: 45, fireRate: 2.2, range: 190 }, specialMechanic: 'Endless Salvo 6-Arrow' }
        ]
      }
    ]
  },

  cannon: {
    type: 'cannon',
    name: 'Field Cannon',
    role: 'Splash AoE / Anti-Swarm',
    description: 'Fires heavy explosive ordnance to pulverize dense formations of ground demonata.',
    baseCost: 125,
    baseDamage: 28,
    baseFireRate: 0.40,
    baseRange: 152,
    basePierce: 3,
    damageType: 'physical',
    defaultPriority: 'first',
    canTargetAir: false,
    canTargetGround: true,
    splashRadius: 60,
    splashRatio: 0.55,
    color: '#f97316',
    accentColor: '#fb923c',
    tacticalRole: 'AOE SPLASH',
    strongAgainst: ['Ember Mite', 'Ash Raider', 'Ash Fiend (Splitter)'],
    weakAgainst: ['Soot Wing (Air)', 'Cinder Skitter (Speed)'],
    synergies: ['Pair with Frost Prism to group enemies in blast radius', 'Slag fragmentation shreds armor for physical DPS'],
    paths: [
      {
        name: 'Shrapnel',
        description: 'Detonation emits high-velocity metallic fragments.',
        tiers: [
          { name: 'Rough Cast', cost: 65, description: '+8 Damage, +5 Splash Radius', statMods: { damage: 36, splashRadius: 65 } },
          { name: 'Iron Slag', cost: 110, description: '+16 Damage, +10 Splash Radius', statMods: { damage: 52, splashRadius: 75 } },
          { name: 'Heavy Shells', cost: 175, description: '+30 Damage, emits 3 small shrapnel pellets', statMods: { damage: 70, splashRadius: 85 } },
          { name: 'Shrapnel Cannon', cost: 320, description: 'Fragmentation: Main blast emits 6 high-speed shrapnel shards.', statMods: { damage: 85, splashRadius: 95 } },
          { name: 'Fragment Storm Battery', cost: 540, description: 'Razor Rain: Emits 12 fragments (35 dmg each) that permanently shred 5% armor.', statMods: { damage: 135, splashRadius: 110 }, specialMechanic: 'Razor Rain Shrapnel' }
        ]
      },
      {
        name: 'High-Explosive',
        description: 'Expansive blast radius and zero damage falloff.',
        tiers: [
          { name: 'Black Powder', cost: 70, description: '+15% Blast Radius, +10 Damage', statMods: { damage: 38, splashRadius: 70 } },
          { name: 'Reinforced Barrel', cost: 120, description: '+25% Blast Radius, +20 Damage', statMods: { damage: 58, splashRadius: 85 } },
          { name: 'Heavy Mortar Tube', cost: 180, description: '+40% Blast Radius, +35 Damage', statMods: { damage: 80, splashRadius: 100 } },
          { name: 'Powder Charge Emplacement', cost: 310, description: '+50% Blast Radius (120px) with 120 impact damage.', statMods: { damage: 120, splashRadius: 120 } },
          { name: 'Cataclysm Mortar', cost: 520, description: 'Zero-Falloff Detonation: Huge blast zone deals 100% full damage to edges.', statMods: { damage: 210, splashRadius: 160, splashRatio: 1.0 }, specialMechanic: 'Zero Falloff Mega Blast' }
        ]
      },
      {
        name: 'Cluster Bomb',
        description: 'Secondary bomblets scatter across the path.',
        tiers: [
          { name: 'Pack Powder', cost: 75, description: '+10 Damage, +10 Range', statMods: { damage: 38, range: 165 } },
          { name: 'Dual Shells', cost: 130, description: '+20 Damage, drops 1 small bomblet', statMods: { damage: 60 } },
          { name: 'Ordnance Loader', cost: 200, description: '+35 Damage, drops 2 bomblets', statMods: { damage: 90 } },
          { name: 'Ordnance Battery', cost: 350, description: 'Sub-Munitions: Primary shell spawns 3 cluster bomblets on impact.', statMods: { damage: 105 } },
          { name: 'Carpet Bombardier', cost: 580, description: 'Saturated Bombardment: 5 secondary bomblets (65 dmg) with 0.5s stun.', statMods: { damage: 155, splashRadius: 110 }, specialMechanic: 'Carpet Stun Bomblets' }
        ]
      }
    ]
  },

  frost: {
    type: 'frost',
    name: 'Frost Prism',
    role: 'Slow / Control / Tempo Manipulation',
    description: 'Chills invading demons with extreme cold. Hard global slow cap is 80%.',
    baseCost: 90,
    baseDamage: 6,
    baseFireRate: 0.83,
    baseRange: 140,
    basePierce: 0,
    damageType: 'cold',
    defaultPriority: 'first',
    canTargetAir: true,
    canTargetGround: true,
    slowPercent: 0.25,
    slowDuration: 3.0,
    color: '#06b6d4',
    accentColor: '#67e8f9',
    tacticalRole: 'CONTROL',
    strongAgainst: ['Cinder Skitter', 'Ember Mite clusters', 'Ash Fiend'],
    weakAgainst: ['Kiln Colossus (50% CC resistance)', 'Magic-immune shields'],
    synergies: ['Shatter Vulnerability makes frozen demons take +40% physical damage', 'Delays runners inside artillery zones'],
    paths: [
      {
        name: 'Deep Freeze',
        description: 'Freezes demons solid, halting movement completely.',
        tiers: [
          { name: 'Hoarfrost', cost: 50, description: 'Slow increased to 30%', statMods: { slowPercent: 0.30, damage: 8 } },
          { name: 'Cryo Chamber', cost: 95, description: 'Slow increased to 35%, duration 3.5s', statMods: { slowPercent: 0.35, slowDuration: 3.5, damage: 14 } },
          { name: 'Sub-Zero Core', cost: 150, description: 'Slow increased to 45%, +10 Damage', statMods: { slowPercent: 0.45, damage: 25 } },
          { name: 'Permafrost Emitter', cost: 260, description: 'Crystalline Stasis: 4 consecutive hits freeze target solid for 2.0s.', statMods: { damage: 45, slowPercent: 0.55 } },
          { name: 'Absolute Zero', cost: 470, description: 'Shatter Vulnerability: Frozen targets take +40% physical damage. Shatters on death.', statMods: { damage: 85, range: 200 }, specialMechanic: 'Shatter Nova 100 Cold Dmg' }
        ]
      },
      {
        name: 'Cold Aura',
        description: 'Continuous passive chill field slowing all nearby creeps.',
        tiers: [
          { name: 'Chilling Mist', cost: 55, description: 'Slow duration +1s, +5 Damage', statMods: { slowDuration: 4.0, damage: 10 } },
          { name: 'Glacial Wind', cost: 105, description: 'Adds small 80px pulse slowing all creeps by 20%', statMods: { damage: 16 } },
          { name: 'Arctic Shroud', cost: 165, description: 'Pulse expands to 110px, 25% slow', statMods: { damage: 24 } },
          { name: 'Blizzard Engine', cost: 280, description: 'Continuous 120px passive blizzard: 35% slow + 15 cold damage/s.', statMods: { damage: 32 } },
          { name: 'Cryo Domain', cost: 500, description: 'Hypothermic Accumulation: 168px aura, 55% slow. Units staying >4s lose 5% speed/s.', statMods: { damage: 55 }, specialMechanic: 'Deep Cryo Accumulation' }
        ]
      },
      {
        name: 'Ice Lance',
        description: 'Heavy piercing frozen javelins combining damage and control.',
        tiers: [
          { name: 'Frost Shard', cost: 55, description: '+6 Damage, +15 Range', statMods: { damage: 12, range: 155 } },
          { name: 'Hardened Ice', cost: 100, description: '+14 Damage, +25 Range', statMods: { damage: 22, range: 170 } },
          { name: 'Piercing Spike', cost: 160, description: 'Pierces 1 enemy, 35% slow', statMods: { damage: 40, pierce: 1, range: 185 } },
          { name: 'Glacial Lance Spire', cost: 270, description: 'Heavy projectile dealing 75 cold damage, applying 40% slow for 4s.', statMods: { damage: 75, range: 200 } },
          { name: 'Frostbite Cannon', cost: 480, description: 'Pierces 3 enemies in line, applying 60% slow and 30 cold dot/s for 4s.', statMods: { damage: 160, pierce: 3, range: 220 }, specialMechanic: 'Piercing Frost Lance' }
        ]
      }
    ]
  },

  mage: {
    type: 'mage',
    name: 'Mage Tower',
    role: 'Armor-Piercing DPS / Armored Counter',
    description: 'Harnesses raw arcane energy to disintegrate armored demon carapace, ignoring physical armor.',
    baseCost: 100,
    baseDamage: 25,
    baseFireRate: 0.67,
    baseRange: 152,
    basePierce: 8,
    damageType: 'magic',
    defaultPriority: 'strongest',
    canTargetAir: true,
    canTargetGround: true,
    color: '#8b5cf6',
    accentColor: '#a78bfa',
    paths: [
      {
        name: 'Arcane Bolt',
        description: 'Concentrated beam piercing through multiple armored creeps.',
        tiers: [
          { name: 'Infused Gem', cost: 60, description: '+8 Magic Damage', statMods: { damage: 33 } },
          { name: 'Arcane Focus', cost: 110, description: '+18 Magic Damage, +10 Range', statMods: { damage: 45, range: 165 } },
          { name: 'Rift Lance', cost: 175, description: '+35 Magic Damage, pierces 1 target', statMods: { damage: 65, pierce: 1 } },
          { name: 'Focused Beam Tower', cost: 280, description: 'Linear Pierce: Arcane bolt pierces through up to 3 inline creeps.', statMods: { damage: 130, pierce: 3 } },
          { name: 'Reality Cutter', cost: 490, description: 'Dimensional Dissection: Pierces infinite targets along vector, +15% magic vulnerability.', statMods: { damage: 245, pierce: 99, range: 200 }, specialMechanic: 'Dimensional Reality Cutter' }
        ]
      },
      {
        name: 'Mana Surge',
        description: 'Accelerating attack speed with continuous spell casting.',
        tiers: [
          { name: 'Mana Flow', cost: 60, description: '+15% Attack Speed', statMods: { fireRate: 0.77 } },
          { name: 'Aether Conduit', cost: 110, description: '+30% Attack Speed, +8 Damage', statMods: { fireRate: 0.95, damage: 35 } },
          { name: 'Spell Dynamo', cost: 170, description: '+50% Attack Speed, +15 Damage', statMods: { fireRate: 1.15, damage: 48 } },
          { name: 'Conduit Node', cost: 270, description: 'Rapid cadence (1.33/s) with 62 magic damage.', statMods: { fireRate: 1.33, damage: 62 } },
          { name: 'Archmage Siphon', cost: 480, description: 'Resonant Speed: Each consecutive attack adds +15% speed (up to +120% total).', statMods: { damage: 105, fireRate: 1.6 }, specialMechanic: 'Resonant Mana Acceleration' }
        ]
      },
      {
        name: 'Spellshock',
        description: 'Disrupts and micro-stuns high-threat demons.',
        tiers: [
          { name: 'Shock Spark', cost: 65, description: '+10 Damage, 10% mini-stun (0.4s)', statMods: { damage: 35 } },
          { name: 'Chaos Spark', cost: 120, description: '+20 Damage, 15% mini-stun (0.6s)', statMods: { damage: 55 } },
          { name: 'Static Warp', cost: 185, description: '+35 Damage, 20% stun (0.8s)', statMods: { damage: 80 } },
          { name: 'Disruptor Spire', cost: 310, description: 'Arcane Micro-Stun: 20% chance on hit to impart 1.0s hard stun.', statMods: { damage: 110, fireRate: 0.83 } },
          { name: 'Temporal Shockwave', cost: 540, description: 'Chain Disruption: 35% stun proc. Releases an arcane shockwave in 80px radius.', statMods: { damage: 190, range: 180 }, specialMechanic: 'Chain Disruption Shockwave' }
        ]
      }
    ]
  },

  ballista: {
    type: 'ballista',
    name: 'Skystriker Ballista',
    role: 'Anti-Air / High-Impact Aerial Executioner',
    description: 'Long-range heavy siege ballista designed specifically to swat airborne Soot Wings and flyers out of the sky.',
    baseCost: 105,
    baseDamage: 75,
    baseFireRate: 0.55,
    baseRange: 220,
    basePierce: 4,
    damageType: 'physical',
    defaultPriority: 'first',
    canTargetAir: true,
    canTargetGround: false,
    onlyAir: true,
    color: '#0284c7',
    accentColor: '#38bdf8',
    paths: [
      {
        name: 'Skybreaker',
        description: 'Overwhelming physical damage against aerial threats.',
        tiers: [
          { name: 'Steel Harpoon', cost: 65, description: '+35 Damage to air', statMods: { damage: 110 } },
          { name: 'Reinforced Winch', cost: 115, description: '+70 Damage, +20 Range', statMods: { damage: 155, range: 240 } },
          { name: 'Sky Hunter', cost: 180, description: '+120 Damage, +40 Range', statMods: { damage: 215, range: 260 } },
          { name: 'Anti-Air Battery', cost: 290, description: 'Aviation Bane: +150% bonus damage against all flying units.', statMods: { damage: 375, range: 280 } },
          { name: 'Zenith Cleaver', cost: 500, description: 'Sky Cleave: +300% bonus vs flying. Harpoons pierce 2 flying units in line.', statMods: { damage: 670, pierce: 6, range: 340 }, specialMechanic: 'Zenith Sky Cleaver Pierce' }
        ]
      },
      {
        name: 'Harpoon Tether',
        description: 'Tethers flyers and physically pulls them down to ground.',
        tiers: [
          { name: 'Barbed Hook', cost: 70, description: '+20 Damage, slows air targets by 20%', statMods: { damage: 95 } },
          { name: 'Cable Winch', cost: 120, description: '+45 Damage, 35% slow on air targets', statMods: { damage: 140 } },
          { name: 'Ground Spike', cost: 190, description: '+80 Damage, grounds flyers for 2.0s', statMods: { damage: 200 } },
          { name: 'Grounding Tether', cost: 310, description: 'Drag-Down: Harpoons pull flying targets to ground for 4.0s for ground towers.', statMods: { damage: 260 } },
          { name: 'Gravity Winch Citadel', cost: 530, description: 'Permanent Grounding: Slams flyers into track (200 dmg, 2.5s stun) permanently grounded.', statMods: { damage: 465 }, specialMechanic: 'Permanent Grounding Slam' }
        ]
      },
      {
        name: 'Volley',
        description: 'Multi-harpoon launch targeting multiple flyers.',
        tiers: [
          { name: 'Dual Rail', cost: 70, description: 'Fires 2 lighter harpoons (45 dmg each)', statMods: { damage: 55 } },
          { name: 'Multi-Spool', cost: 125, description: 'Fires 2 harpoons (75 dmg each)', statMods: { damage: 90 } },
          { name: 'Air Sweeper', cost: 195, description: 'Fires 3 harpoons at separate flyers', statMods: { damage: 130 } },
          { name: 'Quad-Harpoon Launcher', cost: 300, description: 'Multi-Target Salvo: Fires 3 harpoons (165 dmg each) at separate flying targets.', statMods: { damage: 165 } },
          { name: 'Sky-Sweep Array', cost: 520, description: 'Payload Drop: Fires 6 harpoons. Dead flyers drop 150 splash damage on ground.', statMods: { damage: 280 }, specialMechanic: '6-Harpoon Ground Ordnance' }
        ]
      }
    ]
  },

  tesla: {
    type: 'tesla',
    name: 'Tesla Coil',
    role: 'Chain Lightning / Multi-Target Energy',
    description: 'Emits high-voltage arcing electricity that jumps between adjacent demonata with zero travel time.',
    baseCost: 130,
    baseDamage: 15,
    baseFireRate: 3.33,
    baseRange: 128,
    basePierce: 1,
    damageType: 'lightning',
    defaultPriority: 'nearest',
    canTargetAir: true,
    canTargetGround: true,
    chainCount: 3,
    chainFalloff: 0.20,
    color: '#eab308',
    accentColor: '#fde047',
    paths: [
      {
        name: 'Overcharge',
        description: 'Increases lightning chain bounce count and eliminates falloff.',
        tiers: [
          { name: 'Capacitor Bank', cost: 70, description: '+2 Bounces, +4 Damage', statMods: { chainCount: 5, damage: 19 } },
          { name: 'Arc Resonator', cost: 125, description: '+1 Bounce, 15% lower falloff', statMods: { chainCount: 6, damage: 26 } },
          { name: 'Flux Core', cost: 190, description: '+7 Bounces, +10 Damage', statMods: { chainCount: 7, damage: 38 } },
          { name: 'Conductor Array', cost: 300, description: 'Bounces up to 7 targets with only 10% falloff per jump.', statMods: { chainCount: 7, damage: 65 } },
          { name: 'Arc Core Generator', cost: 530, description: 'Conductive Cascade: Jumps up to 12 targets with 0% falloff. +5% damage per jump!', statMods: { chainCount: 12, damage: 110 }, specialMechanic: 'Conductive Cascade Zero Falloff' }
        ]
      },
      {
        name: 'Static Field',
        description: 'Continuous radial electrical discharge shocking everything nearby.',
        tiers: [
          { name: 'Ground Spark', cost: 65, description: '+10 Range, +3 Damage', statMods: { range: 140, damage: 18 } },
          { name: 'Static Coil', cost: 120, description: '+20 Range, shocks nearby units for 10 dps', statMods: { range: 150, damage: 25 } },
          { name: 'Plasma Ring', cost: 185, description: '+30 Range, +15 field dps', statMods: { range: 165, damage: 35 } },
          { name: 'Galvanic Emplacement', cost: 290, description: 'Static Discharge: Zaps all creeps in 100px field for 15 dmg every 0.5s.', statMods: { range: 175, damage: 55 } },
          { name: 'Lightning Storm Matrix', cost: 510, description: 'Global Ionic Strike: Every 2s summons a random bolt hitting 5 creeps anywhere.', statMods: { damage: 95, range: 190 }, specialMechanic: 'Global Ionic Map Strike' }
        ]
      },
      {
        name: 'Thunderstrike',
        description: 'Replaces multi-chain with devastating single-target gigabolts.',
        tiers: [
          { name: 'Direct Arc', cost: 75, description: '+15 Damage, -1 bounce', statMods: { damage: 30 } },
          { name: 'High-Voltage Spire', cost: 135, description: '+35 Damage, single target focus', statMods: { damage: 60 } },
          { name: 'Lightning Rod', cost: 200, description: '+70 Damage, 0.5s stun', statMods: { damage: 110 } },
          { name: 'Giga-Bolt Spire', cost: 320, description: 'Single heavy bolt dealing 215 lightning damage with 1.0s stun.', statMods: { damage: 215 } },
          { name: 'Thor\'s Hammer', cost: 550, description: 'Concussive Flash: 525 direct damage, 1.0s stun, 50% splash with micro-stun.', statMods: { damage: 525 }, specialMechanic: 'Thor Concussive Flash' }
        ]
      }
    ]
  },

  mortar: {
    type: 'mortar',
    name: 'Heavy Mortar',
    role: 'Long-Range AoE Artillery',
    description: 'Lob massive mortar shells over high arcs with minimum blind spot.',
    baseCost: 150,
    baseDamage: 65,
    baseFireRate: 0.25,
    baseRange: 360,
    basePierce: 10,
    damageType: 'physical',
    defaultPriority: 'first',
    canTargetAir: false,
    canTargetGround: true,
    splashRadius: 90,
    splashRatio: 0.75,
    color: '#78716c',
    accentColor: '#a8a29e',
    paths: [
      {
        name: 'Incendiary Shells',
        description: 'Leaves burning napalm pools upon impact.',
        tiers: [
          { name: 'Pitch Shot', cost: 80, description: '+15 Damage', statMods: { damage: 80 } },
          { name: 'Tar Cauldron', cost: 150, description: '+30 Damage, 2s fire ground', statMods: { damage: 110 } },
          { name: 'Blaze Shell', cost: 230, description: '+50 Damage, 3s fire ground', statMods: { damage: 150 } },
          { name: 'Pitch Shell Launcher', cost: 360, description: 'Scorched Earth: Leaves burning pool dealing 25 fire dps for 4s.', statMods: { damage: 200 } },
          { name: 'Hellfire Emplacement', cost: 600, description: 'Napalm Inundation: 8s True Damage fire pool dealing 75 dps, disables demon regen.', statMods: { damage: 320 }, specialMechanic: 'Napalm True Damage Pool' }
        ]
      },
      {
        name: 'Shockwave',
        description: 'Knocks creeps backward along their path vector.',
        tiers: [
          { name: 'Heavy Primer', cost: 80, description: '+20 Damage', statMods: { damage: 85 } },
          { name: 'Kinetic Shell', cost: 145, description: '+40 Damage, small pushback', statMods: { damage: 125 } },
          { name: 'Tremor Charge', cost: 220, description: '+65 Damage, medium pushback', statMods: { damage: 175 } },
          { name: 'Concussion Battery', cost: 340, description: 'Kinetic Displacement: Impact physically knocks all creeps backward 40px.', statMods: { damage: 230 } },
          { name: 'Seismic Citadel', cost: 570, description: 'Tectonic Stun: Knocks back 90px with 30% chance for 1.5s hard stun.', statMods: { damage: 350 }, specialMechanic: 'Seismic Tectonic Push' }
        ]
      },
      {
        name: 'Siegebreaker',
        description: 'Massive bonus damage against bosses and armored demons.',
        tiers: [
          { name: 'Solid Core', cost: 90, description: '+25 Damage', statMods: { damage: 90 } },
          { name: 'Armor Drill', cost: 160, description: '+50 Damage, +30% vs Bosses', statMods: { damage: 140 } },
          { name: 'Demolition Round', cost: 250, description: '+80 Damage, +60% vs Bosses', statMods: { damage: 210 } },
          { name: 'Bunker Buster', cost: 380, description: 'Armor Crushing: +100% bonus damage against Elites, Tanks, and Bosses.', statMods: { damage: 320 } },
          { name: 'Titan Cracker', cost: 630, description: 'Catastrophic Rupture: +250% damage to bosses and permanently strips 40% armor.', statMods: { damage: 520 }, specialMechanic: 'Titan Cracker Armor Strip' }
        ]
      }
    ]
  },

  flamethrower: {
    type: 'flamethrower',
    name: 'Flame Turret',
    role: 'Cone AoE DoT / Swarm Melter',
    description: 'Emits a continuous 60-degree cone of raging supernatural fire to disintegrate swarms.',
    baseCost: 115,
    baseDamage: 10,
    baseFireRate: 5.0,
    baseRange: 112,
    basePierce: 99,
    damageType: 'fire',
    defaultPriority: 'first',
    canTargetAir: false,
    canTargetGround: true,
    isConeFlamethrower: true,
    color: '#dc2626',
    accentColor: '#f87171',
    paths: [
      {
        name: 'Napalm',
        description: 'Sticky fire that lingers on creeps after exiting the flame cone.',
        tiers: [
          { name: 'Thickened Fuel', cost: 70, description: '+3 Cone Dmg', statMods: { damage: 13 } },
          { name: 'Tar Injection', cost: 130, description: '+6 Cone Dmg, 2s residual burn', statMods: { damage: 18 } },
          { name: 'Blaze Gel', cost: 210, description: '+12 Cone Dmg, 3s residual burn', statMods: { damage: 28 } },
          { name: 'Sticky Napalm Projection', cost: 310, description: 'Residual Combustion: Enemies burn for 4s after leaving cone (30 dps).', statMods: { damage: 42 } },
          { name: 'Thermite Gel Emitter', cost: 530, description: 'Thermal Saturation: Residual burn 8s. Burning creeps take +25% fire damage.', statMods: { damage: 75 }, specialMechanic: 'Thermite Saturation' }
        ]
      },
      {
        name: 'Pressure Jet',
        description: 'Narrows cone into a long-range high-pressure piercing jet.',
        tiers: [
          { name: 'Narrow Nozzle', cost: 65, description: '+20 Range, +4 Dmg', statMods: { range: 130, damage: 14 } },
          { name: 'High-Flow Pump', cost: 125, description: '+40 Range, +8 Dmg', statMods: { range: 160, damage: 22 } },
          { name: 'Thermal Lance', cost: 200, description: '+60 Range, +15 Dmg', statMods: { range: 190, damage: 34 } },
          { name: 'Fuel Compressor', cost: 290, description: 'Extends flame range to 200px (30 deg cone).', statMods: { range: 200, damage: 52 } },
          { name: 'Dragon\'s Breath Cannons', cost: 490, description: 'High-Pressure Penetration: 280px range, punches through heavy armor.', statMods: { range: 280, damage: 95 }, specialMechanic: 'Dragon Breath Armor Pierce' }
        ]
      },
      {
        name: 'Inferno',
        description: 'Thermal ramping damage while continuously firing.',
        tiers: [
          { name: 'Preheater', cost: 75, description: '+3 Dmg, +5% ramp', statMods: { damage: 13 } },
          { name: 'Combustion Chamber', cost: 140, description: '+6 Dmg, +10% ramp', statMods: { damage: 20 } },
          { name: 'Superheater', cost: 220, description: '+12 Dmg, +15% ramp', statMods: { damage: 32 } },
          { name: 'Blaze Accelerator', cost: 330, description: 'Thermal Ramp: Continuous firing ramps tick damage by +10%/s (up to +100%).', statMods: { damage: 55 } },
          { name: 'Superheated Plasma Rig', cost: 560, description: 'Plasma Phase: Ramp up to +300%. At peak, converts all damage into True Damage!', statMods: { damage: 95 }, specialMechanic: 'Superheated Plasma True Dmg' }
        ]
      }
    ]
  },

  gatling: {
    type: 'gatling',
    name: 'Gatling Spire',
    role: 'High-AS Physical Shredder',
    description: 'Rotary multi-barrel minigun spewing lead at blisteringly high rates.',
    baseCost: 120,
    baseDamage: 6,
    baseFireRate: 6.67,
    baseRange: 140,
    basePierce: 0,
    damageType: 'physical',
    defaultPriority: 'first',
    canTargetAir: true,
    canTargetGround: true,
    color: '#d97706',
    accentColor: '#f59e0b',
    paths: [
      {
        name: 'Spin-Up',
        description: 'Rotary speed ramps up the longer it fires.',
        tiers: [
          { name: 'Electric Motor', cost: 65, description: '+2 Damage', statMods: { damage: 8 } },
          { name: 'Tuned Bearings', cost: 120, description: '+4 Damage, +1.5 fire rate', statMods: { damage: 12, fireRate: 8.0 } },
          { name: 'Overwound Rotor', cost: 185, description: '+6 Damage, +3.0 fire rate', statMods: { damage: 18, fireRate: 10.0 } },
          { name: 'Kinetic Accelerator', cost: 310, description: 'Firing interval ramps down to 0.04s (25/s) after 2s of continuous fire.', statMods: { damage: 24, fireRate: 15.0 } },
          { name: 'Relentless Shredder', cost: 530, description: 'Armor Abrasion: Ramps to 50 shots/sec. Every 5th bullet strips 1 armor.', statMods: { damage: 36, fireRate: 25.0 }, specialMechanic: 'Armor Abrasion Shred' }
        ]
      },
      {
        name: 'Tracer Rounds',
        description: 'Tracer munitions highlight targets for surrounding towers.',
        tiers: [
          { name: 'Phosphor Feed', cost: 60, description: '+20 Range', statMods: { range: 160 } },
          { name: 'Spotter Scope', cost: 110, description: '+40 Range, +3 Damage', statMods: { range: 180, damage: 10 } },
          { name: 'Laser Sights', cost: 175, description: '+60 Range, +6 Damage', statMods: { range: 205, damage: 16 } },
          { name: 'Targeting Computer', cost: 290, description: 'Range extended to 210px with zero bullet dispersion.', statMods: { range: 220, damage: 24 } },
          { name: 'Ballistic Radar Network', cost: 490, description: 'Illuminating Tracers: Marked creeps give friendly towers +15% hit and +10% crit.', statMods: { range: 270, damage: 45 }, specialMechanic: 'Ballistic Radar Tracers' }
        ]
      },
      {
        name: 'Overheat',
        description: 'Overheats for devastating burst firepower.',
        tiers: [
          { name: 'Coolant Jacket', cost: 70, description: '+3 Damage', statMods: { damage: 9 } },
          { name: 'Mag Vent', cost: 130, description: '+6 Damage, +1.0 fire rate', statMods: { damage: 14, fireRate: 8.0 } },
          { name: 'Thermal Bypass', cost: 200, description: '+12 Damage, +2.0 fire rate', statMods: { damage: 22, fireRate: 10.0 } },
          { name: 'Thermal Chamber', cost: 330, description: 'Overdrive Burst: Activates Overheat mode for 4s (+300% fire rate).', statMods: { damage: 32, fireRate: 12.0 } },
          { name: 'Core Venting Engine', cost: 550, description: 'Thermal Discharge: When cooling, vents superheated steam (250 True Dmg in 100px).', statMods: { damage: 52, fireRate: 14.0 }, specialMechanic: 'Core Venting Steam Burst' }
        ]
      }
    ]
  },

  obelisk: {
    type: 'obelisk',
    name: 'Obelisk Spire',
    role: 'Continuous Laser / Anti-Boss Ramp',
    description: 'Locks a focused thermal laser onto priority targets, exponentially ramping up damage.',
    baseCost: 160,
    baseDamage: 20, // starts at 20 dps, ramps up
    baseFireRate: 10.0,
    baseRange: 168,
    basePierce: 0,
    damageType: 'lightning',
    defaultPriority: 'strongest',
    canTargetAir: true,
    canTargetGround: true,
    isContinuousBeam: true,
    color: '#ec4899',
    accentColor: '#f472b6',
    paths: [
      {
        name: 'Prism Beam',
        description: 'Splits the laser beam across multiple demons.',
        tiers: [
          { name: 'Quartz Prism', cost: 85, description: '+15 Laser DPS', statMods: { damage: 35 } },
          { name: 'Split Lens', cost: 160, description: '+30 Laser DPS, beam refracts to 1 target', statMods: { damage: 60 } },
          { name: 'Prismatic Array', cost: 260, description: '+60 Laser DPS, refracts to 2 targets', statMods: { damage: 110 } },
          { name: 'Tri-Refractor', cost: 400, description: 'Beam ramps to 450/s and refracts to 2 secondary targets (50% ramp).', statMods: { damage: 180 } },
          { name: 'Prism Matrix', cost: 670, description: 'Multi-Target Melt: Ramps to 900/s and splits to 4 secondary beams at 100% power!', statMods: { damage: 320 }, specialMechanic: 'Prism Matrix Multi Melt' }
        ]
      },
      {
        name: 'Solar Focus',
        description: 'Massive focused energy beam ramping to absurd single-target numbers.',
        tiers: [
          { name: 'Polished Mirror', cost: 80, description: '+25 Laser Ramp Cap', statMods: { damage: 45 } },
          { name: 'Thermal Capacitor', cost: 155, description: '+60 Laser Ramp Cap', statMods: { damage: 85 } },
          { name: 'Solar Core', cost: 250, description: '+120 Laser Ramp Cap', statMods: { damage: 160 } },
          { name: 'Thermal Lens', cost: 380, description: 'Beam damage ramps up to 800/s over 5s of uninterrupted focus.', statMods: { damage: 280 } },
          { name: 'Nova Beam Spire', cost: 650, description: 'Supernova Detonation: Ramps up to 2000/s. Targets killed explode for 20% max HP.', statMods: { damage: 550 }, specialMechanic: 'Supernova Nova Detonation' }
        ]
      },
      {
        name: 'Disintegrate',
        description: 'Deals percent Maximum Health True Damage directly.',
        tiers: [
          { name: 'Resonant Crystal', cost: 90, description: '+15 Damage, +10 Range', statMods: { damage: 35, range: 180 } },
          { name: 'Phase Inverter', cost: 170, description: '+30 Damage, +20 Range', statMods: { damage: 70, range: 195 } },
          { name: 'Singularity Lens', cost: 275, description: '+60 Damage, +30 Range', statMods: { damage: 130, range: 215 } },
          { name: 'Particle Decimator', cost: 420, description: 'Percentage Erosion: Adds 1.5% Target Max HP as True Damage per second.', statMods: { damage: 220 } },
          { name: 'Singularity Beam', cost: 710, description: 'Atomic Dissolution: 4.0% Max HP True Damage per second, completely ignoring immunities.', statMods: { damage: 400 }, specialMechanic: 'Singularity Atomic Dissolution' }
        ]
      }
    ]
  }
};

// Enemy Archetypes & Bestiary
export const ENEMIES_DATA: Record<string, EnemyDef> = {
  grunt: {
    type: 'grunt',
    name: 'Ash Raider',
    baseHp: 50,
    baseSpeed: 92,
    baseArmor: 2,
    reward: 10,
    role: 'Baseline infantry',
    isFlying: false,
    isBoss: false,
    size: 14,
    color: '#e11d48',
    description: 'Standard shock troops from Cold Hell. Balanced speed and endurance.',
    hpRank: 4,
    armorRank: 2,
    speedRank: 5,
    weaknesses: ['Rapidfire Archery', 'Frost Slow'],
    resistances: ['Minor Physical Shield'],
    behavior: 'Advances along standard march corridor at steady velocity',
    firstEncountered: 'Outpost 7 Perimeter (Level 1)'
  },
  runner: {
    type: 'runner',
    name: 'Cinder Skitter',
    baseHp: 28,
    baseSpeed: 155,
    baseArmor: 0,
    reward: 8,
    role: 'Speed threat',
    isFlying: false,
    isBoss: false,
    size: 11,
    color: '#f97316',
    description: 'Extremely fast demonic scouts that sprint down lines. Weak to slows and burst fire.',
    hpRank: 2,
    armorRank: 1,
    speedRank: 9,
    weaknesses: ['Frost Control', 'Chain Lightning', 'Spike Traps'],
    resistances: ['Evasion vs slow mortar shells'],
    behavior: 'Prioritizes shortest route; sprints at 155 px/s down lane',
    firstEncountered: 'The Frontier Breach (Level 2)'
  },
  swarm: {
    type: 'swarm',
    name: 'Ember Mite',
    baseHp: 14,
    baseSpeed: 110,
    baseArmor: 0,
    reward: 4,
    role: 'Density threat',
    isFlying: false,
    isBoss: false,
    size: 9,
    color: '#eab308',
    description: 'Tiny insectoid horrors moving in high numbers. Vulnerable to splash artillery and chain lightning.',
    hpRank: 1,
    armorRank: 0,
    speedRank: 6,
    weaknesses: ['Field Cannon Splash', 'Mortar Artillery', 'Tesla Coil'],
    resistances: ['Overwhelms single-target snipers through pure numbers'],
    behavior: 'Clusters in dense waves to absorb single-target shots',
    firstEncountered: 'Outpost 7 Perimeter (Level 1)'
  },
  armored: {
    type: 'armored',
    name: 'Slag Plate',
    baseHp: 150,
    baseSpeed: 58,
    baseArmor: 8,
    reward: 18,
    role: 'Armored tank',
    isFlying: false,
    isBoss: false,
    size: 18,
    color: '#64748b',
    description: 'Heavily encrusted with demon molten iron. Shrugs off physical arrows; highly vulnerable to Mage magic.',
    hpRank: 7,
    armorRank: 8,
    speedRank: 3,
    weaknesses: ['Arcane Mage Tower', 'Pyromancer Burn', 'Armor-Piercing Ballista'],
    resistances: ['Flat -8 reduction against kinetic arrows and non-piercing shot'],
    behavior: 'Slowly absorbs damage to shield trailing raiders',
    firstEncountered: 'Ashen Caldera (Level 4)'
  },
  flyer: {
    type: 'flyer',
    name: 'Soot Wing',
    baseHp: 42,
    baseSpeed: 118,
    baseArmor: 1,
    reward: 14,
    role: 'Aerial threat',
    isFlying: true,
    isBoss: false,
    size: 13,
    color: '#38bdf8',
    description: 'Winged fiends flying above ground artillery. Must be shot down with Ballistas, Archery, or Tesla.',
    hpRank: 3,
    armorRank: 2,
    speedRank: 7,
    weaknesses: ['Ballista Air-Sniping', 'Archer Volleys', 'Tesla Discharge'],
    resistances: ['100% immune to ground artillery (Cannons, Mortars, Traps)'],
    behavior: 'Flies above road corridors directly bypassing ground barricades',
    firstEncountered: 'Sulfur Ridge (Level 3)'
  },
  splitter: {
    type: 'splitter',
    name: 'Ash Fiend',
    baseHp: 95,
    baseSpeed: 75,
    baseArmor: 3,
    reward: 16,
    role: 'Splitter',
    isFlying: false,
    isBoss: false,
    size: 16,
    color: '#a855f7',
    description: 'Splits into 2 Ember Mites upon death.',
    hpRank: 6,
    armorRank: 4,
    speedRank: 4,
    weaknesses: ['Frost Slow', 'Follow-up Cannon AOE'],
    resistances: ['Reconstitutes into 2 child mites upon fatal injury'],
    behavior: 'Splits into two sprinting Ember Mites upon death',
    firstEncountered: 'Obsidian Pass (Level 5)'
  },
  leech: {
    type: 'leech',
    name: 'Void Leech',
    baseHp: 120,
    baseSpeed: 68,
    baseArmor: 4,
    reward: 20,
    role: 'Regenerator',
    isFlying: false,
    isBoss: false,
    size: 15,
    color: '#10b981',
    description: 'Regenerates 12 HP per second. Countered by fire and poison debuffs.',
    hpRank: 7,
    armorRank: 4,
    speedRank: 4,
    weaknesses: ['Continuous Burn', 'Poison Stacks', 'High Burst Focus'],
    resistances: ['Passive +12 HP/sec cellular regeneration unless ignited'],
    behavior: 'Siphons ambient void energy to regenerate missing health',
    firstEncountered: 'The Iron Crucible (Level 6)'
  },
  boss: {
    type: 'boss',
    name: 'Kiln Colossus',
    baseHp: 1600,
    baseSpeed: 42,
    baseArmor: 12,
    reward: 140,
    role: 'Colossal Boss',
    isFlying: false,
    isBoss: true,
    size: 26,
    color: '#dc2626',
    description: 'Massive towering dread behemoth. Has CC resistance and immense health pool.',
    hpRank: 10,
    armorRank: 9,
    speedRank: 2,
    weaknesses: ['Obelisk Focused Beam', 'Sharpshot Crits', 'Arcane Amp Auras'],
    resistances: ['50% CC resistance to slow/freeze', '40% reduction against %-HP'],
    behavior: 'Relentlessly marches; leaks cause massive 5-life penalty',
    firstEncountered: 'Demon Gate Nexus (Level 8)'
  }
};

function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/**
 * Procedurally generates comprehensive tactical placement slots within 3 blocks
 * (X and Y axis) of every square along the road segments.
 * All slots are mathematically locked to the exact center of each 40x40 grid box.
 */
export function generateRoadSlots(
  waypoints: { x: number; y: number }[],
  pathWidth: number
): { x: number; y: number }[] {
  const GRID_SIZE = 40;
  const COLS = Math.floor(920 / GRID_SIZE); // 23 columns: 0..22
  const ROWS = Math.floor(600 / GRID_SIZE); // 15 rows: 0..14

  // Identify all grid cells covered by the road path
  const roadCells: { c: number; r: number }[] = [];
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      const cx = c * GRID_SIZE + GRID_SIZE / 2;
      const cy = r * GRID_SIZE + GRID_SIZE / 2;

      let minDist = Infinity;
      for (let i = 0; i < waypoints.length - 1; i++) {
        const d = distToSegment(cx, cy, waypoints[i].x, waypoints[i].y, waypoints[i + 1].x, waypoints[i + 1].y);
        if (d < minDist) minDist = d;
      }

      // If the cell center falls within the road corridor
      if (minDist <= (pathWidth / 2) + 8) {
        roadCells.push({ c, r });
      }
    }
  }

  const slots: { x: number; y: number }[] = [];
  const start = waypoints[0];
  const end = waypoints[waypoints.length - 1];

  // Scan cells with a 1-tile border margin so towers don't touch the canvas boundaries
  for (let c = 1; c < COLS - 1; c++) {
    for (let r = 1; r < ROWS - 1; r++) {
      const cx = c * GRID_SIZE + GRID_SIZE / 2;
      const cy = r * GRID_SIZE + GRID_SIZE / 2;

      // Cannot place directly on top of the road
      const isRoad = roadCells.some(rc => rc.c === c && rc.r === r);
      if (isRoad) continue;

      // Keep clear of start portal (Breach) and end sanctuary (Nexus)
      if (Math.hypot(cx - start.x, cy - start.y) < 38) continue;
      if (Math.hypot(cx - end.x, cy - end.y) < 38) continue;

      // Check if within 3 blocks of the road on X and Y axis (Chebyshev distance <= 3)
      const withinReach = roadCells.some(rc => Math.abs(rc.c - c) <= 3 && Math.abs(rc.r - r) <= 3);
      if (withinReach) {
        slots.push({ x: cx, y: cy });
      }
    }
  }

  return slots;
}

const MAP1_WAYPOINTS = [
  { x: 20, y: 140 },
  { x: 220, y: 140 },
  { x: 220, y: 380 },
  { x: 420, y: 380 },
  { x: 420, y: 180 },
  { x: 660, y: 180 },
  { x: 660, y: 420 },
  { x: 900, y: 420 }
];

const MAP2_WAYPOINTS = [
  { x: 20, y: 300 },
  { x: 180, y: 140 },
  { x: 340, y: 140 },
  { x: 460, y: 300 },
  { x: 340, y: 460 },
  { x: 620, y: 460 },
  { x: 740, y: 260 },
  { x: 900, y: 260 }
];

const MAP3_WAYPOINTS = [
  { x: 460, y: 20 },
  { x: 460, y: 140 },
  { x: 180, y: 140 },
  { x: 180, y: 340 },
  { x: 700, y: 340 },
  { x: 700, y: 220 },
  { x: 860, y: 220 },
  { x: 860, y: 500 },
  { x: 340, y: 500 }
];

// 3 Distinct Map Biomes with 3-Block Perimeter Defensive Grids
export const MAPS_DATA: Record<string, MapDef> = {
  map1: {
    id: 'map1',
    name: 'The Frontier Breach',
    region: 'Terran Outpost Perimeter',
    description: 'A winding frontier outpost road bordered by fortification mounds. The first tear in reality occurred here.',
    waypoints: MAP1_WAYPOINTS,
    slots: generateRoadSlots(MAP1_WAYPOINTS, 36),
    theme: 'frontier',
    bgGradient: ['#0f172a', '#020617'],
    pathColor: '#334155',
    pathWidth: 36
  },
  map2: {
    id: 'map2',
    name: 'The Ashen Caldera',
    region: 'Scorched Slag Chasms',
    description: 'Molten sulfur fissures and obsidian crags where the demonata have begun corrupting the planet crust.',
    waypoints: MAP2_WAYPOINTS,
    slots: generateRoadSlots(MAP2_WAYPOINTS, 38),
    theme: 'caldera',
    bgGradient: ['#1c0c0b', '#080202'],
    pathColor: '#5c1d18',
    pathWidth: 38
  },
  map3: {
    id: 'map3',
    name: 'Cold Hell Gate',
    region: 'The Abyssal Rift',
    description: 'The epicenter of the cosmic tear. Reality twists into azure ice and spatial rifts.',
    waypoints: MAP3_WAYPOINTS,
    slots: generateRoadSlots(MAP3_WAYPOINTS, 40),
    theme: 'cold_hell',
    bgGradient: ['#021226', '#01050d'],
    pathColor: '#0e3b68',
    pathWidth: 40
  }
};

// Aliases for Endless mode and thematic identifiers
MAPS_DATA.frontier_outpost = MAPS_DATA.map1;
MAPS_DATA.ashen_caldera = MAPS_DATA.map2;
MAPS_DATA.cold_hell_gate = MAPS_DATA.map3;

export const MAPS = MAPS_DATA;

// 20 Campaign Levels with Boss Encounters & Tower Discoveries
export const CAMPAIGN_LEVELS: CampaignLevel[] = [
  {
    levelNumber: 1,
    title: 'The First Incursion',
    subtitle: 'Outpost 7 Perimeter',
    mapId: 'map1',
    storyIntro: 'Sensors detect minor spatial distortions along the perimeter. Low-tier Ash Raiders and Ember Mites are advancing.',
    storyOutro: 'The perimeter holds. The defensive line proved resilient against the initial skirmish.',
    startingGold: 400,
    startingLives: 20,
    recommendedTowers: ['archer', 'cannon'],
    waves: [
      {
        waveIndex: 1,
        title: 'Vanguard Scouts',
        groups: [
          { enemyType: 'grunt', count: 6, interval: 1.6, delay: 0 }
        ]
      },
      {
        waveIndex: 2,
        title: 'Cinder Sprinters',
        groups: [
          { enemyType: 'grunt', count: 8, interval: 1.4, delay: 0 },
          { enemyType: 'runner', count: 5, interval: 1.2, delay: 5 }
        ]
      },
      {
        waveIndex: 3,
        title: 'Mite Swarm',
        groups: [
          { enemyType: 'swarm', count: 18, interval: 0.5, delay: 0 },
          { enemyType: 'grunt', count: 6, interval: 1.3, delay: 4 }
        ]
      }
    ]
  },
  {
    levelNumber: 2,
    title: 'Frostline Calibration',
    subtitle: 'Chilling the Advance',
    mapId: 'map1',
    storyIntro: 'Fast-moving cinder skitters are outpacing our cannon reloads. Deploy Frost Prisms to throttle their tempo.',
    storyOutro: 'Multiplicative slow dynamics proved decisive. The front line is stabilizing.',
    startingGold: 420,
    startingLives: 20,
    recommendedTowers: ['archer', 'cannon', 'frost'],
    waves: [
      {
        waveIndex: 1,
        title: 'Skitter Pack',
        groups: [
          { enemyType: 'runner', count: 8, interval: 1.1, delay: 0 }
        ]
      },
      {
        waveIndex: 2,
        title: 'Mixed Vanguard',
        groups: [
          { enemyType: 'grunt', count: 10, interval: 1.2, delay: 0 },
          { enemyType: 'runner', count: 8, interval: 0.9, delay: 3 }
        ]
      },
      {
        waveIndex: 3,
        title: 'Dense Inundation',
        groups: [
          { enemyType: 'swarm', count: 24, interval: 0.45, delay: 0 },
          { enemyType: 'runner', count: 6, interval: 1.0, delay: 6 }
        ]
      },
      {
        waveIndex: 4,
        title: 'Heavy Cadence',
        groups: [
          { enemyType: 'grunt', count: 16, interval: 1.0, delay: 0 },
          { enemyType: 'runner', count: 12, interval: 0.8, delay: 4 }
        ]
      }
    ]
  },
  {
    levelNumber: 3,
    title: 'Carapace & Iron',
    subtitle: 'Armored Threat Emergence',
    mapId: 'map1',
    storyIntro: 'A new demon signature approaches: Slag Plates! Their thick molten carapaces shrug off physical arrows. We have summoned the Mage Spire to harness arcane piercing.',
    storyOutro: 'Arcane bolt research confirmed: magic completely bypasses physical armor plates.',
    unlocksTower: 'mage',
    startingGold: 450,
    startingLives: 20,
    recommendedTowers: ['mage', 'cannon', 'frost'],
    waves: [
      {
        waveIndex: 1,
        title: 'Iron Shell Probe',
        groups: [
          { enemyType: 'armored', count: 3, interval: 3.0, delay: 0 },
          { enemyType: 'grunt', count: 8, interval: 1.2, delay: 2 }
        ]
      },
      {
        waveIndex: 2,
        title: 'Heavy March',
        groups: [
          { enemyType: 'armored', count: 5, interval: 2.6, delay: 0 },
          { enemyType: 'runner', count: 8, interval: 1.0, delay: 4 }
        ]
      },
      {
        waveIndex: 3,
        title: 'Armored Wall',
        groups: [
          { enemyType: 'armored', count: 8, interval: 2.2, delay: 0 },
          { enemyType: 'swarm', count: 25, interval: 0.4, delay: 5 }
        ]
      }
    ]
  },
  {
    levelNumber: 4,
    title: 'Wings Over the Breach',
    subtitle: 'Airspace Defense Required',
    mapId: 'map1',
    storyIntro: 'Alarm! Winged demonata designated Soot Wings are soaring over our ground blockades! Cannons cannot hit air. Commission Skystriker Ballistas immediately!',
    storyOutro: 'Air superiority restored. The Ballista harpoons tore their flight feathers to shreds.',
    unlocksTower: 'ballista',
    startingGold: 480,
    startingLives: 20,
    recommendedTowers: ['ballista', 'archer', 'mage'],
    waves: [
      {
        waveIndex: 1,
        title: 'Aerial Recon',
        groups: [
          { enemyType: 'flyer', count: 6, interval: 1.8, delay: 0 }
        ]
      },
      {
        waveIndex: 2,
        title: 'Sky & Ground Flank',
        groups: [
          { enemyType: 'flyer', count: 10, interval: 1.5, delay: 0 },
          { enemyType: 'grunt', count: 12, interval: 1.2, delay: 2 }
        ]
      },
      {
        waveIndex: 3,
        title: 'Molten Flight',
        groups: [
          { enemyType: 'flyer', count: 14, interval: 1.2, delay: 0 },
          { enemyType: 'armored', count: 6, interval: 2.4, delay: 4 }
        ]
      },
      {
        waveIndex: 4,
        title: 'Combined Blitz',
        groups: [
          { enemyType: 'flyer', count: 16, interval: 1.0, delay: 0 },
          { enemyType: 'runner', count: 12, interval: 0.8, delay: 3 },
          { enemyType: 'armored', count: 6, interval: 2.0, delay: 6 }
        ]
      }
    ]
  },
  {
    levelNumber: 5,
    title: 'The Kiln Colossus',
    subtitle: 'Boss Finale: Frontier Gate',
    mapId: 'map1',
    bossName: 'Kiln Colossus',
    storyIntro: 'The earth shakes! The tear widens into an inferno as the Kiln Colossus steps through. 1,600 HP, heavy armor, and CC resistances!',
    storyOutro: 'The Colossus crumbles into dormant slag! From its heart core we extract the Tesla Coil schematics!',
    unlocksTower: 'tesla',
    startingGold: 550,
    startingLives: 20,
    recommendedTowers: ['mage', 'frost', 'cannon', 'ballista'],
    waves: [
      {
        waveIndex: 1,
        title: 'The Vanguard Vanguard',
        groups: [
          { enemyType: 'grunt', count: 12, interval: 1.0, delay: 0 },
          { enemyType: 'runner', count: 8, interval: 0.9, delay: 3 }
        ]
      },
      {
        waveIndex: 2,
        title: 'Armored Swarm',
        groups: [
          { enemyType: 'armored', count: 8, interval: 2.0, delay: 0 },
          { enemyType: 'swarm', count: 30, interval: 0.35, delay: 4 }
        ]
      },
      {
        waveIndex: 3,
        title: 'Air Raid Pre-Shock',
        groups: [
          { enemyType: 'flyer', count: 18, interval: 1.2, delay: 0 },
          { enemyType: 'armored', count: 6, interval: 2.2, delay: 2 }
        ]
      },
      {
        waveIndex: 4,
        title: 'KILN COLOSSUS ARRIVAL',
        groups: [
          { enemyType: 'boss', count: 1, interval: 1.0, delay: 0 },
          { enemyType: 'runner', count: 14, interval: 0.8, delay: 4 },
          { enemyType: 'armored', count: 8, interval: 2.0, delay: 8 }
        ]
      }
    ]
  },
  // Level 6 to 10: Map 2 Ashen Caldera
  {
    levelNumber: 6,
    title: 'Descent to Caldera',
    subtitle: 'Volcanic Fissures',
    mapId: 'map2',
    storyIntro: 'We pursue the breach into the Ashen Caldera. Magma veins boil under the cracked crust.',
    storyOutro: 'The volcanic choke points were secured.',
    startingGold: 500,
    startingLives: 20,
    recommendedTowers: ['tesla', 'cannon', 'frost'],
    waves: [
      {
        waveIndex: 1,
        title: 'Cinder Influx',
        groups: [
          { enemyType: 'runner', count: 14, interval: 0.9, delay: 0 },
          { enemyType: 'grunt', count: 12, interval: 1.1, delay: 3 }
        ]
      },
      {
        waveIndex: 2,
        title: 'Chain Shock Drill',
        groups: [
          { enemyType: 'swarm', count: 35, interval: 0.3, delay: 0 },
          { enemyType: 'flyer', count: 10, interval: 1.3, delay: 5 }
        ]
      },
      {
        waveIndex: 3,
        title: 'Armored Surge',
        groups: [
          { enemyType: 'armored', count: 12, interval: 1.8, delay: 0 },
          { enemyType: 'runner', count: 14, interval: 0.7, delay: 6 }
        ]
      }
    ]
  },
  {
    levelNumber: 7,
    title: 'The Splintering',
    subtitle: 'Ash Fiend Brood',
    mapId: 'map2',
    storyIntro: 'New demonic lifeforms have mutated in the lava: Ash Fiends! When slain, they split into frenzied Ember Mites.',
    storyOutro: 'Chain and splash ordnance neutralized the splitting brood.',
    startingGold: 520,
    startingLives: 20,
    recommendedTowers: ['cannon', 'tesla', 'frost'],
    waves: [
      {
        waveIndex: 1,
        title: 'Fiend Emergence',
        groups: [
          { enemyType: 'splitter', count: 6, interval: 2.0, delay: 0 },
          { enemyType: 'grunt', count: 10, interval: 1.0, delay: 3 }
        ]
      },
      {
        waveIndex: 2,
        title: 'Split & Swarm',
        groups: [
          { enemyType: 'splitter', count: 10, interval: 1.7, delay: 0 },
          { enemyType: 'swarm', count: 25, interval: 0.35, delay: 4 }
        ]
      },
      {
        waveIndex: 3,
        title: 'Volcanic Tide',
        groups: [
          { enemyType: 'splitter', count: 12, interval: 1.5, delay: 0 },
          { enemyType: 'armored', count: 8, interval: 2.0, delay: 4 },
          { enemyType: 'flyer', count: 12, interval: 1.1, delay: 6 }
        ]
      }
    ]
  },
  {
    levelNumber: 8,
    title: 'Purifying Flames',
    subtitle: 'Flame Turret Awakening',
    mapId: 'map2',
    storyIntro: 'The demon density is surging beyond standard ammunition. We have adapted magma siphon pipes into the continuous Flamethrower!',
    storyOutro: 'The Flamethrower incinerated the swarm clusters into pure ash.',
    unlocksTower: 'flamethrower',
    startingGold: 540,
    startingLives: 20,
    recommendedTowers: ['flamethrower', 'frost', 'cannon'],
    waves: [
      {
        waveIndex: 1,
        title: 'Mass Infestation',
        groups: [
          { enemyType: 'swarm', count: 45, interval: 0.25, delay: 0 }
        ]
      },
      {
        waveIndex: 2,
        title: 'Splitter Waves',
        groups: [
          { enemyType: 'splitter', count: 12, interval: 1.4, delay: 0 },
          { enemyType: 'runner', count: 15, interval: 0.7, delay: 3 }
        ]
      },
      {
        waveIndex: 3,
        title: 'Choke Point Crucible',
        groups: [
          { enemyType: 'armored', count: 10, interval: 1.8, delay: 0 },
          { enemyType: 'swarm', count: 40, interval: 0.25, delay: 4 },
          { enemyType: 'splitter', count: 8, interval: 1.6, delay: 6 }
        ]
      }
    ]
  },
  {
    levelNumber: 9,
    title: 'Leeches of the Deep',
    subtitle: 'Void Leech Infestation',
    mapId: 'map2',
    storyIntro: 'Void Leeches are healing demon wounds as they crawl forward! Continuous flame and concentrated focus are essential to overwhelm their cellular regen.',
    storyOutro: 'The regenerative parasites have been scorched from existence.',
    startingGold: 560,
    startingLives: 20,
    recommendedTowers: ['flamethrower', 'mage', 'tesla'],
    waves: [
      {
        waveIndex: 1,
        title: 'Parasite Wave',
        groups: [
          { enemyType: 'leech', count: 6, interval: 2.2, delay: 0 },
          { enemyType: 'grunt', count: 14, interval: 1.0, delay: 2 }
        ]
      },
      {
        waveIndex: 2,
        title: 'Regen Tank Column',
        groups: [
          { enemyType: 'leech', count: 10, interval: 1.8, delay: 0 },
          { enemyType: 'armored', count: 10, interval: 1.7, delay: 3 }
        ]
      },
      {
        waveIndex: 3,
        title: 'Abyssal Swarm',
        groups: [
          { enemyType: 'leech', count: 12, interval: 1.5, delay: 0 },
          { enemyType: 'flyer', count: 18, interval: 1.0, delay: 4 },
          { enemyType: 'splitter', count: 10, interval: 1.5, delay: 6 }
        ]
      }
    ]
  },
  {
    levelNumber: 10,
    title: 'The Dread Golem',
    subtitle: 'Boss Finale: Caldera Heart',
    mapId: 'map2',
    bossName: 'Dread Golem',
    storyIntro: 'The caldera magma coalesces into the Dread Golem! An ancient construct fused with Cold Hell demon souls, boasting 3,200 HP and thick slag armor.',
    storyOutro: 'The Golem shatters into glowing obsidian! We scavenge schematics for the Heavy Mortar and Gatling Gun!',
    unlocksTower: 'mortar',
    startingGold: 650,
    startingLives: 20,
    recommendedTowers: ['mage', 'flamethrower', 'ballista', 'frost'],
    waves: [
      {
        waveIndex: 1,
        title: 'Caldera Guard',
        groups: [
          { enemyType: 'armored', count: 12, interval: 1.5, delay: 0 },
          { enemyType: 'flyer', count: 15, interval: 1.0, delay: 3 }
        ]
      },
      {
        waveIndex: 2,
        title: 'Leech Infiltration',
        groups: [
          { enemyType: 'leech', count: 14, interval: 1.3, delay: 0 },
          { enemyType: 'splitter', count: 12, interval: 1.4, delay: 4 }
        ]
      },
      {
        waveIndex: 3,
        title: 'Frenzied Rush',
        groups: [
          { enemyType: 'runner', count: 25, interval: 0.6, delay: 0 },
          { enemyType: 'armored', count: 10, interval: 1.6, delay: 4 }
        ]
      },
      {
        waveIndex: 4,
        title: 'DREAD GOLEM STRIKE',
        groups: [
          { enemyType: 'boss', count: 1, interval: 1.0, delay: 0, hpMult: 2.0 },
          { enemyType: 'leech', count: 8, interval: 1.8, delay: 5 },
          { enemyType: 'armored', count: 10, interval: 1.6, delay: 8 }
        ]
      }
    ]
  },
  // Level 11 to 20: Map 3 Cold Hell Gate & Beyond
  {
    levelNumber: 11,
    title: 'Through the Frost Gate',
    subtitle: 'Threshold of Cold Hell',
    mapId: 'map3',
    storyIntro: 'We cross the threshold into Cold Hell. The laws of physics bend. Long-range Mortar bombardment and rapid Gatling fire are online.',
    storyOutro: 'Bridgehead secured in hostile realm.',
    unlocksTower: 'gatling',
    startingGold: 600,
    startingLives: 20,
    recommendedTowers: ['mortar', 'gatling', 'tesla'],
    waves: [
      {
        waveIndex: 1,
        title: 'Frost Vanguard',
        groups: [
          { enemyType: 'grunt', count: 18, interval: 0.9, delay: 0 },
          { enemyType: 'runner', count: 16, interval: 0.7, delay: 3 }
        ]
      },
      {
        waveIndex: 2,
        title: 'Aerial Blizzard',
        groups: [
          { enemyType: 'flyer', count: 22, interval: 0.9, delay: 0 },
          { enemyType: 'splitter', count: 14, interval: 1.3, delay: 4 }
        ]
      },
      {
        waveIndex: 3,
        title: 'Heavy Frost March',
        groups: [
          { enemyType: 'armored', count: 16, interval: 1.4, delay: 0 },
          { enemyType: 'leech', count: 12, interval: 1.4, delay: 4 }
        ]
      }
    ]
  },
  {
    levelNumber: 12,
    title: 'Rift Convergence',
    subtitle: 'Dense demonata confluence',
    mapId: 'map3',
    storyIntro: 'Spatial distortions are speeding up enemy waves. Gatling spin-up and Mortar siege artillery will be taxed to the limit.',
    storyOutro: 'Wave broken against ballistic walls.',
    startingGold: 620,
    startingLives: 20,
    recommendedTowers: ['gatling', 'mortar', 'frost'],
    waves: [
      {
        waveIndex: 1,
        title: 'Skitter Storm',
        groups: [
          { enemyType: 'runner', count: 28, interval: 0.5, delay: 0 }
        ]
      },
      {
        waveIndex: 2,
        title: 'Gargantuan Wave',
        groups: [
          { enemyType: 'armored', count: 18, interval: 1.2, delay: 0 },
          { enemyType: 'swarm', count: 50, interval: 0.2, delay: 4 }
        ]
      },
      {
        waveIndex: 3,
        title: 'All-Domain Assault',
        groups: [
          { enemyType: 'flyer', count: 24, interval: 0.8, delay: 0 },
          { enemyType: 'splitter', count: 16, interval: 1.2, delay: 3 },
          { enemyType: 'leech', count: 14, interval: 1.3, delay: 6 }
        ]
      }
    ]
  },
  {
    levelNumber: 13,
    title: 'The Obelisk Awakening',
    subtitle: 'Ramping Energy Beam',
    mapId: 'map3',
    storyIntro: 'Ancient crystal monoliths resonate with our tech. We have awakened the Obelisk Tower! Its continuous focused laser melts bosses exponentially.',
    storyOutro: 'The laser beam vaporized the demon vanguard.',
    unlocksTower: 'obelisk',
    startingGold: 660,
    startingLives: 20,
    recommendedTowers: ['obelisk', 'frost', 'ballista'],
    waves: [
      {
        waveIndex: 1,
        title: 'Elite Slag Tanks',
        groups: [
          { enemyType: 'armored', count: 20, interval: 1.1, delay: 0, hpMult: 1.3 }
        ]
      },
      {
        waveIndex: 2,
        title: 'High-Regen Stride',
        groups: [
          { enemyType: 'leech', count: 18, interval: 1.1, delay: 0 },
          { enemyType: 'runner', count: 20, interval: 0.6, delay: 4 }
        ]
      },
      {
        waveIndex: 3,
        title: 'Shattered Skies',
        groups: [
          { enemyType: 'flyer', count: 28, interval: 0.7, delay: 0 },
          { enemyType: 'armored', count: 16, interval: 1.3, delay: 5 }
        ]
      }
    ]
  },
  {
    levelNumber: 14,
    title: 'Curse of the Cold Hell',
    subtitle: 'The Abyssal Miasma',
    mapId: 'map3',
    storyIntro: 'Demons are advancing with supernatural speed bonuses. Prepare anti-air batteries and heavy concentrated focus.',
    storyOutro: 'The line held firm against dark enchantments.',
    startingGold: 680,
    startingLives: 20,
    recommendedTowers: ['obelisk', 'mortar', 'tesla'],
    waves: [
      {
        waveIndex: 1,
        title: 'Fast Advance',
        groups: [
          { enemyType: 'runner', count: 32, interval: 0.45, delay: 0 }
        ]
      },
      {
        waveIndex: 2,
        title: 'Armored Column',
        groups: [
          { enemyType: 'armored', count: 22, interval: 1.0, delay: 0 },
          { enemyType: 'splitter', count: 18, interval: 1.1, delay: 4 }
        ]
      },
      {
        waveIndex: 3,
        title: 'Swarm Overcharge',
        groups: [
          { enemyType: 'swarm', count: 60, interval: 0.18, delay: 0 },
          { enemyType: 'flyer', count: 26, interval: 0.7, delay: 4 }
        ]
      }
    ]
  },
  {
    levelNumber: 15,
    title: 'The Abyssal Reaver',
    subtitle: 'Boss Finale: Mid-Chasm',
    mapId: 'map3',
    bossName: 'Abyssal Reaver',
    storyIntro: 'The Abyssal Reaver emerges from the rift! Swift, lethal, with 4,500 HP and adaptive shielding. Focus all laser Obelisks and slow traps upon it!',
    storyOutro: 'The Reaver falls! From the rift echoes, the realm unlocks ultimate tier upgrades across all disciplines.',
    startingGold: 750,
    startingLives: 20,
    recommendedTowers: ['obelisk', 'frost', 'mage', 'ballista'],
    waves: [
      {
        waveIndex: 1,
        title: 'Reaver Escort Fleet',
        groups: [
          { enemyType: 'flyer', count: 30, interval: 0.6, delay: 0 },
          { enemyType: 'runner', count: 24, interval: 0.5, delay: 3 }
        ]
      },
      {
        waveIndex: 2,
        title: 'Titan Phalanx',
        groups: [
          { enemyType: 'armored', count: 24, interval: 0.9, delay: 0 },
          { enemyType: 'leech', count: 18, interval: 1.0, delay: 4 }
        ]
      },
      {
        waveIndex: 3,
        title: 'ABYSSAL REAVER DEPLOYMENT',
        groups: [
          { enemyType: 'boss', count: 1, interval: 1.0, delay: 0, hpMult: 2.8, speedMult: 1.2 },
          { enemyType: 'splitter', count: 16, interval: 1.0, delay: 5 },
          { enemyType: 'flyer', count: 20, interval: 0.8, delay: 8 }
        ]
      }
    ]
  },
  {
    levelNumber: 16,
    title: 'The Fractured Citadel',
    subtitle: 'Inner Realm Defense',
    mapId: 'map2',
    storyIntro: 'The Demonata strike back at our rear supply depots. We must redeploy veteran towers with advanced Tier 5 specializations.',
    storyOutro: 'Rear flank secured.',
    startingGold: 700,
    startingLives: 20,
    recommendedTowers: ['cannon', 'archer', 'tesla'],
    waves: [
      {
        waveIndex: 1,
        title: 'Surprise Skirmish',
        groups: [
          { enemyType: 'runner', count: 35, interval: 0.45, delay: 0 },
          { enemyType: 'grunt', count: 25, interval: 0.7, delay: 3 }
        ]
      },
      {
        waveIndex: 2,
        title: 'Iron Blitz',
        groups: [
          { enemyType: 'armored', count: 26, interval: 0.8, delay: 0 },
          { enemyType: 'leech', count: 20, interval: 0.9, delay: 4 }
        ]
      },
      {
        waveIndex: 3,
        title: 'Total Assault',
        groups: [
          { enemyType: 'flyer', count: 32, interval: 0.6, delay: 0 },
          { enemyType: 'splitter', count: 22, interval: 0.9, delay: 4 },
          { enemyType: 'swarm', count: 70, interval: 0.15, delay: 7 }
        ]
      }
    ]
  },
  {
    levelNumber: 17,
    title: 'Magma & Frost Clashing',
    subtitle: 'Elemental Equilibrium',
    mapId: 'map2',
    storyIntro: 'Conflicting cosmic energies destabilize the battlefield. Dual elemental damage types will maximize output.',
    storyOutro: 'Equilibrium achieved.',
    startingGold: 750,
    startingLives: 20,
    recommendedTowers: ['flamethrower', 'frost', 'obelisk'],
    waves: [
      {
        waveIndex: 1,
        title: 'Elemental Vanguard',
        groups: [
          { enemyType: 'splitter', count: 25, interval: 0.8, delay: 0 },
          { enemyType: 'runner', count: 30, interval: 0.45, delay: 3 }
        ]
      },
      {
        waveIndex: 2,
        title: 'Carapace Wall',
        groups: [
          { enemyType: 'armored', count: 30, interval: 0.7, delay: 0 },
          { enemyType: 'flyer', count: 30, interval: 0.6, delay: 4 }
        ]
      },
      {
        waveIndex: 3,
        title: 'Inundation',
        groups: [
          { enemyType: 'swarm', count: 90, interval: 0.12, delay: 0 },
          { enemyType: 'leech', count: 22, interval: 0.8, delay: 5 }
        ]
      }
    ]
  },
  {
    levelNumber: 18,
    title: 'The Void Escalation',
    subtitle: 'Final Defense Preparation',
    mapId: 'map3',
    storyIntro: 'The breach is on the verge of total collapse into our universe. High-tier 5/2/0 specializations are mandatory.',
    storyOutro: 'The defenses held under unprecedented pressure.',
    startingGold: 800,
    startingLives: 20,
    recommendedTowers: ['gatling', 'mortar', 'obelisk', 'ballista'],
    waves: [
      {
        waveIndex: 1,
        title: 'Frenzied Onslaught',
        groups: [
          { enemyType: 'runner', count: 40, interval: 0.35, delay: 0 },
          { enemyType: 'grunt', count: 30, interval: 0.6, delay: 3 }
        ]
      },
      {
        waveIndex: 2,
        title: 'Armored Swarm Cascade',
        groups: [
          { enemyType: 'armored', count: 32, interval: 0.6, delay: 0 },
          { enemyType: 'swarm', count: 100, interval: 0.1, delay: 4 }
        ]
      },
      {
        waveIndex: 3,
        title: 'Heavy Aerial Fleet',
        groups: [
          { enemyType: 'flyer', count: 40, interval: 0.5, delay: 0 },
          { enemyType: 'leech', count: 25, interval: 0.7, delay: 4 },
          { enemyType: 'splitter', count: 25, interval: 0.7, delay: 7 }
        ]
      }
    ]
  },
  {
    levelNumber: 19,
    title: 'Threshold of Damnation',
    subtitle: 'The Eve of the Overlord',
    mapId: 'map3',
    storyIntro: 'The sky turns violet black. Armies of the Cold Hell assemble before the Demonata Sovereign emerges.',
    storyOutro: 'The sovereign\'s guards have fallen. Malice Prime is upon us!',
    startingGold: 850,
    startingLives: 20,
    recommendedTowers: ['obelisk', 'mage', 'tesla', 'mortar'],
    waves: [
      {
        waveIndex: 1,
        title: 'Royal Death Guard',
        groups: [
          { enemyType: 'armored', count: 35, interval: 0.55, delay: 0, hpMult: 1.4 },
          { enemyType: 'runner', count: 35, interval: 0.4, delay: 3 }
        ]
      },
      {
        waveIndex: 2,
        title: 'Double Colossus Threat',
        groups: [
          { enemyType: 'boss', count: 2, interval: 8.0, delay: 0, hpMult: 1.8 },
          { enemyType: 'flyer', count: 35, interval: 0.5, delay: 5 }
        ]
      },
      {
        waveIndex: 3,
        title: 'Infinite Bleed',
        groups: [
          { enemyType: 'splitter', count: 35, interval: 0.55, delay: 0 },
          { enemyType: 'leech', count: 30, interval: 0.6, delay: 4 },
          { enemyType: 'swarm', count: 120, interval: 0.08, delay: 8 }
        ]
      }
    ]
  },
  {
    levelNumber: 20,
    title: 'Malice Prime: Lord of Cold Hell',
    subtitle: 'Campaign Finale: Sealing the Breach',
    mapId: 'map3',
    bossName: 'Malice Prime',
    storyIntro: 'MALICE PRIME HAS BREACHED REALITY! 10,000 HP, massive armor, dual aura shielding. Defeat the demonic lord to permanently seal the Cold Hell rift forever!',
    storyOutro: 'THE BREACH IS SEALED! Reality is restored. You have completed the v1 Campaign and unlocked Endless Mode Master Rank!',
    startingGold: 1000,
    startingLives: 25,
    recommendedTowers: ['obelisk', 'mage', 'ballista', 'frost', 'mortar', 'tesla'],
    waves: [
      {
        waveIndex: 1,
        title: 'Armageddon Precursor',
        groups: [
          { enemyType: 'armored', count: 40, interval: 0.5, delay: 0 },
          { enemyType: 'runner', count: 40, interval: 0.35, delay: 3 }
        ]
      },
      {
        waveIndex: 2,
        title: 'The Sky Darkens',
        groups: [
          { enemyType: 'flyer', count: 50, interval: 0.4, delay: 0 },
          { enemyType: 'splitter', count: 35, interval: 0.5, delay: 4 }
        ]
      },
      {
        waveIndex: 3,
        title: 'MALICE PRIME - THE LORD OF COLD HELL',
        groups: [
          { enemyType: 'boss', count: 1, interval: 1.0, delay: 0, hpMult: 6.25, speedMult: 0.9 },
          { enemyType: 'armored', count: 25, interval: 0.8, delay: 6 },
          { enemyType: 'leech', count: 20, interval: 0.9, delay: 12 },
          { enemyType: 'flyer', count: 30, interval: 0.6, delay: 18 }
        ]
      }
    ]
  }
];

// Global Tech Tree Nodes (8 nodes, 4 tiers each)
export const TECH_TREE_NODES: TechNode[] = [
  {
    id: 'sharpened_heads',
    name: 'Tempered Munitions',
    description: '+5% physical and ballistic damage per tier.',
    cost: [1, 2, 3, 5],
    maxTier: 4,
    category: 'offense',
    icon: 'Sword'
  },
  {
    id: 'arcane_infusion',
    name: 'Aether Calibration',
    description: '+6% magic & energy damage per tier.',
    cost: [1, 2, 3, 5],
    maxTier: 4,
    category: 'offense',
    icon: 'Zap'
  },
  {
    id: 'deep_freeze_flux',
    name: 'Glacial Viscosity',
    description: '+10% slow duration and +4% slow efficiency.',
    cost: [1, 2, 3, 4],
    maxTier: 4,
    category: 'utility',
    icon: 'Snowflake'
  },
  {
    id: 'efficient_foundry',
    name: 'Standardized Foundry',
    description: '-4% base build and upgrade cost for all towers.',
    cost: [2, 3, 4, 6],
    maxTier: 4,
    category: 'economy',
    icon: 'Coins'
  },
  {
    id: 'war_treasury',
    name: 'War Bonds Reserve',
    description: '+50 starting gold and +5% wave clear bonus gold.',
    cost: [1, 2, 3, 4],
    maxTier: 4,
    category: 'economy',
    icon: 'PiggyBank'
  },
  {
    id: 'reinforced_bastion',
    name: 'Reinforced Gates',
    description: '+3 additional base lives per tier.',
    cost: [1, 2, 3, 4],
    maxTier: 4,
    category: 'defense',
    icon: 'Shield'
  },
  {
    id: 'rapid_loader',
    name: 'Hydraulic Reloaders',
    description: '+5% attack speed for all mechanical and siege towers.',
    cost: [2, 3, 4, 6],
    maxTier: 4,
    category: 'offense',
    icon: 'FastForward'
  },
  {
    id: 'surveyor_scope',
    name: 'Arcane Lenses',
    description: '+6% operational firing range across all towers.',
    cost: [1, 2, 3, 5],
    maxTier: 4,
    category: 'utility',
    icon: 'Eye'
  }
];

// Daily Bounties
export const DEFAULT_DAILY_BOUNTIES: DailyBounty[] = [
  {
    id: 'bounty_slay_demons',
    title: 'Demon Extinction',
    description: 'Eliminate 150 demonata invaders in any mode.',
    target: 150,
    current: 0,
    rewardGold: 120,
    rewardTechPoints: 1,
    completed: false,
    claimed: false
  },
  {
    id: 'bounty_slay_armored',
    title: 'Cracking Slag',
    description: 'Destroy 25 Armored Slag Plate demons.',
    target: 25,
    current: 0,
    rewardGold: 100,
    rewardTechPoints: 1,
    completed: false,
    claimed: false
  },
  {
    id: 'bounty_slay_boss',
    title: 'Colossal Takedown',
    description: 'Defeat any Campaign or Endless Boss.',
    target: 1,
    current: 0,
    rewardGold: 200,
    rewardTechPoints: 2,
    completed: false,
    claimed: false
  },
  {
    id: 'bounty_tier5_upgrade',
    title: 'Apex Weaponry',
    description: 'Evolve any tower to Tier 5 specialization.',
    target: 1,
    current: 0,
    rewardGold: 150,
    rewardTechPoints: 1,
    completed: false,
    claimed: false
  }
];

// 7-Day Login Rewards
export const LOGIN_REWARDS: LoginReward[] = [
  { day: 1, rewardText: '100 Gold', gold: 100, techPoints: 0 },
  { day: 2, rewardText: '150 Gold + 1 Tech Point', gold: 150, techPoints: 1 },
  { day: 3, rewardText: '200 Gold', gold: 200, techPoints: 0 },
  { day: 4, rewardText: '250 Gold + 2 Tech Points', gold: 250, techPoints: 2 },
  { day: 5, rewardText: '300 Gold', gold: 300, techPoints: 0 },
  { day: 6, rewardText: '400 Gold + 2 Tech Points', gold: 400, techPoints: 2 },
  { day: 7, rewardText: '1,000 Gold + 5 Tech Points + "Frostforged" Skin', gold: 1000, techPoints: 5, skinReward: 'frostforged' }
];

export const TECH_TREE = TECH_TREE_NODES;
export const DEFAULT_BOUNTIES = DEFAULT_DAILY_BOUNTIES;
export const DEFAULT_LOGIN_REWARDS = LOGIN_REWARDS;

