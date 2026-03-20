'use client';

import { useState, useRef, MouseEvent, TouchEvent } from 'react';
import { FileText, Smartphone, ArrowLeftRight } from 'lucide-react';

export function EliminatedSlider() {
    const [sliderPos, setSliderPos] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = (clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPos(percentage);
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);

    return (
        <div 
            ref={containerRef}
            className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-w-4xl mx-auto rounded-3xl overflow-hidden border border-white/[0.08] cursor-col-resize select-none shadow-2xl shadow-cyan-500/5 group"
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
        >
            {/* Sisi Kiri: Sistem Berantakan (Before) */}
            <div className="absolute inset-0 bg-[#07070A] flex flex-col items-start justify-center">
                <div className="relative p-7 text-center space-y-4 max-w-xs w-full sm:ml-[12%]">
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-1 border border-red-500/10">
                        <FileText size={24} className="text-red-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Sistem Manual</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">Kertas absensi hilang, rekap nilai berjam-jam, grup WA penuh tugas menumpuk.</p>
                    <div className="pt-2 flex flex-col gap-2 max-w-[200px] mx-auto w-full">
                        <div className="h-6 bg-red-500/5 border border-red-500/20 rounded-md text-[10px] text-red-400/70 flex items-center px-3 line-through">Absen Kelas 12A: Hilang</div>
                        <div className="h-6 bg-red-500/5 border border-red-500/20 rounded-md text-[10px] text-red-400/70 flex items-center px-3 line-through">Nilai Ujian: Berantakan</div>
                    </div>
                </div>
            </div>

            {/* Sisi Kanan: Klolakelas Dashboard (After) */}
            <div 
                className="absolute inset-0 bg-[#0A0A0F] flex flex-col items-end justify-center"
                style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
            >
                <div className="relative p-7 text-center space-y-4 max-w-xs w-full sm:mr-[12%]">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-1 border border-cyan-500/10 shadow-[0_0_20px_rgba(0,229,255,0.1)]">
                        <Smartphone size={24} className="text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-bold text-cyan-300 tracking-tight">Klolakelas Digital</h3>
                    <p className="text-gray-300 text-xs leading-relaxed">Absen QR hitungan detik, nilai otomatis, dan rapor satu klik. Penghematan waktu total.</p>
                    <div className="pt-2 flex flex-col gap-2 max-w-[200px] mx-auto w-full">
                        <div className="h-6 bg-cyan-500/10 border border-cyan-500/20 rounded-md text-[10px] text-cyan-400 flex items-center px-3 font-medium">✓ Absen: Otomatis Tercatat</div>
                        <div className="h-6 bg-cyan-500/10 border border-cyan-500/20 rounded-md text-[10px] text-cyan-400 flex items-center px-3 font-medium">✓ Nilai: Grafik Siap Export</div>
                    </div>
                </div>
            </div>

            {/* Drag Bar Handler */}
            <div 
                className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.6)] cursor-col-resize flex items-center justify-center group-hover:scale-x-125 transition-transform"
                style={{ left: `${sliderPos}%` }}
            >
                <div className="w-7 h-11 rounded-xl bg-cyan-400 flex flex-col items-center justify-center gap-1 shadow-lg pointer-events-none border border-cyan-300">
                    <ArrowLeftRight size={14} className="text-[#0A0A0F]" />
                </div>
            </div>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[10px] text-gray-400 flex items-center gap-2 pointer-events-none">
                <span>Geser untuk membandingkan</span>
            </div>
        </div>
    );
}
