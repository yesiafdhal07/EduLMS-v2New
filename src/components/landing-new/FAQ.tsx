'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { question: "Apakah sistem ini aman untuk data NISN dan privasi siswa?", answer: "Keamanan adalah fondasi kami. Klolakelas menggunakan enkripsi tingkat perbankan (AES-256) dan arsitektur database dengan Row Level Security (RLS). Artinya, data sekolah Anda terisolasi secara mutlak dan tidak bisa diakses oleh pihak luar maupun sekolah lain." },
  { question: "Guru kami sudah berumur, apakah sistem ini sulit dipelajari?", answer: "Sama sekali tidak. Antarmuka Klolakelas dirancang semudah menggunakan WhatsApp. Selain itu, kami menyediakan tim pendampingan khusus yang akan melatih seluruh dewan guru Anda secara langsung hingga mahir." },
  { question: "Berapa lama waktu yang dibutuhkan untuk memindahkan data lama kami?", answer: "Hanya butuh maksimal 3 hari kerja. Anda cukup menyerahkan file Excel master siswa dan guru, lalu mesin pintar kami akan menata dan memetakannya otomatis ke dalam sistem." },
  { question: "Apakah bisa diintegrasikan dengan Bank untuk pembayaran SPP otomatis?", answer: "Tentu. Sistem keuangan kami terhubung langsung ke Payment Gateway nasional. Orang tua akan mendapatkan Virtual Account (VA), dan sistem akan merekonsiliasi pembayaran secara otomatis detik itu juga." },
  { question: "Apakah Klolakelas mendukung format e-Rapor Kurikulum Merdeka?", answer: "Sepenuhnya mendukung. Skema database kami dirancang 100% selaras dengan standar Dapodik dan e-Rapor Kemdikbud. Ekspor nilai ke format resmi pemerintah hanya membutuhkan satu klik." }
];

export const FAQ = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section className="py-32 px-6 max-w-4xl mx-auto border-t border-white/5 relative z-10 reveal-on-scroll">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">Sanggahan Eksekutif.</h2>
        <p className="text-xl text-slate-400 font-medium">Jawaban langsung untuk kecemasan transisi sistem digital yang biasa menghantui dewan komite Anda.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div 
            key={`faq-${i}`} 
            className={`rounded-3xl overflow-hidden transition-all duration-300 border ${openFaq === i ? 'bg-[#181A20] border-white/10 shadow-lg' : 'bg-transparent border-white/5 hover:bg-white/[0.02]'}`}
          >
            <button 
              onClick={() => setOpenFaq(openFaq === i ? null : i)} 
              className="w-full p-6 sm:p-8 text-left flex items-start sm:items-center justify-between focus:outline-none group"
              aria-expanded={openFaq === i}
              aria-controls={`faq-answer-${i}`}
            >
              <span className={`font-bold text-lg pr-6 transition-colors ${openFaq === i ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{faq.question}</span>
              <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${openFaq === i ? 'bg-white text-[#0F1014] rotate-180 shadow-md' : 'bg-white/5 text-slate-500 group-hover:bg-white/10'}`}>
                <ChevronDown size={18} />
              </div>
            </button>
            <div 
              id={`faq-answer-${i}`}
              className={`px-6 sm:px-8 overflow-hidden transition-all duration-300 ease-in-out`} 
              style={{ maxHeight: openFaq === i ? '250px' : '0px', opacity: openFaq === i ? 1 : 0, paddingBottom: openFaq === i ? '32px' : '0px' }}
            >
              <p className="text-slate-400 text-base leading-relaxed font-medium pt-4 border-t border-white/5">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
