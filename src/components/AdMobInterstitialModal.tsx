import React, { useEffect, useRef, useState } from 'react';
import { Award, HeartCrack, ShieldCheck, X } from 'lucide-react';
import { AdMobInterstitialRequest } from '../game/admob';

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

const DEFAULT_ADSENSE_CLIENT_ID = 'ca-pub-3743078627568874';
const DEFAULT_ADSENSE_INTERSTITIAL_SLOT = '8859422748';
const SKIP_COUNTDOWN_SECONDS = 3;

interface AdMobInterstitialModalProps {
  request: AdMobInterstitialRequest | null;
  onClose: () => void;
}

export const AdMobInterstitialModal: React.FC<AdMobInterstitialModalProps> = ({
  request,
  onClose,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(SKIP_COUNTDOWN_SECONDS);
  const [adFilled, setAdFilled] = useState<boolean>(false);
  const adContainerRef = useRef<HTMLDivElement | null>(null);
  const pushedRequestIdRef = useRef<number | null>(null);

  const clientId = (import.meta.env.VITE_ADSENSE_CLIENT_ID || DEFAULT_ADSENSE_CLIENT_ID).trim();
  const slotId = (import.meta.env.VITE_ADSENSE_SLOT_INTERMISSION || DEFAULT_ADSENSE_INTERSTITIAL_SLOT).trim();

  // Countdown timer before the ad can be dismissed
  useEffect(() => {
    if (!request) return;
    setSecondsLeft(SKIP_COUNTDOWN_SECONDS);
    setAdFilled(false);

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [request]);

  // Push live Google AdSense unit inside the interstitial slot and watch if it renders
  useEffect(() => {
    if (!request || !clientId || !slotId) return;
    if (pushedRequestIdRef.current === request.id) return;
    pushedRequestIdRef.current = request.id;

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // Ad blockers or preview iframes may block live AdSense; fallback card stays visible
    }

    const checkTimer = window.setTimeout(() => {
      const ins = adContainerRef.current?.querySelector('ins.adsbygoogle') as HTMLElement | null;
      if (!ins) return;
      const status = ins.getAttribute('data-ad-status');
      const hasIframe = Boolean(ins.querySelector('iframe'));
      if (status === 'filled' || (hasIframe && ins.offsetHeight >= 90)) {
        setAdFilled(true);
      }
    }, 900);

    return () => window.clearTimeout(checkTimer);
  }, [request, clientId, slotId]);

  // Allow Escape key to close once countdown finishes
  useEffect(() => {
    if (!request) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && secondsLeft === 0) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [request, secondsLeft, onClose]);

  if (!request) return null;

  const isLifeEvent = request.reason === 'life_lost' || request.reason === 'game_over';
  const canClose = secondsLeft === 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Google AdMob Interstitial Advertisement"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 pointer-events-auto"
      onClick={(e) => {
        e.stopPropagation();
        if (canClose && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md bg-slate-900 border-2 border-slate-700 shadow-2xl overflow-hidden text-slate-100">
        {/* Top Interstitial Header Bar */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400 min-w-0">
            <span className="font-bold text-amber-300 tracking-wide shrink-0">Ad</span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-slate-200 whitespace-nowrap shrink-0">Google AdMob</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="truncate hidden sm:inline text-slate-400">
              {isLifeEvent ? 'Life Lost' : 'Achievement'}
            </span>
          </div>

          <button
            type="button"
            disabled={!canClose}
            onClick={onClose}
            className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-amber-400 ${
              canClose
                ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 cursor-pointer'
                : 'bg-slate-900 text-slate-400 border border-slate-800 cursor-not-allowed'
            }`}
            aria-label={canClose ? 'Close advertisement' : `Wait ${secondsLeft} seconds to close`}
          >
            {canClose ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>Close Ad</span>
              </>
            ) : (
              <span className="tabular-nums">Close in {secondsLeft}s</span>
            )}
          </button>
        </div>

        {/* Trigger Context Banner */}
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800/80 flex items-center gap-3">
          <div
            className={`w-9 h-9 flex items-center justify-center shrink-0 border ${
              isLifeEvent
                ? 'bg-red-950/70 border-red-700/70 text-red-300'
                : 'bg-amber-950/70 border-amber-600/70 text-amber-300'
            }`}
          >
            {isLifeEvent ? (
              <HeartCrack className="w-4 h-4" />
            ) : (
              <Award className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-pixel text-[10px] sm:text-[11px] text-white truncate">
              {request.title}
            </div>
            <div className="text-xs text-slate-400 truncate mt-0.5">
              {request.subtitle}
            </div>
          </div>
        </div>

        {/* Interstitial Ad Creative Slot (Live Google AdSense + Polished AdMob Fallback) */}
        <div
          ref={adContainerRef}
          className="relative min-h-[260px] w-full bg-slate-950 flex flex-col items-center justify-center p-5"
        >
          {/* Live Google AdSense / AdMob Web Ad Unit */}
          {clientId && slotId && (
            <div className={`w-full flex items-center justify-center ${adFilled ? 'relative z-10' : 'absolute inset-0 opacity-0 pointer-events-none'}`}>
              <ins
                key={request.id}
                className="adsbygoogle block w-full"
                style={{ display: 'block', minHeight: '250px', width: '100%' }}
                data-ad-client={clientId}
                data-ad-slot={slotId}
                data-ad-format="rectangle"
                data-full-width-responsive="true"
              />
            </div>
          )}

          {/* Fallback AdMob Interstitial Display (visible when live ad fill is unavailable in preview/sandbox) */}
          {!adFilled && (
            <div className="w-full flex flex-col items-center text-center gap-4 py-3">
              <div className="w-14 h-14 bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-7 h-7" />
              </div>

              <div className="space-y-1.5 max-w-xs">
                <p className="text-sm font-semibold text-white">
                  Google AdMob Interstitial
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isLifeEvent
                    ? 'Sponsored intermission shown after losing a life. Your game is safely paused until you continue.'
                    : 'Sponsored intermission celebrating your in-game achievement. Great progress!'}
                </p>
              </div>

              <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                Ad Unit · {request.adUnitId}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Footer */}
        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">
            {canClose ? 'Ready to return to game' : 'AdMob Interstitial · Game paused'}
          </span>

          <button
            type="button"
            disabled={!canClose}
            onClick={onClose}
            className={`min-h-[40px] px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-amber-400 ${
              canClose
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {canClose ? 'Continue Game' : `Wait ${secondsLeft}s`}
          </button>
        </div>
      </div>
    </div>
  );
};
