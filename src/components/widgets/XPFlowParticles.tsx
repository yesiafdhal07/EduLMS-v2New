'use client';

import { useEffect, useState, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { Star } from 'lucide-react';

interface Particle {
    id: number;
    size: number;
}

/**
 * XPFlowParticles Component
 * Listens for 'xp-earned' custom events and renders flying stars
 * that move from the center (or a specific point) towards the 'Badge/Prestasi' 
 * area in the sidebar.
 */
export function XPFlowParticles() {
    const [particles, setParticles] = useState<Particle[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const counterRef = useRef(0);

    useEffect(() => {
        const handleXPEarned = (e: any) => {
            const amount = e.detail?.amount || 5;
            const newParticles = Array.from({ length: Math.min(amount, 15) }).map(() => ({
                id: counterRef.current++,
                size: Math.random() * 20 + 10,
            }));
            
            setParticles(prev => [...prev, ...newParticles]);
        };

        window.addEventListener('xp-earned', handleXPEarned);
        return () => window.removeEventListener('xp-earned', handleXPEarned);
    }, []);

    useEffect(() => {
        if (particles.length === 0) return;

        // Animate new particles
        particles.forEach(p => {
            const el = document.getElementById(`xp-p-${p.id}`);
            if (!el) return;

            // Target search: try to find the "Prestasi" menu item in the sidebar
            // Fallback to top-left if not found
            const sidebarNavItems = document.querySelectorAll('aside nav button');
            let targetX = 40;
            let targetY = 300;

            sidebarNavItems.forEach((btn: any) => {
                if (btn.innerText.toLowerCase().includes('prestasi') || btn.innerText.toLowerCase().includes('lencana')) {
                    const rect = btn.getBoundingClientRect();
                    targetX = rect.left + rect.width / 2;
                    targetY = rect.top + rect.height / 2;
                }
            });

            const startX = window.innerWidth / 2 + (Math.random() - 0.5) * 100;
            const startY = window.innerHeight / 2 + (Math.random() - 0.5) * 100;

            gsap.set(el, { x: startX, y: startY, opacity: 0, scale: 0 });

            const tl = gsap.timeline({
                onComplete: () => {
                    setParticles(prev => prev.filter(item => item.id !== p.id));
                }
            });

            tl.to(el, {
                opacity: 1,
                scale: 1,
                duration: 0.3,
                ease: "back.out(2)"
            })
            .to(el, {
                x: targetX,
                y: targetY,
                duration: 1.2,
                ease: "power2.in",
                // Motion path simulation
                modifiers: {
                    x: (x) => parseFloat(x) + Math.sin(gsap.ticker.time * 5) * 20,
                    y: (y) => parseFloat(y) + Math.cos(gsap.ticker.time * 5) * 10
                }
            })
            .to(el, {
                scale: 0.5,
                opacity: 0,
                duration: 0.3
            }, "-=0.3");
        });
    }, [particles]);

    return (
        <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {particles.map(p => (
                <div
                    key={p.id}
                    id={`xp-p-${p.id}`}
                    className="absolute text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                >
                    <Star size={p.size} fill="currentColor" />
                </div>
            ))}
        </div>
    );
}

// Utility to trigger the effect
export const triggerXPEffect = (amount: number = 5) => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('xp-earned', { detail: { amount } }));
    }
};
