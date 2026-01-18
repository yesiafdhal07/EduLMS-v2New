'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';
import { supabase } from '@/lib/supabase';
import { Loader2, RefreshCw, MapPin, Users, StopCircle } from 'lucide-react';
import { toast } from 'sonner';

interface QRGeneratorProps {
    sessionId: string;
    initialToken?: string;
}

export function QRGenerator({ sessionId, initialToken }: QRGeneratorProps) {
    const [token, setToken] = useState<string>(initialToken || '');
    const [timeLeft, setTimeLeft] = useState(10);
    const [attendeesCount, setAttendeesCount] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Initial random token if none provided
    useEffect(() => {
        if (!token) generateNewToken();
    }, []);

    // Token regeneration loop
    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    generateNewToken();
                    return 10; // Reset timer
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    // Subscribe to attendance count changes
    useEffect(() => {
        const channel = supabase
            .channel('public:attendance_records')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'attendance_records',
                    filter: `session_id=eq.${sessionId}`,
                },
                (payload) => {
                    setAttendeesCount((prev) => prev + 1);
                    toast.success('Seseorang berhasil absen!');
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId]);

    const generateNewToken = async () => {
        const newToken = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        setToken(newToken);

        // Update DB with new active token
        // Use a simple update call. No need to await strictly for UI update, optimistic is fine
        // but for security we want it effectively immediately.
        try {
            await supabase
                .from('attendance_sessions')
                .update({ active_token: newToken })
                .eq('id', sessionId);
        } catch (err) {
            console.error('Failed to update token', err);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-xl max-w-md mx-auto border border-slate-100">
            <div className="mb-6 text-center">
                <h3 className="text-2xl font-black text-slate-800 mb-2">Scan Absensi</h3>
                <p className="text-slate-500 text-sm">QR Code berubah setiap 10 detik. Jangan difoto.</p>
            </div>

            <div className="p-4 bg-white border-4 border-slate-900 rounded-2xl shadow-2xl mb-8 relative group">
                {token ? (
                    <QRCode
                        value={token}
                        size={256}
                        viewBox={`0 0 256 256`}
                        key={token} // Force re-render animation
                        className="animate-in fade-in zoom-in duration-300"
                    />
                ) : (
                    <div className="w-64 h-64 flex items-center justify-center bg-slate-100 rounded-xl">
                        <Loader2 className="animate-spin text-slate-400" size={32} />
                    </div>
                )}

                {/* Timer Bar */}
                <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-1000 ease-linear"
                    style={{ width: `${(timeLeft / 10) * 100}%` }}
                />
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex flex-col items-center">
                    <RefreshCw size={20} className={`text-indigo-500 mb-2 ${timeLeft <= 2 ? 'animate-spin' : ''}`} />
                    <span className="text-2xl font-black text-indigo-600">{timeLeft}s</span>
                    <span className="text-xs text-indigo-400 font-bold uppercase">Refresh</span>
                </div>

                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex flex-col items-center relative overflow-hidden">
                    <Users size={20} className="text-emerald-500 mb-2" />
                    <span className="text-2xl font-black text-emerald-600">{attendeesCount}</span>
                    <span className="text-xs text-emerald-400 font-bold uppercase">Hadir</span>

                    {/* Ripple effect when count increases? (Handled by global toast for now) */}
                </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-slate-400 text-xs font-medium bg-slate-100 px-4 py-2 rounded-full">
                <MapPin size={12} />
                <span>Lokasi Sesi Terecord (Aman)</span>
            </div>
        </div>
    );
}
