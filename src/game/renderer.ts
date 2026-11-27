import { 
  PlayerState, Platform, Coin, TreasureChest, Checkpoint,
  VolcanoHazard, BoulderHazard, ThundercloudHazard, Enemy, Particle, FloatingText, Camera, LevelConfig,
  ChickenGender, ArmorType, SwordType, GrowthStage, CockatriceBoss, BossFireProjectile, SilkieSamFriend, FarmerMiniBoss
} from './types';
import { getSkinPalette } from './skins';
import { audio } from './audio';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private fenceGateStates: Map<string, { angle: number; vel: number; lastTime: number; isOpen: boolean; lastLatchSoundTime: number }> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Failed to get 2D canvas context');
    this.ctx = context;
    this.ctx.imageSmoothingEnabled = false;
  }

  public clear() {
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // --- Background: Biome Themes (Jungle at World 4, Snowy at World 5, Sunny Farm/Meadow) ---

  public renderBackground(
    theme: LevelConfig['theme'], 
    camera: Camera, 
    time: number, 
    levelId: number = 1, 
    isBossDefeated: boolean = false
  ) {
    if (theme === 'fields' || levelId === 30) {
      this.renderLevel30SanctuaryBackground(camera, time, isBossDefeated);
    } else if (theme === 'jungle') {
      this.renderJungleBackground(camera, time, levelId, isBossDefeated);
    } else if (theme === 'snowy' || theme === 'storm') {
      this.renderSnowyBackground(camera, time, levelId, isBossDefeated);
    } else {
      this.renderMeadowBackground(theme, camera, time, levelId, isBossDefeated);
    }
  }

  // World 4: Lush Tropical Jungle Biome with Sunbeams, Giant Ferns, Hanging Vines & Exotic Flora
  private renderJungleBackground(camera: Camera, time: number, levelId: number = 11, isBossDefeated: boolean = false) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. Sky Gradient: Turns Blue & Bright when the boss is defeated!
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    if (isBossDefeated) {
      skyGrad.addColorStop(0, '#0284c7');    // Sky blue
      skyGrad.addColorStop(0.35, '#38bdf8'); // Clear radiant azure
      skyGrad.addColorStop(0.68, '#7dd3fc'); // Soft cyan
      skyGrad.addColorStop(0.9, '#bae6fd');  // Bright sunlit atmosphere
      skyGrad.addColorStop(1, '#e0f2fe');    // Warm bright horizon
    } else {
      skyGrad.addColorStop(0, '#064e3b');   // Deep rainforest emerald
      skyGrad.addColorStop(0.35, '#065f46'); // Rich jungle green
      skyGrad.addColorStop(0.65, '#047857'); // Vibrant jade
      skyGrad.addColorStop(0.88, '#d97706'); // Warm tropical horizon glow
      skyGrad.addColorStop(1, '#92400e');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Warm Sunny Golden Sun
    const sunX = w * 0.75;
    const sunY = 90;
    ctx.fillStyle = isBossDefeated ? 'rgba(254, 240, 138, 0.35)' : 'rgba(251, 191, 36, 0.25)';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 80 + Math.sin(time * 2) * 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isBossDefeated ? '#fde047' : '#f59e0b';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 36, 0, Math.PI * 2);
    ctx.fill();

    if (isBossDefeated) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    // Diagonal Jungle Sunrays Cutting Through Mist
    ctx.save();
    ctx.fillStyle = 'rgba(254, 240, 138, 0.08)';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(sunX - 100 + i * 80, 0);
      ctx.lineTo(sunX - 300 + i * 120, h);
      ctx.lineTo(sunX - 220 + i * 120, h);
      ctx.lineTo(sunX - 60 + i * 80, 0);
      ctx.fill();
    }
    ctx.restore();

    // 3. Far Distant Misty Volcanic Jungle Ridges
    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 24) {
      const worldX = x + camera.x * 0.12;
      const ridgeY = h - 210 + Math.sin(worldX * 0.003) * 50 + Math.cos(worldX * 0.008) * 25;
      ctx.lineTo(x, ridgeY);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // 4. Mid Jungle Ridge with Ancient Massive Tropical Trees
    ctx.fillStyle = '#047857';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 20) {
      const worldX = x + camera.x * 0.25;
      const hillY = h - 145 + Math.sin(worldX * 0.004 + 1.5) * 35;
      ctx.lineTo(x, hillY);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Giant Jungle Trees & Tropical Palm Silhouettes with Monkeys!
    for (let i = 0; i < 7; i++) {
      const tx = (((i * 260) - (camera.x * 0.25)) % (w + 160)) - 60;
      const worldX = tx + camera.x * 0.25;
      const ty = h - 145 + Math.sin(worldX * 0.004 + 1.5) * 35;

      // Tree trunk
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(tx - 4, ty - 18, 8, 30);

      // Lush layered tropical palm crown
      ctx.fillStyle = '#065f46';
      ctx.beginPath();
      ctx.arc(tx, ty - 24, 28, 0, Math.PI * 2);
      ctx.arc(tx - 16, ty - 16, 20, 0, Math.PI * 2);
      ctx.arc(tx + 16, ty - 16, 20, 0, Math.PI * 2);
      ctx.fill();

      // Hanging tropical vines
      ctx.strokeStyle = '#022c22';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx - 10, ty - 12);
      ctx.bezierCurveTo(tx - 15, ty + 10, tx - 5, ty + 20, tx - 12, ty + 35);
      ctx.moveTo(tx + 12, ty - 12);
      ctx.bezierCurveTo(tx + 18, ty + 8, tx + 6, ty + 24, tx + 14, ty + 38);
      ctx.stroke();

      // Tropical pink & golden flower blooms
      ctx.fillStyle = i % 2 === 0 ? '#f43f5e' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(tx - 12, ty + 35, 3.5, 0, Math.PI * 2);
      ctx.arc(tx + 14, ty + 38, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // MONKEYS & BABY MONKEYS: Squeak in trees, climb down to walk/rest/eat bananas, and climb back up!
      if (i % 2 === 0 || i === 3) {
        const isScared = levelId === 19 && !isBossDefeated;
        const hasBaby = i === 0 || i === 3 || i === 4;

        if (isScared || isBossDefeated) {
          this.renderJungleMonkey(tx, ty - 22, time, isScared, i, isBossDefeated, i % 4);
          if (hasBaby) {
            const babyOffsetX = (i % 2 === 0) ? -14 : 14;
            this.renderJungleMonkey(tx + babyOffsetX, ty - 16, time + 0.4, isScared, i + 1, isBossDefeated, i % 4, {
              isBaby: true,
              activity: 'squeak',
              skipBranchOffset: true,
            });
          }
        } else {
          // 22-second autonomous primate routine staggered per tree
          const period = 22.0;
          const phase = (time + i * 5.3) % period;
          const roamDir: 1 | -1 = (i % 2 === 0) ? 1 : -1;
          const maxRoam = 56;
          const branchX = tx + ((i % 2 === 0) ? 12 : -12);
          const branchY = ty - 20;
          const trunkX = tx + roamDir * 5;

          const getRidgeYAt = (screenX: number) => {
            const wx = screenX + camera.x * 0.25;
            return h - 145 + Math.sin(wx * 0.004 + 1.5) * 35;
          };

          const computeMonkeyPose = (p: number) => {
            if (p < 5.5) {
              // Squeaking playfully up in the tree canopy
              return { x: branchX, y: branchY, activity: 'squeak' as const, facingDir: roamDir };
            } else if (p < 7.5) {
              // Climbing smoothly down the tree trunk
              const t = (p - 5.5) / 2.0;
              const groundAtTrunk = getRidgeYAt(trunkX) - 6;
              return {
                x: branchX + (trunkX - branchX) * t,
                y: branchY + (groundAtTrunk - branchY) * t,
                activity: 'climb' as const,
                facingDir: roamDir,
              };
            } else if (p < 11.5) {
              // Walking out along the jungle ridge floor
              const t = (p - 7.5) / 4.0;
              const curX = trunkX + roamDir * maxRoam * t;
              return {
                x: curX,
                y: getRidgeYAt(curX) - 6,
                activity: 'walk' as const,
                facingDir: roamDir,
              };
            } else if (p < 16.0) {
              // Resting or eating a banana on the jungle ridge
              const curX = trunkX + roamDir * maxRoam;
              const restCycle = Math.floor((time + i * 5.3) / period) + i;
              const act = (restCycle % 2 === 0) ? ('eat' as const) : ('rest' as const);
              return {
                x: curX,
                y: getRidgeYAt(curX) - 5,
                activity: act,
                facingDir: roamDir,
              };
            } else if (p < 19.5) {
              // Walking back toward the tree trunk
              const t = (p - 16.0) / 3.5;
              const curX = trunkX + roamDir * maxRoam * (1 - t);
              return {
                x: curX,
                y: getRidgeYAt(curX) - 6,
                activity: 'walk' as const,
                facingDir: (roamDir * -1) as 1 | -1,
              };
            } else {
              // Climbing back up into the canopy
              const t = (p - 19.5) / 2.5;
              const groundAtTrunk = getRidgeYAt(trunkX) - 6;
              return {
                x: trunkX + (branchX - trunkX) * t,
                y: groundAtTrunk + (branchY - groundAtTrunk) * t,
                activity: 'climb' as const,
                facingDir: (roamDir * -1) as 1 | -1,
              };
            }
          };

          const adultPose = computeMonkeyPose(phase);
          this.renderJungleMonkey(adultPose.x, adultPose.y, time, false, i, false, i % 4, {
            isBaby: false,
            activity: adultPose.activity,
            facingDir: adultPose.facingDir,
            skipBranchOffset: true,
          });

          if (hasBaby) {
            const babyPhase = (phase - 0.85 + period) % period;
            const babyPose = computeMonkeyPose(babyPhase);
            const sideGap = babyPose.activity === 'squeak' ? -roamDir * 13 : -roamDir * 14;
            const bx = babyPose.activity === 'climb' ? babyPose.x - roamDir * 3 : babyPose.x + sideGap;
            const by = babyPose.activity === 'squeak'
              ? babyPose.y + 4
              : (babyPose.activity === 'climb' ? babyPose.y + 8 : getRidgeYAt(bx) - 4);
            this.renderJungleMonkey(bx, by, time + 0.5, false, i + 2, false, i % 4, {
              isBaby: true,
              activity: babyPose.activity,
              facingDir: babyPose.facingDir,
              skipBranchOffset: true,
            });
          }
        }
      }
    }

    // In Level 19 (Last level of World 4): Foxes are chasing the monkeys in the background (stops upon defeat!)
    if (levelId === 19 && !isBossDefeated) {
      this.renderJungleFoxChase(w, h, camera, time);
    }

    // 5. Foreground Deep Emerald Jungle Undergrowth
    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 16) {
      const worldX = x + camera.x * 0.45;
      const fgY = h - 75 + Math.sin(worldX * 0.006 + 3) * 20;
      ctx.lineTo(x, fgY);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Jungle fern fronds along foreground
    for (let x = 0; x < w + 50; x += 25) {
      const worldX = x + camera.x * 0.45;
      const fgY = h - 75 + Math.sin(worldX * 0.006 + 3) * 20;
      const sway = Math.sin(time * 3 + x) * 3;

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x, fgY);
      ctx.lineTo(x + sway - 6, fgY - 14);
      ctx.moveTo(x, fgY);
      ctx.lineTo(x + sway + 6, fgY - 12);
      ctx.stroke();
    }

    // Glowing Jungle Fireflies & Floating Pollen Spores
    for (let i = 0; i < 15; i++) {
      const px = ((i * 110 + time * 30) % (w + 120)) - 50;
      const py = (i * 38 + Math.sin(time * 2.5 + i * 1.8) * 22) % (h - 80);
      const glow = 0.4 + Math.sin(time * 5 + i) * 0.35;
      ctx.fillStyle = `rgba(253, 224, 71, ${glow})`;
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Render Jungle Monkey (Adult or Baby) with autonomous activities: squeak, climb, walk, eat, rest
  public renderJungleMonkey(
    tx: number,
    ty: number,
    time: number,
    isScared: boolean,
    treeIndex: number,
    isCheering: boolean = false,
    variantIndex?: number,
    options?: {
      isBaby?: boolean;
      activity?: 'squeak' | 'climb' | 'walk' | 'eat' | 'rest';
      facingDir?: 1 | -1;
      skipBranchOffset?: boolean;
    }
  ) {
    const ctx = this.ctx;
    ctx.save();

    const isBaby = !!options?.isBaby;
    const activity = options?.activity ?? 'eat';
    const morph = ((variantIndex ?? treeIndex) % 4 + 4) % 4;
    const palettes = [
      // 0: White-Headed Capuchin
      { fur: '#5c2d16', furDark: '#3b1b0c', furLight: '#854d27', belly: '#fde6c4', face: '#fbd3a8', earInner: '#f4b6c2' },
      // 1: Golden Lion Tamarin
      { fur: '#d97706', furDark: '#92400e', furLight: '#fbbf24', belly: '#fef08a', face: '#b45309', earInner: '#fca5a5' },
      // 2: Chestnut Rhesus Macaque
      { fur: '#7c3f1d', furDark: '#4a210d', furLight: '#a16236', belly: '#e7d5c0', face: '#f5c2a8', earInner: '#f4acb7' },
      // 3: Dusky Spider Monkey
      { fur: '#292524', furDark: '#171412', furLight: '#57534e', belly: '#d6ccc2', face: '#a89f96', earInner: '#d4a5a5' },
    ];
    const p = palettes[morph];

    const branchOffset = options?.skipBranchOffset ? 0 : ((treeIndex % 2 === 0) ? 14 : -14);
    const mx = tx + branchOffset;
    const shudder = isScared ? Math.sin(time * 35 + treeIndex * 2) * 1.5 : 0;
    const cheerHop = isCheering ? Math.abs(Math.sin(time * 8 + treeIndex * 1.7)) * 7 : 0;
    const walkBob = (!isScared && !isCheering && activity === 'walk') ? Math.abs(Math.sin(time * 10 + treeIndex)) * 2.2 : 0;
    const squeakBob = (!isScared && !isCheering && activity === 'squeak') ? Math.abs(Math.sin(time * 7 + treeIndex)) * 1.8 : 0;
    const restBreath = (!isScared && !isCheering && activity === 'rest') ? Math.sin(time * 2.4 + treeIndex) * 0.7 : 0;
    const restDrop = (!isScared && !isCheering && activity === 'rest') ? 2.5 : 0;
    const my = ty + (options?.skipBranchOffset ? 0 : 4) + shudder - cheerHop - walkBob - squeakBob + restDrop + restBreath;

    ctx.translate(mx, my);
    const facing = options?.facingDir ?? ((treeIndex % 2 === 0) ? -1 : 1);
    const babyScale = isBaby ? 0.72 : 1.0;
    ctx.scale(facing * babyScale, babyScale);

    // Subtle ground shadow when on the jungle ridge
    if (!isScared && (activity === 'walk' || activity === 'eat' || activity === 'rest')) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(0, 9.5 + walkBob * 0.5, activity === 'rest' ? 9 : 7.5, 2.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 1. Prehensile Curly Tail with subtle highlight
    ctx.strokeStyle = p.furDark;
    ctx.lineWidth = isBaby ? 2.6 : 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const tailSpeed = isCheering ? 12 : (isScared ? 8 : (activity === 'walk' ? 7 : (activity === 'rest' ? 1.5 : 3.5)));
    const tailWiggle = Math.sin(time * tailSpeed + treeIndex) * (isScared ? 8 : (isCheering ? 7 : (activity === 'rest' ? 1.5 : 4)));
    if (activity === 'rest' && !isScared && !isCheering) {
      // Curled neatly around side while resting
      ctx.moveTo(-5, 4);
      ctx.bezierCurveTo(-13, 6, -13, -1 + tailWiggle * 0.4, -8, 1);
    } else {
      ctx.moveTo(-5, 3);
      ctx.bezierCurveTo(-14, 1 + tailWiggle, -19, -9, -13, -14);
    }
    ctx.stroke();
    ctx.strokeStyle = p.fur;
    ctx.lineWidth = isBaby ? 1.5 : 1.8;
    ctx.stroke();

    // 2. Muscular Primate Torso with layered fur shading
    const torsoTilt = activity === 'walk' ? 0.24 : (activity === 'rest' ? 0.14 : 0.05);
    const torsoRx = activity === 'rest' ? 7.6 : 6.8;
    const torsoRy = activity === 'rest' ? 7.4 : 8.8;
    ctx.fillStyle = p.furDark;
    ctx.beginPath();
    ctx.ellipse(-0.6, 0.8, torsoRx + 0.4, torsoRy + 0.4, torsoTilt + 0.03, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.fur;
    ctx.beginPath();
    ctx.ellipse(0, 0, torsoRx, torsoRy, torsoTilt, 0, Math.PI * 2);
    ctx.fill();
    // Shoulder coat sheen
    ctx.fillStyle = p.furLight;
    ctx.beginPath();
    ctx.ellipse(-2.5, -3.2, 3.2, 4.0, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Lighter chest/belly patch
    ctx.fillStyle = p.belly;
    ctx.beginPath();
    ctx.ellipse(2, 1.2, 4, activity === 'rest' ? 5.2 : 6.2, torsoTilt * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Feet / Legs adapted to current activity
    if (!isScared && !isCheering && activity === 'walk') {
      const stride = Math.sin(time * 10 + treeIndex) * 4.2;
      ctx.strokeStyle = p.furDark;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(-2, 6);
      ctx.lineTo(-3 - stride, 10.5);
      ctx.moveTo(2.5, 6);
      ctx.lineTo(3.5 + stride, 10.5);
      ctx.stroke();
      ctx.fillStyle = p.face;
      ctx.beginPath();
      ctx.ellipse(-3 - stride, 10.6, 2.4, 1.3, 0, 0, Math.PI * 2);
      ctx.ellipse(3.5 + stride, 10.6, 2.4, 1.3, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (!isScared && !isCheering && activity === 'climb') {
      const climbLeg = Math.sin(time * 11 + treeIndex) * 3.5;
      ctx.fillStyle = p.furDark;
      ctx.beginPath();
      ctx.ellipse(-2.5, 7.5 + climbLeg, 3, 1.8, 0.2, 0, Math.PI * 2);
      ctx.ellipse(3, 7.5 - climbLeg, 3, 1.8, -0.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (!isScared && !isCheering && activity === 'rest') {
      // Tucked cozy resting knees & feet
      ctx.fillStyle = p.furDark;
      ctx.beginPath();
      ctx.ellipse(-1, 7.2, 4.2, 2.2, 0.1, 0, Math.PI * 2);
      ctx.ellipse(4.2, 7.2, 3.6, 2.0, -0.1, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Gripping hind feet perched on branch
      ctx.fillStyle = p.furDark;
      ctx.beginPath();
      ctx.ellipse(-2.5, 8.8, 3.2, 1.8, 0.1, 0, Math.PI * 2);
      ctx.ellipse(3, 8.8, 3.2, 1.8, -0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Expressive Primate Head & Ruff (babies have proportionally larger adorable heads & ears)
    const headScale = isBaby ? 1.15 : 1.0;
    const headY = isScared ? -9.2 : (activity === 'rest' ? -6.4 : -8.2);
    const headX = activity === 'walk' ? 1.4 : 0;

    ctx.save();
    ctx.translate(headX, headY);
    ctx.scale(headScale, headScale);

    if (morph === 1) {
      // Golden Lion Tamarin radiant mane ruff
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 8.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = p.furDark;
    ctx.beginPath();
    ctx.arc(0, 0.4, 6.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.fur;
    ctx.beginPath();
    ctx.arc(0, 0, 6.3, 0, Math.PI * 2);
    ctx.fill();

    // Crown fur tuft (extra fluffy on babies!)
    ctx.fillStyle = p.furLight;
    ctx.beginPath();
    ctx.ellipse(-0.5, -4.8, isBaby ? 4.4 : 4, isBaby ? 2.5 : 2, -0.1, 0, Math.PI * 2);
    ctx.fill();
    if (isBaby) {
      ctx.beginPath();
      ctx.arc(0.5, -6.8, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Round ears with inner shell (slightly larger on babies)
    const earR = isBaby ? 2.9 : 2.5;
    ctx.fillStyle = p.fur;
    ctx.beginPath();
    ctx.arc(-5.8, -0.8, earR, 0, Math.PI * 2);
    ctx.arc(5.8, -0.8, earR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.earInner;
    ctx.beginPath();
    ctx.arc(-5.8, -0.8, earR * 0.58, 0, Math.PI * 2);
    ctx.arc(5.8, -0.8, earR * 0.58, 0, Math.PI * 2);
    ctx.fill();

    // Realistic facial mask & brow
    ctx.fillStyle = p.face;
    ctx.beginPath();
    ctx.arc(-1.8, -0.8, 3, 0, Math.PI * 2);
    ctx.arc(1.8, -0.8, 3, 0, Math.PI * 2);
    ctx.ellipse(0, 1.8, 3.8, 3.1, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tiny nostrils
    ctx.fillStyle = p.furDark;
    ctx.fillRect(-0.9, 0.6, 0.7, 0.7);
    ctx.fillRect(0.4, 0.6, 0.7, 0.7);

    if (isCheering) {
      // VICTORY CHEERING MONKEY
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(-2.2, -1, 1.6, 0.2, Math.PI - 0.2);
      ctx.arc(2.2, -1, 1.6, 0.2, Math.PI - 0.2);
      ctx.stroke();

      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.arc(0, 1.8, 2.8, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(0, 3.2, 1.4, 0, Math.PI);
      ctx.fill();

      ctx.fillStyle = 'rgba(244, 114, 182, 0.65)';
      ctx.beginPath();
      ctx.arc(-4, 1.2, 1.3, 0, Math.PI * 2);
      ctx.arc(4, 1.2, 1.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (isScared) {
      // Scared Monkey (Level 19)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-2.5, -1.5, 2.2, 0, Math.PI * 2);
      ctx.arc(2.5, -1.5, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-2.5, -1.5, 0.8, 0, Math.PI * 2);
      ctx.arc(2.5, -1.5, 0.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.ellipse(0, 2.2, 1.8, 2.8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(7, -6, 1.5, 0, Math.PI * 2);
      ctx.arc(-8, -5, 1.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (activity === 'rest') {
      // Peaceful sleeping / resting expression
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(-2.0, -0.8, 1.3, 0.15, Math.PI - 0.15);
      ctx.arc(2.0, -0.8, 1.3, 0.15, Math.PI - 0.15);
      ctx.stroke();

      // Gentle serene smile
      ctx.strokeStyle = p.furDark;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 1.9, 1.4, 0.25, Math.PI - 0.25);
      ctx.stroke();
    } else {
      // Curious dark glossy eyes (bigger on babies)
      const eyeR = isBaby ? 1.35 : 1.05;
      const isBlink = (time + treeIndex * 1.1) % 4.2 < 0.14;
      if (isBlink) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(-3.2, -1); ctx.lineTo(-0.8, -1);
        ctx.moveTo(0.8, -1); ctx.lineTo(3.2, -1);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(-2, -1, eyeR, 0, Math.PI * 2);
        ctx.arc(2, -1, eyeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-1.7, -1.6, 0.6, 0.6);
        ctx.fillRect(2.3, -1.6, 0.6, 0.6);
      }

      if (activity === 'squeak' && Math.sin(time * 9 + treeIndex) > 0.05) {
        // Chirping / squeaking open oval mouth!
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.ellipse(0, 2.3, 1.4, 1.9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(0, 3.1, 0.8, 0, Math.PI);
        ctx.fill();
      } else if (activity === 'eat') {
        // Chewing banana rhythm
        const chewOpen = Math.abs(Math.sin(time * 11 + treeIndex)) * 1.1;
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.ellipse(0, 2.1, 1.5, 0.7 + chewOpen, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Cute friendly smile
        ctx.strokeStyle = p.furDark;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 1.5, 1.8, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }

      if (isBaby) {
        // Cute rosy baby cheeks
        ctx.fillStyle = 'rgba(244, 114, 182, 0.45)';
        ctx.beginPath();
        ctx.arc(-3.6, 1.1, 1.1, 0, Math.PI * 2);
        ctx.arc(3.6, 1.1, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore(); // restore head transform

    // 4. Arms, Props & Floating Expressions
    if (isCheering) {
      const armWave = Math.sin(time * 12 + treeIndex) * 3;
      ctx.strokeStyle = p.fur;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-3, -3);
      ctx.lineTo(-7 + armWave, -15);
      ctx.moveTo(3, -3);
      ctx.lineTo(7 - armWave, -15);
      ctx.stroke();

      ctx.fillStyle = p.face;
      ctx.beginPath();
      ctx.arc(-7 + armWave, -15, 1.8, 0, Math.PI * 2);
      ctx.arc(7 - armWave, -15, 1.8, 0, Math.PI * 2);
      ctx.fill();

      const symIdx = (treeIndex + Math.floor(time * 2.2)) % 3;
      const symY = headY - 16 - Math.sin(time * 5 + treeIndex) * 5;
      ctx.save();
      ctx.scale(facing, 1); // keep symbols upright
      ctx.font = '700 9px "Silkscreen", monospace';
      ctx.textAlign = 'center';
      if (symIdx === 0) {
        ctx.fillStyle = '#f43f5e';
        ctx.fillText('♥', 0, symY);
      } else if (symIdx === 1) {
        ctx.fillStyle = '#facc15';
        ctx.fillText('★', 0, symY);
      } else {
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('♪', 0, symY);
      }
      ctx.restore();
    } else if (isScared) {
      const armWave = Math.sin(time * 25 + treeIndex) * 3;
      ctx.strokeStyle = p.fur;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-4, -4);
      ctx.lineTo(-8 + armWave, -14);
      ctx.moveTo(4, -4);
      ctx.lineTo(8 - armWave, -14);
      ctx.stroke();

      // Dropped banana tumbling down
      const tumbleY = (time * 60 + treeIndex * 20) % 45;
      ctx.save();
      ctx.translate(0, tumbleY);
      ctx.rotate(time * 8);
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0.4, 2.2);
      ctx.stroke();
      ctx.restore();
    } else if (activity === 'squeak') {
      // One paw perched, one paw waving playfully while squeaking in the tree!
      const wave = Math.sin(time * 10 + treeIndex) * 2.5;
      ctx.strokeStyle = p.fur;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-3, -2);
      ctx.lineTo(-6, 3);
      ctx.moveTo(3, -2);
      ctx.lineTo(7, -8 + wave);
      ctx.stroke();
      ctx.fillStyle = p.face;
      ctx.beginPath();
      ctx.arc(7, -8 + wave, 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Floating playful squeak chirps ("eek!" / "ooh!" / ♪)
      const squeakPulse = (time * 1.4 + treeIndex * 0.7) % 2.2;
      if (squeakPulse < 1.35) {
        const rise = squeakPulse * 8;
        const alpha = Math.sin((squeakPulse / 1.35) * Math.PI);
        ctx.save();
        ctx.scale(facing, 1); // ensure readable text regardless of facing
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.font = isBaby ? '700 7px "Silkscreen", monospace' : '700 8px "Silkscreen", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fef08a';
        const chirpLabel = isBaby ? 'pip!♪' : ((treeIndex % 2 === 0) ? 'eek!♪' : 'ooh!♪');
        ctx.fillText(chirpLabel, 0, headY - 12 - rise);
        ctx.restore();
      }
    } else if (activity === 'climb') {
      // Alternating climbing arms gripping trunk
      const reach = Math.sin(time * 11 + treeIndex) * 4.5;
      ctx.strokeStyle = p.fur;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-3, -3);
      ctx.lineTo(-5, -10 + reach);
      ctx.moveTo(3, -3);
      ctx.lineTo(5, -10 - reach);
      ctx.stroke();
      ctx.fillStyle = p.face;
      ctx.beginPath();
      ctx.arc(-5, -10 + reach, 1.5, 0, Math.PI * 2);
      ctx.arc(5, -10 - reach, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (activity === 'walk') {
      // Natural swinging arms while walking across the jungle floor
      const swing = Math.sin(time * 10 + treeIndex) * 3.8;
      ctx.strokeStyle = p.fur;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-2, -2);
      ctx.lineTo(-3 + swing, 4.5);
      ctx.moveTo(3, -2);
      ctx.lineTo(4 - swing, 4.5);
      ctx.stroke();
      ctx.fillStyle = p.face;
      ctx.beginPath();
      ctx.arc(-3 + swing, 4.8, 1.5, 0, Math.PI * 2);
      ctx.arc(4 - swing, 4.8, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (activity === 'rest') {
      // Arms folded peacefully across lap
      ctx.strokeStyle = p.fur;
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.moveTo(-4, -1);
      ctx.quadraticCurveTo(0, 4, 4, 2);
      ctx.stroke();
      // Tiny sleepy floating "z"
      const zCycle = (time * 0.9 + treeIndex) % 2.4;
      if (zCycle < 1.6) {
        ctx.save();
        ctx.scale(facing, 1);
        ctx.globalAlpha = Math.sin((zCycle / 1.6) * Math.PI) * 0.85;
        ctx.fillStyle = '#e0f2fe';
        ctx.font = '700 7px "Silkscreen", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('z', 4, headY - 9 - zCycle * 6);
        ctx.restore();
      }
    } else {
      // Eating a bright yellow banana!
      const lift = Math.sin(time * 6 + treeIndex) * 1.4;
      ctx.fillStyle = p.fur;
      ctx.fillRect(-2, -3, 3, 5);
      ctx.fillRect(1, -3 - lift * 0.5, 3, 5);

      // Peeled bright yellow banana lifted toward mouth
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(2.5, -2 - lift, 4.2, 0.35, 2.25);
      ctx.stroke();
      // Creamy banana fruit tip
      ctx.fillStyle = '#fef9c3';
      ctx.beginPath();
      ctx.arc(5.8, -3.5 - lift, 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.fillRect(3.6, 0.8 - lift, 1.1, 1.1);
    }

    ctx.restore();
  }

  // Level 19: Foxes Chasing the Monkeys in Background Jungle Ridge
  private renderJungleFoxChase(w: number, h: number, camera: Camera, time: number) {
    const ctx = this.ctx;
    for (let f = 0; f < 3; f++) {
      const cycleSpeed = time * 130 + f * 240;
      const fx = (((cycleSpeed) - (camera.x * 0.25)) % (w + 200)) - 80;
      const worldX = fx + camera.x * 0.25;
      const baseY = h - 145 + Math.sin(worldX * 0.004 + 1.5) * 35;
      const jumpY = Math.abs(Math.sin(time * 10 + f * 2.2)) * 14;
      const fy = baseY - jumpY;

      ctx.save();
      ctx.translate(fx, fy);

      // Exact same fox model as the in-game combat fox with natural coat morphs!
      this.drawFoxSprite(ctx, 36, 24, false, time * 1.5 + f * 0.5, 1.0, f % 4);

      // Dust puff behind sprinting fox
      ctx.fillStyle = 'rgba(217, 119, 6, 0.45)';
      ctx.beginPath();
      ctx.arc(-16, 6, 4 + Math.sin(time * 12 + f) * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // World 5: Freezing Arctic Alpine Snowy Mountain Biome with Aurora Borealis & Falling Snowflakes
  private renderSnowyBackground(camera: Camera, time: number, levelId: number = 20, isBossDefeated: boolean = false) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. Sky Gradient: Turns Blue & Bright when the boss is defeated!
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    if (isBossDefeated) {
      skyGrad.addColorStop(0, '#0284c7');   // Sky blue
      skyGrad.addColorStop(0.35, '#38bdf8'); // Clear radiant azure
      skyGrad.addColorStop(0.68, '#7dd3fc'); // Soft icy cyan
      skyGrad.addColorStop(0.9, '#bae6fd');  // Crisp sunlit atmosphere
      skyGrad.addColorStop(1, '#e0f2fe');    // Bright snowy horizon
    } else {
      skyGrad.addColorStop(0, '#020617');   // Dark polar night
      skyGrad.addColorStop(0.35, '#0f172a'); // Deep slate
      skyGrad.addColorStop(0.68, '#1e293b'); // Cold twilight
      skyGrad.addColorStop(0.88, '#0e7490'); // Icy cyan glow
      skyGrad.addColorStop(1, '#38bdf8');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Bright Sunny Daylight Sun when boss is defeated!
    if (isBossDefeated) {
      const sunX = w * 0.8;
      const sunY = 75;
      ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 70 + Math.sin(time * 2) * 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 34, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 18, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 2. Animated Aurora Borealis (Northern Lights) Shimmering Bands (during twilight/night)
      ctx.save();
      for (let b = 0; b < 3; b++) {
        const grad = ctx.createLinearGradient(0, 20 + b * 35, 0, 160 + b * 40);
        if (b === 0) {
          grad.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
          grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        } else if (b === 1) {
          grad.addColorStop(0, 'rgba(52, 211, 153, 0.24)');
          grad.addColorStop(1, 'rgba(52, 211, 153, 0)');
        } else {
          grad.addColorStop(0, 'rgba(168, 85, 247, 0.2)');
          grad.addColorStop(1, 'rgba(168, 85, 247, 0)');
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, 160);
        for (let x = 0; x <= w; x += 30) {
          const ay = 40 + b * 30 + Math.sin(time * 1.5 + x * 0.005 + b * 2) * 28 + Math.cos(time * 0.8 + x * 0.009) * 16;
          ctx.lineTo(x, ay);
        }
        ctx.lineTo(w, 170);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // 3. Distant Colossal Snow-Capped Jagged Mountain Peaks
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 30) {
      const worldX = x + camera.x * 0.08;
      const peakY = h - 230 + Math.sin(worldX * 0.0025) * 75 + Math.cos(worldX * 0.006) * 35;
      ctx.lineTo(x, peakY);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Snowy Glaciers & White Mountain Peaks
    ctx.fillStyle = '#e2e8f0';
    for (let x = 0; x <= w; x += 60) {
      const worldX = x + camera.x * 0.08;
      const peakY = h - 230 + Math.sin(worldX * 0.0025) * 75 + Math.cos(worldX * 0.006) * 35;
      ctx.beginPath();
      ctx.moveTo(x, peakY);
      ctx.lineTo(x - 22, peakY + 45);
      ctx.lineTo(x + 22, peakY + 45);
      ctx.closePath();
      ctx.fill();
    }

    // 4. Mid Alpine Ridge with Snow-Laden Evergreen Pine Trees
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 20) {
      const worldX = x + camera.x * 0.22;
      const hillY = h - 140 + Math.sin(worldX * 0.0042 + 1.8) * 32;
      ctx.lineTo(x, hillY);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Snow-Dusted Pine Trees
    for (let i = 0; i < 8; i++) {
      const tx = (((i * 240) - (camera.x * 0.22)) % (w + 160)) - 40;
      const worldX = tx + camera.x * 0.22;
      const ty = h - 140 + Math.sin(worldX * 0.0042 + 1.8) * 32;

      // Dark tree trunk
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(tx - 3, ty - 6, 6, 16);

      // Deep evergreen layers
      ctx.fillStyle = '#0f766e';
      ctx.beginPath();
      ctx.moveTo(tx, ty - 38);
      ctx.lineTo(tx + 16, ty - 6);
      ctx.lineTo(tx - 16, ty - 6);
      ctx.closePath();
      ctx.fill();

      // Heavy White Snow Blankets on Pine Branches
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(tx, ty - 38);
      ctx.lineTo(tx + 9, ty - 22);
      ctx.lineTo(tx - 9, ty - 22);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(tx - 14, ty - 10);
      ctx.lineTo(tx + 14, ty - 10);
      ctx.lineTo(tx + 16, ty - 6);
      ctx.lineTo(tx - 16, ty - 6);
      ctx.closePath();
      ctx.fill();
    }

    // 5. Foreground Pure White Snowdrifts
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 16) {
      const worldX = x + camera.x * 0.45;
      const fgY = h - 80 + Math.sin(worldX * 0.0055 + 2.5) * 22;
      ctx.lineTo(x, fgY);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Snow surface gleam
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 16) {
      const worldX = x + camera.x * 0.45;
      const fgY = h - 85 + Math.sin(worldX * 0.0055 + 2.5) * 22;
      ctx.lineTo(x, fgY);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // World 5 Background Snowshoe Hares & Level 29 Bear Chase (stops upon defeat!)
    if (levelId === 29 && !isBossDefeated) {
      this.renderSnowyBearHareChase(w, h, camera, time);
    } else {
      this.renderSnowshoeHares(w, h, camera, time, isBossDefeated);
    }

    // 6. Dynamic Animated Snowflakes (Multi-layered parallax snowfall)
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 45; i++) {
      const speed = 40 + (i % 4) * 30;
      const size = 1.5 + (i % 3) * 1.5;
      const drift = Math.sin(time * 2 + i) * 24;
      const sx = ((i * 73 + time * 18 + drift - camera.x * 0.1) % (w + 40)) - 20;
      const sy = (i * 28 + time * speed) % h;

      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // World 5: Autonomous Snowshoe Hares & Baby Leverets (hopping/walking, digging snow for hidden grass, eating, and resting)
  private renderSnowshoeHares(w: number, h: number, camera: Camera, time: number, isCheering: boolean = false) {
    const ctx = this.ctx;
    const span = w + 240;

    for (let i = 0; i < 4; i++) {
      const period = 22.0;
      const phase = (time + i * 5.6) % period;
      const roamDir: 1 | -1 = (i % 2 === 0) ? 1 : -1;
      const roamDist = 68;

      let activity: 'hop' | 'dig' | 'eat' | 'rest' = 'hop';
      let offsetX = 0;
      let facing: 1 | -1 = roamDir;

      if (isCheering) {
        activity = 'hop';
        offsetX = 0;
      } else if (phase < 5.0) {
        // Walking / bounding across the snowdrift
        const t = phase / 5.0;
        offsetX = roamDir * roamDist * t;
        activity = 'hop';
        facing = roamDir;
      } else if (phase < 9.2) {
        // Digging in the snow to reveal hidden grass
        offsetX = roamDir * roamDist;
        activity = 'dig';
        facing = roamDir;
      } else if (phase < 14.2) {
        // Eating the freshly uncovered green alpine grass
        offsetX = roamDir * roamDist;
        activity = 'eat';
        facing = roamDir;
      } else if (phase < 18.2) {
        // Resting cozy in the snow
        offsetX = roamDir * roamDist;
        activity = 'rest';
        facing = roamDir;
      } else {
        // Hopping back across the snowbank
        const t = (phase - 18.2) / 3.8;
        offsetX = roamDir * roamDist * (1 - t);
        activity = 'hop';
        facing = (roamDir * -1) as 1 | -1;
      }

      const rawX = i * 260 + 90 + offsetX - camera.x * 0.45;
      const hx = (((rawX % span) + span) % span) - 60;
      if (hx < -70 || hx > w + 70) continue;

      const worldX = hx + camera.x * 0.45;
      const groundY = h - 85 + Math.sin(worldX * 0.0055 + 2.5) * 22;
      const hopSpeed = isCheering ? 6.2 : 5.0;
      const hopHeight = isCheering ? 24 : 11;
      const hopCycle = (activity === 'hop' || isCheering) ? Math.abs(Math.sin(time * hopSpeed + i * 1.7)) : 0;
      const hy = groundY - hopCycle * hopHeight;

      ctx.save();
      ctx.translate(hx, hy);
      ctx.scale(facing, 1);
      this.drawSnowshoeHareSprite(ctx, time + i * 0.7, 1.0, isCheering, i % 3, false, activity);

      // Snow landing dust when hopping
      if ((activity === 'hop' || isCheering) && hopCycle < 0.16) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fillRect(-6, 7, 14, 2);
      }

      if (isCheering) {
        ctx.save();
        ctx.scale(facing, 1);
        const symIdx = (i + Math.floor(time * 2.2)) % 3;
        const symY = -22 - Math.sin(time * 5 + i) * 6;
        ctx.font = '700 9px "Silkscreen", monospace';
        ctx.textAlign = 'center';
        if (symIdx === 0) {
          ctx.fillStyle = '#f43f5e';
          ctx.fillText('♥', 0, symY);
        } else if (symIdx === 1) {
          ctx.fillStyle = '#facc15';
          ctx.fillText('★', 0, symY);
        } else {
          ctx.fillStyle = '#38bdf8';
          ctx.fillText('♪', 0, symY);
        }
        ctx.restore();
      }
      ctx.restore();

      // Baby Snowshoe Leveret accompanying Hares #0 and #2!
      if (i === 0 || i === 2) {
        const babyGap = activity === 'eat' ? 18 : -facing * 20;
        const bx = hx + babyGap;
        const bWorldX = bx + camera.x * 0.45;
        const bGroundY = h - 85 + Math.sin(bWorldX * 0.0055 + 2.5) * 22 + 3;
        const babyActivity: 'hop' | 'dig' | 'eat' | 'rest' = isCheering ? 'hop' : activity;
        const bHop = (babyActivity === 'hop' || isCheering) ? Math.abs(Math.sin(time * (hopSpeed + 1.2) + i * 2.3)) : 0;
        const by = bGroundY - bHop * (isCheering ? 16 : 8);
        const babyFacing: 1 | -1 = activity === 'eat' ? (facing * -1 as 1 | -1) : facing;

        ctx.save();
        ctx.translate(bx, by);
        ctx.scale(babyFacing, 1);
        this.drawSnowshoeHareSprite(ctx, time + i * 1.1 + 0.5, 0.95, isCheering, i % 3, true, babyActivity);
        ctx.restore();
      }
    }
  }

  // Level 29: Fierce Bears Chasing Snowshoe Hares & Catching Them
  private renderSnowyBearHareChase(w: number, h: number, camera: Camera, time: number) {
    const ctx = this.ctx;
    const cyclePeriod = 8.0;
    const cycleTime = time % cyclePeriod;
    const isCatching = cycleTime >= 5.2 && cycleTime <= 7.2;

    // 1. Chased Panicked Snowshoe Hares
    for (let i = 0; i < 3; i++) {
      // If caught hare during catch phase, hide it as it's in the dust cloud
      if (i === 0 && isCatching) continue;

      const speed = 160 + i * 20;
      const hx = (((cycleTime * speed + i * 110 + 200) - (camera.x * 0.45)) % (w + 280)) - 80;
      if (hx < -80 || hx > w + 80) continue;
      const worldX = hx + camera.x * 0.45;
      const groundY = h - 85 + Math.sin(worldX * 0.0055 + 2.5) * 22;
      const hop = Math.abs(Math.sin(time * 12 + i * 2)) * 26;
      const hy = groundY - hop;

      ctx.save();
      ctx.translate(hx, hy);

      // Fluffy white body
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, 0, 9.5, 7.5, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Ears pinned flat backwards in sheer terror!
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-7, -4, 8, 2.2, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a'; // black tips
      ctx.fillRect(-15, -6, 4, 2.5);

      // Wide terrified eyes with pinhead pupils!
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(6, -4, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(6.5, -4, 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Screaming mouth
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(8, -1.5, 2, 2.5);

      // Sweat droplets flying off
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-4, -8, 1.5, 2);
      ctx.fillRect(-7, -10, 1.5, 2);

      ctx.restore();
    }

    // 2. Colossal Charging Grizzly Bears
    for (let b = 0; b < 2; b++) {
      const bSpeed = 150 + b * 10;
      const bx = (((cycleTime * bSpeed + b * 160 + 50) - (camera.x * 0.45)) % (w + 300)) - 100;
      if (bx < -100 || bx > w + 100) continue;
      const worldX = bx + camera.x * 0.45;
      const groundY = h - 85 + Math.sin(worldX * 0.0055 + 2.5) * 22;
      const gallop = Math.sin(time * 10 + b * 2) * 6;
      const by = groundY - 10 + gallop;

      ctx.save();
      ctx.translate(bx, by);

      // Exact same bear model as the in-game combat bear with natural coat morphs!
      this.drawBearSprite(ctx, 48, 32, false, time * 1.5 + b, 1.05, b % 4);

      // Steaming frosty breath in the freezing air
      ctx.fillStyle = 'rgba(224, 242, 254, 0.65)';
      ctx.beginPath();
      ctx.arc(32, -10, 4 + Math.sin(time * 12) * 2, 0, Math.PI * 2);
      ctx.arc(38, -13, 6, 0, Math.PI * 2);
      ctx.fill();

      // Massive snow spray kicked up
      const stride = Math.sin(time * 14 + b) * 12;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(-22, 6, 6 + Math.abs(stride) * 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 3. Comic Catching & Eating Animation!
    if (isCatching) {
      const catchBaseX = (((cycleTime * 170 + 200) - (camera.x * 0.45)) % (w + 280)) - 80;
      const worldX = catchBaseX + camera.x * 0.45;
      const groundY = h - 85 + Math.sin(worldX * 0.0055 + 2.5) * 22;

      ctx.save();
      ctx.translate(catchBaseX, groundY - 14);

      // Big cartoon snow explosion cloud!
      const puffScale = 1 + Math.sin((cycleTime - 5.2) * 10) * 0.2;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 22 * puffScale, 0, Math.PI * 2);
      ctx.arc(-14, -8, 16 * puffScale, 0, Math.PI * 2);
      ctx.arc(14, -8, 16 * puffScale, 0, Math.PI * 2);
      ctx.arc(0, -18, 18 * puffScale, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Flying snow particles & white bunny fur tufts
      for (let p = 0; p < 8; p++) {
        const pAngle = p * (Math.PI / 4) + cycleTime * 5;
        const pDist = 26 + (p % 3) * 8;
        const px = Math.cos(pAngle) * pDist;
        const py = Math.sin(pAngle) * pDist * 0.8;
        ctx.fillStyle = p % 2 === 0 ? '#ffffff' : '#fbcfe8';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Comic "CHOMP!" starburst badge
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      for (let s = 0; s < 10; s++) {
        const sAngle = (s / 10) * Math.PI * 2;
        const sR = (s % 2 === 0) ? 18 : 9;
        const sx = Math.cos(sAngle) * sR;
        const sy = Math.sin(sAngle) * sR - 10;
        if (s === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.fill();

      // "CHOMP!" text
      ctx.fillStyle = '#b91c1c';
      ctx.font = '700 8px "Silkscreen", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CHOMP!', 0, -8);

      ctx.restore();
    }
  }

  // ================= LEVEL 30: THE GRAND PARADISE SANCTUARY =================
  // Rich carpet of flowers, waterfalls, rivers, ponds, butterflies, dragonflies, bees & ladybugs!
  private renderLevel30SanctuaryBackground(camera: Camera, time: number, isBossDefeated: boolean = false) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    if (!isBossDefeated) {
      // =========================================================================
      // STAGE 30: TERRIFYING BLOOD-RED NIGHTMARE REALM (BEFORE BOSS DEFEAT)
      // =========================================================================

      // 1. Abyssal Blood-Crimson Nightmare Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#070102');     // Void pitch-crimson zenith
      skyGrad.addColorStop(0.22, '#2a0307');  // Deep arterial blood
      skyGrad.addColorStop(0.50, '#5c070e');  // Sinister dark scarlet
      skyGrad.addColorStop(0.76, '#991b1b');  // Blazing blood red
      skyGrad.addColorStop(1, '#dc2626');     // Burning crimson horizon
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Periodic Eerie Crimson Lightning Flash tearing across the nightmare sky
      const stormCycle = (time * 0.65) % 4.6;
      const lightningAlpha =
        (stormCycle > 3.9 && stormCycle < 4.02) || (stormCycle > 4.12 && stormCycle < 4.22)
          ? 0.24
          : 0;
      if (lightningAlpha > 0) {
        ctx.fillStyle = `rgba(254, 100, 100, ${lightningAlpha})`;
        ctx.fillRect(0, 0, w, h);

        // Jagged forked crimson-white sky lightning bolt
        const boltX = w * 0.28 + Math.sin(Math.floor(time) * 7) * 90;
        ctx.strokeStyle = 'rgba(254, 202, 202, 0.92)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(boltX, 0);
        ctx.lineTo(boltX - 18, 52);
        ctx.lineTo(boltX + 12, 95);
        ctx.lineTo(boltX - 24, 152);
        ctx.lineTo(boltX + 4, 210);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.lineWidth = 5;
        ctx.stroke();
      }

      // 2. Ominous Pulsing Blood-Red Eclipse
      const sunX = w * 0.75;
      const sunY = 92;
      const pulse = Math.sin(time * 2.8) * 10;

      // Sinister rotating blood rays radiating from the eclipse
      ctx.save();
      ctx.translate(sunX, sunY);
      ctx.rotate(-time * 0.08);
      for (let i = 0; i < 14; i++) {
        const angle = (i / 14) * Math.PI * 2;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(220, 38, 38, 0.20)' : 'rgba(127, 29, 29, 0.16)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle - 0.07) * (w + h), Math.sin(angle - 0.07) * (w + h));
        ctx.lineTo(Math.cos(angle + 0.07) * (w + h), Math.sin(angle + 0.07) * (w + h));
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Outer crimson blood aura
      const coronaGrad = ctx.createRadialGradient(sunX, sunY, 32, sunX, sunY, 130 + pulse);
      coronaGrad.addColorStop(0, 'rgba(239, 68, 68, 0.95)');
      coronaGrad.addColorStop(0.32, 'rgba(185, 28, 28, 0.72)');
      coronaGrad.addColorStop(0.68, 'rgba(127, 29, 29, 0.34)');
      coronaGrad.addColorStop(1, 'rgba(30, 4, 6, 0)');
      ctx.fillStyle = coronaGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 130 + pulse, 0, Math.PI * 2);
      ctx.fill();

      // Blazing red eclipse ring
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fca5a5';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 40, 0, Math.PI * 2);
      ctx.fill();

      // Pitch-black void core eclipsing the blood moon
      ctx.fillStyle = '#090103';
      ctx.beginPath();
      ctx.arc(sunX - 2, sunY + 1, 35, 0, Math.PI * 2);
      ctx.fill();

      // Sinister glowing red slit eye pulsing faintly inside the dark eclipse!
      const eyeGlow = 0.35 + Math.sin(time * 3.5) * 0.25;
      ctx.fillStyle = `rgba(239, 68, 68, ${eyeGlow})`;
      ctx.beginPath();
      ctx.ellipse(sunX - 2, sunY + 1, 14, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#090103';
      ctx.fillRect(sunX - 3.5, sunY - 3, 3, 8);

      // 3. Dark Charred-Crimson Nightmare Clouds
      for (let i = 0; i < 7; i++) {
        const cx = (((i * 250) + time * 12 - (camera.x * 0.04)) % (w + 260)) - 100;
        const cy = 18 + (i % 3) * 32;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(30, 4, 8, 0.85)' : 'rgba(69, 10, 14, 0.78)';
        ctx.beginPath();
        ctx.ellipse(cx + 45, cy + 12, 56 + (i % 2) * 18, 16, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 22, cy + 5, 34, 14, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 72, cy + 7, 36, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        // Red underlit rim on clouds
        ctx.fillStyle = 'rgba(220, 38, 38, 0.35)';
        ctx.fillRect(cx + 8, cy + 20, 74, 3);
      }

      // 4. Jagged Obsidian Nightmare Peaks & Volcanic Spires (with glowing molten fissures)
      ctx.fillStyle = '#140205';
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 14) {
        const worldX = x + camera.x * 0.08;
        const peakY = h - 295
          + Math.sin(worldX * 0.0026) * 80
          + Math.cos(worldX * 0.0064) * 44
          + Math.abs(Math.sin(worldX * 0.015)) * -22;
        ctx.lineTo(x, peakY);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Secondary Crimson-Lit Crag Ridge
      ctx.fillStyle = '#240509';
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 16) {
        const worldX = x + camera.x * 0.12;
        const ridgeY = h - 245 + Math.sin(worldX * 0.0034 + 1.2) * 65 + Math.cos(worldX * 0.008) * 30;
        ctx.lineTo(x, ridgeY);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Razor-Sharp Obsidian Spires with Pulsing Red Magma Cracks
      for (let pIdx = 0; pIdx < 7; pIdx++) {
        const peakBaseWorldX = pIdx * 420 + 110;
        const peakScreenX = (((peakBaseWorldX - camera.x * 0.09) % (w + 380)) + (w + 380)) % (w + 380) - 90;
        const peakScreenY = h - 335 - (pIdx % 3) * 32;

        ctx.fillStyle = '#0c0204';
        ctx.beginPath();
        ctx.moveTo(peakScreenX, peakScreenY);
        ctx.lineTo(peakScreenX + 74, peakScreenY + 135);
        ctx.lineTo(peakScreenX - 74, peakScreenY + 135);
        ctx.closePath();
        ctx.fill();

        // Blood-red backlit eastern spire face
        ctx.fillStyle = '#3b070c';
        ctx.beginPath();
        ctx.moveTo(peakScreenX, peakScreenY);
        ctx.lineTo(peakScreenX + 74, peakScreenY + 135);
        ctx.lineTo(peakScreenX + 4, peakScreenY + 135);
        ctx.closePath();
        ctx.fill();

        // Glowing crimson lava vein splitting down the spire
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.65 + Math.sin(time * 4 + pIdx) * 0.25})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(peakScreenX, peakScreenY + 18);
        ctx.lineTo(peakScreenX - 10, peakScreenY + 56);
        ctx.lineTo(peakScreenX + 8, peakScreenY + 94);
        ctx.lineTo(peakScreenX - 6, peakScreenY + 128);
        ctx.stroke();
      }

      // 5. Molten Blood-Lava Waterfalls plunging down Obsidian Cliffs
      const lavaFalls = [
        { baseX: 440, parallax: 0.12, originY: h - 320, basinY: h - 165, width: 24 },
        { baseX: 1040, parallax: 0.12, originY: h - 300, basinY: h - 170, width: 18 },
      ];
      lavaFalls.forEach((lf, idx) => {
        const fx = (((lf.baseX - camera.x * lf.parallax) % (w + 420)) + (w + 420)) % (w + 420) - 60;
        if (fx < -80 || fx > w + 80) return;
        const fallH = lf.basinY - lf.originY;

        // Charred rock chute
        ctx.fillStyle = '#090103';
        ctx.fillRect(fx - lf.width / 2 - 7, lf.originY, lf.width + 14, fallH);
        // Molten scarlet cascade
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(fx - lf.width / 2, lf.originY, lf.width, fallH);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(fx - lf.width / 4, lf.originY, lf.width / 2, fallH);
        // Churning incandescent magma streaks
        ctx.fillStyle = '#fca5a5';
        for (let fy = lf.originY + 8; fy < lf.basinY; fy += 14) {
          const offset = (time * 135 + fy * 3 + idx * 17) % 14;
          ctx.fillRect(fx - lf.width / 3, fy + offset * 0.3, lf.width * 0.66, 3);
        }
        // Boiling crimson mist at base
        ctx.fillStyle = 'rgba(220, 38, 38, 0.55)';
        ctx.beginPath();
        ctx.ellipse(fx, lf.basinY, lf.width * 1.4, 9, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // 6. Scorched Ash Foothills & Boiling Blood-Lava River
      ctx.fillStyle = '#1b0306';
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 18) {
        const worldX = x + camera.x * 0.26;
        const hillY = h - 140 + Math.sin(worldX * 0.004 + 1.1) * 30;
        ctx.lineTo(x, hillY);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Boiling Crimson Magma River snaking across the midground
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.moveTo(0, h - 88);
      for (let x = 0; x <= w; x += 20) {
        const worldX = x + camera.x * 0.26;
        const riverY = h - 92 + Math.sin(worldX * 0.0045 + time * 1.6) * 7;
        ctx.lineTo(x, riverY);
      }
      ctx.lineTo(w, h - 66);
      for (let x = w; x >= 0; x -= 20) {
        const worldX = x + camera.x * 0.26;
        const riverY = h - 73 + Math.sin(worldX * 0.0045 + time * 1.6) * 7;
        ctx.lineTo(x, riverY);
      }
      ctx.closePath();
      ctx.fill();

      // Glowing molten lava ripples & bursting magma bubbles
      for (let rx = 10; rx < w; rx += 38) {
        const rippleX = (time * 48 + rx * 2) % w;
        const ry = h - 84 + Math.sin(rx * 0.06 + time * 3) * 4;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(rippleX, ry, 18, 2.5);
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(rippleX + 4, ry, 6, 1.5);
      }

      // Haunted Twisted Dead Trees & Sharp Obsidian Thorns along the ridge
      for (let t = 0; t < 6; t++) {
        const tx = (((t * 250 + 70 - camera.x * 0.34) % (w + 220)) + (w + 220)) % (w + 220) - 60;
        const wx = tx + camera.x * 0.34;
        const ty = h - 134 + Math.sin(wx * 0.004 + 1.1) * 26;
        ctx.strokeStyle = '#090102';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(tx, ty + 14);
        ctx.lineTo(tx - 4, ty - 22);
        ctx.lineTo(tx - 18, ty - 42);
        ctx.moveTo(tx - 4, ty - 18);
        ctx.lineTo(tx + 14, ty - 38);
        ctx.moveTo(tx + 6, ty - 29);
        ctx.lineTo(tx + 20, ty - 31);
        ctx.stroke();

        // Eerie pair of glowing red watching eyes blinking in dark hollows!
        const blinkCycle = (time + t * 1.9) % 5.2;
        if (blinkCycle > 0.35 && blinkCycle < 4.5) {
          ctx.fillStyle = '#ff2222';
          ctx.fillRect(tx - 6, ty + 2, 2.5, 2);
          ctx.fillRect(tx + 1, ty + 2, 2.5, 2);
        }
      }

      // 7. Foreground Charred Abyssal Terrain with Jagged Crimson Thorns & Skulls
      ctx.fillStyle = '#110204';
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 14) {
        const worldX = x + camera.x * 0.45;
        const fgY = h - 74 + Math.sin(worldX * 0.006 + 2.2) * 18;
        ctx.lineTo(x, fgY);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Jagged blackened thorns & bone shards lining the cursed foreground
      for (let x = 0; x < w + 40; x += 28) {
        const worldX = x + camera.x * 0.45;
        const hillY = h - 74 + Math.sin(worldX * 0.006 + 2.2) * 18;
        ctx.fillStyle = '#1f0407';
        ctx.beginPath();
        ctx.moveTo(x - 4, hillY + 4);
        ctx.lineTo(x + 2, hillY - 12);
        ctx.lineTo(x + 7, hillY + 4);
        ctx.closePath();
        ctx.fill();

        // Occasional eerie pale skull embedded in the dark ash
        if ((x / 28) % 5 === 0) {
          ctx.fillStyle = '#b8a5a5';
          ctx.fillRect(x + 8, hillY - 4, 7, 5);
          ctx.fillStyle = '#090103';
          ctx.fillRect(x + 9, hillY - 2.5, 1.8, 1.8);
          ctx.fillRect(x + 12.2, hillY - 2.5, 1.8, 1.8);
        }
      }

      // 8. Rising Crimson Embers & Falling Charred Ash Flakes
      for (let e = 0; e < 34; e++) {
        const emberX = (((e * 59 + Math.sin(time * 1.6 + e) * 24 + time * 16) % (w + 60)) + (w + 60)) % (w + 60) - 30;
        const emberY = h - (((e * 41 + time * (38 + (e % 3) * 14)) % (h * 0.92)));
        const eSize = 1.6 + (e % 3) * 0.9;
        ctx.fillStyle = e % 3 === 0 ? '#ef4444' : (e % 3 === 1 ? '#f97316' : '#fca5a5');
        ctx.fillRect(emberX, emberY, eSize, eSize);
      }

      // 9. Oppressive Blood-Red Atmospheric Edge Vignette
      const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.28, w / 2, h / 2, w * 0.72);
      vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vig.addColorStop(0.72, 'rgba(80, 4, 10, 0.24)');
      vig.addColorStop(1, 'rgba(20, 1, 4, 0.62)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      return;
    }

    // 1. SKY & PARADISE SANCTUARY RESTORED AFTER BOSS DEFEAT!
    // Serene radiant daylight paradise sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#0284c7');    // Sky blue
    skyGrad.addColorStop(0.32, '#38bdf8'); // Clear azure
    skyGrad.addColorStop(0.65, '#7dd3fc'); // Soft cyan
    skyGrad.addColorStop(0.85, '#bae6fd'); // Sunlit atmospheric glow
    skyGrad.addColorStop(1, '#e0f2fe');    // Warm horizon
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Warm Radiant Golden Sun
    const sunX = w * 0.78;
    const sunY = 80;
    ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 80 + Math.sin(time * 2) * 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 36, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 20, 0, Math.PI * 2);
    ctx.fill();

    // Gentle Golden Rays
    ctx.save();
    ctx.translate(sunX, sunY);
    ctx.rotate(time * 0.08);
    ctx.fillStyle = 'rgba(254, 240, 138, 0.12)';
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle - 0.1) * (w + h), Math.sin(angle - 0.1) * (w + h));
      ctx.lineTo(Math.cos(angle + 0.1) * (w + h), Math.sin(angle + 0.1) * (w + h));
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Soft Pure White Fluffy Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    for (let i = 0; i < 6; i++) {
      const cx = (((i * 280) + time * 12 - (camera.x * 0.04)) % (w + 240)) - 80;
      const cy = 20 + (i % 3) * 28;
      this.drawFluffyCloud(cx, cy, 75 + (i % 2) * 25);
    }

    // 4. Towering Alpine Mountain Range: Majestic Peaks with Rocky Crags & Snow Caps
    // The great waterfalls visibly originate high in these mountains!
    const mountainScale = 0.08;
    
    // Distant Purple-Slate Mountain Massifs
    ctx.fillStyle = '#1e1b4b'; // Deep twilight mountain base
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 16) {
      const worldX = x + camera.x * mountainScale;
      // Majestic jagged peaks and saddles
      const peakY = h - 290 
        + Math.sin(worldX * 0.0022) * 85 
        + Math.cos(worldX * 0.0048) * 45 
        + Math.sin(worldX * 0.012) * 18;
      ctx.lineTo(x, peakY);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Rugged Shaded Mountain Ridges (Layer 2)
    ctx.fillStyle = '#312e81';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 18) {
      const worldX = x + camera.x * (mountainScale * 1.3);
      const ridgeY = h - 250 
        + Math.sin(worldX * 0.0031 + 1.2) * 70 
        + Math.cos(worldX * 0.0075) * 35;
      ctx.lineTo(x, ridgeY);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Snow-Capped Alpine Mountain Summits & Sunlit Crags
    for (let pIdx = 0; pIdx < 7; pIdx++) {
      const peakBaseWorldX = pIdx * 450 + 120;
      const peakScreenX = ((peakBaseWorldX - camera.x * mountainScale) % (w + 400)) - 100;
      const peakScreenY = h - 330 - (pIdx % 3) * 35;

      // Draw craggy alpine peak with snow
      ctx.fillStyle = '#4338ca';
      ctx.beginPath();
      ctx.moveTo(peakScreenX, peakScreenY);
      ctx.lineTo(peakScreenX + 85, peakScreenY + 120);
      ctx.lineTo(peakScreenX - 85, peakScreenY + 120);
      ctx.closePath();
      ctx.fill();

      // Sunlit eastern rock face
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.moveTo(peakScreenX, peakScreenY);
      ctx.lineTo(peakScreenX + 85, peakScreenY + 120);
      ctx.lineTo(peakScreenX, peakScreenY + 120);
      ctx.closePath();
      ctx.fill();

      // Pure White Snow Cap
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(peakScreenX, peakScreenY);
      ctx.lineTo(peakScreenX + 28, peakScreenY + 40);
      ctx.lineTo(peakScreenX + 12, peakScreenY + 32);
      ctx.lineTo(peakScreenX, peakScreenY + 42);
      ctx.lineTo(peakScreenX - 16, peakScreenY + 34);
      ctx.lineTo(peakScreenX - 28, peakScreenY + 40);
      ctx.closePath();
      ctx.fill();

      // Mountain crevice shadows
      ctx.strokeStyle = '#1e1b4b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(peakScreenX, peakScreenY + 20);
      ctx.lineTo(peakScreenX - 14, peakScreenY + 70);
      ctx.lineTo(peakScreenX - 6, peakScreenY + 110);
      ctx.stroke();
    }

    // Midground Emerald Mountain Foothills
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 20) {
      const worldX = x + camera.x * 0.14;
      const hillY = h - 190 + Math.sin(worldX * 0.0028) * 38 + Math.cos(worldX * 0.006) * 18;
      ctx.lineTo(x, hillY);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // =========================================================================
    // MOUNTAIN WATERFALLS: FLOWING FORTH DIRECTLY FROM HIGH MOUNTAIN GORGES!
    // =========================================================================

    // MOUNTAIN WATERFALL 1: Grand Alpine Cascade bursting from High Mountain Cleft
    const wf1ScreenX = ((460 - camera.x * 0.12) % (w + 400)) - 60;
    if (wf1ScreenX > -90 && wf1ScreenX < w + 90) {
      const originY = h - 335; // Originates high up on the mountain peak!
      const basinY = h - 170;  // Plunges into the lush foothills
      const fallHeight = basinY - originY;

      // 1. Dark Mountain Gorge Cleft where water bursts from the rock face
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(wf1ScreenX, originY + 5, 22, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rugged cliff sides framing the waterfall chute
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(wf1ScreenX - 22, originY + 6, 8, fallHeight);
      ctx.fillRect(wf1ScreenX + 14, originY + 6, 8, fallHeight);
      // Rocky shelves where water breaks
      ctx.fillStyle = '#334155';
      ctx.fillRect(wf1ScreenX - 26, originY + 50, 52, 10);
      ctx.fillRect(wf1ScreenX - 22, originY + 105, 44, 9);

      // 2. High Alpine Cascading Water Stream (Vivid Glacial Cyan)
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(wf1ScreenX - 13, originY + 6, 26, fallHeight);
      ctx.fillStyle = '#7dd3fc';
      ctx.fillRect(wf1ScreenX - 7, originY + 6, 14, fallHeight);

      // 3. Fast animated churning white foam rapids cascading down the mountain face
      ctx.fillStyle = '#ffffff';
      for (let fy = originY + 8; fy < basinY; fy += 12) {
        const flowOffset = (time * 180 + fy * 4) % 15;
        const widthWave = 18 + Math.sin(fy * 0.15 + time * 6) * 4;
        ctx.fillRect(wf1ScreenX - widthWave / 2, fy + flowOffset * 0.25, widthWave, 3.5);
      }

      // 4. Intermediate Splash Shelves on mountain ledges
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.ellipse(wf1ScreenX, originY + 50, 20, 5, 0, 0, Math.PI * 2);
      ctx.ellipse(wf1ScreenX, originY + 105, 18, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 5. Billowing White Mountain Mist Spray at Base
      ctx.fillStyle = 'rgba(224, 242, 254, 0.82)';
      ctx.beginPath();
      ctx.ellipse(wf1ScreenX, basinY, 36, 11, 0, 0, Math.PI * 2);
      ctx.ellipse(wf1ScreenX - 12, basinY - 8, 20, 10, 0, 0, Math.PI * 2);
      ctx.ellipse(wf1ScreenX + 12, basinY - 8, 20, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Airborne water spray mist particles
      ctx.fillStyle = '#ffffff';
      for (let s = 0; s < 6; s++) {
        const sx = wf1ScreenX + Math.sin(time * 5 + s * 2) * 26;
        const sy = basinY - 14 - Math.abs(Math.cos(time * 6 + s)) * 18;
        ctx.fillRect(sx, sy, 2.5, 2.5);
      }
    }

    // MOUNTAIN WATERFALL 2: Twin Glacial Falls Carving through Rocky Saddle
    const wf2ScreenX = ((1080 - camera.x * 0.12) % (w + 450)) - 60;
    if (wf2ScreenX > -90 && wf2ScreenX < w + 90) {
      const originY = h - 315; // Originates high up in mountain saddle
      const basinY = h - 175;
      const fallHeight = basinY - originY;

      // Dark mountain gorge
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(wf2ScreenX, originY + 4, 18, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rock cliff face borders
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(wf2ScreenX - 18, originY + 5, 6, fallHeight);
      ctx.fillRect(wf2ScreenX + 12, originY + 5, 6, fallHeight);
      // Intermediate rock shelf
      ctx.fillStyle = '#334155';
      ctx.fillRect(wf2ScreenX - 20, originY + 65, 40, 8);

      // Glacial cyan water stream
      ctx.fillStyle = '#67e8f9';
      ctx.fillRect(wf2ScreenX - 11, originY + 5, 22, fallHeight);
      ctx.fillStyle = '#a5f3fc';
      ctx.fillRect(wf2ScreenX - 5, originY + 5, 10, fallHeight);

      // Churning water rapids
      ctx.fillStyle = '#ffffff';
      for (let fy = originY + 6; fy < basinY; fy += 11) {
        const flowOffset = (time * 160 + fy * 3) % 13;
        ctx.fillRect(wf2ScreenX - 8, fy + flowOffset * 0.25, 16, 3);
      }

      // Base splash mist
      ctx.fillStyle = 'rgba(224, 242, 254, 0.82)';
      ctx.beginPath();
      ctx.ellipse(wf2ScreenX, basinY, 30, 9, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // MOUNTAIN WATERFALL 3: Distant Alpine Vein Cascading from Snowy Peak
    const wf3ScreenX = ((780 - camera.x * 0.10) % (w + 400)) - 50;
    if (wf3ScreenX > -60 && wf3ScreenX < w + 60) {
      const originY = h - 350;
      const basinY = h - 210;
      const fallHeight = basinY - originY;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(wf3ScreenX - 6, originY, 12, fallHeight);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(wf3ScreenX - 4, originY, 8, fallHeight);
      ctx.fillStyle = '#ffffff';
      for (let fy = originY + 4; fy < basinY; fy += 10) {
        const flowOffset = (time * 140 + fy * 3) % 10;
        ctx.fillRect(wf3ScreenX - 3, fy + flowOffset * 0.2, 6, 2.5);
      }
      ctx.fillStyle = 'rgba(224, 242, 254, 0.7)';
      ctx.beginPath();
      ctx.ellipse(wf3ScreenX, basinY, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Middle Rolling Meadow with Winding River & Lush Willow Trees
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 18) {
      const worldX = x + camera.x * 0.26;
      const hillY = h - 135 + Math.sin(worldX * 0.0038 + 1.2) * 32;
      ctx.lineTo(x, hillY);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // WATER SOURCE 3: Winding Sparkling River along Midground
    ctx.fillStyle = '#0284c7'; // deep river blue
    ctx.beginPath();
    ctx.moveTo(0, h - 85);
    for (let x = 0; x <= w; x += 22) {
      const worldX = x + camera.x * 0.26;
      const riverY = h - 90 + Math.sin(worldX * 0.004 + time * 1.5) * 8;
      ctx.lineTo(x, riverY);
    }
    ctx.lineTo(w, h - 65);
    for (let x = w; x >= 0; x -= 22) {
      const worldX = x + camera.x * 0.26;
      const riverY = h - 72 + Math.sin(worldX * 0.004 + time * 1.5) * 8;
      ctx.lineTo(x, riverY);
    }
    ctx.closePath();
    ctx.fill();

    // Flowing water surface ripples & foam
    ctx.fillStyle = '#7dd3fc';
    for (let rx = 10; rx < w; rx += 36) {
      const rippleOffset = (time * 70 + rx * 2) % w;
      const ry = h - 82 + Math.sin(rx * 0.05 + time * 3) * 5;
      ctx.fillRect(rippleOffset, ry, 18, 2.5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(rippleOffset + 4, ry, 6, 1.5);
      ctx.fillStyle = '#7dd3fc';
    }

    // 6. Foreground Meadow with Ponds, Lotus Flowers & Bubbling Spring
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 16) {
      const worldX = x + camera.x * 0.45;
      const fgY = h - 75 + Math.sin(worldX * 0.005 + 2.2) * 20;
      ctx.lineTo(x, fgY);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // WATER SOURCE 4: Crystal Clear Foreground Pond with Water Lilies & Lotus
    const pond1X = ((280 - camera.x * 0.45) % (w + 260)) - 30;
    if (pond1X > -90 && pond1X < w + 90) {
      const pondY = h - 45;
      // Pond body
      ctx.fillStyle = '#0369a1';
      ctx.beginPath();
      ctx.ellipse(pond1X, pondY, 48, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.ellipse(pond1X, pondY, 42, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wavelet shimmer
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(pond1X - 20 + Math.sin(time * 3) * 4, pondY - 3, 12, 1.5);
      ctx.fillRect(pond1X + 8 + Math.cos(time * 3) * 4, pondY + 2, 10, 1.5);

      // Water Lily Pads & Pink Lotus Flowers
      for (let lp = 0; lp < 3; lp++) {
        const lx = pond1X - 22 + lp * 20;
        const ly = pondY - 2 + (lp % 2) * 5;
        // Lily pad
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(lx, ly, 6, 0.4, Math.PI * 2);
        ctx.lineTo(lx, ly);
        ctx.closePath();
        ctx.fill();
        // Blooming pink lotus
        if (lp % 2 === 0) {
          ctx.fillStyle = '#f472b6';
          ctx.beginPath();
          ctx.arc(lx + 2, ly - 3, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fde047';
          ctx.fillRect(lx + 1, ly - 4, 2, 2);
        }
      }
    }

    // WATER SOURCE 5: Bubbling Natural Rock Spring Fountain
    const springX = ((760 - camera.x * 0.45) % (w + 280)) - 30;
    if (springX > -60 && springX < w + 60) {
      const sy = h - 60;
      // Stone spring basin
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(springX, sy, 14, 0, Math.PI * 2);
      ctx.fill();
      // Glistening pool inside basin
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(springX, sy, 10, 0, Math.PI * 2);
      ctx.fill();
      // Bubbling upward water jet
      ctx.fillStyle = '#ffffff';
      const jetH = 8 + Math.sin(time * 8) * 3;
      ctx.fillRect(springX - 1.5, sy - jetH, 3, jetH);
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(springX - 4, sy - jetH + 2, 8, 2);
    }

    // 7. ABUNDANT DENSE FLOWER CARPET (Poppies, Sunflowers, Bluebells, Lavender, Daisies)
    for (let x = 0; x < w + 40; x += 14) {
      const worldX = x + camera.x * 0.45;
      const hillY = h - 75 + Math.sin(worldX * 0.005 + 2.2) * 20;
      const sway = Math.sin(time * 4 + x) * 2.5;

      // Stem
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, hillY);
      ctx.lineTo(x + sway, hillY - 9);
      ctx.stroke();

      // Flower blossom varieties
      const flowerType = (x * 7) % 6;
      if (flowerType === 0) {
        // Crimson wild poppy
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(x + sway, hillY - 10, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a'; // black center
        ctx.fillRect(x + sway - 1, hillY - 11, 2, 2);
      } else if (flowerType === 1) {
        // Sunny yellow daffodil / buttercup
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(x + sway, hillY - 10, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(x + sway - 1, hillY - 11, 2, 2);
      } else if (flowerType === 2) {
        // Purple royal lavender
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(x + sway - 1.5, hillY - 13, 3, 6);
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(x + sway - 1, hillY - 15, 2, 2);
      } else if (flowerType === 3) {
        // Azure bluebell
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(x + sway, hillY - 10, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + sway - 1, hillY - 11, 2, 1.5);
      } else if (flowerType === 4) {
        // Pure white daisy with gold center
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x + sway, hillY - 10, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x + sway - 1, hillY - 11, 2, 2);
      } else {
        // Tall golden sunflower
        ctx.strokeStyle = '#166534';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, hillY);
        ctx.lineTo(x + sway, hillY - 16);
        ctx.stroke();
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(x + sway, hillY - 17, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#451a03'; // dark brown sunflower seed center
        ctx.beginPath();
        ctx.arc(x + sway, hillY - 17, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 8. BUTTERFLIES AND INSECTS! (Only appear when the boss is defeated and sanctuary peace is restored)
    if (isBossDefeated) {
      // A. 8 Animated Fluttering Butterflies across 4 real species morphs
      for (let b = 0; b < 8; b++) {
        const bx = (((b * 140 + time * 32) - camera.x * 0.3) % (w + 120)) - 40;
        const by = h - 115 + Math.sin(time * 3 + b * 1.7) * 26;
        ctx.save();
        ctx.translate(bx, by);
        this.drawButterflySprite(ctx, time + b * 0.65, 0.92, b % 4);
        ctx.restore();
      }

      // B. Iridescent Dragonflies across 3 species morphs hovering above waters
      for (let d = 0; d < 3; d++) {
        const dx = (((d * 320 + 150 + Math.sin(time * 4 + d) * 40) - camera.x * 0.35) % (w + 100)) - 30;
        const dy = h - 68 + Math.cos(time * 3.5 + d * 2) * 12;
        ctx.save();
        ctx.translate(dx, dy);
        this.drawDragonflySprite(ctx, time + d * 0.9, 0.92, d % 3);
        ctx.restore();
      }

      // C. Fuzzy Honeybees & Bumblebees across 3 morphs orbiting sunflowers
      for (let bee = 0; bee < 4; bee++) {
        const beex = (((bee * 240 + 80 + Math.sin(time * 6 + bee) * 18) - camera.x * 0.4) % (w + 100)) - 30;
        const beey = h - 90 + Math.cos(time * 5 + bee * 2) * 14;
        ctx.save();
        ctx.translate(beex, beey);
        this.drawHoneybeeSprite(ctx, time + bee * 0.7, 0.85, bee % 3);
        ctx.restore();
      }

      // D. Glossy Ladybugs across 3 natural beetle morphs on grass blades
      for (let lb = 0; lb < 4; lb++) {
        const lx = ((lb * 220 + 60 - camera.x * 0.45) % (w + 100)) - 20;
        const ly = h - 70 + ((lb * 11) % 15);
        ctx.save();
        ctx.translate(lx, ly);
        this.drawLadybugSprite(ctx, time + lb * 0.5, 0.78, lb % 3);
        ctx.restore();
      }
    }
  }

  // World 1, 2, 3: Sunny Meadows, Barn, and Grassy Trail
  private renderMeadowBackground(theme: LevelConfig['theme'], camera: Camera, time: number, levelId: number = 1, isBossDefeated: boolean = false) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. Radiant Sunny Blue Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    if (theme === 'fields') {
      skyGrad.addColorStop(0, '#38bdf8');
      skyGrad.addColorStop(0.5, '#fde047');
      skyGrad.addColorStop(1, '#fed7aa');
    } else {
      skyGrad.addColorStop(0, '#0284c7');
      skyGrad.addColorStop(0.35, '#38bdf8');
      skyGrad.addColorStop(0.68, '#7dd3fc');
      skyGrad.addColorStop(0.9, '#bae6fd');
      skyGrad.addColorStop(1, '#e0f2fe');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Warm Radiant Sun
    const sunX = w * 0.82;
    const sunY = 75;
    ctx.fillStyle = 'rgba(254, 240, 138, 0.22)';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 70 + Math.sin(time * 2) * 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 34, 0, Math.PI * 2);
    ctx.fill();

    // 3. Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    const slowCloud = time * 7;
    for (let i = 0; i < 5; i++) {
      const cx = (((i * 320) + slowCloud - (camera.x * 0.05)) % (w + 260)) - 100;
      const cy = 25 + (i % 3) * 32;
      this.drawFluffyCloud(cx, cy, 75 + (i % 2) * 20);
    }

    // 4. Far Rolling Pastel Green Hills
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 20) {
      const worldX = x + camera.x * 0.15;
      const hillY = h - 170 + Math.sin(worldX * 0.0028) * 35 + Math.cos(worldX * 0.006) * 16;
      ctx.lineTo(x, hillY);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // 5. Middle Meadow with Trees & Fences
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 20) {
      const worldX = x + camera.x * 0.3;
      const hillY = h - 125 + Math.sin(worldX * 0.0042 + 1.2) * 30;
      ctx.lineTo(x, hillY);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Trees on Middle Meadow
    for (let i = 0; i < 8; i++) {
      const tx = (((i * 240) - (camera.x * 0.3)) % (w + 140)) - 40;
      const worldX = tx + camera.x * 0.3;
      const ty = h - 125 + Math.sin(worldX * 0.0042 + 1.2) * 30;

      ctx.fillStyle = '#78350f';
      ctx.fillRect(tx - 3, ty - 6, 6, 14);

      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(tx, ty - 18, 18, 0, Math.PI * 2);
      ctx.arc(tx - 10, ty - 12, 13, 0, Math.PI * 2);
      ctx.arc(tx + 10, ty - 12, 13, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(tx - 3, ty - 22, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Foreground Hill with Grass & Wildflowers
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 16) {
      const worldX = x + camera.x * 0.45;
      const hillY = h - 85 + Math.sin(worldX * 0.0055 + 2.4) * 24;
      ctx.lineTo(x, hillY);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // --- Pasture Animals & Level 10 Wolf Chase ---
    if (levelId === 10 && !isBossDefeated) {
      // Level 10: Panicked sheep fleeing from ravenous wolves in the background!
      this.renderLevel10SheepWolfChase(w, h, camera, time);
    } else {
      // Autonomous wandering pasture sheep & baby lambs (naturally walking, grazing clover, and resting!)
      const computeSheepState = (
        t: number,
        seed: number,
        roamRange: number
      ): { dx: number; facing: 'left' | 'right'; activity: 'walk' | 'graze' | 'rest' } => {
        if (isBossDefeated) {
          return { dx: 0, facing: seed % 2 === 0 ? 'right' : 'left', activity: 'graze' };
        }
        const period = 20.0;
        const phase = (t + seed * 4.9) % period;
        if (phase < 5.0) {
          // Naturally strolling right across the hillside
          const u = phase / 5.0;
          return { dx: -roamRange * 0.5 + roamRange * u, facing: 'right', activity: 'walk' };
        } else if (phase < 10.2) {
          // Grazing sweet meadow clover
          return { dx: roamRange * 0.5, facing: 'right', activity: 'graze' };
        } else if (phase < 13.5) {
          // Curled down resting in the grass
          return { dx: roamRange * 0.5, facing: 'right', activity: 'rest' };
        } else if (phase < 17.5) {
          // Strolling back left across the pasture
          const u = (phase - 13.5) / 4.0;
          return { dx: roamRange * 0.5 - roamRange * u, facing: 'left', activity: 'walk' };
        } else {
          // Grazing at the far end of the pasture
          return { dx: -roamRange * 0.5, facing: 'left', activity: 'graze' };
        }
      };

      const wrapX = (raw: number, span: number) => (((raw % span) + span) % span) - 70;

      // Midground Sheep 1: Suffolk Blackface + playful Midground Baby Lamb
      const s1State = computeSheepState(time, 0, 74);
      const s1ScreenX = wrapX(380 + s1State.dx - camera.x * 0.3, w + 260);
      if (s1ScreenX > -80 && s1ScreenX < w + 80) {
        const s1WorldX = s1ScreenX + camera.x * 0.3;
        const s1Y = h - 125 + Math.sin(s1WorldX * 0.0042 + 1.2) * 30 - 2;
        this.renderGrazingSheep(s1ScreenX, s1Y, time, {
          facing: s1State.facing,
          animOffset: 0.6,
          isCheering: isBossDefeated,
          variantIndex: 0,
          activity: s1State.activity,
        });

        // Midground Baby Lamb trotting behind Suffolk ewe
        const midLambX = s1ScreenX + (s1State.facing === 'right' ? -28 : 28);
        const midLambWorldX = midLambX + camera.x * 0.3;
        const midLambY = h - 125 + Math.sin(midLambWorldX * 0.0042 + 1.2) * 30 + 1;
        this.renderGrazingSheep(midLambX, midLambY, time + 0.3, {
          facing: s1State.facing,
          isLamb: true,
          animOffset: 2.1,
          isCheering: isBossDefeated,
          variantIndex: 0,
          activity: s1State.activity,
        });
      }

      // Midground Sheep 2: Merino Cream strolling & grazing along the ridge
      const s2State = computeSheepState(time, 1, 68);
      const s2ScreenX = wrapX(860 + s2State.dx - camera.x * 0.3, w + 280);
      if (s2ScreenX > -80 && s2ScreenX < w + 80) {
        const s2WorldX = s2ScreenX + camera.x * 0.3;
        const s2Y = h - 125 + Math.sin(s2WorldX * 0.0042 + 1.2) * 30 - 2;
        this.renderGrazingSheep(s2ScreenX, s2Y, time, {
          facing: s2State.facing,
          animOffset: 2.3,
          isCheering: isBossDefeated,
          variantIndex: 1,
          activity: s2State.activity,
        });
      }

      // Foreground Sheep 3: Mother Ewe (Jacob Spotted) + Baby Lamb following closely
      const s3State = computeSheepState(time, 2, 86);
      const s3ScreenX = wrapX(220 + s3State.dx - camera.x * 0.45, w + 320);
      if (s3ScreenX > -90 && s3ScreenX < w + 90) {
        const s3WorldX = s3ScreenX + camera.x * 0.45;
        const s3Y = h - 85 + Math.sin(s3WorldX * 0.0055 + 2.4) * 24 - 4;
        this.renderGrazingSheep(s3ScreenX, s3Y, time, {
          facing: s3State.facing,
          scale: 1.05,
          animOffset: 1.1,
          isCheering: isBossDefeated,
          variantIndex: 2,
          activity: s3State.activity,
        });

        // Cute Little Baby Lamb following its mother across the meadow!
        const lambGap = s3State.activity === 'walk'
          ? (s3State.facing === 'right' ? -34 : 34)
          : (s3State.facing === 'right' ? 36 : -36);
        const lambScreenX = s3ScreenX + lambGap;
        const lambWorldX = lambScreenX + camera.x * 0.45;
        const lambY = h - 85 + Math.sin(lambWorldX * 0.0055 + 2.4) * 24 + 1;
        this.renderGrazingSheep(lambScreenX, lambY, time, {
          facing: s3State.activity === 'walk' ? s3State.facing : (s3State.facing === 'right' ? 'left' : 'right'),
          isLamb: true,
          animOffset: 3.5,
          isCheering: isBossDefeated,
          variantIndex: 1,
          activity: s3State.activity,
        });
      }

      // Foreground Sheep 4: Herdwick Silver-Grey wandering across the field
      const s4State = computeSheepState(time, 3, 76);
      const s4ScreenX = wrapX(680 + s4State.dx - camera.x * 0.45, w + 300);
      if (s4ScreenX > -90 && s4ScreenX < w + 90) {
        const s4WorldX = s4ScreenX + camera.x * 0.45;
        const s4Y = h - 85 + Math.sin(s4WorldX * 0.0055 + 2.4) * 24 - 4;
        this.renderGrazingSheep(s4ScreenX, s4Y, time, {
          facing: s4State.facing,
          scale: 1.0,
          animOffset: 4.2,
          isCheering: isBossDefeated,
          variantIndex: 3,
          activity: s4State.activity,
        });
      }
    }

    // Swaying Grass Blades & Wildflowers
    for (let x = 0; x < w + 60; x += 22) {
      const worldX = x + camera.x * 0.45;
      const hillY = h - 85 + Math.sin(worldX * 0.0055 + 2.4) * 24;
      const sway = Math.sin(time * 4 + x) * 2.5;

      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, hillY);
      ctx.lineTo(x + sway, hillY - 8);
      ctx.stroke();

      if (x % 44 === 0) {
        const flowerColor = (x % 88 === 0) ? '#f43f5e' : (x % 66 === 0 ? '#facc15' : '#38bdf8');
        ctx.fillStyle = flowerColor;
        ctx.beginPath();
        ctx.arc(x + sway, hillY - 9, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Floating Petals
    for (let i = 0; i < 12; i++) {
      const px = ((i * 125 + time * 45) % (w + 140)) - 60;
      const py = (i * 35 + Math.sin(time * 2.2 + i * 1.5) * 20) % (h - 70);
      ctx.fillStyle = i % 3 === 0 ? '#f472b6' : (i % 3 === 1 ? '#fde047' : '#93c5fd');
      ctx.fillRect(px, py, 4, 3);
    }
  }

  // Level 10: Scared Sheep Running from Wolves in the Background & Getting Eaten
  private renderLevel10SheepWolfChase(w: number, h: number, camera: Camera, time: number) {
    const ctx = this.ctx;
    const cyclePeriod = 8.0;
    const cycleTime = time % cyclePeriod;
    const isCatching = cycleTime >= 4.8 && cycleTime <= 7.0;

    // --- 1. Panicked Sheep Running for their Lives! ---
    for (let i = 0; i < 3; i++) {
      // Sheep 2 is the straggler caught and eaten during catch phase
      if (i === 2 && isCatching) continue;

      const speed = 175 + i * 15;
      const sx = (((cycleTime * speed + (2 - i) * 130 + 160) - (camera.x * 0.4)) % (w + 320)) - 80;
      if (sx < -90 || sx > w + 90) continue;
      const worldX = sx + camera.x * 0.4;
      const groundY = h - 90 + Math.sin(worldX * 0.005 + 2.0) * 22;
      const gallop = Math.abs(Math.sin(time * 18 + i * 2)) * 14;
      const sy = groundY - gallop;

      ctx.save();
      ctx.translate(sx, sy);
      // Running rightwards away from the wolves
      ctx.scale(-1, 1); // Face right

      // Fluffy woolly body bouncing
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.arc(-8, -4, 11, 0, Math.PI * 2);
      ctx.arc(8, -3, 11, 0, Math.PI * 2);
      ctx.arc(-4, 6, 10, 0, Math.PI * 2);
      ctx.arc(6, 6, 10, 0, Math.PI * 2);
      ctx.fill();

      // Shadow under fleece
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(-4, 7, 7, 0, Math.PI * 2);
      ctx.arc(6, 7, 7, 0, Math.PI * 2);
      ctx.fill();

      // Frantically galloping legs kicking up dirt
      const legStride = Math.sin(time * 26 + i) * 12;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-12 - legStride, 10, 3.2, 10);
      ctx.fillRect(-7 + legStride, 10, 3.2, 10);
      ctx.fillRect(5 + legStride, 10, 3.2, 10);
      ctx.fillRect(10 - legStride, 10, 3.2, 10);

      // Kicked up turf and grass clods
      ctx.fillStyle = '#15803d';
      ctx.fillRect(16 + Math.sin(time * 30) * 4, 18, 3, 2.5);
      ctx.fillRect(20 + Math.cos(time * 25) * 5, 16, 2.5, 2.5);

      // Sheep Head (stretched forward in terror)
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.ellipse(-16, -6, 8, 6, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Woolly cap on head
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-14, -12, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Floppy ear pinned flat back in sheer terror
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(-8, -9, 6, 2.5, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // HUGE terrified eye looking backwards with pinpoint pupil!
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-14, -7, 3.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(-12.8, -7, 1.3, 0, Math.PI * 2); // Looking back at wolf!
      ctx.fill();

      // Wide screaming open mouth bleating!
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-22, -4, 4, 4);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(-21, -2, 2.5, 2); // pink tongue

      // Blue sweat droplets flying off forehead!
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(-10, -18, 2, 0, Math.PI * 2);
      ctx.arc(-5, -16, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Little floating "BAAA!" speech bubble
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-24, -30, 28, 12, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#dc2626';
      ctx.font = '700 8px "Silkscreen", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BAA!', -10, -21);

      ctx.restore();
    }

    // --- 2. Hungry Wolves in Fierce Pursuit! ---
    for (let wIdx = 0; wIdx < 2; wIdx++) {
      const wSpeed = 178 + wIdx * 12;
      const wx = (((cycleTime * wSpeed + wIdx * 90 + 30) - (camera.x * 0.4)) % (w + 320)) - 90;
      if (wx < -90 || wx > w + 90) continue;
      const worldX = wx + camera.x * 0.4;
      const groundY = h - 90 + Math.sin(worldX * 0.005 + 2.0) * 22;
      const gallop = Math.sin(time * 20 + wIdx) * 5;
      const wy = groundY - 6 + gallop;

      ctx.save();
      ctx.translate(wx, wy);

      // Exact same wolf model as the in-game combat wolf with natural coat morphs!
      this.drawWolfSprite(ctx, 36, 24, false, time * 2 + wIdx, 1.05, wIdx % 4);

      // Drool droplets
      ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.fillRect(20, -2, 1.5, 3);

      ctx.restore();
    }

    // --- 3. Comic Catch & Eat Scene! (A sheep gets caught and eaten!) ---
    if (isCatching) {
      const catchBaseX = (((cycleTime * 175 + 160) - (camera.x * 0.4)) % (w + 320)) - 80;
      const worldX = catchBaseX + camera.x * 0.4;
      const groundY = h - 90 + Math.sin(worldX * 0.005 + 2.0) * 22;

      ctx.save();
      ctx.translate(catchBaseX, groundY - 10);

      // Billowing Comic Dust & Wool Cloud
      const puffPulse = Math.sin((cycleTime - 4.8) * 8) * 4;
      const cloudPuffs = [
        { x: -16, y: -8, r: 18 + puffPulse, c: 'rgba(255, 255, 255, 0.95)' },
        { x: 12, y: -12, r: 20 + puffPulse, c: 'rgba(241, 245, 249, 0.95)' },
        { x: 0, y: -20, r: 22 + puffPulse, c: 'rgba(226, 232, 240, 0.95)' },
        { x: -10, y: 4, r: 16, c: 'rgba(203, 213, 225, 0.9)' },
        { x: 14, y: 2, r: 15, c: 'rgba(255, 255, 255, 0.9)' }
      ];

      cloudPuffs.forEach(p => {
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Flying tufts of wool around the cloud
      for (let t = 0; t < 5; t++) {
        const woolX = Math.sin(cycleTime * 7 + t * 2) * 32;
        const woolY = -24 - Math.abs(Math.cos(cycleTime * 6 + t)) * 26;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(woolX, woolY, 4, 0, Math.PI * 2);
        ctx.arc(woolX + 3, woolY + 1, 3, 0, Math.PI * 2);
        ctx.arc(woolX - 3, woolY + 1, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Wolf bushy tail with dark charcoal tip sticking out of the scuffle
      ctx.save();
      ctx.translate(-18, -4);
      ctx.rotate(-0.5 + Math.sin(time * 25) * 0.2);
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.ellipse(-10, 0, 11, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(-16, 0, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Comic action stars
      for (let s = 0; s < 3; s++) {
        const starX = (s - 1) * 22;
        const starY = -34 + (s % 2) * 8;
        ctx.fillStyle = s % 2 === 0 ? '#facc15' : '#ef4444';
        ctx.font = '700 10px "Silkscreen", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('★', starX, starY);
      }

      // BOLD COMIC "CHOMP!!" SOUND BANNER
      ctx.save();
      const bannerRot = Math.sin(time * 12) * 0.1;
      ctx.rotate(bannerRot);
      ctx.fillStyle = '#dc2626';
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-36, -56, 72, 22, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CHOMP!!', 0, -40);
      ctx.restore();

      ctx.restore();
    }
  }

  /**
   * Animated Fluffy Sheep Feeding on Grass
   * Features cloud-like fleece lobes, wagging woolly tail, dark hooves,
   * drooping floppy ears, and grazing animation (head lowering down to chew grass,
   * grass blades dangling from mouth, chewing jaw, and lifting head happily).
   */
  public renderGrazingSheep(
    x: number,
    y: number,
    time: number,
    options?: {
      facing?: 'left' | 'right';
      scale?: number;
      isLamb?: boolean;
      animOffset?: number;
      isCheering?: boolean;
      variantIndex?: number;
      activity?: 'graze' | 'walk' | 'rest';
    }
  ) {
    const ctx = this.ctx;
    const facing = options?.facing || 'left';
    const scale = options?.scale || (options?.isLamb ? 0.68 : 1.0);
    const offset = options?.animOffset || 0;
    const isLamb = !!options?.isLamb;
    const isCheering = !!options?.isCheering;
    const activity = isCheering ? 'graze' : (options?.activity || 'graze');
    const isWalking = activity === 'walk';
    const isResting = activity === 'rest';
    const morph = ((options?.variantIndex ?? 0) % 4 + 4) % 4;

    // 4 Real-World Sheep Breeds
    const breeds = [
      // 0: Suffolk Blackface (snowy wool, sleek dark charcoal face & legs)
      { wool: '#f8fafc', woolShadow: '#cbd5e1', woolStroke: '#e2e8f0', woolHi: '#ffffff', face: '#334155', muzzle: '#1e293b', leg: '#334155', legFar: '#1e293b', spot: null as string | null },
      // 1: Merino Cream (warm ivory fleece, soft biscuit-tan face)
      { wool: '#fefce8', woolShadow: '#e7dcc5', woolStroke: '#ece3ce', woolHi: '#fffef5', face: '#d6bfa9', muzzle: '#b89f87', leg: '#c7ae95', legFar: '#a88f77', spot: null as string | null },
      // 2: Jacob Spotted (ivory fleece with authentic espresso wool patches)
      { wool: '#fafaf9', woolShadow: '#d6d3d1', woolStroke: '#e7e5e4', woolHi: '#ffffff', face: '#44403c', muzzle: '#292524', leg: '#57534e', legFar: '#292524', spot: '#5c3a21' },
      // 3: Herdwick Silver-Grey (alpine silver fleece, pale forehead & slate face)
      { wool: '#d1d5db', woolShadow: '#9ca3af', woolStroke: '#b5bcc6', woolHi: '#f3f4f6', face: '#475569', muzzle: '#334155', leg: '#475569', legFar: '#334155', spot: null as string | null },
    ];
    const b = breeds[morph];

    // Grazing state cycle (5.5s cycle) - only active when activity === 'graze' and not cheering
    const cycle = (time + offset) % 5.5;
    const isFeedingDown = !isCheering && activity === 'graze' && cycle < 3.4;
    const chewSpeed = 14;
    const chew = isFeedingDown ? Math.sin(time * chewSpeed) * 1.5 : 0;

    let headDownProgress = 0;
    if (!isCheering && activity === 'graze') {
      if (cycle < 0.4) {
        headDownProgress = cycle / 0.4;
      } else if (cycle < 3.4) {
        headDownProgress = 1;
      } else if (cycle < 3.8) {
        headDownProgress = 1 - (cycle - 3.4) / 0.4;
      } else {
        headDownProgress = 0;
      }
    }

    const cheerHop = isCheering ? Math.abs(Math.sin(time * 7.5 + offset * 2.2)) * 8 : 0;
    const walkBob = isWalking ? Math.abs(Math.sin(time * (isLamb ? 9.5 : 7.0) + offset)) * (isLamb ? 2.4 : 1.5) : 0;
    const restDrop = isResting ? (isLamb ? 4.5 : 6.0) : 0;
    const restBreath = isResting ? Math.sin(time * 2.2 + offset) * 0.6 : 0;

    ctx.save();
    ctx.translate(x, y - cheerHop - walkBob + restDrop + restBreath);
    // Note: in local sprite space, the sheep's head faces +X (right), so flip when facing left!
    if (facing === 'left') {
      ctx.scale(-1, 1);
    }
    ctx.scale(scale, scale);

    // 1. Soft Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.ellipse(0, (isResting ? 5 : 8) + (cheerHop * 0.4), isLamb ? 16 : 24, isLamb ? 4.5 : 6.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Slender Legs with Cloven Hooves (animated stride when walking, tucked under fleece when resting!)
    if (isResting) {
      // Tucked hooves peeking gently out under the warm wool
      ctx.fillStyle = b.legFar;
      ctx.beginPath();
      ctx.ellipse(-9, 6, 4.2, 2.2, 0.1, 0, Math.PI * 2);
      ctx.ellipse(10, 6, 4.5, 2.2, -0.1, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const legW = isLamb ? 2.8 : 3.6;
      const legH = isLamb ? 10 : 14;
      const footY = 8;
      const hoofColor = '#0f172a';
      const stride = isWalking ? Math.sin(time * (isLamb ? 9.5 : 7.0) + offset) * (isLamb ? 3.8 : 4.2) : 0;

      // Far back leg
      ctx.fillStyle = b.legFar;
      ctx.fillRect(-14 - stride, footY - legH, legW, legH);
      ctx.fillStyle = hoofColor;
      ctx.fillRect(-14.5 - stride, footY - 2.5, legW + 1, 2.5);

      // Near back leg
      ctx.fillStyle = b.leg;
      ctx.fillRect(-9 + stride, footY - legH + 1, legW, legH - 1);
      ctx.fillStyle = hoofColor;
      ctx.fillRect(-9.5 + stride, footY - 2.5, legW + 1, 2.5);

      // Far front leg
      ctx.fillStyle = b.legFar;
      ctx.fillRect(8 + stride, footY - legH, legW, legH);
      ctx.fillStyle = hoofColor;
      ctx.fillRect(7.5 + stride, footY - 2.5, legW + 1, 2.5);

      // Near front leg
      ctx.fillStyle = b.leg;
      ctx.fillRect(13 - stride, footY - legH + 1, legW, legH - 1);
      ctx.fillStyle = hoofColor;
      ctx.fillRect(12.5 - stride, footY - 2.5, legW + 1, 2.5);
    }

    // 3. Wiggling Woolly Bob Tail
    const tailWag = Math.sin(time * (isCheering ? 14 : (isWalking ? 10 : (isResting ? 2 : 7))) + offset * 3) * (isCheering ? 0.45 : (isResting ? 0.08 : 0.25));
    ctx.save();
    ctx.translate(-19, -4);
    ctx.rotate(-0.35 + tailWag);
    ctx.fillStyle = b.wool;
    ctx.beginPath();
    ctx.ellipse(0, 0, isLamb ? 3.5 : 5, isLamb ? 5 : 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = b.woolStroke;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // 4. Cloud-like Fluffy Fleece Body (Overlapping Wool Puffs)
    ctx.fillStyle = b.woolShadow;
    ctx.beginPath();
    ctx.ellipse(0, 1, isLamb ? 17 : 24, isLamb ? 12 : 16.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = b.wool;
    ctx.beginPath();
    ctx.ellipse(0, -1, isLamb ? 16 : 23, isLamb ? 11.5 : 15.5, 0, 0, Math.PI * 2);
    ctx.fill();

    const puffs = isLamb
      ? [
          { px: -11, py: -7, r: 6.5 },
          { px: -3, py: -10, r: 7.5 },
          { px: 5, py: -9, r: 7 },
          { px: 11, py: -4, r: 6 },
          { px: -12, py: 1, r: 6 },
          { px: 10, py: 3, r: 6 },
          { px: -5, py: 4, r: 6.5 },
          { px: 3, py: 4, r: 6.5 },
        ]
      : [
          { px: -16, py: -8, r: 9 },
          { px: -6, py: -13, r: 10 },
          { px: 6, py: -12, r: 9.5 },
          { px: 15, py: -6, r: 8.5 },
          { px: -17, py: 1, r: 8.5 },
          { px: 14, py: 3, r: 8 },
          { px: -7, py: 5, r: 8.5 },
          { px: 5, py: 5, r: 8.5 },
        ];

    puffs.forEach((p, idx) => {
      const isSpottedPuff = b.spot && (idx === 1 || idx === 4 || idx === 6);
      ctx.fillStyle = isSpottedPuff ? b.spot! : b.wool;
      ctx.beginPath();
      ctx.arc(p.px, p.py, p.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isSpottedPuff ? '#3e2716' : b.woolStroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Soft warm wool texture highlights
    ctx.fillStyle = b.woolHi;
    ctx.beginPath();
    ctx.ellipse(-2, -5, isLamb ? 9 : 13, isLamb ? 5 : 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. Sheep Neck & Head (Walking, Resting, Grazing, or Joyful Cheering)
    const headUpX = isLamb ? 15 : 21;
    const headUpY = isLamb ? (isResting ? -5 : -8) : (isResting ? -7 : -11);
    const headDownX = isLamb ? 18 : 25;
    const headDownY = isLamb ? 2 : 4;

    const walkNod = isWalking ? Math.sin(time * (isLamb ? 9.5 : 7.0) + offset) * 1.1 : 0;
    const headX = headUpX + (headDownX - headUpX) * headDownProgress;
    const headY = headUpY + (headDownY - headUpY) * headDownProgress + (isFeedingDown ? chew : walkNod);

    ctx.save();
    ctx.translate(headX, headY);

    const headAngle = isResting ? 0.14 : (headDownProgress * 0.45);
    ctx.rotate(headAngle);

    // Woolly cap / crown on top of head
    ctx.fillStyle = b.woolHi;
    ctx.beginPath();
    ctx.arc(0, -6, isLamb ? 4.5 : 6, 0, Math.PI * 2);
    ctx.arc(-3, -4, isLamb ? 3.5 : 5, 0, Math.PI * 2);
    ctx.fill();

    // Breed-accurate sleek face/head
    ctx.fillStyle = b.face;
    ctx.beginPath();
    ctx.ellipse(3, 0, isLamb ? 5.5 : 8, isLamb ? 4.5 : 6.5, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Snout / muzzle
    ctx.fillStyle = b.muzzle;
    ctx.beginPath();
    ctx.ellipse(7, 2, isLamb ? 3.2 : 4.5, isLamb ? 2.5 : 3.5, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Cute pink nose dot
    ctx.fillStyle = '#fda4af';
    ctx.fillRect(9, 1, 1.8, 1.5);

    // Floppy cute ear
    const earWiggle = Math.sin(time * (isCheering ? 14 : (isResting ? 3 : 8)) + offset) * (isCheering ? 0.3 : (isResting ? 0.06 : 0.15));
    ctx.save();
    ctx.translate(-2, -2);
    ctx.rotate(0.35 + earWiggle);
    ctx.fillStyle = b.face;
    ctx.beginPath();
    ctx.ellipse(0, 0, isLamb ? 2 : 3, isLamb ? 5 : 7, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.ellipse(0, 0, isLamb ? 1 : 1.5, isLamb ? 3 : 4.5, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Eyes and mouth expression
    if (isCheering) {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(2, -1, isLamb ? 1.6 : 2.4, 0.2, Math.PI - 0.2);
      ctx.stroke();

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(6.5, 2, isLamb ? 1.8 : 2.5, 0.2, Math.PI - 0.2);
      ctx.stroke();
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(6.5, 3.2, isLamb ? 0.9 : 1.3, 0, Math.PI);
      ctx.fill();

      ctx.fillStyle = 'rgba(244, 114, 182, 0.55)';
      ctx.beginPath();
      ctx.arc(1, 1, 1.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const isBlink = (time + offset) % 3.6 < 0.14;
      if (isBlink || isFeedingDown || isResting) {
        // Content closed happy crescent eye
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(2, -1, isLamb ? 1.5 : 2.2, 0.2, Math.PI - 0.2);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(2, -1, isLamb ? 1.8 : 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(2.5, -2, 1, 1);
      }
    }

    // 6. Green Grass Blades in mouth ONLY when grazing
    if (!isCheering && activity === 'graze' && (isFeedingDown || cycle < 4.2)) {
      const grassSway = Math.sin(time * chewSpeed) * 3;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(8, 3);
      ctx.quadraticCurveTo(12 + grassSway, 7, 10 + grassSway, 12);
      ctx.moveTo(7, 3);
      ctx.quadraticCurveTo(14 - grassSway, 5, 13, 9);
      ctx.stroke();

      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(10 + grassSway, 12, 1.8, 0, Math.PI * 2);
      ctx.arc(13, 9, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore(); // restore head transform

    // 7. Grass tufts around feet when grazing or resting
    if (!isWalking) {
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(8, isResting ? 2 : 4, 3, 5);
      ctx.fillRect(12, isResting ? 3 : 5, 2.5, 4);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(10, isResting ? 0 : 2, 2, 6);
      ctx.fillRect(-12, isResting ? 3 : 5, 2, 4);
    }

    if (!isCheering && isFeedingDown && Math.sin(time * 10 + offset) > 0.6) {
      ctx.fillStyle = '#86efac';
      ctx.fillRect(headX + 4, headY + 6, 1.5, 1.5);
    }

    if (isCheering) {
      const symIdx = (Math.floor(offset * 2) + Math.floor(time * 2.2)) % 3;
      const symY = headY - 14 - Math.sin(time * 5 + offset) * 5;
      ctx.font = '700 9px "Silkscreen", monospace';
      ctx.textAlign = 'center';
      if (symIdx === 0) {
        ctx.fillStyle = '#f43f5e';
        ctx.fillText('♥', headX, symY);
      } else if (symIdx === 1) {
        ctx.fillStyle = '#facc15';
        ctx.fillText('★', headX, symY);
      } else {
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('♪', headX, symY);
      }
    }

    ctx.restore();
  }

  private drawFluffyCloud(x: number, y: number, width: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
    ctx.fillRect(x + 4, y + 16, width - 8, 14);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y + 10, width, 16);
    ctx.fillRect(x + 10, y + 2, width - 20, 24);
    ctx.fillRect(x + 22, y - 6, width - 44, 30);
    ctx.fillRect(x + width * 0.35, y - 10, width * 0.3, 14);
    ctx.restore();
  }

  // --- Starting Coop: ONLY on Level 1, Firmly Sits on the Ground Platform (No Floating!) ---

  public renderStartingCoop(
    spawnPoint: { x: number; y: number }, 
    camera: Camera, 
    time: number, 
    platforms?: Platform[],
    player?: PlayerState
  ) {
    const ctx = this.ctx;
    const coopW = 44;
    const coopH = 42;

    // Pin the bottom of the coop exactly on top of the ground platform surface (never floating!)
    let groundY = 480;
    if (platforms && platforms.length > 0) {
      const matching = platforms.filter(p => p.x - 24 <= spawnPoint.x && p.x + p.width + 24 >= spawnPoint.x);
      if (matching.length > 0) {
        matching.sort((a, b) => Math.abs(a.y - spawnPoint.y) - Math.abs(b.y - spawnPoint.y));
        groundY = matching[0].y;
      }
    }

    const coopWorldX = spawnPoint.x - 14;
    const coopWorldY = groundY - coopH;
    const sx = coopWorldX - camera.x;
    const sy = coopWorldY - camera.y;

    if (sx < -80 || sx > this.canvas.width + 80) return;

    // Subtle home-base proximity shake when the chicken is nearby
    let proximity = 0;
    let shakeIntensity = 0;
    if (player) {
      const pCenterX = player.x + player.width / 2;
      const pCenterY = player.y + player.height / 2;
      const coopCenterX = coopWorldX + coopW / 2;
      const coopCenterY = coopWorldY + coopH / 2;
      const dist = Math.hypot(pCenterX - coopCenterX, pCenterY - coopCenterY);
      const nearbyRadius = 115;
      if (dist < nearbyRadius) {
        const t = 1 - dist / nearbyRadius;
        proximity = t * t * (3 - 2 * t); // smoothstep falloff
        // Periodic gentle cozy rustle pulse + instant reactive wiggle when moving/hopping nearby
        const cycle = (time * 0.8) % 1.0;
        const rustlePulse = cycle < 0.42 ? Math.sin((cycle / 0.42) * Math.PI) : 0;
        const moveBoost = Math.min(1, Math.hypot(player.vx, player.vy) / 220) * 0.72;
        shakeIntensity = proximity * Math.max(rustlePulse, moveBoost);
      }
    }

    ctx.save();

    // Solid ground shadow right under base (stays planted while the coop wiggles)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(
      sx + coopW / 2,
      sy + coopH + 1,
      coopW / 2 + 6 + shakeIntensity * 1.4,
      4,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Apply subtle shake/tilt pivoted at the bottom-center foundation of the coop
    const pivotX = sx + coopW / 2;
    const pivotY = sy + coopH;
    if (shakeIntensity > 0.01) {
      const shakeX = Math.sin(time * 34) * 1.45 * shakeIntensity;
      const shakeAngle = Math.sin(time * 28) * 0.042 * shakeIntensity;
      const bounce = Math.abs(Math.sin(time * 28)) * shakeIntensity;
      ctx.translate(pivotX + shakeX, pivotY);
      ctx.rotate(shakeAngle);
      ctx.scale(1 - bounce * 0.018, 1 + bounce * 0.028);
      ctx.translate(-pivotX, -pivotY);
    }

    // Wooden wall structure
    ctx.fillStyle = '#92400e';
    ctx.fillRect(sx, sy + 14, coopW, coopH - 14);

    // Vertical timber plank lines & highlights
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    for (let px = sx + 7; px < sx + coopW; px += 7) {
      ctx.beginPath();
      ctx.moveTo(px, sy + 14);
      ctx.lineTo(px, sy + coopH);
      ctx.stroke();
    }
    ctx.fillStyle = '#b45309';
    ctx.fillRect(sx, sy + 14, coopW, 2);

    // Cozy arched doorway where the chick emerges
    const doorW = 20;
    const doorH = 22;
    const doorX = sx + (coopW - doorW) / 2;
    const doorY = sy + coopH - doorH;

    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(doorX + doorW / 2, doorY + 7, doorW / 2, Math.PI, 0);
    ctx.lineTo(doorX + doorW, doorY + doorH);
    ctx.lineTo(doorX, doorY + doorH);
    ctx.closePath();
    ctx.fill();

    // Warm cozy home glow inside the doorway when the chicken is nearby
    if (proximity > 0.02) {
      const glowAlpha = (0.14 + 0.12 * Math.sin(time * 5)) * proximity;
      ctx.fillStyle = `rgba(254, 240, 138, ${glowAlpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(doorX + doorW / 2, doorY + 7, doorW / 2 - 1, Math.PI, 0);
      ctx.lineTo(doorX + doorW - 1, doorY + doorH - 2);
      ctx.lineTo(doorX + 1, doorY + doorH - 2);
      ctx.closePath();
      ctx.fill();
    }

    // Golden straw / hay bedding spilling onto the ground
    ctx.fillStyle = '#fde047';
    ctx.fillRect(doorX + 2, doorY + doorH - 4, doorW - 4, 4);
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(doorX + 4, doorY + doorH - 2, 4, 2);
    ctx.fillRect(doorX + doorW - 7, doorY + doorH - 3, 5, 2);

    // Wooden perch bar across door
    ctx.fillStyle = '#d97706';
    ctx.fillRect(doorX - 2, doorY + doorH - 2, doorW + 4, 3);

    // Red pitched shingle roof
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(sx + coopW / 2, sy);
    ctx.lineTo(sx + coopW + 7, sy + 15);
    ctx.lineTo(sx - 7, sy + 15);
    ctx.closePath();
    ctx.fill();

    // Roof eaves & ridge cap
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(sx + coopW / 2 - 4, sy - 2, 8, 4);
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(sx - 7, sy + 13, coopW + 14, 3);

    // Cute painted wooden sign: "COOP"
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(sx + coopW / 2 - 12, sy + 15, 24, 8);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx + coopW / 2 - 12, sy + 15, 24, 8);

    ctx.fillStyle = '#92400e';
    ctx.font = '700 6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('COOP', sx + coopW / 2, sy + 21);

    // Little golden egg finial on roof peak
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(sx + coopW / 2, sy + 7, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Subtle floating straw/feather motes rustling off the coop when shaking nearby
    if (shakeIntensity > 0.25) {
      ctx.save();
      for (let i = 0; i < 2; i++) {
        const phase = (time * 1.4 + i * 0.52) % 1;
        const moteX = sx + (i === 0 ? 4 : coopW - 4) + Math.sin(time * 6 + i * 2.5) * 4;
        const moteY = sy + 16 - phase * 14;
        const alpha = (1 - phase) * shakeIntensity * 0.75;
        ctx.fillStyle = i === 0
          ? `rgba(253, 224, 71, ${alpha.toFixed(3)})`
          : `rgba(254, 249, 195, ${alpha.toFixed(3)})`;
        ctx.fillRect(moteX, moteY, 3, 2);
      }
      ctx.restore();
    }
  }

  // --- Silkie Sam Outside The Shop (Level 1 Exterior Stand & Upgraded Dialogue) ---
  public renderSilkieSamOutsideShop(
    player: PlayerState,
    camera: Camera,
    time: number,
    hasCompletedGame: boolean = false,
    hasRewardSkin: boolean = false,
    isShopClosed: boolean = false,
    hasVisitedShop: boolean = false,
    level1SpeechText: string | null = null
  ) {
    const ctx = this.ctx;
    const standX = 380;
    const groundY = 480;
    const sx = standX - camera.x;
    const sy = groundY - camera.y;

    if (sx < -200 || sx > this.canvas.width + 200) return;

    ctx.save();

    // 1. Wooden Market Stand Foundation & Posts
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(sx + 36, sy + 1, 46, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wooden timber counter base
    const counterW = 68;
    const counterH = 28;
    ctx.fillStyle = '#78350f';
    ctx.fillRect(sx, sy - counterH, counterW, counterH);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(sx + 2, sy - counterH + 2, counterW - 4, counterH - 4);

    // Vertical plank lines
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.5;
    for (let px = sx + 14; px < sx + counterW; px += 14) {
      ctx.beginPath();
      ctx.moveTo(px, sy - counterH);
      ctx.lineTo(px, sy);
      ctx.stroke();
    }

    // Polished Counter Tabletop Slab
    ctx.fillStyle = '#b45309';
    ctx.fillRect(sx - 4, sy - counterH - 4, counterW + 8, 5);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(sx - 4, sy - counterH - 4, counterW + 8, 2);

    // Market Stall Timber Canopy Posts
    ctx.fillStyle = '#543009';
    ctx.fillRect(sx + 2, sy - counterH - 46, 4, 46);
    ctx.fillRect(sx + counterW - 6, sy - counterH - 46, 4, 46);

    // Awning Canopy with Scalloped Red & Gold Fabric Stripes
    const awningY = sy - counterH - 52;
    const awningW = counterW + 16;
    const awningStartX = sx - 8;

    for (let s = 0; s < 7; s++) {
      const sw = awningW / 7;
      const stripeX = awningStartX + s * sw;
      ctx.fillStyle = s % 2 === 0 ? '#b91c1c' : '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(stripeX, awningY - 4);
      ctx.lineTo(stripeX + sw, awningY - 4);
      ctx.lineTo(stripeX + sw + 2, awningY + 12);
      ctx.lineTo(stripeX - 2, awningY + 12);
      ctx.closePath();
      ctx.fill();

      // Scalloped fringe
      ctx.beginPath();
      ctx.arc(stripeX + sw / 2, awningY + 12, sw / 2, 0, Math.PI);
      ctx.fill();
    }

    // Wooden Hanging Sign: "UPGRADES"
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(sx + 10, awningY - 14, counterW - 20, 10);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx + 10, awningY - 14, counterW - 20, 10);
    ctx.fillStyle = '#78350f';
    ctx.font = '700 6.5px "Silkscreen", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('UPGRADES', sx + counterW / 2, awningY - 6);

    // Display Items on Counter
    // 1. Glowing Heart Jar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(sx + 8, sy - counterH - 12, 8, 8);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(sx + 10, sy - counterH - 10, 4, 4);

    // 2. Mini Steel Sword on Display Stand
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(sx + 26, sy - counterH - 12, 2, 8);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(sx + 24, sy - counterH - 7, 6, 2);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(sx + 26, sy - counterH - 4, 2, 2);

    // 3. Mini Shield
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(sx + 44, sy - counterH - 11);
    ctx.lineTo(sx + 52, sy - counterH - 11);
    ctx.lineTo(sx + 52, sy - counterH - 5);
    ctx.lineTo(sx + 48, sy - counterH - 2);
    ctx.lineTo(sx + 44, sy - counterH - 5);
    ctx.closePath();
    ctx.fill();

    // Hanging Brass Lantern swaying in gentle breeze
    const lanternSway = Math.sin(time * 3) * 3;
    const lX = sx + counterW + 4;
    const lY = awningY + 6;
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx + counterW - 4, awningY);
    ctx.lineTo(lX + lanternSway, lY);
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(lX - 3 + lanternSway, lY, 6, 8);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(lX - 1.5 + lanternSway, lY + 1.5, 3, 5);

    // 2. Silkie Sam Character Model Standing Outside
    const samX = sx + counterW + 22;
    const samY = sy - 20;

    // Check speaking state from Level 1 Sam dialogue progression
    const pCenter = player.x + player.width / 2;
    const distToPlayer = Math.abs(pCenter - (standX + counterW / 2));
    const isSpeaking = level1SpeechText !== null && distToPlayer < 320;

    ctx.save();
    ctx.translate(samX, samY);

    // Gentle breathing / talking bounce
    const samBob = isSpeaking ? Math.sin(time * 12) * 1.5 : Math.sin(time * 3) * 0.8;
    ctx.translate(0, samBob);

    // Silkie shadow under feet
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.ellipse(0, 20, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fluffy cloud plumage tail
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(-14, 2, 8, 0, Math.PI * 2);
    ctx.arc(-18, -2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-13, 1, 7, 0, Math.PI * 2);
    ctx.arc(-17, -3, 6, 0, Math.PI * 2);
    ctx.fill();

    // Body: Snowy white cloud puffs
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.ellipse(0, 5, 14, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(-1, 3, 13, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    [
      [-8, 0, 6.5], [6, 1, 6.5], [-4, 7, 6], [4, 7, 6]
    ].forEach(([px, py, pr]) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    });

    // Dark Slate Face (Melanistic skin - authentic Silkie trait)
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(8, -5, 7, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Signature Turquoise / Sky-Blue Earglobe (layered glossy sheen)
    ctx.fillStyle = '#0891b2';
    ctx.beginPath();
    ctx.ellipse(4, -4, 3.3, 4.1, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.ellipse(3.9, -4.3, 2.3, 3, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cffafe';
    ctx.fillRect(3.2, -5.4, 1.4, 1.6);

    // Textured Walnut / Mulberry Comb
    ctx.fillStyle = '#4a044e';
    ctx.beginPath();
    ctx.ellipse(9, -11, 3.7, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#701a75';
    ctx.fillRect(7.4, -12, 1.5, 1.2);
    ctx.fillRect(9.8, -11.6, 1.4, 1.2);

    // Fluffy Pom-Pom Crest (6 cloud puffs + fine hair-like silk filaments)
    const crestBob = isSpeaking ? Math.sin(time * 16) * 1.2 : 0;
    const crestPuffs = [
      [5, -15 + crestBob, 6], [10, -14 + crestBob, 5.5], [1, -13 + crestBob, 5.5],
      [7, -19 + crestBob, 5], [4, -16 + crestBob, 5.5], [10, -17 + crestBob, 4.5]
    ];
    crestPuffs.forEach(([cpx, cpy, cpr]) => {
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(cpx, cpy, cpr + 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cpx, cpy, cpr, 0, Math.PI * 2);
      ctx.fill();
    });
    // Fine hair-like Silkie crest wisps
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.moveTo(4, -22 + crestBob); ctx.lineTo(2, -25.5 + crestBob);
    ctx.moveTo(8, -23 + crestBob); ctx.lineTo(9.5, -26 + crestBob);
    ctx.moveTo(12, -19 + crestBob); ctx.lineTo(15, -21 + crestBob);
    ctx.stroke();

    // Sparkling anime eye with dual catchlights
    const isBlinking = Math.sin(time * 8) > 0.9;
    if (!isBlinking) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(9.5, -6.5, 3.2, 2.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(10, -6.5, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(9.5, -7.5, 1, 1);
      ctx.fillRect(10.5, -6, 0.6, 0.6);
    } else {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(9.5, -6.5, 2.2, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    }

    // Animated talking beak chattering
    const mouthFlap = isSpeaking ? Math.abs(Math.sin(time * 20)) * 2 : 0;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(13, -6);
    ctx.lineTo(20, -4 - mouthFlap * 0.3);
    ctx.lineTo(13, -3);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(13, -3 + mouthFlap * 0.5);
    ctx.lineTo(18, -2 + mouthFlap * 0.8);
    ctx.lineTo(13, -1 + mouthFlap);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#475569';
    ctx.fillRect(13, -5, 3.5, 1);

    // Merchant Red Bowtie & Golden Coin Pin
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(2, 3);
    ctx.lineTo(6, 1);
    ctx.lineTo(2, -1);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(10, 3);
    ctx.lineTo(6, 1);
    ctx.lineTo(10, -1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#facc15';
    ctx.fillRect(5, 0, 2.5, 2.5);

    // Authentic feathered Silkie ankles/shanks & 5-toed melanistic slate claws
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.ellipse(0.5, 15, 3.4, 3.6, 0.1, 0, Math.PI * 2);
    ctx.ellipse(6.5, 15, 3.4, 3.6, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0.5, 14.5, 2.5, 2.8, 0.1, 0, Math.PI * 2);
    ctx.ellipse(6.5, 14.5, 2.5, 2.8, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-1.5, 17.5, 4.5, 2.4);
    ctx.fillRect(4.5, 17.5, 4.5, 2.4);
    ctx.fillStyle = '#334155';
    ctx.fillRect(-2.5, 18.8, 1.5, 1.2);
    ctx.fillRect(2.5, 18.8, 1.5, 1.2);
    ctx.fillRect(8.5, 18.8, 1.5, 1.2);

    ctx.restore(); // restore Sam

    // 3. UPGRADED RETRO ARCADE DIALOGUE BUBBLE (Only shown during first Level 1 joke sequence, silent on revisits!)
    if (level1SpeechText !== null) {
      const fullDialogue = level1SpeechText;

      const cursor = Math.floor(Date.now() / 250) % 2 === 0 ? '▮' : '';
      const bubbleW = Math.min(390, this.canvas.width - 24);
      const maxTextW = bubbleW - 76;

      ctx.save();
      ctx.font = '700 9.5px "Silkscreen", monospace';
      const wrappedLines = this.wrapDialogueText(ctx, `“${fullDialogue}${cursor}”`, maxTextW, 2);
      const lineHeight = 13;
      const bubbleH = Math.max(82, 42 + wrappedLines.length * lineHeight + 22);
      const bx = Math.max(12, Math.min(this.canvas.width - bubbleW - 12, samX - bubbleW * 0.45));
      const by = Math.max(58, sy - counterH - 68 - bubbleH);

      // Drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(bx + 4, by + 4, bubbleW, bubbleH);

      // Deep obsidian arcade box
      ctx.fillStyle = '#000000';
      ctx.fillRect(bx, by, bubbleW, bubbleH);

      const bGrad = ctx.createLinearGradient(bx, by, bx, by + bubbleH);
      bGrad.addColorStop(0, '#090d16');
      bGrad.addColorStop(0.5, '#1e1b4b');
      bGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = bGrad;
      ctx.fillRect(bx + 2, by + 2, bubbleW - 4, bubbleH - 4);

      // Chunky gold pixel border
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(bx + 2, by + 2, bubbleW - 4, bubbleH - 4);

      // 4 Golden Corner Studs with White Gleam Dots
      [
        [bx + 3, by + 3],
        [bx + bubbleW - 8, by + 3],
        [bx + 3, by + bubbleH - 8],
        [bx + bubbleW - 8, by + bubbleH - 8]
      ].forEach(([rx, ry]) => {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(rx, ry, 5, 5);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(rx + 1, ry + 1, 2, 2);
      });

      // Speech bubble pointer tail directed at Silkie Sam's head (clamped cleanly to bubble bottom)
      const tailX = Math.max(bx + 24, Math.min(bx + bubbleW - 24, samX));
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(tailX - 10, by + bubbleH);
      ctx.lineTo(tailX, by + bubbleH + 14);
      ctx.lineTo(tailX + 10, by + bubbleH);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.moveTo(tailX - 8, by + bubbleH - 1);
      ctx.lineTo(tailX, by + bubbleH + 11);
      ctx.lineTo(tailX + 8, by + bubbleH - 1);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(tailX - 9, by + bubbleH);
      ctx.lineTo(tailX, by + bubbleH + 13);
      ctx.lineTo(tailX + 9, by + bubbleH);
      ctx.stroke();

      // Framed Mini Silkie Portrait Icon
      const pSize = 44;
      const px = bx + 10;
      const py = by + Math.round((bubbleH - pSize) / 2);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px, py, pSize, pSize);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px, py, pSize, pSize);

      ctx.save();
      ctx.beginPath();
      ctx.rect(px + 1, py + 1, pSize - 2, pSize - 2);
      ctx.clip();

      const cx = px + pSize / 2;
      const cy = py + pSize / 2 + 1;
      // Cloud plumage
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(cx, cy + 5, 14, 0, Math.PI * 2);
      ctx.fill();
      // Crest
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx - 3, cy - 7, 7, 0, Math.PI * 2);
      ctx.arc(cx + 3, cy - 7, 7, 0, Math.PI * 2);
      ctx.arc(cx, cy - 11, 6, 0, Math.PI * 2);
      ctx.fill();
      // Melanistic slate face
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(cx + 2, cy - 1, 8, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      // Turquoise earlobe
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.ellipse(cx - 3, cy, 3, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#67e8f9';
      ctx.fillRect(cx - 4, cy - 1, 1.2, 1.5);
      // Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + 3, cy - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx + 3.4, cy - 2, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx + 3, cy - 3, 1, 1);
      // Beak
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(cx + 7, cy - 2);
      ctx.lineTo(cx + 13, cy);
      ctx.lineTo(cx + 7, cy + 2);
      ctx.closePath();
      ctx.fill();
      // Red bowtie in portrait
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(cx - 4, cy + 12, 8, 3);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(cx - 1, cy + 12, 2, 3);
      ctx.restore();

      // Dialogue Text & Merchant Nameplate
      const textX = bx + 64;

      // Merchant Name Tag
      ctx.textAlign = 'left';
      ctx.font = '700 8px "Silkscreen", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('SILKIE SAM - COOP MERCHANT', textX, by + 18);

      // Spoken Dialogue (wrapped cleanly inside bubble)
      ctx.font = '700 9.5px "Silkscreen", monospace';
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 3;
      wrappedLines.forEach((line, idx) => {
        ctx.fillText(line, textX, by + 35 + idx * lineHeight);
      });
      ctx.shadowBlur = 0;

      // Action hint prompt badge reflecting open/closed status
      ctx.font = '700 7.5px "Silkscreen", monospace';
      ctx.fillStyle = isShopClosed ? '#fda4af' : '#4ade80';
      const actionHint = isShopClosed
        ? '[ SHOP CLOSED (2H) - CHECK SETTINGS ]'
        : '[ PRESS E OR OPEN SHOP IN MENU ]';
      ctx.fillText(actionHint, textX, by + bubbleH - 11);

      ctx.restore();
    }

    ctx.restore();
  }

  private wrapDialogueText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    maxLines: number = 2
  ): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = words[i];
        if (lines.length >= maxLines - 1) {
          const rest = [currentLine, ...words.slice(i + 1)].join(' ');
          let trimmed = rest;
          while (ctx.measureText(trimmed).width > maxWidth && trimmed.length > 4) {
            trimmed = trimmed.slice(0, -4) + '...';
          }
          lines.push(trimmed);
          return lines;
        }
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  }

  // --- Platforms & Detailed Colorful Obstacles ---

  public renderPlatform(
    plat: Platform, 
    camera: Camera, 
    enemies?: Enemy[], 
    levelTheme?: LevelConfig['theme'],
    isBossDefeated: boolean = false
  ) {
    const ctx = this.ctx;
    const sx = plat.x - camera.x;
    const sy = plat.y - camera.y;

    if (sx + plat.width < -50 || sx > this.canvas.width + 50) return;

    // Stage 30 Crimson Nightmare Obsidian Ground (transforms back to lush sanctuary grass once Cockatrice is defeated!)
    if (levelTheme === 'fields' && !isBossDefeated) {
      // Charred volcanic obsidian rock body
      ctx.fillStyle = '#140305';
      ctx.fillRect(sx, sy, plat.width, plat.height);
      ctx.fillStyle = '#1f0509';
      ctx.fillRect(sx, sy + 12, plat.width, plat.height - 12);

      // Glowing crimson magma cracks slicing down into the obsidian floor
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      for (let cx = sx + 28; cx < sx + plat.width - 20; cx += 72) {
        ctx.beginPath();
        ctx.moveTo(cx, sy + 9);
        ctx.lineTo(cx - 8, sy + 32);
        ctx.lineTo(cx + 6, sy + 64);
        ctx.lineTo(cx - 4, sy + Math.min(plat.height - 8, 98));
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.fillRect(cx - 5, sy + 28, 4, 4);
      }

      // Jagged scorched crimson top crust
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(sx, sy, plat.width, 9);
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(sx, sy, plat.width, 4);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(sx, sy, plat.width, 1.5);

      // Dripping crimson rock teeth along top lip
      for (let gx = sx + 6; gx < sx + plat.width - 6; gx += 14) {
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(gx, sy + 8, 5, 5);
        ctx.fillStyle = '#450a0a';
        ctx.fillRect(gx + 1, sy + 12, 3, 4);
      }
      return;
    }

    // In World 4 (or wherever a fox patrols/spawns), keep the lush floating land (grass with dirt under) permanently!
    // Even when the fox is defeated, do NOT change the platform texture!
    const hasFox = Boolean(
      (levelTheme === 'jungle' && plat.type === 'ruins') ||
      enemies?.some(e => e.type === 'fox' && (
        (e.patrolLeft < plat.x + plat.width && e.patrolRight > plat.x) ||
        (e.x + e.width > plat.x - 10 && e.x < plat.x + plat.width + 10)
      ))
    );
    const hasBear = Boolean(
      enemies?.some(e => e.type === 'bear' && (e.x + e.width > plat.x - 10 && e.x < plat.x + plat.width + 10))
    );
    const isSnowy = levelTheme === 'snowy';

    // 1. "make the floating lands in world 4 grass with dirt under but it would only show if there is a fox on top of the land"
    if (hasFox) {
      // Dirt under
      ctx.fillStyle = '#78350f';
      ctx.fillRect(sx, sy, plat.width, plat.height);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(sx, sy + 10, plat.width, plat.height - 10);
      ctx.fillStyle = '#543009';
      for (let px = sx + 8; px < sx + plat.width - 8; px += 22) {
        ctx.fillRect(px, sy + 14 + ((px * 5) % (Math.max(4, plat.height - 20))), 5, 4);
      }
      ctx.fillStyle = '#3f1e03';
      ctx.fillRect(sx, sy + plat.height - 3, plat.width, 3); // dark bottom edge

      // Grass on top
      ctx.fillStyle = '#15803d';
      ctx.fillRect(sx, sy, plat.width, 9);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(sx, sy, plat.width, 4);
      ctx.fillStyle = '#86efac';
      ctx.fillRect(sx, sy, plat.width, 1.5);

      // Hanging roots & grass tufts over the dirt
      for (let gx = sx + 4; gx < sx + plat.width - 4; gx += 8) {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(gx, sy + 7, 4, 5);
        ctx.fillRect(gx + 1, sy + 11, 2, 3);
      }

      // Small wildflowers on grass
      for (let fx = sx + 12; fx < sx + plat.width - 12; fx += 32) {
        const flowerColor = (fx % 64 === 0) ? '#f43f5e' : (fx % 48 === 0 ? '#facc15' : '#38bdf8');
        ctx.fillStyle = flowerColor;
        ctx.beginPath();
        ctx.arc(fx, sy - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(fx - 1, sy - 4, 2, 2);
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(fx - 0.5, sy - 1, 1, 3);
      }

    // 2. "make the platforms at world 5 make everthing snow and under dirt and icicles"
    } else if (isSnowy || hasBear) {
      // Frosted loam dirt under
      ctx.fillStyle = '#3a271d'; // dark frozen loam
      ctx.fillRect(sx, sy, plat.width, plat.height);
      ctx.fillStyle = '#4c3528';
      ctx.fillRect(sx, sy + 9, plat.width, plat.height - 9);
      ctx.fillStyle = '#271911';
      for (let px = sx + 6; px < sx + plat.width - 6; px += 24) {
        ctx.fillRect(px, sy + 14, 4, 4);
      }
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(sx, sy + plat.height - 2.5, plat.width, 2.5);

      // Thick pure white snow blanket covering the top
      ctx.fillStyle = '#cbd5e1'; // soft ice shadow
      ctx.fillRect(sx, sy, plat.width, 9);
      ctx.fillStyle = '#f8fafc'; // crisp white snow
      ctx.fillRect(sx, sy, plat.width, 6);
      ctx.fillStyle = '#ffffff'; // sunlit snow edge
      ctx.fillRect(sx, sy, plat.width, 2.5);

      // Fluffy rounded snowdrifts along surface
      for (let sxPos = sx + 2; sxPos < sx + plat.width - 4; sxPos += 14) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sxPos + 4, sy + 2, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Hanging Crystalline Icicles on the underside of the dirt!
      const icicleCount = Math.max(2, Math.floor(plat.width / 14));
      for (let i = 0; i < icicleCount; i++) {
        const ix = sx + i * 14 + 4;
        const iLen = 8 + ((i * 7) % 11); // varied icicle lengths

        // Translucent cyan ice
        ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
        ctx.beginPath();
        ctx.moveTo(ix, sy + plat.height);
        ctx.lineTo(ix + 3, sy + plat.height + iLen);
        ctx.lineTo(ix + 6, sy + plat.height);
        ctx.closePath();
        ctx.fill();

        // White core & sparkling light tip
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(ix + 1.5, sy + plat.height);
        ctx.lineTo(ix + 3, sy + plat.height + iLen - 1);
        ctx.lineTo(ix + 4, sy + plat.height);
        ctx.closePath();
        ctx.fill();
      }

    } else if (plat.type === 'grass') {
      // 3. Regular Lush Grassy Platform over Layered Dirt Earth
      ctx.fillStyle = '#78350f';
      ctx.fillRect(sx, sy, plat.width, plat.height);

      // Rich brown topsoil & deeper subsoil strata
      ctx.fillStyle = '#92400e';
      ctx.fillRect(sx, sy + 10, plat.width, Math.max(0, plat.height - 10));
      if (plat.height > 42) {
        ctx.fillStyle = '#6b2f0c';
        ctx.fillRect(sx, sy + 36, plat.width, plat.height - 36);
        ctx.fillStyle = '#522208';
        ctx.fillRect(sx, sy + 72, plat.width, Math.max(0, plat.height - 72));
      }

      // Earthy dirt clods & small pebbles scattered through the soil
      for (let py = sy + 15; py < sy + plat.height - 8; py += 20) {
        const rowShift = ((Math.floor((py - sy) / 20)) % 2) * 13;
        for (let px = sx + 8 + rowShift; px < sx + plat.width - 8; px += 26) {
          ctx.fillStyle = '#543009';
          ctx.fillRect(px, py, 5, 4);
          ctx.fillStyle = '#b45309';
          ctx.fillRect(px + 1, py, 2, 2);
        }
      }

      // Lush green grass turf on top
      ctx.fillStyle = '#15803d';
      ctx.fillRect(sx, sy, plat.width, 9);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(sx, sy, plat.width, 4);
      ctx.fillStyle = '#86efac';
      ctx.fillRect(sx, sy, plat.width, 1.5);

      for (let gx = sx + 4; gx < sx + plat.width - 4; gx += 8) {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(gx, sy + 7, 4, 5);
        ctx.fillRect(gx + 1, sy + 11, 2, 3);
      }

      for (let fx = sx + 12; fx < sx + plat.width - 12; fx += 32) {
        const flowerColor = (fx % 64 === 0) ? '#f43f5e' : (fx % 48 === 0 ? '#facc15' : '#38bdf8');
        ctx.fillStyle = flowerColor;
        ctx.beginPath();
        ctx.arc(fx, sy - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(fx - 1, sy - 4, 2, 2);
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(fx - 0.5, sy - 1, 1, 3);
      }

    } else if (plat.type === 'wood' || plat.type === 'bridge') {
      // 4. Wood Platform & Bridge
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(sx, sy, plat.width, plat.height);
      ctx.fillStyle = '#a16207';
      ctx.fillRect(sx, sy, plat.width, 4);
      ctx.fillStyle = '#543009';
      ctx.fillRect(sx, sy + plat.height - 4, plat.width, 4);

      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      for (let px = sx + 28; px < sx + plat.width; px += 28) {
        ctx.beginPath();
        ctx.moveTo(px, sy);
        ctx.lineTo(px, sy + plat.height);
        ctx.stroke();

        ctx.fillStyle = '#fde047';
        ctx.fillRect(px - 4, sy + 3, 2.5, 2.5);
        ctx.fillRect(px + 2, sy + 3, 2.5, 2.5);
      }

      ctx.fillStyle = '#d97706';
      ctx.fillRect(sx, sy + 2, 4, plat.height - 4);
      ctx.fillRect(sx + plat.width - 4, sy + 2, 4, plat.height - 4);

    } else if (plat.type === 'fence') {
      // 5. Country Wooden Farm Fence Post & Cross-Rails
      ctx.fillStyle = '#92400e';
      ctx.fillRect(sx, sy, plat.width, plat.height);
      // Warm sunlit plank highlight & shadow edge
      ctx.fillStyle = '#d97706';
      ctx.fillRect(sx + 2, sy + 2, Math.max(2, plat.width * 0.35), plat.height - 4);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(sx + plat.width - 4, sy + 2, 4, plat.height - 4);

      // Horizontal wooden fence rails with iron nail heads
      const railSpacing = Math.max(16, Math.floor(plat.height / 2.4));
      for (let ry = sy + 9; ry < sy + plat.height - 6; ry += railSpacing) {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(sx - 2, ry, plat.width + 4, 6);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(sx - 2, ry, plat.width + 4, 1.5);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(sx - 2, ry + 5, plat.width + 4, 1);
        // Nail studs
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(sx + 3, ry + 2, 2, 2);
        ctx.fillRect(sx + plat.width - 5, ry + 2, 2, 2);
      }

      // Crisp dark timber outline so fence gaps read clearly
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(sx, sy, plat.width, plat.height);

      // Pointed wooden picket cap on top
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.moveTo(sx + plat.width / 2, sy - 6);
      ctx.lineTo(sx + plat.width, sy);
      ctx.lineTo(sx, sy);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.2;
      ctx.stroke();

    } else if (plat.type === 'ruins') {
      // 6. Temple Ruins (Ancient weathered carved stone, zero lava fissures)
      ctx.fillStyle = '#292524';
      ctx.fillRect(sx, sy, plat.width, plat.height);
      ctx.fillStyle = '#44403c';
      ctx.fillRect(sx, sy, plat.width, 5);
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(sx, sy + plat.height - 4, plat.width, 4);

      // Ancient stone brick grooves
      ctx.strokeStyle = '#1c1917';
      ctx.lineWidth = 1.5;
      for (let bx = sx + 28; bx < sx + plat.width; bx += 28) {
        ctx.beginPath();
        ctx.moveTo(bx, sy);
        ctx.lineTo(bx, sy + plat.height);
        ctx.stroke();
      }

      // Overgrowing clean moss patches
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(sx + 4, sy, 12, 4);
      ctx.fillRect(sx + plat.width - 20, sy, 14, 4);
      ctx.fillStyle = '#15803d';
      ctx.fillRect(sx + 6, sy + 3, 8, 3);

    } else {
      // 7. Cobblestone
      ctx.fillStyle = '#475569';
      ctx.fillRect(sx, sy, plat.width, plat.height);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(sx, sy, plat.width, 3);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(sx, sy + plat.height - 4, plat.width, 4);

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      for (let bx = sx + 26; bx < sx + plat.width; bx += 26) {
        ctx.beginPath();
        ctx.moveTo(bx, sy);
        ctx.lineTo(bx, sy + plat.height);
        ctx.stroke();
      }

      if (plat.width >= 80) {
        const gemX = sx + plat.width / 2;
        const gemY = sy + plat.height / 2;
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(gemX, gemY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f3e8ff';
        ctx.fillRect(gemX - 1, gemY - 2, 2, 2);
      }
    }

    if (plat.isMoving) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(sx + plat.width / 2 - 5, sy + plat.height / 2 - 4, 10, 8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx + plat.width / 2 - 2, sy + plat.height / 2 - 2, 4, 4);

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(sx + 2, sy + 3, 5, plat.height - 6);
      ctx.fillRect(sx + plat.width - 7, sy + 3, 5, plat.height - 6);
    }
  }

  // --- Interactive Swinging Farm Gates Inside Fence Gaps ---
  public renderFenceGates(
    platforms: Platform[],
    player: PlayerState,
    camera: Camera,
    time: number
  ) {
    const fences = platforms.filter(p => p.type === 'fence');
    if (fences.length === 0) return;

    // Group fence posts by horizontal column so we can locate every pass-through gap
    const columns = new Map<number, Platform[]>();
    for (const f of fences) {
      const col = columns.get(f.x);
      if (col) col.push(f);
      else columns.set(f.x, [f]);
    }

    const groundPlatforms = platforms.filter(p => p.type !== 'fence');
    const pCenterX = player.x + player.width / 2;
    const pCenterY = player.y + player.height / 2;
    const ctx = this.ctx;

    let colIdx = 0;
    for (const [colX, segments] of columns.entries()) {
      colIdx++;
      segments.sort((a, b) => a.y - b.y);
      const colW = segments[0].width;

      // Collect gaps: between stacked fence posts, and under elevated fence posts down to the grass floor
      const gaps: { key: string; topY: number; bottomY: number; isGroundGap: boolean }[] = [];
      for (let i = 0; i < segments.length - 1; i++) {
        const upper = segments[i];
        const lower = segments[i + 1];
        const gapTop = upper.y + upper.height;
        const gapBottom = lower.y;
        if (gapBottom - gapTop >= 28) {
          gaps.push({ key: `${upper.id}_gap`, topY: gapTop, bottomY: gapBottom, isGroundGap: false });
        }
      }

      const last = segments[segments.length - 1];
      const lastBottom = last.y + last.height;
      let supportingGroundY = Infinity;
      for (const g of groundPlatforms) {
        if (g.x <= colX + colW && g.x + g.width >= colX && g.y >= lastBottom) {
          if (g.y < supportingGroundY) supportingGroundY = g.y;
        }
      }
      if (supportingGroundY < Infinity && supportingGroundY - lastBottom >= 32) {
        gaps.push({
          key: `${last.id}_ground_gap`,
          topY: lastBottom,
          bottomY: supportingGroundY,
          isGroundGap: true
        });
      }

      for (const gap of gaps) {
        const sx = colX - camera.x;
        if (sx < -80 || sx > this.canvas.width + 80) continue;

        const gateCenterX = colX + colW / 2;
        const gapH = gap.bottomY - gap.topY;
        const gateLen = Math.max(24, gapH - 6);
        const hingeScreenX = sx + colW / 2;
        const hingeScreenY = gap.topY - camera.y + 2;

        // Retrieve or initialize damped spring state for this swinging gate
        let state = this.fenceGateStates.get(gap.key);
        if (!state || time < state.lastTime) {
          state = { angle: 0, vel: 0, lastTime: time, isOpen: false, lastLatchSoundTime: -1 };
          this.fenceGateStates.set(gap.key, state);
        }
        const dt = Math.min(0.05, Math.max(0.001, time - state.lastTime));
        state.lastTime = time;

        // Detect when the chicken approaches or moves through this fence gap
        const dx = pCenterX - gateCenterX;
        const absDx = Math.abs(dx);
        const inVerticalBand = pCenterY >= gap.topY - 26 && pCenterY <= gap.bottomY + 26;
        const triggerRadius = 56;
        const isInteracting = absDx < triggerRadius && inVerticalBand;
        const approachGlow = inVerticalBand && absDx < 84 ? Math.max(0, 1 - absDx / 84) : 0;

        let targetAngle = Math.sin(time * 2.1 + colIdx * 1.7) * 0.032; // subtle idle farm breeze
        let stiffness = 46;
        let damping = 5.4;

        if (isInteracting) {
          const proximity = Math.min(1, 1 - (absDx / triggerRadius) * 0.55);
          // Negative angle swings bottom of the hanging gate to the RIGHT; positive swings it LEFT
          let swingSign: number;
          if (Math.abs(player.vx) > 15) {
            swingSign = player.vx > 0 ? -1 : 1;
          } else {
            swingSign = dx <= 0 ? -1 : 1;
          }
          targetAngle = swingSign * (1.28 * proximity + 0.16);
          stiffness = 88;
          damping = 10.5;
        }

        const accel = (targetAngle - state.angle) * stiffness - state.vel * damping;
        state.vel += accel * dt;
        state.angle += state.vel * dt;
        state.angle = Math.max(-1.52, Math.min(1.52, state.angle));

        // Crisp latch clicking sound when opening and when latching back shut
        if (isInteracting && !state.isOpen && Math.abs(state.angle) > 0.18) {
          state.isOpen = true;
          if (time - state.lastLatchSoundTime > 0.16) {
            audio.playGateLatch(true);
            state.lastLatchSoundTime = time;
          }
        } else if (!isInteracting && state.isOpen && Math.abs(state.angle) < 0.16 && Math.abs(state.vel) < 3.2) {
          state.isOpen = false;
          if (time - state.lastLatchSoundTime > 0.16) {
            audio.playGateLatch(false);
            state.lastLatchSoundTime = time;
          }
        }

        ctx.save();

        // Brass catch bracket on lower fence post (when there is a lower post)
        if (!gap.isGroundGap) {
          const catchY = gap.bottomY - camera.y - 3;
          ctx.fillStyle = approachGlow > 0.1 ? '#fde047' : '#d97706';
          ctx.fillRect(hingeScreenX - 4, catchY, 8, 4);
          ctx.fillStyle = '#451a03';
          ctx.fillRect(hingeScreenX - 2, catchY + 1, 4, 2);
        }

        // Subtle curved motion-arc trail while swinging briskly open/shut
        const swingSpeed = Math.abs(state.vel);
        if (swingSpeed > 1.4) {
          const trailAlpha = Math.min(0.45, (swingSpeed - 1.4) * 0.11);
          ctx.strokeStyle = `rgba(254, 243, 199, ${trailAlpha.toFixed(3)})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          const a0 = Math.PI / 2 + state.angle;
          const a1 = a0 - Math.sign(state.vel) * Math.min(0.42, swingSpeed * 0.06);
          ctx.arc(hingeScreenX, hingeScreenY, gateLen - 4, Math.min(a0, a1), Math.max(a0, a1));
          ctx.stroke();

          // Tiny wooden dust / straw flecks puffing off the swinging gate tip
          const tipX = hingeScreenX - Math.sin(state.angle) * (gateLen - 6);
          const tipY = hingeScreenY + Math.cos(state.angle) * (gateLen - 6);
          ctx.fillStyle = `rgba(253, 224, 71, ${(trailAlpha * 1.4).toFixed(3)})`;
          ctx.fillRect(tipX + Math.sin(time * 22) * 4, tipY - 3, 2.5, 2.5);
          ctx.fillRect(tipX - Math.cos(time * 18) * 5, tipY + 2, 2, 2);
        }

        // Swinging Wooden Saloon / Coop Gate Leaf pivoted at the top iron hinge
        ctx.translate(hingeScreenX, hingeScreenY);
        ctx.rotate(state.angle);

        const leafW = 10;
        // Drop shadow for crisp depth
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.fillRect(-leafW / 2 + 2, 2, leafW, gateLen);

        // Main cedar gate frame
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-leafW / 2, 0, leafW, gateLen);

        // Warm sunlit front plank edge & darker recessed bevel
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-leafW / 2 + 1.5, 1, 3, gateLen - 2);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(leafW / 2 - 2.5, 1, 2, gateLen - 2);

        // Horizontal wooden slat cross-bars with metal rivets
        const bar1Y = Math.round(gateLen * 0.28);
        const bar2Y = Math.round(gateLen * 0.68);
        for (const by of [bar1Y, bar2Y]) {
          ctx.fillStyle = '#92400e';
          ctx.fillRect(-leafW / 2 - 1.5, by, leafW + 3, 4);
          ctx.fillStyle = '#fcd34d';
          ctx.fillRect(-leafW / 2 - 1.5, by, leafW + 3, 1);
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(-1, by + 1.5, 2, 1.5);
        }

        // Dark crisp wood outline
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-leafW / 2, 0, leafW, gateLen);

        // Golden brass latch tip at bottom of the swinging gate (glints when player approaches)
        const latchGlow = Math.abs(state.angle) > 0.25 || approachGlow > 0.15;
        ctx.fillStyle = latchGlow ? '#fef08a' : '#eab308';
        ctx.fillRect(-3.5, gateLen - 5, 7, 4);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-1.5, gateLen - 4, 3, 2);

        ctx.restore();

        // Stationary forged iron hinge mount pinned to the upper fence beam
        ctx.save();
        ctx.fillStyle = '#334155';
        ctx.fillRect(hingeScreenX - 6, hingeScreenY - 4, 12, 6);
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(hingeScreenX, hingeScreenY, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(hingeScreenX - 1, hingeScreenY - 1.5, 1.5, 1.5);
        ctx.restore();
      }
    }
  }

  // --- Spikes & Hazardous Obstacles: Styled High-Definition Caltrops ---

  public renderSpikes(spikes: { x: number; y: number; width: number; height: number }[], camera: Camera) {
    const ctx = this.ctx;
    spikes.forEach(s => {
      const sx = s.x - camera.x;
      const sy = s.y - camera.y;

      if (sx + s.width < -40 || sx > this.canvas.width + 40) return;

      // 1. Carved stone bedrock foundation with bevel
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(sx, sy + s.height - 6, s.width, 6);
      ctx.fillStyle = '#475569';
      ctx.fillRect(sx, sy + s.height - 7, s.width, 2);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(sx, sy + s.height - 2, s.width, 2);

      // Warning rivets along base
      for (let rx = sx + 6; rx < sx + s.width; rx += 14) {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(rx, sy + s.height - 5, 2.5, 2.5);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(rx, sy + s.height - 5, 1, 1);
      }

      // 2. Individual gleam-honed steel spikes
      const spikeW = 12;
      const count = Math.max(1, Math.floor(s.width / spikeW));
      for (let i = 0; i < count; i++) {
        const spkX = sx + i * spikeW;
        const spkPeakX = spkX + spikeW / 2;
        const spkPeakY = sy;

        // Dark steel shadow side
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(spkPeakX, spkPeakY);
        ctx.lineTo(spkX + spikeW, sy + s.height - 6);
        ctx.lineTo(spkPeakX, sy + s.height - 6);
        ctx.closePath();
        ctx.fill();

        // Gleaming steel lit side
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.moveTo(spkPeakX, spkPeakY);
        ctx.lineTo(spkX, sy + s.height - 6);
        ctx.lineTo(spkPeakX, sy + s.height - 6);
        ctx.closePath();
        ctx.fill();

        // Razor-sharp specular highlight on edge
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(spkPeakX, spkPeakY);
        ctx.lineTo(spkPeakX, sy + s.height - 6);
        ctx.stroke();

        // Glistening crimson blood-dipped barb tip
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(spkPeakX, spkPeakY);
        ctx.lineTo(spkPeakX + 3.5, spkPeakY + 7);
        ctx.lineTo(spkPeakX - 3.5, spkPeakY + 7);
        ctx.closePath();
        ctx.fill();

        // Glossy highlight dot on tip
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(spkPeakX - 0.5, spkPeakY + 1.5, 1.5, 2);
      }
    });
  }

  // --- Checkpoints: Firmly Planted on the Floating Land (Never Floating in Air!) ---

  public renderCheckpoint(
    cp: Checkpoint, 
    camera: Camera, 
    time: number, 
    platforms?: Platform[]
  ) {
    const ctx = this.ctx;
    const sx = cp.x - camera.x;

    // Anchor firmly on top of the solid floating platform land (never floating in air!)
    let groundY = cp.y;
    if (platforms && platforms.length > 0) {
      // Find the supporting platform directly beneath or around this checkpoint
      const matching = platforms.filter(p => p.x - 24 <= cp.x && p.x + p.width + 24 >= cp.x);
      if (matching.length > 0) {
        matching.sort((a, b) => Math.abs(a.y - cp.y) - Math.abs(b.y - cp.y));
        groundY = matching[0].y;
      }
    }
    const sy = groundY - camera.y;

    if (sx < -40 || sx > this.canvas.width + 40) return;

    ctx.save();

    // Small 5 by 5 square platform pad sitting firmly on the ground platform
    const padSize = 24; // 5x5 square matrix platform pad
    const padX = sx - padSize / 2;
    const padY = sy - 8;

    if (cp.reached) {
      // ACTIVE CHECKPOINT: Platform has changed after being stepped on!
      // 1. Radiant emerald beacon light pillar shooting into the sky
      const beamGrad = ctx.createLinearGradient(0, padY - 70, 0, padY);
      beamGrad.addColorStop(0, 'rgba(74, 222, 128, 0)');
      beamGrad.addColorStop(0.5, 'rgba(74, 222, 128, 0.25)');
      beamGrad.addColorStop(1, 'rgba(74, 222, 128, 0.65)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(padX - 4, padY - 70, padSize + 8, 70);

      // 2. Glowing platform stone foundation
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(padX - 2, padY, padSize + 4, 8);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1;
      ctx.strokeRect(padX - 2, padY, padSize + 4, 8);

      // 3. 5 by 5 Grid of Luminous Energy Squares (small square cells)
      const cellSize = 3.8;
      const gridStartX = padX + 2;
      const gridStartY = padY + 1;

      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          const cx = gridStartX + col * (cellSize + 0.3);
          const cy = gridStartY + (row % 2) * 2;
          const isCross = row === 2 || col === 2;
          const isCenter = row === 2 && col === 2;
          ctx.fillStyle = isCenter ? '#ffffff' : (isCross ? '#fef08a' : '#4ade80');
          ctx.fillRect(cx, cy, cellSize, 2);
        }
      }

      // 4. Center Glowing Runic Symbol
      const runePulse = 0.85 + Math.sin(time * 8) * 0.15;
      ctx.fillStyle = `rgba(254, 240, 138, ${runePulse})`;
      ctx.beginPath();
      ctx.arc(sx, padY + 2, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#15803d';
      ctx.fillRect(sx - 1, padY + 1, 2, 2);

      // 5. Rising Sparkles & Magic Stars
      for (let s = 0; s < 4; s++) {
        const sparkOffset = (time * 25 + s * 14) % 35;
        const sparkX = sx + Math.sin(time * 4 + s * 2) * 10;
        const sparkY = padY - sparkOffset;
        ctx.fillStyle = s % 2 === 0 ? '#4ade80' : '#fef08a';
        ctx.fillRect(sparkX, sparkY, 2.5, 2.5);
      }

    } else {
      // DORMANT CHECKPOINT: Small 5 by 5 square platform before being stepped on
      // 1. Weathered ancient slate stone foundation
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(padX - 2, padY, padSize + 4, 8);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(padX - 2, padY, padSize + 4, 8);

      // 2. 5 by 5 Grid of Dormant Stone Squares
      const cellSize = 3.8;
      const gridStartX = padX + 2;
      const gridStartY = padY + 1;

      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          const cx = gridStartX + col * (cellSize + 0.3);
          const cy = gridStartY + (row % 2) * 2;
          const isBorder = row === 0 || row === 4 || col === 0 || col === 4;
          ctx.fillStyle = isBorder ? '#334155' : '#475569';
          ctx.fillRect(cx, cy, cellSize, 2);
        }
      }

      // 3. Dormant unlit central rune stone
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(sx, padY + 2, 3.5, 0, Math.PI * 2);
      ctx.fill();
      // Dim resting yellow amber notch
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(sx - 1, padY + 1, 2, 2);
    }

    ctx.restore();
  }

  // --- Collectibles & Treasure Chests ---

  public renderCoin(coin: Coin, camera: Camera, time: number) {
    if (coin.collected) return;
    const ctx = this.ctx;
    const sx = Math.round(coin.x - camera.x);
    const sy = Math.round(coin.y - camera.y + Math.sin(time * 4.2 + coin.animOffset) * 3.5);

    if (sx < -24 || sx > this.canvas.width + 24) return;

    ctx.save();
    ctx.translate(sx, sy);

    // Subtle horizontal spin factor while keeping pixel blocks crisp
    const scaleX = 0.85 + Math.cos(time * 3 + coin.animOffset) * 0.25;
    ctx.scale(scaleX, 1);

    // Pixel unit size: 2.2px per pixel block (total size approx 22x22px)
    const u = 2.2;
    const ox = -5 * u;
    const oy = -5 * u;

    // Golden ambient sparkle glow aura around the coin
    const glowPulse = 0.35 + Math.sin(time * 6 + coin.animOffset) * 0.2;
    ctx.fillStyle = `rgba(250, 204, 21, ${glowPulse})`;
    ctx.fillRect(ox - u, oy - u, 12 * u, 12 * u);

    // --- 1. Dark Brown Pixel Outline (#3b1302) ---
    ctx.fillStyle = '#3b1302';
    // Top & bottom caps
    ctx.fillRect(ox + 3 * u, oy + 0 * u, 4 * u, u);
    ctx.fillRect(ox + 3 * u, oy + 9 * u, 4 * u, u);
    // Upper & lower stepped shoulders
    ctx.fillRect(ox + 1 * u, oy + 1 * u, 2 * u, u);
    ctx.fillRect(ox + 7 * u, oy + 1 * u, 2 * u, u);
    ctx.fillRect(ox + 1 * u, oy + 8 * u, 2 * u, u);
    ctx.fillRect(ox + 7 * u, oy + 8 * u, 2 * u, u);
    // Outer vertical edges
    ctx.fillRect(ox + 0 * u, oy + 2 * u, u, u);
    ctx.fillRect(ox + 9 * u, oy + 2 * u, u, u);
    ctx.fillRect(ox + 0 * u, oy + 3 * u, u, 4 * u);
    ctx.fillRect(ox + 9 * u, oy + 3 * u, u, 4 * u);
    ctx.fillRect(ox + 0 * u, oy + 7 * u, u, u);
    ctx.fillRect(ox + 9 * u, oy + 7 * u, u, u);

    // --- 2. Bright Golden Yellow Base Fill (#facc15) ---
    ctx.fillStyle = '#facc15';
    ctx.fillRect(ox + 3 * u, oy + 1 * u, 4 * u, u);
    ctx.fillRect(ox + 1 * u, oy + 2 * u, 8 * u, 6 * u);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(ox + 3 * u, oy + 8 * u, 4 * u, u);

    // --- 3. Top-Left Golden & White Shine Highlights ---
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(ox + 3 * u, oy + 1 * u, 3 * u, u);
    ctx.fillRect(ox + 1 * u, oy + 2 * u, 2 * u, u);
    ctx.fillRect(ox + 1 * u, oy + 3 * u, u, 2 * u);
    // White pixel catchlight glint
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ox + 2 * u, oy + 2 * u, u, u);

    // --- 4. Bottom-Right Warm Amber Shadow Rim ---
    ctx.fillStyle = '#b45309';
    ctx.fillRect(ox + 8 * u, oy + 4 * u, u, 3 * u);
    ctx.fillRect(ox + 7 * u, oy + 7 * u, 2 * u, u);
    ctx.fillRect(ox + 3 * u, oy + 8 * u, 4 * u, u);

    // --- 5. Chicken Feed Pellet in Center of Pellet Coin (#451a03 / #78350f / #b45309) ---
    ctx.fillStyle = '#451a03'; // Pellet dark border
    ctx.fillRect(ox + 3 * u, oy + 3 * u, 4 * u, 4 * u);
    ctx.fillStyle = '#78350f'; // Rich feed pellet body
    ctx.fillRect(ox + 3.5 * u, oy + 3.5 * u, 3 * u, 3 * u);
    ctx.fillStyle = '#b45309'; // Pellet grain shading
    ctx.fillRect(ox + 4 * u, oy + 4 * u, 2 * u, 2 * u);
    ctx.fillStyle = '#fde68a'; // Pellet seed highlight dot
    ctx.fillRect(ox + 4 * u, oy + 4 * u, u, u);

    ctx.restore();
  }

  public renderChest(chest: TreasureChest, camera: Camera, time: number) {
    const ctx = this.ctx;
    const sx = chest.x - camera.x;
    const sy = chest.y - camera.y;

    if (sx < -60 || sx > this.canvas.width + 60) return;

    const isShieldChest = chest.rewardType === 'shield';

    // Radiant vertical beacon beam for Shield Chest!
    if (isShieldChest && !chest.opened) {
      ctx.save();
      const beamGrad = ctx.createLinearGradient(0, sy - 140, 0, sy + chest.height);
      beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      beamGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.35)');
      beamGrad.addColorStop(0.9, 'rgba(250, 204, 21, 0.45)');
      beamGrad.addColorStop(1, 'rgba(250, 204, 21, 0.7)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(sx - 10, sy - 140, chest.width + 20, 140 + chest.height);

      // Rotating floating Shield Hologram above the chest
      const shieldHoverY = sy - 28 + Math.sin(time * 4) * 4;
      ctx.translate(sx + chest.width / 2, shieldHoverY);
      
      // Mini shield icon
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(-9, -11);
      ctx.lineTo(9, -11);
      ctx.lineTo(9, 2);
      ctx.lineTo(0, 12);
      ctx.lineTo(-9, 2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(-7, -9);
      ctx.lineTo(7, -9);
      ctx.lineTo(7, 1);
      ctx.lineTo(0, 10);
      ctx.lineTo(-7, 1);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-1.5, -6, 3, 3);
      ctx.fillRect(-1, -1, 2, 6);

      // Floating Tag Label
      ctx.textAlign = 'center';
      ctx.font = '700 10px "Silkscreen", monospace';
      ctx.fillStyle = '#fde047';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.fillText("★ ROYAL SHIELD ★", 0, -18);
      ctx.restore();
    }

    ctx.fillStyle = isShieldChest ? '#0f172a' : '#78350f';
    ctx.fillRect(sx, sy + 8, chest.width, chest.height - 8);

    ctx.fillStyle = isShieldChest ? '#38bdf8' : '#f59e0b';
    ctx.fillRect(sx + 3, sy + 8, 4, chest.height - 8);
    ctx.fillRect(sx + chest.width - 7, sy + 8, 4, chest.height - 8);
    ctx.fillRect(sx, sy + chest.height - 4, chest.width, 4);

    ctx.fillStyle = isShieldChest ? '#e0f2fe' : '#facc15';
    ctx.fillRect(sx + chest.width / 2 - 3, sy + 10, 6, 6);
    ctx.fillStyle = '#000000';
    ctx.fillRect(sx + chest.width / 2 - 1, sy + 12, 2, 3);

    if (chest.opened) {
      ctx.fillStyle = isShieldChest ? '#0284c7' : '#92400e';
      ctx.beginPath();
      ctx.moveTo(sx, sy + 8);
      ctx.lineTo(sx - 4, sy - 8);
      ctx.lineTo(sx + chest.width + 4, sy - 8);
      ctx.lineTo(sx + chest.width, sy + 8);
      ctx.closePath();
      ctx.fill();

      ctx.save();
      ctx.globalAlpha = 0.6 + Math.sin(time * 8) * 0.25;
      ctx.fillStyle = isShieldChest ? '#38bdf8' : '#fef08a';
      ctx.beginPath();
      ctx.moveTo(sx + 4, sy + 10);
      ctx.lineTo(sx - 10, sy - 30);
      ctx.lineTo(sx + chest.width + 10, sy - 30);
      ctx.lineTo(sx + chest.width - 4, sy + 10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else {
      ctx.fillStyle = isShieldChest ? '#0369a1' : '#92400e';
      ctx.fillRect(sx, sy, chest.width, 11);
      ctx.fillStyle = isShieldChest ? '#0284c7' : '#b45309';
      ctx.fillRect(sx + 2, sy + 1, chest.width - 4, 3);
      ctx.fillStyle = isShieldChest ? '#38bdf8' : '#f59e0b';
      ctx.fillRect(sx + 4, sy, 4, 11);
      ctx.fillRect(sx + chest.width - 8, sy, 4, 11);
    }
  }

  // --- Local Friend: Silkie Sam (Quietly sneaks in behind the boss to deliver Royal Shield & Netherite Sword!) ---
  public renderSilkieSam(sam: SilkieSamFriend, camera: Camera, time: number) {
    if (sam.state === 'waiting') return;

    if (sam.state === 'gone') {
      // Even after Sam sneaks away, render dropped shield or sword until picked up!
      if (sam.shieldDropped && !sam.shieldCollected) {
        this.renderDroppedRoyalShield(sam.shieldX, sam.shieldY, camera, time);
      }
      if (sam.swordDropped && !sam.swordCollected && sam.swordX !== undefined && sam.swordY !== undefined) {
        this.renderDroppedNetheriteSword(sam.swordX, sam.swordY, camera, time);
      }
      return;
    }

    const ctx = this.ctx;
    const sx = sam.x - camera.x;
    const sy = sam.y - camera.y;

    // 1. If shield or sword is on the ground, render them
    if (sam.shieldDropped && !sam.shieldCollected) {
      this.renderDroppedRoyalShield(sam.shieldX, sam.shieldY, camera, time);
    }
    if (sam.swordDropped && !sam.swordCollected && sam.swordX !== undefined && sam.swordY !== undefined) {
      this.renderDroppedNetheriteSword(sam.swordX, sam.swordY, camera, time);
    }

    if (sx < -100 || sx > this.canvas.width + 100 || sy < -100 || sy > this.canvas.height + 100) return;

    const isTiptoeing = sam.state === 'flying_in' || sam.state === 'flying_away';
    const isSneakLeaving = sam.state === 'flying_away';
    const hoverBob = isTiptoeing ? Math.abs(Math.sin(time * 9)) * -2.2 : Math.sin(time * 3) * 1.1;

    ctx.save();
    ctx.translate(sx, sy + 6 + hoverBob);

    // Subtle tiptoe crouch tilt so Sam looks stealthy & quiet behind the boss!
    ctx.scale(isSneakLeaving ? -0.92 : 0.92, 0.88);
    ctx.rotate(isTiptoeing ? 0.14 : 0.06);

    // 2. Silkie Sam Character Model
    const isSpeaking = sam.state === 'talk_psst' || sam.state === 'talk_1' || sam.state === 'talk_2' || sam.state === 'talk_3';

    // Ground shadow directly beneath tiptoeing feet
    ctx.fillStyle = 'rgba(0, 0, 0, 0.34)';
    ctx.beginPath();
    ctx.ellipse(2, 23, 18, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle tiny stealth tiptoe dust specks while sneaking quietly
    if (isTiptoeing && Math.sin(time * 12) > 0.35) {
      ctx.fillStyle = 'rgba(226, 232, 240, 0.45)';
      ctx.beginPath();
      ctx.arc(-14, 21, 2.2, 0, Math.PI * 2);
      ctx.arc(-19, 19, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Silkie Tail: Ultra-fluffy cloud puffs (Cloud plumage)
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(-18, -4, 10, 0, Math.PI * 2);
    ctx.arc(-24, -9, 9, 0, Math.PI * 2);
    ctx.arc(-22, 3, 8.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(-17, -4, 9, 0, Math.PI * 2);
    ctx.arc(-23, -8, 8, 0, Math.PI * 2);
    ctx.arc(-21, 2, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Pure White Fluffy Body: Soft cotton cloud puffs
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.ellipse(0, 3, 19, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(-2, 1, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Soft feathery cloud puffs around torso
    const bodyPuffs = [
      { x: -12, y: -6, r: 8.5 },
      { x: 0, y: -8, r: 9 },
      { x: 12, y: -6, r: 8.5 },
      { x: -13, y: 6, r: 8 },
      { x: 12, y: 6, r: 8 },
      { x: 0, y: 9, r: 8.5 },
    ];
    bodyPuffs.forEach(bp => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(bp.x, bp.y, bp.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Fluffy Wings (Animated Flapping)
    ctx.save();
    ctx.translate(-4, -1);
    ctx.rotate(sam.wingAngle);
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.ellipse(-6, 2, 14, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-5, 0, 12, 6, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Silkie Head - Snowy white plumage
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(10, -9, 11, 0, Math.PI * 2);
    ctx.fill();

    // Dark Slate Face (Iconic Silkie melanistic skin - matches shop portrait)
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(13, -7, 8.5, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glorious Fluffy Silkie Pom-Pom Crest (Crown of clouds with animated speech bounce!)
    const crestBob = isSpeaking ? Math.sin(time * 16) * 1.5 : 0;
    const crestPuffs = [
      [8, -19 + crestBob, 8], [15, -18 + crestBob, 7], [3, -16 + crestBob, 7],
      [10, -24 + crestBob, 6.5], [6, -21 + crestBob, 7], [14, -22 + crestBob, 6],
      [0, -12 + crestBob, 6], [18, -13 + crestBob, 6]
    ];
    crestPuffs.forEach(([px, py, pr]) => {
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(px, py, pr + 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    });

    // Walnut / Mulberry Comb under crest
    ctx.fillStyle = '#4a044e';
    ctx.beginPath();
    ctx.ellipse(14, -14, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // SIGNATURE TURQUOISE / SKY-BLUE EARGLOBE (The authentic biological trademark of Silkie chickens!)
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.ellipse(8, -6, 3.8, 4.5, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#67e8f9';
    ctx.beginPath();
    ctx.arc(7.5, -6.5, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Sparkling anime eye with dual catchlights (just like shop portrait)
    const isBlinking = isSpeaking ? (Math.sin(time * 14) > 0.88) : false;
    if (!isBlinking) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(14, -9, 4, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(14.5, -9, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(13.8, -10, 1.1, 0, Math.PI * 2);
      ctx.arc(15.2, -8.2, 0.6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(14, -9, 2.8, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    }

    // Slate Blue-Black Beak with animated speech chattering
    const mouthFlap = isSpeaking ? Math.abs(Math.sin(time * 20)) * 2.5 : 0;
    ctx.fillStyle = '#0f172a';
    // Upper beak
    ctx.beginPath();
    ctx.moveTo(19, -8);
    ctx.lineTo(28, -5 - mouthFlap * 0.3);
    ctx.lineTo(19, -4);
    ctx.closePath();
    ctx.fill();
    // Lower beak
    ctx.beginPath();
    ctx.moveTo(19, -4 + mouthFlap * 0.5);
    ctx.lineTo(26, -3 + mouthFlap * 0.8);
    ctx.lineTo(19, -1 + mouthFlap);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#475569';
    ctx.fillRect(19, -6, 5, 1);

    // Merchant Red Bowtie & Golden Coin Pin (matching shop profile)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(4, 2);
    ctx.lineTo(10, 0);
    ctx.lineTo(4, -2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(16, 2);
    ctx.lineTo(10, 0);
    ctx.lineTo(16, -2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#facc15';
    ctx.fillRect(8.5, -1.5, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, -1, 1, 1);

    // Authentic Feathered Silkie Shanks & Five-Toed Slate Feet
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.ellipse(0.5, 16, 4.5, 6, 0.12, 0, Math.PI * 2);
    ctx.ellipse(9.5, 16, 4.5, 6, -0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0.5, 15, 3.6, 5, 0.1, 0, Math.PI * 2);
    ctx.ellipse(9.5, 15, 3.6, 5, -0.1, 0, Math.PI * 2);
    ctx.fill();
    // Fine silky ankle filaments
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-2, 17); ctx.lineTo(-5, 19);
    ctx.moveTo(12, 17); ctx.lineTo(15, 19);
    ctx.stroke();
    // Dark slate-blue melanistic claws
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-2.5, 20, 6, 3);
    ctx.fillRect(6.5, 20, 6, 3);
    ctx.fillStyle = '#334155';
    ctx.fillRect(-1.5, 20.5, 4, 1.5);
    ctx.fillRect(7.5, 20.5, 4, 1.5);

    // If carrying the shield before dropping it:
    if (!sam.shieldDropped) {
      ctx.save();
      ctx.translate(-8, 22);
      this.drawShieldSprite(ctx, 0.9);
      ctx.restore();
    }

    // If carrying the Netherite sword before dropping it:
    if (!sam.swordDropped) {
      ctx.save();
      ctx.translate(14, 20);
      ctx.rotate(0.35);
      this.drawDroppedNetheriteSwordSprite(ctx, 0.85);
      ctx.restore();
    }

    ctx.restore(); // restore Sam transform

    // 3. UPGRADED DELUXE PIXELATED WHISPER DIALOGUE SPEECH BUBBLE
    if (sam.state === 'talk_psst' || sam.state === 'talk_1' || sam.state === 'talk_2' || sam.state === 'talk_3' || sam.state === 'dropping_shield' || sam.state === 'dropping_sword') {
      let fullText = "here take this";
      if (sam.state === 'talk_psst') {
        fullText = "psst!";
      } else if (sam.state === 'talk_2' || sam.state === 'dropping_sword') {
        fullText = "oh here is a sword";
      } else if (sam.state === 'talk_3') {
        fullText = "good luck!";
      }
      const displayText = fullText.slice(0, sam.dialogueCharIndex);

      ctx.save();
      const bubbleW = Math.min(265, this.canvas.width - 28);
      ctx.font = '700 10px "Silkscreen", monospace';
      const isTyping = sam.dialogueCharIndex < fullText.length;
      const cursor = (isTyping && Math.floor(Date.now() / 200) % 2 === 0) ? '▮' : '';
      const wrappedSamLines = this.wrapDialogueText(ctx, `“${displayText}${cursor}”`, bubbleW - 68, 2);
      const bubbleH = wrappedSamLines.length > 1 ? 66 : 56;
      const bx = Math.max(18, Math.min(this.canvas.width - bubbleW - 12, sx + 32));
      const by = Math.max(58, sy - 60 + hoverBob);

      // 1. Pixel drop shadow
      ctx.fillStyle = '#000000';
      ctx.fillRect(bx + 4, by + 4, bubbleW, bubbleH);

      // 2. Outer black border
      ctx.fillStyle = '#000000';
      ctx.fillRect(bx, by, bubbleW, bubbleH);

      // 3. Luxurious deep obsidian-indigo arcade gradient
      const bGrad = ctx.createLinearGradient(bx, by, bx, by + bubbleH);
      bGrad.addColorStop(0, '#090d16');
      bGrad.addColorStop(0.5, '#1e1b4b');
      bGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = bGrad;
      ctx.fillRect(bx + 2, by + 2, bubbleW - 4, bubbleH - 4);

      // 4. Chunky Golden Pixel Border
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx + 2, by + 2, bubbleW - 4, bubbleH - 4);

      // 5. Four Gold Corner Studs
      [
        [bx + 3, by + 3],
        [bx + bubbleW - 7, by + 3],
        [bx + 3, by + bubbleH - 7],
        [bx + bubbleW - 7, by + bubbleH - 7]
      ].forEach(([rx, ry]) => {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(rx, ry, 4, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(rx + 1, ry + 1, 1.5, 1.5);
      });

      // 6. Speech Tail pointing towards Silkie Sam's beak
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(bx + 2, by + 20);
      ctx.lineTo(bx - 12, by + 28);
      ctx.lineTo(bx + 2, by + 36);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.moveTo(bx + 3, by + 22);
      ctx.lineTo(bx - 9, by + 28);
      ctx.lineTo(bx + 3, by + 34);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bx + 2, by + 21);
      ctx.lineTo(bx - 10, by + 28);
      ctx.lineTo(bx + 2, by + 35);
      ctx.stroke();

      // 7. Mini Silkie Portrait Icon on Left
      const portX = bx + 10;
      const portY = by + 9;
      const portSize = 38;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(portX, portY, portSize, portSize);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(portX, portY, portSize, portSize);

      // Mini Silkie Sam portrait face inside icon
      ctx.save();
      ctx.beginPath();
      ctx.rect(portX + 1, portY + 1, portSize - 2, portSize - 2);
      ctx.clip();
      const pcx = portX + portSize / 2;
      const pcy = portY + portSize / 2 + 1;

      // Cloud plumage
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(pcx, pcy + 4, 12, 0, Math.PI * 2);
      ctx.fill();
      // Pom-pom crest
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pcx - 3, pcy - 6, 6, 0, Math.PI * 2);
      ctx.arc(pcx + 3, pcy - 6, 6, 0, Math.PI * 2);
      ctx.arc(pcx, pcy - 10, 5, 0, Math.PI * 2);
      ctx.fill();
      // Melanistic dark slate face
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(pcx + 2, pcy - 1, 7, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Signature turquoise earlobe
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.ellipse(pcx - 3, pcy, 2.5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#67e8f9';
      ctx.fillRect(pcx - 4, pcy - 1, 1, 1.5);
      // Anime eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pcx + 3, pcy - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(pcx + 3.3, pcy - 2, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(pcx + 3, pcy - 3, 1, 1);
      // Beak
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(pcx + 7, pcy - 2);
      ctx.lineTo(pcx + 12, pcy);
      ctx.lineTo(pcx + 7, pcy + 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 8. Nameplate Plaque: "SILKIE SAM"
      const textX = bx + 54;
      ctx.font = '700 9px "Silkscreen", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'left';
      ctx.fillText('SILKIE SAM [FRIEND]', textX, by + 19);

      // 9. Speech line with glowing typewriter text & blinking block cursor
      ctx.font = '700 10px "Silkscreen", monospace';
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 3;
      wrappedSamLines.forEach((line, idx) => {
        ctx.fillText(line, textX, by + 37 + idx * 12);
      });
      ctx.shadowBlur = 0;

      ctx.restore();
    }
  }

  // Render Dropped Royal Shield on the platform
  private renderDroppedRoyalShield(shieldX: number, shieldY: number, camera: Camera, time: number) {
    const ctx = this.ctx;
    const sx = shieldX - camera.x;
    const sy = shieldY - camera.y;

    if (sx < -80 || sx > this.canvas.width + 80) return;

    ctx.save();

    // 1. Radiant Celestial Beacon Light Pillar
    const beamGrad = ctx.createLinearGradient(0, sy - 130, 0, sy + 10);
    beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
    beamGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.28)');
    beamGrad.addColorStop(0.85, 'rgba(250, 204, 21, 0.42)');
    beamGrad.addColorStop(1, 'rgba(250, 204, 21, 0.75)');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(sx - 16, sy - 130, 32, 140);

    // Ground platform bounce shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(sx, sy + 12, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bobbing hover motion
    const hover = Math.sin(time * 5) * 4;
    ctx.translate(sx, sy + hover);

    // Draw the Royal Shield Model
    this.drawShieldSprite(ctx, 1.2);

    // Floating item badge tag
    ctx.textAlign = 'center';
    ctx.font = '700 10px "Silkscreen", monospace';
    ctx.fillStyle = '#fde047';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 6;
    ctx.fillText('★ ROYAL SHIELD ★', 0, -22);
    ctx.font = '700 8px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('WALK OVER TO EQUIP', 0, -11);

    // Rising sparkle particles
    for (let i = 0; i < 4; i++) {
      const spkY = -((time * 30 + i * 16) % 45);
      const spkX = Math.sin(time * 4 + i * 2) * 12;
      ctx.fillStyle = i % 2 === 0 ? '#38bdf8' : '#fde047';
      ctx.fillRect(spkX, spkY, 2.5, 2.5);
    }

    ctx.restore();
  }

  // Draw Royal Shield Kite Sprite
  private drawShieldSprite(ctx: CanvasRenderingContext2D, scale: number = 1) {
    ctx.save();
    ctx.scale(scale, scale);

    // Outer Gilded Golden Dragon Rim
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.moveTo(-11, -13);
    ctx.lineTo(11, -13);
    ctx.lineTo(11, 2);
    ctx.lineTo(0, 15);
    ctx.lineTo(-11, 2);
    ctx.closePath();
    ctx.fill();

    // Gilded Edge Highlight
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(-10, -12);
    ctx.lineTo(10, -12);
    ctx.lineTo(10, 1);
    ctx.lineTo(0, 14);
    ctx.lineTo(-10, 1);
    ctx.closePath();
    ctx.fill();

    // Royal Azure Sapphire Field
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(-8, -10);
    ctx.lineTo(8, -10);
    ctx.lineTo(8, 0);
    ctx.lineTo(0, 11);
    ctx.lineTo(-8, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(-6, -8);
    ctx.lineTo(6, -8);
    ctx.lineTo(6, -1);
    ctx.lineTo(0, 9);
    ctx.lineTo(-6, -1);
    ctx.closePath();
    ctx.fill();

    // Golden Heraldic Rooster Emblem on Shield
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(0, -2, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // Crown crest
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-2, -7, 4, 2.5);
    // Beak
    ctx.fillStyle = '#f97316';
    ctx.fillRect(1.5, -3, 2.5, 1.5);

    // Diamond Star Flash in center
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1, -3, 2, 2);

    ctx.restore();
  }

  // Render Dropped Netherite Sword on the platform
  private renderDroppedNetheriteSword(swordX: number, swordY: number, camera: Camera, time: number) {
    const ctx = this.ctx;
    const sx = swordX - camera.x;
    const sy = swordY - camera.y;

    if (sx < -80 || sx > this.canvas.width + 80) return;

    ctx.save();

    // 1. Radiant Enchanted Purple Beacon Light Pillar
    const beamGrad = ctx.createLinearGradient(0, sy - 130, 0, sy + 10);
    beamGrad.addColorStop(0, 'rgba(192, 132, 252, 0)');
    beamGrad.addColorStop(0.4, 'rgba(192, 132, 252, 0.32)');
    beamGrad.addColorStop(0.85, 'rgba(168, 85, 247, 0.45)');
    beamGrad.addColorStop(1, 'rgba(126, 34, 206, 0.8)');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(sx - 16, sy - 130, 32, 140);

    // Ground landing shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(sx, sy + 15, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bobbing hover motion
    const hover = Math.sin(time * 5.5) * 4;
    ctx.translate(sx, sy + hover);

    // Draw the Netherite Sword Model tilted in glory
    ctx.save();
    ctx.rotate(-0.5);
    this.drawDroppedNetheriteSwordSprite(ctx, 1.2);
    ctx.restore();

    // Floating item badge tag
    ctx.textAlign = 'center';
    ctx.font = '700 10px "Silkscreen", monospace';
    ctx.fillStyle = '#c084fc';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 6;
    ctx.fillText('★ NETHERITE SWORD ★', 0, -22);
    ctx.font = '700 8px monospace';
    ctx.fillStyle = '#fde047';
    ctx.fillText('WALK OVER TO EQUIP', 0, -11);

    // Rising purple sparkle particles
    for (let i = 0; i < 4; i++) {
      const spkY = -((time * 30 + i * 16) % 45);
      const spkX = Math.sin(time * 4 + i * 2) * 12;
      ctx.fillStyle = i % 2 === 0 ? '#c084fc' : '#a855f7';
      ctx.fillRect(spkX, spkY, 2.5, 2.5);
    }

    ctx.restore();
  }

  // Draw Netherite Sword Sprite (Obsidian black blade with cosmic purple enchanted shine)
  private drawDroppedNetheriteSwordSprite(ctx: CanvasRenderingContext2D, scale: number = 1) {
    ctx.save();
    ctx.scale(scale, scale);

    // Purple enchantment aura glow
    const swordAura = ctx.createRadialGradient(0, -10, 4, 0, -10, 26);
    swordAura.addColorStop(0, 'rgba(192, 132, 252, 0.45)');
    swordAura.addColorStop(0.7, 'rgba(126, 34, 206, 0.2)');
    swordAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = swordAura;
    ctx.beginPath();
    ctx.arc(0, -10, 26, 0, Math.PI * 2);
    ctx.fill();

    // Hilt (wrapped in dark obsidian twine with purple bindings)
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-2, 7, 4, 11);
    ctx.fillStyle = '#7e22ce';
    ctx.fillRect(-2, 10, 4, 1.5);
    ctx.fillRect(-2, 13, 4, 1.5);

    // Pommel
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.arc(0, 19, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(-1.5, 17.5, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-0.5, 18, 1, 1);

    // Heavy Netherite Crossguard
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-10, 4, 20, 4);
    ctx.fillStyle = '#27272a';
    ctx.fillRect(-9, 5, 18, 2);
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(-1, 4.5, 2, 3);
    ctx.fillRect(-8, 4.5, 2, 2);
    ctx.fillRect(6, 4.5, 2, 2);

    // Double-Edged Obsidian Blade
    const bladeLen = 32;
    // Outer black blade outline
    ctx.fillStyle = '#000000';
    ctx.fillRect(-4.5, -bladeLen + 4, 9, bladeLen);

    // Dark netherite body
    ctx.fillStyle = '#18181b';
    ctx.fillRect(-3.5, -bladeLen + 4, 7, bladeLen);

    // Shadow bevel on left
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-3.5, -bladeLen + 4, 3, bladeLen);

    // Razor-sharp enchanted purple edge on right
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(2.3, -bladeLen + 4, 1.4, bladeLen);

    // Central fuller ridge pulsing with purple energy
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(-0.5, -bladeLen + 7, 1, bladeLen - 6);

    // Stepped pointed tip
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(-4.5, -bladeLen + 4);
    ctx.lineTo(0, -bladeLen - 5);
    ctx.lineTo(4.5, -bladeLen + 4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.moveTo(-3.5, -bladeLen + 4);
    ctx.lineTo(0, -bladeLen - 3);
    ctx.lineTo(3.5, -bladeLen + 4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.moveTo(0, -bladeLen - 3);
    ctx.lineTo(3.5, -bladeLen + 4);
    ctx.lineTo(1.5, -bladeLen + 4);
    ctx.closePath();
    ctx.fill();

    // Specular glints
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1, -bladeLen + 14, 1.5, 1.5);
    ctx.fillRect(-1.5, -bladeLen + 22, 1.5, 1.5);

    ctx.restore();
  }

  // --- Hazards: Volcano, Boulder, Thundercloud (Styled & Detailed) ---

  public renderVolcano(v: VolcanoHazard, camera: Camera) {
    const ctx = this.ctx;
    const sx = v.x - camera.x;
    const sy = v.y - camera.y;

    if (sx < -80 || sx > this.canvas.width + 80) return;

    const styleIdx = ((v.styleVariant ?? this.hashVariant(v.id, 3)) % 3 + 3) % 3;
    const styles = [
      // 0: Obsidian & Arterial Crimson Magma Vent
      {
        base: '#18181b',
        mid: '#27272a',
        ridge: '#3f3f46',
        crust: '#52525b',
        veinCold: '#7f1d1d',
        veinHot: '#ef4444',
        veinBright: '#fb923c',
        rimCold: '#991b1b',
        rimHot: '#f97316',
        coreHot: '#fef08a',
        aura: 'rgba(239, 68, 68, 0.45)',
        smoke: 'rgba(113, 113, 122, 0.78)',
        blobOuter: 'rgba(239, 68, 68, 0.82)',
      },
      // 1: Basalt & Sulfur-Amber Caldera Vent
      {
        base: '#231812',
        mid: '#3b261c',
        ridge: '#573726',
        crust: '#ca8a04',
        veinCold: '#92400e',
        veinHot: '#f59e0b',
        veinBright: '#fde047',
        rimCold: '#b45309',
        rimHot: '#facc15',
        coreHot: '#ffffff',
        aura: 'rgba(245, 158, 11, 0.48)',
        smoke: 'rgba(161, 138, 102, 0.76)',
        blobOuter: 'rgba(245, 158, 11, 0.85)',
      },
      // 2: Scorched Slate & Magma-Rose Vent
      {
        base: '#171526',
        mid: '#26233d',
        ridge: '#3c375c',
        crust: '#6d28d9',
        veinCold: '#881337',
        veinHot: '#f43f5e',
        veinBright: '#fda4af',
        rimCold: '#9f1239',
        rimHot: '#fb7185',
        coreHot: '#fff1f2',
        aura: 'rgba(244, 63, 94, 0.46)',
        smoke: 'rgba(124, 115, 155, 0.75)',
        blobOuter: 'rgba(244, 63, 94, 0.82)',
      },
    ];
    const pal = styles[styleIdx];

    // Peaceful mode: Dead / Dormant Extinct Volcano
    if (v.isDead) {
      ctx.fillStyle = pal.base;
      ctx.beginPath();
      ctx.moveTo(sx - 5, sy + v.height);
      ctx.lineTo(sx + 10, sy);
      ctx.lineTo(sx + v.width - 10, sy);
      ctx.lineTo(sx + v.width + 5, sy + v.height);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = pal.mid;
      ctx.fillRect(sx + 4, sy + v.height * 0.45, v.width - 8, v.height * 0.55);

      ctx.fillStyle = '#15803d';
      ctx.fillRect(sx + 12, sy + 10, 10, 6);
      ctx.fillRect(sx + v.width - 22, sy + Math.round(v.height * 0.45), 12, 7);

      ctx.fillStyle = '#292524';
      ctx.fillRect(sx + 10, sy, v.width - 20, 6);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(sx + 14, sy - 2, v.width - 28, 2);
      return;
    }

    const isHot = v.state === 'warning' || v.state === 'erupting';

    // 1. Stepped medium volcanic cone silhouette with chunky basalt shoulders
    ctx.fillStyle = pal.base;
    ctx.beginPath();
    ctx.moveTo(sx - 6, sy + v.height);
    ctx.lineTo(sx + 4, sy + v.height * 0.42);
    ctx.lineTo(sx + 11, sy);
    ctx.lineTo(sx + v.width - 11, sy);
    ctx.lineTo(sx + v.width - 4, sy + v.height * 0.42);
    ctx.lineTo(sx + v.width + 6, sy + v.height);
    ctx.closePath();
    ctx.fill();

    // Faceted rock ribs for depth
    ctx.fillStyle = pal.mid;
    ctx.beginPath();
    ctx.moveTo(sx + 6, sy + v.height);
    ctx.lineTo(sx + 16, sy + 6);
    ctx.lineTo(sx + v.width * 0.48, sy + v.height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = pal.ridge;
    ctx.beginPath();
    ctx.moveTo(sx + v.width * 0.55, sy + v.height);
    ctx.lineTo(sx + v.width - 15, sy + 7);
    ctx.lineTo(sx + v.width - 5, sy + v.height);
    ctx.closePath();
    ctx.fill();

    // Mineral / sulfur crust shelves on medium slopes
    ctx.fillStyle = pal.crust;
    ctx.fillRect(sx + 8, sy + Math.round(v.height * 0.52), 8, 4);
    ctx.fillRect(sx + v.width - 16, sy + Math.round(v.height * 0.36), 7, 4);

    // 2. Glowing arterial magma veins snaking up the vent
    ctx.strokeStyle = isHot ? pal.veinHot : pal.veinCold;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(sx + v.width * 0.34, sy + 7);
    ctx.lineTo(sx + v.width * 0.42, sy + v.height * 0.48);
    ctx.lineTo(sx + v.width * 0.28, sy + v.height - 2);
    ctx.stroke();

    ctx.strokeStyle = isHot ? pal.veinBright : pal.rimCold;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx + v.width * 0.66, sy + 7);
    ctx.lineTo(sx + v.width * 0.57, sy + v.height * 0.44);
    ctx.lineTo(sx + v.width * 0.72, sy + v.height - 2);
    ctx.stroke();

    // 3. Stepped boiling caldera rim
    ctx.fillStyle = pal.base;
    ctx.fillRect(sx + 9, sy - 1, v.width - 18, 9);
    ctx.fillStyle = isHot ? pal.rimHot : pal.rimCold;
    ctx.fillRect(sx + 12, sy + 1, v.width - 24, 6);
    ctx.fillStyle = isHot ? pal.coreHot : pal.veinCold;
    ctx.fillRect(sx + 16, sy + 2, v.width - 32, 3);

    // 4. Warning heat halo & sulfur smoke plumes
    if (v.state === 'warning') {
      ctx.fillStyle = pal.aura;
      ctx.beginPath();
      ctx.arc(sx + v.width / 2, sy - 6, 18 + (v.height - 36) * 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = pal.smoke;
      ctx.beginPath();
      ctx.arc(sx + v.width / 2 - 6, sy - 18, 10, 0, Math.PI * 2);
      ctx.arc(sx + v.width / 2 + 7, sy - 27, 13, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = pal.coreHot;
      ctx.fillRect(sx + v.width / 2 - 3, sy - 14, 3, 3);
      ctx.fillRect(sx + v.width / 2 + 8, sy - 33, 3, 3);
    }

    // 5. Eruption lip flare
    if (v.state === 'erupting') {
      ctx.fillStyle = pal.coreHot;
      ctx.fillRect(sx + 13, sy - 6, v.width - 26, 9);
      ctx.fillStyle = pal.rimHot;
      ctx.fillRect(sx + 9, sy - 2, v.width - 18, 4);
    }

    // 6. Render flying magma blobs smoothly even during cooldown until they settle
    if (v.lavaParticles && v.lavaParticles.length > 0) {
      v.lavaParticles.forEach(lp => {
        const lx = lp.x - camera.x;
        const ly = lp.y - camera.y;

        ctx.fillStyle = lp.life > 0.4 ? pal.blobOuter : 'rgba(220, 38, 38, 0.55)';
        ctx.beginPath();
        ctx.arc(lx, ly, lp.radius + 2.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = lp.life > 0.5 ? '#ffffff' : (lp.life > 0.25 ? pal.coreHot : pal.veinHot);
        ctx.beginPath();
        ctx.arc(lx, ly, lp.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  public renderBoulder(b: BoulderHazard, camera: Camera, levelTheme?: LevelConfig['theme']) {
    if (b.respawnTimer > 0) return;
    const ctx = this.ctx;
    const sx = b.x - camera.x;
    const sy = b.y - camera.y;

    // Render Temple Trap Dropper overhead in World 4 and World 5
    if (b.hasTrapDropper) {
      const trapX = (b.trapDropperX ?? b.startX) - camera.x;
      const trapY = (b.trapDropperY ?? (b.startY - 190)) - camera.y;

      if (trapX > -80 && trapX < this.canvas.width + 80) {
        ctx.save();
        const isSnowy = levelTheme === 'snowy' || levelTheme === 'storm';

        // 1. Temple Stone Chute Structure
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(trapX - 34, trapY - 24, 68, 30);
        ctx.fillStyle = '#292524';
        ctx.fillRect(trapX - 30, trapY - 20, 60, 24);

        if (isSnowy) {
          // World 5: Temple trap with wooden supports & tarp covered in snow and ice!
          // Heavy timber crossbeams
          ctx.fillStyle = '#451a03';
          ctx.fillRect(trapX - 36, trapY - 14, 72, 8);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(trapX - 34, trapY - 12, 68, 4);

          // Heavy temple tarp / canopy draped over the trap
          ctx.fillStyle = '#1e293b'; // weathered heavy canvas tarp
          ctx.beginPath();
          ctx.moveTo(trapX - 42, trapY - 10);
          ctx.lineTo(trapX + 42, trapY - 10);
          ctx.lineTo(trapX + 38, trapY + 14);
          ctx.lineTo(trapX - 38, trapY + 14);
          ctx.closePath();
          ctx.fill();

          // Thick snow drifts piled on top of the tarp
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(trapX - 42, trapY - 14, 84, 6);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(trapX - 42, trapY - 16, 84, 4);
          for (let sxPos = trapX - 38; sxPos <= trapX + 34; sxPos += 12) {
            ctx.beginPath();
            ctx.arc(sxPos + 4, trapY - 16, 4, 0, Math.PI * 2);
            ctx.fill();
          }

          // Glistening hanging icicles on the temple tarp hem!
          for (let i = 0; i < 7; i++) {
            const icicleX = trapX - 32 + i * 10;
            const icicleLen = 7 + ((i * 5) % 9);
            ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
            ctx.beginPath();
            ctx.moveTo(icicleX, trapY + 14);
            ctx.lineTo(icicleX + 2.5, trapY + 14 + icicleLen);
            ctx.lineTo(icicleX + 5, trapY + 14);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(icicleX + 1, trapY + 14);
            ctx.lineTo(icicleX + 2.5, trapY + 14 + icicleLen - 1);
            ctx.lineTo(icicleX + 3.5, trapY + 14);
            ctx.closePath();
            ctx.fill();
          }
        } else {
          // World 4: Ancient jungle temple stone carved gargoyle/serpent trap
          ctx.fillStyle = '#064e3b';
          ctx.fillRect(trapX - 34, trapY - 26, 68, 6);
          // Carved teeth on chute
          ctx.fillStyle = '#e7e5e4';
          for (let t = trapX - 26; t < trapX + 26; t += 10) {
            ctx.beginPath();
            ctx.moveTo(t, trapY + 4);
            ctx.lineTo(t + 4, trapY + 12);
            ctx.lineTo(t + 8, trapY + 4);
            ctx.closePath();
            ctx.fill();
          }
          // Hanging jungle vines
          ctx.strokeStyle = '#15803d';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(trapX - 28, trapY + 2);
          ctx.bezierCurveTo(trapX - 32, trapY + 16, trapX - 24, trapY + 24, trapX - 30, trapY + 36);
          ctx.moveTo(trapX + 28, trapY + 2);
          ctx.bezierCurveTo(trapX + 34, trapY + 14, trapX + 26, trapY + 22, trapX + 32, trapY + 34);
          ctx.stroke();
        }

        // 2. Trap doors / Hatch mechanism
        if (!b.triggered) {
          // Trap doors firmly closed with iron latch
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(trapX - 24, trapY + 4, 48, 6);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(trapX - 4, trapY + 3, 8, 8); // Gold trigger pin
        } else {
          // Trap doors swung wide open downward!
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(trapX - 26, trapY + 4, 6, 20);
          ctx.fillRect(trapX + 20, trapY + 4, 6, 20);
        }

        ctx.restore();
      }
    }

    if (sx < -50 || sx > this.canvas.width + 50) return;

    // Falling warning target arrow
    if (b.isFalling && b.warningTimer > 0) {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(sx - 2, 20, 4, 32);
      ctx.beginPath();
      ctx.moveTo(sx - 9, 52);
      ctx.lineTo(sx + 9, 52);
      ctx.lineTo(sx, 66);
      ctx.closePath();
      ctx.fill();

      // Pulsing impact beacon on ground
      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.beginPath();
      ctx.ellipse(sx, b.y - camera.y + b.radius, b.radius * 1.2, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(b.rotation);

    // 1. Granite rock body with multi-tone depth
    ctx.fillStyle = '#44403c'; // stone shadow
    ctx.beginPath();
    ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#78716c'; // lit granite face
    ctx.beginPath();
    ctx.arc(-b.radius * 0.15, -b.radius * 0.15, b.radius * 0.85, 0, Math.PI * 2);
    ctx.fill();

    // 2. Chiseled crags and fractures
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Internal fracture lines
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-b.radius * 0.6, -b.radius * 0.3);
    ctx.lineTo(-b.radius * 0.1, 0);
    ctx.lineTo(-b.radius * 0.4, b.radius * 0.6);
    ctx.moveTo(0, -b.radius * 0.7);
    ctx.lineTo(b.radius * 0.4, -b.radius * 0.2);
    ctx.lineTo(b.radius * 0.6, b.radius * 0.4);
    ctx.stroke();

    // 3. Mossy / Mineral patches
    ctx.fillStyle = '#15803d'; // rich moss patina
    ctx.fillRect(-b.radius * 0.5, -b.radius * 0.5, 7, 5);
    ctx.fillRect(b.radius * 0.2, b.radius * 0.3, 8, 6);

    // Specular mineral glint
    ctx.fillStyle = '#e7e5e4';
    ctx.fillRect(-b.radius * 0.3, -b.radius * 0.6, 3, 3);

    ctx.restore();
  }

  public renderThundercloud(th: ThundercloudHazard, camera: Camera, time: number) {
    const ctx = this.ctx;
    const sx = th.x - camera.x;
    const sy = th.y - camera.y;
    const tx = th.targetX - camera.x;
    const ty = th.targetY - camera.y;

    if (sx < -110 || sx > this.canvas.width + 110) return;

    // Peaceful mode: Thunderclouds turn into beautiful, harmless normal clouds!
    if (th.isPeaceful || th.isNormal) {
      ctx.save();
      ctx.fillStyle = '#f8fafc';
      this.drawFluffyCloud(sx - th.width / 2, sy, th.width);
      ctx.fillStyle = '#e2e8f0';
      this.drawFluffyCloud(sx - th.width * 0.4, sy - 5, th.width * 0.8);
      ctx.fillStyle = '#bae6fd';
      this.drawFluffyCloud(sx - th.width * 0.22, sy + 3, th.width * 0.45);
      ctx.restore();
      return;
    }

    const styleIdx = ((th.styleVariant ?? this.hashVariant(th.id, 3)) % 3 + 3) % 3;
    const stormPalettes = [
      // 0: Tempest Indigo & Electric Cyan Plasma
      {
        base: '#0f172a',
        baseFlash: '#334155',
        top: '#1e1b4b',
        topFlash: '#4f46e5',
        belly: '#0e7490',
        rain: 'rgba(56, 189, 248, 0.28)',
        boltGlow: 'rgba(34, 211, 238, 0.72)',
        boltMid: '#38bdf8',
        boltCore: '#ecfeff',
        warnRing: '#22d3ee',
        warnFill: 'rgba(34, 211, 238, 0.25)',
        spark: '#67e8f9',
      },
      // 1: Violet Supercell & Amethyst Forked Arcs
      {
        base: '#1e1033',
        baseFlash: '#4c1d95',
        top: '#2e1065',
        topFlash: '#6d28d9',
        belly: '#7e22ce',
        rain: 'rgba(192, 132, 252, 0.28)',
        boltGlow: 'rgba(192, 132, 252, 0.78)',
        boltMid: '#e879f9',
        boltCore: '#fdf4ff',
        warnRing: '#d946ef',
        warnFill: 'rgba(217, 70, 239, 0.26)',
        spark: '#f5d0fe',
      },
      // 2: Stormfront Charcoal-Teal & Solar Gold Lightning
      {
        base: '#111c24',
        baseFlash: '#2d4554',
        top: '#1b2e3b',
        topFlash: '#426175',
        belly: '#b45309',
        rain: 'rgba(250, 204, 21, 0.24)',
        boltGlow: 'rgba(250, 204, 21, 0.76)',
        boltMid: '#fbbf24',
        boltCore: '#fefce8',
        warnRing: '#facc15',
        warnFill: 'rgba(250, 204, 21, 0.26)',
        spark: '#fef08a',
      },
    ];
    const sp = stormPalettes[styleIdx];

    // 1. Multi-layered stormy anvil cloud with distinct color & size
    const flash = th.state === 'striking' || (th.state === 'warning' && Math.sin(time * 22) > 0.45);
    ctx.fillStyle = flash ? sp.baseFlash : sp.base;
    this.drawFluffyCloud(sx - th.width / 2, sy, th.width);

    // Towering upper thunderhead
    ctx.fillStyle = flash ? sp.topFlash : sp.top;
    this.drawFluffyCloud(sx - th.width * 0.42, sy - 7, th.width * 0.84);

    // Charged glowing underbelly seam
    ctx.fillStyle = flash ? sp.boltMid : sp.belly;
    ctx.globalAlpha = flash ? 0.85 : 0.45;
    ctx.fillRect(sx - th.width * 0.34, sy + 16, th.width * 0.68, 4);
    ctx.globalAlpha = 1;

    // Ambient rain sheets falling beneath the cloud
    ctx.strokeStyle = sp.rain;
    ctx.lineWidth = 1.2;
    for (let rx = sx - th.width * 0.4; rx < sx + th.width * 0.4; rx += 13) {
      const dropY = sy + 24 + ((time * 125 + rx * 3) % 44);
      ctx.beginPath();
      ctx.moveTo(rx, dropY);
      ctx.lineTo(rx - 2, dropY + 6);
      ctx.stroke();
    }

    // 2. Warning Phase: Pre-strike static crackles & color-matched ground reticle
    if (th.state === 'warning') {
      const pulse = 0.45 + Math.sin(time * 20) * 0.35;
      ctx.save();

      // Dancing static tendrils under the cloud belly
      ctx.strokeStyle = sp.spark;
      ctx.lineWidth = 2;
      for (let f = -1; f <= 1; f++) {
        const bx = sx + f * (th.width * 0.22);
        const zig = Math.sin(time * 38 + f * 4) * 7;
        ctx.beginPath();
        ctx.moveTo(bx, sy + 18);
        ctx.lineTo(bx + zig, sy + 32);
        ctx.lineTo(bx - zig * 0.5, sy + 44);
        ctx.stroke();
      }

      ctx.globalAlpha = pulse;
      // Electric guide beam
      ctx.strokeStyle = sp.warnRing;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(tx, sy + 28);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.setLineDash([]);

      // Double concentric hazard reticle rings scaled to cloud width
      const ringRx = Math.max(26, Math.round(th.width * 0.46));
      ctx.fillStyle = sp.warnFill;
      ctx.beginPath();
      ctx.ellipse(tx, ty, ringRx, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = sp.warnRing;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(tx, ty, ringRx * 0.55, 5.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = sp.spark;
      ctx.font = '700 10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ STRIKE ⚡', tx, ty - 13);
      ctx.restore();
    }

    // 3. Redesigned Multi-Branch Forked Lightning Bolt Effect!
    if (th.state === 'striking') {
      ctx.save();
      const startY = sy + 18;
      const totalH = Math.max(40, ty - startY);
      const jitterStep = Math.floor(time * 28);
      const pts: { x: number; y: number }[] = [{ x: tx, y: startY }];
      const segments = 6;
      for (let i = 1; i < segments; i++) {
        const frac = i / segments;
        const swing = Math.sin(jitterStep * 2.7 + i * 3.1 + styleIdx * 1.9) * (16 + (th.width - 54) * 0.14);
        pts.push({ x: tx + swing, y: startY + totalH * frac });
      }
      pts.push({ x: tx, y: ty });

      // Cloud-base electrical discharge orb
      ctx.fillStyle = sp.boltGlow;
      ctx.beginPath();
      ctx.arc(tx, startY + 2, 16, 0, Math.PI * 2);
      ctx.fill();

      // Outer plasma halo trunk
      ctx.lineCap = 'square';
      ctx.lineJoin = 'miter';
      ctx.strokeStyle = sp.boltGlow;
      ctx.lineWidth = 14 + (th.width > 75 ? 4 : 0);
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();

      // Mid colored electric lightning trunk
      ctx.strokeStyle = sp.boltMid;
      ctx.lineWidth = 7;
      ctx.stroke();

      // Blinding white jagged bolt core
      ctx.strokeStyle = sp.boltCore;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Forked branching side arcs splitting off mid-air!
      const branchIndices = [1, 2, 4];
      branchIndices.forEach((bIdx, n) => {
        const origin = pts[bIdx];
        if (!origin) return;
        const dir = n % 2 === 0 ? 1 : -1;
        const midX = origin.x + dir * (16 + ((jitterStep + n * 7) % 12));
        const midY = origin.y + totalH * 0.11;
        const endX = midX + dir * (14 + ((jitterStep * 3 + n) % 14));
        const endY = midY + totalH * 0.12;

        ctx.strokeStyle = sp.boltGlow;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(midX, midY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        ctx.strokeStyle = sp.boltCore;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      });

      // Electrified shockwave rings & radial sparks on ground impact
      const impactRx = Math.max(34, Math.round(th.width * 0.55));
      ctx.fillStyle = sp.boltGlow;
      ctx.beginPath();
      ctx.ellipse(tx, ty, impactRx, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = sp.boltCore;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(tx, ty, impactRx * 0.65, 7, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Sizzling ground spark spikes
      ctx.strokeStyle = sp.spark;
      ctx.lineWidth = 2;
      for (let s = 0; s < 6; s++) {
        const angle = -Math.PI + (s + 0.5) * (Math.PI / 6);
        const len = 14 + ((jitterStep + s * 5) % 14);
        ctx.beginPath();
        ctx.moveTo(tx + Math.cos(angle) * 10, ty - 2);
        ctx.lineTo(tx + Math.cos(angle) * (10 + len), ty - 2 + Math.sin(angle) * len);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // --- Enemies (Wolf, Fox, Bear): High Fidelity Pixel Art Models & Animations ---

  // ================= SHARED ENEMY SPRITE MODELS (COMBAT & BACKGROUND) =================
  // Ensures every enemy in the background looks 100% identical to the enemies fought in combat!

  private hashVariant(id: string, count: number): number {
    let h = 2166136261;
    for (let i = 0; i < id.length; i++) {
      h ^= id.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h) % count;
  }

  public drawWolfSprite(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    facingLeft: boolean,
    animTimer: number,
    scale: number = 1,
    variantIndex: number = 0
  ) {
    ctx.save();
    ctx.scale(scale * (facingLeft ? -1 : 1), scale);
    const halfW = width / 2;
    const halfH = height / 2;

    const morph = ((variantIndex % 4) + 4) % 4;
    const palettes = [
      // 0: Timber Grey Wolf (Canis lupus)
      { coat: '#475569', back: '#27303f', ruff: '#64748b', belly: '#cbd5e1', muzzle: '#94a3b8', legFar: '#1e293b', legNear: '#334155', tailTip: '#0f172a', earInner: '#e2d5c8', eye: '#f59e0b' },
      // 1: Arctic White Wolf (Canis lupus arctos)
      { coat: '#e2e8f0', back: '#cbd5e1', ruff: '#f8fafc', belly: '#ffffff', muzzle: '#f1f5f9', legFar: '#94a3b8', legNear: '#cbd5e1', tailTip: '#94a3b8', earInner: '#f1d4d4', eye: '#eab308' },
      // 2: Cinnamon / Russet Timber Wolf
      { coat: '#7c4a2d', back: '#4a2916', ruff: '#9a6342', belly: '#e6ccb2', muzzle: '#b08968', legFar: '#3d2212', legNear: '#623a22', tailTip: '#1c120c', earInner: '#e6ccb2', eye: '#fbbf24' },
      // 3: Melanistic Black Wolf
      { coat: '#1f242d', back: '#0d1016', ruff: '#333b48', belly: '#4b5563', muzzle: '#374151', legFar: '#090b10', legNear: '#181c24', tailTip: '#030712', earInner: '#6b7280', eye: '#fbbf24' },
    ];
    const p = palettes[morph];

    const walk = Math.sin(animTimer * 12) * 3.8;
    const bodyBob = Math.abs(Math.sin(animTimer * 12)) * 1.1;
    const tailSway = Math.sin(animTimer * 7.5) * 0.18;

    // 1. Far-Side Digitigrade Legs (Depth Layer)
    ctx.fillStyle = p.legFar;
    // Far hind leg with realistic hock bend
    ctx.beginPath();
    ctx.moveTo(-halfW + 9 - walk * 0.8, halfH - 9);
    ctx.lineTo(-halfW + 13 - walk, halfH - 4);
    ctx.lineTo(-halfW + 11 - walk, halfH + 1);
    ctx.lineTo(-halfW + 7 - walk, halfH + 1);
    ctx.lineTo(-halfW + 9 - walk, halfH - 4);
    ctx.lineTo(-halfW + 6 - walk * 0.8, halfH - 9);
    ctx.closePath();
    ctx.fill();
    // Far front leg
    ctx.fillRect(halfW - 14 - walk, halfH - 9, 3.6, 10);

    // 2. Bushy Layered Lupine Tail with Dark Tip
    ctx.save();
    ctx.translate(-halfW + 4, -halfH + 9 - bodyBob * 0.4);
    ctx.rotate(-0.32 + tailSway);
    ctx.fillStyle = p.coat;
    ctx.beginPath();
    ctx.ellipse(-10, 0.5, 11.5, 4.6, -0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.ruff;
    ctx.beginPath();
    ctx.ellipse(-7, -1, 7, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.tailTip;
    ctx.beginPath();
    ctx.ellipse(-17.5, 0.5, 5.2, 2.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Athletic Canine Torso (Deep chest, tucked waist, realistic spine curve)
    ctx.fillStyle = p.coat;
    ctx.beginPath();
    ctx.ellipse(-2, -halfH + 10.5 - bodyBob, halfW - 3.5, 6.8, -0.06, 0, Math.PI * 2);
    ctx.fill();
    // Lighter chest & tucked underbelly
    ctx.fillStyle = p.belly;
    ctx.beginPath();
    ctx.ellipse(2, -halfH + 14.2 - bodyBob, halfW - 8, 3.2, -0.1, 0, Math.PI * 2);
    ctx.fill();
    // Dark saddle fur along back/spine
    ctx.fillStyle = p.back;
    ctx.beginPath();
    ctx.ellipse(-3, -halfH + 6.2 - bodyBob, halfW - 6, 3.2, -0.04, 0, Math.PI * 2);
    ctx.fill();

    // 4. Thick Layered Shoulder & Neck Ruff (Guard Hairs)
    ctx.fillStyle = p.ruff;
    ctx.beginPath();
    ctx.moveTo(halfW - 17, -halfH + 4 - bodyBob);
    ctx.quadraticCurveTo(halfW - 8, -halfH + 1 - bodyBob, halfW - 2, -halfH + 5 - bodyBob);
    ctx.lineTo(halfW - 4, -halfH + 15 - bodyBob);
    ctx.lineTo(halfW - 14, -halfH + 15 - bodyBob);
    ctx.lineTo(halfW - 19, -halfH + 11 - bodyBob);
    ctx.closePath();
    ctx.fill();
    // Cream throat fur
    ctx.fillStyle = p.belly;
    ctx.beginPath();
    ctx.ellipse(halfW - 7, -halfH + 12.5 - bodyBob, 4.5, 3.4, 0.25, 0, Math.PI * 2);
    ctx.fill();

    // 5. Realistic Lupine Head, Tapered Snout & Jaw
    const headY = -halfH - bodyBob;
    // Skull cranium
    ctx.fillStyle = p.coat;
    ctx.beginPath();
    ctx.ellipse(halfW - 6.5, headY + 4.5, 7.2, 5.6, 0.08, 0, Math.PI * 2);
    ctx.fill();
    // Dark forehead / brow mask
    ctx.fillStyle = p.back;
    ctx.beginPath();
    ctx.ellipse(halfW - 7.5, headY + 1.5, 5.5, 2.5, 0.05, 0, Math.PI * 2);
    ctx.fill();
    // Tapered upper muzzle
    ctx.fillStyle = p.muzzle;
    ctx.beginPath();
    ctx.moveTo(halfW - 2, headY + 2.2);
    ctx.lineTo(halfW + 7.5, headY + 4.2);
    ctx.lineTo(halfW + 6.5, headY + 7.5);
    ctx.lineTo(halfW - 3, headY + 8);
    ctx.closePath();
    ctx.fill();
    // Pale cheek & lower jaw
    ctx.fillStyle = p.belly;
    ctx.beginPath();
    ctx.moveTo(halfW - 4, headY + 7.2);
    ctx.lineTo(halfW + 5.5, headY + 7.4);
    ctx.lineTo(halfW + 4, headY + 9.4);
    ctx.lineTo(halfW - 5, headY + 9.2);
    ctx.closePath();
    ctx.fill();
    // Wet black rhinarium (nose)
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.ellipse(halfW + 7.2, headY + 4.6, 2.1, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Subtle canine fang
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(halfW + 1.5, headY + 7.4);
    ctx.lineTo(halfW + 2.8, headY + 9.6);
    ctx.lineTo(halfW + 4.1, headY + 7.4);
    ctx.closePath();
    ctx.fill();

    // 6. Alert Triangular Canine Ears (Back & Front)
    ctx.fillStyle = p.back;
    ctx.beginPath();
    ctx.moveTo(halfW - 11.5, headY + 0.5);
    ctx.lineTo(halfW - 9.2, headY - 6.8);
    ctx.lineTo(halfW - 5.5, headY + 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = p.earInner;
    ctx.beginPath();
    ctx.moveTo(halfW - 10, headY - 0.3);
    ctx.lineTo(halfW - 8.9, headY - 4.8);
    ctx.lineTo(halfW - 7.1, headY - 0.3);
    ctx.closePath();
    ctx.fill();

    // 7. Focused Amber Lupine Eye with Dark Rim & Catchlight
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.ellipse(halfW - 4.2, headY + 3.6, 2.2, 1.8, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.eye;
    ctx.beginPath();
    ctx.arc(halfW - 4.1, headY + 3.6, 1.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#090d16';
    ctx.fillRect(halfW - 4.4, headY + 3.0, 0.9, 1.3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(halfW - 4.8, headY + 2.9, 0.7, 0.7);

    // 8. Near-Side Muscular Legs, Paws & Claws
    ctx.fillStyle = p.legNear;
    // Near hind leg with hock
    ctx.beginPath();
    ctx.moveTo(-halfW + 6 + walk * 0.8, halfH - 9);
    ctx.lineTo(-halfW + 10 + walk, halfH - 4);
    ctx.lineTo(-halfW + 8 + walk, halfH + 1);
    ctx.lineTo(-halfW + 4 + walk, halfH + 1);
    ctx.lineTo(-halfW + 5.5 + walk, halfH - 4);
    ctx.lineTo(-halfW + 3 + walk * 0.8, halfH - 9);
    ctx.closePath();
    ctx.fill();
    // Near front leg
    ctx.fillRect(halfW - 9 + walk, halfH - 9, 3.8, 10);
    // Paws & claws
    ctx.fillStyle = p.belly;
    ctx.fillRect(-halfW + 4.5 + walk, halfH - 0.8, 4.5, 2.2);
    ctx.fillRect(halfW - 9 + walk, halfH - 0.8, 4.8, 2.2);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-halfW + 8 + walk, halfH, 1.5, 1.5);
    ctx.fillRect(halfW - 5 + walk, halfH, 1.5, 1.5);

    ctx.restore();
  }

  public drawFoxSprite(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    facingLeft: boolean,
    animTimer: number,
    scale: number = 1,
    variantIndex: number = 0
  ) {
    ctx.save();
    ctx.scale(scale * (facingLeft ? -1 : 1), scale);
    const halfW = width / 2;
    const halfH = height / 2;

    const morph = ((variantIndex % 4) + 4) % 4;
    const palettes = [
      // 0: Classic Red Fox (Vulpes vulpes)
      { coat: '#ea580c', back: '#b43509', light: '#fb923c', belly: '#f8fafc', earBack: '#1c1917', earInner: '#fde2d2', leg: '#1c1917', tailTip: '#ffffff', eye: '#f59e0b' },
      // 1: Silver Fox (Melanistic Vulpes vulpes)
      { coat: '#27272a', back: '#09090b', light: '#52525b', belly: '#a1a1aa', earBack: '#09090b', earInner: '#d4d4d8', leg: '#09090b', tailTip: '#f8fafc', eye: '#fbbf24' },
      // 2: Cross Fox (Russet & Dark Dorsal Cross)
      { coat: '#c2591a', back: '#29201c', light: '#e2843b', belly: '#e7dfd8', earBack: '#1c1917', earInner: '#e7d5c8', leg: '#1c1917', tailTip: '#f8fafc', eye: '#f59e0b' },
      // 3: Arctic Fox (Vulpes lagopus)
      { coat: '#f1f5f9', back: '#cbd5e1', light: '#ffffff', belly: '#ffffff', earBack: '#94a3b8', earInner: '#fbcfe8', leg: '#cbd5e1', tailTip: '#ffffff', eye: '#eab308' },
    ];
    const p = palettes[morph];

    const runCycle = Math.sin(animTimer * 16) * 4.5;
    const bounce = Math.abs(Math.sin(animTimer * 16)) * 1.2;
    const tailSway = Math.sin(animTimer * 10) * 0.24;

    // 1. Far Slender Stocking Legs
    ctx.fillStyle = p.leg;
    ctx.fillRect(-halfW + 10 - runCycle, halfH - 7, 2.8, 8);
    ctx.fillRect(halfW - 12 - runCycle, halfH - 7, 2.8, 8);

    // 2. Plumed Vulpine Brush Tail with Pure White Tip
    ctx.save();
    ctx.translate(-halfW + 4, -halfH + 7 - bounce * 0.4);
    ctx.rotate(-0.28 + tailSway);
    ctx.fillStyle = p.coat;
    ctx.beginPath();
    ctx.ellipse(-12.5, 0, 14, 5.8, -0.14, 0, Math.PI * 2);
    ctx.fill();
    // Tail fur sheen
    ctx.fillStyle = p.light;
    ctx.beginPath();
    ctx.ellipse(-9, -1.6, 8, 2.4, -0.1, 0, Math.PI * 2);
    ctx.fill();
    // Iconic snowy white tail brush tip
    ctx.fillStyle = p.tailTip;
    ctx.beginPath();
    ctx.ellipse(-22, -1.8, 6.2, 4.4, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Lithe Agile Vulpine Body
    ctx.fillStyle = p.coat;
    ctx.beginPath();
    ctx.ellipse(-1, -halfH + 9.5 - bounce, halfW - 3.5, 5.8, -0.05, 0, Math.PI * 2);
    ctx.fill();
    // Dorsal stripe / darker back fur
    ctx.fillStyle = p.back;
    ctx.beginPath();
    ctx.ellipse(-2, -halfH + 5.8 - bounce, halfW - 6, 2.5, -0.03, 0, Math.PI * 2);
    ctx.fill();

    // 4. Fluffy Snow-White Chest Bib & Underbelly
    ctx.fillStyle = p.belly;
    ctx.beginPath();
    ctx.ellipse(halfW - 10, -halfH + 11.8 - bounce, 7.5, 3.6, 0.25, 0, Math.PI * 2);
    ctx.fill();

    // 5. Sharp Vulpine Head, Cheek Ruff & Narrow Snout
    const headY = -halfH - bounce;
    ctx.fillStyle = p.coat;
    ctx.beginPath();
    ctx.ellipse(halfW - 6, headY + 4, 6.4, 5.2, 0.08, 0, Math.PI * 2);
    ctx.fill();
    // Tapered fox snout
    ctx.beginPath();
    ctx.moveTo(halfW - 1, headY + 1.5);
    ctx.lineTo(halfW + 8.5, headY + 5.5);
    ctx.lineTo(halfW - 1, headY + 7.8);
    ctx.closePath();
    ctx.fill();
    // Crisp white cheek ruff & lower muzzle
    ctx.fillStyle = p.belly;
    ctx.beginPath();
    ctx.moveTo(halfW - 8.5, headY + 6.2);
    ctx.quadraticCurveTo(halfW - 1, headY + 5.4, halfW + 7.5, headY + 6.2);
    ctx.lineTo(halfW + 0.5, headY + 8.6);
    ctx.lineTo(halfW - 7.5, headY + 8.4);
    ctx.closePath();
    ctx.fill();
    // Glossy black nose tip
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(halfW + 8.3, headY + 5.6, 1.6, 0, Math.PI * 2);
    ctx.fill();

    // 6. Tall Triangular Black-Backed Ears with Cream Tuft
    ctx.fillStyle = p.earBack;
    ctx.beginPath();
    ctx.moveTo(halfW - 11.5, headY + 0.5);
    ctx.lineTo(halfW - 8.2, headY - 9.2);
    ctx.lineTo(halfW - 3.6, headY + 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = p.earInner;
    ctx.beginPath();
    ctx.moveTo(halfW - 9.6, headY - 0.2);
    ctx.lineTo(halfW - 8.0, headY - 6.4);
    ctx.lineTo(halfW - 5.4, headY - 0.2);
    ctx.closePath();
    ctx.fill();

    // 7. Intelligent Golden-Amber Vulpine Eye
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.ellipse(halfW - 4.2, headY + 3.2, 2.3, 1.8, -0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.eye;
    ctx.beginPath();
    ctx.arc(halfW - 4.1, headY + 3.2, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#090d16';
    ctx.fillRect(halfW - 4.3, headY + 2.4, 0.7, 1.6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(halfW - 4.8, headY + 2.4, 0.8, 0.8);

    // 8. Near Sleek Dark Stocking Paws
    ctx.fillStyle = p.leg;
    ctx.fillRect(-halfW + 4.5 + runCycle, halfH - 7, 3, 8);
    ctx.fillRect(halfW - 6.5 + runCycle, halfH - 7, 3, 8);
    // Tiny paw tips
    ctx.fillRect(-halfW + 5 + runCycle, halfH - 0.5, 4, 1.8);
    ctx.fillRect(halfW - 6 + runCycle, halfH - 0.5, 4, 1.8);

    ctx.restore();
  }

  public drawBearSprite(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    facingLeft: boolean,
    animTimer: number,
    scale: number = 1,
    variantIndex: number = 0
  ) {
    ctx.save();
    ctx.scale(scale * (facingLeft ? -1 : 1), scale);
    const halfW = width / 2;
    const halfH = height / 2;

    const morph = ((variantIndex % 4) + 4) % 4;
    const palettes = [
      // 0: Grizzly Brown Bear (Ursus arctos horribilis)
      { coat: '#4a2511', hump: '#633219', highlight: '#854d27', muzzle: '#a67b5b', muzzleDark: '#7c5335', legFar: '#2c1408', legNear: '#3b1c0b', earInner: '#9c6b49', eye: '#fbbf24' },
      // 1: Kodiak Cinnamon Bear
      { coat: '#78350f', hump: '#92400e', highlight: '#b45309', muzzle: '#d4a373', muzzleDark: '#a97447', legFar: '#451a03', legNear: '#5e2709', earInner: '#c68b59', eye: '#f59e0b' },
      // 2: Polar White Bear (Ursus maritimus)
      { coat: '#e2e8f0', hump: '#f1f5f9', highlight: '#ffffff', muzzle: '#f8fafc', muzzleDark: '#cbd5e1', legFar: '#94a3b8', legNear: '#cbd5e1', earInner: '#cbd5e1', eye: '#38bdf8' },
      // 3: American Black Bear (Ursus americanus)
      { coat: '#1e1b18', hump: '#2d2824', highlight: '#44403c', muzzle: '#8a6240', muzzleDark: '#5c4028', legFar: '#0f0e0d', legNear: '#171513', earInner: '#57534e', eye: '#f59e0b' },
    ];
    const p = palettes[morph];

    const walk = Math.sin(animTimer * 8) * 3.5;
    const sway = Math.abs(Math.sin(animTimer * 8)) * 0.9;

    // 1. Far Heavy Plantigrade Legs
    ctx.fillStyle = p.legFar;
    ctx.fillRect(-halfW + 15 - walk, halfH - 11, 8.5, 11.5);
    ctx.fillRect(halfW - 19 - walk, halfH - 11, 8.5, 11.5);

    // 2. Round Bear Tail Nub
    ctx.fillStyle = p.legNear;
    ctx.beginPath();
    ctx.arc(-halfW + 2.5, -halfH + 14 - sway, 4.4, 0, Math.PI * 2);
    ctx.fill();

    // 3. Massive Ursine Torso & Prominent Grizzly Shoulder Hump
    ctx.fillStyle = p.coat;
    ctx.beginPath();
    ctx.ellipse(-2, -halfH + 16.5 - sway, halfW - 3, 12.2, 0.03, 0, Math.PI * 2);
    ctx.fill();
    // Signature Grizzly Shoulder Hump
    ctx.fillStyle = p.hump;
    ctx.beginPath();
    ctx.ellipse(halfW - 22, -halfH + 8.5 - sway, 14.5, 10, -0.1, 0, Math.PI * 2);
    ctx.fill();
    // Shaggy guard-hair coat highlights
    ctx.fillStyle = p.highlight;
    ctx.beginPath();
    ctx.ellipse(halfW - 23, -halfH + 5.5 - sway, 9.5, 3.8, -0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-7, -halfH + 12.5 - sway, 9, 4, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // 4. Broad Imposing Bear Head & Muzzle
    const headY = -halfH + 1 - sway;
    // Rounded ears (back & front)
    ctx.fillStyle = p.legFar;
    ctx.beginPath();
    ctx.arc(halfW - 15, headY + 1, 4.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.earInner;
    ctx.beginPath();
    ctx.arc(halfW - 15, headY + 1, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Broad skull
    ctx.fillStyle = p.coat;
    ctx.beginPath();
    ctx.ellipse(halfW - 9.5, headY + 9.5, 9.8, 9, 0.05, 0, Math.PI * 2);
    ctx.fill();
    // Lighter broad ursine muzzle
    ctx.fillStyle = p.muzzle;
    ctx.beginPath();
    ctx.ellipse(halfW + 1.5, headY + 11.8, 6.2, 5.2, 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.muzzleDark;
    ctx.fillRect(halfW - 2, headY + 13.8, 7.5, 2.4);
    // Large wet black leather nose
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.ellipse(halfW + 6.5, headY + 10.2, 2.6, 2.1, 0, 0, Math.PI * 2);
    ctx.fill();
    // Nose highlight
    ctx.fillStyle = '#475569';
    ctx.fillRect(halfW + 5.5, headY + 9.1, 1.5, 0.9);
    // Canine fang
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(halfW + 1, headY + 15.6);
    ctx.lineTo(halfW + 2.6, headY + 18.4);
    ctx.lineTo(halfW + 4.2, headY + 15.6);
    ctx.closePath();
    ctx.fill();

    // 5. Realistic Deep-Set Ursine Eye with Brow Ridge
    ctx.fillStyle = p.legFar;
    ctx.fillRect(halfW - 10.5, headY + 4.8, 5, 1.8);
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(halfW - 7.5, headY + 7.5, 2.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.eye;
    ctx.fillRect(halfW - 8.1, headY + 6.9, 1.3, 1.3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(halfW - 8.4, headY + 6.6, 0.7, 0.7);

    // 6. Colossal Near Paws with Long Curved Bone-White Claws
    ctx.fillStyle = p.legNear;
    ctx.fillRect(-halfW + 4 + walk, halfH - 10.5, 9.2, 11);
    ctx.fillRect(halfW - 9 + walk, halfH - 10.5, 9.2, 11);
    // Curved grizzly claws
    ctx.fillStyle = '#f8fafc';
    for (let c = 0; c < 3; c++) {
      ctx.fillRect(halfW - 0.5 + walk + c * 1.1, halfH - 2.6 + c * 0.4, 2.4, 2.2);
      ctx.fillRect(-halfW + 12.2 + walk + c * 0.9, halfH - 2.6 + c * 0.4, 2.2, 2.2);
    }

    ctx.restore();
  }

  // ================= SHARED BACKGROUND WILDLIFE SPRITE MODELS (BESTIARY & WORLDS) =================

  public drawSnowshoeHareSprite(
    ctx: CanvasRenderingContext2D,
    time: number,
    scale: number = 1,
    isCheering: boolean = false,
    variantIndex: number = 0,
    isBaby: boolean = false,
    activity: 'hop' | 'dig' | 'eat' | 'rest' = 'hop'
  ) {
    ctx.save();
    const effActivity = isCheering ? 'hop' : activity;
    const hopCycle = (effActivity === 'hop' || isCheering) ? Math.abs(Math.sin(time * (isCheering ? 6.0 : 4.2))) : 0;
    const restBreath = effActivity === 'rest' ? Math.sin(time * 2.4) * 0.45 : 0;
    const bodyDrop = effActivity === 'rest' ? 2.6 : (effActivity === 'dig' || effActivity === 'eat' ? 1.2 : 0);
    const babyFactor = isBaby ? 0.7 : 1.0;

    ctx.translate(0, (-hopCycle * (isCheering ? 7 : 4.5) + bodyDrop + restBreath) * scale * babyFactor);
    ctx.scale(scale * babyFactor, scale * babyFactor);

    const morph = ((variantIndex % 3) + 3) % 3;
    const coats = [
      // 0: Pure Winter White (Lepus americanus winter phase)
      { body: '#ffffff', shadow: '#cbd5e1', patch: null as string | null, earInner: '#fbcfe8', eye: '#0f172a' },
      // 1: Spring Molt (Tawny-brown back transitioning from winter white)
      { body: '#f8fafc', shadow: '#cbd5e1', patch: '#a16236', earInner: '#f5b8c6', eye: '#0f172a' },
      // 2: Arctic Frost Silver
      { body: '#e2e8f0', shadow: '#94a3b8', patch: '#cbd5e1', earInner: '#fbcfe8', eye: '#0f172a' },
    ];
    const c = coats[morph];

    // Uncovered snow hole & hidden green alpine grass when digging or eating!
    if (effActivity === 'dig' || effActivity === 'eat') {
      // Dark frozen earth pocket exposed beneath snow
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.ellipse(12.5, 7.6, 6.2, 2.3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Rim of pushed-up snow
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.ellipse(12.5, 8.8, 7.2, 1.5, 0, 0, Math.PI);
      ctx.fill();

      // Hidden emerald alpine grass blades revealed beneath the snow!
      const grassGrow = effActivity === 'eat' ? 1.0 : 0.65 + Math.sin(time * 4) * 0.15;
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(9.5, 7.2); ctx.lineTo(8.5, 7.2 - 5.5 * grassGrow);
      ctx.moveTo(12, 7.5); ctx.lineTo(12.8, 7.5 - 6.8 * grassGrow);
      ctx.moveTo(14.5, 7.3); ctx.lineTo(16.2, 7.3 - 5.2 * grassGrow);
      ctx.stroke();
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(11, 7.4); ctx.lineTo(10.2, 7.4 - 5.8 * grassGrow);
      ctx.moveTo(13.6, 7.4); ctx.lineTo(14.4, 7.4 - 6.0 * grassGrow);
      ctx.stroke();
    }

    // Fluffy snowshoe hare body (rounder & flatter loaf when resting, fluffier on baby)
    const bodyRx = effActivity === 'rest' ? 11.2 : (isBaby ? 9.4 : 9.6);
    const bodyRy = effActivity === 'rest' ? 6.4 : (isBaby ? 7.9 : 7.5);
    const bodyTilt = effActivity === 'dig' ? 0.14 : (effActivity === 'rest' ? 0 : -0.15);

    ctx.fillStyle = c.shadow;
    ctx.beginPath();
    ctx.ellipse(0, 1.2, bodyRx + 0.6, bodyRy + 0.5, bodyTilt, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.ellipse(0, 0, bodyRx, bodyRy, bodyTilt, 0, Math.PI * 2);
    ctx.fill();

    // Seasonal molt saddle patch if applicable
    if (c.patch) {
      ctx.fillStyle = c.patch;
      ctx.beginPath();
      ctx.ellipse(-1.2, -2.2, 6.2, 3.8, bodyTilt, 0, Math.PI * 2);
      ctx.fill();
    }

    // Oversized furry hind snowshoe feet (tucked neatly under loaf when resting)
    if (effActivity === 'rest') {
      ctx.fillStyle = c.shadow;
      ctx.beginPath();
      ctx.ellipse(-2, 5.8, 7.5, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = c.shadow;
      ctx.beginPath();
      ctx.ellipse(-4.5, 6.5, 5.6, 2.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c.body;
      ctx.beginPath();
      ctx.ellipse(-4, 5.8, 5.4, 2.3, 0, 0, Math.PI * 2);
      if (effActivity === 'dig') {
        // Rapidly digging front paws kicking up snow puffs!
        const digCycle = Math.sin(time * 20);
        ctx.ellipse(6.5 + digCycle * 2.2, 5.8 - Math.abs(digCycle) * 1.6, 3.4, 1.8, 0.4, 0, Math.PI * 2);
        ctx.ellipse(4.5 - digCycle * 2.0, 6.4, 3.2, 1.7, 0.2, 0, Math.PI * 2);
      } else {
        ctx.ellipse(3.5, 5.8, 4, 2, 0, 0, Math.PI * 2);
      }
      ctx.fill();

      // Animated flying snow puffs while digging!
      if (effActivity === 'dig') {
        for (let sp = 0; sp < 4; sp++) {
          const pAge = (time * 3.8 + sp * 0.25) % 1.0;
          const px = 8 - pAge * 12 + Math.sin(sp * 2.4) * 2;
          const py = 5.5 - Math.sin(pAge * Math.PI) * 7.5;
          ctx.fillStyle = `rgba(255, 255, 255, ${(1 - pAge) * 0.9})`;
          ctx.beginPath();
          ctx.arc(px, py, 1.8 * (1 - pAge * 0.4), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    if (isCheering) {
      ctx.fillStyle = c.body;
      ctx.beginPath();
      ctx.ellipse(5.5, 0, 3.8, 2.2, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cotton ball tail
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(effActivity === 'rest' ? -10.8 : -10, effActivity === 'rest' ? 0.5 : -2, isBaby ? 3.2 : 3.6, 0, Math.PI * 2);
    ctx.fill();

    // Hare Head (dipped down when digging or nibbling hidden grass, cozy tucked when resting)
    const chewBob = effActivity === 'eat' ? Math.sin(time * 13) * 0.9 : 0;
    const headX = effActivity === 'eat' ? 8.2 : (effActivity === 'dig' ? 7.6 : (effActivity === 'rest' ? 6.8 : 6));
    const headY = effActivity === 'eat' ? (0.4 + chewBob) : (effActivity === 'dig' ? -0.6 : (effActivity === 'rest' ? -1.8 : -4));
    const headR = isBaby ? 6.2 : 5.6;

    ctx.save();
    ctx.translate(headX, headY);
    if (effActivity === 'eat') {
      ctx.rotate(0.42);
    } else if (effActivity === 'dig') {
      ctx.rotate(0.28);
    }

    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.arc(0, 0, headR, 0, Math.PI * 2);
    ctx.fill();
    if (morph === 1) {
      ctx.fillStyle = '#a16236';
      ctx.beginPath();
      ctx.arc(-1.2, -2.4, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Long Snowshoe Ears with Iconic Ink-Black Tips (folded gently back when resting, adorably wide on baby leverets)
    const earWiggle = Math.sin(time * (isCheering ? 13 : (effActivity === 'rest' ? 2 : 8))) * (isCheering ? 0.22 : (effActivity === 'rest' ? 0.04 : 0.14));
    const earFold = effActivity === 'rest' ? -1.05 : -0.2;
    const earLen = isBaby ? 6.0 : 7.2;
    const earWidth = isBaby ? 2.5 : 2.2;
    ctx.save();
    ctx.translate(-2, -4);
    ctx.rotate(earFold + earWiggle);
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.ellipse(-2, -earLen * 0.85, earWidth, earLen, -0.1, 0, Math.PI * 2);
    ctx.ellipse(2, -earLen * 0.85, earWidth, earLen, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.earInner;
    ctx.beginPath();
    ctx.ellipse(-2, -earLen * 0.72, earWidth * 0.55, earLen * 0.62, -0.1, 0, Math.PI * 2);
    ctx.ellipse(2, -earLen * 0.72, earWidth * 0.55, earLen * 0.62, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-3.1, -earLen * 1.82, 2.5, 2.7);
    ctx.fillRect(1, -earLen * 1.82, 2.5, 2.7);
    ctx.restore();

    if (isCheering || effActivity === 'rest') {
      // Joyful or sleepy closed crescent eye
      ctx.strokeStyle = c.eye;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(1.8, -1, 1.5, 0.2, Math.PI - 0.2);
      ctx.stroke();
      if (isCheering) {
        ctx.fillStyle = 'rgba(244, 114, 182, 0.6)';
        ctx.beginPath();
        ctx.arc(0.4, 1.5, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Big glossy dark eye (extra expressive on baby leveret)
      const eyeR = isBaby ? 1.65 : 1.3;
      ctx.fillStyle = c.eye;
      ctx.beginPath();
      ctx.arc(2.0, -1, eyeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(2.2, -1.7, 0.75, 0.75);
    }

    // Pink twitching nose & fine whiskers
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(4.5, 0.5, 1.6, 1.2);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.7)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(4.5, 1.2); ctx.lineTo(8.5, 0.4);
    ctx.moveTo(4.5, 1.7); ctx.lineTo(8.2, 2.4);
    ctx.stroke();

    // Nibbled green grass blade dangling from mouth when eating!
    if (effActivity === 'eat') {
      const grassWiggle = Math.sin(time * 14) * 1.4;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(4.8, 2.2);
      ctx.quadraticCurveTo(7.5, 4.2 + grassWiggle, 8.8, 6.2 + grassWiggle);
      ctx.stroke();
    }

    ctx.restore(); // restore head

    ctx.restore();
  }

  public drawButterflySprite(
    ctx: CanvasRenderingContext2D,
    time: number,
    scale: number = 1,
    variantIndex: number = 0
  ) {
    ctx.save();
    const flutterY = Math.sin(time * 4.5) * 4 * scale;
    ctx.translate(0, flutterY);
    ctx.scale(scale, scale);

    const morph = ((variantIndex % 4) + 4) % 4;
    const species = [
      // 0: Monarch (Danaus plexippus)
      { upper: '#ea580c', lower: '#f97316', rim: '#1c1917', spots: '#ffffff' },
      // 1: Blue Morpho (Morpho menelaus)
      { upper: '#0284c7', lower: '#38bdf8', rim: '#0f172a', spots: '#e0f2fe' },
      // 2: Emerald Swallowtail (Papilio palinurus)
      { upper: '#059669', lower: '#34d399', rim: '#064e3b', spots: '#fef08a' },
      // 3: Clouded Sulphur (Colias philodice)
      { upper: '#eab308', lower: '#fde047', rim: '#422006', spots: '#ffffff' },
    ];
    const sp = species[morph];

    const flap = 0.25 + Math.abs(Math.sin(time * 10)) * 0.75;
    const wingW = Math.max(2, 8 * flap);

    // Lower hindwings
    ctx.fillStyle = sp.lower;
    ctx.strokeStyle = sp.rim;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.ellipse(-wingW * 0.44 - 0.5, 2.2, wingW * 0.42, 4.2, 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(wingW * 0.44 + 0.5, 2.2, wingW * 0.42, 4.2, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Upper forewings
    ctx.fillStyle = sp.upper;
    ctx.beginPath();
    ctx.ellipse(-wingW * 0.55 - 0.5, -2.5, wingW * 0.56, 5.6, -0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(wingW * 0.55 + 0.5, -2.5, wingW * 0.56, 5.6, 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Crisp wing margin spots
    ctx.fillStyle = sp.spots;
    ctx.fillRect(-wingW * 0.65 - 0.8, -4.2, 1.6, 1.6);
    ctx.fillRect(wingW * 0.65 - 0.8, -4.2, 1.6, 1.6);
    ctx.fillRect(-wingW * 0.45 - 0.6, 1.8, 1.2, 1.2);
    ctx.fillRect(wingW * 0.45 - 0.6, 1.8, 1.2, 1.2);

    // Slim thorax/abdomen & clubbed antennae
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-1, -5, 2, 9.5);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.moveTo(-0.8, -5); ctx.lineTo(-3.4, -8.5);
    ctx.moveTo(0.8, -5); ctx.lineTo(3.4, -8.5);
    ctx.stroke();

    ctx.restore();
  }

  public drawDragonflySprite(
    ctx: CanvasRenderingContext2D,
    time: number,
    scale: number = 1,
    variantIndex: number = 0
  ) {
    ctx.save();
    const hoverX = Math.sin(time * 3.2) * 3 * scale;
    const hoverY = Math.cos(time * 4.2) * 3 * scale;
    ctx.translate(hoverX, hoverY);
    ctx.scale(scale, scale);

    const morph = ((variantIndex % 3) + 3) % 3;
    const species = [
      // 0: Azure Emperor (Anax imperator)
      { body: '#0284c7', band: '#38bdf8', thorax: '#0ea5e9', wing: 'rgba(224, 242, 254, 0.85)', vein: 'rgba(56, 189, 248, 0.55)', eye: '#0c4a6e' },
      // 1: Emerald Darner (Anax junius)
      { body: '#059669', band: '#34d399', thorax: '#10b981', wing: 'rgba(236, 253, 245, 0.84)', vein: 'rgba(16, 185, 129, 0.52)', eye: '#064e3b' },
      // 2: Scarlet Skimmer (Crocothemis erythraea)
      { body: '#dc2626', band: '#f87171', thorax: '#ef4444', wing: 'rgba(254, 242, 242, 0.84)', vein: 'rgba(248, 113, 113, 0.5)', eye: '#7f1d1d' },
    ];
    const sp = species[morph];

    // Translucent veined forewings & hindwings
    const dFlap = Math.sin(time * 36) * 1.05;
    ctx.fillStyle = sp.wing;
    ctx.strokeStyle = sp.vein;
    ctx.lineWidth = 0.6;
    // Forewings
    ctx.beginPath();
    ctx.ellipse(-6.5, -2.8 + dFlap, 6.2, 1.5, -0.08, 0, Math.PI * 2);
    ctx.ellipse(6.5, -2.8 + dFlap, 6.2, 1.5, 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Hindwings
    ctx.beginPath();
    ctx.ellipse(-5.5, 0.2 - dFlap, 5.2, 1.35, 0.1, 0, Math.PI * 2);
    ctx.ellipse(5.5, 0.2 - dFlap, 5.2, 1.35, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Segmented slender abdomen
    ctx.fillStyle = sp.body;
    ctx.beginPath();
    ctx.roundRect(-1.1, -2.5, 2.2, 11.8, 1);
    ctx.fill();
    ctx.fillStyle = sp.band;
    for (let seg = 0; seg < 4; seg++) {
      ctx.fillRect(-0.9, 0 + seg * 2.3, 1.8, 1.0);
    }

    // Iridescent thorax & broad compound-eye head
    ctx.fillStyle = sp.thorax;
    ctx.beginPath();
    ctx.ellipse(0, -3.5, 2.1, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = sp.eye;
    ctx.beginPath();
    ctx.arc(-1.4, -6.2, 1.5, 0, Math.PI * 2);
    ctx.arc(1.4, -6.2, 1.5, 0, Math.PI * 2);
    ctx.fill();
    // Compound eye gloss
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillRect(-1.9, -6.9, 0.8, 0.8);
    ctx.fillRect(0.9, -6.9, 0.8, 0.8);

    ctx.restore();
  }

  public drawHoneybeeSprite(
    ctx: CanvasRenderingContext2D,
    time: number,
    scale: number = 1,
    variantIndex: number = 0
  ) {
    ctx.save();
    const buzzY = Math.sin(time * 7.5) * 3.5 * scale;
    ctx.translate(0, buzzY);
    ctx.scale(scale, scale);

    const morph = ((variantIndex % 3) + 3) % 3;
    const species = [
      // 0: Golden Italian Honeybee (Apis mellifera ligustica)
      { body: '#facc15', thorax: '#d97706', stripe: '#1c1917', pollen: '#fde047', rx: 5.4, ry: 3.7 },
      // 1: Dark Carniolan Honeybee (Apis mellifera carnica)
      { body: '#d97706', thorax: '#57534e', stripe: '#0f172a', pollen: '#fbbf24', rx: 5.3, ry: 3.6 },
      // 2: Alpine Bumblebee (Bombus alpinus)
      { body: '#fef08a', thorax: '#1c1917', stripe: '#09090b', pollen: '#f59e0b', rx: 6.1, ry: 4.5 },
    ];
    const sp = species[morph];

    // Vibrating veined translucent wings
    ctx.fillStyle = 'rgba(248, 250, 252, 0.88)';
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
    ctx.lineWidth = 0.55;
    const wBuzz = Math.sin(time * 48) * 1.1;
    ctx.beginPath();
    ctx.ellipse(-1.4, -4.6 + wBuzz, 3.6, 2.0, -0.32, 0, Math.PI * 2);
    ctx.ellipse(2.0, -4.6 - wBuzz, 3.4, 1.9, 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pollen baskets on hind legs
    ctx.fillStyle = sp.pollen;
    ctx.beginPath();
    ctx.arc(-1.8, 3.8, 1.25, 0, Math.PI * 2);
    ctx.arc(0.8, 3.9, 1.1, 0, Math.PI * 2);
    ctx.fill();

    // Fuzzy striped abdomen
    ctx.fillStyle = sp.body;
    ctx.beginPath();
    ctx.ellipse(-0.4, 0.2, sp.rx, sp.ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // Velvety thorax collar
    ctx.fillStyle = sp.thorax;
    ctx.beginPath();
    ctx.ellipse(2.4, -0.1, 2.3, 2.9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Crisp black bands & stinger
    ctx.fillStyle = sp.stripe;
    ctx.fillRect(-3.2, -3.2, 1.5, 6.6);
    ctx.fillRect(-0.6, -3.5, 1.6, 7.2);
    ctx.beginPath();
    ctx.moveTo(-sp.rx - 0.2, 0.2);
    ctx.lineTo(-sp.rx - 2.3, 0.4);
    ctx.lineTo(-sp.rx - 0.2, 1.1);
    ctx.closePath();
    ctx.fill();

    // Head, compound eye & delicate antennae
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(4.8, -0.3, 2.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.fillRect(5.2, -1.2, 0.9, 0.9);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(5.8, -1.7); ctx.lineTo(7.4, -3.4);
    ctx.moveTo(6.1, -1.1); ctx.lineTo(7.8, -2.0);
    ctx.stroke();

    ctx.restore();
  }

  public drawLadybugSprite(
    ctx: CanvasRenderingContext2D,
    time: number,
    scale: number = 1,
    variantIndex: number = 0
  ) {
    ctx.save();
    const crawl = Math.sin(time * 4) * 1.5 * scale;
    ctx.translate(crawl, 0);
    ctx.scale(scale, scale);

    const morph = ((variantIndex % 3) + 3) % 3;
    const species = [
      // 0: Seven-Spot Crimson (Coccinella septempunctata)
      { shell: '#dc2626', rim: '#7f1d1d', spot: '#0f172a' },
      // 1: Golden 22-Spot (Psyllobora vigintiduopunctata)
      { shell: '#facc15', rim: '#a16207', spot: '#1c1917' },
      // 2: Harlequin Orange (Harmonia axyridis)
      { shell: '#f97316', rim: '#9a3412', spot: '#0f172a' },
    ];
    const sp = species[morph];

    // Tiny articulated legs
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-4, 3.6, 1.3, 2.1);
    ctx.fillRect(-0.6, 3.9, 1.3, 2.1);
    ctx.fillRect(2.8, 3.6, 1.3, 2.1);

    // Glossy domed elytra shell
    ctx.fillStyle = sp.shell;
    ctx.strokeStyle = sp.rim;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(-0.3, 0, 5.4, 4.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pronotum & head with authentic white cheek spots
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(4.2, 0, 2.3, 3.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(3.4, -2.0, 1.2, 1.1);
    ctx.fillRect(3.4, 0.9, 1.2, 1.1);

    // Antennae
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(6.1, -1.2); ctx.lineTo(7.6, -2.6);
    ctx.moveTo(6.1, 1.2); ctx.lineTo(7.6, 2.6);
    ctx.stroke();

    // Central wing seam & symmetrical spots
    ctx.fillStyle = sp.spot;
    ctx.fillRect(-5.4, -0.35, 8.2, 0.7);
    ctx.beginPath();
    ctx.arc(-2.9, -2.2, 1.0, 0, Math.PI * 2);
    ctx.arc(-0.2, -2.0, 1.05, 0, Math.PI * 2);
    ctx.arc(-2.9, 2.2, 1.0, 0, Math.PI * 2);
    ctx.arc(-0.2, 2.0, 1.05, 0, Math.PI * 2);
    ctx.arc(1.7, 0, 0.85, 0, Math.PI * 2);
    ctx.fill();

    // Curved specular dome sheen
    ctx.fillStyle = 'rgba(255,255,255,0.68)';
    ctx.beginPath();
    ctx.ellipse(-2.0, -3.2, 2.1, 0.8, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- Realistic Jungle Viper / Snake Sprite (4 Natural Rainforest Color Morphs) ---

  public drawSnakeSprite(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    facingLeft: boolean,
    animTimer: number,
    scale: number = 1,
    variantIndex: number = 0
  ) {
    ctx.save();
    ctx.scale(scale * (facingLeft ? -1 : 1), scale);
    const halfW = width / 2;
    const halfH = height / 2;

    const morph = ((variantIndex % 4) + 4) % 4;
    const palettes = [
      // 0: Emerald Viper (Bothriechis viridis)
      { body: '#15803d', dark: '#052e16', pattern: '#86efac', belly: '#fef08a', head: '#166534', eye: '#facc15', isRinged: false },
      // 1: Golden Eyelash Viper (Bothriechis schlegelii)
      { body: '#d97706', dark: '#78350f', pattern: '#fde047', belly: '#fef3c7', head: '#b45309', eye: '#dc2626', isRinged: false },
      // 2: Jungle Coral Snake (Micrurus)
      { body: '#dc2626', dark: '#18181b', pattern: '#fef08a', belly: '#fecaca', head: '#18181b', eye: '#facc15', isRinged: true },
      // 3: Rainforest Bushmaster (Lachesis muta)
      { body: '#5c4033', dark: '#1c1917', pattern: '#a8a29e', belly: '#d6d3d1', head: '#442c22', eye: '#f59e0b', isRinged: false },
    ];
    const p = palettes[morph];

    const slitherPhase = animTimer * 9.5;
    const baseY = halfH - 2.6;

    // Subtle ground contact shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(-1, halfH - 0.5, halfW * 0.88, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Multi-segment sinuous slithering body from tapered tail to neck
    const segments = 13;
    const segPoints: Array<{ x: number; y: number; r: number }> = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments; // 0 = tail tip, 1 = neck
      const x = -halfW + 2 + t * (width - 10);
      const waveAmp = 2.6 * Math.sin(t * Math.PI);
      const y = baseY - Math.abs(Math.sin(slitherPhase - t * 5.2)) * waveAmp - (t > 0.78 ? (t - 0.78) * 20 : 0);
      const r = t < 0.2 ? 1.1 + t * 8 : (t > 0.85 ? 3.2 - (t - 0.85) * 4 : 2.9 + Math.sin(t * Math.PI) * 1.0);
      segPoints.push({ x, y, r });
    }

    // 1. Dark scale outline pass
    for (let i = 0; i < segPoints.length; i++) {
      const pt = segPoints[i];
      ctx.fillStyle = p.dark;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.r + 0.9, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Main reptilian body + ventral belly + species markings
    for (let i = 0; i < segPoints.length; i++) {
      const pt = segPoints[i];
      let fill = p.body;
      if (p.isRinged) {
        const band = i % 4;
        fill = band === 0 ? p.dark : (band === 1 ? p.pattern : p.body);
      }
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
      ctx.fill();

      // Pale ventral belly scale underside
      ctx.fillStyle = p.belly;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y + pt.r * 0.42, pt.r * 0.52, 0, Math.PI);
      ctx.fill();

      // Dorsal diamond/chevron scale markings on non-ringed vipers
      if (!p.isRinged && i > 1 && i < segPoints.length - 1 && i % 2 === 0) {
        ctx.fillStyle = p.dark;
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y - pt.r * 0.85);
        ctx.lineTo(pt.x + pt.r * 0.65, pt.y - pt.r * 0.15);
        ctx.lineTo(pt.x, pt.y + pt.r * 0.3);
        ctx.lineTo(pt.x - pt.r * 0.65, pt.y - pt.r * 0.15);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = p.pattern;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y - pt.r * 0.28, pt.r * 0.28, 0, Math.PI * 2);
        ctx.fill();
      }

      // Glossy dorsal scale highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.beginPath();
      ctx.ellipse(pt.x, pt.y - pt.r * 0.45, pt.r * 0.45, pt.r * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Raised Triangular Venomous Viper Head
    const neck = segPoints[segPoints.length - 1];
    const headBob = Math.sin(animTimer * 6.5) * 0.7;
    const hx = neck.x + 2.8;
    const hy = neck.y - 1.2 + headBob;

    // Flickering forked crimson tongue
    const tongueCycle = (animTimer * 2.4) % 1;
    if (tongueCycle < 0.34) {
      const ext = Math.sin((tongueCycle / 0.34) * Math.PI);
      const tLen = 3.5 + ext * 4.5;
      const tipX = hx + 5.8 + tLen;
      const tipY = hy + 0.6 + Math.sin(animTimer * 36) * 0.9;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.05;
      ctx.beginPath();
      ctx.moveTo(hx + 5.2, hy + 0.5);
      ctx.lineTo(tipX - 1.8, tipY);
      ctx.moveTo(tipX - 1.8, tipY);
      ctx.lineTo(tipX, tipY - 1.6);
      ctx.moveTo(tipX - 1.8, tipY);
      ctx.lineTo(tipX, tipY + 1.5);
      ctx.stroke();
    }

    // Head dark outline
    ctx.fillStyle = p.dark;
    ctx.beginPath();
    ctx.moveTo(hx - 4.2, hy - 3.6);
    ctx.lineTo(hx + 6.4, hy - 1.0);
    ctx.lineTo(hx + 6.2, hy + 1.8);
    ctx.lineTo(hx - 3.6, hy + 3.4);
    ctx.closePath();
    ctx.fill();

    // Head fill
    ctx.fillStyle = p.head;
    ctx.beginPath();
    ctx.moveTo(hx - 3.4, hy - 2.8);
    ctx.lineTo(hx + 5.5, hy - 0.6);
    ctx.lineTo(hx + 5.3, hy + 1.3);
    ctx.lineTo(hx - 3.0, hy + 2.6);
    ctx.closePath();
    ctx.fill();

    // Pale jaw underside & subtle fang glint
    ctx.fillStyle = p.belly;
    ctx.fillRect(hx - 1.5, hy + 1.2, 6.0, 1.0);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(hx + 3.2, hy + 1.8, 0.9, 1.3);

    // Supraocular viper brow ridge
    ctx.fillStyle = p.pattern;
    ctx.fillRect(hx - 0.6, hy - 2.4, 3.0, 0.85);

    // Glowing vertical-slit reptile eye
    ctx.fillStyle = p.eye;
    ctx.beginPath();
    ctx.ellipse(hx + 1.1, hy - 0.7, 1.45, 1.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#09090b';
    ctx.fillRect(hx + 0.85, hy - 1.65, 0.55, 1.9);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(hx + 1.5, hy - 1.2, 0.5, 0.5);

    // Heat-sensing loreal pit / nostril
    ctx.fillStyle = p.dark;
    ctx.fillRect(hx + 3.8, hy - 0.5, 0.8, 0.8);

    ctx.restore();
  }

  /**
   * Biome-authentic enemy coat selection:
   * 1. Grass / Plains biome ('coop', 'trail', 'juvenile', 'fields'): regular + other non-arctic coats (NO Arctic White).
   * 2. Jungle biome ('jungle'): exact same non-arctic coats as Plains (NO Arctic White), plus all 4 snake morphs.
   * 3. Snowy / Arctic biome ('storm', 'snowy'): ONLY Arctic White and regular coat (NOT the rest).
   */
  private getBiomeEnemyVariant(enemy: Enemy, levelTheme?: LevelConfig['theme']): number {
    if (enemy.type === 'snake') {
      return this.hashVariant(enemy.id, 4);
    }

    const isSnowy = levelTheme === 'storm' || levelTheme === 'snowy';
    let allowed: number[];

    if (enemy.type === 'wolf') {
      // Wolf palettes: 0=Timber Grey (regular), 1=Arctic White, 2=Cinnamon, 3=Melanistic Black
      allowed = isSnowy ? [0, 1] : [0, 2, 3];
    } else if (enemy.type === 'fox') {
      // Fox palettes: 0=Red Fox (regular), 1=Silver Fox, 2=Cross Fox, 3=Arctic White
      allowed = isSnowy ? [0, 3] : [0, 1, 2];
    } else {
      // Bear palettes: 0=Grizzly Brown (regular), 1=Kodiak Cinnamon, 2=Polar/Arctic White, 3=Black Bear
      allowed = isSnowy ? [0, 2] : [0, 1, 3];
    }

    return allowed[this.hashVariant(enemy.id, allowed.length)];
  }

  // --- Enemies (Wolf, Fox, Snake, Bear): Render in-combat on platforms ---

  public renderEnemy(enemy: Enemy, camera: Camera, levelTheme?: LevelConfig['theme']) {
    if (enemy.state === 'defeated') return;
    const ctx = this.ctx;
    const sx = enemy.x - camera.x;
    const sy = enemy.y - camera.y;

    if (sx + enemy.width < -60 || sx > this.canvas.width + 60) return;

    ctx.save();

    if (enemy.hurtTimer > 0) {
      // Subtle hurt blink/alpha so the creature texture and detail are never replaced or lost
      ctx.globalAlpha = 0.75;
    }

    const isLeft = enemy.facing === 'left';
    ctx.translate(sx + enemy.width / 2, sy + enemy.height / 2);

    const variantIdx = this.getBiomeEnemyVariant(enemy, levelTheme);
    if (enemy.type === 'wolf') {
      this.drawWolfSprite(ctx, enemy.width, enemy.height, isLeft, enemy.animTimer, 1, variantIdx);
    } else if (enemy.type === 'fox') {
      this.drawFoxSprite(ctx, enemy.width, enemy.height, isLeft, enemy.animTimer, 1, variantIdx);
    } else if (enemy.type === 'snake') {
      this.drawSnakeSprite(ctx, enemy.width, enemy.height, isLeft, enemy.animTimer, 1, variantIdx);
    } else {
      this.drawBearSprite(ctx, enemy.width, enemy.height, isLeft, enemy.animTimer, 1, variantIdx);
    }

    const halfW = enemy.width / 2;
    const halfH = enemy.height / 2;
    if (enemy.health < enemy.maxHealth) {
      const barW = enemy.width;
      const barH = 4;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-halfW, -halfH - 10, barW, barH);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(-halfW, -halfH - 10, (barW * enemy.health) / enemy.maxHealth, barH);
    }

    ctx.restore();
  }

  // --- Mini-Boss: Old Farmer Jed (Sprite + In-World Combat & Speech Bubble Renderer) ---

  public drawFarmerSprite(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    facingLeft: boolean,
    animTimer: number,
    scale: number = 1,
    state: FarmerMiniBoss['state'] = 'patrol',
    isSpeaking: boolean = false,
    hasPitchfork: boolean = true
  ) {
    ctx.save();
    ctx.scale(scale * (facingLeft ? -1 : 1), scale);

    const isInjured = state === 'injured';
    const isDefeated = state === 'defeated';
    const isLunging = state === 'lunge';
    const isWindup = state === 'windup';
    const isWalking = state === 'patrol' || state === 'lunge';
    const stride = isWalking ? Math.sin(animTimer * (isLunging ? 18 : 10)) * 5 : 0;
    const hopOffset = isInjured ? -Math.abs(Math.sin(animTimer * 7)) * 3.5 : (isWalking ? -Math.abs(Math.sin(animTimer * 10)) * 1.6 : 0);

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.34)';
    ctx.beginPath();
    ctx.ellipse(0, height / 2 - 1, width * 0.45, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(0, hopOffset + (isDefeated ? 14 : 0));
    if (isDefeated) {
      ctx.rotate(-0.18);
    } else if (isLunging) {
      ctx.rotate(0.14);
    } else if (isWindup) {
      ctx.rotate(-0.12);
    }

    // 1. Boots & Denim Overalls Legs
    const legTop = 8;
    const bootY = height / 2 - 9;

    // Back leg
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(-10 - stride * 0.6, legTop, 9, 15);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-11 - stride * 0.6, bootY, 12, 8);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-10 - stride * 0.6, bootY + 1, 9, 3);

    // Front leg (bandaged & lifted slightly when injured by baby peck!)
    const frontLegLift = isInjured ? -5 : 0;
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(1 + stride * 0.6, legTop + frontLegLift, 9, 15);
    ctx.fillStyle = '#5c2d16';
    ctx.fillRect(1 + stride * 0.6, bootY + frontLegLift, 13, 8);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(2 + stride * 0.6, bootY + 1 + frontLegLift, 10, 3);

    // White pixel bandage + comic bruise cross when injured
    if (isInjured) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, legTop + 6 + frontLegLift, 11, 7);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(4, legTop + 8 + frontLegLift, 3, 1);
      ctx.fillRect(5, legTop + 7 + frontLegLift, 1, 3);
    }

    // 2. Red Plaid Flannel Torso & Blue Denim Overalls
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(-13, -12, 26, 22);
    // Flannel plaid lines
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(-13, -6, 26, 2);
    ctx.fillRect(-13, 1, 26, 2);
    ctx.fillRect(-5, -12, 2, 22);
    ctx.fillRect(5, -12, 2, 22);

    // Denim Overalls Bib & Straps
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(-10, -5, 20, 16);
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(-8, -3, 16, 12);
    // Straps
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(-9, -12, 4, 9);
    ctx.fillRect(5, -12, 4, 9);
    // Brass Overall Buttons
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-8, -5, 2.5, 2.5);
    ctx.fillRect(6, -5, 2.5, 2.5);

    // 3. Head, Expressive Face, Mustache & Mouth
    ctx.fillStyle = '#f5c29b';
    ctx.fillRect(-9, -27, 18, 15);
    // Rosy cheek
    ctx.fillStyle = '#fca5a5';
    ctx.fillRect(3, -18, 3, 2);
    // Stern bushy eyebrows
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-6, -24, 5, 2);
    ctx.fillRect(2, -24, 6, 2);
    // Eyes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-4, -22, 2.5, 2.5);
    ctx.fillRect(4, -22, 2.5, 2.5);
    // Bushy barnyard mustache
    ctx.fillStyle = '#5c2d16';
    ctx.fillRect(-5, -17, 12, 3);
    ctx.fillRect(-7, -16, 3, 2);
    ctx.fillRect(6, -16, 3, 2);
    // Animated speaking / yelping mouth
    if (isSpeaking || isInjured) {
      const mouthOpen = Math.sin(animTimer * 24) > 0 ? 3 : 1.5;
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(0, -14, 5, mouthOpen);
    }

    // 4. Iconic Wide Woven Golden Straw Hat with Red Band
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-19, -29, 38, 4); // wide brim shadow
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-18, -30, 36, 3.5); // sunny straw brim
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-11, -39, 22, 10); // hat crown
    ctx.fillStyle = '#fde047';
    ctx.fillRect(-9, -38, 16, 4); // crown sun highlight
    // Red hatband
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-11, -32, 22, 3);

    // 5. Front Arm & 3-Pronged Pitchfork (or White Flag when Defeated!)
    const armSwing = isLunging ? 9 : (isWindup ? -7 : Math.sin(animTimer * 10) * 2);
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(4 + armSwing * 0.3, -9, 10, 6);
    ctx.fillStyle = '#f5c29b';
    ctx.fillRect(12 + armSwing * 0.3, -9, 4, 5);

    if (isDefeated) {
      // Surrender white handkerchief on stick!
      ctx.fillStyle = '#78350f';
      ctx.fillRect(14, -30, 3, 24);
      const wave = Math.sin(animTimer * 8) * 2;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(17, -30 + wave * 0.4, 14, 10);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(17, -30 + wave * 0.4, 14, 10);
    } else if (hasPitchfork && !isInjured) {
      ctx.save();
      ctx.translate(14 + armSwing * 0.5, -6);
      const forkAngle = isLunging ? 0.04 : (isWindup ? -0.45 : -0.18);
      ctx.rotate(forkAngle);
      // Wooden shaft
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-18, -2, 36, 3.5);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-16, -2, 32, 1.5);
      // Steel 3-prong head
      ctx.fillStyle = isLunging ? '#e0f2fe' : '#cbd5e1';
      ctx.fillRect(18, -8, 3, 16);
      ctx.fillRect(20, -8, 10, 2.5);
      ctx.fillRect(20, -1.2, 12, 2.5);
      ctx.fillRect(20, 5.5, 10, 2.5);
      if (isLunging) {
        // Gleaming strike flash on prongs
        ctx.fillStyle = 'rgba(254, 240, 138, 0.75)';
        ctx.fillRect(28, -9, 6, 18);
      }
      ctx.restore();
    }

    // Comic stars spinning over head when injured or defeated
    if (isInjured || isDefeated) {
      for (let s = 0; s < 3; s++) {
        const ang = animTimer * 4 + (s * Math.PI * 2) / 3;
        const stx = Math.cos(ang) * 14;
        const sty = -43 + Math.sin(ang) * 4;
        ctx.fillStyle = s % 2 === 0 ? '#fde047' : '#ffffff';
        ctx.fillRect(stx - 2, sty - 2, 4, 4);
      }
    }

    ctx.restore();
  }

  public renderFarmer(farmer: FarmerMiniBoss, camera: Camera, time: number) {
    const ctx = this.ctx;
    const sx = farmer.x - camera.x;
    const sy = farmer.y - camera.y;

    // Render any thrown hay bales even if Farmer is near edge
    farmer.projectiles.forEach(proj => {
      const px = proj.x - camera.x;
      const py = proj.y - camera.y;
      if (px < -40 || px > this.canvas.width + 40) return;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(proj.rotation);
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(-proj.radius, -proj.radius * 0.8, proj.radius * 2, proj.radius * 1.6);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-proj.radius + 2, -proj.radius * 0.8 + 2, proj.radius * 2 - 4, proj.radius * 1.6 - 4);
      // Twine straps on hay bale
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-proj.radius * 0.45, -proj.radius * 0.8, 2.5, proj.radius * 1.6);
      ctx.fillRect(proj.radius * 0.35, -proj.radius * 0.8, 2.5, proj.radius * 1.6);
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      ctx.strokeRect(-proj.radius, -proj.radius * 0.8, proj.radius * 2, proj.radius * 1.6);
      ctx.restore();
    });

    if (sx + farmer.width < -140 || sx > this.canvas.width + 140) return;

    ctx.save();
    if (farmer.hurtTimer > 0) {
      ctx.globalAlpha = 0.72;
    }

    const isSpeaking = farmer.speechTimer > 0 && farmer.speechText.length > 0;
    ctx.translate(sx + farmer.width / 2, sy + farmer.height / 2);
    this.drawFarmerSprite(
      ctx,
      farmer.width,
      farmer.height,
      farmer.facing === 'left',
      farmer.animTimer,
      1,
      farmer.state,
      isSpeaking,
      farmer.mode === 'adult_rematch' || farmer.state !== 'injured'
    );

    // Compact Mini-Boss HP bar above Farmer when actively fighting
    if (farmer.state !== 'idle' && farmer.state !== 'injured' && farmer.state !== 'defeated') {
      const barW = 68;
      const barH = 7;
      const barX = -barW / 2;
      const barY = -farmer.height / 2 - 22;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(barX, barY, barW, barH);
      const dispRatio = Math.max(0, Math.min(1, farmer.displayHealth / Math.max(1, farmer.maxHealth)));
      const hpRatio = Math.max(0, Math.min(1, farmer.health / Math.max(1, farmer.maxHealth)));
      ctx.fillStyle = '#facc15';
      ctx.fillRect(barX, barY, barW * dispRatio, barH);
      ctx.fillStyle = farmer.mode === 'adult_rematch' ? '#f97316' : '#ef4444';
      ctx.fillRect(barX, barY, barW * hpRatio, barH);

      ctx.fillStyle = '#fef08a';
      ctx.font = '700 8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      const title = farmer.mode === 'adult_rematch' ? 'FARMER JED · REMATCH' : 'FARMER JED';
      ctx.fillText(title, 0, barY - 5);
    }

    ctx.restore();

    // Retro 8-Bit Speech Bubble when Farmer Jed speaks!
    if (isSpeaking) {
      const visibleText = farmer.speechText.slice(0, Math.max(1, Math.floor(farmer.speechCharIndex)));
      ctx.save();
      ctx.font = '700 10px "Silkscreen", monospace';

      // Wrap into at most 2 crisp lines
      const maxLineW = 240;
      const words = visibleText.split(' ');
      const lines: string[] = [];
      let current = '';
      for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (ctx.measureText(test).width > maxLineW && current) {
          lines.push(current);
          current = word;
        } else {
          current = test;
        }
      }
      if (current) lines.push(current);

      const boxPadX = 12;
      const boxPadY = 8;
      const lineH = 14;
      const measuredW = Math.max(90, ...lines.map(l => ctx.measureText(l).width));
      const boxW = Math.min(270, measuredW + boxPadX * 2);
      const boxH = lines.length * lineH + boxPadY * 2 + 12;

      const anchorX = sx + farmer.width / 2;
      const boxX = Math.max(12, Math.min(this.canvas.width - boxW - 12, anchorX - boxW / 2));
      const boxY = Math.max(70, sy - boxH - 32 + Math.sin(time * 5) * 1.5);

      // 8-bit shadow & parchment bubble
      ctx.fillStyle = '#000000';
      ctx.fillRect(boxX + 3, boxY + 3, boxW, boxH);
      ctx.fillStyle = '#fffbeb';
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      // Speech pointer triangle
      const tailX = Math.max(boxX + 16, Math.min(boxX + boxW - 16, anchorX));
      ctx.fillStyle = '#fffbeb';
      ctx.beginPath();
      ctx.moveTo(tailX - 7, boxY + boxH - 1);
      ctx.lineTo(tailX + 7, boxY + boxH - 1);
      ctx.lineTo(tailX, boxY + boxH + 9);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(tailX - 7, boxY + boxH);
      ctx.lineTo(tailX, boxY + boxH + 9);
      ctx.lineTo(tailX + 7, boxY + boxH);
      ctx.stroke();

      // Speaker tag
      ctx.fillStyle = '#b45309';
      ctx.font = '700 8px "Press Start 2P", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('FARMER JED:', boxX + boxPadX, boxY + 13);

      // Dialogue lines
      ctx.fillStyle = '#1e293b';
      ctx.font = '700 10px "Silkscreen", monospace';
      lines.forEach((line, idx) => {
        ctx.fillText(line, boxX + boxPadX, boxY + 28 + idx * lineH);
      });

      ctx.restore();
    }
  }

  // --- Protective Shield & Royal Champion Crown Renderers ---

  public drawShield(
    ctx: CanvasRenderingContext2D,
    walkBounce: number,
    type: 'iron' | 'gold' | 'diamond',
    halfW: number,
    fireResistActive: boolean = false
  ) {
    ctx.save();
    ctx.translate(halfW + 4, walkBounce - 1);

    // Protective glowing barrier aura when guarding
    const auraGrad = ctx.createRadialGradient(0, 0, 6, 0, 0, 26);
    if (fireResistActive) {
      auraGrad.addColorStop(0, 'rgba(251, 146, 60, 0.9)');
      auraGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.6)');
      auraGrad.addColorStop(0.85, 'rgba(250, 204, 21, 0.4)');
      auraGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    } else {
      auraGrad.addColorStop(0, 'rgba(56, 189, 248, 0.7)');
      auraGrad.addColorStop(0.7, 'rgba(250, 204, 21, 0.35)');
      auraGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    }
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();

    // RENDER THE EXACT SAME ROYAL SHIELD THAT SAM HOLDS & GIVES YOU!
    this.drawShieldSprite(ctx, 0.95);

    // If Fire-Resist buff is active, crown the shield with small dancing fire embers!
    if (fireResistActive) {
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-6, -14, 2.5, 3);
      ctx.fillRect(4, -14, 2.5, 3);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-1, -16, 3, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, -15, 1, 1);
    }

    ctx.restore();
  }

  public drawCrown(
    _ctx: CanvasRenderingContext2D,
    _walkBounce: number,
    _halfH: number,
    _stage: GrowthStage
  ) {
    // Detailed crown removed per user request: chick's natural tiny crest/crown is visible
    return;
  }

  // --- Boss Fight: The Ancient Cockatrice Rendering ---

  public renderCockatrice(boss: CockatriceBoss, camera: Camera, time: number) {
    if (boss.defeatSubState === 'escaped') return;
    const ctx = this.ctx;

    // 1. Render permanent/semi-permanent bite craters on the land platforms with grass and dirt!
    if (boss.bittenLandCraters && boss.bittenLandCraters.length > 0) {
      boss.bittenLandCraters.forEach(crater => {
        const cx = crater.x - camera.x;
        const cy = crater.y - camera.y;
        if (cx < -120 || cx > this.canvas.width + 120) return;

        ctx.save();
        // Dark jagged bite trench in the grass and dirt
        ctx.fillStyle = '#290c02';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 8, crater.width / 2, 20, 0, 0, Math.PI);
        ctx.fill();

        // Exposed deep earth layers
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 12, (crater.width / 2) * 0.78, 14, 0, 0, Math.PI);
        ctx.fill();

        // Jagged dragon teeth puncture gouges
        ctx.fillStyle = '#78350f';
        for (let tooth = -crater.width / 2 + 12; tooth < crater.width / 2 - 12; tooth += 22) {
          ctx.beginPath();
          ctx.moveTo(cx + tooth, cy + 2);
          ctx.lineTo(cx + tooth + 11, cy + 22);
          ctx.lineTo(cx + tooth + 22, cy + 2);
          ctx.closePath();
          ctx.fill();
        }

        // Shredded grass fringes along crater edges
        ctx.fillStyle = '#15803d';
        for (let g = -crater.width / 2 + 4; g < crater.width / 2 - 4; g += 14) {
          ctx.fillRect(cx + g, cy - 2, 4, 7);
          ctx.fillRect(cx + g + 2, cy - 5, 2, 5);
        }
        ctx.restore();
      });
    }

    // 2. Render Stomp / Bite Danger Telegraph Warning on the targeted land platform
    if (boss.state === 'prepare_stomp' || boss.state === 'prepare_bite') {
      const tx = boss.biteTargetX - camera.x;
      const ty = boss.biteTargetY - camera.y;

      if (tx > -160 && tx < this.canvas.width + 160) {
        ctx.save();
        const pulse = 0.55 + Math.sin(time * 18) * 0.45;
        const warningW = 220;

        // Pulsating crimson hazard beacon over the targeted land platform
        const zoneGrad = ctx.createLinearGradient(0, ty - 60, 0, ty + 20);
        zoneGrad.addColorStop(0, `rgba(239, 68, 68, 0)`);
        zoneGrad.addColorStop(0.5, `rgba(239, 68, 68, ${pulse * 0.35})`);
        zoneGrad.addColorStop(1, `rgba(220, 38, 38, ${pulse * 0.75})`);
        ctx.fillStyle = zoneGrad;
        ctx.fillRect(tx - warningW / 2, ty - 50, warningW, 70);

        // Flashing razor teeth outline across land platform
        ctx.strokeStyle = `rgba(254, 240, 138, ${pulse})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(tx - warningW / 2, ty - 6, warningW, 36);

        // Serrated stomp teeth marks
        for (let t = -warningW / 2 + 10; t < warningW / 2 - 10; t += 24) {
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.moveTo(tx + t, ty - 5);
          ctx.lineTo(tx + t + 12, ty + 18);
          ctx.lineTo(tx + t + 24, ty - 5);
          ctx.closePath();
          ctx.fill();
        }

        // Flashing Warning Label
        ctx.textAlign = 'center';
        ctx.font = '700 12px "Silkscreen", monospace';
        ctx.fillStyle = pulse > 0.5 ? '#fde047' : '#ffffff';
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 10;
        ctx.fillText("⚠ DANGER: COCKATRICE STOMPING THIS PLATFORM! ⚠", tx, ty - 32);
        ctx.font = '700 10px "Silkscreen", monospace';
        ctx.fillStyle = '#fca5a5';
        ctx.fillText("JUMP OVER THE SHOCKWAVES TO DODGE!", tx, ty - 16);
        ctx.restore();
      }
    }

    // 2.5. Render Summoning Telegraph Runes & Active Summon Arena Banner
    if (boss.state === 'prepare_summon') {
      const waveType = boss.summonWaveType || 'wolf';
      const offsets = waveType === 'bear' ? [-280, 280] : [-340, 20, 340];
      const groundY = 460 - camera.y;
      const pulse = 0.5 + Math.sin(time * 16) * 0.45;

      ctx.save();
      offsets.forEach((offset) => {
        const rx = 800 + offset - camera.x;
        if (rx < -80 || rx > this.canvas.width + 80) return;

        ctx.fillStyle = `rgba(168, 85, 247, ${pulse * 0.32})`;
        ctx.fillRect(rx - 28, groundY - 46, 56, 46);

        ctx.strokeStyle = pulse > 0.5 ? '#c084fc' : '#f43f5e';
        ctx.lineWidth = 3;
        ctx.strokeRect(rx - 30, groundY - 6, 60, 10);

        ctx.fillStyle = '#fde047';
        ctx.fillRect(rx - 4, groundY - 22 - Math.sin(time * 14) * 6, 8, 8);
      });

      const beastLabel = waveType === 'wolf' ? 'WOLVES' : (waveType === 'fox' ? 'FOXES' : (waveType === 'snake' ? 'VENOMOUS SNAKES' : 'BEARS'));
      ctx.textAlign = 'center';
      ctx.font = '700 12px "Silkscreen", monospace';
      ctx.fillStyle = waveType === 'snake' ? (pulse > 0.5 ? '#86efac' : '#fde047') : (pulse > 0.5 ? '#f5d0fe' : '#fde047');
      ctx.shadowColor = waveType === 'snake' ? '#15803d' : '#7e22ce';
      ctx.shadowBlur = 8;
      ctx.fillText(`⚠ COCKATRICE SUMMONING ${beastLabel}! ⚠`, this.canvas.width / 2, 96);
      ctx.restore();
    } else if (boss.state === 'waiting_summons') {
      const waveType = boss.summonWaveType || 'wolf';
      const beastLabel = waveType === 'wolf' ? 'WOLVES' : (waveType === 'fox' ? 'FOXES' : (waveType === 'snake' ? 'SNAKES' : 'BEARS'));
      const pulse = 0.65 + Math.sin(time * 8) * 0.35;
      const bannerW = Math.min(480, this.canvas.width - 28);
      const bannerX = (this.canvas.width - bannerW) / 2;
      const bannerY = 82;

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.fillRect(bannerX, bannerY, bannerW, 26);
      ctx.strokeStyle = waveType === 'snake' ? `rgba(74, 222, 128, ${pulse})` : `rgba(192, 132, 252, ${pulse})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(bannerX, bannerY, bannerW, 26);
      ctx.textAlign = 'center';
      ctx.font = '700 9.5px "Silkscreen", monospace';
      ctx.fillStyle = '#fde047';
      ctx.fillText(`⚔ DEFEAT ALL SUMMONED ${beastLabel} TO RESUME BATTLE! ⚔`, this.canvas.width / 2, bannerY + 17);
      ctx.restore();
    }

    // 3. Colossal Cockatrice Boss Model (Scaled, Magnificent & Fearsome!)
    const sx = boss.x - camera.x;
    const sy = boss.y - camera.y;
    const isDefeated = boss.state === 'defeated';
    const defeatSub = boss.defeatSubState;
    const isExplodingAshes = isDefeated && defeatSub === 'exploding_ashes';

    if (sx + boss.width < -140 || sx > this.canvas.width + 140) return;

    const explodeProgress = isExplodingAshes ? Math.min(1, (boss.defeatTimer || 0) / 0.85) : 0;

    ctx.save();
    const cx = sx + boss.width / 2;
    const cy = sy + boss.height / 2;

    if (!isExplodingAshes || explodeProgress < 0.95) {
      ctx.save();
      ctx.translate(cx, cy);

      if (isExplodingAshes) {
        const trembleX = Math.sin(time * 95) * (8 * (1 - explodeProgress));
        const trembleY = Math.cos(time * 85) * (6 * (1 - explodeProgress));
        ctx.translate(trembleX, trembleY);
      }

      // Apply scale so the boss is huge and imposing!
      const bossScale = 1.75 * (isExplodingAshes ? (1 + explodeProgress * 0.18) : 1);
      ctx.scale(bossScale, bossScale);

      // Dissolve alpha during bright ash explosion or invulnerability blink
      if (isExplodingAshes) {
        ctx.globalAlpha = Math.max(0, 1 - explodeProgress * 1.15);
      } else if (boss.invulnerableTimer > 0 && Math.sin(time * 35) > 0) {
        ctx.globalAlpha = 0.45;
      }

      const isLeft = boss.facing === 'left';
      if (isLeft) ctx.scale(-1, 1);

      const isStunned = boss.state === 'stunned';
      const isPreparingFire = boss.state === 'prepare_fire' || boss.state === 'inferno_flame';
      const isSlumpedLookingDown = false;
      const isEnragedLookingAtPlayer = false;
      const isFlyingAway = isDefeated && defeatSub === 'fly_away';
    
    // The boss ONLY gets burnt marks when we deflect his own fireballs at him!
    // 1 fireball deflected: 1 burnt mark
    // 2 fireballs deflected: 2 burnt marks
    // 3 fireballs deflected: 3 burnt marks
    const marks = boss.burntMarksCount ?? 0;
    const isShakingOff = Boolean(boss.isShakingOff || (boss.shakeOffTimer && boss.shakeOffTimer > 0));
    const isRegrowing = Boolean(boss.regrowGlowTimer && boss.regrowGlowTimer > 0);

    // Rapid shake wobble when shaking off charred feathers and scales
    if (isShakingOff) {
      const shakeOffset = Math.sin(time * 50) * 6;
      ctx.translate(shakeOffset, 0);
    }

    const tailSway = isStunned ? 0 : Math.sin(time * 5) * 0.28;

    const isTailWhipping = boss.state === 'tail_whipping';
    const isPrepareTailWhip = boss.state === 'prepare_tail_whip';

    // 360 Tail Whip Spin Animation
    let spinAngle = 0;
    if (isTailWhipping) {
      const progress = Math.min(1, boss.stateTimer / 0.75);
      spinAngle = progress * Math.PI * 2; // Full 360 degree spin!
      ctx.rotate(spinAngle);

      // 360 Degree Whirlwind Slash Vortex Ring
      ctx.save();
      ctx.rotate(-spinAngle);
      const ringGrad = ctx.createRadialGradient(0, 0, 35, 0, 0, 95);
      ringGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      ringGrad.addColorStop(0.65, 'rgba(56, 189, 248, 0.45)');
      ringGrad.addColorStop(0.85, 'rgba(250, 204, 21, 0.65)');
      ringGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = ringGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 95, 0, Math.PI * 2);
      ctx.fill();

      // Spiraling 360 wind slash arcs
      for (let a = 0; a < 4; a++) {
        const arcStart = spinAngle * 2.5 + a * (Math.PI / 2);
        ctx.strokeStyle = a % 2 === 0 ? '#38bdf8' : '#fde047';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(0, 0, 80 + a * 4, arcStart, arcStart + 1.1);
        ctx.stroke();
      }
      ctx.restore();
    } else if (isPrepareTailWhip) {
      // Coiling windup tension before unleashing the 360 spin
      const coil = Math.sin(boss.stateTimer * 16) * 0.15;
      ctx.rotate(-0.35 + coil);
    }

    // 1. Serpentine Dragon Tail (Curving behind with dorsal blades and venom mace)
    let tailAngle = -0.35 + tailSway;
    let tailScaleW = 1;
    if (isTailWhipping) {
      tailAngle = Math.sin(boss.stateTimer * 32) * 0.85;
      tailScaleW = 1.35; // Elongated high-speed whip stretch!
    } else if (isPrepareTailWhip) {
      tailAngle = 0.75; // Coiled spring
    } else if (isSlumpedLookingDown) {
      tailAngle = 0.22; // Tail limp on floor
    } else if (isFlyingAway) {
      tailAngle = -0.55 + Math.sin(time * 20) * 0.18; // Trailing back in flight
    }

    ctx.save();
    ctx.translate(-42, 16);
    ctx.scale(tailScaleW, 1);
    ctx.rotate(tailAngle);

    // Dragon tail base with emerald scales
    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.ellipse(-26, 0, 32, 12, -0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#047857';
    ctx.beginPath();
    ctx.ellipse(-26, -2, 28, 8, -0.22, 0, Math.PI * 2);
    ctx.fill();

    // Burnt Mark 3: Charred scorch mark on dragon tail scales (only when 3 fireballs deflected)
    if (marks >= 3) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.ellipse(-28, 0, 18, 8, -0.22, 0, Math.PI * 2);
      ctx.fill();
    }

    // Spiny razor dorsal barbs along dragon tail
    ctx.fillStyle = '#0f172a';
    for (let sp = -48; sp <= -10; sp += 11) {
      ctx.beginPath();
      ctx.moveTo(sp, -6);
      ctx.lineTo(sp - 4, -18);
      ctx.lineTo(sp + 4, -5);
      ctx.closePath();
      ctx.fill();
      // Glowing green barb edge
      ctx.fillStyle = '#10b981';
      ctx.fillRect(sp - 2, -15, 2, 7);
      ctx.fillStyle = '#0f172a';
    }

    // Heavy Spiked Venom Mace / Plume fan at tail tip
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.ellipse(-56, -6, 18, 9, -0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.ellipse(-64, -8, 12, 5, -0.45, 0, Math.PI * 2);
    ctx.fill();
    // Spiked stinger barbs
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(-68, -8);
    ctx.lineTo(-78, -12);
    ctx.lineTo(-68, -4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 2. Colossal Muscular Dragon Torso with Overlapping Hexagonal Scales
    const bodyBob = isSlumpedLookingDown ? 8 : (isStunned ? 0 : Math.sin(time * 6) * 3.5);
    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.ellipse(0, 10 + bodyBob, 46, 32, 0, 0, Math.PI * 2);
    ctx.fill();

    // Layered Emerald Dragon Scales
    ctx.fillStyle = '#047857';
    ctx.beginPath();
    ctx.ellipse(-8, 6 + bodyBob, 38, 25, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#059669';
    for (let row = -16; row <= 16; row += 10) {
      for (let col = -12; col <= 18; col += 10) {
        ctx.fillRect(col, row + bodyBob, 5, 4);
      }
    }

    // Royal Dragon Breastplate with Glowing Flame Runes
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.ellipse(20, 12 + bodyBob, 20, 24, 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(16, 2 + bodyBob, 11, 18);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(20, 5 + bodyBob, 5, 12);
    // Glowing rune spark
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(22, 9 + bodyBob, 2, 4);

    // Burnt Mark 2: Deep charred scorch patch on torso scales (only when 2 or more fireballs deflected)
    if (marks >= 2) {
      ctx.save();
      // Charcoal black scorch patches across emerald scales
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.ellipse(6, 12 + bodyBob, 26, 18, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-14, 8 + bodyBob, 20, 15, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(18, 4 + bodyBob, 14, 12, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Singed jagged carbon fracture fissures across scales
      ctx.strokeStyle = '#1c1917';
      ctx.lineWidth = 2;
      for (let c = -14; c <= 16; c += 8) {
        ctx.beginPath();
        ctx.moveTo(c, 0 + bodyBob);
        ctx.lineTo(c + 4, 12 + bodyBob);
        ctx.lineTo(c - 2, 22 + bodyBob);
        ctx.stroke();
      }

      // Smoldering ember lines and orange heat cracks
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(4, 10 + bodyBob, 5, 2.5);
      ctx.fillRect(-8, 13 + bodyBob, 4, 2);
      ctx.fillRect(14, 6 + bodyBob, 4, 2);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(6, 11 + bodyBob, 2.5, 1.5);
      ctx.fillRect(-7, 14 + bodyBob, 2, 1);
      ctx.restore();
    } else if (marks === 0 || isRegrowing) {
      // Layered iridescent reptile-bird dorsal scales with metallic jade sheen
      ctx.save();
      ctx.strokeStyle = isRegrowing ? '#86efac' : '#34d399';
      ctx.lineWidth = 1.4;
      for (let row = 0; row < 2; row++) {
        for (let r = 0; r < 6; r++) {
          ctx.beginPath();
          ctx.arc(-14 + r * 7 + (row % 2) * 3.5, 4 + row * 7 + bodyBob, 4.8, Math.PI * 0.15, Math.PI * 0.85);
          ctx.stroke();
        }
      }
      // Subtle specular scale glint
      ctx.fillStyle = isRegrowing ? '#fef08a' : 'rgba(167, 243, 208, 0.5)';
      ctx.fillRect(-4, 2 + bodyBob, 5, 2);
      ctx.fillRect(8, 9 + bodyBob, 4, 1.8);
      if (isRegrowing) {
        const blink = Math.sin(time * 16) > 0;
        ctx.fillStyle = blink ? '#fef08a' : '#ffffff';
        ctx.fillRect(10, 2 + bodyBob, 3, 3);
        ctx.fillRect(-12, 10 + bodyBob, 2.5, 2.5);
      }
      ctx.restore();
    }

    // 3. Fierce Armored Raptor Talons (Dinosaur Legs with Obsidian Claws)
    const legY = 36 + bodyBob;
    // Thighs
    ctx.fillStyle = '#047857';
    ctx.fillRect(-20, legY - 12, 14, 18);
    ctx.fillRect(10, legY - 12, 14, 18);
    // Shins
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(-18, legY + 2, 10, 10);
    ctx.fillRect(12, legY + 2, 10, 10);
    // Talon base
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-28, legY + 10, 24, 6);
    ctx.fillRect(4, legY + 10, 24, 6);
    // Razor curved talons
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-28, legY + 10);
    ctx.lineTo(-35, legY + 16);
    ctx.lineTo(-28, legY + 16);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(28, legY + 10);
    ctx.lineTo(35, legY + 16);
    ctx.lineTo(28, legY + 16);
    ctx.closePath();
    ctx.fill();

    // 4. Colossal Feathered Wyvern Wings (Double-jointed with Glowing Fire Veins)
    let wingFlap = isStunned ? 0.25 : boss.wingAngle;
    if (isSlumpedLookingDown) {
      wingFlap = 0.82; // Drooped lifelessly to the floor
    } else if (isEnragedLookingAtPlayer) {
      wingFlap = 0.15; // Flared defiant posture
    } else if (isFlyingAway) {
      wingFlap = Math.sin((boss.defeatTimer || 0) * 28) * 0.9; // Flapping furiously upward
    }

    ctx.save();
    ctx.translate(-6, -8 + bodyBob);
    ctx.rotate(wingFlap);

    // Wing bone arm
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(-28, -24, 64, 11);
    // Wing bone knuckle joint
    ctx.fillStyle = '#022c22';
    ctx.beginPath();
    ctx.arc(36, -20, 6, 0, Math.PI * 2);
    ctx.fill();
    // Sharp obsidian wing talon
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(36, -24);
    ctx.lineTo(45, -34);
    ctx.lineTo(38, -18);
    ctx.closePath();
    ctx.fill();

    // Fiery dragon wing membrane with glowing veins
    const wingGrad = ctx.createLinearGradient(-20, -20, 20, 30);
    wingGrad.addColorStop(0, '#7f1d1d');
    wingGrad.addColorStop(0.5, '#ea580c');
    wingGrad.addColorStop(1, '#065f46');
    ctx.fillStyle = wingGrad;
    for (let f = 0; f < 6; f++) {
      ctx.beginPath();
      ctx.ellipse(26 - f * 11, -14 + f * 7, 16, 32, 0.45 - f * 0.14, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glowing amber wing vein lines & anatomical wyvern finger ribs
    ctx.strokeStyle = '#022c22';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(35, -20); ctx.lineTo(28, 16);
    ctx.moveTo(32, -20); ctx.lineTo(10, 22);
    ctx.moveTo(22, -20); ctx.lineTo(-8, 22);
    ctx.stroke();

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(34, -20);
    ctx.lineTo(15, 12);
    ctx.moveTo(18, -20);
    ctx.lineTo(2, 18);
    ctx.moveTo(4, -18);
    ctx.lineTo(-14, 15);
    ctx.stroke();

    // Emerald trailing flight feathers
    ctx.fillStyle = '#10b981';
    for (let f = 0; f < 5; f++) {
      ctx.beginPath();
      ctx.ellipse(20 - f * 10, -16 + f * 5, 10, 22, 0.4 - f * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }

    // Burnt Mark 1: Wing flight feather tips singed and charred (when 1 or more fireballs deflected)
    if (marks >= 1) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      for (let f = 0; f < 5; f++) {
        ctx.beginPath();
        ctx.ellipse(22 - f * 11, -12 + f * 6, 9, 14, 0.4 - f * 0.12, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#f97316';
      ctx.fillRect(18, -4, 2.5, 2.5);
      ctx.fillRect(6, 4, 2.5, 2.5);
      ctx.fillRect(-6, 10, 2, 2);
    }
    ctx.restore();

    // 5. Extended Muscular Scaled Serpent Neck with Feathered Rooster Hackle Ruff
    ctx.fillStyle = '#047857';
    ctx.beginPath();
    if (isSlumpedLookingDown) {
      ctx.moveTo(12, 10 + bodyBob);
      ctx.lineTo(30, 0 + bodyBob);
      ctx.lineTo(44, 2 + bodyBob);
      ctx.lineTo(32, 16 + bodyBob);
    } else {
      ctx.moveTo(12, 10 + bodyBob);
      ctx.lineTo(34, -26 + bodyBob);
      ctx.lineTo(48, -24 + bodyBob);
      ctx.lineTo(32, 14 + bodyBob);
    }
    ctx.closePath();
    ctx.fill();

    // Layered rooster-serpent hackle ruff transitioning neck to torso
    if (!isSlumpedLookingDown) {
      ctx.fillStyle = '#065f46';
      for (let hIdx = 0; hIdx < 4; hIdx++) {
        ctx.beginPath();
        ctx.moveTo(18 + hIdx * 5, -6 + hIdx * 2 + bodyBob);
        ctx.lineTo(13 + hIdx * 5, 5 + hIdx * 2 + bodyBob);
        ctx.lineTo(24 + hIdx * 5, 1 + hIdx * 2 + bodyBob);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Throat scutes
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(20, (isSlumpedLookingDown ? 2 : -18) + bodyBob, 11, isSlumpedLookingDown ? 12 : 24);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(24, (isSlumpedLookingDown ? 4 : -14) + bodyBob, 5, isSlumpedLookingDown ? 8 : 18);

    // Burnt Mark 3 on throat scutes (only when 3 fireballs deflected)
    if (marks >= 3) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.ellipse(26, (isSlumpedLookingDown ? 6 : -10) + bodyBob, 8, 14, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Colossal Chimera Dragon-Rooster Head
    let headX = 38;
    let headY = -34 + bodyBob;
    if (isSlumpedLookingDown) {
      // Fallen to ground, looking down at the floor!
      headX = 35;
      headY = 2 + bodyBob;
    } else if (isEnragedLookingAtPlayer) {
      // Snapped erect, glaring straight ahead at player!
      headX = 42;
      headY = -38 + bodyBob;
    } else if (isFlyingAway) {
      // Looking straight up into the sky
      headX = 36;
      headY = -48 + bodyBob;
    }

    ctx.fillStyle = '#065f46';
    ctx.beginPath();
    ctx.ellipse(headX, headY, 19, 15, isSlumpedLookingDown ? 0.35 : 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Serrated Blazing Crimson Crown Comb with Fiery Spikes
    ctx.fillStyle = '#b91c1c';
    for (let cIdx = 0; cIdx < 5; cIdx++) {
      ctx.beginPath();
      const combH = isSlumpedLookingDown ? 14 : (cIdx === 2 ? 37 : 30);
      ctx.moveTo(headX - 14 + cIdx * 7, headY - 10);
      ctx.lineTo(headX - 11 + cIdx * 7, headY - combH);
      ctx.lineTo(headX - 6 + cIdx * 7, headY - 10);
      ctx.closePath();
      ctx.fill();
      // Glowing tips
      ctx.fillStyle = '#facc15';
      ctx.fillRect(headX - 12 + cIdx * 7, headY - combH + 2, 2, 4);
      ctx.fillStyle = '#b91c1c';
    }
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(headX - 12, headY - 14, 26, 5);

    // Hanging Crimson Wattles
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.ellipse(headX + 5, headY + 15, 6, 12, 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f87171';
    ctx.fillRect(headX + 3, headY + 12, 3, 7);

    // Upper Razor Beak (Colossal curved raptor beak)
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(headX + 10, headY - 7);
    ctx.quadraticCurveTo(headX + 36, headY - 2, headX + 34, headY + 4);
    ctx.lineTo(headX + 10, headY + 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d97706';
    ctx.fillRect(headX + 12, headY - 1, 14, 3);
    // Razor beak tip
    ctx.fillStyle = '#fde047';
    ctx.fillRect(headX + 30, headY + 1, 4, 3);

    // Lower Beak / Jaw (Unhinges dramatically during roar, speech, and bite!)
    const jawDrop = (isEnragedLookingAtPlayer ? 0.9 : (boss.jawOpen || 0)) * 18;
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(headX + 10, headY + 5);
    ctx.lineTo(headX + 30, headY + 6 + jawDrop);
    ctx.lineTo(headX + 10, headY + 10 + jawDrop);
    ctx.closePath();
    ctx.fill();

    // Molten furnace glow inside open maw + sharp ivory dragon fangs!
    if (jawDrop > 3) {
      const mawGlow = ctx.createRadialGradient(headX + 18, headY + 5 + jawDrop * 0.4, 1, headX + 18, headY + 5 + jawDrop * 0.4, 14);
      mawGlow.addColorStop(0, 'rgba(254, 240, 138, 0.92)');
      mawGlow.addColorStop(0.55, 'rgba(249, 115, 22, 0.65)');
      mawGlow.addColorStop(1, 'rgba(185, 28, 28, 0)');
      ctx.fillStyle = mawGlow;
      ctx.beginPath();
      ctx.ellipse(headX + 18, headY + 5 + jawDrop * 0.45, 11, 5 + jawDrop * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      for (let t = 0; t < 3; t++) {
        ctx.beginPath();
        ctx.moveTo(headX + 13 + t * 6, headY + 4);
        ctx.lineTo(headX + 16 + t * 6, headY + 10);
        ctx.lineTo(headX + 19 + t * 6, headY + 4);
        ctx.closePath();
        ctx.fill();
      }
      for (let t = 0; t < 3; t++) {
        ctx.beginPath();
        ctx.moveTo(headX + 13 + t * 6, headY + 7 + jawDrop);
        ctx.lineTo(headX + 16 + t * 6, headY + 2 + jawDrop);
        ctx.lineTo(headX + 19 + t * 6, headY + 7 + jawDrop);
        ctx.closePath();
        ctx.fill();
      }
    }

    // 7. Glowing Piercing Predatory Ruby Eye with Vertical Slit Pupil
    if (isStunned) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(headX + 2, headY - 6);
      ctx.lineTo(headX + 10, headY + 2);
      ctx.moveTo(headX + 10, headY - 6);
      ctx.lineTo(headX + 2, headY + 2);
      ctx.stroke();
    } else if (isDefeated) {
      // Defeated Cockatrice keeps normal upright head and has wide-open shocked eyes!
      const pupilShake = Math.sin(time * 42) * 0.7;
      // Dark outer eye rim
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(headX + 6, headY - 3, 9.2, 0, Math.PI * 2);
      ctx.fill();
      // Wide shocked white sclera
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(headX + 6, headY - 3, 7.8, 0, Math.PI * 2);
      ctx.fill();
      // Tiny trembling startled iris & pinprick pupil
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(headX + 7 + pupilShake, headY - 3, 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(headX + 7 + pupilShake, headY - 3, 1.5, 0, Math.PI * 2);
      ctx.fill();
      // Crisp specular highlight
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(headX + 3.5, headY - 7, 2, 2);
    } else if (isEnragedLookingAtPlayer) {
      // Snapped erect, glaring straight ahead at the player!
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(headX + 6, headY - 3, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(headX + 6, headY - 3, 6, 0, Math.PI * 2);
      ctx.fill();
      // Blazing vertical gold slit pupil glaring right at player!
      ctx.fillStyle = '#fde047';
      ctx.fillRect(headX + 5, headY - 6, 2.5, 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(headX + 6.5, headY - 5, 2, 2);
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(headX + 6, headY - 3, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(headX + 6, headY - 3, 5, 0, Math.PI * 2);
      ctx.fill();
      // Glowing vertical slit pupil
      ctx.fillStyle = '#fde047';
      ctx.fillRect(headX + 5, headY - 6, 2.2, 6.5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(headX + 6.5, headY - 5, 1.5, 1.5);
    }

    // 8. Fire vortex swirl in mouth if preparing fire
    if (isPreparingFire) {
      const mouthX = headX + 24;
      const mouthY = headY + 6;
      const fGlow = 0.55 + Math.sin(time * 16) * 0.4;
      ctx.fillStyle = `rgba(249, 115, 22, ${fGlow})`;
      ctx.beginPath();
      ctx.arc(mouthX, mouthY, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(mouthX, mouthY, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    // 9. Stunned Dizzy Effect: 3 Cartoon Stars spinning above head
    if (isStunned) {
      const starT = time * 5;
      for (let s = 0; s < 3; s++) {
        const starAngle = starT + (s * Math.PI * 2) / 3;
        const starX = Math.cos(starAngle) * 42;
        const starY = headY - 32 + Math.sin(starAngle) * 12;

        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(starX, starY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(starX - 1.5, starY - 1.5, 3, 3);
      }
    }

      ctx.restore();
    }

    // 4. Stomp Ground Shockwaves (Expanding across floor)
    if (boss.shockwaves && boss.shockwaves.length > 0) {
      boss.shockwaves.forEach(sw => {
        const swX = sw.x - camera.x;
        const swY = sw.y - camera.y;
        if (swX < -40 || swX > this.canvas.width + 40) return;

        ctx.save();
        const swGrad = ctx.createRadialGradient(swX, swY, 2, swX, swY, sw.radius);
        swGrad.addColorStop(0, '#fef08a');
        swGrad.addColorStop(0.4, '#f97316');
        swGrad.addColorStop(0.85, '#ef4444');
        swGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

        ctx.fillStyle = swGrad;
        ctx.beginPath();
        ctx.ellipse(swX, swY, sw.radius * 1.3, sw.radius * 0.9, 0, Math.PI, 0, false);
        ctx.fill();

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(swX - sw.radius, swY);
        ctx.lineTo(swX - sw.radius * 0.5, swY - sw.radius * 0.7);
        ctx.lineTo(swX, swY - sw.radius * 0.9);
        ctx.lineTo(swX + sw.radius * 0.5, swY - sw.radius * 0.7);
        ctx.lineTo(swX + sw.radius, swY);
        ctx.stroke();

        ctx.restore();
      });
    }

    // 5. Claw Slash Trails (Swooping claw arcs)
    if (boss.slashTrails && boss.slashTrails.length > 0) {
      boss.slashTrails.forEach(st => {
        const stX = st.x - camera.x;
        const stY = st.y - camera.y;
        if (stX < -60 || stX > this.canvas.width + 60) return;

        ctx.save();
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(stX - 35, stY - 22);
        ctx.lineTo(stX + 35, stY + 22);
        ctx.moveTo(stX - 25, stY - 32);
        ctx.lineTo(stX + 45, stY + 12);
        ctx.moveTo(stX - 45, stY - 12);
        ctx.lineTo(stX + 25, stY + 32);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(stX - 20, stY - 12);
        ctx.lineTo(stX + 20, stY + 12);
        ctx.stroke();
        ctx.restore();
      });
    }

    // 6. Exploding into Bright Ashes Blast Aura & Pixel Ash Shards
    if (isExplodingAshes) {
      const t = boss.defeatTimer || 0;
      const burstAlpha = Math.max(0, 1 - t / 1.4);
      if (burstAlpha > 0) {
        ctx.save();
        const blastR = 60 + t * 290;
        const ashGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, blastR);
        ashGrad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, burstAlpha * 1.25)})`);
        ashGrad.addColorStop(0.35, `rgba(254, 240, 138, ${burstAlpha * 0.85})`);
        ashGrad.addColorStop(0.65, `rgba(203, 213, 225, ${burstAlpha * 0.55})`);
        ashGrad.addColorStop(1, 'rgba(148, 163, 184, 0)');
        ctx.fillStyle = ashGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, blastR, 0, Math.PI * 2);
        ctx.fill();

        // Crisp 8-bit expanding shockwave rings
        ctx.strokeStyle = `rgba(255, 255, 255, ${burstAlpha})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, 24 + t * 240, 0, Math.PI * 2);
        ctx.stroke();

        // Pixelated ash & luminous ember chunks bursting outward
        for (let i = 0; i < 18; i++) {
          const angle = (i / 18) * Math.PI * 2 + t * 0.7;
          const dist = 20 + t * (120 + (i % 4) * 45);
          const ax = cx + Math.cos(angle) * dist;
          const ay = cy + Math.sin(angle) * dist - t * 28;
          const sz = Math.max(2, (6 - t * 2.5));
          ctx.fillStyle = i % 3 === 0 ? '#ffffff' : (i % 3 === 1 ? '#cbd5e1' : '#334155');
          ctx.globalAlpha = burstAlpha;
          ctx.fillRect(ax - sz / 2, ay - sz / 2, sz, sz);
        }
        ctx.restore();
      }
    }

    ctx.restore();
  }

  public renderBossAshExplosionFlash(boss: CockatriceBoss) {
    if (boss.state !== 'defeated' || boss.defeatSubState !== 'exploding_ashes') return;
    const flash = boss.ashExplodeFlash ?? 0;
    if (flash <= 0.01) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.save();
    // Bright radiant white-gold full-screen explosion glow before world turns back to normal
    const glowGrad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, Math.max(w, h) * 0.85);
    glowGrad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, flash * 0.98)})`);
    glowGrad.addColorStop(0.6, `rgba(254, 249, 195, ${Math.min(1, flash * 0.92)})`);
    glowGrad.addColorStop(1, `rgba(255, 255, 255, ${Math.min(1, flash * 0.82)})`);
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  public renderBossFireProjectiles(projectiles: BossFireProjectile[], camera: Camera, time: number) {
    const ctx = this.ctx;
    projectiles.forEach(proj => {
      const sx = proj.x - camera.x;
      const sy = proj.y - camera.y;

      if (sx < -40 || sx > this.canvas.width + 40) return;

      ctx.save();
      ctx.translate(sx, sy);

      const isDeflected = proj.isDeflected;

      // Fast smokey animation fading effect when fireball hits boss or deflects away
      if (proj.isFading) {
        const fadeRatio = Math.max(0, (proj.fadeTimer ?? 0.16) / (proj.maxFadeTime ?? 0.16));
        const progress = 1 - fadeRatio; // 0 to 1
        ctx.globalAlpha = Math.max(0, Math.min(1, fadeRatio * 1.15));

        // Rapid billowing smoke clouds expanding and rising
        const baseRadius = proj.radius * (1.1 + progress * 1.4);
        const smokeOffsetY = -progress * 18; // Smoke rises

        // Core residual spark fading out rapidly
        if (fadeRatio > 0.4) {
          const coreGrad = ctx.createRadialGradient(0, smokeOffsetY * 0.3, 0, 0, smokeOffsetY * 0.3, baseRadius * 0.6);
          if (isDeflected) {
            coreGrad.addColorStop(0, 'rgba(224, 242, 254, 0.9)');
            coreGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.4)');
            coreGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
          } else {
            coreGrad.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
            coreGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.4)');
            coreGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
          }
          ctx.fillStyle = coreGrad;
          ctx.beginPath();
          ctx.arc(0, smokeOffsetY * 0.3, baseRadius * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }

        // Billowing pixel-arcade smoke puffs: layered cluster of expanding smoke circles
        const smokePuffs = [
          { dx: -baseRadius * 0.45, dy: smokeOffsetY - baseRadius * 0.25, r: baseRadius * 0.72, col: '#334155' },
          { dx: baseRadius * 0.45, dy: smokeOffsetY - baseRadius * 0.22, r: baseRadius * 0.70, col: '#475569' },
          { dx: 0, dy: smokeOffsetY - baseRadius * 0.5, r: baseRadius * 0.85, col: '#64748b' },
          { dx: -baseRadius * 0.22, dy: smokeOffsetY + baseRadius * 0.1, r: baseRadius * 0.65, col: '#475569' },
          { dx: baseRadius * 0.28, dy: smokeOffsetY + baseRadius * 0.12, r: baseRadius * 0.62, col: '#334155' },
          { dx: 0, dy: smokeOffsetY, r: baseRadius * 0.92, col: '#94a3b8' }
        ];

        smokePuffs.forEach(puff => {
          ctx.fillStyle = puff.col;
          ctx.beginPath();
          ctx.arc(puff.dx, puff.dy, Math.max(2, puff.r), 0, Math.PI * 2);
          ctx.fill();
        });

        // Delicate outer ash smoke rim
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, smokeOffsetY - baseRadius * 0.25, baseRadius * 0.9, 0, Math.PI * 2);
        ctx.stroke();

        // Pixelated dissolving ash & ember flecks
        for (let i = 0; i < 7; i++) {
          const a = (i * Math.PI * 2) / 7 + progress * 3;
          const dist = baseRadius * (0.8 + progress * 0.6);
          const px = Math.cos(a) * dist;
          const py = Math.sin(a) * dist + smokeOffsetY;
          ctx.fillStyle = i % 2 === 0 ? (isDeflected ? '#7dd3fc' : '#fed7aa') : '#94a3b8';
          const sz = Math.max(1, 4 * fadeRatio);
          ctx.fillRect(px - sz / 2, py - sz / 2, sz, sz);
        }

        ctx.restore();
        return;
      }

      const pulse = Math.sin(time * 18) * 3;
      const r = proj.radius + pulse;

      const haloGrad = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r + 12);
      if (isDeflected) {
        haloGrad.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
        haloGrad.addColorStop(0.6, 'rgba(2, 132, 199, 0.45)');
        haloGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      } else {
        haloGrad.addColorStop(0, 'rgba(249, 115, 22, 0.9)');
        haloGrad.addColorStop(0.6, 'rgba(220, 38, 38, 0.5)');
        haloGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
      }
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r + 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isDeflected ? '#38bdf8' : '#ea580c';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isDeflected ? '#ffffff' : '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  // --- Colossal Inferno Flame Stream (Continuous 5-Second Dragon Breath) ---

  public renderInfernoFlame(boss: CockatriceBoss, player: PlayerState, camera: Camera, time: number) {
    if (boss.state !== 'inferno_flame') return;
    const ctx = this.ctx;
    const w = this.canvas.width;

    const mouthX = boss.facing === 'right' ? boss.x + boss.width - 25 : boss.x + 25;
    const mouthY = boss.y + 60;
    const smx = mouthX - camera.x;
    const smy = mouthY - camera.y;

    // Target player's shield / chest center
    const spx = player.x + player.width / 2 - camera.x;
    const spy = player.y + player.height / 2 - camera.y;

    // Compute angle and distance pointing directly from Cockatrice's beak to player / shield
    const dx = spx - smx;
    const dy = spy - smy;
    const distToPlayer = Math.hypot(dx, dy);
    const flameAngle = Math.atan2(dy, dx);

    const isBlocking = player.isBlocking;
    // When blocking with the shield, the flame collides and terminates right at the shield!
    // When not blocking, the flame punches through and engulfs the player!
    const impactDist = Math.max(40, distToPlayer - 10);
    const flameReach = isBlocking ? impactDist : Math.max(1300, distToPlayer + 450);

    ctx.save();

    // 1. Mouth ignition flash & flare at Cockatrice's beak
    const flareGrad = ctx.createRadialGradient(smx, smy, 4, smx, smy, 52);
    flareGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
    flareGrad.addColorStop(0.25, 'rgba(254, 240, 138, 0.9)');
    flareGrad.addColorStop(0.65, 'rgba(249, 115, 22, 0.65)');
    flareGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = flareGrad;
    ctx.beginPath();
    ctx.arc(smx, smy, 52, 0, Math.PI * 2);
    ctx.fill();

    // 2. Continuous Directional Inferno Beam pointed directly at player / shield
    ctx.save();
    ctx.translate(smx, smy);
    ctx.rotate(flameAngle);

    const segments = 20;
    const stepDist = flameReach / segments;

    // A. Outer Roaring Crimson & Orange Heat Cone
    ctx.fillStyle = 'rgba(239, 68, 68, 0.42)';
    ctx.beginPath();
    ctx.moveTo(0, -14);
    for (let i = 1; i <= segments; i++) {
      const dist = i * stepDist;
      const wave = Math.sin(time * 26 + i * 0.7) * (12 + i * 2.2);
      const halfW = 18 + (dist / flameReach) * (isBlocking ? 55 : 95);
      ctx.lineTo(dist, wave - halfW);
    }
    // End cap at flame reach
    if (isBlocking) {
      // Violent deflection spread along shield face
      ctx.lineTo(impactDist + 6, -72);
      ctx.lineTo(impactDist + 12, 0);
      ctx.lineTo(impactDist + 6, 72);
    } else {
      ctx.lineTo(flameReach, 0);
    }
    for (let i = segments; i >= 1; i--) {
      const dist = i * stepDist;
      const wave = Math.sin(time * 26 + i * 0.7) * (12 + i * 2.2);
      const halfW = 18 + (dist / flameReach) * (isBlocking ? 55 : 95);
      ctx.lineTo(dist, wave + halfW);
    }
    ctx.closePath();
    ctx.fill();

    // B. Mid Blazing Dragon Fire Core
    ctx.fillStyle = 'rgba(249, 115, 22, 0.82)';
    ctx.beginPath();
    ctx.moveTo(0, -9);
    for (let i = 1; i <= segments; i++) {
      const dist = i * stepDist;
      const wave = Math.sin(time * 28 + i * 0.8 + 1) * (9 + i * 1.6);
      const halfW = 12 + (dist / flameReach) * (isBlocking ? 36 : 60);
      ctx.lineTo(dist, wave - halfW);
    }
    if (isBlocking) {
      ctx.lineTo(impactDist + 3, -50);
      ctx.lineTo(impactDist + 8, 0);
      ctx.lineTo(impactDist + 3, 50);
    } else {
      ctx.lineTo(flameReach, 0);
    }
    for (let i = segments; i >= 1; i--) {
      const dist = i * stepDist;
      const wave = Math.sin(time * 28 + i * 0.8 + 1) * (9 + i * 1.6);
      const halfW = 12 + (dist / flameReach) * (isBlocking ? 36 : 60);
      ctx.lineTo(dist, wave + halfW);
    }
    ctx.closePath();
    ctx.fill();

    // C. Inner Solar Gold Thermal Stream
    ctx.fillStyle = 'rgba(254, 240, 138, 0.9)';
    ctx.beginPath();
    ctx.moveTo(0, -5);
    for (let i = 1; i <= segments; i++) {
      const dist = i * stepDist;
      const wave = Math.sin(time * 32 + i * 0.9 + 2) * (5 + i * 1.2);
      const halfW = 7 + (dist / flameReach) * (isBlocking ? 20 : 34);
      ctx.lineTo(dist, wave - halfW);
    }
    if (isBlocking) {
      ctx.lineTo(impactDist, -28);
      ctx.lineTo(impactDist + 4, 0);
      ctx.lineTo(impactDist, 28);
    } else {
      ctx.lineTo(flameReach, 0);
    }
    for (let i = segments; i >= 1; i--) {
      const dist = i * stepDist;
      const wave = Math.sin(time * 32 + i * 0.9 + 2) * (5 + i * 1.2);
      const halfW = 7 + (dist / flameReach) * (isBlocking ? 20 : 34);
      ctx.lineTo(dist, wave + halfW);
    }
    ctx.closePath();
    ctx.fill();

    // D. White-Hot Searing Laser Core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -3);
    for (let i = 1; i <= segments; i++) {
      const dist = i * stepDist;
      const wave = Math.sin(time * 38 + i * 1.1) * 4;
      const halfW = 3.5 + (dist / flameReach) * (isBlocking ? 8 : 14);
      ctx.lineTo(dist, wave - halfW);
    }
    if (isBlocking) {
      ctx.lineTo(impactDist - 2, -14);
      ctx.lineTo(impactDist + 2, 0);
      ctx.lineTo(impactDist - 2, 14);
    } else {
      ctx.lineTo(flameReach, 0);
    }
    for (let i = segments; i >= 1; i--) {
      const dist = i * stepDist;
      const wave = Math.sin(time * 38 + i * 1.1) * 4;
      const halfW = 3.5 + (dist / flameReach) * (isBlocking ? 8 : 14);
      ctx.lineTo(dist, wave + halfW);
    }
    ctx.closePath();
    ctx.fill();

    // E. Sizzling high-frequency flame tongues & ember streaks along the directed beam
    for (let e = 0; e < 8; e++) {
      const eDist = ((time * 700 + e * 160) % flameReach);
      const eSpread = Math.sin(time * 20 + e * 2.3) * (8 + (eDist / flameReach) * 25);
      ctx.fillStyle = e % 2 === 0 ? '#ffffff' : '#facc15';
      ctx.fillRect(eDist, eSpread, 6 + (e % 3) * 3, 2.5);
    }

    // 3. Shield Deflection Climax: Flame crashes right into the player's shield!
    if (isBlocking) {
      // A. Shield Energy Dome Aura (centered at the player)
      const barrierGrad = ctx.createRadialGradient(impactDist + 10, 0, 8, impactDist + 10, 0, 52);
      barrierGrad.addColorStop(0, 'rgba(56, 189, 248, 0.95)');
      barrierGrad.addColorStop(0.4, 'rgba(14, 165, 233, 0.65)');
      barrierGrad.addColorStop(0.75, 'rgba(250, 204, 21, 0.7)');
      barrierGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = barrierGrad;
      ctx.beginPath();
      ctx.arc(impactDist + 10, 0, 52, 0, Math.PI * 2);
      ctx.fill();

      // B. Curved Deflection Barrier Shockwave (facing back against the flame!)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(impactDist + 14, 0, 42, Math.PI * 0.62, Math.PI * 1.38);
      ctx.stroke();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(impactDist + 14, 0, 47, Math.PI * 0.58, Math.PI * 1.42);
      ctx.stroke();

      // C. Deflected Flame Plumes spraying dramatically along the shield perimeter
      for (let df = 0; df < 8; df++) {
        const side = df % 2 === 0 ? 1 : -1;
        const sprayY = side * (24 + (df * 7) + Math.sin(time * 30 + df) * 8);
        const sprayX = impactDist - Math.abs(Math.sin(time * 24 + df)) * 35;
        ctx.fillStyle = df % 3 === 0 ? '#38bdf8' : (df % 2 === 0 ? '#fef08a' : '#f97316');
        ctx.beginPath();
        ctx.ellipse(sprayX, sprayY, 14, 6, side * -0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // D. Deflection Sparks & Embers exploding backward from shield
      for (let sp = 0; sp < 10; sp++) {
        const sparkProg = ((time * 3.5 + sp * 0.1) % 1);
        const sparkX = impactDist - sparkProg * 90;
        const sparkY = (Math.sin(sp * 4.7 + time * 12)) * (35 + sparkProg * 45);
        ctx.fillStyle = sp % 2 === 0 ? '#ffffff' : '#38bdf8';
        ctx.fillRect(sparkX, sparkY, 3.5, 3.5);
      }
    } else {
      // Not blocking: Fiery explosion engulfing the player!
      const burstGrad = ctx.createRadialGradient(distToPlayer, 0, 6, distToPlayer, 0, 48);
      burstGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      burstGrad.addColorStop(0.35, 'rgba(249, 115, 22, 0.85)');
      burstGrad.addColorStop(0.7, 'rgba(239, 68, 68, 0.6)');
      burstGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = burstGrad;
      ctx.beginPath();
      ctx.arc(distToPlayer, 0, 48, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore(); // Restore rotated beam transform

    // 4. Arcade Countdown Hold Banner on Top of Screen
    const bannerW = 440;
    const bannerH = 34;
    const bx = (w - bannerW) / 2;
    const by = 82;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(bx, by, bannerW, bannerH);
    ctx.strokeStyle = player.isBlocking ? '#38bdf8' : '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(bx, by, bannerW, bannerH);

    // Progress bar inside banner
    const remainingTime = Math.max(0, boss.infernoFlameTimer ?? 5);
    const progress = remainingTime / 5.0; // 1 down to 0
    ctx.fillStyle = player.isBlocking ? '#0284c7' : '#991b1b';
    ctx.fillRect(bx + 4, by + bannerH - 6, (bannerW - 8) * progress, 3);

    ctx.textAlign = 'center';
    ctx.font = '700 11px "Silkscreen", monospace';
    ctx.fillStyle = player.isBlocking ? '#38bdf8' : '#fef08a';
    ctx.shadowColor = player.isBlocking ? '#0284c7' : '#dc2626';
    ctx.shadowBlur = 8;
    const statusText = player.isBlocking
      ? `🛡️ DEFLECTING INFERNO FLAME! HOLD S / DOWN: ${remainingTime.toFixed(1)}s`
      : `⚠ INFERNO FLAME! HOLD S OR DOWN ARROW TO BLOCK: ${remainingTime.toFixed(1)}s ⚠`;
    ctx.fillText(statusText, w / 2, by + 18);

    ctx.restore();
  }

  // --- Boss Speech Bubble Dialogue: Immersive Retro Arcade Fantasy Dialogue Box ---

  // --- Cinematic Boss Fight Intro: Epic Title Card Banner & Letterbox Bars ---

  public renderBossIntro(boss: CockatriceBoss, time: number) {
    if (boss.state !== 'intro_dialogue') return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();

    // 1. Cinematic letterbox bars top & bottom
    const barH = Math.min(48, Math.max(32, h * 0.08));
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, w, barH);
    ctx.fillRect(0, h - barH, w, barH);

    // Glowing molten gold trim on letterbox bars
    const pulse = 0.6 + Math.sin(time * 6) * 0.4;
    ctx.fillStyle = `rgba(250, 204, 21, ${pulse * 0.85})`;
    ctx.fillRect(0, barH - 2, w, 2);
    ctx.fillRect(0, h - barH, w, 2);

    // 2. Cinematic Epic Boss Intro Title Card Banner (Center Top)
    const cardW = Math.min(540, w - 24);
    const cardH = 54;
    const cardX = (w - cardW) / 2;
    const cardY = barH + 6;

    // Ambient fiery backdrop glow
    const glowGrad = ctx.createRadialGradient(w / 2, cardY + cardH / 2, 20, w / 2, cardY + cardH / 2, cardW * 0.65);
    glowGrad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
    glowGrad.addColorStop(0.5, 'rgba(234, 88, 12, 0.2)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(cardX - 40, cardY - 20, cardW + 80, cardH + 40);

    // Dark obsidian chassis with crimson fade
    const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
    cardGrad.addColorStop(0, '#1c0505');
    cardGrad.addColorStop(0.5, '#090d16');
    cardGrad.addColorStop(1, '#2a0808');
    ctx.fillStyle = cardGrad;
    ctx.fillRect(cardX, cardY, cardW, cardH);

    // Heavy black outline + gold border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(cardX, cardY, cardW, cardH);

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.strokeRect(cardX + 2, cardY + 2, cardW - 4, cardH - 4);

    // Corner pixel studs
    const studs = [
      [cardX + 3, cardY + 3],
      [cardX + cardW - 9, cardY + 3],
      [cardX + 3, cardY + cardH - 9],
      [cardX + cardW - 9, cardY + cardH - 9],
    ];
    studs.forEach(([sx, sy]) => {
      ctx.fillStyle = '#fde047';
      ctx.fillRect(sx, sy, 6, 6);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(sx + 3, sy + 3, 3, 3);
    });

    // Boss Name: ★ THE ANCIENT COCKATRICE ★
    ctx.textAlign = 'center';
    ctx.font = '800 14px "Silkscreen", monospace';
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.fillText("⚡ ★ THE ANCIENT COCKATRICE ★ ⚡", w / 2, cardY + 23);

    // Subtitle: APEX SKY PREDATOR • FINAL BOSS
    ctx.font = '700 9px "Silkscreen", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 6;
    ctx.fillText("👑 APEX SKY PREDATOR • LEVEL 30 FINAL SUMMIT 👑", w / 2, cardY + 42);

    ctx.restore();
  }

  // --- Boss Speech Bubble Dialogue: Upgraded Deluxe Retro Arcade Fantasy Dialogue Box ---

  public renderBossDialogue(boss: CockatriceBoss, camera: Camera) {
    const isIntro = boss.state === 'intro_dialogue';
    const isDefeatTalk = boss.state === 'defeated' && boss.defeatSubState === 'ground_talk_1';
    if (!isIntro && !isDefeatTalk) return;

    const ctx = this.ctx;
    const w = this.canvas.width;

    let fullText = '';
    if (isIntro) {
      const introDialogues = [
        "who dares enter my realm?",
        "well.. i guess i need to spice things up!"
      ];
      fullText = introDialogues[boss.dialogueIndex] || '';
    } else {
      fullText = "no No NOOOOOOO!";
    }
    const displayText = fullText.slice(0, boss.dialogueCharIndex);

    // Measure wrapped lines first so 2-line and 3-line dialogues both fit cleanly without clipping the advance button!
    const bubbleW = Math.min(470, w - 24);
    const bubbleX = (w - bubbleW) / 2;
    const bubbleY = isIntro ? 114 : 72;

    ctx.save();

    ctx.font = isDefeatTalk ? '700 10.5px "Press Start 2P", monospace' : '700 9.5px "Silkscreen", monospace';
    const isTyping = boss.dialogueCharIndex < fullText.length;
    const cursor = (isTyping && Math.floor(Date.now() / 250) % 2 === 0) ? "▮" : "";
    const bossLines = this.wrapDialogueText(ctx, `"${displayText}${cursor}"`, bubbleW - 84, 3);
    const bubbleH = bossLines.length >= 3 ? 90 : 78;

    // 1. Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
    ctx.fillRect(bubbleX + 4, bubbleY + 4, bubbleW, bubbleH);

    // 2. High-grade obsidian & molten crimson frame
    const boxGrad = ctx.createLinearGradient(bubbleX, bubbleY, bubbleX, bubbleY + bubbleH);
    boxGrad.addColorStop(0, '#090d16');
    boxGrad.addColorStop(0.5, '#0f172a');
    boxGrad.addColorStop(1, '#2a0808');
    ctx.fillStyle = boxGrad;
    ctx.fillRect(bubbleX, bubbleY, bubbleW, bubbleH);

    // 3. Pixelated stepped border with golden filigree
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeRect(bubbleX, bubbleY, bubbleW, bubbleH);

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.strokeRect(bubbleX + 2, bubbleY + 2, bubbleW - 4, bubbleH - 4);

    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 1;
    ctx.strokeRect(bubbleX + 4, bubbleY + 4, bubbleW - 8, bubbleH - 8);

    // 4 Corner 8-Bit Gold Rivet Studs
    const cornerStuds = [
      [bubbleX + 3, bubbleY + 3],
      [bubbleX + bubbleW - 9, bubbleY + 3],
      [bubbleX + 3, bubbleY + bubbleH - 9],
      [bubbleX + bubbleW - 9, bubbleY + bubbleH - 9]
    ];
    cornerStuds.forEach(([cx, cy]) => {
      ctx.fillStyle = '#facc15';
      ctx.fillRect(cx, cy, 6, 6);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(cx + 1, cy + 1, 2, 2);
      ctx.fillStyle = '#3b1302';
      ctx.fillRect(cx + 3, cy + 3, 2, 2);
    });

    // 4. Downward speech tail pointing toward Cockatrice
    const bossScreenX = boss.x + boss.width / 2 - camera.x;
    const tailBaseX = Math.max(bubbleX + 60, Math.min(bubbleX + bubbleW - 60, bossScreenX));
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(tailBaseX - 10, bubbleY + bubbleH - 2);
    ctx.lineTo(tailBaseX + 6, bubbleY + bubbleH - 2);
    ctx.lineTo(tailBaseX - 3, bubbleY + bubbleH + 13);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tailBaseX - 10, bubbleY + bubbleH - 2);
    ctx.lineTo(tailBaseX - 3, bubbleY + bubbleH + 13);
    ctx.lineTo(tailBaseX + 6, bubbleY + bubbleH - 2);
    ctx.stroke();

    // 5. Deluxe Framed Boss Avatar Portrait Box on the Left
    const portraitX = bubbleX + 11;
    const portraitY = bubbleY + Math.round((bubbleH - 50) / 2);
    const portraitSize = 50;

    ctx.fillStyle = '#000000';
    ctx.fillRect(portraitX - 2, portraitY - 2, portraitSize + 4, portraitSize + 4);
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(portraitX, portraitY, portraitSize, portraitSize);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(portraitX, portraitY, portraitSize, portraitSize);

    // Inner portrait background
    const portGrad = ctx.createRadialGradient(portraitX + portraitSize/2, portraitY + portraitSize/2, 3, portraitX + portraitSize/2, portraitY + portraitSize/2, portraitSize);
    portGrad.addColorStop(0, '#7f1d1d');
    portGrad.addColorStop(0.7, '#1e1b4b');
    portGrad.addColorStop(1, '#020617');
    ctx.fillStyle = portGrad;
    ctx.fillRect(portraitX + 2, portraitY + 2, portraitSize - 4, portraitSize - 4);

    // Cockatrice head mini-portrait with sharp horned crest (scaled cleanly to fit 50px box)
    const pCenter = portraitX + portraitSize / 2;
    const pMiddle = portraitY + portraitSize / 2 + 1;

    ctx.save();
    ctx.translate(pCenter, pMiddle);
    ctx.scale(0.8, 0.8);
    ctx.translate(-pCenter, -pMiddle);

    // Emerald dragon cheek & neck
    ctx.fillStyle = '#047857';
    ctx.beginPath();
    ctx.arc(pCenter - 4, pMiddle + 6, 17, 0, Math.PI * 2);
    ctx.fill();

    // Horned dragon crest
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(pCenter - 16, pMiddle - 8);
    ctx.lineTo(pCenter - 12, pMiddle - 24);
    ctx.lineTo(pCenter - 5, pMiddle - 14);
    ctx.lineTo(pCenter + 2, pMiddle - 26);
    ctx.lineTo(pCenter + 9, pMiddle - 14);
    ctx.lineTo(pCenter + 16, pMiddle - 22);
    ctx.lineTo(pCenter + 13, pMiddle - 6);
    ctx.closePath();
    ctx.fill();

    // Golden horn spines
    ctx.fillStyle = '#facc15';
    ctx.fillRect(pCenter - 13, pMiddle - 24, 2, 4);
    ctx.fillRect(pCenter + 1, pMiddle - 26, 2, 5);
    ctx.fillRect(pCenter + 15, pMiddle - 22, 2, 4);

    // Beak
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(pCenter + 6, pMiddle + 1);
    ctx.lineTo(pCenter + 25, pMiddle + 10);
    ctx.lineTo(pCenter + 6, pMiddle + 18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#facc15';
    ctx.fillRect(pCenter + 8, pMiddle + 2, 8, 2);

    // Dragon Eye: Wide shocked eye when defeated, glowing ruby slit eye otherwise
    if (isDefeatTalk) {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(pCenter + 2, pMiddle + 3, 7.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pCenter + 2, pMiddle + 3, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(pCenter + 3, pMiddle + 3, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(pCenter + 3, pMiddle + 3, 1.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(pCenter + 2, pMiddle + 3, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(pCenter + 1.5, pMiddle, 1.8, 6.5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(pCenter + 3, pMiddle + 1, 1.5, 1.5);
    }

    ctx.restore();

    // 6. Nameplate Plaque: "The Cockatrice" when still alive, "Defeated Cockatrice" when fallen
    const textStartX = bubbleX + 70;
    const nameplateTitle = isDefeatTalk ? "Defeated Cockatrice" : "The Cockatrice";

    ctx.font = '700 8.5px "Silkscreen", monospace';
    const titleWidth = ctx.measureText(nameplateTitle).width;
    const plaqueW = Math.max(130, titleWidth + 14);
    const plaqueH = 15;
    const plaqueY = bubbleY + 9;

    ctx.fillStyle = '#450a0a';
    ctx.fillRect(textStartX - 2, plaqueY, plaqueW, plaqueH);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1;
    ctx.strokeRect(textStartX - 2, plaqueY, plaqueW, plaqueH);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#facc15';
    ctx.fillText(nameplateTitle, textStartX + 5, plaqueY + 11);

    // 7. Spoken Dialogue Text with High Contrast & Rich Pixel Font (wrapped cleanly inside bubble)
    ctx.fillStyle = isDefeatTalk ? '#ef4444' : '#fef08a';
    ctx.font = isDefeatTalk ? '700 10.5px "Press Start 2P", monospace' : '700 9.5px "Silkscreen", monospace';
    ctx.shadowColor = isDefeatTalk ? '#7f1d1d' : '#000000';
    ctx.shadowBlur = isDefeatTalk ? 6 : 3;
    bossLines.forEach((line, idx) => {
      ctx.fillText(line, textStartX + 2, bubbleY + 36 + idx * 12);
    });
    ctx.shadowBlur = 0;

    // 8. Action Advance Prompt Badge (Pixelated Gold Button at Bottom Right)
    const promptW = 145;
    const promptH = 17;
    const promptX = bubbleX + bubbleW - promptW - 10;
    const promptY = bubbleY + bubbleH - promptH - 8;

    ctx.fillStyle = '#000000';
    ctx.fillRect(promptX, promptY, promptW, promptH);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(promptX + 1, promptY + 1, promptW - 2, promptH - 2);

    ctx.fillStyle = '#0f172a';
    ctx.font = '700 7.5px "Silkscreen", monospace';
    ctx.textAlign = 'center';
    ctx.fillText("SPACE / TAP ▶", promptX + promptW / 2, promptY + 12);

    ctx.restore();
  }

  // --- Boss Countdown: Massive Middle-Of-Screen Arcade Countdown (3.. -> 2.. -> 1.. -> FIGHT !) ---

  public renderBossCountdown(boss: CockatriceBoss, time: number) {
    if (boss.state !== 'countdown' || !boss.countdownText) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const centerX = w / 2;
    const centerY = h / 2 - 20;

    ctx.save();
    const isFight = boss.countdownText.includes('FIGHT');
    const timer = boss.countdownTimer ?? 1;
    const phaseProgress = Math.max(0, Math.min(1, 1 - (timer % 1)));
    const pulseScale = isFight ? (1.0 + Math.sin(time * 25) * 0.12) : (1.35 - phaseProgress * 0.35);

    // 1. Dark ambient vignette & radial shockwave ring
    const vignetteGrad = ctx.createRadialGradient(centerX, centerY, 40, centerX, centerY, Math.min(w * 0.48, 360));
    vignetteGrad.addColorStop(0, isFight ? 'rgba(236, 72, 153, 0.45)' : 'rgba(0, 0, 0, 0.65)');
    vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, w, h);

    // Expanding pixel shockwave ring
    const waveRadius = isFight ? ((time * 220) % 240) : (phaseProgress * 150);
    ctx.strokeStyle = isFight ? '#ec4899' : (boss.countdownText === '1..' ? '#ef4444' : (boss.countdownText === '2..' ? '#f97316' : '#facc15'));
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, waveRadius + 30, 0, Math.PI * 2);
    ctx.stroke();

    // 2. High-Tech Pixelated Backdrop Banner Box
    const bannerW = isFight ? 360 : 220;
    const bannerH = isFight ? 104 : 96;
    const bx = centerX - bannerW / 2;
    const by = centerY - bannerH / 2;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(bx - 4, by - 4, bannerW + 8, bannerH + 8);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeRect(bx - 4, by - 4, bannerW + 8, bannerH + 8);

    const bannerGrad = ctx.createLinearGradient(bx, by, bx, by + bannerH);
    if (isFight) {
      bannerGrad.addColorStop(0, '#831843');
      bannerGrad.addColorStop(0.5, '#4c0519');
      bannerGrad.addColorStop(1, '#090d16');
    } else {
      bannerGrad.addColorStop(0, '#451a03');
      bannerGrad.addColorStop(0.5, '#1e1b4b');
      bannerGrad.addColorStop(1, '#090d16');
    }
    ctx.fillStyle = bannerGrad;
    ctx.fillRect(bx, by, bannerW, bannerH);

    ctx.strokeStyle = isFight ? '#ec4899' : '#facc15';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(bx, by, bannerW, bannerH);

    [
      [bx, by],
      [bx + bannerW - 8, by],
      [bx, by + bannerH - 8],
      [bx + bannerW - 8, by + bannerH - 8]
    ].forEach(([cx, cy]) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx, cy, 8, 8);
      ctx.fillStyle = '#000000';
      ctx.fillRect(cx + 2, cy + 2, 4, 4);
    });

    // 3. Huge Middle Text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = isFight ? '900 48px "Silkscreen", monospace' : '900 58px "Silkscreen", monospace';

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(pulseScale, pulseScale);

    // Heavy drop shadow
    ctx.fillStyle = '#000000';
    ctx.fillText(boss.countdownText, 4, 4);

    // Glowing colorful text
    if (isFight) {
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 28;
      ctx.fillText(boss.countdownText, 0, 0);
    } else {
      ctx.fillStyle = boss.countdownText === '1..' ? '#ef4444' : (boss.countdownText === '2..' ? '#f97316' : '#fde047');
      ctx.shadowColor = boss.countdownText === '1..' ? '#dc2626' : (boss.countdownText === '2..' ? '#ea580c' : '#facc15');
      ctx.shadowBlur = 22;
      ctx.fillText(boss.countdownText, 0, 0);
    }
    ctx.restore();

    ctx.restore();
  }

  // --- Boss Bar: Gilded 200 Hearts EXP Health Bar with Generous Text Spacing ---

  public renderBossBar(boss: CockatriceBoss, time: number) {
    if (boss.state === 'defeated' || boss.state === 'intro_dialogue') return;
    const ctx = this.ctx;
    const w = this.canvas.width;

    // Generous width and vertical spacing to prevent any overlapping text!
    const barW = Math.min(680, w - 36);
    const barH = 26;
    const barX = (w - barW) / 2;
    const barY = 38;

    ctx.save();

    // 1. Radiant Outer Glow (Golden & Crimson Cock a Doodle Aura)
    const auraGrad = ctx.createRadialGradient(w / 2, barY + barH / 2, barW * 0.2, w / 2, barY + barH / 2, barW * 0.6);
    auraGrad.addColorStop(0, 'rgba(250, 204, 21, 0.45)');
    auraGrad.addColorStop(0.6, 'rgba(239, 68, 68, 0.25)');
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraGrad;
    ctx.fillRect(barX - 40, barY - 32, barW + 80, barH + 74);

    // 2. Heavy Obsidian & Yellow Gold Frame
    ctx.fillStyle = '#090d16';
    ctx.fillRect(barX - 10, barY - 6, barW + 20, barH + 12);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(barX - 10, barY - 6, barW + 20, barH + 12);

    // Inner crimson filigree rim
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(barX - 8, barY - 4, barW + 16, barH + 8);

    // Corner Pixel Gold Jewels with Reflections
    const corners = [
      [barX - 9, barY - 5],
      [barX + barW + 3, barY - 5],
      [barX - 9, barY + barH + 1],
      [barX + barW + 3, barY + barH + 1]
    ];
    corners.forEach(([cx, cy]) => {
      ctx.fillStyle = '#facc15';
      ctx.fillRect(cx, cy, 6, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx + 1, cy + 1, 2, 2);
    });

    // 3. Middle Top Title: "The Cockatrice" with Details of Color
    ctx.textAlign = 'center';
    ctx.font = '700 13px "Silkscreen", monospace';

    const titleText = "The Cockatrice";
    const textGrad = ctx.createLinearGradient(w / 2 - 100, 0, w / 2 + 100, 0);
    if (boss.phase === 3) {
      // Max Rage colorful gradient (Ruby, Magenta, Gold, Amber)
      textGrad.addColorStop(0, '#fde047');
      textGrad.addColorStop(0.25, '#f43f5e');
      textGrad.addColorStop(0.5, '#ec4899');
      textGrad.addColorStop(0.75, '#a855f7');
      textGrad.addColorStop(1, '#38bdf8');
    } else if (boss.phase === 2) {
      // Inferno Rage colorful gradient (Gold, Orange, Crimson, Flame)
      textGrad.addColorStop(0, '#facc15');
      textGrad.addColorStop(0.3, '#f97316');
      textGrad.addColorStop(0.7, '#ef4444');
      textGrad.addColorStop(1, '#fbbf24');
    } else {
      // Sky Rage colorful gradient (Cyan, Amber, Emerald, Gold)
      textGrad.addColorStop(0, '#38bdf8');
      textGrad.addColorStop(0.35, '#fde047');
      textGrad.addColorStop(0.7, '#f59e0b');
      textGrad.addColorStop(1, '#4ade80');
    }

    // Outer dark stroke for crisp arcade pop
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 3.5;
    ctx.strokeText(titleText, w / 2, barY - 14);

    // Glowing colorful fill
    ctx.shadowColor = boss.phase === 3 ? '#ec4899' : (boss.phase === 2 ? '#f97316' : '#38bdf8');
    ctx.shadowBlur = 10;
    ctx.fillStyle = textGrad;
    ctx.fillText(titleText, w / 2, barY - 14);
    ctx.shadowBlur = 0;

    // Colorful gem accents flanking his title
    const titleWidth = ctx.measureText(titleText).width;
    const leftGemX = w / 2 - titleWidth / 2 - 14;
    const rightGemX = w / 2 + titleWidth / 2 + 14;
    const gemY = barY - 18;

    [leftGemX, rightGemX].forEach(gx => {
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(gx, gemY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = boss.phase === 3 ? '#ec4899' : (boss.phase === 2 ? '#ef4444' : '#38bdf8');
      ctx.beginPath();
      ctx.arc(gx, gemY, 1.8, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Health Bar Track - Keeping ONLY the Health Cubes
    ctx.fillStyle = '#090d16';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(barX, barY, barW, barH);

    // 5. 10 Distinct Health Cubes (Each Cube = 20 HP of 200 Max HP)
    const totalCubes = 10;
    const cubeGap = 3;
    const totalGapsWidth = (totalCubes - 1) * cubeGap;
    const cubeW = (barW - 8 - totalGapsWidth) / totalCubes;
    const cubeH = barH - 8;
    const cubeStartY = barY + 4;
    const cubeStartX = barX + 4;

    const shownHealth = boss.displayHealth !== undefined ? boss.displayHealth : boss.health;
    for (let c = 0; c < totalCubes; c++) {
      const cx = cubeStartX + c * (cubeW + cubeGap);
      const cubeMinHP = c * 20;
      const cubeMaxHP = (c + 1) * 20;
      const cubeFraction = Math.max(0, Math.min(1, (shownHealth - cubeMinHP) / 20));

      // Socket backdrop for cube
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx, cubeStartY, cubeW, cubeH);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx, cubeStartY, cubeW, cubeH);

      if (cubeFraction > 0) {
        const fillCubeW = cubeW * cubeFraction;
        const cubeGrad = ctx.createLinearGradient(cx, cubeStartY, cx, cubeStartY + cubeH);

        if (boss.phase === 3) {
          cubeGrad.addColorStop(0, '#fde047');
          cubeGrad.addColorStop(0.3, '#f43f5e');
          cubeGrad.addColorStop(0.7, '#9333ea');
          cubeGrad.addColorStop(1, '#4c0519');
        } else if (boss.phase === 2) {
          cubeGrad.addColorStop(0, '#fef08a');
          cubeGrad.addColorStop(0.3, '#ea580c');
          cubeGrad.addColorStop(0.7, '#dc2626');
          cubeGrad.addColorStop(1, '#7f1d1d');
        } else {
          cubeGrad.addColorStop(0, '#fef08a');
          cubeGrad.addColorStop(0.35, '#facc15');
          cubeGrad.addColorStop(0.7, '#ca8a04');
          cubeGrad.addColorStop(1, '#78350f');
        }

        ctx.fillStyle = cubeGrad;
        ctx.fillRect(cx, cubeStartY, fillCubeW, cubeH);

        // 3D Bevel Highlight across top & left edge of health cube
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fillRect(cx, cubeStartY, fillCubeW, 2.5);
        ctx.fillRect(cx, cubeStartY, 2, cubeH);

        // Dark bottom bevel of health cube
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(cx, cubeStartY + cubeH - 2, fillCubeW, 2);

        // Jewel pixel sheen
        if (cubeFraction >= 0.8) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(cx + 3, cubeStartY + 3, 2, 2);
        }
      }
    }

    ctx.restore();
  }

  // --- Player Chicken Sprites: Authentic Rooster vs Hen Real-Life Characteristics & Proper Idle/Move ---

  public renderPlayer(
    player: PlayerState, 
    camera: Camera, 
    time: number,
    equippedArmor?: ArmorType,
    equippedSword?: SwordType,
    extraOptions?: { hasCrown?: boolean; skin?: string }
  ) {
    const sx = player.x - camera.x;
    const sy = player.y - camera.y;
    const cx = sx + player.width / 2;
    const cy = sy + player.height / 2;

    const isGrounded = player.isGrounded;
    const isMoving = isGrounded && Math.abs(player.vx) > 12 && player.animState === 'walk';
    const isJumping = !isGrounded && player.vy < 0;
    const isFalling = !isGrounded && player.vy >= 0;

    const effArmor: ArmorType =
      equippedArmor && equippedArmor !== 'none'
        ? equippedArmor
        : (player.stage === 'baby' ? 'none' : (player.stage === 'juvenile' ? 'iron' : 'gold'));

    const effSword: SwordType =
      equippedSword && equippedSword !== 'none'
        ? equippedSword
        : (player.stage === 'baby' ? 'none' : (player.stage === 'juvenile' ? 'iron' : 'gold'));

    const isBlinking = isGrounded && !isMoving && ((time % 3.6) < 0.14);

    const PLAYER_VISUAL_SCALE = 0.72;
    this.renderCharacterModel(
      this.ctx,
      cx,
      cy,
      player.gender || 'rooster',
      player.stage,
      effArmor,
      effSword,
      {
        facing: player.facing,
        width: player.width / PLAYER_VISUAL_SCALE,
        height: player.height / PLAYER_VISUAL_SCALE,
        scale: PLAYER_VISUAL_SCALE,
        time,
        isAttacking: player.isAttacking,
        isBlocking: player.isBlocking,
        hasCrown: extraOptions?.hasCrown,
        isMoving,
        isJumping,
        isFalling,
        isBlinking,
        walkAnimTimer: player.walkAnimTimer,
        invulnerable: player.invulnerableTimer > 0,
        skin: extraOptions?.skin,
        fireResistActive: Boolean(player.fireResistTimer && player.fireResistTimer > 0),
      }
    );

    // Subtle toxic-emerald venom shimmer around the chicken while poisoned
    if ((player.poisonTimer ?? 0) > 0) {
      const ctx = this.ctx;
      const pulse = 0.25 + Math.sin(time * 9) * 0.14;
      ctx.save();
      const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, Math.max(player.width, player.height) * 0.85);
      grad.addColorStop(0, `rgba(74, 222, 128, ${pulse})`);
      grad.addColorStop(0.65, `rgba(22, 163, 74, ${pulse * 0.55})`);
      grad.addColorStop(1, 'rgba(22, 163, 74, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(player.width, player.height) * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * Universal high-definition character renderer for both in-game and UI preview screens.
   * Renders biologically authentic, artistic Rooster and Hen models across Baby, Juvenile, Teen, and Adult stages.
   */
  public renderCharacterModel(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    gender: ChickenGender,
    stage: GrowthStage,
    armor: ArmorType = 'none',
    sword: SwordType = 'none',
    options?: {
      facing?: 'left' | 'right';
      width?: number;
      height?: number;
      scale?: number;
      time?: number;
      isAttacking?: boolean;
      isBlocking?: boolean;
      hasCrown?: boolean;
      isMoving?: boolean;
      isJumping?: boolean;
      isFalling?: boolean;
      isBlinking?: boolean;
      walkAnimTimer?: number;
      invulnerable?: boolean;
      skin?: string;
      fireResistActive?: boolean;
    }
  ) {
    const opts = options || {};
    const time = opts.time || 0;
    const isRooster = gender !== 'hen';
    const facing = opts.facing || 'right';
    const scale = opts.scale ?? 1;
    const pal = getSkinPalette(opts.skin);

    // Dimensions
    const defaultW = stage === 'baby' ? 24 : (stage === 'juvenile' ? 30 : (stage === 'teen' ? 36 : 42));
    const defaultH = stage === 'baby' ? 24 : (stage === 'juvenile' ? 32 : (stage === 'teen' ? 38 : 44));
    const halfW = (opts.width || defaultW) / 2;
    const halfH = (opts.height || defaultH) / 2;

    const isMoving = !!opts.isMoving;
    const isJumping = !!opts.isJumping;
    const isFalling = !!opts.isFalling;
    const isAttacking = !!opts.isAttacking;
    const isBlinking = opts.isBlinking ?? ((time % 3.6) < 0.14);

    const walkAnimTimer = opts.walkAnimTimer || 0;
    const walkBounce = isMoving
      ? Math.sin(walkAnimTimer * 16) * 2.5
      : Math.sin(time * 3.5) * 0.75;

    const footCycle = isMoving ? Math.sin(walkAnimTimer * 16) * 3.8 : 0;
    const jumpStretch = isJumping ? -3 : (isFalling ? 2.5 : 0);

    ctx.save();
    ctx.translate(cx, cy);
    if (scale !== 1) ctx.scale(scale, scale);
    if (facing === 'left') ctx.scale(-1, 1);

    if (opts.invulnerable && Math.sin(time * 30) > 0) {
      ctx.globalAlpha = 0.45;
    }

    // ─── SECRET THANKSGIVING ROAST / CRISPY FRIED CHICKEN SKIN ───
    if (opts.skin === 'thanksgiving_roast') {
      this.renderThanksgivingRoastModel(ctx, gender, stage, halfW, halfH, armor, sword, {
        time,
        walkBounce,
        footCycle,
        jumpStretch,
        isJumping,
        isFalling,
        isMoving,
        isAttacking,
        isBlocking: !!opts.isBlocking,
        hasCrown: !!opts.hasCrown,
        fireResistActive: !!opts.fireResistActive,
      });
      ctx.restore();
      return;
    }

    // =========================================================================
    // 1. BABY CHICK STAGE
    // =========================================================================
    if (stage === 'baby' || stage === 'egg') {
      if (isRooster) {
        // --- BABY ROOSTER CHICK ---
        // Lively, athletic, sunburst yellow with spunky fiery orange crest tuft & alert eyes

        // Soft ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
        ctx.beginPath();
        ctx.ellipse(0, halfH - 1, 9, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Aura for special skins
        if (pal.auraColor) {
          ctx.save();
          const auraGrad = ctx.createRadialGradient(0, walkBounce, halfW * 0.4, 0, walkBounce, halfW + 6);
          auraGrad.addColorStop(0, pal.auraColor);
          auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(0, walkBounce, halfW + 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // 1. Downy Body (Warm sunshine or skin gradient)
        const chickGrad = ctx.createRadialGradient(-2, walkBounce - 2, 2, 0, walkBounce, halfW);
        chickGrad.addColorStop(0, pal.babyRoosterBody[0]);
        chickGrad.addColorStop(0.65, pal.babyRoosterBody[1]);
        chickGrad.addColorStop(1, pal.babyRoosterBody[2]);
        ctx.fillStyle = chickGrad;
        ctx.beginPath();
        ctx.ellipse(0, walkBounce, halfW - 1.5, halfH - 1.5 + jumpStretch, 0, 0, Math.PI * 2);
        ctx.fill();

        // Down feather belly highlight
        ctx.fillStyle = pal.babyBelly;
        ctx.beginPath();
        ctx.ellipse(2, 2 + walkBounce, halfW * 0.5, halfH * 0.4, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Fluffy rump tuft at back
        ctx.fillStyle = pal.babyRump;
        ctx.beginPath();
        ctx.arc(-halfW + 1, 1 + walkBounce, 3, 0, Math.PI * 2);
        ctx.fill();

        // 2. Feather crest on crown
        ctx.fillStyle = pal.babyCrest[0];
        ctx.beginPath();
        ctx.moveTo(-4, -halfH - 2 + walkBounce);
        ctx.quadraticCurveTo(-1, -halfH - 8 + walkBounce, 2, -halfH - 3 + walkBounce);
        ctx.quadraticCurveTo(0, -halfH + walkBounce, -4, -halfH - 2 + walkBounce);
        ctx.fill();
        ctx.fillStyle = pal.babyCrest[1];
        ctx.beginPath();
        ctx.moveTo(-1, -halfH - 2 + walkBounce);
        ctx.lineTo(4, -halfH - 6 + walkBounce);
        ctx.lineTo(2, -halfH + walkBounce);
        ctx.closePath();
        ctx.fill();

        // 3. Cute Chick Wing (with multi-quill flutter)
        let wingAngle = 0.18;
        if (isJumping) wingAngle = -0.7;
        else if (isFalling) wingAngle = 0.5 + Math.sin(time * 18) * 0.2;
        else if (isMoving) wingAngle = 0.18 + Math.sin(walkAnimTimer * 16) * 0.35;

        ctx.save();
        ctx.translate(-3, 2 + walkBounce);
        ctx.rotate(wingAngle);
        ctx.fillStyle = pal.babyWing[0];
        ctx.beginPath();
        ctx.ellipse(0, 0, 6, 4.5, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pal.babyWing[1];
        ctx.beginPath();
        ctx.ellipse(1, -0.5, 4.5, 3, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 4. Alert eye with iris shine & catchlight
        if (isBlinking) {
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(4, -2 + walkBounce, 3, 0.1, Math.PI - 0.1);
          ctx.stroke();
        } else {
          // Eye white/contour
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(4.5, -2 + walkBounce, 4, 0, Math.PI * 2);
          ctx.fill();
          // Iris amber ring
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.arc(4.8, -2 + walkBounce, 2.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#020617';
          ctx.beginPath();
          ctx.arc(4.8, -2 + walkBounce, 2, 0, Math.PI * 2);
          ctx.fill();
          // Crisp white primary catchlight + mini gleam
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(5, -4 + walkBounce, 1.8, 1.8);
          ctx.fillRect(6, -2.2 + walkBounce, 1, 1);
        }

        // 5. Curved golden-orange chick beak with nostril mark
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.moveTo(8.5, -2 + walkBounce);
        ctx.quadraticCurveTo(15, 0.5 + walkBounce, 14, 2 + walkBounce);
        ctx.lineTo(8.5, 4 + walkBounce);
        ctx.closePath();
        ctx.fill();
        // Lower mandible shadow
        ctx.fillStyle = '#c2410c';
        ctx.beginPath();
        ctx.moveTo(8.5, 1.5 + walkBounce);
        ctx.lineTo(13.5, 2 + walkBounce);
        ctx.lineTo(8.5, 4 + walkBounce);
        ctx.closePath();
        ctx.fill();
        // Beak shine & nostril
        ctx.fillStyle = '#fde047';
        ctx.fillRect(9.5, -1 + walkBounce, 2.5, 1);
        ctx.fillStyle = '#7c2d12';
        ctx.fillRect(10, -0.5 + walkBounce, 1, 1);

        // 6. Visible Pixel Armor on Baby Rooster
        this.drawPixelArmor(ctx, 'rooster', 'baby', armor, walkBounce, halfW, halfH, opts.skin, time);

        // 7. Jointed orange legs & 3-toed chick feet
        const footY = isJumping ? halfH - 4 : halfH - 1.5;
        ctx.fillStyle = '#ea580c';
        // Back leg
        ctx.fillRect(-4 + footCycle, footY - 2, 2.5, 3.5);
        ctx.fillRect(-5 + footCycle, footY + 1.5, 4.5, 2);
        // Front leg
        ctx.fillRect(2 - footCycle, footY - 2, 2.5, 3.5);
        ctx.fillRect(1 - footCycle, footY + 1.5, 5, 2);

        // 8. Sword if equipped
        if (sword !== 'none') {
          this.drawSword(ctx, walkBounce, isAttacking, sword, false);
        }

      } else {
        // --- BABY HEN CHICK ---
        // Soft pastel honey-buff down, rounder cuddly silhouette, blushing peach cheeks, sweet double catchlight eyes

        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
        ctx.beginPath();
        ctx.ellipse(0, halfH - 1, 9.5, 3.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 1. Plump Sweet Body (Skin gradient)
        const henGrad = ctx.createRadialGradient(-1, walkBounce - 1, 2, 0, walkBounce, halfW + 1);
        henGrad.addColorStop(0, pal.babyHenBody[0]);
        henGrad.addColorStop(0.55, pal.babyHenBody[1]);
        henGrad.addColorStop(1, pal.babyHenBody[2]);
        ctx.fillStyle = henGrad;
        ctx.beginPath();
        ctx.ellipse(0, walkBounce, halfW, halfH - 1 + jumpStretch, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rosy cheek blush
        ctx.fillStyle = 'rgba(251, 113, 133, 0.45)';
        ctx.beginPath();
        ctx.ellipse(2.5, 2 + walkBounce, 3.8, 2.5, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Soft downy crown curl (sweet baby hen head tuft)
        ctx.fillStyle = pal.babyCrest[0];
        ctx.beginPath();
        ctx.arc(0, -halfH - 2 + walkBounce, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pal.babyCrest[1];
        ctx.beginPath();
        ctx.arc(-2, -halfH - 3 + walkBounce, 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Soft round downy wing with skin accents
        let wingAngle = 0.14;
        if (isJumping) wingAngle = -0.65;
        else if (isFalling) wingAngle = 0.45 + Math.sin(time * 18) * 0.2;
        else if (isMoving) wingAngle = 0.14 + Math.sin(walkAnimTimer * 16) * 0.3;

        ctx.save();
        ctx.translate(-3, 2.5 + walkBounce);
        ctx.rotate(wingAngle);
        ctx.fillStyle = pal.babyWing[0];
        ctx.beginPath();
        ctx.ellipse(0, 0, 6.5, 5, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pal.babyWing[1];
        ctx.beginPath();
        ctx.ellipse(1, -0.5, 5, 3.5, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 2. Sweet Large Anime-Style Catchlight Eyes
        if (isBlinking) {
          ctx.strokeStyle = '#431407';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(4.5, -2 + walkBounce, 3.2, 0.1, Math.PI - 0.1);
          ctx.stroke();
        } else {
          ctx.fillStyle = '#1e1b4b';
          ctx.beginPath();
          ctx.arc(4.5, -2 + walkBounce, 4.3, 0, Math.PI * 2);
          ctx.fill();
          // Warm hazel iris
          ctx.fillStyle = '#854d0e';
          ctx.beginPath();
          ctx.arc(4.8, -2 + walkBounce, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#020617';
          ctx.beginPath();
          ctx.arc(4.8, -2 + walkBounce, 2.1, 0, Math.PI * 2);
          ctx.fill();
          // Large main catchlight + lower reflection
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(4.5, -4.5 + walkBounce, 2.2, 2.2);
          ctx.fillRect(6.2, -1.8 + walkBounce, 1.3, 1.3);
        }

        // 3. Delicate Honey-Peach Beak
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(8.5, -1.5 + walkBounce);
        ctx.quadraticCurveTo(14.5, 0.8 + walkBounce, 13.5, 2.2 + walkBounce);
        ctx.lineTo(8.5, 3.8 + walkBounce);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#d97706';
        ctx.fillRect(9, 1.5 + walkBounce, 3.5, 1.5);

        // 4. Visible Pixel Armor on Hen Baby Chick
        this.drawPixelArmor(ctx, 'hen', 'baby', armor, walkBounce, halfW, halfH, opts.skin, time);

        // 5. Cute Peach-Orange Feet
        const footY = isJumping ? halfH - 4 : halfH - 1.5;
        ctx.fillStyle = '#f97316';
        ctx.fillRect(-4 + footCycle, footY - 2, 2.5, 3.5);
        ctx.fillRect(-5 + footCycle, footY + 1.5, 4.5, 2);
        ctx.fillRect(2 - footCycle, footY - 2, 2.5, 3.5);
        ctx.fillRect(1 - footCycle, footY + 1.5, 5, 2);

        // 6. Sword if equipped
        if (sword !== 'none') {
          this.drawSword(ctx, walkBounce, isAttacking, sword, false);
        }
      }

    // =========================================================================
    // 2. JUVENILE CHICKEN STAGE (Levels 6 - 14)
    // =========================================================================
    } else if (stage === 'juvenile') {
      if (isRooster) {
        // --- JUVENILE ROOSTER ---
        // Upright athletic stance, fiery copper neck hackles, rising 3-pointed scarlet crown comb,
        // budding swinging red wattle, emerging emerald sickle tail sprout, and sturdy beak!

        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(0, halfH - 1, 11, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 1. Torso & Upright Body
        const rGrad = ctx.createRadialGradient(-2, walkBounce - 2, 3, 0, walkBounce, halfW + 1);
        rGrad.addColorStop(0, pal.roosterBodyGrad[0]);
        rGrad.addColorStop(0.65, pal.roosterBodyGrad[1]);
        rGrad.addColorStop(1, pal.roosterBodyGrad[2]);
        ctx.fillStyle = rGrad;
        ctx.beginPath();
        ctx.ellipse(0, walkBounce, halfW - 0.5, halfH - 1 + jumpStretch, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Hackle Plumes cascading down neck & breast
        ctx.fillStyle = pal.hackles[1];
        ctx.beginPath();
        ctx.moveTo(-3, -halfH + 2 + walkBounce);
        ctx.lineTo(6, -halfH + 2 + walkBounce);
        ctx.lineTo(7, 4 + walkBounce);
        ctx.lineTo(2, 6 + walkBounce);
        ctx.lineTo(-4, 3 + walkBounce);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = pal.hackles[2];
        ctx.fillRect(-1, -halfH + 4 + walkBounce, 5, 6);

        // 3. Emerging Iridescent Sickle Tail Feathers sprouting from rump
        ctx.fillStyle = pal.sickles[0];
        ctx.beginPath();
        ctx.moveTo(-halfW + 1, -2 + walkBounce);
        ctx.quadraticCurveTo(-halfW - 9, -10 + walkBounce, -halfW - 4, -16 + walkBounce);
        ctx.quadraticCurveTo(-halfW - 12, -6 + walkBounce, -halfW + 2, 4 + walkBounce);
        ctx.fill();
        // Covert feather
        ctx.fillStyle = pal.sickles[1];
        ctx.beginPath();
        ctx.moveTo(-halfW + 1, 0 + walkBounce);
        ctx.quadraticCurveTo(-halfW - 6, -4 + walkBounce, -halfW - 2, -10 + walkBounce);
        ctx.quadraticCurveTo(-halfW - 8, 0 + walkBounce, -halfW + 2, 6 + walkBounce);
        ctx.fill();

        // 4. Rising 3-Pointed Crown Comb
        ctx.fillStyle = pal.comb[1];
        // Point 1 (front)
        ctx.beginPath();
        ctx.moveTo(6, -halfH + 1 + walkBounce);
        ctx.lineTo(7, -halfH - 8 + walkBounce);
        ctx.lineTo(3, -halfH - 3 + walkBounce);
        ctx.closePath();
        ctx.fill();
        // Point 2 (center tall)
        ctx.beginPath();
        ctx.moveTo(3, -halfH + walkBounce);
        ctx.lineTo(2, -halfH - 11 + walkBounce);
        ctx.lineTo(-1, -halfH - 3 + walkBounce);
        ctx.closePath();
        ctx.fill();
        // Point 3 (rear)
        ctx.beginPath();
        ctx.moveTo(-1, -halfH + walkBounce);
        ctx.lineTo(-3, -halfH - 7 + walkBounce);
        ctx.lineTo(-4, -halfH + 1 + walkBounce);
        ctx.closePath();
        ctx.fill();
        // Comb base ridge & highlight
        ctx.fillStyle = pal.comb[2];
        ctx.fillRect(-2, -halfH - 4 + walkBounce, 7, 3);

        // 5. Budding swinging chin wattle
        ctx.fillStyle = pal.wattles;
        ctx.beginPath();
        ctx.ellipse(8, 4.5 + walkBounce, 2.5, 4.5, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f87171';
        ctx.fillRect(7.5, 3 + walkBounce, 1.5, 2.5);

        // 6. Determined Juvenile Eye
        if (isBlinking) {
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(5, -3 + walkBounce, 2.8, 0.1, Math.PI - 0.1);
          ctx.stroke();
        } else {
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(5, -3 + walkBounce, 3.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.arc(5.3, -3 + walkBounce, 2.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#020617';
          ctx.beginPath();
          ctx.arc(5.3, -3 + walkBounce, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(5.5, -5 + walkBounce, 1.8, 1.8);
        }

        // 7. Sharp Raptorial Horn Beak
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.moveTo(9, -3 + walkBounce);
        ctx.quadraticCurveTo(18, 0.5 + walkBounce, 17, 1.8 + walkBounce);
        ctx.lineTo(9, 4 + walkBounce);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.fillRect(10, -2 + walkBounce, 4, 1.2);
        ctx.fillStyle = '#7c2d12';
        ctx.fillRect(11, -1 + walkBounce, 1.2, 1); // nares

        // 8. Visible Pixel Armor on Juvenile Rooster
        this.drawPixelArmor(ctx, 'rooster', 'juvenile', armor, walkBounce, halfW, halfH, opts.skin, time);

        // 9. Dynamic Wing with flight quill layering
        let wingAngle = -0.15;
        if (isJumping) wingAngle = -0.7;
        else if (isFalling) wingAngle = 0.55;
        else if (isMoving) wingAngle = -0.15 + Math.sin(walkAnimTimer * 16) * 0.35;

        ctx.save();
        ctx.translate(-4, 2 + walkBounce);
        ctx.rotate(wingAngle);
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 5.5, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.ellipse(1, -1, 6, 3.8, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 10. Scaled muscular legs, toes & budding spur nub
        const footY = isJumping ? halfH - 4 : halfH - 1.5;
        ctx.fillStyle = '#c2410c';
        // Back leg
        ctx.fillRect(-5 + footCycle, footY - 3, 3, 4.5);
        ctx.fillRect(-6 + footCycle, footY + 1.5, 6, 2.5);
        // Tiny ivory spur nub on back of leg
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-8 + footCycle, footY - 1, 2, 2);
        // Front leg
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(3 - footCycle, footY - 3, 3, 4.5);
        ctx.fillRect(2 - footCycle, footY + 1.5, 6.5, 2.5);

        // 11. Sword
        if (sword !== 'none') {
          this.drawSword(ctx, walkBounce, isAttacking, sword, false);
        }

      } else {
        // --- JUVENILE HEN ---
        // Rounder, plumper silhouette, warm cinnamon & buff plumage with delicate dappled feather bars,
        // neat velvety red rose-comb, petite throat wattle, layered fanned tail & sweet determined gaze

        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(0, halfH - 1, 11.5, 3.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // 1. Plump Curving Hen Torso (Skin gradient)
        const henJGrad = ctx.createRadialGradient(-1, walkBounce - 1, 3, 0, walkBounce, halfW + 2);
        henJGrad.addColorStop(0, pal.henBodyGrad[0]);
        henJGrad.addColorStop(0.55, pal.henBodyGrad[1]);
        henJGrad.addColorStop(1, pal.henBodyGrad[2]);
        ctx.fillStyle = henJGrad;
        ctx.beginPath();
        ctx.ellipse(0, walkBounce, halfW + 1, halfH - 0.5 + jumpStretch, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dappled Feather Bars on flank
        ctx.fillStyle = pal.bars[0];
        ctx.fillRect(-5, -2 + walkBounce, 3, 2);
        ctx.fillRect(-2, 3 + walkBounce, 3, 2);
        ctx.fillRect(3, 1 + walkBounce, 3, 2);
        ctx.fillStyle = pal.bars[1];
        ctx.fillRect(-3, 0 + walkBounce, 2, 1.5);
        ctx.fillRect(1, 4 + walkBounce, 2, 1.5);

        // 2. Neat Layered Fan Tail held upright
        ctx.fillStyle = pal.tailHen[0];
        ctx.beginPath();
        ctx.ellipse(-halfW - 3, -1 + walkBounce, 5.5, 8.5, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pal.tailHen[1];
        ctx.beginPath();
        ctx.ellipse(-halfW - 1, 1 + walkBounce, 4, 7, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pal.bars[1];
        ctx.fillRect(-halfW - 5, -5 + walkBounce, 2.5, 2.5); // feather tip

        // 3. Delicate Velvety Rose Comb
        ctx.fillStyle = pal.comb[1];
        ctx.beginPath();
        ctx.arc(1.5, -halfH - 4 + walkBounce, 3.2, 0, Math.PI * 2);
        ctx.arc(4.5, -halfH - 5 + walkBounce, 3.5, 0, Math.PI * 2);
        ctx.arc(7.5, -halfH - 3.5 + walkBounce, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pal.comb[2];
        ctx.fillRect(2, -halfH - 4 + walkBounce, 6, 2);

        // 4. Petite chin wattle
        ctx.fillStyle = pal.wattles;
        ctx.beginPath();
        ctx.arc(8.5, 3.5 + walkBounce, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.arc(8.5, 3.5 + walkBounce, 2.2, 0, Math.PI * 2);
        ctx.fill();

        // 5. Soulful Determined Eye with double catchlight
        if (isBlinking) {
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(5, -3 + walkBounce, 2.8, 0.1, Math.PI - 0.1);
          ctx.stroke();
        } else {
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(5, -3 + walkBounce, 4.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.arc(5.2, -3 + walkBounce, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#020617';
          ctx.beginPath();
          ctx.arc(5.2, -3 + walkBounce, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(5.5, -5.2 + walkBounce, 2, 2);
          ctx.fillRect(6.8, -2.5 + walkBounce, 1.2, 1.2);
        }

        // 6. Amber Beak
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(9, -2.5 + walkBounce);
        ctx.quadraticCurveTo(17, 0.5 + walkBounce, 16, 1.8 + walkBounce);
        ctx.lineTo(9, 3.5 + walkBounce);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#d97706';
        ctx.fillRect(10, 1 + walkBounce, 4, 1.5);

        // 7. Visible Pixel Armor on Juvenile Hen
        this.drawPixelArmor(ctx, 'hen', 'juvenile', armor, walkBounce, halfW, halfH, opts.skin, time);

        // 8. Rounded Wing with warm cinnamon coverts
        let wingAngle = -0.1;
        if (isJumping) wingAngle = -0.65;
        else if (isFalling) wingAngle = 0.5;
        else if (isMoving) wingAngle = -0.1 + Math.sin(walkAnimTimer * 16) * 0.3;

        ctx.save();
        ctx.translate(-4, 2 + walkBounce);
        ctx.rotate(wingAngle);
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.ellipse(0, 0, 8.5, 6, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.ellipse(1, -1, 6.5, 4.2, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 9. Smooth agile legs (no spurs, true to realistic hen biology!)
        const footY = isJumping ? halfH - 4 : halfH - 1.5;
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(-5 + footCycle, footY - 3, 3, 4.5);
        ctx.fillRect(-6 + footCycle, footY + 1.5, 6, 2.5);
        ctx.fillRect(3 - footCycle, footY - 3, 3, 4.5);
        ctx.fillRect(2 - footCycle, footY + 1.5, 6.5, 2.5);

        // 10. Sword
        if (sword !== 'none') {
          this.drawSword(ctx, walkBounce, isAttacking, sword, false);
        }
      }

    // =========================================================================
    // 3. TEEN CHICKEN STAGE (Levels 15 - 19)
    // =========================================================================
    } else if (stage === 'teen') {
      if (isRooster) {
        // --- TEEN ROOSTER ---
        // Heroic upright warrior stance, blazing copper hackle cape, prominent 4-point crimson crown comb,
        // twin swinging fleshy wattles, emerald & cyan curved sickle tail plumes, calcified spurs on legs,
        // full battle cuirass, pauldrons & blade!

        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.beginPath();
        ctx.ellipse(0, halfH - 1, 14, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // 1. Muscular Torso
        const tGrad = ctx.createRadialGradient(-3, walkBounce - 3, 4, 0, walkBounce, halfW + 2);
        tGrad.addColorStop(0, pal.roosterBodyGrad[0]);
        tGrad.addColorStop(0.65, pal.roosterBodyGrad[1]);
        tGrad.addColorStop(1, pal.roosterBodyGrad[2]);
        ctx.fillStyle = tGrad;
        ctx.beginPath();
        ctx.ellipse(0, walkBounce, halfW - 0.5, halfH - 1 + jumpStretch, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Cascading Hackles
        ctx.fillStyle = pal.hackles[0];
        ctx.beginPath();
        ctx.moveTo(-4, -halfH + 3 + walkBounce);
        ctx.lineTo(8, -halfH + 3 + walkBounce);
        ctx.lineTo(9, 6 + walkBounce);
        ctx.lineTo(3, 8 + walkBounce);
        ctx.lineTo(-5, 4 + walkBounce);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = pal.hackles[1];
        ctx.fillRect(-2, -halfH + 4 + walkBounce, 8, 7);

        // 3. Arching Sickle Tail Plumes
        ctx.fillStyle = pal.sickles[0];
        ctx.beginPath();
        ctx.moveTo(-halfW + 2, -2 + walkBounce);
        ctx.quadraticCurveTo(-halfW - 14, -14 + walkBounce, -halfW - 6, -22 + walkBounce);
        ctx.quadraticCurveTo(-halfW - 18, -8 + walkBounce, -halfW + 3, 6 + walkBounce);
        ctx.fill();
        // Highlight plume
        ctx.fillStyle = pal.sickles[1];
        ctx.beginPath();
        ctx.moveTo(-halfW + 2, -4 + walkBounce);
        ctx.quadraticCurveTo(-halfW - 12, -10 + walkBounce, -halfW - 8, -17 + walkBounce);
        ctx.quadraticCurveTo(-halfW - 16, -4 + walkBounce, -halfW + 4, 8 + walkBounce);
        ctx.fill();
        // Covert base feathers
        ctx.fillStyle = pal.sickles[2];
        ctx.fillRect(-halfW - 4, -1 + walkBounce, 6, 8);

        // 4. Prominent 4-Pointed Serrated Crown Comb
        ctx.fillStyle = pal.comb[0];
        ctx.fillRect(-3, -halfH - 8 + walkBounce, 4, 7);
        ctx.fillRect(1, -halfH - 12 + walkBounce, 5, 11);
        ctx.fillRect(6, -halfH - 14 + walkBounce, 5, 13);
        ctx.fillRect(11, -halfH - 9 + walkBounce, 4, 8);
        ctx.fillStyle = pal.comb[2];
        ctx.fillRect(2, -halfH - 8 + walkBounce, 8, 4);

        // 5. Twin swinging wattles
        ctx.fillStyle = pal.wattles;
        ctx.beginPath();
        ctx.ellipse(9, 5 + walkBounce, 3, 6, 0.15, 0, Math.PI * 2);
        ctx.ellipse(11, 6 + walkBounce, 2.5, 5, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f87171';
        ctx.fillRect(8.5, 3 + walkBounce, 2, 4);

        // 6. Heroic Fierce Eye
        if (isBlinking) {
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(6, -4 + walkBounce, 3, 0.1, Math.PI - 0.1);
          ctx.stroke();
        } else {
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(6, -4 + walkBounce, 4.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.arc(6.3, -4 + walkBounce, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#020617';
          ctx.beginPath();
          ctx.arc(6.3, -4 + walkBounce, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(6.5, -6 + walkBounce, 2, 2);
        }

        // 7. Powerful Golden Horn Beak
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.moveTo(10, -3.5 + walkBounce);
        ctx.quadraticCurveTo(21, 0.5 + walkBounce, 20, 2 + walkBounce);
        ctx.lineTo(10, 4.5 + walkBounce);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(11, -2.5 + walkBounce, 5, 1.5);
        ctx.fillStyle = '#7c2d12';
        ctx.fillRect(12, -1 + walkBounce, 1.5, 1);

        // 8. Visible Pixel Armor on Teen Rooster
        this.drawPixelArmor(ctx, 'rooster', 'teen', armor, walkBounce, halfW, halfH, opts.skin, time);

        // 9. Powerful Scaled Legs with Sharp Calcified Fighting Spurs!
        const footY = isJumping ? halfH - 4 : halfH - 1.5;
        ctx.fillStyle = '#c2410c';
        // Back leg
        ctx.fillRect(-6 + footCycle, footY - 4, 4, 6);
        ctx.fillRect(-7 + footCycle, footY + 1.5, 7.5, 3);
        // Sharp calcified fighting spur
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(-6 + footCycle, footY);
        ctx.lineTo(-10 + footCycle, footY - 2);
        ctx.lineTo(-6 + footCycle, footY + 2);
        ctx.closePath();
        ctx.fill();
        // Front leg
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(3 - footCycle, footY - 4, 4, 6);
        ctx.fillRect(2 - footCycle, footY + 1.5, 8, 3);

        // 10. Masterwork Sword
        this.drawSword(ctx, walkBounce, isAttacking, sword === 'none' ? 'gold' : sword);

      } else {
        // --- TEEN HEN ---
        // Graceful, swift heroine posture with beautifully curved lines, warm chestnut & honey-buff plumage,
        // intricate feather barring, velvety rose comb, fanned tiered tail, soulful eyes, tailored armor!

        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.beginPath();
        ctx.ellipse(0, halfH - 1, 14.5, 4.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 1. Plump Curving Torso
        const hTGrad = ctx.createRadialGradient(-2, walkBounce - 2, 4, 0, walkBounce, halfW + 2);
        hTGrad.addColorStop(0, pal.henBodyGrad[0]);
        hTGrad.addColorStop(0.55, pal.henBodyGrad[1]);
        hTGrad.addColorStop(0.85, pal.henBodyGrad[2]);
        hTGrad.addColorStop(1, pal.bars[0]);
        ctx.fillStyle = hTGrad;
        ctx.beginPath();
        ctx.ellipse(0, walkBounce, halfW + 1.5, halfH - 0.5 + jumpStretch, 0, 0, Math.PI * 2);
        ctx.fill();

        // Feather bars across flank
        ctx.fillStyle = pal.bars[0];
        ctx.fillRect(-6, -3 + walkBounce, 4, 2.5);
        ctx.fillRect(-2, 4 + walkBounce, 4, 2.5);
        ctx.fillRect(4, 2 + walkBounce, 4, 2.5);
        ctx.fillStyle = pal.bars[1];
        ctx.fillRect(-4, 0 + walkBounce, 3, 2);
        ctx.fillRect(2, 5 + walkBounce, 3, 2);

        // 2. Elegant Fanned Tiered Tail held high
        ctx.fillStyle = pal.tailHen[0];
        ctx.beginPath();
        ctx.ellipse(-halfW - 4, -2 + walkBounce, 6.5, 10, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pal.tailHen[1];
        ctx.beginPath();
        ctx.ellipse(-halfW - 2, 1 + walkBounce, 5, 8, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pal.bars[1];
        ctx.fillRect(-halfW - 6, -7 + walkBounce, 3, 3);

        // 3. Rose Comb & Chin Wattle
        ctx.fillStyle = pal.comb[1];
        ctx.beginPath();
        ctx.arc(1, -halfH - 4.5 + walkBounce, 3.5, 0, Math.PI * 2);
        ctx.arc(5, -halfH - 6 + walkBounce, 4, 0, Math.PI * 2);
        ctx.arc(9, -halfH - 4 + walkBounce, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pal.comb[2];
        ctx.fillRect(2, -halfH - 4.5 + walkBounce, 8, 2.5);
        // Small chin wattle
        ctx.fillStyle = pal.wattles;
        ctx.beginPath();
        ctx.ellipse(9.5, 4 + walkBounce, 2.5, 4.5, 0.15, 0, Math.PI * 2);
        ctx.fill();

        // 4. Soulful, Courageous Eye
        if (isBlinking) {
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(6, -4 + walkBounce, 3, 0.1, Math.PI - 0.1);
          ctx.stroke();
        } else {
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(6, -4 + walkBounce, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.arc(6.3, -4 + walkBounce, 3.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#020617';
          ctx.beginPath();
          ctx.arc(6.3, -4 + walkBounce, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(6.5, -6.5 + walkBounce, 2.2, 2.2);
          ctx.fillRect(8, -3.5 + walkBounce, 1.4, 1.4);
        }

        // 5. Amber Beak
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(10, -2.5 + walkBounce);
        ctx.quadraticCurveTo(20, 0.5 + walkBounce, 19, 2 + walkBounce);
        ctx.lineTo(10, 4.5 + walkBounce);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#d97706';
        ctx.fillRect(11, 1.5 + walkBounce, 5, 2);

        // 6. Visible Pixel Armor on Teen Hen
        this.drawPixelArmor(ctx, 'hen', 'teen', armor, walkBounce, halfW, halfH, opts.skin, time);

        // 7. Clean, agile legs (no spurs)
        const footY = isJumping ? halfH - 4 : halfH - 1.5;
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(-6 + footCycle, footY - 4, 4, 6);
        ctx.fillRect(-7 + footCycle, footY + 1.5, 7.5, 3);
        ctx.fillRect(3 - footCycle, footY - 4, 4, 6);
        ctx.fillRect(2 - footCycle, footY + 1.5, 8, 3);

        // 8. Sword
        this.drawSword(ctx, walkBounce, isAttacking, sword === 'none' ? 'gold' : sword);
      }

    // =========================================================================
    // 4. ADULT CHICKEN STAGE (Levels 20 - 30)
    // =========================================================================
    } else {
      if (isRooster) {
        // --- ADULT LEGENDARY ROOSTER ---
        // Towering majestic battle posture, sweeping cape of fiery copper-gold hackles,
        // colossal multi-tiered serrated scarlet crown comb swaying in the breeze,
        // deep red swinging fleshy double wattles, breathtaking arching iridescent sickle tail plumes
        // (emerald, peacock cyan & deep sapphire), dinosaurian scaled legs with lethal ivory calcified spurs,
        // and full masterwork hero armor!

        // Dramatic ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.26)';
        ctx.beginPath();
        ctx.ellipse(0, halfH - 1, 17, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 1. Towering Upright Muscular Body
        const aGrad = ctx.createRadialGradient(-4, walkBounce - 4, 5, 0, walkBounce, halfW + 3);
        aGrad.addColorStop(0, pal.roosterBodyGrad[0]);
        aGrad.addColorStop(0.5, pal.roosterBodyGrad[1]);
        aGrad.addColorStop(0.85, pal.roosterBodyGrad[1]);
        aGrad.addColorStop(1, pal.roosterBodyGrad[2]);
        ctx.fillStyle = aGrad;
        ctx.beginPath();
        ctx.ellipse(0, walkBounce, halfW - 0.5, halfH + 0.5 + jumpStretch, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Flowing Cape of Hackles + Realistic Wing Covert Scallops
        ctx.fillStyle = pal.hackles[0];
        ctx.beginPath();
        ctx.moveTo(-6, -halfH + 4 + walkBounce);
        ctx.lineTo(10, -halfH + 4 + walkBounce);
        ctx.lineTo(12, 8 + walkBounce);
        ctx.lineTo(4, 11 + walkBounce);
        ctx.lineTo(-7, 6 + walkBounce);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = pal.hackles[1];
        ctx.fillRect(-3, -halfH + 5 + walkBounce, 11, 8);
        ctx.fillStyle = pal.hackles[2];
        ctx.fillRect(-1, -halfH + 7 + walkBounce, 7, 5);
        // Layered wing covert feather scallops along flank
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
        ctx.lineWidth = 1.1;
        for (let fw = 0; fw < 3; fw++) {
          ctx.beginPath();
          ctx.arc(-6 + fw * 5, 4 + walkBounce, 4.2, 0.25, Math.PI - 0.25);
          ctx.stroke();
        }

        // 3. SPECTACULAR FLOWING IRIDESCENT SICKLE TAIL PLUMES!
        // Outer Colossal Sickle
        ctx.fillStyle = pal.sickles[0];
        ctx.beginPath();
        ctx.moveTo(-halfW + 3, -3 + walkBounce);
        ctx.quadraticCurveTo(-halfW - 18, -20 + walkBounce, -halfW - 8, -32 + walkBounce);
        ctx.quadraticCurveTo(-halfW - 26, -14 + walkBounce, -halfW - 2, 8 + walkBounce);
        ctx.fill();

        // Inner Sickle
        ctx.fillStyle = pal.sickles[1];
        ctx.beginPath();
        ctx.moveTo(-halfW + 3, -6 + walkBounce);
        ctx.quadraticCurveTo(-halfW - 22, -14 + walkBounce, -halfW - 14, -25 + walkBounce);
        ctx.quadraticCurveTo(-halfW - 28, -6 + walkBounce, -halfW + 1, 12 + walkBounce);
        ctx.fill();

        // Secondary Plume
        ctx.fillStyle = pal.sickles[2];
        ctx.beginPath();
        ctx.moveTo(-halfW + 4, 0 + walkBounce);
        ctx.quadraticCurveTo(-halfW - 14, -6 + walkBounce, -halfW - 8, -16 + walkBounce);
        ctx.quadraticCurveTo(-halfW - 18, 0 + walkBounce, -halfW + 2, 10 + walkBounce);
        ctx.fill();

        // Downy Coverts at tail base
        ctx.fillStyle = pal.sickles[0];
        ctx.fillRect(-halfW - 6, 0 + walkBounce, 9, 10);
        ctx.fillStyle = pal.sickles[1];
        ctx.fillRect(-halfW - 4, 2 + walkBounce, 6, 6);

        // 4. COLOSSAL MULTI-SERRATED CROWN COMB & DOUBLE WATTLES
        // Comb peak 1
        ctx.fillStyle = pal.comb[0];
        ctx.fillRect(-5, -halfH - 11 + walkBounce, 5, 10);
        // Comb peak 2 (tallest)
        ctx.fillRect(0, -halfH - 17 + walkBounce, 7, 16);
        // Comb peak 3
        ctx.fillRect(6, -halfH - 14 + walkBounce, 6, 13);
        // Comb peak 4
        ctx.fillRect(11, -halfH - 9 + walkBounce, 5, 8);
        // Comb highlights
        ctx.fillStyle = pal.comb[1];
        ctx.fillRect(1, -halfH - 13 + walkBounce, 11, 5);
        ctx.fillStyle = pal.comb[2];
        ctx.fillRect(2, -halfH - 15 + walkBounce, 3, 3);

        // Double swinging fleshy throat wattles
        ctx.fillStyle = pal.wattles;
        ctx.beginPath();
        ctx.ellipse(10.5, 7 + walkBounce, 4, 8, 0.15, 0, Math.PI * 2);
        ctx.ellipse(13, 8 + walkBounce, 3.5, 7, 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(10, 4 + walkBounce, 3, 5);

        // 5. Piercing Legendary Hero Eye with noble brow
        if (isBlinking) {
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(7.5, -5 + walkBounce, 3.2, 0.1, Math.PI - 0.1);
          ctx.stroke();
        } else {
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(7.5, -5 + walkBounce, 4.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.arc(7.8, -5 + walkBounce, 3.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#020617';
          ctx.beginPath();
          ctx.arc(7.8, -5 + walkBounce, 2.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(8, -7.5 + walkBounce, 2.4, 2.4);
          ctx.fillRect(9.5, -4.5 + walkBounce, 1.2, 1.2);
        }

        // 6. Formidable Raptor-Curved Beak
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.moveTo(12, -4.5 + walkBounce);
        ctx.quadraticCurveTo(25, 0.5 + walkBounce, 24, 2.5 + walkBounce);
        ctx.lineTo(12, 5.5 + walkBounce);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(13, -3 + walkBounce, 6, 2);
        ctx.fillStyle = '#7c2d12';
        ctx.fillRect(15, -1.5 + walkBounce, 1.8, 1.2);

        // 7. Visible Pixel Armor on Adult Rooster
        this.drawPixelArmor(ctx, 'rooster', 'adult', armor, walkBounce, halfW, halfH, opts.skin, time);

        // 8. Dinosaurian Scaled Legs with Horizontal Tarsal Scales & Fighting Spurs!
        const footY = isJumping ? halfH - 4 : halfH - 1.5;
        ctx.fillStyle = '#c2410c';
        // Back leg
        ctx.fillRect(-7 + footCycle, footY - 5, 5, 7.5);
        ctx.fillRect(-9 + footCycle, footY + 1.5, 9.5, 3.5);
        // Subtle tarsal avian scale ridges
        ctx.fillStyle = '#7c2d12';
        ctx.fillRect(-6.5 + footCycle, footY - 3, 4, 0.9);
        ctx.fillRect(-6.5 + footCycle, footY - 1, 4, 0.9);
        // Deadly calcified ivory fighting spur protruding backward!
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(-7 + footCycle, footY);
        ctx.lineTo(-13 + footCycle, footY - 2.5);
        ctx.lineTo(-7 + footCycle, footY + 3);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#cbd5e1'; // spur shadow
        ctx.fillRect(-9 + footCycle, footY + 0.5, 2.5, 1.5);
        // Front leg
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(4 - footCycle, footY - 5, 5, 7.5);
        ctx.fillRect(3 - footCycle, footY + 1.5, 10, 3.5);
        ctx.fillStyle = '#7c2d12';
        ctx.fillRect(4.5 - footCycle, footY - 3, 4, 0.9);
        ctx.fillRect(4.5 - footCycle, footY - 1, 4, 0.9);

        // 9. Colossal Mighty Sword
        this.drawSword(ctx, walkBounce, isAttacking, sword === 'none' ? 'gold' : sword, true);

      } else {
        // --- ADULT LEGENDARY QUEEN HEN ---
        // Plump, regal, maternal yet battle-tested matriarch! Rich warm caramel, cinnamon & chestnut plumage,
        // intricately patterned feather bars, majestic red rose comb with velvet beads,
        // broad graceful fanned tiered tail, wise courageous eyes, sculpted queen's cuirass & great blade!

        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.26)';
        ctx.beginPath();
        ctx.ellipse(0, halfH - 1, 18, 5.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 1. Plump, Full Majestic Hen Silhouette
        const aHGrad = ctx.createRadialGradient(-3, walkBounce - 3, 5, 0, walkBounce, halfW + 3);
        aHGrad.addColorStop(0, pal.henBodyGrad[0]);
        aHGrad.addColorStop(0.5, pal.henBodyGrad[1]);
        aHGrad.addColorStop(0.8, pal.henBodyGrad[2]);
        aHGrad.addColorStop(1, pal.bars[0]);
        ctx.fillStyle = aHGrad;
        ctx.beginPath();
        ctx.ellipse(0, walkBounce, halfW + 3, halfH + 1 + jumpStretch, 0, 0, Math.PI * 2);
        ctx.fill();

        // Feather bars & layered covert scallops across back & breast
        ctx.fillStyle = pal.bars[0];
        ctx.fillRect(-8, -4 + walkBounce, 5, 3.5);
        ctx.fillRect(-4, 5 + walkBounce, 5, 3.5);
        ctx.fillRect(3, 7 + walkBounce, 5, 3.5);
        ctx.fillRect(7, 2 + walkBounce, 4, 3.5);
        // Highlight bars
        ctx.fillStyle = pal.bars[1];
        ctx.fillRect(-6, 1 + walkBounce, 4, 2);
        ctx.fillRect(0, 3 + walkBounce, 4, 2);
        ctx.fillRect(5, -1 + walkBounce, 4, 2);
        // Soft natural wing covert feather scallops
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.16)';
        ctx.lineWidth = 1.05;
        for (let fw = 0; fw < 3; fw++) {
          ctx.beginPath();
          ctx.arc(-6 + fw * 5, 3.5 + walkBounce, 4.1, 0.25, Math.PI - 0.25);
          ctx.stroke();
        }

        // 2. Majestic Broad Fanned Tiered Tail held with regal poise
        ctx.fillStyle = pal.tailHen[0];
        ctx.beginPath();
        ctx.ellipse(-halfW - 6, -3 + walkBounce, 8, 13, -0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pal.tailHen[1];
        ctx.beginPath();
        ctx.ellipse(-halfW - 3, 1 + walkBounce, 6, 10, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pal.bars[1];
        ctx.fillRect(-halfW - 8, -9 + walkBounce, 4, 4); // tail tips

        // 3. Dignified Textured Rose Comb
        ctx.fillStyle = pal.comb[0];
        ctx.beginPath();
        ctx.arc(1, -halfH - 6 + walkBounce, 4, 0, Math.PI * 2);
        ctx.arc(6, -halfH - 8 + walkBounce, 4.5, 0, Math.PI * 2);
        ctx.arc(11, -halfH - 5 + walkBounce, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pal.comb[1];
        ctx.fillRect(2, -halfH - 6 + walkBounce, 9, 3);
        ctx.fillStyle = pal.comb[2];
        ctx.fillRect(4, -halfH - 8 + walkBounce, 3, 2);

        // Petite rounded double chin wattles
        ctx.fillStyle = pal.wattles;
        ctx.beginPath();
        ctx.ellipse(11, 5 + walkBounce, 3.5, 6, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(10.5, 3 + walkBounce, 2.5, 3);

        // 4. Wise, Courageous Maternal Eye
        if (isBlinking) {
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(7.5, -5 + walkBounce, 3.2, 0.1, Math.PI - 0.1);
          ctx.stroke();
        } else {
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(7.5, -5 + walkBounce, 4.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.arc(7.8, -5 + walkBounce, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#020617';
          ctx.beginPath();
          ctx.arc(7.8, -5 + walkBounce, 2.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(8, -7.5 + walkBounce, 2.4, 2.4);
          ctx.fillRect(9.8, -4.5 + walkBounce, 1.5, 1.5);
        }

        // 5. Polished Golden Beak
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(12.5, -3.5 + walkBounce);
        ctx.quadraticCurveTo(23, 0 + walkBounce, 22, 2.5 + walkBounce);
        ctx.lineTo(12.5, 4.5 + walkBounce);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#d97706';
        ctx.fillRect(13.5, 1 + walkBounce, 5.5, 2);

        // 6. Visible Pixel Armor on Adult Hen
        this.drawPixelArmor(ctx, 'hen', 'adult', armor, walkBounce, halfW, halfH, opts.skin, time);

        // 7. Sturdy scaled avian feet (no spurs, true to biology!)
        const footY = isJumping ? halfH - 4 : halfH - 1.5;
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(-7 + footCycle, footY - 5, 5, 7.5);
        ctx.fillRect(-8 + footCycle, footY + 1.5, 9.5, 3.5);
        ctx.fillRect(4 - footCycle, footY - 5, 5, 7.5);
        ctx.fillRect(3 - footCycle, footY + 1.5, 10, 3.5);
        ctx.fillStyle = '#7c2d12';
        ctx.fillRect(-6.5 + footCycle, footY - 3, 4, 0.9);
        ctx.fillRect(-6.5 + footCycle, footY - 1, 4, 0.9);
        ctx.fillRect(4.5 - footCycle, footY - 3, 4, 0.9);
        ctx.fillRect(4.5 - footCycle, footY - 1, 4, 0.9);

        // 8. Colossal Mighty Sword
        this.drawSword(ctx, walkBounce, isAttacking, sword === 'none' ? 'gold' : sword, true);
      }
    }

    // Draw Shield when blocking
    if (opts.isBlocking) {
      const shieldType = armor === 'diamond' ? 'diamond' : (armor === 'gold' ? 'gold' : 'iron');
      this.drawShield(ctx, walkBounce, shieldType, halfW, opts.fireResistActive);
    }

    // Draw Royal Champion Crown
    if (opts.hasCrown) {
      this.drawCrown(ctx, walkBounce, halfH, stage);
    }

    ctx.restore();
  }

  /**
   * Secret Thanksgiving Roasted / Crispy Fried Chicken Model:
   * Authentic oven-roasted golden-brown feast with rosemary herb seasoning,
   * completely headless (carved roasted neck fold with fresh rosemary sprig),
   * and pure ivory drumstick bone legs ending in double-knuckle cartilage condyles!
   * Dynamically alters body shape, size, glaze, and paper frill accents
   * across Baby Chick, Juvenile, Teen, and Adult stages, with distinct Rooster & Hen nuances.
   */
  private renderThanksgivingRoastModel(
    ctx: CanvasRenderingContext2D,
    gender: ChickenGender,
    stage: GrowthStage,
    halfW: number,
    halfH: number,
    armor: ArmorType,
    sword: SwordType,
    anim: {
      time: number;
      walkBounce: number;
      footCycle: number;
      jumpStretch: number;
      isJumping: boolean;
      isFalling: boolean;
      isMoving: boolean;
      isAttacking: boolean;
      isBlocking: boolean;
      hasCrown: boolean;
      fireResistActive?: boolean;
    }
  ) {
    const isRooster = gender !== 'hen';
    const { time, walkBounce, footCycle, jumpStretch, isJumping, isMoving, isAttacking } = anim;

    // Stage-specific size scale & proportions
    const isBaby = stage === 'baby' || stage === 'egg';
    const isJuvenile = stage === 'juvenile';
    const isTeen = stage === 'teen';
    const isAdult = stage === 'adult';

    // Scale dimensions based on growth stage
    const bodyW = isBaby ? halfW * 0.95 : (isJuvenile ? halfW * 1.05 : (isTeen ? halfW * 1.15 : halfW * 1.3));
    const bodyH = isBaby ? halfH * 0.85 : (isJuvenile ? halfH * 0.95 : (isTeen ? halfH * 1.1 : halfH * 1.25));
    const boneLength = isBaby ? 8 : (isJuvenile ? 11 : (isTeen ? 14 : 18));
    const boneWidth = isBaby ? 2.5 : (isJuvenile ? 3.5 : (isTeen ? 4.2 : 5));
    const knuckleRadius = isBaby ? 2.2 : (isJuvenile ? 3.0 : (isTeen ? 3.8 : 4.8));

    // 1. Soft Warm Sizzling Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, halfH - 1, bodyW * 0.85, isAdult ? 5.5 : 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Glistening Roasted Feast Aura & Rising Steam Trails (Looks mouth-watering & hot from the oven!)
    const steamCount = isBaby ? 2 : (isAdult ? 5 : 3);
    for (let s = 0; s < steamCount; s++) {
      const sPhase = (time * 2 + s * 1.3) % 3;
      const sAlpha = Math.max(0, 0.45 * (1 - sPhase / 3));
      const sX = -bodyW * 0.4 + (s * bodyW * 0.8) / (steamCount - 1 || 1) + Math.sin(time * 3 + s) * 4;
      const sY = -bodyH * 0.6 - sPhase * 12 + walkBounce;
      ctx.fillStyle = `rgba(254, 240, 138, ${sAlpha})`;
      ctx.beginPath();
      ctx.arc(sX, sY, 3 + sPhase * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. PLUMP ROASTED CHICKEN / TURKEY BODY (COMPLETELY HEADLESS!)
    // Roast color gradient:
    // Rooster: Fiery roasted paprika, dark bronzed molasses, golden crispy crust
    // Hen: Sweet honey-butter basting glaze, rich golden-amber, delicate caramelized edges
    const bodyGrad = ctx.createRadialGradient(-3, walkBounce - 3, 2, 0, walkBounce, bodyW + 4);
    if (isRooster) {
      bodyGrad.addColorStop(0, '#fef08a'); // Sizzling butter highlight
      bodyGrad.addColorStop(0.2, '#f59e0b'); // Golden crispy roast
      bodyGrad.addColorStop(0.55, '#d97706'); // Deep amber
      bodyGrad.addColorStop(0.85, '#92400e'); // Roasted mahogany
      bodyGrad.addColorStop(1, '#451a03'); // Charred crispy edge
    } else {
      bodyGrad.addColorStop(0, '#fffbeb'); // Creamy honey butter
      bodyGrad.addColorStop(0.25, '#fbbf24'); // Honey glaze
      bodyGrad.addColorStop(0.65, '#d97706'); // Warm cinnamon roast
      bodyGrad.addColorStop(0.9, '#b45309'); // Golden brown
      bodyGrad.addColorStop(1, '#78350f'); // Delicate roasted crust
    }

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    if (isBaby) {
      // Cute bite-sized golden-crispy tender / nugget
      ctx.ellipse(0, walkBounce, bodyW, bodyH + jumpStretch, 0, 0, Math.PI * 2);
    } else {
      // Authentic sculpted Thanksgiving roasted turkey shape
      ctx.moveTo(-bodyW * 0.75, bodyH * 0.2 + walkBounce);
      // Back roasted rump/tail cavity
      ctx.quadraticCurveTo(-bodyW * 0.9, -bodyH * 0.3 + walkBounce, -bodyW * 0.4, -bodyH * 0.7 + walkBounce);
      // Top roasted breast curve leading to headless neck fold
      ctx.quadraticCurveTo(0, -bodyH * 0.95 + walkBounce, bodyW * 0.5, -bodyH * 0.6 + walkBounce);
      // Headless roasted neck fold / carved opening
      ctx.quadraticCurveTo(bodyW * 0.85, -bodyH * 0.3 + walkBounce, bodyW * 0.8, 0 + walkBounce);
      // Plump front breast & belly
      ctx.quadraticCurveTo(bodyW * 0.75, bodyH * 0.6 + walkBounce, bodyW * 0.2, bodyH * 0.75 + walkBounce);
      ctx.quadraticCurveTo(-bodyW * 0.4, bodyH * 0.7 + walkBounce, -bodyW * 0.75, bodyH * 0.2 + walkBounce);
    }
    ctx.closePath();
    ctx.fill();

    // 4. ROAST TEXTURE: Crispy skin cracks, basting glaze shine & herb seasoning rub
    // A. Crispy Basting Glaze Sheen
    ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
    ctx.beginPath();
    ctx.ellipse(-bodyW * 0.15, -bodyH * 0.35 + walkBounce, bodyW * 0.45, bodyH * 0.25, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // B. Seasoning Specks (Cracked Black Pepper, Paprika & Thyme/Rosemary Flecks)
    const speckCoords = isBaby 
      ? [[-3, -2], [2, 1], [-1, 4], [4, -3]]
      : [[-8, -6], [-4, -10], [3, -8], [7, -3], [-5, 2], [2, 6], [-9, 3], [8, 4], [0, 0]];
    
    speckCoords.forEach(([sx, sy], idx) => {
      ctx.fillStyle = idx % 3 === 0 ? '#1c1917' : (idx % 3 === 1 ? '#15803d' : (isRooster ? '#dc2626' : '#b45309'));
      ctx.fillRect(sx, sy + walkBounce, idx % 2 === 0 ? 1.8 : 1.2, idx % 2 === 0 ? 1.8 : 1.2);
    });

    // 5. HEADLESS NECK FOLD & ROSEMARY SPRIG GARNISH
    // Instead of a head, eyes, beak, comb, or wattles: a clean, golden-roasted cavity fold!
    const neckX = bodyW * 0.55;
    const neckY = -bodyH * 0.45 + walkBounce;
    
    // Roasted neck fold shadow & rim
    ctx.fillStyle = isRooster ? '#78350f' : '#92400e';
    ctx.beginPath();
    ctx.ellipse(neckX, neckY, isBaby ? 3.5 : 5.5, isBaby ? 4.5 : 7, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isRooster ? '#b45309' : '#d97706';
    ctx.beginPath();
    ctx.ellipse(neckX - 1, neckY, isBaby ? 2.5 : 4, isBaby ? 3.5 : 5.5, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Festive fresh aromatic rosemary herb sprig tucked in the neck cavity!
    ctx.save();
    ctx.translate(neckX + 1, neckY - 2);
    ctx.rotate(0.25 + Math.sin(time * 4) * 0.08);
    // Main stem
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(4, -8);
    ctx.stroke();
    // Rosemary needles
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(1, -3, 3.5, 1.2);
    ctx.fillRect(0, -5, -3.5, 1.2);
    ctx.fillRect(2, -7, 3, 1.2);
    ctx.fillRect(3, -9, 2, 2);
    ctx.restore();

    // 6. ROASTED WING DRUMETTES (Folded or swinging when attacking)
    let wingRot = 0.15;
    if (isAttacking) wingRot = -1.1 + Math.sin(time * 24) * 0.3;
    else if (isJumping) wingRot = -0.55;
    else if (isMoving) wingRot = 0.15 + Math.sin(time * 16) * 0.25;

    ctx.save();
    ctx.translate(-bodyW * 0.1, 1 + walkBounce);
    ctx.rotate(wingRot);

    // Roasted wing drumette gradient
    const wingGrad = ctx.createLinearGradient(0, -4, 0, 8);
    wingGrad.addColorStop(0, '#f59e0b');
    wingGrad.addColorStop(0.6, '#b45309');
    wingGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, isBaby ? 5.5 : (isAdult ? 11 : 8), isBaby ? 4 : (isAdult ? 7 : 5.5), -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Wing bone tip or crisp golden point
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(isBaby ? 2 : 4, -2, 2, 2);

    // If attacking, sizzling golden whoosh arc!
    if (isAttacking) {
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, isAdult ? 18 : 13, -0.6, 0.8);
      ctx.stroke();
    }
    ctx.restore();

    // 7. DRUMSTICK BONE LEGS WITH DETAILED DUAL-KNUCKLE CARTILAGE ENDS
    // "our legs are bones just like the end of a drumstick with details and color"
    const legBaseY = bodyH * 0.45 + walkBounce;
    const footY = isJumping ? halfH - 4 : halfH - 1.5;

    // Helper to draw a single drumstick bone leg
    const drawDrumstickBoneLeg = (
      hipX: number,
      cycleOffset: number,
      isBackLeg: boolean
    ) => {
      const legX = hipX + (isMoving ? cycleOffset : 0);
      const legTopY = legBaseY - 1;
      const legBottomY = footY;

      // A. Plump roasted golden thigh bulge / meat socket where the meat ends
      ctx.fillStyle = isRooster ? '#92400e' : '#b45309';
      ctx.beginPath();
      ctx.ellipse(legX, legTopY, boneWidth * 1.4, boneWidth * 1.1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = isRooster ? '#d97706' : '#f59e0b';
      ctx.beginPath();
      ctx.ellipse(legX, legTopY - 1, boneWidth * 1.1, boneWidth * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // B. Decorative White Paper Chef Frill (Papillote) on Hen, or roasted skin ring on Rooster!
      if (!isRooster || isBaby) {
        // Pretty pleated white chef frill on drumstick
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(legX - boneWidth * 1.1, legTopY + 1, boneWidth * 2.2, 2.5);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(legX - boneWidth * 0.8, legTopY + 2.5, boneWidth * 1.6, 1);
      } else {
        // Roasted brown skin cuff
        ctx.fillStyle = '#78350f';
        ctx.fillRect(legX - boneWidth * 0.9, legTopY + 1, boneWidth * 1.8, 2);
      }

      // C. Pure Ivory/White Bone Shaft (Cartilaginous smooth cylinder)
      const shaftTop = legTopY + 3;
      const shaftBottom = legBottomY - knuckleRadius * 0.6;
      const shaftHeight = Math.max(4, shaftBottom - shaftTop);

      // Bone back shadow side
      ctx.fillStyle = isBackLeg ? '#cbd5e1' : '#e2e8f0';
      ctx.fillRect(legX - boneWidth / 2, shaftTop, boneWidth, shaftHeight);

      // Bone lit highlight side
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(legX - boneWidth / 2 + 1, shaftTop, boneWidth - 1.5, shaftHeight);

      // Specular bright bone shine
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(legX - 0.5, shaftTop + 1, 1, Math.max(2, shaftHeight - 2));

      // D. THE ICONIC DOUBLE-LOBED DRUMSTICK BONE KNUCKLE (Cartilage Condyles!)
      // Two distinct rounded condyle lobes forming the classic drumstick end!
      const kY = legBottomY;
      const kSpread = knuckleRadius * 0.75;

      // Outer bone knuckle lobe (left condyle)
      ctx.fillStyle = isBackLeg ? '#cbd5e1' : '#f1f5f9';
      ctx.beginPath();
      ctx.arc(legX - kSpread, kY, knuckleRadius, 0, Math.PI * 2);
      ctx.fill();

      // Inner bone knuckle lobe (right condyle)
      ctx.beginPath();
      ctx.arc(legX + kSpread, kY, knuckleRadius, 0, Math.PI * 2);
      ctx.fill();

      // High-definition bone highlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(legX - kSpread, kY - 0.8, knuckleRadius * 0.65, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(legX + kSpread, kY - 0.8, knuckleRadius * 0.65, 0, Math.PI * 2);
      ctx.fill();

      // Joint marrow indent / cartilage cleft between the two lobes
      ctx.fillStyle = isBackLeg ? '#94a3b8' : '#cbd5e1';
      ctx.beginPath();
      ctx.arc(legX, kY + knuckleRadius * 0.3, knuckleRadius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    };

    // Draw Back Leg first (renders behind body)
    drawDrumstickBoneLeg(-bodyW * 0.25, footCycle, true);

    // Draw Front Leg second (renders in front of body)
    drawDrumstickBoneLeg(bodyW * 0.2, -footCycle, false);

    // 8. EQUIPPED ARMOR ON THANKSGIVING ROAST
    if (armor !== 'none') {
      const isDiamond = armor === 'diamond';
      const isGold = armor === 'gold';
      const armPal = isDiamond ? {
        base: '#0284c7', bright: '#38bdf8', shine: '#e0f2fe', dark: '#082f49', trim: '#bae6fd'
      } : isGold ? {
        base: '#ca8a04', bright: '#facc15', shine: '#fef08a', dark: '#451a03', trim: '#fde047'
      } : {
        base: '#475569', bright: '#94a3b8', shine: '#cbd5e1', dark: '#0f172a', trim: '#f8fafc'
      };

      if (isBaby) {
        // Baby Fried Chicken Nugget / Tender Armor - Custom Fitted to Baby Size!
        const bW = bodyW * 0.85;
        const bH = bodyH * 0.7;
        const bY = -bH * 0.25 + walkBounce;
        
        // Mini golden basting breastplate
        ctx.fillStyle = armPal.dark;
        ctx.fillRect(-bW * 0.45, bY - 1, bW * 0.9, bH + 2);
        ctx.fillStyle = armPal.base;
        ctx.fillRect(-bW * 0.4, bY, bW * 0.8, bH);
        ctx.fillStyle = armPal.bright;
        ctx.fillRect(-bW * 0.35, bY + 1, bW * 0.7, 2);
        
        // Mini basting pin & herb gem
        ctx.fillStyle = armPal.shine;
        ctx.fillRect(-1.5, bY + bH * 0.3, 3, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-0.5, bY + bH * 0.3 + 0.5, 1, 1);

        // Mini basting skewers
        ctx.fillStyle = armPal.trim;
        ctx.fillRect(-bW * 0.3, bY - 2, 1.5, 2);
        ctx.fillRect(bW * 0.3 - 1.5, bY - 2, 1.5, 2);
      } else {
        // Full Size Roasted Feather Armor Rack & Basting Plates
        const bW = bodyW * 0.75;
        const bH = bodyH * 0.6;
        const bY = -bodyH * 0.25 + walkBounce;

        ctx.fillStyle = armPal.dark;
        ctx.fillRect(-bW * 0.5, bY - 1, bW, bH + 2);
        ctx.fillStyle = armPal.base;
        ctx.fillRect(-bW * 0.45, bY, bW * 0.9, bH);
        ctx.fillStyle = armPal.bright;
        ctx.fillRect(-bW * 0.35, bY + 1.5, bW * 0.7, 2.5);
        ctx.fillStyle = armPal.shine;
        ctx.fillRect(-bW * 0.2, bY + 4, bW * 0.4, 2);

        // Overlapping basting feather plates
        for (let fp = 0; fp < 3; fp++) {
          const fx = -bW * 0.3 + fp * (bW * 0.3);
          ctx.fillStyle = armPal.dark;
          ctx.fillRect(fx - 1, bY + bH - 3, 5, 4);
          ctx.fillStyle = armPal.bright;
          ctx.fillRect(fx, bY + bH - 2, 3, 3);
        }

        // Center jewel basting crest
        ctx.fillStyle = armPal.shine;
        ctx.fillRect(-2.5, bY + bH * 0.35, 5, 5);
        ctx.fillStyle = isDiamond ? '#ffffff' : (isGold ? '#ef4444' : '#38bdf8');
        ctx.fillRect(-1.5, bY + bH * 0.35 + 1, 3, 3);
      }
    }

    // 9. EQUIPPED SWORD
    if (sword !== 'none') {
      this.drawSword(ctx, walkBounce, isAttacking, sword, isAdult);
    }

    // 10. BLOCKING SHIELD
    if (anim.isBlocking) {
      const shieldType = armor === 'diamond' ? 'diamond' : (armor === 'gold' ? 'gold' : 'iron');
      this.drawShield(ctx, walkBounce, shieldType, bodyW, anim.fireResistActive);
    }

    // 11. ROYAL BANQUET CROWN
    if (anim.hasCrown) {
      this.drawCrown(ctx, walkBounce, bodyH, stage);
    }
  }

  private drawSword(
    ctx: CanvasRenderingContext2D,
    walkBounce: number,
    isAttacking: boolean,
    type: 'iron' | 'gold' | 'diamond' | 'netherite',
    isLarge = false
  ) {
    const isNetherite = type === 'netherite';
    const isDiamond = type === 'diamond';
    const isGold = type === 'gold';
    const bladeLen = isLarge ? (isNetherite ? 30 : 28) : (isNetherite ? 22 : 20);
    const bladeW = isLarge ? (isNetherite ? 5.5 : 5) : (isNetherite ? 4 : 3.5);

    ctx.save();

    if (isAttacking) {
      ctx.translate(14, 2 + walkBounce);
      ctx.rotate(0.35);

      // 1. Smooth Aerodynamic Wind Animation
      ctx.save();
      const windR = bladeLen + (isLarge ? 8 : 6);

      // Primary translucent soft wind gust ribbon
      const windGrad1 = ctx.createRadialGradient(0, 0, bladeLen * 0.45, 0, 0, windR + 10);
      if (isNetherite) {
        windGrad1.addColorStop(0, 'rgba(126, 34, 206, 0)');
        windGrad1.addColorStop(0.45, 'rgba(192, 132, 252, 0.42)');
        windGrad1.addColorStop(0.85, 'rgba(232, 121, 249, 0.55)');
        windGrad1.addColorStop(1, 'rgba(255, 255, 255, 0)');
      } else if (isDiamond) {
        windGrad1.addColorStop(0, 'rgba(56, 189, 248, 0)');
        windGrad1.addColorStop(0.45, 'rgba(186, 230, 253, 0.32)');
        windGrad1.addColorStop(0.85, 'rgba(240, 249, 255, 0.42)');
        windGrad1.addColorStop(1, 'rgba(255, 255, 255, 0)');
      } else if (isGold) {
        windGrad1.addColorStop(0, 'rgba(250, 204, 21, 0)');
        windGrad1.addColorStop(0.45, 'rgba(254, 240, 138, 0.32)');
        windGrad1.addColorStop(0.85, 'rgba(254, 249, 195, 0.42)');
        windGrad1.addColorStop(1, 'rgba(255, 255, 255, 0)');
      } else {
        windGrad1.addColorStop(0, 'rgba(241, 245, 249, 0)');
        windGrad1.addColorStop(0.45, 'rgba(226, 232, 240, 0.32)');
        windGrad1.addColorStop(0.85, 'rgba(255, 255, 255, 0.4)');
        windGrad1.addColorStop(1, 'rgba(255, 255, 255, 0)');
      }

      ctx.fillStyle = windGrad1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, windR + 8, -0.85, 0.95, false);
      ctx.closePath();
      ctx.fill();

      // Secondary feathered wind vapor swooshes
      const windVapors = [
        { startA: -0.65, endA: 0.85, r: windR + 3, w: 5, alpha: 0.3 },
        { startA: -0.4, endA: 0.6, r: windR - 2, w: 4, alpha: 0.25 },
        { startA: -0.15, endA: 0.95, r: windR + 8, w: 3, alpha: 0.2 }
      ];

      windVapors.forEach(wv => {
        const vGrad = ctx.createRadialGradient(0, 0, wv.r - wv.w, 0, 0, wv.r + wv.w);
        vGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        vGrad.addColorStop(
          0.5,
          isNetherite
            ? `rgba(192, 132, 252, ${wv.alpha})`
            : isDiamond
            ? `rgba(186, 230, 253, ${wv.alpha})`
            : isGold
            ? `rgba(254, 240, 138, ${wv.alpha})`
            : `rgba(255, 255, 255, ${wv.alpha})`
        );
        vGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = vGrad;
        ctx.beginPath();
        ctx.arc(0, 0, wv.r + wv.w, wv.startA, wv.endA, false);
        ctx.arc(0, 0, Math.max(1, wv.r - wv.w), wv.endA, wv.startA, true);
        ctx.closePath();
        ctx.fill();
      });
      ctx.restore();

      // Slashing wind sparkles
      if (isNetherite) {
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(bladeLen - 4, -8, 2.5, 2.5);
        ctx.fillRect(bladeLen + 2, 4, 2, 2);
      } else if (isDiamond) {
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(bladeLen - 4, -8, 2.5, 2.5);
        ctx.fillRect(bladeLen + 2, 4, 2, 2);
      } else if (isGold) {
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(bladeLen - 4, -8, 2.5, 2.5);
        ctx.fillRect(bladeLen + 2, 4, 2, 2);
      }
    } else {
      ctx.translate(5, 4 + walkBounce);
      ctx.rotate(0.52);
    }

    // 2. Leather-wrapped hilt & pommel (Pixelated Arcade Style)
    const hiltLen = isLarge ? 8 : 6;
    ctx.fillStyle = '#000000';
    ctx.fillRect(-hiltLen - 1, -2.5, hiltLen + 2, 5);
    ctx.fillStyle = isNetherite ? '#09090b' : (isDiamond ? '#0f172a' : '#78350f');
    ctx.fillRect(-hiltLen, -1.5, hiltLen, 3);
    ctx.fillStyle = isNetherite ? '#7e22ce' : (isDiamond ? '#0369a1' : '#92400e');
    for (let b = 1; b < hiltLen - 1; b += 2.5) {
      ctx.fillRect(-hiltLen + b, -1.5, 1, 3);
    }

    // Pixelated Pommel
    const pommelR = isLarge ? 3.5 : 2.5;
    ctx.fillStyle = '#000000';
    ctx.fillRect(-hiltLen - pommelR - 1, -pommelR - 0.5, pommelR * 2 + 1, pommelR * 2 + 1);
    ctx.fillStyle = isNetherite ? '#18181b' : (isDiamond ? '#0284c7' : (isGold ? '#f59e0b' : '#64748b'));
    ctx.fillRect(-hiltLen - pommelR, -pommelR, pommelR * 2, pommelR * 2);
    // Gem glint in pommel
    ctx.fillStyle = isNetherite ? '#c084fc' : (isDiamond ? '#38bdf8' : (isGold ? '#ef4444' : '#cbd5e1'));
    ctx.fillRect(-hiltLen - 1.5, -1, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-hiltLen - 1, -1, 1, 1);

    // 3. Ornate Crossguard / Quillons (Pixelated with Bevels & Studs)
    const guardH = isLarge ? 15 : 11;
    ctx.fillStyle = '#000000';
    ctx.fillRect(-1, -guardH / 2 - 1, 5, guardH + 2);
    ctx.fillStyle = isNetherite ? '#18181b' : (isDiamond ? '#0284c7' : (isGold ? '#ca8a04' : '#475569'));
    ctx.fillRect(0, -guardH / 2, 3, guardH);
    ctx.fillStyle = isNetherite ? '#c084fc' : (isDiamond ? '#bae6fd' : (isGold ? '#fde047' : '#94a3b8'));
    ctx.fillRect(1, -guardH / 2 + 1, 1, guardH - 2);
    // Guard tips & rivets
    ctx.fillStyle = isNetherite ? '#a855f7' : (isDiamond ? '#38bdf8' : (isGold ? '#eab308' : '#334155'));
    ctx.fillRect(-1, -guardH / 2 - 1, 3, 2);
    ctx.fillRect(-1, guardH / 2 - 1, 3, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, -guardH / 2, 1, 1);
    ctx.fillRect(0, guardH / 2 - 1, 1, 1);

    // 4. Double-Edged Blade with stepped pixel tip and edge bevels
    // Netherite: obsidian black blade body with sharp purple shine
    const bColor = isNetherite ? '#18181b' : (isDiamond ? '#38bdf8' : (isGold ? '#facc15' : '#cbd5e1'));
    const highlightColor = isNetherite ? '#c084fc' : (isDiamond ? '#ffffff' : (isGold ? '#fef9c3' : '#ffffff'));
    const shadowColor = isNetherite ? '#09090b' : (isDiamond ? '#0369a1' : (isGold ? '#a16207' : '#64748b'));

    // Black pixel blade outline
    ctx.fillStyle = '#000000';
    ctx.fillRect(2, -bladeW / 2 - 1, bladeLen + 2, bladeW + 2);

    // Lower blade half (shadow)
    ctx.fillStyle = shadowColor;
    ctx.fillRect(3, 0, bladeLen, bladeW / 2);
    // Upper blade half (lit)
    ctx.fillStyle = bColor;
    ctx.fillRect(3, -bladeW / 2, bladeLen, bladeW / 2);
    // Razor edge highlight (radiant purple on Netherite)
    ctx.fillStyle = highlightColor;
    ctx.fillRect(3, -bladeW / 2, bladeLen, isNetherite ? 1.4 : 1);
    // Central fuller ridge
    ctx.fillStyle = isNetherite ? '#a855f7' : (isDiamond ? '#0284c7' : (isGold ? '#854d0e' : '#475569'));
    ctx.fillRect(4, -0.5, bladeLen - 4, 1);

    // Stepped Pixel Blade Tip
    const tipX = 3 + bladeLen;
    ctx.fillStyle = '#000000';
    ctx.fillRect(tipX, -bladeW / 2 - 1, 2, bladeW + 2);
    ctx.fillRect(tipX + 2, -bladeW / 2 + 0.5, 2, bladeW - 1);
    ctx.fillRect(tipX + 4, -1, 2, 2);

    ctx.fillStyle = bColor;
    ctx.fillRect(tipX, -bladeW / 2, 2, bladeW / 2);
    ctx.fillRect(tipX + 2, -1, 2, 1.5);
    ctx.fillStyle = shadowColor;
    ctx.fillRect(tipX, 0, 2, bladeW / 2);
    ctx.fillRect(tipX + 2, 0.5, 2, 1);
    ctx.fillStyle = highlightColor;
    ctx.fillRect(tipX + 4, -0.5, 1.5, 1);

    // Glint Sparkles on blade
    ctx.fillStyle = isNetherite ? '#e879f9' : '#ffffff';
    ctx.fillRect(bladeLen * 0.45 + 3, -bladeW / 2, 1.5, 1.5);
    ctx.fillRect(bladeLen * 0.8 + 3, -bladeW / 2, 1.5, 1.5);

    ctx.restore();
  }

  /**
   * Universal Powerful Feather Armor Renderer
   * Renders battle-forged feather armor across all growth stages:
   * - Juvenile, Teen, and Adult: Layered metallic feather plates, razor flight feather pauldrons,
   *   swept plumage battle crests, winged ankle greaves, and tail covert armor.
   * - Baby: Size-matched custom armor scaled dynamically, with adaptive crispy basting armor for fried chicken
   *   and vibrant harmonized feather trims/auras for colorful skins!
   */
  public drawPixelArmor(
    ctx: CanvasRenderingContext2D,
    gender: ChickenGender,
    stage: GrowthStage,
    armor: ArmorType,
    walkBounce: number,
    halfW: number,
    halfH: number,
    skin?: string,
    time: number = 0
  ) {
    if (!armor || armor === 'none') return;
    const isDiamond = armor === 'diamond';
    const isGold = armor === 'gold';
    const isIron = armor === 'iron';

    // Palette setup
    const pal = isDiamond ? {
      base: '#0284c7',
      bright: '#38bdf8',
      shine: '#e0f2fe',
      shadow: '#0369a1',
      dark: '#082f49',
      trim: '#bae6fd',
      gem: '#ffffff',
      quill: '#7dd3fc',
      aura: 'rgba(56, 189, 248, 0.45)',
    } : isGold ? {
      base: '#ca8a04',
      bright: '#facc15',
      shine: '#fef08a',
      shadow: '#854d0e',
      dark: '#451a03',
      trim: '#fde047',
      gem: '#ef4444',
      quill: '#fef9c3',
      aura: 'rgba(250, 204, 21, 0.45)',
    } : {
      base: '#475569',
      bright: '#94a3b8',
      shine: '#f1f5f9',
      shadow: '#334155',
      dark: '#0f172a',
      trim: '#cbd5e1',
      gem: '#38bdf8',
      quill: '#f8fafc',
      aura: 'rgba(148, 163, 184, 0.35)',
    };

    ctx.save();

    // Stage flags
    const isRooster = gender !== 'hen';
    const isBaby = stage === 'baby' || stage === 'egg';
    const isJuvenile = stage === 'juvenile';
    const isTeen = stage === 'teen';
    const isAdult = stage === 'adult';

    // Dynamic colorful skin accent detection
    let accentTrim = pal.trim;
    let gemAccent = pal.gem;
    let auraGlow = pal.aura;
    let hasColorfulSkin = false;

    if (skin && skin !== 'classic' && skin !== 'thanksgiving_roast') {
      hasColorfulSkin = true;
      if (skin === 'phoenix') {
        accentTrim = '#f97316';
        gemAccent = '#fbbf24';
        auraGlow = 'rgba(249, 115, 22, 0.6)';
      } else if (skin === 'prismatic_rainbow') {
        const hue = (time * 100) % 360;
        accentTrim = `hsl(${hue}, 90%, 65%)`;
        gemAccent = '#ffffff';
        auraGlow = `hsla(${hue}, 85%, 60%, 0.5)`;
      } else if (skin === 'cyber_neon') {
        accentTrim = '#06b6d4';
        gemAccent = '#ec4899';
        auraGlow = 'rgba(6, 182, 212, 0.6)';
      } else if (skin === 'cosmic_nebula') {
        accentTrim = '#c084fc';
        gemAccent = '#38bdf8';
        auraGlow = 'rgba(192, 132, 252, 0.55)';
      } else if (skin === 'golden_emperor') {
        accentTrim = '#fde047';
        gemAccent = '#ef4444';
        auraGlow = 'rgba(253, 224, 71, 0.6)';
      } else if (skin === 'glacier_frost' || skin === 'snow') {
        accentTrim = '#a5f3fc';
        gemAccent = '#ffffff';
        auraGlow = 'rgba(165, 243, 252, 0.55)';
      } else if (skin === 'dragon_scale') {
        accentTrim = '#059669';
        gemAccent = '#dc2626';
        auraGlow = 'rgba(5, 150, 105, 0.5)';
      } else if (skin === 'volcanic_magma') {
        accentTrim = '#ea580c';
        gemAccent = '#facc15';
        auraGlow = 'rgba(234, 88, 12, 0.55)';
      } else if (skin === 'emerald') {
        accentTrim = '#10b981';
        gemAccent = '#6ee7b7';
        auraGlow = 'rgba(16, 185, 129, 0.5)';
      } else if (skin === 'sapphire') {
        accentTrim = '#38bdf8';
        gemAccent = '#60a5fa';
        auraGlow = 'rgba(56, 189, 248, 0.5)';
      } else if (skin === 'rose_quartz') {
        accentTrim = '#f472b6';
        gemAccent = '#fbcfe8';
        auraGlow = 'rgba(244, 114, 182, 0.5)';
      } else if (skin === 'amethyst_twilight') {
        accentTrim = '#c084fc';
        gemAccent = '#e879f9';
        auraGlow = 'rgba(192, 132, 252, 0.5)';
      } else if (skin === 'solar_flare') {
        accentTrim = '#f59e0b';
        gemAccent = '#ef4444';
        auraGlow = 'rgba(245, 158, 11, 0.55)';
      } else if (skin === 'shadow_ninja') {
        accentTrim = '#3b82f6';
        gemAccent = '#93c5fd';
        auraGlow = 'rgba(59, 130, 246, 0.45)';
      }
    }

    // =========================================================================
    // 1. BABY STAGE ADAPTIVE ARMOR (Scales depending on size & skin!)
    // =========================================================================
    if (isBaby) {
      const babyScale = Math.min(halfW / 12, halfH / 12);

      // Baby Fried Chicken Nugget Skin Adaptation
      if (skin === 'thanksgiving_roast') {
        const bW = 10 * babyScale;
        const bH = 8 * babyScale;
        const bX = -bW / 2;
        const bY = -bH / 2 + 1 + walkBounce;

        // Mini fried chicken basting harness
        ctx.fillStyle = pal.dark;
        ctx.fillRect(bX - 1, bY - 1, bW + 2, bH + 2);
        ctx.fillStyle = pal.base;
        ctx.fillRect(bX, bY, bW, bH);
        ctx.fillStyle = pal.bright;
        ctx.fillRect(bX + 1, bY + 1, bW - 2, 2);
        // Mini basting gem
        ctx.fillStyle = pal.shine;
        ctx.fillRect(bX + bW / 2 - 1.5, bY + bH / 2 - 1.5, 3, 3);
        ctx.fillStyle = gemAccent;
        ctx.fillRect(bX + bW / 2 - 0.5, bY + bH / 2 - 0.5, 1, 1);
        ctx.restore();
        return;
      }

      // Standard Baby Chick / Colorful Skin Adaptive Feather Armor (shifted cleanly lower onto chest)
      const bW = 10 * babyScale;
      const bH = 7.5 * babyScale;
      const bX = -bW / 2;
      const bY = 1.5 + walkBounce;

      // Subtle glowing magical aura for diamond/gold or colorful skin
      if (isDiamond || isGold || hasColorfulSkin) {
        ctx.fillStyle = auraGlow;
        ctx.beginPath();
        ctx.ellipse(0, walkBounce, bW * 0.9, bH * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // A. Cute Mini Feathered Crest Diadem on Baby Head (steady position above eyes)
      const hW = 9.5 * babyScale;
      const hX = -hW / 2;
      const hY = -halfH - 2.5;

      ctx.fillStyle = pal.dark;
      ctx.fillRect(hX - 1, hY - 1, hW + 2, 5);
      ctx.fillStyle = pal.base;
      ctx.fillRect(hX, hY, hW, 3.5);
      // 3 Mini swept feather tips
      ctx.fillStyle = accentTrim;
      ctx.fillRect(hX + 1, hY - 2.5, 2, 3);
      ctx.fillRect(hX + hW / 2 - 1, hY - 3.5, 2, 4);
      ctx.fillRect(hX + hW - 3, hY - 2.5, 2, 3);
      // Center baby rune gem
      ctx.fillStyle = gemAccent;
      ctx.fillRect(hX + hW / 2 - 1, hY + 1, 2, 2);

      // B. Mini Layered Feather Cuirass (2 Overlapping Baby Feather Scales)
      ctx.fillStyle = pal.dark;
      ctx.fillRect(bX - 1, bY - 1, bW + 2, bH + 2);
      ctx.fillStyle = pal.base;
      ctx.fillRect(bX, bY, bW, bH);

      // Overlapping feather scale lines
      ctx.fillStyle = pal.shadow;
      ctx.fillRect(bX + 1, bY + bH - 3, bW - 2, 2);
      ctx.fillStyle = pal.bright;
      ctx.fillRect(bX + 1, bY + 1, bW - 2, 2);
      ctx.fillStyle = accentTrim;
      ctx.fillRect(bX + 1, bY + bH / 2, bW - 2, 1);

      // Center baby hero emblem
      ctx.fillStyle = pal.shine;
      ctx.fillRect(bX + bW / 2 - 1.5, bY + bH / 2 - 1.5, 3, 3);
      ctx.fillStyle = gemAccent;
      ctx.fillRect(bX + bW / 2 - 0.5, bY + bH / 2 - 0.5, 1, 1);

      // C. Mini Feathered Shoulder Winglet
      const wW = 5 * babyScale;
      const wH = 5 * babyScale;
      const wx = -halfW * 0.65;
      const wy = -halfH * 0.15 + walkBounce;

      ctx.fillStyle = pal.dark;
      ctx.fillRect(wx - 1, wy - 1, wW + 2, wH + 2);
      ctx.fillStyle = pal.base;
      ctx.fillRect(wx, wy, wW, wH);
      ctx.fillStyle = accentTrim;
      ctx.fillRect(wx + 1, wy + 1, wW - 2, 1.5);
      ctx.fillRect(wx + 1, wy + wH - 1, wW - 1, 1.5);

      ctx.restore();
      return;
    }

    // =========================================================================
    // 2. POWERFUL LOOKING FEATHER ARMOR (JUVENILE, TEEN, AND ADULT)
    // =========================================================================
    // Moved lower onto chest/torso below eyes, beak, and chin wattles
    const cuirassW = isJuvenile ? 14 : (isTeen ? 18 : 22);
    const maxTorsoH = Math.max(8, Math.round(halfH - 6));
    const cuirassH = Math.min(isJuvenile ? 10 : (isTeen ? 13 : 16), maxTorsoH);
    const cuirassX = -cuirassW / 2 + 0.5;
    const cuirassY = (isJuvenile ? 2.5 : (isTeen ? 3 : 4)) + walkBounce;

    // A. Radiant Enchanted Aura
    if (isDiamond || isGold || hasColorfulSkin) {
      ctx.fillStyle = auraGlow;
      ctx.beginPath();
      ctx.ellipse(0, walkBounce, halfW * 0.95, halfH * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. FEATHERED BATTLE CREST / HELM PLUME (Steady at crown above eyes/comb)
    // ─────────────────────────────────────────────────────────────────────────
    const helmW = isJuvenile ? 13 : (isTeen ? 16 : 19);
    const hx = isJuvenile ? -3.5 : (isTeen ? -4 : -4.5);
    const hy = -halfH - (isJuvenile ? 5.5 : (isTeen ? 7 : 9));

    // Base diadem browplate band
    ctx.fillStyle = pal.dark;
    ctx.fillRect(hx - 2, hy - 1, helmW + 4, 5.5);
    ctx.fillStyle = pal.base;
    ctx.fillRect(hx - 1, hy, helmW + 2, 4);
    ctx.fillStyle = pal.bright;
    ctx.fillRect(hx, hy + 0.5, helmW, 1.5);
    ctx.fillStyle = pal.shine;
    ctx.fillRect(hx + 1, hy + 2, 2, 1.5);
    ctx.fillRect(hx + helmW - 2, hy + 2, 2, 1.5);

    // Sweeping Articulated Metallic Feather Blades Over Comb
    const bladeCount = isJuvenile ? 3 : (isTeen ? 4 : 5);
    for (let b = 0; b < bladeCount; b++) {
      const bOffset = b * (helmW / bladeCount);
      const bladeH = (isJuvenile ? 5 : (isTeen ? 7 : 9)) + (b === 2 ? 3.5 : 1);
      const bx = hx + bOffset;
      const by = hy - bladeH;

      // Dark outline
      ctx.fillStyle = pal.dark;
      ctx.beginPath();
      ctx.moveTo(bx - 1.5, hy);
      ctx.lineTo(bx - 0.5, by - 1);
      ctx.lineTo(bx + 3.5, hy);
      ctx.closePath();
      ctx.fill();

      // Metallic feather blade fill
      ctx.fillStyle = pal.base;
      ctx.beginPath();
      ctx.moveTo(bx - 0.5, hy);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + 2.5, hy);
      ctx.closePath();
      ctx.fill();

      // Illuminated central feather quill & razor tip
      ctx.fillStyle = accentTrim;
      ctx.fillRect(bx, by, 1.5, bladeH);
      ctx.fillStyle = pal.shine;
      ctx.fillRect(bx, by, 1.5, 2);
    }

    // Forehead Inlaid Rune Gem / Royal Diadem Jewel
    const gemW = isJuvenile ? 3 : (isTeen ? 4 : 5);
    ctx.fillStyle = pal.dark;
    ctx.fillRect(hx + helmW / 2 - gemW / 2 - 0.5, hy - 1.5, gemW + 1, gemW + 1);
    ctx.fillStyle = gemAccent;
    ctx.fillRect(hx + helmW / 2 - gemW / 2, hy - 1, gemW, gemW);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(hx + helmW / 2 - 0.5, hy - 0.5, 1.5, 1.5);

    // ─────────────────────────────────────────────────────────────────────────
    // 2. LAYERED ARMORED FEATHER BREASTPLATE (PLUMED CUIRASS ON CHEST)
    // ─────────────────────────────────────────────────────────────────────────
    // A. Gorget Plate (Armored neck collar resting cleanly below beak)
    ctx.fillStyle = pal.dark;
    ctx.fillRect(cuirassX - 2, cuirassY - 2, cuirassW + 4, 4.5);
    ctx.fillStyle = pal.base;
    ctx.fillRect(cuirassX - 1, cuirassY - 1, cuirassW + 2, 3);
    ctx.fillStyle = accentTrim;
    ctx.fillRect(cuirassX, cuirassY - 0.5, cuirassW, 1.5);

    // B. Main Cuirass Outer Border
    ctx.fillStyle = pal.dark;
    ctx.fillRect(cuirassX - 1, cuirassY + 1.5, cuirassW + 2, cuirassH - 1);
    ctx.fillStyle = pal.base;
    ctx.fillRect(cuirassX, cuirassY + 2.5, cuirassW, cuirassH - 2.5);

    // C. Overlapping Sculpted Feather Scale Rows (Avian Scallop / Chevron Plumes)
    const rowCount = isJuvenile ? 2 : 3;
    const scalesPerRow = isJuvenile ? 3 : 4;
    const rowH = Math.max(2, (cuirassH - 4) / rowCount);

    for (let r = 0; r < rowCount; r++) {
      const ry = cuirassY + 3.5 + r * rowH;
      const scaleW = cuirassW / scalesPerRow;

      for (let s = 0; s < scalesPerRow; s++) {
        const sx = cuirassX + s * scaleW;

        // Individual feather scale plate with chevron vane
        ctx.fillStyle = pal.shadow;
        ctx.fillRect(sx + 0.5, ry + rowH - 1.5, scaleW - 1, 1.5);
        ctx.fillStyle = pal.bright;
        ctx.fillRect(sx + 1, ry + 0.5, scaleW - 2, 1.2);

        // Center spine / feather quill on each scale
        ctx.fillStyle = accentTrim;
        ctx.fillRect(sx + scaleW / 2 - 0.5, ry + 0.8, 1, Math.max(1, rowH - 1.5));

        // Micro rivet stud on outer scales
        if (s === 0 || s === scalesPerRow - 1) {
          ctx.fillStyle = pal.shine;
          ctx.fillRect(sx + (s === 0 ? 1 : scaleW - 2), ry + 0.8, 1, 1);
        }
      }
    }

    // D. Lower Plume Vanes (Pointed feather armor tails curving down over lower belly)
    const bottomPoints = isJuvenile ? 3 : (isTeen ? 4 : 5);
    const ptW = cuirassW / bottomPoints;
    for (let p = 0; p < bottomPoints; p++) {
      const px = cuirassX + p * ptW;
      const py = cuirassY + cuirassH;
      ctx.fillStyle = pal.dark;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + ptW / 2, py + 2.5);
      ctx.lineTo(px + ptW, py);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = accentTrim;
      ctx.beginPath();
      ctx.moveTo(px + 0.5, py);
      ctx.lineTo(px + ptW / 2, py + 1.8);
      ctx.lineTo(px + ptW - 0.5, py);
      ctx.closePath();
      ctx.fill();
    }

    // E. Majestic Center Heraldic Crest (Diamond Star / Sun Ruby / Mythril Blade)
    const emW = isJuvenile ? 4.5 : (isTeen ? 6 : 7.5);
    const emH = emW;
    const emX = cuirassX + cuirassW / 2 - emW / 2;
    const emY = cuirassY + 2 + (cuirassH - 2) / 2 - emH / 2;

    ctx.fillStyle = pal.dark;
    ctx.fillRect(emX - 1, emY - 1, emW + 2, emH + 2);
    ctx.fillStyle = pal.shine;
    ctx.fillRect(emX, emY, emW, emH);
    ctx.fillStyle = gemAccent;
    ctx.fillRect(emX + 1, emY + 1, emW - 2, emH - 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(emX + emW / 2 - 0.5, emY + emH / 2 - 0.5, 1.5, 1.5);

    // ─────────────────────────────────────────────────────────────────────────
    // 3. RAZOR FEATHER WING PAULDRONS (Lowered to sit cleanly on shoulder/wing)
    // ─────────────────────────────────────────────────────────────────────────
    const pwX = -halfW * 0.72 - (isAdult ? 3 : 1);
    const pwY = (isJuvenile ? 1.5 : (isTeen ? 2 : 2.5)) + walkBounce;
    const pW = isJuvenile ? 7.5 : (isTeen ? 10 : 12.5);
    const pH = isJuvenile ? 7 : (isTeen ? 9 : 11);

    // Base shoulder plate
    ctx.fillStyle = pal.dark;
    ctx.fillRect(pwX - 1, pwY - 1, pW + 2, pH + 2);
    ctx.fillStyle = pal.base;
    ctx.fillRect(pwX, pwY, pW, pH);
    ctx.fillStyle = pal.bright;
    ctx.fillRect(pwX + 1, pwY + 1, pW - 2, 2);
    ctx.fillStyle = pal.shine;
    ctx.fillRect(pwX + 1.5, pwY + 1.5, 2, 1.5);

    // Trailing razor flight-feather blades cascading off shoulder
    const wFeatherCount = isJuvenile ? 2 : (isTeen ? 3 : 4);
    for (let wf = 0; wf < wFeatherCount; wf++) {
      const fx = pwX - (wf + 1) * (isAdult ? 2.8 : 2.2);
      const fy = pwY + 2 + wf * (isAdult ? 2.8 : 2.4);
      const fLen = (isAdult ? 8 : 6.5) - wf * 1.1;

      ctx.fillStyle = pal.dark;
      ctx.fillRect(fx - 0.5, fy - 0.5, fLen + 1, 2.5);
      ctx.fillStyle = pal.base;
      ctx.fillRect(fx, fy, fLen, 1.8);
      ctx.fillStyle = accentTrim;
      ctx.fillRect(fx, fy, 2, 1.8);
      ctx.fillStyle = pal.quill;
      ctx.fillRect(fx + 2, fy + 0.5, fLen - 2, 0.8);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. ARMORED FEATHER GREAVES & WINGED ANKLE SPURS (Teen & Adult)
    // ─────────────────────────────────────────────────────────────────────────
    if (isTeen || isAdult) {
      const gW = isAdult ? 6 : 5;
      const gH = isAdult ? 7 : 5.5;
      const gy = halfH - (isAdult ? 6 : 5);

      [-halfW * 0.35, halfW * 0.2].forEach(lx => {
        // Main shinguard plate
        ctx.fillStyle = pal.dark;
        ctx.fillRect(lx - 1, gy - 1, gW + 2, gH + 2);
        ctx.fillStyle = pal.base;
        ctx.fillRect(lx, gy, gW, gH);
        ctx.fillStyle = pal.bright;
        ctx.fillRect(lx, gy, 2, gH);
        ctx.fillStyle = accentTrim;
        ctx.fillRect(lx + 1, gy + 1, gW - 2, 1.5);

        // Flared winged feather fin curving back from ankle
        ctx.fillStyle = pal.dark;
        ctx.fillRect(lx - 3.5, gy + 2, 3, 3);
        ctx.fillStyle = pal.bright;
        ctx.fillRect(lx - 3, gy + 2.5, 2.5, 2);
        ctx.fillStyle = pal.shine;
        ctx.fillRect(lx - 3, gy + 2.5, 1, 1);

        // Rooster armored fighting spur cap
        if (isRooster) {
          ctx.fillStyle = pal.dark;
          ctx.fillRect(lx - 4.5, gy + gH - 3, 4, 3);
          ctx.fillStyle = pal.shine;
          ctx.fillRect(lx - 4, gy + gH - 2.5, 3, 2);
        }
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. ARMORED TAIL COVERTS / SICKLE PLUME BASE (Teen & Adult Roosters/Hens)
    // ─────────────────────────────────────────────────────────────────────────
    if (isTeen || isAdult) {
      const tx = -halfW * 0.85;
      const ty = (isTeen ? 0.5 : 1.5) + walkBounce;
      const tW = isAdult ? 8 : 6;
      const tH = isAdult ? 7 : 5;

      ctx.fillStyle = pal.dark;
      ctx.fillRect(tx - 1, ty - 1, tW + 2, tH + 2);
      ctx.fillStyle = pal.base;
      ctx.fillRect(tx, ty, tW, tH);
      ctx.fillStyle = accentTrim;
      ctx.fillRect(tx + 1, ty + 1, tW - 2, 1.5);
      ctx.fillStyle = pal.shine;
      ctx.fillRect(tx + 1, ty + tH - 2, 2, 1.5);
    }

    ctx.restore();
  }

  // --- Intro Cinematic: Cracking & Hatching Inside Egg & Chick Emerging ---

  public renderEggIntro(
    progress: number, 
    time: number, 
    gender: ChickenGender = 'rooster', 
    hasCompletedGame: boolean = false,
    skinId?: string
  ) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Wooden chicken coop barn background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#451a03');
    bgGrad.addColorStop(0.5, '#78350f');
    bgGrad.addColorStop(1, '#290c02');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Barn wood planks
    ctx.strokeStyle = '#290c02';
    ctx.lineWidth = 3;
    for (let x = 0; x < w; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Wooden rafters overhead
    ctx.fillStyle = '#290c02';
    ctx.fillRect(0, 30, w, 20);

    // Warm glowing barn lantern
    const lanternX = w * 0.18;
    const lanternY = 90;
    ctx.fillStyle = 'rgba(253, 224, 71, 0.2)';
    ctx.beginPath();
    ctx.arc(lanternX, lanternY, 80 + Math.sin(time * 3) * 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(lanternX - 10, lanternY - 14, 20, 28);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(lanternX - 6, lanternY - 10, 12, 20);

    // Hay Nest
    const eggX = w / 2;
    const eggY = h * 0.58;

    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.ellipse(eggX, eggY + 38, 70, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fde047';
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const hx = eggX + Math.cos(angle) * 55;
      const hy = eggY + 36 + Math.sin(angle) * 16;
      ctx.fillRect(hx, hy, 8, 3);
    }

    // Egg wobble from chick pecking inside
    const isWobbling = progress > 0.15 && progress < 0.62;
    const wobbleAngle = isWobbling ? Math.sin(time * 28) * 0.15 : 0;

    // Render Egg / Hatching
    if (progress < 0.62) {
      ctx.save();
      ctx.translate(eggX, eggY);
      ctx.rotate(wobbleAngle);

      // Egg shell
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(0, 0, 34, 44, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shadow underside
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.ellipse(4, 10, 26, 32, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Glowing peck cracks from inside
      if (progress > 0.28) {
        ctx.strokeStyle = '#f59e0b'; // golden light shining through crack
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(-10, -4);
        ctx.lineTo(2, 6);
        ctx.lineTo(-4, 18);
        ctx.stroke();

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-10, -4);
        ctx.lineTo(2, 6);
        ctx.lineTo(-4, 18);
        ctx.stroke();
      }

      if (progress > 0.44) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(8, -14);
        ctx.lineTo(16, 2);
        ctx.lineTo(6, 14);
        ctx.lineTo(-6, 8);
        ctx.stroke();

        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(8, -14);
        ctx.lineTo(16, 2);
        ctx.lineTo(6, 14);
        ctx.lineTo(-6, 8);
        ctx.stroke();
      }

      ctx.restore();

    } else {
      // Hatched! Shell bursts open & baby chick emerges!
      // Bottom half of broken eggshell
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(eggX, eggY + 16, 34, 24, 0, 0, Math.PI);
      ctx.fill();

      // Jagged teeth
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(eggX - 34, eggY + 16);
      ctx.lineTo(eggX - 22, eggY + 8);
      ctx.lineTo(eggX - 10, eggY + 16);
      ctx.lineTo(eggX + 4, eggY + 6);
      ctx.lineTo(eggX + 18, eggY + 16);
      ctx.lineTo(eggX + 34, eggY + 16);
      ctx.fill();

      // Flying shell shards
      const shardDist = (progress - 0.62) * 90;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(eggX - 35 - shardDist * 0.7, eggY - 10 - shardDist * 0.5, 8, 6);
      ctx.fillRect(eggX + 35 + shardDist * 0.7, eggY - 8 - shardDist * 0.4, 7, 7);

      // Detailed Baby Chick emerging with identical high-fidelity player model & crown!
      const chickPopY = eggY - 8 - Math.min(28, (progress - 0.62) * 95);

      this.renderCharacterModel(
        ctx,
        eggX,
        chickPopY,
        gender || 'rooster',
        'baby',
        'none',
        'none',
        {
          facing: 'right',
          scale: 1.6,
          time,
          hasCrown: hasCompletedGame,
          isJumping: true,
          isMoving: false,
          skin: skinId,
        }
      );

      // Top eggshell cap flying off
      ctx.save();
      const capY = eggY - 48 - (progress - 0.65) * 45;
      ctx.translate(w / 2 + 18, capY);
      ctx.rotate(0.4);
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(0, 0, 22, 14, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Intro story banner text
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fef08a';
    ctx.font = '700 20px "Silkscreen", monospace';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 8;
    if (hasCompletedGame) {
      ctx.fillText("★ THE REBORN ROYAL CHAMPION ★", w / 2, h * 0.20);
      ctx.font = '700 13px "Silkscreen", monospace';
      ctx.fillStyle = '#facc15';
      ctx.fillText("Crowned Victor of the Cockatrice Summit", w / 2, h * 0.25);
    } else {
      ctx.fillText("A Little Chick's Big Adventure Begins!", w / 2, h * 0.22);
    }

    // 8-Bit 1% -> 100% Loading Bar; only reveal Tap Screen button once at 100%!
    const pct = Math.max(1, Math.min(100, Math.round(progress * 100)));
    const barW = Math.min(300, w - 48);
    const barH = 18;
    const barX = (w - barW) / 2;
    const barY = h * 0.80;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(barX - 3, barY - 3, barW + 6, barH + 6);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX - 2, barY - 2, barW + 4, barH + 4);

    const fillW = Math.round(((barW - 4) * pct) / 100);
    ctx.fillStyle = pct >= 100 ? '#4ade80' : '#f59e0b';
    ctx.fillRect(barX + 2, barY + 2, fillW, barH - 4);
    ctx.fillStyle = pct >= 100 ? '#bbf7d0' : '#fef08a';
    ctx.fillRect(barX + 2, barY + 2, fillW, 4);

    ctx.font = '700 10px "Silkscreen", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(pct >= 100 ? "READY! 100%" : `LOADING WORLD 1... ${pct}%`, w / 2, barY + 13);

    if (pct >= 100) {
      const btnW = Math.min(320, w - 36);
      const btnH = 34;
      const btnX = (w - btnW) / 2;
      const btnY = barY + barH + 14;
      const pulse = Math.sin(time * 6) > 0 ? 1 : 0;

      ctx.fillStyle = '#020617';
      ctx.fillRect(btnX + 3, btnY + 3, btnW, btnH);
      ctx.fillStyle = pulse ? '#facc15' : '#eab308';
      ctx.fillRect(btnX, btnY, btnW, btnH);
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(btnX, btnY, btnW, btnH);

      ctx.font = '700 11px "Silkscreen", monospace';
      ctx.fillStyle = '#0f172a';
      ctx.shadowBlur = 0;
      ctx.fillText("▶ TAP SCREEN TO PLAY ◀", w / 2, btnY + 21);
    }
    ctx.restore();
  }

  // --- Ending Cinematic: Mount Cluckmore Summit Celebration & Epilogue ---

  public renderEndingCutscene(
    progress: number, 
    time: number, 
    gender: ChickenGender = 'rooster',
    skinId?: string,
    armor: ArmorType = 'gold',
    sword: SwordType = 'gold'
  ) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. Glorious Sunrise Sky Gradient over Mount Cluckmore
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#1e1b4b'); // deep indigo twilight top
    skyGrad.addColorStop(0.25, '#431407'); // rich ember dawn
    skyGrad.addColorStop(0.55, '#ea580c'); // vibrant orange horizon
    skyGrad.addColorStop(0.75, '#fde047'); // golden yellow sunrise
    skyGrad.addColorStop(1, '#15803d'); // lush green lower valley
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Radiant Solar Beams shining from behind the mountain
    const sunX = w * 0.5;
    const sunY = h * 0.48;

    ctx.save();
    ctx.translate(sunX, sunY);
    ctx.rotate(time * 0.15);
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      ctx.fillStyle = (i % 2 === 0) ? 'rgba(254, 240, 138, 0.18)' : 'rgba(253, 224, 71, 0.08)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle - 0.1) * (w + h), Math.sin(angle - 0.1) * (w + h));
      ctx.lineTo(Math.cos(angle + 0.1) * (w + h), Math.sin(angle + 0.1) * (w + h));
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Golden sun orb rising
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(sunX, sunY - 10, 48, 0, Math.PI * 2);
    ctx.fill();

    // 3. Mountain Ranges: Silhouettes and Mount Cluckmore Peak
    ctx.fillStyle = '#312e81';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.65);
    ctx.lineTo(w * 0.22, h * 0.42);
    ctx.lineTo(w * 0.48, h * 0.62);
    ctx.lineTo(w * 0.78, h * 0.38);
    ctx.lineTo(w, h * 0.6);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Midground alpine crags
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.72);
    ctx.lineTo(w * 0.15, h * 0.52);
    ctx.lineTo(w * 0.35, h * 0.68);
    ctx.lineTo(w * 0.85, h * 0.48);
    ctx.lineTo(w, h * 0.7);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Mount Cluckmore Summit in foreground
    const summitX = w * 0.5;
    const summitY = h * 0.62;

    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.moveTo(summitX - 180, h);
    ctx.lineTo(summitX - 70, summitY + 20);
    ctx.lineTo(summitX + 70, summitY + 20);
    ctx.lineTo(summitX + 180, h);
    ctx.closePath();
    ctx.fill();

    // Lush golden-lit mossy summit meadow platform
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(summitX - 90, summitY + 18, 180, 18);
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(summitX - 90, summitY + 18, 180, 4);

    // Golden Roost Monument Pedestal
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(summitX - 40, summitY - 2, 80, 20);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(summitX - 42, summitY - 4, 84, 4);
    ctx.fillRect(summitX - 35, summitY + 14, 70, 4);

    // Carved Golden Rooster emblem on pedestal
    ctx.fillStyle = '#78350f';
    ctx.font = '700 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MOUNT CLUCKMORE', summitX, summitY + 10);

    // 4. The Hero Chicken: In Full Masterwork Golden Battle Armor, Holding the Golden Sunblade Skyward!
    const heroY = summitY - 26;

    ctx.save();
    ctx.translate(summitX, heroY);

    // Triumphant bobbing
    const heroBob = Math.sin(time * 4) * 2;
    ctx.translate(0, heroBob);

    // Render the high-definition Adult Rooster / Hen model in full glory!
    // Old sword is removed so only the glorious held-aloft golden sword is displayed!
    this.renderCharacterModel(
      ctx,
      0,
      0,
      gender,
      'adult',
      armor || 'gold',
      'none',
      {
        facing: 'right',
        scale: 1.15,
        time,
        isAttacking: false,
        isMoving: false,
        isJumping: false,
        skin: skinId,
      }
    );

    // Held-Aloft Legendary Netherite Sword that Sam gave us, blazing with cosmic purple celestial light!
    ctx.save();
    ctx.translate(16, -12);
    ctx.rotate(-0.25); // pointed straight up into the heavens

    // Radiating purple blade aura
    const bladeAura = ctx.createRadialGradient(8, -24, 6, 8, -24, 52);
    bladeAura.addColorStop(0, 'rgba(232, 121, 249, 0.9)');
    bladeAura.addColorStop(0.35, 'rgba(192, 132, 252, 0.55)');
    bladeAura.addColorStop(0.7, 'rgba(126, 34, 206, 0.25)');
    bladeAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = bladeAura;
    ctx.beginPath();
    ctx.arc(8, -24, 52, 0, Math.PI * 2);
    ctx.fill();

    // Netherite Blade Body (Matte obsidian charcoal black)
    ctx.fillStyle = '#18181b';
    ctx.fillRect(5.5, -46, 7, 46);
    // Left shadow bevel (Abyssal pure black)
    ctx.fillStyle = '#09090b';
    ctx.fillRect(5.5, -46, 3, 46);
    // Right sharp razor edge (Radiant purple shine)
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(10.5, -46, 2, 46);
    // Central fuller ridge pulsing with purple energy
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(8.2, -44, 1.6, 42);

    // Stepped Blade Tip pointing into the heavens
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.moveTo(5.5, -46);
    ctx.lineTo(9, -57);
    ctx.lineTo(12.5, -46);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.moveTo(6.5, -46);
    ctx.lineTo(9, -55);
    ctx.lineTo(11.5, -46);
    ctx.closePath();
    ctx.fill();

    // Radiant purple gleam at tip
    ctx.fillStyle = '#e879f9';
    ctx.beginPath();
    ctx.moveTo(9, -55);
    ctx.lineTo(11.5, -46);
    ctx.lineTo(9.5, -46);
    ctx.closePath();
    ctx.fill();

    // Heavy Netherite Crossguard
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-1, 0, 20, 5.5);
    ctx.fillStyle = '#27272a';
    ctx.fillRect(0, 1, 18, 3.5);
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(2, 1.5, 14, 2);
    // Guard gem studs
    ctx.fillStyle = '#e879f9';
    ctx.fillRect(8, 1, 2, 3);
    ctx.fillRect(0.5, 1.5, 2, 2);
    ctx.fillRect(15.5, 1.5, 2, 2);

    // Hilt Grip with purple crying obsidian bindings
    ctx.fillStyle = '#09090b';
    ctx.fillRect(7, 5.5, 4, 8);
    ctx.fillStyle = '#7e22ce';
    ctx.fillRect(7, 7.5, 4, 1.5);
    ctx.fillRect(7, 10.5, 4, 1.5);

    // Pommel with crying obsidian purple gem
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.arc(9, 16.5, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(7.5, 15, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, 15.5, 1.5, 1.5);

    // Floating purple star sparkles around blade
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, -38, 2, 2);
    ctx.fillRect(6, -26, 2, 2);
    ctx.fillStyle = '#e879f9';
    ctx.fillRect(12, -18, 2.5, 2.5);
    ctx.fillRect(4, -34, 2, 2);

    ctx.restore();

    ctx.restore(); // end hero translate

    // 5. Cheering Baby Chick Companions bouncing with joy on the summit
    const chick1X = summitX - 58;
    const chick2X = summitX + 58;
    const chick1Y = summitY - 4 - Math.abs(Math.sin(time * 6) * 14);
    const chick2Y = summitY - 4 - Math.abs(Math.cos(time * 6) * 14);

    // Left chick (Rooster Baby Chick cheering)
    ctx.save();
    ctx.translate(chick1X, chick1Y);
    this.renderCharacterModel(ctx, 0, 0, 'rooster', 'baby', 'none', 'none', {
      facing: 'right',
      scale: 0.9,
      time: time + 1,
      isMoving: true,
      walkAnimTimer: time * 2,
    });
    // Party cone hat!
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.moveTo(-4, -14);
    ctx.lineTo(0, -26);
    ctx.lineTo(4, -14);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Right chick (Hen Baby Chick cheering)
    ctx.save();
    ctx.translate(chick2X, chick2Y);
    this.renderCharacterModel(ctx, 0, 0, 'hen', 'baby', 'none', 'none', {
      facing: 'left',
      scale: 0.9,
      time: time + 2,
      isMoving: true,
      walkAnimTimer: time * 2,
    });
    // Party cone hat!
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(-4, -14);
    ctx.lineTo(0, -26);
    ctx.lineTo(4, -14);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 6. Confetti Shower
    const confettiColors = ['#f43f5e', '#38bdf8', '#facc15', '#a855f7', '#22c55e', '#ffffff'];
    for (let c = 0; c < 36; c++) {
      const cx = (Math.sin(c * 99 + time * 0.8) * 0.5 + 0.5) * w;
      const cy = ((time * 80 + c * 35) % (h * 0.85));
      ctx.fillStyle = confettiColors[c % confettiColors.length];
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time * 4 + c);
      ctx.fillRect(-3, -2, 6, 4);
      ctx.restore();
    }

    // 7. Firework Bursts in the sky
    const fwColors = ['#facc15', '#ec4899', '#38bdf8', '#4ade80'];
    for (let fw = 0; fw < 3; fw++) {
      const fProgress = (time * 0.7 + fw * 0.33) % 1;
      const fX = w * (0.2 + fw * 0.3);
      const fY = h * (0.18 + (fw % 2) * 0.12);
      const fColor = fwColors[fw % fwColors.length];

      if (fProgress < 0.8) {
        const radius = fProgress * 55;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - fProgress * 1.2);
        ctx.fillStyle = fColor;
        for (let s = 0; s < 12; s++) {
          const sAngle = (s / 12) * Math.PI * 2;
          const px = fX + Math.cos(sAngle) * radius;
          const py = fY + Math.sin(sAngle) * radius;
          ctx.fillRect(px - 2, py - 2, 4, 4);
        }
        ctx.restore();
      }
    }

    // 8. Epic Cinematic Overlay: Title, "You Did It!" sign, "Thanks for Playing" sign & Return Button
    ctx.save();
    ctx.textAlign = 'center';

    // Title banner: "★ VICTORY OF THE ROOST ★"
    ctx.fillStyle = '#fef08a';
    ctx.font = '900 24px "Silkscreen", monospace';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 12;
    ctx.fillText("★ VICTORY OF THE ROOST ★", w / 2, Math.max(30, h * 0.105));

    // Sign replacing "All 30 Stages...": "You Did It!"
    const didItW = Math.min(220, w - 24);
    const didItH = 34;
    const didItX = (w - didItW) / 2;
    const didItY = Math.max(56, h * 0.155);

    // Pixel shadow
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(didItX + 3, didItY + 3, didItW, didItH);

    // Wooden / gold frame
    ctx.fillStyle = '#78350f';
    ctx.fillRect(didItX, didItY, didItW, didItH);

    // Gold highlight border
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(didItX + 2, didItY + 2, didItW - 4, didItH - 4);

    // Dark sign plate
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(didItX + 4, didItY + 4, didItW - 8, didItH - 8);

    // Corner pixel rivets
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(didItX + 6, didItY + 6, 3, 3);
    ctx.fillRect(didItX + didItW - 9, didItY + 6, 3, 3);
    ctx.fillRect(didItX + 6, didItY + didItH - 9, 3, 3);
    ctx.fillRect(didItX + didItW - 9, didItY + didItH - 9, 3, 3);

    // "You Did It!" text
    ctx.fillStyle = '#fde047';
    ctx.font = '700 15px "Silkscreen", monospace';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 6;
    ctx.fillText("You Did It!", w / 2, didItY + 23);

    // Down sign: "Thanks for Playing" (Epilogue removed)
    const thanksW = Math.min(290, w - 24);
    const thanksH = 38;
    const thanksX = (w - thanksW) / 2;
    const thanksY = Math.min(h - 100, h * 0.80);

    // Outer pixel shadow
    ctx.fillStyle = '#090d16';
    ctx.fillRect(thanksX + 4, thanksY + 4, thanksW, thanksH);

    // Wooden / gold border
    ctx.fillStyle = '#92400e';
    ctx.fillRect(thanksX, thanksY, thanksW, thanksH);

    // Inner gold bevel
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(thanksX + 2, thanksY + 2, thanksW - 4, thanksH - 4);

    // Deep slate plate
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(thanksX + 4, thanksY + 4, thanksW - 8, thanksH - 8);

    // Corner rivets
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(thanksX + 7, thanksY + 7, 3, 3);
    ctx.fillRect(thanksX + thanksW - 10, thanksY + 7, 3, 3);
    ctx.fillRect(thanksX + 7, thanksY + thanksH - 10, 3, 3);
    ctx.fillRect(thanksX + thanksW - 10, thanksY + thanksH - 10, 3, 3);

    // "Thanks for Playing" text
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 14px "Silkscreen", monospace';
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 8;
    ctx.fillText("★ Thanks for Playing ★", w / 2, thanksY + 24);

    // Sign button right below: "TAP SCREEN TO RETURN TO MENU" (only once celebration has finished!)
    if (progress >= 0.85) {
      const btnW = Math.min(340, w - 24);
      const btnH = 38;
      const btnX = (w - btnW) / 2;
      const btnY = thanksY + thanksH + 10;

      const pulse = Math.sin(time * 5) * 2;

      // Button pixel shadow
      ctx.fillStyle = '#020617';
      ctx.fillRect(btnX + 4, btnY + 4, btnW, btnH);

      // Button pixel frame (emerald arcade)
      ctx.fillStyle = '#047857';
      ctx.fillRect(btnX, btnY, btnW, btnH);

      // Top/left highlight
      ctx.fillStyle = '#34d399';
      ctx.fillRect(btnX + 2, btnY + 2, btnW - 4, 3);
      ctx.fillRect(btnX + 2, btnY + 2, 3, btnH - 4);

      // Bottom/right shadow
      ctx.fillStyle = '#065f46';
      ctx.fillRect(btnX + 2, btnY + btnH - 5, btnW - 4, 3);
      ctx.fillRect(btnX + btnW - 5, btnY + 2, 3, btnH - 4);

      // Button body
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(btnX + 5, btnY + 5, btnW - 10, btnH - 10);

      // Button text
      ctx.fillStyle = '#fef08a';
      ctx.font = '700 11px "Silkscreen", monospace';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.fillText("▶ TAP SCREEN TO RETURN TO MENU ◀", w / 2, btnY + 24 + pulse * 0.4);
    }

    ctx.restore();
  }

  // --- Biome-Specific Ambient Atmospheric Effects (Subtle, Non-Weather Environmental Life) ---

  public renderBiomeAmbientEffects(
    theme: LevelConfig['theme'],
    camera: Camera,
    time: number,
    isSkyBlue = false
  ) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const wrap = (val: number, span: number) => ((val % span) + span) % span;

    ctx.save();

    if (theme === 'jungle') {
      // Soft emerald dappled canopy sunbeams
      for (let i = 0; i < 3; i++) {
        const beamX = wrap(i * 340 - camera.x * 0.14 + Math.sin(time * 0.35 + i) * 18, w + 260) - 130;
        const grad = ctx.createLinearGradient(beamX, 0, beamX + 70, h * 0.78);
        grad.addColorStop(0, 'rgba(134, 239, 172, 0.065)');
        grad.addColorStop(1, 'rgba(134, 239, 172, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(beamX, 0);
        ctx.lineTo(beamX + 64, 0);
        ctx.lineTo(beamX + 150, h * 0.82);
        ctx.lineTo(beamX + 52, h * 0.82);
        ctx.closePath();
        ctx.fill();
      }

      // Bioluminescent jungle fireflies pulsing softly in orbital drift
      for (let i = 0; i < 16; i++) {
        const seed = i * 97.3;
        const baseX = wrap(seed * 23 - camera.x * (0.28 + (i % 3) * 0.12) + Math.sin(time * (0.7 + (i % 4) * 0.2) + seed) * 28, w + 80) - 40;
        const baseY = 95 + ((i * 53) % Math.max(120, h - 170)) + Math.cos(time * (0.9 + (i % 3) * 0.25) + seed) * 16;
        const pulse = 0.28 + 0.72 * Math.max(0, Math.sin(time * (2.2 + (i % 4) * 0.55) + seed));
        const glowR = 5.5 + pulse * 4;

        const glow = ctx.createRadialGradient(baseX, baseY, 0.5, baseX, baseY, glowR);
        glow.addColorStop(0, `rgba(217, 249, 157, ${(0.55 * pulse).toFixed(3)})`);
        glow.addColorStop(0.5, `rgba(132, 204, 22, ${(0.22 * pulse).toFixed(3)})`);
        glow.addColorStop(1, 'rgba(132, 204, 22, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(baseX, baseY, glowR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(254, 249, 195, ${(0.85 * pulse).toFixed(3)})`;
        ctx.fillRect(Math.round(baseX - 1), Math.round(baseY - 1), 2, 2);
      }

      // Gentle tumbling jungle leaves
      for (let i = 0; i < 5; i++) {
        const lx = wrap(i * 210 - camera.x * 0.45 + time * (16 + i * 3) + Math.sin(time * 1.8 + i) * 24, w + 60) - 30;
        const ly = wrap(i * 118 + time * (14 + (i % 3) * 4), h - 70);
        const rot = time * 1.6 + i * 1.4;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(rot);
        ctx.fillStyle = i % 2 === 0 ? 'rgba(34, 197, 94, 0.52)' : 'rgba(101, 163, 13, 0.48)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 5, 2.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    } else if (theme === 'storm' || theme === 'snowy') {
      // Subtle high-altitude aurora shimmer curtains along the upper arctic horizon
      for (let band = 0; band < 2; band++) {
        const yBase = 48 + band * 26;
        const grad = ctx.createLinearGradient(0, yBase - 18, 0, yBase + 32);
        if (band === 0) {
          grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
          grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.085)');
          grad.addColorStop(1, 'rgba(52, 211, 153, 0)');
        } else {
          grad.addColorStop(0, 'rgba(167, 139, 250, 0)');
          grad.addColorStop(0.5, 'rgba(167, 139, 250, 0.065)');
          grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, yBase + 32);
        for (let x = 0; x <= w; x += 36) {
          const wave = Math.sin(x * 0.008 + time * (0.55 + band * 0.2) + band * 2.1) * 12;
          ctx.lineTo(x, yBase + wave);
        }
        ctx.lineTo(w, yBase + 32);
        ctx.closePath();
        ctx.fill();
      }

      // Delicate twinkling 4-point frost crystal glints (crystalline diamond dust, NOT a snowstorm)
      for (let i = 0; i < 16; i++) {
        const seed = i * 73.1;
        const gx = wrap(seed * 19 - camera.x * (0.22 + (i % 3) * 0.08) + Math.sin(time * 0.5 + seed) * 14, w + 40) - 20;
        const gy = 60 + ((i * 61) % Math.max(120, h - 140)) + Math.cos(time * 0.65 + seed) * 8;
        const twinkle = Math.max(0, Math.sin(time * (2.6 + (i % 4) * 0.65) + seed));
        if (twinkle < 0.2) continue;
        const alpha = (twinkle - 0.2) * 0.85;
        const arm = 2 + twinkle * 3;
        ctx.fillStyle = i % 3 === 0
          ? `rgba(186, 230, 253, ${alpha.toFixed(3)})`
          : `rgba(248, 250, 252, ${alpha.toFixed(3)})`;
        ctx.fillRect(Math.round(gx - arm), Math.round(gy), Math.round(arm * 2 + 1), 1.2);
        ctx.fillRect(Math.round(gx), Math.round(gy - arm), 1.2, Math.round(arm * 2 + 1));
      }
    } else if (theme === 'fields' && !isSkyBlue) {
      // Cursed Boss Lair: glowing volcanic hearth embers rising slowly across the arena
      for (let i = 0; i < 18; i++) {
        const seed = i * 67.7;
        const ex = wrap(seed * 21 - camera.x * 0.35 + Math.sin(time * (1.2 + (i % 3) * 0.4) + seed) * 22, w + 40) - 20;
        const ey = h - wrap(seed * 17 + time * (24 + (i % 5) * 8), h + 40) + 10;
        const flicker = 0.45 + 0.55 * Math.sin(time * 7 + seed);
        const sz = i % 4 === 0 ? 3 : 2;

        ctx.fillStyle = i % 3 === 0
          ? `rgba(253, 224, 71, ${(0.78 * flicker).toFixed(3)})`
          : `rgba(249, 115, 22, ${(0.72 * flicker).toFixed(3)})`;
        ctx.fillRect(Math.round(ex), Math.round(ey), sz, sz);
      }
    } else {
      // Plains / Coop / Trail / Juvenile / Restored Green Fields: warm sunlight beams, golden pollen & drifting petals/dandelions
      for (let i = 0; i < 2; i++) {
        const beamX = wrap(120 + i * 440 - camera.x * 0.1, w + 300) - 120;
        const grad = ctx.createLinearGradient(beamX, 0, beamX + 110, h * 0.72);
        grad.addColorStop(0, 'rgba(254, 249, 195, 0.06)');
        grad.addColorStop(1, 'rgba(254, 249, 195, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(beamX, 0);
        ctx.lineTo(beamX + 82, 0);
        ctx.lineTo(beamX + 190, h * 0.75);
        ctx.lineTo(beamX + 70, h * 0.75);
        ctx.closePath();
        ctx.fill();
      }

      // Floating sunlit pollen motes & fluffy dandelion seeds
      for (let i = 0; i < 14; i++) {
        const seed = i * 83.4;
        const mx = wrap(seed * 19 - camera.x * (0.25 + (i % 3) * 0.09) + time * (10 + (i % 4) * 3.5), w + 50) - 25;
        const my = 80 + ((i * 57) % Math.max(120, h - 155)) + Math.sin(time * (1.1 + (i % 3) * 0.3) + seed) * 14;
        const glowAlpha = 0.32 + 0.38 * Math.sin(time * 2.1 + seed);

        if (theme === 'fields' && isSkyBlue && i % 3 === 0) {
          // Restored sanctuary floating flower petals
          const petalColors = ['rgba(251, 113, 133, 0.65)', 'rgba(253, 224, 71, 0.68)', 'rgba(255, 255, 255, 0.65)'];
          ctx.save();
          ctx.translate(mx, my);
          ctx.rotate(time * 1.4 + seed);
          ctx.fillStyle = petalColors[i % petalColors.length];
          ctx.fillRect(-2.5, -1.5, 5, 3);
          ctx.restore();
        } else if (i % 4 === 0) {
          // Fluffy dandelion seed puff
          ctx.fillStyle = `rgba(255, 255, 255, ${(glowAlpha + 0.15).toFixed(3)})`;
          ctx.fillRect(Math.round(mx - 1), Math.round(my - 1), 3, 2);
          ctx.fillStyle = `rgba(254, 240, 138, ${glowAlpha.toFixed(3)})`;
          ctx.fillRect(Math.round(mx), Math.round(my + 1), 1, 2);
        } else {
          // Warm golden sunlit pollen mote
          ctx.fillStyle = `rgba(254, 240, 138, ${glowAlpha.toFixed(3)})`;
          ctx.fillRect(Math.round(mx), Math.round(my), 2, 2);
        }
      }
    }

    ctx.restore();
  }

  // --- Particles & Floating Text ---

  public renderParticles(particles: Particle[], camera: Camera) {
    const ctx = this.ctx;
    particles.forEach(p => {
      const sx = p.x - camera.x;
      const sy = p.y - camera.y;
      if (sx < -20 || sx > this.canvas.width + 20) return;

      const sz = Math.max(2, Math.round(p.size));
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / p.maxLife));
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(sx - sz / 2), Math.round(sy - sz / 2), sz, sz);
      ctx.restore();
    });
  }

  public renderFloatingTexts(texts: FloatingText[], camera: Camera) {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = '700 12px "Silkscreen", monospace';
    ctx.textAlign = 'center';

    texts.forEach(ft => {
      const sx = ft.x - camera.x;
      const sy = ft.y - camera.y;
      ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
      ctx.fillStyle = ft.color;
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, sx, sy);
    });
    ctx.restore();
  }
}

export { GameRenderer as Renderer };
