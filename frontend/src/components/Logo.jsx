import React from 'react';
import { Eye } from 'lucide-react';

export default function Logo({ size = 'md', subtitle = 'Civic Watch', showText = true }) {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';
  
  const iconSize = isSmall ? 'w-8 h-8' : isLarge ? 'w-12 h-12' : 'w-9 h-9';
  const svgSize = isSmall ? 'w-4 h-4' : isLarge ? 'w-6 h-6' : 'w-4.5 h-4.5';
  const textSize = isSmall ? 'text-base' : isLarge ? 'text-2xl' : 'text-lg';
  const subSize = isSmall ? 'text-[9px]' : isLarge ? 'text-xs' : 'text-[10px]';

  return (
    <div className="flex items-center space-x-2.5 select-none">
      {/* Clean Civic Emblem */}
      <div className={`${iconSize} rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105`}>
        <Eye className={svgSize} strokeWidth={2.2} />
      </div>
      
      {/* Clean Typography */}
      {showText && (
        <div className="flex flex-col min-w-0">
          <div className={`${textSize} font-extrabold tracking-tight flex items-center leading-tight`}>
            <span className="text-slate-900">URBAN</span>
            <span className="text-blue-600 ml-1">EYE</span>
          </div>
          {subtitle && (
            <span className={`${subSize} font-medium tracking-wide text-slate-500 mt-0.5 leading-none`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}


