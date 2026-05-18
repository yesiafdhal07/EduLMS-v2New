import React from 'react';
import { Check, X } from 'lucide-react';

export const ComparisonTable = () => {
  return (
    <section className="py-32 px-6 max-w-6xl mx-auto border-t border-white/5 reveal-on-scroll">
      <div className="text-center mb-24">
        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6 text-balance">
          Mengapa platform lawas <br className="hidden md:block"/> pantas ditinggalkan.
        </h2>
      </div>

      <div className="bg-[#12141A] border border-white/5 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)] fade-in-up">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-4 bg-[#0F1014] border-b border-white/5">
          <div className="p-8 col-span-1 flex items-center font-black text-slate-600 tracking-widest uppercase text-[10px]">Tabel Kapabilitas Sistem</div>
          <div className="p-8 col-span-1 text-center border-x border-white/5 bg-white/[0.02] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#B4A3FF]" />
            <div className="text-2xl font-serif italic font-black text-white">Klolakelas</div>
            <div className="text-[10px] font-black text-[#0F1014] uppercase tracking-widest mt-2 bg-[#B4A3FF] py-1 rounded-full w-max mx-auto px-3">ERP Masa Depan</div>
          </div>
          <div className="p-8 col-span-1 text-center border-r border-white/5 flex flex-col justify-center">
            <div className="text-xl font-bold text-slate-400">LMS Biasa</div>
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-2">Moodle / Web Sekolah</div>
          </div>
          <div className="p-8 col-span-1 text-center flex flex-col justify-center">
            <div className="text-xl font-bold text-slate-500">Birokrasi Manual</div>
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-2">Excel & Tumpukan Kertas</div>
          </div>
        </div>

        {[
          { feature: 'Koreksi Esai HOTS Berbantuan Artificial Intelligence', k: true, l: false, m: false },
          { feature: 'Absensi Siswa Anti-Manipulasi (GPS & Jaringan)', k: true, l: false, m: false },
          { feature: 'Otomatisasi Tagihan SPP & Payment Gateway Bank', k: true, l: false, m: false },
          { feature: 'Arsitektur Database Relasional Khusus Institusi', k: true, l: true, m: false },
          { feature: 'Ekstraksi 1-Klik Data Format Valid Dapodik', k: true, l: false, m: false },
          { feature: 'Garansi Server Tanpa Downtime saat Ujian Serentak', k: true, l: 'Bergantung Nasib Hardware', m: '-' },
        ].map((row, i) => (
          <div key={`comp-row-${i}`} className="grid grid-cols-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
            <div className="p-6 md:p-8 col-span-1 flex items-center text-[13px] md:text-[16px] font-medium text-slate-300 leading-snug">
              {row.feature}
            </div>
            
            <div className="p-6 md:p-8 col-span-1 flex items-center justify-center border-x border-white/5 bg-white/[0.01] group-hover:bg-white/[0.03] transition-colors">
              {row.k === true ? <div className="w-10 h-10 rounded-full bg-[#B4A3FF]/20 flex items-center justify-center border border-[#B4A3FF]/20"><Check size={20} className="text-[#B4A3FF]" strokeWidth={3}/></div> : <span className="text-sm font-bold text-[#B4A3FF] text-center">{row.k}</span>}
            </div>
            
            <div className="p-6 md:p-8 col-span-1 flex items-center justify-center border-r border-white/5">
              {row.l === true ? <Check size={24} className="text-slate-600" /> : row.l === false ? <X size={24} className="text-slate-800" /> : <span className="text-xs font-medium text-slate-500 text-center">{row.l}</span>}
            </div>
            
            <div className="p-6 md:p-8 col-span-1 flex items-center justify-center">
              {row.m === true ? <Check size={24} className="text-slate-600" /> : row.m === false ? <X size={24} className="text-slate-800" /> : <span className="text-xs font-medium text-slate-600 text-center">{row.m}</span>}
            </div>
          </div>
        ))}
          </div>
        </div>
      </div>
    </section>
  );
};
