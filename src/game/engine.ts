import { 
  PlayerState, LevelConfig, Camera, Particle, FloatingText, Platform, SaveData, Enemy, TreasureChest, ChickenGender, CockatriceBoss, ArmorType, SwordType
} from './types';
import { getLevelConfig } from './levels';
import { audio } from './audio';

export interface GameEngineCallbacks {
  onLevelClear: (levelId: number, coinsEarned: number) => void;
  onGameOver: () => void;
  onVictory: (totalCoins: number) => void;
  onEvolution: (stage: 'juvenile' | 'teen' | 'adult') => void;
  onStatsUpdate: (health: number, coins: number, stage: PlayerState['stage'], armor?: ArmorType, sword?: SwordType, hasShield?: boolean) => void;
  onActionStat?: (statType: 'enemiesDefeated' | 'trapsTriggered' | 'projectilesDeflected' | 'levelsClearedWithoutDamage' | 'visitedCoopEvolved') => void;
  onSaveDataUpdate?: (patch: Partial<SaveData>) => void;
}

export class GameEngine {
  public player: PlayerState;
  public level: LevelConfig;
  public camera: Camera;
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public coinsEarnedThisLevel = 0;
  public isPaused = false;
  public time = 0;
  public tookDamageThisLevel = false;
  private callbacks: GameEngineCallbacks;
  private currentCheckpoint: { x: number; y: number } | null = null;
  private input = {
    left: false,
    right: false,
    jump: false,
    attack: false,
    block: false,
  };
  private canvasWidth = 960;
  private canvasHeight = 540;
  public swordType: SwordType = 'none';
  public armorType: ArmorType = 'none';
  public hasShield: boolean = false;
  private stepTimer = 0;
  private jumpTrailTimer = 0;
  private dashTrailTimer = 0;
  public saveData: SaveData;
  private reviveTokenUsed = false;
  public samLevel1State: 'idle' | 'line1' | 'line2' | 'done' = 'idle';
  public samLevel1Timer = 0;

  public setDifficulty(diff: 'easy' | 'normal' | 'hard') {
    this.saveData.difficulty = diff;
  }

  constructor(
    levelId: number,
    saveData: SaveData,
    canvasWidth: number,
    canvasHeight: number,
    callbacks: GameEngineCallbacks
  ) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.callbacks = callbacks;
    this.saveData = saveData;
    this.armorType = saveData.armor || 'none';
    this.swordType = saveData.sword || 'none';
    this.hasShield = Boolean(saveData.hasShield);

    this.level = getLevelConfig(levelId);
    this.camera = {
      x: 0,
      y: 0,
      viewportWidth: canvasWidth,
      viewportHeight: canvasHeight,
      worldWidth: this.level.worldWidth,
      worldHeight: this.level.worldHeight,
    };

    // Keep evolved form if level was already unlocked or chicken grew up
    const stage = this.getStageForLevel(levelId, saveData.unlockedLevel || 1);
    const gender = saveData.gender || 'rooster';
    const size = this.getSizeForStage(stage, gender);
    const maxHP = 3 + (saveData.upgrades?.extraHearts || 0);

    // Only clear equipment if playing Level 1 as an actual baby chick on a fresh run!
    // When replaying Level 1 as an evolved chicken (juvenile, teen, or adult), all gear is preserved!
    const isEvolvedRevisit = (saveData.unlockedLevel || 1) >= 10 || stage !== 'baby';
    if (levelId === 1 && !isEvolvedRevisit) {
      this.armorType = 'none';
      this.swordType = 'none';
      this.hasShield = false;
    }

    this.player = {
      x: this.level.spawnPoint.x,
      y: this.level.spawnPoint.y,
      vx: 0,
      vy: 0,
      width: size.w,
      height: size.h,
      facing: 'right',
      isGrounded: false,
      isJumping: false,
      jumpTime: 0,
      isAttacking: false,
      attackTimer: 0,
      attackCooldown: 0,
      isBlocking: false,
      blockTimer: 0,
      hasShield: this.hasShield,
      health: maxHP,
      maxHealth: maxHP,
      invulnerableTimer: 0,
      knockbackTimer: 0,
      stage,
      gender,
      animState: 'idle',
      animTimer: 0,
      walkAnimTimer: 0,
      onMovingPlatform: null,
      fireResistTimer: 0,
    };

    this.currentCheckpoint = { ...this.level.spawnPoint };

    // Auto-equip defaults only if no armor or sword is currently equipped
    if (this.armorType === 'none') {
      if (this.player.stage === 'teen' || this.player.stage === 'adult') {
        this.armorType = 'gold';
      } else if (this.player.stage === 'juvenile') {
        this.armorType = 'iron';
      }
    }
    if (this.swordType === 'none') {
      if (this.player.stage === 'teen' || this.player.stage === 'adult') {
        this.swordType = 'gold';
      } else if (this.player.stage === 'juvenile') {
        this.swordType = 'iron';
      }
    }

    // Anchor checkpoint flags firmly on non-moving platforms while preserving safe offsets away from chests & hazards
    this.level.checkpoints.forEach(checkpoint => {
      const solidPlats = this.level.platforms.filter(pl => !pl.isMoving);
      const candidates = solidPlats.length > 0 ? solidPlats : this.level.platforms;
      const matching = candidates.filter(
        pl => pl.x <= checkpoint.x + 80 && pl.x + pl.width >= checkpoint.x - 80
      );
      if (matching.length > 0) {
        matching.sort((a, b) => Math.abs(a.y - checkpoint.y) - Math.abs(b.y - checkpoint.y));
        const plat = matching[0];
        checkpoint.y = plat.y;
        const margin = Math.min(34, Math.floor(plat.width / 4));
        const minX = Math.round(plat.x + margin);
        const maxX = Math.round(plat.x + plat.width - margin);
        checkpoint.x = Math.max(minX, Math.min(maxX, Math.round(checkpoint.x)));

        if (this.level.chests && this.level.chests.length > 0) {
          const nearbyChest = this.level.chests.find(
            ch => Math.abs((ch.y + ch.height) - plat.y) <= 24 &&
                  ch.x + ch.width >= plat.x &&
                  ch.x <= plat.x + plat.width
          );
          if (nearbyChest) {
            const chestCenter = nearbyChest.x + nearbyChest.width / 2;
            if (Math.abs(checkpoint.x - chestCenter) < 58) {
              const leftSpot = Math.max(minX, Math.round(nearbyChest.x - 42));
              const rightSpot = Math.min(maxX, Math.round(nearbyChest.x + nearbyChest.width + 42));
              checkpoint.x = Math.abs(leftSpot - chestCenter) >= Math.abs(rightSpot - chestCenter) ? leftSpot : rightSpot;
            }
          }
        }
      }
    });

    // Ensure enemies do not patrol directly through checkpoint safe standing zones
    if (this.level.enemies && this.level.checkpoints) {
      this.level.enemies.forEach(enemy => {
        this.level.checkpoints.forEach(cp => {
          if (Math.abs(enemy.y - cp.y) < 70) {
            if (cp.x >= enemy.patrolLeft && cp.x <= enemy.patrolRight) {
              if (cp.x - enemy.patrolLeft > enemy.patrolRight - cp.x) {
                enemy.patrolRight = Math.max(enemy.patrolLeft + 40, cp.x - 70);
              } else {
                enemy.patrolLeft = Math.min(enemy.patrolRight - 40, cp.x + 70);
              }
              enemy.x = Math.max(enemy.patrolLeft, Math.min(enemy.patrolRight - enemy.width, enemy.x));
            }
          }
        });
      });
    }

    // When returning to previous levels after defeating the boss / completing the game:
    // Enemies are gone, moving platforms stop moving, volcanoes die, and thunderclouds become peaceful normal clouds!
    if (this.saveData.hasCompletedGame && levelId < 30) {
      this.level.enemies = [];
      this.level.platforms.forEach(p => {
        p.isMoving = false;
        p.moveSpeed = 0;
        p.vx = 0;
        p.vy = 0;
      });
      this.level.volcanoes?.forEach(v => {
        v.isDead = true;
        v.state = 'inactive';
        v.timer = 999999;
        v.lavaParticles = [];
      });
      this.level.thunderclouds?.forEach(th => {
        th.isPeaceful = true;
        th.isNormal = true;
        th.state = 'idle';
        th.timer = 999999;
      });
      this.level.boulders?.forEach(b => {
        b.isRolling = false;
        b.isFalling = false;
        b.speed = 0;
        b.vx = 0;
        b.vy = 0;
      });

      // Post-Boss Level Replay: Mark previously collected coins and checkpoints as finished!
      // Any coins or checkpoints that were NOT collected yet will still be there waiting.
      const collectedSet = new Set(this.saveData.collectedCoinIds || []);
      this.level.coins.forEach(c => {
        const coinKey = `${levelId}_${c.id}`;
        if (collectedSet.has(coinKey)) {
          c.collected = true;
        }
      });

      const checkpointSet = new Set(this.saveData.activatedCheckpointIds || []);
      this.level.checkpoints.forEach(cp => {
        const cpKey = `${levelId}_${cp.id}`;
        if (checkpointSet.has(cpKey)) {
          cp.reached = true;
        }
      });
    }

    // In Level 30, Silkie Sam always prepares to gift the Royal Shield and Netherite Sword!
    if (this.level.silkieSam) {
      this.level.silkieSam.shieldCollected = false;
      this.level.silkieSam.shieldDropped = false;
      this.level.silkieSam.swordCollected = false;
      this.level.silkieSam.swordDropped = false;
      this.level.silkieSam.state = 'waiting';
    }

    if (!this.level.enemies) {
      this.level.enemies = [];
    }

    if (levelId === 1 && saveData.hasSeenSamLevel1Joke) {
      this.samLevel1State = 'done';
    }

    // Secret Badge: "Back Home" - Revisit level 1 as an evolved chicken!
    if (levelId === 1 && isEvolvedRevisit) {
      this.callbacks.onActionStat?.('visitedCoopEvolved');
      setTimeout(() => {
        this.addFloatingText('★ SECRET BADGE UNLOCKED: BACK HOME! ★', this.player.x + this.player.width / 2, this.player.y - 35, '#fde047');
      }, 400);
    }
  }

  public resize(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.camera.viewportWidth = width;
    this.camera.viewportHeight = height;
  }

  public respawnAtSamSpot() {
    const sam = this.level.silkieSam;
    const groundY = 460;
    const samCenterX = sam ? sam.x : 270;

    // Return directly to the spot where Silkie Sam drops the Royal Shield & Netherite Sword
    this.player.x = Math.round(samCenterX - this.player.width / 2);
    this.player.y = groundY - this.player.height;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.facing = 'right';
    this.player.isGrounded = true;
    this.player.isJumping = false;
    this.player.isAttacking = false;
    this.player.isBlocking = false;
    this.player.knockbackTimer = 0;
    this.player.invulnerableTimer = 2.0;
    this.player.fireResistTimer = 0;
    this.player.onMovingPlatform = null;
    this.player.health = this.player.maxHealth;

    if (sam) {
      if (!sam.shieldCollected) {
        sam.shieldDropped = true;
        sam.shieldX = sam.x - 14;
        sam.shieldY = 440;
        sam.shieldVy = 0;
      } else {
        this.hasShield = true;
        this.player.hasShield = true;
      }

      if (!sam.swordCollected) {
        sam.swordDropped = true;
        sam.swordX = sam.x + 18;
        sam.swordY = 440;
        sam.swordVy = 0;
      } else {
        this.swordType = 'netherite';
      }
      sam.state = 'gone';
    }

    this.level.enemies = [];
    this.particles = [];
    this.floatingTexts = [];

    const boss = this.level.cockatrice;
    if (boss) {
      boss.x = 680;
      boss.y = 160;
      boss.vx = 0;
      boss.vy = 0;
      boss.health = boss.maxHealth;
      boss.displayHealth = boss.maxHealth;
      boss.phase = 1;
      boss.rageMode = 'sky rage';
      boss.burntMarksCount = 0;
      boss.burnIntensity = 0;
      boss.isShakingOff = false;
      boss.shakeOffTimer = 0;
      boss.regrowGlowTimer = 0;
      boss.ashExplodeFlash = 0;
      boss.fireProjectiles = [];
      boss.shockwaves = [];
      boss.slashTrails = [];
      boss.bittenLandCraters = [];
      boss.summonWaveIndex = 0;
      boss.attacksSinceSummon = 0;
      boss.summonWaveType = undefined;
      boss.state = 'countdown';
      boss.countdownTimer = 3.99;
      boss.countdownText = '3..';
      boss.stateTimer = 0;
      boss.jawOpen = 0;
    }

    this.isPaused = false;
    audio.playCountdownPip(3);
    audio.playMusic('boss');
    this.addFloatingText("★ BACK AT SAM'S WEAPON SPOT! ★", this.player.x + this.player.width / 2, this.player.y - 28, '#38bdf8');
    this.callbacks.onStatsUpdate(
      this.player.health,
      this.coinsEarnedThisLevel,
      this.player.stage,
      this.armorType,
      this.swordType,
      this.hasShield
    );
  }

  public getStageForLevel(levelId: number, maxUnlockedLevel: number = 1): PlayerState['stage'] {
    // When growing up, going back to Level 1 or early levels keeps the highest evolved stage!
    const effective = Math.max(levelId, maxUnlockedLevel);
    if (effective <= 9) return 'baby';
    if (effective <= 14) return 'juvenile';
    if (effective <= 19) return 'teen';
    return 'adult';
  }

  private getSizeForStage(stage: PlayerState['stage'], gender: ChickenGender = 'rooster'): { w: number; h: number } {
    if (gender === 'rooster') {
      // Rooster: taller, athletic upright stance, tall crown comb
      switch (stage) {
        case 'baby': return { w: 22, h: 25 };
        case 'juvenile': return { w: 26, h: 30 };
        case 'teen': return { w: 30, h: 36 };
        case 'adult': return { w: 34, h: 42 };
        default: return { w: 24, h: 28 };
      }
    } else {
      // Hen: broader, rounder, plumper body profile, compact center of gravity
      switch (stage) {
        case 'baby': return { w: 24, h: 22 };
        case 'juvenile': return { w: 29, h: 26 };
        case 'teen': return { w: 34, h: 30 };
        case 'adult': return { w: 40, h: 36 };
        default: return { w: 26, h: 24 };
      }
    }
  }

  private coyoteTimer = 0;
  private jumpBufferTimer = 0;

  public setInput(controls: { left?: boolean; right?: boolean; jump?: boolean; attack?: boolean; block?: boolean }) {
    if (controls.left !== undefined) this.input.left = controls.left;
    if (controls.right !== undefined) this.input.right = controls.right;
    if (controls.jump !== undefined) {
      if (controls.jump) {
        this.jumpBufferTimer = 0.16; // Jump buffer window
        if (this.player.isGrounded || this.coyoteTimer > 0) {
          this.startJump();
        }
      }
      this.input.jump = controls.jump;
    }
    if (controls.attack !== undefined) {
      if (controls.attack && !this.input.attack) {
        this.triggerAttack();
      }
      this.input.attack = controls.attack;
    }
    if (controls.block !== undefined) {
      if (controls.block && !this.input.block) {
        if (this.hasShield) {
          audio.playShieldBlock();
        }
      }
      const canBlock = controls.block && this.hasShield;
      this.input.block = canBlock;
      this.player.isBlocking = canBlock;
    }
  }

  private startJump() {
    const jumpPower = this.player.stage === 'adult' ? -480 : this.player.stage === 'teen' ? -450 : this.player.stage === 'juvenile' ? -430 : -410;
    this.player.vy = jumpPower;
    this.player.isGrounded = false;
    this.player.isJumping = true;
    this.player.jumpTime = 0;
    this.jumpTrailTimer = 0;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.player.onMovingPlatform = null;
    audio.playJump(this.player.stage === 'adult');
    this.addColorfulJumpDustBurst(this.player.x + this.player.width / 2, this.player.y + this.player.height, 8);
  }

  private triggerAttack() {
    if (this.player.attackCooldown > 0) return;

    this.player.isAttacking = true;
    this.player.attackTimer = 0.22;
    this.player.attackCooldown = 0.35;
    this.dashTrailTimer = 0;
    if (this.player.knockbackTimer <= 0 && (this.input.left || this.input.right)) {
      const dashDir = this.player.facing === 'right' ? 1 : -1;
      this.player.vx = dashDir * Math.max(Math.abs(this.player.vx), 330);
    }
    this.addDashAttackPixelTrail(8);
    audio.playAttack(this.swordType === 'gold' || this.swordType === 'diamond' || this.swordType === 'netherite');

    // Attack hitbox in front of player
    const reach = this.swordType === 'netherite' ? 56 : (this.swordType === 'diamond' ? 44 : (this.swordType === 'gold' ? 36 : 24));
    const hitX = this.player.facing === 'right' ? this.player.x + this.player.width : this.player.x - reach;
    const hitW = reach;
    const hitY = this.player.y;
    const hitH = this.player.height;

    // Check hit against enemies
    if (this.level.enemies) {
      this.level.enemies.forEach(enemy => {
        if (enemy.state === 'defeated') return;
        if (
          hitX < enemy.x + enemy.width &&
          hitX + hitW > enemy.x &&
          hitY < enemy.y + enemy.height &&
          hitY + hitH > enemy.y
        ) {
          const ironBeakBonus = this.saveData.upgrades?.ironBeak || 0;
          const baseDmg = this.swordType === 'netherite' ? 10 : (this.swordType === 'diamond' ? 6 : (this.swordType === 'gold' ? 4 : (this.swordType === 'iron' ? 2 : 1)));
          const dmg = baseDmg + ironBeakBonus;
          this.damageEnemy(enemy, dmg);
        }
      });
    }

    // Check hit against Cockatrice boss (stunned OR when boss swoops in to peck or slash!)
    if (this.level.cockatrice) {
      const boss = this.level.cockatrice;
      if (boss.state === 'stunned') {
        if (
          hitX < boss.x + boss.width &&
          hitX + hitW > boss.x &&
          hitY < boss.y + boss.height &&
          hitY + hitH > boss.y
        ) {
          this.hitStunnedCockatrice(boss);
        }
      } else if (
        boss.state === 'prepare_peck' ||
        boss.state === 'pecking' ||
        boss.state === 'prepare_claw' ||
        boss.state === 'clawing'
      ) {
        // Strike boss when he comes close to peck/bite or slash with his claws!
        const bX = boss.x;
        const bW = boss.width;
        const bY = boss.y;
        const bH = boss.height;

        if (
          hitX < bX + bW &&
          hitX + hitW > bX &&
          hitY - 25 < bY + bH &&
          hitY + hitH + 25 > bY
        ) {
          this.hitActiveCockatriceWithSword(boss);
        }
      } else if (
        boss.state === 'prepare_fire' ||
        boss.state === 'shooting_fire' ||
        boss.state === 'inferno_flame' ||
        boss.state === 'flying_idle' ||
        boss.state === 'prepare_stomp' ||
        boss.state === 'stomping_platform' ||
        boss.state === 'prepare_tail_whip' ||
        boss.state === 'tail_whipping' ||
        boss.state === 'prepare_summon' ||
        boss.state === 'waiting_summons'
      ) {
        // When boss is not biting or claw slashing, sword deflects against his armored scales
        const bX = boss.x;
        const bW = boss.width;
        const bY = boss.y;
        const bH = boss.height;

        if (
          hitX < bX + bW &&
          hitX + hitW > bX &&
          hitY - 25 < bY + bH &&
          hitY + hitH + 25 > bY
        ) {
          audio.playRockSmash();
          const deflectMsg = boss.state === 'waiting_summons'
            ? '⚔️ DEFEAT HIS SUMMONED ENEMIES FIRST! ⚔️'
            : '⚡ STRIKE WHEN HE BITES OR SLASHES! ⚡';
          this.addFloatingText(deflectMsg, boss.x + boss.width / 2, boss.y - 12, '#facc15');
          for (let p = 0; p < 8; p++) {
            this.particles.push({
              x: (hitX + bX + bW) / 2,
              y: (hitY + bY + bH) / 2,
              vx: (Math.random() - 0.5) * 110,
              vy: -Math.random() * 80 - 20,
              size: 3,
              color: '#94a3b8',
              life: 0.25,
              maxLife: 0.25
            });
          }
        }
      }
    }

    // Check hit against unopened chests
    this.level.chests.forEach(chest => {
      if (!chest.opened) {
        const dist = Math.hypot(this.player.x - chest.x, this.player.y - chest.y);
        if (dist < 48) {
          this.openChest(chest);
        }
      }
    });
  }

  private damageEnemy(enemy: Enemy, amount: number) {
    enemy.health -= amount;
    enemy.hurtTimer = 0.25;
    if (enemy.type === 'wolf') audio.playWolfHurt();
    else if (enemy.type === 'fox') audio.playFoxHurt();
    else if (enemy.type === 'bear') audio.playBearHurt();
    else audio.playEnemyDefeat();

    // Knockback enemy slightly
    enemy.vx = (this.player.facing === 'right' ? 2.5 : -2.5);

    this.addFloatingText(`-${amount}`, enemy.x + enemy.width / 2, enemy.y - 10, '#f87171');

    if (enemy.health <= 0) {
      enemy.state = 'defeated';
      this.addDefeatExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
      this.addFloatingText('+COINS!', enemy.x + enemy.width / 2, enemy.y - 20, '#facc15');
      this.coinsEarnedThisLevel += 5;
      audio.playCoin();
      this.callbacks.onActionStat?.('enemiesDefeated');
    }
  }

  // --- Main Update Loop ---

  public update(dt: number) {
    if (this.isPaused) return;

    // Cap delta time to prevent tunneling during lag spikes
    const delta = Math.min(dt, 0.05);
    this.time += delta;

    // Coyote timer & jump buffer timer
    if (this.player.isGrounded) {
      this.coyoteTimer = 0.12;
    } else if (this.coyoteTimer > 0) {
      this.coyoteTimer -= delta;
    }

    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= delta;
      if (this.player.isGrounded || this.coyoteTimer > 0) {
        this.startJump();
      }
    }

    this.updateMovingPlatforms(delta);
    this.updatePlayer(delta);
    this.updateHazards(delta);
    this.updateEnemies(delta);
    this.updateCockatrice(delta);
    this.updateSilkieSam(delta);
    this.updateLevel1Sam(delta);
    this.updateCollectibles(delta);
    this.updateParticles(delta);
    this.updateFloatingTexts(delta);
    this.updateCamera();
  }

  private updateLevel1Sam(dt: number) {
    if (this.level.id !== 1) return;
    if (this.saveData.hasSeenSamLevel1Joke || this.samLevel1State === 'done') {
      this.samLevel1State = 'done';
      return;
    }

    const standCenterX = 380 + 34; // standX = 380, counterW = 68
    const pCenter = this.player.x + this.player.width / 2;
    const distToPlayer = Math.abs(pCenter - standCenterX);

    if (this.samLevel1State === 'idle') {
      if (distToPlayer < 220) {
        this.samLevel1State = 'line1';
        this.samLevel1Timer = 0;
        audio.playSilkieSpeech('welcome');
      }
    } else if (this.samLevel1State === 'line1') {
      this.samLevel1Timer += dt;
      if (this.samLevel1Timer >= 3.0) {
        this.samLevel1State = 'line2';
        this.samLevel1Timer = 0;
        audio.playSilkieSpeech('talk');
      }
    } else if (this.samLevel1State === 'line2') {
      this.samLevel1Timer += dt;
      if (this.samLevel1Timer >= 3.5 || (distToPlayer > 270 && this.samLevel1Timer >= 1.2)) {
        this.samLevel1State = 'done';
        this.saveData.hasSeenSamLevel1Joke = true;
        this.callbacks.onSaveDataUpdate?.({ hasSeenSamLevel1Joke: true });
      }
    }
  }

  private updateMovingPlatforms(dt: number) {
    this.level.platforms.forEach(p => {
      if (!p.isMoving) return;

      p.moveSpeed = p.moveSpeed || 1.2;
      p.startX = p.startX ?? p.x;
      p.startY = p.startY ?? p.y;
      p.moveRangeX = p.moveRangeX ?? 0;
      p.moveRangeY = p.moveRangeY ?? 0;

      const oldX = p.x;
      const oldY = p.y;

      if (p.moveRangeX > 0) {
        p.x = p.startX + Math.sin(this.time * p.moveSpeed) * p.moveRangeX;
      }
      if (p.moveRangeY > 0) {
        p.y = p.startY + Math.sin(this.time * p.moveSpeed) * p.moveRangeY;
      }

      p.vx = (p.x - oldX) / dt;
      p.vy = (p.y - oldY) / dt;

      // Carry player with moving platform if grounded on this platform
      if (this.player.onMovingPlatform === p && this.player.isGrounded && !this.player.isJumping) {
        const isHorizontallyOn = this.player.x + this.player.width > p.x && this.player.x < p.x + p.width;
        if (isHorizontallyOn) {
          this.player.x += (p.x - oldX);
          this.player.y = p.y - this.player.height;
          this.player.vy = 0;
        } else {
          this.player.onMovingPlatform = null;
        }
      }
    });
  }

  private updatePlayer(dt: number) {
    const p = this.player;

    // Timers
    if (p.invulnerableTimer > 0) p.invulnerableTimer -= dt;
    if (p.knockbackTimer > 0) p.knockbackTimer -= dt;
    if (p.attackTimer > 0) {
      p.attackTimer -= dt;
      if (p.attackTimer <= 0) p.isAttacking = false;
    }
    if (p.attackCooldown > 0) p.attackCooldown -= dt;

    if (p.fireResistTimer && p.fireResistTimer > 0) {
      p.fireResistTimer = Math.max(0, p.fireResistTimer - dt);
      if (p.fireResistTimer <= 0) {
        this.addFloatingText('🔥 Fire Resist Buff Expired', p.x + p.width / 2, p.y - 20, '#94a3b8');
      }

      // Small flame ember sparks rising from the fiery shield buff
      if (Math.random() < 0.25) {
        this.particles.push({
          x: p.x + p.width / 2 + (Math.random() - 0.5) * (p.width + 6),
          y: p.y + p.height / 2 + (Math.random() - 0.5) * (p.height + 4),
          vx: (Math.random() - 0.5) * 20,
          vy: -Math.random() * 35 - 15,
          size: 2.5 + Math.random() * 2,
          color: Math.random() > 0.5 ? '#f97316' : '#facc15',
          life: 0.35,
          maxLife: 0.35,
        });
      }
    }

    // Movement speed & acceleration (shield slows advance while guarding)
    let baseSpeed = p.stage === 'adult' ? 270 : p.stage === 'teen' ? 250 : p.stage === 'juvenile' ? 230 : 210;
    if (this.saveData.upgrades?.speedBoost) {
      baseSpeed *= (1 + this.saveData.upgrades.speedBoost * 0.15);
    }
    if (p.isBlocking) baseSpeed *= 0.55;
    const accel = 3400;
    const friction = 4200;

    if (p.knockbackTimer <= 0) {
      const activeSpeed = (p.isAttacking && p.attackTimer > 0.06) ? Math.max(baseSpeed, 330) : baseSpeed;
      if (this.input.left && !this.input.right) {
        p.vx = Math.max(-activeSpeed, p.vx - accel * dt);
        p.facing = 'left';
      } else if (this.input.right && !this.input.left) {
        p.vx = Math.min(activeSpeed, p.vx + accel * dt);
        p.facing = 'right';
      } else {
        // Snappy friction deceleration - cleanly halt without sliding
        if (Math.abs(p.vx) < 25) {
          p.vx = 0;
        } else if (p.vx > 0) {
          p.vx = Math.max(0, p.vx - friction * dt);
        } else if (p.vx < 0) {
          p.vx = Math.min(0, p.vx + friction * dt);
        }
      }

      // Footstep sound when walking grounded
      if (p.isGrounded && Math.abs(p.vx) > 30) {
        this.stepTimer += dt;
        if (this.stepTimer >= 0.28) {
          this.stepTimer = 0;
          audio.playFootstep();
        }
      } else {
        this.stepTimer = 0.2;
      }

      // Variable jump height handling: holding jump button sustains upward lift
      const maxJumpTime = 0.22 + (this.saveData.upgrades?.jumpBoost ? this.saveData.upgrades.jumpBoost * 0.04 : 0);
      if (this.input.jump && p.isJumping && p.jumpTime < maxJumpTime && p.vy < 0) {
        p.vy -= 460 * dt;
        p.jumpTime += dt;
      }

      // Fluffy Feathers Glider Upgrade: hold jump while falling to glide gently!
      if (this.saveData.upgrades?.fluffyGlider && this.input.jump && p.vy > 60 && !p.isGrounded) {
        p.vy = Math.min(p.vy, 135);
        if (Math.random() < 0.25) {
          this.particles.push({
            x: p.x + p.width / 2 + (Math.random() - 0.5) * 16,
            y: p.y + p.height - 4,
            vx: (Math.random() - 0.5) * 20,
            vy: 25,
            size: 2.5,
            color: '#fef08a',
            life: 0.3,
            maxLife: 0.3
          });
        }
      }

      // Golden Plumage Aura: radiant sparkle trail while moving
      if (this.saveData.upgrades?.goldenPlumage && Math.abs(p.vx) > 30) {
        if (Math.random() < 0.25) {
          this.particles.push({
            x: p.x + p.width / 2 + (Math.random() - 0.5) * 12,
            y: p.y + p.height / 2 + (Math.random() - 0.5) * 12,
            vx: (Math.random() - 0.5) * 25,
            vy: (Math.random() - 0.5) * 25,
            size: 2.2,
            color: '#facc15',
            life: 0.35,
            maxLife: 0.35
          });
        }
      }
    }

    // Apply gravity
    const gravity = 980;
    p.vy += gravity * dt;
    if (p.vy > 680) p.vy = 680; // terminal velocity

    // Keep vertical position locked to moving platform if standing on one
    if (p.onMovingPlatform && p.isGrounded && !p.isJumping) {
      p.y = p.onMovingPlatform.y - p.height;
      p.vy = 0;
    }

    // Colorful pixel dust trail while jumping in mid-air
    if (!p.isGrounded && (p.isJumping || p.vy < -25)) {
      this.jumpTrailTimer += dt;
      if (this.jumpTrailTimer >= 0.028) {
        this.jumpTrailTimer = 0;
        const jumpColors = ['#fde047', '#38bdf8', '#4ade80', '#f472b6', '#c084fc', '#fb923c', '#ffffff'];
        const tailDir = p.facing === 'right' ? -1 : 1;
        for (let i = 0; i < 2; i++) {
          this.particles.push({
            x: p.x + p.width / 2 + tailDir * (4 + Math.random() * 6) + (Math.random() - 0.5) * 8,
            y: p.y + p.height - 2 - Math.random() * 6,
            vx: tailDir * (20 + Math.random() * 35) - p.vx * 0.12 + (Math.random() - 0.5) * 18,
            vy: 15 + Math.random() * 35,
            size: Math.random() > 0.4 ? 4 : 3,
            color: jumpColors[Math.floor(Math.random() * jumpColors.length)],
            life: 0.28 + Math.random() * 0.12,
            maxLife: 0.4,
            gravity: 160,
          });
        }
      }
    } else {
      this.jumpTrailTimer = 0;
    }

    // Colorful pixel dust trail behind chick during dash-attack
    if (p.isAttacking && p.attackTimer > 0) {
      this.dashTrailTimer += dt;
      if (this.dashTrailTimer >= 0.02) {
        this.dashTrailTimer = 0;
        this.addDashAttackPixelTrail(2);
      }
    } else {
      this.dashTrailTimer = 0;
    }

    // Horizontal integration & collision
    p.x += p.vx * dt;
    this.resolveHorizontalCollisions();

    // Vertical integration & swept collision
    const prevY = p.y;
    const wasGrounded = p.isGrounded;
    p.y += p.vy * dt;
    this.resolveVerticalCollisions(prevY);

    if (!wasGrounded && p.isGrounded) {
      this.addColorfulJumpDustBurst(p.x + p.width / 2, p.y + p.height, 6);
    }

    // Animation state & walk timer
    p.animTimer += dt;
    if (!p.isGrounded) {
      p.animState = p.vy < 0 ? 'jump' : 'fall';
      p.walkAnimTimer = 0;
    } else if (Math.abs(p.vx) > 12) {
      p.animState = 'walk';
      p.walkAnimTimer += dt;
    } else {
      p.animState = 'idle';
      p.walkAnimTimer = 0; // Frozen feet when stopped - no walk animation during idle
      p.vx = 0; // cleanly zero out remaining fractional velocity
    }

    // Check pit fall
    if (p.y > this.level.worldHeight + 60) {
      this.handlePitFall();
    }

    // Check reaching the end of the level (goal area)
    // On the boss level, do NOT play the ending cutscene when reaching the end until the boss is defeated!
    if (p.x >= this.level.exitPoint.x - 20) {
      if (this.level.cockatrice) {
        if (this.level.cockatrice.state === 'defeated') {
          this.handleLevelClear();
        }
      } else {
        this.handleLevelClear();
      }
    }
  }

  private resolveHorizontalCollisions() {
    const p = this.player;
    // Boundary clamps
    if (p.x < 0) {
      p.x = 0;
      p.vx = 0;
    }
    if (p.x + p.width > this.level.worldWidth) {
      p.x = this.level.worldWidth - p.width;
      p.vx = 0;
    }

    for (const plat of this.level.platforms) {
      // Do not treat the platform player is currently riding as a blocking horizontal wall!
      if (plat === p.onMovingPlatform) continue;

      if (
        p.x < plat.x + plat.width &&
        p.x + p.width > plat.x &&
        p.y + p.height > plat.y + 6 &&
        p.y < plat.y + plat.height - 4
      ) {
        if (p.vx > 0) {
          p.x = plat.x - p.width;
          p.vx = 0;
        } else if (p.vx < 0) {
          p.x = plat.x + plat.width;
          p.vx = 0;
        }
      }
    }
  }

  private resolveVerticalCollisions(prevY: number) {
    const p = this.player;
    let grounded = false;
    let groundPlat: Platform | null = null;

    for (const plat of this.level.platforms) {
      if (
        p.x + p.width > plat.x + 1 &&
        p.x < plat.x + plat.width - 1
      ) {
        // Landing on top of platform (generous tolerance for moving platforms, including rising platforms)
        const snapTolerance = plat.isMoving ? 30 : 16;
        const isFallingOrCatching = p.vy >= 0 || (plat.isMoving && plat.vy !== undefined && plat.vy < 0);
        if (isFallingOrCatching && prevY + p.height <= plat.y + snapTolerance && p.y + p.height >= plat.y - 10) {
          p.y = plat.y - p.height;
          p.vy = 0;
          p.isJumping = false;
          grounded = true;
          groundPlat = plat;
        }
        // Hitting ceiling from underneath
        else if (p.vy < 0 && prevY >= plat.y + plat.height - 8 && p.y <= plat.y + plat.height) {
          p.y = plat.y + plat.height;
          p.vy = 0;
        }
      }
    }

    p.isGrounded = grounded;
    p.onMovingPlatform = (grounded && groundPlat && groundPlat.isMoving) ? groundPlat : null;
  }

  private updateHazards(dt: number) {
    // When returning to previous levels after completing the game:
    // Zero volcano eruptions or sounds, temples do NOT drop boulders and boulders don't roll, thunderclouds are peaceful with zero lightning or sounds!
    if (this.saveData.hasCompletedGame && this.level.id < 30) {
      if (this.level.volcanoes) {
        this.level.volcanoes.forEach(v => {
          v.isDead = true;
          v.state = 'inactive';
          v.timer = 0;
          v.lavaParticles = [];
        });
      }
      if (this.level.boulders) {
        this.level.boulders.forEach(b => {
          b.isRolling = false;
          b.isFalling = false;
          b.triggered = false;
          b.speed = 0;
          b.vx = 0;
          b.vy = 0;
        });
      }
      if (this.level.thunderclouds) {
        this.level.thunderclouds.forEach(th => {
          th.isPeaceful = true;
          th.isNormal = true;
          th.state = 'idle';
          th.timer = 0;
        });
      }
      // Spikes remain static obstacles
      if (this.level.spikes) {
        this.level.spikes.forEach(s => {
          if (
            this.player.x < s.x + s.width - 4 &&
            this.player.x + this.player.width > s.x + 4 &&
            this.player.y + this.player.height >= s.y + 4 &&
            this.player.y < s.y + s.height
          ) {
            this.takeDamage(1, this.player.facing === 'right' ? -1 : 1);
          }
        });
      }
      return;
    }

    // 1. Volcanoes
    if (this.level.volcanoes) {
      this.level.volcanoes.forEach(v => {
        v.timer += dt;

        if (v.state === 'inactive' && v.timer >= v.cooldownDuration) {
          v.state = 'warning';
          v.timer = 0;
          audio.playVolcanoWarning();
        } else if (v.state === 'warning' && v.timer >= v.warningDuration) {
          v.state = 'erupting';
          v.timer = 0;
          audio.playVolcanoEruption();
          // Spawn lava burst particles
          for (let i = 0; i < 14; i++) {
            v.lavaParticles.push({
              x: v.x + v.width / 2 + (Math.random() - 0.5) * 16,
              y: v.y,
              vx: (Math.random() - 0.5) * 140,
              vy: -220 - Math.random() * 140,
              radius: 4 + Math.random() * 3,
              life: 1.6,
              maxLife: 1.6
            });
          }
        } else if (v.state === 'erupting') {
          // Update lava particles
          v.lavaParticles.forEach(lp => {
            lp.vy += 380 * dt;
            lp.x += lp.vx * dt;
            lp.y += lp.vy * dt;
            lp.life -= dt;

            // Damage player if touched by flying lava
            if (lp.life > 0.1 && this.player.invulnerableTimer <= 0) {
              const dist = Math.hypot(this.player.x + this.player.width / 2 - lp.x, this.player.y + this.player.height / 2 - lp.y);
              if (dist < lp.radius + this.player.width / 2) {
                if ((this.player.fireResistTimer ?? 0) > 0) {
                  audio.playFireDeflect();
                  this.addFloatingText('🛡️ LAVA RESISTED!', this.player.x + this.player.width / 2, this.player.y - 20, '#f97316');
                } else {
                  this.takeDamage(1, lp.vx > 0 ? 1 : -1);
                }
              }
            }
          });
          v.lavaParticles = v.lavaParticles.filter(lp => lp.life > 0);

          if (v.timer >= v.eruptionDuration) {
            v.state = 'cooldown';
            v.timer = 0;
          }
        } else if (v.state === 'cooldown' && v.timer >= 1.5) {
          v.state = 'inactive';
          v.timer = 0;
        }

        // Stepping directly on volcano crater during eruption
        if (
          v.state === 'erupting' &&
          this.player.x < v.x + v.width &&
          this.player.x + this.player.width > v.x &&
          this.player.y + this.player.height >= v.y &&
          this.player.y < v.y + v.height
        ) {
          this.takeDamage(1, this.player.x > v.x ? 1 : -1);
        }
      });
    }

    // 2. Rolling & Falling Boulders
    if (this.level.boulders) {
      const isWorld4Or5 = this.level.world === 4 || this.level.world === 5 || this.level.id >= 16;
      this.level.boulders.forEach(b => {
        if (b.respawnTimer > 0) {
          b.respawnTimer -= dt;
          return;
        }

        // Temple trap dropper mechanism in World 4 and World 5
        if (b.hasTrapDropper && !b.triggered) {
          // Trigger when player reaches the opposite side of the terrace
          const triggerDist = 420;
          const playerReachedOtherSide = b.vx < 0
            ? (this.player.x >= b.startX - triggerDist && this.player.x <= b.startX + 80)
            : (this.player.x <= b.startX + triggerDist && this.player.x >= b.startX - 80);

          if (playerReachedOtherSide) {
            b.triggered = true;
            b.isFalling = true;
            b.isRolling = false;
            b.warningTimer = 0.5;
            b.y = b.trapDropperY || (b.startY - 190);
            b.vy = 0;
            audio.playRockSmash();
            this.callbacks.onActionStat?.('trapsTriggered');
            this.addFloatingText('TEMPLE TRAP TRIGGERED! BOULDER DROPPING!', b.startX, b.y + 45, '#f97316');
          } else {
            // Stays held inside the overhead trap dropper until triggered
            b.x = b.startX;
            b.y = b.trapDropperY || (b.startY - 190);
            return;
          }
        }

        // Falling warning from trap dropper
        if (b.isFalling && b.warningTimer > 0) {
          b.warningTimer -= dt;
          this.addDustPuff(b.startX, (b.trapDropperY || b.startY - 190) + 20, 2);
          return;
        }

        // Falling vertically down from trap dropper onto platform
        if (b.isFalling) {
          b.vy = (b.vy || 0) + 1100 * dt;
          b.y += b.vy * dt;
          const supportingPlatform = this.level.platforms.find(p => 
            b.x >= p.x - 6 && 
            b.x <= p.x + p.width + 6 &&
            b.y + b.radius >= p.y - 12 &&
            b.y + b.radius <= p.y + 24
          );
          if (supportingPlatform && b.vy > 0) {
            b.y = supportingPlatform.y - b.radius;
            b.vy = 0;
            b.isFalling = false;
            b.isRolling = true;
            this.addDustPuff(b.x, b.y + b.radius, 6);
            audio.playRockSmash();
          }
          return;
        }

        // Rolling horizontal movement
        b.x += b.vx * dt * 60;
        b.rotation += (b.vx / b.radius) * dt * 25;

        // In World 4 and World 5: Boulders realistically fall into gaps between floating lands!
        if (isWorld4Or5) {
          // Check if there is any supporting solid platform directly beneath the boulder
          const supportingPlatform = this.level.platforms.find(p => 
            b.x >= p.x - 2 && 
            b.x <= p.x + p.width + 2 &&
            b.y + b.radius >= p.y - 8 &&
            b.y + b.radius <= p.y + 18
          );

          if (!supportingPlatform) {
            // Gap detected! Boulder plunges downward into the gap
            b.vy = (b.vy || 0) + 980 * dt;
            b.y += b.vy * dt;
          } else if ((b.vy || 0) > 0) {
            // Landed on a lower platform after falling through a gap
            b.y = supportingPlatform.y - b.radius;
            b.vy = 0;
            this.addDustPuff(b.x, b.y + b.radius, 3);
          } else {
            // Securely rolling along the surface
            b.y = supportingPlatform.y - b.radius;
            b.vy = 0;
          }

          // When boulder falls off screen / into the abyss
          if (b.y > this.level.worldHeight + 80 || b.y > 660 || b.x < -80 || b.x > this.level.worldWidth + 80) {
            b.x = b.startX;
            b.y = b.hasTrapDropper ? (b.trapDropperY || b.startY - 190) : b.startY;
            b.vy = 0;
            b.isRolling = false;
            b.isFalling = false;
            b.triggered = false;
            b.respawnTimer = 2.4;
            return;
          }
        }

        // Collision with player
        const dist = Math.hypot(
          this.player.x + this.player.width / 2 - b.x,
          this.player.y + this.player.height / 2 - b.y
        );
        if (dist < b.radius + this.player.width / 2 - 4) {
          this.takeDamage(1, b.vx > 0 ? 1 : -1);
        }

        // Boulder loop / respawn when rolling out of level bounds
        if (b.x < -80 || b.x > this.level.worldWidth + 80) {
          b.x = b.startX;
          b.y = b.hasTrapDropper ? (b.trapDropperY || b.startY - 190) : b.startY;
          b.vy = 0;
          b.isRolling = false;
          b.isFalling = false;
          b.triggered = false;
          b.respawnTimer = 2.0;
        }
      });
    }

    // 3. Thunderclouds & Lightning
    if (this.level.thunderclouds) {
      this.level.thunderclouds.forEach(th => {
        th.timer += dt;

        if (th.state === 'idle' && th.timer >= th.cooldownDuration) {
          th.state = 'warning';
          th.timer = 0;
        } else if (th.state === 'warning' && th.timer >= th.warningDuration) {
          th.state = 'striking';
          th.timer = 0;
          audio.playLightning();

          // Damage check inside strike zone
          const strikeRadius = 34;
          if (
            Math.abs((this.player.x + this.player.width / 2) - th.targetX) < strikeRadius &&
            this.player.y + this.player.height >= th.targetY - 20
          ) {
            this.takeDamage(2, 0);
          }
        } else if (th.state === 'striking' && th.timer >= th.strikeDuration) {
          th.state = 'cooldown';
          th.timer = 0;
        } else if (th.state === 'cooldown' && th.timer >= 1.5) {
          th.state = 'idle';
          th.timer = 0;
        }
      });
    }

    // 4. Spikes Obstacles
    if (this.level.spikes) {
      this.level.spikes.forEach(s => {
        if (
          this.player.x < s.x + s.width - 4 &&
          this.player.x + this.player.width > s.x + 4 &&
          this.player.y + this.player.height >= s.y + 4 &&
          this.player.y < s.y + s.height
        ) {
          this.takeDamage(1, this.player.facing === 'right' ? -1 : 1);
        }
      });
    }
  }

  private updateEnemies(dt: number) {
    if (!this.level.enemies) return;

    this.level.enemies.forEach(enemy => {
      if (enemy.state === 'defeated') return;

      if (enemy.hurtTimer > 0) enemy.hurtTimer -= dt;
      enemy.animTimer += dt;

      const playerCenter = this.player.x + this.player.width / 2;
      const enemyCenter = enemy.x + enemy.width / 2;
      const distToPlayer = Math.abs(playerCenter - enemyCenter);

      // Detection & State AI
      if (distToPlayer < enemy.detectionRadius && Math.abs(this.player.y - enemy.y) < 80) {
        if (enemy.state !== 'chase') {
          if (enemy.type === 'wolf') audio.playWolfHowl();
          else if (enemy.type === 'fox') audio.playFoxBark();
          else if (enemy.type === 'bear') audio.playBearRoar();
        }
        // Chase player
        enemy.state = 'chase';
        enemy.facing = playerCenter > enemyCenter ? 'right' : 'left';
        const diff = this.saveData.difficulty || 'normal';
        const speedMult = diff === 'easy' ? 0.75 : (diff === 'hard' ? 1.25 : 1.0);
        enemy.vx = (enemy.facing === 'right' ? enemy.speed * 1.5 : -enemy.speed * 1.5) * speedMult;
      } else {
        enemy.state = 'patrol';
        if (enemy.x <= enemy.patrolLeft) {
          enemy.facing = 'right';
          enemy.vx = enemy.speed;
        } else if (enemy.x + enemy.width >= enemy.patrolRight) {
          enemy.facing = 'left';
          enemy.vx = -enemy.speed;
        }
      }

      enemy.x += enemy.vx * dt * 50;

      // Platform edge turn-around
      if (enemy.x < enemy.patrolLeft) enemy.x = enemy.patrolLeft;
      if (enemy.x + enemy.width > enemy.patrolRight) enemy.x = enemy.patrolRight - enemy.width;

      // Collision with Player
      if (
        this.player.x < enemy.x + enemy.width &&
        this.player.x + this.player.width > enemy.x &&
        this.player.y < enemy.y + enemy.height &&
        this.player.y + this.player.height > enemy.y
      ) {
        // Jump Stomp from above!
        if (this.player.vy > 0 && this.player.y + this.player.height < enemy.y + 14) {
          this.player.vy = -380; // bounce up
          this.damageEnemy(enemy, 2);
        } else if (this.player.invulnerableTimer <= 0) {
          if (enemy.type === 'wolf') audio.playWolfBite();
          else if (enemy.type === 'bear') audio.playBearSlam();
          this.takeDamage(enemy.damage, enemy.facing === 'right' ? 1 : -1);
        }
      }
    });
  }

  // --- Boss Fight: The Ancient Cockatrice ---

  private updateCockatrice(dt: number) {
    const boss = this.level.cockatrice;
    if (!boss || boss.defeatSubState === 'escaped') return;

    boss.animTimer += dt;
    boss.stateTimer += dt;
    if (boss.invulnerableTimer > 0) boss.invulnerableTimer -= dt;

    // Smooth visual HP bar drain ("slowly, not really that slow, just a little fast")
    if (boss.displayHealth === undefined) {
      boss.displayHealth = boss.health;
    } else if (boss.displayHealth > boss.health) {
      boss.displayHealth = Math.max(boss.health, boss.displayHealth - 95 * dt);
    } else if (boss.displayHealth < boss.health) {
      boss.displayHealth = boss.health;
    }

    // Wing flapping animation
    boss.wingAngle = Math.sin(boss.animTimer * 10) * 0.45;

    // Update bitten land craters lifetime
    if (boss.bittenLandCraters) {
      boss.bittenLandCraters.forEach(crater => {
        crater.timer -= dt;
      });
      boss.bittenLandCraters = boss.bittenLandCraters.filter(c => c.timer > 0);
    }

    // Shake-off charred feathers & scales timer & animation
    if (boss.shakeOffTimer && boss.shakeOffTimer > 0) {
      boss.shakeOffTimer -= dt;
      // High-frequency shake wobble
      boss.x += Math.sin(boss.shakeOffTimer * 45) * 5;
      // Burnt feather & scale particle burst!
      if (Math.random() < 0.8) {
        for (let p = 0; p < 2; p++) {
          this.particles.push({
            x: boss.x + boss.width / 2 + (Math.random() - 0.5) * 120,
            y: boss.y + boss.height / 2 + (Math.random() - 0.5) * 70,
            vx: (Math.random() - 0.5) * 200,
            vy: -Math.random() * 120 - 30,
            size: 3 + Math.random() * 4,
            color: Math.random() > 0.5 ? '#1e293b' : (Math.random() > 0.5 ? '#0f172a' : '#78350f'),
            life: 0.5,
            maxLife: 0.5
          });
        }
      }
      if (boss.shakeOffTimer <= 0) {
        boss.isShakingOff = false;
        boss.burntMarksCount = 0;
        boss.burnIntensity = 0;
        boss.regrowGlowTimer = 2.0;
        // Sparkle regrowth burst!
        for (let sp = 0; sp < 20; sp++) {
          this.particles.push({
            x: boss.x + boss.width / 2 + (Math.random() - 0.5) * 120,
            y: boss.y + boss.height / 2 + (Math.random() - 0.5) * 70,
            vx: (Math.random() - 0.5) * 160,
            vy: (Math.random() - 0.5) * 160,
            size: 3 + Math.random() * 3,
            color: Math.random() > 0.5 ? '#22c55e' : (Math.random() > 0.5 ? '#facc15' : '#38bdf8'),
            life: 0.65,
            maxLife: 0.65
          });
        }
        this.addFloatingText('✨ PRISTINE FEATHERS & SCALES REGROWN! ✨', boss.x + boss.width / 2, boss.y - 30, '#4ade80');
      }
    }
    if (boss.regrowGlowTimer && boss.regrowGlowTimer > 0) {
      boss.regrowGlowTimer -= dt;
    }

    const playerCenter = this.player.x + this.player.width / 2;
    const bossCenter = boss.x + boss.width / 2;
    if (boss.state !== 'stunned') {
      boss.facing = playerCenter > bossCenter ? 'right' : 'left';
    }

    // 0. DEFEAT SEQUENCE
    if (boss.state === 'defeated') {
      const prevDefeatTimer = boss.defeatTimer || 0;
      boss.defeatTimer = prevDefeatTimer + dt;
      boss.burnIntensity = 1.0;

      const groundPlat = this.level.platforms.find(p => p.x <= boss.x + boss.width / 2 && p.x + p.width >= boss.x + boss.width / 2 && p.y >= 350) || this.level.platforms[0];
      const targetFloorY = groundPlat ? groundPlat.y - boss.height + 14 : 370;

      if (!boss.defeatSubState || boss.defeatSubState === 'falling') {
        boss.defeatSubState = 'falling';
        boss.wingAngle = Math.sin(boss.animTimer * 8) * 0.25;
        boss.y += 280 * dt;
        if (boss.y >= targetFloorY) {
          boss.y = targetFloorY;
          boss.defeatSubState = 'ground_talk_1';
          boss.defeatTimer = 0;
          boss.dialogueIndex = 0;
          boss.dialogueCharIndex = 0;
          boss.stateTimer = 0;
          boss.dialogueTimer = 0;
          audio.playRockSmash();
          // Ground impact dust
          for (let p = 0; p < 24; p++) {
            this.particles.push({
              x: boss.x + boss.width / 2 + (Math.random() - 0.5) * 120,
              y: targetFloorY + boss.height - 10,
              vx: (Math.random() - 0.5) * 160,
              vy: -Math.random() * 90 - 20,
              size: 4 + Math.random() * 4,
              color: '#64748b',
              life: 0.45,
              maxLife: 0.45,
            });
          }
        }
        return;
      }

      if (boss.defeatSubState === 'ground_talk_1') {
        // Holds normal upright posture with shocked eyes while screaming "no No NOOOOOOO!"
        boss.y = targetFloorY;
        boss.wingAngle = Math.sin(boss.animTimer * 6) * 0.22;
        boss.stateTimer += dt;
        boss.dialogueTimer += dt;
        const finalLine = "no No NOOOOOOO!";
        const isSpeaking = boss.dialogueCharIndex < finalLine.length;
        boss.jawOpen = isSpeaking ? Math.abs(Math.sin(boss.animTimer * 15)) * 0.85 : 0.7;

        if (isSpeaking) {
          if (boss.dialogueTimer > 0.045) {
            boss.dialogueTimer = 0;
            boss.dialogueCharIndex++;
            if (boss.dialogueCharIndex % 2 === 0) {
              audio.playBossDialogueVoice();
            }
          }
        } else {
          // After finishing "no No NOOOOOOO!", explode into bright ashes!
          if (boss.stateTimer > 2.2 || ((this.input.jump || this.input.attack) && boss.stateTimer > 0.35)) {
            boss.defeatSubState = 'exploding_ashes';
            boss.stateTimer = 0;
            boss.defeatTimer = 0;
            boss.ashExplodeFlash = 0.35;
            audio.playCockatriceScreech();
            audio.playRockSmash();
            audio.playEnemyDefeat();

            // Massive bright ash & golden ember explosion from the boss!
            const ashPalette = ['#ffffff', '#fef08a', '#f8fafc', '#cbd5e1', '#94a3b8', '#475569', '#1e293b'];
            for (let ap = 0; ap < 80; ap++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = 60 + Math.random() * 340;
              this.particles.push({
                x: bossCenter + (Math.random() - 0.5) * 90,
                y: boss.y + boss.height / 2 + (Math.random() - 0.5) * 70,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 60,
                size: 3.5 + Math.random() * 5,
                color: ashPalette[Math.floor(Math.random() * ashPalette.length)],
                life: 0.75 + Math.random() * 0.75,
                maxLife: 1.5,
              });
            }
          }
        }
        return;
      }

      if (boss.defeatSubState === 'exploding_ashes') {
        const t = boss.defeatTimer || 0;
        // Ramps up to blinding pure white flash (0 -> 0.45s), holds bright (0.45 -> 0.65s), then fades back to normal world!
        if (t < 0.45) {
          boss.ashExplodeFlash = Math.min(1, 0.35 + (t / 0.45) * 0.65);
        } else if (t < 0.65) {
          boss.ashExplodeFlash = 1.0;
        } else {
          boss.ashExplodeFlash = Math.max(0, 1.0 - (t - 0.65) / 1.15);
        }

        // Switch to peaceful music right at the blinding flash peak as world turns back to normal
        if (prevDefeatTimer < 0.55 && t >= 0.55) {
          audio.playMusic('coop');
        }

        // Continuously shed drifting ashes while disintegrating
        if (t < 1.25 && Math.random() < 0.85) {
          for (let a = 0; a < 3; a++) {
            this.particles.push({
              x: bossCenter + (Math.random() - 0.5) * 110,
              y: boss.y + boss.height / 2 + (Math.random() - 0.5) * 80,
              vx: (Math.random() - 0.5) * 150,
              vy: -Math.random() * 90 - 25,
              size: 2.5 + Math.random() * 4,
              color: Math.random() > 0.45 ? '#cbd5e1' : (Math.random() > 0.5 ? '#64748b' : '#ffffff'),
              life: 0.7 + Math.random() * 0.6,
              maxLife: 1.3,
            });
          }
        }

        if (t >= 2.1) {
          boss.defeatSubState = 'escaped';
          boss.ashExplodeFlash = 0;
          this.coinsEarnedThisLevel += 300;
          this.callbacks.onStatsUpdate(this.player.health, this.coinsEarnedThisLevel, this.player.stage, this.armorType, this.swordType, this.player.hasShield);
          audio.playBossDefeat();
          audio.playMusic('coop');
          this.callbacks.onSaveDataUpdate?.({ hasCompletedGame: true });
        }
        return;
      }

      return;
    }

    // 1. INTRO DIALOGUE
    if (boss.state === 'intro_dialogue') {
      boss.dialogueTimer += dt;
      const dialogues = [
        "who dares enter my realm?",
        "well.. i guess i need to spice things up!",
        "when you defeat me.. it will be the last thing you will ever know"
      ];
      const currentText = dialogues[boss.dialogueIndex] || '';

      // Beak flap in sync with speech
      const isSpeaking = boss.dialogueCharIndex < currentText.length;
      boss.jawOpen = isSpeaking ? Math.abs(Math.sin(boss.animTimer * 14)) * 0.85 : 0;

      if (isSpeaking) {
        if (boss.dialogueTimer > 0.038) {
          boss.dialogueTimer = 0;
          boss.dialogueCharIndex++;
          if (boss.dialogueCharIndex % 2 === 0) {
            audio.playBossDialogueVoice();
          }
        }
      } else {
        // Line finished typing, generous pause for reading (4.5s)
        if (boss.stateTimer > 4.5) {
          if (boss.dialogueIndex < dialogues.length - 1) {
            boss.dialogueIndex++;
            boss.dialogueCharIndex = 0;
            boss.stateTimer = 0;
            boss.dialogueTimer = 0;
          } else {
            // Intro dialogue complete! Boss waits for Silkie Sam to deliver the shield & sword
            if (this.level.silkieSam && this.level.silkieSam.state === 'waiting') {
              boss.state = 'waiting_for_sam';
              boss.stateTimer = 0;
              this.level.silkieSam.state = 'flying_in';
              this.level.silkieSam.dialogueTimer = 0;
              this.level.silkieSam.dialogueCharIndex = 0;
            } else {
              // If Sam already gave shield or not present, start retro countdown immediately
              boss.state = 'countdown';
              boss.countdownTimer = 3.99;
              boss.countdownText = '3..';
              boss.stateTimer = 0;
              audio.playCountdownPip(3);
            }
          }
        }
      }

      // Quick advance with key press or tap
      if (this.input.jump || this.input.attack || this.input.block) {
        if (boss.dialogueCharIndex < currentText.length) {
          boss.dialogueCharIndex = currentText.length;
        } else if (boss.stateTimer > 0.35) {
          if (boss.dialogueIndex < dialogues.length - 1) {
            boss.dialogueIndex++;
            boss.dialogueCharIndex = 0;
            boss.stateTimer = 0;
            boss.dialogueTimer = 0;
          } else {
            if (this.level.silkieSam && this.level.silkieSam.state === 'waiting') {
              boss.state = 'waiting_for_sam';
              boss.stateTimer = 0;
              this.level.silkieSam.state = 'flying_in';
              this.level.silkieSam.dialogueTimer = 0;
              this.level.silkieSam.dialogueCharIndex = 0;
            } else {
              boss.state = 'countdown';
              boss.countdownTimer = 3.99;
              boss.countdownText = '3..';
              boss.stateTimer = 0;
              audio.playCountdownPip(3);
            }
          }
        }
      }
      return;
    }

    // 1.5. WAITING FOR SAM TO DELIVER SHIELD (Boss hovers observantly waiting)
    if (boss.state === 'waiting_for_sam') {
      boss.wingAngle = Math.sin(this.time * 6) * 0.22;
      boss.y += (170 - boss.y) * 2.5 * dt;
      return;
    }

    // 1.6. RETRO ARCADE COUNTDOWN (3.. -> 2.. -> 1.. -> FIGHT !)
    if (boss.state === 'countdown') {
      boss.countdownTimer = (boss.countdownTimer ?? 3.99) - dt;
      boss.wingAngle = Math.sin(this.time * 8) * 0.28;
      boss.y += (160 - boss.y) * 3.0 * dt;

      if (boss.countdownTimer > 3.0) {
        if (boss.countdownText !== '3..') {
          boss.countdownText = '3..';
          audio.playCountdownPip(3);
        }
      } else if (boss.countdownTimer > 2.0) {
        if (boss.countdownText !== '2..') {
          boss.countdownText = '2..';
          audio.playCountdownPip(2);
        }
      } else if (boss.countdownTimer > 1.0) {
        if (boss.countdownText !== '1..') {
          boss.countdownText = '1..';
          audio.playCountdownPip(1);
        }
      } else if (boss.countdownTimer > 0) {
        if (boss.countdownText !== 'FIGHT !') {
          boss.countdownText = 'FIGHT !';
          audio.playFightFanfare();
        }
      } else {
        // Countdown finished: boss fight officially begins!
        boss.state = 'flying_idle';
        boss.stateTimer = 0;
        boss.phase = 1;
        boss.rageMode = 'sky rage';
        boss.burntMarksCount = 0;
        audio.playCockatriceScreech();
        this.addFloatingText('⚡ SKY RAGE! ⚡', bossCenter, boss.y - 20, '#38bdf8');
      }
      return;
    }

    // 2. FLYING IDLE
    if (boss.state === 'flying_idle') {
      // Hover majestically in arena across the red sky with fast tracking
      const trackingSpeed = boss.phase === 3 ? 4.5 : (boss.phase === 2 ? 3.5 : 2.8);
      const targetHoverY = 140 + Math.sin(boss.animTimer * 2.8) * 45;
      const targetHoverX = this.player.facing === 'right' ? this.player.x + 230 : this.player.x - 230;
      const clampedX = Math.max(200, Math.min(targetHoverX, this.level.worldWidth - boss.width - 200));

      boss.x += (clampedX - boss.x) * trackingSpeed * dt;
      boss.y += (targetHoverY - boss.y) * (trackingSpeed + 0.4) * dt;

      // Wait until shake-off ascent completes before picking the next attack
      const attackWait = boss.phase === 3 ? 0.75 : (boss.phase === 2 ? 1.05 : 1.4);
      if (boss.stateTimer >= attackWait && (!boss.shakeOffTimer || boss.shakeOffTimer <= 0)) {
        boss.stateTimer = 0;
        const aliveSummons = (this.level.enemies || []).filter(e => e.isBossSummon && e.state !== 'defeated');
        const attacksSinceSummon = boss.attacksSinceSummon ?? 0;
        const attackRoll = Math.random();
        const standingPlat = this.level.platforms.find(p => playerCenter >= p.x - 30 && playerCenter <= p.x + p.width + 30) || this.level.platforms[0];

        if (aliveSummons.length === 0 && (attacksSinceSummon >= 3 || attackRoll < 0.22)) {
          // 0. SUMMON ATTACK (Wolves first, then Foxes, finally Bears; boss waits passively until defeated!)
          boss.attacksSinceSummon = 0;
          const wave = (boss.summonWaveIndex ?? 0) % 3;
          boss.summonWaveType = wave === 0 ? 'wolf' : (wave === 1 ? 'fox' : 'bear');
          boss.state = 'prepare_summon';
          audio.playCockatriceScreech();
        } else {
          boss.attacksSinceSummon = attacksSinceSummon + 1;
          if (attackRoll < 0.44) {
            // 1. FIRE ATTACK (Alternates between Fireball Barrage and Inferno Flame!)
            boss.state = 'prepare_fire';
            boss.fireAttackType = Math.random() < 0.5 ? 'fireballs' : 'inferno';
            audio.playBossFireWindup();
          } else if (attackRoll < 0.60) {
            // 2. STOMP ATTACK
            boss.state = 'prepare_stomp';
            boss.bitePlatformId = standingPlat.id;
            boss.biteTargetX = Math.max(standingPlat.x + 80, Math.min(standingPlat.x + standingPlat.width - 80, playerCenter));
            boss.biteTargetY = standingPlat.y;
            boss.biteTelegraphTimer = boss.phase === 3 ? 0.55 : (boss.phase === 2 ? 0.75 : 0.95);
            audio.playCockatriceScreech();
          } else if (attackRoll < 0.74) {
            // 3. CLAW ATTACK
            boss.state = 'prepare_claw';
            boss.bitePlatformId = standingPlat.id;
            boss.biteTargetX = playerCenter;
            boss.biteTargetY = standingPlat.y;
            audio.playBossBiteCrunch();
          } else if (attackRoll < 0.88) {
            // 4. PECK OR BITE ATTACK
            boss.state = 'prepare_peck';
            boss.bitePlatformId = standingPlat.id;
            boss.biteTargetX = playerCenter;
            boss.biteTargetY = standingPlat.y;
            audio.playCockatriceScreech();
          } else {
            // 5. TAIL WHIP ATTACK
            boss.state = 'prepare_tail_whip';
            boss.bitePlatformId = standingPlat.id;
            boss.biteTargetX = Math.max(standingPlat.x + 100, Math.min(standingPlat.x + standingPlat.width - 100, playerCenter));
            boss.biteTargetY = standingPlat.y;
            audio.playCockatriceScreech();
          }
        }
      }
    }

    // 2.5. PREPARE & EXECUTE SUMMON ATTACK (WOLVES -> FOXES -> BEARS)
    else if (boss.state === 'prepare_summon') {
      const wave = (boss.summonWaveIndex ?? 0) % 3;
      const waveType = wave === 0 ? 'wolf' : (wave === 1 ? 'fox' : 'bear');
      boss.summonWaveType = waveType;

      // Hover high & center while channeling summons
      const centerArenaX = this.level.worldWidth / 2 - boss.width / 2;
      boss.x += (centerArenaX - boss.x) * 4.0 * dt;
      boss.y += (105 - boss.y) * 4.0 * dt;
      boss.wingAngle = Math.sin(this.time * 18) * 0.65;
      boss.jawOpen = 0.75;

      if (boss.stateTimer < dt * 2) {
        audio.playCockatriceScreech();
        const label = waveType === 'wolf'
          ? '🐺 COCKATRICE SUMMONS WOLVES! 🐺'
          : (waveType === 'fox' ? '🦊 COCKATRICE SUMMONS FOXES! 🦊' : '🐻 COCKATRICE SUMMONS BEARS! 🐻');
        this.addFloatingText(label, bossCenter, boss.y - 24, '#c084fc');
      }

      // Ground summoning sparkles
      if (Math.random() < 0.75) {
        const offsets = waveType === 'bear' ? [-260, 260] : [-320, 0, 320];
        const ox = offsets[Math.floor(Math.random() * offsets.length)];
        const sx = Math.max(80, Math.min(this.level.worldWidth - 80, this.level.worldWidth / 2 + ox));
        this.particles.push({
          x: sx + (Math.random() - 0.5) * 44,
          y: 458,
          vx: (Math.random() - 0.5) * 40,
          vy: -Math.random() * 110 - 30,
          size: 3.5 + Math.random() * 3,
          color: Math.random() > 0.5 ? '#c084fc' : '#f43f5e',
          life: 0.45,
          maxLife: 0.45
        });
      }

      if (boss.stateTimer >= 1.15) {
        const groundY = 460;
        const pCenterX = this.player.x + this.player.width / 2;
        const baseOffsets = waveType === 'bear' ? [-280, 280] : [-340, 20, 340];

        if (!this.level.enemies) this.level.enemies = [];

        baseOffsets.forEach((offset, idx) => {
          let spawnX = Math.max(80, Math.min(this.level.worldWidth - 120, this.level.worldWidth / 2 + offset));
          // Keep fair distance from player so summoned beast never overlaps player on spawn frame
          if (Math.abs(spawnX - pCenterX) < 140) {
            spawnX = pCenterX < this.level.worldWidth / 2
              ? Math.min(this.level.worldWidth - 120, pCenterX + 180)
              : Math.max(80, pCenterX - 180);
          }

          const isBear = waveType === 'bear';
          const isFox = waveType === 'fox';
          const eWidth = isBear ? 48 : (isFox ? 38 : 36);
          const eHeight = isBear ? 36 : (isFox ? 22 : 24);
          const eHealth = isBear ? 5 : (isFox ? 3 : 2);
          const eSpeed = isBear ? 1.0 : (isFox ? 1.75 : 1.25);
          const eDamage = isBear ? 2 : 1;

          const summonedEnemy: Enemy = {
            id: `boss_summon_${waveType}_${Date.now()}_${idx}`,
            type: waveType,
            x: spawnX,
            y: groundY - eHeight,
            vx: spawnX > pCenterX ? -eSpeed : eSpeed,
            vy: 0,
            width: eWidth,
            height: eHeight,
            patrolLeft: 40,
            patrolRight: this.level.worldWidth - 40,
            facing: spawnX > pCenterX ? 'left' : 'right',
            health: eHealth,
            maxHealth: eHealth,
            speed: eSpeed,
            damage: eDamage,
            state: 'chase',
            detectionRadius: 1600,
            isGrounded: true,
            animTimer: 0,
            hurtTimer: 0,
            isBossSummon: true,
          };
          this.level.enemies!.push(summonedEnemy);

          // Spawn burst VFX
          for (let sp = 0; sp < 14; sp++) {
            this.particles.push({
              x: spawnX + eWidth / 2,
              y: groundY - eHeight / 2,
              vx: (Math.random() - 0.5) * 180,
              vy: -Math.random() * 140 - 20,
              size: 4,
              color: sp % 2 === 0 ? '#c084fc' : '#facc15',
              life: 0.55,
              maxLife: 0.55
            });
          }
        });

        if (waveType === 'wolf') audio.playWolfHowl();
        else if (waveType === 'fox') audio.playFoxBark();
        else audio.playBearRoar();

        boss.summonWaveIndex = (wave + 1) % 3;
        boss.state = 'waiting_summons';
        boss.stateTimer = 0;
        boss.jawOpen = 0;
      }
    }

    // 2.6. WAITING FOR SUMMONS (Boss stays passive and does nothing until all summoned enemies are defeated!)
    else if (boss.state === 'waiting_summons') {
      const centerArenaX = this.level.worldWidth / 2 - boss.width / 2;
      const hoverY = 95 + Math.sin(boss.animTimer * 2.2) * 14;
      boss.x += (centerArenaX - boss.x) * 2.0 * dt;
      boss.y += (hoverY - boss.y) * 2.5 * dt;
      boss.wingAngle = Math.sin(boss.animTimer * 6) * 0.25;
      boss.jawOpen = 0;

      const aliveSummons = (this.level.enemies || []).filter(e => e.isBossSummon && e.state !== 'defeated');
      if (aliveSummons.length === 0) {
        boss.state = 'flying_idle';
        boss.stateTimer = 0;
        boss.summonWaveType = undefined;
        audio.playPowerUp();
        this.addFloatingText('★ SUMMONED PACK DEFEATED! ★', bossCenter, boss.y - 24, '#4ade80');
      }
    }

    // 3. PREPARE FIRE (INFERNO FLAME OR FIREBALL BARRAGE)
    else if (boss.state === 'prepare_fire') {
      const isFireballs = boss.fireAttackType === 'fireballs';
      if (boss.stateTimer < dt * 2) {
        const warnText = isFireballs
          ? '🔥 FIREBALL BARRAGE! HOLD C / S / DOWN TO DEFLECT! 🔥'
          : '🔥 INFERNO FLAME INCOMING! HOLD S OR DOWN ARROW FOR 5s! 🔥';
        this.addFloatingText(warnText, this.player.x + this.player.width / 2, this.player.y - 28, '#f97316');
        audio.playBossFireWindup();
      }
      boss.jawOpen = Math.min(1, boss.stateTimer / 0.6);
      const mouthX = boss.facing === 'right' ? boss.x + boss.width - 25 : boss.x + 25;
      const mouthY = boss.y + 60;
      if (Math.random() < 0.75) {
        this.particles.push({
          x: mouthX + (Math.random() - 0.5) * 24,
          y: mouthY + (Math.random() - 0.5) * 24,
          vx: (Math.random() - 0.5) * 80,
          vy: -Math.random() * 50,
          size: 4 + Math.random() * 4,
          color: Math.random() > 0.5 ? '#f97316' : '#facc15',
          life: 0.35,
          maxLife: 0.35
        });
      }

      const windupDuration = 0.85;
      if (boss.stateTimer >= windupDuration) {
        boss.stateTimer = 0;
        if (isFireballs) {
          boss.state = 'shooting_fire';
          boss.fireShotsFired = 0;
        } else {
          boss.state = 'inferno_flame';
          boss.infernoFlameTimer = 5.0; // Exactly 5.0 seconds continuous inferno flame
          boss.infernoFlameDuration = 5.0;
          boss.infernoFlameBlockedTime = 0;
          audio.playBossFireShoot();
          this.addFloatingText('🔥 INFERNO FLAME! HOLD S OR DOWN ARROW! [5.0s] 🔥', this.player.x + this.player.width / 2, this.player.y - 32, '#f97316');
        }
      }
    }

    // 3.5. SHOOTING FIREBALLS (VOLLEY OF 3 DEFLECTABLE FIREBALLS)
    else if (boss.state === 'shooting_fire') {
      boss.jawOpen = 0.9;
      const shotsFired = boss.fireShotsFired ?? 0;
      const shotTimes = [0.02, 0.38, 0.74];

      if (shotsFired < shotTimes.length && boss.stateTimer >= shotTimes[shotsFired]) {
        boss.fireShotsFired = shotsFired + 1;
        const mouthX = boss.facing === 'right' ? boss.x + boss.width - 25 : boss.x + 25;
        const mouthY = boss.y + 60;
        const pCenterX = this.player.x + this.player.width / 2;
        const pCenterY = this.player.y + this.player.height / 2;
        const angle = Math.atan2(pCenterY - mouthY, pCenterX - mouthX);
        const speed = 300 + boss.phase * 35;

        boss.fireProjectiles.push({
          id: `boss_fb_${Date.now()}_${shotsFired}`,
          x: mouthX,
          y: mouthY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 14,
          isDeflected: false,
          life: 4.5,
        });
        audio.playBossFireShoot();
      }

      if (boss.stateTimer >= 1.15) {
        boss.state = 'flying_idle';
        boss.stateTimer = 0;
        boss.jawOpen = 0;
      }
    }

    // 4. INFERNO FLAME (5-SECOND CONTINUOUS ROARING FLAME STREAM)
    else if (boss.state === 'inferno_flame') {
      boss.infernoFlameTimer = Math.max(0, (boss.infernoFlameTimer ?? 5.0) - dt);
      boss.jawOpen = 1.0;
      boss.wingAngle = Math.sin(this.time * 18) * 0.45;

      const pCenterX = this.player.x + this.player.width / 2;
      const pCenterY = this.player.y + this.player.height / 2;

      // Cockatrice faces player when projecting inferno flame
      if (pCenterX < boss.x + boss.width / 2) {
        boss.facing = 'left';
      } else {
        boss.facing = 'right';
      }

      const mouthX = boss.facing === 'right' ? boss.x + boss.width - 25 : boss.x + 25;
      const mouthY = boss.y + 60;
      const dir = boss.facing === 'right' ? 1 : -1;

      const dx = pCenterX - mouthX;
      const dy = pCenterY - mouthY;
      const angle = Math.atan2(dy, dx);
      const dist = Math.hypot(dx, dy);

      // Spawn streaming fire and smoke particles pointing directly along the flame beam toward the player
      for (let fp = 0; fp < 3; fp++) {
        const distAlong = Math.random() * Math.min(dist + 60, 1000);
        const lateralSpread = (Math.random() - 0.5) * (18 + distAlong * 0.08);
        const perpX = -Math.sin(angle) * lateralSpread;
        const perpY = Math.cos(angle) * lateralSpread;
        const speed = Math.random() * 320 + 400;

        this.particles.push({
          x: mouthX + Math.cos(angle) * distAlong + perpX,
          y: mouthY + Math.sin(angle) * distAlong + perpY,
          vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 40,
          vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 40,
          size: 4 + Math.random() * 6,
          color: Math.random() > 0.4 ? (Math.random() > 0.5 ? '#f97316' : '#facc15') : (Math.random() > 0.3 ? '#ef4444' : '#ffffff'),
          life: 0.45,
          maxLife: 0.45,
        });
      }

      // Check collision with player along directional flame beam
      const isPlayerInFront = dir > 0 ? (pCenterX >= mouthX - 30) : (pCenterX <= mouthX + 30);
      const isWithinBeamReach = dist < 1300;
      const perpDist = Math.abs(-Math.sin(angle) * (pCenterX - mouthX) + Math.cos(angle) * (pCenterY - mouthY));
      const flameRadiusAtPlayer = 65 + dist * 0.08;
      const isPlayerInBeam = isPlayerInFront && isWithinBeamReach && perpDist < flameRadiusAtPlayer;

      if (isPlayerInBeam) {
        if (this.player.isBlocking && this.hasShield) {
          // BLOCKING WITH SHIELD (Holding S or Down Arrow)
          boss.infernoFlameBlockedTime = (boss.infernoFlameBlockedTime ?? 0) + dt;
          this.callbacks.onActionStat?.('projectilesDeflected');

          // Deflection sparks bursting from the shield
          if (Math.random() < 0.8) {
            const shieldEdgeX = dir > 0 ? this.player.x : this.player.x + this.player.width;
            for (let sp = 0; sp < 2; sp++) {
              this.particles.push({
                x: shieldEdgeX,
                y: pCenterY + (Math.random() - 0.5) * 35,
                vx: -dir * (Math.random() * 180 + 90),
                vy: (Math.random() - 0.5) * 160,
                size: 3.5 + Math.random() * 3,
                color: Math.random() > 0.4 ? '#38bdf8' : '#fef08a',
                life: 0.35,
                maxLife: 0.35,
              });
            }
          }

          if (Math.floor(boss.stateTimer * 4) !== Math.floor((boss.stateTimer - dt) * 4)) {
            audio.playFireDeflect();
          }

          // Countdown reminder text every second
          const prevSec = Math.ceil(boss.infernoFlameTimer + dt);
          const currSec = Math.ceil(boss.infernoFlameTimer);
          if (prevSec !== currSec && currSec > 0) {
            this.addFloatingText(`🛡️ BLOCKING! ${currSec}s REMAINING!`, pCenterX, this.player.y - 20, '#38bdf8');
          }
        } else {
          // NOT BLOCKING:
          if ((this.player.fireResistTimer ?? 0) > 0) {
            // Protected by Fire-Resist Buff!
            if (this.player.invulnerableTimer <= 0) {
              this.player.invulnerableTimer = 0.4;
              audio.playFireDeflect();
              this.addFloatingText('🛡️ FLAME RESISTED! (BUFF) 🛡️', pCenterX, this.player.y - 20, '#f97316');
              for (let sp = 0; sp < 3; sp++) {
                this.particles.push({
                  x: pCenterX + (Math.random() - 0.5) * 20,
                  y: pCenterY + (Math.random() - 0.5) * 20,
                  vx: (Math.random() - 0.5) * 100,
                  vy: (Math.random() - 0.5) * 100,
                  size: 3.5,
                  color: '#f97316',
                  life: 0.3,
                  maxLife: 0.3,
                });
              }
            }
          } else if (this.player.invulnerableTimer <= 0) {
            // Inferno flame engulfs and damages player!
            this.takeDamage(1, dir);
            this.addFloatingText('🔥 HOLD S OR DOWN TO BLOCK! 🔥', pCenterX, this.player.y - 20, '#ef4444');
            audio.playBossFireShoot();
          }
        }
      }

      // After 5 seconds: "and then he stops"
      if (boss.infernoFlameTimer <= 0) {
        boss.state = 'flying_idle';
        boss.stateTimer = 0;
        boss.jawOpen = 0;
        audio.playRockSmash();

        // Check if player successfully blocked the entire inferno flame attack
        const blockedTime = boss.infernoFlameBlockedTime ?? 0;
        const totalDuration = boss.infernoFlameDuration ?? 5.0;
        const successfullyBlockedEntireAttack = blockedTime >= (totalDuration * 0.70);

        if (successfullyBlockedEntireAttack && this.hasShield) {
          // Grant 10-second fire-resist buff to player's shield!
          this.player.fireResistTimer = 10.0;
          audio.playPowerUp();
          audio.playFireDeflect();
          this.addFloatingText('🔥 SHIELD FIRE-RESIST ACTIVATED! (10s) 🔥', this.player.x + this.player.width / 2, this.player.y - 35, '#f97316');

          // Burst of protective fiery sparks around player's shield
          for (let sp = 0; sp < 18; sp++) {
            const angle = (sp / 18) * Math.PI * 2;
            this.particles.push({
              x: this.player.x + this.player.width / 2 + Math.cos(angle) * 22,
              y: this.player.y + this.player.height / 2 + Math.sin(angle) * 22,
              vx: Math.cos(angle) * (Math.random() * 90 + 70),
              vy: Math.sin(angle) * (Math.random() * 90 + 70),
              size: 4 + Math.random() * 3,
              color: sp % 2 === 0 ? '#f97316' : '#facc15',
              life: 0.65,
              maxLife: 0.65,
            });
          }
        } else {
          this.addFloatingText('✨ INFERNO FLAME EXTINGUISHED! ✨', this.player.x + this.player.width / 2, this.player.y - 28, '#4ade80');
        }
        // Billowing smoke puffs from mouth
        for (let sm = 0; sm < 14; sm++) {
          this.particles.push({
            x: mouthX + (Math.random() - 0.5) * 30,
            y: mouthY + (Math.random() - 0.5) * 20,
            vx: dir * (Math.random() * 80 + 30),
            vy: -Math.random() * 60 - 10,
            size: 4 + Math.random() * 5,
            color: '#64748b',
            life: 0.5,
            maxLife: 0.5,
          });
        }
      }
    }

    // 5. STOMP ATTACK
    else if (boss.state === 'prepare_stomp' || boss.state === 'prepare_bite') {
      boss.jawOpen = 0.4;
      boss.wingAngle = Math.sin(boss.stateTimer * 12) * 0.4;
      boss.x += (boss.biteTargetX - boss.width / 2 - boss.x) * 6.0 * dt;
      boss.y += (boss.biteTargetY - 210 - boss.y) * 6.0 * dt;

      const stompDuration = boss.phase === 3 ? 0.55 : (boss.phase === 2 ? 0.75 : 0.95);
      if (boss.stateTimer >= stompDuration) {
        boss.state = 'stomping_platform';
        boss.stateTimer = 0;
      }
    }

    // 6. STOMPING LAND PLATFORM (IMPACT & GROUND SHOCKWAVES)
    else if (boss.state === 'stomping_platform' || boss.state === 'biting_platform') {
      if (boss.stateTimer < 0.22) {
        // Massive talons slamming down with ferocious speed
        boss.y += (boss.biteTargetY - boss.height + 25 - boss.y) * 18 * dt;
      } else if (boss.stateTimer < 0.38) {
        if (!boss.bitePlatformId?.startsWith('impact_done')) {
          boss.bitePlatformId = 'impact_done';
          audio.playBossBiteCrunch();
          audio.playRockSmash();

          // Spawn crater on this land platform
          if (!boss.bittenLandCraters) boss.bittenLandCraters = [];
          boss.bittenLandCraters.push({
            x: boss.biteTargetX,
            y: boss.biteTargetY,
            width: 170,
            timer: 7.0
          });

          // Burst dirt clods, grass clumps, and rock debris!
          for (let pIdx = 0; pIdx < 36; pIdx++) {
            const isGrass = pIdx % 3 === 0;
            const isStone = pIdx % 4 === 0;
            this.particles.push({
              x: boss.biteTargetX + (Math.random() - 0.5) * 120,
              y: boss.biteTargetY + Math.random() * 8,
              vx: (Math.random() - 0.5) * 260,
              vy: -Math.random() * 210 - 40,
              size: 4 + Math.random() * 5,
              color: isGrass ? '#22c55e' : (isStone ? '#64748b' : '#78350f'),
              life: 0.65,
              maxLife: 0.65
            });
          }

          // Two ground shockwaves travelling left and right across the platform!
          if (!boss.shockwaves) boss.shockwaves = [];
          boss.shockwaves.push({
            x: boss.biteTargetX - 30,
            y: boss.biteTargetY - 10,
            vx: -240,
            radius: 20,
            timer: 1.6
          });
          boss.shockwaves.push({
            x: boss.biteTargetX + 30,
            y: boss.biteTargetY - 10,
            vx: 240,
            radius: 20,
            timer: 1.6
          });

          // Direct stomp hit check
          if (
            Math.abs(playerCenter - boss.biteTargetX) < 85 &&
            Math.abs((this.player.y + this.player.height) - boss.biteTargetY) < 36
          ) {
            this.takeDamage(2, this.player.x > boss.biteTargetX ? 1 : -1);
          }
        }
      } else {
        boss.y -= 150 * dt;
        if (boss.stateTimer >= 1.05) {
          boss.state = 'flying_idle';
          boss.stateTimer = 0;
        }
      }
    }

    // 7. PREPARE CLAW ATTACK
    else if (boss.state === 'prepare_claw') {
      const flySide = this.player.x > boss.biteTargetX ? boss.biteTargetX - 220 : boss.biteTargetX + 220;
      boss.x += (flySide - boss.x) * 4 * dt;
      boss.y += (boss.biteTargetY - boss.height - 30 - boss.y) * 4 * dt;
      boss.wingAngle = Math.sin(boss.stateTimer * 10) * 0.5;

      if (boss.stateTimer >= 1.0) {
        boss.state = 'clawing';
        boss.stateTimer = 0;
        audio.playBossFireShoot();
      }
    }

    // 8. CLAWING (SWOOPING SLASH)
    else if (boss.state === 'clawing') {
      const dir = boss.facing === 'right' ? 1 : -1;
      boss.x += dir * 480 * dt;
      boss.y += Math.sin(boss.stateTimer * 8) * 60 * dt;

      // Spawn slash trail
      if (!boss.slashTrails) boss.slashTrails = [];
      if (Math.random() < 0.4) {
        boss.slashTrails.push({
          x: boss.x + (dir > 0 ? boss.width : 0),
          y: boss.y + boss.height * 0.65,
          vx: dir * 180,
          timer: 0.35
        });
      }

      // Check collision with player
      const distToPlayer = Math.hypot(
        (boss.x + boss.width / 2) - (this.player.x + this.player.width / 2),
        (boss.y + boss.height / 2) - (this.player.y + this.player.height / 2)
      );
      if (distToPlayer < 75 && this.player.invulnerableTimer <= 0) {
        if (this.player.isBlocking) {
          audio.playFireDeflect();
          this.player.vx = dir * 160;
        } else {
          this.takeDamage(1, dir);
        }
      }

      if (boss.stateTimer >= 0.85) {
        boss.state = 'flying_idle';
        boss.stateTimer = 0;
      }
    }

    // 9. PREPARE PECK ATTACK
    else if (boss.state === 'prepare_peck') {
      const approachX = boss.facing === 'right' ? this.player.x - 110 : this.player.x + 110;
      boss.x += (approachX - boss.x) * 4 * dt;
      boss.y += (this.player.y - 40 - boss.y) * 4 * dt;
      boss.jawOpen = 0.3;

      if (boss.stateTimer >= 0.85) {
        boss.state = 'pecking';
        boss.stateTimer = 0;
      }
    }

    // 10. PECKING (RAPID BEAK STABS)
    else if (boss.state === 'pecking') {
      const peckCycle = boss.stateTimer % 0.28;
      boss.jawOpen = peckCycle < 0.14 ? 0.9 : 0.1;
      const dir = boss.facing === 'right' ? 1 : -1;

      if (peckCycle < 0.05 && boss.stateTimer < 0.84) {
        audio.playBossBiteCrunch();
        const beakX = dir > 0 ? boss.x + boss.width : boss.x;
        const beakY = boss.y + 60;
        const pCenterX = this.player.x + this.player.width / 2;
        const pCenterY = this.player.y + this.player.height / 2;

        if (Math.hypot(beakX - pCenterX, beakY - pCenterY) < 65 && this.player.invulnerableTimer <= 0) {
          if (this.player.isBlocking) {
            audio.playFireDeflect();
          } else {
            this.takeDamage(1, dir);
          }
        }
      }

      if (boss.stateTimer >= 0.88) {
        boss.state = 'flying_idle';
        boss.stateTimer = 0;
      }
    }

    // 11. PREPARE TAIL WHIP
    else if (boss.state === 'prepare_tail_whip') {
      boss.x += (boss.biteTargetX - boss.width / 2 - boss.x) * 4.5 * dt;
      boss.y += (boss.biteTargetY - boss.height + 15 - boss.y) * 4.5 * dt;

      if (boss.stateTimer >= 0.9) {
        boss.state = 'tail_whipping';
        boss.stateTimer = 0;
        audio.playCockatriceScreech();
      }
    }

    // 12. TAIL WHIP (360 FLOOR SWEEP)
    else if (boss.state === 'tail_whipping') {
      boss.wingAngle = Math.sin(boss.stateTimer * 16) * 0.7;

      // Whirlwind dust particles
      if (Math.random() < 0.6) {
        const sweepAngle = boss.stateTimer * 14;
        this.particles.push({
          x: boss.x + boss.width / 2 + Math.cos(sweepAngle) * 90,
          y: boss.y + boss.height - 12 + Math.sin(sweepAngle) * 20,
          vx: Math.cos(sweepAngle) * 140,
          vy: -30,
          size: 4,
          color: '#38bdf8',
          life: 0.3,
          maxLife: 0.3
        });
      }

      // Check grounded player hit within tail sweep radius
      const pCenterX = this.player.x + this.player.width / 2;
      const bCenterX = boss.x + boss.width / 2;
      const dist = Math.abs(pCenterX - bCenterX);

      if (dist < 140 && this.player.isGrounded && this.player.invulnerableTimer <= 0) {
        this.takeDamage(1, pCenterX > bCenterX ? 1 : -1);
      }

      if (boss.stateTimer >= 0.75) {
        boss.state = 'flying_idle';
        boss.stateTimer = 0;
      }
    }

    // 7. STUNNED (KNOCKED DOWN! 3 HITS NEEDED BEFORE IT WAKES UP!)
    else if (boss.state === 'stunned') {
      boss.stunTimer += dt;
      boss.jawOpen = 0.3;

      const groundPlat = this.level.platforms.find(p => p.x <= boss.x + boss.width / 2 && p.x + p.width >= boss.x + boss.width / 2 && p.y >= 350) || this.level.platforms[0];
      const targetY = groundPlat.y - boss.height + 12;
      // Smooth brisk descent onto ground instead of instant teleport
      if (boss.y < targetY) {
        boss.y = Math.min(targetY, boss.y + Math.max(240, (targetY - boss.y) * 6.5) * dt);
      } else {
        boss.y = targetY;
      }

      // Dizzy cartoon stars circling head
      if (Math.random() < 0.3) {
        const starAngle = boss.animTimer * 6;
        this.particles.push({
          x: bossCenter + Math.cos(starAngle) * 32,
          y: boss.y - 10 + Math.sin(starAngle) * 12,
          vx: 0,
          vy: -6,
          size: 4,
          color: '#facc15',
          life: 0.45,
          maxLife: 0.45
        });
      }

      // Check player jump stomp bounce (jump on the knocked-down boss to drain health!)
      const pCenterX = this.player.x + this.player.width / 2;
      const bCenterX = boss.x + boss.width / 2;
      const isAboveBoss = (
        this.player.vy > 0 &&
        Math.abs(pCenterX - bCenterX) < boss.width * 0.48 &&
        this.player.y + this.player.height >= boss.y + 10 &&
        this.player.y + this.player.height <= boss.y + boss.height * 0.75
      );

      if (isAboveBoss) {
        this.player.vy = -420; // High bounce for consecutive stomps
        this.player.isJumping = true;
        this.player.jumpTime = 0.1;
        this.hitStunnedCockatrice(boss);
      }

      if (boss.stunTimer >= boss.maxStunTime) {
        boss.state = 'flying_idle';
        boss.stateTimer = 0;
        boss.isShakingOff = true;
        boss.shakeOffTimer = 0.95;
        boss.regrowGlowTimer = 1.4;
        boss.burntMarksCount = 0;
        boss.burnIntensity = 0;
        // When the boss regrows his feathers his health regenerates by 1:
        boss.health = Math.min(boss.maxHealth, boss.health + 1);
        this.callbacks.onStatsUpdate(this.player.health, this.coinsEarnedThisLevel, this.player.stage);
        audio.playCockatriceScreech();

        // Emerald and golden healing/regrow feather particles
        for (let rp = 0; rp < 14; rp++) {
          this.particles.push({
            x: bossCenter + (Math.random() - 0.5) * 80,
            y: boss.y + boss.height / 2 + (Math.random() - 0.5) * 50,
            vx: (Math.random() - 0.5) * 90,
            vy: -Math.random() * 80 - 20,
            size: 3 + Math.random() * 3,
            color: Math.random() > 0.5 ? '#34d399' : '#fef08a',
            life: 0.45,
            maxLife: 0.45
          });
        }
      }
    }

    // 8. UPDATE FIRE PROJECTILES
    boss.fireProjectiles.forEach(proj => {
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;

      if (proj.isFading) {
        proj.fadeTimer = (proj.fadeTimer ?? 0.45) - dt;
        proj.radius += 18 * dt; // expanding dissipation ring
        if (proj.fadeTimer <= 0) {
          proj.life = 0;
        }
      } else {
        proj.life -= dt;
      }

      if (Math.random() < 0.6) {
        this.particles.push({
          x: proj.x,
          y: proj.y,
          vx: (Math.random() - 0.5) * 30,
          vy: (Math.random() - 0.5) * 30,
          size: 3 + Math.random() * 3,
          color: proj.isDeflected ? '#38bdf8' : '#f97316',
          life: 0.25,
          maxLife: 0.25
        });
      }

      // Collision with Player
      if (!proj.isDeflected && !proj.isFading) {
        const distToPlayer = Math.hypot(
          proj.x - (this.player.x + this.player.width / 2),
          proj.y - (this.player.y + this.player.height / 2)
        );

        if (distToPlayer < proj.radius + this.player.width / 2) {
          // SHIELD DEFLECTION CHECK!
          if (this.player.isBlocking) {
            proj.isDeflected = true;
            proj.vx = -proj.vx * 1.5;
            proj.vy = (boss.y + boss.height / 2 - proj.y) / 0.8;
            proj.targetBoss = true;
            audio.playFireDeflect();
            this.callbacks.onActionStat?.('projectilesDeflected');
            this.addFloatingText('DEFLECTED!', this.player.x + this.player.width / 2, this.player.y - 20, '#38bdf8');
            for (let sp = 0; sp < 12; sp++) {
              this.particles.push({
                x: proj.x,
                y: proj.y,
                vx: (Math.random() - 0.5) * 130,
                vy: (Math.random() - 0.5) * 130,
                size: 3,
                color: '#38bdf8',
                life: 0.35,
                maxLife: 0.35
              });
            }
          } else if ((this.player.fireResistTimer ?? 0) > 0) {
            // FIRE-RESIST BUFF ABSORPTION:
            // Shield's fire-resist protects the player without taking damage!
            proj.life = 0;
            audio.playFireDeflect();
            this.addFloatingText('🔥 FIRE RESISTED! 🔥', this.player.x + this.player.width / 2, this.player.y - 20, '#f97316');
            for (let sp = 0; sp < 10; sp++) {
              this.particles.push({
                x: proj.x,
                y: proj.y,
                vx: (Math.random() - 0.5) * 110,
                vy: (Math.random() - 0.5) * 110,
                size: 3.5,
                color: '#f97316',
                life: 0.35,
                maxLife: 0.35
              });
            }
          } else {
            // Fire touches player: immediately fades and dissipates
            proj.life = 0;
            this.takeDamage(1, proj.vx > 0 ? 1 : -1);
            this.addDefeatExplosion(proj.x, proj.y);
            for (let sp = 0; sp < 10; sp++) {
              this.particles.push({
                x: proj.x,
                y: proj.y,
                vx: (Math.random() - 0.5) * 90,
                vy: (Math.random() - 0.5) * 90,
                size: 3,
                color: '#f97316',
                life: 0.35,
                maxLife: 0.35
              });
            }
          }
        }
      }

      // Fire touches the grass / platforms -> fades and extinguishes
      if (proj.life > 0 && !proj.isFading) {
        for (const plat of this.level.platforms) {
          if (
            proj.x + proj.radius > plat.x &&
            proj.x - proj.radius < plat.x + plat.width &&
            proj.y + proj.radius >= plat.y &&
            proj.y - proj.radius <= plat.y + 14
          ) {
            proj.isFading = true;
            proj.fadeTimer = 0.35;
            proj.maxFadeTime = 0.35;
            proj.vx = 0;
            proj.vy = 0;
            // Fading grass embers & smoke
            for (let gp = 0; gp < 8; gp++) {
              this.particles.push({
                x: proj.x + (Math.random() - 0.5) * 16,
                y: plat.y,
                vx: (Math.random() - 0.5) * 50,
                vy: -Math.random() * 35 - 10,
                size: 2.5 + Math.random() * 2,
                color: Math.random() > 0.5 ? '#22c55e' : (Math.random() > 0.5 ? '#f97316' : '#94a3b8'),
                life: 0.4,
                maxLife: 0.4
              });
            }
            break;
          }
        }
      }

      // Deflected Fireball hits Boss!
      if (proj.isDeflected && proj.targetBoss && !proj.isFading) {
        const distToBoss = Math.hypot(
          proj.x - (boss.x + boss.width / 2),
          proj.y - (boss.y + boss.height / 2)
        );

        if (distToBoss < proj.radius + boss.width / 2.2) {
          const nextMarks = Math.min(3, (boss.burntMarksCount || 0) + 1);
          const nextHealth = Math.max(0, boss.health - 20);
          const isFinalHit = nextMarks >= 3 || nextHealth <= 0;

          // Deflected fireball hits boss: vanishes fast with a smokey animation fading effect!
          proj.isFading = true;
          proj.fadeTimer = 0.16;
          proj.maxFadeTime = 0.16;
          proj.targetBoss = false;
          proj.vx *= 0.05;
          proj.vy *= 0.05;

          // If this hit knocks down the boss or finishes him, all active fireballs vanish fast with the smokey fading effect:
          if (isFinalHit) {
            boss.fireProjectiles.forEach(otherProj => {
              otherProj.isFading = true;
              otherProj.fadeTimer = Math.min(otherProj.fadeTimer || 0.16, 0.16);
              otherProj.maxFadeTime = 0.16;
              otherProj.targetBoss = false;
              otherProj.vx *= 0.05;
              otherProj.vy *= 0.05;
            });
          }

          // Dense smokey animation puff particles
          for (let sp = 0; sp < 18; sp++) {
            this.particles.push({
              x: proj.x + (Math.random() - 0.5) * 16,
              y: proj.y + (Math.random() - 0.5) * 16,
              vx: (Math.random() - 0.5) * 140,
              vy: -Math.random() * 90 - 20,
              size: 3 + Math.random() * 4,
              color: Math.random() > 0.6 ? '#64748b' : (Math.random() > 0.3 ? '#94a3b8' : '#38bdf8'),
              life: 0.22,
              maxLife: 0.22
            });
          }

          this.addDefeatExplosion(proj.x, proj.y);
          audio.playEnemyDefeat();

          // The boss will ONLY get burnt marks when we deflect his own fireballs at him!
          // 1 deflected fireball: 1 burnt mark
          // 2 deflected fireballs: 2 burnt marks
          // 3 deflected fireballs: 3 burnt marks
          boss.burntMarksCount = nextMarks;
          boss.burnIntensity = boss.burntMarksCount / 3;
          boss.health = nextHealth;
          this.coinsEarnedThisLevel += 25;
          this.callbacks.onStatsUpdate(this.player.health, this.coinsEarnedThisLevel, this.player.stage);

          if (boss.health <= 0) {
            this.hitStunnedCockatrice(boss);
            return;
          }

          // 3 deflected fireballs knock down the boss smoothly instead of snapping
          if (boss.burntMarksCount >= 3) {
            boss.state = 'stunned';
            boss.stunTimer = 0;
            boss.stunHitsNeeded = 3;
            boss.maxStunTime = boss.phase === 3 ? 6.5 : (boss.phase === 2 ? 8.5 : 12);
            boss.invulnerableTimer = 0.2;
            const groundPlat = this.level.platforms.find(p => p.x <= boss.x + boss.width / 2 && p.x + p.width >= boss.x + boss.width / 2 && p.y >= 350) || this.level.platforms[0];
            const targetY = groundPlat.y - boss.height + 12;
            boss.vy = 0;
            audio.playRockSmash();
            audio.playCockatriceScreech();
            this.addDustPuff(boss.x + boss.width / 2, targetY + boss.height, 14);
          }
        }
      }
    });

    boss.fireProjectiles = boss.fireProjectiles.filter(p => p.life > 0);

    // Update stomp shockwaves
    if (boss.shockwaves) {
      boss.shockwaves.forEach(sw => {
        sw.x += sw.vx * dt;
        sw.timer -= dt;
        const pCenterX = this.player.x + this.player.width / 2;
        const pBottom = this.player.y + this.player.height;
        if (
          Math.abs(pCenterX - sw.x) < sw.radius + 16 &&
          Math.abs(pBottom - sw.y) < 30 &&
          this.player.isGrounded &&
          this.player.invulnerableTimer <= 0
        ) {
          this.takeDamage(1, sw.vx > 0 ? 1 : -1);
        }
      });
      boss.shockwaves = boss.shockwaves.filter(sw => sw.timer > 0);
    }

    // Update claw slash trails
    if (boss.slashTrails) {
      boss.slashTrails.forEach(st => {
        st.timer -= dt;
      });
      boss.slashTrails = boss.slashTrails.filter(st => st.timer > 0);
    }
  }

  private defeatCockatrice(boss: CockatriceBoss) {
    boss.health = 0;
    boss.state = 'defeated';
    boss.defeatSubState = 'falling';
    boss.defeatTimer = 0;
    boss.dialogueIndex = 0;
    boss.dialogueCharIndex = 0;
    boss.stateTimer = 0;
    boss.dialogueTimer = 0;
    boss.burnIntensity = 1.0;

    // Dismiss any remaining summoned beasts cleanly when boss falls
    this.level.enemies?.forEach(enemy => {
      if (enemy.isBossSummon && enemy.state !== 'defeated') {
        enemy.state = 'defeated';
        this.addDefeatExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
      }
    });

    this.coinsEarnedThisLevel += 300;
    this.callbacks.onStatsUpdate(this.player.health, this.coinsEarnedThisLevel, this.player.stage);
    this.addDefeatExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2);
    audio.playEnemyDefeat();
    audio.playCockatriceScreech();
    audio.playFightFanfare();
    this.addFloatingText('★ THE COCKATRICE IS DEFEATED! ★', boss.x + boss.width / 2, boss.y - 25, '#fde047');
  }

  private hitActiveCockatriceWithSword(boss: CockatriceBoss) {
    if (boss.invulnerableTimer > 0) return;
    boss.invulnerableTimer = 0.35;

    const isNetherite = this.swordType === 'netherite';
    // Netherite sword deals 20 heavy strike damage (exactly 1 full health cube down!)
    const dmg = isNetherite ? 20 : (this.swordType === 'diamond' ? 15 : (this.swordType === 'gold' ? 10 : 6));

    const slashCenterX = this.player.facing === 'right' ? this.player.x + this.player.width + 12 : this.player.x - 12;
    const slashCenterY = this.player.y + this.player.height / 2;

    // "and when we use the sword when keeps on slashing or biting and he is at one health down when he does one of his moves that has to be used by sword he then gets defeated"
    if (boss.health <= dmg || boss.health <= 20) {
      if (isNetherite) {
        for (let i = 0; i < 30; i++) {
          this.particles.push({
            x: slashCenterX + (Math.random() - 0.5) * 55,
            y: slashCenterY + (Math.random() - 0.5) * 55,
            vx: (Math.random() - 0.5) * 320,
            vy: -Math.random() * 220 - 40,
            size: 4 + Math.random() * 4,
            color: Math.random() > 0.45 ? '#c084fc' : (Math.random() > 0.3 ? '#a855f7' : '#fde047'),
            life: 0.6,
            maxLife: 0.6,
          });
        }
      }
      this.defeatCockatrice(boss);
      return;
    }

    boss.health = Math.max(0, boss.health - dmg);
    this.coinsEarnedThisLevel += 25;
    this.callbacks.onStatsUpdate(this.player.health, this.coinsEarnedThisLevel, this.player.stage);

    audio.playEnemyDefeat();
    audio.playCockatriceScreech();

    if (isNetherite) {
      this.addFloatingText(`★ NETHERITE SLASH! -${dmg} HP! [${boss.health}/200] ★`, boss.x + boss.width / 2, boss.y - 25, '#c084fc');
      // Cosmic purple and obsidian spark explosion
      for (let i = 0; i < 24; i++) {
        this.particles.push({
          x: slashCenterX + (Math.random() - 0.5) * 45,
          y: slashCenterY + (Math.random() - 0.5) * 45,
          vx: (Math.random() - 0.5) * 260,
          vy: -Math.random() * 190 - 30,
          size: 3.5 + Math.random() * 3.5,
          color: Math.random() > 0.45 ? '#c084fc' : (Math.random() > 0.3 ? '#a855f7' : '#18181b'),
          life: 0.5,
          maxLife: 0.5,
        });
      }
    } else {
      this.addFloatingText(`SWORD STRIKE! -${dmg} HP! [${boss.health}/200]`, boss.x + boss.width / 2, boss.y - 25, '#facc15');
      this.addDefeatExplosion(slashCenterX, slashCenterY);
    }

    // When the boss is pecking or slashing, deflect & counter the attack!
    if (boss.state === 'pecking' || boss.state === 'prepare_peck' || boss.state === 'clawing' || boss.state === 'prepare_claw') {
      boss.state = 'flying_idle';
      boss.stateTimer = 0;
      this.addFloatingText('⚡ ATTACK COUNTERED! ⚡', boss.x + boss.width / 2, boss.y - 5, '#38bdf8');
      boss.vy = -180;
      boss.x += (this.player.facing === 'right' ? 70 : -70);
    }

    if (boss.health <= 20) {
      this.addFloatingText('★ 1 HEALTH DOWN! COUNTER HIS NEXT BITE OR CLAW! ★', boss.x + boss.width / 2, boss.y - 30, '#ef4444');
    }
  }

  private hitStunnedCockatrice(boss: CockatriceBoss) {
    if (boss.invulnerableTimer > 0) return;
    boss.invulnerableTimer = 0.28;
    boss.stunHitsNeeded--;
    // Drain 20 hearts of boss health on each jump stomp!
    boss.health = Math.max(0, boss.health - 20);
    this.coinsEarnedThisLevel += 25;
    this.callbacks.onStatsUpdate(this.player.health, this.coinsEarnedThisLevel, this.player.stage);
    audio.playEnemyDefeat();

    const currentHit = 3 - boss.stunHitsNeeded;
    this.addFloatingText(`JUMP STOMP ${currentHit}/3! -20 HP! +25 EXP! [${boss.health}/200]`, boss.x + boss.width / 2, boss.y - 15, '#facc15');
    this.addDefeatExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2);

    for (let i = 0; i < 16; i++) {
      this.particles.push({
        x: boss.x + boss.width / 2 + (Math.random() - 0.5) * 60,
        y: boss.y + 20 + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 200,
        vy: -Math.random() * 180 - 40,
        size: 3 + Math.random() * 3,
        color: Math.random() > 0.5 ? '#facc15' : '#ef4444',
        life: 0.5,
        maxLife: 0.5
      });
    }

    if (boss.health <= 0) {
      this.defeatCockatrice(boss);
    } else if (boss.stunHitsNeeded <= 0) {
      // 3 jumps completed before it woke up! Next phase begins & shakes off charred feathers/scales
      boss.phase = Math.min(3, boss.phase + 1);
      boss.state = 'flying_idle';
      boss.stateTimer = 0;
      boss.isShakingOff = true;
      boss.shakeOffTimer = 0.95;
      boss.regrowGlowTimer = 1.4;
      boss.burntMarksCount = 0;
      boss.burnIntensity = 0;
      // When the boss regrows his feathers his health regenerates by 1:
      boss.health = Math.min(boss.maxHealth, boss.health + 1);
      this.callbacks.onStatsUpdate(this.player.health, this.coinsEarnedThisLevel, this.player.stage);
      audio.playCockatriceScreech();

      for (let p = 0; p < 18; p++) {
        this.particles.push({
          x: boss.x + boss.width / 2 + (Math.random() - 0.5) * 80,
          y: boss.y + boss.height / 2 + (Math.random() - 0.5) * 50,
          vx: (Math.random() - 0.5) * 220,
          vy: -Math.random() * 120 - 20,
          size: 3 + Math.random() * 3,
          color: Math.random() > 0.5 ? '#1e293b' : (Math.random() > 0.5 ? '#0f172a' : '#78350f'),
          life: 0.5,
          maxLife: 0.5
        });
      }

      // Emerald and golden healing/regrow feather particles
      for (let rp = 0; rp < 18; rp++) {
        this.particles.push({
          x: boss.x + boss.width / 2 + (Math.random() - 0.5) * 80,
          y: boss.y + boss.height / 2 + (Math.random() - 0.5) * 50,
          vx: (Math.random() - 0.5) * 120,
          vy: -Math.random() * 90 - 20,
          size: 3 + Math.random() * 3,
          color: Math.random() > 0.5 ? '#34d399' : '#fef08a',
          life: 0.45,
          maxLife: 0.45
        });
      }

      if (boss.phase === 2) {
        boss.rageMode = 'inferno rage';
        boss.maxStunTime = 8.5;
      } else if (boss.phase === 3) {
        boss.rageMode = 'max rage';
        boss.maxStunTime = 6.5;
      }
    }
  }

  public advanceBossDialogue() {
    const boss = this.level.cockatrice;
    if (!boss) return;

    if (boss.state === 'defeated') {
      if (boss.defeatSubState === 'ground_talk_1') {
        const finalLine = "no No NOOOOOOO!";
        if (boss.dialogueCharIndex < finalLine.length) {
          boss.dialogueCharIndex = finalLine.length;
        } else if (boss.stateTimer > 0.25) {
          boss.defeatSubState = 'exploding_ashes';
          boss.stateTimer = 0;
          boss.defeatTimer = 0;
          boss.ashExplodeFlash = 0.35;
          audio.playCockatriceScreech();
          audio.playRockSmash();
          audio.playEnemyDefeat();
        }
      }
      return;
    }

    if (boss.state !== 'intro_dialogue') return;
    const dialogues = [
      "who dares enter my realm?",
      "well.. i guess i need to spice things up!",
      "when you defeat me.. it will be the last thing you will ever know"
    ];
    const currentText = dialogues[boss.dialogueIndex] || '';
    if (boss.dialogueCharIndex < currentText.length) {
      boss.dialogueCharIndex = currentText.length;
    } else {
      if (boss.dialogueIndex < dialogues.length - 1) {
        boss.dialogueIndex++;
        boss.dialogueCharIndex = 0;
        boss.stateTimer = 0;
        boss.dialogueTimer = 0;
      } else {
        boss.burntMarksCount = 0;
        if (this.level.silkieSam && this.level.silkieSam.state === 'waiting') {
          boss.state = 'waiting_for_sam';
          boss.stateTimer = 0;
          this.level.silkieSam.state = 'flying_in';
          this.level.silkieSam.dialogueTimer = 0;
          this.level.silkieSam.dialogueCharIndex = 0;
        } else {
          boss.state = 'countdown';
          boss.countdownTimer = 3.99;
          boss.countdownText = '3..';
          boss.stateTimer = 0;
          audio.playCountdownPip(3);
        }
      }
    }
  }

  private updateSilkieSam(dt: number) {
    const sam = this.level.silkieSam;
    if (!sam || sam.state === 'waiting') return;

    sam.wingAngle = Math.sin(this.time * 16) * 0.45;

    // Fast-skip dialogues with tap or jump/attack keys
    const wantsSkipDialogue = this.input.jump || this.input.attack || this.input.block;

    // 1. FLYING IN FROM THE SKY
    if (sam.state === 'flying_in') {
      sam.y += (sam.targetY - sam.y) * 4 * dt;
      sam.shieldX = sam.x - 12;
      sam.shieldY = sam.y + 16;
      sam.swordX = sam.x + 16;
      sam.swordY = sam.y + 16;
      if (Math.abs(sam.y - sam.targetY) < 4) {
        sam.y = sam.targetY;
        sam.state = 'talk_1';
        sam.dialogueTimer = 0;
        sam.dialogueCharIndex = 0;
      }
    }

    // 2. TALK 1: "here take this" -> drops shield
    else if (sam.state === 'talk_1') {
      sam.dialogueTimer += dt;
      const line1 = "here take this";
      if (sam.dialogueCharIndex < line1.length) {
        if (wantsSkipDialogue) {
          sam.dialogueCharIndex = line1.length;
        } else if (sam.dialogueTimer > 0.022) {
          sam.dialogueTimer = 0;
          sam.dialogueCharIndex++;
          if (sam.dialogueCharIndex % 2 === 0) {
            audio.playBossDialogueVoice();
          }
        }
      } else {
        if (sam.dialogueTimer > 0.65 || (wantsSkipDialogue && sam.dialogueTimer > 0.2)) {
          sam.state = 'dropping_shield';
          sam.dialogueTimer = 0;
          sam.shieldDropped = true;
          sam.shieldX = sam.x - 14;
          sam.shieldVy = 30;
          audio.playEvolution();
        }
      }
    }

    // 3. DROPPING SHIELD -> TRANSITION TO TALK 2: "oh here is a sword"
    else if (sam.state === 'dropping_shield') {
      sam.dialogueTimer += dt;
      if (sam.dialogueTimer > 0.35 || wantsSkipDialogue) {
        sam.state = 'talk_2';
        sam.dialogueTimer = 0;
        sam.dialogueCharIndex = 0;
      }
    }

    // 4. TALK 2: "oh here is a sword" -> drops netherite sword!
    else if (sam.state === 'talk_2') {
      sam.dialogueTimer += dt;
      const line2 = "oh here is a sword";
      if (sam.dialogueCharIndex < line2.length) {
        if (wantsSkipDialogue) {
          sam.dialogueCharIndex = line2.length;
        } else if (sam.dialogueTimer > 0.022) {
          sam.dialogueTimer = 0;
          sam.dialogueCharIndex++;
          if (sam.dialogueCharIndex % 2 === 0) {
            audio.playBossDialogueVoice();
          }
        }
      } else {
        if (sam.dialogueTimer > 0.65 || (wantsSkipDialogue && sam.dialogueTimer > 0.2)) {
          sam.state = 'dropping_sword';
          sam.dialogueTimer = 0;
          sam.swordDropped = true;
          sam.swordX = sam.x + 18;
          sam.swordVy = 30;
          audio.playEvolution();
        }
      }
    }

    // 5. DROPPING SWORD -> TRANSITION TO TALK 3: "good luck!"
    else if (sam.state === 'dropping_sword') {
      sam.dialogueTimer += dt;
      if (sam.dialogueTimer > 0.35 || wantsSkipDialogue) {
        sam.state = 'talk_3';
        sam.dialogueTimer = 0;
        sam.dialogueCharIndex = 0;
      }
    }

    // 6. TALK 3: "good luck!" (last line)
    else if (sam.state === 'talk_3') {
      sam.dialogueTimer += dt;
      const line3 = "good luck!";
      if (sam.dialogueCharIndex < line3.length) {
        if (wantsSkipDialogue) {
          sam.dialogueCharIndex = line3.length;
        } else if (sam.dialogueTimer > 0.022) {
          sam.dialogueTimer = 0;
          sam.dialogueCharIndex++;
          if (sam.dialogueCharIndex % 2 === 0) {
            audio.playBossDialogueVoice();
          }
        }
      } else {
        if (sam.dialogueTimer > 0.65 || (wantsSkipDialogue && sam.dialogueTimer > 0.2)) {
          sam.state = 'flying_away';
          sam.dialogueTimer = 0;
          audio.playJump(false);
        }
      }
    }

    // 7. FLAP AWAY A LITTLE UP INTO THE SKY -> THEN COUNTDOWN STARTS & BOSS FIGHT BEGINS!
    else if (sam.state === 'flying_away') {
      sam.y -= 190 * dt;
      sam.x += 70 * dt;
      sam.wingAngle = Math.sin(this.time * 24) * 0.7;
      if (sam.y < 80) {
        sam.state = 'gone';
        // When Silkie Sam flies a little away after talking, the retro countdown officially begins!
        const boss = this.level.cockatrice;
        if (boss && (boss.state === 'waiting_for_sam' || boss.state === 'flying_idle')) {
          boss.state = 'countdown';
          boss.countdownTimer = 3.99;
          boss.countdownText = '3..';
          boss.stateTimer = 0;
          audio.playCountdownPip(3);
        }
      }
    }

    // UPDATE DROPPED ROYAL SHIELD PHYSICS & PROXIMITY PICKUP
    if (sam.shieldDropped && !sam.shieldCollected) {
      const targetGroundY = 440;
      if (sam.shieldY < targetGroundY) {
        sam.shieldVy += 700 * dt;
        sam.shieldY += sam.shieldVy * dt;
        if (sam.shieldY >= targetGroundY) {
          sam.shieldY = targetGroundY;
          sam.shieldVy = 0;
          audio.playRockSmash();
          this.addDustPuff(sam.shieldX, targetGroundY + 10, 5);
        }
      } else {
        sam.shieldY = targetGroundY;
      }

      // Proximity pickup: player walks over or touches the shield
      const distToPlayer = Math.hypot(
        (this.player.x + this.player.width / 2) - sam.shieldX,
        (this.player.y + this.player.height / 2) - sam.shieldY
      );

      if (distToPlayer < 40) {
        sam.shieldCollected = true;
        this.hasShield = true;
        this.player.hasShield = true;
        this.saveData.hasShield = true;
        audio.playEvolution();
        this.addFloatingText('★ ROYAL SHIELD EQUIPPED! ★', sam.shieldX, sam.shieldY - 38, '#38bdf8');
        this.addFloatingText('PRESS C / S / DOWN TO BLOCK & DEFLECT FIRE!', sam.shieldX, sam.shieldY - 14, '#fde047');

        for (let s = 0; s < 30; s++) {
          this.particles.push({
            x: sam.shieldX,
            y: sam.shieldY,
            vx: (Math.random() - 0.5) * 200,
            vy: -Math.random() * 160 - 40,
            size: 4 + Math.random() * 3,
            color: Math.random() > 0.4 ? '#38bdf8' : '#fde047',
            life: 0.85,
            maxLife: 0.85
          });
        }

        this.callbacks.onStatsUpdate(
          this.player.health,
          this.coinsEarnedThisLevel,
          this.player.stage,
          this.armorType,
          this.swordType,
          this.hasShield
        );
        this.callbacks.onSaveDataUpdate?.({ hasShield: true });
      }
    }

    // UPDATE DROPPED NETHERITE SWORD PHYSICS & PROXIMITY PICKUP
    if (sam.swordDropped && !sam.swordCollected) {
      const targetGroundY = 440;
      if ((sam.swordY ?? 0) < targetGroundY) {
        sam.swordVy = (sam.swordVy ?? 0) + 700 * dt;
        sam.swordY = (sam.swordY ?? 0) + sam.swordVy * dt;
        if (sam.swordY >= targetGroundY) {
          sam.swordY = targetGroundY;
          sam.swordVy = 0;
          audio.playRockSmash();
          this.addDustPuff(sam.swordX ?? (sam.x + 20), targetGroundY + 10, 5);
        }
      } else {
        sam.swordY = targetGroundY;
      }

      const swordX = sam.swordX ?? (sam.x + 20);
      const swordY = sam.swordY ?? targetGroundY;

      // Proximity pickup: player walks over or touches the netherite sword
      const distToPlayer = Math.hypot(
        (this.player.x + this.player.width / 2) - swordX,
        (this.player.y + this.player.height / 2) - swordY
      );

      if (distToPlayer < 44) {
        sam.swordCollected = true;
        this.swordType = 'netherite';
        this.saveData.sword = 'netherite';
        this.callbacks.onSaveDataUpdate?.({ sword: 'netherite' });
        audio.playEvolution();
        this.addFloatingText('★ NETHERITE SWORD EQUIPPED! ★', swordX, swordY - 38, '#c084fc');
        this.addFloatingText('PRESS X OR K TO SLASH & COUNTER ATTACKS!', swordX, swordY - 14, '#fde047');

        for (let s = 0; s < 32; s++) {
          this.particles.push({
            x: swordX,
            y: swordY,
            vx: (Math.random() - 0.5) * 220,
            vy: -Math.random() * 180 - 40,
            size: 4 + Math.random() * 4,
            color: Math.random() > 0.4 ? '#c084fc' : (Math.random() > 0.4 ? '#a855f7' : '#18181b'),
            life: 0.85,
            maxLife: 0.85
          });
        }

        this.callbacks.onStatsUpdate(
          this.player.health,
          this.coinsEarnedThisLevel,
          this.player.stage,
          this.armorType,
          this.swordType,
          this.hasShield
        );
      }
    }
  }

  private updateCollectibles(dt: number = 0.016) {
    const p = this.player;

    // Coins
    this.level.coins.forEach(c => {
      if (c.collected) return;

      // Golden Coin Magnet Upgrade: Attract coins towards the player
      if (this.saveData.upgrades?.coinMagnet) {
        const dx = (p.x + p.width / 2) - c.x;
        const dy = (p.y + p.height / 2) - c.y;
        const distToPlayer = Math.hypot(dx, dy);
        if (distToPlayer < 190 && distToPlayer > 1) {
          c.x += (dx / distToPlayer) * 280 * dt;
          c.y += (dy / distToPlayer) * 280 * dt;
        }
      }

      const dist = Math.hypot(p.x + p.width / 2 - c.x, p.y + p.height / 2 - c.y);
      if (dist < c.radius + p.width / 2) {
        c.collected = true;
        let earned = 1;
        if (this.saveData.upgrades?.luckyCorn) {
          const chance = this.saveData.upgrades.luckyCorn * 0.3;
          if (Math.random() < chance) {
            earned = 2;
            this.addFloatingText('+2 LUCKY CORN!', c.x, c.y - 15, '#fde047');
          }
        }
        this.coinsEarnedThisLevel += earned;
        audio.playCoin();
        this.addCoinSparkles(c.x, c.y);
        this.callbacks.onStatsUpdate(p.health, this.coinsEarnedThisLevel, p.stage);

        // Track permanently finished coins for current and post-boss level replays
        const coinKey = `${this.level.id}_${c.id}`;
        const currentList = this.saveData.collectedCoinIds || [];
        if (!currentList.includes(coinKey)) {
          const nextList = [...currentList, coinKey];
          this.saveData.collectedCoinIds = nextList;
          this.callbacks.onSaveDataUpdate?.({ collectedCoinIds: nextList });
        }
      }
    });

    // Checkpoints (Guaranteed safe center standing position)
    this.level.checkpoints.forEach(cp => {
      if (!cp.reached) {
        const dist = Math.hypot(p.x + p.width / 2 - cp.x, p.y + p.height / 2 - cp.y);
        if (dist < 54) {
          cp.reached = true;
          const solidPlats = this.level.platforms.filter(pl => !pl.isMoving);
          const candidates = solidPlats.length > 0 ? solidPlats : this.level.platforms;
          const matchingPlats = candidates.filter(pl => pl.x <= cp.x + 60 && pl.x + pl.width >= cp.x - 60);
          let groundY = cp.y;
          let safeX = cp.x - p.width / 2;
          if (matchingPlats.length > 0) {
            matchingPlats.sort((a, b) => Math.abs(a.y - cp.y) - Math.abs(b.y - cp.y));
            const bestPlat = matchingPlats[0];
            groundY = bestPlat.y;
            const minSpawnX = Math.round(bestPlat.x + 16);
            const maxSpawnX = Math.max(minSpawnX, Math.round(bestPlat.x + bestPlat.width - p.width - 16));
            safeX = Math.max(minSpawnX, Math.min(maxSpawnX, Math.round(cp.x - p.width / 2)));
          }
          this.currentCheckpoint = { x: safeX, y: groundY - p.height };
          audio.playCheckpoint();
          this.addFloatingText('★ SAFE HAVEN CHECKPOINT! ★', cp.x, groundY - 45, '#4ade80');

          // Track permanently finished checkpoints for current and post-boss level replays
          const cpKey = `${this.level.id}_${cp.id}`;
          const currentCps = this.saveData.activatedCheckpointIds || [];
          if (!currentCps.includes(cpKey)) {
            const nextCps = [...currentCps, cpKey];
            this.saveData.activatedCheckpointIds = nextCps;
            this.callbacks.onSaveDataUpdate?.({ activatedCheckpointIds: nextCps });
          }
        }
      }
    });

    // Chests proximity opening (walk near)
    this.level.chests.forEach(chest => {
      if (!chest.opened) {
        const dist = Math.hypot(p.x + p.width / 2 - (chest.x + chest.width / 2), p.y + p.height / 2 - (chest.y + chest.height / 2));
        if (dist < 32) {
          this.openChest(chest);
        }
      }
    });
  }

  private openChest(chest: TreasureChest) {
    if (chest.opened) return;
    chest.opened = true;
    audio.playChest();

    if (chest.rewardType === 'coins') {
      this.coinsEarnedThisLevel += chest.rewardAmount;
      this.addFloatingText(`+${chest.rewardAmount} COINS!`, chest.x + chest.width / 2, chest.y - 24, '#facc15');
    } else if (chest.rewardType === 'heart') {
      this.player.health = Math.min(this.player.maxHealth, this.player.health + 1);
      this.addFloatingText('+1 HEART!', chest.x + chest.width / 2, chest.y - 24, '#f43f5e');
    } else if (chest.rewardType === 'iron_armor') {
      this.armorType = 'iron';
      this.addFloatingText('IRON ARMOR!', chest.x + chest.width / 2, chest.y - 24, '#e2e8f0');
    } else if (chest.rewardType === 'gold_armor') {
      this.armorType = 'gold';
      this.addFloatingText('GOLD ARMOR!', chest.x + chest.width / 2, chest.y - 24, '#fde047');
    } else if (chest.rewardType === 'diamond_armor') {
      this.armorType = 'diamond';
      this.addFloatingText('DIAMOND ARMOR!', chest.x + chest.width / 2, chest.y - 24, '#38bdf8');
      audio.playEvolution();
    } else if (chest.rewardType === 'iron_sword') {
      this.swordType = 'iron';
      this.addFloatingText('IRON SWORD!', chest.x + chest.width / 2, chest.y - 24, '#e2e8f0');
    } else if (chest.rewardType === 'gold_sword') {
      this.swordType = 'gold';
      this.addFloatingText('GOLD SWORD!', chest.x + chest.width / 2, chest.y - 24, '#fde047');
    } else if (chest.rewardType === 'diamond_sword') {
      this.swordType = 'diamond';
      this.addFloatingText('DIAMOND SWORD!', chest.x + chest.width / 2, chest.y - 24, '#38bdf8');
      audio.playEvolution();
    } else if (chest.rewardType === 'shield') {
      this.hasShield = true;
      this.player.hasShield = true;
      audio.playEvolution();
      this.addFloatingText('★ ROYAL SHIELD UNLOCKED! ★', chest.x + chest.width / 2, chest.y - 38, '#38bdf8');
      this.addFloatingText('PRESS C / S / DOWN / SHIELD TO DEFLECT FIRE!', chest.x + chest.width / 2, chest.y - 14, '#fde047');
      for (let s = 0; s < 25; s++) {
        this.particles.push({
          x: chest.x + chest.width / 2,
          y: chest.y + 10,
          vx: (Math.random() - 0.5) * 180,
          vy: -Math.random() * 150 - 40,
          size: 4 + Math.random() * 3,
          color: Math.random() > 0.4 ? '#38bdf8' : '#fde047',
          life: 0.8,
          maxLife: 0.8
        });
      }
    }

    this.callbacks.onStatsUpdate(
      this.player.health,
      this.coinsEarnedThisLevel,
      this.player.stage,
      this.armorType,
      this.swordType,
      this.hasShield
    );
  }

  public takeDamage(amount: number, dir: number) {
    if (this.player.invulnerableTimer > 0) return;

    // Armor damage reduction
    let actualDamage = amount;
    if (this.armorType === 'diamond') {
      actualDamage = Math.max(1, Math.floor(amount * 0.25));
    } else if (this.armorType === 'gold') {
      actualDamage = Math.max(1, Math.floor(amount * 0.5));
    } else if (this.armorType === 'iron' && amount > 1) {
      actualDamage = amount - 1;
    }

    // Shield block damage mitigation
    if (this.player.isBlocking) {
      actualDamage = Math.max(1, Math.floor(actualDamage * 0.5));
      audio.playShieldBlock();
    }

    // Difficulty Mode Modifiers (Easy / Normal / Hard)
    const difficulty = this.saveData.difficulty || 'normal';
    if (difficulty === 'easy') {
      actualDamage = Math.max(1, Math.floor(actualDamage * 0.5));
    } else if (difficulty === 'hard') {
      actualDamage = Math.max(1, Math.ceil(actualDamage * 1.5));
    }

    this.tookDamageThisLevel = true;
    this.player.health -= actualDamage;
    this.player.invulnerableTimer = difficulty === 'easy' ? 1.7 : (difficulty === 'hard' ? 0.9 : 1.2);
    this.player.knockbackTimer = 0.22;
    this.player.vx = dir * 200;
    this.player.vy = -260;
    audio.playHurt();

    this.callbacks.onStatsUpdate(this.player.health, this.coinsEarnedThisLevel, this.player.stage);

    if (this.player.health <= 0) {
      if (this.saveData.upgrades?.reviveToken && !this.reviveTokenUsed) {
        this.reviveTokenUsed = true;
        this.player.health = this.player.maxHealth;
        this.player.invulnerableTimer = 2.5;
        audio.playEvolution();
        this.addFloatingText('★ PHOENIX FEATHER REVIVAL! FULL HEALTH! ★', this.player.x + this.player.width / 2, this.player.y - 35, '#facc15');
        this.callbacks.onStatsUpdate(this.player.health, this.coinsEarnedThisLevel, this.player.stage);
        return;
      }
      this.handleGameOver();
    }
  }

  private handlePitFall() {
    this.tookDamageThisLevel = true;
    this.player.health -= 1;
    audio.playHurt();
    this.callbacks.onStatsUpdate(this.player.health, this.coinsEarnedThisLevel, this.player.stage);

    if (this.player.health <= 0) {
      if (this.saveData.upgrades?.reviveToken && !this.reviveTokenUsed) {
        this.reviveTokenUsed = true;
        this.player.health = this.player.maxHealth;
        this.player.invulnerableTimer = 2.5;
        audio.playEvolution();
        this.addFloatingText('★ PHOENIX FEATHER REVIVAL! FULL HEALTH! ★', this.player.x + this.player.width / 2, this.player.y - 35, '#facc15');
        this.callbacks.onStatsUpdate(this.player.health, this.coinsEarnedThisLevel, this.player.stage);
      } else {
        this.handleGameOver();
        return;
      }
    }

    // Respawn at safe checkpoint with firm footing
    const cp = this.currentCheckpoint || this.level.spawnPoint;
    this.player.x = cp.x;
    this.player.y = cp.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.onMovingPlatform = null;
    this.player.isJumping = false;
    this.player.isGrounded = true;
    this.player.invulnerableTimer = 2.5;
  }

  private handleGameOver() {
    this.isPaused = true;
    this.callbacks.onGameOver();
  }

  private handleLevelClear() {
    this.isPaused = true;
    audio.playLevelClear();

    if (!this.tookDamageThisLevel) {
      this.callbacks.onActionStat?.('levelsClearedWithoutDamage');
    }

    if (this.level.id === 30) {
      // Golden sword is featured exclusively in the end cutscene, retaining the player's real sword in inventory
      audio.playVictory();
      this.callbacks.onVictory(this.coinsEarnedThisLevel);
    } else {
      // Level 15 triggers Teen Chicken evolution inside World 4
      // World transitions (Levels 5, 9, 10, 19, 29) route to onLevelClear for automatic world waiting screen!
      const nextLevel = this.level.id + 1;
      if (nextLevel === 15) {
        this.callbacks.onEvolution('teen');
      } else {
        this.callbacks.onLevelClear(this.level.id, this.coinsEarnedThisLevel);
      }
    }
  }

  private updateCamera() {
    const targetX = this.player.x + this.player.width / 2 - this.canvasWidth / 2;
    const targetY = this.player.y + this.player.height / 2 - this.canvasHeight / 2;

    // Smooth camera lerp
    this.camera.x += (targetX - this.camera.x) * 0.12;
    this.camera.y += (targetY - this.camera.y) * 0.08;

    // Clamp within world bounds
    this.camera.x = Math.max(0, Math.min(this.camera.x, this.level.worldWidth - this.canvasWidth));
    this.camera.y = Math.max(0, Math.min(this.camera.y, this.level.worldHeight - this.canvasHeight));
  }

  // --- Particles & VFX ---

  private addDustPuff(x: number, y: number, count = 4) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y - 2,
        vx: (Math.random() - 0.5) * 40,
        vy: -Math.random() * 25,
        size: 3 + Math.random() * 3,
        color: '#e2e8f0',
        life: 0.35,
        maxLife: 0.35,
      });
    }
  }

  private addColorfulJumpDustBurst(x: number, y: number, count = 8) {
    const colors = ['#fde047', '#38bdf8', '#4ade80', '#f472b6', '#c084fc', '#fb923c', '#ffffff'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y - 2 - Math.random() * 4,
        vx: (Math.random() - 0.5) * 95,
        vy: -15 - Math.random() * 45,
        size: Math.random() > 0.35 ? 4 : 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0.3 + Math.random() * 0.14,
        maxLife: 0.44,
        gravity: 190,
      });
    }
  }

  private addDashAttackPixelTrail(count = 4) {
    const p = this.player;
    const tailDir = p.facing === 'right' ? -1 : 1;
    const originX = p.facing === 'right' ? p.x + 2 : p.x + p.width - 2;
    const originY = p.y + p.height * 0.55;
    const weaponColors =
      this.swordType === 'netherite'
        ? ['#c084fc', '#a855f7', '#f472b6', '#38bdf8', '#fde047', '#ffffff']
        : this.swordType === 'diamond'
        ? ['#38bdf8', '#22d3ee', '#818cf8', '#fde047', '#ffffff']
        : this.swordType === 'gold'
        ? ['#fde047', '#facc15', '#fb923c', '#f472b6', '#ffffff']
        : ['#f43f5e', '#fb923c', '#fde047', '#4ade80', '#38bdf8', '#c084fc', '#ffffff'];

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: originX + tailDir * (Math.random() * 10),
        y: originY + (Math.random() - 0.5) * (p.height * 0.72),
        vx: tailDir * (55 + Math.random() * 85),
        vy: (Math.random() - 0.5) * 50 - 10,
        size: Math.random() > 0.3 ? 4 : 3,
        color: weaponColors[Math.floor(Math.random() * weaponColors.length)],
        life: 0.24 + Math.random() * 0.12,
        maxLife: 0.36,
        gravity: 90,
      });
    }
  }

  private addCoinSparkles(x: number, y: number) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 80,
        vy: (Math.random() - 0.5) * 80,
        size: 3,
        color: '#fde047',
        life: 0.45,
        maxLife: 0.45,
      });
    }
  }

  private addDefeatExplosion(x: number, y: number) {
    const colors = ['#f87171', '#fb923c', '#facc15', '#ffffff'];
    for (let i = 0; i < 16; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 140,
        vy: (Math.random() - 0.5) * 140,
        size: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0.5,
        maxLife: 0.5,
      });
    }
  }

  private addFloatingText(text: string, x: number, y: number, color: string) {
    this.floatingTexts.push({
      id: Math.random().toString(),
      text,
      x,
      y,
      color,
      life: 0.9,
      maxLife: 0.9,
    });
  }

  private updateParticles(dt: number) {
    this.particles.forEach(p => {
      if (p.gravity) p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    });
    this.particles = this.particles.filter(p => p.life > 0);
  }

  private updateFloatingTexts(dt: number) {
    this.floatingTexts.forEach(ft => {
      ft.y -= 35 * dt;
      ft.life -= dt;
    });
    this.floatingTexts = this.floatingTexts.filter(ft => ft.life > 0);
  }
}
