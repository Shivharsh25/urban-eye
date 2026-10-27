import React from 'react';

export default function Logo({ size = 'md', subtitle = 'Active Watch', showText = true }) {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';
  
  const iconSize = isSmall ? 'w-8 h-8' : isLarge ? 'w-16 h-16' : 'w-11 h-11';
  const textSize = isSmall ? 'text-lg' : isLarge ? 'text-3xl' : 'text-xl';
  const subSize = isSmall ? 'text-[8px]' : isLarge ? 'text-[11px]' : 'text-[9px]';

  return (
    <div className="flex items-center space-x-3 group cursor-pointer select-none">
      
      {/* Animated Futuristic Holographic Logo Icon */}
      <div className={`relative ${iconSize} flex items-center justify-center shrink-0 animate-float-slow`}>
        {/* Dynamic Multi-Color Cyber Glow Aura */}
        <div className="absolute inset-[-4px] bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-600 rounded-2xl opacity-40 group-hover:opacity-80 transition-all duration-500 animate-pulse-glow"></div>
        
        {/* Rotating Outer Dashed Orbital Ring */}
        <div className="absolute inset-[-3px] rounded-2xl border border-dashed border-cyan-400/40 animate-[spin_12s_linear_infinite] pointer-events-none group-hover:border-cyan-300 transition-colors"></div>

        {/* Main Glassmorphic Logo Container */}
        <div className="relative w-full h-full rounded-2xl bg-[#090e17]/90 border border-cyan-500/50 shadow-2xl overflow-hidden flex items-center justify-center group-hover:scale-105 group-hover:border-cyan-400 transition-all duration-300 backdrop-blur-md">
          
          {/* Background Micro-Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:8px_8px] opacity-25"></div>

          {/* Inner Geometric Pattern (Cyber/Network feel) */}
          <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] relative z-10 filter drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]">
            {/* Outer Hexagon Frame */}
            <polygon 
              points="50,10 85,30 85,70 50,90 15,70 15,30" 
              fill="none" 
              stroke="rgba(6,182,212,0.6)" 
              strokeWidth="2.5"
            />
            
            {/* Outer 3D Cube Edges */}
            <line x1="50" y1="50" x2="50" y2="90" stroke="rgba(6,182,212,0.5)" strokeWidth="2" />
            <line x1="50" y1="50" x2="15" y2="30" stroke="rgba(6,182,212,0.5)" strokeWidth="2" />
            <line x1="50" y1="50" x2="85" y2="30" stroke="rgba(6,182,212,0.5)" strokeWidth="2" />

            {/* Inner Floating Tesseract (Glowing) */}
            <polygon 
              points="50,28 68,38 68,58 50,68 32,58 32,38" 
              fill="rgba(56,189,248,0.2)" 
              stroke="#38bdf8" 
              strokeWidth="2" 
              className="animate-pulse" 
              style={{ animationDuration: '2.5s' }}
            />
            {/* Inner Tesseract Edges */}
            <line x1="50" y1="48" x2="50" y2="68" stroke="#38bdf8" strokeWidth="1.8" />
            <line x1="50" y1="48" x2="32" y2="38" stroke="#38bdf8" strokeWidth="1.8" />
            <line x1="50" y1="48" x2="68" y2="38" stroke="#38bdf8" strokeWidth="1.8" />

            {/* Connecting Energy Beams */}
            <line x1="50" y1="10" x2="50" y2="28" stroke="#818cf8" strokeWidth="2" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
            <line x1="15" y1="70" x2="32" y2="58" stroke="#818cf8" strokeWidth="2" className="animate-pulse" style={{ animationDelay: '0.7s' }} />
            <line x1="85" y1="70" x2="68" y2="58" stroke="#818cf8" strokeWidth="2" className="animate-pulse" style={{ animationDelay: '1.1s' }} />

            {/* Data Nodes */}
            <circle cx="50" cy="10" r="3.5" fill="#38bdf8" />
            <circle cx="15" cy="70" r="3.5" fill="#38bdf8" />
            <circle cx="85" cy="70" r="3.5" fill="#38bdf8" />
            
            {/* Core Neural Spark */}
            <circle cx="50" cy="48" r="6" fill="none" stroke="#2dd4bf" strokeWidth="2" className="animate-ping" style={{ animationDuration: '2s' }} />
            <circle cx="50" cy="48" r="3" fill="#fff" />
          </svg>

          {/* Sweeping Laser Scanner */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-cyan-400/20 to-transparent h-[200%] animate-[scan_2.5s_linear_infinite] pointer-events-none"></div>
        </div>
      </div>
      
      {/* Logo Typography with Shimmer */}
      {showText && (
        <div className="flex flex-col min-w-0">
          <h1 className={`${textSize} font-black tracking-tight flex items-center leading-none`}>
            <span className="text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">URBAN</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 ml-1.5 drop-shadow-[0_0_16px_rgba(6,182,212,0.5)] group-hover:animate-shimmer-text">
              EYE
            </span>
          </h1>
          {subtitle && (
            <div className="mt-1 flex items-center space-x-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400"></span>
              </span>
              <span className={`${subSize} font-mono uppercase tracking-[0.22em] text-cyan-400/80 font-bold drop-shadow-[0_0_6px_rgba(6,182,212,0.3)]`}>
                {subtitle}
              </span>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

