'use client';

// ============================================================
// HERO SECTION - Landing Page (GSAP Powered)
// Obsidian Cyan Design — Cinematic entrance
// ============================================================

import { memo, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, Play, Users, ShieldCheck, Sparkles } from 'lucide-react';
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

        // === MOCKUP PARALLAX ===
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
            {/* Background Aurora Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div ref={blob1Ref} className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[160px] animate-aurora"></div>
                <div ref={blob2Ref} className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[140px] animate-aurora-delayed"></div>
                <div ref={blob3Ref} className="absolute top-[30%] right-[15%] w-[300px] h-[300px] bg-emerald-500/8 rounded-full blur-[100px] animate-aurora"></div>
            </div>

            {/* Subtle grid texture */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
                <div className="flex flex-col items-center text-center max-w-5xl mx-auto">

                    {/* Badge */}
                    <div ref={badgeRef} className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-cyan-500/[0.08] backdrop-blur-md border border-cyan-500/20 rounded-full text-sm font-semibold mb-10 hover:bg-cyan-500/[0.12] transition-all cursor-default group">
                        <Sparkles size={14} className="text-cyan-400 group-hover:rotate-12 transition-transform" />
                        <span className="text-cyan-300 font-outfit">
                            {t('heroBadge')}
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 ref={headlineRef} className="text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-[-0.03em] leading-[1.05] mb-8">
                        <span className="text-white">{t('heroTitle')}</span>
                        <span className="text-shimmer block mt-1">
                            {t('heroTitleAccent')}
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p ref={subtitleRef} className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
                        {t('heroSubtitle')}
                    </p>

                    {/* CTA Buttons */}
                    <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                        <Link
                            href="/register"
                            className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#0A0A0F] rounded-2xl text-lg font-black flex items-center gap-3 shadow-[0_0_40px_-10px_rgba(0,229,255,0.4)] hover:shadow-[0_0_60px_-10px_rgba(0,229,255,0.5)] hover:-translate-y-1 transition-all w-full sm:w-auto justify-center active:scale-95"
                        >
                            {t('getStarted')}
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/features"
                            className="px-8 py-4 bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] text-white rounded-2xl text-lg font-semibold hover:bg-white/[0.08] transition-all flex items-center gap-3 w-full sm:w-auto justify-center hover:border-white/[0.15]"
                        >
                            <Play size={18} className="text-cyan-400" />
                            {t('learnMore')}
                        </Link>
                    </div>

                    {/* No credit card */}
                    <p className="mt-5 text-gray-500 text-sm font-medium">
                        {t('noCreditCard')}
                    </p>

                    {/* Trust Badges */}
                    <div ref={trustRef} className="mt-12 flex items-center justify-center gap-8">
                         <div className="flex -space-x-3">
                            <div className="w-10 h-10 rounded-full border-2 border-[#0A0A0F] bg-gradient-to-br from-cyan-600 to-cyan-800 flex items-center justify-center text-xs font-bold text-white">A</div>
                            <div className="w-10 h-10 rounded-full border-2 border-[#0A0A0F] bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center text-xs font-bold text-white">B</div>
                            <div className="w-10 h-10 rounded-full border-2 border-[#0A0A0F] bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-xs font-bold text-white">C</div>
                            <div className="w-10 h-10 rounded-full border-2 border-[#0A0A0F] bg-gray-800 flex items-center justify-center text-[10px] font-bold text-white">+2k</div>
                        </div>
                        <div className="text-sm font-medium text-gray-500">
                            {t('trustedBy')} <span className="text-white font-semibold">2,000+</span> {t('teachers')}
                        </div>
                    </div>

                    {/* Dashboard Mockup Preview */}
                    <div ref={mockupRef} className="mt-20 relative w-full max-w-5xl">
                        {/* Floating Glass Elements */}
                        <div className="absolute -left-6 md:-left-12 top-1/4 p-4 card-obsidian rounded-2xl animate-float hidden md:block z-20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                                    <Users size={20} className="text-cyan-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Siswa Aktif</p>
                                    <p className="text-white font-bold">1,240</p>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -right-6 md:-right-12 bottom-1/3 p-4 card-obsidian rounded-2xl animate-float-delayed hidden md:block z-20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                    <ShieldCheck size={20} className="text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Keamanan</p>
                                    <p className="text-white font-bold">Terjamin</p>
                                </div>
                            </div>
                        </div>

                        {/* Main Mockup — Stylized Dashboard Preview */}
                        <TiltCard maxTilt={5} perspective={1500} scale={1.02}>
                            <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-[#12121A] shadow-2xl shadow-cyan-500/5 group">
                                {/* Window Chrome */}
                                <div className="flex items-center gap-2 px-6 py-4 bg-white/[0.03] border-b border-white/[0.06]">
                                    <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                                    <div className="ml-4 flex-1 h-7 bg-white/[0.04] rounded-lg flex items-center justify-center">
                                        <span className="text-[11px] text-gray-500 font-mono">klolakelas.com/guru/dashboard</span>
                                    </div>
                                </div>

                                {/* Dashboard Content Preview */}
                                <div className="p-6 md:p-8 space-y-4">
                                    {/* Top Bar */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500"></div>
                                            <div className="h-3 w-28 bg-white/10 rounded-full"></div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="h-8 w-20 bg-white/[0.04] rounded-lg border border-white/[0.06]"></div>
                                            <div className="h-8 w-8 bg-cyan-500/10 rounded-lg"></div>
                                        </div>
                                    </div>

                                    {/* Stat Cards Row */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                            <div className="h-2 w-12 bg-gray-700 rounded-full mb-3"></div>
                                            <div className="text-2xl font-black text-cyan-400">128</div>
                                            <div className="h-1.5 w-16 bg-gray-800 rounded-full mt-2"></div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                            <div className="h-2 w-14 bg-gray-700 rounded-full mb-3"></div>
                                            <div className="text-2xl font-black text-violet-400">96%</div>
                                            <div className="h-1.5 w-20 bg-gray-800 rounded-full mt-2"></div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                            <div className="h-2 w-10 bg-gray-700 rounded-full mb-3"></div>
                                            <div className="text-2xl font-black text-emerald-400">A+</div>
                                            <div className="h-1.5 w-14 bg-gray-800 rounded-full mt-2"></div>
                                        </div>
                                    </div>

                                    {/* Chart Area */}
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] h-32 flex items-end gap-1.5 overflow-hidden">
                                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                                            <div 
                                                key={i} 
                                                className="flex-1 rounded-t-md bg-gradient-to-t from-cyan-500/40 to-cyan-500/10 transition-all duration-500"
                                                style={{ height: `${h}%` }}
                                            ></div>
                                        ))}
                                    </div>
                                </div>

                                {/* Bottom gradient fade */}
                                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0A0A0F] to-transparent pointer-events-none"></div>
                            </div>
                        </TiltCard>
                    </div>
                </div>
            </div>
        </section>
    );
}

export const HeroSection = memo(HeroSectionBase);
