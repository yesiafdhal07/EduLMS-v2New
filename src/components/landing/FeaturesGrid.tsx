'use client';

import { useRef } from 'react';
import { Users, FileText, Calendar, GraduationCap, BarChart, Shield, Zap, Laptop } from 'lucide-react';
import { TiltCard } from '@/components/ui';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const features = [
    {
        icon: Users,
        title: 'Manajemen Kelas',
        desc: 'Kelola siswa, absensi, dan data kelas dengan sistem yang terorganisir rapi.',
        color: 'indigo',
        className: 'md:col-span-2 md:row-span-2'
    },
    {
        icon: FileText,
        title: 'Penugasan Digital',
        desc: 'Buat, bagikan, dan nilai tugas secara online. Mendukung berbagai format file.',
        color: 'purple',
        className: 'md:col-span-1'
    },
    {
        icon: Calendar,
        title: 'Presensi Otomatis',
        desc: 'Sistem presensi berbasis waktu dan lokasi untuk akurasi kehadiran siswa.',
        color: 'emerald',
        className: 'md:col-span-1'
    },
    {
        icon: BarChart,
        title: 'Analitik Belajar',
        desc: 'Pantau perkembangan siswa melalui dashboard analitik yang komprehensif.',
        color: 'blue',
        className: 'md:col-span-2'
    },
    {
        icon: GraduationCap,
        title: 'Peer Review',
        desc: 'Fitur review antar siswa untuk melatih kemampuan analisis dan kolaborasi.',
        color: 'pink',
        className: 'md:col-span-1'
    },
    {
        icon: Shield,
        title: 'Aman & Terpercaya',
        desc: 'Data sekolah tersimpan aman dengan enkripsi standar industri.',
        color: 'orange',
        className: 'md:col-span-1'
    },
    {
        icon: Zap,
        title: 'Cepat & Ringan',
        desc: 'Akses platform tanpa lag, dioptimalkan untuk berbagai perangkat.',
        color: 'yellow',
        className: 'md:col-span-1'
    },
    {
        icon: Laptop,
        title: 'Responsif',
        desc: 'Tampilan yang menyesuaikan dengan perangkat desktop, tablet, maupun HP.',
        color: 'cyan',
        className: 'md:col-span-1'
    }
];

export function FeaturesGrid() {
    const sectionRef = useRef<HTMLElement>(null);
    const headingRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

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

        // Feature cards stagger from bottom
        const cards = gridRef.current?.children;
        if (cards && cards.length > 0) {
            gsap.fromTo(cards, 
                { opacity: 0, y: 50, scale: 0.98 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.7,
                    stagger: 0.08,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: gridRef.current,
                        start: 'top 80%',
                        toggleActions: 'play none none none',
                    },
                    clearProps: "all"
                }
            );
        }

        // Final refresh after all animations are set up
        ScrollTrigger.refresh();
    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} className="py-24 relative z-10">
            <div className="max-w-7xl mx-auto px-6">
                <div ref={headingRef} className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
                        Fitur Lengkap untuk
                        <br />
                        <span className="text-gradient-brand">Sekolah Modern</span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Kami menyediakan semua tools yang dibutuhkan guru dan siswa untuk proses belajar mengajar yang efektif.
                    </p>
                </div>

                <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
                    {features.map((feature, idx) => (
                        <TiltCard
                            key={idx}
                            maxTilt={10}
                            scale={1.02}
                            glareEnable={true}
                            className={`
                                group relative p-8 rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/5 
                                hover:bg-white/5 hover:border-white/10 transition-colors shadow-none hover:shadow-2xl duration-300 
                                ${feature.className}
                            `}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]"></div>
                            
                            <div className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-${feature.color}-500/10 group-hover:scale-110 transition-transform duration-300 ring-1 ring-${feature.color}-500/20 group-hover:ring-${feature.color}-500/40`}>
                                <feature.icon size={28} className={`text-${feature.color}-400`} />
                            </div>
                            
                            <div className="relative z-10">
                                <h3 className={`text-xl font-bold mb-3 text-white group-hover:text-${feature.color}-400 transition-colors`}>
                                    {feature.title}
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">
                                    {feature.desc}
                                </p>
                            </div>

                            {/* Decorative gradient orb */}
                            <div className={`absolute -bottom-4 -right-4 w-24 h-24 bg-${feature.color}-500/10 rounded-full blur-2xl group-hover:bg-${feature.color}-500/20 transition-all duration-500`}></div>
                        </TiltCard>
                    ))}
                </div>
            </div>
        </section>
    );
}
