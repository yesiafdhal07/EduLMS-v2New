'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Users, Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import type { ClassData as Class } from '@/types';

// Mock schedule data for UI design purposes
const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
const TIME_SLOTS = ['07:00 - 08:30', '08:30 - 10:00', '10:15 - 11:45', '12:30 - 14:00', '14:15 - 15:45'];

interface JadwalTabProps {
    classes: Class[];
}

export function JadwalTab({ classes }: JadwalTabProps) {
    const [currentWeek, setCurrentWeek] = useState(new Date());

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-white/10 w-fit">
                    <button className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-300">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2 px-4">
                        <CalendarIcon size={18} className="text-indigo-400" />
                        <span className="font-bold text-white text-sm">Minggu ini</span>
                    </div>
                    <button className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-300">
                        <ChevronRight size={20} />
                    </button>
                </div>

                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20">
                    <Plus size={18} />
                    Tambah Jadwal
                </button>
            </div>

            {/* Calendar Grid (Neo-SaaS Design) */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-x-auto">
                <div className="min-w-[800px]">
                    <div className="grid grid-cols-[100px_repeat(5,1fr)] border-b border-white/10 bg-black/20">
                        <div className="p-4 flex items-center justify-center border-r border-white/10">
                            <Clock size={18} className="text-slate-400" />
                        </div>
                        {DAYS.map(day => (
                            <div key={day} className="p-4 text-center border-r border-white/10 last:border-0">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">{day}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="divide-y divide-white/5">
                        {TIME_SLOTS.map((time, idx) => (
                            <div key={time} className="grid grid-cols-[100px_repeat(5,1fr)] group">
                                <div className="p-4 border-r border-white/10 flex items-center justify-center bg-black/10 group-hover:bg-white/5 transition-colors">
                                    <span className="text-xs font-bold text-slate-400">{time.split(' - ')[0]}</span>
                                </div>
                                {DAYS.map((day, dayIdx) => {
                                    // Dummy populate logic to show nice UI
                                    const hasClass = (idx === 1 && dayIdx === 0) || (idx === 0 && dayIdx === 2) || (idx === 2 && dayIdx === 4);
                                    return (
                                        <div key={`${day}-${time}`} className="p-2 border-r border-white/10 last:border-0 min-h-[140px] group-hover:bg-white/5 transition-colors flex flex-col gap-2 relative">
                                            {hasClass ? (
                                                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3 h-full flex flex-col justify-between hover:bg-indigo-500/20 transition-colors cursor-pointer group/card backdrop-blur-sm">
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">Pelajaran</span>
                                                            <span className="w-2 h-2 rounded-full bg-indigo-500 group-hover/card:animate-ping" />
                                                        </div>
                                                        <p className="text-sm font-bold text-white leading-tight">
                                                            {classes && classes.length > 0 ? classes[0].name : 'Kelas Reguler'}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col gap-1.5 mt-3 text-[10px] text-slate-400 font-bold">
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock size={12} className="text-slate-500" />
                                                            {time}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin size={12} className="text-slate-500" />
                                                            Ruang Utama
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="absolute inset-2 rounded-xl border border-dashed border-transparent hover:border-white/20 hover:bg-white/5 flex items-center justify-center opacity-0 hover:opacity-100 transition-all cursor-pointer">
                                                    <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center"><Plus size={14} /></div>
                                                        Isi Jadwal
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
