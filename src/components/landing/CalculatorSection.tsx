'use client';

import { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { Clock, TrendingUp, Sparkles } from 'lucide-react';

export function CalculatorSection() {
    const [students, setStudents] = useState(100);
    const sectionRef = useRef<HTMLElement>(null);

    // Rumus estimasi:
    // Tradisional: 0.2 jam per siswa / minggu (kertas, rekap, nilai)
    // Klolakelas: 0.02 jam per siswa / minggu
    const hrsSaved = Math.round(students * 0.18); 
    const moneySaved = hrsSaved * 25000; // IDR 25k per jam setara beban kerja guru admin

    return (
        <section ref={sectionRef} className="py-24 relative overflow-hidden px-6">
            {/* Background ambient */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-4xl mx-auto backdrop-blur-md bg-white/[0.02] border border-white/[0.06] rounded-[2.5rem] p-8 md:p-16 relative">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 rounded-full text-xs font-semibold text-cyan-400 mb-4 border border-cyan-500/20">
                        <Sparkles size={12} />
                        <span>Kalkulator Efisiensi</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                        Hitung <span className="text-shimmer">Tabungan Waktu</span> Anda
                    </h2>
                    <p className="text-gray-400 text-sm mt-3 max-w-md mx-auto">
                        Berapa banyak beban administratif yang bisa Anda pangkas setiap bulannya?
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* INPUT SIDE */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-semibold text-gray-300">Jumlah Siswa Anda</label>
                            <span className="text-2xl font-black text-cyan-400 font-outfit">{students} <span className="text-xs text-gray-500">Siswa</span></span>
                        </div>
                        <input 
                            type="range" 
                            min="30" 
                            max="600" 
                            step="10" 
                            value={students}
                            onChange={(e) => setStudents(parseInt(e.target.value))}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                        />
                        <div className="flex justify-between text-[11px] text-gray-600">
                            <span>30 Siswa</span>
                            <span>300 Siswa</span>
                            <span>600+ Siswa</span>
                        </div>
                    </div>

                    {/* OUTPUT SIDE */}
                    <div className="bg-white/[0.02] border border-white/[0.04] rounded-3xl p-6 flex flex-col gap-5 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-transparent opacity-50"></div>
                        
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 text-cyan-400">
                                <Clock size={22} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Waktu yang Dihemat</p>
                                <p className="text-2xl md:text-3xl font-black text-white font-outfit tracking-tight">~{hrsSaved} Jam / <span className="text-cyan-400 text-lg">Minggu</span></p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 border-t border-white/[0.03] pt-5">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                                <TrendingUp size={22} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Estimasi Efisiensi Beban Guru</p>
                                <p className="text-xl md:text-2xl font-black text-white font-outfit">Rp {moneySaved.toLocaleString('id-ID')} / <span className="text-emerald-400 text-base">Bulan</span></p>
                            </div>
                        </div>

                        <p className="text-gray-600 text-[10px] text-center mt-2 italic">*Estimasi berdasarkan rata-rata beban waktu administrasi sekolah di Indonesia.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
