'use client';

import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { RefreshCw, Clock, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface QRGeneratorProps {
    attendanceId: string;
    className: string;
    onExpire?: () => void;
}

export function QRGenerator({ attendanceId, className, onExpire }: QRGeneratorProps) {
    const [qrCode, setQrCode] = useState('');
    const [expiresAt, setExpiresAt] = useState<Date | null>(null);
    const [countdown, setCountdown] = useState(30);
    const [saving, setSaving] = useState(false);

    const generateCode = useCallback(async () => {
        // Generate unique code with timestamp for security
        const timestamp = Date.now();
        const randomPart = Math.random().toString(36).substring(2, 8);
        const token = `ATTEND:${attendanceId}:${timestamp}:${randomPart}`;

        setSaving(true);

        // CRITICAL FIX: Save token to database so verify_qr_attendance can find it
        const { error } = await supabase
            .from('attendance')
            .update({ active_token: token })
            .eq('id', attendanceId);

        if (error) {
            console.error('Failed to save QR token:', error);
            // Still show QR but it won't work for verification
        }

        setQrCode(token);
        setExpiresAt(new Date(timestamp + 30000)); // 30 seconds
        setCountdown(30);
        setSaving(false);
    }, [attendanceId]);

    useEffect(() => {
        generateCode();

        // Auto-refresh every 30 seconds
        const refreshInterval = setInterval(() => {
            generateCode();
        }, 30000);

        return () => clearInterval(refreshInterval);
    }, [generateCode]);

    useEffect(() => {
        // Countdown timer
        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdownInterval);
    }, []);

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-8 text-center max-w-md mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-xl font-black text-slate-900">{className}</h3>
                <p className="text-slate-400 text-sm">Scan untuk absensi</p>
            </div>

            {/* QR Code */}
            <div className="bg-white p-6 rounded-2xl border-4 border-indigo-100 inline-block mb-6">
                <QRCodeSVG
                    value={qrCode}
                    size={200}
                    level="H"
                    includeMargin={false}
                    bgColor="white"
                    fgColor="#1e293b"
                />
            </div>

            {/* Countdown */}
            <div className="flex items-center justify-center gap-3 mb-6">
                <Clock size={18} className="text-amber-500" />
                <div className="flex items-center gap-2">
                    <span className="text-slate-600 text-sm">Kode berubah dalam</span>
                    <span className={`font-black text-lg ${countdown <= 5 ? 'text-rose-600' : 'text-indigo-600'}`}>
                        {countdown}s
                    </span>
                </div>
            </div>

            {/* Security Badge */}
            <div className="bg-emerald-50 rounded-xl p-4 flex items-center gap-3">
                <Shield size={20} className="text-emerald-600" />
                <div className="text-left">
                    <p className="text-emerald-800 font-bold text-sm">Kode Aman</p>
                    <p className="text-emerald-600 text-xs">QR berubah otomatis setiap 30 detik untuk mencegah kecurangan</p>
                </div>
            </div>

            {/* Manual Refresh */}
            <button
                type="button"
                onClick={generateCode}
                className="mt-4 flex items-center gap-2 mx-auto text-sm text-slate-500 hover:text-indigo-600 transition-colors"
            >
                <RefreshCw size={14} />
                Refresh Manual
            </button>
        </div>
    );
}
