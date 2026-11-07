import { 
  PlayerState, Platform, Coin, TreasureChest, Checkpoint,
  VolcanoHazard, BoulderHazard, ThundercloudHazard, Enemy, Particle, FloatingText, Camera, LevelConfig,
  ChickenGender, ArmorType, SwordType, GrowthStage, CockatriceBoss, BossFireProjectile, SilkieSamFriend
} from './types';
import { getSkinPalette } from './skins';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

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

      // MONKEYS ON SOME OF THE TREES!
      if (i % 2 === 0 || i === 3) {
        this.renderJungleMonkey(tx, ty - 22, time, levelId === 19 && !isBossDefeated, i, isBossDefeated);
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

  // Render Jungle Monkey on Tree Branch (World 4)
  private renderJungleMonkey(tx: number, ty: number, time: number, isScared: boolean, treeIndex: number, isCheering: boolean = false) {
    const ctx = this.ctx;
    ctx.save();
    
    // Position offset on branch
    const branchOffset = (treeIndex % 2 === 0) ? 14 : -14;
    const mx = tx + branchOffset;
    const shudder = isScared ? Math.sin(time * 35 + treeIndex * 2) * 1.5 : 0;
    const cheerHop = isCheering ? Math.abs(Math.sin(time * 8 + treeIndex * 1.7)) * 7 : 0;
    const my = ty + 4 + shudder - cheerHop;

    ctx.translate(mx, my);
    const facing = (treeIndex % 2 === 0) ? -1 : 1;
    ctx.scale(facing, 1);

    // 1. Curly Prehensile Tail
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const tailSpeed = isCheering ? 12 : (isScared ? 8 : 3);
    const tailWiggle = Math.sin(time * tailSpeed + treeIndex) * (isScared ? 8 : (isCheering ? 7 : 4));
    ctx.moveTo(-6, 2);
    ctx.bezierCurveTo(-14, 0 + tailWiggle, -18, -10, -12, -14);
    ctx.stroke();

    // 2. Brown Fur Body
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Lighter belly patch
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.ellipse(2, 1, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Monkey Head
    const headY = isScared ? -9 : -8;
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(0, headY, 6.5, 0, Math.PI * 2);
    ctx.fill();

    // Round ears
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(-5.5, headY - 1, 2.5, 0, Math.PI * 2);
    ctx.arc(5.5, headY - 1, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(-5.5, headY - 1, 1.4, 0, Math.PI * 2);
    ctx.arc(5.5, headY - 1, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Tan facial heart mask
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(-1.8, headY - 1, 3, 0, Math.PI * 2);
    ctx.arc(1.8, headY - 1, 3, 0, Math.PI * 2);
    ctx.arc(0, headY + 1.5, 3.5, 0, Math.PI * 2);
    ctx.fill();

    if (isCheering) {
      // VICTORY CHEERING MONKEY (Only at World 4 when boss is defeated!)
      // Happy joyful crescent eyes (^ ^)
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(-2.2, headY - 1, 1.6, 0.2, Math.PI - 0.2);
      ctx.arc(2.2, headY - 1, 1.6, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // Big happy open smile with cheerful tongue
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.arc(0, headY + 1.8, 2.8, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#f472b6'; // pink tongue
      ctx.beginPath();
      ctx.arc(0, headY + 3.2, 1.4, 0, Math.PI);
      ctx.fill();

      // Cute pink blushing cheeks
      ctx.fillStyle = 'rgba(244, 114, 182, 0.65)';
      ctx.beginPath();
      ctx.arc(-4, headY + 1.2, 1.3, 0, Math.PI * 2);
      ctx.arc(4, headY + 1.2, 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Both arms raised high waving in enthusiastic cheer!
      const armWave = Math.sin(time * 12 + treeIndex) * 3;
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-3, -3);
      ctx.lineTo(-7 + armWave, -15);
      ctx.moveTo(3, -3);
      ctx.lineTo(7 - armWave, -15);
      ctx.stroke();

      // Clenched cheering paws / thumbs up
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(-7 + armWave, -15, 1.8, 0, Math.PI * 2);
      ctx.arc(7 - armWave, -15, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Floating Celebration Symbols: Hearts, Stars & Music Notes!
      const symIdx = (treeIndex + Math.floor(time * 2.2)) % 3;
      const symY = headY - 16 - Math.sin(time * 5 + treeIndex) * 5;
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
    } else if (!isScared) {
      // Normal Monkey: Chill and eating banana
      // Eyes
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-2, headY - 1, 1, 0, Math.PI * 2);
      ctx.arc(2, headY - 1, 1, 0, Math.PI * 2);
      ctx.fill();

      // Cute smile
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, headY + 1.5, 1.8, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // Arms holding banana
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-2, -3, 3, 5);
      ctx.fillRect(1, -3, 3, 5);

      // Bright yellow banana
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(2, -1, 4, 0.4, 2.2);
      ctx.stroke();
      ctx.fillStyle = '#78350f';
      ctx.fillRect(3.5, 1.5, 1, 1); // banana tip
    } else {
      // Scared Monkey (Level 19): Panicking with foxes chasing!
      // Wide terrified eyes (white sclera with tiny black dot pupil)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-2.5, headY - 1.5, 2.2, 0, Math.PI * 2);
      ctx.arc(2.5, headY - 1.5, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-2.5, headY - 1.5, 0.8, 0, Math.PI * 2);
      ctx.arc(2.5, headY - 1.5, 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Screaming open mouth ("O")
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.ellipse(0, headY + 2.2, 1.8, 2.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Arms waving high in panic!
      const armWave = Math.sin(time * 25 + treeIndex) * 3;
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-4, -4);
      ctx.lineTo(-8 + armWave, -14);
      ctx.moveTo(4, -4);
      ctx.lineTo(8 - armWave, -14);
      ctx.stroke();

      // Sweat drops flying off head
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(7, headY - 6, 1.5, 0, Math.PI * 2);
      ctx.arc(-8, headY - 5, 1.2, 0, Math.PI * 2);
      ctx.fill();

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

      // Exact same fox model as the in-game combat fox!
      this.drawFoxSprite(ctx, 36, 24, false, time * 1.5 + f * 0.5, 1.0);

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

  // World 5: Snowshoe Hares jumping peacefully or cheering in the snow
  private renderSnowshoeHares(w: number, h: number, camera: Camera, time: number, isCheering: boolean = false) {
    const ctx = this.ctx;
    for (let i = 0; i < 4; i++) {
      const hx = (((i * 260 + 90) - (camera.x * 0.45)) % (w + 240)) - 60;
      if (hx < -60 || hx > w + 60) continue;
      const worldX = hx + camera.x * 0.45;
      const groundY = h - 85 + Math.sin(worldX * 0.0055 + 2.5) * 22;
      const hopSpeed = isCheering ? 6.2 : 4.5;
      const hopHeight = isCheering ? 30 : 22;
      const hopCycle = Math.abs(Math.sin(time * hopSpeed + i * 1.7));
      const hy = groundY - hopCycle * hopHeight;

      ctx.save();
      ctx.translate(hx, hy);

      // Fluffy white snowshoe hare body
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.ellipse(0, 1, 10, 8, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, 0, 9.5, 7.5, -0.15, 0, Math.PI * 2);
      ctx.fill();

      // Big fluffy hind feet (snowshoes!)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-4, 6, 5, 2.5, 0, 0, Math.PI * 2);
      ctx.ellipse(3, 6, 4, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Front paws (clapping happily if cheering!)
      if (isCheering) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(5, 0, 4, 2.5, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Round cotton ball tail
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-10, -2, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Hare Head
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(6, -4, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Long White Ears with Iconic Black Tips!
      const earWiggle = Math.sin(time * (isCheering ? 14 : 9) + i) * (isCheering ? 0.25 : 0.15);
      ctx.save();
      ctx.translate(4, -8);
      ctx.rotate(-0.2 + earWiggle);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-2, -6, 2.2, 7, -0.1, 0, Math.PI * 2);
      ctx.ellipse(2, -6, 2.2, 7, 0.1, 0, Math.PI * 2);
      ctx.fill();
      // Pink ear inner
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.ellipse(-2, -5, 1.2, 4.5, -0.1, 0, Math.PI * 2);
      ctx.ellipse(2, -5, 1.2, 4.5, 0.1, 0, Math.PI * 2);
      ctx.fill();
      // Black ear tips
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-3, -13, 2.5, 3);
      ctx.fillRect(1, -13, 2.5, 3);
      ctx.restore();

      if (isCheering) {
        // VICTORY CHEERING HARE (Snowshoe hares cheer only at World 5!)
        // Happy joyful eyes (^ ^)
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(7.5, -5, 1.5, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Cute smiling pink mouth & nose
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(10.5, -3.5, 1.5, 1.2); // nose
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(9.5, -2, 1.6, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Pink blushing cheeks
        ctx.fillStyle = 'rgba(244, 114, 182, 0.6)';
        ctx.beginPath();
        ctx.arc(6, -2.5, 1.3, 0, Math.PI * 2);
        ctx.fill();

        // Floating Celebration Symbols: Hearts, Stars & Music Notes!
        const symIdx = (i + Math.floor(time * 2.2)) % 3;
        const symY = -22 - Math.sin(time * 5 + i) * 6;
        ctx.font = '700 9px "Silkscreen", monospace';
        ctx.textAlign = 'center';
        if (symIdx === 0) {
          ctx.fillStyle = '#f43f5e';
          ctx.fillText('♥', 6, symY);
        } else if (symIdx === 1) {
          ctx.fillStyle = '#facc15';
          ctx.fillText('★', 6, symY);
        } else {
          ctx.fillStyle = '#38bdf8';
          ctx.fillText('♪', 6, symY);
        }
      } else {
        // Normal Hare Eye & Pink Nose
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(8, -5, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(8.2, -5.6, 0.6, 0.6);
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(10.5, -3.5, 1.5, 1.2); // nose
      }

      // Snow landing dust
      if (hopCycle < 0.15) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(-6, 7, 14, 2);
      }

      ctx.restore();
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

      // Exact same bear model as the in-game combat bear!
      this.drawBearSprite(ctx, 48, 32, false, time * 1.5 + b, 1.05);

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
      // 1. Apocalyptic Red Sky with Fiery Crimson-Orange Sunset Glow
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#3f0708');    // Deep midnight crimson
      skyGrad.addColorStop(0.22, '#7f1d1d'); // Rich blood red
      skyGrad.addColorStop(0.48, '#b91c1c'); // Blazing crimson
      skyGrad.addColorStop(0.70, '#ea580c'); // Burning orange
      skyGrad.addColorStop(0.88, '#f97316'); // Fiery amber glow
      skyGrad.addColorStop(1, '#fde047');    // Blazing horizon yellow
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Atmospheric embers rising in the sky
      ctx.fillStyle = '#f97316';
      for (let e = 0; e < 18; e++) {
        const emberX = (((e * 71) + time * 18) % (w + 60)) - 30;
        const emberY = (h - (((e * 43) + time * 35) % (h * 0.75)));
        const eSize = 1.5 + (e % 3);
        ctx.fillRect(emberX, emberY, eSize, eSize);
      }

      // 2. Colossal Blazing Blood Sun - Brighter Red with Vibrant Orange and Incandescent Yellow
      const sunX = w * 0.76;
      const sunY = 88;

      // Pulsing outer radiant red coronal corona
      const outerRadius = 110 + Math.sin(time * 3) * 12;
      const coronaGrad = ctx.createRadialGradient(sunX, sunY, 20, sunX, sunY, outerRadius);
      coronaGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)'); // Incandescent core
      coronaGrad.addColorStop(0.25, 'rgba(249, 115, 22, 0.85)'); // Vivid orange
      coronaGrad.addColorStop(0.55, 'rgba(220, 38, 38, 0.65)');  // Blazing red
      coronaGrad.addColorStop(0.85, 'rgba(185, 28, 28, 0.3)');   // Deep crimson rim
      coronaGrad.addColorStop(1, 'rgba(127, 29, 29, 0)');
      ctx.fillStyle = coronaGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, outerRadius, 0, Math.PI * 2);
      ctx.fill();

      // Secondary fiery orange solar flare ring
      ctx.fillStyle = 'rgba(249, 115, 22, 0.75)';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 52 + Math.sin(time * 4) * 4, 0, Math.PI * 2);
      ctx.fill();

      // Blazing red main solar body
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 44, 0, Math.PI * 2);
      ctx.fill();

      // Vibrant orange sun disk
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 36, 0, Math.PI * 2);
      ctx.fill();

      // Brighter incandescent golden-yellow center
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
      ctx.fill();

      // Blinding white-hot solar core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 15, 0, Math.PI * 2);
      ctx.fill();

      // Radiant Solar Flare Beams (Rotating Red, Orange, and Golden Yellow Rays)
      ctx.save();
      ctx.translate(sunX, sunY);
      ctx.rotate(time * 0.12);
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const rayColor = i % 3 === 0 ? 'rgba(254, 240, 138, 0.22)' : (i % 3 === 1 ? 'rgba(249, 115, 22, 0.25)' : 'rgba(220, 38, 38, 0.28)');
        ctx.fillStyle = rayColor;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle - 0.1) * (w + h), Math.sin(angle - 0.1) * (w + h));
        ctx.lineTo(Math.cos(angle + 0.1) * (w + h), Math.sin(angle + 0.1) * (w + h));
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // 3. Fiery Sunset Clouds Drifting across the Red Sky
      for (let i = 0; i < 6; i++) {
        const cx = (((i * 280) + time * 8 - (camera.x * 0.04)) % (w + 240)) - 80;
        const cy = 20 + (i % 3) * 28;
        ctx.fillStyle = (i % 2 === 0) ? 'rgba(239, 68, 68, 0.65)' : 'rgba(249, 115, 22, 0.55)';
        this.drawFluffyCloud(cx, cy, 80 + (i % 2) * 30);
      }
    } else {
      // 1. SKY TURNS BACK TO NORMAL AFTER BOSS DEFEAT!
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
      // A. 10 Animated Fluttering Butterflies of Vibrant Colors
      const butterflyColors = [
        { wing: '#ea580c', border: '#1c1917', dot: '#ffffff' }, // Monarch Orange
        { wing: '#38bdf8', border: '#0369a1', dot: '#ffffff' }, // Azure Morpho
        { wing: '#22c55e', border: '#14532d', dot: '#fef08a' }, // Emerald Swallowtail
        { wing: '#c084fc', border: '#6b21a8', dot: '#fdf4ff' }, // Lavender Princess
        { wing: '#facc15', border: '#ca8a04', dot: '#ffffff' }, // Golden Sulphur
        { wing: '#f43f5e', border: '#9f1239', dot: '#fecdd3' }, // Ruby Rose
        { wing: '#38bdf8', border: '#0284c7', dot: '#ffffff' }, // Sky Blue
        { wing: '#fb923c', border: '#9a3412', dot: '#ffffff' }, // Tiger Orange
      ];

      for (let b = 0; b < butterflyColors.length; b++) {
        const bColor = butterflyColors[b];
        const flap = Math.abs(Math.sin(time * 18 + b * 2.3));
        const bx = (((b * 140 + time * 32) - camera.x * 0.3) % (w + 120)) - 40;
        const by = h - 115 + Math.sin(time * 3 + b * 1.7) * 28;

        ctx.save();
        ctx.translate(bx, by);

        // Flapping wings
        const wingW = Math.max(1.5, 7 * flap);
        const wingH = 6;

        // Left wing
        ctx.fillStyle = bColor.wing;
        ctx.beginPath();
        ctx.ellipse(-wingW / 2, -2, wingW / 2, wingH, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = bColor.border;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Right wing
        ctx.beginPath();
        ctx.ellipse(wingW / 2, -2, wingW / 2, wingH, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Wing decorative dots
        ctx.fillStyle = bColor.dot;
        ctx.fillRect(-wingW / 2, -3, 1.5, 1.5);
        ctx.fillRect(wingW / 2 - 1.5, -3, 1.5, 1.5);

        // Slim black butterfly body
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-1, -5, 2, 8);
        // Antennae
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-1, -5);
        ctx.lineTo(-3, -8);
        ctx.moveTo(1, -5);
        ctx.lineTo(3, -8);
        ctx.stroke();

        ctx.restore();
      }

      // B. Iridescent Azure Dragonflies Hovering Above Waters
      for (let d = 0; d < 3; d++) {
        const dx = (((d * 320 + 150 + Math.sin(time * 4 + d) * 40) - camera.x * 0.35) % (w + 100)) - 30;
        const dy = h - 68 + Math.cos(time * 3.5 + d * 2) * 12;

        ctx.save();
        ctx.translate(dx, dy);

        // Slender luminous cyan body
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(-1, -2, 2, 10);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-1.5, -4, 3, 3); // head

        // Translucent double wings
        ctx.fillStyle = 'rgba(224, 242, 254, 0.85)';
        const dFlap = Math.sin(time * 40 + d) * 0.4;
        ctx.fillRect(-7, -3 + dFlap, 14, 2);
        ctx.fillRect(-6, 0 - dFlap, 12, 1.5);

        ctx.restore();
      }

      // C. Fuzzy Striped Honeybees Orbiting Sunflowers
      for (let bee = 0; bee < 4; bee++) {
        const beex = (((bee * 240 + 80 + Math.sin(time * 6 + bee) * 18) - camera.x * 0.4) % (w + 100)) - 30;
        const beey = h - 90 + Math.cos(time * 5 + bee * 2) * 14;

        ctx.save();
        ctx.translate(beex, beey);

        // Striped golden bee body
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.ellipse(0, 0, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        // Black stripes
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(-1, -3, 1.5, 6);
        ctx.fillRect(1.5, -2.5, 1.5, 5);

        // Fast vibrating white wings
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillRect(-2, -5 + Math.sin(time * 50) * 1, 4, 3);

        ctx.restore();
      }

      // D. Tiny Spotted Red Ladybugs on Grass Blades
      for (let lb = 0; lb < 4; lb++) {
        const lx = ((lb * 220 + 60 - camera.x * 0.45) % (w + 100)) - 20;
        const ly = h - 70 + ((lb * 11) % 15);

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(lx, ly, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.fillRect(lx + 1, ly - 2, 1.5, 4); // black head
        ctx.fillRect(lx - 1.5, ly - 1, 1, 1); // spots
        ctx.fillRect(lx - 1.5, ly + 1, 1, 1);
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
      // Midground Pasture Sheep (World 1 & 2: Levels 1 to 9, Level 10 peaceful after defeat)
      // Sheep 1: Grazing contentedly or cheering on the open pasture meadow
      const s1ScreenX = (((380) - (camera.x * 0.3)) % (w + 260)) - 60;
      if (s1ScreenX > -70 && s1ScreenX < w + 70) {
        const s1WorldX = s1ScreenX + camera.x * 0.3;
        const s1Y = h - 125 + Math.sin(s1WorldX * 0.0042 + 1.2) * 30 - 2;
        this.renderGrazingSheep(s1ScreenX, s1Y, time, { facing: 'left', animOffset: 0.6, isCheering: isBossDefeated });
      }

      // Sheep 2: Fluffy sheep feeding on lush green grass or cheering down the ridge
      const s2ScreenX = (((860) - (camera.x * 0.3)) % (w + 280)) - 60;
      if (s2ScreenX > -70 && s2ScreenX < w + 70) {
        const s2WorldX = s2ScreenX + camera.x * 0.3;
        const s2Y = h - 125 + Math.sin(s2WorldX * 0.0042 + 1.2) * 30 - 2;
        this.renderGrazingSheep(s2ScreenX, s2Y, time, { facing: 'right', animOffset: 2.3, isCheering: isBossDefeated });
      }

      // --- Foreground Pasture Sheep & Lamb Feeding or Cheering (World 1, 2) ---
      // Sheep 3: Mother Ewe (cheering with baby lamb upon defeat, eating animation removed!)
      const s3ScreenX = (((220) - (camera.x * 0.45)) % (w + 320)) - 70;
      if (s3ScreenX > -80 && s3ScreenX < w + 80) {
        const s3WorldX = s3ScreenX + camera.x * 0.45;
        const s3Y = h - 85 + Math.sin(s3WorldX * 0.0055 + 2.4) * 24 - 4;
        this.renderGrazingSheep(s3ScreenX, s3Y, time, { facing: 'right', scale: 1.05, animOffset: 1.1, isCheering: isBossDefeated });

        // Cute Little Baby Lamb right next to its mother!
        const lambScreenX = s3ScreenX + 38;
        const lambY = s3Y + 4;
        this.renderGrazingSheep(lambScreenX, lambY, time, { facing: 'left', isLamb: true, animOffset: 3.5, isCheering: isBossDefeated });
      }

      // Sheep 4: Another fluffy sheep happily grazing or cheering across the field
      const s4ScreenX = (((680) - (camera.x * 0.45)) % (w + 300)) - 70;
      if (s4ScreenX > -80 && s4ScreenX < w + 80) {
        const s4WorldX = s4ScreenX + camera.x * 0.45;
        const s4Y = h - 85 + Math.sin(s4WorldX * 0.0055 + 2.4) * 24 - 4;
        this.renderGrazingSheep(s4ScreenX, s4Y, time, { facing: 'left', scale: 1.0, animOffset: 4.2, isCheering: isBossDefeated });
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

      // Exact same wolf model as the in-game combat wolf!
      this.drawWolfSprite(ctx, 36, 24, false, time * 2 + wIdx, 1.05);

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
    }
  ) {
    const ctx = this.ctx;
    const facing = options?.facing || 'left';
    const scale = options?.scale || (options?.isLamb ? 0.68 : 1.0);
    const offset = options?.animOffset || 0;
    const isLamb = !!options?.isLamb;
    const isCheering = !!options?.isCheering;

    // Grazing state cycle (5.5s cycle) - completely disabled if isCheering!
    const cycle = (time + offset) % 5.5;
    const isFeedingDown = !isCheering && cycle < 3.4; // never feeds down if cheering!
    const chewSpeed = 14;
    const chew = isCheering ? 0 : Math.sin(time * chewSpeed) * 1.5;

    // Transition factor for head up / down: 0 is head up, 1 is head down in grass
    let headDownProgress = 0;
    if (!isCheering) {
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

    // Happy celebration hop when cheering!
    const cheerHop = isCheering ? Math.abs(Math.sin(time * 7.5 + offset * 2.2)) * 8 : 0;

    ctx.save();
    ctx.translate(x, y - cheerHop);
    if (facing === 'right') {
      ctx.scale(-1, 1);
    }
    ctx.scale(scale, scale);

    // 1. Soft Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.ellipse(0, 8 + (cheerHop * 0.4), isLamb ? 16 : 24, isLamb ? 4.5 : 6.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Slender Dark Charcoal Legs with Cloven Hooves
    const legW = isLamb ? 2.8 : 3.6;
    const legH = isLamb ? 10 : 14;
    const footY = 8;
    const legColor = '#334155';
    const hoofColor = '#0f172a';

    // Back legs (far and near)
    ctx.fillStyle = '#1e293b'; // Far back leg in shadow
    ctx.fillRect(-14, footY - legH, legW, legH);
    ctx.fillStyle = hoofColor;
    ctx.fillRect(-14.5, footY - 2.5, legW + 1, 2.5);

    ctx.fillStyle = legColor; // Near back leg
    ctx.fillRect(-9, footY - legH + 1, legW, legH - 1);
    ctx.fillStyle = hoofColor;
    ctx.fillRect(-9.5, footY - 2.5, legW + 1, 2.5);

    // Front legs (far and near)
    ctx.fillStyle = '#1e293b'; // Far front leg
    ctx.fillRect(8, footY - legH, legW, legH);
    ctx.fillStyle = hoofColor;
    ctx.fillRect(7.5, footY - 2.5, legW + 1, 2.5);

    ctx.fillStyle = legColor; // Near front leg
    ctx.fillRect(13, footY - legH + 1, legW, legH - 1);
    ctx.fillStyle = hoofColor;
    ctx.fillRect(12.5, footY - 2.5, legW + 1, 2.5);

    // 3. Wiggling Woolly Bob Tail
    const tailWag = Math.sin(time * (isCheering ? 14 : 7) + offset * 3) * (isCheering ? 0.45 : 0.25);
    ctx.save();
    ctx.translate(-19, -4);
    ctx.rotate(-0.35 + tailWag);
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(0, 0, isLamb ? 3.5 : 5, isLamb ? 5 : 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // 4. Cloud-like Fluffy Fleece Body (Overlapping Wool Puffs)
    // Shadow layer
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.ellipse(0, 1, isLamb ? 17 : 24, isLamb ? 12 : 16.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main creamy wool body
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(0, -1, isLamb ? 16 : 23, isLamb ? 11.5 : 15.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Multiple fluffy cloud lobes around perimeter
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

    puffs.forEach(p => {
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(p.px, p.py, p.r, 0, Math.PI * 2);
      ctx.fill();

      // Subtle shadow contour on lower puff edge
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Soft warm wool texture highlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-2, -5, isLamb ? 9 : 13, isLamb ? 5 : 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. Sheep Neck & Head (Animated Feeding / Grazing or Joyful Cheering)
    // Interpolate head position between UP (looking around/cheering) and DOWN (eating grass)
    const headUpX = isLamb ? 15 : 21;
    const headUpY = isLamb ? -8 : -11;
    const headDownX = isLamb ? 18 : 25;
    const headDownY = isLamb ? 2 : 4;

    const headX = headUpX + (headDownX - headUpX) * headDownProgress;
    const headY = headUpY + (headDownY - headUpY) * headDownProgress + (isFeedingDown ? chew : 0);

    ctx.save();
    ctx.translate(headX, headY);

    // Head angle tilts down only when eating (never when cheering)
    const headAngle = headDownProgress * 0.45;
    ctx.rotate(headAngle);

    // Woolly cap / crown on top of head
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(0, -6, isLamb ? 4.5 : 6, 0, Math.PI * 2);
    ctx.arc(-3, -4, isLamb ? 3.5 : 5, 0, Math.PI * 2);
    ctx.fill();

    // Dark sleek face/head
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.ellipse(3, 0, isLamb ? 5.5 : 8, isLamb ? 4.5 : 6.5, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Snout / muzzle
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(7, 2, isLamb ? 3.2 : 4.5, isLamb ? 2.5 : 3.5, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Cute pink nose dot
    ctx.fillStyle = '#fda4af';
    ctx.fillRect(9, 1, 1.8, 1.5);

    // Floppy cute ear
    const earWiggle = Math.sin(time * (isCheering ? 14 : 8) + offset) * (isCheering ? 0.3 : 0.15);
    ctx.save();
    ctx.translate(-2, -2);
    ctx.rotate(0.35 + earWiggle);
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.ellipse(0, 0, isLamb ? 2 : 3, isLamb ? 5 : 7, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbcfe8'; // soft pink inner ear
    ctx.beginPath();
    ctx.ellipse(0, 0, isLamb ? 1 : 1.5, isLamb ? 3 : 4.5, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Eyes and mouth expression
    if (isCheering) {
      // VICTORY CHEERING SHEEP / LAMB: Happy crescent eyes & smiling mouth
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(2, -1, isLamb ? 1.6 : 2.4, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // Cute joyful open smile with pink tongue
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(6.5, 2, isLamb ? 1.8 : 2.5, 0.2, Math.PI - 0.2);
      ctx.stroke();
      ctx.fillStyle = '#f472b6'; // pink tongue
      ctx.beginPath();
      ctx.arc(6.5, 3.2, isLamb ? 0.9 : 1.3, 0, Math.PI);
      ctx.fill();

      // Blushing pink cheeks
      ctx.fillStyle = 'rgba(244, 114, 182, 0.55)';
      ctx.beginPath();
      ctx.arc(1, 1, 1.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Normal Grazing Sheep Eyes (Blinking happily or sweet eye catchlight)
      const isBlink = (time + offset) % 3.6 < 0.14;
      if (isBlink || isFeedingDown) {
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
        // White sparkle catchlight
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(2.5, -2, 1, 1);
      }
    }

    // 6. Green Grass Blades in mouth ONLY when feeding (COMPLETELY REMOVED IF CHEERING)
    if (!isCheering && (isFeedingDown || cycle < 4.2)) {
      const grassSway = Math.sin(time * chewSpeed) * 3;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(8, 3);
      ctx.quadraticCurveTo(12 + grassSway, 7, 10 + grassSway, 12);
      ctx.moveTo(7, 3);
      ctx.quadraticCurveTo(14 - grassSway, 5, 13, 9);
      ctx.stroke();

      // Fresh clover leaf at tip
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(10 + grassSway, 12, 1.8, 0, Math.PI * 2);
      ctx.arc(13, 9, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore(); // restore head transform

    // 7. Grass tufts around feet
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(8, 4, 3, 5);
    ctx.fillRect(12, 5, 2.5, 4);
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(10, 2, 2, 6);
    ctx.fillRect(-12, 5, 2, 4);

    // If feeding (and not cheering), little grass crumb particles float up occasionally
    if (!isCheering && isFeedingDown && Math.sin(time * 10 + offset) > 0.6) {
      ctx.fillStyle = '#86efac';
      ctx.fillRect(headX + 4, headY + 6, 1.5, 1.5);
    }

    // Floating Celebration Symbols: Hearts, Stars & Music Notes when cheering!
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
    _time: number, 
    platforms?: Platform[]
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

    const sx = spawnPoint.x - 14 - camera.x;
    const sy = groundY - coopH - camera.y;

    if (sx < -80 || sx > this.canvas.width + 80) return;

    ctx.save();

    // Solid ground shadow right under base
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(sx + coopW / 2, sy + coopH + 1, coopW / 2 + 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();

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
  }

  // --- Silkie Sam Outside The Shop (Level 1 Exterior Stand & Upgraded Dialogue) ---
  public renderSilkieSamOutsideShop(
    player: PlayerState,
    camera: Camera,
    time: number,
    hasCompletedGame: boolean = false,
    hasRewardSkin: boolean = false,
    isShopClosed: boolean = false,
    hasVisitedShop: boolean = false
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

    // Check distance to player for speech & animated greeting
    const pCenter = player.x + player.width / 2;
    const distToPlayer = Math.abs(pCenter - (standX + counterW / 2));
    const isNearby = distToPlayer < 220;
    const isSpeaking = isNearby;

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

    // Signature Turquoise / Sky-Blue Earglobe
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.ellipse(4, -4, 3, 3.8, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#67e8f9';
    ctx.fillRect(3.5, -4.5, 1.2, 1.8);

    // Walnut / Mulberry Comb
    ctx.fillStyle = '#4a044e';
    ctx.beginPath();
    ctx.ellipse(9, -11, 3.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fluffy Pom-Pom Crest (8 cloud puffs that bob with voice)
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

    // Feathered boots & dark slate claws
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-2, 12, 5, 6);
    ctx.fillRect(4, 12, 5, 6);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-1.5, 17, 4, 3);
    ctx.fillRect(4.5, 17, 4, 3);

    ctx.restore(); // restore Sam

    // 3. UPGRADED RETRO ARCADE DIALOGUE BUBBLE WHEN NEARBY
    if (isNearby) {
      let fullDialogue = hasVisitedShop 
        ? "hello again! step inside to upgrade your sword, armor, & hearts!" 
        : "welcome! step inside to upgrade your sword, armor, & hearts!";
      if (hasCompletedGame) {
        fullDialogue = hasRewardSkin ? "you were a legend" : "well i wanted to give you this for saving the day";
      } else if (isShopClosed) {
        fullDialogue = "sorry we are currently closed! please check back later!";
      }

      const bubbleW = 340;
      const bubbleH = 74;
      const bx = samX - 90;
      const by = sy - counterH - 68 - bubbleH;

      ctx.save();

      // Drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(bx + 4, by + 4, bubbleW, bubbleH);

      // Deep obsidian arcade gradient box
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

      // Speech bubble pointer tail directed at Silkie Sam's head
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(samX - 10, by + bubbleH);
      ctx.lineTo(samX, by + bubbleH + 14);
      ctx.lineTo(samX + 10, by + bubbleH);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.moveTo(samX - 8, by + bubbleH - 1);
      ctx.lineTo(samX, by + bubbleH + 11);
      ctx.lineTo(samX + 8, by + bubbleH - 1);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(samX - 9, by + bubbleH);
      ctx.lineTo(samX, by + bubbleH + 13);
      ctx.lineTo(samX + 9, by + bubbleH);
      ctx.stroke();

      // Framed Mini Silkie Portrait Icon
      const pSize = 44;
      const px = bx + 10;
      const py = by + 14;

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
      ctx.font = '700 8.5px "Silkscreen", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('SILKIE SAM - MASTER COOP MERCHANT', textX, by + 19);

      // Spoken Dialogue
      ctx.font = '700 10px "Silkscreen", monospace';
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 3;

      const cursor = Math.floor(Date.now() / 250) % 2 === 0 ? '▮' : '';
      ctx.fillText(`“${fullDialogue}${cursor}”`, textX, by + 39);
      ctx.shadowBlur = 0;

      // Action hint prompt badge
      ctx.font = '700 8px "Silkscreen", monospace';
      ctx.fillStyle = '#4ade80';
      ctx.fillText('[ TAP UPGRADE SHOP BUTTON TO BROWSE GEAR ]', textX, by + 57);

      ctx.restore();
    }

    ctx.restore();
  }

  // --- Platforms & Detailed Colorful Obstacles ---

  public renderPlatform(
    plat: Platform, 
    camera: Camera, 
    enemies?: Enemy[], 
    levelTheme?: LevelConfig['theme']
  ) {
    const ctx = this.ctx;
    const sx = plat.x - camera.x;
    const sy = plat.y - camera.y;

    if (sx + plat.width < -50 || sx > this.canvas.width + 50) return;

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
      // 3. Regular Lush Grassy Platform
      ctx.fillStyle = '#78350f';
      ctx.fillRect(sx, sy, plat.width, plat.height);

      ctx.fillStyle = '#92400e';
      ctx.fillRect(sx, sy + 10, plat.width, plat.height - 10);
      ctx.fillStyle = '#543009';
      for (let px = sx + 8; px < sx + plat.width - 8; px += 26) {
        ctx.fillRect(px, sy + 14, 4, 4);
      }

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
      // 5. Country Picket Fence
      ctx.fillStyle = '#b45309';
      ctx.fillRect(sx, sy, plat.width, plat.height);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(sx + 3, sy, plat.width - 6, 6);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(sx + 6, sy + 14, plat.width - 12, plat.height - 14);

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(sx + plat.width / 2, sy - 6);
      ctx.lineTo(sx + plat.width, sy);
      ctx.lineTo(sx, sy);
      ctx.closePath();
      ctx.fill();

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

  // --- Local Friend: Silkie Sam (Fluffy White Silkie Chicken who delivers the Royal Shield and Netherite Sword!) ---
  public renderSilkieSam(sam: SilkieSamFriend, camera: Camera, time: number) {
    if (sam.state === 'gone') {
      // Even if Sam flew away, if shield or sword is dropped and not yet picked up, render them on the platform!
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

    ctx.save();
    ctx.translate(sx, sy);

    // Floating bobbing motion
    const hoverBob = Math.sin(time * 6) * 3;
    ctx.translate(0, hoverBob);

    // Facing direction: facing right towards the player or platform center
    ctx.scale(1, 1);

    // 2. Silkie Sam Character Model (Matching Shop Dialogue Profile in Full Color & Detail)
    const isSpeaking = sam.state === 'talk_1' || sam.state === 'talk_2';

    // Shadow under flying Silkie Sam
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.beginPath();
    ctx.ellipse(0, 32, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();

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

    // Feathered Silkie Boots & Slate Claws
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-3, 11, 7, 9);
    ctx.fillRect(6, 11, 7, 9);
    ctx.fillStyle = '#1e293b'; // dark slate claws
    ctx.fillRect(-2, 19, 5, 3.5);
    ctx.fillRect(7, 19, 5, 3.5);

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

    // 3. UPGRADED DELUXE PIXELATED DIALOGUE SPEECH BUBBLE
    if (sam.state === 'talk_1' || sam.state === 'talk_2' || sam.state === 'talk_3' || sam.state === 'dropping_shield' || sam.state === 'dropping_sword') {
      let fullText = "here take this!";
      if (sam.state === 'talk_2' || sam.state === 'dropping_sword') {
        fullText = "oh here is a sword..";
      } else if (sam.state === 'talk_3') {
        fullText = " it’s very powerful!";
      }
      const displayText = fullText.slice(0, sam.dialogueCharIndex);

      ctx.save();
      const bubbleW = 230;
      const bubbleH = 56;
      const bx = sx + 32;
      const by = sy - 60 + hoverBob;

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
      const isTyping = sam.dialogueCharIndex < fullText.length;
      const cursor = (isTyping && Math.floor(Date.now() / 200) % 2 === 0) ? '▮' : '';
      ctx.fillText(`“${displayText}${cursor}”`, textX, by + 38);
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

    if (sx < -60 || sx > this.canvas.width + 60) return;

    // Peaceful mode: Dead / Dormant Extinct Volcano
    if (v.isDead) {
      // 1. Cold basalt rock mountain with dormant crags
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.moveTo(sx - 4, sy + v.height);
      ctx.lineTo(sx + 12, sy);
      ctx.lineTo(sx + v.width - 12, sy);
      ctx.lineTo(sx + v.width + 4, sy + v.height);
      ctx.closePath();
      ctx.fill();

      // Cold stone ribs
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.moveTo(sx + 8, sy + v.height);
      ctx.lineTo(sx + 18, sy + 6);
      ctx.lineTo(sx + 24, sy + v.height);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#44403c';
      ctx.beginPath();
      ctx.moveTo(sx + v.width - 24, sy + v.height);
      ctx.lineTo(sx + v.width - 16, sy + 8);
      ctx.lineTo(sx + v.width - 8, sy + v.height);
      ctx.closePath();
      ctx.fill();

      // Cold dark fracture cracks (zero glowing lava or heat)
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx + v.width * 0.35, sy + 8);
      ctx.lineTo(sx + v.width * 0.42, sy + v.height * 0.55);
      ctx.lineTo(sx + v.width * 0.32, sy + v.height);
      ctx.moveTo(sx + v.width * 0.65, sy + 6);
      ctx.lineTo(sx + v.width * 0.58, sy + v.height * 0.48);
      ctx.lineTo(sx + v.width * 0.68, sy + v.height);
      ctx.stroke();

      // Overgrowing peaceful green moss and foliage patches
      ctx.fillStyle = '#15803d';
      ctx.fillRect(sx + 14, sy + 12, 10, 6);
      ctx.fillRect(sx + v.width - 24, sy + 18, 12, 7);
      ctx.fillRect(sx + v.width * 0.42, sy + v.height * 0.55, 14, 8);

      // Dead cold stone caldera rim with harmless grass sprouts
      ctx.fillStyle = '#292524';
      ctx.fillRect(sx + 12, sy, v.width - 24, 6);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(sx + 16, sy - 2, v.width - 32, 2);
      return;
    }

    // 1. Layered obsidian mountain silhouette with crags
    ctx.fillStyle = '#1c1917'; // dark basalt base
    ctx.beginPath();
    ctx.moveTo(sx - 4, sy + v.height);
    ctx.lineTo(sx + 12, sy);
    ctx.lineTo(sx + v.width - 12, sy);
    ctx.lineTo(sx + v.width + 4, sy + v.height);
    ctx.closePath();
    ctx.fill();

    // Jagged basalt rock ribs
    ctx.fillStyle = '#292524';
    ctx.beginPath();
    ctx.moveTo(sx + 8, sy + v.height);
    ctx.lineTo(sx + 18, sy + 6);
    ctx.lineTo(sx + 24, sy + v.height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#44403c';
    ctx.beginPath();
    ctx.moveTo(sx + v.width - 24, sy + v.height);
    ctx.lineTo(sx + v.width - 16, sy + 8);
    ctx.lineTo(sx + v.width - 8, sy + v.height);
    ctx.closePath();
    ctx.fill();

    // 2. Molten magma fissures glowing through the obsidian
    const isHot = v.state === 'warning' || v.state === 'erupting';
    ctx.strokeStyle = isHot ? '#ea580c' : '#7c2d12';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx + v.width * 0.35, sy + 8);
    ctx.lineTo(sx + v.width * 0.42, sy + v.height * 0.55);
    ctx.lineTo(sx + v.width * 0.32, sy + v.height);
    ctx.stroke();

    ctx.strokeStyle = isHot ? '#facc15' : '#b45309';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx + v.width * 0.65, sy + 6);
    ctx.lineTo(sx + v.width * 0.58, sy + v.height * 0.48);
    ctx.lineTo(sx + v.width * 0.68, sy + v.height);
    ctx.stroke();

    // 3. Boiling caldera crater rim
    ctx.fillStyle = isHot ? '#f97316' : '#78350f';
    ctx.fillRect(sx + 12, sy, v.width - 24, 7);
    ctx.fillStyle = isHot ? '#fde047' : '#9a3412';
    ctx.fillRect(sx + 16, sy + 2, v.width - 32, 3);

    // 4. Warning Smoke Plumes & Bubble Shimmers
    if (v.state === 'warning') {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
      ctx.beginPath();
      ctx.arc(sx + v.width / 2, sy - 8, 18, 0, Math.PI * 2);
      ctx.fill();

      // Rising sulfur smoke clouds
      ctx.fillStyle = 'rgba(120, 113, 108, 0.75)';
      ctx.beginPath();
      ctx.arc(sx + v.width / 2 - 5, sy - 18, 10, 0, Math.PI * 2);
      ctx.arc(sx + v.width / 2 + 6, sy - 26, 13, 0, Math.PI * 2);
      ctx.fill();

      // Ember sparks
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(sx + v.width / 2 - 2, sy - 14, 3, 3);
      ctx.fillRect(sx + v.width / 2 + 8, sy - 34, 2.5, 2.5);
    }

    // 5. Blazing Eruption with Molten Magma Blobs
    if (v.state === 'erupting') {
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(sx + 14, sy - 5, v.width - 28, 9);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(sx + 10, sy - 2, v.width - 20, 4);

      v.lavaParticles.forEach(lp => {
        const lx = lp.x - camera.x;
        const ly = lp.y - camera.y;

        // Outer glow
        ctx.fillStyle = lp.life > 0.4 ? 'rgba(249, 115, 22, 0.8)' : 'rgba(220, 38, 38, 0.6)';
        ctx.beginPath();
        ctx.arc(lx, ly, lp.radius + 2, 0, Math.PI * 2);
        ctx.fill();

        // White-hot core
        ctx.fillStyle = lp.life > 0.5 ? '#ffffff' : (lp.life > 0.25 ? '#fef08a' : '#ef4444');
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
        const isSnowy = levelTheme === 'snowy';

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

    if (sx < -80 || sx > this.canvas.width + 80) return;

    // Peaceful mode: Thunderclouds turn into beautiful, harmless normal clouds!
    if (th.isPeaceful || th.isNormal) {
      ctx.save();
      // Gentle soft white fluffy cloud body with light sky blue shading
      ctx.fillStyle = '#f8fafc';
      this.drawFluffyCloud(sx - th.width / 2, sy, th.width);
      ctx.fillStyle = '#e2e8f0';
      this.drawFluffyCloud(sx - th.width * 0.4, sy - 5, th.width * 0.8);
      ctx.fillStyle = '#bae6fd';
      this.drawFluffyCloud(sx - th.width * 0.22, sy + 3, th.width * 0.45);
      ctx.restore();
      return;
    }

    // 1. Dark stormy cumulonimbus clouds with electric violet rim
    const flash = th.state === 'striking' || (th.state === 'warning' && Math.sin(time * 20) > 0.5);
    ctx.fillStyle = flash ? '#475569' : '#0f172a';
    this.drawFluffyCloud(sx - th.width / 2, sy, th.width);

    // Billowing upper thunderhead
    ctx.fillStyle = flash ? '#64748b' : '#1e293b';
    this.drawFluffyCloud(sx - th.width * 0.4, sy - 6, th.width * 0.8);

    // Ambient rain sheets falling beneath the cloud
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1.2;
    for (let rx = sx - th.width * 0.4; rx < sx + th.width * 0.4; rx += 14) {
      const dropY = sy + 24 + ((time * 120 + rx * 3) % 45);
      ctx.beginPath();
      ctx.moveTo(rx, dropY);
      ctx.lineTo(rx - 2, dropY + 6);
      ctx.stroke();
    }

    // 2. Warning targeting reticle
    if (th.state === 'warning') {
      const pulse = 0.4 + Math.sin(time * 18) * 0.35;
      ctx.save();
      ctx.globalAlpha = pulse;

      // Electric beam pointer
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(tx, sy + 30);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.setLineDash([]);

      // Pulsing concentric hazard reticle rings
      ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.beginPath();
      ctx.ellipse(tx, ty, 34, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.font = '700 11px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ DANGER ⚡', tx, ty - 12);
      ctx.restore();
    }

    // 3. Lightning Strike Beam
    if (th.state === 'striking') {
      ctx.save();
      // Outer intense electric cyan/indigo glow
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.moveTo(tx, sy + 25);
      const mid1X = tx + (Math.sin(time * 30) * 18);
      const mid1Y = sy + (ty - sy) * 0.32;
      const mid2X = tx - (Math.cos(time * 35) * 16);
      const mid2Y = sy + (ty - sy) * 0.68;
      ctx.lineTo(mid1X, mid1Y);
      ctx.lineTo(mid2X, mid2Y);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      // Sharp blinding white bolt core
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.stroke();

      // Ground flash explosion
      ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
      ctx.beginPath();
      ctx.ellipse(tx, ty, 42, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // --- Enemies (Wolf, Fox, Bear): High Fidelity Pixel Art Models & Animations ---

  // ================= SHARED ENEMY SPRITE MODELS (COMBAT & BACKGROUND) =================
  // Ensures every enemy in the background looks 100% identical to the enemies fought in combat!

  public drawWolfSprite(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    facingLeft: boolean,
    animTimer: number,
    scale: number = 1
  ) {
    ctx.save();
    ctx.scale(scale * (facingLeft ? -1 : 1), scale);
    const halfW = width / 2;
    const halfH = height / 2;

    const walk = Math.sin(animTimer * 12) * 3.5;
    const tailSway = Math.sin(animTimer * 8) * 0.2;

    // 1. Bushy Wolf Tail with dark charcoal tip
    ctx.save();
    ctx.translate(-halfW + 4, -halfH + 8);
    ctx.rotate(-0.4 + tailSway);
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.ellipse(-10, 0, 11, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(-16, 0, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Muscular Wolf Torso & Flanks
    ctx.fillStyle = '#334155';
    ctx.fillRect(-halfW + 4, -halfH + 6, width - 10, height - 11);
    // Silver-charcoal spine contour
    ctx.fillStyle = '#475569';
    ctx.fillRect(-halfW + 4, -halfH + 4, width - 12, 4);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-halfW + 8, -halfH + 5, width - 18, 2);

    // 3. Thick Layered Neck Mane / Ruff (Intimidating Scruff)
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(halfW - 14, -halfH + 2);
    ctx.lineTo(halfW - 2, -halfH - 2);
    ctx.lineTo(halfW - 4, -halfH + 14);
    ctx.lineTo(halfW - 18, -halfH + 12);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(halfW - 12, -halfH + 4);
    ctx.lineTo(halfW - 4, -halfH + 1);
    ctx.lineTo(halfW - 6, -halfH + 10);
    ctx.closePath();
    ctx.fill();

    // 4. Wolf Head & Snout
    ctx.fillStyle = '#334155';
    ctx.fillRect(halfW - 12, -halfH - 1, 14, 11);
    // Muzzle extending forward
    ctx.fillStyle = '#475569';
    ctx.fillRect(halfW - 2, -halfH + 3, 8, 6);
    // Black leather nose
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(halfW + 4, -halfH + 3, 3, 3);
    // Sharp white predatory fangs
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(halfW + 1, -halfH + 8);
    ctx.lineTo(halfW + 3, -halfH + 11);
    ctx.lineTo(halfW + 5, -halfH + 8);
    ctx.closePath();
    ctx.fill();

    // 5. Pointed Alert Wolf Ears
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(halfW - 10, -halfH - 1);
    ctx.lineTo(halfW - 7, -halfH - 8);
    ctx.lineTo(halfW - 4, -halfH - 1);
    ctx.closePath();
    ctx.fill();
    // Inner pink/tan ear
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(halfW - 7, -halfH - 5, 2, 4);

    // 6. Glowing Amber/Gold Predatory Eye
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(halfW - 7, -halfH + 2, 3, 3);
    ctx.fillStyle = '#dc2626'; // menacing red slit pupil
    ctx.fillRect(halfW - 6, -halfH + 2.5, 1.5, 2);

    // 7. Muscular 4 Legs with Walk Animation & Claws
    ctx.fillStyle = '#1e293b';
    // Hind legs
    ctx.fillRect(-halfW + 4 + walk, halfH - 6, 4, 7);
    ctx.fillRect(-halfW + 10 - walk, halfH - 6, 4, 7);
    // Front legs
    ctx.fillRect(halfW - 14 - walk, halfH - 6, 4, 7);
    ctx.fillRect(halfW - 8 + walk, halfH - 6, 4, 7);
    // Claws
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-halfW + 6 + walk, halfH, 2, 2);
    ctx.fillRect(halfW - 6 + walk, halfH, 2, 2);

    ctx.restore();
  }

  public drawFoxSprite(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    facingLeft: boolean,
    animTimer: number,
    scale: number = 1
  ) {
    ctx.save();
    ctx.scale(scale * (facingLeft ? -1 : 1), scale);
    const halfW = width / 2;
    const halfH = height / 2;

    const runCycle = Math.sin(animTimer * 16) * 4.5;
    const tailSway = Math.sin(animTimer * 12) * 0.3;

    // 1. Magnificent Fluffy Fox Tail with Snowy White Tip!
    ctx.save();
    ctx.translate(-halfW + 4, -halfH + 6);
    ctx.rotate(-0.35 + tailSway);
    // Auburn main tail body
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.ellipse(-12, 0, 13, 6, -0.2, 0, Math.PI * 2);
    ctx.fill();
    // Fluffy Pure White Tail Tip (Iconic Fox Characteristic!)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-20, -2, 7, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Sleek Auburn Torso
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(-halfW + 2, -halfH + 5, width - 8, height - 11);
    // Darker rich back shade
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(-halfW + 4, -halfH + 4, width - 12, 3);

    // 3. Snow-White Throat Bib & Underbelly
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(halfW - 8, -halfH + 9, 7, 4, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // 4. Fox Head & Snout
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(halfW - 12, -halfH - 1, 12, 10);
    // Sharp tapered snout
    ctx.beginPath();
    ctx.moveTo(halfW, -halfH + 2);
    ctx.lineTo(halfW + 8, -halfH + 6);
    ctx.lineTo(halfW, -halfH + 8);
    ctx.closePath();
    ctx.fill();
    // White lower muzzle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(halfW - 4, -halfH + 6);
    ctx.lineTo(halfW + 7, -halfH + 6.5);
    ctx.lineTo(halfW, -halfH + 8.5);
    ctx.closePath();
    ctx.fill();
    // Shiny black nose tip
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(halfW + 7, -halfH + 5, 2.5, 2.5);

    // 5. Pointed Black-Backed Ears with Pink Fluff
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.moveTo(halfW - 11, -halfH);
    ctx.lineTo(halfW - 7, -halfH - 9);
    ctx.lineTo(halfW - 3, -halfH);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fda4af';
    ctx.beginPath();
    ctx.moveTo(halfW - 9, -halfH);
    ctx.lineTo(halfW - 7, -halfH - 6);
    ctx.lineTo(halfW - 5, -halfH);
    ctx.closePath();
    ctx.fill();

    // 6. Sly Dark Intelligent Eye with Specular Catchlight
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(halfW - 5, -halfH + 3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.fillRect(halfW - 6, -halfH + 2, 1.5, 1.5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(halfW - 5, -halfH + 2.5, 1, 1);

    // 7. Sleek Black Stocking Paws
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-halfW + 4 + runCycle, halfH - 6, 3, 7);
    ctx.fillRect(-halfW + 10 - runCycle, halfH - 6, 3, 7);
    ctx.fillRect(halfW - 12 - runCycle, halfH - 6, 3, 7);
    ctx.fillRect(halfW - 6 + runCycle, halfH - 6, 3, 7);

    ctx.restore();
  }

  public drawBearSprite(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    facingLeft: boolean,
    animTimer: number,
    scale: number = 1
  ) {
    ctx.save();
    ctx.scale(scale * (facingLeft ? -1 : 1), scale);
    const halfW = width / 2;
    const halfH = height / 2;

    const walk = Math.sin(animTimer * 8) * 3.5;

    // 1. Heavy Shoulder Hump & Massive Torso
    ctx.fillStyle = '#451a03'; // Deep rich chocolate brown
    ctx.fillRect(-halfW + 2, -halfH + 8, width - 6, height - 14);
    // Bulky shoulder hump
    ctx.fillStyle = '#5c2207';
    ctx.beginPath();
    ctx.ellipse(-halfW + 18, -halfH + 7, 16, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    // Warm caramel fur highlights along flanks
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-halfW + 6, -halfH + 5, 20, 5);
    ctx.fillRect(-halfW + 10, -halfH + 14, 18, 4);

    // 2. Thick Round Bear Tail Nub
    ctx.fillStyle = '#3a1503';
    ctx.beginPath();
    ctx.arc(-halfW + 2, -halfH + 12, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // 3. Imposing Heavy Bear Head & Snout
    ctx.fillStyle = '#451a03';
    ctx.fillRect(halfW - 18, -halfH + 2, 18, 18);
    // Heavy snout extending forward
    ctx.fillStyle = '#78350f';
    ctx.fillRect(halfW - 4, -halfH + 8, 10, 11);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(halfW - 2, -halfH + 10, 8, 7);
    // Wet black leather nose pad
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(halfW + 4, -halfH + 9, 3.5, 3.5);
    // Dangerous white fangs
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(halfW + 1, -halfH + 16);
    ctx.lineTo(halfW + 3, -halfH + 19);
    ctx.lineTo(halfW + 5, -halfH + 16);
    ctx.closePath();
    ctx.fill();

    // 4. Rounded Bear Ears with Tan Rims
    ctx.fillStyle = '#3a1503';
    ctx.beginPath();
    ctx.arc(halfW - 13, -halfH - 1, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.arc(halfW - 13, -halfH - 1, 3, 0, Math.PI * 2);
    ctx.fill();

    // 5. Deep Menacing Glowing Eyes
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(halfW - 9, -halfH + 6, 3, 3);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(halfW - 8, -halfH + 6.5, 1.5, 1.5);

    // 6. Colossal Paws with Sharp Curved White Claws
    ctx.fillStyle = '#290c02';
    // Hind heavy paws
    ctx.fillRect(-halfW + 4 + walk, halfH - 8, 9, 9);
    ctx.fillRect(-halfW + 16 - walk, halfH - 8, 9, 9);
    // Front paws
    ctx.fillRect(halfW - 20 - walk, halfH - 8, 9, 9);
    ctx.fillRect(halfW - 8 + walk, halfH - 8, 9, 9);
    // Sharp curved white claws
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(halfW + 1 + walk, halfH - 3, 3, 3);
    ctx.fillRect(halfW - 11 - walk, halfH - 3, 3, 3);

    ctx.restore();
  }

  // --- Enemies (Wolf, Fox, Bear): Render in-combat on platforms ---

  public renderEnemy(enemy: Enemy, camera: Camera) {
    if (enemy.state === 'defeated') return;
    const ctx = this.ctx;
    const sx = enemy.x - camera.x;
    const sy = enemy.y - camera.y;

    if (sx + enemy.width < -60 || sx > this.canvas.width + 60) return;

    ctx.save();

    if (enemy.hurtTimer > 0) {
      // Subtle hurt blink/alpha so the fox/wolf/bear texture and detail are never replaced or lost
      ctx.globalAlpha = 0.75;
    }

    const isLeft = enemy.facing === 'left';
    ctx.translate(sx + enemy.width / 2, sy + enemy.height / 2);

    if (enemy.type === 'wolf') {
      this.drawWolfSprite(ctx, enemy.width, enemy.height, isLeft, enemy.animTimer);
    } else if (enemy.type === 'fox') {
      this.drawFoxSprite(ctx, enemy.width, enemy.height, isLeft, enemy.animTimer);
    } else {
      this.drawBearSprite(ctx, enemy.width, enemy.height, isLeft, enemy.animTimer);
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

    // 3. Colossal Cockatrice Boss Model (Scaled, Magnificent & Fearsome!)
    const sx = boss.x - camera.x;
    const sy = boss.y - camera.y;

    if (sx + boss.width < -140 || sx > this.canvas.width + 140) return;

    ctx.save();
    const cx = sx + boss.width / 2;
    const cy = sy + boss.height / 2;
    ctx.translate(cx, cy);

    // Apply scale so the boss is huge and imposing!
    const bossScale = 1.75;
    ctx.scale(bossScale, bossScale);

    // Invulnerability blink
    if (boss.invulnerableTimer > 0 && Math.sin(time * 35) > 0) {
      ctx.globalAlpha = 0.45;
    }

    const isLeft = boss.facing === 'left';
    if (isLeft) ctx.scale(-1, 1);

    const isStunned = boss.state === 'stunned';
    const isPreparingFire = boss.state === 'prepare_fire' || boss.state === 'inferno_flame';
    const isDefeated = boss.state === 'defeated';
    const defeatSub = boss.defeatSubState;
    const isSlumpedLookingDown = isDefeated && (defeatSub === 'falling' || defeatSub === 'ground_talk_1');
    const isEnragedLookingAtPlayer = isDefeated && defeatSub === 'ground_talk_2';
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
      // Regrown healthy scales & pristine plumage details!
      ctx.save();
      ctx.strokeStyle = isRegrowing ? '#86efac' : '#34d399';
      ctx.lineWidth = 1.2;
      for (let r = 0; r < 5; r++) {
        ctx.beginPath();
        ctx.arc(-8 + r * 7, 8 + bodyBob, 5, Math.PI * 0.2, Math.PI * 0.8);
        ctx.stroke();
      }
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

    // Glowing amber wing vein lines
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(34, -20);
    ctx.lineTo(15, 12);
    ctx.moveTo(18, -20);
    ctx.lineTo(2, 18);
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

    // 5. Extended Muscular Scaled Serpent Neck
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

    // Sharp Ivory Dragon Fangs inside the open maw!
    if (jawDrop > 3) {
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
    } else if (isSlumpedLookingDown) {
      // Defeated on ground, looking down at the floor!
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(headX + 6, headY - 1, 6, 0, Math.PI * 2);
      ctx.fill();
      // Heavy drooped eyelid
      ctx.fillStyle = '#047857';
      ctx.fillRect(headX + 1, headY - 6, 12, 6);
      // Downcast dull eye slit looking at floor
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(headX + 5, headY + 1, 3, 3);
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
    const isDefeatTalk = boss.state === 'defeated' && (boss.defeatSubState === 'ground_talk_1' || boss.defeatSubState === 'ground_talk_2');
    if (!isIntro && !isDefeatTalk) return;

    const ctx = this.ctx;
    const w = this.canvas.width;

    let fullText = '';
    if (isIntro) {
      const introDialogues = [
        "Who dares to complete my challenges?",
        "Well... I guess I just need to spice things up..!"
      ];
      fullText = introDialogues[boss.dialogueIndex] || '';
    } else {
      const defeatDialogues = [
        "You may have defeated me...",
        "BUT I WILL COME BACK!!!"
      ];
      fullText = defeatDialogues[boss.dialogueIndex] || '';
    }
    const displayText = fullText.slice(0, boss.dialogueCharIndex);

    // Position dialogue with compact, sleek dimensions cleanly below the top boss bar / intro card!
    const bubbleW = Math.min(470, w - 24);
    const bubbleH = 76;
    const bubbleX = (w - bubbleW) / 2;
    const bubbleY = isIntro ? 92 : 72;

    ctx.save();

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
    const portraitY = bubbleY + 12;
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

    // Glowing ruby dragon eye with vertical slit pupil
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(pCenter + 2, pMiddle + 3, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(pCenter + 1.5, pMiddle, 1.8, 6.5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(pCenter + 3, pMiddle + 1, 1.5, 1.5);

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

    // 7. Spoken Dialogue Text with High Contrast & Rich Pixel Font
    ctx.fillStyle = boss.defeatSubState === 'ground_talk_2' ? '#ef4444' : (boss.defeatSubState === 'ground_talk_1' ? '#fed7aa' : '#fef08a');
    ctx.font = boss.defeatSubState === 'ground_talk_2' ? '700 11px "Press Start 2P", monospace' : '700 10.5px "Silkscreen", monospace';
    ctx.shadowColor = boss.defeatSubState === 'ground_talk_2' ? '#7f1d1d' : '#000000';
    ctx.shadowBlur = boss.defeatSubState === 'ground_talk_2' ? 6 : 3;
    const isTyping = boss.dialogueCharIndex < fullText.length;
    const cursor = (isTyping && Math.floor(Date.now() / 250) % 2 === 0) ? "▮" : "";
    ctx.fillText(`"${displayText}${cursor}"`, textStartX + 2, bubbleY + 41);
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
    if (boss.state === 'defeated') return;
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

    for (let c = 0; c < totalCubes; c++) {
      const cx = cubeStartX + c * (cubeW + cubeGap);
      const cubeMinHP = c * 20;
      const cubeMaxHP = (c + 1) * 20;
      const cubeFraction = Math.max(0, Math.min(1, (boss.health - cubeMinHP) / 20));

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
        width: player.width,
        height: player.height,
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

        // 2. Flowing Cape of Hackles sweeping down back
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

        // 8. Dinosaurian Scaled Legs with Lethal Calcified Fighting Spurs!
        const footY = isJumping ? halfH - 4 : halfH - 1.5;
        ctx.fillStyle = '#c2410c';
        // Back leg
        ctx.fillRect(-7 + footCycle, footY - 5, 5, 7.5);
        ctx.fillRect(-9 + footCycle, footY + 1.5, 9.5, 3.5);
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

        // Feather bars across back & breast
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

        // 7. Sturdy smooth armored feet (no spurs, true to biology!)
        const footY = isJumping ? halfH - 4 : halfH - 1.5;
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(-7 + footCycle, footY - 5, 5, 7.5);
        ctx.fillRect(-8 + footCycle, footY + 1.5, 9.5, 3.5);
        ctx.fillRect(4 - footCycle, footY - 5, 5, 7.5);
        ctx.fillRect(3 - footCycle, footY + 1.5, 10, 3.5);

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

      // Standard Baby Chick / Colorful Skin Adaptive Feather Armor
      const bW = 10 * babyScale;
      const bH = 8 * babyScale;
      const bX = -bW / 2;
      const bY = -bH / 2 + 1.5 + walkBounce;

      // Subtle glowing magical aura for diamond/gold or colorful skin
      if (isDiamond || isGold || hasColorfulSkin) {
        ctx.fillStyle = auraGlow;
        ctx.beginPath();
        ctx.ellipse(0, walkBounce, bW * 0.9, bH * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // A. Cute Mini Feathered Crest Diadem on Baby Head
      const hW = 10 * babyScale;
      const hX = -hW / 2 + 1;
      const hY = -halfH + walkBounce - 2.5;

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
    const cuirassW = isJuvenile ? 15 : (isTeen ? 20 : 25);
    const cuirassH = isJuvenile ? 14 : (isTeen ? 18 : 22);
    const cuirassX = -cuirassW / 2 + 1;
    const cuirassY = -cuirassH / 2 + (isJuvenile ? 1 : 2) + walkBounce;

    // A. Radiant Enchanted Aura
    if (isDiamond || isGold || hasColorfulSkin) {
      ctx.fillStyle = auraGlow;
      ctx.beginPath();
      ctx.ellipse(0, walkBounce, halfW * 0.95, halfH * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. FEATHERED BATTLE CREST / HELM PLUME (Forged swept-back plumage crest)
    // ─────────────────────────────────────────────────────────────────────────
    const helmW = isJuvenile ? 15 : (isTeen ? 18 : 22);
    const hx = isJuvenile ? 0 : 1;
    const hy = -halfH + walkBounce - (isJuvenile ? 3 : (isTeen ? 5 : 7));

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
    // 2. LAYERED ARMORED FEATHER BREASTPLATE (PLUMED CUIRASS)
    // ─────────────────────────────────────────────────────────────────────────
    // A. Gorget Plate (Armored neck collar with flared wing flanges)
    ctx.fillStyle = pal.dark;
    ctx.fillRect(cuirassX - 2, cuirassY - 2, cuirassW + 4, 5);
    ctx.fillStyle = pal.base;
    ctx.fillRect(cuirassX - 1, cuirassY - 1, cuirassW + 2, 3.5);
    ctx.fillStyle = accentTrim;
    ctx.fillRect(cuirassX, cuirassY - 0.5, cuirassW, 1.5);

    // B. Main Cuirass Outer Border
    ctx.fillStyle = pal.dark;
    ctx.fillRect(cuirassX - 1, cuirassY + 2, cuirassW + 2, cuirassH - 1);
    ctx.fillStyle = pal.base;
    ctx.fillRect(cuirassX, cuirassY + 3, cuirassW, cuirassH - 3);

    // C. Overlapping Sculpted Feather Scale Rows (Avian Scallop / Chevron Plumes)
    const rowCount = isJuvenile ? 2 : 3;
    const scalesPerRow = isJuvenile ? 3 : 4;
    const rowH = (cuirassH - 5) / rowCount;

    for (let r = 0; r < rowCount; r++) {
      const ry = cuirassY + 4 + r * rowH;
      const scaleW = cuirassW / scalesPerRow;

      for (let s = 0; s < scalesPerRow; s++) {
        const sx = cuirassX + s * scaleW;

        // Individual feather scale plate with chevron vane
        ctx.fillStyle = pal.shadow;
        ctx.fillRect(sx + 0.5, ry + rowH - 2, scaleW - 1, 2);
        ctx.fillStyle = pal.bright;
        ctx.fillRect(sx + 1, ry + 0.5, scaleW - 2, 1.5);

        // Center spine / feather quill on each scale
        ctx.fillStyle = accentTrim;
        ctx.fillRect(sx + scaleW / 2 - 0.5, ry + 1, 1, rowH - 2);

        // Micro rivet stud on outer scales
        if (s === 0 || s === scalesPerRow - 1) {
          ctx.fillStyle = pal.shine;
          ctx.fillRect(sx + (s === 0 ? 1 : scaleW - 2), ry + 1, 1, 1);
        }
      }
    }

    // D. Lower Plume Vanes (Pointed feather armor tails curving down over belly)
    const bottomPoints = isJuvenile ? 3 : (isTeen ? 4 : 5);
    const ptW = cuirassW / bottomPoints;
    for (let p = 0; p < bottomPoints; p++) {
      const px = cuirassX + p * ptW;
      const py = cuirassY + cuirassH;
      ctx.fillStyle = pal.dark;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + ptW / 2, py + 3.5);
      ctx.lineTo(px + ptW, py);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = accentTrim;
      ctx.beginPath();
      ctx.moveTo(px + 0.5, py);
      ctx.lineTo(px + ptW / 2, py + 2.5);
      ctx.lineTo(px + ptW - 0.5, py);
      ctx.closePath();
      ctx.fill();
    }

    // E. Majestic Center Heraldic Crest (Diamond Star / Sun Ruby / Mythril Blade)
    const emW = isJuvenile ? 5 : (isTeen ? 7 : 9);
    const emH = emW;
    const emX = cuirassX + cuirassW / 2 - emW / 2;
    const emY = cuirassY + cuirassH / 2 - emH / 2;

    ctx.fillStyle = pal.dark;
    ctx.fillRect(emX - 1, emY - 1, emW + 2, emH + 2);
    ctx.fillStyle = pal.shine;
    ctx.fillRect(emX, emY, emW, emH);
    ctx.fillStyle = gemAccent;
    ctx.fillRect(emX + 1, emY + 1, emW - 2, emH - 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(emX + emW / 2 - 0.5, emY + emH / 2 - 0.5, 1.5, 1.5);

    // ─────────────────────────────────────────────────────────────────────────
    // 3. RAZOR FEATHER WING PAULDRONS (Articulated Wing Coverts & Flight Blades)
    // ─────────────────────────────────────────────────────────────────────────
    const pwX = -halfW * 0.72 - (isAdult ? 3 : 1);
    const pwY = -halfH * 0.28 + walkBounce;
    const pW = isJuvenile ? 8 : (isTeen ? 11 : 14);
    const pH = isJuvenile ? 8 : (isTeen ? 11 : 13);

    // Base shoulder plate
    ctx.fillStyle = pal.dark;
    ctx.fillRect(pwX - 1, pwY - 1, pW + 2, pH + 2);
    ctx.fillStyle = pal.base;
    ctx.fillRect(pwX, pwY, pW, pH);
    ctx.fillStyle = pal.bright;
    ctx.fillRect(pwX + 1, pwY + 1, pW - 2, 2.5);
    ctx.fillStyle = pal.shine;
    ctx.fillRect(pwX + 1.5, pwY + 1.5, 2, 2);

    // Trailing razor flight-feather blades cascading off shoulder
    const wFeatherCount = isJuvenile ? 2 : (isTeen ? 3 : 4);
    for (let wf = 0; wf < wFeatherCount; wf++) {
      const fx = pwX - (wf + 1) * (isAdult ? 3 : 2.5);
      const fy = pwY + 3 + wf * (isAdult ? 3.5 : 2.8);
      const fLen = (isAdult ? 9 : 7) - wf * 1.2;

      ctx.fillStyle = pal.dark;
      ctx.fillRect(fx - 0.5, fy - 0.5, fLen + 1, 3);
      ctx.fillStyle = pal.base;
      ctx.fillRect(fx, fy, fLen, 2);
      ctx.fillStyle = accentTrim;
      ctx.fillRect(fx, fy, 2, 2);
      ctx.fillStyle = pal.quill;
      ctx.fillRect(fx + 2, fy + 0.5, fLen - 2, 1);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. ARMORED FEATHER GREAVES & WINGED ANKLE SPURS (Teen & Adult)
    // ─────────────────────────────────────────────────────────────────────────
    if (isTeen || isAdult) {
      const gW = isAdult ? 6 : 5;
      const gH = isAdult ? 8 : 6;
      const gy = halfH - (isAdult ? 7 : 6);

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
      const ty = -halfH * 0.15 + walkBounce;
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

    ctx.font = '700 9.5px "Silkscreen", monospace';
    ctx.fillStyle = '#e2e8f0';
    ctx.shadowBlur = 4;
    ctx.fillText("Press Space or Tap Screen to Hatch & Play", w / 2, h * 0.88);
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

    // Sign button right below: "TAP SCREEN TO RETURN TO MENU"
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

    ctx.restore();
  }

  // --- Particles & Floating Text ---

  public renderParticles(particles: Particle[], camera: Camera) {
    const ctx = this.ctx;
    particles.forEach(p => {
      const sx = p.x - camera.x;
      const sy = p.y - camera.y;
      if (sx < -20 || sx > this.canvas.width + 20) return;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.fillRect(sx - p.size / 2, sy - p.size / 2, p.size, p.size);
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
