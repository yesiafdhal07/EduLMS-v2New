'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';

export const Pricing = () => {
  const [pricingCycle, setPricingCycle] = useState<'bulanan' | 'tahunan'>('tahunan');

  return (
    <section id="harga" className="py-32 px-6 max-w-7xl mx-auto border-t border-white/5 relative z-10 reveal-on-scroll">
      <div className="text-center mb-20">
        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">
          Skalakan yayasan Anda.<br/> Tanpa pusing beli server fisik.
        </h2>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium">Bebaskan diri dari biaya lisensi membingungkan. Mesin server NVMe mutakhir, maintenance rutin IT, dan bantuan prioritas 24 jam telah dipaketkan ke dalam satu harga langganan tetap.</p>

        <div className="inline-flex bg-[#181A20] p-2 rounded-2xl border border-white/5 mb-10 shadow-inner" role="tablist">
          <button 
            role="tab"
            aria-selected={pricingCycle === 'bulanan'}
            onClick={() => setPricingCycle('bulanan')}
            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${pricingCycle === 'bulanan' ? 'bg-white text-[#0F1014] shadow-md' : 'text-slate-500 hover:text-white'}`}
          >
            Bayar Bulanan
          </button>
          <button 
            role="tab"
            aria-selected={pricingCycle === 'tahunan'}
            onClick={() => setPricingCycle('tahunan')}
            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${pricingCycle === 'tahunan' ? 'bg-white text-[#0F1014] shadow-md' : 'text-slate-500 hover:text-white'}`}
          >
            Bayar Tahunan <span className="bg-[#86EAA5] text-[#0F1014] text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Hemat 20%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center max-w-6xl mx-auto">
        {/* Tier 1 */}
        <div className="bg-[#12141A] border border-white/5 rounded-[2.5rem] p-10 relative hover:bg-[#181A20] transition-all hover:-translate-y-2 duration-500 shadow-xl hover:shadow-2xl">
           <h3 className="text-2xl font-black text-white mb-2">Paket Dasar</h3>
           <p className="text-slate-500 text-sm mb-8 h-10 font-medium">Fokus mendigitalisasi urusan presensi dan nilai (SD/Sederajat).</p>
           <div className="mb-10">
             <span className="text-5xl font-black text-white tracking-tighter">{pricingCycle === 'tahunan' ? 'Rp950k' : 'Rp1.2jt'}</span>
             <span className="text-slate-500 text-sm font-bold">/bln</span>
           </div>
           <ul className="space-y-4 mb-10 text-sm text-slate-300 font-medium list-none">
             <li className="flex items-center gap-4"><Check size={18} className="text-[#B4A3FF]"/> Kapasitas hingga 500 Siswa</li>
             <li className="flex items-center gap-4"><Check size={18} className="text-[#B4A3FF]"/> Absensi Mobile & Geolokasi</li>
             <li className="flex items-center gap-4"><Check size={18} className="text-[#B4A3FF]"/> Format Rapor Standar Dapodik</li>
           </ul>
           <button className="w-full py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors text-[15px] border border-white/5">Pilih Skala Dasar</button>
        </div>

        {/* Tier 2: Pro */}
        <div className="bg-white rounded-[3rem] p-12 relative transform md:-translate-y-6 shadow-[0_20px_60px_rgba(255,255,255,0.1)] group">
           <div className="absolute -inset-1 bg-gradient-to-r from-[#FFC38B] via-[#B4A3FF] to-[#86EAA5] rounded-[3.1rem] blur opacity-30 group-hover:opacity-60 transition duration-500 -z-10 animate-pulse" />
           <div className="absolute top-0 right-8 -translate-y-1/2 bg-[#FFC38B] text-[#0F1014] text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full shadow-lg border border-[#FFC38B]">Pilihan Terbanyak</div>
           
           <h3 className="text-3xl font-black text-[#0F1014] mb-2">Bakat Profesional</h3>
           <p className="text-slate-500 text-sm mb-8 h-10 font-medium">Lepas beban tagihan keuangan dan berikan guru Anda asisten AI.</p>
           <div className="mb-10">
             <span className="text-6xl font-black text-[#0F1014] tracking-tighter">{pricingCycle === 'tahunan' ? 'Rp2.5jt' : 'Rp3.1jt'}</span>
             <span className="text-slate-500 text-sm font-bold">/bln</span>
           </div>
           <ul className="space-y-5 mb-10 text-[15px] text-slate-700 font-medium list-none">
             <li className="flex items-center gap-4"><Check size={18} className="text-[#0F1014]" strokeWidth={3}/> Kapasitas lega hingga 1.500 Siswa</li>
             <li className="flex items-center gap-4 font-black text-[#0F1014]"><Check size={18} className="text-[#0F1014]" strokeWidth={3}/> Akses Penuh Modul SPP & VA Bank</li>
             <li className="flex items-center gap-4 font-black text-[#0F1014]"><Check size={18} className="text-[#0F1014]" strokeWidth={3}/> Eksekusi Nilai Esai AI (1.000 lbr)</li>
             <li className="flex items-center gap-4"><Check size={18} className="text-[#0F1014]" strokeWidth={3}/> WhatsApp Blast Penagihan Aktif</li>
           </ul>
           <button className="w-full py-5 rounded-2xl bg-[#0F1014] text-white font-black hover:bg-[#1A1C23] transition-colors shadow-xl text-[16px] relative overflow-hidden group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
             <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
             Mulai Transformasi Sekarang
           </button>
        </div>

        {/* Tier 3 */}
        <div className="bg-[#12141A] border border-white/5 rounded-[2.5rem] p-10 relative hover:bg-[#181A20] transition-all hover:-translate-y-2 duration-500 shadow-xl hover:shadow-2xl">
           <h3 className="text-2xl font-black text-white mb-2">Konsorsium Yayasan</h3>
           <p className="text-slate-500 text-sm mb-8 h-10 font-medium">Bawahi puluhan unit sekolah Anda di bawah satu komando komprehensif.</p>
           <div className="mb-10">
             <span className="text-5xl font-black text-white tracking-tighter">Bicara</span>
             <span className="text-slate-500 text-sm font-bold"> / dgn Ahli</span>
           </div>
           <ul className="space-y-4 mb-10 text-sm text-slate-300 font-medium list-none">
             <li className="flex items-center gap-4"><Check size={18} className="text-slate-500"/> Manajemen Unlimited Data</li>
             <li className="flex items-center gap-4"><Check size={18} className="text-slate-500"/> Dashboard Eksekutif Analisis Lintas Cabang</li>
             <li className="flex items-center gap-4"><Check size={18} className="text-slate-500"/> Kustomisasi Logo Aplikasi (White-Label)</li>
           </ul>
           <button className="w-full py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors text-[15px] border border-white/5">Atur Jadwal Rapat</button>
        </div>
      </div>
    </section>
  );
};
