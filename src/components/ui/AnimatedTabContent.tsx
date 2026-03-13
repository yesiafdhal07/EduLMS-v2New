'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';

interface AnimatedTabContentProps {
    children: ReactNode;
    tabKey: string; // Changes when tab switches, triggers re-animation
    className?: string;
}

/**
 * Wraps dashboard tab content with a GSAP entrance animation.
 * Every time `tabKey` changes, the content fades + slides in from below.
 */
export function AnimatedTabContent({ children, tabKey, className = '' }: AnimatedTabContentProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current) return;

        // Animate the container in
        gsap.fromTo(containerRef.current, 
            { 
                opacity: 0, 
                y: 25,
            },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.5, 
                ease: 'power2.out',
            }
        );

        // Stagger direct children for a cascading effect
        const children = containerRef.current.children;
        if (children.length > 0) {
            gsap.from(children, {
                opacity: 0,
                y: 20,
                duration: 0.4,
                stagger: 0.06,
                delay: 0.1,
                ease: 'power2.out',
            });
        }
    }, { scope: containerRef, dependencies: [tabKey] });

    return (
        <div ref={containerRef} className={className}>
            {children}
        </div>
    );
}
