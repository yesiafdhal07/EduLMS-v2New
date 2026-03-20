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
        <section ref={sectionRef} className="py-28 px-6 relative z-10">
            <div className="max-w-7xl mx-auto">
                <div ref={cardRef} className="relative rounded-[3rem] p-12 md:p-20 text-center overflow-hidden border border-white/[0.08]">
                    {/* Mesh gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/30 via-violet-600/20 to-[#0A0A0F] z-0"></div>
                    <div className="absolute inset-0 bg-[#0A0A0F]/40 z-0"></div>

                    {/* Aurora blobs */}
                    <div className="absolute -top-32 -left-32 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] animate-aurora"></div>
                    <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-violet-500/15 rounded-full blur-[100px] animate-aurora-delayed"></div>

                    {/* Grid texture */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] z-0 pointer-events-none"></div>

                    <div ref={contentRef} className="relative z-10 max-w-3xl mx-auto">
                        <p className="text-cyan-400 text-sm font-bold uppercase tracking-[0.2em] mb-6">Siap Memulai?</p>

                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
                            Mulai dari Hari Ini.
                            <br />
                            <span className="text-shimmer">Gratis Selamanya.</span>
                        </h2>

                        <p className="text-gray-400 text-lg mb-10 leading-relaxed max-w-xl mx-auto">
                            Bergabung dengan ratusan sekolah yang sudah beralih ke manajemen kelas digital. 
                            Setup 2 menit, tanpa kartu kredit.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/register"
                                className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#0A0A0F] rounded-2xl text-lg font-black hover:shadow-[0_0_50px_-10px_rgba(0,229,255,0.5)] transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-2"
                            >
                                Daftar Gratis Sekarang
                                <ChevronRight size={20} />
                            </Link>
                            <Link
                                href="/contact"
                                className="px-10 py-5 bg-white/[0.06] border border-white/[0.1] text-white rounded-2xl text-lg font-semibold hover:bg-white/[0.1] hover:border-white/[0.15] transition-all flex items-center gap-2"
                            >
                                Hubungi Tim Kami
                                <ArrowRight size={20} />
                            </Link>
                        </div>

                        <p className="mt-8 text-gray-500/60 text-sm font-medium">
                            ✦ Tidak perlu kartu kredit · Setup dalam 2 menit · Cancel kapan saja
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
