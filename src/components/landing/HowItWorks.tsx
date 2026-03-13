'use client';

import { useRef } from 'react';
import { UserPlus, LayoutDashboard, Rocket } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const steps = [
    {
        icon: UserPlus,
        title: '1. Daftar Akun',
        desc: 'Buat akun sekolah atau guru dalam hitungan menit. Gratis untuk uji coba.',
        color: 'indigo'
    },
    {
        icon: LayoutDashboard,
        title: '2. Atur Kelas',
        desc: 'Undang siswa, buat jadwal, dan upload materi pembelajaran dengan mudah.',
        color: 'purple'
    },
    {
        icon: Rocket,
        title: '3. Mulai Mengajar',
        desc: 'Nikmati pengalaman mengajar digital yang seamless dan interaktif.',
        color: 'emerald'
    }
];

export function HowItWorks() {
    const sectionRef = useRef<HTMLElement>(null);
    const headingRef = useRef<HTMLDivElement>(null);
    const stepsRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!sectionRef.current) return;

        // Heading reveal
        gsap.fromTo(headingRef.current, 
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                scrollTrigger: {
                    trigger: headingRef.current,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
                clearProps: "all"
            }
        );

        // Steps stagger with scale effect
        const stepCards = stepsRef.current?.children;
        if (stepCards && stepCards.length > 0) {
            gsap.fromTo(stepCards, 
                { opacity: 0, y: 40, scale: 0.9 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: 'back.out(1.4)',
                    scrollTrigger: {
                        trigger: stepsRef.current,
                        start: 'top 80%',
                        toggleActions: 'play none none none',
                    },
                    clearProps: "all"
                }
            );
        }

        ScrollTrigger.refresh();
    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} className="py-24 relative">
             <div className="max-w-7xl mx-auto px-6">
                <div ref={headingRef} className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
                        Mulai dalam <span className="text-gradient-brand">3 Langkah</span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">
                        Tidak perlu setup yang rumit. Klolakelas siap digunakan secara instan.
                    </p>
                </div>

                <div ref={stepsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent border-t border-dashed border-white/20"></div>

                    {steps.map((step, idx) => (
                        <div key={idx} className="relative group text-center">
                            {/* Icon Circle */}
                            <div className={`
                                w-24 h-24 mx-auto mb-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center relative z-10
                                group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-indigo-500/10
                            `}>
                                <div className={`absolute inset-0 bg-${step.color}-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                                <step.icon size={40} className={`text-${step.color}-400 relative z-20`} />
                                
                                {/* Badge Number */}
                                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-white font-bold shadow-lg">
                                    {idx + 1}
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors">
                                {step.title}
                            </h3>
                            <p className="text-slate-400 leading-relaxed max-w-xs mx-auto">
                                {step.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
