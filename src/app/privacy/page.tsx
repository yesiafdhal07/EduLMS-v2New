'use client';

import { EntranceAnimation, Footer } from '@/components/ui';
import { AmbientBackground } from '@/components/landing-new/AmbientBackground';
import { Shield, Lock, Eye, FileText, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#0F1014] text-white selection:bg-[#B4A3FF]/30">
            <AmbientBackground />
            
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F1014]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <ChevronLeft size={20} className="text-slate-400 group-hover:text-[#B4A3FF] transition-colors" />
                        <span className="font-bold text-slate-400 group-hover:text-white transition-colors">Kembali</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#B4A3FF] rounded-lg flex items-center justify-center font-black text-[#0F1014] text-xl">K</div>
                        <span className="font-black tracking-tighter text-xl">Klolakelas</span>
                    </div>
                    <div className="w-20"></div> {/* Spacer */}
                </div>
            </header>

            <main className="pt-32 pb-20 px-6">
                <EntranceAnimation>
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-12 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#B4A3FF]/10 border border-[#B4A3FF]/20 text-[#B4A3FF] text-xs font-black uppercase tracking-widest mb-6">
                                <Shield size={14} />
                                Data Privacy
                            </div>
                            <h1 className="text-5xl font-black tracking-tight mb-6">Kebijakan Privasi</h1>
                            <p className="text-slate-400 text-lg">Terakhir diperbarui: 10 Mei 2026</p>
                        </div>

                        <div className="space-y-12 text-slate-300 leading-relaxed text-lg">
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                    <Lock className="text-[#B4A3FF]" size={24} />
                                    1. Informasi yang Kami Kumpulkan
                                </h2>
                                <p>
                                    Klolakelas mengumpulkan informasi untuk memberikan layanan pendidikan yang lebih baik. Informasi yang kami kumpulkan meliputi:
                                </p>
                                <ul className="list-disc pl-6 mt-4 space-y-2">
                                    <li>Data Identitas: Nama lengkap, alamat email, dan foto profil.</li>
                                    <li>Data Pendidikan: Nama sekolah, kelas, nilai, dan catatan kehadiran.</li>
                                    <li>Data Lokasi: Koordinat GPS saat melakukan presensi QR (hanya untuk validasi geo-fencing).</li>
                                    <li>Data Perangkat: Jenis perangkat, sistem operasi, dan alamat IP untuk keamanan akun.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                    <Eye className="text-[#B4A3FF]" size={24} />
                                    2. Bagaimana Kami Menggunakan Data
                                </h2>
                                <p>
                                    Data Anda digunakan secara eksklusif untuk kepentingan akademik:
                                </p>
                                <ul className="list-disc pl-6 mt-4 space-y-2">
                                    <li>Memproses kehadiran siswa secara real-time.</li>
                                    <li>Menganalisis performa akademik menggunakan teknologi AI untuk memberikan rekomendasi belajar.</li>
                                    <li>Memfasilitasi komunikasi antara sekolah, guru, dan orang tua.</li>
                                    <li>Meningkatkan keamanan platform dari akses yang tidak sah.</li>
                                </ul>
                            </section>

                            <section className="bg-white/5 border border-white/10 rounded-3xl p-8">
                                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                    <Shield className="text-emerald-400" size={24} />
                                    3. Keamanan Data
                                </h2>
                                <p>
                                    Kami menerapkan enkripsi standar industri (AES-256) untuk melindungi data sensitif Anda. Semua akses ke database dikontrol melalui kebijakan RLS (Row Level Security) yang ketat, memastikan hanya pihak yang berwenang yang dapat melihat data tertentu.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                    <FileText className="text-[#B4A3FF]" size={24} />
                                    4. Hak Pengguna
                                </h2>
                                <p>
                                    Anda memiliki hak penuh untuk mengakses, memperbaiki, atau meminta penghapusan data pribadi Anda dari platform kami. Hubungi administrator sekolah Anda atau tim dukungan kami di support@klolakelas.id.
                                </p>
                            </section>
                        </div>
                    </div>
                </EntranceAnimation>
            </main>

            <Footer />
        </div>
    );
}
