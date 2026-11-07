export type GrowthStage = 'egg' | 'baby' | 'juvenile' | 'teen' | 'adult';
export type ChickenGender = 'rooster' | 'hen';

export type GameScreen = 
  | 'MENU'
  | 'GENDER_SELECT'
  | 'LEVEL_SELECT'
  | 'INTRO_CINEMATIC'
  | 'ENDING_CINEMATIC'
  | 'PLAYING'
  | 'PAUSED'
  | 'EVOLUTION'
  | 'LEVEL_CLEAR'
  | 'GAME_OVER'
  | 'VICTORY'
  | 'HOW_TO_PLAY'
  | 'SETTINGS'
  | 'QUESTS_BADGES'
  | 'SHOP'
  | 'WORLD_WAITING';

export type ArmorType = 'none' | 'iron' | 'gold' | 'diamond';
export type SwordType = 'none' | 'iron' | 'gold' | 'diamond' | 'netherite';

export interface PlayerStats {
  maxHealth: number;
  speed: number;
  jumpForce: number;
  armor: ArmorType;
  sword: SwordType;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  isGrounded: boolean;
  isJumping: boolean;
  jumpTime: number;
  isAttacking: boolean;
  attackTimer: number;
  attackCooldown: number;
  isBlocking: boolean;
  blockTimer: number;
  hasShield: boolean;
  health: number;
  maxHealth: number;
  invulnerableTimer: number;
  knockbackTimer: number;
  stage: GrowthStage;
  gender: ChickenGender;
  animState: 'idle' | 'walk' | 'jump' | 'fall' | 'attack' | 'hurt' | 'celebrate';
  animTimer: number;
  walkAnimTimer: number;
  onMovingPlatform: Platform | null;
  fireResistTimer?: number;
}

export type PlatformType = 'wood' | 'grass' | 'stone' | 'ruins' | 'bridge' | 'fence';

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: PlatformType;
  isMoving?: boolean;
  moveRangeX?: number;
  moveRangeY?: number;
  moveSpeed?: number;
  startX?: number;
  startY?: number;
  vx?: number;
  vy?: number;
  oneWay?: boolean;
}

export interface Coin {
  id: string;
  x: number;
  y: number;
  collected: boolean;
  radius: number;
  animOffset: number;
}

export interface TreasureChest {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opened: boolean;
  rewardType: 'coins' | 'heart' | 'iron_armor' | 'iron_sword' | 'gold_armor' | 'gold_sword' | 'diamond_armor' | 'diamond_sword' | 'shield';
  rewardAmount: number;
  animProgress: number;
}

export interface Checkpoint {
  id: string;
  x: number;
  y: number;
  reached: boolean;
}

export interface ExitPortal {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type HazardType = 'spike' | 'volcano' | 'boulder' | 'thundercloud';

export interface VolcanoLavaParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  maxLife: number;
}

export interface VolcanoHazard {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  state: 'inactive' | 'warning' | 'erupting' | 'cooldown';
  timer: number;
  warningDuration: number;
  eruptionDuration: number;
  cooldownDuration: number;
  lavaParticles: VolcanoLavaParticle[];
  isDead?: boolean;
}

export interface BoulderHazard {
  id: string;
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  startX: number;
  startY: number;
  isFalling: boolean;
  isRolling: boolean;
  warningTimer: number;
  respawnTimer: number;
  rotation: number;
  speed: number;
  hasTrapDropper?: boolean;
  trapDropperX?: number;
  trapDropperY?: number;
  triggered?: boolean;
}

export interface ThundercloudHazard {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  width: number;
  state: 'idle' | 'tracking' | 'warning' | 'striking' | 'cooldown';
  timer: number;
  strikeDuration: number;
  warningDuration: number;
  cooldownDuration: number;
  isPeaceful?: boolean;
  isNormal?: boolean;
}

export type EnemyType = 'wolf' | 'fox' | 'bear';

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  patrolLeft: number;
  patrolRight: number;
  facing: 'left' | 'right';
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  state: 'patrol' | 'chase' | 'attack' | 'hurt' | 'defeated';
  detectionRadius: number;
  isGrounded: boolean;
  animTimer: number;
  hurtTimer: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  gravity?: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface Camera {
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
  worldWidth: number;
  worldHeight: number;
}

export interface BossFireProjectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isDeflected: boolean;
  targetBoss?: boolean;
  life: number;
  isFading?: boolean;
  fadeTimer?: number;
  maxFadeTime?: number;
}

export interface CockatriceBoss {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number; // 200 hearts EXP!
  phase: number;      // 1, 2, 3
  rageMode?: 'sky rage' | 'inferno rage' | 'max rage';
  state: 
    | 'intro_dialogue'
    | 'waiting_for_sam'
    | 'countdown'
    | 'flying_idle'
    | 'prepare_fire'
    | 'shooting_fire'
    | 'inferno_flame'
    | 'prepare_stomp'
    | 'stomping_platform'
    | 'prepare_claw'
    | 'clawing'
    | 'prepare_peck'
    | 'pecking'
    | 'prepare_tail_whip'
    | 'tail_whipping'
    | 'prepare_bite'
    | 'biting_platform'
    | 'stunned'
    | 'hurt'
    | 'defeated';
  stateTimer: number;
  dialogueIndex: number;
  dialogueCharIndex: number;
  dialogueTimer: number;
  stunHitsNeeded: number;
  stunTimer: number;
  maxStunTime: number;
  facing: 'left' | 'right';
  targetX: number;
  targetY: number;
  fireProjectiles: BossFireProjectile[];
  bitePlatformId?: string;
  biteTargetX: number;
  biteTargetY: number;
  animTimer: number;
  invulnerableTimer: number;
  wingAngle: number;
  jawOpen: number;
  biteTelegraphTimer?: number;
  bittenLandCraters?: { x: number; y: number; width: number; timer: number }[];
  shockwaves?: { x: number; y: number; vx: number; radius: number; timer: number }[];
  slashTrails?: { x: number; y: number; vx: number; timer: number }[];
  defeatSubState?: 'falling' | 'ground_talk_1' | 'ground_talk_2' | 'fly_away' | 'escaped';
  defeatTimer?: number;
  burnIntensity?: number;
  burntMarksCount?: number;
  isShakingOff?: boolean;
  shakeOffTimer?: number;
  regrowGlowTimer?: number;
  countdownText?: string;
  countdownTimer?: number;
  infernoFlameTimer?: number;
  infernoFlameDuration?: number;
  infernoFlameStartX?: number;
  infernoFlameStartY?: number;
  infernoFlameBlockedTime?: number;
}

export interface SilkieSamFriend {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetY: number;
  state: 'waiting' | 'flying_in' | 'talk_1' | 'dropping_shield' | 'talk_2' | 'dropping_sword' | 'talk_3' | 'flying_away' | 'gone';
  dialogueTimer: number;
  dialogueCharIndex: number;
  speechText: string;
  shieldDropped: boolean;
  shieldX: number;
  shieldY: number;
  shieldVy: number;
  shieldCollected: boolean;
  swordDropped?: boolean;
  swordX?: number;
  swordY?: number;
  swordVy?: number;
  swordCollected?: boolean;
  wingAngle: number;
}

export interface LevelConfig {
  id: number;
  world: number;
  worldName: string;
  title: string;
  subtitle: string;
  worldWidth: number;
  worldHeight: number;
  spawnPoint: { x: number; y: number };
  exitPoint: { x: number; y: number };
  theme: 'coop' | 'trail' | 'juvenile' | 'jungle' | 'storm' | 'snowy' | 'fields';
  platforms: Platform[];
  coins: Coin[];
  chests: TreasureChest[];
  checkpoints: Checkpoint[];
  volcanoes?: VolcanoHazard[];
  boulders?: BoulderHazard[];
  thunderclouds?: ThundercloudHazard[];
  enemies?: Enemy[];
  cockatrice?: CockatriceBoss;
  spikes?: { x: number; y: number; width: number; height: number }[];
  hint?: string;
  silkieSam?: SilkieSamFriend;
}

export interface QuestItem {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
  icon: string;
}

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  isSecret?: boolean;
}

export interface ShopUpgrades {
  extraHearts?: number;
  speedBoost?: number;
  jumpBoost?: number;
  coinMagnet?: boolean;
  reviveToken?: boolean;
  luckyCorn?: number;
  ironBeak?: number;
  fluffyGlider?: boolean;
  goldenPlumage?: boolean;
}

export type ChickenSkinId = string;

export interface SaveData {
  unlockedLevel: number;
  totalCoins: number;
  armor: ArmorType;
  sword: SwordType;
  preBossSword?: SwordType;
  gender: ChickenGender;
  hasSeenIntro: boolean;
  hasCompletedGame?: boolean;
  hasShield?: boolean;
  levelCoinsCollected: Record<number, number>;
  soundEnabled: boolean;
  musicEnabled: boolean;
  claimedQuests?: Record<string, boolean>;
  unlockedBadges?: string[];
  stats?: {
    enemiesDefeated?: number;
    trapsTriggered?: number;
    projectilesDeflected?: number;
    levelsClearedWithoutDamage?: number;
    visitedCoopEvolved?: boolean;
    shopPurchases?: number;
  };
  hasVisitedShop?: boolean;
  shopClosedUntil?: number;
  upgrades?: ShopUpgrades;
  selectedSkin?: ChickenSkinId;
  unlockedSkins?: ChickenSkinId[];
  difficulty?: 'easy' | 'normal' | 'hard';
  collectedCoinIds?: string[];
  activatedCheckpointIds?: string[];
}
