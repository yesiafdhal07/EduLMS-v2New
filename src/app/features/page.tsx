'use client';

import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { CheckCircle } from 'lucide-react';

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-slate-900 text-white font-outfit">
            <LandingNavbar />

            <main className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h1 className="text-5xl font-black mb-6">Fitur Lengkap EduLMS</h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Pelajari lebih dalam bagaimana EduLMS me-revolusi kegiatan belajar mengajar di sekolah Anda.
                        </p>
                    </div>

                    <FeaturesGrid />

                    <div className="grid md:grid-cols-2 gap-12 mt-20 items-center">
                        <div className="space-y-8">
                            <h2 className="text-3xl font-black">Untuk Guru</h2>
                            <ul className="space-y-4">
                                {['Manajemen Kelas Multimedia', 'Bank Soal Tak Terbatas', 'Analisis Nilai Otomatis', 'Laporan Presensi Harian'].map(item => (
                                    <li key={item} className="flex items-center gap-3 text-lg text-slate-300">
                                        <CheckCircle className="text-indigo-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10">
                            {/* Placeholder for teacher feature graphic */}
                            <div className="aspect-video bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                                <span className="text-indigo-400 font-bold">Dashboard Guru</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
