'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export function CTASection() {
    const sectionRef = useRef<HTMLElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!sectionRef.current) return;

        // CTA card scale-in from center
        gsap.fromTo(cardRef.current, 
            { opacity: 0, scale: 0.95, y: 30 },
            {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                },
                clearProps: "all"
            }
        );

        // Inner content stagger
        const children = contentRef.current?.children;
        if (children && children.length > 0) {
            gsap.fromTo(children, 
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    stagger: 0.1,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: cardRef.current,
                        start: 'top 75%',
                        toggleActions: 'play none none none',
                    },
                    clearProps: "all"
                }
            );
        }
        ScrollTrigger.refresh();
    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} className="py-24 px-6 relative z-10">
            <div className="max-w-7xl mx-auto">
                <div ref={cardRef} className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-indigo-600/20">
                    {/* Texture overlay */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>

                    {/* Animated circles */}
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-900/20 rounded-full blur-3xl animate-pulse delay-500"></div>

                    <div ref={contentRef} className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                            Siap Memulai Transformasi?
                        </h2>
                        <p className="text-indigo-100 text-xl mb-10 leading-relaxed">
                            Bergabunglah dengan ribuan sekolah yang telah beralih ke pembelajaran digital.
                            Gratis selamanya untuk fitur dasar.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/register"
                                className="px-10 py-5 bg-white text-indigo-600 rounded-2xl text-lg font-black hover:bg-slate-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2"
                            >
                                Daftar Gratis Sekarang
                                <ChevronRight size={20} />
                            </Link>
                            <Link
                                href="/contact"
                                className="px-10 py-5 bg-indigo-700/50 border border-indigo-400/30 text-white rounded-2xl text-lg font-bold hover:bg-indigo-700/70 transition-all flex items-center gap-2"
                            >
                                Hubungi Tim Sales
                                <ArrowRight size={20} />
                            </Link>
                        </div>

                        <p className="mt-8 text-indigo-200/60 text-sm font-medium">
                            *Tidak perlu kartu kredit untuk mendaftar
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
