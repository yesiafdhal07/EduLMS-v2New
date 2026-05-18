import React from 'react';

export const AmbientBackground = () => {
  return (
    <div className="fixed inset-0 z-0 flex justify-center overflow-hidden pointer-events-none">
      <div className="absolute top-[-20%] w-[150%] h-[70%] bg-gradient-to-b from-[#B4A3FF]/10 via-[#86EAA5]/5 to-transparent blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[60%] bg-gradient-to-t from-[#B4A3FF]/10 to-transparent blur-[150px] rounded-full" />
      <div className="absolute inset-0 bg-[#0F1014]/50 backdrop-blur-[100px]" />
      <div 
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />
    </div>
  );
};
