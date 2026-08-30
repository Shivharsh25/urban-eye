import React from 'react';

export default function Logo({ size = 'md', subtitle = 'Citizen Network', showText = true }) {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';
  
  const iconSize = isSmall ? 'w-8 h-8' : isLarge ? 'w-16 h-16' : 'w-10 h-10';
  const textSize = isSmall ? 'text-lg' : isLarge ? 'text-3xl' : 'text-xl';
  const subSize = isSmall ? 'text-[8px]' : isLarge ? 'text-[11px]' : 'text-[9px]';

  return (
    <div className="flex items-center space-x-3 group">
      
      {/* Animated Abstract Tech Logo Icon */}
      <div className={`relative ${iconSize} flex items-center justify-center shrink-0`}>
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-2xl blur-[12px] opacity-30 group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>
        
        {/* Main Logo Container */}
        <div className="absolute inset-0 rounded-2xl bg-[#090e17] border border-cyan-500/30 shadow-2xl overflow-hidden flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-500">
          
          {/* Inner Geometric Pattern (Cyber/Network feel) */}
          <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] relative z-10">
            {/* Outer Hexagon Frame */}
            <polygon 
              points="50,10 85,30 85,70 50,90 15,70 15,30" 
              fill="none" 
              stroke="rgba(6,182,212,0.4)" 
              strokeWidth="2"
            />
            
            {/* Outer 3D Cube Edges (Y-shape) */}
            <line x1="50" y1="50" x2="50" y2="90" stroke="rgba(6,182,212,0.4)" strokeWidth="2" />
            <line x1="50" y1="50" x2="15" y2="30" stroke="rgba(6,182,212,0.4)" strokeWidth="2" />
            <line x1="50" y1="50" x2="85" y2="30" stroke="rgba(6,182,212,0.4)" strokeWidth="2" />

            {/* Inner Floating Tesseract (Glowing) */}
            <polygon 
              points="50,28 68,38 68,58 50,68 32,58 32,38" 
              fill="rgba(56,189,248,0.15)" 
              stroke="#38bdf8" 
              strokeWidth="1.5" 
              className="animate-pulse" 
              style={{ animationDuration: '3s' }}
            />
            {/* Inner Tesseract Edges */}
            <line x1="50" y1="48" x2="50" y2="68" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="50" y1="48" x2="32" y2="38" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="50" y1="48" x2="68" y2="38" stroke="#38bdf8" strokeWidth="1.5" />

            {/* Connecting Energy Beams */}
            <line x1="50" y1="10" x2="50" y2="28" stroke="#818cf8" strokeWidth="2" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
            <line x1="15" y1="70" x2="32" y2="58" stroke="#818cf8" strokeWidth="2" className="animate-pulse" style={{ animationDelay: '1.0s' }} />
            <line x1="85" y1="70" x2="68" y2="58" stroke="#818cf8" strokeWidth="2" className="animate-pulse" style={{ animationDelay: '1.5s' }} />

            {/* Data Nodes */}
            <circle cx="50" cy="10" r="3" fill="#fff" />
            <circle cx="15" cy="70" r="3" fill="#fff" />
            <circle cx="85" cy="70" r="3" fill="#fff" />
            
            {/* Core Neural Spark */}
            <circle cx="50" cy="48" r="5" fill="none" stroke="#2dd4bf" strokeWidth="2" className="animate-ping" style={{ animationDuration: '2s' }} />
            <circle cx="50" cy="48" r="2.5" fill="#fff" />
          </svg>

          {/* Sweeping radar scanner effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-cyan-400/10 to-transparent h-[200%] animate-[scan_3s_linear_infinite]"></div>
        </div>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`${textSize} font-black tracking-tighter flex items-center`}>
            <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">URBAN</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 ml-1 drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">EYE</span>
          </h1>
          {subtitle && (
            <span className={`${subSize} font-mono uppercase tracking-[0.25em] text-slate-500 mt-[-2px]`}>
              {subtitle}
            </span>
          )}
        </div>
      )}

    </div>
  );
}
