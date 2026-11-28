import React, { useEffect, useState } from 'react';
import { Trophy, Timer, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../game/firebase';

export interface BossRushScoreEntry {
  id: string;
  userId: string;
  playerName: string;
  clearTimeMs: number;
  difficulty: 'easy' | 'normal' | 'hard';
  gender: 'rooster' | 'hen';
  bonusCoins: number;
}

export function formatBossRushTime(ms: number): string {
  const safeMs = Math.max(0, Math.round(ms));
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hundredths = Math.floor((safeMs % 1000) / 10);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
}

export interface BossRushHighScoresProps {
  currentUser?: { uid?: string; emailVerified?: boolean } | null;
  defaultExpanded?: boolean;
}

export const BossRushHighScores: React.FC<BossRushHighScoresProps> = ({
  currentUser,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [scores, setScores] = useState<BossRushScoreEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shouldAnimateEntrance, setShouldAnimateEntrance] = useState<boolean>(true);
  const prefersReducedMotion = useReducedMotion();

  const isVerifiedUser = Boolean(currentUser?.uid && currentUser?.emailVerified);

  useEffect(() => {
    if (!isVerifiedUser) {
      setScores([]);
      setLoading(false);
      setErrorMsg(null);
      setShouldAnimateEntrance(true);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setShouldAnimateEntrance(true);

    const scoresQuery = query(
      collection(db, 'bossRushScores'),
      where('clearTimeMs', '>=', 1000),
      orderBy('clearTimeMs', 'asc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(
      scoresQuery,
      (snapshot) => {
        const nextScores: BossRushScoreEntry[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const diff = data.difficulty === 'easy' || data.difficulty === 'hard' ? data.difficulty : 'normal';
          const gender = data.gender === 'hen' ? 'hen' : 'rooster';
          return {
            id: docSnap.id,
            userId: typeof data.userId === 'string' ? data.userId : '',
            playerName: typeof data.playerName === 'string' && data.playerName.trim() ? data.playerName.trim() : 'Hero Chick',
            clearTimeMs: typeof data.clearTimeMs === 'number' ? data.clearTimeMs : 0,
            difficulty: diff,
            gender,
            bonusCoins: typeof data.bonusCoins === 'number' ? data.bonusCoins : 650,
          };
        });
        setScores(nextScores);
        setLoading(false);
        setErrorMsg(null);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'bossRushScores');
        } catch {
          // Structured error logged via handleFirestoreError; display clean inline state
        }
        setLoading(false);
        setErrorMsg('Unable to load Boss Rush leaderboard right now.');
      }
    );

    return () => unsubscribe();
  }, [isVerifiedUser]);

  const rankColors = [
    'text-yellow-300',
    'text-slate-200',
    'text-amber-500',
    'text-slate-400',
    'text-slate-400',
  ];

  const difficultyLabels: Record<'easy' | 'normal' | 'hard', string> = {
    easy: 'Easy',
    normal: 'Normal',
    hard: 'Hard',
  };

  return (
    <section
      aria-label="Boss Rush High Scores"
      className="w-full bg-slate-900/95 border-2 border-amber-400/75 shadow-[0_3px_0_#020617] text-left"
    >
      {/* Header Toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className="w-full min-h-[44px] px-3.5 py-2.5 flex items-center justify-between gap-2 hover:bg-slate-800/80 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300 focus-visible:-outline-offset-2"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Trophy className="w-4 h-4 text-yellow-400 stroke-[2.2] shrink-0" />
          <span className="font-pixel-arcade text-[9.5px] sm:text-[10.5px] text-yellow-300 font-bold truncate">
            BOSS RUSH HIGH SCORES
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[8.5px] font-pixel-arcade text-slate-400 tabular-nums whitespace-nowrap">
            TOP 5
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-amber-300 shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-amber-300 shrink-0" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-3.5 pb-3 pt-2 border-t border-slate-800">
          {!isVerifiedUser ? (
            <p className="font-body text-xs text-slate-400 py-2 text-center">
              Sign in with a verified account to view and record Boss Rush clear times.
            </p>
          ) : loading ? (
            <div className="space-y-2 py-1" aria-busy="true">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="h-8 bg-slate-950/70 border border-slate-800/80 animate-pulse"
                />
              ))}
            </div>
          ) : errorMsg ? (
            <p className="font-body text-xs text-rose-300 py-2 text-center">
              {errorMsg}
            </p>
          ) : scores.length === 0 ? (
            <div className="py-2.5 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-slate-300 font-body text-xs font-medium">
                <Timer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>No Boss Rush clears recorded yet.</span>
              </div>
              <p className="font-body text-[11px] text-slate-400">
                Complete Boss Rush Mode to claim the #1 fastest time.
              </p>
            </div>
          ) : (
            <ol className="divide-y divide-slate-800/90 overflow-x-hidden">
              {scores.map((entry, idx) => {
                const isSelf = Boolean(currentUser?.uid && entry.userId === currentUser.uid);
                const animateOnLoad = shouldAnimateEntrance && !prefersReducedMotion;
                return (
                  <motion.li
                    key={entry.id}
                    initial={animateOnLoad ? { opacity: 0, x: -18 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    transition={
                      animateOnLoad
                        ? {
                            duration: 0.28,
                            delay: idx * 0.06,
                            ease: [0.16, 1, 0.3, 1],
                          }
                        : { duration: 0 }
                    }
                    onAnimationComplete={() => {
                      if (shouldAnimateEntrance && idx === scores.length - 1) {
                        setShouldAnimateEntrance(false);
                      }
                    }}
                    className={`py-2 flex items-center justify-between gap-2 will-change-transform ${
                      isSelf ? 'text-yellow-200' : 'text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`font-pixel-arcade text-[10px] font-bold tabular-nums w-6 shrink-0 ${
                          rankColors[idx] ?? 'text-slate-400'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-body text-xs font-semibold truncate">
                            {entry.playerName}
                          </span>
                          {isSelf && (
                            <span className="font-pixel-arcade text-[7.5px] text-amber-300 shrink-0">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="font-body text-[10px] text-slate-400 flex items-center gap-1.5">
                          <span>{difficultyLabels[entry.difficulty]}</span>
                          <span aria-hidden="true">·</span>
                          <span>{entry.gender === 'hen' ? 'Hen' : 'Rooster'}</span>
                        </div>
                      </div>
                    </div>

                    <span className="font-pixel-arcade text-[10px] sm:text-[11px] font-bold text-emerald-300 tabular-nums whitespace-nowrap shrink-0">
                      {formatBossRushTime(entry.clearTimeMs)}
                    </span>
                  </motion.li>
                );
              })}
            </ol>
          )}
        </div>
      )}
    </section>
  );
};
