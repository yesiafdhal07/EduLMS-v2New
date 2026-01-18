'use client';

import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Search, Book, User, GraduationCap, Server } from 'lucide-react';

export default function HelpPage() {
    const categories = [
        {
            icon: <User className="text-purple-400" size={24} />,
            title: "Panduan Guru",
            description: "Pelajari cara mengelola kelas, absensi, dan penilaian.",
            link: "#"
        },
        {
            icon: <GraduationCap className="text-emerald-400" size={24} />,
            title: "Panduan Siswa",
            description: "Cara mengakses tugas, materi, dan melakukan absensi QR.",
            link: "#"
        },
        {
            icon: <Server className="text-blue-400" size={24} />,
            title: "Status Sistem",
            description: "Cek status server dan pemeliharaan terjadwal.",
            link: "#"
        }
    ];

    const faqs = [
        {
            q: "Bagaimana cara reset password?",
            a: "Anda dapat menghubungi admin sekolah atau klik 'Lupa Password' di halaman login."
        },
        {
            q: "Apakah aplikasi ini gratis?",
            a: "EduLMS menyediakan versi gratis untuk sekolah kecil dan paket berbayar untuk fitur premium."
        },
        {
            q: "Bagaimana cara absen menggunakan QR Code?",
            a: "Masuk ke menu Absensi, berikan izin kamera, dan scan QR Code yang ditampilkan oleh guru di kelas."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-white font-outfit">
            <LandingNavbar />

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <h1 className="text-4xl md:text-5xl font-black mb-6">
                        Pusat <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Bantuan</span>
                    </h1>
                    <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
                        Temukan jawaban, panduan, dan dukungan teknis untuk pengalaman belajar mengajar yang lebih baik.
                    </p>

                    <div className="relative max-w-xl mx-auto">
                        <input
                            type="text"
                            placeholder="Cari topik bantuan..."
                            className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white font-medium"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    </div>
                </div>

                {/* Categories */}
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    {categories.map((cat, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all cursor-pointer group">
                            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform">
                                {cat.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{cat.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{cat.description}</p>
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    <h2 className="text-2xl font-black mb-8 text-center">Pertanyaan Umum</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="bg-slate-950/50 border border-white/10 p-6 rounded-2xl">
                                <h4 className="font-bold text-lg mb-2 text-indigo-300">{faq.q}</h4>
                                <p className="text-slate-400 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
