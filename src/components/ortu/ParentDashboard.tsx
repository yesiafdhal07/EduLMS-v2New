'use client';

import { useState, useEffect } from 'react';
import { 
    Users, Activity, Bell, ShieldCheck, 
    ChevronRight, Star, Calendar, BookOpen,
    TrendingUp, Award, MessageSquare, Heart,
    Sparkles, ArrowUpRight, CheckCircle2
} from 'lucide-react';
import { parentRepository } from '@/lib/repositories/parent.repository';
import type { User } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface ParentDashboardProps {
    user: User;
}

export function ParentDashboard({ user }: ParentDashboardProps) {
    const [linkedStudents, setLinkedStudents] = useState<any[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const students = await parentRepository.getLinkedStudents(user.id);
            setLinkedStudents(students || []);
            if (students && students.length > 0) {
                handleSelectStudent(students[0]);
            }
        } catch (error) {
            console.error('Error loading parent data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectStudent = async (studentLink: any) => {
        setSelectedStudent(studentLink);
        try {
            const summary = await parentRepository.getStudentDashboard(studentLink.student.id);
            setStats(summary);
        } catch (error) {
            console.error('Error loading student summary:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-rose-500/10 rounded-full" />
                    <div className="absolute inset-0 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 md:p-8 space-y-10">
            {/* Header: Welcome & Student Switcher */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-2">
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-rose-400"
                    >
                        <ShieldCheck size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Parent Guardian Verified</span>
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black text-white tracking-tight font-fraunces"
                    >
                        Halo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">{user.full_name.split(' ')[0]}</span>
                    </motion.h1>
                    <p className="text-slate-500 text-sm font-medium max-w-md">
                        Pantau setiap langkah prestasi dan kehadiran buah hati Anda secara real-time.
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-2 rounded-[2rem] backdrop-blur-xl">
                    {linkedStudents.map((link) => (
                        <button
                            key={link.id}
                            onClick={() => handleSelectStudent(link)}
                            className={`
                                relative flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-500
                                ${selectedStudent?.id === link.id 
                                    ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/30' 
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                }
                            `}
                        >
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px]
                                ${selectedStudent?.id === link.id ? 'bg-white/20' : 'bg-white/5'}
                            `}>
                                {link.student.full_name.charAt(0)}
                            </div>
                            <span className="font-bold text-xs whitespace-nowrap">{link.student.full_name.split(' ')[0]}</span>
                            {selectedStudent?.id === link.id && (
                                <motion.div layoutId="active-student" className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-rose-500" />
                            )}
                        </button>
                    ))}
                    <button className="w-12 h-12 rounded-2xl border-2 border-dashed border-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:border-rose-500/50 hover:bg-rose-500/5 transition-all duration-300">
                        <Users size={18} />
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {selectedStudent ? (
                    <motion.div 
                        key={selectedStudent.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-10">
                            {/* Academic Snapshot */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <StatCard 
                                    icon={<TrendingUp size={20} />} 
                                    label="Rata-rata Nilai" 
                                    value={stats?.avg_grade || '0'} 
                                    trend="+2.4%"
                                    color="rose"
                                />
                                <StatCard 
                                    icon={<Calendar size={20} />} 
                                    label="Kehadiran" 
                                    value={`${stats?.attendance_rate || 0}%`} 
                                    trend="Stabil"
                                    color="orange"
                                />
                                <StatCard 
                                    icon={<Sparkles size={20} />} 
                                    label="XP Points" 
                                    value={stats?.xp_total || 0} 
                                    trend={`Level ${stats?.xp_level || 1}`}
                                    color="amber"
                                />
                                <StatCard 
                                    icon={<BookOpen size={20} />} 
                                    label="Tugas Selesai" 
                                    value={`${stats?.submitted_count || 0}/${stats?.total_assignments || 0}`} 
                                    trend="On Track"
                                    color="rose"
                                />
                            </div>

                            {/* Activity Feed */}
                            <div className="bg-white/[0.03] border border-white/5 rounded-[3rem] p-8 md:p-10 space-y-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[100px] -mr-32 -mt-32" />
                                
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
                                            <Activity size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white">Timeline Belajar</h3>
                                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">Aktivitas Terakhir</p>
                                        </div>
                                    </div>
                                    <button className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>

                                <div className="space-y-6 relative z-10">
                                    <ActivityItem 
                                        icon={<Award className="text-amber-400" />}
                                        title="Lencana Prestasi"
                                        desc={`${selectedStudent.student.full_name} meraih predikat "Teladan Kelas" minggu ini.`}
                                        time="Tadi malam"
                                        color="amber"
                                    />
                                    <ActivityItem 
                                        icon={<CheckCircle2 className="text-rose-400" />}
                                        title="Tugas Dinilai"
                                        desc="Proyek Akhir Fisika telah dinilai dengan skor 98/100."
                                        time="Kemarin, 14:20"
                                        color="rose"
                                    />
                                    <ActivityItem 
                                        icon={<Calendar className="text-orange-400" />}
                                        title="Laporan Presensi"
                                        desc="Anak Anda telah mengisi presensi kehadiran pukul 07:05."
                                        time="Kemarin, 07:15"
                                        color="orange"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {/* Premium Feature: WA Alerts */}
                            <div className="bg-gradient-to-br from-rose-600 to-orange-600 rounded-[2.5rem] p-8 shadow-2xl shadow-rose-600/20 relative overflow-hidden group cursor-pointer">
                                <motion.div 
                                    animate={{ 
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, 0] 
                                    }}
                                    transition={{ duration: 10, repeat: Infinity }}
                                    className="absolute -top-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity"
                                >
                                    <MessageSquare size={200} />
                                </motion.div>
                                
                                <div className="relative z-10 space-y-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                                        <Bell size={28} className="animate-bounce" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black text-white leading-none">Smart Alerts</h3>
                                        <p className="text-white/80 text-sm font-bold leading-relaxed">
                                            Aktifkan notifikasi WhatsApp untuk setiap pembaruan nilai & absensi.
                                        </p>
                                    </div>
                                    <button className="w-full py-5 bg-white text-rose-600 font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 group-hover:gap-5 transition-all">
                                        KONEKSIKAN SEKARANG
                                        <ArrowUpRight size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Quick Actions Portal */}
                            <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 space-y-6">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Parent Actions</h4>
                                </div>
                                <div className="space-y-3">
                                    <ActionButton icon={<MessageSquare size={18} />} label="Chat Wali Kelas" badge="Guru" />
                                    <ActionButton icon={<Calendar size={18} />} label="Kalender Sekolah" />
                                    <ActionButton icon={<Heart size={18} />} label="Layanan Konsultasi" />
                                    <ActionButton icon={<Star size={18} />} label="Tabungan & Kas" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-8"
                    >
                        <div className="relative">
                            <div className="w-32 h-32 rounded-[3rem] bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
                                <Users size={56} />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center text-white border-4 border-slate-950">
                                <Sparkles size={16} />
                            </div>
                        </div>
                        <div className="max-w-sm space-y-3">
                            <h2 className="text-3xl font-black text-white font-fraunces">Terhubung Sekarang</h2>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                Anda belum menghubungkan akun dengan data akademik anak. Masukkan kode siswa untuk memulai.
                            </p>
                        </div>
                        <button className="px-10 py-5 bg-gradient-to-r from-rose-600 to-orange-600 text-white font-black rounded-2xl shadow-2xl shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all">
                            HUBUNGKAN SISWA
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ icon, label, value, trend, color }: any) {
    const themes: any = {
        rose: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
        orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
        amber: 'text-amber-400 bg-amber-400/10 border-amber-400/20'
    };

    return (
        <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-6 space-y-5 hover:bg-white/[0.06] transition-all duration-500 group relative">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${themes[color] || themes.rose} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{label}</p>
                <div className="flex items-end justify-between gap-2">
                    <p className="text-3xl font-black text-white leading-none tracking-tight">{value}</p>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${themes[color] || themes.rose}`}>
                        {trend}
                    </span>
                </div>
            </div>
        </div>
    );
}

function ActivityItem({ icon, title, desc, time, color }: any) {
    const themes: any = {
        rose: 'bg-rose-500/10 border-rose-500/20',
        orange: 'bg-orange-500/10 border-orange-500/20',
        amber: 'bg-amber-500/10 border-amber-500/20'
    };

    return (
        <div className="flex gap-6 group cursor-default relative">
            <div className="relative z-10">
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center group-hover:scale-110 transition-transform duration-500 bg-slate-900 ${themes[color]}`}>
                    {icon}
                </div>
                <div className="absolute top-12 bottom-[-24px] left-1/2 -translate-x-1/2 w-px bg-white/5 group-last:hidden" />
            </div>
            <div className="pb-10 space-y-2 flex-1">
                <div className="flex items-center justify-between">
                    <h4 className="text-base font-black text-white group-hover:text-rose-400 transition-colors">{title}</h4>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{time}</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                    {desc}
                </p>
            </div>
        </div>
    );
}

function ActionButton({ icon, label, badge }: any) {
    return (
        <motion.button 
            whileHover={{ x: 5 }}
            className="w-full flex items-center justify-between p-5 rounded-[1.5rem] bg-white/[0.02] border border-transparent hover:border-white/10 hover:bg-white/5 transition-all group overflow-hidden relative"
        >
            <div className="flex items-center gap-4 relative z-10">
                <div className="text-slate-500 group-hover:text-rose-400 transition-colors">
                    {icon}
                </div>
                <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">{label}</span>
            </div>
            <div className="flex items-center gap-3 relative z-10">
                {badge && (
                    <span className="text-[9px] font-black px-2 py-1 bg-rose-500 text-white rounded-md tracking-widest uppercase">
                        {badge}
                    </span>
                )}
                <ChevronRight size={14} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
        </motion.button>
    );
}
