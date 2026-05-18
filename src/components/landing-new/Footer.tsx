import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-[#181A20] pt-24 pb-12 px-6 relative z-10 rounded-t-[3rem] mt-20">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-6 gap-12 mb-24">
        <div className="col-span-2 md:col-span-2">
           <span className="text-3xl font-black tracking-tighter mb-8 flex items-center gap-3 text-white">
             <div className="w-10 h-10 bg-[#B4A3FF] rounded-xl flex items-center justify-center shadow-inner"><span className="text-[#0F1014] text-base font-black">K.</span></div>
             Klolakelas
           </span>
           <p className="text-sm text-slate-400 max-w-sm leading-relaxed font-medium">
             Merekayasa infrastruktur perangkat lunak *Cloud-Native* yang kuat, privat, dan menjunjung tinggi kehormatan sistem pendidikan di Indonesia.
           </p>
        </div>
        <div className="col-span-1">
          <h5 className="font-bold text-white mb-6 text-sm">Navigasi Platform</h5>
          <ul className="space-y-4 text-sm font-medium text-slate-500">
            <li><a href="#" className="hover:text-white transition-colors">Modul Eksekutif</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Mesin Kasir (SPP)</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Visi AI Grading</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Portal API Sekolah</a></li>
          </ul>
        </div>
        <div className="col-span-1">
          <h5 className="font-bold text-white mb-6 text-sm">Informasi Institusi</h5>
          <ul className="space-y-4 text-sm font-medium text-slate-500">
            <li><a href="#" className="hover:text-white transition-colors">Profil Perusahaan</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Kepatuhan Hukum PDP</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Sertifikat Keamanan</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Karir Engineer</a></li>
          </ul>
        </div>
        <div className="col-span-2 md:col-span-2 bg-[#0F1014] p-8 rounded-[2rem] border border-white/5 shadow-inner">
          <h5 className="font-black text-white mb-2 text-base">Intelijen Manajemen Sekolah</h5>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed font-medium">Dapatkan buletin tertutup bulanan berisi tren efisiensi yayasan pendidikan dan pembaruan AI.</p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input aria-label="Alamat email" type="email" placeholder="Email kerja institusi..." className="w-full sm:flex-1 text-sm px-5 py-3.5 rounded-xl bg-white/5 border border-white/5 text-white outline-none focus:border-[#B4A3FF] transition-colors font-medium shadow-inner"/>
            <button className="w-full sm:w-auto bg-[#B4A3FF] text-[#0F1014] px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-[#c2b4ff] transition-colors shadow-md">Langganan</button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-500 font-bold uppercase tracking-widest">
        <p>© 2026 PT Klolakelas Teknologi Nusantara.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-slate-300 transition-colors">Aturan Privasi</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Term of Service</a>
          <a href="#" className="hover:text-slate-300 transition-colors">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
};
