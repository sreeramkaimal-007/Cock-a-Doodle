import React, { useState, useMemo, useEffect } from 'react';
import { Compass, Lock, Check, ChevronDown, ChevronUp, ArrowRight, X } from 'lucide-react';
import { LEVELS } from '../game/levels';
import { audio } from '../game/audio';

interface FastTravelWorld {
  id: number;
  shortName: string;
  fullName: string;
  levels: number[];
  rangeLabel: string;
  accentText: string;
  activeBorder: string;
  activeBg: string;
}

const FAST_TRAVEL_WORLDS: FastTravelWorld[] = [
  {
    id: 1,
    shortName: 'The Start',
    fullName: 'World 1: The Start',
    levels: [1, 2, 3, 4, 5],
    rangeLabel: '1-5',
    accentText: 'text-amber-300',
    activeBorder: 'border-amber-400',
    activeBg: 'bg-amber-950/50',
  },
  {
    id: 2,
    shortName: 'Adventure',
    fullName: 'World 2: The Adventure Starts',
    levels: [6, 7, 8, 9],
    rangeLabel: '6-9',
    accentText: 'text-lime-300',
    activeBorder: 'border-lime-400',
    activeBg: 'bg-lime-950/50',
  },
  {
    id: 3,
    shortName: 'Heat Up',
    fullName: 'World 3: The Heat Up',
    levels: [10],
    rangeLabel: '10',
    accentText: 'text-orange-300',
    activeBorder: 'border-orange-400',
    activeBg: 'bg-orange-950/50',
  },
  {
    id: 4,
    shortName: 'Jungle',
    fullName: 'World 4: The Jungle Lands',
    levels: [11, 12, 13, 14, 15, 16, 17, 18, 19],
    rangeLabel: '11-19',
    accentText: 'text-emerald-300',
    activeBorder: 'border-emerald-400',
    activeBg: 'bg-emerald-950/50',
  },
  {
    id: 5,
    shortName: 'Arctic',
    fullName: 'World 5: The Arctic Lands',
    levels: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
    rangeLabel: '20-29',
    accentText: 'text-sky-300',
    activeBorder: 'border-sky-400',
    activeBg: 'bg-sky-950/50',
  },
  {
    id: 6,
    shortName: 'The Boss',
    fullName: 'World 6: The Boss',
    levels: [30],
    rangeLabel: '30',
    accentText: 'text-rose-300',
    activeBorder: 'border-rose-400',
    activeBg: 'bg-rose-950/50',
  },
  {
    id: 7,
    shortName: 'Desert',
    fullName: 'World 7: The Desert Lands',
    levels: [31, 32, 33, 34, 35],
    rangeLabel: '31-35',
    accentText: 'text-yellow-300',
    activeBorder: 'border-yellow-400',
    activeBg: 'bg-yellow-950/50',
  },
  {
    id: 8,
    shortName: 'Coast',
    fullName: 'World 8: Peckerin Coast',
    levels: [36, 37, 38, 39, 40],
    rangeLabel: '36-40',
    accentText: 'text-cyan-300',
    activeBorder: 'border-cyan-400',
    activeBg: 'bg-cyan-950/50',
  },
];

export interface FastTravelPanelProps {
  unlockedLevel: number;
  activeLevelId: number;
  hasCompletedGame: boolean;
  onJumpToLevel: (levelId: number) => void;
}

export const FastTravelPanel: React.FC<FastTravelPanelProps> = ({
  unlockedLevel,
  activeLevelId,
  hasCompletedGame,
  onJumpToLevel,
}) => {
  const maxUnlocked = Math.min(40, Math.max(1, unlockedLevel));
  const isBossDefeated = Boolean(hasCompletedGame);
  const sanitizeStage = (lvl: number) => {
    const clamped = Math.min(maxUnlocked, Math.max(1, lvl));
    if (isBossDefeated && clamped === 30) {
      return maxUnlocked >= 31 ? 31 : 29;
    }
    return clamped;
  };
  const initialStage = sanitizeStage(activeLevelId || maxUnlocked);

  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedStage, setSelectedStage] = useState<number>(initialStage);
  const [selectedWorldId, setSelectedWorldId] = useState<number | null>(null);
  const [hoveredStageId, setHoveredStageId] = useState<number | null>(null);

  useEffect(() => {
    setSelectedStage(prev => sanitizeStage(prev));
  }, [maxUnlocked, isBossDefeated]);

  const levelMap = useMemo(() => {
    const map = new Map<number, { title: string; worldName: string }>();
    for (const lvl of LEVELS) {
      map.set(lvl.id, { title: lvl.title, worldName: lvl.worldName });
    }
    return map;
  }, []);

  if (!hasCompletedGame) {
    return null;
  }

  const activeWorld = selectedWorldId !== null
    ? FAST_TRAVEL_WORLDS.find(w => w.id === selectedWorldId) ?? null
    : null;

  const handleWarp = (levelId: number) => {
    if (levelId < 1 || levelId > maxUnlocked) return;
    if (isBossDefeated && levelId === 30) return;
    audio.playCoin();
    onJumpToLevel(levelId);
  };

  const handleWorldClick = (world: FastTravelWorld) => {
    const firstLevel = world.levels[0];
    if (firstLevel > maxUnlocked) return;
    if (isBossDefeated && world.id === 6) return;

    if (world.levels.length === 1) {
      handleWarp(firstLevel);
      return;
    }

    if (selectedWorldId === world.id) {
      setSelectedWorldId(null);
    } else {
      setSelectedWorldId(world.id);
      setSelectedStage(firstLevel);
      setHoveredStageId(null);
    }
  };

  const previewStageId = hoveredStageId ?? activeWorld?.levels[0] ?? null;
  const previewLevelInfo = previewStageId ? levelMap.get(previewStageId) : null;

  return (
    <section
      aria-label="Fast Travel"
      className="w-full bg-slate-900/95 border-2 border-amber-400/80 shadow-[0_3px_0_#020617] text-left"
    >
      {/* Header Toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(prev => !prev)}
        aria-expanded={isExpanded}
        className="w-full min-h-[44px] px-3.5 py-2.5 flex items-center justify-between gap-2 hover:bg-slate-800/80 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300 focus-visible:-outline-offset-2"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Compass className="w-4 h-4 text-amber-400 stroke-[2.2] shrink-0" />
          <span className="font-pixel-arcade text-[10px] sm:text-[11px] text-yellow-300 font-bold whitespace-nowrap">
            FAST TRAVEL
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[8.5px] font-pixel-arcade text-slate-400 tabular-nums whitespace-nowrap">
            1-{maxUnlocked} / 40
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-amber-300 shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-amber-300 shrink-0" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-3.5 pb-3.5 pt-2.5 border-t border-slate-800 space-y-2.5">
          {/* Direct 1-40 Stage Jump Bar */}
          <div className="flex items-center gap-2">
            <label htmlFor="fast-travel-stage-select" className="sr-only">
              Select stage to fast travel
            </label>
            <select
              id="fast-travel-stage-select"
              value={selectedStage}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (!Number.isNaN(next)) {
                  setSelectedStage(next);
                }
              }}
              className="flex-1 min-w-0 min-h-[40px] px-2.5 py-1.5 bg-slate-950 border-2 border-slate-700 hover:border-amber-400/70 focus:border-amber-400 focus:outline-none text-slate-100 font-body text-xs font-medium truncate cursor-pointer"
            >
              {FAST_TRAVEL_WORLDS.map(world => {
                const unlockedInWorld = world.levels.filter(lvl => lvl <= maxUnlocked);
                if (unlockedInWorld.length === 0) return null;
                return (
                  <optgroup key={world.id} label={`${world.fullName} (${world.rangeLabel})`}>
                    {unlockedInWorld.map(lvl => {
                      const info = levelMap.get(lvl);
                      const isStageBossDone = isBossDefeated && lvl === 30;
                      return (
                        <option key={lvl} value={lvl} disabled={isStageBossDone}>
                          {isStageBossDone
                            ? `Stage ${lvl} — Defeated (Press New Run to Refight)`
                            : `Stage ${lvl} — ${info?.title ?? world.shortName}`}
                        </option>
                      );
                    })}
                  </optgroup>
                );
              })}
            </select>

            <button
              type="button"
              disabled={isBossDefeated && selectedStage === 30}
              onClick={() => handleWarp(selectedStage)}
              className="min-h-[40px] px-3.5 py-2 bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500 hover:from-yellow-200 hover:via-amber-300 hover:to-amber-400 disabled:opacity-45 disabled:cursor-not-allowed text-slate-950 font-pixel-arcade text-[10px] font-bold border-2 border-amber-700 shadow-[0_2px_0_#78350f] active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
            >
              <span>GO</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.6]" />
            </button>
          </div>

          {/* 8-World Quick Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {FAST_TRAVEL_WORLDS.map(world => {
              const isWorldUnlocked = world.levels[0] <= maxUnlocked;
              const isWorldBossDefeated = isBossDefeated && world.id === 6;
              const isDisabled = !isWorldUnlocked || isWorldBossDefeated;
              const isSelected = selectedWorldId === world.id;
              const isSingleStage = world.levels.length === 1;

              return (
                <button
                  key={world.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleWorldClick(world)}
                  title={
                    !isWorldUnlocked
                      ? `${world.fullName} (Locked)`
                      : isWorldBossDefeated
                        ? `${world.fullName} already defeated — press New Run to fight again`
                        : isSingleStage
                          ? `Jump straight to ${world.fullName} (Stage ${world.levels[0]})`
                          : `Select a stage in ${world.fullName} (${world.rangeLabel})`
                  }
                  className={`min-h-[44px] px-2 py-1.5 border-2 text-left transition-all flex flex-col justify-between focus-visible:outline-2 focus-visible:outline-amber-300 ${
                    isDisabled
                      ? 'bg-slate-950/70 border-slate-800/80 opacity-50 cursor-not-allowed'
                      : isSelected
                        ? `${world.activeBg} ${world.activeBorder} shadow-[0_2px_0_#020617] cursor-pointer`
                        : 'bg-slate-950/90 hover:bg-slate-800 border-slate-700 hover:border-amber-400/80 shadow-[0_2px_0_#020617] active:translate-y-0.5 active:shadow-none cursor-pointer'
                  }`}
                >
                  <div className="w-full flex items-center justify-between gap-1">
                    <span className={`font-pixel-arcade text-[8.5px] font-bold tabular-nums whitespace-nowrap ${!isDisabled ? world.accentText : 'text-slate-500'}`}>
                      W{world.id}
                    </span>
                    {!isWorldUnlocked ? (
                      <Lock className="w-2.5 h-2.5 text-slate-600 shrink-0" />
                    ) : isWorldBossDefeated ? (
                      <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                    ) : (
                      <span className="font-pixel-arcade text-[7.5px] text-slate-400 tabular-nums whitespace-nowrap">
                        {world.rangeLabel}
                      </span>
                    )}
                  </div>
                  <span className={`font-body text-[11px] font-semibold leading-tight truncate w-full ${!isDisabled ? 'text-slate-100' : 'text-slate-500'}`}>
                    {isWorldBossDefeated ? 'New Run' : world.shortName}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Inline Stage Picker Strip for Multi-Stage World */}
          {activeWorld && (
            <div className="pt-2.5 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className={`font-pixel-arcade text-[9px] font-bold truncate ${activeWorld.accentText}`}>
                    {activeWorld.fullName}
                  </div>
                  <div className="font-body text-[11px] text-slate-400 truncate">
                    {previewStageId && previewLevelInfo
                      ? `Stage ${previewStageId} · ${previewLevelInfo.title}`
                      : `Select a stage (${activeWorld.rangeLabel})`}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleWarp(activeWorld.levels[0])}
                    className="min-h-[32px] px-2.5 py-1 bg-slate-800 hover:bg-amber-400 hover:text-slate-950 border border-amber-400/70 text-amber-300 font-pixel-arcade text-[8px] font-bold transition-colors whitespace-nowrap cursor-pointer"
                  >
                    START W{activeWorld.id}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedWorldId(null)}
                    aria-label="Close world stages"
                    className="w-8 h-8 flex items-center justify-center bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {activeWorld.levels.map(lvlId => {
                  const isUnlocked = lvlId <= maxUnlocked;
                  const isCurrent = lvlId === activeLevelId;
                  return (
                    <button
                      key={lvlId}
                      type="button"
                      disabled={!isUnlocked}
                      onClick={() => handleWarp(lvlId)}
                      onMouseEnter={() => isUnlocked && setHoveredStageId(lvlId)}
                      onFocus={() => isUnlocked && setHoveredStageId(lvlId)}
                      title={
                        isUnlocked
                          ? `Jump to Stage ${lvlId}: ${levelMap.get(lvlId)?.title ?? ''}`
                          : `Stage ${lvlId} (Locked)`
                      }
                      className={`min-h-[40px] px-1.5 py-1.5 border-2 font-pixel-arcade text-[10px] font-bold tabular-nums transition-all flex items-center justify-center gap-1 focus-visible:outline-2 focus-visible:outline-amber-300 ${
                        !isUnlocked
                          ? 'bg-slate-950/70 border-slate-800/80 text-slate-600 opacity-50 cursor-not-allowed'
                          : isCurrent
                            ? 'bg-amber-400/20 hover:bg-amber-400 text-yellow-300 hover:text-slate-950 border-yellow-400 shadow-[0_2px_0_#020617] active:translate-y-0.5 active:shadow-none cursor-pointer'
                            : 'bg-slate-950 hover:bg-amber-400 text-slate-100 hover:text-slate-950 border-slate-700 hover:border-amber-300 shadow-[0_2px_0_#020617] active:translate-y-0.5 active:shadow-none cursor-pointer'
                      }`}
                    >
                      {!isUnlocked ? (
                        <Lock className="w-3 h-3 text-slate-600" />
                      ) : (
                        <span>{lvlId}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
