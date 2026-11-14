import React from "react";

interface MoonNavLogoProps {
  className?: string;
  size?: number;
}

export function MoonNavLogo({ className = "w-10 h-10", size = 44 }: MoonNavLogoProps) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        className="w-full h-full drop-shadow-[0_0_12px_rgba(14,165,233,0.35)]"
      >
        <defs>
          <radialGradient id="headerSpaceGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#0369a1" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="headerLunarSphere" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="35%" stopColor="#cbd5e1" />
            <stop offset="65%" stopColor="#64748b" />
            <stop offset="88%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#090d16" />
          </radialGradient>

          <radialGradient id="headerCraterDark" cx="40%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.9" />
            <stop offset="75%" stopColor="#334155" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.9" />
          </radialGradient>

          <linearGradient id="headerOrbitGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="40%" stopColor="#0ea5e9" stopOpacity="0.85" />
            <stop offset="75%" stopColor="#38bdf8" stopOpacity="1" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
          </linearGradient>

          <filter id="headerGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Space Glow Background */}
        <circle cx="60" cy="60" r="58" fill="url(#headerSpaceGlow)" />

        {/* Outer Celestial Compass Ring */}
        <circle cx="60" cy="60" r="54" fill="none" stroke="#0ea5e9" strokeWidth="0.8" strokeDasharray="3 4" opacity="0.5" />

        {/* Cardinal Ticks */}
        <line x1="60" y1="2" x2="60" y2="7" stroke="#38bdf8" strokeWidth="1.5" opacity="0.8" />
        <line x1="60" y1="113" x2="60" y2="118" stroke="#38bdf8" strokeWidth="1.5" opacity="0.8" />
        <line x1="2" y1="60" x2="7" y2="60" stroke="#38bdf8" strokeWidth="1.5" opacity="0.8" />
        <line x1="113" y1="60" x2="118" y2="60" stroke="#38bdf8" strokeWidth="1.5" opacity="0.8" />

        {/* The Moon Sphere */}
        <circle cx="60" cy="60" r="38" fill="url(#headerLunarSphere)" stroke="#475569" strokeWidth="0.5" />

        {/* Lunar Maria (Dark Basaltic Plains) */}
        <path d="M 42 36 Q 50 32 58 37 Q 64 42 60 50 Q 52 54 44 48 Z" fill="#334155" opacity="0.38" />
        <path d="M 62 44 Q 72 40 76 49 Q 77 58 68 62 Q 60 56 62 44 Z" fill="#334155" opacity="0.32" />
        <path d="M 38 52 Q 46 54 48 64 Q 44 72 36 68 Q 32 60 38 52 Z" fill="#334155" opacity="0.3" />

        {/* Craters */}
        <circle cx="60" cy="90" r="4.5" fill="url(#headerCraterDark)" stroke="#94a3b8" strokeWidth="0.6" />
        <circle cx="60" cy="90" r="2" fill="#020617" />
        <circle cx="48" cy="66" r="3.5" fill="url(#headerCraterDark)" stroke="#cbd5e1" strokeWidth="0.6" />
        <circle cx="70" cy="52" r="3.0" fill="url(#headerCraterDark)" stroke="#94a3b8" strokeWidth="0.5" />
        <circle cx="40" cy="42" r="1.8" fill="#1e293b" stroke="#64748b" strokeWidth="0.4" />
        <circle cx="72" cy="70" r="2.2" fill="#1e293b" stroke="#64748b" strokeWidth="0.4" />

        {/* South Pole Navigation Crosshair */}
        <g opacity="0.9">
          <circle cx="60" cy="90" r="7" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="60" y1="80" x2="60" y2="86" stroke="#38bdf8" strokeWidth="1" />
          <line x1="60" y1="94" x2="60" y2="100" stroke="#38bdf8" strokeWidth="1" />
          <line x1="50" y1="90" x2="56" y2="90" stroke="#38bdf8" strokeWidth="1" />
          <line x1="64" y1="90" x2="70" y2="90" stroke="#38bdf8" strokeWidth="1" />
        </g>

        {/* Artemis Orbital Trajectory Vector */}
        <path
          d="M 14 78 C 16 30, 68 14, 98 34 C 114 46, 112 76, 88 94 C 76 102, 64 96, 60 90"
          fill="none"
          stroke="url(#headerOrbitGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#headerGlow)"
        />

        {/* South Pole Beacon */}
        <circle cx="60" cy="90" r="2.5" fill="#f59e0b" />
        <circle cx="60" cy="90" r="4.5" fill="none" stroke="#fef08a" strokeWidth="0.8" opacity="0.8" />

        {/* North Polar Celestial Star */}
        <g transform="translate(60, 6)">
          <polygon points="0,-3 1,-1 3,0 1,1 0,3 -1,1 -3,0 -1,-1" fill="#38bdf8" />
        </g>
      </svg>
    </div>
  );
}
