'use client';

import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Check } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-slate-900 text-white font-outfit">
            <LandingNavbar />

            <main className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h1 className="text-5xl font-black mb-6">Paket Harga</h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-20">
                        Mulai gratis, upgrade kapan saja sesuai kebutuhan sekolah Anda.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Free Tier */}
                        <div className="bg-slate-800 p-10 rounded-[3rem] border border-white/10 text-left hover:border-indigo-500/50 transition-all shadow-xl">
                            <h3 className="text-2xl font-bold mb-2">Basic</h3>
                            <p className="text-slate-400 text-sm mb-6">Untuk guru individual</p>
                            <div className="text-4xl font-black mb-8">Gratis</div>
                            <ul className="space-y-4 mb-10">
                                {['1 Kelas Aktif', 'Max 30 Siswa', '5GB Storage', 'Fitur Dasar'].map(i => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                                        <Check size={16} className="text-indigo-500" /> {i}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/register" className="block w-full py-4 text-center bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors">
                                Mulai Gratis
                            </Link>
                        </div>

                        {/* Pro Tier */}
                        <div className="bg-indigo-600 p-10 rounded-[3rem] border border-indigo-500 text-left relative transform md:-translate-y-4 shadow-2xl shadow-indigo-500/30">
                            <div className="absolute top-0 right-0 bg-amber-400 text-indigo-900 text-[10px] font-black px-4 py-1 rounded-bl-xl rounded-tr-[2rem] uppercase tracking-widest">
                                Populer
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Pro Teacher</h3>
                            <p className="text-indigo-200 text-sm mb-6">Untuk guru profesional</p>
                            <div className="text-4xl font-black mb-8">Rp 49rb<span className="text-lg font-normal opacity-50">/bulan</span></div>
                            <ul className="space-y-4 mb-10">
                                {['Unlimited Kelas', 'Unlimited Siswa', '50GB Storage', 'Analisis Lanjutan', 'Prioritas Support'].map(i => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-white">
                                        <Check size={16} className="text-amber-300" /> {i}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/register" className="block w-full py-4 text-center bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold transition-colors shadow-lg">
                                Coba Pro Gratis
                            </Link>
                        </div>

                        {/* School Tier */}
                        <div className="bg-slate-800 p-10 rounded-[3rem] border border-white/10 text-left hover:border-indigo-500/50 transition-all shadow-xl">
                            <h3 className="text-2xl font-bold mb-2">Sekolah</h3>
                            <p className="text-slate-400 text-sm mb-6">Untuk institusi pendidikan</p>
                            <div className="text-4xl font-black mb-8">Hubungi Kami</div>
                            <ul className="space-y-4 mb-10">
                                {['Dashboard Admin', 'Manajemen Staff', 'Custom Domain', 'Training Khusus', 'API Access', 'SLA 99.9%'].map(i => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                                        <Check size={16} className="text-indigo-500" /> {i}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/contact" className="block w-full py-4 text-center bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors">
                                Hubungi Sales
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
