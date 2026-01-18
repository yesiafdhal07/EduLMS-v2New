'use client';

import { Users, FileText, Calendar, GraduationCap, BarChart, Shield, Zap, Laptop } from 'lucide-react';

const features = [
    {
        icon: Users,
        title: 'Manajemen Kelas',
        desc: 'Kelola siswa, absensi, dan data kelas dengan sistem yang terorganisir rapi.',
        color: 'indigo'
    },
    {
        icon: FileText,
        title: 'Penugasan Digital',
        desc: 'Buat, bagikan, dan nilai tugas secara online. Mendukung berbagai format file.',
        color: 'purple'
    },
    {
        icon: Calendar,
        title: 'Presensi Otomatis',
        desc: 'Sistem presensi berbasis waktu dan lokasi untuk akurasi kehadiran siswa.',
        color: 'emerald'
    },
    {
        icon: GraduationCap,
        title: 'Peer Review',
        desc: 'Fitur review antar siswa untuk melatih kemampuan analisis dan kolaborasi.',
        color: 'pink'
    },
    {
        icon: BarChart,
        title: 'Analitik Belajar',
        desc: 'Pantau perkembangan siswa melalui dashboard analitik yang komprehensif.',
        color: 'blue'
    },
    {
        icon: Shield,
        title: 'Aman & Terpercaya',
        desc: 'Data sekolah tersimpan aman dengan enkripsi standar industri.',
        color: 'orange'
    },
    {
        icon: Zap,
        title: 'Cepat & Ringan',
        desc: 'Akses platform tanpa lag, dioptimalkan untuk berbagai perangkat.',
        color: 'yellow'
    },
    {
        icon: Laptop,
        title: 'Responsif',
        desc: 'Tampilan yang menyesuaikan dengan perangkat desktop, tablet, maupun HP.',
        color: 'cyan'
    }
];

export function FeaturesGrid() {
    return (
        <section className="py-24 relative z-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
                        Fitur Lengkap untuk
                        <br />
                        <span className="text-indigo-400">Sekolah Modern</span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Kami menyediakan semua tools yang dibutuhkan guru dan siswa untuk proses belajar mengajar yang efektif.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="p-8 bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-3xl hover:bg-indigo-900/10 hover:border-indigo-500/30 transition-all group duration-300 hover:-translate-y-1"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-${feature.color}-500/10 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon size={28} className={`text-${feature.color}-400`} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
