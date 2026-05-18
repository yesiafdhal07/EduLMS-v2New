'use client';

import React, { useState } from 'react';
import { Shield, Crown, BookOpen, GraduationCap, Activity, LineChart, Sparkles, Users, ArrowRightLeft, QrCode, BarChart3, TrendingUp } from 'lucide-react';

export const RoleSwitcher = () => {
  const [activeRole, setActiveRole] = useState(0);

  return (
    <section className="py-32 px-6 max-w-7xl mx-auto relative z-10 border-t border-white/5 reveal-on-scroll">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">
          Satu platform.<br />
          <span className="font-serif italic text-[#FFC38B] font-medium">Empat sudut pandang.</span>
        </h2>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Data sekolah tersentralisasi, disajikan cerdas sesuai wewenang masing-masing. Admin, Kepala Sekolah, Guru, dan Siswa - semua dalam satu ekosistem.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-14" role="tablist">
        {[
          { id: 0, label: 'Kepala Sekolah', icon: Crown, activeBg: 'bg-amber-500/20 border-amber-500/50 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]', activeText: 'text-amber-400' },
          { id: 1, label: 'Guru', icon: BookOpen, activeBg: 'bg-[#B4A3FF]/20 border-[#B4A3FF]/50 text-white shadow-[0_0_20px_rgba(180,163,255,0.3)]', activeText: 'text-[#B4A3FF]' },
          { id: 2, label: 'Siswa', icon: GraduationCap, activeBg: 'bg-[#86EAA5]/20 border-[#86EAA5]/50 text-white shadow-[0_0_20px_rgba(134,234,165,0.3)]', activeText: 'text-[#86EAA5]' }
        ].map((role) => (
          <button 
            key={role.id}
            role="tab"
            aria-selected={activeRole === role.id}
            onClick={() => setActiveRole(role.id)}
            className={`flex items-center gap-3 px-6 py-3.5 rounded-full text-sm font-bold transition-all duration-300 border ${
              activeRole === role.id 
                ? role.activeBg
                : 'bg-[#181A20] border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10 hover:-translate-y-0.5'
            }`}
          >
            <role.icon size={18} className={activeRole === role.id ? role.activeText : ''} />
            {role.label}
          </button>
        ))}
      </div>

      <div className="w-full max-w-4xl mx-auto h-[550px] sm:h-[480px] md:h-[420px] bg-[#12141A] rounded-[2rem] md:rounded-[2.5rem] border border-white/5 shadow-[0_40px_80px_rgba(0,0,0,0.6)] p-6 md:p-8 relative overflow-hidden flex flex-col transition-all duration-500">
        <div className="flex justify-between items-center pb-5 border-b border-white/5 mb-6">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl bg-[#181A20] flex items-center justify-center border border-white/5 transition-colors duration-500 shadow-inner">
              {activeRole === 0 && <Crown size={20} className="text-amber-400"/>}
              {activeRole === 1 && <BookOpen size={20} className="text-[#B4A3FF]"/>}
              {activeRole === 2 && <GraduationCap size={20} className="text-[#86EAA5]"/>}
            </div>
            <div>
              <div className="text-white font-black text-[17px]">
                {activeRole === 0 && 'Dashboard Kepala Sekolah'}
                {activeRole === 1 && 'Panel Ruang Kelas 12A'}
                {activeRole === 2 && 'Portal Pembelajaran Siswa'}
              </div>
              <div className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Hak Akses Terproteksi RLS</div>
            </div>
          </div>
        </div>

        <div className="flex-1 relative">
          {/* STATE 0: KEPALA SEKOLAH */}
          <div className={`absolute inset-0 flex flex-col md:flex-row gap-6 transition-all duration-500 ease-in-out ${activeRole === 0 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
            <div className="flex-1 bg-[#181A20] border border-white/5 rounded-[1.5rem] p-8 flex flex-col justify-between group shadow-inner">
              <div>
                <div className="text-slate-500 text-[10px] font-bold mb-2 uppercase tracking-widest">Kehadiran Siswa Seluruh Sekolah</div>
                <div className="text-5xl font-serif italic font-black text-white">98.5%</div>
              </div>
              <div className="w-full h-32 flex items-end gap-2 mt-4">
                {[60, 70, 65, 80, 85, 95, 98].map((h, i) => (
                  <div key={i} className="flex-1 bg-white/5 rounded-t-lg relative group-hover:bg-amber-500/20 transition-colors">
                    <div className="absolute bottom-0 w-full bg-amber-500 rounded-t-lg shadow-[0_0_10px_#f59e0b]" style={{ height: h + '%' }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full md:w-1/3 flex flex-row md:flex-col gap-4">
              <div className="flex-1 bg-[#181A20] border border-white/5 rounded-[1.5rem] p-6 flex items-center gap-4 shadow-inner">
                <Activity size={28} className="text-amber-400 hidden sm:block" />
                <div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Kinerja Guru</div><div className="text-xl font-black text-white">Optimal</div></div>
              </div>
              <div className="flex-1 bg-[#181A20] border border-white/5 rounded-[1.5rem] p-6 flex items-center gap-4 shadow-inner">
                <TrendingUp size={28} className="text-emerald-400 hidden sm:block" />
                <div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Rata2 Akademik</div><div className="text-xl font-black text-white">82.4</div></div>
              </div>
            </div>
          </div>

          {/* STATE 1: GURU */}
          <div className={`absolute inset-0 flex flex-col md:flex-row gap-6 transition-all duration-500 ease-in-out ${activeRole === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
            <div className="flex-1 flex flex-col gap-5">
              <div className="bg-[#B4A3FF]/10 border border-[#B4A3FF]/30 rounded-[1.5rem] p-6 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-[#B4A3FF]/20 rounded-xl flex items-center justify-center shrink-0 border border-[#B4A3FF]/20">
                    <Sparkles size={24} className="text-[#B4A3FF]" />
                  </div>
                  <div>
                    <div className="text-white font-black text-lg">Asisten Penilaian AI</div>
                    <div className="text-xs font-medium text-[#B4A3FF]/70 mt-1">40 Lembar Jawaban Ujian Menunggu</div>
                  </div>
                </div>
                <button className="hidden sm:block bg-[#B4A3FF] text-[#0F1014] px-6 py-3 rounded-xl text-sm font-black hover:bg-white transition-colors shadow-lg">
                  Eksekusi Nilai
                </button>
              </div>
              <div className="flex flex-row gap-5">
                <div className="flex-1 bg-[#181A20] border border-white/5 rounded-[1.5rem] p-6 flex items-center gap-4 shadow-inner">
                  <Users size={24} className="text-slate-400 shrink-0" />
                  <div><div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Presensi Siswa</div><div className="text-sm sm:text-lg text-white font-black">Lengkap 36/36</div></div>
                </div>
                <div className="flex-1 bg-[#181A20] border border-white/5 rounded-[1.5rem] p-6 flex items-center gap-4 shadow-inner">
                  <QrCode size={24} className="text-[#B4A3FF] shrink-0" />
                  <div><div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">QR Absensi</div><div className="text-sm sm:text-lg text-white font-black">Aktif</div></div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/3 bg-[#181A20] border border-white/5 rounded-[1.5rem] p-6 flex flex-row md:flex-col items-center justify-center gap-5 text-center shadow-inner">
               <div className="w-20 h-20 md:w-28 md:h-28 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center relative overflow-hidden shrink-0">
                 <div className="absolute top-0 left-0 w-full h-1 bg-[#B4A3FF] animate-[ping_2s_ease-in-out_infinite]" />
                 <BarChart3 size={40} className="text-slate-500" />
               </div>
               <div className="text-left md:text-center">
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Analitik Kelas</div>
                 <div className="text-[11px] text-[#B4A3FF] font-mono">Real-time Dashboard</div>
               </div>
            </div>
          </div>

          {/* STATE 2: SISWA */}
          <div className={`absolute inset-0 flex flex-col md:flex-row gap-6 transition-all duration-500 ease-in-out ${activeRole === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
            <div className="flex-1 flex flex-col gap-5">
              <div className="bg-[#86EAA5]/10 border border-[#86EAA5]/30 rounded-[1.5rem] p-6 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-[#86EAA5]/20 rounded-xl flex items-center justify-center shrink-0 border border-[#86EAA5]/20">
                    <TrendingUp size={24} className="text-[#86EAA5]" />
                  </div>
                  <div>
                    <div className="text-white font-black text-lg">Progress Belajar</div>
                    <div className="text-xs font-medium text-[#86EAA5]/70 mt-1">Level 12 &middot; 2,450 XP &middot; 7 Hari Streak</div>
                  </div>
                </div>
                <div className="hidden sm:block text-right">
                  <div className="text-3xl font-black text-[#86EAA5]">A-</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Rata-rata</div>
                </div>
              </div>
              <div className="flex flex-row gap-5">
                <div className="flex-1 bg-[#181A20] border border-white/5 rounded-[1.5rem] p-6 flex items-center gap-4 shadow-inner">
                  <BookOpen size={24} className="text-[#86EAA5] shrink-0" />
                  <div><div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Tugas Aktif</div><div className="text-sm sm:text-lg text-white font-black">3 Deadline</div></div>
                </div>
                <div className="flex-1 bg-[#181A20] border border-white/5 rounded-[1.5rem] p-6 flex items-center gap-4 shadow-inner">
                  <ArrowRightLeft size={24} className="text-amber-400 shrink-0" />
                  <div><div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Kuis Tersedia</div><div className="text-sm sm:text-lg text-white font-black">2 Baru</div></div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/3 bg-[#86EAA5]/5 border border-[#86EAA5]/20 rounded-[1.5rem] p-6 flex flex-col items-center justify-center gap-3 text-center shadow-inner">
              <div className="text-4xl">🏆</div>
              <div className="text-white font-black text-lg">7 Lencana</div>
              <div className="text-[10px] text-[#86EAA5] font-bold uppercase tracking-widest">Gamifikasi Aktif</div>
              <div className="w-full h-2 bg-white/5 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-[#86EAA5] rounded-full shadow-[0_0_10px_#86eaa5]" style={{ width: '72%' }} />
              </div>
              <div className="text-[10px] text-slate-500">450 / 600 XP ke Level 13</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
