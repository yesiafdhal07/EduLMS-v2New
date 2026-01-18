'use client';

import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-900 text-white font-outfit">
            <LandingNavbar />

            <main className="pt-32 pb-20">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h1 className="text-5xl font-black mb-6">Tentang EduLMS</h1>
                        <p className="text-xl text-slate-400">
                            Misi kami adalah mendemokratisasi akses ke teknologi pendidikan berkualitas tinggi untuk semua sekolah di Indonesia.
                        </p>
                    </div>

                    <div className="space-y-20">
                        {/* Story Section */}
                        <section>
                            <h2 className="text-3xl font-bold mb-6 text-indigo-400">Cerita Kami</h2>
                            <p className="text-lg text-slate-300 leading-relaxed mb-6">
                                EduLMS dimulai dengan satu tujuan sederhana: membantu guru matematika menghemat waktu administrasi sehingga mereka bisa fokus pada hal yang paling penting - mengajar.
                            </p>
                            <p className="text-lg text-slate-300 leading-relaxed">
                                Kami percaya bahwa teknologi tidak seharusnya menggantikan peran guru, tetapi memberdayakan mereka. Platform kami dirancang dengan prinsip "Teacher-First", memastikan setiap fitur benar-benar menjawab kebutuhan di lapangan.
                            </p>
                        </section>

                        {/* Values */}
                        <section className="grid md:grid-cols-3 gap-8">
                            {[
                                { title: 'Inovasi', desc: 'Selalu beradaptasi dengan teknologi terbaru.' },
                                { title: 'Inklusivitas', desc: 'Desain yang mudah digunakan oleh siapa saja.' },
                                { title: 'Integritas', desc: 'Menjaga keamanan data pengguna adalah prioritas utama.' }
                            ].map((val, i) => (
                                <div key={i} className="p-8 bg-white/5 rounded-3xl border border-white/10">
                                    <h3 className="text-xl font-bold mb-4 text-white">{val.title}</h3>
                                    <p className="text-slate-400">{val.desc}</p>
                                </div>
                            ))}
                        </section>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
