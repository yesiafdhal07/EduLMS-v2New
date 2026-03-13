'use client';

import { Star, Quote, User } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const testimonials = [
    {
        name: 'Budi Santoso',
        role: 'Guru Matematika, SMAN 1 Jakarta',
        content: '"Klolakelas benar-benar mengubah cara saya mengelola kelas. Presensi otomatis dan grading system-nya sangat membantu menghemat waktu administrasi."',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80'
    },
    {
        name: 'Siti Aminah',
        role: 'Kepala Sekolah',
        content: '"Platform yang sangat intuitif. Guru-guru kami yang kurang paham teknologi pun bisa langsung menggunakannya tanpa kendala berarti. Sangat direkomendasikan!"',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80'
    },
    {
        name: 'Rizky Pratama',
        role: 'Siswa Kelas XII',
        content: '"Tugas jadi lebih terorganisir, dan saya suka fitur peer review-nya. Kita jadi bisa belajar dari teman lain dan memperbaiki kesalahan."',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80'
    },
    {
        name: 'Dewi Sartika',
        role: 'Guru Bahasa Inggris',
        content: '"Fitur diskusi anonim sangat membantu siswa yang pemalu untuk lebih aktif bertanya. Engagement kelas meningkat drastis."',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&q=80'
    },
    {
        name: 'Ahmad Dahlan',
        role: 'Kurikulum',
        content: '"Analitik belajar yang disediakan sangat detail. Kami bisa memantau progress setiap siswa dengan akurat dan memberikan intervensi tepat waktu."',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80'
    },
    {
        name: 'Putri Ayu',
        role: 'Siswa Kelas X',
        content: '"Tampilan dark mode-nya enak di mata, apalagi kalau ngerjain tugas malam-malam. Aplikasinya juga ringan banget di HP kentang saya."',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80'
    }
];

// Duplicate data to create seamless loop
const marqueeData = [...testimonials, ...testimonials];

const TestimonialCard = ({ data }: { data: typeof testimonials[0] }) => (
    <div className="w-[400px] shrink-0 p-6 mx-4 rounded-3xl glass-panel relative group hover:-translate-y-1 transition-transform duration-300">
        <Quote className="absolute top-6 right-6 text-indigo-500/20" size={32} />
        
        <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} className="fill-amber-400 text-amber-400" />
            ))}
        </div>

        <p className="text-slate-300 leading-relaxed mb-6 italic text-sm line-clamp-4">
            {data.content}
        </p>

        <div className="flex items-center gap-4 mt-auto">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10">
                <Image
                    src={data.avatar}
                    alt={data.name}
                    fill
                    className="object-cover"
                />
            </div>
            <div>
                <h4 className="font-bold text-white text-sm">{data.name}</h4>
                <p className="text-indigo-400 text-xs font-medium uppercase tracking-wider">{data.role}</p>
            </div>
        </div>
    </div>
);

export function Testimonials() {
    const sectionRef = useRef<HTMLElement>(null);
    const headingRef = useRef<HTMLDivElement>(null);

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
        ScrollTrigger.refresh();
    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} className="py-24 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent pointer-events-none"></div>

            <div ref={headingRef} className="max-w-7xl mx-auto px-6 relative z-10 mb-12 text-center">
                <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
                    Apa Kata <span className="text-gradient-brand">Mereka?</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-xl mx-auto">
                    Ribuan pendidik dan pelajar telah merasakan dampak positif Klolakelas.
                </p>
            </div>

            {/* Marquee Row 1 */}
            <div className="flex overflow-hidden mb-8 mask-linear-fade">
                <div className="flex animate-marquee hover:pause-animation">
                    {marqueeData.map((testimoni, idx) => (
                        <TestimonialCard key={`row1-${idx}`} data={testimoni} />
                    ))}
                </div>
            </div>

            {/* Marquee Row 2 (Reverse) */}
            <div className="flex overflow-hidden mask-linear-fade">
                <div className="flex animate-marquee-reverse hover:pause-animation">
                    {marqueeData.map((testimoni, idx) => (
                        <TestimonialCard key={`row2-${idx}`} data={testimoni} />
                    ))}
                </div>
            </div>
            
            {/* Gradient masks for smooth fade edges */}
            <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none"></div>
        </section>
    );
}
