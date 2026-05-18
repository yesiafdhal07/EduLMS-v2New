import React from 'react';

export const WallOfLove = () => {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto relative border-t border-white/5 reveal-on-scroll">
      <div className="relative w-full overflow-hidden flex flex-col gap-6">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0F1014] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0F1014] to-transparent z-10 pointer-events-none" />
        
        <div className="flex whitespace-nowrap animate-[slide_40s_linear_infinite] gap-8 px-6" aria-label="Testimoni Pengguna">
          {[...Array(3)].map((_, i) => (
            <React.Fragment key={`testimonial-group-${i}`}>
              <div className="w-[300px] sm:w-[400px] md:w-[480px] bg-[#12141A] border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 whitespace-normal shrink-0 shadow-lg hover:-translate-y-2 transition-transform duration-500 cursor-pointer">
                <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-6 md:mb-8 font-serif italic font-medium">"Kesehatan kas yayasan kami membaik drastis. Penagihan SPP yang dulu menimbulkan kecanggungan sosial, sekarang tertagih elegan secara robotik lewat WA orang tua."</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#B4A3FF] flex items-center justify-center font-black text-[#0F1014] text-lg">H</div>
                  <div>
                    <div className="text-white text-base font-bold">H. Ahmad Dahlan, M.Pd</div>
                    <div className="text-sm text-slate-500 font-medium">Pemilik Yayasan Pesantren Terpadu</div>
                  </div>
                </div>
              </div>

              <div className="w-[300px] sm:w-[400px] md:w-[480px] bg-[#FFC38B] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 whitespace-normal shrink-0 shadow-xl hover:-translate-y-2 transition-transform duration-500 cursor-pointer">
                <p className="text-[#0F1014] text-base md:text-lg leading-relaxed mb-6 md:mb-8 font-serif italic font-bold">"Saya hampir resign karena frustasi mengoreksi 200 lembar soal HOTS tiap akhir semester. Kehadiran AI Klolakelas benar-benar menyelamatkan karir dan kewarasan saya."</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#0F1014] flex items-center justify-center font-black text-white text-lg">S</div>
                  <div>
                    <div className="text-[#0F1014] text-base font-black">Siti Nurhaliza, S.Si</div>
                    <div className="text-sm text-[#0F1014]/70 font-bold">Wakil Kurikulum SMAN Unggulan</div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
