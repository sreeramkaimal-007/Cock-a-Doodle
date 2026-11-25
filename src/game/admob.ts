// Hybrid Google AdMob Bridge for Native Mobile Containers (Capacitor / Android & iOS WebView)
// On standard web browsers, AdBanner automatically uses Google AdSense instead.

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
let lastInterstitialAt = 0;
const INTERSTITIAL_COOLDOWN_MS = 90_000;

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

export async function showAdMobInterstitial(): Promise<boolean> {
  if (!isNativeAdMobAvailable()) return false;
  const now = Date.now();
  if (now - lastInterstitialAt < INTERSTITIAL_COOLDOWN_MS) return false;

  const { interstitialId } = getAdMobUnitIds();
  if (!interstitialId.trim()) return false;

  await initializeAdMob();
  const win = window as NativeBridgeWindow;

  try {
    const plugin = win.Capacitor?.Plugins?.AdMob;
    if (plugin?.prepareInterstitial && plugin?.showInterstitial) {
      await plugin.prepareInterstitial({ adId: interstitialId.trim() });
      await plugin.showInterstitial();
      lastInterstitialAt = now;
      return true;
    }
    if (win.AndroidAdMob?.showInterstitial) {
      win.AndroidAdMob.showInterstitial(interstitialId.trim());
      lastInterstitialAt = now;
      return true;
    }
    if (win.webkit?.messageHandlers?.admob) {
      win.webkit.messageHandlers.admob.postMessage({ action: 'showInterstitial', adUnitId: interstitialId.trim() });
      lastInterstitialAt = now;
      return true;
    }
  } catch {
    // Ignore interstitial failures
  }
  return false;
}
