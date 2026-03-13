'use client';

/**
 * GSAP Global Setup
 * Registers all GSAP plugins once, at the app level.
 * Import this in the root layout or any client component that needs GSAP.
 */

import { gsap } from 'gsap';
import { ScrollTrigger, Flip } from 'gsap/all';

// Register plugins globally (safe to call multiple times)
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, Flip);
}

export { gsap, ScrollTrigger, Flip };
