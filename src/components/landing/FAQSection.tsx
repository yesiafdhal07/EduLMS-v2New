'use client';

import { useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const faqs = [
    {
        q: 'Apakah Klolakelas gratis?',
        a: 'Ya, kami menyediakan paket dasar yang gratis selamanya untuk guru individual. Untuk sekolah, kami menawarkan paket premium dengan fitur administrasi lengkap.'
    },
    {
        q: 'Apakah bisa diakses lewat HP?',
        a: 'Tentu saja! Klolakelas didesain responsif dan bisa diakses lancar melalui browser di HP, Tablet, maupun Laptop.'
    },
    {
        q: 'Bagaimana keamanan data siswa?',
        a: 'Kami menggunakan enkripsi SSL bank-grade di seluruh platform. Data Anda tersimpan aman dan tidak akan dibagikan ke pihak ketiga.'
    },
    {
        q: 'Apakah ada batasan jumlah siswa?',
        a: 'Untuk paket gratis, Anda bisa mengelola hingga 5 kelas dengan maksimal 40 siswa per kelas. Paket sekolah tidak memiliki batasan.'
    },
    {
        q: 'Apakah support Bahasa Indonesia?',
        a: '100% iya. Platform dikembangkan oleh tim lokal dan mendukung penuh Bahasa Indonesia.'
    }
];

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const sectionRef = useRef<HTMLElement>(null);
    const headingRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!sectionRef.current) return;

        // Heading reveal
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
        <section ref={sectionRef} className="py-24 relative bg-transparent">
            <div className="max-w-3xl mx-auto px-6">
                <div ref={headingRef} className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
                        Sering <span className="text-gradient-brand">Ditanyakan</span>
                    </h2>
                </div>

                <div ref={listRef} className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div 
                            key={idx}
                            className={`
                                rounded-2xl border transition-colors duration-300 overflow-hidden
                                ${openIndex === idx 
                                    ? 'bg-indigo-900/20 border-indigo-500/30 shadow-lg shadow-indigo-500/10' 
                                    : 'bg-white/5 border-white/5 hover:border-white/10'
                                }
                            `}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                className="w-full px-8 py-6 flex items-center justify-between text-left group"
                            >
                                <span className={`text-lg font-bold transition-colors ${openIndex === idx ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                    {faq.q}
                                </span>
                                {openIndex === idx ? (
                                    <ChevronUp className="text-indigo-400" />
                                ) : (
                                    <ChevronDown className="text-slate-500 group-hover:text-white transition-colors" />
                                )}
                            </button>
                            
                            <div 
                                className={`
                                    transition-all duration-300 ease-in-out px-8 
                                    ${openIndex === idx ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0'}
                                `}
                            >
                                <p className="text-slate-400 leading-relaxed">
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
