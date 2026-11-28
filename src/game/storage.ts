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
  hasFinishedEntireGame: false,
  hasDefeatedFarmerBoss: false,
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
  openedChestIds: [],
  defeatedWorldEnemyIds: [],
  encounteredEnemies: [],
  enemyDefeatCounts: {},
  unlockedEmotes: ['squawk'],
  hasBrush: false,
  hasAxe: false,
  unlockedArmors: [],
  unlockedSwords: [],
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

    const rawUnlocked = typeof parsed.unlockedLevel === 'number' ? Math.max(1, Math.min(40, parsed.unlockedLevel)) : 1;
    const effectiveUnlocked = parsed.hasCompletedGame ? Math.max(31, rawUnlocked) : rawUnlocked;

    const validSwords: SwordType[] = ['none', 'iron', 'gold', 'diamond', 'coral', 'netherite'];
    const parsedSword: SwordType = validSwords.includes(parsed.sword) ? parsed.sword : 'none';
    const parsedUnlockedSwords: SwordType[] = Array.isArray(parsed.unlockedSwords)
      ? Array.from(new Set(parsed.unlockedSwords.filter((s: unknown) => typeof s === 'string' && ['iron', 'gold', 'diamond', 'coral', 'netherite'].includes(s)))) as SwordType[]
      : (parsedSword !== 'none' ? [parsedSword] : []);
    if (parsedSword !== 'none' && !parsedUnlockedSwords.includes(parsedSword)) {
      parsedUnlockedSwords.push(parsedSword);
    }

    return {
      unlockedLevel: effectiveUnlocked,
      totalCoins: typeof parsed.totalCoins === 'number' ? parsed.totalCoins : 0,
      armor: (['none', 'iron', 'gold', 'diamond', 'netherite', 'coral'].includes(parsed.armor) ? parsed.armor : 'none') as ArmorType,
      sword: parsedSword,
      preBossSword: (['none', 'iron', 'gold', 'diamond', 'coral'].includes(parsed.preBossSword) ? parsed.preBossSword : (parsedSword !== 'netherite' ? parsedSword : 'diamond')) as SwordType,
      gender: (parsed.gender === 'hen' ? 'hen' : 'rooster') as ChickenGender,
      hasSeenIntro: Boolean(parsed.hasSeenIntro),
      hasCompletedGame: Boolean(parsed.hasCompletedGame),
      hasFinishedEntireGame: Boolean(parsed.hasFinishedEntireGame),
      hasDefeatedFarmerBoss: parsed.hasDefeatedFarmerBoss !== undefined
        ? Boolean(parsed.hasDefeatedFarmerBoss)
        : Boolean((parsed.enemyDefeatCounts?.farmer || 0) > 0 && effectiveUnlocked >= 20),
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
      openedChestIds: Array.isArray(parsed.openedChestIds) ? parsed.openedChestIds : [],
      defeatedWorldEnemyIds: Array.isArray(parsed.defeatedWorldEnemyIds) ? parsed.defeatedWorldEnemyIds.filter((id: unknown) => typeof id === 'string') : [],
      encounteredEnemies: Array.isArray(parsed.encounteredEnemies) ? parsed.encounteredEnemies.filter((id: unknown) => typeof id === 'string') : [],
      enemyDefeatCounts: parsed.enemyDefeatCounts && typeof parsed.enemyDefeatCounts === 'object' ? parsed.enemyDefeatCounts : {},
      unlockedEmotes: Array.isArray(parsed.unlockedEmotes)
        ? Array.from(new Set(['squawk', ...parsed.unlockedEmotes.filter((id: unknown) => typeof id === 'string')])) as SaveData['unlockedEmotes']
        : ['squawk'],
      hasBrush: Boolean(parsed.hasBrush),
      hasAxe: Boolean(parsed.hasAxe),
      unlockedArmors: Array.isArray(parsed.unlockedArmors)
        ? Array.from(new Set(parsed.unlockedArmors.filter((a: unknown) => typeof a === 'string' && ['iron', 'gold', 'diamond', 'netherite', 'coral'].includes(a)))) as ArmorType[]
        : (['iron', 'gold', 'diamond', 'netherite', 'coral'].includes(parsed.armor) ? [parsed.armor as ArmorType] : []),
      unlockedSwords: parsedUnlockedSwords,
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
