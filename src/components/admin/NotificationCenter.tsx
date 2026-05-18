'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, X, AlertCircle, Info, Shield, PlusCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export type NotificationType = 'info' | 'warning' | 'success' | 'security';

export interface NotificationItem {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
    {
        id: '1',
        type: 'security',
        title: 'Percobaan Login Gagal',
        message: '3x percobaan login gagal terdeteksi dari IP 192.168.1.5',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
        read: false,
    },
    {
        id: '2',
        type: 'success',
        title: 'Sekolah Baru Terdaftar',
        message: 'SMA Negeri 1 Jakarta telah berhasil didaftarkan.',
        timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
        read: false,
    },
    {
        id: '3',
        type: 'warning',
        title: 'Kuota Penyimpanan Menipis',
        message: 'Penyimpanan sistem mencapai 85% dari total kapasitas.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: true,
    },
    {
        id: '4',
        type: 'info',
        title: 'Pembaruan Sistem Selesai',
        message: 'Sistem telah diperbarui ke versi v2.1.0.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
    }
];

export function NotificationCenter() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
    const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | NotificationType>('all');
    
    const ref = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        if (!open) return;
        const handle = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        window.addEventListener('mousedown', handle);
        return () => window.removeEventListener('mousedown', handle);
    }, [open]);

    // Handle ESC
    useEffect(() => {
        if (!open) return;
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        }
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [open]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const filtered = notifications.filter(n => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'unread') return !n.read;
        return n.type === activeFilter;
    });

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const markRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const getIcon = (type: NotificationType) => {
        switch(type) {
            case 'info': return <Info size={16} className="text-blue-400" />;
            case 'success': return <Check size={16} className="text-emerald-400" />;
            case 'warning': return <AlertCircle size={16} className="text-amber-400" />;
            case 'security': return <Shield size={16} className="text-rose-400" />;
        }
    };

    const getBgColor = (type: NotificationType) => {
        switch(type) {
            case 'info': return 'bg-blue-500/10 border-blue-500/20';
            case 'success': return 'bg-emerald-500/10 border-emerald-500/20';
            case 'warning': return 'bg-amber-500/10 border-amber-500/20';
            case 'security': return 'bg-rose-500/10 border-rose-500/20';
        }
    };

    return (
        <div className="relative" ref={ref}>
            <button 
                onClick={() => setOpen(!open)}
                className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                title="Notifications"
            >
                <Bell size={18} className="text-slate-400" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2.5 flex items-center justify-center w-2 h-2">
                        <span className="absolute inline-flex w-full h-full rounded-full bg-rose-400 animate-ping opacity-75"></span>
                        <span className="relative inline-flex w-2 h-2 rounded-full bg-rose-500"></span>
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute -right-2 sm:right-0 top-full mt-3 w-[calc(100vw-2rem)] sm:w-[380px] bg-[#0F1014] border border-white/10 rounded-2xl shadow-2xl shadow-black/80 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden font-geist-mono flex flex-col max-h-[80vh]">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#12141A]">
                        <div>
                            <h3 className="text-sm font-black text-white flex items-center gap-2">
                                NOTIFICATIONS
                                {unreadCount > 0 && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-400 text-[10px]">
                                        {unreadCount} NEW
                                    </span>
                                )}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider flex items-center gap-1">
                                    <Check size={12} />
                                    Mark All Read
                                </button>
                            )}
                            <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-slate-400 transition-colors">
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex overflow-x-auto gap-2 px-5 py-3 border-b border-white/5 shrink-0 hide-scrollbar bg-black/20">
                        {(['all', 'unread', 'security', 'warning', 'info', 'success'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                                    activeFilter === f 
                                        ? 'bg-white/10 text-white' 
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto flex-1 overscroll-contain">
                        {filtered.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                                    <Bell size={20} className="text-slate-600" />
                                </div>
                                <p className="text-sm font-bold text-white mb-1">No Notifications</p>
                                <p className="text-xs text-slate-500">You're all caught up! No active alerts matching this filter.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {filtered.map(notification => (
                                    <div 
                                        key={notification.id} 
                                        className={`p-4 relative group transition-colors hover:bg-white/[0.02] ${!notification.read ? 'bg-white/[0.03]' : ''}`}
                                    >
                                        {!notification.read && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-rose-500 rounded-r-full shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                                        )}
                                        
                                        <div className="flex gap-4">
                                            <div className={`shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center mt-0.5 ${getBgColor(notification.type)}`}>
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h4 className={`text-sm font-bold truncate ${!notification.read ? 'text-white' : 'text-slate-300'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    <span className="shrink-0 text-[10px] text-slate-500 whitespace-nowrap">
                                                        {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: id })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                                    {notification.message}
                                                </p>
                                                
                                                <div className="flex items-center gap-3 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!notification.read && (
                                                        <button 
                                                            onClick={() => markRead(notification.id)}
                                                            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider"
                                                        >
                                                            Mark as Read
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => removeNotification(notification.id)}
                                                        className="text-[10px] font-bold text-slate-500 hover:text-rose-400 uppercase tracking-wider ml-auto flex items-center gap-1"
                                                    >
                                                        <Trash2 size={10} />
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-5 py-3 border-t border-white/5 bg-[#12141A] shrink-0 text-center">
                            <button 
                                onClick={clearAll}
                                className="text-[10px] font-bold text-slate-500 hover:text-rose-400 transition-colors uppercase tracking-widest"
                            >
                                Clear All Notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
