import React from 'react';
import Link from 'next/link';
import { Command } from 'lucide-react';

export const FloatingNavbar = () => {
  return (
    <div className="fixed top-6 w-full z-50 flex justify-center px-4 reveal-on-scroll" style={{ transitionDelay: '0.1s' }}>
      <header className="bg-[#181A20]/80 backdrop-blur-3xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] rounded-full px-3 py-2 flex items-center justify-between w-full max-w-6xl transition-all duration-300">
        <div className="flex items-center gap-8 pl-3">
          <Link href="/" className="text-lg font-black tracking-tight flex items-center gap-2 group cursor-pointer" aria-label="Beranda Klolakelas">
            <div className="w-8 h-8 bg-gradient-to-br from-[#B4A3FF] to-[#917cf7] rounded-full flex items-center justify-center shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)] group-hover:scale-105 transition-transform duration-300">
              <span className="text-[#0F1014] text-sm font-black">K.</span>
            </div>
            <span className="text-white">Klolakelas</span>
          </Link>
          <nav className="hidden lg:flex gap-7 text-[14px] font-medium text-slate-400">
            <a href="#produk" className="hover:text-white transition-colors py-1">Solusi & Fitur</a>
            <a href="#infrastruktur" className="hover:text-white transition-colors py-1">Infrastruktur Server</a>
            <a href="#migrasi" className="hover:text-white transition-colors py-1">Proses Migrasi</a>
            <a href="#harga" className="hover:text-white transition-colors py-1">Biaya Layanan</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden xl:flex items-center gap-2 text-slate-400 text-xs font-mono bg-white/5 px-3 py-1.5 rounded-full ring-1 ring-white/10 flex-shrink-0 cursor-pointer hover:bg-white/10 transition-colors shadow-inner">
            <Command size={12} /> K
          </div>
          <Link href="/login" className="hidden md:block text-[14px] font-bold text-slate-300 hover:text-white transition-colors px-4">
            Masuk Portal
          </Link>
          <Link href="#jadwal-demo" passHref>
            <button className="bg-gradient-to-b from-[#FFC38B] to-[#ffa85c] text-[#0F1014] px-6 py-2.5 rounded-full text-[14px] font-black hover:opacity-90 transition-all shadow-[0_5px_20px_rgba(255,195,139,0.3),inset_0_1px_0_rgba(255,255,255,0.5)] transform hover:-translate-y-0.5">
              Jadwalkan Demo
            </button>
          </Link>
        </div>
      </header>
    </div>
  );
};
