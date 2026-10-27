import React from 'react';

/**
 * WatermarkBackground
 * Features the smart city detection image seamlessly as a watermark background.
 * Uses the Soft Cream (#F6EBE8) base and Light Lavender (#F6F6FC) subtle lighting.
 */
export default function WatermarkBackground() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none select-none overflow-hidden -z-10 w-full h-full max-w-full max-h-full" 
      aria-hidden="true"
      style={{ 
        backgroundColor: '#F6EBE8',
        width: '100%',
        height: '100%',
        maxWidth: '100vw',
        maxHeight: '100dvh',
        overflow: 'hidden'
      }}
    >
      {/* 1. Full-Screen Cover Background Image with subtle elegant opacity */}
      <div 
        className="absolute inset-0 w-full h-full max-w-full max-h-full overflow-hidden pointer-events-none"
        style={{ opacity: 0.10 }}
      >
        <img 
          src="/urban-bg.jpg" 
          alt="" 
          loading="eager"
          decoding="async"
          className="w-full h-full max-w-full max-h-full object-cover object-[center_55%] sm:object-center filter saturate-[0.85] contrast-[1.02] pointer-events-none select-none block"
        />
      </div>

      {/* 2. Soft subtle wash blending Soft Cream (#F6EBE8) and Light Lavender (#F6F6FC) */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 90% 10%, rgba(246, 246, 252, 0.6) 0%, rgba(246, 235, 232, 0.3) 50%, transparent 80%),
            radial-gradient(circle at 10% 90%, rgba(246, 246, 252, 0.5) 0%, rgba(246, 235, 232, 0.3) 50%, transparent 80%)
          `
        }}
      />
    </div>
  );
}
