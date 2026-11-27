import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { GameRenderer } from './game/renderer';
import { GameScreen, SaveData, GrowthStage, ChickenGender, ChickenSkinId, BadgeItem, EmoteId } from './game/types';
import { loadSaveData, saveSaveData, clearSaveData } from './game/storage';
import { audio } from './game/audio';
import {
  initializeAdMob,
  showAdMobInterstitial,
  hideAdMobBanner,
  subscribeAdMobInterstitial,
  notifyAdMobInterstitialClosed,
  AdMobInterstitialRequest,
} from './game/admob';
import { LEVELS } from './game/levels';
import { getBadgesWithStatus } from './game/quests';
import { EMOTES, getNewlyUnlockedEmotes, getUnlockedEmotes, isEmoteUnlocked } from './game/emotes';
import { GameHUD } from './components/GameHUD';
import { GameModals } from './components/GameModals';
import { TouchControls } from './components/TouchControls';
import { AdMobInterstitialModal } from './components/AdMobInterstitialModal';

import { onAuthStateChanged, signOut, applyActionCode, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ArrowLeft, LogOut, Maximize2, Minimize2, X } from 'lucide-react';
import { auth, db } from './game/firebase';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const reqAnimRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const introProgressRef = useRef<number>(0);
  const endingProgressRef = useRef<number>(0);

  const [saveData, setSaveData] = useState<SaveData>(loadSaveData);
  const [screen, setScreen] = useState<GameScreen>('MENU');
  const [activeLevelId, setActiveLevelId] = useState<number>(1);
  const [coinsEarned, setCoinsEarned] = useState<number>(0);
  const [evolutionStage, setEvolutionStage] = useState<GrowthStage | null>(null);
  const [playerHealth, setPlayerHealth] = useState<number>(3);
  const [playerStage, setPlayerStage] = useState<GrowthStage>('baby');
  const [playerFireResistTimer, setPlayerFireResistTimer] = useState<number>(0);
  const [playerPoisonTimer, setPlayerPoisonTimer] = useState<number>(0);
  const [playerPoisonMaxDuration, setPlayerPoisonMaxDuration] = useState<number>(0);
  const [emoteTrayOpen, setEmoteTrayOpen] = useState<boolean>(false);
  const [activePlayerEmote, setActivePlayerEmote] = useState<EmoteId | null>(null);
  const [playerOnRaft, setPlayerOnRaft] = useState<boolean>(false);
  const [activeHasShield, setActiveHasShield] = useState<boolean>(false);
  // Refs to prevent redundant React state updates every animation frame
  const hudSyncRef = useRef({
    fireResist: 0,
    emote: null as EmoteId | null,
    onRaft: false,
    hasShield: false,
    poison: 0,
    poisonMax: 0,
  });
  const [showTouchControls, setShowTouchControls] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024;
  });
  const userToggledTouchRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLElement | null>(null);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [immersiveFullscreen, setImmersiveFullscreen] = useState<boolean>(false);
  const [fullscreenTip, setFullscreenTip] = useState<string | null>(null);
  const fullscreenTipTimerRef = useRef<number | null>(null);
  const [activeAdMobRequest, setActiveAdMobRequest] = useState<AdMobInterstitialRequest | null>(null);
  const activeAdMobRef = useRef<AdMobInterstitialRequest | null>(null);
  activeAdMobRef.current = activeAdMobRequest;

  // Firebase Authentication & Verification Gate
  // Note: user.reload() mutates auth.currentUser in-place, so we track isEmailVerified separately
  // to guarantee React re-renders and exits AuthModal immediately upon verification.
  const [currentUser, setCurrentUser] = useState<User | null>(() => auth.currentUser);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(() => Boolean(auth.currentUser?.emailVerified));
  const [allowUnverifiedLocalPlay, setAllowUnverifiedLocalPlay] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const syncedUidRef = useRef<string | null>(null);
  const hasGameAccess = Boolean(currentUser && (isEmailVerified || allowUnverifiedLocalPlay));

  const syncUserProfile = useCallback(async (user: User) => {
    if (!user.emailVerified) return;
    if (syncedUidRef.current === user.uid) return;
    try {
      await user.getIdToken(true).catch(() => {});
      const userDocRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const remote = snap.data();
        setSaveData(prev => ({
          ...prev,
          unlockedLevel: typeof remote.unlockedLevel === 'number' ? remote.unlockedLevel : prev.unlockedLevel,
          totalCoins: typeof remote.totalCoins === 'number' ? remote.totalCoins : prev.totalCoins,
          gender: remote.gender === 'hen' ? 'hen' : (remote.gender === 'rooster' ? 'rooster' : prev.gender),
          armor: remote.armor || prev.armor,
          sword: remote.sword || prev.sword,
          selectedSkin: remote.selectedSkin || prev.selectedSkin,
          hasShield: remote.hasShield !== undefined ? Boolean(remote.hasShield) : prev.hasShield,
          hasCompletedGame: remote.hasCompletedGame !== undefined ? Boolean(remote.hasCompletedGame) : prev.hasCompletedGame,
        }));
      } else {
        // Write initial cloud profile
        await setDoc(userDocRef, {
          userId: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          unlockedLevel: 1,
          totalCoins: 0,
          gender: 'rooster',
          armor: 'none',
          sword: 'none',
          selectedSkin: 'classic',
          hasShield: false,
          hasCompletedGame: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      syncedUidRef.current = user.uid;
    } catch (err) {
      console.error('Failed to sync save with Firestore:', err);
    }
  }, []);

  // Listen to Firebase Auth state changes & handle any in-URL verification oobCode
  useEffect(() => {
    let active = true;

    const handlePossibleOobCode = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const mode = params.get('mode');
        const oobCode = params.get('oobCode');
        if (mode === 'verifyEmail' && oobCode) {
          await applyActionCode(auth, oobCode);
          if (auth.currentUser) {
            await auth.currentUser.getIdToken(true).catch(() => {});
            await auth.currentUser.reload();
            if (active && auth.currentUser.emailVerified) {
              setCurrentUser(auth.currentUser);
              setIsEmailVerified(true);
              setAllowUnverifiedLocalPlay(false);
              setScreen('MENU');
              await syncUserProfile(auth.currentUser);
            }
          }
          const cleanUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      } catch (err) {
        console.warn('Email verification link check:', err);
      }
    };

    void handlePossibleOobCode();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!active) return;

      if (user && !user.emailVerified) {
        // Always refresh cached user state from server in case user verified before returning/reloading
        try {
          await user.getIdToken(true).catch(() => {});
          await user.reload();
        } catch {
          // Ignore network reload errors on initial boot
        }
      }

      if (!active) return;
      const verified = Boolean(user?.emailVerified);
      setCurrentUser(user);
      setIsEmailVerified(verified);
      setAuthLoading(false);

      if (user && verified) {
        setAllowUnverifiedLocalPlay(false);
        await syncUserProfile(user);
      } else {
        syncedUidRef.current = null;
        if (!user) {
          setAllowUnverifiedLocalPlay(false);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [syncUserProfile]);

  const handleAuthSuccess = useCallback(async (user: User) => {
    setCurrentUser(user);
    const verified = Boolean(user.emailVerified);
    setIsEmailVerified(verified);
    if (verified) {
      setAllowUnverifiedLocalPlay(false);
      setScreen('MENU');
      await syncUserProfile(user);
    }
  }, [syncUserProfile]);

  const handleLogOut = useCallback(async () => {
    try {
      await signOut(auth);
      syncedUidRef.current = null;
      setCurrentUser(null);
      setIsEmailVerified(false);
      setAllowUnverifiedLocalPlay(false);
      setScreen('MENU');
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
    }
    if (engineRef.current) {
      engineRef.current.resize(width, height);
    }
  }, []);

  const showTimedFullscreenTip = useCallback((msg: string) => {
    setFullscreenTip(msg);
    if (fullscreenTipTimerRef.current) {
      window.clearTimeout(fullscreenTipTimerRef.current);
    }
    fullscreenTipTimerRef.current = window.setTimeout(() => {
      setFullscreenTip(null);
    }, 5500);
  }, []);

  const handleToggleFullscreen = useCallback(async () => {
    audio.unlock();

    const doc = document as Document & {
      webkitFullscreenElement?: Element | null;
      webkitExitFullscreen?: () => Promise<void> | void;
      mozFullScreenElement?: Element | null;
      mozCancelFullScreen?: () => Promise<void> | void;
    };
    const nativeFsElement = document.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement;
    const currentlyActive = Boolean(nativeFsElement || immersiveFullscreen || isFullscreen);

    if (currentlyActive) {
      if (nativeFsElement) {
        try {
          if (document.exitFullscreen) await document.exitFullscreen();
          else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
          else if (doc.mozCancelFullScreen) await doc.mozCancelFullScreen();
        } catch {
          // Ignore exit errors
        }
      }
      try {
        (window.screen?.orientation as { unlock?: () => void } | undefined)?.unlock?.();
      } catch {
        // Ignore orientation unlock errors
      }
      setImmersiveFullscreen(false);
      setIsFullscreen(false);
      setFullscreenTip(null);
      window.setTimeout(resizeCanvas, 60);
      return;
    }

    const targetEl = (containerRef.current || document.documentElement) as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
      mozRequestFullScreen?: () => Promise<void> | void;
      msRequestFullscreen?: () => Promise<void> | void;
    };

    let enteredNative = false;
    try {
      if (targetEl.requestFullscreen) {
        try {
          await targetEl.requestFullscreen({ navigationUI: 'hide' } as FullscreenOptions);
        } catch {
          await targetEl.requestFullscreen();
        }
        enteredNative = true;
      } else if (targetEl.webkitRequestFullscreen) {
        await targetEl.webkitRequestFullscreen();
        enteredNative = true;
      } else if (targetEl.mozRequestFullScreen) {
        await targetEl.mozRequestFullScreen();
        enteredNative = true;
      } else if (targetEl.msRequestFullscreen) {
        await targetEl.msRequestFullscreen();
        enteredNative = true;
      }
    } catch {
      enteredNative = false;
    }

    if (enteredNative) {
      setImmersiveFullscreen(false);
      setIsFullscreen(true);
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (isTouch) {
        try {
          await (window.screen?.orientation as { lock?: (mode: string) => Promise<void> } | undefined)?.lock?.('landscape');
        } catch {
          // Orientation lock is optional and unsupported on some devices
        }
      }
    } else {
      // iOS Safari / iOS Chrome fallback: native Fullscreen API is unavailable on iPhone
      setImmersiveFullscreen(true);
      setIsFullscreen(true);
      try {
        window.scrollTo(0, 1);
      } catch {
        // Ignore scroll errors
      }
      const nav = navigator as Navigator & { standalone?: boolean };
      const isStandalone = window.matchMedia?.('(display-mode: standalone)')?.matches || Boolean(nav.standalone);
      if (!isStandalone) {
        showTimedFullscreenTip('EXPANDED VIEW ACTIVE! ON IPHONE, TAP SHARE → ADD TO HOME SCREEN FOR EDGE-TO-EDGE FULLSCREEN.');
      }
    }

    window.setTimeout(resizeCanvas, 60);
    window.setTimeout(resizeCanvas, 260);
  }, [immersiveFullscreen, isFullscreen, resizeCanvas, showTimedFullscreenTip]);

  // Detect touch device & sync native fullscreen state
  useEffect(() => {
    const isMobileOrTouch = () =>
      'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024;

    const checkTouch = () => {
      if (!userToggledTouchRef.current && isMobileOrTouch()) {
        setShowTouchControls(true);
      }
    };
    checkTouch();

    const handleFirstTouch = () => {
      if (!userToggledTouchRef.current) {
        setShowTouchControls(true);
      }
    };

    const handleFullscreenChange = () => {
      const doc = document as Document & {
        webkitFullscreenElement?: Element | null;
        mozFullScreenElement?: Element | null;
      };
      const nativeActive = Boolean(document.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement);
      setIsFullscreen(nativeActive || immersiveFullscreen);
      window.setTimeout(resizeCanvas, 60);
    };

    const handleOrientation = () => {
      checkTouch();
      window.setTimeout(resizeCanvas, 80);
    };

    window.addEventListener('touchstart', handleFirstTouch, { passive: true });
    window.addEventListener('resize', handleOrientation);
    window.addEventListener('orientationchange', handleOrientation);
    window.screen?.orientation?.addEventListener?.('change', handleOrientation);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('touchstart', handleFirstTouch);
      window.removeEventListener('resize', handleOrientation);
      window.removeEventListener('orientationchange', handleOrientation);
      window.screen?.orientation?.removeEventListener?.('change', handleOrientation);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [immersiveFullscreen, resizeCanvas]);

  // Save changes to localStorage and sync to Firestore
  const updateSaveData = useCallback((updater: (prev: SaveData) => SaveData) => {
    setSaveData(prev => {
      const next = updater(prev);
      saveSaveData(next);

      // Sync persistent progress to Firestore for verified users
      if (auth.currentUser && auth.currentUser.emailVerified) {
        const uid = auth.currentUser.uid;
        setDoc(doc(db, 'users', uid), {
          userId: uid,
          email: auth.currentUser.email || '',
          displayName: auth.currentUser.displayName || '',
          unlockedLevel: next.unlockedLevel,
          totalCoins: next.totalCoins,
          gender: next.gender,
          armor: next.armor,
          sword: next.sword,
          selectedSkin: next.selectedSkin,
          hasShield: Boolean(next.hasShield),
          hasCompletedGame: Boolean(next.hasCompletedGame),
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(err => console.error('Firestore save sync error:', err));
      }

      return next;
    });
  }, []);

  // Super Secret & Hero Badges Discovery Watcher
  const [foundBadge, setFoundBadge] = useState<BadgeItem | null>(null);

  useEffect(() => {
    const badges = getBadgesWithStatus(saveData);
    const previouslyUnlocked = new Set(saveData.unlockedBadges || []);
    const newlyUnlocked = badges.find(b => b.unlocked && !previouslyUnlocked.has(b.id));

    if (newlyUnlocked) {
      setFoundBadge(newlyUnlocked);
      audio.playBadgeUnlock();
      void showAdMobInterstitial({
        reason: 'achievement_badge',
        title: `Badge Unlocked: ${newlyUnlocked.title}`,
        subtitle: newlyUnlocked.description,
      });
      updateSaveData(prev => ({
        ...prev,
        unlockedBadges: [...(prev.unlockedBadges || []), newlyUnlocked.id]
      }));
    }
  }, [saveData, updateSaveData]);

  // Initialize or update Background Music based on level
  const updateMusicForLevel = useCallback((levelId: number) => {
    const level = LEVELS.find(l => l.id === levelId);
    if (!level) return;
    if (levelId === 30 || level.cockatrice) {
      const cockatrice = engineRef.current?.level.cockatrice;
      const isBossNormalized = Boolean(
        cockatrice && cockatrice.state === 'defeated' &&
        ((cockatrice.defeatSubState === 'exploding_ashes' && (cockatrice.defeatTimer ?? 0) >= 0.55) ||
          cockatrice.defeatSubState === 'fly_away' ||
          cockatrice.defeatSubState === 'escaped')
      );
      if (isBossNormalized) {
        // "when we defeat the boss the music changes into the same music from level 1"
        audio.playMusic('coop', 1.2);
      } else {
        audio.playMusic('boss', 0.85);
      }
    } else if (levelId === 6) {
      // "Dont change the level music at level 6 just make it the same"
      audio.playMusic('coop', 0.95);
    } else {
      audio.playMusic(level.theme, 0.95);
    }
  }, []);

  // Initialize Engine for Level
  const initLevelEngine = useCallback((levelId: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!rendererRef.current) {
      rendererRef.current = new GameRenderer(canvas);
    }

    setPlayerFireResistTimer(0);
    setPlayerPoisonTimer(0);
    setPlayerPoisonMaxDuration(0);

    const currentSave = loadSaveData();
    // When starting a new run or entering level 1, only reset equipment if player is not an evolved chicken!
    const isEvolvedRevisit = (currentSave.unlockedLevel || 1) >= 10;
    if (levelId === 1 && !isEvolvedRevisit) {
      currentSave.armor = 'none';
      currentSave.sword = 'none';
      currentSave.hasShield = false;
    }

    // When playing levels 1 through 29:
    // "when we defeat the boss with netherite sword and go back to levels 29-1 our sword will still be that normal diamond or etc"
    if (levelId < 30) {
      if (currentSave.sword === 'netherite') {
        const regularSword = currentSave.preBossSword || 'diamond';
        currentSave.sword = regularSword;
        updateSaveData(prev => ({
          ...prev,
          sword: regularSword,
        }));
      }
    }

    // When starting or replaying Level 30 (The Ancient Cockatrice Boss):
    // Player begins with their regular diamond sword (or owned non-netherite sword),
    // and shield starts uncollected so Silkie Sam can fly in and bestow the shield and netherite sword!
    if (levelId === 30) {
      const regularSword = (currentSave.sword === 'netherite' ? currentSave.preBossSword : currentSave.sword) || 'diamond';
      currentSave.preBossSword = regularSword;
      currentSave.sword = regularSword;
      currentSave.hasShield = false;
      updateSaveData(prev => ({
        ...prev,
        sword: regularSword,
        preBossSword: regularSword,
        hasShield: false,
      }));
    }

    engineRef.current = new GameEngine(
      levelId,
      currentSave,
      canvas.width,
      canvas.height,
      {
        onStatsUpdate: (health, coins, stage, armor, sword, hasShield) => {
          setPlayerHealth(health);
          setCoinsEarned(coins);
          setPlayerStage(stage);
          if (armor !== undefined || sword !== undefined || hasShield !== undefined) {
            updateSaveData(prev => ({
              ...prev,
              armor: armor !== undefined ? armor : prev.armor,
              sword: sword !== undefined ? sword : prev.sword,
              hasShield: hasShield !== undefined ? hasShield : prev.hasShield,
            }));
          }
        },
        onLevelClear: (completedLevelId, earnedCoins) => {
          updateSaveData(prev => {
            const nextLvl = Math.min(40, Math.max(prev.unlockedLevel, completedLevelId + 1));
            return {
              ...prev,
              unlockedLevel: nextLvl,
              totalCoins: prev.totalCoins + earnedCoins,
              hasCompletedGame: prev.hasCompletedGame || completedLevelId >= 30,
              armor: engineRef.current?.armorType || prev.armor,
              sword: engineRef.current?.swordType || prev.sword,
              hasShield: engineRef.current?.hasShield || prev.hasShield,
            };
          });
          setCoinsEarned(earnedCoins);

          // Route evolution milestones (9 -> 10 Juvenile, 19 -> 20 Adult) directly to EVOLUTION,
          // and all other cleared stages directly to LEVEL_CLEAR (no percentage loading modal)
          if (completedLevelId === 9) {
            setActiveLevelId(10);
            setEvolutionStage('juvenile');
            audio.playEvolution();
            setScreen('EVOLUTION');
          } else if (completedLevelId === 19) {
            setActiveLevelId(20);
            setEvolutionStage('adult');
            audio.playEvolution();
            setScreen('EVOLUTION');
          } else {
            setScreen('LEVEL_CLEAR');
          }
        },
        onEvolution: (stage) => {
          const nextLvl = Math.min(40, levelId + 1);
          setActiveLevelId(nextLvl);
          setEvolutionStage(stage);
          audio.playEvolution();
          updateSaveData(prev => {
            return {
              ...prev,
              unlockedLevel: Math.max(prev.unlockedLevel, nextLvl),
              totalCoins: prev.totalCoins + (engineRef.current?.coinsEarnedThisLevel || 0),
              armor: engineRef.current?.armorType || prev.armor,
              sword: engineRef.current?.swordType || prev.sword,
            };
          });
          setScreen('EVOLUTION');
        },
        onGameOver: () => {
          setScreen('DEATH_LOADING');
        },
        onVictory: (earnedCoins) => {
          updateSaveData(prev => ({
            ...prev,
            unlockedLevel: Math.min(40, Math.max(prev.unlockedLevel, levelId + 1)),
            totalCoins: prev.totalCoins + earnedCoins,
            hasCompletedGame: true,
          }));
          setCoinsEarned(earnedCoins);
          if (levelId >= 40) {
            setScreen('VICTORY');
          } else {
            setScreen('LEVEL_CLEAR');
          }
        },
        onActionStat: (statType) => {
          updateSaveData(prev => {
            const currentStats = prev.stats || {};
            if (statType === 'visitedCoopEvolved') {
              return {
                ...prev,
                stats: {
                  ...currentStats,
                  visitedCoopEvolved: true
                }
              };
            }
            const currentVal = typeof currentStats[statType] === 'number'
              ? (currentStats[statType] as number)
              : 0;
            return {
              ...prev,
              stats: {
                ...currentStats,
                [statType]: currentVal + 1
              }
            };
          });
        },
        onSaveDataUpdate: (patch) => {
          updateSaveData(prev => ({
            ...prev,
            ...patch,
          }));
        },
        onEnemyEncountered: (enemyId) => {
          updateSaveData(prev => {
            const current = prev.encounteredEnemies || [];
            if (current.includes(enemyId)) return prev;
            return {
              ...prev,
              encounteredEnemies: [...current, enemyId],
            };
          });
        },
        onEnemyDefeated: (enemyId) => {
          updateSaveData(prev => {
            const currentEncountered = prev.encounteredEnemies || [];
            const nextEncountered = currentEncountered.includes(enemyId)
              ? currentEncountered
              : [...currentEncountered, enemyId];
            const currentCounts = prev.enemyDefeatCounts || {};
            return {
              ...prev,
              encounteredEnemies: nextEncountered,
              enemyDefeatCounts: {
                ...currentCounts,
                [enemyId]: (currentCounts[enemyId] || 0) + 1,
              },
            };
          });
        },
      }
    );

    setActiveLevelId(levelId);
    setCoinsEarned(0);
    setPlayerHealth(engineRef.current.player.health);
    setPlayerStage(engineRef.current.player.stage);
    setPlayerOnRaft(Boolean(engineRef.current.player.onRaft));
    setActiveHasShield(Boolean(engineRef.current.hasShield));
    updateMusicForLevel(levelId);
  }, [updateSaveData, updateMusicForLevel]);

  const pendingRestartActionRef = useRef<'level' | 'new_run' | 'respawn'>('level');

  // Execute a brand new run (invoked after heavenly reincarnation loading finishes)
  const executeStartNewRun = useCallback(() => {
    updateSaveData(prev => ({
      ...prev,
      armor: 'none',
      sword: 'none',
      hasShield: false,
      unlockedLevel: 1,
      hasCompletedGame: false,
      collectedCoinIds: [],
      activatedCheckpointIds: [],
      openedChestIds: [],
      levelCoinsCollected: {},
      hasVisitedShop: false,
      hasSeenSamLevel1Joke: false,
      hasClaimedBossReward: false,
      shopClosedUntil: Date.now() + 2 * 60 * 60 * 1000,
    }));
    setActiveLevelId(1);
    setScreen('INTRO_CINEMATIC');
    introProgressRef.current = 0;
    audio.stopMusic();
    audio.playEggCrack();
  }, [updateSaveData]);

  // Handle Starting a New Run: show heavenly "recarnation in progress..." loading screen first
  const handleStartNewRun = useCallback(() => {
    pendingRestartActionRef.current = 'new_run';
    setScreen('RESTART_LOADING');
  }, []);

  // Handle Game Start
  const handleStartGame = useCallback((levelId = 1, watchIntro = false) => {
    if (levelId === 1 && (saveData.unlockedLevel || 1) < 10) {
      updateSaveData(prev => ({
        ...prev,
        armor: 'none',
        sword: 'none',
        hasShield: false,
      }));
    }
    if (watchIntro && !saveData.hasSeenIntro) {
      setScreen('INTRO_CINEMATIC');
      introProgressRef.current = 0;
      audio.stopMusic();
      audio.playEggCrack();
      updateSaveData(prev => ({ 
        ...prev, 
        hasSeenIntro: true, 
        armor: 'none', 
        sword: 'none', 
        hasShield: false,
        hasCompletedGame: false,
        collectedCoinIds: [],
        activatedCheckpointIds: [],
        openedChestIds: [],
        levelCoinsCollected: {},
        hasVisitedShop: false,
        hasSeenSamLevel1Joke: false,
        hasClaimedBossReward: false,
      }));
    } else {
      setActiveLevelId(levelId);
      initLevelEngine(levelId);
      setScreen('PLAYING');
    }
  }, [saveData.hasSeenIntro, saveData.unlockedLevel, initLevelEngine, updateSaveData]);

  // Gender selection handler - immediately equips chosen gender in save data
  const handleSelectGender = useCallback((gender: ChickenGender) => {
    updateSaveData(prev => ({
      ...prev,
      gender,
    }));
    audio.playChest();
  }, [updateSaveData]);

  // Next level handler
  const handleNextLevel = useCallback(() => {
    // If clicking "CONTINUE ADVENTURE!" on the EVOLUTION screen, show the 1% -> 100% world loading screen first!
    if (screen === 'EVOLUTION') {
      setScreen('WORLD_LOADING');
      return;
    }

    const nextLvl = activeLevelId + 1;
    if (nextLvl > 40) {
      setScreen('VICTORY');
    } else if (nextLvl === 10) {
      setActiveLevelId(10);
      setEvolutionStage('juvenile');
      audio.playEvolution();
      setScreen('EVOLUTION');
    } else if (nextLvl === 20) {
      setActiveLevelId(20);
      setEvolutionStage('adult');
      audio.playEvolution();
      setScreen('EVOLUTION');
    } else {
      const currWorld = LEVELS.find(l => l.id === activeLevelId)?.world;
      const nextWorld = LEVELS.find(l => l.id === nextLvl)?.world;
      if (nextWorld && currWorld && nextWorld !== currWorld) {
        setActiveLevelId(nextLvl);
        setScreen('WORLD_LOADING');
      } else {
        initLevelEngine(nextLvl);
        setScreen('PLAYING');
      }
    }
  }, [screen, activeLevelId, initLevelEngine]);

  const handleFinishWorldLoading = useCallback(() => {
    initLevelEngine(activeLevelId);
    setScreen('PLAYING');
  }, [activeLevelId, initLevelEngine]);

  // Finish death loading transition -> reveal Game Over modal
  const handleFinishDeathLoading = useCallback(() => {
    setScreen('GAME_OVER');
  }, []);

  // Finish heavenly reincarnation loading screen -> perform the requested restart
  const handleFinishRestartLoading = useCallback(() => {
    const action = pendingRestartActionRef.current;
    if (action === 'new_run') {
      executeStartNewRun();
    } else if (action === 'respawn' && activeLevelId === 30 && engineRef.current) {
      engineRef.current.respawnAtSamSpot();
      setScreen('PLAYING');
    } else {
      initLevelEngine(activeLevelId);
      setScreen('PLAYING');
    }
  }, [activeLevelId, executeStartNewRun, initLevelEngine]);

  // Restart level handler -> shows heavenly Clouds of Heaven loading screen
  const handleRestartLevel = useCallback(() => {
    pendingRestartActionRef.current = 'level';
    setScreen('RESTART_LOADING');
  }, []);

  // Respawn handler -> shows heavenly Clouds of Heaven loading screen (Level 30 returns to Sam's weapon spot)
  const handleRespawn = useCallback(() => {
    pendingRestartActionRef.current = activeLevelId === 30 ? 'respawn' : 'level';
    setScreen('RESTART_LOADING');
  }, [activeLevelId]);

  // Level select handler
  const handleSelectLevel = useCallback((lvlId: number) => {
    initLevelEngine(lvlId);
    setScreen('PLAYING');
  }, [initLevelEngine]);

  // Audio toggles
  const handleToggleSound = useCallback(() => {
    const next = !saveData.soundEnabled;
    audio.setSoundEnabled(next);
    updateSaveData(prev => ({ ...prev, soundEnabled: next }));
  }, [saveData.soundEnabled, updateSaveData]);

  const handleToggleMusic = useCallback(() => {
    const next = !saveData.musicEnabled;
    audio.setMusicEnabled(next);
    updateSaveData(prev => ({ ...prev, musicEnabled: next }));
  }, [saveData.musicEnabled, updateSaveData]);

  const handleResetProgress = useCallback(() => {
    const reset = clearSaveData();
    setSaveData(reset);
    setActiveLevelId(1);
    setScreen('MENU');
  }, []);

  const handleClaimQuest = useCallback((questId: string, rewardCoins: number) => {
    audio.playCoin();
    void showAdMobInterstitial({
      reason: 'achievement_quest',
      title: 'Quest Completed!',
      subtitle: `Achievement reward claimed (+${rewardCoins.toLocaleString()} coins)`,
    });
    updateSaveData(prev => ({
      ...prev,
      totalCoins: prev.totalCoins + rewardCoins,
      claimedQuests: {
        ...(prev.claimedQuests || {}),
        [questId]: true
      }
    }));
  }, [updateSaveData]);

  const handlePurchaseUpgrade = useCallback((
    cost: number,
    itemType: 'heart' | 'speed' | 'jump' | 'magnet' | 'revive' | 'lucky_corn' | 'iron_beak' | 'glider' | 'plumage' | 'armor' | 'sword' | 'shield',
    tierValue?: string
  ): boolean => {
    if (saveData.totalCoins < cost) return false;
    audio.playCoin();
    updateSaveData(prev => {
      const nextCoins = prev.totalCoins - cost;
      const nextUpgrades = { ...(prev.upgrades || {}) };
      let nextArmor = prev.armor;
      let nextSword = prev.sword;
      let nextShield = prev.hasShield;

      let nextUnlockedArmors = prev.unlockedArmors || [];
      if (itemType === 'heart') {
        nextUpgrades.extraHearts = (nextUpgrades.extraHearts || 0) + 1;
      } else if (itemType === 'speed') {
        nextUpgrades.speedBoost = (nextUpgrades.speedBoost || 0) + 1;
      } else if (itemType === 'jump') {
        nextUpgrades.jumpBoost = (nextUpgrades.jumpBoost || 0) + 1;
      } else if (itemType === 'magnet') {
        nextUpgrades.coinMagnet = true;
      } else if (itemType === 'revive') {
        nextUpgrades.reviveToken = true;
      } else if (itemType === 'lucky_corn') {
        nextUpgrades.luckyCorn = (nextUpgrades.luckyCorn || 0) + 1;
      } else if (itemType === 'iron_beak') {
        nextUpgrades.ironBeak = (nextUpgrades.ironBeak || 0) + 1;
      } else if (itemType === 'glider') {
        nextUpgrades.fluffyGlider = true;
      } else if (itemType === 'plumage') {
        nextUpgrades.goldenPlumage = true;
      } else if (itemType === 'armor' && tierValue) {
        nextArmor = tierValue as any;
        nextUnlockedArmors = Array.from(new Set([...nextUnlockedArmors, tierValue as any]));
      } else if (itemType === 'sword' && tierValue) {
        nextSword = tierValue as any;
      } else if (itemType === 'shield') {
        nextShield = true;
      }

      const prevPurchases = prev.stats?.shopPurchases || 0;
      const nextPurchases = cost > 0 ? prevPurchases + 1 : prevPurchases;
      const newlyUnlocked = cost > 0 ? getNewlyUnlockedEmotes(prevPurchases, nextPurchases) : [];
      const nextUnlockedEmotes = Array.from(
        new Set([...(prev.unlockedEmotes || ['squawk']), ...newlyUnlocked.map(e => e.id)])
      ) as EmoteId[];
      if (newlyUnlocked.length > 0) {
        audio.playBadgeUnlock();
      }

      return {
        ...prev,
        totalCoins: nextCoins,
        upgrades: nextUpgrades,
        armor: nextArmor,
        unlockedArmors: nextUnlockedArmors,
        sword: nextSword,
        hasShield: nextShield,
        unlockedEmotes: nextUnlockedEmotes,
        stats: {
          ...prev.stats,
          shopPurchases: nextPurchases,
        }
      };
    });
    return true;
  }, [saveData.totalCoins, updateSaveData]);

  const handleToggleShopStatus = useCallback(() => {
    updateSaveData(prev => {
      const isCurrentlyClosed = Boolean(prev.shopClosedUntil && Date.now() < prev.shopClosedUntil);
      return {
        ...prev,
        shopClosedUntil: isCurrentlyClosed ? 0 : Date.now() + 2 * 60 * 60 * 1000,
      };
    });
  }, [updateSaveData]);

  const handleMarkShopVisited = useCallback(() => {
    updateSaveData(prev => ({
      ...prev,
      hasVisitedShop: true
    }));
  }, [updateSaveData]);

  const handleClaimBossReward = useCallback(() => {
    updateSaveData(prev => {
      if (prev.hasClaimedBossReward) return prev;
      return {
        ...prev,
        totalCoins: prev.totalCoins + 1000,
        hasClaimedBossReward: true,
      };
    });
    audio.playPowerUp();
    void showAdMobInterstitial({
      reason: 'achievement_victory',
      title: 'Grand Champion Reward Claimed!',
      subtitle: '1,000 Pellet Coins & Secret Skin Unlocked',
    });
  }, [updateSaveData]);

  const handleBuySkin = useCallback((skinId: string, cost: number): boolean => {
    if (saveData.totalCoins < cost) return false;
    audio.playCoin();
    updateSaveData(prev => {
      const currentUnlocked = (prev.unlockedSkins || ['classic']) as ChickenSkinId[];
      const typedSkin = skinId as ChickenSkinId;
      const nextUnlocked = currentUnlocked.includes(typedSkin) ? currentUnlocked : [...currentUnlocked, typedSkin];
      const prevPurchases = prev.stats?.shopPurchases || 0;
      const nextPurchases = prevPurchases + 1;
      const newlyUnlocked = getNewlyUnlockedEmotes(prevPurchases, nextPurchases);
      const nextUnlockedEmotes = Array.from(
        new Set([...(prev.unlockedEmotes || ['squawk']), ...newlyUnlocked.map(e => e.id)])
      ) as EmoteId[];
      if (newlyUnlocked.length > 0) {
        audio.playBadgeUnlock();
      }
      return {
        ...prev,
        totalCoins: prev.totalCoins - cost,
        unlockedSkins: nextUnlocked,
        selectedSkin: typedSkin,
        unlockedEmotes: nextUnlockedEmotes,
        stats: {
          ...prev.stats,
          shopPurchases: nextPurchases,
        }
      };
    });
    return true;
  }, [saveData.totalCoins, updateSaveData]);

  const handleEquipSkin = useCallback((skinId: string) => {
    audio.playCoin();
    updateSaveData(prev => ({
      ...prev,
      selectedSkin: skinId as ChickenSkinId
    }));
  }, [updateSaveData]);

  const handleUnlockSkin = useCallback((skinId: string, autoEquip = true) => {
    audio.playBadgeUnlock();
    void showAdMobInterstitial({
      reason: 'achievement_skin',
      title: 'Special Skin Unlocked!',
      subtitle: 'New appearance achievement earned',
    });
    updateSaveData(prev => {
      const currentUnlocked = (prev.unlockedSkins || ['classic']) as ChickenSkinId[];
      const typedSkin = skinId as ChickenSkinId;
      const nextUnlocked = currentUnlocked.includes(typedSkin) ? currentUnlocked : [...currentUnlocked, typedSkin];
      return {
        ...prev,
        unlockedSkins: nextUnlocked,
        selectedSkin: autoEquip ? typedSkin : prev.selectedSkin
      };
    });
  }, [updateSaveData]);

  const handleChangeDifficulty = useCallback((diff: 'easy' | 'normal' | 'hard') => {
    audio.playCoin();
    updateSaveData(prev => ({
      ...prev,
      difficulty: diff
    }));
    if (engineRef.current) {
      engineRef.current.setDifficulty(diff);
    }
  }, [updateSaveData]);

  // Centralized dynamic music manager:
  // Smoothly crossfades between biome-specific ambient tracks (menus, pause, shop, world transitions)
  // and full level/boss/victory scores based on the player's current biome and progression.
  useEffect(() => {
    if (
      screen === 'MENU' ||
      screen === 'PAUSED' ||
      screen === 'SETTINGS' ||
      screen === 'HOW_TO_PLAY' ||
      screen === 'LEVEL_SELECT' ||
      screen === 'GENDER_SELECT' ||
      screen === 'LEVEL_CLEAR' ||
      screen === 'QUESTS_BADGES' ||
      screen === 'SHOP' ||
      screen === 'BESTIARY' ||
      screen === 'WORLD_LOADING' ||
      screen === 'RESTART_LOADING'
    ) {
      const contextLevelId =
        screen === 'MENU'
          ? (activeLevelId > 1 ? activeLevelId : Math.min(40, saveData.unlockedLevel || 1))
          : activeLevelId;
      const contextLevel = LEVELS.find(l => l.id === contextLevelId) || LEVELS[0];
      const isBossDefeatedInSession = Boolean(
        contextLevel.id === 30 && engineRef.current?.level.cockatrice?.state === 'defeated'
      );
      const isRestoredRealm = Boolean(saveData.hasCompletedGame || isBossDefeatedInSession);
      const fadeDuration = screen === 'WORLD_LOADING' ? 1.6 : screen === 'PAUSED' ? 0.95 : 1.3;
      audio.playBiomeAmbient(contextLevel.theme, isRestoredRealm, fadeDuration);
    } else if (screen === 'PLAYING') {
      updateMusicForLevel(activeLevelId);
    } else if (screen === 'ENDING_CINEMATIC' || screen === 'VICTORY') {
      audio.playMusic('victory', 1.15);
    } else if (screen === 'INTRO_CINEMATIC' || screen === 'DEATH_LOADING') {
      audio.stopMusic(0.35);
    }
  }, [screen, activeLevelId, saveData.unlockedLevel, saveData.hasCompletedGame, updateMusicForLevel]);

  // Trigger AdMob popup interstitial only for mid-world achievements (never when moving to the next world or at the end of the game)
  useEffect(() => {
    if (screen === 'LEVEL_CLEAR') {
      const currLvl = LEVELS.find(l => l.id === activeLevelId);
      const nextLvl = LEVELS.find(l => l.id === activeLevelId + 1);
      const isWorldBoundaryOrGameEnd =
        activeLevelId >= 40 || !nextLvl || (currLvl && nextLvl.world !== currLvl.world);
      if (!isWorldBoundaryOrGameEnd) {
        void showAdMobInterstitial({
          reason: 'achievement_level_clear',
          title: `Stage ${activeLevelId} Cleared!`,
          subtitle: 'Level completion achievement unlocked',
        });
      }
    } else if (screen === 'EVOLUTION') {
      void showAdMobInterstitial({
        reason: 'achievement_evolution',
        title: 'Chicken Evolved!',
        subtitle: 'Major growth milestone unlocked',
      });
    }
  }, [screen, activeLevelId]);

  // Initialize native AdMob bridge, keep banners hidden, and subscribe to interstitial popups
  useEffect(() => {
    void initializeAdMob();
    void hideAdMobBanner();
    const unsubscribe = subscribeAdMobInterstitial((request) => {
      if (engineRef.current) {
        engineRef.current.isPaused = true;
        engineRef.current.setInput({ left: false, right: false, jump: false, attack: false, block: false, down: false });
      }
      setActiveAdMobRequest(request);
    });
    return unsubscribe;
  }, []);

  const handleCloseAdMobInterstitial = useCallback(() => {
    setActiveAdMobRequest(null);
    notifyAdMobInterstitialClosed();
    if (screen === 'PLAYING' && engineRef.current) {
      engineRef.current.isPaused = false;
      engineRef.current.player.invulnerableTimer = Math.max(engineRef.current.player.invulnerableTimer, 1.5);
    }
  }, [screen]);

  // Robust keyboard controls listener using keysHeld Set
  useEffect(() => {
    const keysHeld = new Set<string>();

    const updateControlsFromKeys = () => {
      if (!engineRef.current || screen !== 'PLAYING' || activeAdMobRef.current) return;
      const left = keysHeld.has('keya') || keysHeld.has('arrowleft') || keysHeld.has('a');
      const right = keysHeld.has('keyd') || keysHeld.has('arrowright') || keysHeld.has('d');
      const jump = keysHeld.has('space') || keysHeld.has('keyw') || keysHeld.has('arrowup') || keysHeld.has('w') || keysHeld.has(' ');
      const attack = keysHeld.has('keyx') || keysHeld.has('keyk') || keysHeld.has('x') || keysHeld.has('k');
      const down = keysHeld.has('arrowdown') || keysHeld.has('keys') || keysHeld.has('s');
      const block = keysHeld.has('keyc') || keysHeld.has('c') || keysHeld.has('shiftleft') || keysHeld.has('shiftright') || keysHeld.has('shift') || down;

      engineRef.current.setInput({ left, right, jump, attack, block, down });
    };

    const isFormField = (target: EventTarget | null): boolean => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Never intercept or preventDefault keys when Auth gate or AdMob popup is open, or user is typing in a form field
      if (!hasGameAccess || activeAdMobRef.current || isFormField(e.target)) {
        return;
      }

      const code = e.code.toLowerCase();
      const key = e.key.toLowerCase();

      // Intro continue key (only available once loading hits 100%)
      if (screen === 'INTRO_CINEMATIC') {
        if (introProgressRef.current >= 1.0 && (code === 'space' || code === 'enter' || code === 'escape' || key === ' ' || key === 'enter' || key === 'escape')) {
          e.preventDefault();
          handleStartGame(1, false);
        }
        return;
      }

      // Ending cutscene return key (only once return button is visible)
      if (screen === 'ENDING_CINEMATIC') {
        if (endingProgressRef.current >= 0.85 && (code === 'space' || code === 'enter' || code === 'escape' || key === ' ' || key === 'enter' || key === 'escape')) {
          e.preventDefault();
          setScreen('MENU');
        }
        return;
      }

      if (code === 'escape' || key === 'escape' || code === 'keyp' || key === 'p') {
        e.preventDefault();
        if (screen === 'PLAYING') setScreen('PAUSED');
        else if (screen === 'PAUSED') setScreen('PLAYING');
        return;
      }

      if ((code === 'keyr' || key === 'r') && screen === 'PLAYING') {
        e.preventDefault();
        handleRestartLevel();
        return;
      }

      if ((code === 'keye' || key === 'e') && screen === 'PLAYING') {
        e.preventDefault();
        if (!saveData.hasCompletedGame && saveData.shopClosedUntil && Date.now() < saveData.shopClosedUntil) {
          audio.playHurt();
          return;
        }
        setScreen('SHOP');
        return;
      }

      if ((code === 'keyt' || key === 't') && screen === 'PLAYING') {
        e.preventDefault();
        setEmoteTrayOpen(prev => !prev);
        return;
      }

      if (screen === 'PLAYING' && ['1', '2', '3', '4', '5', '6'].includes(key)) {
        const emoteIndex = Number(key) - 1;
        const targetEmote = EMOTES[emoteIndex];
        if (targetEmote) {
          e.preventDefault();
          if (isEmoteUnlocked(targetEmote.id, saveData)) {
            engineRef.current?.triggerEmote(targetEmote.id);
            setActivePlayerEmote(targetEmote.id);
          } else {
            audio.playHurt();
          }
          return;
        }
      }

      if (screen === 'PLAYING') {
        if (
          code === 'keya' || code === 'arrowleft' || key === 'a' || key === 'arrowleft' ||
          code === 'keyd' || code === 'arrowright' || key === 'd' || key === 'arrowright' ||
          code === 'space' || code === 'keyw' || code === 'arrowup' || key === ' ' || key === 'w' || key === 'arrowup' ||
          code === 'keyx' || code === 'keyk' || key === 'x' || key === 'k' ||
          code === 'keyc' || code === 'arrowdown' || code === 'keys' || key === 'c' || key === 's' ||
          code === 'shiftleft' || code === 'shiftright' || key === 'shift'
        ) {
          e.preventDefault();
        }

        keysHeld.add(code);
        keysHeld.add(key);
        updateControlsFromKeys();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!hasGameAccess || isFormField(e.target)) {
        return;
      }
      const code = e.code.toLowerCase();
      const key = e.key.toLowerCase();

      keysHeld.delete(code);
      keysHeld.delete(key);
      updateControlsFromKeys();
    };

    const handleBlur = () => {
      keysHeld.clear();
      if (engineRef.current) {
        engineRef.current.setInput({ left: false, right: false, jump: false, attack: false, block: false, down: false });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [screen, handleStartGame, handleRestartLevel, hasGameAccess, saveData]);

  // Trigger an unlocked player pixel emote in the game world
  const handleTriggerEmote = useCallback((emoteId: EmoteId) => {
    if (screen !== 'PLAYING' || !engineRef.current) return;
    if (!isEmoteUnlocked(emoteId, saveData)) {
      audio.playHurt();
      return;
    }
    engineRef.current.triggerEmote(emoteId);
    setActivePlayerEmote(emoteId);
  }, [screen, saveData]);

  // Touch controls input bridge
  const handleTouchInput = useCallback((controls: { left?: boolean; right?: boolean; jump?: boolean; attack?: boolean; block?: boolean; down?: boolean }) => {
    if (engineRef.current && screen === 'PLAYING' && !activeAdMobRef.current) {
      engineRef.current.setInput(controls);
    }
  }, [screen]);

  // Resize canvas according to container and visualViewport (handles mobile URL bar show/hide)
  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.visualViewport?.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.visualViewport?.removeEventListener('resize', resizeCanvas);
    };
  }, [resizeCanvas]);

  // Main Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!rendererRef.current) {
      rendererRef.current = new GameRenderer(canvas);
    }
    const renderer = rendererRef.current;

    const loop = (timestamp: number) => {
      const rawDt = lastTimeRef.current > 0 ? (timestamp - lastTimeRef.current) / 1000 : 0.016;
      const dt = Math.max(0.001, Math.min(rawDt, 0.05));
      lastTimeRef.current = timestamp;

      if (screen === 'INTRO_CINEMATIC') {
        introProgressRef.current = Math.min(1.0, introProgressRef.current + dt * 0.25);
        renderer.clear();
        renderer.renderEggIntro(
          introProgressRef.current, 
          timestamp / 1000, 
          saveData.gender || 'rooster', 
          !!saveData.hasCompletedGame,
          saveData.selectedSkin || 'classic'
        );
      } else if (screen === 'ENDING_CINEMATIC') {
        endingProgressRef.current += dt * 0.15;
        renderer.clear();
        renderer.renderEndingCutscene(
          endingProgressRef.current, 
          timestamp / 1000, 
          saveData.gender || 'rooster',
          saveData.selectedSkin || 'classic',
          saveData.armor || 'gold',
          'netherite'
        );
      } else if (screen === 'PLAYING' && engineRef.current) {
        const engine = engineRef.current;
        engine.update(dt);

        renderer.clear();
        const cockatrice = engine.level.cockatrice;
        const isBossNormalized = Boolean(
          cockatrice && cockatrice.state === 'defeated' &&
          ((cockatrice.defeatSubState === 'exploding_ashes' && (cockatrice.defeatTimer ?? 0) >= 0.55) ||
            cockatrice.defeatSubState === 'fly_away' ||
            cockatrice.defeatSubState === 'escaped')
        );
        // The sky turns from red back to normal right as the Cockatrice explodes into bright ashes!
        const isSkyBlue = engine.level.id === 30
          ? isBossNormalized
          : Boolean(saveData.hasCompletedGame);
        // Background animals cheer after defeating the Boss, then stop cheering once you advance on through the 2 new worlds (Desert Lands & Peckerin Coast)
        const shouldAnimalsCheer =
          isSkyBlue &&
          engine.level.world <= 6 &&
          (saveData.unlockedLevel || 1) < 36;
        renderer.renderBackground(engine.level.theme, engine.camera, engine.time, engine.level.id, isSkyBlue, shouldAnimalsCheer);

        // World 8: Peckerin Coast Ocean Water, Underwater Kelp/Starfish & Swimming Sea Fish rendered BEFORE platforms & chests
        // so both the starting raft shore and the floating end treasure-chest land sit cleanly ABOVE the water!
        if (engine.level.theme === 'coast' && engine.level.waterStartX !== undefined && engine.level.waterLevelY !== undefined) {
          renderer.renderCoastalWater(
            engine.level.waterStartX,
            engine.level.waterLevelY,
            engine.level.worldWidth,
            engine.camera,
            engine.time
          );
          if (engine.level.seaFish) {
            renderer.renderSeaFish(engine.level.seaFish, engine.camera, engine.time);
          }
        }

        // Starting Chicken Coop: ONLY appears on Level 1, and never floats (firmly on ground platform)
        if (engine.level.id === 1) {
          renderer.renderStartingCoop(engine.level.spawnPoint, engine.camera, engine.time, engine.level.platforms, engine.player);
        }

        // Platforms
        engine.level.platforms.forEach(p => renderer.renderPlatform(p, engine.camera, engine.level.enemies, engine.level.theme, isSkyBlue));

        // Interactive swinging farm gates inside fence gaps (react when chicken walks/jumps through!)
        renderer.renderFenceGates(engine.level.platforms, engine.player, engine.camera, engine.time);

        // Spikes Obstacles
        if (engine.level.spikes) {
          renderer.renderSpikes(engine.level.spikes, engine.camera);
        }

        // World 7 Prickly Desert Cactuses (Saguaro, Prickly Pear & Golden Barrel)
        if (engine.level.cacti) {
          renderer.renderDesertCacti(engine.level.cacti, engine.camera, engine.time);
        }

        // Checkpoints: firmly planted on the floating land (never floating in air!)
        engine.level.checkpoints.forEach(cp => renderer.renderCheckpoint(cp, engine.camera, engine.time, engine.level.platforms));

        // Level 1 Archaeology Digging Brush Pickup
        if (engine.level.brushPickup) {
          renderer.renderBrushPickup(engine.level.brushPickup, engine.camera, engine.time);
        }

        // Treasure Chests & Buried Dig Mounds (non-rock chests rendered here)
        engine.level.chests.forEach(chest => {
          if (!chest.isRockChest) {
            renderer.renderChest(chest, engine.camera, engine.time, engine.level.theme);
          }
        });

        // Hazards
        if (engine.level.volcanoes) {
          engine.level.volcanoes.forEach(v => renderer.renderVolcano(v, engine.camera));
        }
        if (engine.level.boulders) {
          engine.level.boulders.forEach(b => renderer.renderBoulder(b, engine.camera, engine.level.theme));
        }
        if (engine.level.thunderclouds) {
          engine.level.thunderclouds.forEach(th => renderer.renderThundercloud(th, engine.camera, engine.time));
        }

        // Coins
        engine.level.coins.forEach(c => renderer.renderCoin(c, engine.camera, engine.time));

        // Enemies (biome-authentic coat variants; Level 30 Cockatrice lair enemies appear infected in red & black)
        if (engine.level.enemies) {
          engine.level.enemies.forEach(e => renderer.renderEnemy(e, engine.camera, engine.level.theme, engine.level.id));
        }

        // World 8: Coastal Axe Stump, Choppable Trees, Wood Logs, Sea Rocks, Sharks & Wooden Raft
        if (engine.level.axeStump) {
          renderer.renderAxeStump(engine.level.axeStump, engine.camera, engine.time);
        }
        if (engine.level.choppableTrees) {
          renderer.renderChoppableTrees(engine.level.choppableTrees, engine.camera, engine.time);
        }
        if (engine.level.woodLogs) {
          renderer.renderWoodLogs(engine.level.woodLogs, engine.camera, engine.time);
        }
        if (engine.level.seaRocks && engine.level.waterLevelY !== undefined) {
          renderer.renderSeaRocks(engine.level.seaRocks, engine.level.waterLevelY, engine.camera, engine.time);
        }
        // Peckerin Coast Sea Rock Chests perched directly on top of jagged sea rocks!
        engine.level.chests.forEach(chest => {
          if (chest.isRockChest) {
            renderer.renderChest(chest, engine.camera, engine.time, engine.level.theme);
          }
        });
        if (engine.level.sharks) {
          renderer.renderSeaSharks(engine.level.sharks, engine.camera, engine.time);
        }
        if (engine.level.raft) {
          renderer.renderCoastalRaft(
            engine.level.raft,
            engine.player.woodCount || 0,
            engine.player.woodTarget || engine.level.woodTarget || 3,
            engine.camera,
            engine.time
          );
        }

        // Mini-Boss: Old Farmer Jed (Level 1 baby peck encounter & adult rematch)
        if (engine.level.farmer) {
          renderer.renderFarmer(engine.level.farmer, engine.camera, engine.time);
        }

        // Player Chick with armor, sword, crouch tuck, held axe, and equipped appearance skin
        renderer.renderPlayer(engine.player, engine.camera, engine.time, engine.armorType, engine.swordType, { skin: saveData.selectedSkin || 'classic' });

        // World 7: Swooping Desert Falcons & Shield-Snatch Cutscene
        if (engine.level.falcons) {
          renderer.renderDesertFalcons(engine.level.falcons, engine.camera, engine.time);
        }
        if (engine.shieldSnatchCutscene && engine.shieldSnatchCutscene.active) {
          renderer.renderShieldSnatchCutscene(engine.shieldSnatchCutscene, engine.camera, engine.time);
        }

        // World 8: Innocent Coastal Seagulls soaring, catching fish & resting on the raft
        if (engine.level.seagulls) {
          renderer.renderCoastalSeagulls(engine.level.seagulls, engine.camera, engine.time);
        }

        // The Ancient Cockatrice Boss Fight!
        if (engine.level.cockatrice) {
          renderer.renderCockatrice(engine.level.cockatrice, engine.camera, engine.time);
          if (engine.level.cockatrice.fireProjectiles) {
            renderer.renderBossFireProjectiles(engine.level.cockatrice.fireProjectiles, engine.camera, engine.time);
          }
          renderer.renderInfernoFlame(engine.level.cockatrice, engine.player, engine.camera, engine.time);
          renderer.renderBossIntro(engine.level.cockatrice, engine.time);
          renderer.renderBossDialogue(engine.level.cockatrice, engine.camera);
          renderer.renderBossCountdown(engine.level.cockatrice, engine.time);
        }

        // Local Friend: Silkie Sam delivering Royal Shield in Level 30
        if (engine.level.silkieSam) {
          renderer.renderSilkieSam(engine.level.silkieSam, engine.camera, engine.time);
        }

        // Biome-specific ambient atmospheric effects (pollen, fireflies, arctic glints, embers/petals, desert sand, coastal spray)
        renderer.renderBiomeAmbientEffects(engine.level.theme, engine.camera, engine.time, isSkyBlue);

        // Particles & Floating Text
        renderer.renderParticles(engine.particles, engine.camera);
        renderer.renderFloatingTexts(engine.floatingTexts, engine.camera);

        // Bright blinding explosion flash when Cockatrice bursts into ashes
        if (engine.level.cockatrice) {
          renderer.renderBossAshExplosionFlash(engine.level.cockatrice);
          renderer.renderBossBar(engine.level.cockatrice, engine.time);
        }

        // Sync HUD state ONLY when values actually change (prevents unnecessary 60fps React re-checks)
        const hud = hudSyncRef.current;
        const currentFireResist = engine.player.fireResistTimer ?? 0;
        if (
          (hud.fireResist === 0 && currentFireResist > 0) ||
          (hud.fireResist > 0 && currentFireResist === 0) ||
          Math.abs(hud.fireResist - currentFireResist) >= 0.1 ||
          Math.ceil(hud.fireResist) !== Math.ceil(currentFireResist)
        ) {
          hud.fireResist = currentFireResist;
          setPlayerFireResistTimer(currentFireResist);
        }

        const currentEmote = engine.player.activeEmote ?? null;
        if (hud.emote !== currentEmote) {
          hud.emote = currentEmote;
          setActivePlayerEmote(currentEmote);
        }

        const isNowOnRaft = Boolean(engine.player.onRaft);
        if (hud.onRaft !== isNowOnRaft) {
          hud.onRaft = isNowOnRaft;
          setPlayerOnRaft(isNowOnRaft);
        }

        const nowHasShield = Boolean(engine.hasShield);
        if (hud.hasShield !== nowHasShield) {
          hud.hasShield = nowHasShield;
          setActiveHasShield(nowHasShield);
        }

        const currentPoison = engine.player.poisonTimer ?? 0;
        const currentPoisonMax = engine.player.poisonMaxDuration ?? 0;
        if (
          (hud.poison === 0 && currentPoison > 0) ||
          (hud.poison > 0 && currentPoison === 0) ||
          Math.floor(hud.poison * 10) !== Math.floor(currentPoison * 10)
        ) {
          hud.poison = currentPoison;
          setPlayerPoisonTimer(currentPoison);
        }
        if (hud.poisonMax !== currentPoisonMax) {
          hud.poisonMax = currentPoisonMax;
          setPlayerPoisonMaxDuration(currentPoisonMax);
        }
      }

      reqAnimRef.current = requestAnimationFrame(loop);
    };

    reqAnimRef.current = requestAnimationFrame(loop);

    return () => {
      if (reqAnimRef.current) {
        cancelAnimationFrame(reqAnimRef.current);
      }
    };
  }, [
    screen,
    handleStartGame,
    saveData.gender,
    saveData.armor,
    saveData.sword,
    saveData.selectedSkin,
    saveData.hasCompletedGame,
    saveData.unlockedLevel,
    saveData.unlockedSkins,
    saveData.shopClosedUntil,
    saveData.hasVisitedShop,
  ]);

  const currentLevelData = LEVELS.find(l => l.id === activeLevelId) || LEVELS[0];

  return (
    <main
      ref={containerRef}
      tabIndex={0}
      className={`fixed inset-0 w-full h-[100dvh] overflow-hidden bg-slate-950 font-body select-none outline-none ${
        immersiveFullscreen ? 'z-[9999]' : ''
      }`}
      onClick={(e) => {
        if (!hasGameAccess) return;
        const target = e.target as HTMLElement | null;
        if (target && ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'LABEL', 'A'].includes(target.tagName)) {
          return;
        }
        containerRef.current?.focus();
        if (screen === 'INTRO_CINEMATIC') {
          if (introProgressRef.current >= 1.0) {
            handleStartGame(1, false);
          }
        } else if (screen === 'ENDING_CINEMATIC') {
          if (endingProgressRef.current >= 0.85) {
            setScreen('MENU');
          }
        } else if (screen === 'PLAYING' && engineRef.current) {
          engineRef.current.advanceBossDialogue();
        }
      }}
    >
      {/* 2D Pixel Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />

      {/* Retro 8-Bit Arcade CRT Scanlines & Screen Vignette */}
      <div className="crt-scanlines pointer-events-none" />



      {/* Active Game HUD */}
      {screen === 'PLAYING' && (
        <>
          <GameHUD
            levelNumber={activeLevelId}
            worldName={currentLevelData.worldName}
            levelTitle={currentLevelData.title}
            health={playerHealth}
            maxHealth={3 + (saveData.upgrades?.extraHearts || 0)}
            coins={saveData.totalCoins + coinsEarned}
            stage={playerStage}
            armor={saveData.armor}
            sword={saveData.sword}
            fireResistTimer={playerFireResistTimer}
            poisonTimer={playerPoisonTimer}
            poisonMaxDuration={playerPoisonMaxDuration}
            soundEnabled={saveData.soundEnabled}
            musicEnabled={saveData.musicEnabled}
            showTouchControls={showTouchControls}
            isFullscreen={isFullscreen}
            onToggleSound={handleToggleSound}
            onToggleMusic={handleToggleMusic}
            onToggleTouchControls={() => {
              userToggledTouchRef.current = true;
              setShowTouchControls(p => !p);
            }}
            onToggleFullscreen={handleToggleFullscreen}
            onPause={() => setScreen('PAUSED')}
            onReturnToMenu={() => setScreen('MENU')}
            onLogOut={handleLogOut}
            unlockedEmotes={getUnlockedEmotes(saveData)}
            activeEmote={activePlayerEmote}
            shopPurchases={saveData.stats?.shopPurchases || 0}
            emoteTrayOpen={emoteTrayOpen}
            onToggleEmoteTray={() => setEmoteTrayOpen(prev => !prev)}
            onTriggerEmote={handleTriggerEmote}
          />

          {/* On-Screen Touch / Click Controls */}
          {showTouchControls && (
            <TouchControls
              onInput={handleTouchInput}
              canAttack={true}
              hasShield={activeHasShield}
              biome={currentLevelData.theme}
              onRaft={playerOnRaft}
              onPause={() => setScreen('PAUSED')}
              isFullscreen={isFullscreen}
              onToggleFullscreen={handleToggleFullscreen}
            />
          )}
        </>
      )}

      {/* Interactive Modals and Screens */}
      <GameModals
        currentScreen={screen}
        saveData={saveData}
        activeLevelId={activeLevelId}
        coinsEarned={coinsEarned}
        evolutionStage={evolutionStage}
        renderer={rendererRef.current}
        foundBadge={foundBadge}
        onDismissFoundBadge={() => setFoundBadge(null)}
        onStartGame={handleStartGame}
        onStartNewRun={handleStartNewRun}
        onSelectGender={handleSelectGender}
        onResume={() => setScreen('PLAYING')}
        onRestartLevel={handleRestartLevel}
        onRespawn={handleRespawn}
        onNextLevel={handleNextLevel}
        onSelectLevel={handleSelectLevel}
        onReturnToMenu={() => {
          setScreen('MENU');
        }}
        onOpenScreen={(s) => {
          if (s === 'SHOP' && !saveData.hasCompletedGame && saveData.shopClosedUntil && Date.now() < saveData.shopClosedUntil) {
            audio.playHurt();
            return;
          }
          setScreen(s);
        }}
        onToggleSound={handleToggleSound}
        onToggleMusic={handleToggleMusic}
        onResetProgress={handleResetProgress}
        onClaimQuest={handleClaimQuest}
        onPurchaseUpgrade={handlePurchaseUpgrade}
        onMarkShopVisited={handleMarkShopVisited}
        onClaimBossReward={handleClaimBossReward}
        onFinishWorldLoading={handleFinishWorldLoading}
        onFinishRestartLoading={handleFinishRestartLoading}
        onFinishDeathLoading={handleFinishDeathLoading}
        onToggleShopStatus={handleToggleShopStatus}
        onBuySkin={handleBuySkin}
        onEquipSkin={handleEquipSkin}
        onUnlockSkin={handleUnlockSkin}
        onChangeDifficulty={handleChangeDifficulty}
        currentUser={currentUser}
        onLogOut={handleLogOut}
      />

      {/* Persistent Top-Right Corner Fullscreen, Back to Menu & Log Out Bar on all non-gameplay screens */}
      {hasGameAccess && screen !== 'PLAYING' && (
        <div className="fixed top-2.5 right-3 sm:top-4 sm:right-5 z-[55] flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className={`px-2.5 py-1.5 border-2 font-pixel text-[8px] sm:text-[9px] shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5 ${
              isFullscreen
                ? 'bg-emerald-950/95 hover:bg-emerald-900 border-emerald-400 text-emerald-200'
                : 'bg-slate-900/95 hover:bg-slate-800 border-amber-400 text-yellow-300'
            }`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 text-emerald-300" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-yellow-400" />
            )}
            <span>{isFullscreen ? 'EXIT FULL' : 'FULL SCREEN'}</span>
          </button>
          {screen !== 'MENU' && (
            <button
              type="button"
              onClick={() => setScreen('MENU')}
              className="px-2.5 py-1.5 bg-slate-900/95 hover:bg-slate-800 border-2 border-amber-400 text-yellow-300 font-pixel text-[8px] sm:text-[9px] shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
              title="Back to Main Menu"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-yellow-400" />
              <span>BACK TO MENU</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleLogOut}
            className="px-2.5 py-1.5 bg-red-950/95 hover:bg-red-900 border-2 border-red-500 text-red-200 font-pixel text-[8px] sm:text-[9px] shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
            title="Log out of account"
          >
            <LogOut className="w-3.5 h-3.5 text-red-300" />
            <span>LOG OUT</span>
          </button>
        </div>
      )}

      {/* Brief Dismissible iOS/Mobile Fullscreen Tip Banner */}
      {fullscreenTip && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[10000] max-w-[92vw] sm:max-w-md bg-slate-900/95 border-[3px] border-amber-400 px-3 py-2 shadow-[4px_4px_0_#000] flex items-center gap-2.5 pointer-events-auto">
          <span className="font-pixel text-[7.5px] sm:text-[8.5px] text-amber-200 leading-relaxed">
            {fullscreenTip}
          </span>
          <button
            type="button"
            onClick={() => setFullscreenTip(null)}
            className="p-1 bg-slate-800 border-2 border-black text-yellow-300 hover:bg-slate-700 shrink-0 cursor-pointer"
            aria-label="Dismiss tip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Google AdMob Interstitial Ad Popup (Life Lost & In-Game Achievements) */}
      <AdMobInterstitialModal
        request={activeAdMobRequest}
        onClose={handleCloseAdMobInterstitial}
      />

      {/* Registration & Login Gate: Must be registered & email verified before playing */}
      {authLoading ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 font-pixel text-yellow-400 gap-3">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent animate-spin" />
          <span className="text-[10px] tracking-widest animate-pulse">CHECKING ADVENTURER PASSPORT...</span>
        </div>
      ) : !hasGameAccess ? (
        <AuthModal
          currentUser={currentUser}
          onAuthSuccess={handleAuthSuccess}
          onContinueWithoutVerification={currentUser ? () => setAllowUnverifiedLocalPlay(true) : undefined}
        />
      ) : null}
    </main>
  );
}
