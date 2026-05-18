import React from 'react';
import { Terminal, Lock, Cpu } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';

export const InfrastructureBento = () => {
  return (
    <section id="infrastruktur" className="py-32 px-6 max-w-[1400px] mx-auto border-t border-white/5 reveal-on-scroll">
      <div className="text-center mb-24">
        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">
          Infrastruktur sekelas Bank. <br/> <span className="font-serif italic text-[#86EAA5]">Khusus untuk sekolah Anda.</span>
        </h2>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto font-medium">
          Data institusi Anda terlalu berharga untuk diletakkan di server murahan. Kami membangun benteng digital berskala *Enterprise*.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-[minmax(400px,auto)]">
        
        {/* DEV TERMINAL */}
        <SpotlightCard className="md:col-span-7 p-10 md:p-12 group border border-white/5">
          <div className="flex justify-between items-start mb-10 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#86EAA5]/10 border border-[#86EAA5]/20 text-[#86EAA5] text-[10px] font-black uppercase tracking-widest mb-6 w-max shadow-inner">
                <Terminal size={14} /> Sinkronisasi IT
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-white mb-4">Penguasaan Penuh Atas Data</h3>
              <p className="text-slate-400 text-lg max-w-md leading-relaxed font-medium">Tim operator sekolah diberikan kuasa akses melalui panel konsol terenkripsi untuk mengawasi langsung proses penarikan data e-Rapor dan Dapodik.</p>
            </div>
          </div>

          <div className="flex-1 bg-[#050505] rounded-3xl border border-white/5 p-8 font-mono text-[14px] relative z-10 shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)] overflow-x-auto group-hover:-translate-y-2 transition-transform duration-500">
            <div className="flex gap-2 mb-6 border-b border-white/5 pb-4 min-w-max">
              <div className="w-3.5 h-3.5 rounded-full bg-slate-800" />
              <div className="w-3.5 h-3.5 rounded-full bg-slate-800" />
              <div className="w-3.5 h-3.5 rounded-full bg-slate-800" />
              <div className="text-slate-600 text-[10px] font-bold tracking-widest ml-4 uppercase">Ops-Admin@Yayasan-Network</div>
            </div>
            <div className="text-slate-300 min-w-max mb-2">
              <span className="text-[#86EAA5]">➜</span> <span className="text-[#B4A3FF]">~</span> klolakelas-cli trigger --export dapodik
            </div>
            <div className="text-slate-500 my-3 min-w-max">
              [i] Establishing handshake with Kemdikbud Server TLS v1.3...
            </div>
            <div className="text-[#86EAA5] my-3 min-w-max font-bold">
              ✓ Transmisi Paket 4.520 Data Siswa Sukses. 1.2s
            </div>
            <div className="text-slate-300 mt-5 mb-2 min-w-max">
              <span className="text-[#86EAA5]">➜</span> <span className="text-[#B4A3FF]">~</span> sys monitor --live
            </div>
            <div className="text-slate-500 mt-4 flex gap-4 min-w-max items-center">
              <span>Server Load Capacity:</span>
              <div className="w-48 bg-white/5 rounded-full h-3 overflow-hidden shadow-inner">
                <div className="bg-emerald-400 h-full w-[12%] shadow-[0_0_10px_#34d399]" />
              </div>
              <span className="text-[#000] font-black text-[10px] bg-white px-2 py-0.5 rounded shadow-sm">AMAN</span>
            </div>
          </div>
        </SpotlightCard>

        {/* SECURITY */}
        <SpotlightCard className="md:col-span-5 p-10 md:p-12 flex flex-col items-center text-center justify-center border border-white/5">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_16px] opacity-50 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col h-full items-center justify-center">
            <div className="w-28 h-28 bg-[#181A20] border border-white/5 rounded-full flex items-center justify-center mb-10 relative shadow-2xl group-hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#B4A3FF]/30 animate-[spin_10s_linear_infinite]" />
              <Lock size={40} className="text-[#B4A3FF]" />
            </div>
            <h3 className="text-3xl font-black text-white mb-4">Privasi Tanpa Celah</h3>
            <p className="text-slate-400 text-[16px] leading-relaxed mb-10 font-medium">
              Kebocoran data adalah aib besar. Kami menggunakan proteksi tingkat tinggi *Row Level Security*. Bahkan *engineer* kami sendiri tidak diizinkan membuka data nilai siswa Anda.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <div className="px-5 py-2 bg-white/5 rounded-full text-[10px] font-black tracking-widest uppercase text-white backdrop-blur shadow-inner">AES-256 Cipher</div>
              <div className="px-5 py-2 bg-white/5 rounded-full text-[10px] font-black tracking-widest uppercase text-white backdrop-blur shadow-inner">Kepatuhan UU PDP</div>
            </div>
          </div>
        </SpotlightCard>

        {/* HOSTINGER SPECS */}
        <SpotlightCard className="md:col-span-12 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between border border-white/5">
           <div className="max-w-3xl relative z-10 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFC38B]/10 border border-[#FFC38B]/20 text-[#FFC38B] text-[10px] font-black uppercase tracking-widest mb-6 w-max shadow-inner">
                <Cpu size={14} /> Anti-Downtime Architecture
              </div>
              <h3 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">Server yang menolak tumbang saat ujian besar.</h3>
              <p className="text-slate-400 text-xl leading-relaxed font-medium">Aplikasi Anda dikendalikan oleh spesifikasi Cloud yang sadis: <strong className="text-[#0F1014] bg-[#FFC38B] px-2.5 py-1 rounded-lg">4 Mesin CPU, 4GB RAM, & 100GB Storage NVMe Solid State</strong>. Tidak peduli seberapa brutal kepadatan akses murid Anda di hari Senin pagi, aplikasi akan tetap selicin sutra.</p>
           </div>

           <div className="relative z-10 flex gap-6 mt-16 md:mt-0 perspective-1000 shrink-0">
              {[...Array(3)].map((_, i) => (
                <div key={`server-${i}`} className="w-16 h-48 md:w-24 md:h-64 bg-[#050505] border border-white/5 rounded-3xl flex flex-col gap-4 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden transform rotate-y-[-15deg] group-hover:rotate-y-0 transition-transform duration-700" style={{ transitionDelay: (i * 100) + 'ms' }}>
                   <div className="h-5 md:h-8 w-full bg-white/5 rounded-xl shadow-inner" />
                   <div className="h-5 md:h-8 w-full bg-white/5 rounded-xl shadow-inner flex justify-end px-3 items-center"><div className="w-2.5 h-2.5 rounded-full bg-[#86EAA5] animate-pulse shadow-[0_0_10px_#86EAA5]" /></div>
                   <div className="h-5 md:h-8 w-full bg-white/5 rounded-xl shadow-inner" />
                   <div className="flex-1" />
                   <div className="h-5 md:h-8 w-full bg-white/5 rounded-xl shadow-inner flex justify-end px-3 items-center"><div className="w-2.5 h-2.5 rounded-full bg-[#B4A3FF] shadow-[0_0_10px_#B4A3FF]" /></div>
                </div>
              ))}
           </div>
        </SpotlightCard>
      </div>
    </section>
  );
};
