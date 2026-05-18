import React from 'react';
import { FastForward, Database, MessageCircle, BookOpen } from 'lucide-react';

export const NetworkVisualization = () => {
  return (
    <section className="py-24 border-t border-white/5 relative overflow-hidden flex flex-col items-center bg-[#12141A]">
      <div className="text-center mb-16 relative z-10 reveal-on-scroll">
        <h2 className="text-[#86EAA5] font-serif italic text-2xl mb-2 font-medium">Satu Ekosistem Padu</h2>
        <p className="text-slate-400 font-medium text-lg">Berdamai dengan Dapodik. Tanpa input data berulang.</p>
      </div>
      
      <div className="relative w-full max-w-4xl h-[350px] flex items-center justify-center reveal-on-scroll scale-75 sm:scale-100 transform origin-center">
        <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
          <div className="w-[500px] h-[2px] bg-gradient-to-r from-transparent via-[#B4A3FF] to-transparent absolute rotate-45 animate-[pulse_2s_ease-in-out_infinite]" />
          <div className="w-[500px] h-[2px] bg-gradient-to-r from-transparent via-[#86EAA5] to-transparent absolute -rotate-45 animate-[pulse_2s_ease-in-out_infinite_0.5s]" />
          <div className="w-[600px] h-[2px] bg-gradient-to-r from-transparent via-[#FFC38B] to-transparent absolute rotate-0 animate-[pulse_3s_ease-in-out_infinite_1s]" />
        </div>

        <div className="relative z-20 w-28 h-28 bg-[#181A20] border border-white/10 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.05)] hover:scale-105 transition-transform duration-500 cursor-pointer">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)]">
            <span className="text-[#0F1014] text-3xl font-black">K</span>
          </div>
          <div className="absolute inset-0 rounded-[2rem] border border-white/20 animate-[ping_3s_ease-in-out_infinite]" />
        </div>

        <div className="absolute top-10 left-1/4 w-16 h-16 bg-[#181A20] border border-white/10 rounded-2xl flex items-center justify-center shadow-xl transform -translate-x-1/2 hover:scale-110 transition-transform cursor-pointer group">
          <FastForward size={28} className="text-white group-hover:text-[#B4A3FF] transition-colors" />
          <div className="absolute -bottom-7 text-[10px] font-black tracking-widest text-slate-500 whitespace-nowrap group-hover:text-white transition-colors">ABSENSI API</div>
        </div>
        <div className="absolute bottom-10 left-[30%] w-16 h-16 bg-[#181A20] border border-white/10 rounded-2xl flex items-center justify-center shadow-xl transform -translate-x-1/2 hover:scale-110 transition-transform cursor-pointer group">
          <Database size={28} className="text-[#86EAA5]" />
          <div className="absolute -bottom-7 text-[10px] font-black tracking-widest text-slate-500 whitespace-nowrap group-hover:text-white transition-colors">CLOUD DB</div>
        </div>
        <div className="absolute top-16 right-1/4 w-16 h-16 bg-[#181A20] border border-white/10 rounded-2xl flex items-center justify-center shadow-xl transform translate-x-1/2 hover:scale-110 transition-transform cursor-pointer group">
          <MessageCircle size={28} className="text-green-400" />
          <div className="absolute -bottom-7 text-[10px] font-black tracking-widest text-slate-500 whitespace-nowrap group-hover:text-white transition-colors">WA GATEWAY</div>
        </div>
        <div className="absolute bottom-16 right-[28%] w-16 h-16 bg-[#181A20] border border-white/10 rounded-2xl flex items-center justify-center shadow-xl transform translate-x-1/2 hover:scale-110 transition-transform cursor-pointer group">
          <BookOpen size={28} className="text-[#FFC38B]" />
          <div className="absolute -bottom-7 text-[10px] font-black tracking-widest text-slate-500 whitespace-nowrap group-hover:text-white transition-colors">SYNC DAPODIK</div>
        </div>
      </div>
    </section>
  );
};
