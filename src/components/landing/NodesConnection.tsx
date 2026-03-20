'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { Network, Users, GraduationCap, CreditCard, BarChart2 } from 'lucide-react';

export function NodesConnection() {
    const sectionRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        if (!sectionRef.current) return;

        gsap.fromTo('.node-item',
            { opacity: 0, scale: 0.8 },
            {
                opacity: 1,
                scale: 1,
                duration: 0.6,
                stagger: 0.15,
                ease: 'back.out(1.5)',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 75%',
                }
            }
        );
    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} className="py-24 relative overflow-hidden px-6">
            <style jsx>{`
                @keyframes pulse-beam {
                    0% { stroke-dashoffset: 100; }
                    100% { stroke-dashoffset: 0; }
                }
                .beam-line {
                    stroke-dasharray: 12 8;
                    animation: pulse-beam 3s linear infinite;
                }
                .beam-line-reverse {
                    stroke-dasharray: 12 8;
                    animation: pulse-beam 3s linear infinite reverse;
                }
            `}</style>

            <div className="max-w-4xl mx-auto text-center mb-16">
                <p className="text-cyan-400 text-sm font-bold uppercase tracking-[0.2em] mb-3">Integrasi Total</p>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                    Ekosistem <span className="text-shimmer">Terhubung 24/7</span>
                </h2>
                <p className="text-gray-500 text-sm mt-3 max-w-sm mx-auto leading-relaxed">
                    Semua modul saling berkomunikasi otomatis demi memangkas kerja ganda.
                </p>
            </div>

            <div className="max-w-4xl mx-auto relative h-[380px] w-full">
                
                {/* SVG Connecting Paths */}
                <svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 800 380" fill="none">
                    {/* Glow Filter */}
                    <defs>
                        <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Left node to center */}
                    <path d="M 180 120 L 400 190" className="stroke-cyan-500/40 stroke-[2] beam-line" filter="url(#neon-glow)" />
                    <path d="M 180 260 L 400 190" className="stroke-cyan-500/20 stroke-[1.5] beam-line-reverse" filter="url(#neon-glow)" />

                    {/* Right node to center */}
                    <path d="M 620 120 L 400 190" className="stroke-cyan-500/20 stroke-[1.5] beam-line" filter="url(#neon-glow)" />
                    <path d="M 620 260 L 400 190" className="stroke-cyan-500/30 stroke-[2] beam-line-reverse" filter="url(#neon-glow)" />
                </svg>

                {/* Nodes Container */}
                <div className="absolute inset-0 z-10 font-outfit">
                    
                    {/* CENTER CORE NODE */}
                    <div className="node-item absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <div className="w-24 h-24 rounded-3xl bg-cyan-500 flex items-center justify-center border-4 border-[#0C0C12] shadow-[0_0_40px_-5px_rgba(0,229,255,0.4)] relative cursor-pointer hover:scale-105 transition-transform">
                            <Network size={38} className="text-[#07070A]" />
                            <span className="absolute inset-0 rounded-3xl bg-cyan-500 animate-ping opacity-20"></span>
                        </div>
                        <p className="text-white text-xs font-black mt-3 uppercase tracking-wider shadow-sm">Klokalelas Core</p>
                    </div>

                    {/* NODE 1: Siswa (Top Left) */}
                    <div className="node-item absolute top-[85px] left-[140px] text-center flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md flex items-center justify-center text-cyan-400 group hover:border-cyan-500/30 transition-all cursor-pointer">
                            <Users size={22} className="group-hover/node:scale-110 transition-transform" />
                        </div>
                        <p className="text-gray-400 text-[10px] font-medium mt-2">Daftar Siswa</p>
                    </div>

                    {/* NODE 2: Guru (Bottom Left) */}
                    <div className="node-item absolute bottom-[85px] left-[140px] text-center flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md flex items-center justify-center text-cyan-400 group hover:border-cyan-500/30 transition-all cursor-pointer">
                            <GraduationCap size={22} />
                        </div>
                        <p className="text-gray-400 text-[10px] font-medium mt-2">Jurnal Mengajar</p>
                    </div>

                    {/* NODE 3: Kas (Top Right) */}
                    <div className="node-item absolute top-[85px] right-[140px] text-center flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md flex items-center justify-center text-cyan-400 group hover:border-cyan-500/30 transition-all cursor-pointer">
                            <CreditCard size={22} />
                        </div>
                        <p className="text-gray-400 text-[10px] font-medium mt-2">Buku Kas</p>
                    </div>

                    {/* NODE 4: Raport (Bottom Right) */}
                    <div className="node-item absolute bottom-[85px] right-[140px] text-center flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md flex items-center justify-center text-cyan-400 group hover:border-cyan-500/30 transition-all cursor-pointer">
                            <BarChart2 size={22} />
                        </div>
                        <p className="text-gray-400 text-[10px] font-medium mt-2">Kartu Indonesia</p>
                    </div>

                </div>
            </div>
        </section>
    );
}
