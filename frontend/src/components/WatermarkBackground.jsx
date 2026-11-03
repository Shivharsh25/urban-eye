import React from 'react';

/**
 * WatermarkBackground
 * Clean ambient background with subtle mint & teal gradients matching the Urban EYE design.
 */
export default function WatermarkBackground() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none select-none overflow-hidden -z-10 w-full h-full max-w-full max-h-full" 
      aria-hidden="true"
      style={{ 
        backgroundColor: '#F3F9F8',
        width: '100%',
        height: '100%',
        maxWidth: '100vw',
        maxHeight: '100dvh',
        overflow: 'hidden'
      }}
    >
      {/* Soft ambient lighting wash in soft cyan, mint, and white */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 92% 8%, rgba(0, 168, 150, 0.08) 0%, rgba(224, 242, 241, 0.40) 40%, transparent 70%),
            radial-gradient(circle at 8% 92%, rgba(2, 132, 199, 0.05) 0%, rgba(204, 251, 241, 0.35) 45%, transparent 70%)
          `
        }}
      />
    </div>
  );
}
