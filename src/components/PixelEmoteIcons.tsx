import React from 'react';
import { EmoteId } from '../game/types';

interface PixelEmoteIconProps {
  emoteId: EmoteId;
  className?: string;
}

export const PixelEmoteIcon: React.FC<PixelEmoteIconProps> = ({
  emoteId,
  className = 'w-5 h-5',
}) => {
  if (emoteId === 'squawk') {
    // 8-bit megaphone beak & radiating sound wave arcs
    return (
      <svg viewBox="0 0 12 12" className={className} style={{ shapeRendering: 'crispEdges' }} aria-hidden="true">
        <rect x="1" y="4" width="2" height="4" fill="#ea580c" />
        <rect x="3" y="3" width="2" height="6" fill="#f97316" />
        <rect x="5" y="2" width="1" height="8" fill="#facc15" />
        <rect x="2" y="5" width="2" height="2" fill="#fef08a" />
        {/* Sound wave arcs */}
        <rect x="7" y="4" width="1" height="4" fill="#fde047" />
        <rect x="8" y="3" width="1" height="1" fill="#facc15" />
        <rect x="8" y="8" width="1" height="1" fill="#facc15" />
        <rect x="9" y="2" width="1" height="2" fill="#fef08a" />
        <rect x="10" y="4" width="1" height="4" fill="#fef08a" />
        <rect x="9" y="8" width="1" height="2" fill="#fef08a" />
      </svg>
    );
  }

  if (emoteId === 'happy_hop') {
    // 8-bit sparkling joyful star & upward bounce chevrons
    return (
      <svg viewBox="0 0 12 12" className={className} style={{ shapeRendering: 'crispEdges' }} aria-hidden="true">
        {/* Bright joyful star */}
        <rect x="5" y="1" width="2" height="2" fill="#4ade80" />
        <rect x="4" y="3" width="4" height="2" fill="#86efac" />
        <rect x="1" y="4" width="10" height="2" fill="#4ade80" />
        <rect x="3" y="6" width="6" height="2" fill="#22c55e" />
        <rect x="2" y="8" width="3" height="2" fill="#16a34a" />
        <rect x="7" y="8" width="3" height="2" fill="#16a34a" />
        {/* Center shine & happy eyes */}
        <rect x="5" y="4" width="2" height="2" fill="#fef08a" />
        <rect x="4" y="5" width="1" height="1" fill="#14532d" />
        <rect x="7" y="5" width="1" height="1" fill="#14532d" />
        {/* Corner glints */}
        <rect x="1" y="1" width="1" height="1" fill="#fde047" />
        <rect x="10" y="1" width="1" height="1" fill="#fde047" />
      </svg>
    );
  }

  if (emoteId === 'angry_ruffle') {
    // 8-bit classic pixel anger vein mark + steam puff
    return (
      <svg viewBox="0 0 12 12" className={className} style={{ shapeRendering: 'crispEdges' }} aria-hidden="true">
        {/* Top-left bracket */}
        <rect x="2" y="2" width="1" height="2" fill="#ef4444" />
        <rect x="2" y="4" width="2" height="1" fill="#ef4444" />
        <rect x="4" y="2" width="1" height="3" fill="#dc2626" />
        {/* Top-right bracket */}
        <rect x="7" y="2" width="1" height="3" fill="#dc2626" />
        <rect x="8" y="4" width="2" height="1" fill="#ef4444" />
        <rect x="9" y="2" width="1" height="2" fill="#ef4444" />
        {/* Bottom-left bracket */}
        <rect x="2" y="7" width="2" height="1" fill="#ef4444" />
        <rect x="4" y="7" width="1" height="3" fill="#dc2626" />
        <rect x="2" y="8" width="1" height="2" fill="#ef4444" />
        {/* Bottom-right bracket */}
        <rect x="7" y="7" width="1" height="3" fill="#dc2626" />
        <rect x="8" y="7" width="2" height="1" fill="#ef4444" />
        <rect x="9" y="8" width="1" height="2" fill="#ef4444" />
        {/* Hot center spark */}
        <rect x="5" y="5" width="2" height="2" fill="#fca5a5" />
      </svg>
    );
  }

  if (emoteId === 'heart_flutter') {
    // 8-bit glowing pixel heart with wings
    return (
      <svg viewBox="0 0 12 12" className={className} style={{ shapeRendering: 'crispEdges' }} aria-hidden="true">
        <rect x="2" y="2" width="3" height="1" fill="#9d174d" />
        <rect x="7" y="2" width="3" height="1" fill="#9d174d" />
        <rect x="1" y="3" width="4" height="3" fill="#f472b6" />
        <rect x="7" y="3" width="4" height="3" fill="#ec4899" />
        <rect x="5" y="4" width="2" height="2" fill="#f472b6" />
        <rect x="2" y="6" width="8" height="2" fill="#ec4899" />
        <rect x="3" y="8" width="6" height="1" fill="#db2777" />
        <rect x="4" y="9" width="4" height="1" fill="#be185d" />
        <rect x="5" y="10" width="2" height="1" fill="#9d174d" />
        {/* Crisp pixel specular */}
        <rect x="2" y="3" width="2" height="1" fill="#fbcfe8" />
        <rect x="2" y="4" width="1" height="1" fill="#ffffff" />
      </svg>
    );
  }

  if (emoteId === 'royal_strut') {
    // 8-bit golden royal crown with ruby & sapphire jewels
    return (
      <svg viewBox="0 0 12 12" className={className} style={{ shapeRendering: 'crispEdges' }} aria-hidden="true">
        <rect x="1" y="3" width="2" height="2" fill="#facc15" />
        <rect x="5" y="2" width="2" height="3" fill="#fde047" />
        <rect x="9" y="3" width="2" height="2" fill="#facc15" />
        <rect x="1" y="5" width="10" height="4" fill="#eab308" />
        <rect x="2" y="5" width="8" height="2" fill="#facc15" />
        <rect x="1" y="9" width="10" height="1" fill="#a16207" />
        {/* Crown jewels */}
        <rect x="5" y="6" width="2" height="2" fill="#ef4444" />
        <rect x="2" y="7" width="1" height="1" fill="#38bdf8" />
        <rect x="9" y="7" width="1" height="1" fill="#38bdf8" />
        <rect x="5" y="2" width="1" height="1" fill="#ffffff" />
      </svg>
    );
  }

  // 'golden_crow': 8-bit radiant sunrise & musical eighth note
  return (
    <svg viewBox="0 0 12 12" className={className} style={{ shapeRendering: 'crispEdges' }} aria-hidden="true">
      {/* Sunburst rays */}
      <rect x="5" y="0" width="2" height="2" fill="#fef08a" />
      <rect x="1" y="2" width="2" height="1" fill="#fde047" />
      <rect x="9" y="2" width="2" height="1" fill="#fde047" />
      {/* Golden music note */}
      <rect x="5" y="3" width="5" height="2" fill="#facc15" />
      <rect x="5" y="5" width="1" height="4" fill="#eab308" />
      <rect x="9" y="5" width="1" height="3" fill="#eab308" />
      <rect x="3" y="8" width="3" height="2" fill="#fde047" />
      <rect x="7" y="7" width="3" height="2" fill="#fde047" />
      <rect x="4" y="8" width="1" height="1" fill="#ffffff" />
      <rect x="8" y="7" width="1" height="1" fill="#ffffff" />
    </svg>
  );
};
