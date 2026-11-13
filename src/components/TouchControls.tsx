import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Sword, Shield, Maximize2, Minimize2, Pause, ChevronUp, ChevronDown } from 'lucide-react';
import { audio } from '../game/audio';

interface TouchControlsProps {
  onInput: (controls: { left?: boolean; right?: boolean; jump?: boolean; attack?: boolean; block?: boolean }) => void;
  canAttack: boolean;
  hasShield?: boolean;
  onPause?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onInput,
  hasShield = false,
  onPause,
  isFullscreen = false,
  onToggleFullscreen
}) => {
  const [pressedState, setPressedState] = useState<{
    left: boolean;
    right: boolean;
    jump: boolean;
    attack: boolean;
    block: boolean;
  }>({
    left: false,
    right: false,
    jump: false,
    attack: false,
    block: false,
  });

  // Toggle for extra/other buttons
  const [showOtherButtons, setShowOtherButtons] = useState<boolean>(true);

  const setKey = useCallback((key: 'left' | 'right' | 'jump' | 'attack' | 'block', pressed: boolean) => {
    setPressedState(prev => (prev[key] === pressed ? prev : { ...prev, [key]: pressed }));
    onInput({ [key]: pressed });
  }, [onInput]);

  // Clear all inputs on unmount so character never gets stuck moving
  useEffect(() => {
    return () => {
      onInput({ left: false, right: false, jump: false, attack: false, block: false });
    };
  }, [onInput]);

  const bindTouchButton = (key: 'left' | 'right' | 'jump' | 'attack' | 'block') => ({
    style: { touchAction: 'none' } as React.CSSProperties,
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      audio.unlock();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      setKey(key, true);
    },
    onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setKey(key, false);
    },
    onPointerCancel: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setKey(key, false);
    },
  });

  return (
    <div
      onClick={e => e.stopPropagation()}
      className="absolute inset-x-0 bottom-3 px-3 sm:px-6 flex items-end justify-between pointer-events-none select-none z-30 pb-safe"
    >
      {/* ═══════════════════════════════════════════════════════════════
          LEFT: 8-BIT DIRECTIONAL CURSOR BUTTONS (LEFT ◀ & RIGHT ▶)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col items-start gap-1.5 pointer-events-auto">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/95 border-2 border-black text-[7.5px] font-pixel-arcade text-amber-300 shadow-[2px_2px_0_#000000]">
          <span>◀</span>
          <span>MOVE CURSORS</span>
          <span>▶</span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* LEFT CURSOR */}
          <button
            type="button"
            {...bindTouchButton('left')}
            className={`w-14 h-14 sm:w-16 sm:h-16 border-[3px] border-black flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
              pressedState.left
                ? 'bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-500 text-slate-950 translate-y-[2px] shadow-[0_1px_0_#78350f,1px_1px_0_#000000]'
                : 'bg-slate-900/95 hover:bg-slate-800 text-yellow-400 shadow-[0_4px_0_#0f172a,3px_3px_0_#000000]'
            }`}
            aria-label="Move Left"
          >
            <ArrowLeft className="w-7 h-7 stroke-[3]" />
            <span className="text-[7.5px] font-pixel-arcade mt-[-2px]">LEFT</span>
          </button>

          {/* RIGHT CURSOR */}
          <button
            type="button"
            {...bindTouchButton('right')}
            className={`w-14 h-14 sm:w-16 sm:h-16 border-[3px] border-black flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
              pressedState.right
                ? 'bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-500 text-slate-950 translate-y-[2px] shadow-[0_1px_0_#78350f,1px_1px_0_#000000]'
                : 'bg-slate-900/95 hover:bg-slate-800 text-yellow-400 shadow-[0_4px_0_#0f172a,3px_3px_0_#000000]'
            }`}
            aria-label="Move Right"
          >
            <ArrowRight className="w-7 h-7 stroke-[3]" />
            <span className="text-[7.5px] font-pixel-arcade mt-[-2px]">RIGHT</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          RIGHT: ACTION BUTTONS (CHUNKY 8-BIT ARCADE BUTTONS)
          - Jump Cursor (▲) always present
          - Attack / Sword button always reachable
          - Shield button appears when player has collected the shield
          ═══════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col items-end gap-2 pointer-events-auto">
        {/* Mobile Action Buttons Tray Toggle */}
        <button
          type="button"
          onClick={() => setShowOtherButtons(p => !p)}
          onPointerDown={e => e.stopPropagation()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border-2 border-black text-[8px] sm:text-[9px] font-pixel-arcade text-yellow-300 shadow-[2px_2px_0_#000000] active:translate-y-[1px] active:shadow-none cursor-pointer select-none touch-manipulation"
          aria-label={showOtherButtons ? 'Hide Extra Buttons' : 'Show Extra Buttons'}
        >
          {showOtherButtons ? <ChevronDown className="w-3.5 h-3.5 text-yellow-400 stroke-[2.5]" /> : <ChevronUp className="w-3.5 h-3.5 text-yellow-400 stroke-[2.5]" />}
          <span className="font-bold">{showOtherButtons ? '▼ HIDE EXTRA' : '▲ SHOW EXTRA'}</span>
        </button>

        {/* Secondary Utility Buttons Row */}
        {showOtherButtons && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
            {onToggleFullscreen && (
              <button
                type="button"
                onClick={onToggleFullscreen}
                className="w-10 h-10 bg-slate-900 active:bg-slate-800 border-2 border-black text-yellow-400 flex items-center justify-center shadow-[2px_2px_0_#000000] active:translate-y-[1px] active:shadow-none transition-transform cursor-pointer"
                title="Toggle Fullscreen"
                aria-label="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            )}

            {onPause && (
              <button
                type="button"
                onClick={onPause}
                className="w-10 h-10 bg-slate-900 active:bg-slate-800 border-2 border-black text-slate-300 flex items-center justify-center shadow-[2px_2px_0_#000000] active:translate-y-[1px] active:shadow-none transition-transform cursor-pointer"
                title="Pause Game"
                aria-label="Pause Game"
              >
                <Pause className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Primary Action Row: Shield (if unlocked) + Attack + Jump */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {hasShield && (
            <button
              type="button"
              {...bindTouchButton('block')}
              className={`w-13 h-13 sm:w-14 sm:h-14 border-[3px] border-black flex flex-col items-center justify-center text-cyan-100 transition-all cursor-pointer ${
                pressedState.block
                  ? 'bg-cyan-500 translate-y-[2px] shadow-[0_1px_0_#0e7490,1px_1px_0_#000000]'
                  : 'bg-gradient-to-b from-cyan-600 via-cyan-700 to-cyan-900 shadow-[0_4px_0_#0e7490,2px_2px_0_#000000]'
              }`}
              aria-label="Shield Deflect"
            >
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-100" />
              <span className="text-[7.5px] font-pixel-arcade mt-0.5 tracking-tighter">
                SHIELD
              </span>
            </button>
          )}

          {/* ATTACK BUTTON */}
          <button
            type="button"
            {...bindTouchButton('attack')}
            className={`w-13 h-13 sm:w-14 sm:h-14 border-[3px] border-black flex flex-col items-center justify-center text-white transition-all cursor-pointer ${
              pressedState.attack
                ? 'bg-rose-500 translate-y-[2px] shadow-[0_1px_0_#881337,1px_1px_0_#000000]'
                : 'bg-gradient-to-b from-rose-600 via-rose-700 to-rose-900 shadow-[0_4px_0_#881337,2px_2px_0_#000000]'
            }`}
            aria-label="Attack"
          >
            <Sword className="w-5 h-5 sm:w-6 sm:h-6 text-rose-100" />
            <span className="text-[7.5px] font-pixel-arcade mt-0.5">ATTACK</span>
          </button>

          {/* JUMP CURSOR (▲) */}
          <button
            type="button"
            {...bindTouchButton('jump')}
            className={`w-14 h-14 sm:w-16 sm:h-16 border-[3px] border-black flex flex-col items-center justify-center text-slate-950 font-bold transition-all cursor-pointer ${
              pressedState.jump
                ? 'bg-yellow-300 translate-y-[2px] shadow-[0_1px_0_#78350f,1px_1px_0_#000000]'
                : 'bg-gradient-to-b from-yellow-400 via-amber-400 to-yellow-500 shadow-[0_4px_0_#78350f,3px_3px_0_#000000]'
            }`}
            aria-label="Jump"
          >
            <ArrowUp className="w-7 h-7 stroke-[3] text-slate-950" />
            <span className="text-[8px] font-pixel-arcade mt-[-2px] tracking-tight">JUMP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
