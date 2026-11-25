import { SaveData } from './types';

export type BestiaryEntryId =
  | 'wolf'
  | 'fox'
  | 'bear'
  | 'cockatrice'
  | 'volcano'
  | 'boulder'
  | 'thundercloud';

export type BestiaryCategory = 'creature' | 'boss' | 'hazard';

export interface BestiaryEntry {
  id: BestiaryEntryId;
  name: string;
  subtitle: string;
  category: BestiaryCategory;
  firstSeenLevel: number;
  habitat: string;
  threatRank: string;
  hpLabel: string;
  damageLabel: string;
  speedLabel: string;
  lore: string;
  combatTip: string;
  discoveryHint: string;
  backdropGradient: string;
  groundColor: string;
  groundTrimColor: string;
  accentColor: string;
  trackDefeats: boolean;
}

export const BESTIARY_ENTRIES: BestiaryEntry[] = [
  {
    id: 'wolf',
    name: 'TIMBER WOLF',
    subtitle: 'Pack Stalker of the Heat Up',
    category: 'creature',
    firstSeenLevel: 10,
    habitat: 'World 3 · The Heat Up',
    threatRank: 'CLASS II',
    hpLabel: '2 HP',
    damageLabel: '1 HEART',
    speedLabel: 'MEDIUM',
    lore: 'Lean, iron-grey predators that prowl the rocky ridges beyond the coop. Driven out of the northern forests by the Cockatrice’s crimson skies, Timber Wolves patrol narrow ledges and erupt into a howling lunge the moment they catch the scent of fresh feathers.',
    combatTip: 'Leap squarely onto their back for a crushing stomp, or strike as soon as they turn at the edge of their patrol route.',
    discoveryHint: 'Reach Stage 10 (World 3: The Heat Up) and cross paths with a Timber Wolf.',
    backdropGradient: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 55%, #4c1d95 100%)',
    groundColor: '#3f3f46',
    groundTrimColor: '#71717a',
    accentColor: '#94a3b8',
    trackDefeats: true,
  },
  {
    id: 'fox',
    name: 'CUNNING FOX',
    subtitle: 'Crimson Dasher of the Canopy',
    category: 'creature',
    firstSeenLevel: 14,
    habitat: 'World 4 · The Jungle Lands',
    threatRank: 'CLASS III',
    hpLabel: '3 HP',
    damageLabel: '1 HEART',
    speedLabel: 'FAST',
    lore: 'Lightning-quick ambushers cloaked in burnt-orange fur. Generations of raiding hillside coops taught these jungle foxes to sprint across moss-slick stone ruins with uncanny balance. Silkie Sam insists they even tried to swipe his apron once.',
    combatTip: 'They close distance far faster than wolves. Jump early to dodge their burst dash, then counter with a quick sword swing or double stomp.',
    discoveryHint: 'Venture into Stage 14 (World 4: The Jungle Lands) to encounter the Cunning Fox.',
    backdropGradient: 'linear-gradient(180deg, #064e3b 0%, #065f46 55%, #14532d 100%)',
    groundColor: '#365314',
    groundTrimColor: '#65a30d',
    accentColor: '#fb923c',
    trackDefeats: true,
  },
  {
    id: 'bear',
    name: 'TUNDRA BEAR',
    subtitle: 'Armored Juggernaut of the Peaks',
    category: 'creature',
    firstSeenLevel: 20,
    habitat: 'World 5 · The Arctic Lands',
    threatRank: 'CLASS IV',
    hpLabel: '6 HP',
    damageLabel: '2 HEARTS',
    speedLabel: 'HEAVY',
    lore: 'Towering alpine titans whose thick winter coats shrug off glancing blows. Awakened early from hibernation by thunder echoing down from Mount Cluckmore, a single swipe of their massive paws can send an unprepared adventurer flying off the cliffs.',
    combatTip: 'Bring an upgraded sword and sturdy armor. Strike once, retreat past their heavy slam reach, and punish their slow turn-around.',
    discoveryHint: 'Ascend to Stage 20 (World 5: The Arctic Lands) to meet the Tundra Bear.',
    backdropGradient: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 55%, #334155 100%)',
    groundColor: '#334155',
    groundTrimColor: '#e2e8f0',
    accentColor: '#d97706',
    trackDefeats: true,
  },
  {
    id: 'cockatrice',
    name: 'ANCIENT COCKATRICE',
    subtitle: 'Sovereign Tyrant of the Skies',
    category: 'boss',
    firstSeenLevel: 30,
    habitat: 'World 6 · The Cockatrice Lair',
    threatRank: 'APEX BOSS',
    hpLabel: '200 HP',
    damageLabel: '2 HEARTS',
    speedLabel: '3 RAGE PHASES',
    lore: 'A colossal serpent-winged monarch born of ancient ember and avian wrath. Long ago it cast a blood-red storm over the Green Fields, commanding packs of wolves, foxes, and bears to keep challengers from its summit arena. Only a hero wielding Silkie Sam’s Royal Shield and Netherite Blade can shatter its armored scales.',
    combatTip: 'Hold Block (S / Down) for 5 seconds to withstand Inferno Flame and deflect fireballs. Clear its summoned beasts first, then strike with your sword during bite and claw lunges.',
    discoveryHint: 'Reach Stage 30 (World 6: The End) and face the tyrant in The Cockatrice Lair.',
    backdropGradient: 'linear-gradient(180deg, #450a0a 0%, #7f1d1d 52%, #991b1b 100%)',
    groundColor: '#14532d',
    groundTrimColor: '#22c55e',
    accentColor: '#facc15',
    trackDefeats: true,
  },
  {
    id: 'volcano',
    name: 'MAGMA VENT',
    subtitle: 'Erupting Caldera Hazard',
    category: 'hazard',
    firstSeenLevel: 11,
    habitat: 'World 4 · The Jungle Lands',
    threatRank: 'HAZARD',
    hpLabel: 'INDESTRUCTIBLE',
    damageLabel: '1 HEART',
    speedLabel: 'CYCLIC',
    lore: 'Fractured volcanic cones simmering beneath the jungle ruins. Fueled by the Cockatrice’s unnatural heat, these vents swell with rumbling orange pressure before blasting arcs of molten rock skyward. Once the tyrant falls, the vents cool into peaceful moss-draped stone.',
    combatTip: 'Watch the glowing caldera rim during the tremor phase. Sprint past during the brief cooldown right after the lava plume subsides.',
    discoveryHint: 'Explore Stage 11 (World 4: The Jungle Lands) to witness an active Magma Vent.',
    backdropGradient: 'linear-gradient(180deg, #1c1917 0%, #431407 55%, #7c2d12 100%)',
    groundColor: '#292524',
    groundTrimColor: '#57534e',
    accentColor: '#f97316',
    trackDefeats: false,
  },
  {
    id: 'boulder',
    name: 'TEMPLE BOULDER',
    subtitle: 'Crushing Stone Trap',
    category: 'hazard',
    firstSeenLevel: 13,
    habitat: 'Worlds 4 & 5 · Ruins & Peaks',
    threatRank: 'HAZARD',
    hpLabel: 'INDESTRUCTIBLE',
    damageLabel: '1 HEART',
    speedLabel: 'ROLLING',
    lore: 'Weathered granite spheres rigged inside ancient overhead temple chutes and icy mountain canopies. Triggered by footstep vibrations, they drop without mercy and barrel down narrow ledges before shattering into rubble.',
    combatTip: 'Pause beneath overhead stone chutes to bait the drop, or time a high arc jump cleanly over the oncoming sphere.',
    discoveryHint: 'Navigate Stage 13 (World 4: The Jungle Lands) to trigger a Temple Boulder.',
    backdropGradient: 'linear-gradient(180deg, #1e293b 0%, #334155 55%, #475569 100%)',
    groundColor: '#44403c',
    groundTrimColor: '#a8a29e',
    accentColor: '#cbd5e1',
    trackDefeats: false,
  },
  {
    id: 'thundercloud',
    name: 'STORMCLOUD',
    subtitle: 'Tracking Lightning Cell',
    category: 'hazard',
    firstSeenLevel: 20,
    habitat: 'World 5 · The Arctic Lands',
    threatRank: 'HAZARD',
    hpLabel: 'ETHEREAL',
    damageLabel: '1 HEART',
    speedLabel: 'TRACKING',
    lore: 'Brooding cumulonimbus squalls infused with the Cockatrice’s tempest magic. Unlike ordinary mountain weather, these dark cells drift overhead, lock a crimson targeting beam onto travelers below, and unleash blinding vertical bolts of lightning.',
    combatTip: 'Keep moving whenever the red targeting reticle flashes beneath your feet. Step clear just before the cloud discharges its bolt.',
    discoveryHint: 'Brave the gale in Stage 20 (World 5: The Arctic Lands) to encounter a Stormcloud.',
    backdropGradient: 'linear-gradient(180deg, #020617 0%, #0f172a 55%, #1e293b 100%)',
    groundColor: '#1e293b',
    groundTrimColor: '#38bdf8',
    accentColor: '#38bdf8',
    trackDefeats: false,
  },
];

const VALID_IDS = new Set<string>(BESTIARY_ENTRIES.map(e => e.id));

export function isValidBestiaryId(id: string): id is BestiaryEntryId {
  return VALID_IDS.has(id);
}

/**
 * Returns the set of all Bestiary entries the player has discovered.
 * Combines live recorded encounters with automatic progression backfill
 * for stages the player has already conquered (or completed game).
 */
export function getEncounteredBestiarySet(saveData: SaveData): Set<BestiaryEntryId> {
  const discovered = new Set<BestiaryEntryId>();

  if (Array.isArray(saveData.encounteredEnemies)) {
    for (const rawId of saveData.encounteredEnemies) {
      if (isValidBestiaryId(rawId)) {
        discovered.add(rawId);
      }
    }
  }

  const unlockedLevel = saveData.unlockedLevel || 1;
  const completedGame = Boolean(saveData.hasCompletedGame);

  for (const entry of BESTIARY_ENTRIES) {
    if (completedGame || unlockedLevel > entry.firstSeenLevel) {
      discovered.add(entry.id);
    }
  }

  return discovered;
}

export function getBestiaryProgress(saveData: SaveData): { discovered: number; total: number } {
  const set = getEncounteredBestiarySet(saveData);
  return {
    discovered: set.size,
    total: BESTIARY_ENTRIES.length,
  };
}
