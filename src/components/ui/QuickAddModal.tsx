'use client';

import { useState } from 'react';
import { X, FileText, BookOpen, Users, QrCode, Plus, Calendar, Calculator } from 'lucide-react';

interface QuickAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddTask: () => void;
    onAddMaterial: () => void;
    onAddClass: () => void;
    onStartAttendance: () => void;
}

const quickActions = [
    { id: 'task', label: 'Tugas Baru', description: 'Buat penugasan untuk kelas', icon: FileText, action: 'onAddTask', color: 'from-indigo-500 to-purple-500' },
    { id: 'material', label: 'Materi Baru', description: 'Unggah bahan ajar', icon: BookOpen, action: 'onAddMaterial', color: 'from-blue-500 to-cyan-500' },
    { id: 'class', label: 'Kelas Baru', description: 'Buat ruang kelas', icon: Users, action: 'onAddClass', color: 'from-emerald-500 to-teal-500' },
    { id: 'attendance', label: 'Mulai Presensi', description: 'Aktifkan QR absensi', icon: QrCode, action: 'onStartAttendance', color: 'from-amber-500 to-orange-500' },
];

export function QuickAddModal({ isOpen, onClose, onAddTask, onAddMaterial, onAddClass, onStartAttendance }: QuickAddModalProps) {
    const [hovered, setHovered] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleAction = (action: string) => {
        switch (action) {
            case 'onAddTask': onAddTask(); break;
            case 'onAddMaterial': onAddMaterial(); break;
            case 'onAddClass': onAddClass(); break;
            case 'onStartAttendance': onStartAttendance(); break;
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[99995] flex items-center justify-center p-4" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-xl animate-in fade-in duration-200" />
            
            {/* Modal */}
            <div 
                className="relative w-full max-w-lg rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                style={{
                    background: 'linear-gradient(180deg, rgba(20, 30, 53, 0.98) 0%, rgba(13, 21, 38, 0.99) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 60px -15px rgba(99, 102, 241, 0.3)'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5" style={{ background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.08), transparent)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Plus size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white font-fraunces">Quick Actions</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pilih aksi cepat</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Actions Grid */}
                <div className="p-4">
                    <div className="grid grid-cols-2 gap-3">
                        {quickActions.map((action) => (
                            <button
                                key={action.id}
                                onClick={() => handleAction(action.action)}
                                onMouseEnter={() => setHovered(action.id)}
                                onMouseLeave={() => setHovered(null)}
                                className={`
                                    relative p-4 rounded-2xl text-left transition-all duration-300
                                    border border-white/5 hover:border-white/10
                                    ${hovered === action.id ? 'transform scale-[1.02] -translate-y-1' : ''}
                                `}
                                style={{
                                    background: hovered === action.id 
                                        ? 'rgba(99, 102, 241, 0.1)' 
                                        : 'rgba(255, 255, 255, 0.02)',
                                }}
                            >
                                {/* Gradient background */}
                                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${action.color} opacity-0 ${hovered === action.id ? 'opacity-5' : ''}`} />
                                
                                <div className="relative z-10">
                                    <div className={`
                                        w-10 h-10 rounded-xl flex items-center justify-center mb-3
                                        bg-gradient-to-br ${action.color} shadow-lg
                                        transition-transform duration-300
                                        ${hovered === action.id ? 'scale-110' : ''}
                                    `}>
                                        <action.icon size={18} className="text-white" />
                                    </div>
                                    <h3 className="text-sm font-bold text-white mb-1">{action.label}</h3>
                                    <p className="text-[10px] text-slate-500 leading-tight">{action.description}</p>
                                </div>

                                {/* Glow effect on hover */}
                                {hovered === action.id && (
                                    <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-r ${action.color} opacity-20 blur-xl -z-10`} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer hint */}
                <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1.5">
                            <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[9px] font-mono border border-white/5">C</kbd>
                            <span>Buka</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[9px] font-mono border border-white/5">ESC</kbd>
                            <span>Tutup</span>
                        </span>
                    </div>
                    <div className="text-[9px] text-indigo-400/60 font-medium">
                        ← → Navigasi • Enter Pilih
                    </div>
                </div>
            </div>
        </div>
    );
}