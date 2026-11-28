import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Lock,
  Shield,
  Skull,
  Compass,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Volume2,
  Footprints,
  FlipHorizontal2,
  Pause,
  Play,
  Shuffle,
  Sparkles,
  Crosshair,
  MapPin,
  Eye,
} from 'lucide-react';
import {
  BESTIARY_ENTRIES,
  BestiaryCategory,
  BestiaryEntry,
  BestiaryEntryId,
  getEncounteredBestiarySet,
} from '../game/bestiary';
import { GameRenderer } from '../game/renderer';
import { audio } from '../game/audio';
import {
  BoulderHazard,
  Camera,
  CockatriceBoss,
  SaveData,
  SeaFishSpecies,
  ThundercloudHazard,
  VolcanoHazard,
} from '../game/types';

interface BestiaryViewProps {
  saveData: SaveData;
  onReturnToMenu: () => void;
}

type FilterTab = 'all' | BestiaryCategory;
type FarmerPreviewPose = 'patrol' | 'lunge' | 'injured';

const BestiarySpriteCanvas: React.FC<{
  entryId: BestiaryEntryId;
  unlocked: boolean;
  variant: 'thumb' | 'hero';
  colorVariantIndex?: number;
  isBaby?: boolean;
  flipped?: boolean;
  paused?: boolean;
  farmerPose?: FarmerPreviewPose;
}> = ({
  entryId,
  unlocked,
  variant,
  colorVariantIndex = 0,
  isBaby = false,
  flipped = false,
  paused = false,
  farmerPose = 'patrol',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frozenTimeRef = useRef<number>(0);
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
    const startTime = performance.now() - frozenTimeRef.current * 1000;

    const renderAt = (time: number) => {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.imageSmoothingEnabled = false;

      if (entryId === 'wolf') {
        const scale = variant === 'hero' ? 3.2 : 0.95;
        ctx.save();
        ctx.translate(width / 2, height / 2 + (variant === 'hero' ? 12 : 4));
        renderer.drawWolfSprite(ctx, 36, 24, flipped, time * 1.15, scale, colorVariantIndex);
        ctx.restore();
      } else if (entryId === 'fox') {
        const scale = variant === 'hero' ? 3.2 : 0.95;
        ctx.save();
        ctx.translate(width / 2, height / 2 + (variant === 'hero' ? 14 : 4));
        renderer.drawFoxSprite(ctx, 38, 22, flipped, time * 1.5, scale, colorVariantIndex);
        ctx.restore();
      } else if (entryId === 'snake') {
        const scale = variant === 'hero' ? 3.4 : 1.05;
        ctx.save();
        ctx.translate(width / 2, height / 2 + (variant === 'hero' ? 22 : 6));
        renderer.drawSnakeSprite(ctx, 38, 14, flipped, time * 1.4, scale, colorVariantIndex);
        ctx.restore();
      } else if (entryId === 'bear') {
        const scale = variant === 'hero' ? 2.6 : 0.8;
        ctx.save();
        ctx.translate(width / 2, height / 2 + (variant === 'hero' ? 12 : 3));
        renderer.drawBearSprite(ctx, 48, 36, flipped, time * 0.95, scale, colorVariantIndex);
        ctx.restore();
      } else if (entryId === 'farmer') {
        const scale = variant === 'hero' ? 1.85 : 0.56;
        const activePose = variant === 'hero' ? farmerPose : 'patrol';
        ctx.save();
        ctx.translate(width / 2, height / 2 + (variant === 'hero' ? 10 : 3));
        renderer.drawFarmerSprite(
          ctx,
          44,
          62,
          flipped,
          time * 1.15,
          scale,
          activePose,
          activePose === 'injured',
          activePose !== 'injured'
        );
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
          facing: flipped ? 'left' : 'right',
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
          y: 30,
          width: 54,
          height: 44,
          state: isErupting ? 'erupting' : isWarning ? 'warning' : 'cooldown',
          timer: cycle,
          warningDuration: 1.2,
          eruptionDuration: 1.6,
          cooldownDuration: 0.8,
          lavaParticles,
          styleVariant: variant === 'hero' ? colorVariantIndex % 3 : 1,
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
          radius: 18,
          vx: 0,
          vy: 0,
          startX: 30,
          startY: 30,
          isFalling: false,
          isRolling: true,
          warningTimer: 0,
          respawnTimer: 0,
          rotation: (flipped ? -1 : 1) * time * 2.1,
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
          styleVariant: 0,
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
          {
            facing: flipped ? 'left' : 'right',
            scale,
            isLamb: isBaby,
            animOffset: 0.8,
            variantIndex: colorVariantIndex,
          }
        );
      } else if (entryId === 'monkey') {
        const s = variant === 'hero' ? (isBaby ? 3.45 : 3.0) : 0.98;
        const cx = width / 2;
        const cy = height / 2 + (variant === 'hero' ? 12 : 4);
        const branchY = cy + (isBaby ? 7.2 : 9.6) * s;
        const branchHalfW = (variant === 'hero' ? 54 : 18);
        const branchH = Math.max(4, Math.round(3.6 * s));

        // Crisp high-res jungle perch branch behind monkey feet
        ctx.save();
        ctx.fillStyle = '#09090b';
        ctx.fillRect(Math.round(cx - branchHalfW - 2), Math.round(branchY - 1.5), branchHalfW * 2 + 4, branchH + 3);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(Math.round(cx - branchHalfW), Math.round(branchY), branchHalfW * 2, branchH);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(Math.round(cx - branchHalfW + 3), Math.round(branchY), branchHalfW * 2 - 6, Math.max(2, Math.round(branchH * 0.48)));
        ctx.restore();

        renderer.renderJungleMonkey(cx, cy, time, false, 1, false, colorVariantIndex, {
          isBaby,
          activity: 'squeak',
          facingDir: flipped ? -1 : 1,
          skipBranchOffset: true,
          scale: s,
          hideChirpText: true,
        });
      } else if (entryId === 'hare') {
        const scale = variant === 'hero' ? (isBaby ? 3.5 : 3.2) : 1.0;
        ctx.save();
        ctx.translate(width / 2, height / 2 + (variant === 'hero' ? 24 : 8));
        renderer.drawSnowshoeHareSprite(ctx, time, scale, flipped, colorVariantIndex, isBaby, 'eat');
        ctx.restore();
      } else if (entryId === 'butterfly') {
        const scale = variant === 'hero' ? 4.4 : 1.45;
        ctx.save();
        ctx.translate(width / 2, height / 2 + (variant === 'hero' ? 2 : 1));
        if (flipped) ctx.scale(-1, 1);
        renderer.drawButterflySprite(ctx, time, scale, colorVariantIndex);
        ctx.restore();
      } else if (entryId === 'dragonfly') {
        const scale = variant === 'hero' ? 4.0 : 1.3;
        ctx.save();
        ctx.translate(width / 2, height / 2 - (variant === 'hero' ? 4 : 1));
        if (flipped) ctx.scale(-1, 1);
        renderer.drawDragonflySprite(ctx, time, scale, colorVariantIndex);
        ctx.restore();
      } else if (entryId === 'honeybee') {
        const scale = variant === 'hero' ? 4.6 : 1.5;
        ctx.save();
        ctx.translate(width / 2, height / 2 + (variant === 'hero' ? 4 : 2));
        if (flipped) ctx.scale(-1, 1);
        renderer.drawHoneybeeSprite(ctx, time, scale, colorVariantIndex);
        ctx.restore();
      } else if (entryId === 'ladybug') {
        const scale = variant === 'hero' ? 4.8 : 1.55;
        ctx.save();
        ctx.translate(width / 2, height / 2 + (variant === 'hero' ? 18 : 6));
        if (flipped) ctx.scale(-1, 1);
        renderer.drawLadybugSprite(ctx, time, scale, colorVariantIndex);
        ctx.restore();
      } else if (entryId === 'falcon') {
        const scale = variant === 'hero' ? 2.85 : 0.9;
        ctx.save();
        ctx.translate(width / 2, height / 2 + (variant === 'hero' ? 4 : 1));
        renderer.drawFalconSprite(ctx, 54, 36, flipped, time * 1.1, scale, colorVariantIndex, false);
        ctx.restore();
      } else if (entryId === 'shark') {
        const scale = variant === 'hero' ? 2.75 : 0.86;
        ctx.save();
        ctx.translate(width / 2, height / 2 + (variant === 'hero' ? 6 : 2));
        renderer.drawSharkSprite(ctx, time * 1.15, scale, flipped, colorVariantIndex, true);
        ctx.restore();
      } else if (entryId === 'sand_cat') {
        const scale = variant === 'hero' ? (isBaby ? 3.5 : 3.2) : 1.0;
        ctx.save();
        ctx.translate(width / 2, height / 2 + (variant === 'hero' ? 26 : 8));
        renderer.drawSandCatSprite(ctx, time * 1.2, scale, flipped, colorVariantIndex, isBaby, 'walk');
        ctx.restore();
      } else if (entryId === 'seagull') {
        const scale = variant === 'hero' ? 3.2 : 1.0;
        const previewSpecies: SeaFishSpecies[] = ['clownfish', 'blue_tang', 'red_snapper', 'golden_angelfish', 'silver_mackerel'];
        ctx.save();
        ctx.translate(width / 2, height / 2 + (variant === 'hero' ? 8 : 2));
        renderer.drawSeagullSprite(
          ctx,
          time * 1.15,
          scale,
          flipped,
          colorVariantIndex,
          'carrying_fish',
          true,
          previewSpecies[Math.abs(colorVariantIndex) % previewSpecies.length]
        );
        ctx.restore();
      } else if (entryId === 'sea_fish') {
        const scale = variant === 'hero' ? 4.2 : 1.32;
        const speciesList: SeaFishSpecies[] = ['clownfish', 'blue_tang', 'red_snapper', 'golden_angelfish', 'silver_mackerel'];
        const sp = speciesList[Math.abs(colorVariantIndex) % speciesList.length];
        ctx.save();
        ctx.translate(width / 2, height / 2 + (variant === 'hero' ? 4 : 2));
        renderer.drawSeaFishSprite(ctx, sp, time * 1.1, scale, flipped);
        ctx.restore();
      } else if (entryId === 'rock_crab') {
        const scale = variant === 'hero' ? 4.1 : 1.3;
        ctx.save();
        ctx.translate(width / 2, height / 2 + (variant === 'hero' ? 20 : 8));
        if (flipped) ctx.scale(-1, 1);
        renderer.drawRockCrabSprite(ctx, time, scale, colorVariantIndex);
        ctx.restore();
      } else if (entryId === 'sea_starfish') {
        const scale = variant === 'hero' ? 4.4 : 1.45;
        ctx.save();
        ctx.translate(width / 2, height / 2 + (variant === 'hero' ? 4 : 2));
        ctx.rotate(Math.sin(time * 1.4) * 0.08);
        renderer.drawStarfishSprite(ctx, time, scale, colorVariantIndex);
        ctx.restore();
      } else if (
        entryId === 'desert_cactus' ||
        entryId === 'grass_wildflower' ||
        entryId === 'meadow_sunflower' ||
        entryId === 'meadow_oak_tree' ||
        entryId === 'jungle_palm' ||
        entryId === 'jungle_fern' ||
        entryId === 'pine_evergreen' ||
        entryId === 'volcanic_ember_bush' ||
        entryId === 'desert_oasis_shrub' ||
        entryId === 'coastal_tree' ||
        entryId === 'sea_kelp_coral'
      ) {
        const scale = variant === 'hero' ? 2.45 : 0.78;
        ctx.save();
        ctx.translate(width / 2, height / 2 + (variant === 'hero' ? 56 : 18));
        if (flipped) ctx.scale(-1, 1);
        renderer.drawPlantSprite(ctx, entryId, time, scale, colorVariantIndex);
        ctx.restore();
      }

      // Apply clean dark shadow silhouette for unencountered entries
      if (!unlocked) {
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = variant === 'hero' ? '#0f172a' : '#1e293b';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.restore();
    };

    if (paused) {
      renderAt(frozenTimeRef.current);
      return;
    }

    const drawFrame = (now: number) => {
      const time = (now - startTime) / 1000;
      frozenTimeRef.current = time;
      renderAt(time);
      rafId = requestAnimationFrame(drawFrame);
    };

    rafId = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(rafId);
  }, [entryId, unlocked, variant, width, height, colorVariantIndex, isBaby, flipped, paused, farmerPose]);

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
  const [unlockedOnly, setUnlockedOnly] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<BestiaryEntryId>(() => {
    const firstDiscovered = BESTIARY_ENTRIES.find(e => discoveredSet.has(e.id));
    return firstDiscovered ? firstDiscovered.id : BESTIARY_ENTRIES[0].id;
  });
  const [selectedMorphIndex, setSelectedMorphIndex] = useState<number>(0);
  const [showBabyForm, setShowBabyForm] = useState<boolean>(false);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [farmerPose, setFarmerPose] = useState<FarmerPreviewPose>('patrol');
  const [soundPulse, setSoundPulse] = useState<boolean>(false);

  // Reset per-entry interactive controls when switching entries
  useEffect(() => {
    setSelectedMorphIndex(0);
    setShowBabyForm(false);
    setIsFlipped(false);
    setIsPaused(false);
    setFarmerPose('patrol');
  }, [selectedId]);

  const filteredEntries = useMemo(() => {
    let list =
      activeFilter === 'all'
        ? BESTIARY_ENTRIES
        : BESTIARY_ENTRIES.filter(entry => entry.category === activeFilter);
    if (unlockedOnly) {
      const onlyUnlocked = list.filter(entry => discoveredSet.has(entry.id));
      if (onlyUnlocked.length > 0) list = onlyUnlocked;
    }
    return list;
  }, [activeFilter, unlockedOnly, discoveredSet]);

  const selectedEntry: BestiaryEntry = useMemo(() => {
    return (
      filteredEntries.find(e => e.id === selectedId) ||
      filteredEntries[0] ||
      BESTIARY_ENTRIES[0]
    );
  }, [filteredEntries, selectedId]);

  const currentFilteredIdx = useMemo(
    () => Math.max(0, filteredEntries.findIndex(e => e.id === selectedEntry.id)),
    [filteredEntries, selectedEntry.id]
  );

  const handleStepEntry = useCallback(
    (delta: number) => {
      if (filteredEntries.length <= 1) return;
      const nextIdx = (currentFilteredIdx + delta + filteredEntries.length) % filteredEntries.length;
      setSelectedId(filteredEntries[nextIdx].id);
    },
    [filteredEntries, currentFilteredIdx]
  );

  const handleRandomEntry = useCallback(() => {
    const pool = filteredEntries.filter(e => e.id !== selectedEntry.id);
    if (pool.length === 0) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setSelectedId(pick.id);
  }, [filteredEntries, selectedEntry.id]);

  // Keyboard shortcuts: Escape to close, Left/Right arrows to browse entries
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onReturnToMenu();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleStepEntry(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleStepEntry(-1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onReturnToMenu, handleStepEntry]);

  const isSelectedUnlocked = discoveredSet.has(selectedEntry.id);
  const isWildlife = selectedEntry.category === 'wildlife';
  const isPlant = selectedEntry.category === 'plant';
  const isPeacefulEntry = isWildlife || (isPlant && selectedEntry.dangerRating === 0);
  const selectedIndex = BESTIARY_ENTRIES.findIndex(e => e.id === selectedEntry.id) + 1;
  const defeatCount = saveData.enemyDefeatCounts?.[selectedEntry.id] || 0;
  const hasStepSound = selectedEntry.category === 'creature' || selectedEntry.category === 'boss';

  const triggerSoundPulse = () => {
    setSoundPulse(true);
    setTimeout(() => setSoundPulse(false), 260);
  };

  const handlePlayEntrySound = () => {
    if (!isSelectedUnlocked) return;
    triggerSoundPulse();
    switch (selectedEntry.id) {
      case 'wolf':
        audio.playWolfHowl();
        break;
      case 'fox':
        audio.playFoxBark();
        break;
      case 'snake':
        audio.playSnakeHiss();
        break;
      case 'bear':
        audio.playBearRoar();
        break;
      case 'farmer':
        audio.playFarmerSpeech(farmerPose === 'injured' ? 'ouch' : farmerPose === 'lunge' ? 'rematch' : 'gruff');
        break;
      case 'cockatrice':
        audio.playCockatriceScreech();
        break;
      case 'volcano':
        audio.playVolcanoEruption();
        break;
      case 'boulder':
        audio.playBoulderRumble();
        break;
      case 'thundercloud':
        audio.playLightning();
        break;
      case 'sheep':
        audio.playWildlifeChime('sheep');
        break;
      case 'monkey':
        audio.playWildlifeChime('monkey');
        break;
      case 'hare':
        audio.playWildlifeChime('hare');
        break;
      case 'falcon':
        audio.playFalconScreech();
        break;
      case 'shark':
        audio.playSharkLunge();
        break;
      case 'sand_cat':
        audio.playWildlifeChime('sand_cat');
        break;
      case 'seagull':
        audio.playWildlifeChime('seagull');
        break;
      case 'sea_fish':
      case 'rock_crab':
      case 'sea_starfish':
        audio.playWildlifeChime('seagull');
        break;
      case 'desert_cactus':
        audio.playCactusPrick();
        break;
      case 'grass_wildflower':
      case 'meadow_sunflower':
      case 'meadow_oak_tree':
      case 'jungle_palm':
      case 'jungle_fern':
      case 'pine_evergreen':
      case 'volcanic_ember_bush':
      case 'desert_oasis_shrub':
      case 'coastal_tree':
      case 'sea_kelp_coral':
        audio.playPlantRustle();
        break;
      default:
        audio.playWildlifeChime('insect');
        break;
    }
  };

  const handlePlayMovementSound = () => {
    if (!isSelectedUnlocked || !hasStepSound) return;
    triggerSoundPulse();
    if (selectedEntry.id === 'wolf') audio.playEnemyStep('wolf', 1.0, 'grass');
    else if (selectedEntry.id === 'fox') audio.playEnemyStep('fox', 1.0, 'jungle');
    else if (selectedEntry.id === 'snake') audio.playEnemyStep('snake', 1.0, 'jungle');
    else if (selectedEntry.id === 'bear') audio.playEnemyStep('bear', 1.0, 'snow');
    else if (selectedEntry.id === 'falcon') audio.playFalconScreech();
    else if (selectedEntry.id === 'shark') audio.playSharkLunge();
    else if (selectedEntry.id === 'farmer') audio.playFarmerStep(farmerPose === 'lunge', 1.0);
    else if (selectedEntry.id === 'cockatrice') audio.playBossStep(true, 1.0);
  };

  const filterCounts = useMemo(
    () => ({
      all: BESTIARY_ENTRIES.length,
      creature: BESTIARY_ENTRIES.filter(e => e.category === 'creature').length,
      boss: BESTIARY_ENTRIES.filter(e => e.category === 'boss').length,
      hazard: BESTIARY_ENTRIES.filter(e => e.category === 'hazard').length,
      wildlife: BESTIARY_ENTRIES.filter(e => e.category === 'wildlife').length,
      plant: BESTIARY_ENTRIES.filter(e => e.category === 'plant').length,
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
    if (cat === 'plant') return 'Plant';
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
                  {discoveredSet.size}/{BESTIARY_ENTRIES.length} ({Math.round((discoveredSet.size / BESTIARY_ENTRIES.length) * 100)}%)
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

        {/* Category Filter Tabs + Unlocked-Only Toggle */}
        <div
          role="tablist"
          aria-label="Bestiary categories"
          className="px-4 sm:px-5 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto shrink-0"
        >
          <div className="flex items-center gap-2">
            {(
              [
                { id: 'all', label: `ALL (${filterCounts.all})` },
                { id: 'creature', label: `ENEMIES (${filterCounts.creature})` },
                { id: 'boss', label: `BOSS (${filterCounts.boss})` },
                { id: 'hazard', label: `HAZARDS (${filterCounts.hazard})` },
                { id: 'wildlife', label: `WILDLIFE (${filterCounts.wildlife})` },
                { id: 'plant', label: `PLANTS (${filterCounts.plant})` },
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
                  className={`min-h-[34px] px-2.5 sm:px-3 py-1 font-pixel-arcade text-[9px] sm:text-[10px] tracking-wide border-2 whitespace-nowrap cursor-pointer transition-colors ${
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

          <button
            type="button"
            onClick={() => setUnlockedOnly(prev => !prev)}
            className={`min-h-[34px] px-2.5 py-1 font-pixel-arcade text-[8px] sm:text-[9px] border-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors ${
              unlockedOnly
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200'
            }`}
            title="Show only discovered entries"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{unlockedOnly ? 'FOUND ONLY' : 'SHOW ALL'}</span>
          </button>
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
              className={`relative w-full h-44 sm:h-52 border-2 overflow-hidden flex flex-col items-center justify-center mb-3 transition-colors ${
                soundPulse ? 'border-yellow-300' : 'border-slate-800'
              }`}
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
                  flipped={isFlipped}
                  paused={isPaused}
                  farmerPose={farmerPose}
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

            {/* Interactive Showcase Buttons (Sound, Step/Slither, Flip, Pause/Play) */}
            {isSelectedUnlocked && (
              <div className="mb-3.5 flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePlayEntrySound}
                  className="min-h-[34px] px-3 py-1 bg-amber-500/15 hover:bg-amber-500/25 active:translate-y-0.5 text-yellow-300 border-2 border-amber-500/70 font-pixel-arcade text-[8px] sm:text-[9px] flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>
                    {selectedEntry.category === 'hazard'
                      ? 'HAZARD SFX'
                      : isPlant
                        ? selectedEntry.id === 'desert_cactus'
                          ? 'PRICK SFX'
                          : 'FLORA SFX'
                        : 'PLAY VOICE'}
                  </span>
                </button>

                {hasStepSound && (
                  <button
                    type="button"
                    onClick={handlePlayMovementSound}
                    className="min-h-[34px] px-3 py-1 bg-sky-500/15 hover:bg-sky-500/25 active:translate-y-0.5 text-sky-300 border-2 border-sky-500/60 font-pixel-arcade text-[8px] sm:text-[9px] flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Footprints className="w-3.5 h-3.5" />
                    <span>{selectedEntry.id === 'snake' ? 'SLITHER SFX' : 'STEP SFX'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsFlipped(prev => !prev)}
                  className={`min-h-[34px] px-2.5 py-1 border-2 font-pixel-arcade text-[8px] sm:text-[9px] flex items-center gap-1.5 cursor-pointer transition-all ${
                    isFlipped
                      ? 'bg-slate-800 text-yellow-200 border-yellow-400/70'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-slate-100'
                  }`}
                >
                  <FlipHorizontal2 className="w-3.5 h-3.5" />
                  <span>FLIP</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPaused(prev => !prev)}
                  className={`min-h-[34px] px-2.5 py-1 border-2 font-pixel-arcade text-[8px] sm:text-[9px] flex items-center gap-1.5 cursor-pointer transition-all ${
                    isPaused
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/70'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-slate-100'
                  }`}
                >
                  {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  <span>{isPaused ? 'RESUME' : 'FREEZE'}</span>
                </button>
              </div>
            )}

            {/* Farmer Jed Encounter Pose Switcher */}
            {isSelectedUnlocked && selectedEntry.id === 'farmer' && (
              <div className="mb-3 bg-slate-900/90 border border-slate-800 p-2.5 flex flex-wrap items-center justify-between gap-2">
                <div className="font-pixel-arcade text-[8px] text-slate-400 tracking-wider">
                  ENCOUNTER POSE PREVIEW
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      { id: 'patrol', label: 'PATROL' },
                      { id: 'lunge', label: 'ADULT LUNGE' },
                      { id: 'injured', label: 'INJURED SHIN' },
                    ] as { id: FarmerPreviewPose; label: string }[]
                  ).map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setFarmerPose(p.id)}
                      className={`min-h-[32px] px-2.5 py-1 border-2 font-pixel-arcade text-[8px] cursor-pointer transition-all ${
                        farmerPose === p.id
                          ? 'bg-yellow-400 text-slate-950 border-amber-600 font-bold'
                          : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Adult / Baby Life Stage Switcher (for wildlife mammals with babies) */}
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

            {/* Interactive Natural Color / Breed / Hazard Style Selector */}
            {isSelectedUnlocked && selectedEntry.colorVariants && selectedEntry.colorVariants.length > 0 && (
              <div className="mb-4 bg-slate-900/90 border border-slate-800 p-2.5">
                <div className="font-pixel-arcade text-[8px] text-slate-400 mb-2 tracking-wider">
                  {selectedEntry.category === 'hazard'
                    ? 'HAZARD STYLE & PALETTE VARIANTS'
                    : isPlant
                      ? 'BOTANICAL SPECIES & VARIATIONS'
                      : 'NATURAL COAT & SPECIES VARIATIONS'}
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
                      : isPlant
                        ? 'UNDISCOVERED PLANT'
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
                  : isPlant
                    ? 'Explore its native biome during your journey to log this plant in your botanical field journal.'
                    : isWildlife
                      ? 'Explore its biome during your journey to log this background animal in your field journal.'
                      : 'Cross paths with this enemy during your journey to record its pixel portrait and lore.'}
              </p>
            </div>

            {/* Combat / Wildlife / Plant Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              <div className="bg-slate-900 border border-slate-800 px-3 py-2.5">
                <div className="font-pixel-arcade text-[8px] text-slate-400 mb-1">
                  {isPlant ? 'FLORA TYPE' : isWildlife ? 'NATURE' : 'HEALTH'}
                </div>
                <div
                  className={`font-pixel-arcade text-[10px] sm:text-[11px] tabular-nums ${
                    isPeacefulEntry ? 'text-emerald-300' : isPlant ? 'text-lime-300' : 'text-slate-100'
                  }`}
                >
                  {isSelectedUnlocked ? selectedEntry.hpLabel : '???'}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 px-3 py-2.5">
                <div className="font-pixel-arcade text-[8px] text-slate-400 mb-1">
                  {isPlant ? 'THORNS' : isWildlife ? 'DANGER' : 'DAMAGE'}
                </div>
                <div
                  className={`font-pixel-arcade text-[10px] sm:text-[11px] tabular-nums ${
                    isPeacefulEntry ? 'text-slate-200' : 'text-rose-300'
                  }`}
                >
                  {isSelectedUnlocked ? selectedEntry.damageLabel : '???'}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 px-3 py-2.5">
                <div className="font-pixel-arcade text-[8px] text-slate-400 mb-1">
                  {isPlant ? 'GROWTH' : isWildlife ? 'HABIT' : 'TEMPO'}
                </div>
                <div className="font-pixel-arcade text-[10px] sm:text-[11px] text-sky-300">
                  {isSelectedUnlocked ? selectedEntry.speedLabel : '???'}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 px-3 py-2.5">
                <div className="font-pixel-arcade text-[8px] text-slate-400 mb-1">
                  {selectedEntry.trackDefeats ? 'DEFEATED' : isPlant || isWildlife ? 'STATUS' : 'TYPE'}
                </div>
                <div className="font-pixel-arcade text-[10px] sm:text-[11px] text-amber-300 tabular-nums">
                  {!isSelectedUnlocked
                    ? '—'
                    : selectedEntry.trackDefeats
                      ? `${defeatCount}`
                      : isPlant
                        ? selectedEntry.dangerRating > 0
                          ? 'PRICKLY'
                          : 'BOTANICAL'
                        : isWildlife
                          ? 'FRIENDLY'
                          : 'STAGE TRAP'}
                </div>
              </div>
            </div>

            {/* Lore & Expanded Field Dossier OR Discovery Hint */}
            {isSelectedUnlocked ? (
              <div className="space-y-4">
                {/* Detailed Dossier Matrix: Danger Rating, Size Class, Native Biomes, Special Trait, Weakness & Behavior */}
                <div className="bg-slate-900/95 border border-slate-800 p-3.5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-pixel-arcade text-[8px] text-slate-400">THREAT LEVEL</span>
                      {selectedEntry.dangerRating === 0 ? (
                        <span className="font-pixel-arcade text-[8px] text-emerald-300 bg-emerald-950/70 border border-emerald-700/60 px-2 py-0.5">
                          HARMLESS
                        </span>
                      ) : (
                        <div className="flex items-center gap-1" aria-label={`Danger rating ${selectedEntry.dangerRating} out of 5`}>
                          {[1, 2, 3, 4, 5].map(pip => (
                            <span
                              key={pip}
                              className={`w-3.5 h-2.5 border ${
                                pip <= selectedEntry.dangerRating
                                  ? selectedEntry.dangerRating >= 4
                                    ? 'bg-rose-500 border-rose-300'
                                    : 'bg-amber-400 border-yellow-200'
                                  : 'bg-slate-950 border-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="font-pixel-arcade text-[8px] text-slate-300">
                      {selectedEntry.scaleClass.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-body">
                    <div>
                      <div className="flex items-center gap-1.5 font-pixel-arcade text-[8px] text-sky-300 mb-1">
                        <MapPin className="w-3 h-3" />
                        <span>NATIVE BIOMES</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedEntry.biomes.map(b => (
                          <span
                            key={b}
                            className="px-2 py-0.5 bg-slate-950 border border-slate-700 text-[11px] text-slate-200"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 font-pixel-arcade text-[8px] text-amber-300 mb-1">
                        <Sparkles className="w-3 h-3" />
                        <span>SPECIAL TRAIT</span>
                      </div>
                      <p className="text-slate-300 leading-snug">{selectedEntry.specialAbility}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 font-pixel-arcade text-[8px] text-emerald-300 mb-1">
                        <Crosshair className="w-3 h-3" />
                        <span>{isPeacefulEntry ? 'FIELD OBSERVATION' : 'WEAKNESS & COUNTER'}</span>
                      </div>
                      <p className="text-slate-300 leading-snug">{selectedEntry.weakness}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 font-pixel-arcade text-[8px] text-violet-300 mb-1">
                        <Footprints className="w-3 h-3" />
                        <span>{isPlant ? 'GROWTH & HABITAT' : 'MOVEMENT & BEHAVIOR'}</span>
                      </div>
                      <p className="text-slate-300 leading-snug">{selectedEntry.behavior}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 font-pixel-arcade text-[10px] text-yellow-300 mb-1.5">
                    {isWildlife || isPlant ? (
                      <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Skull className="w-3.5 h-3.5 text-yellow-400" />
                    )}
                    <span>{isPlant ? 'BOTANICAL LORE' : 'FIELD LORE'}</span>
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
                      {isPeacefulEntry ? "SILKIE SAM'S FIELD NOTE" : "SILKIE SAM'S BATTLE NOTE"}
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
                    Current frontier: Stage {saveData.unlockedLevel || 1} of 40
                  </span>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Footer with Quick Navigation Buttons (Prev, Random, Next) & Main Menu */}
        <footer className="px-4 sm:px-5 py-3 bg-slate-900 border-t-2 border-slate-800 shrink-0 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleStepEntry(-1)}
              className="min-h-[42px] px-3 bg-slate-800 hover:bg-slate-700 active:translate-y-0.5 text-slate-200 border-2 border-slate-600 shadow-[0_3px_0_#0f172a] font-pixel-arcade text-[9px] flex items-center gap-1 cursor-pointer transition-all"
              title="Previous entry (Left Arrow)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PREV</span>
            </button>
            <button
              type="button"
              onClick={handleRandomEntry}
              className="min-h-[42px] px-3 bg-slate-800 hover:bg-slate-700 active:translate-y-0.5 text-sky-300 border-2 border-slate-600 shadow-[0_3px_0_#0f172a] font-pixel-arcade text-[9px] flex items-center gap-1.5 cursor-pointer transition-all"
              title="Jump to a random Bestiary entry"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">RANDOM</span>
            </button>
            <button
              type="button"
              onClick={() => handleStepEntry(1)}
              className="min-h-[42px] px-3 bg-slate-800 hover:bg-slate-700 active:translate-y-0.5 text-slate-200 border-2 border-slate-600 shadow-[0_3px_0_#0f172a] font-pixel-arcade text-[9px] flex items-center gap-1 cursor-pointer transition-all"
              title="Next entry (Right Arrow)"
            >
              <span className="hidden sm:inline">NEXT</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onReturnToMenu}
            className="flex-1 min-h-[42px] py-2.5 px-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 text-slate-950 font-pixel-arcade font-bold text-xs tracking-wider border-2 border-amber-600 shadow-[0_4px_0_#78350f] active:translate-y-1 active:shadow-[0_1px_0_#78350f] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            ← RETURN TO MAIN MENU
          </button>
        </footer>
      </div>
    </div>
  );
};
