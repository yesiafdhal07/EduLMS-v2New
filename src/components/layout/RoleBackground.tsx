'use client';

import React from 'react';
import { AppRole } from '@/types';

export function RoleBackground({ role }: { role: AppRole }) {

  // ⚙️ ADMIN UNIVERSE — "Mission Control" — Dark, technical, dual-axis radar scan
  if (role === 'admin') {
    return (
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#050506]">
        {/* Crisp grid — technical precision */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        {/* Dynamic Dual-Axis Radar Scan */}
        <div
          className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-rose-500/40 to-transparent"
          style={{ animation: 'scanLine 8s linear infinite' }}
        />
        <div
          className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-transparent via-rose-500/20 to-transparent"
          style={{ animation: 'scanLineHorizontal 12s linear infinite' }}
        />

        {/* System Glows */}
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-rose-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-rose-900/5 blur-[120px] rounded-full" />

        {/* Technical Corner Accents */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t border-l border-rose-500/20" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b border-r border-rose-500/20" />
      </div>
    );
  }

  // 🏛️ KEPALA SEKOLAH UNIVERSE — "Executive Floor" — Deep navy, institutionally weighted amber
  if (role === 'kepala_sekolah') {
    return (
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#040712]">
        {/* Amber institutional auroras */}
        <div
          className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-amber-500/8 blur-[160px] rounded-full"
          style={{ animation: 'ambientFloat 12s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-900/15 blur-[160px] rounded-full"
          style={{ animation: 'ambientFloat 15s ease-in-out reverse infinite' }}
        />
        
        {/* Subtle noise texture for premium "paper" feel */}
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

        {/* Structured horizontal accents */}
        <div className="absolute top-[20%] left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/10 to-transparent" />
        <div className="absolute bottom-[20%] left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/5 to-transparent" />
      </div>
    );
  }

  // 🌿 GURU UNIVERSE — "Architect's Blueprint" — Indigo depth, focus lines
  if (role === 'guru') {
    return (
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#0B0A14]">
        {/* Deep focus glows */}
        <div
          className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/10 blur-[180px] rounded-full"
          style={{ animation: 'ambientFloat 18s ease-in-out infinite' }}
        />
        
        {/* Blueprint grid system */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#6366f106_1px,transparent_1px),linear-gradient(to_bottom,#6366f104_1px,transparent_1px)] bg-[size:100px_100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#6366f104_1px,transparent_1px),linear-gradient(to_bottom,#6366f102_1px,transparent_1px)] bg-[size:20px_20px]" />

        {/* Center focus vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0B0A14_80%)]" />
      </div>
    );
  }

  // 🚀 SISWA UNIVERSE — "Gamer Nebula" — Vibrant, energetic, LED strip glows
  if (role === 'siswa') {
    return (
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#06060F]">
        {/* Vibrant nebula blooms */}
        <div
          className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-emerald-500/15 blur-[140px] rounded-full"
          style={{ animation: 'nebulaFloat 9s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[70%] bg-cyan-500/12 blur-[140px] rounded-full"
          style={{ animation: 'nebulaFloat 11s ease-in-out reverse infinite' }}
        />

        {/* Starfield */}
        <div className="absolute inset-0 opacity-40">
          {STAR_POSITIONS.map((star, i) => (
            <div
              key={i}
              className="absolute w-[2px] h-[2px] bg-white rounded-full shadow-[0_0_8px_white]"
              style={{
                top: star.top,
                left: star.left,
                animation: `starTwinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Bottom neon reflection */}
        <div className="absolute bottom-0 left-0 w-full h-[4px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent blur-sm" />
      </div>
    );
  }

  return null;
}

// Static star positions to avoid SSR/hydration mismatch
const STAR_POSITIONS = [
  { top: '8%',  left: '15%', duration: 3.2, delay: 0 },
  { top: '15%', left: '72%', duration: 4.5, delay: 1.2 },
  { top: '25%', left: '40%', duration: 3.8, delay: 0.5 },
  { top: '35%', left: '85%', duration: 5.1, delay: 2.1 },
  { top: '48%', left: '10%', duration: 3.5, delay: 0.8 },
  { top: '55%', left: '60%', duration: 4.2, delay: 1.7 },
  { top: '65%', left: '30%', duration: 3.9, delay: 0.3 },
  { top: '72%', left: '90%', duration: 4.8, delay: 2.4 },
  { top: '80%', left: '55%', duration: 3.3, delay: 1.0 },
  { top: '88%', left: '20%', duration: 5.0, delay: 1.5 },
  { top: '5%',  left: '50%', duration: 4.1, delay: 0.9 },
  { top: '20%', left: '25%', duration: 3.6, delay: 2.8 },
  { top: '42%', left: '78%', duration: 4.4, delay: 0.6 },
  { top: '60%', left: '45%', duration: 3.7, delay: 1.9 },
  { top: '75%', left: '70%', duration: 5.2, delay: 0.2 },
];
