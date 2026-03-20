'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { EliminatedSlider } from './EliminatedSlider';

export function EliminatedSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!sectionRef.current) return;

        gsap.fromTo(textRef.current,
            { opacity: 0, y: 30 },
            {
                opacity: 1, 
                y: 0, 
                duration: 0.8,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                },
                clearProps: "all"
            }
        );
    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} className="py-24 relative z-10 px-6">
            <div className="max-w-7xl mx-auto">
                <div ref={textRef} className="text-center mb-16">
                    <p className="text-cyan-400 text-sm font-bold uppercase tracking-[0.2em] mb-4">Transformasi Digital</p>
                    <h2 className="text-3xl md:text-5xl font-black mb-5 text-white tracking-tight">
                        Tutup Buku Lama.
                        <span className="text-shimmer block mt-1">Buka Dashboard Baru.</span>
                    </h2>
                    <p className="text-gray-400 text-base max-w-xl mx-auto leading-relaxed">
                        Bandingkan cara kerja lama yang melelahkan dengan kecepatan dan kepraktisan sistem otomatis Klolakelas.
                    </p>
                </div>

                <div className="w-full flex justify-center">
                    <EliminatedSlider />
                </div>
            </div>
        </section>
    );
}
