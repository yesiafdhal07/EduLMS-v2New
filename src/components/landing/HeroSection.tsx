'use client';

// ============================================================
// HERO SECTION - Landing Page (GSAP Powered)
// Features: GSAP Timeline staggered entrance, ScrollTrigger parallax
// ============================================================

import { memo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Sparkles, PlayCircle, Users, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TiltCard } from '@/components/ui';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

function HeroSectionBase() {
    const t = useTranslations('landing');
    const sectionRef = useRef<HTMLElement>(null);
    const badgeRef = useRef<HTMLDivElement>(null);
    const headlineRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);
    const trustRef = useRef<HTMLDivElement>(null);
    const mockupRef = useRef<HTMLDivElement>(null);
    const blob1Ref = useRef<HTMLDivElement>(null);
    const blob2Ref = useRef<HTMLDivElement>(null);
    const blob3Ref = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!sectionRef.current) return;

        // === HERO ENTRANCE TIMELINE ===
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // Staggered entrance sequence using fromTo for robustness
        tl.fromTo(badgeRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, clearProps: "all" })
          .fromTo(headlineRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, clearProps: "all" }, '-=0.5')
          .fromTo(subtitleRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, clearProps: "all" }, '-=0.6')
          .fromTo(ctaRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, clearProps: "all" }, '-=0.5')
          .fromTo(trustRef.current, { opacity: 0, y: 30 }, { opacity: 0.6, y: 0, duration: 0.8, clearProps: "all" }, '-=0.4')
          .fromTo(mockupRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', clearProps: "all" }, '-=0.6');

        // === PARALLAX BLOBS on scroll ===
        gsap.to(blob1Ref.current, {
            y: -120,
            scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top top',
                end: 'bottom top',
                scrub: 1.5,
            },
        });
        gsap.to(blob2Ref.current, {
            y: 80,
            x: -40,
            scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top top',
                end: 'bottom top',
                scrub: 2,
            },
        });
        gsap.to(blob3Ref.current, {
            y: -60,
            x: 30,
            scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top top',
                end: 'bottom top',
                scrub: 1,
            },
        });

        // === MOCKUP PARALLAX (moves slower than scroll) ===
        gsap.to(mockupRef.current, {
            y: 60,
            scrollTrigger: {
                trigger: sectionRef.current,
                start: 'center center',
                end: 'bottom top',
                scrub: 1.5,
            },
        });

    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} className="relative z-10 pt-32 pb-32 overflow-hidden min-h-screen flex items-center">
            {/* Background Decorations - Parallax Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div ref={blob1Ref} className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[128px]"></div>
                <div ref={blob2Ref} className="absolute bottom-[10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[128px]"></div>
                <div ref={blob3Ref} className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[96px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
                <div className="flex flex-col items-center text-center max-w-5xl mx-auto">

                    {/* Badge */}
                    <div ref={badgeRef} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 backdrop-blur-md border border-indigo-500/20 rounded-full text-indigo-300 text-sm font-bold mb-8 shadow-lg shadow-indigo-500/10 hover:bg-indigo-500/20 transition-all cursor-default">
                        <Sparkles size={16} className="text-indigo-400" />
                        <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent font-outfit">
                            Platform LMS #1 untuk Sekolah Modern
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 ref={headlineRef} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] mb-8 drop-shadow-2xl">
                        {t('heroTitle')}
                        <span className="text-gradient-brand block mt-2">
                            Masa Depan.
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p ref={subtitleRef} className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                        {t('heroSubtitle')}
                    </p>

                    {/* CTA Buttons */}
                    <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                        <Link
                            href="/register"
                            className="group px-8 py-4 bg-white text-indigo-950 rounded-2xl text-lg font-black flex items-center gap-3 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.4)] hover:-translate-y-1 transition-all w-full sm:w-auto justify-center"
                        >
                            {t('getStarted')}
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform text-indigo-500" />
                        </Link>
                        <Link
                            href="/features"
                            className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 text-white rounded-2xl text-lg font-bold hover:bg-white/10 transition-all flex items-center gap-3 w-full sm:w-auto justify-center hover:border-white/20"
                        >
                            <PlayCircle size={20} className="text-slate-400" />
                            {t('learnMore')}
                        </Link>
                    </div>

                    {/* Trust Badges */}
                    <div ref={trustRef} className="mt-12 flex items-center justify-center gap-8 grayscale hover:grayscale-0 transition-all">
                         <div className="flex -space-x-3">
                            <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-bold text-white">A</div>
                            <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-indigo-800 flex items-center justify-center text-xs font-bold text-white">B</div>
                            <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-purple-800 flex items-center justify-center text-xs font-bold text-white">C</div>
                            <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">+2k</div>
                        </div>
                        <div className="text-sm font-semibold text-slate-400">
                            Dipercaya oleh <span className="text-white">2,000+</span> Guru
                        </div>
                    </div>

                    {/* Mockup Preview */}
                    <div ref={mockupRef} className="mt-20 relative w-full max-w-6xl">
                        {/* Floating Glass Elements */}
                        <div className="absolute -left-8 md:-left-16 top-1/4 p-4 glass-panel rounded-2xl animate-float hidden md:block z-20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                    <Users size={20} className="text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Siswa Aktif</p>
                                    <p className="text-white font-bold">1,240</p>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -right-8 md:-right-16 bottom-1/3 p-4 glass-panel rounded-2xl animate-float-delayed hidden md:block z-20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                    <ShieldCheck size={20} className="text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Keamanan</p>
                                    <p className="text-white font-bold">Terjamin</p>
                                </div>
                            </div>
                        </div>

                        {/* Main Mockup with 3D TiltCard */}
                        <TiltCard maxTilt={5} perspective={1500} scale={1.02}>
                            <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl shadow-indigo-500/20 bg-slate-900/50 backdrop-blur-sm group">
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 bottom-0 h-40 group-hover:h-32 transition-all duration-500"></div>
                                <Image
                                    src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=2670&auto=format&fit=crop"
                                    alt="Tampilan dashboard Klolakelas"
                                    className="w-full opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                                    width={2670}
                                    height={1780}
                                    priority={false}
                                    loading="lazy"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                                />
                            </div>
                        </TiltCard>
                    </div>
                </div>
            </div>
        </section>
    );
}

export const HeroSection = memo(HeroSectionBase);
