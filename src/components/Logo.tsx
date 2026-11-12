import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showTagline = false, className = '' }) => {
  const iconSize = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }[size];

  const brandTextSize = {
    sm: 'text-base tracking-[0.25em]',
    md: 'text-xl tracking-[0.3em]',
    lg: 'text-2xl sm:text-3xl tracking-[0.35em]',
    xl: 'text-3xl sm:text-4xl tracking-[0.4em]'
  }[size];

  const subTextSize = {
    sm: 'text-[9px] tracking-[0.3em]',
    md: 'text-[11px] tracking-[0.35em]',
    lg: 'text-xs tracking-[0.4em]',
    xl: 'text-sm tracking-[0.45em]'
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none group cursor-pointer ${className}`}>
      {/* AVERON Bespoke Monogram Emblem */}
      <div className={`relative ${iconSize} flex-shrink-0 flex items-center justify-center`}>
        {/* Electric Blue Background Aura */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-cyan-500/30 via-blue-600/20 to-transparent blur-md group-hover:blur-lg group-hover:from-cyan-400/50 transition-all duration-500" />
        
        {/* Geometric Hex/Shield Emblem SVG */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 drop-shadow-[0_0_12px_rgba(0,240,255,0.6)]"
        >
          <defs>
            <linearGradient id="silverChrome" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#CBD5E1" />
              <stop offset="65%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#F8FAFC" />
            </linearGradient>
            <linearGradient id="electricGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="60%" stopColor="#0077FE" />
              <stop offset="100%" stopColor="#00F0FF" />
            </linearGradient>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer faceted luxury shield */}
          <polygon
            points="50,4 92,26 92,74 50,96 8,74 8,26"
            stroke="url(#silverChrome)"
            strokeWidth="3.5"
            fill="#090B10"
            className="transition-all duration-500 group-hover:stroke-[#00F0FF]"
          />

          {/* Inner electric cyber accent line */}
          <polygon
            points="50,14 82,31 82,69 50,86 18,69 18,31"
            stroke="url(#electricGlow)"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            opacity="0.75"
          />

          {/* AVERON "A" Monogram Facets */}
          <path
            d="M50 20 L74 68 L61 68 L50 44 L39 68 L26 68 Z"
            fill="url(#silverChrome)"
          />
          {/* Electric Blue Core Chevron */}
          <path
            d="M50 36 L60 58 L50 53 L40 58 Z"
            fill="url(#electricGlow)"
            filter="url(#neonGlow)"
          />
          {/* Diamond Central Star Pin */}
          <circle cx="50" cy="50" r="2.5" fill="#00F0FF" filter="url(#neonGlow)" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1.5">
          <span className={`font-cinzel font-black text-white ${brandTextSize} tracking-widest text-metallic transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(0,240,255,0.4)]`}>
            AVERON
          </span>
          <span className={`font-tech font-bold text-cyan-400 ${subTextSize} uppercase tracking-[0.3em]`}>
            INDUSTRY
          </span>
        </div>
        {showTagline && (
          <span className="font-tech text-[9px] uppercase tracking-[0.45em] text-slate-400 group-hover:text-cyan-300 transition-colors">
            ELEVATE YOUR PRESENCE
          </span>
        )}
      </div>
    </div>
  );
};
