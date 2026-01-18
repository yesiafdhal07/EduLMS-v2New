'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, X, Check, CheckCheck, FileText, Award, Clock, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface Notification {
    id: string;
    type: 'assignment' | 'grade' | 'deadline' | 'submission' | 'attendance';
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    link?: string;
}

interface NotificationBellProps {
    userId: string;
}

const NOTIFICATION_ICONS = {
    assignment: FileText,
    grade: Award,
    deadline: Clock,
    submission: CheckCheck,
    attendance: Users,
};

const NOTIFICATION_COLORS = {
    assignment: 'bg-indigo-100 text-indigo-600',
    grade: 'bg-emerald-100 text-emerald-600',
    deadline: 'bg-amber-100 text-amber-600',
    submission: 'bg-blue-100 text-blue-600',
    attendance: 'bg-purple-100 text-purple-600',
};

export function NotificationBell({ userId }: NotificationBellProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (data) {
            setNotifications(data as Notification[]);
            setUnreadCount(data.filter(n => !n.is_read).length);
        }
    }, [userId]);

    useEffect(() => {
        fetchNotifications();

        // Subscribe to real-time notifications
        const channel = supabase
            .channel(`notifications_${userId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                setNotifications(prev => [payload.new as Notification, ...prev]);
                setUnreadCount(prev => prev + 1);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, fetchNotifications]);

    const markAsRead = async (id: string) => {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = async () => {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-sm hover:shadow-md hover:bg-white/10 transition-all group"
                aria-label="Notifikasi"
            >
                <Bell size={20} className="text-white group-hover:text-indigo-300" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-rose-500/40">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    ></div>
                    <div className="absolute right-0 top-14 w-96 bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                            <h3 className="font-bold text-white">Notifikasi</h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={markAllAsRead}
                                        className="text-xs text-indigo-400 font-medium hover:text-indigo-300 hover:underline"
                                    >
                                        Tandai semua dibaca
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Push Notification Banner */}
                        {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && (
                            <div className="p-3 bg-indigo-500/20 border-b border-white/10">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-indigo-300">Aktifkan notifikasi push?</p>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            const permission = await Notification.requestPermission();
                                            if (permission === 'granted') {
                                                // In production, you would call requestNotificationPermission() from firebase.ts
                                                // and save the token to the user's profile
                                                alert('Push notification diaktifkan! (Token perlu disimpan ke database)');
                                            }
                                        }}
                                        className="text-xs bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-lg font-bold transition-colors"
                                    >
                                        Aktifkan
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">
                                    <Bell size={32} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">Belum ada notifikasi</p>
                                </div>
                            ) : (
                                notifications.map(notification => {
                                    const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
                                    const colorClass = NOTIFICATION_COLORS[notification.type] || 'bg-slate-800 text-slate-300';

                                    // Adjust color classes for dark mode visibility if needed, or keep them if they look okay on dark
                                    // Let's make them slightly transparent for better blend

                                    return (
                                        <div
                                            key={notification.id}
                                            className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${!notification.is_read ? 'bg-indigo-500/10' : ''
                                                }`}
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass} bg-opacity-20`}>
                                                    <Icon size={18} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-white truncate">
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {formatDistanceToNow(new Date(notification.created_at), {
                                                            locale: id,
                                                            addSuffix: true
                                                        })}
                                                    </p>
                                                </div>
                                                {!notification.is_read && (
                                                    <div className="w-2 h-2 bg-indigo-400 rounded-full shrink-0 mt-2 shadow-[0_0_8px_rgba(129,140,248,0.6)]"></div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
