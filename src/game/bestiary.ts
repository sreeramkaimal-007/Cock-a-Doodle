import { SaveData } from './types';

export type BestiaryEntryId =
  | 'wolf'
  | 'fox'
  | 'snake'
  | 'bear'
  | 'cockatrice'
  | 'volcano'
  | 'boulder'
  | 'thundercloud'
  | 'sheep'
  | 'monkey'
  | 'hare'
  | 'butterfly'
  | 'dragonfly'
  | 'honeybee'
  | 'ladybug';

export type BestiaryCategory = 'creature' | 'boss' | 'hazard' | 'wildlife';

export interface BestiaryColorVariant {
  name: string;
  swatch: string;
}

export interface BestiaryEntry {
  id: BestiaryEntryId;
  name: string;
  scientificName: string;
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
  requiresBossDefeat?: boolean;
  colorVariants?: BestiaryColorVariant[];
  hasBabyForm?: boolean;
  babyName?: string;
  babyDescription?: string;
}

export const BESTIARY_ENTRIES: BestiaryEntry[] = [
  // ─── HOSTILE CREATURES ───
  {
    id: 'wolf',
    name: 'TIMBER WOLF',
    scientificName: 'Canis lupus',
    subtitle: 'Pack Stalker of the Heat Up',
    category: 'creature',
    firstSeenLevel: 10,
    habitat: 'World 3 · The Heat Up',
    threatRank: 'CLASS II',
    hpLabel: '2 HP',
    damageLabel: '1 HEART',
    speedLabel: 'MEDIUM',
    lore: 'Lean, muscular pack predators that prowl the rocky ridges beyond the coop. Driven out of the northern forests by the Cockatrice’s crimson skies, Timber Wolves appear in four natural coats—Timber Grey, Arctic White, Cinnamon Russet, and rare Melanistic Black—patrolling narrow ledges before lunging at stray feathers.',
    combatTip: 'Leap squarely onto their back for a crushing stomp, or strike as soon as they turn at the edge of their patrol route.',
    discoveryHint: 'Reach Stage 10 (World 3: The Heat Up) and cross paths with a Timber Wolf.',
    backdropGradient: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 55%, #4c1d95 100%)',
    groundColor: '#3f3f46',
    groundTrimColor: '#71717a',
    accentColor: '#94a3b8',
    trackDefeats: true,
    colorVariants: [
      { name: 'Timber Grey', swatch: '#475569' },
      { name: 'Arctic White', swatch: '#e2e8f0' },
      { name: 'Cinnamon Russet', swatch: '#7c4a2d' },
      { name: 'Melanistic Black', swatch: '#1f242d' },
    ],
  },
  {
    id: 'fox',
    name: 'CUNNING FOX',
    scientificName: 'Vulpes vulpes',
    subtitle: 'Crimson Dasher of the Canopy',
    category: 'creature',
    firstSeenLevel: 14,
    habitat: 'World 4 · The Jungle Lands',
    threatRank: 'CLASS III',
    hpLabel: '3 HP',
    damageLabel: '1 HEART',
    speedLabel: 'FAST',
    lore: 'Lightning-quick vulpine ambushers recognizable by their slender black stocking legs and white-tipped brush tails. Wild populations range from classic Red Foxes to sleek Silver, banded Cross, and pale Arctic morphs. Silkie Sam insists one even tried to swipe his apron.',
    combatTip: 'They close distance far faster than wolves. Jump early to dodge their burst dash, then counter with a quick sword swing or double stomp.',
    discoveryHint: 'Venture into Stage 14 (World 4: The Jungle Lands) to encounter the Cunning Fox.',
    backdropGradient: 'linear-gradient(180deg, #064e3b 0%, #065f46 55%, #14532d 100%)',
    groundColor: '#365314',
    groundTrimColor: '#65a30d',
    accentColor: '#fb923c',
    trackDefeats: true,
    colorVariants: [
      { name: 'Red Fox', swatch: '#ea580c' },
      { name: 'Silver Fox', swatch: '#27272a' },
      { name: 'Cross Fox', swatch: '#c2591a' },
      { name: 'Arctic White', swatch: '#f1f5f9' },
    ],
  },
  {
    id: 'snake',
    name: 'JUNGLE VIPER',
    scientificName: 'Bothriechis viridis',
    subtitle: 'Venomous Stalker of the Canopy Floor',
    category: 'creature',
    firstSeenLevel: 12,
    habitat: 'World 4 · The Jungle Lands',
    threatRank: 'CLASS III · VENOM',
    hpLabel: '2 HP',
    damageLabel: 'POISON (50% HP)',
    speedLabel: 'AGILE',
    lore: 'Sinuous rainforest pit vipers that glide silently across mossy jungle ruins in four vivid natural morphs—Emerald Viper, Golden Eyelash, Jungle Coral, and Rainforest Bushmaster. Found exclusively in the Jungle Lands and summoned by the Ancient Cockatrice, their hollow fangs inject slow-acting neurotoxic venom that steadily drains half of a hero’s vitality.',
    combatTip: 'Watch for their flickering tongue and low slithering profile. Block with a shield to deflect fangs, stomp squarely from above, or slash cleanly before their venom takes hold—heart chests cure active poison.',
    discoveryHint: 'Explore Stage 12 (World 4: The Jungle Lands) to encounter the venomous Jungle Viper.',
    backdropGradient: 'linear-gradient(180deg, #052e16 0%, #14532d 55%, #166534 100%)',
    groundColor: '#1c2b16',
    groundTrimColor: '#4ade80',
    accentColor: '#22c55e',
    trackDefeats: true,
    colorVariants: [
      { name: 'Emerald Viper', swatch: '#15803d' },
      { name: 'Golden Eyelash', swatch: '#d97706' },
      { name: 'Jungle Coral', swatch: '#dc2626' },
      { name: 'Rainforest Bushmaster', swatch: '#5c4033' },
    ],
  },
  {
    id: 'bear',
    name: 'TUNDRA BEAR',
    scientificName: 'Ursus arctos',
    subtitle: 'Armored Juggernaut of the Peaks',
    category: 'creature',
    firstSeenLevel: 20,
    habitat: 'World 5 · The Arctic Lands',
    threatRank: 'CLASS IV',
    hpLabel: '6 HP',
    damageLabel: '2 HEARTS',
    speedLabel: 'HEAVY',
    lore: 'Towering ursine titans built with a heavy muscular shoulder hump and curved digging claws. From Grizzly Brown and Kodiak Cinnamon to glacial Polar White and Black Bear morphs, their thick winter coats shrug off glancing blows along Mount Cluckmore’s frozen cliffs.',
    combatTip: 'Bring an upgraded sword and sturdy armor. Strike once, retreat past their heavy slam reach, and punish their slow turn-around.',
    discoveryHint: 'Ascend to Stage 20 (World 5: The Arctic Lands) to meet the Tundra Bear.',
    backdropGradient: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 55%, #334155 100%)',
    groundColor: '#334155',
    groundTrimColor: '#e2e8f0',
    accentColor: '#d97706',
    trackDefeats: true,
    colorVariants: [
      { name: 'Grizzly Brown', swatch: '#4a2511' },
      { name: 'Kodiak Cinnamon', swatch: '#78350f' },
      { name: 'Polar White', swatch: '#e2e8f0' },
      { name: 'Black Bear', swatch: '#1e1b18' },
    ],
  },

  // ─── APEX BOSS ───
  {
    id: 'cockatrice',
    name: 'ANCIENT COCKATRICE',
    scientificName: 'Dracogallus rex',
    subtitle: 'Sovereign Tyrant of the Skies',
    category: 'boss',
    firstSeenLevel: 30,
    habitat: 'World 6 · The Cockatrice Lair',
    threatRank: 'APEX BOSS',
    hpLabel: '200 HP',
    damageLabel: '2 HEARTS',
    speedLabel: '3 RAGE PHASES',
    lore: 'A colossal serpent-winged monarch armored in iridescent jade scales and crowned with a blazing crimson comb. Long ago it cast a blood-red storm over the Green Fields, commanding packs of wolves, foxes, venomous jungle snakes, and bears to keep challengers from its summit arena. Only a hero wielding Silkie Sam’s Royal Shield and Netherite Blade can shatter its scales.',
    combatTip: 'Hold Block (S / Down) for 5 seconds to withstand Inferno Flame and deflect fireballs. Clear its summoned beasts first, then strike with your sword during bite and claw lunges.',
    discoveryHint: 'Reach Stage 30 (World 6: The End) and face the tyrant in The Cockatrice Lair.',
    backdropGradient: 'linear-gradient(180deg, #450a0a 0%, #7f1d1d 52%, #991b1b 100%)',
    groundColor: '#14532d',
    groundTrimColor: '#22c55e',
    accentColor: '#facc15',
    trackDefeats: true,
  },

  // ─── STAGE HAZARDS ───
  {
    id: 'volcano',
    name: 'MAGMA VENT',
    scientificName: 'Geothermal Fissure',
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
    scientificName: 'Granite Monolith Trap',
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
    scientificName: 'Cumulonimbus fulgur',
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

  // ─── BACKGROUND WILDLIFE ───
  {
    id: 'sheep',
    name: 'PASTURE SHEEP',
    scientificName: 'Ovis aries',
    subtitle: 'Wandering Grazers & Lambs of the Meadows',
    category: 'wildlife',
    firstSeenLevel: 1,
    habitat: 'Worlds 1–3 · Coop & Pastures',
    threatRank: 'PEACEFUL',
    hpLabel: 'PEACEFUL',
    damageLabel: 'NONE',
    speedLabel: 'WANDERING',
    lore: 'Heritage pasture flocks—including Suffolk Blackface, Merino Cream, Jacob Spotted, and silver Herdwick ewes—that roam freely across the rolling hills behind the chicken coop, pausing to nibble clover or rest in the sun. Tiny woolly lambs stay close beside their mothers, inheriting their flock’s fleece colors and copying every graze and hop.',
    combatTip: 'Completely harmless neighbors! Toggle Baby View above to inspect a Pasture Lamb, and revisit early meadows after defeating the Cockatrice to watch the whole flock cheer.',
    discoveryHint: 'Begin your adventure on Stage 1 (World 1: The Start) to spot Pasture Sheep and their lambs wandering the hills.',
    backdropGradient: 'linear-gradient(180deg, #0284c7 0%, #38bdf8 55%, #7dd3fc 100%)',
    groundColor: '#15803d',
    groundTrimColor: '#4ade80',
    accentColor: '#f8fafc',
    trackDefeats: false,
    hasBabyForm: true,
    babyName: 'Pasture Lamb',
    babyDescription: 'Baby lambs sport softer, rounder fleece puffs, shorter legs, and floppy ears. They toddle playfully beside their mothers through the meadow clover and leap twice as high when cheering!',
    colorVariants: [
      { name: 'Suffolk Blackface', swatch: '#f8fafc' },
      { name: 'Merino Cream', swatch: '#fef3c7' },
      { name: 'Jacob Spotted', swatch: '#78350f' },
      { name: 'Herdwick Silver', swatch: '#9ca3af' },
    ],
  },
  {
    id: 'monkey',
    name: 'JUNGLE MONKEY',
    scientificName: 'Cebus & Leontopithecus',
    subtitle: 'Canopy Squeakers & Banana Foragers',
    category: 'wildlife',
    firstSeenLevel: 11,
    habitat: 'World 4 · The Jungle Lands',
    threatRank: 'PEACEFUL',
    hpLabel: 'PEACEFUL',
    damageLabel: 'NONE',
    speedLabel: 'CLIMBING',
    lore: 'Playful canopy troops spanning White-Headed Capuchins, Golden Lion Tamarins, Chestnut Macaques, and Dusky Spider Monkeys. They chatter and squeak from tropical palm branches, climb down the trunks to stroll along the jungle floor, lounge in the shade, and munch ripe golden bananas with their young.',
    combatTip: 'Harmless jungle neighbors who stay clear of danger—and throw a full treetop celebration with their babies once the Cockatrice is defeated!',
    discoveryHint: 'Reach Stage 11 (World 4: The Jungle Lands) to spot monkeys squeaking in the trees and walking the jungle floor.',
    backdropGradient: 'linear-gradient(180deg, #064e3b 0%, #047857 55%, #15803d 100%)',
    groundColor: '#3f6212',
    groundTrimColor: '#84cc16',
    accentColor: '#fbbf24',
    trackDefeats: false,
    hasBabyForm: true,
    babyName: 'Baby Monkey',
    babyDescription: 'Tiny wide-eyed baby monkeys have oversized round ears, a fluffy crown tuft, and a tight curly tail. They perch beside adults on branches, squeak curiously, and scamper down to share banana bites.',
    colorVariants: [
      { name: 'Capuchin', swatch: '#5c2d16' },
      { name: 'Golden Tamarin', swatch: '#d97706' },
      { name: 'Chestnut Macaque', swatch: '#7c3f1d' },
      { name: 'Spider Monkey', swatch: '#292524' },
    ],
  },
  {
    id: 'hare',
    name: 'SNOWSHOE HARE',
    scientificName: 'Lepus americanus',
    subtitle: 'Frost-Footed Diggers of the Alpine Snow',
    category: 'wildlife',
    firstSeenLevel: 20,
    habitat: 'World 5 · The Arctic Lands',
    threatRank: 'PEACEFUL',
    hpLabel: 'PEACEFUL',
    damageLabel: 'NONE',
    speedLabel: 'FORAGING',
    lore: 'Nimble alpine hares with oversized furry hind paws and iconic ink-black ear tips. Shifting naturally between Pure Winter White, tawny Spring Molt, and Frost Silver coats, they hop across World 5’s snowdrifts, dig through fresh snow to uncover hidden green alpine grass, nibble the tender blades, and curl into cozy snow loaves to rest.',
    combatTip: 'Harmless mountain locals! Watch for flying puffs of snow when they dig for buried grass, and toggle Baby View above to see a tiny Baby Leveret.',
    discoveryHint: 'Climb into Stage 20 (World 5: The Arctic Lands) to spot Snowshoe Hares digging and resting in the snow.',
    backdropGradient: 'linear-gradient(180deg, #0f172a 0%, #1e3a8a 55%, #3b82f6 100%)',
    groundColor: '#cbd5e1',
    groundTrimColor: '#ffffff',
    accentColor: '#f472b6',
    trackDefeats: false,
    hasBabyForm: true,
    babyName: 'Baby Leveret',
    babyDescription: 'Born fully furred with bright dark eyes and proportionally big black-tipped ears, baby leverets mimic adults by hopping over drifts, digging tiny grass patches, and curling up warmly in the snow.',
    colorVariants: [
      { name: 'Winter White', swatch: '#ffffff' },
      { name: 'Spring Molt', swatch: '#a16236' },
      { name: 'Frost Silver', swatch: '#cbd5e1' },
    ],
  },
  {
    id: 'butterfly',
    name: 'SANCTUARY BUTTERFLY',
    scientificName: 'Lepidoptera (4 Species)',
    subtitle: 'Winged Herald of Restored Skies',
    category: 'wildlife',
    firstSeenLevel: 30,
    habitat: 'World 6 · Green Fields Sanctuary',
    threatRank: 'PEACEFUL',
    hpLabel: 'PEACEFUL',
    damageLabel: 'NONE',
    speedLabel: 'FLUTTERING',
    lore: 'Dazzling Monarchs, Blue Morphos, Emerald Swallowtails, and Clouded Sulphurs that vanished for years under the Cockatrice’s crimson storm. The instant the tyrant falls and sunlight floods the Green Fields, butterflies return to dance over the wildflowers.',
    combatTip: 'A living sign of victory! Revisit Stage 30 after defeating the Cockatrice to enjoy their colorful flight.',
    discoveryHint: 'Defeat the Ancient Cockatrice on Stage 30 to restore the Green Fields and welcome the butterflies.',
    backdropGradient: 'linear-gradient(180deg, #0284c7 0%, #38bdf8 55%, #bae6fd 100%)',
    groundColor: '#15803d',
    groundTrimColor: '#4ade80',
    accentColor: '#ea580c',
    trackDefeats: false,
    requiresBossDefeat: true,
    colorVariants: [
      { name: 'Monarch', swatch: '#ea580c' },
      { name: 'Blue Morpho', swatch: '#0284c7' },
      { name: 'Swallowtail', swatch: '#059669' },
      { name: 'Clouded Sulphur', swatch: '#eab308' },
    ],
  },
  {
    id: 'dragonfly',
    name: 'AZURE DRAGONFLY',
    scientificName: 'Anax imperator',
    subtitle: 'Shimmering Brook Skimmer',
    category: 'wildlife',
    firstSeenLevel: 30,
    habitat: 'World 6 · Green Fields Sanctuary',
    threatRank: 'PEACEFUL',
    hpLabel: 'PEACEFUL',
    damageLabel: 'NONE',
    speedLabel: 'HOVERING',
    lore: 'Iridescent Azure Emperors, Emerald Darners, and Scarlet Skimmers with veined translucent double wings that dart and hover above the sparkling streams of the restored sanctuary. Local legend says their shimmering tails only glow when the mountain air is completely free of ember smoke.',
    combatTip: 'Purely peaceful sanctuary wildlife—hovering gracefully near the water whenever calm returns to Mount Cluckmore.',
    discoveryHint: 'Defeat the Ancient Cockatrice on Stage 30 to see Azure Dragonflies return to the sanctuary.',
    backdropGradient: 'linear-gradient(180deg, #0369a1 0%, #0ea5e9 55%, #7dd3fc 100%)',
    groundColor: '#0e7490',
    groundTrimColor: '#67e8f9',
    accentColor: '#38bdf8',
    trackDefeats: false,
    requiresBossDefeat: true,
    colorVariants: [
      { name: 'Azure Emperor', swatch: '#0284c7' },
      { name: 'Emerald Darner', swatch: '#059669' },
      { name: 'Scarlet Skimmer', swatch: '#dc2626' },
    ],
  },
  {
    id: 'honeybee',
    name: 'GOLDEN HONEYBEE',
    scientificName: 'Apis mellifera & Bombus',
    subtitle: 'Busy Pollinator of the Sunflowers',
    category: 'wildlife',
    firstSeenLevel: 30,
    habitat: 'World 6 · Green Fields Sanctuary',
    threatRank: 'PEACEFUL',
    hpLabel: 'PEACEFUL',
    damageLabel: 'NONE',
    speedLabel: 'BUZZING',
    lore: 'Fuzzy Golden Italian Honeybees, dark Carniolan foragers, and plump Alpine Bumblebees carrying golden pollen baskets as they orbit the sunflowers of the Green Fields. Silkie Sam swears their wildflower honey is the secret ingredient behind his famous golden biscuits.',
    combatTip: 'Too busy gathering nectar to bother passing heroes! Look for them humming around the sunlit blooms after your final victory.',
    discoveryHint: 'Defeat the Ancient Cockatrice on Stage 30 to bring Golden Honeybees back to the sunflowers.',
    backdropGradient: 'linear-gradient(180deg, #0284c7 0%, #38bdf8 52%, #fef08a 100%)',
    groundColor: '#15803d',
    groundTrimColor: '#facc15',
    accentColor: '#facc15',
    trackDefeats: false,
    requiresBossDefeat: true,
    colorVariants: [
      { name: 'Italian Honeybee', swatch: '#facc15' },
      { name: 'Carniolan Bee', swatch: '#d97706' },
      { name: 'Alpine Bumblebee', swatch: '#fef08a' },
    ],
  },
  {
    id: 'ladybug',
    name: 'MEADOW LADYBUG',
    scientificName: 'Coccinellidae (3 Morphs)',
    subtitle: 'Lucky Spotted Grass Dweller',
    category: 'wildlife',
    firstSeenLevel: 30,
    habitat: 'World 6 · Green Fields Sanctuary',
    threatRank: 'PEACEFUL',
    hpLabel: 'PEACEFUL',
    damageLabel: 'NONE',
    speedLabel: 'CRAWLING',
    lore: 'Tiny glossy beetles—ranging from classic Seven-Spot Crimson to Golden Twenty-Two-Spot and Harlequin Orange morphs—that perch along fresh grass blades in the peaceful sanctuary. Among coop elders, spotting a Meadow Ladybug is considered the highest omen of good fortune.',
    combatTip: 'Look closely along the bright green grass blades after restoring the sanctuary to spot these lucky little friends.',
    discoveryHint: 'Defeat the Ancient Cockatrice on Stage 30 to spot Meadow Ladybugs resting in the grass.',
    backdropGradient: 'linear-gradient(180deg, #0284c7 0%, #38bdf8 55%, #bbf7d0 100%)',
    groundColor: '#166534',
    groundTrimColor: '#22c55e',
    accentColor: '#ef4444',
    trackDefeats: false,
    requiresBossDefeat: true,
    colorVariants: [
      { name: 'Seven-Spot Red', swatch: '#dc2626' },
      { name: 'Golden 22-Spot', swatch: '#facc15' },
      { name: 'Harlequin Orange', swatch: '#f97316' },
    ],
  },
];

const VALID_IDS = new Set<string>(BESTIARY_ENTRIES.map(e => e.id));

export function isValidBestiaryId(id: string): id is BestiaryEntryId {
  return VALID_IDS.has(id);
}

/**
 * Returns the set of all Bestiary entries the player has discovered.
 * Combines live recorded encounters with automatic progression backfill
 * for stages and biomes the player has already explored.
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
    if (entry.requiresBossDefeat) {
      if (completedGame) {
        discovered.add(entry.id);
      }
      continue;
    }

    if (
      completedGame ||
      unlockedLevel > entry.firstSeenLevel ||
      (entry.firstSeenLevel === 1 && saveData.hasSeenIntro)
    ) {
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
