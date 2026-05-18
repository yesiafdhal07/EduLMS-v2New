import React from 'react';

export const LiveTicker = () => {
  return (
    <section className="py-6 border-y border-white/5 bg-[#181A20]/30 backdrop-blur-md relative z-10 flex overflow-hidden reveal-on-scroll">
      <div className="flex whitespace-nowrap animate-[slide_40s_linear_infinite] gap-10 items-center px-6" aria-hidden="true">
        {[...Array(4)].map((_, i) => (
          <React.Fragment key={`ticker-group-${i}`}>
            <div className="flex items-center gap-3 text-[13px] font-medium text-slate-400">
              <div className="w-2.5 h-2.5 rounded-full bg-[#86EAA5] shadow-[0_0_10px_rgba(134,234,165,0.8)] animate-pulse" />
              <span>Wali murid <strong className="text-white">Ahmad (12A)</strong> menerima invoice SPP</span>
            </div>
            <div className="text-slate-700">•</div>
            <div className="flex items-center gap-3 text-[13px] font-medium text-slate-400">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFC38B] shadow-[0_0_10px_rgba(255,195,139,0.8)] animate-pulse" />
              <span>150 Esai Sejarah <strong className="text-white">berhasil dinilai oleh AI</strong></span>
            </div>
            <div className="text-slate-700">•</div>
            <div className="flex items-center gap-3 text-[13px] font-medium text-slate-400">
              <div className="w-2.5 h-2.5 rounded-full bg-[#B4A3FF] shadow-[0_0_10px_rgba(180,163,255,0.8)] animate-pulse" />
              <span>Kehadiran Kelas 10 <strong className="text-white">mencapai 100% pagi ini</strong></span>
            </div>
            <div className="text-slate-700">•</div>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};
