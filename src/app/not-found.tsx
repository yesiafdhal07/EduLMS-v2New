import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0F1014] p-4 relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#B4A3FF]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-[#00E5FF]/5 rounded-full blur-[100px]" />
            </div>

            <div className="text-center relative z-10 max-w-md">
                {/* 404 Number */}
                <h1 className="text-[120px] md:text-[180px] font-black text-white/[0.03] leading-none select-none tracking-tighter">
                    404
                </h1>

                <div className="-mt-16 md:-mt-24">
                    {/* Icon */}
                    <div className="w-16 h-16 bg-[#B4A3FF] rounded-2xl flex items-center justify-center font-black text-[#0F1014] text-3xl mx-auto mb-6 shadow-[0_10px_30px_rgba(180,163,255,0.3)]">
                        ?
                    </div>

                    <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                        Halaman Tidak Ditemukan
                    </h2>
                    <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
                        Halaman yang Anda cari tidak ada atau sudah dipindahkan.
                        <br />Periksa kembali URL atau kembali ke beranda.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/"
                            className="bg-white hover:bg-slate-200 text-[#0F1014] font-black py-3 px-8 rounded-2xl shadow-[0_10px_30px_rgba(255,255,255,0.1)] transform hover:-translate-y-1 transition-all text-sm tracking-wide"
                        >
                            Kembali ke Beranda
                        </Link>
                        <Link
                            href="/login"
                            className="bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all text-sm"
                        >
                            Masuk ke Portal
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
