import React from 'react';
import { ArrowRight } from 'lucide-react';

export const FinalCTA = () => {
  return (
    <section className="py-40 px-6 text-center max-w-4xl mx-auto relative z-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#B4A3FF]/10 rounded-full blur-[150px] -z-10 pointer-events-none" />

      <h2 className="text-6xl md:text-[90px] font-black tracking-tighter text-white mb-8 leading-[1.05]">
        Kembalikan<br />
        <span className="font-serif italic text-[#86EAA5] font-medium">kehormatan pendidikan.</span>
      </h2>
      <p className="text-xl text-slate-400 mb-14 max-w-2xl mx-auto font-medium">Biarkan mesin mengurus data, sehingga guru Anda bisa kembali fokus menciptakan pemimpin masa depan. Ambil langkah pertama hari ini.</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="h-16 bg-white text-[#0F1014] px-12 rounded-2xl text-[16px] font-black hover:bg-slate-200 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] transform hover:-translate-y-1 flex items-center justify-center gap-2 group relative overflow-hidden">
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          Bedah Kasus Sekolah Anda <ArrowRight size={18}/>
        </button>
      </div>
    </section>
  );
};
