import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Lock, Shield, Skull, Compass, ChevronLeft, Leaf } from 'lucide-react';
import {
  BESTIARY_ENTRIES,
  BestiaryCategory,
  BestiaryEntry,
  BestiaryEntryId,
  getEncounteredBestiarySet,
} from '../game/bestiary';
import { GameRenderer } from '../game/renderer';
import {
  BoulderHazard,
  Camera,
  CockatriceBoss,
  SaveData,
  ThundercloudHazard,
  VolcanoHazard,
} from '../game/types';

interface BestiaryViewProps {
  saveData: SaveData;
  onReturnToMenu: () => void;
}

type FilterTab = 'all' | BestiaryCategory;

const BestiarySpriteCanvas: React.FC<{
  entryId: BestiaryEntryId;
  unlocked: boolean;
  variant: 'thumb' | 'hero';
  colorVariantIndex?: number;
  isBaby?: boolean;
}> = ({ entryId, unlocked, variant, colorVariantIndex = 0, isBaby = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const width = variant === 'hero' ? 280 : 68;
  const height = variant === 'hero' ? 164 : 46;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let renderer: GameRenderer;
    try {
      renderer = new GameRenderer(canvas);
    } catch {
      return;
    }

    const camera: Camera = {
      x: 0,
      y: 0,
      viewportWidth: width,
      viewportHeight: height,
      worldWidth: width,
      worldHeight: height,
    };

    let rafId = 0;
    const startTime = performance.now();

    const drawFrame = (now: number) => {
      const time = (now - startTime) / 1000;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.imageSmoothingEnabled = false;

      if (entryId === 'wolf') {
        const scale = variant === 'hero' ? 3.2 : 0.95;
        ctx.save();
        ctx.translate(width / 2, height / 2 + (variant === 'hero' ? 12 : 4));
        renderer.drawWolfSprite(ctx, 36, 24, false, time * 1.15, scale, colorVariantIndex);
        ctx.restore();
      } else if (entryId === 'fox') {
        const scale = variant === 'hero' ? 3.2 : 0.95;
        ctx.save();
        ctx.translate(width / 2, height / 2 + (variant === 'hero' ? 14 : 4));
        renderer.drawFoxSprite(ctx, 38, 22, false, time * 1.5, scale, colorVariantIndex);
        ctx.restore();
      } else if (entryId === 'snake') {
        const scale = variant === 'hero' ? 3.4 : 1.05;
        ctx.save();
        ctx.translate(width / 2, height / 2 + (variant === 'hero' ? 22 : 6));
        renderer.drawSnakeSprite(ctx, 38, 14, false, time * 1.4, scale, colorVariantIndex);
        ctx.restore();
      } else if (entryId === 'bear') {
        const scale = variant === 'hero' ? 2.6 : 0.8;
        ctx.save();
        ctx.translate(width / 2, height / 2 + (variant === 'hero' ? 12 : 3));
        renderer.drawBearSprite(ctx, 48, 36, false, time * 0.95, scale, colorVariantIndex);
        ctx.restore();
      } else if (entryId === 'cockatrice') {
        const s = variant === 'hero' ? 0.44 : 0.14;
        const boss: CockatriceBoss = {
          id: 'preview_cockatrice',
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          width: 240,
          height: 190,
          health: 200,
          maxHealth: 200,
          phase: 1,
          rageMode: 'sky rage',
          state: 'flying_idle',
          stateTimer: time,
          dialogueIndex: 0,
          dialogueCharIndex: 0,
          dialogueTimer: 0,
          stunHitsNeeded: 3,
          stunTimer: 0,
          maxStunTime: 11,
          facing: 'right',
          targetX: 0,
          targetY: 0,
          fireProjectiles: [],
          biteTargetX: 0,
          biteTargetY: 0,
          animTimer: time,
          invulnerableTimer: 0,
          wingAngle: Math.sin(time * 7.5) * 0.42,
          jawOpen: Math.max(0, Math.sin(time * 2.4) * 0.35),
          bittenLandCraters: [],
        };
        const bobY = Math.sin(time * 3.0) * (variant === 'hero' ? 4 : 1.5);
        ctx.save();
        ctx.translate(width / 2 - 120 * s, height / 2 - 95 * s + bobY);
        ctx.scale(s, s);
        renderer.renderCockatrice(boss, camera, time);
        ctx.restore();
      } else if (entryId === 'volcano') {
        const s = variant === 'hero' ? 1.55 : 0.54;
        const cycle = time % 3.6;
        const isErupting = cycle > 1.2 && cycle < 2.8;
        const isWarning = cycle <= 1.2;
        const lavaParticles = isErupting
          ? [0, 1, 2, 3, 4].map((idx) => {
              const phase = (time * 2.2 + idx * 0.23) % 1;
              const spread = (idx - 2) * 12;
              return {
                x: 34 + spread * phase,
                y: 26 - Math.sin(phase * Math.PI) * 34,
                vx: spread,
                vy: -40,
                radius: 3.5 + (idx % 2),
                life: 1 - phase,
                maxLife: 1,
              };
            })
          : [];
        const volcano: VolcanoHazard = {
          id: 'preview_volcano',
          x: 6,
          y: 36,
          width: 56,
          height: 36,
          state: isErupting ? 'erupting' : isWarning ? 'warning' : 'cooldown',
          timer: cycle,
          warningDuration: 1.2,
          eruptionDuration: 1.6,
          cooldownDuration: 0.8,
          lavaParticles,
        };
        ctx.save();
        ctx.translate(width / 2 - 34 * s, height / 2 - 42 * s + (variant === 'hero' ? 10 : 3));
        ctx.scale(s, s);
        renderer.renderVolcano(volcano, camera);
        ctx.restore();
      } else if (entryId === 'boulder') {
        const s = variant === 'hero' ? 1.9 : 0.65;
        const boulder: BoulderHazard = {
          id: 'preview_boulder',
          x: 30,
          y: 30,
          radius: 22,
          vx: 0,
          vy: 0,
          startX: 30,
          startY: 30,
          isFalling: false,
          isRolling: true,
          warningTimer: 0,
          respawnTimer: 0,
          rotation: time * 2.1,
          speed: 2.5,
          hasTrapDropper: false,
        };
        ctx.save();
        ctx.translate(width / 2 - 30 * s, height / 2 - 30 * s + (variant === 'hero' ? 10 : 2));
        ctx.scale(s, s);
        renderer.renderBoulder(boulder, camera, 'jungle');
        ctx.restore();
      } else if (entryId === 'thundercloud') {
        const s = variant === 'hero' ? 1.45 : 0.48;
        const cycle = time % 3.4;
        const state: ThundercloudHazard['state'] =
          cycle < 1.5 ? 'warning' : cycle < 2.2 ? 'striking' : 'tracking';
        const cloud: ThundercloudHazard = {
          id: 'preview_cloud',
          x: 50,
          y: 24,
          targetX: 50,
          targetY: 96,
          width: 74,
          state,
          timer: cycle,
          strikeDuration: 0.7,
          warningDuration: 1.5,
          cooldownDuration: 1.2,
        };
        ctx.save();
        ctx.translate(width / 2 - 50 * s, height / 2 - 54 * s);
        ctx.scale(s, s);
        renderer.renderThundercloud(cloud, camera, time);
        ctx.restore();
      } else if (entryId === 'sheep') {
        const scale = variant === 'hero' ? (isBaby ? 2.1 : 2.15) : 0.68;
        renderer.renderGrazingSheep(
          width / 2,
          height / 2 + (variant === 'hero' ? 32 : 12),
          time,
          { facing: 'right', scale, isLamb: isBaby, animOffset: 0.8, variantIndex: colorVariantIndex }
        );
      } else if (entryId === 'monkey') {
        const s = variant === 'hero' ? (isBaby ? 3.2 : 2.85) : 0.92;
        ctx.save();
        ctx.translate(width / 2, height / 2 + (variant === 'hero' ? 18 : 6));
        ctx.scale(s, s);
        // Subtle jungle branch perch beneath the monkey
        ctx.fillStyle = '#451a03';
        ctx.fillRect(-20, 11, 40, 4);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-18, 11, 36, 2);
        // treeIndex=1 uses branchOffset=-14, so passing tx=14 centers monkey at x=0 facing right
        renderer.renderJungleMonkey(14, -4, time, false, 1, false, colorVariantIndex, { isBaby, activity: 'squeak' });
        ctx.restore();
      } else if (entryId === 'hare') {
        const scale = variant === 'hero' ? (isBaby ? 3.5 : 3.2) : 1.0;
        ctx.save();
        ctx.translate(width / 2, height / 2 + (variant === 'hero' ? 24 : 8));
        renderer.drawSnowshoeHareSprite(ctx, time, scale, false, colorVariantIndex, isBaby, 'eat');
        ctx.restore();
      } else if (entryId === 'butterfly') {
        const scale = variant === 'hero' ? 4.4 : 1.45;
        ctx.save();
        ctx.translate(width / 2, height / 2 + (variant === 'hero' ? 2 : 1));
        renderer.drawButterflySprite(ctx, time, scale, colorVariantIndex);
        ctx.restore();
      } else if (entryId === 'dragonfly') {
        const scale = variant === 'hero' ? 4.0 : 1.3;
        ctx.save();
        ctx.translate(width / 2, height / 2 - (variant === 'hero' ? 4 : 1));
        renderer.drawDragonflySprite(ctx, time, scale, colorVariantIndex);
        ctx.restore();
      } else if (entryId === 'honeybee') {
        const scale = variant === 'hero' ? 4.6 : 1.5;
        ctx.save();
        ctx.translate(width / 2, height / 2 + (variant === 'hero' ? 4 : 2));
        renderer.drawHoneybeeSprite(ctx, time, scale, colorVariantIndex);
        ctx.restore();
      } else if (entryId === 'ladybug') {
        const scale = variant === 'hero' ? 4.8 : 1.55;
        ctx.save();
        ctx.translate(width / 2, height / 2 + (variant === 'hero' ? 18 : 6));
        renderer.drawLadybugSprite(ctx, time, scale, colorVariantIndex);
        ctx.restore();
      }

      // Apply clean dark shadow silhouette for unencountered entries
      if (!unlocked) {
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = variant === 'hero' ? '#0f172a' : '#1e293b';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.restore();
      rafId = requestAnimationFrame(drawFrame);
    };

    rafId = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(rafId);
  }, [entryId, unlocked, variant, width, height, colorVariantIndex, isBaby]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="block select-none"
      style={{ imageRendering: 'pixelated' }}
      aria-hidden="true"
    />
  );
};

export const BestiaryView: React.FC<BestiaryViewProps> = ({ saveData, onReturnToMenu }) => {
  const discoveredSet = useMemo(() => getEncounteredBestiarySet(saveData), [saveData]);

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [selectedId, setSelectedId] = useState<BestiaryEntryId>(() => {
    const firstDiscovered = BESTIARY_ENTRIES.find(e => discoveredSet.has(e.id));
    return firstDiscovered ? firstDiscovered.id : BESTIARY_ENTRIES[0].id;
  });
  const [selectedMorphIndex, setSelectedMorphIndex] = useState<number>(0);
  const [showBabyForm, setShowBabyForm] = useState<boolean>(false);

  // Reset selected coat/morph and adult/baby view when switching entries
  useEffect(() => {
    setSelectedMorphIndex(0);
    setShowBabyForm(false);
  }, [selectedId]);

  // Allow Escape key to return cleanly to Main Menu
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onReturnToMenu();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onReturnToMenu]);

  const filteredEntries = useMemo(() => {
    if (activeFilter === 'all') return BESTIARY_ENTRIES;
    return BESTIARY_ENTRIES.filter(entry => entry.category === activeFilter);
  }, [activeFilter]);

  const selectedEntry: BestiaryEntry = useMemo(() => {
    return (
      filteredEntries.find(e => e.id === selectedId) ||
      filteredEntries[0] ||
      BESTIARY_ENTRIES[0]
    );
  }, [filteredEntries, selectedId]);

  const isSelectedUnlocked = discoveredSet.has(selectedEntry.id);
  const isWildlife = selectedEntry.category === 'wildlife';
  const selectedIndex = BESTIARY_ENTRIES.findIndex(e => e.id === selectedEntry.id) + 1;
  const defeatCount = saveData.enemyDefeatCounts?.[selectedEntry.id] || 0;

  const filterCounts = useMemo(
    () => ({
      all: BESTIARY_ENTRIES.length,
      creature: BESTIARY_ENTRIES.filter(e => e.category === 'creature').length,
      boss: BESTIARY_ENTRIES.filter(e => e.category === 'boss').length,
      hazard: BESTIARY_ENTRIES.filter(e => e.category === 'hazard').length,
      wildlife: BESTIARY_ENTRIES.filter(e => e.category === 'wildlife').length,
    }),
    []
  );

  const handleSelectFilter = (tab: FilterTab) => {
    setActiveFilter(tab);
    const nextList = tab === 'all' ? BESTIARY_ENTRIES : BESTIARY_ENTRIES.filter(e => e.category === tab);
    if (nextList.length > 0 && !nextList.some(e => e.id === selectedId)) {
      setSelectedId(nextList[0].id);
    }
  };

  const categoryLabel = (cat: BestiaryCategory) => {
    if (cat === 'boss') return 'Boss';
    if (cat === 'hazard') return 'Hazard';
    if (cat === 'wildlife') return 'Wildlife';
    return 'Creature';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/92 backdrop-blur-sm p-2.5 sm:p-4 overflow-hidden">
      <div className="w-full max-w-4xl max-h-[92vh] bg-slate-950 border-2 border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.2)] flex flex-col overflow-hidden">
        {/* Header Bar with Field Journal Completion Progress */}
        <header className="px-4 sm:px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border-b-2 border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 bg-gradient-to-b from-yellow-300 to-amber-500 border-2 border-amber-700 shadow-[0_2px_0_#78350f] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="min-w-0 flex-1 max-w-md">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-pixel-arcade text-sm sm:text-base text-yellow-300 tracking-wider truncate">
                  ADVENTURER BESTIARY
                </h2>
                <span className="font-pixel-arcade text-[9px] text-amber-300 tabular-nums shrink-0">
                  {discoveredSet.size}/{BESTIARY_ENTRIES.length}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 border border-slate-700 mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-300"
                  style={{ width: `${Math.round((discoveredSet.size / BESTIARY_ENTRIES.length) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onReturnToMenu}
            className="min-h-[40px] px-3 sm:px-4 bg-slate-800 hover:bg-slate-700 active:translate-y-0.5 text-yellow-300 border-2 border-slate-600 shadow-[0_3px_0_#0f172a] font-pixel-arcade text-[9px] sm:text-[10px] tracking-wider flex items-center gap-1.5 shrink-0 cursor-pointer transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>MENU</span>
          </button>
        </header>

        {/* Category Filter Tabs */}
        <div
          role="tablist"
          aria-label="Bestiary categories"
          className="px-4 sm:px-5 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0"
        >
          {(
            [
              { id: 'all', label: `ALL (${filterCounts.all})` },
              { id: 'creature', label: `ENEMIES (${filterCounts.creature})` },
              { id: 'boss', label: `BOSS (${filterCounts.boss})` },
              { id: 'hazard', label: `HAZARDS (${filterCounts.hazard})` },
              { id: 'wildlife', label: `WILDLIFE (${filterCounts.wildlife})` },
            ] as { id: FilterTab; label: string }[]
          ).map(tab => {
            const active = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleSelectFilter(tab.id)}
                className={`min-h-[36px] px-3 py-1.5 font-pixel-arcade text-[9px] sm:text-[10px] tracking-wide border-2 whitespace-nowrap cursor-pointer transition-colors ${
                  active
                    ? 'bg-yellow-400 text-slate-950 border-amber-600 font-bold'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600 hover:text-yellow-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Two-Pane Body */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[268px_1fr] overflow-hidden">
          {/* Left Roster Column */}
          <aside className="border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/90 overflow-y-auto p-2.5 sm:p-3 max-h-[28vh] md:max-h-none touch-pan-y">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 gap-2">
              {filteredEntries.map((entry) => {
                const unlocked = discoveredSet.has(entry.id);
                const isSelected = selectedEntry.id === entry.id;
                const entryNum = BESTIARY_ENTRIES.findIndex(e => e.id === entry.id) + 1;

                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setSelectedId(entry.id)}
                    className={`w-full text-left p-2 border-2 flex items-center gap-2.5 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-amber-500/15 border-yellow-400'
                        : 'bg-slate-900/75 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div
                      className={`w-[68px] h-[46px] shrink-0 border flex items-center justify-center relative overflow-hidden ${
                        unlocked
                          ? 'border-slate-700 bg-slate-950'
                          : 'border-slate-800 bg-slate-950/90'
                      }`}
                    >
                      <BestiarySpriteCanvas entryId={entry.id} unlocked={unlocked} variant="thumb" />
                      {!unlocked && (
                        <span className="absolute inset-0 flex items-center justify-center font-pixel-arcade text-xs text-slate-500/80">
                          ?
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-pixel-arcade text-[9px] sm:text-[10px] text-slate-100 truncate">
                        {unlocked ? entry.name : '???'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-body mt-0.5 truncate tabular-nums">
                        #{String(entryNum).padStart(2, '0')} · Stage {entry.firstSeenLevel} ·{' '}
                        {unlocked ? categoryLabel(entry.category) : 'Locked'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Field Journal Detail Panel */}
          <section className="overflow-y-auto p-4 sm:p-5 bg-slate-950 touch-pan-y">
            {/* Pixel Art Showcase Stage */}
            <div
              className="relative w-full h-44 sm:h-52 border-2 border-slate-800 overflow-hidden flex flex-col items-center justify-center mb-4"
              style={{
                background: isSelectedUnlocked
                  ? selectedEntry.backdropGradient
                  : 'linear-gradient(180deg, #020617 0%, #0f172a 65%, #1e293b 100%)',
              }}
            >
              {/* Subtle top typographic metadata */}
              <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                <span className="font-pixel-arcade text-[9px] text-slate-100/90 tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  NO. {String(selectedIndex).padStart(2, '0')} ·{' '}
                  {isSelectedUnlocked ? selectedEntry.threatRank : 'UNIDENTIFIED'}
                </span>
                <span className="font-pixel-arcade text-[8px] sm:text-[9px] text-yellow-200 truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  {isSelectedUnlocked ? selectedEntry.habitat : `STAGE ${selectedEntry.firstSeenLevel}`}
                </span>
              </div>

              {/* Ground Strip */}
              <div
                className="absolute bottom-0 inset-x-0 h-8 border-t-4"
                style={{
                  backgroundColor: isSelectedUnlocked ? selectedEntry.groundColor : '#0f172a',
                  borderTopColor: isSelectedUnlocked ? selectedEntry.groundTrimColor : '#334155',
                }}
              />

              {/* Live Pixel Sprite */}
              <div className="relative z-10 flex items-center justify-center">
                <BestiarySpriteCanvas
                  entryId={selectedEntry.id}
                  unlocked={isSelectedUnlocked}
                  variant="hero"
                  colorVariantIndex={selectedMorphIndex}
                  isBaby={Boolean(selectedEntry.hasBabyForm && showBabyForm)}
                />
                {!isSelectedUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="font-pixel-arcade text-3xl text-slate-400/75 drop-shadow-[0_2px_0_#020617]">
                      ?
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Adult / Baby Life Stage Switcher (for innocent mammals with babies) */}
            {isSelectedUnlocked && selectedEntry.hasBabyForm && (
              <div className="mb-3 bg-slate-900/90 border border-slate-800 p-2.5 flex flex-wrap items-center justify-between gap-2">
                <div className="font-pixel-arcade text-[8px] text-slate-400 tracking-wider">
                  LIFE STAGE PREVIEW
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowBabyForm(false)}
                    className={`min-h-[34px] px-3 py-1 border-2 font-pixel-arcade text-[8px] sm:text-[9px] cursor-pointer transition-all whitespace-nowrap ${
                      !showBabyForm
                        ? 'bg-yellow-400 text-slate-950 border-amber-600 font-bold shadow-[0_2px_0_#78350f]'
                        : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-yellow-200'
                    }`}
                  >
                    ADULT
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBabyForm(true)}
                    className={`min-h-[34px] px-3 py-1 border-2 font-pixel-arcade text-[8px] sm:text-[9px] cursor-pointer transition-all whitespace-nowrap ${
                      showBabyForm
                        ? 'bg-emerald-400 text-slate-950 border-emerald-700 font-bold shadow-[0_2px_0_#064e3b]'
                        : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-emerald-500 hover:text-emerald-200'
                    }`}
                  >
                    BABY ({(selectedEntry.babyName || 'BABY').toUpperCase()})
                  </button>
                </div>
              </div>
            )}

            {/* Interactive Natural Color / Breed Morph Selector */}
            {isSelectedUnlocked && selectedEntry.colorVariants && selectedEntry.colorVariants.length > 0 && (
              <div className="mb-4 bg-slate-900/90 border border-slate-800 p-2.5">
                <div className="font-pixel-arcade text-[8px] text-slate-400 mb-2 tracking-wider">
                  NATURAL COAT &amp; SPECIES VARIATIONS
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedEntry.colorVariants.map((morph, idx) => {
                    const isActiveMorph = selectedMorphIndex === idx;
                    return (
                      <button
                        key={morph.name}
                        type="button"
                        onClick={() => setSelectedMorphIndex(idx)}
                        className={`min-h-[34px] px-2.5 py-1 border-2 font-pixel-arcade text-[8px] sm:text-[9px] flex items-center gap-2 cursor-pointer transition-all ${
                          isActiveMorph
                            ? 'bg-yellow-400 text-slate-950 border-amber-600 font-bold shadow-[0_2px_0_#78350f]'
                            : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-yellow-200'
                        }`}
                      >
                        <span
                          className="w-3 h-3 border border-slate-950/80 shrink-0"
                          style={{ backgroundColor: morph.swatch }}
                        />
                        <span>{morph.name.toUpperCase()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Entry Title & Naturalist Taxonomy */}
            <div className="mb-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex flex-wrap items-baseline gap-2.5">
                  <h3 className="font-pixel-arcade text-base sm:text-lg text-yellow-300 tracking-wide">
                    {isSelectedUnlocked
                      ? selectedEntry.name
                      : isWildlife
                        ? 'UNDISCOVERED WILDLIFE'
                        : 'UNDISCOVERED FOE'}
                  </h3>
                  {isSelectedUnlocked && (
                    <span className="text-xs italic text-amber-300/80 font-body">
                      {selectedEntry.scientificName}
                    </span>
                  )}
                </div>
                <span className="font-pixel-arcade text-[9px] text-slate-400 tabular-nums">
                  FIRST SEEN · STAGE {selectedEntry.firstSeenLevel}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-body mt-0.5">
                {isSelectedUnlocked
                  ? selectedEntry.subtitle
                  : isWildlife
                    ? 'Explore its biome during your journey to log this background animal in your field journal.'
                    : 'Cross paths with this enemy during your journey to record its pixel portrait and lore.'}
              </p>
            </div>

            {/* Combat / Wildlife Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              <div className="bg-slate-900 border border-slate-800 px-3 py-2.5">
                <div className="font-pixel-arcade text-[8px] text-slate-400 mb-1">
                  {isWildlife ? 'NATURE' : 'HEALTH'}
                </div>
                <div
                  className={`font-pixel-arcade text-[10px] sm:text-[11px] tabular-nums ${
                    isWildlife ? 'text-emerald-300' : 'text-slate-100'
                  }`}
                >
                  {isSelectedUnlocked ? selectedEntry.hpLabel : '???'}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 px-3 py-2.5">
                <div className="font-pixel-arcade text-[8px] text-slate-400 mb-1">
                  {isWildlife ? 'DANGER' : 'DAMAGE'}
                </div>
                <div
                  className={`font-pixel-arcade text-[10px] sm:text-[11px] tabular-nums ${
                    isWildlife ? 'text-slate-200' : 'text-rose-300'
                  }`}
                >
                  {isSelectedUnlocked ? selectedEntry.damageLabel : '???'}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 px-3 py-2.5">
                <div className="font-pixel-arcade text-[8px] text-slate-400 mb-1">
                  {isWildlife ? 'HABIT' : 'TEMPO'}
                </div>
                <div className="font-pixel-arcade text-[10px] sm:text-[11px] text-sky-300">
                  {isSelectedUnlocked ? selectedEntry.speedLabel : '???'}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 px-3 py-2.5">
                <div className="font-pixel-arcade text-[8px] text-slate-400 mb-1">
                  {selectedEntry.trackDefeats ? 'DEFEATED' : isWildlife ? 'STATUS' : 'TYPE'}
                </div>
                <div className="font-pixel-arcade text-[10px] sm:text-[11px] text-amber-300 tabular-nums">
                  {!isSelectedUnlocked
                    ? '—'
                    : selectedEntry.trackDefeats
                      ? `${defeatCount}`
                      : isWildlife
                        ? 'FRIENDLY'
                        : 'STAGE TRAP'}
                </div>
              </div>
            </div>

            {/* Lore & Notes OR Discovery Hint */}
            {isSelectedUnlocked ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 font-pixel-arcade text-[10px] text-yellow-300 mb-1.5">
                    {isWildlife ? (
                      <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Skull className="w-3.5 h-3.5 text-yellow-400" />
                    )}
                    <span>FIELD LORE</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 font-body leading-relaxed">
                    {selectedEntry.lore}
                  </p>
                </div>

                {selectedEntry.hasBabyForm && selectedEntry.babyDescription && (
                  <div className="bg-emerald-950/35 border border-emerald-700/60 p-3.5">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-pixel-arcade text-[10px] text-emerald-300">
                        BABY FORM · {(selectedEntry.babyName || 'JUVENILE').toUpperCase()}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowBabyForm(prev => !prev)}
                        className="font-pixel-arcade text-[8px] text-yellow-300 hover:text-yellow-200 underline underline-offset-2 cursor-pointer"
                      >
                        {showBabyForm ? 'VIEW ADULT' : 'PREVIEW BABY'}
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 font-body leading-relaxed">
                      {selectedEntry.babyDescription}
                    </p>
                  </div>
                )}

                <div className="bg-slate-900/90 border border-slate-700 p-3.5">
                  <div className="flex items-center gap-2 font-pixel-arcade text-[10px] text-emerald-300 mb-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {isWildlife ? "SILKIE SAM'S FIELD NOTE" : "SILKIE SAM'S BATTLE NOTE"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 font-body leading-relaxed">
                    {selectedEntry.combatTip}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-700 p-4 space-y-2.5">
                <div className="flex items-center gap-2 font-pixel-arcade text-[10px] text-amber-300">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>ENTRY LOCKED — NOT YET ENCOUNTERED</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-body leading-relaxed">
                  {selectedEntry.discoveryHint}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-body pt-1">
                  <Compass className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>
                    Current frontier: Stage {saveData.unlockedLevel || 1} of 30
                  </span>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <footer className="px-4 sm:px-5 py-3 bg-slate-900 border-t-2 border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onReturnToMenu}
            className="w-full min-h-[42px] py-2.5 px-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 text-slate-950 font-pixel-arcade font-bold text-xs tracking-wider border-2 border-amber-600 shadow-[0_4px_0_#78350f] active:translate-y-1 active:shadow-[0_1px_0_#78350f] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            ← RETURN TO MAIN MENU
          </button>
        </footer>
      </div>
    </div>
  );
};
