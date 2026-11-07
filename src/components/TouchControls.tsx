import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowUp, Sword, Shield, Maximize2, Minimize2, Pause, ChevronUp, ChevronDown } from 'lucide-react';

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
  // Joystick horizontal dragging state
  const joystickTrackRef = useRef<HTMLDivElement>(null);
  const [joystickOffset, setJoystickOffset] = useState<number>(0);
  const [activeDirection, setActiveDirection] = useState<'left' | 'right' | null>(null);
  const isDraggingJoystick = useRef<boolean>(false);
  const joystickTouchId = useRef<number | null>(null);

  // Toggle for extra/other buttons revealed by moving up or down
  const [showOtherButtons, setShowOtherButtons] = useState<boolean>(true);

  // Update engine input when joystick direction changes
  const updateDirection = useCallback((dir: 'left' | 'right' | null) => {
    setActiveDirection(dir);
    if (dir === 'left') {
      onInput({ left: true, right: false });
    } else if (dir === 'right') {
      onInput({ left: false, right: true });
    } else {
      onInput({ left: false, right: false });
    }
  }, [onInput]);

  // Handle pointer drag on horizontal joystick
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDraggingJoystick.current = true;
    joystickTouchId.current = e.pointerId;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingJoystick.current || !joystickTrackRef.current) return;
    const rect = joystickTrackRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const rawOffset = e.clientX - centerX;
    
    // Clamp to track boundaries (max -36px to +36px)
    const maxOffset = 36;
    const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, rawOffset));
    setJoystickOffset(clampedOffset);

    const threshold = 12;
    if (clampedOffset < -threshold) {
      updateDirection('left');
    } else if (clampedOffset > threshold) {
      updateDirection('right');
    } else {
      updateDirection(null);
    }
  };

  const handlePointerUp = () => {
    isDraggingJoystick.current = false;
    joystickTouchId.current = null;
    setJoystickOffset(0);
    updateDirection(null);
  };

  const handlePress = (key: 'jump' | 'attack' | 'block', pressed: boolean) => {
    onInput({ [key]: pressed });
  };

  return (
    <div className="absolute inset-x-0 bottom-3 px-3 sm:px-6 flex items-end justify-between pointer-events-none select-none z-30 pb-safe">
      
      {/* ═══════════════════════════════════════════════════════════════
          LEFT: HORIZONTAL VIRTUAL JOYSTICK (MOVE BACK OR FORTH ONLY)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col items-start gap-1.5 pointer-events-auto">
        {/* Arcade Label */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border-2 border-black text-[7.5px] font-pixel-arcade text-amber-300 shadow-[2px_2px_0_#000000]">
          <span>◀</span>
          <span>JOYSTICK (8-BIT)</span>
          <span>▶</span>
        </div>

        {/* Horizontal Track & Draggable Knob */}
        <div
          ref={joystickTrackRef}
          style={{ touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative w-36 h-13 bg-slate-900 border-[3px] border-black shadow-[3px_3px_0_#000000] flex items-center justify-center cursor-pointer select-none"
        >
          {/* Track Guides & Active Highlights */}
          <div className="absolute inset-x-2.5 h-4 bg-slate-950 border border-slate-800 flex items-center justify-between px-2">
            <span className={`text-[10px] font-pixel-arcade transition-colors ${activeDirection === 'left' ? 'text-yellow-400 font-bold scale-125' : 'text-slate-600'}`}>
              ◀
            </span>
            <div className="w-1.5 h-1.5 bg-slate-700" />
            <span className={`text-[10px] font-pixel-arcade transition-colors ${activeDirection === 'right' ? 'text-yellow-400 font-bold scale-125' : 'text-slate-600'}`}>
              ▶
            </span>
          </div>

          {/* 8-Bit Chunky Arcade Joystick Knob */}
          <div
            style={{
              transform: `translateX(${joystickOffset}px)`,
              touchAction: 'none'
            }}
            className={`w-10 h-10 border-[2.5px] border-black transition-transform shadow-[2px_2px_0_#000000] flex items-center justify-center pointer-events-none z-10 ${
              activeDirection
                ? 'bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-500 border-black'
                : 'bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-black'
            }`}
          >
            <div className="w-3.5 h-3.5 bg-slate-950/60 border border-black flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white/80" />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          RIGHT: ACTION BUTTONS (CHUNKY 8-BIT ARCADE BUTTONS)
          - Jump Button always present
          - Shield Button ONLY appears when player collected the shield!
          - Swipe Up / Down reveals or hides other buttons
          ═══════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col items-end gap-2 pointer-events-auto">
        
        {/* Tablet / Mobile Action Buttons Tray Toggle */}
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

        {/* Secondary Other Buttons Tray */}
        {showOtherButtons && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
            {/* Quick Fullscreen Button */}
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

            {/* Quick Pause Button for Mobile */}
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

            {/* Attack / Sword Button */}
            <button
              type="button"
              style={{ touchAction: 'none' }}
              onPointerDown={e => {
                e.preventDefault();
                (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                handlePress('attack', true);
              }}
              onPointerUp={e => {
                e.preventDefault();
                handlePress('attack', false);
              }}
              onPointerCancel={e => {
                e.preventDefault();
                handlePress('attack', false);
              }}
              className="w-12 h-12 bg-gradient-to-b from-rose-600 via-rose-700 to-rose-900 border-[2.5px] border-black active:translate-y-[2px] flex flex-col items-center justify-center text-white shadow-[0_4px_0_#881337,2px_2px_0_#000000] active:shadow-[0_1px_0_#881337] transition-all cursor-pointer"
              aria-label="Attack"
            >
              <Sword className="w-5 h-5 text-rose-100" />
              <span className="text-[7.5px] font-pixel-arcade mt-0.5">ATTACK</span>
            </button>
          </div>
        )}

        {/* Primary Row: Shield (Only if collected) + Jump */}
        <div className="flex items-center gap-2.5">
          {/* SHIELD BUTTON: ONLY APPEARS WHEN SHIELD IS COLLECTED! */}
          {hasShield && (
            <button
              type="button"
              style={{ touchAction: 'none' }}
              onPointerDown={e => {
                e.preventDefault();
                (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                handlePress('block', true);
              }}
              onPointerUp={e => {
                e.preventDefault();
                handlePress('block', false);
              }}
              onPointerCancel={e => {
                e.preventDefault();
                handlePress('block', false);
              }}
              className="w-13 h-13 sm:w-14 sm:h-14 bg-gradient-to-b from-cyan-600 via-cyan-700 to-cyan-900 border-[3px] border-black active:translate-y-[2px] flex flex-col items-center justify-center text-cyan-100 shadow-[0_4px_0_#0e7490,2px_2px_0_#000000] active:shadow-[0_1px_0_#0e7490] transition-all cursor-pointer animate-in zoom-in-75 duration-200"
              aria-label="Shield Deflect"
            >
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-100 animate-pulse" />
              <span className="text-[7.5px] font-pixel-arcade mt-0.5 tracking-tighter">
                SHIELD
              </span>
            </button>
          )}

          {/* JUMP BUTTON */}
          <button
            type="button"
            style={{ touchAction: 'none' }}
            onPointerDown={e => {
              e.preventDefault();
              (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              handlePress('jump', true);
            }}
            onPointerUp={e => {
              e.preventDefault();
              handlePress('jump', false);
            }}
            onPointerCancel={e => {
              e.preventDefault();
              handlePress('jump', false);
            }}
            className="w-14 h-14 sm:w-15 sm:h-15 bg-gradient-to-b from-yellow-400 via-amber-400 to-yellow-500 border-[3px] border-black active:translate-y-[2px] flex flex-col items-center justify-center text-slate-950 font-bold shadow-[0_4px_0_#78350f,3px_3px_0_#000000] active:shadow-[0_1px_0_#78350f] transition-all cursor-pointer"
            aria-label="Jump"
          >
            <ArrowUp className="w-6 h-6 stroke-[3] text-slate-950" />
            <span className="text-[8.5px] font-pixel-arcade mt-[-2px] tracking-tight">JUMP</span>
          </button>
        </div>

      </div>
    </div>
  );
};
