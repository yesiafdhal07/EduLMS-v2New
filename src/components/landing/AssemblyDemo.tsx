'use client';

import { QrCode, BarChart, Users, Star } from 'lucide-react';

export function AssemblyDemo() {
    return (
        <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center">
            {/* Ambient Backlight Glow */}
            <div className="absolute inset-0 bg-cyan-500/5 rounded-full blur-[120px] animate-pulse duration-[4s]" />

            {/* Layer 1: Wireframe Dashboard (Base) */}
            <div 
                id="assembly-wireframe"
                className="absolute w-[85%] h-[75%] bg-[#0B0B14] border border-white/[0.04] rounded-2xl shadow-2xl flex flex-col pointer-events-none opacity-40 transform scale-95 transition-all duration-700"
            >
                <div className="h-10 border-b border-white/[0.04] px-4 flex items-center gap-1.5 bg-white/[0.02]">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/10" />
                </div>
                <div className="flex-1 p-5 grid grid-cols-3 gap-3">
                    <div className="col-span-1 bg-white/[0.01] rounded-xl border border-white/[0.03] h-20"></div>
                    <div className="col-span-1 bg-white/[0.01] rounded-xl border border-white/[0.03] h-20"></div>
                    <div className="col-span-1 bg-white/[0.01] rounded-xl border border-white/[0.03] h-20"></div>
                    <div className="col-span-3 bg-white/[0.005] rounded-xl border border-white/[0.03] flex-1"></div>
                </div>
            </div>

            {/* Layer 2: QR Scanner Node (Float In) */}
            <div 
                id="assembly-qr"
                className="absolute top-1/4 left-12 p-3.5 bg-gradient-to-br from-cyan-500 to-cyan-400 rounded-2xl shadow-[0_0_30px_rgba(0,229,255,0.3)] flex items-center gap-3 text-[#0A0A0F] z-20 opacity-0 transform translate-y-8 scale-90 transition-all duration-700 delay-200"
            >
                <div className="p-2 bg-white/20 rounded-xl">
                    <QrCode size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#0A0A0F]/60">Absensi</p>
                    <p className="text-sm font-black tracking-tight">QR Scan Sukses</p>
                </div>
            </div>

            {/* Layer 3: Analytics Node (Grow Up) */}
            <div 
                id="assembly-chart"
                className="absolute bottom-1/4 right-12 p-4 bg-[#12121A]/80 backdrop-blur-md rounded-2xl border border-cyan-500/30 shadow-[0_0_40px_rgba(0,229,255,0.08)] z-20 flex flex-col gap-2 opacity-0 transform translate-y-12 scale-90 transition-all duration-700 delay-400"
            >
                <div className="flex items-center gap-2 mb-1 border-b border-white/[0.04] pb-1.5">
                    <BarChart size={14} className="text-cyan-400" />
                    <span className="text-xs font-bold text-white">Kehadiran Hari Ini</span>
                </div>
                <div className="h-14 flex items-end gap-1.5 px-1">
                    <div className="w-5 bg-cyan-500/20 rounded-t-lg h-1/3"></div>
                    <div className="w-5 bg-cyan-500/30 rounded-t-lg h-1/2"></div>
                    <div className="w-5 bg-cyan-500/50 rounded-t-lg h-2/3"></div>
                    <div className="w-5 bg-cyan-400 rounded-t-lg h-[90%] shadow-[0_0_10px_rgba(0,229,255,0.3)]"></div>
                </div>
            </div>

            {/* Layer 4: Floating counter Status */}
            <div 
                id="assembly-status"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 z-10 opacity-0 scale-75 transition-all duration-500 delay-300 backdrop-blur-sm"
            >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                <span className="text-xs font-bold text-emerald-400 tracking-tight">Kelas Terhubung</span>
            </div>
            
            {/* SVG Connecting Light Beam (subtle) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
                <path 
                    d="M 120,200 Q 250,250 350,180" 
                    fill="none" 
                    stroke="url(#beam-gradient)" 
                    strokeWidth="1.5" 
                    className="opacity-40"
                    strokeDasharray="4 4"
                />
                <defs>
                    <linearGradient id="beam-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00E5FF" />
                        <stop offset="100%" stopColor="#A78BFA" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}
