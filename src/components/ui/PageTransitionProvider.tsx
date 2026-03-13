'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';

/**
 * PageTransitionProvider
 * Wraps children and applies a GSAP fade and scale-in 
 * animation every time the pathname changes.
 */
export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current) return;

        // Reset and animate in with just opacity to avoid breaking sticky/fixed positioning
        gsap.fromTo(containerRef.current,
            { 
                opacity: 0, 
            },
            { 
                opacity: 1, 
                duration: 0.6, 
                ease: "power2.inOut",
                clearProps: "opacity" // Clear opacity so CSS can take over or stay at 1
            }
        );
    }, [pathname]);

    return (
        <div ref={containerRef} className="w-full h-full min-h-screen">
            {children}
        </div>
    );
}
