'use client';

import { EntranceAnimation, Footer } from '@/components/ui';
import { AmbientBackground } from '@/components/landing-new/AmbientBackground';
import { Scale, CheckCircle2, AlertCircle, FileText, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
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
                                <Scale size={14} />
                                Legal Terms
                            </div>
                            <h1 className="text-5xl font-black tracking-tight mb-6">Syarat & Ketentuan</h1>
                            <p className="text-slate-400 text-lg">Terakhir diperbarui: 10 Mei 2026</p>
                        </div>

                        <div className="space-y-12 text-slate-300 leading-relaxed text-lg">
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                    <CheckCircle2 className="text-[#B4A3FF]" size={24} />
                                    1. Penerimaan Ketentuan
                                </h2>
                                <p>
                                    Dengan mengakses atau menggunakan platform Klolakelas, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju, Anda tidak diperkenankan menggunakan layanan kami.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                    <FileText className="text-[#B4A3FF]" size={24} />
                                    2. Akun Pengguna
                                </h2>
                                <p>
                                    Pengguna bertanggung jawab untuk menjaga kerahasiaan informasi akun dan password mereka. Klolakelas tidak bertanggung jawab atas kerugian yang disebabkan oleh penggunaan akun yang tidak sah.
                                </p>
                                <ul className="list-disc pl-6 mt-4 space-y-2">
                                    <li>Akun guru hanya boleh digunakan oleh tenaga pendidik resmi.</li>
                                    <li>Akun siswa hanya boleh digunakan untuk kegiatan belajar mandiri.</li>
                                    <li>Penyalahgunaan akun dapat berakibat pada penangguhan layanan permanen.</li>
                                </ul>
                            </section>

                            <section className="bg-white/5 border border-white/10 rounded-3xl p-8">
                                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                    <AlertCircle className="text-amber-400" size={24} />
                                    3. Larangan Penggunaan
                                </h2>
                                <p>
                                    Dilarang keras melakukan manipulasi data, kecurangan dalam sistem kehadiran QR, atau upaya peretasan terhadap infrastruktur Klolakelas. Segala bentuk kecurangan akademik akan dilaporkan langsung ke pihak sekolah masing-masing.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                    <Scale className="text-[#B4A3FF]" size={24} />
                                    4. Batasan Tanggung Jawab
                                </h2>
                                <p>
                                    Klolakelas disediakan "sebagaimana adanya". Kami berusaha memberikan layanan 24/7, namun kami tidak menjamin bahwa layanan tidak akan terganggu oleh pemeliharaan sistem atau masalah jaringan pihak ketiga.
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
