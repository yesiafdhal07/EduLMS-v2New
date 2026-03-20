'use client';

import { useRef, MouseEvent, ReactNode } from 'react';

export function Spotlight({ children, className = "" }: { children: ReactNode, className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top } = containerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    containerRef.current.style.setProperty('--mouse-x', `${x}px`);
    containerRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative group/spotlight overflow-hidden ${className}`}
    >
      {/* Radial Gradient Background revealed on hover via CSS variables */}
      <div 
        className="absolute inset-0 z-0 bg-[radial-gradient(400px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(0,229,255,0.05),transparent)] opacity-0 group-hover/spotlight:opacity-100 transition-opacity duration-300 pointer-events-none" 
      />
      {/* Outer border glow tracker (subtle) */}
      <div 
        className="absolute inset-0 z-0 bg-[radial-gradient(250px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(0,229,255,0.12),transparent)] opacity-0 group-hover/spotlight:opacity-100 transition-opacity duration-300 pointer-events-none -inset-px rounded-2xl" 
      />
      
      {/* Inner Content explicitly kept on top */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  );
}
