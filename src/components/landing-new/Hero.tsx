import React from 'react';
import { ArrowRight, Play, Search, Command, Wallet, Activity } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="pt-20 pb-16 px-6 flex flex-col items-center text-center relative reveal-on-scroll">
      {/* Cursors */}
      <div className="absolute top-20 left-[10%] xl:left-[15%] hidden lg:flex flex-col items-start animate-[float_6s_ease-in-out_infinite] z-30 pointer-events-none">
        <svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform -rotate-12 drop-shadow-[0_4px_10px_rgba(134,234,165,0.4)]">
          <path d="M5.65376 2.05244L21.7516 17.068C23.003 18.2355 22.3304 20.3204 20.597 20.6433L14.6186 21.757L10.3701 29.8456C9.55938 31.3892 7.37798 31.1118 6.83984 29.3986L1.13459 11.2332C0.60339 9.54228 1.94982 7.91586 3.65997 8.18205L8.98687 9.01139L5.65376 2.05244Z" fill="#86EAA5" stroke="#0F1014" strokeWidth="2"/>
        </svg>
        <div className="bg-[#86EAA5] text-[#0F1014] text-[11px] font-black px-3 py-1.5 rounded-lg rounded-tl-none -mt-1 shadow-lg ml-3 tracking-wide">Ketua Yayasan</div>
      </div>
      <div className="absolute top-48 right-[10%] xl:right-[15%] hidden lg:flex flex-col items-start animate-[float_8s_ease-in-out_infinite_reverse] z-30 pointer-events-none">
        <svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform rotate-12 drop-shadow-[0_4px_10px_rgba(180,163,255,0.4)]">
          <path d="M5.65376 2.05244L21.7516 17.068C23.003 18.2355 22.3304 20.3204 20.597 20.6433L14.6186 21.757L10.3701 29.8456C9.55938 31.3892 7.37798 31.1118 6.83984 29.3986L1.13459 11.2332C0.60339 9.54228 1.94982 7.91586 3.65997 8.18205L8.98687 9.01139L5.65376 2.05244Z" fill="#B4A3FF" stroke="#0F1014" strokeWidth="2"/>
        </svg>
        <div className="bg-[#B4A3FF] text-[#0F1014] text-[11px] font-black px-3 py-1.5 rounded-lg rounded-tl-none -mt-1 shadow-lg ml-3 tracking-wide">Bendahara TU</div>
      </div>

      <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#181A20] border border-white/10 shadow-lg text-slate-300 text-sm font-bold mb-10 hover:bg-[#1E2028] transition-all cursor-pointer group z-20 transform hover:-translate-y-0.5" aria-label="Pengumuman Infrastruktur NVMe">
        <span className="bg-gradient-to-r from-[#B4A3FF] to-[#86EAA5] text-[#0F1014] px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-black">Baru</span>
        <span>Infrastruktur Dedicated NVMe Kini Aktif</span>
        <ArrowRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
      </div>

      <h1 className="text-5xl md:text-[80px] lg:text-[96px] font-black tracking-tighter text-white max-w-5xl leading-[1.05] mb-8 text-balance relative">
        <span className="absolute -left-16 top-4 w-12 h-12 bg-amber-500/20 rounded-full blur-2xl hidden md:block pointer-events-none"></span>
        Berhenti mengejar data. <br className="hidden sm:block" />
        <span className="font-serif italic font-medium text-[#B4A3FF] pr-2 relative inline-block">
          Mulai memimpin
          <div className="absolute bottom-1 left-0 w-full h-3 sm:h-4 bg-[#B4A3FF]/20 -z-10 rounded-full transform -rotate-1 blur-sm"></div>
        </span> 
        sekolah Anda.
      </h1>
      
      <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto mb-16 font-medium leading-relaxed text-balance">
        Klolakelas adalah ekosistem ERP terpusat yang menyederhanakan penagihan SPP, absensi, koreksi AI, hingga sinkronisasi Dapodik. Didesain untuk meringankan beban pendidik Indonesia.
      </p>

      <div className="flex flex-col sm:flex-row gap-5 justify-center mb-24 w-full px-6 z-20">
        <button className="h-16 bg-white text-[#0F1014] px-10 rounded-2xl text-lg font-black hover:bg-slate-200 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2 transform hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          Jadwalkan Konsultasi Gratis <ArrowRight size={18} />
        </button>
        <button className="h-16 bg-[#181A20] border border-white/10 text-white px-10 rounded-2xl text-lg font-bold hover:bg-[#22242B] transition-all shadow-lg flex items-center justify-center gap-3 group transform hover:-translate-y-1">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors shadow-inner">
            <Play size={14} className="text-[#FFC38B] fill-[#FFC38B]" />
          </div>
          Coba Demo Interaktif
        </button>
      </div>

      {/* RAYCAST STYLE COMMAND PALETTE MOCKUP */}
      <div className="w-full max-w-3xl mx-auto relative perspective-1000 z-20 reveal-on-scroll" style={{ transitionDelay: '0.2s' }}>
        <div className="absolute -inset-1 bg-gradient-to-b from-[#B4A3FF]/20 to-[#86EAA5]/20 rounded-[2rem] blur-2xl opacity-60 pointer-events-none"></div>
        <div className="relative bg-[#12141A]/90 backdrop-blur-3xl rounded-[2rem] ring-1 ring-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden flex flex-col transform hover:-translate-y-2 transition-transform duration-500">
          
          <div className="h-16 border-b border-white/5 flex items-center px-6 gap-4 bg-white/[0.02]">
            <div className="hidden sm:flex gap-1.5 mr-2">
              <div className="w-3 h-3 rounded-full bg-[#2A2C35] shadow-inner"></div>
              <div className="w-3 h-3 rounded-full bg-[#2A2C35] shadow-inner"></div>
              <div className="w-3 h-3 rounded-full bg-[#2A2C35] shadow-inner"></div>
            </div>
            <Search size={18} className="text-slate-400 flex-shrink-0" />
            <div className="flex-1 text-slate-200 font-medium text-sm sm:text-lg flex items-center overflow-hidden whitespace-nowrap text-ellipsis">
              Buat rekap kehadiran siswa hari ini... <div className="w-0.5 h-4 sm:h-5 bg-[#B4A3FF] ml-1 animate-[pulse_1s_ease-in-out_infinite] flex-shrink-0"></div>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <span className="px-2 py-1 bg-white/5 rounded-md text-[10px] font-bold text-slate-500 shadow-inner ring-1 ring-white/5">ESC</span>
            </div>
          </div>
          
          <div className="p-3 bg-[#0F1014]/80">
            <div className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Aksi Cepat Sistem:</div>
            
            <div className="group flex items-center gap-4 px-4 py-3 bg-white/[0.04] rounded-2xl cursor-pointer ring-1 ring-white/5 hover:ring-[#B4A3FF]/30 hover:bg-[#B4A3FF]/10 transition-all mb-2 relative overflow-hidden shadow-sm" role="button" aria-label="Kirim Tagihan SPP Massal">
              <div className="w-10 h-10 bg-[#B4A3FF]/10 rounded-xl flex items-center justify-center group-hover:scale-105 group-hover:bg-[#B4A3FF]/20 transition-all ring-1 ring-[#B4A3FF]/20 shadow-inner">
                <Wallet size={18} className="text-[#B4A3FF]" />
              </div>
              <div className="flex-1 text-left relative z-10">
                <div className="text-sm font-bold text-white">Kirim Tagihan SPP Massal via WA</div>
                <div className="text-xs text-slate-400 mt-0.5 font-medium break-words">Modul Keuangan • 124 Siswa Menunggak</div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-[#B4A3FF] hidden sm:flex items-center gap-1.5 bg-[#B4A3FF]/10 px-2 py-1 rounded-md">Eksekusi <Command size={12}/> E</div>
            </div>

            <div className="group flex items-center gap-4 px-4 py-3 hover:bg-white/[0.03] rounded-2xl cursor-pointer transition-all mb-1" role="button" aria-label="Buka Radar Kehadiran">
              <div className="w-10 h-10 bg-slate-800/50 rounded-xl flex items-center justify-center group-hover:scale-105 transition-all ring-1 ring-white/5">
                <Activity size={18} className="text-slate-400" />
              </div>
              <div className="flex-1 text-left relative z-10">
                <div className="text-sm font-bold text-slate-300">Buka Radar Kehadiran Sekolah (Live)</div>
                <div className="text-xs text-slate-500 mt-0.5 font-medium">Hak Akses: Eksekutif Yayasan</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
