import React from 'react';
import { Volume2, VolumeX, Music, Pause, Shield, Sword, Gamepad2, Home, LogOut, Maximize2, Minimize2, Lock, Smile, Eye, EyeOff } from 'lucide-react';
import { GrowthStage, ArmorType, SwordType, EmoteId } from '../game/types';
import { EMOTES } from '../game/emotes';
import { PixelChick, PixelJuvenile, PixelRooster, PixelCrown } from './PixelIcons';
import { PixelEmoteIcon } from './PixelEmoteIcons';

interface GameHUDProps {
  levelNumber: number;
  worldName: string;
  levelTitle: string;
  health: number;
  maxHealth: number;
  coins: number;
  stage: GrowthStage;
  armor: ArmorType;
  sword: SwordType;
  fireResistTimer?: number;
  poisonTimer?: number;
  poisonMaxDuration?: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  showTouchControls: boolean;
  isFullscreen?: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onToggleTouchControls: () => void;
  onToggleFullscreen?: () => void;
  onPause: () => void;
  onReturnToMenu: () => void;
  onLogOut?: () => void;
  unlockedEmotes?: EmoteId[];
  activeEmote?: EmoteId | null;
  shopPurchases?: number;
  emoteTrayOpen?: boolean;
  onToggleEmoteTray?: () => void;
  onTriggerEmote?: (emoteId: EmoteId) => void;
  hideUI?: boolean;
  onToggleHideUI?: () => void;
  unlockedArmors?: ArmorType[];
  unlockedSwords?: SwordType[];
  hasAxe?: boolean;
  hasBrush?: boolean;
  selectedItem?: 'sword' | 'axe' | 'brush';
  onEquipArmor?: (armor: ArmorType) => void;
  onEquipSword?: (sword: SwordType) => void;
  onSelectInventoryItem?: (item: 'sword' | 'axe' | 'brush') => void;
  bossRushRound?: 1 | 2 | null;
  bossRushBonusCoins?: number;
  bossRushElapsedMs?: number;
}

// Retro 8-bit Pixelated Flame Icon Component
export const PixelFlameIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 10 10"
    className={className}
    style={{ shapeRendering: 'crispEdges' }}
  >
    {/* Dark outline */}
    <rect x="4" y="0" width="2" height="1" fill="#451a03" />
    <rect x="3" y="1" width="1" height="2" fill="#451a03" />
    <rect x="6" y="1" width="1" height="2" fill="#451a03" />
    <rect x="2" y="2" width="1" height="2" fill="#451a03" />
    <rect x="7" y="2" width="1" height="3" fill="#451a03" />
    <rect x="1" y="4" width="1" height="4" fill="#451a03" />
    <rect x="8" y="4" width="1" height="4" fill="#451a03" />
    <rect x="2" y="8" width="1" height="1" fill="#451a03" />
    <rect x="7" y="8" width="1" height="1" fill="#451a03" />
    <rect x="3" y="9" width="4" height="1" fill="#451a03" />

    {/* Outer Crimson / Orange Base */}
    <rect x="4" y="1" width="2" height="2" fill="#ea580c" />
    <rect x="3" y="3" width="4" height="3" fill="#ea580c" />
    <rect x="2" y="4" width="6" height="4" fill="#dc2626" />
    <rect x="3" y="8" width="4" height="1" fill="#dc2626" />

    {/* Vibrant Amber / Bright Orange Body */}
    <rect x="4" y="3" width="2" height="4" fill="#f97316" />
    <rect x="3" y="5" width="4" height="3" fill="#f97316" />

    {/* Searing Golden Yellow Heart */}
    <rect x="4" y="5" width="2" height="3" fill="#facc15" />
    <rect x="4" y="6" width="2" height="2" fill="#fef08a" />

    {/* White-Hot Flame Core Spark */}
    <rect x="4" y="7" width="1" height="1" fill="#ffffff" />
  </svg>
);

// Retro 8-bit Pixelated Snake Venom Drop Icon Component
const PixelPoisonIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 10 10"
    className={className}
    style={{ shapeRendering: 'crispEdges' }}
    aria-hidden="true"
  >
    {/* Dark forest outline */}
    <rect x="4" y="0" width="2" height="1" fill="#052e16" />
    <rect x="3" y="1" width="1" height="2" fill="#052e16" />
    <rect x="6" y="1" width="1" height="2" fill="#052e16" />
    <rect x="2" y="3" width="1" height="2" fill="#052e16" />
    <rect x="7" y="3" width="1" height="2" fill="#052e16" />
    <rect x="1" y="5" width="1" height="3" fill="#052e16" />
    <rect x="8" y="5" width="1" height="3" fill="#052e16" />
    <rect x="2" y="8" width="1" height="1" fill="#052e16" />
    <rect x="7" y="8" width="1" height="1" fill="#052e16" />
    <rect x="3" y="9" width="4" height="1" fill="#052e16" />

    {/* Rich emerald venom body */}
    <rect x="4" y="1" width="2" height="2" fill="#22c55e" />
    <rect x="3" y="3" width="4" height="2" fill="#16a34a" />
    <rect x="2" y="5" width="6" height="3" fill="#16a34a" />
    <rect x="3" y="8" width="4" height="1" fill="#15803d" />

    {/* Glowing lime highlight */}
    <rect x="4" y="2" width="1" height="2" fill="#86efac" />
    <rect x="3" y="4" width="2" height="2" fill="#4ade80" />
    <rect x="3" y="5" width="1" height="1" fill="#ecfccb" />
    <rect x="6" y="6" width="1" height="1" fill="#a3e635" />
  </svg>
);

// Retro 8-bit Pixelated Heart Component (supports full, half, empty, and poisoned venom tint)
const PixelHeart: React.FC<{ fillState: 'full' | 'half' | 'empty'; poisoned?: boolean; className?: string }> = ({
  fillState,
  poisoned = false,
  className = '',
}) => {
  const baseFill = poisoned ? '#16a34a' : '#dc2626';
  const hiFill = poisoned ? '#4ade80' : '#ef4444';
  const emptyFill = '#1e293b';

  return (
    <svg
      viewBox="0 0 10 9"
      className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${fillState !== 'empty' ? 'scale-100' : 'scale-90 opacity-70'} ${className}`}
      style={{ shapeRendering: 'crispEdges' }}
    >
      {/* Dark brown pixel outline */}
      <rect x="1" y="0" width="3" height="1" fill="#3b1302" />
      <rect x="6" y="0" width="3" height="1" fill="#3b1302" />
      <rect x="0" y="1" width="1" height="3" fill="#3b1302" />
      <rect x="4" y="1" width="2" height="2" fill="#3b1302" />
      <rect x="9" y="1" width="1" height="3" fill="#3b1302" />
      <rect x="0" y="4" width="1" height="1" fill="#3b1302" />
      <rect x="9" y="4" width="1" height="1" fill="#3b1302" />
      <rect x="1" y="5" width="1" height="1" fill="#3b1302" />
      <rect x="8" y="5" width="1" height="1" fill="#3b1302" />
      <rect x="2" y="6" width="1" height="1" fill="#3b1302" />
      <rect x="7" y="6" width="1" height="1" fill="#3b1302" />
      <rect x="3" y="7" width="1" height="1" fill="#3b1302" />
      <rect x="6" y="7" width="1" height="1" fill="#3b1302" />
      <rect x="4" y="8" width="2" height="1" fill="#3b1302" />

      {/* Empty Slate Base */}
      <rect x="1" y="1" width="3" height="3" fill={emptyFill} />
      <rect x="6" y="1" width="3" height="3" fill={emptyFill} />
      <rect x="1" y="4" width="8" height="1" fill={emptyFill} />
      <rect x="2" y="5" width="6" height="1" fill={emptyFill} />
      <rect x="3" y="6" width="4" height="1" fill={emptyFill} />
      <rect x="4" y="7" width="2" height="1" fill={emptyFill} />

      {/* Left Half Fill (shown for both half & full) */}
      {fillState !== 'empty' && (
        <>
          <rect x="1" y="1" width="3" height="3" fill={baseFill} />
          <rect x="1" y="4" width="4" height="1" fill={baseFill} />
          <rect x="2" y="5" width="3" height="1" fill={baseFill} />
          <rect x="3" y="6" width="2" height="1" fill={baseFill} />
          <rect x="4" y="7" width="1" height="1" fill={baseFill} />
          <rect x="2" y="2" width="2" height="2" fill={hiFill} />
          <rect x="3" y="4" width="2" height="1" fill={hiFill} />
          <rect x="1" y="1" width="1" height="1" fill="#ffffff" />
          <rect x="2" y="1" width="1" height="1" fill="#ffffff" />
        </>
      )}

      {/* Right Half Fill (shown for full only) */}
      {fillState === 'full' && (
        <>
          <rect x="6" y="1" width="3" height="3" fill={baseFill} />
          <rect x="5" y="4" width="4" height="1" fill={baseFill} />
          <rect x="5" y="5" width="3" height="1" fill={baseFill} />
          <rect x="5" y="6" width="2" height="1" fill={baseFill} />
          <rect x="5" y="7" width="1" height="1" fill={baseFill} />
          <rect x="7" y="2" width="2" height="2" fill={hiFill} />
          <rect x="5" y="4" width="2" height="1" fill={hiFill} />
        </>
      )}
    </svg>
  );
};

// Retro 8-bit Pixelated Coin Component
const PixelCoin: React.FC<{ className?: string }> = ({ className = 'w-5 h-5 sm:w-6 sm:h-6' }) => (
  <svg
    viewBox="0 0 10 10"
    className={className}
    style={{ shapeRendering: 'crispEdges' }}
  >
    {/* Dark brown pixel outline */}
    <rect x="3" y="0" width="4" height="1" fill="#3b1302" />
    <rect x="1" y="1" width="2" height="1" fill="#3b1302" />
    <rect x="7" y="1" width="2" height="1" fill="#3b1302" />
    <rect x="0" y="2" width="1" height="1" fill="#3b1302" />
    <rect x="9" y="2" width="1" height="1" fill="#3b1302" />
    <rect x="0" y="3" width="1" height="4" fill="#3b1302" />
    <rect x="9" y="3" width="1" height="4" fill="#3b1302" />
    <rect x="0" y="7" width="1" height="1" fill="#3b1302" />
    <rect x="9" y="7" width="1" height="1" fill="#3b1302" />
    <rect x="1" y="8" width="2" height="1" fill="#3b1302" />
    <rect x="7" y="8" width="2" height="1" fill="#3b1302" />
    <rect x="3" y="9" width="4" height="1" fill="#3b1302" />

    {/* Bright Golden Yellow Coin Base */}
    <rect x="3" y="1" width="4" height="1" fill="#facc15" />
    <rect x="1" y="2" width="8" height="6" fill="#facc15" />
    <rect x="3" y="8" width="4" height="1" fill="#d97706" />

    {/* Top-left Golden & White Shine */}
    <rect x="3" y="1" width="3" height="1" fill="#fef08a" />
    <rect x="1" y="2" width="2" height="1" fill="#fef08a" />
    <rect x="1" y="3" width="1" height="2" fill="#fef08a" />
    <rect x="2" y="2" width="1" height="1" fill="#ffffff" />

    {/* Bottom-right Shadow Rim */}
    <rect x="8" y="4" width="1" height="3" fill="#b45309" />
    <rect x="7" y="7" width="2" height="1" fill="#b45309" />
    <rect x="3" y="8" width="4" height="1" fill="#b45309" />

    {/* Chicken Feed Pellet in Center */}
    <rect x="3" y="3" width="4" height="4" fill="#451a03" />
    <rect x="3.5" y="3.5" width="3" height="3" fill="#78350f" />
    <rect x="4" y="4" width="2" height="2" fill="#b45309" />
    <rect x="4" y="4" width="1" height="1" fill="#fde68a" />
  </svg>
);

// Retro 8-bit Pixelated Shield Component
const PixelHUDShield: React.FC<{ type: ArmorType; className?: string }> = ({ type, className = 'w-4 h-4' }) => {
  const isNetherite = type === 'netherite';
  const isCoral = type === 'coral';
  const isDiamond = type === 'diamond';
  const isGold = type === 'gold';
  const isIron = type === 'iron';
  const fillColor = isNetherite
    ? '#292524'
    : isCoral
    ? '#fb7185'
    : isDiamond
    ? '#38bdf8'
    : isGold
    ? '#facc15'
    : isIron
    ? '#cbd5e1'
    : '#64748b';
  const trimColor = isNetherite
    ? '#c084fc'
    : isCoral
    ? '#2dd4bf'
    : isDiamond
    ? '#e0f2fe'
    : isGold
    ? '#fef08a'
    : isIron
    ? '#f1f5f9'
    : '#94a3b8';
  const shadowColor = isNetherite
    ? '#0c0a09'
    : isCoral
    ? '#be123c'
    : isDiamond
    ? '#0369a1'
    : isGold
    ? '#854d0e'
    : isIron
    ? '#334155'
    : '#334155';

  return (
    <svg viewBox="0 0 10 10" className={className} style={{ shapeRendering: 'crispEdges' }}>
      <rect x="1" y="0" width="8" height="1" fill="#000000" />
      <rect x="0" y="1" width="1" height="5" fill="#000000" />
      <rect x="9" y="1" width="1" height="5" fill="#000000" />
      <rect x="1" y="6" width="1" height="2" fill="#000000" />
      <rect x="8" y="6" width="1" height="2" fill="#000000" />
      <rect x="2" y="7" width="2" height="1" fill="#000000" />
      <rect x="6" y="7" width="2" height="1" fill="#000000" />
      <rect x="3" y="8" width="4" height="1" fill="#000000" />
      <rect x="4" y="9" width="2" height="1" fill="#000000" />
      {/* Fill */}
      <rect x="1" y="1" width="4" height="5" fill={fillColor} />
      <rect x="5" y="1" width="4" height="5" fill={shadowColor} />
      <rect x="2" y="6" width="3" height="1" fill={fillColor} />
      <rect x="5" y="6" width="3" height="1" fill={shadowColor} />
      <rect x="3" y="7" width="2" height="1" fill={fillColor} />
      <rect x="5" y="7" width="2" height="1" fill={shadowColor} />
      <rect x="4" y="8" width="1" height="1" fill={fillColor} />
      <rect x="5" y="8" width="1" height="1" fill={shadowColor} />
      {/* Top glint */}
      <rect x="2" y="1" width="3" height="1" fill={trimColor} />
      <rect x="2" y="2" width="1" height="2" fill={trimColor} />
    </svg>
  );
};

// Retro 8-bit Pixelated Sword Component
const PixelHUDSword: React.FC<{ type: SwordType; className?: string }> = ({ type, className = 'w-4 h-4' }) => {
  const isNetherite = type === 'netherite';
  const isCoral = type === 'coral';
  const isDiamond = type === 'diamond';
  const isGold = type === 'gold';
  const isIron = type === 'iron';
  const bladeColor = isNetherite ? '#18181b' : (isCoral ? '#f43f5e' : (isDiamond ? '#38bdf8' : (isGold ? '#facc15' : (isIron ? '#cbd5e1' : '#64748b'))));
  const shineColor = isNetherite ? '#c084fc' : (isCoral ? '#5eead4' : (isDiamond ? '#ffffff' : (isGold ? '#fef9c3' : (isIron ? '#ffffff' : '#94a3b8'))));
  const hiltColor = isNetherite ? '#7e22ce' : (isCoral ? '#0d9488' : (isDiamond ? '#0369a1' : (isGold ? '#eab308' : (isIron ? '#475569' : '#334155'))));

  return (
    <svg viewBox="0 0 10 10" className={className} style={{ shapeRendering: 'crispEdges' }}>
      {/* Pommel */}
      <rect x="0" y="8" width="2" height="2" fill="#000000" />
      <rect x="0.5" y="8.5" width="1" height="1" fill={hiltColor} />
      {/* Hilt */}
      <rect x="1.5" y="6.5" width="2" height="2" fill={isCoral ? '#134e4a' : '#78350f'} />
      {/* Crossguard */}
      <rect x="1" y="5" width="5" height="1" fill="#000000" />
      <rect x="1" y="5.5" width="4" height="1" fill={hiltColor} />
      {/* Blade */}
      <rect x="3" y="3" width="2" height="2" fill={bladeColor} />
      <rect x="5" y="1" width="2" height="2" fill={bladeColor} />
      <rect x="7" y="0" width="2" height="1" fill="#000000" />
      <rect x="8" y="0" width="1" height="2" fill="#000000" />
      <rect x="7" y="1" width="1" height="1" fill={shineColor} />
      <rect x="5" y="2" width="1" height="1" fill={shineColor} />
    </svg>
  );
};

// Retro 8-bit Pixelated Woodcutter Axe Component
const PixelHUDAxe: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 10 10" className={className} style={{ shapeRendering: 'crispEdges' }}>
    {/* Wooden Handle */}
    <rect x="1" y="7" width="2" height="2" fill="#451a03" />
    <rect x="2" y="6" width="2" height="2" fill="#92400e" />
    <rect x="3" y="5" width="2" height="2" fill="#92400e" />
    <rect x="4" y="4" width="2" height="2" fill="#b45309" />
    <rect x="5" y="3" width="2" height="2" fill="#92400e" />
    {/* Steel Axe Blade */}
    <rect x="4" y="0" width="4" height="1" fill="#000000" />
    <rect x="3" y="1" width="6" height="4" fill="#334155" />
    <rect x="4" y="1" width="4" height="3" fill="#cbd5e1" />
    <rect x="7" y="1" width="2" height="3" fill="#f8fafc" />
    <rect x="6" y="4" width="3" height="2" fill="#94a3b8" />
    <rect x="8" y="4" width="1" height="2" fill="#f8fafc" />
  </svg>
);

// Retro 8-bit Pixelated Archaeology Brush Component
const PixelHUDBrush: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 10 10" className={className} style={{ shapeRendering: 'crispEdges' }}>
    {/* Cedar Handle */}
    <rect x="1" y="7" width="2" height="2" fill="#451a03" />
    <rect x="2" y="6" width="2" height="2" fill="#b45309" />
    <rect x="3" y="5" width="2" height="2" fill="#d97706" />
    {/* Brass Ferrule */}
    <rect x="4" y="3" width="3" height="3" fill="#a16207" />
    <rect x="5" y="4" width="1" height="1" fill="#fef08a" />
    {/* Bristle Fan */}
    <rect x="5" y="1" width="4" height="3" fill="#fde68a" />
    <rect x="6" y="0" width="3" height="2" fill="#f59e0b" />
    <rect x="7" y="1" width="2" height="2" fill="#fef3c7" />
    <rect x="8" y="2" width="1" height="2" fill="#b45309" />
  </svg>
);

export const GameHUD: React.FC<GameHUDProps> = ({
  health,
  maxHealth,
  coins,
  stage,
  armor,
  sword,
  fireResistTimer = 0,
  poisonTimer = 0,
  poisonMaxDuration = 0,
  soundEnabled,
  musicEnabled,
  showTouchControls,
  isFullscreen = false,
  onToggleSound,
  onToggleMusic,
  onToggleTouchControls,
  onToggleFullscreen,
  onPause,
  onReturnToMenu,
  onLogOut,
  unlockedEmotes = ['squawk'],
  activeEmote = null,
  shopPurchases = 0,
  emoteTrayOpen = false,
  onToggleEmoteTray,
  onTriggerEmote,
  hideUI = false,
  onToggleHideUI,
  unlockedArmors = [],
  unlockedSwords = [],
  hasAxe = false,
  hasBrush = false,
  selectedItem = 'sword',
  onEquipArmor,
  onEquipSword,
  onSelectInventoryItem,
  bossRushRound = null,
  bossRushBonusCoins = 0,
  bossRushElapsedMs = 0,
}) => {
  const [openSlotMenu, setOpenSlotMenu] = React.useState<'none' | 'armor' | 'sword'>('none');

  React.useEffect(() => {
    if (hideUI) {
      setOpenSlotMenu('none');
    }
  }, [hideUI]);

  const isFireResistActive = fireResistTimer > 0;
  const isPoisoned = poisonTimer > 0;
  const poisonBaseDuration = Math.max(poisonMaxDuration, poisonTimer, 0.1);
  const poisonPercent = isPoisoned ? Math.max(0, Math.min(100, (poisonTimer / poisonBaseDuration) * 100)) : 0;

  const effectiveUnlockedArmors: ArmorType[] = React.useMemo(() => {
    const list = new Set<ArmorType>(unlockedArmors);
    if (armor && armor !== 'none') list.add(armor);
    return Array.from(list);
  }, [unlockedArmors, armor]);

  const effectiveUnlockedSwords: SwordType[] = React.useMemo(() => {
    const list = new Set<SwordType>(unlockedSwords);
    if (sword && sword !== 'none') list.add(sword);
    return Array.from(list);
  }, [unlockedSwords, sword]);

  const armorChoices: { id: ArmorType; label: string; shortLabel: string; accent: string }[] = [
    { id: 'none', label: 'No Armor', shortLabel: 'NONE', accent: 'text-slate-300 border-slate-600 bg-slate-900' },
    { id: 'iron', label: 'Iron Armor', shortLabel: 'IRON', accent: 'text-slate-100 border-slate-400 bg-slate-800' },
    { id: 'gold', label: 'Gold Armor', shortLabel: 'GOLD', accent: 'text-yellow-300 border-yellow-400 bg-yellow-950' },
    { id: 'diamond', label: 'Diamond Armor', shortLabel: 'DIAM', accent: 'text-cyan-200 border-cyan-400 bg-cyan-950' },
    { id: 'coral', label: 'Coral Armor', shortLabel: 'CORAL', accent: 'text-teal-200 border-rose-400 bg-rose-950' },
    { id: 'netherite', label: 'Netherite Armor', shortLabel: 'NETH', accent: 'text-purple-200 border-purple-400 bg-stone-950' },
  ];

  const swordChoices: { id: SwordType; label: string; shortLabel: string; accent: string }[] = [
    { id: 'none', label: 'No Sword', shortLabel: 'NONE', accent: 'text-slate-300 border-slate-600 bg-slate-900' },
    { id: 'iron', label: 'Iron Sword', shortLabel: 'IRON', accent: 'text-slate-100 border-slate-400 bg-slate-800' },
    { id: 'gold', label: 'Gold Sword', shortLabel: 'GOLD', accent: 'text-yellow-300 border-yellow-400 bg-yellow-950' },
    { id: 'diamond', label: 'Diamond Sword', shortLabel: 'DIAM', accent: 'text-cyan-200 border-cyan-400 bg-cyan-950' },
    { id: 'coral', label: 'Coral Sword', shortLabel: 'CORAL', accent: 'text-teal-200 border-rose-400 bg-rose-950' },
    { id: 'netherite', label: 'Netherite Sword', shortLabel: 'NETH', accent: 'text-purple-200 border-purple-400 bg-purple-950' },
  ];

  return (
    <>
      {/* Full-Screen Pulsating Toxic-Green Border & Vignette Overlay while Poisoned */}
      {isPoisoned && (
        <div
          className="fixed inset-0 pointer-events-none select-none z-10 overflow-hidden"
          aria-hidden="true"
        >
          {/* Soft pulsating green edge vignette */}
          <div className="absolute inset-0 poison-screen-vignette" />
          {/* Crisp 8-bit pulsating toxic-emerald border frame */}
          <div className="absolute inset-0 poison-screen-border" />
          {/* 8-bit pixel corner accents */}
          <div className="absolute top-0 left-0 w-7 h-7 sm:w-9 sm:h-9 border-t-[5px] border-l-[5px] border-lime-300/90 poison-screen-vignette" />
          <div className="absolute top-0 right-0 w-7 h-7 sm:w-9 sm:h-9 border-t-[5px] border-r-[5px] border-lime-300/90 poison-screen-vignette" />
          <div className="absolute bottom-0 left-0 w-7 h-7 sm:w-9 sm:h-9 border-b-[5px] border-l-[5px] border-lime-300/90 poison-screen-vignette" />
          <div className="absolute bottom-0 right-0 w-7 h-7 sm:w-9 sm:h-9 border-b-[5px] border-r-[5px] border-lime-300/90 poison-screen-vignette" />
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 pt-5 sm:pt-7 md:pt-8 px-3.5 sm:px-6 md:px-8 flex flex-col gap-2 pointer-events-none select-none z-20">
      {/* Top Primary Row: Hearts & Buff on Left, Coin & Action Buttons on Right */}
      <div className="w-full flex items-center justify-between">
        {/* Hearts & Status Buff Container */}
        <div className="pointer-events-auto flex items-center flex-wrap gap-2">
          {/* Hearts Container - Chunky 8-Bit Pixel Frame */}
          <div className={`flex items-center gap-1.5 sm:gap-2 bg-slate-900 border-[3px] ${isPoisoned ? 'border-emerald-400 shadow-[3px_3px_0_#052e16]' : 'border-black shadow-[3px_3px_0_#000000]'} px-2.5 sm:px-3 py-1.5`}>
            {Array.from({ length: maxHealth }).map((_, i) => {
              const fillState: 'full' | 'half' | 'empty' =
                health >= i + 1 ? 'full' : (health >= i + 0.5 ? 'half' : 'empty');
              return (
                <PixelHeart
                  key={i}
                  fillState={fillState}
                  poisoned={isPoisoned}
                  className="w-4.5 h-4.5 sm:w-5 sm:h-5 md:w-6 md:h-6"
                />
              );
            })}
          </div>

          {/* Boss Rush Round, Live Timer & Bonus Coins HUD Indicator (respects Hide UI toggle) */}
          {bossRushRound !== null && !hideUI && (() => {
            const safeMs = Math.max(0, Math.round(bossRushElapsedMs));
            const totalSecs = Math.floor(safeMs / 1000);
            const mins = Math.floor(totalSecs / 60);
            const secs = totalSecs % 60;
            const tenths = Math.floor((safeMs % 1000) / 100);
            const timerLabel = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${tenths}`;
            return (
              <div
                className="flex items-center gap-2 bg-gradient-to-r from-rose-950 via-slate-950 to-amber-950 border-[2.5px] border-amber-400 px-2.5 py-1 shadow-[2px_2px_0_#000000] whitespace-nowrap"
                title={bossRushRound === 1 ? 'Boss Rush Round 1/2: Old Farmer Jed (+150 Bonus Coins)' : 'Boss Rush Round 2/2: Ancient Cockatrice (+500 Bonus Coins)'}
              >
                <PixelFlameIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="font-pixel-arcade text-[8px] sm:text-[9px] text-rose-300 font-bold tracking-tight">
                  BOSS RUSH R{bossRushRound}/2
                </span>
                <span className="text-slate-600 text-[8px]" aria-hidden="true">·</span>
                <span className="font-pixel-arcade text-[8px] sm:text-[9px] text-emerald-300 font-bold tabular-nums">
                  {timerLabel}
                </span>
                <span className="text-slate-600 text-[8px]" aria-hidden="true">·</span>
                <span className="font-pixel-arcade text-[8px] sm:text-[9px] text-yellow-300 font-bold tabular-nums">
                  +{bossRushBonusCoins}
                </span>
              </div>
            );
          })()}

          {/* Active Snake Venom Poison Status & Countdown Timer */}
          {isPoisoned && (
            <div
              role="status"
              aria-live="polite"
              className="flex flex-col gap-1 bg-gradient-to-r from-emerald-950 via-green-950 to-lime-950 border-[3px] border-emerald-400 px-2.5 sm:px-3 py-1 shadow-[3px_3px_0_#000000] whitespace-nowrap"
              title="Poisoned by Jungle Viper venom: slowly draining half of your health!"
            >
              <div className="flex items-center gap-1.5">
                <PixelPoisonIcon className="w-4 h-4 shrink-0" />
                <span className="font-pixel-arcade text-[8px] sm:text-[9px] text-emerald-300 font-bold tracking-tight drop-shadow-[0_1px_0_#052e16]">
                  POISONED
                </span>
                <span className="font-pixel-arcade text-[9.5px] sm:text-[10.5px] text-lime-200 font-bold tabular-nums drop-shadow-[0_1px_0_#052e16]">
                  {poisonTimer.toFixed(1)}s
                </span>
              </div>
              {/* 8-bit depleting poison countdown bar */}
              <div className="w-full h-1.5 bg-slate-950 border border-emerald-900 overflow-hidden">
                <div
                  className="w-full h-full origin-left bg-gradient-to-r from-emerald-500 via-green-400 to-lime-300 transition-transform duration-100 ease-linear"
                  style={{ transform: `scaleX(${poisonPercent / 100})` }}
                />
              </div>
            </div>
          )}

          {/* Small Flame Icon Buff for Fire-Resist on Player's Shield */}
          {isFireResistActive && (
            <div 
              className="flex items-center gap-1.5 bg-gradient-to-r from-orange-950 to-red-950 border-[3px] border-black px-2 sm:px-2.5 py-1 shadow-[3px_3px_0_#000000] animate-pulse"
              title="Shield Fire-Resist Active: Protects against fire & lava!"
            >
              <PixelFlameIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 animate-bounce" />
              <div className="flex items-center gap-1">
                <span className="font-pixel-arcade text-[8px] sm:text-[9px] text-orange-400 font-bold tracking-tight drop-shadow-[0_1px_0_#431407]">
                  FIRE-RESIST
                </span>
                <span className="font-pixel-arcade text-[9px] sm:text-[10px] text-yellow-300 font-bold tabular-nums drop-shadow-[0_1px_0_#431407]">
                  {Math.ceil(fireResistTimer)}s
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Top Right: Hide/Show UI Toggle + Pixelated Coins Counter & Controls */}
        <div className="flex items-center flex-wrap justify-end gap-1.5 sm:gap-2 pointer-events-auto">
          {hideUI ? (
            /* Clean Mobile Mode: ONLY a single compact SHOW button in top-right (Hearts & player controls stay visible!) */
            onToggleHideUI && (
              <button
                type="button"
                onClick={onToggleHideUI}
                onPointerDown={e => e.stopPropagation()}
                className="h-8 sm:h-9 px-2.5 bg-slate-900/80 hover:bg-slate-800 border-[2.5px] border-black text-yellow-300 shadow-[2px_2px_0_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-transform cursor-pointer flex items-center justify-center gap-1.5 shrink-0 touch-manipulation"
                aria-label="Show HUD Buttons"
                title="Show HUD Buttons"
              >
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-300" />
                <span className="font-pixel text-[7.5px] sm:text-[8px]">SHOW</span>
              </button>
            )
          ) : (
            <>
              {/* Mobile/Screen Hide Extra UI Button (keeps Hearts + player control buttons only!) */}
              {onToggleHideUI && (
                <button
                  type="button"
                  onClick={onToggleHideUI}
                  onPointerDown={e => e.stopPropagation()}
                  className="h-8 sm:h-9 px-2 sm:px-2.5 bg-slate-900 border-[2.5px] border-black hover:bg-slate-800 text-amber-300 shadow-[2px_2px_0_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-transform cursor-pointer flex items-center justify-center gap-1 shrink-0 touch-manipulation"
                  aria-label="Hide Extra Buttons"
                  title="Hide extra buttons (keeps Hearts & player controls)"
                >
                  <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
                  <span className="font-pixel text-[7.5px] sm:text-[8px]">HIDE</span>
                </button>
              )}

              {/* Pixel Coins Counter */}
              <div className="flex items-center gap-1.5 bg-slate-900 border-[3px] border-black px-2.5 sm:px-3 py-1.5 shadow-[3px_3px_0_#000000]">
                <PixelCoin className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                <span className="font-pixel-arcade text-yellow-400 text-xs sm:text-sm font-bold tabular-nums drop-shadow-[0_2px_0_#3b1302]">
                  {coins}
                </span>
              </div>

              {/* Audio & Control Buttons - Chunky 8-Bit Pixel Buttons */}
              <button
                onClick={onToggleSound}
                className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-900 border-[2.5px] border-black hover:bg-slate-800 text-yellow-400 shadow-[2px_2px_0_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-transform cursor-pointer flex items-center justify-center shrink-0"
                aria-label="Toggle Sound Effects"
              >
                {soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
                )}
              </button>

              <button
                onClick={onToggleMusic}
                className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-900 border-[2.5px] border-black hover:bg-slate-800 text-yellow-400 shadow-[2px_2px_0_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-transform cursor-pointer flex items-center justify-center shrink-0"
                aria-label="Toggle Background Music"
              >
                <Music className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${musicEnabled ? 'text-yellow-400' : 'text-slate-500'}`} />
              </button>

              <button
                onClick={onToggleTouchControls}
                className={`w-8 h-8 sm:w-9 sm:h-9 border-[2.5px] border-black shadow-[2px_2px_0_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-transform cursor-pointer flex items-center justify-center shrink-0 ${
                  showTouchControls
                    ? 'bg-yellow-950 text-yellow-300'
                    : 'bg-slate-900 text-yellow-400 hover:bg-slate-800'
                }`}
                aria-label="Toggle On-Screen Touch Controls"
                title="Toggle On-Screen Controls"
              >
                <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
              </button>

              {onToggleFullscreen && (
                <button
                  onClick={onToggleFullscreen}
                  className={`h-8 sm:h-9 px-2 sm:px-2.5 border-[2.5px] border-black shadow-[2px_2px_0_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-transform cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
                    isFullscreen
                      ? 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900'
                      : 'bg-slate-900 text-yellow-400 hover:bg-slate-800'
                  }`}
                  aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                  )}
                  <span className="font-pixel text-[7.5px] sm:text-[8px]">
                    {isFullscreen ? 'EXIT' : 'FULL'}
                  </span>
                </button>
              )}

              <button
                onClick={onPause}
                className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-900 border-[2.5px] border-black hover:bg-slate-800 text-yellow-400 shadow-[2px_2px_0_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-transform cursor-pointer flex items-center justify-center shrink-0"
                aria-label="Pause Game"
                title="Pause Game"
              >
                <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
              </button>

              <button
                onClick={onReturnToMenu}
                className="h-8 sm:h-9 px-2 sm:px-2.5 bg-slate-900 border-[2.5px] border-black hover:bg-slate-800 text-yellow-400 shadow-[2px_2px_0_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-transform cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                aria-label="Back to Menu"
                title="Back to Menu"
              >
                <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                <span className="hidden md:inline font-pixel text-[8px] text-yellow-300">MENU</span>
              </button>

              {onLogOut && (
                <button
                  onClick={onLogOut}
                  className="h-8 sm:h-9 px-2 sm:px-2.5 bg-red-950 border-[2.5px] border-black hover:bg-red-900 text-red-200 shadow-[2px_2px_0_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-transform cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                  aria-label="Log Out"
                  title="Log Out"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-300" />
                  <span className="hidden sm:inline font-pixel text-[8px] text-red-200">LOG OUT</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Row 2: Stage/Gear Stack on Left, Interactive Pixel Emote Quickbar on Right (hidden in Clean Mobile Mode) */}
      {!hideUI && (
      <div className="w-full flex items-start justify-between gap-2 pointer-events-none mt-2.5 sm:mt-3.5 md:mt-4.5">
        <div className="flex flex-col items-start gap-2 sm:gap-2.5 pointer-events-auto">
          {/* Stage Button with Chunky Pixelated Border & 3D Shadow */}
          <div className="bg-slate-900 border-[3px] border-black px-3 sm:px-3.5 py-1.5 shadow-[3px_3px_0_#000000] flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 animate-pulse shrink-0" />
            <div className="shrink-0">
              {stage === 'baby' ? (
                <PixelChick className="w-4 h-4" />
              ) : stage === 'juvenile' ? (
                <PixelJuvenile className="w-4 h-4" />
              ) : stage === 'teen' ? (
                <PixelRooster className="w-4 h-4" />
              ) : (
                <PixelCrown className="w-4 h-4" />
              )}
            </div>
            <span className="font-pixel-arcade text-[8px] sm:text-[9.5px] text-yellow-400 font-bold tracking-wider drop-shadow-[0_1px_0_#3b1302]">
              Stage: {stage === 'adult' ? 'adult chicken' : (stage === 'baby' ? 'baby chick' : (stage === 'juvenile' ? 'juvenile chicken' : 'teen chicken'))}
            </span>
          </div>

          {/* DIRECTLY UNDER THE STAGE BUTTON: Armor and Sword Buttons Stacked Vertically with 8-Bit Style */}
          <div className="flex flex-col items-start gap-1.5 sm:gap-2">
            {/* Button that shows our armor / shield status */}
            <div className={`border-[3px] border-black px-3 sm:px-3.5 py-1.5 shadow-[3px_3px_0_#000000] flex items-center gap-1.5 text-[8px] sm:text-[9.5px] font-pixel-arcade transition-all ${
              isFireResistActive
                ? 'bg-gradient-to-r from-orange-950 to-amber-950 text-orange-200 border-amber-600 ring-1 ring-orange-500'
                : armor === 'netherite'
                ? 'bg-stone-950 text-purple-300 ring-1 ring-purple-500/60 drop-shadow-[0_1px_0_#1c1917]'
                : armor === 'coral'
                ? 'bg-rose-950 text-teal-200 ring-1 ring-rose-400/70 drop-shadow-[0_1px_0_#4c0519]'
                : armor === 'diamond'
                ? 'bg-cyan-950 text-cyan-300 drop-shadow-[0_1px_0_#083344]'
                : armor === 'gold'
                ? 'bg-yellow-950 text-yellow-400 drop-shadow-[0_1px_0_#3b1302]'
                : armor === 'iron'
                ? 'bg-slate-800 text-slate-200 drop-shadow-[0_1px_0_#1e293b]'
                : 'bg-slate-900 text-slate-400'
            }`}>
              <PixelHUDShield type={armor} className="w-3.5 h-3.5" />
              <span>
                Armor: {armor === 'netherite' ? 'netherite armor' : armor === 'coral' ? 'coral armor' : armor === 'diamond' ? 'diamond armor' : armor === 'gold' ? 'gold armor' : armor === 'iron' ? 'iron armor' : 'none'}
              </span>
              {isFireResistActive && (
                <span className="flex items-center gap-0.5 ml-1 text-orange-400">
                  <PixelFlameIcon className="w-3 h-3" />
                  <span className="text-[7.5px] text-yellow-300 font-bold">FIRE-RESIST</span>
                </span>
              )}
            </div>

            {/* Button that shows our sword */}
            <div className={`border-[3px] border-black px-3 sm:px-3.5 py-1.5 shadow-[3px_3px_0_#000000] flex items-center gap-1.5 text-[8px] sm:text-[9.5px] font-pixel-arcade transition-all ${
              sword === 'netherite'
                ? 'bg-purple-950 text-purple-300 drop-shadow-[0_1px_0_#3b0764] ring-1 ring-purple-500/50'
                : sword === 'coral'
                ? 'bg-rose-950 text-teal-200 drop-shadow-[0_1px_0_#4c0519] ring-1 ring-rose-400/70'
                : (sword === 'diamond'
                  ? 'bg-cyan-950 text-cyan-300 drop-shadow-[0_1px_0_#083344]'
                  : (sword === 'gold'
                    ? 'bg-yellow-950 text-yellow-400 drop-shadow-[0_1px_0_#3b1302]'
                    : (sword === 'iron'
                      ? 'bg-slate-800 text-slate-200 drop-shadow-[0_1px_0_#1e293b]'
                      : 'bg-slate-900 text-slate-400')))
            }`}>
              <PixelHUDSword type={sword} className="w-3.5 h-3.5" />
              <span>
                Sword: {sword === 'netherite' ? 'netherite sword' : sword === 'coral' ? 'coral sword' : (sword === 'diamond' ? 'diamond sword' : (sword === 'gold' ? 'gold sword' : (sword === 'iron' ? 'iron sword' : 'none')))}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Pixel Emote Trigger & Quickbar */}
        {onTriggerEmote && (
          <div
            onClick={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
            className="flex flex-col items-end gap-1.5 pointer-events-auto"
          >
            <button
              type="button"
              onClick={onToggleEmoteTray}
              className={`h-8 sm:h-9 px-2.5 sm:px-3 border-[2.5px] border-black shadow-[2px_2px_0_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer flex items-center gap-1.5 ${
                emoteTrayOpen || activeEmote
                  ? 'bg-amber-950 text-yellow-300 ring-1 ring-yellow-400/70'
                  : 'bg-slate-900 hover:bg-slate-800 text-yellow-400'
              }`}
              aria-label="Toggle Emotes Bar"
              title="Toggle Emotes (Hotkey: T | Quick Emotes: Keys 1-6)"
            >
              {activeEmote ? (
                <PixelEmoteIcon emoteId={activeEmote} className="w-4 h-4 shrink-0 animate-bounce" />
              ) : (
                <Smile className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 shrink-0" />
              )}
              <span className="font-pixel-arcade text-[8px] sm:text-[9px] font-bold tracking-tight">
                EMOTES ({unlockedEmotes.length}/{EMOTES.length})
              </span>
              <span className="hidden sm:inline font-pixel-arcade text-[7.5px] text-amber-300/80">
                [T]
              </span>
            </button>

            {emoteTrayOpen && (
              <div className="bg-slate-950/95 border-[3px] border-black p-1.5 shadow-[4px_4px_0_#000000] grid grid-cols-3 gap-1.5 max-w-[235px] sm:max-w-[265px]">
                {EMOTES.map(emote => {
                  const unlocked = unlockedEmotes.includes(emote.id);
                  const isActive = activeEmote === emote.id;
                  const remainingBuys = Math.max(0, emote.requiredPurchases - shopPurchases);

                  return (
                    <button
                      key={emote.id}
                      type="button"
                      onClick={() => onTriggerEmote(emote.id)}
                      className={`relative px-1.5 py-1.5 border-2 flex flex-col items-center justify-center gap-0.5 transition-all select-none ${
                        unlocked
                          ? isActive
                            ? 'bg-amber-500/25 border-yellow-300 text-yellow-200 shadow-[0_0_10px_rgba(250,204,21,0.45)] cursor-pointer'
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-yellow-400 text-yellow-300 cursor-pointer active:translate-y-[1px]'
                          : 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-75 cursor-not-allowed'
                      }`}
                      title={
                        unlocked
                          ? `${emote.name} (Key ${emote.hotkey}) — ${emote.description}`
                          : `Locked: Make ${remainingBuys} more shop purchase${remainingBuys === 1 ? '' : 's'} (${shopPurchases}/${emote.requiredPurchases}) to unlock ${emote.name}`
                      }
                    >
                      <span className="absolute top-0.5 left-1 font-pixel-arcade text-[6.5px] text-slate-400">
                        {emote.hotkey}
                      </span>
                      {unlocked ? (
                        <PixelEmoteIcon emoteId={emote.id} className="w-5 h-5 mt-1" />
                      ) : (
                        <div className="w-5 h-5 mt-1 flex items-center justify-center">
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                      )}
                      <span className="font-pixel-arcade text-[7px] font-bold tracking-tight truncate max-w-full">
                        {unlocked ? emote.shortLabel : `${emote.requiredPurchases} BUY${emote.requiredPurchases === 1 ? '' : 'S'}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      )}
      </div>

      {/* Bottom-Center Gameplay Inventory Hotbar (Sword, Axe, Brush) + Armor Selection Slot (hidden with Hide UI button!) */}
      {!hideUI && (
        <div
          onClick={e => e.stopPropagation()}
          onPointerDown={e => e.stopPropagation()}
          className="fixed bottom-2.5 sm:bottom-3.5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto select-none flex flex-col items-center gap-1.5"
        >
          {/* Upward Sword Picker Popup */}
          {openSlotMenu === 'sword' && onEquipSword && (
            <div className="bg-slate-950/95 border-[3px] border-black p-1.5 shadow-[4px_4px_0_#000000] flex items-center gap-1 flex-wrap justify-center max-w-[290px] sm:max-w-[360px]">
              {swordChoices.map(choice => {
                const isUnlocked = choice.id === 'none' || effectiveUnlockedSwords.includes(choice.id);
                const isEquipped = sword === choice.id;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => {
                      if (!isUnlocked) return;
                      onEquipSword(choice.id);
                      onSelectInventoryItem?.('sword');
                      setOpenSlotMenu('none');
                    }}
                    className={`px-1.5 py-1 border-2 flex flex-col items-center justify-center gap-0.5 min-w-[44px] transition-all ${
                      isUnlocked
                        ? isEquipped
                          ? `${choice.accent} ring-2 ring-yellow-300 cursor-pointer`
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-yellow-400 text-slate-200 cursor-pointer'
                        : 'bg-slate-900/50 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
                    }`}
                    title={isUnlocked ? `Equip ${choice.label}` : `${choice.label} (Find in chests/shop to unlock)`}
                  >
                    {isUnlocked ? (
                      <PixelHUDSword type={choice.id} className="w-4 h-4" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-600" />
                    )}
                    <span className="font-pixel-arcade text-[6.5px] font-bold tracking-tight">
                      {choice.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Upward Armor Selection Popup */}
          {openSlotMenu === 'armor' && onEquipArmor && (
            <div className="bg-slate-950/95 border-[3px] border-black p-1.5 shadow-[4px_4px_0_#000000] flex items-center gap-1 flex-wrap justify-center max-w-[290px] sm:max-w-[360px]">
              {armorChoices.map(choice => {
                const isUnlocked = choice.id === 'none' || effectiveUnlockedArmors.includes(choice.id);
                const isEquipped = armor === choice.id;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => {
                      if (!isUnlocked) return;
                      onEquipArmor(choice.id);
                      setOpenSlotMenu('none');
                    }}
                    className={`px-1.5 py-1 border-2 flex flex-col items-center justify-center gap-0.5 min-w-[44px] transition-all ${
                      isUnlocked
                        ? isEquipped
                          ? `${choice.accent} ring-2 ring-yellow-300 cursor-pointer`
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-yellow-400 text-slate-200 cursor-pointer'
                        : 'bg-slate-900/50 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
                    }`}
                    title={isUnlocked ? `Equip ${choice.label}` : `${choice.label} (Find in chests or dig spots to unlock)`}
                  >
                    {isUnlocked ? (
                      <PixelHUDShield type={choice.id} className="w-4 h-4" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-600" />
                    )}
                    <span className="font-pixel-arcade text-[6.5px] font-bold tracking-tight">
                      {choice.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Main Compact Inventory Hotbar + Armor Slot */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-950/92 border-[3px] border-black px-1.5 sm:px-2 py-1 shadow-[3px_3px_0_#000000]">
            {/* Slot 1: Sword Slot */}
            <button
              type="button"
              onClick={() => {
                onSelectInventoryItem?.('sword');
                if (effectiveUnlockedSwords.length > 0 && onEquipSword) {
                  setOpenSlotMenu(prev => (prev === 'sword' ? 'none' : 'sword'));
                } else {
                  setOpenSlotMenu('none');
                }
              }}
              className={`relative w-10 h-10 sm:w-11 sm:h-11 border-2 flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer touch-manipulation ${
                selectedItem === 'sword'
                  ? 'bg-amber-950/90 border-yellow-400 text-yellow-200 shadow-[inset_0_0_8px_rgba(250,204,21,0.3)]'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
              }`}
              aria-label="Sword Inventory Slot"
              title={effectiveUnlockedSwords.length > 0 ? 'Sword Slot (Click to hold or swap swords)' : 'Sword Slot (No sword yet)'}
            >
              <PixelHUDSword type={sword} className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${sword === 'none' ? 'opacity-45' : ''}`} />
              <span className="font-pixel-arcade text-[6px] sm:text-[6.5px] font-bold leading-none tracking-tight">
                {sword === 'none' ? 'SWORD' : sword.slice(0, 4).toUpperCase()}
              </span>
            </button>

            {/* Slot 2: Axe Slot */}
            <button
              type="button"
              onClick={() => {
                setOpenSlotMenu('none');
                if (hasAxe) {
                  onSelectInventoryItem?.('axe');
                }
              }}
              className={`relative w-10 h-10 sm:w-11 sm:h-11 border-2 flex flex-col items-center justify-center gap-0.5 transition-all touch-manipulation ${
                hasAxe
                  ? selectedItem === 'axe'
                    ? 'bg-amber-950/90 border-yellow-400 text-yellow-200 shadow-[inset_0_0_8px_rgba(250,204,21,0.3)] cursor-pointer'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-amber-200 cursor-pointer'
                  : 'bg-slate-900/55 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
              }`}
              aria-label="Axe Inventory Slot"
              title={hasAxe ? 'Woodcutter Axe (Click to hold)' : 'Axe Slot (Locked — find the axe on Peckerin Coast)'}
            >
              {hasAxe ? (
                <PixelHUDAxe className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-600" />
              )}
              <span className="font-pixel-arcade text-[6px] sm:text-[6.5px] font-bold leading-none tracking-tight">
                AXE
              </span>
            </button>

            {/* Slot 3: Brush Slot */}
            <button
              type="button"
              onClick={() => {
                setOpenSlotMenu('none');
                if (hasBrush) {
                  onSelectInventoryItem?.('brush');
                }
              }}
              className={`relative w-10 h-10 sm:w-11 sm:h-11 border-2 flex flex-col items-center justify-center gap-0.5 transition-all touch-manipulation ${
                hasBrush
                  ? selectedItem === 'brush'
                    ? 'bg-amber-950/90 border-yellow-400 text-yellow-200 shadow-[inset_0_0_8px_rgba(250,204,21,0.3)] cursor-pointer'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-amber-200 cursor-pointer'
                  : 'bg-slate-900/55 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
              }`}
              aria-label="Brush Inventory Slot"
              title={hasBrush ? 'Archaeology Brush (Click to hold)' : 'Brush Slot (Locked — get the brush in Desert Lands)'}
            >
              {hasBrush ? (
                <PixelHUDBrush className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-600" />
              )}
              <span className="font-pixel-arcade text-[6px] sm:text-[6.5px] font-bold leading-none tracking-tight">
                BRUSH
              </span>
            </button>

            {/* Pixel Divider */}
            <div className="w-[2px] h-8 bg-slate-700/80 mx-0.5" />

            {/* Armor Selection Slot */}
            <button
              type="button"
              onClick={() => setOpenSlotMenu(prev => (prev === 'armor' ? 'none' : 'armor'))}
              className={`relative h-10 sm:h-11 px-2 border-2 flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer touch-manipulation ${
                openSlotMenu === 'armor'
                  ? 'bg-indigo-950 border-yellow-300 text-yellow-200 ring-1 ring-yellow-300/60'
                  : armor === 'coral'
                  ? 'bg-rose-950/90 border-rose-400 text-teal-200 hover:bg-rose-900'
                  : armor === 'netherite'
                  ? 'bg-stone-950 border-purple-400 text-purple-200 hover:bg-stone-900'
                  : armor === 'diamond'
                  ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 hover:bg-cyan-900'
                  : armor === 'gold'
                  ? 'bg-yellow-950/90 border-yellow-400 text-yellow-200 hover:bg-yellow-900'
                  : armor === 'iron'
                  ? 'bg-slate-800 border-slate-400 text-slate-100 hover:bg-slate-700'
                  : 'bg-slate-900 border-slate-600 text-slate-300 hover:bg-slate-800'
              }`}
              aria-label="Armor Selection Slot"
              title="Armor Selection Slot (Click to swap unlocked armors)"
            >
              <PixelHUDShield type={armor} className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${armor === 'none' ? 'opacity-55' : ''}`} />
              <span className="font-pixel-arcade text-[6px] sm:text-[6.5px] font-bold leading-none tracking-tight">
                {armor === 'none' ? 'ARMOR' : armor.slice(0, 4).toUpperCase()}
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
