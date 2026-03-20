'use client';

import { useRef, useState } from 'react';
import { ChevronDown, Plus, Minus } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const faqs = [
    {
        q: 'Apakah Klolakelas benar-benar gratis?',
        a: 'Ya! Paket dasar gratis selamanya untuk guru individual — termasuk manajemen kelas, absensi QR, dan penugasan. Untuk sekolah yang butuh fitur admin, analitik lanjutan, dan multi-guru, kami punya paket premium yang terjangkau.'
    },
    {
        q: 'Apakah bisa diakses dari HP?',
        a: 'Tentu! Klolakelas didesain mobile-first — tampilnya optimal di HP, tablet, maupun laptop. Cukup buka browser, tidak perlu instal aplikasi tambahan.'
    },
    {
        q: 'Bagaimana keamanan data siswa dan sekolah?',
        a: 'Kami menggunakan enkripsi SSL bank-grade dan server terenkripsi. Data sekolah tidak pernah dibagikan ke pihak ketiga. Backup otomatis setiap hari memastikan data aman dari kehilangan.'
    },
    {
        q: 'Apakah ada batasan jumlah siswa atau kelas?',
        a: 'Paket gratis mendukung hingga 5 kelas dengan masing-masing 40 siswa. Paket sekolah tidak memiliki batasan — cocok untuk sekolah dengan ratusan siswa.'
    },
    {
        q: 'Apakah guru perlu pelatihan khusus?',
        a: 'Tidak perlu! Klolakelas dirancang agar guru bisa langsung pakai tanpa training. Interface-nya intuitif, dan kami sediakan panduan lengkap dalam Bahasa Indonesia.'
    },
    {
        q: 'Bisa export data ke Excel atau rapor?',
        a: 'Bisa banget. Semua data — nilai, absensi, progress siswa — bisa di-export ke Excel (XLSX) dan PDF. Rapor juga bisa digenerate otomatis sesuai format sekolah.'
    }
];

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const sectionRef = useRef<HTMLElement>(null);
    const headingRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!sectionRef.current) return;

        gsap.fromTo(headingRef.current,
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.7,
                scrollTrigger: {
                    trigger: headingRef.current,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
                clearProps: "all"
            }
        );

        const items = listRef.current?.children;
        if (items && items.length > 0) {
            gsap.fromTo(items,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    stagger: 0.08,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: listRef.current,
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
        <section ref={sectionRef} className="py-28 relative bg-transparent">
            <div className="max-w-3xl mx-auto px-6">
                <div ref={headingRef} className="text-center mb-16">
                    <p className="text-cyan-400 text-sm font-bold uppercase tracking-[0.2em] mb-4">FAQ</p>
                    <h2 className="text-4xl md:text-6xl font-black mb-6 text-white tracking-tight">
                        Pertanyaan <span className="text-gradient-brand">Populer</span>
                    </h2>
                </div>

                <div ref={listRef} className="space-y-3">
                    {faqs.map((faq, idx) => (
                        <div
                            key={idx}
                            className={`
                                rounded-2xl border transition-all duration-400 overflow-hidden
                                ${openIndex === idx
                                    ? 'bg-white/[0.04] border-cyan-500/20 shadow-lg shadow-cyan-500/5 border-l-cyan-400 border-l-[3px]'
                                    : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.03]'
                                }
                            `}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                className="w-full px-7 py-5 flex items-center justify-between text-left group"
                            >
                                <span className={`text-base font-semibold transition-colors pr-4 ${
                                    openIndex === idx ? 'text-white' : 'text-gray-400 group-hover:text-white'
                                }`}>
                                    {faq.q}
                                </span>
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                                    openIndex === idx 
                                        ? 'bg-cyan-500/10 text-cyan-400 rotate-0' 
                                        : 'bg-white/[0.04] text-gray-500 group-hover:text-white'
                                }`}>
                                    {openIndex === idx ? <Minus size={14} /> : <Plus size={14} />}
                                </div>
                            </button>

                            <div
                                className={`
                                    transition-all duration-400 ease-out px-7
                                    ${openIndex === idx ? 'max-h-60 pb-6 opacity-100' : 'max-h-0 opacity-0'}
                                `}
                            >
                                <p className="text-gray-500 leading-relaxed text-sm">
                                    {faq.a}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
