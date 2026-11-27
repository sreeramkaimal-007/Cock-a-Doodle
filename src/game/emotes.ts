import { EmoteId, SaveData } from './types';

export interface EmoteDefinition {
  id: EmoteId;
  name: string;
  shortLabel: string;
  description: string;
  requiredPurchases: number;
  milestoneLabel: string;
  hotkey: string;
  duration: number;
  accentColor: string;
  bubbleText: string;
}

export const EMOTES: EmoteDefinition[] = [
  {
    id: 'squawk',
    name: 'Squawk!',
    shortLabel: 'SQUAWK',
    description: 'Belt out a loud barnyard squawk with rippling pixel sound waves.',
    requiredPurchases: 0,
    milestoneLabel: 'STARTER EMOTE',
    hotkey: '1',
    duration: 3.1,
    accentColor: '#facc15',
    bubbleText: 'SQUAWK!',
  },
  {
    id: 'happy_hop',
    name: 'Happy Hop',
    shortLabel: 'HOP',
    description: 'Bounce joyfully in place with sparkling stars and cheerful hops.',
    requiredPurchases: 1,
    milestoneLabel: '1 SHOP PURCHASE',
    hotkey: '2',
    duration: 3.3,
    accentColor: '#4ade80',
    bubbleText: 'YAY!',
  },
  {
    id: 'angry_ruffle',
    name: 'Angry Ruffle',
    shortLabel: 'RUFFLE',
    description: 'Puff up your feathers in fury with pixel steam puffs and flying down.',
    requiredPurchases: 2,
    milestoneLabel: '2 SHOP PURCHASES',
    hotkey: '3',
    duration: 3.2,
    accentColor: '#f87171',
    bubbleText: 'GRRR!',
  },
  {
    id: 'heart_flutter',
    name: 'Heart Flutter',
    shortLabel: 'HEART',
    description: 'Flutter your wings sweetly while pixel hearts float into the air.',
    requiredPurchases: 4,
    milestoneLabel: '4 SHOP PURCHASES',
    hotkey: '4',
    duration: 3.4,
    accentColor: '#f472b6',
    bubbleText: 'CLUCK ♥',
  },
  {
    id: 'royal_strut',
    name: 'Royal Strut',
    shortLabel: 'STRUT',
    description: 'Puff out your chest beneath a floating pixel crown and golden glints.',
    requiredPurchases: 6,
    milestoneLabel: '6 SHOP PURCHASES',
    hotkey: '5',
    duration: 3.5,
    accentColor: '#fbbf24',
    bubbleText: 'ROYAL!',
  },
  {
    id: 'golden_crow',
    name: 'Golden Crow',
    shortLabel: 'CROW',
    description: 'Radiate pixel sunbeams and drifting musical notes in a heroic crow.',
    requiredPurchases: 9,
    milestoneLabel: '9 SHOP PURCHASES',
    hotkey: '6',
    duration: 3.6,
    accentColor: '#fde047',
    bubbleText: 'DOODLE-DOO!',
  },
];

export const MAX_EMOTE_MILESTONE_PURCHASES = Math.max(...EMOTES.map(e => e.requiredPurchases));

export function getEmoteDefinition(id: EmoteId): EmoteDefinition {
  return EMOTES.find(e => e.id === id) || EMOTES[0];
}

export function getShopPurchaseCount(saveData: SaveData): number {
  return Math.max(0, saveData.stats?.shopPurchases || 0);
}

export function isEmoteUnlocked(emoteId: EmoteId, saveData: SaveData): boolean {
  const def = getEmoteDefinition(emoteId);
  if (def.requiredPurchases <= 0) return true;
  if (getShopPurchaseCount(saveData) >= def.requiredPurchases) return true;
  return Boolean(saveData.unlockedEmotes?.includes(emoteId));
}

export function getUnlockedEmotes(saveData: SaveData): EmoteId[] {
  return EMOTES.filter(e => isEmoteUnlocked(e.id, saveData)).map(e => e.id);
}

export function getNewlyUnlockedEmotes(prevPurchases: number, nextPurchases: number): EmoteDefinition[] {
  return EMOTES.filter(
    e => e.requiredPurchases > prevPurchases && e.requiredPurchases <= nextPurchases
  );
}

export function getNextEmoteMilestone(saveData: SaveData): {
  emote: EmoteDefinition;
  remaining: number;
  current: number;
} | null {
  const purchases = getShopPurchaseCount(saveData);
  const next = EMOTES.find(e => !isEmoteUnlocked(e.id, saveData));
  if (!next) return null;
  return {
    emote: next,
    remaining: Math.max(0, next.requiredPurchases - purchases),
    current: purchases,
  };
}
