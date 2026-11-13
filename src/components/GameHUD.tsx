import React from 'react';
import { Volume2, VolumeX, Music, Pause, Shield, Sword, Gamepad2, Home, LogOut, Maximize2, Minimize2 } from 'lucide-react';
import { GrowthStage, ArmorType, SwordType } from '../game/types';
import { PixelChick, PixelJuvenile, PixelRooster, PixelCrown } from './PixelIcons';

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

// Retro 8-bit Pixelated Heart Component
const PixelHeart: React.FC<{ filled: boolean; className?: string }> = ({ filled, className = '' }) => (
  <svg
    viewBox="0 0 10 9"
    className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${filled ? 'scale-100' : 'scale-90 opacity-70'} ${className}`}
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

    {/* Interior Fill */}
    {filled ? (
      <>
        {/* Deep Crimson/Red Base */}
        <rect x="1" y="1" width="3" height="3" fill="#dc2626" />
        <rect x="6" y="1" width="3" height="3" fill="#dc2626" />
        <rect x="1" y="4" width="8" height="1" fill="#dc2626" />
        <rect x="2" y="5" width="6" height="1" fill="#dc2626" />
        <rect x="3" y="6" width="4" height="1" fill="#dc2626" />
        <rect x="4" y="7" width="2" height="1" fill="#dc2626" />

        {/* Vibrant Red/Scarlet Highlights */}
        <rect x="2" y="2" width="2" height="2" fill="#ef4444" />
        <rect x="7" y="2" width="2" height="2" fill="#ef4444" />
        <rect x="3" y="4" width="4" height="1" fill="#ef4444" />

        {/* White Pixel Glint */}
        <rect x="1" y="1" width="1" height="1" fill="#ffffff" />
        <rect x="2" y="1" width="1" height="1" fill="#ffffff" />
      </>
    ) : (
      <>
        {/* Empty Heart Dark Slate Fill */}
        <rect x="1" y="1" width="3" height="3" fill="#1e293b" />
        <rect x="6" y="1" width="3" height="3" fill="#1e293b" />
        <rect x="1" y="4" width="8" height="1" fill="#1e293b" />
        <rect x="2" y="5" width="6" height="1" fill="#1e293b" />
        <rect x="3" y="6" width="4" height="1" fill="#1e293b" />
        <rect x="4" y="7" width="2" height="1" fill="#1e293b" />
      </>
    )}
  </svg>
);

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
  const isDiamond = type === 'diamond';
  const isGold = type === 'gold';
  const isIron = type === 'iron';
  const fillColor = isDiamond ? '#38bdf8' : (isGold ? '#facc15' : (isIron ? '#cbd5e1' : '#64748b'));
  const trimColor = isDiamond ? '#e0f2fe' : (isGold ? '#fef08a' : (isIron ? '#f1f5f9' : '#94a3b8'));
  const shadowColor = isDiamond ? '#0369a1' : (isGold ? '#854d0e' : (isIron ? '#334155' : '#334155'));

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
  const isDiamond = type === 'diamond';
  const isGold = type === 'gold';
  const isIron = type === 'iron';
  const bladeColor = isNetherite ? '#18181b' : (isDiamond ? '#38bdf8' : (isGold ? '#facc15' : (isIron ? '#cbd5e1' : '#64748b')));
  const shineColor = isNetherite ? '#c084fc' : (isDiamond ? '#ffffff' : (isGold ? '#fef9c3' : (isIron ? '#ffffff' : '#94a3b8')));
  const hiltColor = isNetherite ? '#7e22ce' : (isDiamond ? '#0369a1' : (isGold ? '#eab308' : (isIron ? '#475569' : '#334155')));

  return (
    <svg viewBox="0 0 10 10" className={className} style={{ shapeRendering: 'crispEdges' }}>
      {/* Pommel */}
      <rect x="0" y="8" width="2" height="2" fill="#000000" />
      <rect x="0.5" y="8.5" width="1" height="1" fill={hiltColor} />
      {/* Hilt */}
      <rect x="1.5" y="6.5" width="2" height="2" fill="#78350f" />
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

export const GameHUD: React.FC<GameHUDProps> = ({
  health,
  maxHealth,
  coins,
  stage,
  armor,
  sword,
  fireResistTimer = 0,
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
}) => {
  const isFireResistActive = fireResistTimer > 0;

  return (
    <div className="absolute top-0 left-0 right-0 pt-5 sm:pt-7 md:pt-8 px-3.5 sm:px-6 md:px-8 flex flex-col gap-2 pointer-events-none select-none z-20">
      {/* Top Primary Row: Hearts & Buff on Left, Coin & Action Buttons on Right */}
      <div className="w-full flex items-center justify-between">
        {/* Hearts & Status Buff Container */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Hearts Container - Chunky 8-Bit Pixel Frame */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900 border-[3px] border-black px-2.5 sm:px-3 py-1.5 shadow-[3px_3px_0_#000000]">
            {Array.from({ length: maxHealth }).map((_, i) => (
              <PixelHeart
                key={i}
                filled={i < health}
                className="w-4.5 h-4.5 sm:w-5 sm:h-5 md:w-6 md:h-6"
              />
            ))}
          </div>

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

        {/* Top Right: Pixelated Coins Counter & Controls */}
        <div className="flex items-center flex-wrap justify-end gap-1.5 sm:gap-2 pointer-events-auto">
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
        </div>
      </div>

      {/* Row 2: MOVED DOWN for Tablet & Mobile - Stage Button on Top */}
      <div className="w-full flex flex-col items-start gap-2 sm:gap-2.5 pointer-events-auto mt-2.5 sm:mt-3.5 md:mt-4.5">
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
              : (armor === 'diamond'
                ? 'bg-cyan-950 text-cyan-300 drop-shadow-[0_1px_0_#083344]'
                : (armor === 'gold'
                  ? 'bg-yellow-950 text-yellow-400 drop-shadow-[0_1px_0_#3b1302]'
                  : (armor === 'iron'
                    ? 'bg-slate-800 text-slate-200 drop-shadow-[0_1px_0_#1e293b]'
                    : 'bg-slate-900 text-slate-400')))
          }`}>
            <PixelHUDShield type={armor} className="w-3.5 h-3.5" />
            <span>
              Armor: {armor === 'diamond' ? 'diamond armor' : (armor === 'gold' ? 'gold armor' : (armor === 'iron' ? 'iron armor' : 'none'))}
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
              Sword: {sword === 'netherite' ? 'netherite sword' : (sword === 'diamond' ? 'diamond sword' : (sword === 'gold' ? 'gold sword' : (sword === 'iron' ? 'iron sword' : 'none')))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
