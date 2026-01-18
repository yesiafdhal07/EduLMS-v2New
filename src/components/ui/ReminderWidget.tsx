'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, Plus, Clock, CheckCircle, X, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

// ========================================================
// REMINDER SYSTEM COMPONENT
// Manage personal reminders and deadline notifications
// ========================================================

interface Reminder {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    due_date: string;
    type: 'assignment' | 'exam' | 'meeting' | 'custom';
    status: 'pending' | 'completed' | 'dismissed';
    created_at: string;
}

interface ReminderWidgetProps {
    userId: string;
    compact?: boolean;
}

const typeConfig = {
    assignment: { icon: Clock, color: 'text-indigo-400', bg: 'bg-indigo-500/20', label: 'Tugas' },
    exam: { icon: Calendar, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Ujian' },
    meeting: { icon: Bell, color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Meeting' },
    custom: { icon: Bell, color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Pengingat' },
};

export function ReminderWidget({ userId, compact = false }: ReminderWidgetProps) {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchReminders();
    }, [userId]);

    const fetchReminders = async () => {
        const { data, error } = await supabase
            .from('reminders')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'pending')
            .order('due_date', { ascending: true })
            .limit(compact ? 5 : 20);

        if (!error && data) {
            setReminders(data);
        }
        setLoading(false);
    };

    const completeReminder = async (id: string) => {
        await supabase
            .from('reminders')
            .update({ status: 'completed' })
            .eq('id', id);

        toast.success('Reminder selesai!');
        fetchReminders();
    };

    const deleteReminder = async (id: string) => {
        await supabase
            .from('reminders')
            .delete()
            .eq('id', id);

        fetchReminders();
    };

    // Get upcoming reminders (within 24 hours)
    const upcomingCount = reminders.filter(r => {
        const due = new Date(r.due_date);
        const now = new Date();
        const diff = due.getTime() - now.getTime();
        return diff > 0 && diff < 24 * 60 * 60 * 1000;
    }).length;

    if (compact) {
        return (
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Bell size={18} className="text-amber-400" />
                        <span className="font-bold text-white text-sm">Pengingat</span>
                        {upcomingCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                                {upcomingCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="p-1.5 text-slate-400 hover:bg-white/10 rounded-lg"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-2">
                        <div className="h-10 bg-white/5 rounded-lg animate-pulse" />
                        <div className="h-10 bg-white/5 rounded-lg animate-pulse" />
                    </div>
                ) : reminders.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-2">Tidak ada pengingat</p>
                ) : (
                    <div className="space-y-2">
                        {reminders.slice(0, 3).map((reminder) => (
                            <ReminderItem
                                key={reminder.id}
                                reminder={reminder}
                                compact
                                onComplete={() => completeReminder(reminder.id)}
                                onDelete={() => deleteReminder(reminder.id)}
                            />
                        ))}
                        {reminders.length > 3 && (
                            <p className="text-xs text-slate-400 text-center">
                                +{reminders.length - 3} lainnya
                            </p>
                        )}
                    </div>
                )}

                {showForm && (
                    <CreateReminderModal
                        userId={userId}
                        onClose={() => setShowForm(false)}
                        onSuccess={() => {
                            setShowForm(false);
                            fetchReminders();
                        }}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                        <Bell size={20} className="text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Pengingat</h3>
                        <p className="text-xs text-slate-400">{reminders.length} aktif</p>
                    </div>
                </div>

                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 transition-all"
                >
                    <Plus size={16} />
                    Tambah
                </button>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : reminders.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                    <Bell size={32} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Tidak ada pengingat aktif</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {reminders.map((reminder) => (
                        <ReminderItem
                            key={reminder.id}
                            reminder={reminder}
                            onComplete={() => completeReminder(reminder.id)}
                            onDelete={() => deleteReminder(reminder.id)}
                        />
                    ))}
                </div>
            )}

            {showForm && (
                <CreateReminderModal
                    userId={userId}
                    onClose={() => setShowForm(false)}
                    onSuccess={() => {
                        setShowForm(false);
                        fetchReminders();
                    }}
                />
            )}
        </div>
    );
}

// Individual reminder item
function ReminderItem({
    reminder,
    compact = false,
    onComplete,
    onDelete,
}: {
    reminder: Reminder;
    compact?: boolean;
    onComplete: () => void;
    onDelete: () => void;
}) {
    const config = typeConfig[reminder.type];
    const IconComponent = config.icon;

    const dueDate = new Date(reminder.due_date);
    const now = new Date();
    const isOverdue = dueDate < now;
    const isToday = dueDate.toDateString() === now.toDateString();
    const isTomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString() === dueDate.toDateString();

    const getDueLabel = () => {
        if (isOverdue) return 'Terlambat';
        if (isToday) return 'Hari ini';
        if (isTomorrow) return 'Besok';
        return dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    if (compact) {
        return (
            <div className={`flex items-center gap-2 p-2 rounded-lg ${config.bg}`}>
                <IconComponent size={14} className={config.color} />
                <span className="flex-1 text-xs text-white truncate">{reminder.title}</span>
                <span className={`text-xs ${isOverdue ? 'text-red-400' : 'text-slate-400'}`}>
                    {getDueLabel()}
                </span>
                <button
                    onClick={onComplete}
                    className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                >
                    <CheckCircle size={14} />
                </button>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-4 p-4 rounded-xl border ${isOverdue ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
            <div className={`w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center shrink-0`}>
                <IconComponent size={20} className={config.color} />
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white truncate">{reminder.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 ${config.bg} ${config.color} rounded-full font-medium`}>
                        {config.label}
                    </span>
                    <span className={`text-xs ${isOverdue ? 'text-red-400' : 'text-slate-400'}`}>
                        {getDueLabel()} • {dueDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1">
                <button
                    onClick={onComplete}
                    className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-all"
                    title="Selesai"
                >
                    <CheckCircle size={18} />
                </button>
                <button
                    onClick={onDelete}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                    title="Hapus"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}

// Create reminder modal
function CreateReminderModal({
    userId,
    onClose,
    onSuccess,
}: {
    userId: string;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [dueTime, setDueTime] = useState('09:00');
    const [type, setType] = useState<'assignment' | 'exam' | 'meeting' | 'custom'>('custom');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !dueDate) return;

        setLoading(true);

        const { error } = await supabase
            .from('reminders')
            .insert({
                user_id: userId,
                title: title.trim(),
                description: description.trim() || null,
                due_date: `${dueDate}T${dueTime}:00`,
                type,
            });

        setLoading(false);

        if (error) {
            toast.error('Gagal membuat pengingat');
        } else {
            toast.success('Pengingat berhasil dibuat');
            onSuccess();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-slate-900 rounded-[2rem] p-6 border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Buat Pengingat</h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-white/10 rounded-xl">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Judul</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500"
                            placeholder="Apa yang perlu diingat?"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Tipe</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as typeof type)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                        >
                            <option value="custom">Pengingat</option>
                            <option value="assignment">Tugas</option>
                            <option value="exam">Ujian</option>
                            <option value="meeting">Meeting</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Tanggal</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Waktu</label>
                            <input
                                type="time"
                                value={dueTime}
                                onChange={(e) => setDueTime(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Catatan (Opsional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 min-h-[80px]"
                            placeholder="Detail tambahan..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !title.trim() || !dueDate}
                            className="flex-1 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Menyimpan...' : 'Buat'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
