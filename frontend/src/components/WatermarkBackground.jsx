import React from 'react';

/**
 * WatermarkBackground
 * Clean ambient background with subtle Narvik & Sorrell gradients (watermark image removed).
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
      {/* Soft ambient lighting wash in Narvik (#EAE7DD) and Sorrell brown (#99775C) contained within inset-0 */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 92% 8%, rgba(153, 119, 92, 0.07) 0%, rgba(234, 231, 221, 0.20) 40%, transparent 70%),
            radial-gradient(circle at 8% 92%, rgba(153, 119, 92, 0.05) 0%, rgba(234, 231, 221, 0.22) 45%, transparent 70%)
          `
        }}
      />
    </div>
  );
}
