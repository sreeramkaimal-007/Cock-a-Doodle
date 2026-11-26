// Hybrid Google AdMob Bridge for Native Mobile Containers (Capacitor / Android & iOS WebView)
// with an interactive full-screen AdMob / AdSense Interstitial Popup fallback on Web browsers.

export type AdMobInterstitialReason =
  | 'life_lost'
  | 'game_over'
  | 'achievement_badge'
  | 'achievement_quest'
  | 'achievement_level_clear'
  | 'achievement_evolution'
  | 'achievement_world'
  | 'achievement_victory'
  | 'achievement_skin';

export interface AdMobInterstitialOptions {
  reason?: AdMobInterstitialReason;
  title?: string;
  subtitle?: string;
  bypassCooldown?: boolean;
}

export interface AdMobInterstitialRequest {
  id: number;
  reason: AdMobInterstitialReason;
  title: string;
  subtitle: string;
  adUnitId: string;
  isNativeConfigured: boolean;
}

type InterstitialListener = (request: AdMobInterstitialRequest) => void;

interface CapacitorAdMobPlugin {
  initialize?: (options?: {
    requestTrackingAuthorization?: boolean;
    initializeForTesting?: boolean;
  }) => Promise<void>;
  showBanner?: (options: {
    adId: string;
    adSize?: string;
    position?: string;
    margin?: number;
    isTesting?: boolean;
  }) => Promise<void>;
  hideBanner?: () => Promise<void>;
  removeBanner?: () => Promise<void>;
  prepareInterstitial?: (options: { adId: string; isTesting?: boolean }) => Promise<void>;
  showInterstitial?: () => Promise<void>;
  prepareRewardVideoAd?: (options: { adId: string; isTesting?: boolean }) => Promise<void>;
  showRewardVideoAd?: () => Promise<unknown>;
}

interface NativeBridgeWindow extends Window {
  Capacitor?: {
    isNativePlatform?: () => boolean;
    getPlatform?: () => 'android' | 'ios' | 'web';
    Plugins?: {
      AdMob?: CapacitorAdMobPlugin;
    };
  };
  AndroidAdMob?: {
    showBanner?: (adUnitId: string) => void;
    hideBanner?: () => void;
    showInterstitial?: (adUnitId: string) => void;
    showRewarded?: (adUnitId: string) => void;
  };
  webkit?: {
    messageHandlers?: {
      admob?: {
        postMessage: (payload: Record<string, unknown>) => void;
      };
    };
  };
}

let admobInitialized = false;
let lastLifeLostAdAt = 0;
let lastAnyInterstitialAt = 0;
let interstitialRequestSeq = 0;
let isWebInterstitialOpen = false;

const LIFE_LOST_COOLDOWN_MS = 12_000;
const DEDUP_WINDOW_MS = 2_500;

const interstitialListeners = new Set<InterstitialListener>();

export function subscribeAdMobInterstitial(listener: InterstitialListener): () => void {
  interstitialListeners.add(listener);
  return () => {
    interstitialListeners.delete(listener);
  };
}

export function notifyAdMobInterstitialClosed(): void {
  isWebInterstitialOpen = false;
}

function getPlatform(): 'android' | 'ios' | 'web' {
  if (typeof window === 'undefined') return 'web';
  const win = window as NativeBridgeWindow;
  const capPlatform = win.Capacitor?.getPlatform?.();
  if (capPlatform === 'android' || capPlatform === 'ios') return capPlatform;
  const ua = navigator.userAgent || '';
  if (/android/i.test(ua) && (win.AndroidAdMob || win.Capacitor?.isNativePlatform?.())) return 'android';
  if (/iPad|iPhone|iPod/.test(ua) && (win.webkit?.messageHandlers?.admob || win.Capacitor?.isNativePlatform?.())) return 'ios';
  return 'web';
}

export function getAdMobUnitIds() {
  const platform = getPlatform();
  const isIos = platform === 'ios';

  return {
    platform,
    appId: (isIos
      ? import.meta.env.VITE_ADMOB_APP_ID_IOS
      : import.meta.env.VITE_ADMOB_APP_ID_ANDROID) || '',
    bannerId: (isIos
      ? import.meta.env.VITE_ADMOB_BANNER_ID_IOS
      : import.meta.env.VITE_ADMOB_BANNER_ID_ANDROID) || '',
    interstitialId: (isIos
      ? import.meta.env.VITE_ADMOB_INTERSTITIAL_ID_IOS
      : import.meta.env.VITE_ADMOB_INTERSTITIAL_ID_ANDROID) || '',
    rewardedId: (isIos
      ? import.meta.env.VITE_ADMOB_REWARDED_ID_IOS
      : import.meta.env.VITE_ADMOB_REWARDED_ID_ANDROID) || '',
  };
}

export function isNativeAdMobAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as NativeBridgeWindow;
  return Boolean(
    (win.Capacitor?.isNativePlatform?.() && win.Capacitor?.Plugins?.AdMob) ||
    win.AndroidAdMob ||
    win.webkit?.messageHandlers?.admob
  );
}

export async function initializeAdMob(): Promise<void> {
  if (admobInitialized || !isNativeAdMobAvailable()) return;
  const win = window as NativeBridgeWindow;
  try {
    const plugin = win.Capacitor?.Plugins?.AdMob;
    if (plugin?.initialize) {
      await plugin.initialize({ requestTrackingAuthorization: true });
    }
    admobInitialized = true;
  } catch {
    // Ignore initialization failures when native AdMob SDK is not linked yet
  }
}

export async function showAdMobBanner(): Promise<boolean> {
  if (!isNativeAdMobAvailable()) return false;
  const { bannerId } = getAdMobUnitIds();
  if (!bannerId.trim()) return false;

  await initializeAdMob();
  const win = window as NativeBridgeWindow;

  try {
    const plugin = win.Capacitor?.Plugins?.AdMob;
    if (plugin?.showBanner) {
      await plugin.showBanner({
        adId: bannerId.trim(),
        adSize: 'ADAPTIVE_BANNER',
        position: 'BOTTOM_CENTER',
        margin: 0,
      });
      return true;
    }
    if (win.AndroidAdMob?.showBanner) {
      win.AndroidAdMob.showBanner(bannerId.trim());
      return true;
    }
    if (win.webkit?.messageHandlers?.admob) {
      win.webkit.messageHandlers.admob.postMessage({ action: 'showBanner', adUnitId: bannerId.trim() });
      return true;
    }
  } catch {
    // Ignore native ad errors so gameplay is never interrupted
  }
  return false;
}

export async function hideAdMobBanner(): Promise<void> {
  if (!isNativeAdMobAvailable()) return;
  const win = window as NativeBridgeWindow;
  try {
    const plugin = win.Capacitor?.Plugins?.AdMob;
    if (plugin?.hideBanner) {
      await plugin.hideBanner();
    } else if (win.AndroidAdMob?.hideBanner) {
      win.AndroidAdMob.hideBanner();
    } else if (win.webkit?.messageHandlers?.admob) {
      win.webkit.messageHandlers.admob.postMessage({ action: 'hideBanner' });
    }
  } catch {
    // Ignore hide errors
  }
}

function getDefaultMetaForReason(reason: AdMobInterstitialReason): { title: string; subtitle: string } {
  switch (reason) {
    case 'life_lost':
      return { title: 'Life Lost', subtitle: 'Take a quick breather before continuing' };
    case 'game_over':
      return { title: 'Out of Lives', subtitle: 'Defeated in battle — ready for your next attempt' };
    case 'achievement_badge':
      return { title: 'Badge Unlocked', subtitle: 'New Hero Achievement Earned' };
    case 'achievement_quest':
      return { title: 'Quest Completed', subtitle: 'Reward Claimed Achievement' };
    case 'achievement_level_clear':
      return { title: 'Stage Cleared', subtitle: 'Level Completion Achievement' };
    case 'achievement_evolution':
      return { title: 'Chicken Evolved', subtitle: 'Major Growth Milestone Reached' };
    case 'achievement_world':
      return { title: 'New World Unlocked', subtitle: 'Advancing to the Next Realm' };
    case 'achievement_victory':
      return { title: 'Victory Achieved', subtitle: 'Ancient Cockatrice Defeated' };
    case 'achievement_skin':
      return { title: 'Skin Unlocked', subtitle: 'New Appearance Achievement' };
    default:
      return { title: 'Sponsored Break', subtitle: 'Google AdMob Interstitial' };
  }
}

export async function showAdMobInterstitial(options: AdMobInterstitialOptions = {}): Promise<boolean> {
  const reason: AdMobInterstitialReason = options.reason || 'achievement_level_clear';
  const now = Date.now();

  // Prevent overlapping interstitials or duplicate triggers within the same frame/event burst
  if (isWebInterstitialOpen) return false;
  if (!options.bypassCooldown) {
    if (now - lastAnyInterstitialAt < DEDUP_WINDOW_MS) return false;
    if (reason === 'life_lost' && now - lastLifeLostAdAt < LIFE_LOST_COOLDOWN_MS) return false;
  }

  const { interstitialId } = getAdMobUnitIds();
  const trimmedInterstitialId = interstitialId.trim();

  // 1. Try native Google AdMob SDK first when running inside Android/iOS native wrapper
  if (isNativeAdMobAvailable() && trimmedInterstitialId) {
    await initializeAdMob();
    const win = window as NativeBridgeWindow;

    try {
      const plugin = win.Capacitor?.Plugins?.AdMob;
      if (plugin?.prepareInterstitial && plugin?.showInterstitial) {
        await plugin.prepareInterstitial({ adId: trimmedInterstitialId });
        await plugin.showInterstitial();
        lastAnyInterstitialAt = now;
        if (reason === 'life_lost') lastLifeLostAdAt = now;
        return true;
      }
      if (win.AndroidAdMob?.showInterstitial) {
        win.AndroidAdMob.showInterstitial(trimmedInterstitialId);
        lastAnyInterstitialAt = now;
        if (reason === 'life_lost') lastLifeLostAdAt = now;
        return true;
      }
      if (win.webkit?.messageHandlers?.admob) {
        win.webkit.messageHandlers.admob.postMessage({ action: 'showInterstitial', adUnitId: trimmedInterstitialId });
        lastAnyInterstitialAt = now;
        if (reason === 'life_lost') lastLifeLostAdAt = now;
        return true;
      }
    } catch {
      // Fall through to in-app interstitial modal if native call fails
    }
  }

  // 2. Web / PWA / Preview fallback: emit an AdMob Interstitial Popup request to the UI
  if (interstitialListeners.size > 0) {
    const defaults = getDefaultMetaForReason(reason);
    const request: AdMobInterstitialRequest = {
      id: ++interstitialRequestSeq,
      reason,
      title: options.title || defaults.title,
      subtitle: options.subtitle || defaults.subtitle,
      adUnitId: trimmedInterstitialId || 'ca-pub-3743078627568874',
      isNativeConfigured: Boolean(trimmedInterstitialId),
    };
    isWebInterstitialOpen = true;
    lastAnyInterstitialAt = now;
    if (reason === 'life_lost') lastLifeLostAdAt = now;
    interstitialListeners.forEach((listener) => listener(request));
    return true;
  }

  return false;
}
