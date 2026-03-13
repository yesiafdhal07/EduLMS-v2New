'use client';

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { TiltCard } from './TiltCard';

interface HoloCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    rarityColor?: string;
    maxTilt?: number;
}

export function HoloCard({ children, className, rarityColor = 'from-slate-400 to-slate-600', maxTilt = 15, ...props }: HoloCardProps) {
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
    const [isHovered, setIsHovered] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePos({ x, y });
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setMousePos({ x: 50, y: 50 });
    };

    return (
        <TiltCard
            maxTilt={maxTilt}
            scale={1.05}
            glareEnable={false} // We provide our own holo glare
            className={cn("relative group rounded-2xl overflow-hidden", className)}
        >
            <div 
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="w-full h-full relative z-10 p-[2px] rounded-2xl"
                {...props}
            >
                {/* Animated Gradient Border (Base Rarity) */}
                <div 
                    className={`absolute inset-0 bg-gradient-to-br ${rarityColor} opacity-70`}
                />

                {/* Foil/Holographic Interactive Overlay */}
                <div 
                    className="absolute inset-0 z-20 pointer-events-none mix-blend-color-dodge opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                        background: `
                            radial-gradient(
                                circle at ${mousePos.x}% ${mousePos.y}%, 
                                rgba(255,255,255,0.8) 0%, 
                                rgba(255,255,255,0) 40%
                            ),
                            linear-gradient(
                                ${mousePos.x + mousePos.y}deg,
                                transparent 20%,
                                rgba(255, 0, 0, 0.4) 25%,
                                rgba(255, 154, 0, 0.4) 30%,
                                rgba(208, 222, 33, 0.4) 35%,
                                rgba(79, 220, 74, 0.4) 40%,
                                rgba(63, 218, 216, 0.4) 45%,
                                rgba(47, 201, 226, 0.4) 50%,
                                rgba(28, 127, 238, 0.4) 55%,
                                rgba(95, 21, 242, 0.4) 60%,
                                rgba(186, 12, 248, 0.4) 65%,
                                rgba(251, 7, 217, 0.4) 70%,
                                transparent 75%
                            )
                        `,
                        backgroundSize: '150% 150%',
                        backgroundPosition: 'center'
                    }}
                />

                {/* Sparkles Overlay */}
                <div 
                    className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    }}
                />

                {/* Inner Content Box */}
                <div className="relative z-30 w-full h-full bg-slate-900/90 rounded-2xl p-4 backdrop-blur-sm">
                    {children}
                </div>
            </div>
        </TiltCard>
    );
}
