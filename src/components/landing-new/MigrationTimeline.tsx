'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FileSpreadsheet, Layers, Smartphone } from 'lucide-react';

export const MigrationTimeline = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [timelineProgress, setTimelineProgress] = useState(0);

  useEffect(() => {
    const handleTimelineScroll = () => {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const startTrigger = windowHeight * 0.70; 
      const scrolledPast = startTrigger - rect.top;
      
      let progress = (scrolledPast / rect.height) * 100;
      progress = Math.max(0, Math.min(100, progress)); 
      setTimelineProgress(progress);
    };
    
    window.addEventListener('scroll', handleTimelineScroll, { passive: true });
    // Initial call
    handleTimelineScroll();

    return () => {
      window.removeEventListener('scroll', handleTimelineScroll);
    };
  }, []);

  return (
    <section id="migrasi" className="py-32 px-6 max-w-5xl mx-auto border-t border-white/5 reveal-on-scroll">
      <div className="text-center mb-24">
        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">
          Migrasi tanpa stres.<br/> <span className="text-[#B4A3FF]">Selesai sebelum Senin pagi.</span>
        </h2>
        <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">
          Siklus kerja Anda tidak boleh diganggu. Tim implementator ahli kami akan mengambil alih kepeningan memindahkan data Anda secara sempurna dalam rekor waktu 72 Jam.
        </p>
      </div>

      <div ref={timelineRef} className="relative max-w-4xl mx-auto py-10 pl-4 sm:pl-0">
        <div className="absolute top-0 bottom-0 left-[38px] md:left-[48px] w-2 bg-[#181A20] z-0 rounded-full" />
        
        <div 
          className="absolute top-0 left-[38px] md:left-[48px] w-2 bg-gradient-to-b from-[#B4A3FF] to-[#86EAA5] z-0 rounded-full shadow-[0_0_15px_rgba(180,163,255,0.5)] transition-all duration-300 ease-out"
          style={{ height: `${timelineProgress}%` }}
        />

        <div className="space-y-24 md:space-y-40">
          {[
            { step: 1, title: "1. Serahkan File Mentah Anda", desc: "Tidak perlu memodifikasi format apa pun. Kirimkan saja Master Data Excel lama Anda (Daftar Siswa, Guru, Riwayat SPP) kepada tim spesialis kami.", icon: FileSpreadsheet, color: "bg-[#B4A3FF]", textColor: "text-[#B4A3FF]", threshold: 5 },
            { step: 2, title: "2. Kami Melakukan Keajaibannya", desc: "Anda tinggal duduk santai. Script konversi kami akan menyapu dan membersihkan data Anda, memasukkannya rapi ke dalam benteng PostgreSQL baru sekolah Anda.", icon: Layers, color: "bg-[#FFC38B]", textColor: "text-[#FFC38B]", threshold: 50 },
            { step: 3, title: "3. Peluncuran Sistem Damai", desc: "Aplikasi langsung aktif. Kredensial *login* didistribusikan mulus ke seluruh *handphone* wali murid dan dewan guru lewat jalur WhatsApp prioritas kami.", icon: Smartphone, color: "bg-[#86EAA5]", textColor: "text-[#86EAA5]", threshold: 90 }
          ].map((item, index) => {
            const isActive = timelineProgress >= item.threshold;
            return (
              <div key={`timeline-${index}`} className="relative pl-[90px] md:pl-[140px] group">
                <div className={`absolute top-2 left-[38px] md:left-[48px] -translate-x-[42%] w-8 h-8 md:w-10 md:h-10 rounded-full border-[5px] flex items-center justify-center transition-all duration-500 z-20 ${isActive ? `bg-white border-[#0F1014] shadow-[0_0_20px_rgba(255,255,255,0.3)]` : 'bg-[#181A20] border-[#0F1014]'}`} />
                
                <div className={`transition-all duration-700 ease-out flex flex-col items-start ${isActive ? 'opacity-100 translate-x-0' : 'opacity-30 translate-x-10'}`}>
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] flex shrink-0 items-center justify-center transition-all duration-500 mb-6 md:mb-8 text-[#0F1014] ${isActive ? item.color + ' shadow-[0_10px_30px_rgba(0,0,0,0.3)] transform -rotate-3 scale-105' : 'bg-[#181A20] text-slate-600 border border-white/5'}`}>
                    <item.icon size={32} strokeWidth={2.5}/>
                  </div>
                  <h3 className={`text-2xl md:text-4xl font-black mb-4 tracking-tight transition-colors duration-500 ${isActive ? 'text-white' : 'text-slate-500'}`}>{item.title}</h3>
                  <p className={`text-base md:text-xl leading-relaxed max-w-xl font-medium transition-colors duration-500 ${isActive ? 'text-slate-400' : 'text-slate-700'}`}>{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
