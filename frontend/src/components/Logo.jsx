import React from 'react';

export default function Logo({ size = 'md', subtitle = 'Active Watch', showText = true }) {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';
  
  const iconSize = isSmall ? 'w-8 h-8' : isLarge ? 'w-14 h-14' : 'w-10 h-10';
  const textSize = isSmall ? 'text-lg' : isLarge ? 'text-3xl' : 'text-xl';
  const subSize = isSmall ? 'text-[8px]' : isLarge ? 'text-[11px]' : 'text-[9px]';

  return (
    <div className="flex items-center space-x-3 group cursor-pointer select-none">
      
      {/* Elegant, Minimal Indigo Emblem */}
      <div className={`relative ${iconSize} flex items-center justify-center shrink-0`}>
        <div className="relative w-full h-full rounded-xl bg-[#302B69] border border-[#242052] shadow-sm flex items-center justify-center group-hover:scale-105 transition-all duration-200">
          
          {/* Inner Clean Vision Hexagon / Cube in Pure White */}
          <svg viewBox="0 0 100 100" className="w-[70%] h-[70%] relative z-10">
            {/* Outer Hexagon Frame */}
            <polygon 
              points="50,12 85,31 85,69 50,88 15,69 15,31" 
              fill="none" 
              stroke="#FFFFFF" 
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Internal Geometric Y-Split */}
            <line x1="50" y1="50" x2="50" y2="88" stroke="#FFFFFF" strokeWidth="3.5" />
            <line x1="50" y1="50" x2="15" y2="31" stroke="#FFFFFF" strokeWidth="3.5" />
            <line x1="50" y1="50" x2="85" y2="31" stroke="#FFFFFF" strokeWidth="3.5" />

            {/* Center Pupil / Beacon Node in Soft Lavender */}
            <circle cx="50" cy="50" r="7" fill="#F6F6FC" stroke="#302B69" strokeWidth="2" />
          </svg>
        </div>
      </div>
      
      {/* Clean Typography: Deep Navy (#191636) & Indigo Purple (#302B69) */}
      {showText && (
        <div className="flex flex-col min-w-0">
          <h1 className={`${textSize} font-black tracking-tight flex items-center leading-none`}>
            <span className="text-[#191636]">URBAN</span>
            <span className="text-[#302B69] ml-1.5">
              EYE
            </span>
          </h1>
          {subtitle && (
            <div className="mt-1 flex items-center space-x-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#302B69]"></span>
              <span className={`${subSize} font-mono uppercase tracking-[0.2em] text-[#57536E] font-bold`}>
                {subtitle}
              </span>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
