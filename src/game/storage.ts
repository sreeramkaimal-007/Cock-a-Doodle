import { SaveData, ArmorType, SwordType, ChickenGender } from './types';
import { CHICKEN_SKINS } from './skins';

const SAVE_KEY = 'chick_jumpers_save_v1';

const DEFAULT_SAVE: SaveData = {
  unlockedLevel: 1,
  totalCoins: 0,
  armor: 'none',
  sword: 'none',
  gender: 'rooster',
  hasSeenIntro: false,
  hasCompletedGame: false,
  levelCoinsCollected: {},
  soundEnabled: true,
  musicEnabled: true,
  hasVisitedShop: false,
  hasSeenSamLevel1Joke: false,
  hasClaimedBossReward: false,
  shopClosedUntil: Date.now() + 2 * 60 * 60 * 1000, // Closed for at least 2 hours as requested
  selectedSkin: 'classic',
  unlockedSkins: ['classic'],
  difficulty: 'normal',
  collectedCoinIds: [],
  activatedCheckpointIds: [],
};

export function loadSaveData(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    const parsed = JSON.parse(raw);
    const validSkins: string[] = CHICKEN_SKINS.map(s => s.id);
    const selectedSkin = validSkins.includes(parsed.selectedSkin) ? parsed.selectedSkin : 'classic';
    const unlockedSkins = Array.isArray(parsed.unlockedSkins) 
      ? Array.from(new Set(['classic', ...parsed.unlockedSkins.filter((s: string) => validSkins.includes(s))]))
      : ['classic'];

    const validDiff = ['easy', 'normal', 'hard'].includes(parsed.difficulty) ? parsed.difficulty : 'normal';

    return {
      unlockedLevel: typeof parsed.unlockedLevel === 'number' ? Math.max(1, Math.min(30, parsed.unlockedLevel)) : 1,
      totalCoins: typeof parsed.totalCoins === 'number' ? parsed.totalCoins : 0,
      armor: (['none', 'iron', 'gold', 'diamond'].includes(parsed.armor) ? parsed.armor : 'none') as ArmorType,
      sword: (['none', 'iron', 'gold', 'diamond', 'netherite'].includes(parsed.sword) ? parsed.sword : 'none') as SwordType,
      preBossSword: (['none', 'iron', 'gold', 'diamond'].includes(parsed.preBossSword) ? parsed.preBossSword : (parsed.sword !== 'netherite' ? parsed.sword : 'diamond')) as SwordType,
      gender: (parsed.gender === 'hen' ? 'hen' : 'rooster') as ChickenGender,
      hasSeenIntro: Boolean(parsed.hasSeenIntro),
      hasCompletedGame: Boolean(parsed.hasCompletedGame),
      levelCoinsCollected: parsed.levelCoinsCollected && typeof parsed.levelCoinsCollected === 'object' ? parsed.levelCoinsCollected : {},
      soundEnabled: parsed.soundEnabled !== undefined ? Boolean(parsed.soundEnabled) : true,
      musicEnabled: parsed.musicEnabled !== undefined ? Boolean(parsed.musicEnabled) : true,
      claimedQuests: parsed.claimedQuests && typeof parsed.claimedQuests === 'object' ? parsed.claimedQuests : {},
      unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [],
      stats: parsed.stats && typeof parsed.stats === 'object' ? parsed.stats : {
        enemiesDefeated: 0,
        trapsTriggered: 0,
        projectilesDeflected: 0,
        levelsClearedWithoutDamage: 0,
        visitedCoopEvolved: false,
        shopPurchases: 0
      },
      hasVisitedShop: Boolean(parsed.hasVisitedShop),
      hasSeenSamLevel1Joke: Boolean(parsed.hasSeenSamLevel1Joke),
      hasClaimedBossReward: Boolean(parsed.hasClaimedBossReward),
      shopClosedUntil: typeof parsed.shopClosedUntil === 'number' ? parsed.shopClosedUntil : Date.now() + 2 * 60 * 60 * 1000,
      selectedSkin: selectedSkin as any,
      unlockedSkins: unlockedSkins as any,
      difficulty: validDiff as any,
      collectedCoinIds: Array.isArray(parsed.collectedCoinIds) ? parsed.collectedCoinIds : [],
      activatedCheckpointIds: Array.isArray(parsed.activatedCheckpointIds) ? parsed.activatedCheckpointIds : [],
      upgrades: parsed.upgrades && typeof parsed.upgrades === 'object' ? parsed.upgrades : {
        extraHearts: 0,
        speedBoost: 0,
        jumpBoost: 0,
        coinMagnet: false,
        reviveToken: false,
        luckyCorn: 0,
        ironBeak: 0,
        fluffyGlider: false,
        goldenPlumage: false
      },
    };
  } catch (err) {
    console.error('Failed to load save data:', err);
    return { ...DEFAULT_SAVE };
  }
}

export function saveSaveData(data: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to write save data:', err);
  }
}

export function clearSaveData(): SaveData {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (err) {
    console.error('Failed to remove save data:', err);
  }
  return { ...DEFAULT_SAVE };
}
