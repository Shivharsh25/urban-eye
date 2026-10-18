import React from 'react';

/**
 * WatermarkBackground
 * Features the smart city detection image covering the whole screen seamlessly as a watermark background.
 *
 * Requirements addressed:
 * - "now it become very small underflow do not cover whole screen" -> Restores full-bleed screen coverage (100% width & height).
 * - "do not overflow" -> Strictly constrained with fixed inset-0 overflow-hidden, ensuring zero horizontal or vertical scrollbar overflow.
 * - Reduced opacity (0.18) ensures full text and UI legibility on top of the warm linen (#FAF9F5) theme.
 * - Responsive across all device form factors (mobile, tablet, desktop).
 */
export default function WatermarkBackground() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none select-none overflow-hidden -z-10 w-full h-full max-w-full max-h-full" 
      aria-hidden="true"
      style={{ 
        backgroundColor: '#FAF9F5',
        width: '100%',
        height: '100%',
        maxWidth: '100vw',
        maxHeight: '100dvh',
        overflow: 'hidden'
      }}
    >
      {/* 1. Full-Screen Cover Background Image (No Underflow, No Blank Margins) */}
      <div 
        className="absolute inset-0 w-full h-full max-w-full max-h-full overflow-hidden pointer-events-none"
        style={{ opacity: 0.18 }}
      >
        <img 
          src="/urban-bg.jpg" 
          alt="" 
          loading="eager"
          decoding="async"
          className="w-full h-full max-w-full max-h-full object-cover object-[center_55%] sm:object-center filter saturate-[0.96] contrast-[1.02] pointer-events-none select-none block"
        />
      </div>

      {/* 2. Soft ambient lighting wash in Narvik (#EAE7DD) and Sorrell brown (#99775C) contained within inset-0 */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 92% 8%, rgba(153, 119, 92, 0.08) 0%, rgba(234, 231, 221, 0.22) 40%, transparent 70%),
            radial-gradient(circle at 8% 92%, rgba(153, 119, 92, 0.06) 0%, rgba(234, 231, 221, 0.25) 45%, transparent 70%)
          `
        }}
      />
    </div>
  );
}
