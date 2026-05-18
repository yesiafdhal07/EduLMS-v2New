import React from 'react';
import { Wallet, Check, Sparkles, Command } from 'lucide-react';

export const ZPatternFeatures = () => {
  return (
    <section id="produk" className="py-40 px-6 max-w-7xl mx-auto relative z-10">
      <div className="text-center mb-32 reveal-on-scroll">
        <h2 className="text-[#B4A3FF] font-serif italic text-2xl mb-4 font-medium">Solusi Spesifik</h2>
        <p className="text-4xl md:text-6xl font-black text-white leading-tight max-w-4xl mx-auto text-balance tracking-tight">
          Akhiri kebingungan administratif.<br />Dapatkan kembali waktu Anda.
        </p>
      </div>

      <div className="space-y-48">
        {/* Feature 1: Keuangan */}
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24 reveal-on-scroll">
          <div className="w-full lg:w-1/2">
            <div className="w-16 h-16 bg-[#FFC38B] rounded-[1.25rem] flex items-center justify-center mb-8 shadow-[0_10px_30px_rgba(255,195,139,0.2),inset_0_2px_0_rgba(255,255,255,0.4)] transform -rotate-3">
              <Wallet size={32} className="text-[#0F1014]" />
            </div>
            <h3 className="text-3xl md:text-5xl font-black text-white mb-6 leading-[1.1] tracking-tight">Kas yayasan sehat. <br/>Tanpa nagih manual.</h3>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium">
              Sistem otomatis mengirimkan tagihan SPP bersahabat via WhatsApp, memverifikasi pembayaran Virtual Account (VA) secara *real-time*, dan menyusun laporan rekonsiliasi bank harian untuk Anda.
            </p>
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-[#FFC38B]/10 flex items-center justify-center shrink-0 ring-1 ring-[#FFC38B]/30"><Check size={14} className="text-[#FFC38B]"/></div>
                <span className="text-slate-300 font-medium text-lg">Hentikan drama uang kembalian dan kuitansi hilang.</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-[#FFC38B]/10 flex items-center justify-center shrink-0 ring-1 ring-[#FFC38B]/30"><Check size={14} className="text-[#FFC38B]"/></div>
                <span className="text-slate-300 font-medium text-lg">Visibilitas arus kas (cashflow) penuh untuk Yayasan.</span>
              </li>
            </ul>
          </div>
          <div className="w-full lg:w-1/2 relative perspective-1000">
            <div className="absolute inset-0 bg-[#FFC38B]/10 blur-[120px] rounded-full pointer-events-none" />
            {/* Phone Mockup */}
            <div className="relative w-[320px] mx-auto bg-[#0b141a] ring-8 ring-[#181A20] rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.1)] overflow-hidden h-[640px] flex flex-col transform rotate-y-[-10deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-50 flex items-center justify-end px-3">
                <div className="w-2 h-2 rounded-full bg-[#0b141a]" />
              </div>
              
              <div className="bg-[#202c33] pt-14 pb-4 flex items-center px-5 gap-4 shadow-md z-40 relative">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FFC38B] to-[#ffa85c] rounded-full flex items-center justify-center text-[#0F1014] font-black text-sm shadow-inner">TU</div>
                <div className="text-white font-bold text-[15px]">Keuangan SMAN 1 <br/><span className="text-xs text-slate-400 font-normal">Sistem Otomatis</span></div>
              </div>
              <div className="flex-1 p-4 flex flex-col gap-4 bg-[#0b141a] relative">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/always-grey.png')]" />
                
                <div className="bg-[#202c33] text-[#e9edef] p-4 rounded-2xl rounded-tl-none text-[13.5px] leading-relaxed max-w-[85%] shadow-md mt-4 relative z-10 animate-[fade-in-up_0.5s_ease-out]">
                  Yth. Bapak/Ibu Wali Murid dari <strong>Budi Santoso</strong>.<br/><br/>
                  Mengingatkan bahwa tagihan SPP Bulan November sebesar <strong>Rp 500.000</strong> akan jatuh tempo dalam 3 hari.<br/><br/>
                  Mohon kesediaannya membayar melalui VA Mandiri: <br/>
                  <strong className="text-[#86EAA5] font-mono text-base tracking-widest mt-2 block bg-black/30 p-3 rounded-xl border border-white/5 text-center">8890 1234 5678</strong>
                  <div className="text-[10px] text-slate-500 text-right mt-2 font-medium">10:42 AM</div>
                </div>
                <div className="bg-[#005c4b] text-[#e9edef] p-4 rounded-2xl rounded-tr-none text-[13.5px] max-w-[85%] self-end shadow-md relative z-10 animate-[fade-in-up_0.5s_ease-out_0.5s] fill-mode-both">
                  Baik, sudah ditransfer barusan ya Pak.
                  <div className="text-[10px] text-[#86EAA5]/80 text-right mt-2 flex justify-end gap-1.5 items-center font-medium">11:15 AM <Check size={14} strokeWidth={3}/></div>
                </div>
                <div className="bg-[#181A20]/90 backdrop-blur-2xl ring-1 ring-white/10 text-[#86EAA5] text-[13px] font-bold p-4 rounded-2xl text-center mt-auto mb-6 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#86EAA5] animate-pulse shadow-[0_0_10px_#86EAA5]" /> 
                  Dana Rp500.000 Masuk ke Kas
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Akademik AI */}
        <div className="flex flex-col-reverse lg:flex-row items-center gap-16 lg:gap-24 reveal-on-scroll">
          <div className="w-full lg:w-1/2 relative perspective-1000">
            <div className="absolute inset-0 bg-[#B4A3FF]/10 blur-[120px] rounded-full pointer-events-none" />
            {/* AI Grading Mockup */}
            <div className="relative w-full bg-[#12141A] ring-1 ring-white/10 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden transform rotate-y-[10deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 group">
              <div className="h-16 bg-white/[0.02] border-b border-white/5 flex items-center px-6 gap-4 backdrop-blur-xl">
                <div className="flex gap-2 mr-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#2A2C35] shadow-inner" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#2A2C35] shadow-inner" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#2A2C35] shadow-inner" />
                </div>
                <Sparkles size={18} className="text-[#B4A3FF]" />
                <span className="text-[15px] font-bold text-zinc-200">AI Assessment Engine</span>
                <div className="ml-auto">
                  <div className="px-3 py-1.5 bg-[#B4A3FF]/10 text-[#B4A3FF] text-[10px] font-black uppercase tracking-wider rounded-md ring-1 ring-[#B4A3FF]/20 shadow-inner">Biologi Kelas 12</div>
                </div>
              </div>
              <div className="p-8 flex flex-col md:flex-row gap-6">
                {/* Scan Result */}
                <div className="flex-1 bg-[#0F1014] ring-1 ring-white/5 rounded-3xl p-6 shadow-[inset_0_2px_15px_rgba(0,0,0,0.5)] relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
                  <div className="text-[10px] text-slate-500 mb-6 font-bold tracking-widest uppercase flex items-center justify-between relative z-10">
                    <span>Pemeriksaan OCR AI</span>
                    <span className="text-[#86EAA5] flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#86EAA5] rounded-full animate-pulse shadow-[0_0_8px_#86EAA5]" /> Scanning
                    </span>
                  </div>
                  <div className="space-y-4 relative z-10">
                    <div className="p-5 bg-[#86EAA5]/5 ring-1 ring-[#86EAA5]/20 rounded-2xl relative overflow-hidden transition-all duration-300 hover:bg-[#86EAA5]/10">
                      <div className="absolute left-0 top-0 w-1.5 h-full bg-gradient-to-b from-[#86EAA5] to-emerald-600 shadow-[0_0_10px_#86EAA5]" />
                      <p className="text-[15px] text-slate-300 leading-relaxed font-serif italic tracking-wide">"...Fotosintesis adalah proses tumbuhan mengubah energi cahaya menjadi energi kimia..."</p>
                      <div className="absolute right-4 top-4 bg-[#181A20] text-[#86EAA5] text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-md ring-1 ring-[#86EAA5]/30">Memenuhi CP</div>
                    </div>
                    <div className="p-5 bg-rose-500/[0.03] ring-1 ring-rose-500/20 rounded-2xl relative overflow-hidden transition-all duration-300 hover:bg-rose-500/10">
                      <div className="absolute left-0 top-0 w-1.5 h-full bg-gradient-to-b from-rose-400 to-rose-600 shadow-[0_0_10px_#f43f5e]" />
                      <p className="text-[15px] text-slate-300 leading-relaxed font-serif italic tracking-wide">"...Mitokondria berfungsi sebagai tempat penyimpanan cadangan air sel daun..."</p>
                      <div className="absolute right-4 top-4 bg-[#181A20] text-rose-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-md ring-1 ring-rose-500/30">Miskonsepsi</div>
                    </div>
                  </div>
                </div>
                {/* Score Panel */}
                <div className="w-full md:w-1/3 bg-[#181A20] ring-1 ring-white/5 rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl transition-transform duration-500 group-hover:-translate-y-2">
                  <div className="text-[10px] text-slate-500 mb-4 font-bold uppercase tracking-widest relative z-10">Rekomendasi Nilai</div>
                  <div className="text-[80px] font-serif italic font-black text-white mb-8 relative z-10 leading-none">
                    85
                    <span className="absolute -right-6 top-0 text-xl text-[#86EAA5] font-sans not-italic font-black drop-shadow-[0_0_10px_rgba(134,234,165,0.5)]">AI</span>
                  </div>
                  <button className="w-full bg-white text-[#0F1014] text-[15px] font-black py-4 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors shadow-[0_5px_20px_rgba(255,255,255,0.15)] relative z-10">
                    Validasi ke Rapor
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <div className="w-16 h-16 bg-[#B4A3FF] rounded-[1.25rem] flex items-center justify-center mb-8 shadow-[0_10px_30px_rgba(180,163,255,0.2),inset_0_2px_0_rgba(255,255,255,0.4)] transform rotate-3">
              <Sparkles size={32} className="text-[#0F1014]" />
            </div>
            <h3 className="text-3xl md:text-5xl font-black text-white mb-6 leading-[1.1] tracking-tight">Kembalikan waktu <br/><span className="font-serif italic text-[#B4A3FF] font-medium">akhir pekan guru Anda.</span></h3>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium">
              Kecerdasan Buatan (AI) kami membaca tulisan tangan siswa, menganalisis kedalaman esai berdasarkan rubrik Capaian Pembelajaran, dan merekomendasikan nilai yang objektif dalam hitungan detik. Selamat tinggal lembur koreksi ujian.
            </p>
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-[#B4A3FF]/10 flex items-center justify-center shrink-0 ring-1 ring-[#B4A3FF]/30"><Check size={14} className="text-[#B4A3FF]"/></div>
                <span className="text-slate-300 font-medium text-lg">Mendeteksi indikasi mencontek antar siswa.</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-[#B4A3FF]/10 flex items-center justify-center shrink-0 ring-1 ring-[#B4A3FF]/30"><Check size={14} className="text-[#B4A3FF]"/></div>
                <span className="text-slate-300 font-medium text-lg">Tetap membiarkan guru sebagai pengambil keputusan akhir.</span>
              </li>
            </ul>
          </div>
        </div>
        {/* Feature 3: Portal Orang Tua & Komunitas */}
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24 reveal-on-scroll">
          <div className="w-full lg:w-1/2">
            <div className="w-16 h-16 bg-[#86EAA5] rounded-[1.25rem] flex items-center justify-center mb-8 shadow-[0_10px_30px_rgba(134,234,165,0.2),inset_0_2px_0_rgba(255,255,255,0.4)] transform -rotate-3">
              <Command size={32} className="text-[#0F1014]" />
            </div>
            <h3 className="text-3xl md:text-5xl font-black text-white mb-6 leading-[1.1] tracking-tight">Ekosistem Sekolah <br/>dalam Genggaman Orang Tua.</h3>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium">
              Klolakelas menghubungkan sekolah langsung ke rumah. Orang tua dapat memantau kehadiran real-time, grafik perkembangan nilai, hingga berdiskusi di forum komunitas sekolah yang terverifikasi.
            </p>
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-[#86EAA5]/10 flex items-center justify-center shrink-0 ring-1 ring-[#86EAA5]/30"><Check size={14} className="text-[#86EAA5]"/></div>
                <span className="text-slate-300 font-medium text-lg">Notifikasi WhatsApp untuk setiap absen dan nilai baru.</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-[#86EAA5]/10 flex items-center justify-center shrink-0 ring-1 ring-[#86EAA5]/30"><Check size={14} className="text-[#86EAA5]"/></div>
                <span className="text-slate-300 font-medium text-lg">Forum diskusi tertutup khusus wali murid dan guru.</span>
              </li>
            </ul>
          </div>
          <div className="w-full lg:w-1/2 relative perspective-1000">
            <div className="absolute inset-0 bg-[#86EAA5]/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="relative w-full bg-[#12141A] ring-1 ring-white/10 rounded-[2.5rem] p-8 shadow-2xl transform rotate-y-[-10deg] hover:rotate-y-0 transition-transform duration-700">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-black">P</div>
                            <div>
                                <p className="text-sm font-bold text-white">Portal Orang Tua</p>
                                <p className="text-[10px] text-slate-500 font-black uppercase">Verified Account</p>
                            </div>
                        </div>
                        <div className="flex -space-x-2">
                            {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-[#12141A] bg-slate-800" />)}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Kehadiran</p>
                            <p className="text-2xl font-black text-[#86EAA5]">98%</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Rata-rata Nilai</p>
                            <p className="text-2xl font-black text-white">88.5</p>
                        </div>
                    </div>
                    <div className="p-4 bg-violet-600/10 border border-violet-500/20 rounded-2xl flex items-center gap-4">
                        <Sparkles size={20} className="text-violet-400" />
                        <p className="text-xs text-violet-200 font-medium">"Budi menunjukkan peningkatan pesat di materi Aljabar!"</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
