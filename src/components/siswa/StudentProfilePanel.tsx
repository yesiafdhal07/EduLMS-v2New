'use client';

import { User, Mail, GraduationCap, Calendar, Award, BookOpen, CheckCircle } from 'lucide-react';

interface ProfileStats {
    completedAssignments: number;
    totalAssignments: number;
    averageScore: number;
    attendanceRate: number;
}

interface StudentProfilePanelProps {
    user: {
        id: string;
        email: string;
        full_name?: string;
        className?: string;
        role: string;
    } | null;
    stats?: ProfileStats;
}

export function StudentProfilePanel({ user, stats }: StudentProfilePanelProps) {
    if (!user) {
        return (
            <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-8 border border-white/10 text-center">
                <p className="text-slate-400">Memuat data profil...</p>
            </div>
        );
    }

    const initials = (user.full_name || user.email || 'S').charAt(0).toUpperCase();
    const displayStats = stats || { completedAssignments: 0, totalAssignments: 0, averageScore: 0, attendanceRate: 0 };

    return (
        <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/20 backdrop-blur-lg rounded-[2rem] p-8 border border-white/10">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] flex items-center justify-center text-5xl font-black text-white shadow-2xl shadow-emerald-500/30">
                            {initials}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                            <CheckCircle size={20} className="text-white" />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                            {user.full_name || 'Siswa'}
                        </h2>
                        <div className="flex flex-col md:flex-row items-center gap-4 text-slate-400">
                            <div className="flex items-center gap-2">
                                <Mail size={16} className="text-emerald-400" />
                                <span>{user.email}</span>
                            </div>
                            <span className="hidden md:inline text-slate-600">•</span>
                            <div className="flex items-center gap-2">
                                <GraduationCap size={16} className="text-emerald-400" />
                                <span>{user.className || 'Belum terdaftar di kelas'}</span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-bold">
                                <User size={14} />
                                {user.role === 'siswa' ? 'Pelajar' : user.role}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBox
                    icon={<BookOpen size={24} />}
                    label="Tugas Selesai"
                    value={`${displayStats.completedAssignments}/${displayStats.totalAssignments}`}
                    color="emerald"
                />
                <StatBox
                    icon={<Award size={24} />}
                    label="Rata-rata Nilai"
                    value={displayStats.averageScore > 0 ? displayStats.averageScore.toFixed(1) : '-'}
                    color="amber"
                />
                <StatBox
                    icon={<Calendar size={24} />}
                    label="Kehadiran"
                    value={displayStats.attendanceRate > 0 ? `${displayStats.attendanceRate.toFixed(0)}%` : '-'}
                    color="blue"
                />
                <StatBox
                    icon={<CheckCircle size={24} />}
                    label="Status"
                    value="Aktif"
                    color="green"
                />
            </div>

            {/* Account Info */}
            <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-700/50 rounded-xl flex items-center justify-center">
                        <User size={20} className="text-slate-400" />
                    </div>
                    Informasi Akun
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="ID Pengguna" value={user.id.slice(0, 8) + '...'} />
                    <InfoRow label="Email" value={user.email} />
                    <InfoRow label="Nama Lengkap" value={user.full_name || '-'} />
                    <InfoRow label="Kelas" value={user.className || '-'} />
                </div>
            </div>
        </div>
    );
}

function StatBox({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
    const colors: Record<string, string> = {
        emerald: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400',
        amber: 'from-amber-500/20 to-amber-600/10 text-amber-400',
        blue: 'from-blue-500/20 to-blue-600/10 text-blue-400',
        green: 'from-green-500/20 to-green-600/10 text-green-400',
    };

    return (
        <div className={`bg-gradient-to-br ${colors[color]} backdrop-blur-lg rounded-2xl p-5 border border-white/10`}>
            <div className="mb-3 opacity-80">{icon}</div>
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-slate-800/30 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-white font-medium truncate">{value}</p>
        </div>
    );
}
