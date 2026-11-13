import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, RotateCcw, Menu as MenuIcon, Volume2, VolumeX, Music,
  Lock, Check, Trophy, Shield, Sword, X, ChevronRight, ChevronUp, ChevronDown,
  Flame, Zap, AlertTriangle, HelpCircle, Settings,
  Star, Heart, Sparkles, Map, Scroll, Award, Store, ShoppingBag, Palette
} from 'lucide-react';
import { GameScreen, SaveData, GrowthStage, ChickenGender, ArmorType, SwordType } from '../game/types';
import { LEVELS } from '../game/levels';
import { Renderer } from '../game/renderer';
import { getQuestsWithStatus, getBadgesWithStatus, countUnclaimedQuests } from '../game/quests';
import { audio } from '../game/audio';
import { CHICKEN_SKINS, getSkinDefinition } from '../game/skins';
import { BadgeItem } from '../game/types';
import { 
  PixelQuestIcon, PixelChick, PixelJuvenile, PixelRooster, 
  PixelHen, PixelCrown, PixelBell, PixelLock, PixelSecret, PixelCheck,
  PixelCoins, PixelShop
} from './PixelIcons';

interface ModalProps {
  currentScreen: GameScreen;
  saveData: SaveData;
  activeLevelId: number;
  coinsEarned: number;
  evolutionStage: GrowthStage | null;
  renderer?: Renderer | null;
  foundBadge?: BadgeItem | null;
  onDismissFoundBadge?: () => void;
  onStartGame: (levelId?: number, watchIntro?: boolean) => void;
  onStartNewRun?: () => void;
  onSelectGender: (gender: ChickenGender) => void;
  onResume: () => void;
  onRestartLevel: () => void;
  onRespawn?: () => void;
  onNextLevel: () => void;
  onSelectLevel: (levelId: number) => void;
  onReturnToMenu: () => void;
  onOpenScreen: (screen: GameScreen) => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onResetProgress: () => void;
  onClaimQuest?: (questId: string, rewardCoins: number) => void;
  onPurchaseUpgrade?: (cost: number, itemType: 'heart' | 'speed' | 'jump' | 'magnet' | 'revive' | 'lucky_corn' | 'iron_beak' | 'glider' | 'plumage' | 'armor' | 'sword' | 'shield', tierValue?: string) => boolean;
  onMarkShopVisited?: () => void;
  onClaimBossReward?: () => void;
  onFinishWorldLoading?: () => void;
  onToggleShopStatus?: () => void;
  onBuySkin?: (skinId: string, cost: number) => boolean;
  onEquipSkin?: (skinId: string) => void;
  onUnlockSkin?: (skinId: string, autoEquip?: boolean) => void;
  onChangeDifficulty?: (diff: 'easy' | 'normal' | 'hard') => void;
  currentUser?: { email?: string | null; displayName?: string | null; uid?: string } | null;
  onLogOut?: () => void;
}

// Tablet and Mobile Ultra-Loose Continuous Smooth Scroll Buttons
const TabletScrollButtons: React.FC<{
  containerRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
  step?: number;
}> = ({ containerRef, className = '', step = 320 }) => {
  const animFrameRef = useRef<number | null>(null);
  const isHoldingRef = useRef<boolean>(false);
  const velocityRef = useRef<number>(0);

  const scrollElement = (delta: number, smooth = true) => {
    const el = containerRef.current;
    if (!el) return;
    let didScroll = false;
    // Check if the element itself can scroll
    if (el.scrollHeight > el.clientHeight + 2) {
      el.scrollBy({ top: delta, behavior: smooth ? 'smooth' : 'auto' });
      didScroll = true;
    }
    // Check if the parent element can scroll
    if (el.parentElement && el.parentElement.scrollHeight > el.parentElement.clientHeight + 2) {
      el.parentElement.scrollBy({ top: delta, behavior: smooth ? 'smooth' : 'auto' });
      didScroll = true;
    }
    // Check query selector for any overflow child container
    const scrollChild = el.querySelector<HTMLElement>('.overflow-y-auto');
    if (scrollChild && scrollChild.scrollHeight > scrollChild.clientHeight + 2) {
      scrollChild.scrollBy({ top: delta, behavior: smooth ? 'smooth' : 'auto' });
      didScroll = true;
    }
    // Fallback: unconditional scroll on both
    if (!didScroll) {
      el.scrollBy({ top: delta, behavior: smooth ? 'smooth' : 'auto' });
      if (el.parentElement) el.parentElement.scrollBy({ top: delta, behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  const startContinuousScroll = (direction: 'up' | 'down') => {
    isHoldingRef.current = true;
    velocityRef.current = direction === 'up' ? -20 : 20;

    const loop = () => {
      if (!isHoldingRef.current) return;
      scrollElement(velocityRef.current, false);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    // Snappy immediate loose jump on touch start
    scrollElement(direction === 'up' ? -step : step, true);

    // If held down, glide smoothly and loosely without stiffness
    setTimeout(() => {
      if (isHoldingRef.current && !animFrameRef.current) {
        animFrameRef.current = requestAnimationFrame(loop);
      }
    }, 120);
  };

  const stopContinuousScroll = () => {
    isHoldingRef.current = false;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <div className={`flex items-center justify-center gap-2 py-1 select-none pointer-events-auto z-20 ${className}`}>
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          startContinuousScroll('up');
        }}
        onPointerUp={stopContinuousScroll}
        onPointerLeave={stopContinuousScroll}
        onPointerCancel={stopContinuousScroll}
        onClick={() => scrollElement(-step, true)}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-yellow-500/25 via-slate-900/95 to-yellow-500/25 hover:from-yellow-400 hover:to-amber-500 active:from-yellow-300 active:to-yellow-400 border-2 border-yellow-400 text-yellow-300 active:text-slate-950 font-pixel-arcade text-[8.5px] sm:text-[9.5px] shadow-[0_3px_10px_rgba(245,158,11,0.35)] active:scale-95 transition-all cursor-pointer touch-manipulation"
        title="Scroll Up (Tap or Hold to Glide)"
        aria-label="Scroll Up"
      >
        <ChevronUp className="w-3.5 h-3.5 stroke-[3] text-yellow-400" />
        <span>SCROLL UP</span>
      </button>
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          startContinuousScroll('down');
        }}
        onPointerUp={stopContinuousScroll}
        onPointerLeave={stopContinuousScroll}
        onPointerCancel={stopContinuousScroll}
        onClick={() => scrollElement(step, true)}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-yellow-500/25 via-slate-900/95 to-yellow-500/25 hover:from-yellow-400 hover:to-amber-500 active:from-yellow-300 active:to-yellow-400 border-2 border-yellow-400 text-yellow-300 active:text-slate-950 font-pixel-arcade text-[8.5px] sm:text-[9.5px] shadow-[0_3px_10px_rgba(245,158,11,0.35)] active:scale-95 transition-all cursor-pointer touch-manipulation"
        title="Scroll Down (Tap or Hold to Glide)"
        aria-label="Scroll Down"
      >
        <ChevronDown className="w-3.5 h-3.5 stroke-[3] text-yellow-400" />
        <span>SCROLL DOWN</span>
      </button>
    </div>
  );
};

// Mini animated chicken model canvas preview component
const ChickenPreviewCanvas: React.FC<{
  gender: ChickenGender;
  stage: GrowthStage;
  armor?: ArmorType;
  sword?: SwordType;
  skin?: string;
  renderer?: Renderer | null;
  size?: number;
}> = ({ gender, stage, armor = 'none', sword = 'none', skin = 'classic', renderer, size = 120 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const localRendererRef = useRef<Renderer | null>(null);

  useEffect(() => {
    let animId: number;
    const startTime = performance.now();

    const render = (now: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const time = (now - startTime) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Radial pedestal glow
      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height * 0.72, 4,
        canvas.width / 2, canvas.height * 0.72, canvas.width * 0.46
      );
      if (gender === 'rooster') {
        grad.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
        grad.addColorStop(0.65, 'rgba(245, 158, 11, 0.12)');
        grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      } else {
        grad.addColorStop(0, 'rgba(244, 63, 94, 0.35)');
        grad.addColorStop(0.65, 'rgba(244, 63, 94, 0.12)');
        grad.addColorStop(1, 'rgba(244, 63, 94, 0)');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Circular pedestal base
      ctx.fillStyle = gender === 'rooster' ? '#78350f' : '#881337';
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, canvas.height * 0.76, canvas.width * 0.35, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = gender === 'rooster' ? '#fde047' : '#fda4af';
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, canvas.height * 0.75, canvas.width * 0.32, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Render model with automatic renderer fallback
      let activeRenderer = renderer;
      if (!activeRenderer) {
        if (!localRendererRef.current) {
          localRendererRef.current = new Renderer(canvas);
        }
        activeRenderer = localRendererRef.current;
      }

      if (activeRenderer) {
        const scale = stage === 'adult' ? 1.4 : (stage === 'teen' ? 1.6 : (stage === 'juvenile' ? 1.8 : 2.0));
        activeRenderer.renderCharacterModel(
          ctx,
          canvas.width / 2,
          canvas.height * 0.52,
          gender,
          stage,
          armor,
          sword,
          {
            facing: 'right',
            scale,
            time,
            isMoving: false,
            isJumping: false,
            isAttacking: false,
            skin,
          }
        );
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gender, stage, armor, sword, skin, renderer]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded-2xl bg-slate-950/70 border border-slate-700/60 shadow-inner block mx-auto"
    />
  );
};

// --- Official Cock a Doodle Static Emblem Logo Badge ---
const CrackingEggLogoCanvas: React.FC<{
  size?: number;
}> = ({ size = 120 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling for ultra-crisp static rendering
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 4;

    ctx.clearRect(0, 0, size, size);

    // 1. Circular Crest Mask
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    // Deep royal shield background gradient
    const bgGrad = ctx.createRadialGradient(cx, cy * 0.75, 4, cx, cy, radius);
    bgGrad.addColorStop(0, '#78350f');     // Warm glowing amber center
    bgGrad.addColorStop(0.35, '#451a03');   // Deep mahogany
    bgGrad.addColorStop(0.7, '#1e1b4b');    // Royal deep navy
    bgGrad.addColorStop(1, '#090815');      // Midnight slate border
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, size, size);

    // Static radiant sunburst rays (completely still)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = 'rgba(251, 191, 36, 0.15)';
    for (let r = 0; r < 12; r++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, (r * Math.PI) / 6 - 0.1, (r * Math.PI) / 6 + 0.1);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Golden ambient core glow
    const coreGlow = ctx.createRadialGradient(cx, cy, 4, cx, cy, radius * 0.85);
    coreGlow.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
    coreGlow.addColorStop(0.45, 'rgba(245, 158, 11, 0.22)');
    coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = coreGlow;
    ctx.fillRect(0, 0, size, size);

    // 2. Crossed Hero Knight Swords (Behind Rooster)
    const drawSword = (angle: number) => {
      ctx.save();
      ctx.translate(cx, cy + 6);
      ctx.rotate(angle);

      // Steel blade
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(-3, -38);
      ctx.lineTo(0, -48);
      ctx.lineTo(3, -38);
      ctx.lineTo(3, 10);
      ctx.lineTo(-3, 10);
      ctx.closePath();
      ctx.fill();

      // Blade center fuller & shadow
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(0, -48);
      ctx.lineTo(3, -38);
      ctx.lineTo(3, 10);
      ctx.lineTo(0, 10);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-0.75, -44, 1.5, 50);

      // Golden crossguard
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.roundRect(-10, 9, 20, 4, 2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-8, 9.5, 16, 1.5);

      // Ruby in crossguard center
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, 11, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Leather hilt
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-2, 13, 4, 11);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-2, 15, 4, 1.5);
      ctx.fillRect(-2, 19, 4, 1.5);

      // Golden pommel
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 26, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(-1, 25, 1.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    drawSword(-Math.PI / 4);
    drawSword(Math.PI / 4);

    // 3. Proud Rooster (Cock a Doodle) Hero Portrait
    // A. Arching Sickle Tail Feathers (Left Side)
    // Emerald Green Tail
    ctx.fillStyle = '#047857';
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy + 22);
    ctx.bezierCurveTo(cx - 40, cy + 8, cx - 44, cy - 22, cx - 22, cy - 34);
    ctx.bezierCurveTo(cx - 30, cy - 14, cx - 24, cy + 6, cx - 8, cy + 24);
    ctx.closePath();
    ctx.fill();

    // Peacock Blue Tail Feather
    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy + 24);
    ctx.bezierCurveTo(cx - 48, cy + 18, cx - 48, cy - 8, cx - 30, cy - 22);
    ctx.bezierCurveTo(cx - 38, cy - 4, cx - 32, cy + 12, cx - 10, cy + 26);
    ctx.closePath();
    ctx.fill();

    // Cyan highlight sheen on tail
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy + 18);
    ctx.bezierCurveTo(cx - 36, cy + 6, cx - 40, cy - 18, cx - 24, cy - 30);
    ctx.stroke();

    // B. Heroic Chest and Shoulder (Navy Armor with Gold Trim)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy + 12);
    ctx.quadraticCurveTo(cx - 4, cy + 42, cx + 24, cy + 40);
    ctx.quadraticCurveTo(cx + 34, cy + 28, cx + 22, cy + 12);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy + 14);
    ctx.quadraticCurveTo(cx - 2, cy + 38, cx + 22, cy + 36);
    ctx.quadraticCurveTo(cx + 30, cy + 26, cx + 18, cy + 14);
    ctx.closePath();
    ctx.fill();

    // Breast feathers / armor scalloping
    ctx.fillStyle = '#334155';
    for (let f = 0; f < 3; f++) {
      ctx.beginPath();
      ctx.arc(cx + 2 + f * 7, cy + 26, 4, 0, Math.PI);
      ctx.fill();
    }

    // C. Fiery Golden Neck Hackles (Flowing Feathers)
    // Dark amber background hackles
    ctx.fillStyle = '#9a3412';
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 8);
    ctx.lineTo(cx - 18, cy + 18);
    ctx.lineTo(cx - 4, cy + 14);
    ctx.lineTo(cx - 8, cy + 24);
    ctx.lineTo(cx + 8, cy + 16);
    ctx.lineTo(cx + 6, cy + 24);
    ctx.lineTo(cx + 20, cy + 14);
    ctx.lineTo(cx + 14, cy - 6);
    ctx.closePath();
    ctx.fill();

    // Vibrant Orange Hackles
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy - 6);
    ctx.lineTo(cx - 14, cy + 14);
    ctx.lineTo(cx - 2, cy + 12);
    ctx.lineTo(cx - 4, cy + 20);
    ctx.lineTo(cx + 8, cy + 14);
    ctx.lineTo(cx + 4, cy + 20);
    ctx.lineTo(cx + 16, cy + 12);
    ctx.lineTo(cx + 12, cy - 4);
    ctx.closePath();
    ctx.fill();

    // Golden Yellow Hackle Highlights
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy - 4);
    ctx.lineTo(cx - 10, cy + 10);
    ctx.lineTo(cx - 1, cy + 8);
    ctx.lineTo(cx - 1, cy + 16);
    ctx.lineTo(cx + 7, cy + 10);
    ctx.lineTo(cx + 12, cy + 8);
    ctx.lineTo(cx + 10, cy - 2);
    ctx.closePath();
    ctx.fill();

    // D. Head Profile (Facing Right)
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(cx + 2, cy - 10, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(cx + 4, cy - 11, 12, 0, Math.PI * 2);
    ctx.fill();

    // Silky White Earlobe
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(cx - 2, cy - 7, 4.5, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.stroke();

    // E. Glorious 5-Point Crimson Rooster Crown Comb
    // Shaded base comb
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy - 15);
    ctx.lineTo(cx - 15, cy - 25);
    ctx.lineTo(cx - 9, cy - 22);
    ctx.lineTo(cx - 6, cy - 31);
    ctx.lineTo(cx - 1, cy - 23);
    ctx.lineTo(cx + 5, cy - 33);
    ctx.lineTo(cx + 9, cy - 23);
    ctx.lineTo(cx + 15, cy - 29);
    ctx.lineTo(cx + 16, cy - 19);
    ctx.lineTo(cx + 20, cy - 21);
    ctx.lineTo(cx + 18, cy - 12);
    ctx.closePath();
    ctx.fill();

    // Scarlet Red Comb Body
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(cx - 11, cy - 14);
    ctx.lineTo(cx - 14, cy - 24);
    ctx.lineTo(cx - 8, cy - 21);
    ctx.lineTo(cx - 5, cy - 30);
    ctx.lineTo(cx - 1, cy - 22);
    ctx.lineTo(cx + 5, cy - 32);
    ctx.lineTo(cx + 8, cy - 22);
    ctx.lineTo(cx + 14, cy - 28);
    ctx.lineTo(cx + 15, cy - 18);
    ctx.lineTo(cx + 19, cy - 20);
    ctx.lineTo(cx + 17, cy - 12);
    ctx.closePath();
    ctx.fill();

    // Vibrant Red Comb Highlights
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy - 28);
    ctx.lineTo(cx - 1, cy - 21);
    ctx.lineTo(cx + 5, cy - 30);
    ctx.lineTo(cx + 8, cy - 21);
    ctx.lineTo(cx + 13, cy - 26);
    ctx.lineTo(cx + 13, cy - 16);
    ctx.closePath();
    ctx.fill();

    // Comb Tip Shines
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath();
    ctx.arc(cx - 13.5, cy - 23.5, 1.2, 0, Math.PI * 2);
    ctx.arc(cx - 4.5, cy - 29.5, 1.2, 0, Math.PI * 2);
    ctx.arc(cx + 5, cy - 31.5, 1.4, 0, Math.PI * 2);
    ctx.arc(cx + 14, cy - 27.5, 1.2, 0, Math.PI * 2);
    ctx.arc(cx + 18.5, cy - 19.5, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // F. Ruby Wattle Hanging Under Beak
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.ellipse(cx + 7, cy - 1, 5, 8.5, 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(cx + 6.5, cy - 1.5, 4, 7.5, 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.ellipse(cx + 5.5, cy - 2, 1.8, 4, 0.25, 0, Math.PI * 2);
    ctx.fill();

    // G. Sharp Golden Hero Beak
    // Upper mandible
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(cx + 8, cy - 14);
    ctx.lineTo(cx + 26, cy - 9);
    ctx.lineTo(cx + 9, cy - 7);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(cx + 8, cy - 13);
    ctx.lineTo(cx + 25, cy - 9);
    ctx.lineTo(cx + 9, cy - 9.5);
    ctx.closePath();
    ctx.fill();

    // Beak shine
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(cx + 11, cy - 12);
    ctx.lineTo(cx + 22, cy - 9.5);
    ctx.lineTo(cx + 12, cy - 10.5);
    ctx.closePath();
    ctx.fill();

    // Lower mandible
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(cx + 9, cy - 7);
    ctx.lineTo(cx + 21, cy - 8.5);
    ctx.lineTo(cx + 9, cy - 4.5);
    ctx.closePath();
    ctx.fill();

    // Mouth line
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx + 8, cy - 7.5);
    ctx.lineTo(cx + 24, cy - 9);
    ctx.stroke();

    // Nostril slit
    ctx.fillStyle = '#78350f';
    ctx.fillRect(cx + 11, cy - 12, 1.5, 1);

    // H. Fierce Hero Champion Eye
    // Eye socket shadow
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(cx + 4, cy - 12, 5, 4.5, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Eyeball base (White)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx + 4, cy - 12, 4, 3.5, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Fiery Amber Iris
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(cx + 5, cy - 12, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Black Pupil
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cx + 5.5, cy - 12, 1.6, 0, Math.PI * 2);
    ctx.fill();

    // White Star Glint / Sparkle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx + 5, cy - 13, 0.9, 0, Math.PI * 2);
    ctx.arc(cx + 6.2, cy - 11.2, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Hero eyebrow ridge
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 15);
    ctx.quadraticCurveTo(cx + 5, cy - 17, cx + 9, cy - 14);
    ctx.stroke();

    // I. Hero Collar & Ruby Gem Crest
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(cx + 4, cy + 22, 16, 4, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.ellipse(cx + 4, cy + 21, 14, 2.5, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Ruby Pendant
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(cx + 4, cy + 23);
    ctx.lineTo(cx + 7, cy + 27);
    ctx.lineTo(cx + 4, cy + 32);
    ctx.lineTo(cx + 1, cy + 27);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx + 3, cy + 25, 1.5, 2);

    ctx.restore(); // end circular mask

    // 4. Ornate Static Golden Ring Border with Star Rivets
    ctx.save();
    // Outer shadow rim
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Brilliant golden ring
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner bright yellow highlight
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 1.8, 0, Math.PI * 2);
    ctx.stroke();

    // 8 Cardinal and Ordinal Star Rivets on the Golden Ring
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const rx = cx + Math.cos(angle) * radius;
      const ry = cy + Math.sin(angle) * radius;

      // Ruby/Gold alternating studs
      ctx.fillStyle = i % 2 === 0 ? '#dc2626' : '#fde047';
      ctx.beginPath();
      ctx.arc(rx, ry, i % 2 === 0 ? 2.5 : 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(rx - 0.75, ry - 0.75, 1.5, 1.5);
    }

    ctx.restore();
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="rounded-full shadow-[0_0_28px_rgba(245,158,11,0.45)] block border-2 border-yellow-500/70 select-none"
      title="Cock a Doodle Official Hero Logo"
    />
  );
};

// --- Detailed Silkie Chicken Master Merchant Portrait Canvas ---
const SilkiePortraitCanvas: React.FC<{ size?: number; isSpeaking?: boolean }> = ({ size = 64, isSpeaking = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animId: number;
    const startTime = performance.now();

    const render = (now: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const time = (now - startTime) / 1000;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const cx = size / 2;
      const cy = size / 2;

      ctx.clearRect(0, 0, size, size);

      // Warm golden-amber backdrop
      ctx.fillStyle = '#451a03';
      ctx.fillRect(0, 0, size, size);

      // Radial merchant glow
      const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, size * 0.48);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.5, '#f59e0b');
      grad.addColorStop(1, '#78350f');
      ctx.fillStyle = grad;
      ctx.fillRect(2, 2, size - 4, size - 4);

      // Silkie Chicken Body: Ultra-fluffy snowy white cloud plumage
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(cx, cy + 18, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(cx - 3, cy + 16, 16, 0, Math.PI * 2);
      ctx.fill();

      // Fluffy feather puffs
      const puffs = [
        [-12, 12, 8], [12, 12, 8], [-6, 18, 7], [6, 18, 7], [0, 22, 8]
      ];
      puffs.forEach(([px, py, pr]) => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx + px, cy + py, pr, 0, Math.PI * 2);
        ctx.fill();
      });

      // Dark Slate Face & Beak (Iconic Silkie characteristic: melanistic skin)
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 2, 11, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Signature Turquoise / Sky-Blue Earlobe (The unique biological hallmark of Silkie chickens!)
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.ellipse(cx - 7, cy + 4, 3.5, 4.5, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#67e8f9';
      ctx.fillRect(cx - 8, cy + 2, 1.5, 2.5);

      // Friendly, sparkling anime eye
      const isBlinking = isSpeaking ? (Math.sin(time * 12) > 0.88) : false;
      if (!isBlinking) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(cx + 2, cy - 1, 4.5, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(cx + 2.5, cy - 1, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx + 1.8, cy - 2.2, 1.2, 0, Math.PI * 2);
        ctx.arc(cx + 3.4, cy - 0.2, 0.6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Happy squint while chirping
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(cx + 2, cy - 1, 3.2, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();
      }

      // Animated beak chatter when speaking
      const mouthFlap = isSpeaking ? Math.abs(Math.sin(time * 18)) * 2.5 : 0;
      ctx.fillStyle = '#0f172a';
      // Upper beak
      ctx.beginPath();
      ctx.moveTo(cx + 8, cy);
      ctx.lineTo(cx + 17, cy + 3.5 - mouthFlap * 0.3);
      ctx.lineTo(cx + 8, cy + 4);
      ctx.closePath();
      ctx.fill();
      // Lower beak
      ctx.beginPath();
      ctx.moveTo(cx + 8, cy + 4 + mouthFlap * 0.5);
      ctx.lineTo(cx + 15, cy + 4.5 + mouthFlap * 0.8);
      ctx.lineTo(cx + 8, cy + 7 + mouthFlap);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#475569';
      ctx.fillRect(cx + 8, cy + 2.5, 5, 1);

      // Walnut / Mulberry Comb under crest
      ctx.fillStyle = '#4a044e';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 7, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glorious Fluffy Silkie Pom-Pom Crest (Crown of clouds with animated speech bounce!)
      const bob = isSpeaking ? Math.sin(time * 14) * 1.2 : 0;
      const crestPuffs = [
        [0, -14 + bob, 9], [-8, -12 + bob, 8], [8, -12 + bob, 8],
        [-5, -18 + bob, 7], [5, -18 + bob, 7], [0, -21 + bob, 6],
        [-12, -7 + bob, 6], [12, -7 + bob, 6]
      ];
      crestPuffs.forEach(([px, py, pr]) => {
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(cx + px, cy + py, pr + 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx + px, cy + py, pr, 0, Math.PI * 2);
        ctx.fill();
      });

      // Merchant bow tie / collar
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(cx - 7, cy + 24);
      ctx.lineTo(cx, cy + 22);
      ctx.lineTo(cx - 7, cy + 20);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 7, cy + 24);
      ctx.lineTo(cx, cy + 22);
      ctx.lineTo(cx + 7, cy + 20);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.fillRect(cx - 2, cy + 20.5, 4, 3);

      if (isSpeaking) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [size, isSpeaking]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="rounded-xl border-2 border-yellow-400 shadow-md block bg-amber-950 select-none"
    />
  );
};

export const GameModals: React.FC<ModalProps> = ({
  currentScreen,
  saveData,
  activeLevelId,
  coinsEarned,
  evolutionStage,
  renderer,
  foundBadge,
  onDismissFoundBadge,
  onStartGame,
  onStartNewRun,
  onSelectGender,
  onResume,
  onRestartLevel,
  onRespawn,
  onNextLevel,
  onSelectLevel,
  onReturnToMenu,
  onOpenScreen,
  onToggleSound,
  onToggleMusic,
  onResetProgress,
  onClaimQuest,
  onPurchaseUpgrade,
  onMarkShopVisited,
  onClaimBossReward,
  onFinishWorldLoading,
  onToggleShopStatus,
  onBuySkin,
  onEquipSkin,
  onUnlockSkin,
  onChangeDifficulty,
  currentUser,
  onLogOut,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [selectedGender, setSelectedGender] = useState<ChickenGender>(saveData.gender || 'rooster');
  const [previewStage, setPreviewStage] = useState<GrowthStage>('adult');
  const [questTab, setQuestTab] = useState<'quests' | 'badges'>('quests');
  
  // Real-time clock for 2-hour shop cooldown
  const [nowTime, setNowTime] = useState<number>(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Shop tabs & Appearance preview state
  const [shopTab, setShopTab] = useState<'upgrades' | 'appearance'>('upgrades');
  const [appearanceStage, setAppearanceStage] = useState<GrowthStage>('adult');
  const [previewSkinId, setPreviewSkinId] = useState<string>(saveData.selectedSkin || 'classic');
  const [skinRarityFilter, setSkinRarityFilter] = useState<'ALL' | 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Secret'>('ALL');

  // Post-Boss Silkie Sam dialogue state & Secret Skin / 1,000,000 Coin reward
  const postBossStepRef = useRef<number>(0);
  const postBossTimerRef = useRef<number | null>(null);
  const postBossTimer2Ref = useRef<number | null>(null);
  const postBossTimer3Ref = useRef<number | null>(null);
  const shopSessionActiveRef = useRef<boolean>(false);
  const shopSessionInitialTextRef = useRef<string>("hello welcome to my shop!");
  const shopSessionPostBossCanClaimRef = useRef<boolean>(false);
  const [showSecretSkinModal, setShowSecretSkinModal] = useState<boolean>(false);

  // 1% -> 100% Next-World Loading Screen State (Tap button stays hidden until 100%)
  const [worldLoadPercent, setWorldLoadPercent] = useState<number>(1);
  useEffect(() => {
    if (currentScreen !== 'WORLD_LOADING') {
      setWorldLoadPercent(1);
      return;
    }
    setWorldLoadPercent(1);
    const interval = window.setInterval(() => {
      setWorldLoadPercent(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 24);
    return () => clearInterval(interval);
  }, [currentScreen, activeLevelId]);

  useEffect(() => {
    if (currentScreen !== 'WORLD_LOADING' || worldLoadPercent < 100) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onFinishWorldLoading?.();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentScreen, worldLoadPercent, onFinishWorldLoading]);

  // Tablet & Mobile Scroll Container Refs
  const shopScrollRef = useRef<HTMLDivElement>(null);
  const appearanceScrollRef = useRef<HTMLDivElement>(null);
  const menuScrollRef = useRef<HTMLDivElement>(null);
  const questsScrollRef = useRef<HTMLDivElement>(null);
  const badgesScrollRef = useRef<HTMLDivElement>(null);
  const levelScrollRef = useRef<HTMLDivElement>(null);
  const settingsScrollRef = useRef<HTMLDivElement>(null);
  const howToPlayScrollRef = useRef<HTMLDivElement>(null);
  
  // Silkie Chicken Shopkeeper Dialogue & Speech Audio State
  const initialDialogue = saveData.hasCompletedGame
    ? "oh your back.."
    : (saveData.hasVisitedShop ? "hello again" : "hello welcome to my shop!");
  const [shopkeeperDialogue, setShopkeeperDialogue] = useState<string>(initialDialogue);
  const [displayedDialogue, setDisplayedDialogue] = useState<string>(initialDialogue);
  const [isSilkieSpeaking, setIsSilkieSpeaking] = useState<boolean>(false);
  const typewriterTimerRef = useRef<number | null>(null);

  // Typewriter effect with typewriter chirp sound effect
  const speakDialogue = useCallback((fullText: string, speechType: 'welcome' | 'again' | 'purchase' | 'talk') => {
    if (typewriterTimerRef.current) {
      clearInterval(typewriterTimerRef.current);
      typewriterTimerRef.current = null;
    }

    setShopkeeperDialogue(fullText);
    setDisplayedDialogue('');
    setIsSilkieSpeaking(true);

    // Play signature vocal melodic speech track
    audio.playSilkieSpeech(speechType);

    let charIndex = 0;
    typewriterTimerRef.current = window.setInterval(() => {
      charIndex++;
      setDisplayedDialogue(fullText.slice(0, charIndex));

      // Play light speech typewriter chirp every few characters
      if (charIndex % 3 === 0 && charIndex < fullText.length) {
        audio.playSilkieSpeechChirp(charIndex);
      }

      if (charIndex >= fullText.length) {
        if (typewriterTimerRef.current) {
          clearInterval(typewriterTimerRef.current);
          typewriterTimerRef.current = null;
        }
        setIsSilkieSpeaking(false);
      }
    }, 28);
  }, []);

  // Cleanup typewriter & post-boss intervals on unmount
  useEffect(() => {
    return () => {
      if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
      if (postBossTimerRef.current) clearTimeout(postBossTimerRef.current);
      if (postBossTimer2Ref.current) clearTimeout(postBossTimer2Ref.current);
      if (postBossTimer3Ref.current) clearTimeout(postBossTimer3Ref.current);
    };
  }, []);

  // Track opening the shop & trigger Silkie Sam's voice cleanly once per shop open!
  useEffect(() => {
    if (currentScreen === 'SHOP') {
      if (shopSessionActiveRef.current) return;
      shopSessionActiveRef.current = true;

      if (saveData.hasCompletedGame) {
        const canClaimReward = !saveData.hasClaimedBossReward;
        const hasRewardSkin = Boolean(saveData.unlockedSkins?.includes('thanksgiving_roast'));
        shopSessionPostBossCanClaimRef.current = canClaimReward;
        postBossStepRef.current = 1;
        speakDialogue("oh your back..", 'welcome');

        if (postBossTimerRef.current) clearTimeout(postBossTimerRef.current);
        if (postBossTimer2Ref.current) clearTimeout(postBossTimer2Ref.current);
        if (postBossTimer3Ref.current) clearTimeout(postBossTimer3Ref.current);

        postBossTimerRef.current = window.setTimeout(() => {
          postBossStepRef.current = 2;
          speakDialogue("thank you for saving Mount Cluckmore", 'talk');

          if (canClaimReward) {
            postBossTimer2Ref.current = window.setTimeout(() => {
              postBossStepRef.current = 3;
              speakDialogue("here is your reward", 'purchase');
              onClaimBossReward?.();
              if (!hasRewardSkin) {
                onUnlockSkin?.('thanksgiving_roast', true);
                setPreviewSkinId('thanksgiving_roast');
              }
              postBossTimer3Ref.current = window.setTimeout(() => {
                setShowSecretSkinModal(true);
              }, 1100);
            }, 2600);
          }
        }, 2200);
      } else {
        const isShopClosed = Boolean(saveData.shopClosedUntil && Date.now() < saveData.shopClosedUntil);
        if (isShopClosed) {
          shopSessionInitialTextRef.current = "Sorry, we are currently closed! Please check back later!";
          speakDialogue(shopSessionInitialTextRef.current, 'again');
        } else {
          const isFirst = !saveData.hasVisitedShop;
          const text = isFirst ? "hello welcome to my shop!" : "hello again";
          shopSessionInitialTextRef.current = text;
          speakDialogue(text, isFirst ? 'welcome' : 'again');
          if (isFirst) {
            onMarkShopVisited?.();
          }
        }
      }
    } else {
      shopSessionActiveRef.current = false;
      if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
      if (postBossTimerRef.current) clearTimeout(postBossTimerRef.current);
      if (postBossTimer2Ref.current) clearTimeout(postBossTimer2Ref.current);
      if (postBossTimer3Ref.current) clearTimeout(postBossTimer3Ref.current);
      setIsSilkieSpeaking(false);
    }
  }, [currentScreen, saveData.shopClosedUntil, saveData.hasVisitedShop, saveData.hasCompletedGame, saveData.hasClaimedBossReward, saveData.unlockedSkins, onMarkShopVisited, onClaimBossReward, speakDialogue, onUnlockSkin]);

  // --- Badge Found Celebration Popup Modal ---
  const renderBadgeFoundPopup = () => {
    if (!foundBadge) return null;
    const isSecret = Boolean((foundBadge as any).isSecret);
    const tierColor = isSecret 
      ? 'text-purple-300 drop-shadow-[0_0_12px_rgba(192,132,252,0.8)]'
      : foundBadge.tier === 'diamond'
      ? 'text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]'
      : foundBadge.tier === 'gold'
      ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.7)]'
      : foundBadge.tier === 'silver'
      ? 'text-slate-200 drop-shadow-[0_0_8px_rgba(226,232,240,0.6)]'
      : 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]';

    const tierBorder = isSecret
      ? 'border-purple-500 bg-purple-950/95 shadow-[0_0_50px_rgba(168,85,247,0.45)]'
      : foundBadge.tier === 'diamond'
      ? 'border-cyan-400 bg-slate-900/95 shadow-[0_0_40px_rgba(34,211,238,0.4)]'
      : foundBadge.tier === 'gold'
      ? 'border-yellow-400 bg-slate-900/95 shadow-[0_0_40px_rgba(250,204,21,0.4)]'
      : 'border-yellow-500/80 bg-slate-900/95 shadow-[0_0_35px_rgba(245,158,11,0.35)]';

    return (
      <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
        <div className={`w-full max-w-md ${tierBorder} border-[3px] rounded-3xl p-5 sm:p-6 flex flex-col items-center text-center relative overflow-hidden select-none`}>
          {/* Header Tag */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-950/90 border border-yellow-500 text-[9px] font-pixel-arcade text-yellow-300 mb-3.5 shadow">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
            <span>{isSecret ? 'SUPER SECRET BADGE DISCOVERED!' : 'HERO BADGE UNLOCKED!'}</span>
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
          </div>

          {/* Pixel Icon Showcase */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-yellow-500/25 to-slate-950 border-2 border-yellow-400 flex items-center justify-center mb-3 shadow-[0_0_25px_rgba(250,204,21,0.35)] relative">
            <PixelQuestIcon name={foundBadge.icon} className="w-12 h-12" />
          </div>

          {/* User Requested Format: "You found the...badge!" where ... shows badge name with details and color */}
          <h3 className="font-pixel-arcade text-sm sm:text-base md:text-lg text-yellow-300 leading-snug drop-shadow-[0_2px_0_#3b1302] mb-2">
            You found the{' '}
            <span className={`${tierColor} font-bold underline decoration-2 underline-offset-4 animate-pulse`}>
              {foundBadge.title}
            </span>{' '}
            badge!
          </h3>

          {/* Tier Label */}
          <div className="mb-2.5">
            <span className={`text-[8.5px] font-pixel-arcade uppercase px-2.5 py-0.5 rounded-full border ${
              isSecret
                ? 'bg-purple-900/80 border-purple-400 text-purple-200'
                : 'bg-yellow-950/80 border-yellow-500 text-yellow-300'
            }`}>
              {isSecret ? 'SUPER SECRET TIER' : `${foundBadge.tier.toUpperCase()} TIER`}
            </span>
          </div>

          {/* Details Box */}
          <div className="w-full bg-slate-950/80 border border-yellow-500/40 rounded-xl p-3 mb-4 text-left">
            <div className="text-[8px] font-pixel-arcade text-yellow-400/80 mb-1">BADGE DETAILS:</div>
            <p className="text-[10px] sm:text-[11px] text-yellow-100 font-pixel-arcade leading-relaxed">
              {foundBadge.description}
            </p>
          </div>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={onDismissFoundBadge}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 active:from-yellow-300 active:to-yellow-400 text-slate-950 font-pixel-arcade text-xs font-bold border-2 border-amber-600 shadow-[0_4px_0_#78350f,0_0_20px_rgba(245,158,11,0.4)] active:translate-y-1 active:shadow-[0_1px_0_#78350f] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Award className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>COLLECT & CONTINUE</span>
          </button>
        </div>
      </div>
    );
  };

  const wrapWithPopup = (element: React.ReactNode) => (
    <>
      {element}
      {renderBadgeFoundPopup()}
    </>
  );

  // If in PLAYING mode but a badge was just found, pop up immediately over gameplay!
  if (currentScreen === 'PLAYING') {
    return renderBadgeFoundPopup();
  }

  // --- Gender Selection Modal ---
  if (currentScreen === 'GENDER_SELECT') {
    const previewArmor: 'none' | 'iron' | 'gold' =
      previewStage === 'baby' ? 'none' : (previewStage === 'juvenile' ? 'iron' : 'gold');
    const previewSword: 'none' | 'iron' | 'gold' =
      previewStage === 'baby' ? 'none' : (previewStage === 'juvenile' ? 'iron' : 'gold');

    return wrapWithPopup(
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-5 z-40 overflow-y-auto">
        <div className="w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/80 rounded-3xl p-4 sm:p-6 flex flex-col items-center shadow-[0_0_50px_rgba(245,158,11,0.25)] max-h-[92vh] overflow-y-auto">
          
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-pixel tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            CHOOSE YOUR CHICKEN IDENTITY
          </div>

          <h2 className="font-pixel text-xl sm:text-2xl text-amber-400 text-center mb-1">
            ROOSTER OR HEN?
          </h2>
          <p className="text-xs text-slate-300 font-body mb-3 text-center max-w-md">
            Biologically authentic avian models! Preview each growth stage below to inspect the magnificent combs, wattles, plumage, tails, and armor!
          </p>

          {/* Interactive Stage Preview Switcher Tabs */}
          <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-800/80 border border-slate-700/80 rounded-xl mb-2 w-full max-w-md">
            {[
              { id: 'baby', label: 'Baby Chick', icon: <PixelChick className="w-3.5 h-3.5" /> },
              { id: 'juvenile', label: 'Juvenile', icon: <PixelJuvenile className="w-3.5 h-3.5" /> },
              { id: 'teen', label: 'Teen (Lvl 15)', icon: <PixelRooster className="w-3.5 h-3.5" /> },
              { id: 'adult', label: 'Adult Hero', icon: <PixelCrown className="w-3.5 h-3.5" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setPreviewStage(tab.id as GrowthStage)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] sm:text-[11px] font-pixel transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  previewStage === tab.id
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Down middle under the button that says "baby chick" and also juvenile, teen, and adult: Equipped Armour */}
          <div className="flex items-center justify-center mb-4">
            <div className="px-3.5 py-1 rounded-full bg-slate-900/90 border border-amber-400/50 shadow-md flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-pixel text-[10px] text-amber-300">
                {previewStage === 'baby'
                  ? 'Baby Chick: Fluffy Down (No Armor in Inventory)'
                  : previewStage === 'juvenile'
                  ? 'Juvenile Stage: Iron Cuirass Armor & Iron Sword'
                  : previewStage === 'teen'
                  ? 'Teen Stage: Golden Battle Plate & Gold Sword'
                  : 'Adult Hero: Royal Queen / King Battle Armor & Sword'}
              </span>
            </div>
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* 1. ROOSTER (Male) */}
            <div 
              onClick={() => {
                setSelectedGender('rooster');
                onSelectGender('rooster');
              }}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative text-left flex flex-col justify-between ${
                selectedGender === 'rooster'
                  ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-[1.01]'
                  : 'bg-slate-900/80 border-slate-700/80 hover:border-slate-600 opacity-85 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-pixel text-sm text-amber-400 font-bold">ROOSTER (MALE)</span>
                  <span className="text-[10px] font-pixel px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">
                    Brave Guardian
                  </span>
                </div>

                {/* Animated Model Preview Canvas */}
                <div className="my-2 flex justify-center">
                  <ChickenPreviewCanvas
                    gender="rooster"
                    stage={previewStage}
                    armor={previewArmor}
                    sword={previewSword}
                    skin={saveData.selectedSkin || 'classic'}
                    renderer={renderer}
                    size={120}
                  />
                </div>

                {/* Color Swatches */}
                <div className="flex items-center justify-center gap-1.5 mb-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-600 border border-red-400 shadow-sm" title="Crown Comb" />
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-amber-300 shadow-sm" title="Golden Body" />
                  <div className="w-3.5 h-3.5 rounded-full bg-orange-600 border border-orange-400 shadow-sm" title="Copper Hackles" />
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-700 border border-emerald-500 shadow-sm" title="Sickle Tail" />
                </div>

                <div className="space-y-1 text-[11px] text-slate-300 font-body">
                  {previewStage === 'baby' ? (
                    <>
                      <p>• <strong>Baby Chick:</strong> Lively sunny yellow with spunky orange crest tuft</p>
                      <p>• <strong>Stance:</strong> Athletic bouncy posture with alert dark eyes</p>
                    </>
                  ) : previewStage === 'juvenile' ? (
                    <>
                      <p>• <strong>Juvenile:</strong> Fiery copper hackles & rising 3-point scarlet crown</p>
                      <p>• <strong>Features:</strong> Budding chin wattle & emerald sickle tail sprout</p>
                    </>
                  ) : previewStage === 'teen' ? (
                    <>
                      <p>• <strong>Teen (Lvl 15):</strong> Tall 4-point comb, emerald sickle plumes & leg spurs</p>
                      <p>• <strong>Armor:</strong> Heavy battle cuirass, pauldrons & broadsword</p>
                    </>
                  ) : (
                    <>
                      <p>• <strong>Adult Legend:</strong> Colossal serrated crown comb & double wattles</p>
                      <p>• <strong>Sickle Plumes:</strong> Flowing iridescent emerald & sapphire tail</p>
                      <p>• <strong>Leg Spurs:</strong> Deadly calcified ivory spurs on hocks</p>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] font-pixel text-amber-300 font-bold">
                  {selectedGender === 'rooster' ? '✓ ACTIVE & EQUIPPED' : 'Click to Become Rooster'}
                </span>
                <PixelRooster className="w-4 h-4 inline" />
              </div>
            </div>

            {/* 2. HEN (Female) */}
            <div 
              onClick={() => {
                setSelectedGender('hen');
                onSelectGender('hen');
              }}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative text-left flex flex-col justify-between ${
                selectedGender === 'hen'
                  ? 'bg-rose-950/40 border-rose-400 ring-2 ring-rose-400/50 shadow-[0_0_20px_rgba(244,63,94,0.3)] scale-[1.01]'
                  : 'bg-slate-900/80 border-slate-700/80 hover:border-slate-600 opacity-85 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-pixel text-sm text-rose-300 font-bold">HEN (FEMALE)</span>
                  <span className="text-[10px] font-pixel px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-400/40">
                    Swift Heroine
                  </span>
                </div>

                {/* Animated Model Preview Canvas */}
                <div className="my-2 flex justify-center">
                  <ChickenPreviewCanvas
                    gender="hen"
                    stage={previewStage}
                    armor={previewArmor}
                    sword={previewSword}
                    skin={saveData.selectedSkin || 'classic'}
                    renderer={renderer}
                    size={120}
                  />
                </div>

                {/* Color Swatches */}
                <div className="flex items-center justify-center gap-1.5 mb-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-500 border border-rose-300 shadow-sm" title="Rose Comb" />
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-200 border border-amber-100 shadow-sm" title="Honey Buff" />
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-700 border border-amber-600 shadow-sm" title="Cinnamon" />
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-100 border border-yellow-200 shadow-sm" title="Speckles" />
                </div>

                <div className="space-y-1 text-[11px] text-slate-300 font-body">
                  {previewStage === 'baby' ? (
                    <>
                      <p>• <strong>Baby Chick:</strong> Soft honey-buff down with blushing peach cheeks</p>
                      <p>• <strong>Eyes:</strong> Large expressive eyes with sweet double catchlights</p>
                    </>
                  ) : previewStage === 'juvenile' ? (
                    <>
                      <p>• <strong>Juvenile:</strong> Plump cinnamon plumage with speckled feather bars</p>
                      <p>• <strong>Features:</strong> Velvety red rose comb & compact rounded fan tail</p>
                    </>
                  ) : previewStage === 'teen' ? (
                    <>
                      <p>• <strong>Teen (Lvl 15):</strong> Swift curvaceous silhouette, rich chestnut coat</p>
                      <p>• <strong>Armor:</strong> Form-fitted cuirass & smooth agile legs (no spurs)</p>
                    </>
                  ) : (
                    <>
                      <p>• <strong>Adult Queen:</strong> Plump majestic matriarch in rich caramel & cinnamon</p>
                      <p>• <strong>Features:</strong> Velvety beaded rose comb & broad tiered fan tail</p>
                      <p>• <strong>Armor:</strong> Custom filigree queen's battle cuirass & sword</p>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] font-pixel text-rose-300 font-bold">
                  {selectedGender === 'hen' ? '✓ ACTIVE & EQUIPPED' : 'Click to Become Hen'}
                </span>
                <PixelHen className="w-4 h-4 inline" />
              </div>
            </div>
          </div>

          {/* Active Identity Confirmation Status */}
          <div className="w-full py-2.5 px-4 rounded-xl bg-amber-950/50 border border-amber-500/60 text-amber-300 font-pixel text-[11px] tracking-wide flex items-center justify-center gap-2 shadow-inner mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>IDENTITY ACTIVE: {selectedGender.toUpperCase()} (SAVED)</span>
          </div>

          <button
            onClick={onReturnToMenu}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold font-pixel text-xs tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            ← RETURN TO MAIN MENU
          </button>
        </div>
      </div>
    );
  }

  // --- Main Menu: Colorful Retro Typography & Detailed Buttons ---
  if (currentScreen === 'MENU') {
    return wrapWithPopup(
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-start sm:justify-center p-3 sm:p-5 z-40 overflow-y-auto overscroll-contain">
        <div ref={menuScrollRef} className="w-full max-w-md my-auto bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 border-amber-400/80 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.3)] p-4 sm:p-6 flex flex-col items-center text-center relative overflow-y-auto max-h-[94vh]">
          
          {/* Subtle Golden Glow Accents */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Farm Adventure Badge */}
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-yellow-950/40 border-2 border-yellow-500/80 text-[9px] sm:text-[10px] font-pixel-arcade text-yellow-400 drop-shadow-[0_2px_0_#3b1302] shadow-sm mb-2.5">
            <span>FROM EGG TO LEGENDARY HERO</span>
          </div>

          {/* Rich Detailed Pixel Logo */}
          <div className="relative mb-5 w-full flex flex-col items-center">
            {/* 3D Drop shadow layer */}
            <div className="relative select-none py-1">
              <h1 
                className="font-pixel-arcade font-bold text-2xl sm:text-3xl md:text-4xl tracking-wider text-slate-950 absolute top-1.5 left-0 right-0 z-0 drop-shadow-[0_4px_0_#3b1302]"
                aria-hidden="true"
              >
                Cock a Doodle
              </h1>
              {/* Front Yellow with Pixel Outlines */}
              <h1 className="font-pixel-arcade font-bold text-2xl sm:text-3xl md:text-4xl tracking-wider text-yellow-400 relative z-10 pixel-title-shadow">
                Cock a Doodle
              </h1>
            </div>

            {/* Creator Credit in thin white font */}
            <p className="font-body font-light text-white text-xs sm:text-sm tracking-wide mt-1 select-none">
              Made by: Raj L. Sreekumar :]
            </p>
          </div>

          {/* Authenticated Adventurer Passport Badge */}
          {currentUser && (
            <div className="w-full mb-3 p-2.5 bg-slate-950 border-[2px] border-amber-500 shadow-[3px_3px_0_#000000] flex items-center justify-between">
              <div className="flex items-center gap-2 text-left min-w-0">
                <div className="w-7 h-7 bg-amber-500/20 border border-amber-400 flex items-center justify-center shrink-0">
                  <PixelChick className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-pixel-arcade text-[7.5px] text-yellow-400 font-bold">
                      ADVENTURER:
                    </span>
                    <span className="font-pixel text-[7.5px] text-emerald-400 border border-emerald-600 px-1 py-0.2 bg-emerald-950">
                      VERIFIED ✓
                    </span>
                  </div>
                  <div className="font-pixel text-[8.5px] text-slate-200 truncate max-w-[170px] sm:max-w-[220px]">
                    {currentUser.email || 'Registered Hero'}
                  </div>
                </div>
              </div>
              {onLogOut && (
                <button
                  type="button"
                  onClick={onLogOut}
                  className="px-2 py-1 bg-red-950 hover:bg-red-900 border border-red-500 text-red-200 font-pixel text-[7.5px] shadow-[1px_1px_0_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer shrink-0 ml-2"
                  title="Log out of account"
                >
                  LOGOUT
                </button>
              )}
            </div>
          )}

          {/* Detailed Action Buttons matching Cock a Doodle font & vibrant arcade yellow color */}
          <div className="w-full flex flex-col gap-2.5">
            {/* 1. PLAY / START BUTTON - Always routes to Gender Selection first! */}
            {saveData.unlockedLevel > 1 ? (
              <>
                {/* Continue button */}
                <button
                  onClick={() => onStartGame(saveData.unlockedLevel, false)}
                  className="w-full py-2.5 sm:py-3 px-3.5 sm:px-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 active:from-yellow-300 active:to-yellow-400 text-slate-950 font-pixel-arcade text-[10px] sm:text-[11px] tracking-wider border-2 border-amber-600 shadow-[0_4px_0_#78350f,0_0_18px_rgba(245,158,11,0.35)] active:translate-y-1 active:shadow-[0_1px_0_#78350f] transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-yellow-200/90 border border-amber-700/60 flex items-center justify-center shadow-inner">
                      <Play className="w-3.5 h-3.5 fill-current text-slate-950" />
                    </div>
                    <span className="font-pixel-arcade text-slate-950 text-[10px] sm:text-[11px] font-bold drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">
                      CONTINUE ADVENTURE
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-yellow-200 border border-amber-700/60 text-slate-950 text-[9px] font-pixel-arcade font-bold">
                    STAGE {saveData.unlockedLevel}
                  </span>
                </button>

                {/* New run button - no emojis */}
                <button
                  onClick={() => {
                    if (onStartNewRun) onStartNewRun();
                    else onOpenScreen('GENDER_SELECT');
                  }}
                  className="w-full py-2.5 sm:py-3 px-3.5 sm:px-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 active:from-yellow-300 active:to-yellow-400 text-slate-950 font-pixel-arcade text-[10px] sm:text-[11px] tracking-wider border-2 border-amber-600 shadow-[0_4px_0_#78350f,0_0_18px_rgba(245,158,11,0.35)] active:translate-y-1 active:shadow-[0_1px_0_#78350f] transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-yellow-200/90 border border-amber-700/60 flex items-center justify-center shadow-inner">
                      <RotateCcw className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                    </div>
                    <span className="font-pixel-arcade text-slate-950 text-[10px] sm:text-[11px] font-bold drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">
                      NEW RUN
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-yellow-200 border border-amber-700/60 text-slate-950 text-[9px] font-pixel-arcade font-bold">
                    RESTART
                  </span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  if (onStartNewRun) onStartNewRun();
                  else onOpenScreen('GENDER_SELECT');
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 active:from-yellow-300 active:to-yellow-400 text-slate-950 font-pixel-arcade text-[10px] sm:text-xs tracking-wider border-2 border-amber-600 shadow-[0_4px_0_#78350f,0_0_20px_rgba(245,158,11,0.4)] active:translate-y-1 active:shadow-[0_1px_0_#78350f] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-yellow-200/90 border border-amber-700/60 flex items-center justify-center shadow-inner">
                  <Play className="w-3.5 h-3.5 fill-current text-slate-950" />
                </div>
                <span className="font-pixel-arcade text-slate-950 text-[10px] sm:text-xs font-bold drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">
                  START GAME
                </span>
              </button>
            )}

            {/* 2. CHICKEN GENDER CUSTOMIZER BUTTON - no emojis */}
            <button
              onClick={() => onOpenScreen('GENDER_SELECT')}
              className="w-full py-2.5 px-3.5 sm:px-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 active:from-yellow-300 active:to-yellow-400 border-2 border-amber-600 shadow-[0_4px_0_#78350f,0_0_18px_rgba(245,158,11,0.3)] active:translate-y-1 active:shadow-[0_1px_0_#78350f] transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-yellow-200/90 border border-amber-700/60 flex items-center justify-center shadow-inner">
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                </div>
                <div className="text-left">
                  <div className="text-[8px] sm:text-[9px] text-amber-950 font-pixel-arcade font-bold">ACTIVE CHARACTER IDENTITY</div>
                  <div className="text-[10px] sm:text-[11px] font-pixel-arcade font-bold text-slate-950 drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">
                    {saveData.gender === 'hen' ? 'HEN (FEMALE)' : 'ROOSTER (MALE)'}
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-pixel-arcade px-2 py-0.5 rounded bg-yellow-200 border border-amber-700/60 text-slate-950 font-bold">
                CUSTOMIZE
              </span>
            </button>

            {/* 3. UPGRADES AND SKINS BUTTON */}
            {(() => {
              const isShopClosed = Boolean(saveData.shopClosedUntil && nowTime < saveData.shopClosedUntil);
              const remainingSec = isShopClosed ? Math.max(0, Math.floor((saveData.shopClosedUntil! - nowTime) / 1000)) : 0;
              const hours = Math.floor(remainingSec / 3600);
              const mins = Math.floor((remainingSec % 3600) / 60);
              const secs = remainingSec % 60;
              const timeStr = hours > 0 ? `${hours}h ${mins.toString().padStart(2, '0')}m` : `${mins}m ${secs.toString().padStart(2, '0')}s`;

              return (
                <button
                  type="button"
                  disabled={isShopClosed}
                  onClick={() => {
                    if (isShopClosed) return;
                    onOpenScreen('SHOP');
                  }}
                  className={`w-full py-2.5 px-3.5 sm:px-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                    isShopClosed
                      ? 'bg-slate-900/90 border-slate-700/70 opacity-65 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 active:from-yellow-300 active:to-yellow-400 border-amber-600 shadow-[0_4px_0_#78350f,0_0_18px_rgba(245,158,11,0.3)] active:translate-y-1 active:shadow-[0_1px_0_#78350f] cursor-pointer'
                  }`}
                  title={isShopClosed ? `Shop is closed for 2 hours! Reopens in ${timeStr}` : 'Enter Upgrades & Skins Shop'}
                  aria-disabled={isShopClosed}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-inner ${
                      isShopClosed ? 'bg-slate-800 border border-slate-700' : 'bg-yellow-200/90 border border-amber-700/60'
                    }`}>
                      <Store className={`w-3.5 h-3.5 stroke-[2.5] ${isShopClosed ? 'text-slate-400' : 'text-slate-950'}`} />
                    </div>
                    <div className="text-left">
                      <div className={`text-[8px] sm:text-[9px] font-pixel-arcade font-bold ${
                        isShopClosed ? 'text-slate-400' : 'text-amber-950'
                      }`}>
                        SILKIE CHICKEN SHOP
                      </div>
                      <div className={`text-[10px] sm:text-[11px] font-pixel-arcade font-bold ${
                        isShopClosed ? 'text-slate-300' : 'text-slate-950 drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]'
                      }`}>
                        UPGRADES & SKINS
                      </div>
                    </div>
                  </div>
                  {isShopClosed ? (
                    <span 
                      className="text-[9px] font-pixel-arcade px-2 py-0.5 rounded bg-rose-950/90 border border-rose-500/80 text-rose-300 font-bold flex items-center gap-1 shadow-sm"
                      title={`Closed for 2 hours (Reopens in ${timeStr})`}
                    >
                      <Lock className="w-2.5 h-2.5 text-rose-400" />
                      <span>CLOSED</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    </span>
                  ) : (
                    <span className="text-[9px] font-pixel-arcade px-2 py-0.5 rounded bg-yellow-200 border border-amber-700/60 text-slate-950 font-bold flex items-center gap-1 shadow-sm">
                      <span>OPEN</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    </span>
                  )}
                </button>
              );
            })()}

            {/* 4. QUESTS & BADGES BUTTON */}
            {(() => {
              const unclaimedCount = countUnclaimedQuests(saveData);
              return (
                <button
                  onClick={() => onOpenScreen('QUESTS_BADGES')}
                  className="w-full py-2.5 px-3.5 sm:px-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 active:from-yellow-300 active:to-yellow-400 border-2 border-amber-600 shadow-[0_4px_0_#78350f,0_0_18px_rgba(245,158,11,0.3)] active:translate-y-1 active:shadow-[0_1px_0_#78350f] transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-yellow-200/90 border border-amber-700/60 flex items-center justify-center shadow-inner">
                      <Scroll className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                    </div>
                    <span className="font-pixel-arcade text-[10px] sm:text-[11px] text-slate-950 font-bold drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">
                      QUESTS & BADGES
                    </span>
                  </div>
                  {unclaimedCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 border border-rose-800 text-white text-[9px] font-pixel-arcade font-bold animate-bounce shadow">
                      {unclaimedCount} CLAIM!
                    </span>
                  ) : (
                    <span className="text-[9px] font-pixel-arcade text-slate-950 font-bold px-2 py-0.5 rounded bg-yellow-200 border border-amber-700/60">
                      REWARDS
                    </span>
                  )}
                </button>
              );
            })()}

            {/* 5. CAMPAIGN LEVEL SELECT BUTTON */}
            <button
              onClick={() => onOpenScreen('LEVEL_SELECT')}
              className="w-full py-2.5 px-3.5 sm:px-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 active:from-yellow-300 active:to-yellow-400 text-slate-950 border-2 border-amber-600 shadow-[0_4px_0_#78350f,0_0_18px_rgba(245,158,11,0.3)] active:translate-y-1 active:shadow-[0_1px_0_#78350f] transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-yellow-200/90 border border-amber-700/60 flex items-center justify-center shadow-inner">
                  <Trophy className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                </div>
                <span className="font-pixel-arcade text-[10px] sm:text-[11px] text-slate-950 font-bold drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">
                  LEVEL SELECTION
                </span>
              </div>
              <span className="text-[9px] font-pixel-arcade text-slate-950 font-bold px-2 py-0.5 rounded bg-yellow-200 border border-amber-700/60">
                30 LEVELS
              </span>
            </button>

            {/* 6. HOW TO PLAY BUTTON */}
            <button
              onClick={() => onOpenScreen('HOW_TO_PLAY')}
              className="w-full py-2.5 px-3.5 sm:px-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 active:from-yellow-300 active:to-yellow-400 text-slate-950 border-2 border-amber-600 shadow-[0_4px_0_#78350f,0_0_18px_rgba(245,158,11,0.3)] active:translate-y-1 active:shadow-[0_1px_0_#78350f] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span className="font-pixel-arcade text-[10px] sm:text-[11px] text-slate-950 font-bold drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">
                HOW TO PLAY & CONTROLS
              </span>
            </button>

            {/* 7. SETTINGS & AUDIO BUTTON */}
            <button
              onClick={() => onOpenScreen('SETTINGS')}
              className="w-full py-2.5 px-3.5 sm:px-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 active:from-yellow-300 active:to-yellow-400 text-slate-950 border-2 border-amber-600 shadow-[0_4px_0_#78350f,0_0_18px_rgba(245,158,11,0.3)] active:translate-y-1 active:shadow-[0_1px_0_#78350f] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span className="font-pixel-arcade text-[10px] sm:text-[11px] text-slate-950 font-bold drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">
                SETTINGS & AUDIO
              </span>
            </button>
          </div>

          {/* Tablet & Mobile Scroll Helper */}
          <TabletScrollButtons containerRef={menuScrollRef} className="mt-3" />
        </div>
      </div>
    );
  }

  // --- Level Select (All 30 Levels) ---
  if (currentScreen === 'LEVEL_SELECT') {
    const worlds = [
      { id: 1, name: 'World 1: The Start', levels: [1, 2, 3, 4, 5], badge: 'Baby Chick' },
      { id: 2, name: 'World 2: The Adventure Starts', levels: [6, 7, 8, 9], badge: 'Baby Chick' },
      { id: 3, name: 'World 3: The Heat Up', levels: [10], badge: 'Juvenile' },
      { id: 4, name: 'World 4: the Jungle lands', levels: [11, 12, 13, 14, 15, 16, 17, 18, 19], badge: 'Teen & Gold Armor' },
      { id: 5, name: 'World 5: the Artic lands', levels: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29], badge: 'Adult & Bears' },
      { id: 6, name: 'World 6: The End', levels: [30], badge: 'Grand Finale' },
    ];

    return wrapWithPopup(
      <div ref={levelScrollRef} className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col p-4 sm:p-6 z-40 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div>
              <h2 className="font-pixel text-xl sm:text-2xl text-amber-400">
                CAMPAIGN LEVEL SELECTION
              </h2>
              <p className="text-xs text-slate-400 font-body">
                Survive all 30 levels from egg to adult chicken
              </p>
            </div>
            <button
              onClick={onReturnToMenu}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tablet & Mobile Scroll Buttons */}
          <TabletScrollButtons containerRef={levelScrollRef} className="mb-4" />

          <div className="space-y-6">
            {worlds.map(w => (
              <div key={w.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-200 text-sm">
                    {w.name}
                  </h3>
                  <span className="text-[11px] text-amber-400 font-pixel">
                    {w.badge}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {w.levels.map(lvlId => {
                    const isUnlocked = lvlId <= saveData.unlockedLevel;
                    const isCurrent = lvlId === activeLevelId;
                    const lvlData = LEVELS.find(l => l.id === lvlId);

                    return (
                      <button
                        key={lvlId}
                        disabled={!isUnlocked}
                        onClick={() => onSelectLevel(lvlId)}
                        className={`p-3 rounded-xl border-[2px] text-left transition-all relative ${
                          isUnlocked
                            ? 'bg-slate-800 hover:bg-slate-700 border-black shadow-[0_3px_0_#000000] active:translate-y-[2px] active:shadow-[0_1px_0_#000000] cursor-pointer'
                            : 'bg-slate-950/80 border-slate-900 opacity-50 cursor-not-allowed'
                        } ${isCurrent ? 'ring-2 ring-yellow-400 !border-yellow-400' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-pixel-arcade text-xs font-bold ${isUnlocked ? 'text-yellow-400 drop-shadow-[0_1px_0_#000]' : 'text-slate-600'}`}>
                            LVL {lvlId}
                          </span>
                          {!isUnlocked ? (
                            <Lock className="w-3.5 h-3.5 text-slate-600" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                        </div>
                        <p className="text-[10px] font-pixel-arcade text-slate-300 truncate">
                          {isUnlocked ? 'Stage Ready' : 'Locked'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- How To Play & Guide ---
  if (currentScreen === 'HOW_TO_PLAY') {
    return wrapWithPopup(
      <div ref={howToPlayScrollRef} className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col p-4 sm:p-6 z-40 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <h2 className="font-pixel text-xl text-amber-400">
              HOW TO PLAY COCK A DOODLE
            </h2>
            <button
              onClick={onReturnToMenu}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 text-sm text-slate-300 font-body">
            {/* Controls - Centered for Desktop & Laptop */}
            <div className="flex flex-col items-center">
              <h3 className="text-amber-300 font-semibold mb-3 flex items-center justify-center gap-2 font-pixel text-xs tracking-wider">
                <Play className="w-4 h-4 text-amber-400" /> DESKTOP & LAPTOP KEYBOARD CONTROLS
              </h3>
              <div className="w-full max-w-lg bg-slate-800/90 p-4 sm:p-5 rounded-2xl border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)] mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700/80 flex flex-col items-center text-center">
                    <span className="font-pixel text-[10px] text-amber-400 mb-1">A / ◀ LEFT ARROW</span>
                    <span className="text-slate-200">Walk Left</span>
                  </div>
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700/80 flex flex-col items-center text-center">
                    <span className="font-pixel text-[10px] text-amber-400 mb-1">D / ▶ RIGHT ARROW</span>
                    <span className="text-slate-200">Walk Right</span>
                  </div>
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700/80 flex flex-col items-center text-center">
                    <span className="font-pixel text-[10px] text-amber-400 mb-1">SPACE / W / ▲ UP</span>
                    <span className="text-slate-200">Jump (Hold for Higher Jump)</span>
                  </div>
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700/80 flex flex-col items-center text-center">
                    <span className="font-pixel text-[10px] text-amber-400 mb-1">X / K</span>
                    <span className="text-slate-200">Attack with Sword / Peck</span>
                  </div>
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700/80 flex flex-col items-center text-center">
                    <span className="font-pixel text-[10px] text-amber-400 mb-1">C / S / ▼ DOWN</span>
                    <span className="text-slate-200">Block & Deflect with Royal Shield</span>
                  </div>
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700/80 flex flex-col items-center text-center">
                    <span className="font-pixel text-[10px] text-amber-400 mb-1">ESCAPE / P</span>
                    <span className="text-slate-200">Pause Game</span>
                  </div>
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700/80 flex flex-col items-center text-center">
                    <span className="font-pixel text-[10px] text-amber-400 mb-1">R</span>
                    <span className="text-slate-200">Restart Current Level</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Growth Stages */}
            <div>
              <h3 className="text-amber-300 font-semibold mb-2 flex items-center gap-2">
                <Trophy className="w-4 h-4" /> Character Evolution Stages
              </h3>
              <div className="space-y-2 text-xs">
                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/40">
                  <strong className="text-amber-400 font-pixel">1. Baby Chick (Levels 1–9):</strong> Small and cute, basic jumps and stomps.
                </div>
                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/40">
                  <strong className="text-amber-400 font-pixel">2. Juvenile Chicken (Level 10):</strong> Taller, stronger legs, small comb. Encounters wolves!
                </div>
                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/40">
                  <strong className="text-amber-400 font-pixel">3. Teen Chicken (Levels 15–19):</strong> Armed with Gold Armor & Gold Sword! Brave enough to cross volcanic jungles.
                </div>
                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/40">
                  <strong className="text-amber-400 font-pixel">4. Adult Chicken (Levels 20–30):</strong> The ultimate hero chicken with maximum speed, power, and resilience.
                </div>
              </div>
            </div>

            {/* Hazards & Enemies */}
            <div>
              <h3 className="text-amber-300 font-semibold mb-2 flex items-center gap-2">
                <Flame className="w-4 h-4" /> Enemies & Hazards
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
                  <span className="font-bold text-rose-400 block mb-1">Enemies:</span>
                  <p>• <strong>Wolves:</strong> Patrol platforms, stomp or slash.</p>
                  <p>• <strong>Foxes:</strong> Charge when they spot you! Strike with your Gold Sword.</p>
                  <p>• <strong>Bears:</strong> Heavy hit points and high damage in mountain levels.</p>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
                  <span className="font-bold text-amber-400 block mb-1">Hazards:</span>
                  <p>• <strong>Volcanoes:</strong> Watch for smoke warning before lava explodes!</p>
                  <p>• <strong>Boulders:</strong> Roll along platforms; jump high over them.</p>
                  <p>• <strong>Lightning:</strong> Evacuate the red warning circle before the thundercloud strikes!</p>
                </div>
              </div>
            </div>

            <button
              onClick={onReturnToMenu}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-pixel text-xs tracking-wide transition-colors cursor-pointer"
            >
              GOT IT, LET'S PLAY!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Settings Modal ---
  if (currentScreen === 'SETTINGS') {
    const currentDiff = saveData.difficulty || 'normal';

    return wrapWithPopup(
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-4 z-40 overflow-y-auto">
        <div ref={settingsScrollRef} className="w-full max-w-md my-auto bg-slate-900 border-[3px] border-black rounded-2xl p-5 sm:p-6 flex flex-col max-h-[92vh] overflow-y-auto shadow-[0_4px_0_#000000]">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-yellow-400" />
              <h2 className="font-pixel-arcade text-lg text-yellow-400 font-bold drop-shadow-[0_2px_0_#3b1302]">SETTINGS & MODES</h2>
            </div>
            <button
              onClick={onReturnToMenu}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-yellow-400 border-[2px] border-black shadow-[0_2px_0_#000000] cursor-pointer active:translate-y-[1px] active:shadow-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Authenticated Adventurer Account Card */}
            {currentUser && (
              <div className="p-3 bg-slate-950 border-[2px] border-amber-500 shadow-[2px_2px_0_#000000] flex items-center justify-between">
                <div className="text-left min-w-0">
                  <div className="font-pixel-arcade text-[8px] text-yellow-400 font-bold">
                    ADVENTURER ACCOUNT
                  </div>
                  <div className="font-pixel text-[8.5px] text-slate-200 truncate max-w-[200px]">
                    {currentUser.email}
                  </div>
                  <div className="font-pixel text-[7.5px] text-emerald-400 mt-0.5">
                    Email Status: Verified ✓
                  </div>
                </div>
                {onLogOut && (
                  <button
                    type="button"
                    onClick={onLogOut}
                    className="px-2.5 py-1.5 bg-red-950 hover:bg-red-900 border border-red-500 text-red-200 font-pixel text-[8px] shadow-[1px_1px_0_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer shrink-0 ml-2"
                  >
                    LOGOUT
                  </button>
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                GAME DIFFICULTY MODES (EASY, NORMAL, HARD) WITH LIVE DESCRIPTION
                ═══════════════════════════════════════════════════════════════ */}
            <div className="p-3.5 rounded-xl bg-slate-950 border-[2.5px] border-black shadow-[0_3px_0_#000000]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-pixel-arcade text-[10px] text-yellow-400 font-bold flex items-center gap-1.5 drop-shadow-[0_1px_0_#3b1302]">
                  <Shield className="w-3.5 h-3.5 text-yellow-400" />
                  <span>DIFFICULTY MODE</span>
                </span>
                <span className="font-pixel-arcade text-[8.5px] text-yellow-300 uppercase px-2 py-0.5 rounded bg-yellow-950 border border-yellow-500/50">
                  {currentDiff.toUpperCase()}
                </span>
              </div>

              {/* 3 Difficulty Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {(['easy', 'normal', 'hard'] as const).map(d => {
                  const isActive = currentDiff === d;
                  const label = d === 'easy' ? 'EASY' : (d === 'normal' ? 'NORMAL' : 'HARD');
                  return (
                    <button
                      key={d}
                      onClick={() => onChangeDifficulty?.(d)}
                      className={`py-2 px-1 rounded-lg text-center font-pixel-arcade text-[10px] font-bold border-[2.5px] transition-all cursor-pointer ${
                        isActive
                          ? (d === 'easy'
                              ? 'bg-emerald-500 text-slate-950 border-black shadow-[0_3px_0_#000000]'
                              : d === 'hard'
                              ? 'bg-rose-500 text-slate-950 border-black shadow-[0_3px_0_#000000]'
                              : 'bg-yellow-400 text-slate-950 border-black shadow-[0_3px_0_#000000]')
                          : 'bg-slate-900 text-slate-400 border-slate-700/80 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Live Description of what happens to the game */}
              <div className="bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-left text-[9.5px] font-pixel-arcade leading-relaxed">
                {currentDiff === 'easy' ? (
                  <div className="text-emerald-300 space-y-1">
                    <span className="text-emerald-400 font-bold block">🌱 EASY MODE SELECTED:</span>
                    <p>• <strong>50% Damage Taken:</strong> Hazards, enemies, and fireballs deal half damage!</p>
                    <p>• <strong>1.7s Invulnerability:</strong> Generous recovery window after taking any hit.</p>
                    <p>• <strong>Gentle Enemies:</strong> All enemies patrol and chase 25% slower.</p>
                  </div>
                ) : currentDiff === 'hard' ? (
                  <div className="text-rose-300 space-y-1">
                    <span className="text-rose-400 font-bold block">🔥 HARD MODE SELECTED:</span>
                    <p>• <strong>1.5x Damage Taken:</strong> Hazards, wolves, bears, and boss hits strike harder!</p>
                    <p>• <strong>0.9s Invulnerability:</strong> Tight recovery window tests fast reflexes.</p>
                    <p>• <strong>Fierce Enemies:</strong> Wolves, foxes, and bears charge & chase 25% faster!</p>
                  </div>
                ) : (
                  <div className="text-yellow-200 space-y-1">
                    <span className="text-yellow-400 font-bold block">⚔️ NORMAL MODE SELECTED (DEFAULT):</span>
                    <p>• <strong>Standard Balanced Damage:</strong> Classic platforming hearts & health scaling.</p>
                    <p>• <strong>1.2s Invulnerability:</strong> Standard recovery window after damage.</p>
                    <p>• <strong>Standard Agility:</strong> Balanced enemy patrols and genuine retro challenge.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sound & Music Controls with Pixelated Style */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border-[2.5px] border-black shadow-[0_3px_0_#000000]">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-pixel-arcade text-slate-200 font-bold">SOUND EFFECTS</span>
              </div>
              <button
                onClick={onToggleSound}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-pixel-arcade font-bold border-[2px] border-black transition-all cursor-pointer ${
                  saveData.soundEnabled
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_2px_0_#000000]'
                    : 'bg-slate-800 text-slate-400 shadow-[0_2px_0_#000000]'
                }`}
              >
                {saveData.soundEnabled ? 'ENABLED' : 'MUTED'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border-[2.5px] border-black shadow-[0_3px_0_#000000]">
              <div className="flex items-center gap-2.5">
                <Music className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-pixel-arcade text-slate-200 font-bold">CHIPTUNE MUSIC</span>
              </div>
              <button
                onClick={onToggleMusic}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-pixel-arcade font-bold border-[2px] border-black transition-all cursor-pointer ${
                  saveData.musicEnabled
                    ? 'bg-yellow-400 text-slate-950 shadow-[0_2px_0_#000000]'
                    : 'bg-slate-800 text-slate-400 shadow-[0_2px_0_#000000]'
                }`}
              >
                {saveData.musicEnabled ? 'ENABLED' : 'MUTED'}
              </button>
            </div>

            {/* Coop Shop 2-Hour Cooldown Status & Toggle */}
            {onToggleShopStatus && (() => {
              const isShopClosed = Boolean(saveData.shopClosedUntil && nowTime < saveData.shopClosedUntil);
              const remainingSec = isShopClosed ? Math.max(0, Math.floor((saveData.shopClosedUntil! - nowTime) / 1000)) : 0;
              const hours = Math.floor(remainingSec / 3600);
              const mins = Math.floor((remainingSec % 3600) / 60);
              const secs = remainingSec % 60;
              const timeStr = hours > 0 ? `${hours}h ${mins.toString().padStart(2, '0')}m` : `${mins}m ${secs.toString().padStart(2, '0')}s`;

              return (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border-[2.5px] border-black shadow-[0_3px_0_#000000]">
                  <div className="flex items-center gap-2.5">
                    <Store className="w-4 h-4 text-yellow-400" />
                    <div className="text-left">
                      <span className="text-xs font-pixel-arcade text-slate-200 font-bold block">UPGRADES & SKINS SHOP</span>
                      <span className="text-[8px] font-pixel-arcade text-slate-400">
                        {isShopClosed ? `Reopens in ${timeStr}` : 'Shop currently OPEN'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleShopStatus}
                    className={`px-2.5 py-1.5 rounded-lg text-[9px] font-pixel-arcade font-bold border-[2px] border-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      isShopClosed
                        ? 'bg-rose-950 border-rose-500 text-rose-300 shadow-[0_2px_0_#000000]'
                        : 'bg-emerald-500 text-slate-950 shadow-[0_2px_0_#000000]'
                    }`}
                    title="Toggle shop status for testing"
                  >
                    <PixelBell className="w-3 h-3" />
                    <span>{isShopClosed ? 'CLOSED (TAP TO OPEN)' : 'OPEN (TAP TO CLOSE)'}</span>
                  </button>
                </div>
              );
            })()}

            {/* Reset Saved Progress */}
            <div className="pt-2 border-t-2 border-slate-800">
              {!showResetConfirm ? (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-[10px] font-pixel-arcade font-bold border-[2px] border-black shadow-[0_2px_0_#000000] transition-colors cursor-pointer"
                >
                  RESET SAVED PROGRESS...
                </button>
              ) : (
                <div className="p-3 bg-rose-950/95 border-[2.5px] border-black rounded-xl space-y-2 text-center shadow-[0_3px_0_#000000]">
                  <p className="text-[10px] font-pixel-arcade text-rose-200 font-bold">
                    ARE YOU SURE? THIS RESETS UNLOCKED STAGES & COINS!
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        onResetProgress();
                        setShowResetConfirm(false);
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[9px] font-pixel-arcade font-bold border border-black cursor-pointer shadow-[0_2px_0_#000000]"
                    >
                      YES, RESET
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[9px] font-pixel-arcade font-bold border border-black cursor-pointer"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <TabletScrollButtons containerRef={settingsScrollRef} className="mt-4" />

          <button
            onClick={onReturnToMenu}
            className="mt-3 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-yellow-400 font-pixel-arcade text-[10px] font-bold border-[2.5px] border-black shadow-[0_3px_0_#000000] cursor-pointer active:translate-y-[1px]"
          >
            ← BACK TO MENU
          </button>
        </div>
      </div>
    );
  }

  // --- Pause Menu ---
  if (currentScreen === 'PAUSED') {
    return wrapWithPopup(
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-4 z-40 overflow-y-auto">
        <div className="w-full max-w-sm my-auto bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/80 rounded-3xl p-5 sm:p-7 flex flex-col items-center text-center shadow-[0_0_50px_rgba(245,158,11,0.3)] max-h-[92vh] overflow-y-auto">
          <h2 className="font-pixel-arcade text-xl sm:text-2xl text-yellow-400 mb-1 drop-shadow-[0_2px_0_#3b1302]">
            GAME PAUSED
          </h2>
          <p className="text-[10px] text-yellow-400/80 mb-5 font-pixel-arcade">STAGE {activeLevelId} / 30</p>

          <div className="w-full space-y-2.5">
            <button
              onClick={onResume}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 active:from-yellow-300 active:to-yellow-400 text-slate-950 font-bold font-pixel-arcade text-xs tracking-wider border-2 border-amber-600 shadow-[0_4px_0_#78350f,0_0_15px_rgba(245,158,11,0.3)] active:translate-y-1 active:shadow-[0_1px_0_#78350f] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current text-slate-950" />
              <span>RESUME GAME</span>
            </button>
            <button
              onClick={onRestartLevel}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 active:from-yellow-300 active:to-yellow-400 text-slate-950 text-xs font-bold font-pixel-arcade border-2 border-amber-600 shadow-[0_4px_0_#78350f] active:translate-y-1 active:shadow-[0_1px_0_#78350f] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
              <span>RESTART STAGE</span>
            </button>
            {(() => {
              const isShopClosed = Boolean(saveData.shopClosedUntil && nowTime < saveData.shopClosedUntil);
              const remainingSec = isShopClosed ? Math.max(0, Math.floor((saveData.shopClosedUntil! - nowTime) / 1000)) : 0;
              const hours = Math.floor(remainingSec / 3600);
              const mins = Math.floor((remainingSec % 3600) / 60);
              const secs = remainingSec % 60;
              const timeStr = hours > 0 ? `${hours}h ${mins.toString().padStart(2, '0')}m` : `${mins}m ${secs.toString().padStart(2, '0')}s`;

              return (
                <button
                  type="button"
                  disabled={isShopClosed}
                  onClick={() => {
                    if (isShopClosed) return;
                    onOpenScreen('SHOP');
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold font-pixel-arcade border-2 transition-all flex items-center justify-between ${
                    isShopClosed
                      ? 'bg-slate-900/90 border-slate-700/70 text-slate-400 opacity-65 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 active:from-yellow-300 active:to-yellow-400 text-slate-950 border-amber-600 shadow-[0_4px_0_#78350f] active:translate-y-1 active:shadow-[0_1px_0_#78350f] cursor-pointer'
                  }`}
                  title={isShopClosed ? `Shop is closed for 2 hours! Reopens in: ${timeStr}` : 'Enter Upgrades & Skins Shop'}
                  aria-disabled={isShopClosed}
                >
                  <div className="flex items-center gap-2">
                    <Store className={`w-3.5 h-3.5 stroke-[2.5] ${isShopClosed ? 'text-slate-400' : 'text-slate-950'}`} />
                    <span>UPGRADES & SKINS</span>
                  </div>
                  {isShopClosed ? (
                    <span 
                      className="text-[9px] font-pixel-arcade px-2 py-0.5 rounded bg-rose-950/90 border border-rose-500/80 text-rose-300 font-bold flex items-center gap-1 shadow-sm"
                      title={`Closed for 2 hours (Reopens in ${timeStr})`}
                    >
                      <Lock className="w-2.5 h-2.5 text-rose-400" />
                      <span>CLOSED</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    </span>
                  ) : (
                    <span className="text-[9px] font-pixel-arcade px-2 py-0.5 rounded bg-yellow-200 border border-amber-700/60 text-slate-950 font-bold flex items-center gap-1 shadow-sm">
                      <span>OPEN</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    </span>
                  )}
                </button>
              );
            })()}
            <button
              onClick={() => onOpenScreen('QUESTS_BADGES')}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 active:from-yellow-300 active:to-yellow-400 text-slate-950 text-xs font-bold font-pixel-arcade border-2 border-amber-600 shadow-[0_4px_0_#78350f] active:translate-y-1 active:shadow-[0_1px_0_#78350f] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Scroll className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
              <span>QUESTS & BADGES</span>
            </button>
            <button
              onClick={() => onOpenScreen('LEVEL_SELECT')}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 active:from-yellow-300 active:to-yellow-400 text-slate-950 text-xs font-bold font-pixel-arcade border-2 border-amber-600 shadow-[0_4px_0_#78350f] active:translate-y-1 active:shadow-[0_1px_0_#78350f] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
              <span>LEVEL SELECTION</span>
            </button>
            <button
              onClick={onReturnToMenu}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 active:from-yellow-300 active:to-yellow-400 text-slate-950 text-xs font-bold font-pixel-arcade border-2 border-amber-600 shadow-[0_4px_0_#78350f] active:translate-y-1 active:shadow-[0_1px_0_#78350f] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MenuIcon className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
              <span>MAIN MENU</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Evolution Screen: Only the centered 'Continue Adventure!' button ---
  if (currentScreen === 'EVOLUTION') {
    return wrapWithPopup(
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-40 select-none">
        <button
          onClick={onNextLevel}
          className="px-8 sm:px-12 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 active:from-yellow-300 active:to-yellow-400 text-slate-950 font-bold font-pixel-arcade text-xs sm:text-sm tracking-wider border-4 border-amber-600 shadow-[0_6px_0_#78350f,0_0_35px_rgba(245,158,11,0.5)] active:translate-y-1 active:shadow-[0_2px_0_#78350f] transition-all cursor-pointer flex items-center justify-center gap-3 animate-pulse hover:animate-none"
        >
          <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-slate-950" />
          <span>CONTINUE ADVENTURE!</span>
        </button>
      </div>
    );
  }

  // --- Next World Loading Screen (1% to 100%, Tap Screen Button hidden until 100%) ---
  if (currentScreen === 'WORLD_LOADING') {
    const targetLevel = LEVELS.find(l => l.id === activeLevelId) || LEVELS[0];
    const isReady = worldLoadPercent >= 100;
    const loadingStatus =
      worldLoadPercent < 30
        ? 'GENERATING PIXEL WORLD...'
        : worldLoadPercent < 65
        ? 'PLACING SAFE CHECKPOINTS...'
        : worldLoadPercent < 95
        ? 'SUMMONING WILDLIFE & TREASURE...'
        : isReady
        ? 'WORLD READY! 100%'
        : 'FINALIZING BIOME...';

    return wrapWithPopup(
      <div
        onClick={() => {
          if (isReady) {
            onFinishWorldLoading?.();
          }
        }}
        className={`absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-4 z-40 select-none ${
          isReady ? 'cursor-pointer' : 'cursor-wait'
        }`}
      >
        <div className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950 border-4 border-yellow-400 p-6 sm:p-8 flex flex-col items-center text-center shadow-[0_0_60px_rgba(250,204,21,0.35)]">
          <div className="px-3 py-1 bg-yellow-950/70 border-2 border-yellow-400 text-yellow-300 font-pixel-arcade text-[9px] tracking-widest mb-3">
            TRAVELING TO NEXT WORLD
          </div>

          <h2 className="font-pixel-arcade text-lg sm:text-xl text-yellow-400 drop-shadow-[0_3px_0_#3b1302] mb-1.5">
            {targetLevel.worldName}
          </h2>
          <p className="font-pixel text-xs text-sky-300 mb-6">
            STAGE {targetLevel.id} / 30 • {targetLevel.title}
          </p>

          {/* 8-Bit Percentage Display */}
          <div className="font-pixel-arcade text-3xl sm:text-4xl text-yellow-300 drop-shadow-[0_3px_0_#000000] tabular-nums mb-3">
            {worldLoadPercent}%
          </div>

          {/* 8-Bit Segmented Pixel Progress Bar */}
          <div className="w-full h-7 bg-slate-950 border-2 border-yellow-400 p-1 mb-3 shadow-inner">
            <div
              className={`h-full transition-all duration-75 ${
                isReady
                  ? 'bg-gradient-to-r from-emerald-500 via-green-400 to-lime-300'
                  : 'bg-gradient-to-r from-amber-600 via-yellow-400 to-yellow-200'
              }`}
              style={{ width: `${worldLoadPercent}%` }}
            />
          </div>

          <p className="font-pixel text-[10px] text-amber-200/80 tracking-wider mb-6">
            {loadingStatus}
          </p>

          {/* Tap Screen Button ONLY renders once loading hits 100%! */}
          {isReady && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFinishWorldLoading?.();
              }}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-pixel-arcade font-bold text-xs tracking-wider border-2 border-amber-700 shadow-[0_4px_0_#78350f] active:translate-y-1 active:shadow-none cursor-pointer animate-pulse"
            >
              ▶ TAP SCREEN TO ENTER WORLD {targetLevel.world} ◀
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- Waiting Screen & Level Clear Summary (Styled with Cock a Doodle Yellow Theme) ---
  if (currentScreen === 'LEVEL_CLEAR') {
    const currentLevel = LEVELS.find(l => l.id === activeLevelId);
    const nextLevel = LEVELS.find(l => l.id === activeLevelId + 1);
    const isMaxLevel = activeLevelId >= 30;
    const maxHearts = 3 + (saveData.upgrades?.extraHearts || 0);

    let stageName = 'Baby Chick';
    let nextMilestone = 'Level 10 (Juvenile Chicken)';
    let progressPercent = (activeLevelId / 10) * 100;
    if (activeLevelId >= 20) {
      stageName = 'Mighty Adult Chicken';
      nextMilestone = 'Level 30 (Mount Cluckmore Summit)';
      progressPercent = ((activeLevelId - 20) / 10) * 100;
    } else if (activeLevelId >= 15) {
      stageName = 'Teen Chicken (Gold Armor & Sword)';
      nextMilestone = 'Level 20 (Adult Chicken)';
      progressPercent = ((activeLevelId - 15) / 5) * 100;
    } else if (activeLevelId >= 10) {
      stageName = 'Juvenile Chicken (Iron Armor & Sword)';
      nextMilestone = 'Level 15 (Teen Chicken)';
      progressPercent = ((activeLevelId - 10) / 5) * 100;
    }

    const hasFullCoins = coinsEarned >= 8;
    const starCount = hasFullCoins ? 3 : (coinsEarned >= 3 ? 2 : 1);

    return wrapWithPopup(
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-4 z-40 overflow-y-auto">
        <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-yellow-500/80 rounded-3xl p-5 sm:p-7 flex flex-col items-center shadow-[0_0_50px_rgba(245,158,11,0.35)] max-h-[92vh] overflow-y-auto">
          
          {/* Header Badge */}
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-yellow-950/40 border-2 border-yellow-500/80 text-yellow-400 text-[10px] font-pixel-arcade tracking-wider mb-2.5 drop-shadow-[0_2px_0_#3b1302]">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>STAGE CLEARED</span>
          </div>

          <h2 className="font-pixel-arcade text-lg sm:text-2xl text-yellow-400 text-center mb-1 drop-shadow-[0_2px_0_#3b1302]">
            LEVEL {activeLevelId} CLEARED!
          </h2>
          <p className="text-[10px] sm:text-xs text-yellow-400/80 font-pixel-arcade mb-4 text-center">
            WORLD {currentLevel?.world || 1} • STAGE {activeLevelId} / 30
          </p>

          {/* 3 Golden Pixel Stars */}
          <div className="flex items-center gap-3 mb-4">
            {[1, 2, 3].map(s => {
              const earned = s <= starCount;
              return (
                <div
                  key={s}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all ${
                    earned
                      ? 'bg-yellow-950/60 border-yellow-400 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] scale-105'
                      : 'bg-slate-900/60 border-slate-700/60 text-slate-700 scale-95'
                  }`}
                >
                  <Star className={`w-5 h-5 ${earned ? 'fill-yellow-400 text-yellow-400' : 'text-slate-700'}`} />
                </div>
              );
            })}
          </div>

          {/* Chick Growth & Status Card */}
          <div className="w-full bg-slate-900/90 border-2 border-yellow-500/70 rounded-2xl p-4 mb-3.5 text-left space-y-2.5 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-pixel-arcade tracking-wider text-yellow-400/70 block">Current Form</span>
                <span className="font-pixel-arcade text-xs text-yellow-400 font-bold drop-shadow-[0_2px_0_#3b1302]">{stageName}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-yellow-950/60 border border-yellow-500/70 text-[10px] text-yellow-400 font-pixel-arcade">
                <span>{maxHearts} / {maxHearts} HEARTS</span>
              </div>
            </div>

            {/* Growth Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-[9px] text-yellow-400/90 font-pixel-arcade mb-1">
                <span>Next Milestone:</span>
                <span className="text-yellow-400 font-bold">{nextMilestone}</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-yellow-500/60 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(250,204,21,0.6)]"
                  style={{ width: `${Math.min(100, Math.max(10, progressPercent))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Pellet Coin Stats Bar */}
          <div className="w-full grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-900/90 border-2 border-yellow-500/70 rounded-xl p-2.5 text-center shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <span className="text-[9px] text-yellow-400/80 block font-pixel-arcade">PELLET COINS COLLECTED</span>
              <span className="font-pixel-arcade text-sm text-yellow-400 font-bold drop-shadow-[0_2px_0_#3b1302]">+{coinsEarned} PELLET COINS</span>
            </div>
            <div className="bg-slate-900/90 border-2 border-yellow-500/70 rounded-xl p-2.5 text-center shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <span className="text-[9px] text-yellow-400/80 block font-pixel-arcade">LIFETIME PELLET COINS</span>
              <span className="font-pixel-arcade text-sm text-yellow-400 font-bold drop-shadow-[0_2px_0_#3b1302]">{saveData.totalCoins + coinsEarned}</span>
            </div>
          </div>

          {/* Next Level Briefing & Scout Report */}
          {!isMaxLevel && nextLevel && (
            <div className="w-full bg-yellow-950/30 border-2 border-yellow-500/60 rounded-2xl p-3.5 mb-4 text-left shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-pixel-arcade text-yellow-400 uppercase tracking-wider">
                  NEXT STAGE: LEVEL {nextLevel.id}
                </span>
                <span className="text-[9px] font-pixel-arcade text-yellow-400 bg-yellow-950/80 border border-yellow-500/50 px-2 py-0.5 rounded-full">
                  {nextLevel.worldName}
                </span>
              </div>
              <h4 className="font-pixel-arcade text-[11px] text-yellow-400 mb-1 drop-shadow-[0_2px_0_#3b1302]">STAGE {nextLevel.id} / 30</h4>
              <p className="text-[10px] text-yellow-300/90 font-pixel leading-relaxed">
                {nextLevel.hint || nextLevel.subtitle || 'Prepare your jumps! Safe resting spots are fewer ahead.'}
              </p>
            </div>
          )}

          {/* Action Buttons styled like Cock a Doodle */}
          <div className="w-full space-y-2">
            {!isMaxLevel ? (
              <button
                onClick={onNextLevel}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900/95 hover:bg-slate-800 text-yellow-400 font-bold font-pixel-arcade text-xs tracking-wider border-2 border-yellow-500/90 shadow-[0_0_20px_rgba(245,158,11,0.4)] drop-shadow-[0_2px_0_#3b1302] transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>PROCEED TO LEVEL {activeLevelId + 1}</span>
                <ChevronRight className="w-4 h-4 text-yellow-400" />
              </button>
            ) : (
              <button
                onClick={onNextLevel}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900/95 hover:bg-slate-800 text-yellow-400 font-bold font-pixel-arcade text-xs tracking-wider border-2 border-yellow-500/90 shadow-[0_0_20px_rgba(245,158,11,0.4)] drop-shadow-[0_2px_0_#3b1302] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>CLAIM VICTORY!</span>
                <Trophy className="w-4 h-4 text-yellow-400" />
              </button>
            )}

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={onRestartLevel}
                className="py-2.5 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-yellow-400 text-[10px] font-pixel-arcade border-2 border-yellow-500/70 drop-shadow-[0_2px_0_#3b1302] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-yellow-400" /> REPLAY
              </button>
              <button
                onClick={() => onOpenScreen('LEVEL_SELECT')}
                className="py-2.5 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-yellow-400 text-[10px] font-pixel-arcade border-2 border-yellow-500/70 drop-shadow-[0_2px_0_#3b1302] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Map className="w-3.5 h-3.5 text-yellow-400" /> STAGES
              </button>
              <button
                onClick={onReturnToMenu}
                className="py-2.5 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-yellow-400 text-[10px] font-pixel-arcade border-2 border-yellow-500/70 drop-shadow-[0_2px_0_#3b1302] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MenuIcon className="w-3.5 h-3.5 text-yellow-400" /> MENU
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // --- Game Over Modal (Pixelated Theme with ! Sign on Retry Button) ---
  if (currentScreen === 'GAME_OVER') {
    return wrapWithPopup(
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4 z-40">
        <div className="w-full max-w-sm bg-slate-900/95 border-2 border-rose-500/80 rounded-2xl p-6 sm:p-7 flex flex-col items-center text-center shadow-[0_0_40px_rgba(244,63,94,0.35)]">
          
          {/* Pixelated Warning Skull Icon */}
          <div className="w-12 h-12 rounded-xl bg-rose-950/60 border-2 border-rose-500 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(244,63,94,0.4)]">
            <svg viewBox="0 0 10 10" className="w-6 h-6" style={{ shapeRendering: 'crispEdges' }}>
              <rect x="2" y="1" width="6" height="5" fill="#f43f5e" />
              <rect x="3" y="0" width="4" height="1" fill="#f43f5e" />
              <rect x="3" y="6" width="4" height="3" fill="#f43f5e" />
              {/* Eye sockets */}
              <rect x="3" y="3" width="1.5" height="2" fill="#0f172a" />
              <rect x="5.5" y="3" width="1.5" height="2" fill="#0f172a" />
              {/* Teeth */}
              <rect x="4" y="8" width="1" height="1" fill="#0f172a" />
              <rect x="5" y="8" width="1" height="1" fill="#0f172a" />
            </svg>
          </div>

          <h2 className="font-pixel-arcade text-xl sm:text-2xl text-rose-500 mb-1.5 drop-shadow-[0_2px_0_#4c0519]">
            GAME OVER
          </h2>
          <p className="text-[10px] text-yellow-400 font-pixel-arcade mb-6 drop-shadow-[0_2px_0_#3b1302]">
            A CHICKEN NEVER RETREATS!
          </p>

          <div className="w-full space-y-2.5">
            {/* RESPAWN / RETRY BUTTON WITH PIXELATED '!' SIGN */}
            <button
              onClick={activeLevelId === 30 && onRespawn ? onRespawn : onRestartLevel}
              className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-yellow-400 font-bold font-pixel-arcade text-xs tracking-wider border-2 border-yellow-500 shadow-[0_0_20px_rgba(245,158,11,0.35)] drop-shadow-[0_2px_0_#3b1302] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              {/* Pixelated '!' Exclamation Mark */}
              <svg viewBox="0 0 5 9" className="w-3.5 h-4.5" style={{ shapeRendering: 'crispEdges' }}>
                {/* Stem */}
                <rect x="1" y="0" width="3" height="5" fill="#3b1302" />
                <rect x="1.5" y="0.5" width="2" height="4" fill="#facc15" />
                <rect x="2" y="1" width="1" height="3" fill="#ffffff" />
                {/* Dot */}
                <rect x="1" y="6" width="3" height="3" fill="#3b1302" />
                <rect x="1.5" y="6.5" width="2" height="2" fill="#facc15" />
                <rect x="2" y="7" width="1" height="1" fill="#ffffff" />
              </svg>
              <span>{activeLevelId === 30 ? 'RESPAWN' : 'RETRY LEVEL'}</span>
              {/* Mirror Pixelated '!' Exclamation Mark on right */}
              <svg viewBox="0 0 5 9" className="w-3.5 h-4.5" style={{ shapeRendering: 'crispEdges' }}>
                <rect x="1" y="0" width="3" height="5" fill="#3b1302" />
                <rect x="1.5" y="0.5" width="2" height="4" fill="#facc15" />
                <rect x="2" y="1" width="1" height="3" fill="#ffffff" />
                <rect x="1" y="6" width="3" height="3" fill="#3b1302" />
                <rect x="1.5" y="6.5" width="2" height="2" fill="#facc15" />
                <rect x="2" y="7" width="1" height="1" fill="#ffffff" />
              </svg>
            </button>

            <button
              onClick={() => onOpenScreen('LEVEL_SELECT')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-yellow-400 font-pixel-arcade text-[10px] border-2 border-yellow-500/70 shadow-[0_0_12px_rgba(245,158,11,0.2)] drop-shadow-[0_2px_0_#3b1302] transition-colors cursor-pointer"
            >
              LEVEL SELECTION
            </button>
            <button
              onClick={onReturnToMenu}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-yellow-400 font-pixel-arcade text-[10px] border-2 border-yellow-500/70 shadow-[0_0_12px_rgba(245,158,11,0.2)] drop-shadow-[0_2px_0_#3b1302] transition-colors cursor-pointer"
            >
              MAIN MENU
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Grand Victory Screen (Level 30 Cleared) ---
  if (currentScreen === 'VICTORY') {
    return wrapWithPopup(
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4 z-40 overflow-y-auto">
        <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-[0_0_60px_rgba(245,158,11,0.3)]">
          <div className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center mb-3">
            <Trophy className="w-9 h-9 text-amber-400 animate-bounce" />
          </div>

          <h1 className="font-pixel text-2xl sm:text-3xl text-amber-400 mb-2">
            CONGRATULATIONS!
          </h1>
          <p className="font-pixel text-xs sm:text-sm text-emerald-400 mb-4 tracking-wide">
            YOU SURVIVED ALL 30 LEVELS!
          </p>

          <p className="font-body text-slate-200 text-sm mb-6 leading-relaxed max-w-md">
            Your journey from a tiny egg to a mighty adult chicken is complete. Welcome to the Green Fields!
          </p>

          {/* Stats Box */}
          <div className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-4 mb-6 grid grid-cols-2 gap-3 text-left">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-body block">Total Pellet Coins Collected</span>
              <span className="font-pixel text-base text-amber-400 font-bold">{saveData.totalCoins} Pellet Coins</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-body block">Levels Completed</span>
              <span className="font-pixel text-base text-emerald-400 font-bold">30 / 30 Finished</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 col-span-2 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-body block">Final Growth State</span>
                <span className="font-pixel text-sm text-amber-300 font-bold">Armored Adult Hero Chicken</span>
              </div>
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
          </div>

          {/* Final Navigation Actions */}
          <div className="w-full flex flex-col gap-2.5">
            <button
              onClick={() => onStartGame(30, false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold font-pixel text-xs tracking-wide shadow-lg transition-all cursor-pointer"
            >
              REPLAY LEVEL 30 (GREEN FIELDS)
            </button>
            <button
              onClick={() => onOpenScreen('LEVEL_SELECT')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              Explore Earlier Levels
            </button>
            <button
              onClick={() => {
                if (onStartNewRun) onStartNewRun();
                else onStartGame(1, true);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              Start a New Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 🏪 UPGRADE SHOP SCREEN: Silkie Chicken Master Merchant & Upgrades ---
  if (currentScreen === 'SHOP') {
    const extraHearts = saveData.upgrades?.extraHearts || 0;
    const speedBoost = saveData.upgrades?.speedBoost || 0;
    const jumpBoost = saveData.upgrades?.jumpBoost || 0;
    const hasMagnet = Boolean(saveData.upgrades?.coinMagnet);
    const hasRevive = Boolean(saveData.upgrades?.reviveToken);
    const hasShield = Boolean(saveData.hasShield);
    const currentArmor = saveData.armor || 'none';
    const currentSword = saveData.sword || 'none';
    const luckyCorn = saveData.upgrades?.luckyCorn || 0;
    const ironBeak = saveData.upgrades?.ironBeak || 0;
    const hasGlider = Boolean(saveData.upgrades?.fluffyGlider);
    const hasPlumage = Boolean(saveData.upgrades?.goldenPlumage);

    const isShopClosed = !saveData.hasCompletedGame && Boolean(saveData.shopClosedUntil && nowTime < saveData.shopClosedUntil);
    const remainingSec = isShopClosed ? Math.max(0, Math.floor((saveData.shopClosedUntil! - nowTime) / 1000)) : 0;
    const hours = Math.floor(remainingSec / 3600);
    const mins = Math.floor((remainingSec % 3600) / 60);
    const secs = remainingSec % 60;
    const timeStr = hours > 0 ? `${hours}h ${mins.toString().padStart(2, '0')}m` : `${mins}m ${secs.toString().padStart(2, '0')}s`;

    // Upgrade items definition (expanded with more upgrades!)
    const shopItems = [
      {
        id: 'heart_container',
        type: 'heart' as const,
        title: 'Heart Container',
        desc: '+1 Permanent Max Health Heart in all levels',
        icon: <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />,
        cost: 25 + extraHearts * 15,
        level: extraHearts,
        maxLevel: 3,
        isMaxed: extraHearts >= 3,
      },
      {
        id: 'swift_feathers',
        type: 'speed' as const,
        title: 'Swift Feathers',
        desc: '+15% Agile Running Speed & Rapid Dodging',
        icon: <Zap className="w-5 h-5 text-amber-500 fill-amber-400" />,
        cost: 20 + speedBoost * 10,
        level: speedBoost,
        maxLevel: 3,
        isMaxed: speedBoost >= 3,
      },
      {
        id: 'spring_boots',
        type: 'jump' as const,
        title: 'Springy Claws',
        desc: '+15% Sustained Jump Lift to clear high hazards',
        icon: <Flame className="w-5 h-5 text-orange-500 fill-orange-400" />,
        cost: 20 + jumpBoost * 10,
        level: jumpBoost,
        maxLevel: 3,
        isMaxed: jumpBoost >= 3,
      },
      {
        id: 'lucky_corn',
        type: 'lucky_corn' as const,
        title: 'Lucky Corn Harvest',
        desc: '+30% chance per level for double (+2) corn coins on pickup',
        icon: <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300" />,
        cost: 25 + luckyCorn * 15,
        level: luckyCorn,
        maxLevel: 3,
        isMaxed: luckyCorn >= 3,
      },
      {
        id: 'iron_beak',
        type: 'iron_beak' as const,
        title: 'Iron Beak Strike',
        desc: '+1 lethal peck strike attack damage against wild predators',
        icon: <Sword className="w-5 h-5 text-orange-400 stroke-[2.5]" />,
        cost: 25 + ironBeak * 15,
        level: ironBeak,
        maxLevel: 3,
        isMaxed: ironBeak >= 3,
      },
      {
        id: 'fluffy_glider',
        type: 'glider' as const,
        title: 'Fluffy Feathers Glider',
        desc: 'Hold jump in mid-air to float and glide gently over hazards',
        icon: <Flame className="w-5 h-5 text-yellow-200 fill-yellow-200" />,
        cost: 40,
        isMaxed: hasGlider,
      },
      {
        id: 'golden_plumage',
        type: 'plumage' as const,
        title: 'Golden Plumage Aura',
        desc: 'Radiates a dazzling golden sparkle trail and aura in battle',
        icon: <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />,
        cost: 45,
        isMaxed: hasPlumage,
      },
      {
        id: 'coin_magnet',
        type: 'magnet' as const,
        title: 'Golden Coin Magnet',
        desc: 'Magnetic aura pulls nearby pellet coins right to you',
        icon: <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400" />,
        cost: 35,
        isMaxed: hasMagnet,
      },
      {
        id: 'revive_token',
        type: 'revive' as const,
        title: 'Phoenix Feather',
        desc: 'Miraculously revives you with full hearts on fatal damage',
        icon: <Shield className="w-5 h-5 text-emerald-400 fill-emerald-400" />,
        cost: 50,
        isMaxed: hasRevive,
      },
      {
        id: 'royal_shield',
        type: 'shield' as const,
        title: 'Royal Shield',
        desc: 'Press C / Down to block attacks and deflect dragon fire',
        icon: <Shield className="w-5 h-5 text-cyan-400 fill-cyan-400" />,
        cost: 30,
        isMaxed: hasShield,
      },
      {
        id: 'diamond_sword',
        type: 'sword' as const,
        tierValue: 'diamond',
        title: 'Diamond Greatsword',
        desc: 'Apex crystalline blade dealing 6x lethal strike damage',
        icon: <Sword className="w-5 h-5 text-cyan-300 stroke-[2.5]" />,
        cost: 80,
        isMaxed: currentSword === 'diamond',
      },
      {
        id: 'diamond_armor',
        type: 'armor' as const,
        tierValue: 'diamond',
        title: 'Diamond Cuirass',
        desc: 'Apex crystalline armor granting 75% damage mitigation',
        icon: <Shield className="w-5 h-5 text-cyan-300 stroke-[2.5]" />,
        cost: 90,
        isMaxed: currentArmor === 'diamond',
      },
    ];

    const handleBuyItem = (item: typeof shopItems[0]) => {
      if (isShopClosed) {
        speakDialogue("Sorry, we are currently closed! Please check back later!", 'again');
        return;
      }
      if (item.isMaxed) return;
      if (saveData.totalCoins < item.cost) {
        return;
      }
      const success = onPurchaseUpgrade?.(item.cost, item.type, (item as any).tierValue);
      if (success) {
        speakDialogue("Thanks for your purchase!", 'purchase');
      }
    };

    return wrapWithPopup(
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-5 z-40 overflow-y-auto">
        <div className="w-full max-w-2xl bg-gradient-to-b from-amber-950/80 via-slate-900 to-slate-950 border-2 border-yellow-400 rounded-3xl p-4 sm:p-6 shadow-[0_0_60px_rgba(245,158,11,0.35)] flex flex-col max-h-[94vh] overflow-y-auto relative">
          
          {/* Header Banner */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-yellow-500/60 mb-3">
            <div className="text-left">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-yellow-400" />
                <h2 className="font-pixel-arcade text-lg sm:text-xl text-yellow-400 font-bold drop-shadow-[0_2px_0_#3b1302]">
                  UPGRADE SHOP
                </h2>
              </div>
              <p className="text-[9px] sm:text-[10px] text-yellow-400/80 font-pixel-arcade">
                SILKIE CHICKEN'S COOP EMPORIUM
              </p>
            </div>

            {/* Test Toggle Bell & Pellet Coin Wallet Display */}
            <div className="flex items-center gap-2">
              {onToggleShopStatus && (
                <button
                  onClick={onToggleShopStatus}
                  className="px-2.5 py-1.5 rounded-xl bg-yellow-950/70 border-2 border-yellow-500/60 hover:bg-yellow-900/80 text-yellow-300 font-pixel-arcade text-[8px] sm:text-[9px] cursor-pointer shadow transition-transform active:scale-95 flex items-center gap-1.5"
                  title="Click to toggle shop open or closed for testing"
                >
                  <PixelBell className="w-3 h-3 text-yellow-300" />
                  <span>{isShopClosed ? 'OPEN SHOP' : 'CLOSE (2H)'}</span>
                </button>
              )}

              {/* Pellet Coin Wallet Display */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 border-2 border-amber-600 px-3.5 py-1.5 rounded-xl shadow-[0_3px_0_#78350f]">
                <PixelCoins className="w-5 h-5 shrink-0" />
                <span className="font-pixel-arcade text-slate-950 text-xs sm:text-sm font-bold tabular-nums">
                  {saveData.totalCoins} PELLET COINS
                </span>
              </div>
            </div>
          </div>

          {/* Closed Shop Notice Banner */}
          {isShopClosed && (
            <div className="w-full bg-gradient-to-r from-rose-950/90 via-slate-900 to-rose-950/90 border-2 border-rose-500 rounded-2xl p-3 sm:p-3.5 mb-3.5 shadow-[0_0_25px_rgba(244,63,94,0.3)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-9 h-9 rounded-xl bg-rose-900/60 border border-rose-400 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-rose-400 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-pixel-arcade text-[10px] sm:text-xs text-rose-300 font-bold flex items-center gap-1.5">
                      <PixelLock className="w-3.5 h-3.5 text-rose-400 inline" />
                      <span>SILKIE'S EMPORIUM IS TEMPORARILY CLOSED</span>
                    </span>
                  </div>
                  <p className="text-[9px] text-rose-200/90 font-pixel-arcade mt-0.5">
                    Closed for restock for 2 hours! Silkie Sam is away in the mystic hills. Reopens in: <span className="text-yellow-300 font-bold underline">{timeStr}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              SILKIE CHICKEN SHOPKEEPER DIALOGUE BUBBLE
              (Meticulously styled just like the boss's dialogue bubble with speech sound effects!)
              ═══════════════════════════════════════════════════════════════ */}
          <div 
            onClick={() => {
              // Click to replay Silkie Sam's voice!
              if (saveData.hasCompletedGame) {
                if (postBossTimerRef.current) {
                  clearTimeout(postBossTimerRef.current);
                  postBossTimerRef.current = null;
                }
                if (postBossTimer2Ref.current) {
                  clearTimeout(postBossTimer2Ref.current);
                  postBossTimer2Ref.current = null;
                }
                if (postBossTimer3Ref.current) {
                  clearTimeout(postBossTimer3Ref.current);
                  postBossTimer3Ref.current = null;
                }
                if (postBossStepRef.current === 1) {
                  postBossStepRef.current = 2;
                  speakDialogue("thank you for saving Mount Cluckmore", 'talk');
                } else if (postBossStepRef.current === 2 && shopSessionPostBossCanClaimRef.current) {
                  postBossStepRef.current = 3;
                  speakDialogue("here is your reward", 'purchase');
                } else {
                  postBossStepRef.current = 1;
                  speakDialogue("oh your back..", 'welcome');
                }
                return;
              }
              const sType = isShopClosed ? 'again' : (shopkeeperDialogue.includes('Equipped') || shopkeeperDialogue.includes('Unlocked')
                ? 'purchase'
                : (shopSessionInitialTextRef.current === "hello welcome to my shop!" ? 'welcome' : 'again'));
              speakDialogue(shopkeeperDialogue, sType);
            }}
            title="Click Silkie Sam to talk!"
            className="relative w-full rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-[3px] border-yellow-400 p-3.5 sm:p-4 mb-4 shadow-[0_0_30px_rgba(250,204,21,0.25)] flex items-start gap-3.5 cursor-pointer hover:border-yellow-300 transition-all select-none group"
          >
            {/* 4 Golden Corner Studs */}
            <div className="absolute top-1.5 left-1.5 w-2 h-2 bg-yellow-400 rounded-sm flex items-center justify-center">
              <div className="w-1 h-1 bg-white" />
            </div>
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-400 rounded-sm flex items-center justify-center">
              <div className="w-1 h-1 bg-white" />
            </div>
            <div className="absolute bottom-1.5 left-1.5 w-2 h-2 bg-yellow-400 rounded-sm flex items-center justify-center">
              <div className="w-1 h-1 bg-white" />
            </div>
            <div className="absolute bottom-1.5 right-1.5 w-2 h-2 bg-yellow-400 rounded-sm flex items-center justify-center">
              <div className="w-1 h-1 bg-white" />
            </div>

            {/* Framed Silkie Portrait on Left */}
            <div className="shrink-0 p-1 bg-amber-950/80 border-2 border-yellow-400 rounded-xl shadow-inner group-hover:scale-105 transition-transform">
              <SilkiePortraitCanvas size={58} isSpeaking={isSilkieSpeaking} />
            </div>

            {/* Dialogue & Nameplate Plaque */}
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="px-2.5 py-0.5 rounded bg-red-950 border border-red-700/80 text-yellow-400 font-pixel-arcade text-[9px] tracking-wider inline-flex items-center gap-1.5 drop-shadow-[0_1px_0_#0f172a]">
                  <PixelShop className="w-3.5 h-3.5 inline text-yellow-400" />
                  <span>SILKIE SAM - MASTER COOP MERCHANT</span>
                </div>
                {isSilkieSpeaking && (
                  <span className="flex items-center gap-1 text-[8px] font-pixel-arcade text-yellow-400 animate-pulse">
                    <Volume2 className="w-3 h-3 text-yellow-400" />
                    <span>TALKING</span>
                  </span>
                )}
              </div>

              {/* Dynamic Spoken Dialogue with Retro Typewriter Cursor */}
              <div className="text-yellow-200 font-pixel-arcade text-xs sm:text-sm leading-relaxed drop-shadow-[0_2px_0_#000000]">
                "{displayedDialogue}"
                {isSilkieSpeaking && (
                  <span className="inline-block w-1.5 h-3 bg-yellow-400 ml-1 animate-pulse align-middle" />
                )}
              </div>

              <div className="mt-1 text-[8px] sm:text-[9px] text-yellow-400/70 font-pixel-arcade flex items-center justify-between">
                <span>Fluffy Silkie chicken merchant with rare avian gear & charms!</span>
                <span className="text-[8px] text-amber-300/80 hidden sm:inline">(Click to replay voice)</span>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              SHOP TABS SWITCHER: [ UPGRADES ] vs [ APPEARANCE ]
              ═══════════════════════════════════════════════════════════════ */}
          <div className="flex items-center gap-2 mb-3 select-none">
            <button
              type="button"
              onClick={() => {
                setShopTab('upgrades');
                speakDialogue("Need combat armor or charms? Browse our sturdy masterwork gear!", 'talk');
              }}
              className={`flex-1 py-2 sm:py-2.5 px-3 rounded-2xl font-pixel-arcade text-[10px] sm:text-xs font-bold border-2 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm ${
                shopTab === 'upgrades'
                  ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-950 border-amber-600 shadow-[0_3px_0_#78350f,0_0_15px_rgba(245,158,11,0.35)]'
                  : 'bg-slate-900/90 text-yellow-400/80 border-yellow-500/40 hover:bg-slate-800 hover:text-yellow-300'
              }`}
            >
              <Zap className="w-4 h-4 stroke-[2.5]" />
              <span>UPGRADES</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShopTab('appearance');
                speakDialogue("Trying on new plumage? Our feathers are dyed with enchanted elderberries!", 'talk');
              }}
              className={`flex-1 py-2 sm:py-2.5 px-3 rounded-2xl font-pixel-arcade text-[10px] sm:text-xs font-bold border-2 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm ${
                shopTab === 'appearance'
                  ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-950 border-amber-600 shadow-[0_3px_0_#78350f,0_0_15px_rgba(245,158,11,0.35)]'
                  : 'bg-slate-900/90 text-yellow-400/80 border-yellow-500/40 hover:bg-slate-800 hover:text-yellow-300'
              }`}
            >
              <Palette className="w-4 h-4 stroke-[2.5]" />
              <span>APPEARANCE</span>
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              TAB 1: UPGRADE CARDS GRID
              ═══════════════════════════════════════════════════════════════ */}
          {shopTab === 'upgrades' && (
            <>
              <div 
                ref={shopScrollRef}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2 max-h-[44vh] overflow-y-auto pr-1 touch-pan-y scrollbar-thin"
              >
                {shopItems.map(item => {
                  const canAfford = saveData.totalCoins >= item.cost;
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                        item.isMaxed
                          ? 'bg-yellow-950/30 border-yellow-600/50 opacity-80'
                          : 'bg-gradient-to-b from-yellow-950/40 to-slate-900/90 border-yellow-500/80 shadow-[0_0_12px_rgba(245,158,11,0.2)] hover:border-yellow-400'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 mb-2">
                        <div className="w-9 h-9 rounded-xl bg-yellow-400/20 border border-yellow-500/60 flex items-center justify-center shrink-0">
                          {item.icon}
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-pixel-arcade text-[10px] sm:text-[11px] text-yellow-400 font-bold truncate">
                              {item.title}
                            </h4>
                            {item.level !== undefined && (
                              <span className="text-[9px] font-pixel-arcade text-yellow-400/80 px-1.5 py-0.2 rounded bg-yellow-950/60 border border-yellow-600/50 shrink-0">
                                Lv {item.level}/{item.maxLevel}
                              </span>
                            )}
                          </div>
                          <p className="text-[9px] text-slate-300 font-body leading-tight mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-yellow-600/30 flex items-center justify-between">
                        {item.isMaxed ? (
                          <span className="text-[9px] font-pixel-arcade text-emerald-400 font-bold px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-600 w-full text-center">
                            ✓ MAXIMUM EQUIPPED
                          </span>
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5">
                              <PixelCoins className="w-3.5 h-3.5 shrink-0" />
                              <span className="font-pixel-arcade text-[10px] text-yellow-400 font-bold tabular-nums">
                                {item.cost} Pellet Coins
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleBuyItem(item)}
                              disabled={!canAfford || isShopClosed}
                              className={`px-3 py-1.5 rounded-xl font-pixel-arcade text-[9px] font-bold transition-all cursor-pointer ${
                                isShopClosed
                                  ? 'bg-rose-950/80 text-rose-300 border border-rose-600/70 opacity-80'
                                  : canAfford
                                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 active:from-yellow-300 active:to-yellow-400 text-slate-950 border border-amber-600 shadow-[0_2px_0_#78350f] active:translate-y-0.5 active:shadow-none'
                                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                              }`}
                            >
                              {isShopClosed ? 'CLOSED' : 'BUY UPGRADE'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Tablet & Mobile Smooth Scroll Helper Buttons */}
              <TabletScrollButtons containerRef={shopScrollRef} className="mb-3" />
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB 2: APPEARANCE SHOP & COLOR VARIATIONS
              ═══════════════════════════════════════════════════════════════ */}
          {shopTab === 'appearance' && (
            <div className="flex flex-col mb-2">
              {/* Interactive Growth Stage Switcher for Live Skin Preview */}
              <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-900/90 border border-yellow-500/40 rounded-xl mb-2.5 w-full">
                {[
                  { id: 'baby', label: 'Baby Chick', icon: <PixelChick className="w-3.5 h-3.5" /> },
                  { id: 'juvenile', label: 'Juvenile', icon: <PixelJuvenile className="w-3.5 h-3.5" /> },
                  { id: 'teen', label: 'Teen', icon: <PixelRooster className="w-3.5 h-3.5" /> },
                  { id: 'adult', label: 'Adult Hero', icon: <PixelCrown className="w-3.5 h-3.5" /> },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setAppearanceStage(tab.id as GrowthStage)}
                    className={`flex-1 py-1 px-1.5 rounded-lg text-[9px] sm:text-[10px] font-pixel-arcade transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      appearanceStage === tab.id
                        ? 'bg-yellow-400 text-slate-950 font-bold shadow-sm'
                        : 'text-yellow-400/70 hover:text-yellow-300 hover:bg-slate-800'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Rarity Filter Tabs */}
              <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto pb-1 scrollbar-none select-none">
                {[
                  { id: 'ALL', label: 'ALL (26)' },
                  { id: 'Common', label: 'COMMON (5)' },
                  { id: 'Rare', label: 'RARE (5)' },
                  { id: 'Epic', label: 'EPIC (5)' },
                  { id: 'Legendary', label: 'LEGENDARY (5)' },
                  { id: 'Mythic', label: 'MYTHIC (5)' },
                  { id: 'Secret', label: '★ SECRET (1)' },
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSkinRarityFilter(f.id as typeof skinRarityFilter)}
                    className={`px-2.5 py-1 rounded-xl text-[8px] sm:text-[9px] font-pixel-arcade font-bold border transition-all cursor-pointer whitespace-nowrap ${
                      skinRarityFilter === f.id
                        ? 'bg-yellow-400 text-slate-950 border-amber-600 shadow-sm'
                        : 'bg-slate-900/90 text-yellow-400/75 border-yellow-500/30 hover:text-yellow-300 hover:bg-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Live Character Model Preview Canvas with Active Skin */}
              {(() => {
                const currentPreviewDef = getSkinDefinition(previewSkinId);
                return (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/60 border-2 border-yellow-500/70 mb-3 shadow-inner">
                    <div className="shrink-0">
                      <ChickenPreviewCanvas
                        gender={saveData.gender || 'rooster'}
                        stage={appearanceStage}
                        armor={saveData.armor || 'none'}
                        sword={saveData.sword || 'none'}
                        skin={previewSkinId}
                        renderer={renderer}
                        size={110}
                      />
                    </div>

                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-pixel-arcade text-[11px] sm:text-xs text-yellow-400 font-bold">
                          {currentPreviewDef.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-pixel-arcade bg-yellow-950 border border-yellow-500/60 text-yellow-300">
                          {currentPreviewDef.rarity}
                        </span>
                      </div>
                      <p className="text-[9px] text-yellow-200/90 font-pixel-arcade mb-1.5">
                        {currentPreviewDef.subtitle}
                      </p>
                      <p className="text-[9px] text-slate-300 font-body leading-tight">
                        {currentPreviewDef.description}
                      </p>

                      {/* Color Swatch Dots */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[8px] font-pixel-arcade text-yellow-400/80 mr-1">PALETTE:</span>
                        {currentPreviewDef.swatches.map((color, idx) => (
                          <div
                            key={idx}
                            className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Appearance Skins Grid */}
              <div 
                ref={appearanceScrollRef}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[36vh] overflow-y-auto pr-1 touch-pan-y scrollbar-thin"
              >
                {(() => {
                  const displaySkins = skinRarityFilter === 'ALL'
                    ? CHICKEN_SKINS
                    : CHICKEN_SKINS.filter(s => s.rarity === skinRarityFilter);

                  return displaySkins.map(skin => {
                    const unlockedList = saveData.unlockedSkins || ['classic'];
                    const isUnlocked = unlockedList.includes(skin.id);
                    const isEquipped = (saveData.selectedSkin || 'classic') === skin.id;
                    const canAfford = saveData.totalCoins >= skin.price;

                    return (
                      <div
                        key={skin.id}
                        onClick={() => setPreviewSkinId(skin.id)}
                        className={`p-3 rounded-2xl border-2 transition-all flex flex-col justify-between cursor-pointer text-left ${
                          previewSkinId === skin.id
                            ? 'ring-2 ring-yellow-400 border-yellow-300 bg-amber-950/50 shadow-[0_0_15px_rgba(250,204,21,0.3)]'
                            : isEquipped
                            ? 'border-emerald-500 bg-emerald-950/30'
                            : 'border-yellow-500/60 bg-gradient-to-b from-yellow-950/30 to-slate-900/90 hover:border-yellow-400'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <h4 className="font-pixel-arcade text-[10px] sm:text-[11px] text-yellow-400 font-bold truncate">
                              {skin.name}
                            </h4>
                            <span className={`text-[8px] font-pixel-arcade px-1.5 py-0.5 rounded border ${
                              skin.rarity === 'Secret'
                                ? 'bg-gradient-to-r from-amber-950 via-yellow-950 to-amber-950 border-amber-400 text-yellow-300 font-bold shadow-[0_0_10px_rgba(250,204,21,0.5)]'
                                : skin.rarity === 'Mythic'
                                ? 'bg-rose-950 border-rose-500 text-rose-300'
                                : skin.rarity === 'Legendary'
                                ? 'bg-amber-950 border-amber-500 text-amber-300'
                                : skin.rarity === 'Epic'
                                ? 'bg-purple-950 border-purple-500 text-purple-300'
                                : 'bg-slate-900 border-slate-700 text-slate-300'
                            }`}>
                              {skin.rarity === 'Secret' ? '★ SECRET' : skin.rarity}
                            </span>
                          </div>

                          {/* Palette Swatches */}
                          <div className="flex items-center gap-1.5 mb-1.5">
                            {skin.swatches.map((sw, i) => (
                              <div
                                key={i}
                                className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-sm shrink-0"
                                style={{ backgroundColor: sw }}
                              />
                            ))}
                            <span className="text-[8px] text-yellow-400/70 font-pixel-arcade ml-1 truncate">
                              {skin.subtitle}
                            </span>
                          </div>

                          <p className="text-[9px] text-slate-300 font-body leading-tight mb-2">
                            {skin.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-yellow-600/30 flex items-center justify-between">
                          {isEquipped ? (
                            <span className="text-[9px] font-pixel-arcade text-emerald-400 font-bold px-2 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500 w-full text-center flex items-center justify-center gap-1">
                              <span>✓</span>
                              <span>CURRENTLY EQUIPPED</span>
                            </span>
                          ) : isUnlocked ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEquipSkin?.(skin.id);
                                setPreviewSkinId(skin.id);
                                speakDialogue(`Equipped the ${skin.name}! You look splendid!`, 'purchase');
                              }}
                              className="w-full py-1.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-pixel-arcade text-[9px] font-bold border border-amber-600 shadow-[0_2px_0_#78350f] active:translate-y-0.5 cursor-pointer"
                            >
                              EQUIP SKIN
                            </button>
                          ) : (
                            <>
                              <div className="flex items-center gap-1">
                                <PixelCoins className="w-3.5 h-3.5 shrink-0" />
                                <span className="font-pixel-arcade text-[10px] text-yellow-400 font-bold tabular-nums">
                                  {skin.price} Pellet Coins
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isShopClosed) {
                                    speakDialogue("Sorry, we are currently closed! Please check back later!", 'again');
                                    return;
                                  }
                                  if (!canAfford) return;
                                  const ok = onBuySkin?.(skin.id, skin.price);
                                  if (ok) {
                                    setPreviewSkinId(skin.id);
                                    speakDialogue(`Unlocked the ${skin.name}! Enjoy your new plumage!`, 'purchase');
                                  }
                                }}
                                disabled={!canAfford || isShopClosed}
                                className={`px-3 py-1.5 rounded-xl font-pixel-arcade text-[9px] font-bold transition-all cursor-pointer ${
                                  isShopClosed
                                    ? 'bg-rose-950/80 text-rose-300 border border-rose-600 opacity-80'
                                    : canAfford
                                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 border border-amber-600 shadow-[0_2px_0_#78350f] active:translate-y-0.5'
                                    : 'bg-slate-800 text-slate-500 border border-slate-700 opacity-60 cursor-not-allowed'
                                }`}
                              >
                                {isShopClosed ? 'CLOSED' : 'BUY SKIN'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
              {/* Tablet & Mobile Smooth Scroll Helper Buttons */}
              <TabletScrollButtons containerRef={appearanceScrollRef} className="my-2" />
            </div>
          )}

          {/* Bottom Navigation */}
          <button
            onClick={onReturnToMenu}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 text-slate-950 font-pixel-arcade font-bold text-xs tracking-wider border-2 border-amber-600 shadow-[0_4px_0_#78350f,0_0_18px_rgba(245,158,11,0.3)] active:translate-y-1 active:shadow-[0_1px_0_#78350f] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            ← RETURN TO MAIN MENU
          </button>

          {/* Secret Skin Celebration Popup Modal */}
          {showSecretSkinModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
              <div className="w-full max-w-md border-[3px] border-yellow-400 bg-gradient-to-b from-yellow-950/95 via-slate-900/95 to-amber-950/95 rounded-3xl p-5 sm:p-6 flex flex-col items-center text-center relative overflow-hidden select-none shadow-[0_0_50px_rgba(250,204,21,0.5)]">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400 text-slate-950 font-pixel-arcade text-[9px] font-bold mb-3.5 shadow">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>★ SECRET HERO REWARD FROM SILKIE SAM! ★</span>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>

                <div className="p-2 bg-gradient-to-b from-yellow-500/20 to-amber-950 border-2 border-yellow-400 flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(250,204,21,0.4)]">
                  <ChickenPreviewCanvas
                    size={96}
                    gender={saveData.gender || 'rooster'}
                    stage="adult"
                    armor={saveData.armor || 'none'}
                    sword={saveData.sword || 'none'}
                    skin="thanksgiving_roast"
                    renderer={renderer}
                  />
                </div>

                <h3 className="font-pixel-arcade text-base sm:text-lg text-yellow-300 drop-shadow-[0_2px_0_#000] mb-1">
                  Thanksgiving Golden Roast
                </h3>
                <div className="text-[11px] text-yellow-400 font-pixel-arcade mb-2">
                  "thank you for saving Mount Cluckmore — here is your reward"
                </div>

                <p className="text-xs text-amber-100/90 font-body leading-relaxed mb-3">
                  The ultimate secret roast chicken! Perfectly oven-roasted crispy golden skin sprinkled with cracked rosemary herbs and ivory bone drumsticks.
                </p>

                <div className="px-3 py-1.5 rounded-xl bg-amber-950/90 border border-yellow-400 text-yellow-300 font-pixel-arcade text-[10px] mb-2 font-bold">
                  ★ +1,000,000 PELLET COINS AWARDED! ★
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-pixel-arcade text-[9px] mb-4">
                  ✓ SECRET SKIN UNLOCKED & EQUIPPED!
                </div>

                <button
                  type="button"
                  onClick={() => setShowSecretSkinModal(false)}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-pixel-arcade text-xs font-bold border border-amber-600 shadow-[0_3px_0_#78350f] active:translate-y-0.5 cursor-pointer"
                >
                  AWESOME! THANKS SILKIE SAM!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- 📜 QUESTS & BADGES SCREEN ---
  if (currentScreen === 'QUESTS_BADGES') {
    const quests = getQuestsWithStatus(saveData);
    const badges = getBadgesWithStatus(saveData);
    const unclaimedCount = countUnclaimedQuests(saveData);

    return wrapWithPopup(
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-5 z-40 overflow-y-auto">
        <div className="w-full max-w-2xl bg-gradient-to-b from-amber-950/80 via-slate-900 to-slate-950 border-2 border-yellow-400 rounded-3xl p-4 sm:p-6 shadow-[0_0_60px_rgba(245,158,11,0.35)] flex flex-col max-h-[94vh] overflow-y-auto relative">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-yellow-500/60 mb-3">
            <div>
              <h2 className="font-pixel-arcade text-lg sm:text-xl text-yellow-400 font-bold drop-shadow-[0_2px_0_#3b1302]">
                QUESTS & BADGES
              </h2>
              <p className="text-[9px] sm:text-[10px] text-yellow-400/80 font-pixel-arcade">
                COMPLETE FEATS TO EARN PELLET COINS & TROPHIES
              </p>
            </div>

            {/* Quick Coin Status */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 border-2 border-amber-600 px-3 py-1 rounded-xl shadow-[0_2px_0_#78350f]">
              <PixelCoins className="w-4 h-4 shrink-0" />
              <span className="font-pixel-arcade text-slate-950 text-xs font-bold">
                {saveData.totalCoins} PELLET COINS
              </span>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 mb-4 bg-slate-950/60 p-1.5 rounded-2xl border-2 border-yellow-500/60">
            <button
              onClick={() => setQuestTab('quests')}
              className={`flex-1 py-2 px-3 rounded-xl font-pixel-arcade text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                questTab === 'quests'
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 border border-amber-600 shadow-[0_2px_0_#78350f]'
                  : 'text-yellow-400 hover:bg-slate-800'
              }`}
            >
              <Scroll className="w-3.5 h-3.5" />
              <span>QUESTS & REWARDS</span>
              {unclaimedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[9px]">
                  {unclaimedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setQuestTab('badges')}
              className={`flex-1 py-2 px-3 rounded-xl font-pixel-arcade text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                questTab === 'badges'
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 border border-amber-600 shadow-[0_2px_0_#78350f]'
                  : 'text-yellow-400 hover:bg-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>HERO BADGES</span>
            </button>
          </div>

          {/* Quests Tab Content */}
          {questTab === 'quests' && (
            <>
              <div ref={questsScrollRef} className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1 mb-2 touch-pan-y scrollbar-thin">
                {quests.map(quest => {
                  const progressPct = Math.min(100, Math.floor((quest.current / quest.target) * 100));
                  return (
                    <div
                      key={quest.id}
                      className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                        quest.claimed
                          ? 'bg-yellow-950/20 border-yellow-700/40 opacity-70'
                          : quest.completed
                          ? 'bg-yellow-950/50 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.25)]'
                          : 'bg-slate-900/90 border-yellow-600/50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-yellow-400/20 border border-yellow-500/60 flex items-center justify-center text-lg shrink-0">
                        <PixelQuestIcon name={quest.icon} className="w-5 h-5" />
                      </div>

                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-pixel-arcade text-[10px] sm:text-[11px] text-yellow-400 font-bold truncate">
                            {quest.title}
                          </h4>
                          <span className="font-pixel-arcade text-[9px] text-yellow-300 font-bold shrink-0">
                            +{quest.rewardCoins} PELLET COINS
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-300 font-body leading-tight mt-0.5">
                          {quest.description}
                        </p>

                        {/* Progress Bar */}
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-950 rounded-full border border-yellow-600/50 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span className="text-[8px] font-pixel-arcade text-yellow-400/80 tabular-nums shrink-0">
                            {quest.current}/{quest.target}
                          </span>
                        </div>
                      </div>

                      {/* Claim Button or Status */}
                      <div className="shrink-0">
                        {quest.claimed ? (
                          <span className="text-[9px] font-pixel-arcade text-emerald-400 font-bold px-2 py-1 rounded bg-emerald-950/60 border border-emerald-600">
                            CLAIMED ✓
                          </span>
                        ) : quest.completed ? (
                          <button
                            onClick={() => onClaimQuest?.(quest.id, quest.rewardCoins)}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 active:from-yellow-300 active:to-yellow-400 text-slate-950 font-pixel-arcade text-[9px] font-bold border-2 border-amber-600 shadow-[0_2px_0_#78350f,0_0_12px_rgba(250,204,21,0.4)] active:translate-y-0.5 active:shadow-none transition-all animate-pulse cursor-pointer"
                          >
                            CLAIM REWARD!
                          </button>
                        ) : (
                          <span className="text-[9px] font-pixel-arcade text-yellow-400/60 px-2 py-1 rounded bg-yellow-950/40 border border-yellow-700/50">
                            {progressPct}%
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <TabletScrollButtons containerRef={questsScrollRef} className="mb-3" />
            </>
          )}

          {/* Badges Tab Content */}
          {questTab === 'badges' && (
            <>
              <div ref={badgesScrollRef} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto pr-1 mb-2 touch-pan-y scrollbar-thin">
                {badges.map(badge => {
                  const isSecret = Boolean((badge as any).isSecret);
                  const isUnlocked = badge.unlocked;

                  const tierColors = {
                    bronze: 'border-amber-700 bg-amber-950/30 text-amber-400',
                    silver: 'border-slate-400 bg-slate-900/40 text-slate-300',
                    gold: 'border-yellow-400 bg-yellow-950/40 text-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.2)]',
                    diamond: 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]',
                  };

                  return (
                    <div
                      key={badge.id}
                      className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                        isUnlocked
                          ? (isSecret ? 'border-amber-400 bg-gradient-to-r from-purple-950/60 via-slate-900 to-amber-950/50 text-yellow-300 shadow-[0_0_20px_rgba(245,158,11,0.35)]' : tierColors[badge.tier])
                          : (isSecret ? 'border-purple-800/60 bg-purple-950/20 text-purple-300/80' : 'border-slate-800 bg-slate-950/60 opacity-60')
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-yellow-500/40 flex items-center justify-center text-xl shrink-0">
                        {isUnlocked ? (
                          <PixelQuestIcon name={badge.icon} className="w-5 h-5" />
                        ) : isSecret ? (
                          <PixelSecret className="w-5 h-5" />
                        ) : (
                          <PixelLock className="w-5 h-5" />
                        )}
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-pixel-arcade text-[10px] sm:text-[11px] font-bold truncate">
                            {isSecret && !isUnlocked ? '??? (SECRET BADGE)' : badge.title}
                          </h4>
                          <span className={`text-[8px] font-pixel-arcade uppercase px-1.5 py-0.2 rounded border ${
                            isSecret ? 'bg-purple-900/60 border-purple-400 text-purple-200' : 'bg-black/40 border-white/20'
                          }`}>
                            {isSecret ? 'SECRET' : badge.tier}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-300 font-body leading-tight mt-0.5">
                          {isSecret && !isUnlocked
                            ? 'A secret avian accomplishment! Revisit old homes or pull off legendary feats to discover.'
                            : badge.description}
                        </p>
                        <div className="mt-1">
                          {isUnlocked ? (
                            <span className="text-[8px] font-pixel-arcade text-emerald-400 font-bold">
                              ✓ {isSecret ? 'SECRET UNLOCKED!' : 'UNLOCKED'}
                            </span>
                          ) : (
                            <span className="text-[8px] font-pixel-arcade text-slate-500">
                              {isSecret ? 'UNDISCOVERED' : 'LOCKED'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <TabletScrollButtons containerRef={badgesScrollRef} className="mb-3" />
            </>
          )}

          {/* Bottom Return Button */}
          <button
            onClick={onReturnToMenu}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 text-slate-950 font-pixel-arcade font-bold text-xs tracking-wider border-2 border-amber-600 shadow-[0_4px_0_#78350f,0_0_18px_rgba(245,158,11,0.3)] active:translate-y-1 active:shadow-[0_1px_0_#78350f] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            ← RETURN TO MAIN MENU
          </button>
        </div>
      </div>
    );
  }

  return null;
};
