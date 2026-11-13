import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

const DEFAULT_ADSENSE_CLIENT_ID = 'ca-pub-3743078627568874';
const DEFAULT_ADSENSE_SLOT_ID = '8859422748';

interface AdBannerProps {
  slotId?: string;
  format?: 'auto' | 'horizontal' | 'rectangle';
  className?: string;
}

let adsenseScriptLoaded = false;

function ensureAdSenseScript(clientId: string) {
  if (adsenseScriptLoaded || typeof document === 'undefined') return;
  const existing = document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]');
  if (existing) {
    adsenseScriptLoaded = true;
    return;
  }
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
  adsenseScriptLoaded = true;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  slotId,
  format = 'auto',
  className = '',
}) => {
  const pushedRef = useRef(false);
  const clientId = (import.meta.env.VITE_ADSENSE_CLIENT_ID || DEFAULT_ADSENSE_CLIENT_ID).trim();
  const resolvedSlot = (slotId || DEFAULT_ADSENSE_SLOT_ID).trim();

  useEffect(() => {
    if (!clientId || !resolvedSlot || pushedRef.current) return;
    ensureAdSenseScript(clientId);
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      pushedRef.current = true;
    } catch {
      // Ignore AdSense push errors when blocked by ad blockers or preview environments
    }
  }, [clientId, resolvedSlot]);

  if (!clientId || !resolvedSlot) {
    return null;
  }

  return (
    <div className={`w-full flex flex-col items-center justify-center ${className}`}>
      <span className="font-pixel text-[7px] text-slate-500 tracking-widest mb-1 uppercase">
        Advertisement
      </span>
      <div className="w-full min-h-[60px] overflow-hidden rounded-xl border border-slate-700/70 bg-slate-950/80 flex items-center justify-center">
        <ins
          className="adsbygoogle block w-full"
          style={{ display: 'block', textAlign: 'center' }}
          data-ad-client={clientId}
          data-ad-slot={resolvedSlot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};
