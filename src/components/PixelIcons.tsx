import React from 'react';

// Common interface for all pixel art SVG icons
interface PixelIconProps {
  className?: string;
  size?: number;
}

// 1. Pixel Chick (Baby chick with sunny down, orange beak, eye)
export const PixelChick: React.FC<PixelIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg viewBox="0 0 12 12" className={className} style={{ width: size, height: size, shapeRendering: 'crispEdges' }}>
    {/* Dark brown outline */}
    <rect x="4" y="1" width="4" height="1" fill="#3b1302" />
    <rect x="3" y="2" width="1" height="4" fill="#3b1302" />
    <rect x="8" y="2" width="1" height="3" fill="#3b1302" />
    <rect x="2" y="5" width="2" height="4" fill="#3b1302" />
    <rect x="9" y="4" width="2" height="2" fill="#3b1302" />
    <rect x="8" y="6" width="2" height="3" fill="#3b1302" />
    <rect x="3" y="9" width="6" height="1" fill="#3b1302" />
    <rect x="4" y="10" width="1" height="2" fill="#3b1302" />
    <rect x="7" y="10" width="1" height="2" fill="#3b1302" />
    {/* Head & Body Yellow */}
    <rect x="4" y="2" width="4" height="4" fill="#facc15" />
    <rect x="3" y="6" width="6" height="3" fill="#facc15" />
    <rect x="5" y="2" width="2" height="1" fill="#fef08a" />
    {/* Eye */}
    <rect x="6" y="3" width="1" height="1" fill="#0f172a" />
    {/* Orange Beak */}
    <rect x="8" y="4" width="2" height="1" fill="#ea580c" />
    {/* Feet */}
    <rect x="4" y="10" width="2" height="1" fill="#ea580c" />
    <rect x="7" y="10" width="2" height="1" fill="#ea580c" />
  </svg>
);

// 2. Pixel Juvenile (Young chicken with sprouting comb)
export const PixelJuvenile: React.FC<PixelIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg viewBox="0 0 12 12" className={className} style={{ width: size, height: size, shapeRendering: 'crispEdges' }}>
    <rect x="5" y="0" width="2" height="1" fill="#dc2626" />
    <rect x="4" y="1" width="1" height="1" fill="#dc2626" />
    <rect x="4" y="2" width="4" height="1" fill="#3b1302" />
    <rect x="3" y="3" width="1" height="4" fill="#3b1302" />
    <rect x="8" y="3" width="1" height="3" fill="#3b1302" />
    <rect x="2" y="6" width="2" height="4" fill="#3b1302" />
    <rect x="8" y="6" width="2" height="3" fill="#3b1302" />
    <rect x="3" y="9" width="6" height="1" fill="#3b1302" />
    {/* Body feathers */}
    <rect x="4" y="3" width="4" height="3" fill="#f59e0b" />
    <rect x="3" y="6" width="5" height="3" fill="#d97706" />
    <rect x="6" y="4" width="1" height="1" fill="#0f172a" />
    <rect x="8" y="4" width="2" height="1" fill="#ea580c" />
    <rect x="4" y="10" width="1" height="2" fill="#ea580c" />
    <rect x="7" y="10" width="1" height="2" fill="#ea580c" />
  </svg>
);

// 3. Pixel Rooster (Adult rooster with tall red comb & green sickle tail)
export const PixelRooster: React.FC<PixelIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg viewBox="0 0 12 12" className={className} style={{ width: size, height: size, shapeRendering: 'crispEdges' }}>
    {/* Comb points */}
    <rect x="4" y="0" width="1" height="2" fill="#dc2626" />
    <rect x="6" y="0" width="1" height="2" fill="#dc2626" />
    <rect x="8" y="1" width="1" height="1" fill="#dc2626" />
    {/* Head & neck */}
    <rect x="4" y="2" width="4" height="3" fill="#f59e0b" />
    <rect x="6" y="3" width="1" height="1" fill="#0f172a" />
    {/* Yellow beak & Red wattle */}
    <rect x="8" y="3" width="2" height="1" fill="#facc15" />
    <rect x="7" y="5" width="1" height="2" fill="#dc2626" />
    {/* Body */}
    <rect x="3" y="5" width="5" height="4" fill="#b45309" />
    {/* Tail Sickle Feathers (Emerald) */}
    <rect x="1" y="2" width="2" height="4" fill="#047857" />
    <rect x="2" y="3" width="1" height="4" fill="#10b981" />
    {/* Legs */}
    <rect x="4" y="9" width="1" height="3" fill="#d97706" />
    <rect x="6" y="9" width="1" height="3" fill="#d97706" />
  </svg>
);

// 4. Pixel Hen (Plump warm hen with rose comb)
export const PixelHen: React.FC<PixelIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg viewBox="0 0 12 12" className={className} style={{ width: size, height: size, shapeRendering: 'crispEdges' }}>
    {/* Rose comb */}
    <rect x="5" y="1" width="2" height="1" fill="#e11d48" />
    {/* Head & body */}
    <rect x="4" y="2" width="4" height="3" fill="#fde68a" />
    <rect x="6" y="3" width="1" height="1" fill="#0f172a" />
    <rect x="8" y="3" width="2" height="1" fill="#f59e0b" />
    <rect x="2" y="5" width="7" height="4" fill="#d97706" />
    <rect x="3" y="6" width="5" height="2" fill="#fed7aa" />
    {/* Fan tail */}
    <rect x="1" y="4" width="2" height="3" fill="#92400e" />
    {/* Legs */}
    <rect x="4" y="9" width="1" height="3" fill="#d97706" />
    <rect x="6" y="9" width="1" height="3" fill="#d97706" />
  </svg>
);

// 5. Pixel Crown (Golden monarch crown)
export const PixelCrown: React.FC<PixelIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg viewBox="0 0 12 12" className={className} style={{ width: size, height: size, shapeRendering: 'crispEdges' }}>
    {/* 3 Crown peaks */}
    <rect x="1" y="3" width="2" height="5" fill="#facc15" />
    <rect x="5" y="1" width="2" height="7" fill="#facc15" />
    <rect x="9" y="3" width="2" height="5" fill="#facc15" />
    {/* Jewels */}
    <rect x="1" y="2" width="2" height="1" fill="#dc2626" />
    <rect x="5" y="0" width="2" height="1" fill="#38bdf8" />
    <rect x="9" y="2" width="2" height="1" fill="#dc2626" />
    {/* Base rim */}
    <rect x="1" y="8" width="10" height="3" fill="#d97706" />
    <rect x="2" y="9" width="2" height="1" fill="#ffffff" />
    <rect x="5" y="9" width="2" height="1" fill="#dc2626" />
    <rect x="8" y="9" width="2" height="1" fill="#ffffff" />
  </svg>
);

// 6. Pixel Bell (Golden shop/alarm bell)
export const PixelBell: React.FC<PixelIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg viewBox="0 0 12 12" className={className} style={{ width: size, height: size, shapeRendering: 'crispEdges' }}>
    <rect x="5" y="1" width="2" height="1" fill="#fde047" />
    <rect x="4" y="2" width="4" height="2" fill="#facc15" />
    <rect x="3" y="4" width="6" height="4" fill="#facc15" />
    <rect x="2" y="8" width="8" height="2" fill="#eab308" />
    <rect x="5" y="10" width="2" height="2" fill="#ca8a04" />
  </svg>
);

// 7. Pixel Lock (Padlock with shackle & keyhole)
export const PixelLock: React.FC<PixelIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg viewBox="0 0 12 12" className={className} style={{ width: size, height: size, shapeRendering: 'crispEdges' }}>
    {/* Shackle */}
    <rect x="4" y="1" width="4" height="1" fill="#94a3b8" />
    <rect x="3" y="2" width="2" height="3" fill="#94a3b8" />
    <rect x="7" y="2" width="2" height="3" fill="#94a3b8" />
    {/* Body */}
    <rect x="2" y="5" width="8" height="6" fill="#f59e0b" />
    <rect x="3" y="6" width="6" height="4" fill="#fbbf24" />
    {/* Keyhole */}
    <rect x="5" y="7" width="2" height="2" fill="#0f172a" />
    <rect x="5.5" y="9" width="1" height="1" fill="#0f172a" />
  </svg>
);

// 8. Pixel Secret (Purple secret mystery badge)
export const PixelSecret: React.FC<PixelIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg viewBox="0 0 12 12" className={className} style={{ width: size, height: size, shapeRendering: 'crispEdges' }}>
    <rect x="2" y="1" width="8" height="10" fill="#581c87" />
    <rect x="3" y="2" width="6" height="8" fill="#7e22ce" />
    {/* Question mark ? */}
    <rect x="4" y="3" width="4" height="1" fill="#fde047" />
    <rect x="7" y="4" width="1" height="2" fill="#fde047" />
    <rect x="5" y="5" width="2" height="1" fill="#fde047" />
    <rect x="5" y="6" width="1" height="1" fill="#fde047" />
    <rect x="5" y="8" width="1" height="1" fill="#fde047" />
  </svg>
);

// 9. Pixel Corn (Golden ear of corn with green husks)
export const PixelCorn: React.FC<PixelIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg viewBox="0 0 12 12" className={className} style={{ width: size, height: size, shapeRendering: 'crispEdges' }}>
    <rect x="5" y="1" width="3" height="1" fill="#facc15" />
    <rect x="4" y="2" width="4" height="6" fill="#facc15" />
    <rect x="5" y="3" width="1" height="4" fill="#fef08a" />
    <rect x="6" y="4" width="1" height="3" fill="#d97706" />
    {/* Green husks */}
    <rect x="2" y="6" width="2" height="4" fill="#15803d" />
    <rect x="8" y="6" width="2" height="4" fill="#16a34a" />
    <rect x="4" y="8" width="4" height="2" fill="#15803d" />
    <rect x="5" y="10" width="2" height="2" fill="#14532d" />
  </svg>
);

// 10. Pixel Fox (Sly orange fox)
export const PixelFox: React.FC<PixelIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg viewBox="0 0 12 12" className={className} style={{ width: size, height: size, shapeRendering: 'crispEdges' }}>
    <rect x="1" y="1" width="2" height="3" fill="#ea580c" />
    <rect x="9" y="1" width="2" height="3" fill="#ea580c" />
    <rect x="3" y="3" width="6" height="6" fill="#ea580c" />
    <rect x="2" y="6" width="2" height="3" fill="#ffffff" />
    <rect x="8" y="6" width="2" height="3" fill="#ffffff" />
    <rect x="4" y="5" width="1" height="1" fill="#0f172a" />
    <rect x="7" y="5" width="1" height="1" fill="#0f172a" />
    <rect x="5" y="8" width="2" height="1" fill="#0f172a" />
  </svg>
);

// 11. Pixel Wolf (Menacing grey wolf)
export const PixelWolf: React.FC<PixelIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg viewBox="0 0 12 12" className={className} style={{ width: size, height: size, shapeRendering: 'crispEdges' }}>
    <rect x="1" y="1" width="2" height="3" fill="#475569" />
    <rect x="9" y="1" width="2" height="3" fill="#475569" />
    <rect x="3" y="3" width="6" height="6" fill="#64748b" />
    <rect x="4" y="5" width="1" height="1" fill="#ef4444" />
    <rect x="7" y="5" width="1" height="1" fill="#ef4444" />
    <rect x="5" y="7" width="2" height="1" fill="#1e293b" />
  </svg>
);

// 12. Pixel Shield (Medieval knight shield)
export const PixelShield: React.FC<PixelIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg viewBox="0 0 12 12" className={className} style={{ width: size, height: size, shapeRendering: 'crispEdges' }}>
    <rect x="2" y="1" width="8" height="6" fill="#0284c7" />
    <rect x="3" y="7" width="6" height="3" fill="#0284c7" />
    <rect x="5" y="10" width="2" height="1" fill="#0284c7" />
    {/* Golden cross */}
    <rect x="5" y="2" width="2" height="7" fill="#facc15" />
    <rect x="3" y="4" width="6" height="2" fill="#facc15" />
  </svg>
);

// 13. Pixel Sword (Steel broadsword)
export const PixelSword: React.FC<PixelIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg viewBox="0 0 12 12" className={className} style={{ width: size, height: size, shapeRendering: 'crispEdges' }}>
    <rect x="9" y="1" width="2" height="2" fill="#e2e8f0" />
    <rect x="7" y="3" width="2" height="2" fill="#e2e8f0" />
    <rect x="5" y="5" width="2" height="2" fill="#94a3b8" />
    {/* Crossguard */}
    <rect x="3" y="6" width="2" height="1" fill="#f59e0b" />
    <rect x="6" y="3" width="1" height="2" fill="#f59e0b" />
    <rect x="3" y="7" width="2" height="2" fill="#78350f" />
    <rect x="1" y="9" width="2" height="2" fill="#f59e0b" />
  </svg>
);

// 14. Pixel Diamond (Crystalline diamond)
export const PixelDiamond: React.FC<PixelIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg viewBox="0 0 12 12" className={className} style={{ width: size, height: size, shapeRendering: 'crispEdges' }}>
    <rect x="4" y="1" width="4" height="2" fill="#38bdf8" />
    <rect x="2" y="3" width="8" height="3" fill="#0284c7" />
    <rect x="3" y="6" width="6" height="3" fill="#0369a1" />
    <rect x="5" y="9" width="2" height="2" fill="#075985" />
    {/* Shiny highlight */}
    <rect x="5" y="2" width="2" height="2" fill="#ffffff" />
  </svg>
);

// 15. Pixel Dragon (Cockatrice / Dragon head)
export const PixelDragon: React.FC<PixelIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg viewBox="0 0 12 12" className={className} style={{ width: size, height: size, shapeRendering: 'crispEdges' }}>
    <rect x="2" y="1" width="3" height="3" fill="#dc2626" />
    <rect x="6" y="2" width="4" height="5" fill="#b91c1c" />
    <rect x="8" y="4" width="3" height="2" fill="#ea580c" />
    <rect x="7" y="3" width="1" height="1" fill="#facc15" />
    <rect x="3" y="5" width="5" height="4" fill="#991b1b" />
  </svg>
);

// 16. Pixel Trophy (Victory cup)
export const PixelTrophy: React.FC<PixelIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg viewBox="0 0 12 12" className={className} style={{ width: size, height: size, shapeRendering: 'crispEdges' }}>
    <rect x="3" y="1" width="6" height="5" fill="#facc15" />
    <rect x="2" y="2" width="1" height="3" fill="#f59e0b" />
    <rect x="9" y="2" width="1" height="3" fill="#f59e0b" />
    <rect x="5" y="6" width="2" height="3" fill="#d97706" />
    <rect x="3" y="9" width="6" height="2" fill="#78350f" />
    <rect x="4" y="2" width="1" height="3" fill="#ffffff" />
  </svg>
);

// 17. Pixel Coop (Starting farm coop)
export const PixelCoop: React.FC<PixelIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg viewBox="0 0 12 12" className={className} style={{ width: size, height: size, shapeRendering: 'crispEdges' }}>
    {/* Red barn roof */}
    <rect x="5" y="1" width="2" height="1" fill="#dc2626" />
    <rect x="3" y="2" width="6" height="2" fill="#dc2626" />
    <rect x="1" y="4" width="10" height="1" fill="#b91c1c" />
    {/* Wood walls */}
    <rect x="2" y="5" width="8" height="5" fill="#78350f" />
    {/* Door */}
    <rect x="5" y="7" width="2" height="3" fill="#fef08a" />
  </svg>
);

// 18. Pixel Coins (Golden Pellet Coin with a chicken feed pellet in the middle)
export const PixelCoins: React.FC<PixelIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg viewBox="0 0 12 12" className={className} style={{ width: size, height: size, shapeRendering: 'crispEdges' }}>
    {/* Dark rim */}
    <rect x="3" y="1" width="6" height="1" fill="#3b1302" />
    <rect x="1" y="2" width="2" height="1" fill="#3b1302" />
    <rect x="9" y="2" width="2" height="1" fill="#3b1302" />
    <rect x="0" y="3" width="1" height="6" fill="#3b1302" />
    <rect x="11" y="3" width="1" height="6" fill="#3b1302" />
    <rect x="1" y="9" width="2" height="1" fill="#3b1302" />
    <rect x="9" y="9" width="2" height="1" fill="#3b1302" />
    <rect x="3" y="10" width="6" height="1" fill="#3b1302" />

    {/* Gold coin body */}
    <rect x="3" y="2" width="6" height="1" fill="#facc15" />
    <rect x="1" y="3" width="10" height="6" fill="#facc15" />
    <rect x="3" y="9" width="6" height="1" fill="#d97706" />

    {/* Top shiny highlight */}
    <rect x="3" y="2" width="3" height="1" fill="#fef08a" />
    <rect x="1" y="3" width="2" height="2" fill="#fef08a" />
    <rect x="2" y="3" width="1" height="1" fill="#ffffff" />

    {/* Bottom shade rim */}
    <rect x="9" y="5" width="2" height="3" fill="#b45309" />
    <rect x="3" y="8" width="6" height="1" fill="#b45309" />

    {/* CHICKEN FEED PELLET IN THE MIDDLE */}
    <rect x="4" y="4" width="4" height="4" fill="#451a03" />
    <rect x="4" y="4" width="3" height="3" fill="#78350f" />
    <rect x="5" y="5" width="2" height="2" fill="#b45309" />
    <rect x="5" y="5" width="1" height="1" fill="#fde68a" />
  </svg>
);
export const PixelPelletCoin = PixelCoins;

// 19. Pixel Lightning (Electric bolt)
export const PixelLightning: React.FC<PixelIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg viewBox="0 0 12 12" className={className} style={{ width: size, height: size, shapeRendering: 'crispEdges' }}>
    <rect x="6" y="0" width="3" height="3" fill="#facc15" />
    <rect x="4" y="3" width="4" height="2" fill="#facc15" />
    <rect x="2" y="5" width="7" height="2" fill="#fde047" />
    <rect x="4" y="7" width="3" height="2" fill="#facc15" />
    <rect x="3" y="9" width="2" height="3" fill="#eab308" />
  </svg>
);

// 20. Pixel Snowflake (Winter frost)
export const PixelSnowflake: React.FC<PixelIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg viewBox="0 0 12 12" className={className} style={{ width: size, height: size, shapeRendering: 'crispEdges' }}>
    <rect x="5" y="1" width="2" height="10" fill="#38bdf8" />
    <rect x="1" y="5" width="10" height="2" fill="#38bdf8" />
    <rect x="3" y="3" width="2" height="2" fill="#7dd3fc" />
    <rect x="7" y="3" width="2" height="2" fill="#7dd3fc" />
    <rect x="3" y="7" width="2" height="2" fill="#7dd3fc" />
    <rect x="7" y="7" width="2" height="2" fill="#7dd3fc" />
  </svg>
);

// 21. Pixel Totem (Ancient Mayan stone boulder/ruin)
export const PixelTotem: React.FC<PixelIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg viewBox="0 0 12 12" className={className} style={{ width: size, height: size, shapeRendering: 'crispEdges' }}>
    <rect x="3" y="1" width="6" height="10" fill="#475569" />
    <rect x="4" y="3" width="1" height="2" fill="#94a3b8" />
    <rect x="7" y="3" width="1" height="2" fill="#94a3b8" />
    <rect x="4" y="7" width="4" height="1" fill="#1e293b" />
  </svg>
);

// 22. Pixel Shop (Emporium awning)
export const PixelShop: React.FC<PixelIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg viewBox="0 0 12 12" className={className} style={{ width: size, height: size, shapeRendering: 'crispEdges' }}>
    {/* Striped awning */}
    <rect x="1" y="2" width="2" height="4" fill="#dc2626" />
    <rect x="3" y="2" width="2" height="4" fill="#ffffff" />
    <rect x="5" y="2" width="2" height="4" fill="#dc2626" />
    <rect x="7" y="2" width="2" height="4" fill="#ffffff" />
    <rect x="9" y="2" width="2" height="4" fill="#dc2626" />
    {/* Counter */}
    <rect x="2" y="6" width="8" height="5" fill="#78350f" />
    <rect x="4" y="7" width="4" height="2" fill="#facc15" />
  </svg>
);

// 23. Pixel Sparkles (Star glimmer)
export const PixelSparkles: React.FC<PixelIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg viewBox="0 0 12 12" className={className} style={{ width: size, height: size, shapeRendering: 'crispEdges' }}>
    <rect x="5" y="1" width="2" height="6" fill="#facc15" />
    <rect x="3" y="3" width="6" height="2" fill="#facc15" />
    <rect x="5" y="3" width="2" height="2" fill="#ffffff" />
    <rect x="9" y="8" width="2" height="2" fill="#fef08a" />
  </svg>
);

// 24. Pixel Checkmark (Green verified tick)
export const PixelCheck: React.FC<PixelIconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg viewBox="0 0 10 10" className={className} style={{ width: size, height: size, shapeRendering: 'crispEdges' }}>
    <rect x="7" y="1" width="2" height="2" fill="#10b981" />
    <rect x="6" y="3" width="2" height="2" fill="#10b981" />
    <rect x="5" y="5" width="2" height="2" fill="#10b981" />
    <rect x="3" y="5" width="2" height="2" fill="#10b981" />
    <rect x="1" y="4" width="2" height="2" fill="#10b981" />
  </svg>
);

// Master Pixel Icon Resolver (replaces any emoji string with matching pixel SVG!)
export const PixelQuestIcon: React.FC<{ name: string; className?: string; size?: number }> = ({ name, className = 'w-5 h-5', size }) => {
  switch (name) {
    case 'chick':
    case 'baby':
    case '🐣':
      return <PixelChick className={className} size={size} />;
    case 'juvenile':
    case '🐥':
      return <PixelJuvenile className={className} size={size} />;
    case 'rooster':
    case 'teen':
    case '🐓':
      return <PixelRooster className={className} size={size} />;
    case 'hen':
      return <PixelHen className={className} size={size} />;
    case 'crown':
    case 'adult':
    case '👑':
      return <PixelCrown className={className} size={size} />;
    case 'corn':
    case '🌽':
      return <PixelCorn className={className} size={size} />;
    case 'fox':
    case '🦊':
      return <PixelFox className={className} size={size} />;
    case 'shield':
    case '🛡️':
    case '🔰':
      return <PixelShield className={className} size={size} />;
    case 'sword':
    case '⚔️':
      return <PixelSword className={className} size={size} />;
    case 'diamond':
    case '💎':
      return <PixelDiamond className={className} size={size} />;
    case 'dragon':
    case '🐉':
      return <PixelDragon className={className} size={size} />;
    case 'trophy':
    case '🏆':
      return <PixelTrophy className={className} size={size} />;
    case 'coop':
    case '🏡':
      return <PixelCoop className={className} size={size} />;
    case 'money':
    case '💰':
      return <PixelCoins className={className} size={size} />;
    case 'lightning':
    case '⚡':
      return <PixelLightning className={className} size={size} />;
    case 'snowflake':
    case '❄️':
      return <PixelSnowflake className={className} size={size} />;
    case 'totem':
    case '🗿':
      return <PixelTotem className={className} size={size} />;
    case 'shop':
    case '🏪':
      return <PixelShop className={className} size={size} />;
    case 'wolf':
    case '🐺':
      return <PixelWolf className={className} size={size} />;
    case 'sparkles':
    case '✨':
      return <PixelSparkles className={className} size={size} />;
    case 'lock':
    case '🔒':
      return <PixelLock className={className} size={size} />;
    case 'secret':
    case '🤫':
      return <PixelSecret className={className} size={size} />;
    default:
      return <PixelChick className={className} size={size} />;
  }
};
