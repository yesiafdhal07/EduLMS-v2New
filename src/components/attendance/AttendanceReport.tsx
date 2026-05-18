'use client';

import { useState, useMemo } from 'react';
import { 
    Calendar, Users, Download, Filter, 
    Search, TrendingUp, TrendingDown, 
    MoreHorizontal, FileText, Share2, MapPin
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

export function AttendanceReport({ data }: { data: any[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'hadir' | 'izin' | 'sakit' | 'alpa'>('all');

    const stats = useMemo(() => {
        const total = data.length;
        const hadir = data.filter(r => r.status === 'hadir').length;
        const izin = data.filter(r => r.status === 'izin').length;
        const sakit = data.filter(r => r.status === 'sakit').length;
        const alpa = data.filter(r => r.status === 'alpa').length;

        return [
            { name: 'Hadir', value: hadir, color: '#10b981' },
            { name: 'Izin', value: izin, color: '#6366f1' },
            { name: 'Sakit', value: sakit, color: '#f59e0b' },
            { name: 'Alpa', value: alpa, color: '#f43f5e' },
        ];
    }, [data]);

    const filteredData = data.filter(item => {
        const matchesSearch = item.student_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8">
            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl space-y-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.name}</p>
                        <div className="flex items-end justify-between">
                            <p className="text-3xl font-black text-white">{stat.value}</p>
                            <p className="text-xs font-bold" style={{ color: stat.color }}>
                                {((stat.value / data.length) * 100).toFixed(1)}%
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Chart */}
                <div className="lg:col-span-2 bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-black text-white uppercase tracking-tight">Visualisasi Kehadiran</h4>
                        <div className="flex gap-2">
                            <button className="p-2 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white">
                                <Filter size={18} />
                            </button>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                    {stats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart / Breakdown */}
                <div className="bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center justify-center space-y-6">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Porsi Kehadiran</h4>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 w-full">
                        {stats.map(s => (
                            <div key={s.name} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{s.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] overflow-hidden">
                <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari nama siswa..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-3 bg-white/5 border border-white/5 rounded-2xl text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <select 
                            value={filterStatus}
                            onChange={(e: any) => setFilterStatus(e.target.value)}
                            className="px-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-xs font-black text-slate-400 uppercase tracking-widest focus:outline-none"
                        >
                            <option value="all">Semua Status</option>
                            <option value="hadir">Hadir</option>
                            <option value="izin">Izin</option>
                            <option value="sakit">Sakit</option>
                            <option value="alpa">Alpa</option>
                        </select>
                        <button className="p-3 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-white transition-all">
                            <Download size={20} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Siswa</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Metode</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Lokasi</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Waktu</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((record) => (
                                <tr key={record.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400">
                                                {record.student_name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-bold text-white">{record.student_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                                            record.method === 'qr_code' ? 'bg-violet-500/10 text-violet-400' : 'bg-slate-500/10 text-slate-400'
                                        }`}>
                                            {record.method || 'manual'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        {record.verification_lat ? (
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400">
                                                <MapPin size={12} />
                                                Terverifikasi
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-600 italic">N/A</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-xs font-medium text-slate-500">
                                        {new Date(record.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-8 py-5">
                                        <StatusBadge status={record.status} />
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="p-2 text-slate-600 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        hadir: 'bg-emerald-500/10 text-emerald-400',
        izin: 'bg-indigo-500/10 text-indigo-400',
        sakit: 'bg-amber-500/10 text-amber-400',
        alpa: 'bg-rose-500/10 text-rose-400',
    };

    return (
        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] ${styles[status]}`}>
            {status}
        </span>
    );
}
