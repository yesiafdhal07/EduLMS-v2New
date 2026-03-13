'use client';

import React, { useState, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    maxTilt?: number;
    perspective?: number;
    scale?: number;
    glareEnable?: boolean;
    glareMaxOpacity?: number;
}

export function TiltCard({
    children,
    className,
    maxTilt = 10,
    perspective = 1000,
    scale = 1.02,
    glareEnable = true,
    glareMaxOpacity = 0.2,
    ...props
}: TiltCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [tiltStyles, setTiltStyles] = useState({});
    const [glareStyles, setGlareStyles] = useState<React.CSSProperties>({});
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        
        setIsHovered(true);
        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calculate rotation (-1 to +1 range)
        const rotX = (maxTilt * (mouseY / height - 0.5)) * -2;
        const rotY = (maxTilt * (mouseX / width - 0.5)) * 2;

        setTiltStyles({
            transform: `perspective(${perspective}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(${scale}, ${scale}, ${scale})`,
            transition: 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });

        if (glareEnable) {
            // Calculate glare angle
            const angle = Math.atan2(mouseY - height / 2, mouseX - width / 2) * (180 / Math.PI) - 90;
            const opacity = Math.min(((mouseY / height) + (mouseX / width)) / 2 * glareMaxOpacity * 2, glareMaxOpacity);
            
            setGlareStyles({
                background: `linear-gradient(${angle}deg, rgba(255,255,255,${opacity}) 0%, rgba(255,255,255,0) 80%)`,
                transform: 'translateZ(1px)'
            });
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setTiltStyles({
            transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
            transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        if (glareEnable) {
            setGlareStyles({
                opacity: 0,
                transition: 'opacity 0.6s ease'
            });
        }
    };

    return (
        <div
            ref={cardRef}
            className={cn("relative will-change-transform z-10", className)}
            style={{ ...props.style, ...tiltStyles, transformStyle: 'preserve-3d' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            {...props}
        >
            {/* Render children directly to preserve original layout & padding */}
            {children}

            {/* Glare effect inside content to correctly clip to borders */}
            {glareEnable && (
                <div 
                    className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden mix-blend-soft-light transition-opacity duration-300"
                    style={{ ...glareStyles, opacity: isHovered ? 1 : 0, transform: 'translateZ(1px)' }}
                />
            )}
            
            {/* 3D Drop Shadow that moves opposite to the tilt */}
            <div 
                className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-2xl transition-all duration-300 -z-10 bg-indigo-500/5 mix-blend-multiply"
                style={{ 
                    transform: 'translateZ(-20px) scale(0.95)',
                    opacity: isHovered ? 0.7 : 0.3,
                    filter: isHovered ? 'blur(15px)' : 'blur(5px)'
                }}
            />
        </div>
    );
}
