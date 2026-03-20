'use client';

import { useRef } from 'react';
import { UserPlus, LayoutDashboard, Rocket } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { AssemblyDemo } from './AssemblyDemo';

const steps = [
    {
        icon: UserPlus,
        step: '01',
        title: 'Daftar dalam 2 Menit',
        desc: 'Buat akun guru atau sekolah. Verifikasi email, dan langsung bisa pakai. Tanpa install perangkat lunak apa pun.',
    },
    {
        icon: LayoutDashboard,
        step: '02',
        title: 'Atur Kelas & Siswa',
        desc: 'Buat kelas, bagikan kode undangan ke siswa, upload materi, dan jadwalkan absensi periodik.',
    },
    {
        icon: Rocket,
        step: '03',
        title: 'Mulai Mengajar Digital',
        desc: 'Absensi otomatis lewat QR, tugaskan kuis interaktif, biarkan sistem menghitung nilai secara presisi.',
    }
];

export function HowItWorks() {
    const sectionRef = useRef<HTMLElement>(null);
    const headingRef = useRef<HTMLDivElement>(null);
    const stepsRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!sectionRef.current) return;

        // Headline entrance
        gsap.fromTo(headingRef.current,
            { opacity: 0, y: 30 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.8, 
                scrollTrigger: { 
                    trigger: headingRef.current, 
                    start: 'top 85%' 
                }, 
                clearProps: "all" 
            }
        );

        // Sticky assembly trigger triggers for scroll items
        steps.forEach((_, idx) => {
            ScrollTrigger.create({
                trigger: `#step-text-${idx}`,
                start: 'top 55%',
                end: 'bottom 45%',
                onEnter: () => {
                    if (idx === 0) {
                        gsap.to('#assembly-wireframe', { opacity: 1, scale: 1, duration: 0.5, borderColor: 'rgba(0, 229, 255, 0.2)' });
                    } else if (idx === 1) {
                        gsap.to('#assembly-qr', { opacity: 1, y: 0, scale: 1, duration: 0.5 });
                        gsap.to('#assembly-status', { opacity: 1, scale: 1, duration: 0.5 });
                    } else if (idx === 2) {
                        gsap.to('#assembly-chart', { opacity: 1, y: 0, scale: 1, duration: 0.5 });
                    }
                },
                onLeaveBack: () => {
                     if (idx === 0) {
                        gsap.to('#assembly-wireframe', { opacity: 0.4, scale: 0.95, duration: 0.5, borderColor: 'rgba(255, 255, 255, 0.04)' });
                     } else if (idx === 1) {
                         gsap.to('#assembly-qr', { opacity: 0, y: 8, scale: 0.9, duration: 0.5 });
                         gsap.to('#assembly-status', { opacity: 0, scale: 0.75, duration: 0.5 });
                     } else if (idx === 2) {
                         gsap.to('#assembly-chart', { opacity: 0, y: 12, scale: 0.9, duration: 0.5 });
                     }
                }
            });
        });

    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} className="py-28 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div ref={headingRef} className="text-center mb-24">
                    <p className="text-cyan-400 text-sm font-bold uppercase tracking-[0.2em] mb-4">Cara Kerja</p>
                    <h2 className="text-4xl md:text-5xl font-black mb-6 text-white tracking-tight leading-none">
                        Mulai dalam <span className="text-shimmer">3 Langkah</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-xl mx-auto">
                        Tanpa setup rumit. Sistem kami langsung online siap melayani kelas Anda.
                    </p>
                </div>

                {/* Desktop Split, Mobile Stack */}
                <div className="flex flex-col md:flex-row gap-16 items-start">
                    
                    {/* Left: Teks steps */}
                    <div ref={stepsRef} className="w-full md:w-1/2 space-y-12 pb-24">
                        {steps.map((step, idx) => (
                            <div 
                                key={idx} 
                                id={`step-text-${idx}`}
                                className="group p-8 rounded-3xl bg-white/[0.01] border border-white/[0.03] backdrop-blur-md flex flex-col gap-5 relative transition-all duration-500 hover:bg-white/[0.03] hover:border-white/[0.06] select-none"
                            >
                                <div className="text-8xl font-black text-white/[0.02] absolute top-2 right-6 select-none tracking-tighter">{step.step}</div>
                                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(0,229,255,0.08)] group-hover:scale-105 transition-transform duration-300">
                                    <step.icon className="text-cyan-400" size={26} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors duration-300">{step.title}</h3>
                                    <p className="text-gray-500 leading-relaxed font-normal group-hover:text-gray-400 transition-colors duration-300">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right: Sticky assembly visual */}
                    <div className="w-full md:w-1/2 sticky top-32 h-[500px] hidden md:flex items-center justify-center pointer-events-none">
                        <AssemblyDemo />
                    </div>
                </div>
            </div>
        </section>
    );
}
