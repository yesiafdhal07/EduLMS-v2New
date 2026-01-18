'use client';

import { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, Camera, MapPin, CheckCircle, XCircle } from 'lucide-react';
import type { AttendanceSession } from '@/types';

interface QRScannerProps {
    session: AttendanceSession;
    studentId: string;
    onSuccess: () => void;
}

export function QRScanner({ session, studentId, onSuccess }: QRScannerProps) {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleScan = async (result: any, error: any) => {
        if (result) {
            // Robustly extract text from various zxing result formats
            // react-qr-reader v3 often returns an object with getText() or text property
            const token = result?.getText?.() || result?.text || (typeof result === 'string' ? result : null);

            if (token && !scanResult && !loading) {
                setScanResult(token);
                verifyAttendance(token);
            }
        }

        // Optional: Log errors if needed (usually just "No QR code found")
        // if (error) console.debug(error);
    };

    const verifyAttendance = async (token: string) => {
        setLoading(true);
        setError(null);
        toast.info('Memverifikasi lokasi & token...');

        if (!navigator.geolocation) {
            toast.error('Browser Anda tidak mendukung Geolocation.');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const { data, error: rpcError } = await supabase.rpc('verify_qr_attendance', {
                        p_student_id: studentId,
                        p_session_id: session.id,
                        p_scanned_token: token,
                        p_lat: latitude,
                        p_long: longitude,
                    });

                    if (rpcError) throw rpcError;

                    if (data.success) {
                        toast.success(data.message);
                        onSuccess();
                    } else {
                        setError(data.message);
                        toast.error(data.message);
                        setScanResult(null); // Reset to allow retry
                    }
                } catch (err: any) {
                    toast.error(err.message || 'Gagal memverifikasi absensi.');
                    setScanResult(null);
                } finally {
                    setLoading(false);
                }
            },
            (geoError) => {
                console.error(geoError);
                toast.error('Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin diberikan.');
                setLoading(false);
                setScanResult(null);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm bg-black rounded-3xl overflow-hidden border-4 border-indigo-500/30 relative shadow-2xl">
                {!loading ? (
                    <QrReader
                        onResult={handleScan}
                        constraints={{ facingMode: 'environment' }}
                        scanDelay={500}
                        className="w-full h-full object-cover"
                        containerStyle={{ width: '100%', height: '100%' }}
                    />
                ) : (
                    <div className="aspect-square flex flex-col items-center justify-center bg-slate-900 text-white">
                        <Loader2 size={48} className="animate-spin text-indigo-400 mb-4" />
                        <p className="font-bold animate-pulse">Memverifikasi...</p>
                    </div>
                )}

                {/* Overlay UI */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
                    <div className="flex justify-between items-start">
                        <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2">
                            <Camera size={16} className="text-white" />
                            <span className="text-xs font-bold text-white">Scanner Aktif</span>
                        </div>
                        <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2">
                            <MapPin size={16} className={loading ? 'text-amber-400 animate-bounce' : 'text-emerald-400'} />
                            <span className="text-xs font-bold text-white">GPS</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="inline-block bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                            <p className="text-xs text-slate-300">Arahkan kamera ke QR Code Guru</p>
                        </div>
                    </div>
                </div>

                {/* Scan Line Animation */}
                {!loading && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,1)] animate-[scan_2s_ease-in-out_infinite]" />
                )}
            </div>

            {error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-200 max-w-sm animate-in fade-in slide-in-from-bottom-5">
                    <XCircle size={24} className="shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <style jsx global>{`
                @keyframes scan {
                    0% { top: 0; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>
        </div>
    );
}
