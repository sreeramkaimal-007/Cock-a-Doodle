import { LevelConfig, Platform, Coin, TreasureChest, Checkpoint, VolcanoHazard, BoulderHazard, ThundercloudHazard, Enemy } from './types';

function p(id: string, x: number, y: number, width: number, height: number, type: Platform['type'] = 'wood', extras?: Partial<Platform>): Platform {
  return { id, x, y, width, height, type, ...extras };
}

function coin(id: string, x: number, y: number): Coin {
  return { id, x, y, collected: false, radius: 8, animOffset: Math.random() * Math.PI * 2 };
}

function coinLine(prefix: string, startX: number, y: number, count: number, spacing = 45): Coin[] {
  const result: Coin[] = [];
  for (let i = 0; i < count; i++) {
    result.push(coin(`${prefix}_${i}`, startX + i * spacing, y));
  }
  return result;
}

function coinArc(prefix: string, startX: number, baseY: number, count: number, height = 50, spacing = 40): Coin[] {
  const result: Coin[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1 || 1);
    const arcY = baseY - Math.sin(t * Math.PI) * height;
    result.push(coin(`${prefix}_arc_${i}`, startX + i * spacing, arcY));
  }
  return result;
}

function chest(id: string, x: number, y: number, rewardType: TreasureChest['rewardType'], rewardAmount = 1): TreasureChest {
  return { id, x, y, width: 32, height: 26, opened: false, rewardType, rewardAmount, animProgress: 0 };
}

function cp(id: string, x: number, y: number): Checkpoint {
  return { id, x, y, reached: false };
}

function wolf(id: string, x: number, y: number, patrolLeft: number, patrolRight: number): Enemy {
  return {
    id,
    type: 'wolf',
    x,
    y,
    vx: 1.2,
    vy: 0,
    width: 36,
    height: 24,
    patrolLeft,
    patrolRight,
    facing: 'right',
    health: 2,
    maxHealth: 2,
    speed: 1.2,
    damage: 1,
    state: 'patrol',
    detectionRadius: 130,
    isGrounded: true,
    animTimer: 0,
    hurtTimer: 0
  };
}

function fox(id: string, x: number, y: number, patrolLeft: number, patrolRight: number): Enemy {
  return {
    id,
    type: 'fox',
    x,
    y,
    vx: 1.8,
    vy: 0,
    width: 38,
    height: 22,
    patrolLeft,
    patrolRight,
    facing: 'right',
    health: 3,
    maxHealth: 3,
    speed: 1.8,
    damage: 1,
    state: 'patrol',
    detectionRadius: 180,
    isGrounded: true,
    animTimer: 0,
    hurtTimer: 0
  };
}

function bear(id: string, x: number, y: number, patrolLeft: number, patrolRight: number): Enemy {
  return {
    id,
    type: 'bear',
    x,
    y,
    vx: 0.9,
    vy: 0,
    width: 48,
    height: 36,
    patrolLeft,
    patrolRight,
    facing: 'right',
    health: 6,
    maxHealth: 6,
    speed: 1.0,
    damage: 2,
    state: 'patrol',
    detectionRadius: 210,
    isGrounded: true,
    animTimer: 0,
    hurtTimer: 0
  };
}

function volcano(id: string, x: number, y: number, warning = 1.6, erupt = 2.0, cool = 2.4): VolcanoHazard {
  return {
    id,
    x,
    y,
    width: 48,
    height: 32,
    state: 'inactive',
    timer: Math.random() * cool,
    warningDuration: warning,
    eruptionDuration: erupt,
    cooldownDuration: cool,
    lavaParticles: []
  };
}

function boulder(id: string, x: number, y: number, speed = 2.8, isFalling = false, hasTrapDropper = false): BoulderHazard {
  return {
    id,
    x,
    y,
    radius: 18,
    vx: speed,
    vy: 0,
    startX: x,
    startY: y,
    isFalling,
    isRolling: true,
    warningTimer: isFalling ? 1.4 : 0,
    respawnTimer: 0,
    rotation: 0,
    speed,
    hasTrapDropper,
    trapDropperX: x,
    trapDropperY: Math.max(70, y - 200),
    triggered: !hasTrapDropper
  };
}

function lightning(id: string, x: number, y: number, targetX: number, targetY: number, warning = 1.4, strike = 0.5, cool = 2.8): ThundercloudHazard {
  return {
    id,
    x,
    y,
    targetX,
    targetY,
    width: 56,
    state: 'idle',
    timer: Math.random() * cool,
    warningDuration: warning,
    strikeDuration: strike,
    cooldownDuration: cool
  };
}

export const LEVELS: LevelConfig[] = [
  // ================= WORLD 1: THE CHICKEN COOP (Levels 1-5) =================
  {
    id: 1,
    world: 1,
    worldName: 'World 1: the Start',
    title: 'The Hatching',
    subtitle: 'Learn basic movement and your first jump!',
    worldWidth: 1500,
    worldHeight: 600,
    spawnPoint: { x: 120, y: 440 },
    exitPoint: { x: 1380, y: 440 },
    theme: 'coop',
    platforms: [
      p('c1_floor1', 0, 480, 500, 120, 'wood'),
      p('c1_plat1', 560, 420, 160, 30, 'wood'),
      p('c1_plat2', 780, 360, 160, 30, 'wood'),
      p('c1_floor2', 1000, 480, 500, 120, 'wood'),
    ],
    coins: [
      ...coinLine('c1_c1', 280, 440, 3),
      ...coinArc('c1_c2', 580, 410, 3, 30),
      ...coinArc('c1_c3', 800, 350, 3, 30),
      ...coinLine('c1_c4', 1150, 440, 4),
    ],
    chests: [],
    checkpoints: [cp('cp1', 640, 420)],
    hint: 'Use A/D or Arrow keys to walk, Space or W to jump!'
  },
  {
    id: 2,
    world: 1,
    worldName: 'World 1: the Start',
    title: 'First Little Jumps',
    subtitle: 'Master safe landings and collect sweet corn coins!',
    worldWidth: 1700,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 1560, y: 440 },
    theme: 'coop',
    platforms: [
      p('c2_f1', 0, 480, 400, 120, 'wood'),
      p('c2_p1', 470, 430, 140, 24, 'wood'),
      p('c2_p2', 680, 380, 140, 24, 'wood'),
      p('c2_p3', 890, 430, 140, 24, 'wood'),
      p('c2_f2', 1100, 480, 600, 120, 'wood'),
    ],
    coins: [
      ...coinLine('c2_1', 200, 440, 3),
      ...coinArc('c2_2', 480, 410, 3, 35),
      ...coinArc('c2_3', 690, 360, 3, 35),
      ...coinLine('c2_4', 1220, 440, 4),
    ],
    chests: [],
    checkpoints: [cp('c2_cp', 890, 410)],
    hint: 'Hold jump slightly longer for maximum chick height.'
  },
  {
    id: 3,
    world: 1,
    worldName: 'World 1: the Start',
    title: 'The Farmyard',
    subtitle: 'Navigate coop ledges and explore the farmyard grounds.',
    worldWidth: 1850,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 1720, y: 440 },
    theme: 'coop',
    platforms: [
      p('c3_f1', 0, 480, 600, 120, 'wood'),
      p('c3_p1', 670, 410, 160, 24, 'wood'),
      p('c3_p2', 900, 360, 160, 24, 'wood'),
      p('c3_f2', 1120, 480, 730, 120, 'wood'),
    ],
    coins: [
      ...coinArc('c3_1', 300, 440, 3, 40),
      ...coinArc('c3_2', 480, 440, 3, 40),
      ...coinLine('c3_3', 700, 380, 3),
      ...coinLine('c3_4', 930, 330, 3),
      ...coinArc('c3_5', 1380, 440, 3, 40),
    ],
    chests: [],
    checkpoints: [cp('c3_cp', 900, 340)],
    hint: 'Time your jumps cleanly across platforms to keep your speed.'
  },
  {
    id: 4,
    world: 1,
    worldName: 'World 1: the Start',
    title: 'Wooden Obstacles',
    subtitle: 'Ascend raised barn beams and leap across wider gaps.',
    worldWidth: 2000,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 1850, y: 440 },
    theme: 'coop',
    platforms: [
      p('c4_f1', 0, 480, 450, 120, 'wood'),
      p('c4_p1', 520, 420, 130, 24, 'wood'),
      p('c4_p2', 720, 360, 130, 24, 'wood'),
      p('c4_p3', 920, 300, 140, 24, 'wood'),
      p('c4_p4', 1130, 360, 130, 24, 'wood'),
      p('c4_p5', 1330, 420, 140, 24, 'wood'),
      p('c4_f2', 1540, 480, 460, 120, 'wood'),
    ],
    coins: [
      ...coinLine('c4_1', 200, 440, 3),
      ...coinArc('c4_2', 530, 400, 3, 30),
      ...coinArc('c4_3', 730, 340, 3, 35),
      ...coinArc('c4_4', 930, 280, 3, 35),
      ...coinLine('c4_5', 1580, 440, 4),
    ],
    chests: [],
    checkpoints: [cp('c4_cp', 930, 280)],
    hint: 'Barn beams are high, watch your steps!'
  },
  {
    id: 5,
    world: 1,
    worldName: 'World 1: the Start',
    title: 'First Treasure',
    subtitle: 'Discover an ancient farm chest packed with gold coins!',
    worldWidth: 2100,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 1950, y: 440 },
    theme: 'coop',
    platforms: [
      p('c5_f1', 0, 480, 500, 120, 'wood'),
      p('c5_p1', 580, 410, 140, 24, 'wood'),
      p('c5_p_secret', 800, 290, 150, 24, 'wood'),
      p('c5_p2', 1020, 410, 140, 24, 'wood'),
      p('c5_f2', 1230, 480, 870, 120, 'wood'),
    ],
    coins: [
      ...coinLine('c5_1', 250, 440, 4),
      ...coinArc('c5_2', 590, 390, 3, 35),
      ...coinLine('c5_3', 1280, 440, 3),
      ...coinLine('c5_4', 1650, 440, 4),
    ],
    chests: [
      chest('c5_chest1', 860, 264, 'coins', 15),
    ],
    checkpoints: [cp('c5_cp', 810, 270)],
    hint: 'Walk up to treasure chests to open them and claim rewards!'
  },

  // ================= WORLD 2: THE GRASSY TRAILS (Levels 6-9) =================
  {
    id: 6,
    world: 2,
    worldName: 'World 2: the Adventure starts',
    title: 'Open Trails',
    subtitle: 'Breezy grassy trails with rolling hills and open pastures.',
    worldWidth: 2100,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 1960, y: 440 },
    theme: 'coop',
    platforms: [
      p('t6_f1', 0, 480, 550, 120, 'grass'),
      p('t6_p1', 630, 420, 130, 24, 'grass'),
      p('t6_p2', 830, 370, 140, 24, 'grass'),
      p('t6_f2', 1040, 480, 500, 120, 'grass'),
      p('t6_p3', 1600, 420, 140, 24, 'grass'),
      p('t6_f3', 1800, 480, 300, 120, 'grass'),
    ],
    coins: [
      ...coinArc('t6_1', 330, 440, 3, 40),
      ...coinLine('t6_2', 650, 390, 2),
      ...coinLine('t6_3', 850, 340, 2),
      ...coinArc('t6_4', 1240, 440, 3, 40),
      ...coinLine('t6_5', 1850, 440, 3),
    ],
    chests: [],
    checkpoints: [cp('t6_cp', 1050, 460)],
    hint: 'Out in the open sunshine, watch for deep pits between hills.'
  },
  {
    id: 7,
    world: 2,
    worldName: 'World 2: the Adventure starts',
    title: 'The Hilltop',
    subtitle: 'Ascend the rolling emerald ridges and coast downhill.',
    worldWidth: 2200,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 2050, y: 440 },
    theme: 'trail',
    platforms: [
      p('t7_f1', 0, 480, 400, 120, 'grass'),
      p('t7_p1', 460, 420, 140, 24, 'grass'),
      p('t7_p2', 660, 350, 150, 24, 'grass'),
      p('t7_p3', 880, 290, 160, 24, 'grass'),
      p('t7_p4', 1110, 350, 150, 24, 'grass'),
      p('t7_p5', 1330, 410, 140, 24, 'grass'),
      p('t7_f2', 1530, 480, 670, 120, 'grass'),
      p('t7_secret', 900, 190, 120, 20, 'wood'),
    ],
    coins: [
      ...coinArc('t7_1', 470, 400, 3, 35),
      ...coinArc('t7_2', 670, 330, 3, 35),
      ...coinArc('t7_3', 890, 270, 3, 35),
      ...coinLine('t7_sec', 920, 160, 3),
      ...coinLine('t7_4', 1600, 440, 4),
    ],
    chests: [
      chest('t7_chest', 950, 164, 'heart', 1),
    ],
    checkpoints: [cp('t7_cp', 890, 270)],
    hint: 'A secret high beam atop the hill holds an extra heart!'
  },
  {
    id: 8,
    world: 2,
    worldName: 'World 2: the Adventure starts',
    title: 'The Moving Bridge',
    subtitle: 'Moving platforms carry you safely across the raging creek.',
    worldWidth: 2300,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 2160, y: 440 },
    theme: 'trail',
    platforms: [
      p('t8_f1', 0, 480, 420, 120, 'grass'),
      p('t8_m1', 490, 420, 110, 22, 'wood', { isMoving: true, moveRangeX: 160, moveRangeY: 0, moveSpeed: 1.2, startX: 490, startY: 420 }),
      p('t8_mid', 780, 420, 160, 24, 'grass'),
      p('t8_m2', 1010, 340, 110, 22, 'wood', { isMoving: true, moveRangeX: 0, moveRangeY: 80, moveSpeed: 1.1, startX: 1010, startY: 340 }),
      p('t8_mid2', 1230, 360, 160, 24, 'grass'),
      p('t8_m3', 1470, 420, 120, 22, 'wood', { isMoving: true, moveRangeX: 180, moveRangeY: 0, moveSpeed: 1.4, startX: 1470, startY: 420 }),
      p('t8_f2', 1780, 480, 520, 120, 'grass'),
    ],
    coins: [
      ...coinLine('t8_1', 200, 440, 3),
      ...coinLine('t8_2', 800, 390, 3),
      ...coinLine('t8_3', 1250, 330, 3),
      ...coinLine('t8_4', 1880, 440, 4),
    ],
    chests: [],
    checkpoints: [cp('t8_cp', 790, 400)],
    hint: 'Stay centered on moving platforms. You ride along with their motion!'
  },
  {
    id: 9,
    world: 2,
    worldName: 'World 2: the Adventure starts',
    title: 'The Final Chick Challenge',
    subtitle: 'Combine jumping, timing, and moving platforms before growing up!',
    worldWidth: 2400,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 2260, y: 440 },
    theme: 'trail',
    platforms: [
      p('t9_f1', 0, 480, 400, 120, 'grass'),
      p('t9_p1', 460, 420, 120, 22, 'grass'),
      p('t9_m1', 650, 380, 110, 22, 'wood', { isMoving: true, moveRangeX: 140, moveRangeY: 0, moveSpeed: 1.4, startX: 650, startY: 380 }),
      p('t9_p2', 900, 330, 150, 24, 'grass'),
      p('t9_m2', 1130, 260, 110, 22, 'wood', { isMoving: true, moveRangeX: 0, moveRangeY: 80, moveSpeed: 1.2, startX: 1130, startY: 260 }),
      p('t9_p3', 1330, 380, 140, 24, 'grass'),
      p('t9_p4', 1540, 430, 130, 24, 'grass'),
      p('t9_f2', 1740, 480, 660, 120, 'grass'),
      p('t9_high', 920, 200, 110, 20, 'wood'),
    ],
    coins: [
      ...coinArc('t9_1', 470, 400, 3, 30),
      ...coinLine('t9_2', 910, 300, 3),
      ...coinLine('t9_sec', 930, 170, 3),
      ...coinLine('t9_3', 1800, 440, 5),
    ],
    chests: [
      chest('t9_chest', 955, 174, 'iron_armor', 1),
    ],
    checkpoints: [cp('t9_cp', 910, 310)],
    hint: 'A shiny treasure box above holds sturdy Iron Armor!'
  },

  // ================= WORLD 3: THE JUVENILE CHICKEN (Level 10) =================
  {
    id: 10,
    world: 3,
    worldName: 'World 3: the Heat up',
    title: 'Growing Up',
    subtitle: 'You grew up into a nimble juvenile chicken! Beware the hungry wolves!',
    worldWidth: 2600,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 2450, y: 440 },
    theme: 'juvenile',
    platforms: [
      p('j10_f1', 0, 480, 450, 120, 'grass'),
      p('j10_p1', 510, 420, 130, 24, 'stone'),
      p('j10_m1', 700, 370, 120, 22, 'wood', { isMoving: true, moveRangeX: 160, moveRangeY: 0, moveSpeed: 1.3, startX: 700, startY: 370 }),
      p('j10_wolf_plat', 980, 420, 280, 24, 'grass'),
      p('j10_p2', 1330, 360, 130, 24, 'stone'),
      p('j10_m2', 1530, 270, 110, 22, 'wood', { isMoving: true, moveRangeX: 0, moveRangeY: 80, moveSpeed: 1.2, startX: 1530, startY: 270 }),
      p('j10_wolf2_plat', 1740, 420, 280, 24, 'grass'),
      p('j10_f2', 2090, 480, 510, 120, 'grass'),
      p('j10_high', 1040, 270, 140, 22, 'stone'),
    ],
    coins: [
      ...coinLine('j10_1', 200, 440, 4),
      ...coinArc('j10_2', 520, 400, 3, 30),
      ...coinLine('j10_3', 1010, 390, 3),
      ...coinLine('j10_4', 1350, 330, 3),
      ...coinLine('j10_5', 2150, 440, 4),
    ],
    chests: [
      chest('j10_chest', 1080, 244, 'coins', 25),
    ],
    checkpoints: [cp('j10_cp', 1340, 340)],
    enemies: [
      wolf('j10_w1', 1060, 396, 990, 1240),
      wolf('j10_w2', 1820, 396, 1750, 2000),
    ],
    hint: 'Stomp wolves on the head or leap over them to survive!'
  },

  // ================= WORLD 4: THE JUNGLE OF FIRE (Levels 11-19) =================
  {
    id: 11,
    world: 4,
    worldName: 'World 4: the Jungle',
    title: 'Teenage Awakening',
    subtitle: 'Golden Armor and Golden Sword equipped! Volcanoes awaken!',
    worldWidth: 2600,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 2460, y: 440 },
    theme: 'jungle',
    platforms: [
      p('jg11_f1', 0, 480, 450, 120, 'ruins'),
      p('jg11_p1', 510, 420, 140, 24, 'stone'),
      p('jg11_f2', 720, 480, 500, 120, 'ruins'),
      p('jg11_p2', 1290, 420, 140, 24, 'stone'),
      p('jg11_p3', 1500, 360, 140, 24, 'stone'),
      p('jg11_f3', 1710, 480, 890, 120, 'ruins'),
    ],
    coins: [
      ...coinLine('jg11_1', 200, 440, 4),
      ...coinArc('jg11_2', 520, 400, 3, 35),
      ...coinLine('jg11_3', 850, 440, 3),
      ...coinLine('jg11_4', 1800, 440, 5),
    ],
    chests: [
      chest('jg11_c1', 1540, 334, 'gold_armor', 1),
    ],
    volcanoes: [
      volcano('v11_1', 940, 448, 1.5, 2.0, 2.5),
      volcano('v11_2', 1950, 448, 1.5, 2.0, 2.5),
    ],
    checkpoints: [cp('jg11_cp', 1300, 400)],
    hint: 'Press X or K to strike with your Gold Sword! Watch volcanoes smoke before erupting!'
  },
  {
    id: 12,
    world: 4,
    worldName: 'World 4: the Jungle',
    title: 'The Lava Trail',
    subtitle: 'Time your jumps past chained volcanic vents and flaming lava.',
    worldWidth: 2800,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 2660, y: 440 },
    theme: 'jungle',
    platforms: [
      p('jg12_f1', 0, 480, 400, 120, 'ruins'),
      p('jg12_f2', 460, 480, 480, 120, 'ruins'),
      p('jg12_p1', 1010, 420, 140, 24, 'stone'),
      p('jg12_p2', 1220, 360, 140, 24, 'stone'),
      p('jg12_f3', 1430, 480, 550, 120, 'ruins'),
      p('jg12_p3', 2050, 420, 140, 24, 'stone'),
      p('jg12_f4', 2260, 480, 540, 120, 'ruins'),
    ],
    coins: [
      ...coinLine('jg12_1', 180, 440, 3),
      ...coinArc('jg12_2', 1020, 400, 3, 30),
      ...coinArc('jg12_3', 1230, 340, 3, 30),
      ...coinLine('jg12_4', 2350, 440, 4),
    ],
    chests: [
      chest('jg12_c1', 1260, 334, 'heart', 1),
    ],
    volcanoes: [
      volcano('v12_1', 650, 448, 1.4, 1.8, 2.2),
      volcano('v12_2', 1650, 448, 1.6, 2.0, 2.0),
      volcano('v12_3', 1820, 448, 1.2, 1.8, 2.4),
    ],
    checkpoints: [cp('jg12_cp', 1440, 460)],
    hint: 'Never rush past a smoking volcano vent; wait for cooldown!'
  },
  {
    id: 13,
    world: 4,
    worldName: 'World 4: the Jungle',
    title: 'The Rolling Giants',
    subtitle: 'Massive boulders roll along platforms. Leap over them!',
    worldWidth: 2800,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 2680, y: 440 },
    theme: 'jungle',
    platforms: [
      p('jg13_f1', 0, 480, 400, 120, 'ruins'),
      p('jg13_run1', 480, 480, 680, 120, 'stone'),
      p('jg13_p1', 1230, 420, 140, 24, 'stone'),
      p('jg13_p2', 1440, 360, 140, 24, 'stone'),
      p('jg13_run2', 1650, 480, 700, 120, 'stone'),
      p('jg13_f2', 2420, 480, 380, 120, 'ruins'),
    ],
    coins: [
      ...coinLine('jg13_1', 200, 440, 3),
      ...coinArc('jg13_2', 680, 450, 4, 45),
      ...coinLine('jg13_3', 1450, 330, 3),
      ...coinArc('jg13_4', 1850, 450, 4, 45),
    ],
    chests: [],
    boulders: [
      boulder('b13_1', 1100, 462, -2.6),
      boulder('b13_2', 2300, 462, -2.8),
    ],
    checkpoints: [cp('jg13_cp', 1450, 340)],
    hint: 'Boulders cannot be stopped by your sword—jump high over them!'
  },
  {
    id: 14,
    world: 4,
    worldName: 'World 4: the Jungle',
    title: 'Fox Territory',
    subtitle: 'Cunning foxes stalk these ruins. Slay them or evade!',
    worldWidth: 2900,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 2750, y: 440 },
    theme: 'jungle',
    platforms: [
      p('jg14_f1', 0, 480, 450, 120, 'ruins'),
      p('jg14_fox1_p', 520, 480, 520, 120, 'ruins'),
      p('jg14_p1', 1110, 410, 140, 24, 'stone'),
      p('jg14_safe', 1320, 340, 160, 24, 'stone'),
      p('jg14_fox2_p', 1550, 480, 600, 120, 'ruins'),
      p('jg14_f2', 2220, 480, 680, 120, 'ruins'),
    ],
    coins: [
      ...coinLine('jg14_1', 200, 440, 3),
      ...coinLine('jg14_2', 1330, 310, 3),
      ...coinLine('jg14_3', 2350, 440, 5),
    ],
    chests: [
      chest('jg14_c1', 1380, 314, 'coins', 30),
    ],
    enemies: [
      fox('jg14_f1', 750, 458, 540, 1020),
      fox('jg14_f2', 1800, 458, 1570, 2120),
    ],
    checkpoints: [cp('jg14_cp', 1330, 320)],
    hint: 'Foxes will charge when they spot you. Strike with X or K!'
  },
  {
    id: 15,
    world: 4,
    worldName: 'World 4: the Jungle',
    title: 'Jungle of Moving Platforms',
    subtitle: 'Cross bubbling magma pits on shifting basalt stone blocks.',
    worldWidth: 3000,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 2850, y: 440 },
    theme: 'jungle',
    platforms: [
      p('jg15_f1', 0, 480, 400, 120, 'ruins'),
      p('jg15_m1', 480, 420, 110, 22, 'stone', { isMoving: true, moveRangeX: 160, moveRangeY: 0, moveSpeed: 1.4, startX: 480, startY: 420 }),
      p('jg15_isle1', 760, 420, 150, 24, 'stone'),
      p('jg15_m2', 980, 330, 110, 22, 'stone', { isMoving: true, moveRangeX: 0, moveRangeY: 80, moveSpeed: 1.3, startX: 980, startY: 330 }),
      p('jg15_isle2', 1190, 340, 280, 24, 'stone'),
      p('jg15_m3', 1540, 380, 110, 22, 'stone', { isMoving: true, moveRangeX: 180, moveRangeY: 0, moveSpeed: 1.5, startX: 1540, startY: 380 }),
      p('jg15_isle3', 1840, 420, 150, 24, 'stone'),
      p('jg15_m4', 2060, 420, 110, 22, 'stone', { isMoving: true, moveRangeX: 150, moveRangeY: 0, moveSpeed: 1.3, startX: 2060, startY: 420 }),
      p('jg15_f2', 2340, 480, 660, 120, 'ruins'),
    ],
    coins: [
      ...coinLine('jg15_1', 200, 440, 3),
      ...coinLine('jg15_2', 1210, 310, 4),
      ...coinLine('jg15_3', 1860, 390, 2),
      ...coinLine('jg15_4', 2450, 440, 4),
    ],
    chests: [],
    enemies: [
      fox('jg15_f1', 1300, 318, 1200, 1450),
    ],
    volcanoes: [
      volcano('v15_1', 780, 388, 1.5, 2.0, 2.2),
      volcano('v15_2', 1860, 388, 1.5, 2.0, 2.2),
    ],
    checkpoints: [cp('jg15_cp', 1200, 320)],
    hint: 'Ride the moving basalt slabs carefully over lava pits.'
  },
  {
    id: 16,
    world: 4,
    worldName: 'World 4: the Jungle',
    title: 'The Boulder Run',
    subtitle: 'Outrun and leap over rolling boulders down a steep ruin terrace.',
    worldWidth: 3000,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 2860, y: 440 },
    theme: 'jungle',
    platforms: [
      p('jg16_f1', 0, 480, 420, 120, 'ruins'),
      p('jg16_step1', 500, 480, 550, 120, 'stone'),
      p('jg16_step2', 1130, 440, 500, 120, 'stone'),
      p('jg16_p1', 1700, 380, 140, 24, 'stone'),
      p('jg16_step3', 1910, 480, 550, 120, 'stone'),
      p('jg16_f2', 2530, 480, 470, 120, 'ruins'),
    ],
    coins: [
      ...coinLine('jg16_1', 200, 440, 3),
      ...coinArc('jg16_2', 680, 450, 4, 40),
      ...coinArc('jg16_3', 1300, 410, 4, 40),
      ...coinLine('jg16_4', 2600, 440, 4),
    ],
    chests: [
      chest('jg16_c1', 1740, 354, 'coins', 35),
    ],
    boulders: [
      boulder('b16_1', 1000, 462, -3.0),
      boulder('b16_2', 1580, 422, -3.2),
      boulder('b16_3', 2400, 462, -3.0),
    ],
    checkpoints: [cp('jg16_cp', 1710, 360)],
    hint: 'Time your jumps over boulders on every terrace!'
  },
  {
    id: 17,
    world: 4,
    worldName: 'World 4: the Jungle',
    title: 'The Fox Ambush',
    subtitle: 'Fox packs prowl the jungle ruins. Hidden treasure awaits aloft!',
    worldWidth: 3100,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 2950, y: 440 },
    theme: 'jungle',
    platforms: [
      p('jg17_f1', 0, 480, 450, 120, 'ruins'),
      p('jg17_f2', 530, 480, 650, 120, 'ruins'),
      p('jg17_high1', 800, 310, 150, 24, 'stone'),
      p('jg17_f3', 1260, 480, 700, 120, 'ruins'),
      p('jg17_high2', 1540, 300, 150, 24, 'stone'),
      p('jg17_f4', 2040, 480, 650, 120, 'ruins'),
      p('jg17_f5', 2760, 480, 340, 120, 'ruins'),
    ],
    coins: [
      ...coinLine('jg17_1', 200, 440, 4),
      ...coinLine('jg17_sec1', 820, 280, 3),
      ...coinLine('jg17_sec2', 1560, 270, 3),
      ...coinLine('jg17_2', 2800, 440, 4),
    ],
    chests: [
      chest('jg17_c1', 850, 284, 'heart', 1),
      chest('jg17_c2', 1590, 274, 'coins', 40),
    ],
    enemies: [
      fox('jg17_f1', 700, 458, 550, 1150),
      fox('jg17_f2', 1450, 458, 1280, 1920),
      fox('jg17_f3', 2250, 458, 2060, 2650),
    ],
    checkpoints: [cp('jg17_cp', 1550, 280)],
    hint: 'Use high platforms to avoid ground foxes and claim twin treasure chests.'
  },
  {
    id: 18,
    world: 4,
    worldName: 'World 4: the Jungle',
    title: 'Volcano Escape',
    subtitle: 'Rumbling magma vents erupt across the entire escape causeway!',
    worldWidth: 3200,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 3050, y: 440 },
    theme: 'jungle',
    platforms: [
      p('jg18_f1', 0, 480, 420, 120, 'ruins'),
      p('jg18_f2', 500, 480, 450, 120, 'stone'),
      p('jg18_p1', 1010, 410, 130, 24, 'stone'),
      p('jg18_f3', 1200, 480, 480, 120, 'stone'),
      p('jg18_m1', 1740, 420, 110, 22, 'stone', { isMoving: true, moveRangeX: 180, moveRangeY: 0, moveSpeed: 1.5, startX: 1740, startY: 420 }),
      p('jg18_f4', 2080, 480, 520, 120, 'stone'),
      p('jg18_f5', 2680, 480, 520, 120, 'ruins'),
    ],
    coins: [
      ...coinLine('jg18_1', 200, 440, 3),
      ...coinArc('jg18_2', 650, 440, 4, 40),
      ...coinLine('jg18_3', 1350, 440, 3),
      ...coinLine('jg18_4', 2800, 440, 5),
    ],
    chests: [],
    volcanoes: [
      volcano('v18_1', 720, 448, 1.3, 1.8, 2.0),
      volcano('v18_2', 1420, 448, 1.4, 1.9, 2.2),
      volcano('v18_3', 2320, 448, 1.2, 1.7, 2.1),
    ],
    boulders: [
      boulder('b18_1', 900, 462, -2.8),
      boulder('b18_2', 2550, 462, -3.2),
    ],
    checkpoints: [cp('jg18_cp', 2340, 480)],
    hint: 'Keep moving! Volcanoes and rolling rocks are relentless!'
  },
  {
    id: 19,
    world: 4,
    worldName: 'World 4: the Jungle',
    title: 'The Ultimate Jungle Test',
    subtitle: 'The supreme test of teenage courage! Volcanoes, foxes, and boulders!',
    worldWidth: 3300,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 3150, y: 440 },
    theme: 'jungle',
    platforms: [
      p('jg19_f1', 0, 480, 420, 120, 'ruins'),
      p('jg19_p1', 480, 420, 130, 24, 'stone'),
      p('jg19_f2', 670, 480, 550, 120, 'stone'),
      p('jg19_m1', 1280, 390, 110, 22, 'stone', { isMoving: true, moveRangeX: 160, moveRangeY: 0, moveSpeed: 1.4, startX: 1280, startY: 390 }),
      p('jg19_f3', 1580, 480, 600, 120, 'stone'),
      p('jg19_p2', 2240, 410, 140, 24, 'stone'),
      p('jg19_p3', 2440, 350, 140, 24, 'stone'),
      p('jg19_f4', 2650, 480, 650, 120, 'ruins'),
    ],
    coins: [
      ...coinLine('jg19_1', 200, 440, 4),
      ...coinArc('jg19_2', 800, 440, 4, 35),
      ...coinLine('jg19_3', 1700, 440, 4),
      ...coinLine('jg19_4', 2800, 440, 5),
    ],
    chests: [
      chest('jg19_c1', 2480, 324, 'coins', 50),
    ],
    enemies: [
      fox('jg19_f1', 880, 458, 700, 1180),
      fox('jg19_f2', 1850, 458, 1620, 2120),
    ],
    volcanoes: [
      volcano('v19_1', 1050, 448, 1.4, 1.9, 2.3),
      volcano('v19_2', 1980, 448, 1.3, 1.8, 2.0),
    ],
    boulders: [
      boulder('b19_1', 1150, 462, -3.0),
      boulder('b19_2', 2100, 462, -3.2),
    ],
    checkpoints: [cp('jg19_cp', 1590, 460)],
    hint: 'Survive this final gauntlet to emerge as a mighty adult chicken!'
  },

  // ================= WORLD 5: THE ADULT SURVIVAL CHALLENGE (Levels 20-29) =================
  {
    id: 20,
    world: 5,
    worldName: 'World 5:the Snowy lands',
    title: 'The Adult Awakening',
    subtitle: 'You are now an adult chicken! Face colossal bears and thunderclouds!',
    worldWidth: 3200,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 3050, y: 440 },
    theme: 'storm',
    platforms: [
      p('st20_f1', 0, 480, 480, 120, 'stone'),
      p('st20_p1', 540, 410, 140, 24, 'stone'),
      p('st20_bear_p', 740, 480, 600, 120, 'stone'),
      p('st20_p2', 1400, 410, 150, 24, 'stone'),
      p('st20_p3', 1620, 350, 150, 24, 'stone'),
      p('st20_f2', 1840, 480, 1360, 120, 'stone'),
    ],
    coins: [
      ...coinLine('st20_1', 200, 440, 4),
      ...coinArc('st20_2', 550, 390, 3, 30),
      ...coinLine('st20_3', 1640, 320, 3),
      ...coinLine('st20_4', 2100, 440, 5),
    ],
    chests: [
      chest('st20_c1', 1660, 324, 'coins', 40),
    ],
    enemies: [
      bear('st20_b1', 980, 444, 760, 1300),
    ],
    thunderclouds: [
      lightning('th20_1', 1050, 160, 1050, 480, 1.6, 0.5, 3.0),
      lightning('th20_2', 2300, 160, 2300, 480, 1.5, 0.5, 2.8),
    ],
    checkpoints: [cp('st20_cp', 1420, 390)],
    hint: 'Bears deal massive damage! Watch the red warning beam before lightning strikes!'
  },
  {
    id: 21,
    world: 5,
    worldName: 'World 5:the Snowy lands',
    title: 'Bear Country',
    subtitle: 'Tread softly across narrow cliffs guarded by mountain bears.',
    worldWidth: 3200,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 3050, y: 440 },
    theme: 'storm',
    platforms: [
      p('st21_f1', 0, 480, 420, 120, 'stone'),
      p('st21_p1', 480, 420, 130, 24, 'stone'),
      p('st21_b1_p', 670, 480, 560, 120, 'stone'),
      p('st21_m1', 1290, 400, 110, 22, 'stone', { isMoving: true, moveRangeX: 160, moveRangeY: 0, moveSpeed: 1.3, startX: 1290, startY: 400 }),
      p('st21_p2', 1580, 350, 140, 24, 'stone'),
      p('st21_b2_p', 1780, 480, 600, 120, 'stone'),
      p('st21_f2', 2440, 480, 760, 120, 'stone'),
    ],
    coins: [
      ...coinLine('st21_1', 200, 440, 3),
      ...coinArc('st21_2', 490, 400, 3, 30),
      ...coinLine('st21_3', 1600, 320, 3),
      ...coinLine('st21_4', 2600, 440, 5),
    ],
    chests: [
      chest('st21_c1', 1620, 324, 'heart', 1),
    ],
    enemies: [
      bear('st21_b1', 900, 444, 700, 1180),
      bear('st21_b2', 2000, 444, 1800, 2330),
    ],
    thunderclouds: [
      lightning('th21_1', 920, 160, 920, 480, 1.5, 0.5, 3.2),
    ],
    checkpoints: [cp('st21_cp', 1590, 330)],
    hint: 'Your gold sword can bring bears down, but timing attacks is critical!'
  },
  {
    id: 22,
    world: 5,
    worldName: 'World 5:the Snowy lands',
    title: 'Thunder Valley',
    subtitle: 'Lightning forks relentlessly across the dark canyon floor.',
    worldWidth: 3200,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 3060, y: 440 },
    theme: 'storm',
    platforms: [
      p('st22_f1', 0, 480, 400, 120, 'stone'),
      p('st22_f2', 460, 480, 500, 120, 'stone'),
      p('st22_p1', 1020, 410, 130, 24, 'stone'),
      p('st22_f3', 1210, 480, 550, 120, 'stone'),
      p('st22_p2', 1820, 380, 140, 24, 'stone'),
      p('st22_f4', 2020, 480, 600, 120, 'stone'),
      p('st22_f5', 2680, 480, 520, 120, 'stone'),
    ],
    coins: [
      ...coinLine('st22_1', 180, 440, 3),
      ...coinArc('st22_2', 700, 450, 4, 35),
      ...coinLine('st22_3', 1450, 450, 3),
      ...coinLine('st22_4', 2800, 440, 4),
    ],
    chests: [
      chest('st22_c1', 1860, 354, 'diamond_sword', 1),
    ],
    thunderclouds: [
      lightning('th22_1', 680, 160, 680, 480, 1.4, 0.45, 2.5),
      lightning('th22_2', 1450, 160, 1450, 480, 1.3, 0.45, 2.3),
      lightning('th22_3', 2300, 160, 2300, 480, 1.5, 0.45, 2.6),
    ],
    checkpoints: [cp('st22_cp', 1830, 360)],
    hint: 'Get out of the pulsing red strike zone before lightning crashes down!'
  },
  {
    id: 23,
    world: 5,
    worldName: 'World 5:the Snowy lands',
    title: 'The Falling Rocks',
    subtitle: 'Avalanches of boulders cascade down the misty mountain peaks.',
    worldWidth: 3300,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 3150, y: 440 },
    theme: 'storm',
    platforms: [
      p('st23_f1', 0, 480, 420, 120, 'stone'),
      p('st23_step1', 480, 480, 550, 120, 'stone'),
      p('st23_p1', 1090, 420, 140, 24, 'stone'),
      p('st23_step2', 1290, 480, 580, 120, 'stone'),
      p('st23_p2', 1930, 370, 150, 24, 'stone'),
      p('st23_step3', 2140, 480, 600, 120, 'stone'),
      p('st23_f2', 2800, 480, 500, 120, 'stone'),
    ],
    coins: [
      ...coinLine('st23_1', 200, 440, 3),
      ...coinArc('st23_2', 720, 450, 4, 40),
      ...coinLine('st23_3', 1950, 340, 3),
      ...coinLine('st23_4', 2900, 440, 4),
    ],
    chests: [],
    boulders: [
      boulder('b23_1', 980, 462, -3.2),
      boulder('b23_2', 1820, 462, -3.4),
      boulder('b23_3', 2680, 462, -3.2),
    ],
    enemies: [
      bear('st23_b1', 1500, 444, 1320, 1800),
    ],
    checkpoints: [cp('st23_cp', 1940, 350)],
    hint: 'Boulders and a raging bear share the mountain trail. High jumps are essential!'
  },
  {
    id: 24,
    world: 5,
    worldName: 'World 5:the Snowy lands',
    title: 'The Storm Bridge',
    subtitle: 'Traverse floating sky bridges while lightning strikes from above.',
    worldWidth: 3300,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 3150, y: 440 },
    theme: 'storm',
    platforms: [
      p('st24_f1', 0, 480, 400, 120, 'stone'),
      p('st24_m1', 470, 410, 110, 22, 'stone', { isMoving: true, moveRangeX: 160, moveRangeY: 0, moveSpeed: 1.4, startX: 470, startY: 410 }),
      p('st24_isle1', 750, 410, 140, 24, 'stone'),
      p('st24_m2', 960, 320, 110, 22, 'stone', { isMoving: true, moveRangeX: 0, moveRangeY: 80, moveSpeed: 1.3, startX: 960, startY: 320 }),
      p('st24_isle2', 1170, 330, 240, 24, 'stone'),
      p('st24_m3', 1480, 370, 110, 22, 'stone', { isMoving: true, moveRangeX: 180, moveRangeY: 0, moveSpeed: 1.5, startX: 1480, startY: 370 }),
      p('st24_isle3', 1780, 410, 140, 24, 'stone'),
      p('st24_m4', 1990, 410, 110, 22, 'stone', { isMoving: true, moveRangeX: 160, moveRangeY: 0, moveSpeed: 1.4, startX: 1990, startY: 410 }),
      p('st24_f2', 2270, 480, 1030, 120, 'stone'),
    ],
    coins: [
      ...coinLine('st24_1', 200, 440, 3),
      ...coinLine('st24_2', 1190, 300, 3),
      ...coinLine('st24_3', 1800, 380, 2),
      ...coinLine('st24_4', 2450, 440, 5),
    ],
    chests: [
      chest('st24_c1', 1230, 304, 'diamond_armor', 1),
    ],
    thunderclouds: [
      lightning('th24_1', 750, 160, 750, 410, 1.5, 0.45, 2.7),
      lightning('th24_2', 1780, 160, 1780, 410, 1.5, 0.45, 2.7),
      lightning('th24_3', 2700, 160, 2700, 480, 1.4, 0.45, 2.5),
    ],
    checkpoints: [cp('st24_cp', 1180, 310)],
    hint: 'Do not linger on island perches when thunderclouds gather overhead!'
  },
  {
    id: 25,
    world: 5,
    worldName: 'World 5:the Snowy lands',
    title: 'The Impossible Climb',
    subtitle: 'Towering cliff ledges and sheer vertical drops test your resolve.',
    worldWidth: 3400,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 3250, y: 280 },
    theme: 'storm',
    platforms: [
      p('st25_f1', 0, 480, 400, 120, 'stone'),
      p('st25_p1', 460, 420, 120, 22, 'stone'),
      p('st25_p2', 640, 360, 120, 22, 'stone'),
      p('st25_p3', 820, 300, 120, 22, 'stone'),
      p('st25_p4', 1000, 240, 140, 22, 'stone'),
      p('st25_m1', 1210, 240, 100, 20, 'stone', { isMoving: true, moveRangeX: 140, moveRangeY: 0, moveSpeed: 1.4, startX: 1210, startY: 240 }),
      p('st25_p5', 1420, 240, 140, 22, 'stone'),
      p('st25_p6', 1630, 300, 120, 22, 'stone'),
      p('st25_p7', 1820, 360, 120, 22, 'stone'),
      p('st25_p8', 2010, 420, 140, 22, 'stone'),
      p('st25_f2', 2220, 480, 500, 120, 'stone'),
      p('st25_p9', 2780, 410, 120, 22, 'stone'),
      p('st25_p10', 2960, 340, 140, 22, 'stone'),
      p('st25_exit_p', 3160, 320, 240, 280, 'stone'),
    ],
    coins: [
      ...coinArc('st25_1', 470, 400, 3, 30),
      ...coinArc('st25_2', 830, 280, 3, 30),
      ...coinLine('st25_3', 1440, 210, 3),
      ...coinLine('st25_4', 2300, 440, 4),
    ],
    chests: [
      chest('st25_c1', 1470, 214, 'coins', 50),
    ],
    enemies: [
      bear('st25_b1', 2400, 444, 2240, 2680),
    ],
    thunderclouds: [
      lightning('th25_1', 1000, 100, 1000, 240, 1.6, 0.45, 3.0),
    ],
    checkpoints: [cp('st25_cp', 1430, 220)],
    hint: 'Climb step by step. A missed jump means a long plunge!'
  },
  {
    id: 26,
    world: 5,
    worldName: 'World 5:the Snowy lands',
    title: 'The Bear Ambush',
    subtitle: 'Grizzly bears block the mountain pass. Slay or outsmart them!',
    worldWidth: 3400,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 3250, y: 440 },
    theme: 'storm',
    platforms: [
      p('st26_f1', 0, 480, 420, 120, 'stone'),
      p('st26_b1_p', 490, 480, 600, 120, 'stone'),
      p('st26_high1', 750, 330, 140, 24, 'stone'),
      p('st26_b2_p', 1160, 480, 650, 120, 'stone'),
      p('st26_high2', 1420, 320, 150, 24, 'stone'),
      p('st26_b3_p', 1880, 480, 650, 120, 'stone'),
      p('st26_f2', 2600, 480, 800, 120, 'stone'),
    ],
    coins: [
      ...coinLine('st26_1', 200, 440, 3),
      ...coinLine('st26_sec1', 770, 300, 3),
      ...coinLine('st26_sec2', 1440, 290, 3),
      ...coinLine('st26_2', 2700, 440, 5),
    ],
    chests: [
      chest('st26_c1', 800, 304, 'heart', 1),
      chest('st26_c2', 1470, 294, 'coins', 45),
    ],
    enemies: [
      bear('st26_b1', 700, 444, 510, 1050),
      bear('st26_b2', 1380, 444, 1180, 1780),
      bear('st26_b3', 2100, 444, 1900, 2500),
    ],
    checkpoints: [cp('st26_cp', 1430, 300)],
    hint: 'Use the elevated ledges to bypass bears safely or strike from above!'
  },
  {
    id: 27,
    world: 5,
    worldName: 'World 5:the Snowy lands',
    title: 'The Thunderstorm Run',
    subtitle: 'Lightning, falling rocks, and collapsing platforms in a tempest!',
    worldWidth: 3500,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 3350, y: 440 },
    theme: 'storm',
    platforms: [
      p('st27_f1', 0, 480, 400, 120, 'stone'),
      p('st27_step1', 470, 480, 500, 120, 'stone'),
      p('st27_m1', 1040, 410, 110, 22, 'stone', { isMoving: true, moveRangeX: 160, moveRangeY: 0, moveSpeed: 1.4, startX: 1040, startY: 410 }),
      p('st27_step2', 1330, 480, 550, 120, 'stone'),
      p('st27_p1', 1940, 380, 140, 24, 'stone'),
      p('st27_m2', 2150, 380, 110, 22, 'stone', { isMoving: true, moveRangeX: 160, moveRangeY: 0, moveSpeed: 1.5, startX: 2150, startY: 380 }),
      p('st27_step3', 2440, 480, 500, 120, 'stone'),
      p('st27_f2', 3010, 480, 490, 120, 'stone'),
    ],
    coins: [
      ...coinLine('st27_1', 200, 440, 3),
      ...coinArc('st27_2', 680, 450, 4, 35),
      ...coinLine('st27_3', 1500, 450, 3),
      ...coinLine('st27_4', 3100, 440, 4),
    ],
    chests: [],
    thunderclouds: [
      lightning('th27_1', 700, 160, 700, 480, 1.3, 0.4, 2.2),
      lightning('th27_2', 1580, 160, 1580, 480, 1.4, 0.4, 2.4),
      lightning('th27_3', 2650, 160, 2650, 480, 1.3, 0.4, 2.2),
    ],
    boulders: [
      boulder('b27_1', 920, 462, -3.2),
      boulder('b27_2', 2880, 462, -3.4),
    ],
    checkpoints: [cp('st27_cp', 1950, 360)],
    hint: 'Never stop running when the clouds begin to flash!'
  },
  {
    id: 28,
    world: 5,
    worldName: 'World 5:the Snowy lands',
    title: 'The Super Impossible Challenge',
    subtitle: 'Extremely difficult! Bears, lightning, precision jumps, and narrow perches.',
    worldWidth: 3600,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 3450, y: 440 },
    theme: 'storm',
    platforms: [
      p('st28_f1', 0, 480, 380, 120, 'stone'),
      p('st28_p1', 440, 420, 95, 20, 'stone'),
      p('st28_m1', 590, 380, 90, 20, 'stone', { isMoving: true, moveRangeX: 140, moveRangeY: 0, moveSpeed: 1.5, startX: 590, startY: 380 }),
      p('st28_p2', 800, 340, 95, 20, 'stone'),
      p('st28_bear_p1', 960, 480, 480, 120, 'stone'),
      p('st28_p3', 1500, 410, 95, 20, 'stone'),
      p('st28_m2', 1660, 320, 90, 20, 'stone', { isMoving: true, moveRangeX: 0, moveRangeY: 80, moveSpeed: 1.4, startX: 1660, startY: 320 }),
      p('st28_p4', 1830, 320, 100, 20, 'stone'),
      p('st28_bear_p2', 2000, 480, 520, 120, 'stone'),
      p('st28_m3', 2590, 410, 95, 20, 'stone', { isMoving: true, moveRangeX: 160, moveRangeY: 0, moveSpeed: 1.6, startX: 2590, startY: 410 }),
      p('st28_p5', 2880, 370, 95, 20, 'stone'),
      p('st28_f2', 3050, 480, 550, 120, 'stone'),
    ],
    coins: [
      ...coinArc('st28_1', 450, 400, 3, 30),
      ...coinLine('st28_2', 1000, 450, 3),
      ...coinLine('st28_3', 1840, 290, 2),
      ...coinLine('st28_4', 3150, 440, 5),
    ],
    chests: [
      chest('st28_c1', 1860, 294, 'heart', 1),
    ],
    enemies: [
      bear('st28_b1', 1150, 444, 980, 1400),
      bear('st28_b2', 2220, 444, 2020, 2480),
    ],
    thunderclouds: [
      lightning('th28_1', 1180, 160, 1180, 480, 1.3, 0.4, 2.3),
      lightning('th28_2', 2240, 160, 2240, 480, 1.3, 0.4, 2.3),
      lightning('th28_3', 3200, 160, 3200, 480, 1.4, 0.4, 2.5),
    ],
    boulders: [
      boulder('b28_1', 1380, 462, -3.2),
      boulder('b28_2', 2460, 462, -3.4),
    ],
    checkpoints: [
      cp('st28_cp1', 810, 320),
      cp('st28_cp2', 1840, 300),
    ],
    hint: 'Checkpoints will save your progress across this brutal trial!'
  },
  {
    id: 29,
    world: 5,
    worldName: 'World 5:the Snowy lands',
    title: 'The Last Test',
    subtitle: 'The darkest night before dawn. Break through to the Green Fields!',
    worldWidth: 3700,
    worldHeight: 600,
    spawnPoint: { x: 100, y: 440 },
    exitPoint: { x: 3550, y: 440 },
    theme: 'storm',
    platforms: [
      p('st29_f1', 0, 480, 400, 120, 'stone'),
      p('st29_p1', 460, 420, 110, 22, 'stone'),
      p('st29_step1', 630, 480, 550, 120, 'stone'),
      p('st29_m1', 1240, 390, 100, 20, 'stone', { isMoving: true, moveRangeX: 160, moveRangeY: 0, moveSpeed: 1.5, startX: 1240, startY: 390 }),
      p('st29_step2', 1530, 480, 600, 120, 'stone'),
      p('st29_p2', 2200, 400, 110, 22, 'stone'),
      p('st29_m2', 2380, 320, 100, 20, 'stone', { isMoving: true, moveRangeX: 0, moveRangeY: 80, moveSpeed: 1.4, startX: 2380, startY: 320 }),
      p('st29_step3', 2560, 480, 550, 120, 'stone'),
      p('st29_f2', 3170, 480, 530, 120, 'stone'),
    ],
    coins: [
      ...coinLine('st29_1', 200, 440, 4),
      ...coinArc('st29_2', 800, 450, 4, 35),
      ...coinLine('st29_3', 1700, 450, 3),
      ...coinLine('st29_4', 3300, 440, 5),
    ],
    chests: [
      chest('st29_c1', 2220, 374, 'coins', 60),
    ],
    enemies: [
      bear('st29_b1', 850, 444, 650, 1140),
      bear('st29_b2', 1780, 444, 1550, 2090),
    ],
    thunderclouds: [
      lightning('th29_1', 880, 160, 880, 480, 1.3, 0.4, 2.1),
      lightning('th29_2', 1820, 160, 1820, 480, 1.3, 0.4, 2.1),
      lightning('th29_3', 2800, 160, 2800, 480, 1.3, 0.4, 2.1),
    ],
    boulders: [
      boulder('b29_1', 1100, 462, -3.2),
      boulder('b29_2', 3050, 462, -3.4),
    ],
    checkpoints: [
      cp('st29_cp1', 1540, 460),
      cp('st29_cp2', 2570, 460),
    ],
    hint: 'Victory is in sight! The green fields lie just beyond the mountain gate!'
  },

  // ================= WORLD 6: THE GREEN FIELDS • SUMMIT ARENA (Level 30 - Grand Finale Boss) =================
  {
    id: 30,
    world: 6,
    worldName: 'World 6:the End',
    title: 'The Cockatrice Lair',
    subtitle: 'Who dares to complete my challenges? Defeat the legendary Cockatrice!',
    worldWidth: 1600,
    worldHeight: 600,
    spawnPoint: { x: 140, y: 420 },
    exitPoint: { x: 1460, y: 420 },
    theme: 'fields',
    platforms: [
      // One giant continuous land platform across the entire arena so players can never fall in gaps
      p('gf30_giant_land', 0, 460, 1600, 140, 'grass'),
    ],
    coins: [
      ...coinLine('gf30_1', 180, 420, 3),
      ...coinArc('gf30_2', 680, 410, 5, 30),
      ...coinLine('gf30_3', 1260, 420, 3),
    ],
    chests: [],
    checkpoints: [cp('gf30_cp', 160, 460)],
    silkieSam: {
      x: 270,
      y: -120,
      vx: 0,
      vy: 0,
      targetY: 340,
      state: 'waiting',
      dialogueTimer: 0,
      dialogueCharIndex: 0,
      speechText: '',
      shieldDropped: false,
      shieldX: 250,
      shieldY: 340,
      shieldVy: 0,
      shieldCollected: false,
      swordDropped: false,
      swordX: 290,
      swordY: 340,
      swordVy: 0,
      swordCollected: false,
      wingAngle: 0,
    },
    cockatrice: {
      id: 'boss_cockatrice',
      x: 680,
      y: 130,
      vx: 0,
      vy: 0,
      width: 240,
      height: 190,
      health: 200,
      maxHealth: 200,
      phase: 1,
      rageMode: 'sky rage',
      burntMarksCount: 0,
      state: 'intro_dialogue',
      stateTimer: 0,
      dialogueIndex: 0,
      dialogueCharIndex: 0,
      dialogueTimer: 0,
      stunHitsNeeded: 3,
      stunTimer: 0,
      maxStunTime: 11,
      facing: 'left',
      targetX: 680,
      targetY: 130,
      fireProjectiles: [],
      biteTargetX: 0,
      biteTargetY: 0,
      animTimer: 0,
      invulnerableTimer: 0,
      wingAngle: 0,
      jawOpen: 0,
      bittenLandCraters: [],
    },
    hint: 'Hold S or Down Arrow for 5 seconds to block the Inferno Flame! Counter his bites and claw slashes with your sword to defeat him!'
  }
];

export function getLevelConfig(id: number): LevelConfig {
  const found = LEVELS.find(l => l.id === id);
  const lvl: LevelConfig = JSON.parse(JSON.stringify(found || LEVELS[0]));

  // World 4 is Jungle Biome, World 5 is Snowy Mountain Biome
  if (lvl.world === 4) {
    lvl.theme = 'jungle';
    // Boulders in World 4 come from jungle temple trap droppers and appear when reaching the other side!
    if (lvl.boulders) {
      lvl.boulders.forEach(b => {
        b.hasTrapDropper = true;
        b.trapDropperX = b.startX;
        b.trapDropperY = Math.max(70, b.startY - 200);
        b.triggered = false;
        b.isFalling = false;
        b.isRolling = false;
        b.y = b.trapDropperY;
      });
    }
  } else if (lvl.world === 5) {
    lvl.theme = 'snowy';
    // Boulders in World 5 also fall from temple traps with snowy and icy tarp canopy
    if (lvl.boulders) {
      lvl.boulders.forEach(b => {
        b.hasTrapDropper = true;
        b.trapDropperX = b.startX;
        b.trapDropperY = Math.max(70, b.startY - 200);
        b.triggered = false;
        b.isFalling = false;
        b.isRolling = false;
        b.y = b.trapDropperY;
      });
    }
  }

  // Ensure ALL checkpoint flags are strictly placed on solid, NON-MOVING platforms
  // and perfectly centered safely in the middle of the floating land (never on or off the edge!)
  if (lvl.checkpoints && lvl.platforms && lvl.platforms.length > 0) {
    const solidPlatforms = lvl.platforms.filter(p => !p.isMoving);

    lvl.checkpoints.forEach(cp => {
      // Find the supporting solid non-moving platform for this checkpoint
      let bestPlat = solidPlatforms.find(p => p.x <= cp.x && p.x + p.width >= cp.x);
      if (!bestPlat) {
        // Find the closest non-moving platform horizontally
        bestPlat = solidPlatforms.reduce((closest, p) => {
          const distCurrent = Math.abs((p.x + p.width / 2) - cp.x);
          const distClosest = Math.abs((closest.x + closest.width / 2) - cp.x);
          return distCurrent < distClosest ? p : closest;
        }, solidPlatforms[0]);
      }

      if (bestPlat) {
        // Center the checkpoint flag safely in the middle of this solid platform
        // Never slightly off the edge!
        cp.x = Math.round(bestPlat.x + bestPlat.width / 2);
        cp.y = bestPlat.y;
      }
    });
  }

  return lvl;
}
