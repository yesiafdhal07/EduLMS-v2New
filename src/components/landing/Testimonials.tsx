'use client';

import { Star, Quote } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const testimonials = [
    {
        name: 'Budi Santoso',
        role: 'Guru Matematika, SMAN 1 Jakarta',
        content: '"Absensi yang dulu makan 10 menit sekarang selesai 30 detik pakai QR code. Grading otomatis juga sangat membantu. Waktu saya jadi lebih fokus ke mengajar."',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80'
    },
    {
        name: 'Siti Aminah',
        role: 'Kepala Sekolah, SMP Negeri 5',
        content: '"Guru-guru kami yang kurang paham teknologi pun langsung bisa pakai tanpa training khusus. Laporan kehadiran dan nilai bisa kami pantau real-time dari HP."',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80'
    },
    {
        name: 'Rizky Pratama',
        role: 'Siswa Kelas XII, SMA Taruna',
        content: '"Tugas jadi lebih terorganisir. Notifikasi deadline bikin nggak pernah telat lagi. Fitur peer review-nya seru, kita bisa belajar dari cara pikir teman."',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80'
    },
    {
        name: 'Dewi Sartika',
        role: 'Guru Bahasa Inggris, SMA Binus',
        content: '"Fitur diskusi anonim game-changer banget. Siswa yang pendiam jadi berani bertanya. Engagement kelas meningkat 3x lipat sejak pakai Klolakelas."',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&q=80'
    },
    {
        name: 'Ahmad Dahlan',
        role: 'Wakil Kurikulum, MAN 2 Surabaya',
        content: '"Analitik belajarnya detail banget. Kami bisa lihat tren nilai per mata pelajaran, kehadiran harian, dan deteksi dini siswa yang butuh perhatian khusus."',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80'
    },
    {
        name: 'Putri Ayu',
        role: 'Siswa Kelas X, SMA Al-Azhar',
        content: '"Dark mode-nya enak di mata buat ngerjain tugas malam. Aplikasinya ringan banget di HP, nggak kayak platform lain yang berat dan sering error."',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80'
    }
];

const marqueeData = [...testimonials, ...testimonials];

const TestimonialCard = ({ data }: { data: typeof testimonials[0] }) => (
    <div className="w-[380px] shrink-0 p-6 mx-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-cyan-500/15 relative group hover:-translate-y-1 transition-all duration-400 backdrop-blur-sm">
        <Quote className="absolute top-6 right-6 text-cyan-500/10" size={28} />

        <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={13} className="fill-amber-400 text-amber-400" />
            ))}
        </div>

        <p className="text-gray-400 leading-relaxed mb-6 text-sm line-clamp-4">
            {data.content}
        </p>

        <div className="flex items-center gap-3 mt-auto">
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/[0.1]">
                <Image
                    src={data.avatar}
                    alt={data.name}
                    fill
                    className="object-cover"
                />
            </div>
            <div>
                <h4 className="font-bold text-white text-sm">{data.name}</h4>
                <p className="text-cyan-400/60 text-xs font-medium">{data.role}</p>
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
        <section ref={sectionRef} className="py-28 relative overflow-hidden">
            <div ref={headingRef} className="max-w-7xl mx-auto px-6 relative z-10 mb-14 text-center">
                <p className="text-cyan-400 text-sm font-bold uppercase tracking-[0.2em] mb-4">Testimoni</p>
                <h2 className="text-4xl md:text-6xl font-black mb-6 text-white tracking-tight">
                    Dipercaya Guru di <span className="text-gradient-brand">Seluruh Indonesia</span>
                </h2>
                <p className="text-gray-400 text-lg max-w-xl mx-auto">
                    Ribuan pendidik dan pelajar sudah merasakan dampaknya. Ini kata mereka.
                </p>
            </div>

            {/* Marquee Row 1 */}
            <div className="flex overflow-hidden mb-6">
                <div className="flex animate-marquee">
                    {marqueeData.map((testimoni, idx) => (
                        <TestimonialCard key={`row1-${idx}`} data={testimoni} />
                    ))}
                </div>
            </div>

            {/* Marquee Row 2 (Reverse) */}
            <div className="flex overflow-hidden">
                <div className="flex animate-marquee-reverse">
                    {marqueeData.map((testimoni, idx) => (
                        <TestimonialCard key={`row2-${idx}`} data={testimoni} />
                    ))}
                </div>
            </div>

            {/* Gradient fade edges */}
            <div className="absolute top-0 left-0 w-40 h-full bg-gradient-to-r from-[#0A0A0F] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-40 h-full bg-gradient-to-l from-[#0A0A0F] to-transparent z-10 pointer-events-none"></div>
        </section>
    );
}
