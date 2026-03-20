'use client';

import { useRef } from 'react';
import {
    Users, FileText, Calendar, BarChart3,
    GraduationCap, Shield, Zap, Laptop
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { Spotlight } from '@/components/ui/Spotlight';

const features = [
    {
        icon: Users,
        title: 'Manajemen Kelas',
        desc: 'Kelola siswa, jadwal, dan data kelas dalam satu dashboard. Undang siswa cukup dengan kode kelas.',
        gradient: 'from-cyan-500/20 to-cyan-500/5',
        iconColor: 'text-cyan-400',
        iconBg: 'bg-cyan-500/10',
        borderHover: 'hover:border-cyan-500/20',
        span: 'md:col-span-2 md:row-span-2',
    },
    {
        icon: FileText,
        title: 'Penugasan Digital',
        desc: 'Buat, bagikan, dan nilai tugas secara online. Dukung berbagai format file.',
        gradient: 'from-violet-500/20 to-violet-500/5',
        iconColor: 'text-violet-400',
        iconBg: 'bg-violet-500/10',
        borderHover: 'hover:border-violet-500/20',
        span: 'md:col-span-1',
    },
    {
        icon: Calendar,
        title: 'Presensi QR Code',
        desc: 'Absensi cepat lewat QR code. Otomatis tercatat dengan waktu dan lokasi siswa.',
        gradient: 'from-emerald-500/20 to-emerald-500/5',
        iconColor: 'text-emerald-400',
        iconBg: 'bg-emerald-500/10',
        borderHover: 'hover:border-emerald-500/20',
        span: 'md:col-span-1',
    },
    {
        icon: BarChart3,
        title: 'Analitik & Laporan',
        desc: 'Dashboard analitik komprehensif. Pantau progress siswa, tren nilai, dan kehadiran dalam grafik visual real-time.',
        gradient: 'from-blue-500/20 to-blue-500/5',
        iconColor: 'text-blue-400',
        iconBg: 'bg-blue-500/10',
        borderHover: 'hover:border-blue-500/20',
        span: 'md:col-span-2',
    },
    {
        icon: GraduationCap,
        title: 'Peer Review',
        desc: 'Siswa bisa saling menilai karya teman. Melatih kemampuan analisis dan kolaborasi.',
        gradient: 'from-pink-500/20 to-pink-500/5',
        iconColor: 'text-pink-400',
        iconBg: 'bg-pink-500/10',
        borderHover: 'hover:border-pink-500/20',
        span: 'md:col-span-1',
    },
    {
        icon: Shield,
        title: 'Aman & Terenkripsi',
        desc: 'Data sekolah tersimpan aman dengan enkripsi standar bank. Privasi terjaga.',
        gradient: 'from-amber-500/20 to-amber-500/5',
        iconColor: 'text-amber-400',
        iconBg: 'bg-amber-500/10',
        borderHover: 'hover:border-amber-500/20',
        span: 'md:col-span-1',
    },
    {
        icon: Zap,
        title: 'Cepat & Ringan',
        desc: 'Akses tanpa lag bahkan di koneksi lambat. Optimal di semua perangkat.',
        gradient: 'from-yellow-500/20 to-yellow-500/5',
        iconColor: 'text-yellow-400',
        iconBg: 'bg-yellow-500/10',
        borderHover: 'hover:border-yellow-500/20',
        span: 'md:col-span-1',
    },
    {
        icon: Laptop,
        title: 'Multi-Device',
        desc: 'Tampilan responsif — sempurna di HP, tablet, maupun laptop guru.',
        gradient: 'from-teal-500/20 to-teal-500/5',
        iconColor: 'text-teal-400',
        iconBg: 'bg-teal-500/10',
        borderHover: 'hover:border-teal-500/20',
        span: 'md:col-span-1',
    }
];

export function FeaturesGrid() {
    const sectionRef = useRef<HTMLElement>(null);
    const headingRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!sectionRef.current) return;

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

        ScrollTrigger.refresh();
    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} className="py-28 relative z-10">
            <div className="max-w-7xl mx-auto px-6">
                <div ref={headingRef} className="text-center mb-20">
                    <p className="text-cyan-400 text-sm font-bold uppercase tracking-[0.2em] mb-4">Fitur Unggulan</p>
                    <h2 className="text-4xl md:text-6xl font-black mb-6 text-white tracking-tight">
                        Semua yang Guru Butuhkan.
                        <br />
                        <span className="text-gradient-brand">Dalam Satu Klik.</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        Dari absensi sampai rapor, semuanya otomatis. Hemat waktu administrasi, fokus mengajar.
                    </p>
                </div>

                <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">
                    {features.map((feature, idx) => (
                        <Spotlight
                            key={idx}
                            className={`
                                rounded-3xl 
                                bg-white/[0.02] backdrop-blur-sm
                                border border-white/[0.04]
                                ${feature.borderHover}
                                hover:bg-white/[0.04]
                                transition-all duration-500 
                                ${feature.span}
                                flex flex-col h-full
                            `}
                        >
                            <div className="p-8 flex flex-col h-full relative">
                                {/* Gradient overlay on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover/spotlight:opacity-100 transition-opacity duration-500 rounded-3xl`}></div>

                                <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${feature.iconBg} group-hover/spotlight:scale-110 transition-transform duration-300`}>
                                    <feature.icon size={24} className={feature.iconColor} />
                                </div>

                                <div className="relative z-10 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold mb-3 text-white group-hover/spotlight:text-cyan-300 transition-colors duration-300">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm leading-relaxed group-hover/spotlight:text-gray-400 transition-colors duration-300 flex-1">
                                        {feature.desc}
                                    </p>
                                </div>
                            </div>
                        </Spotlight>
                    ))}
                </div>
            </div>
        </section>
    );
}
