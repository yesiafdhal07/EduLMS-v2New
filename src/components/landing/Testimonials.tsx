'use client';

import { Star, Quote } from 'lucide-react';

const testimonials = [
    {
        name: 'Budi Santoso',
        role: 'Guru Matematika, SMAN 1 Jakarta',
        content: '"EduLMS benar-benar mengubah cara saya mengelola kelas. Presensi otomatis dan grading system-nya sangat membantu menghemat waktu administrasi."',
        avatar: 'B'
    },
    {
        name: 'Siti Aminah',
        role: 'Kepala Sekolah',
        content: '"Platform yang sangat intuitif. Guru-guru kami yang kurang paham teknologi pun bisa langsung menggunakannya tanpa kendala berarti. Sangat direkomendasikan!"',
        avatar: 'S'
    },
    {
        name: 'Rizky Pratama',
        role: 'Siswa Kelas XII',
        content: '"Tugas jadi lebih terorganisir, dan saya suka fitur peer review-nya. Kita jadi bisa belajar dari teman lain dan memperbaiki kesalahan."',
        avatar: 'R'
    }
];

export function Testimonials() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-indigo-950/20 skew-y-3 transform origin-top-left -z-10"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">Apa Kata Mereka?</h2>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">
                        Ribuan pendidik dan pelajar telah merasakan dampak positif EduLMS.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimoni, idx) => (
                        <div key={idx} className="bg-slate-900 border border-white/10 p-8 rounded-3xl relative">
                            <Quote className="absolute top-8 right-8 text-indigo-500/20" size={48} />

                            <div className="flex gap-1 mb-6">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} size={16} className="fill-amber-400 text-amber-400" />
                                ))}
                            </div>

                            <p className="text-slate-300 leading-relaxed mb-8 italic">
                                {testimoni.content}
                            </p>

                            <div className="flex items-center gap-4 mt-auto">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                    {testimoni.avatar}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{testimoni.name}</h4>
                                    <p className="text-indigo-400 text-xs font-medium uppercase tracking-wider">{testimoni.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
