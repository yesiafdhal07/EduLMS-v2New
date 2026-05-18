'use client';

import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
    Camera, MapPin, ShieldCheck, 
    AlertCircle, CheckCircle2, Loader2, XCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface QRScannerProps {
    studentId: string;
    onSuccess?: () => void;
}

export function QRScanner({ studentId, onSuccess }: QRScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        if (isScanning) {
            const scanner = new Html5QrcodeScanner(
                "reader", 
                { fps: 10, qrbox: { width: 250, height: 250 } }, 
                /* verbose= */ false
            );

            scanner.render(onScanSuccess, onScanError);

            return () => {
                scanner.clear().catch(error => console.error("Failed to clear scanner", error));
            };
        }
    }, [isScanning]);

    async function onScanSuccess(decodedText: string) {
        setIsScanning(false);
        setIsProcessing(true);
        
        try {
            const data = JSON.parse(decodedText);
            const { s: sessionId, t: token } = data;

            // 1. Verify Session & Token
            const { data: session, error: sError } = await supabase
                .from('attendance_sessions')
                .select('*')
                .eq('id', sessionId)
                .single();
            
            if (sError || !session || !session.is_open) throw new Error("Sesi absensi tidak ditemukan atau sudah tutup.");
            if (session.active_token !== token) throw new Error("Kode QR sudah kadaluwarsa. Silakan pindai ulang.");

            // 2. Verify Location (Geo-fencing)
            let userLoc = null;
            if (session.location_lat && session.location_long) {
                userLoc = await getCurrentLocation();
                const dist = calculateDistance(
                    userLoc.lat, userLoc.lng,
                    session.location_lat, session.location_long
                );
                
                if (dist > (session.radius_meters || 100)) {
                    throw new Error(`Anda berada di luar jangkauan sekolah (${Math.round(dist)}m).`);
                }
            }

            // 3. Submit Record
            const { error: rError } = await supabase
                .from('attendance_records')
                .insert({
                    attendance_id: sessionId,
                    student_id: studentId,
                    status: 'hadir',
                    method: 'qr_code',
                    verification_lat: userLoc?.lat,
                    verification_long: userLoc?.lng
                });
            
            if (rError) {
                if (rError.code === '23505') throw new Error("Anda sudah tercatat hadir di sesi ini.");
                throw rError;
            }

            setScanStatus('success');
            toast.success("Presensi Berhasil!");
            if (onSuccess) onSuccess();

        } catch (error: any) {
            console.error("Scan Error:", error);
            setScanStatus('error');
            toast.error(error.message || "Gagal melakukan presensi.");
        } finally {
            setIsProcessing(false);
        }
    }

    function onScanError(err: any) {
        // Silently ignore camera scan errors (common during focus)
    }

    const getCurrentLocation = (): Promise<{ lat: number, lng: number }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) reject(new Error("Browser tidak mendukung geolokasi."));
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => reject(new Error("Gagal mendapatkan lokasi. Pastikan izin lokasi aktif."))
            );
        });
    };

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI/180;
        const φ2 = lat2 * Math.PI/180;
        const Δφ = (lat2-lat1) * Math.PI/180;
        const Δλ = (lon2-lon1) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c; // in metres
    };

    return (
        <div className="w-full max-w-md mx-auto space-y-6">
            {!isScanning && scanStatus === 'idle' && (
                <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 text-center space-y-6">
                    <div className="w-20 h-20 rounded-[2rem] bg-violet-600/10 flex items-center justify-center text-violet-400 mx-auto border border-violet-600/20 shadow-xl shadow-violet-600/5">
                        <Camera size={40} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-white">Presensi Digital</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            Arahkan kamera ke kode QR yang ditampilkan di layar guru Anda.
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsScanning(true)}
                        className="w-full py-4 bg-violet-600 text-white font-black rounded-2xl shadow-xl shadow-violet-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        MULAI SCAN SEKARANG
                    </button>
                </div>
            )}

            {isScanning && (
                <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-violet-600/30">
                    <div id="reader" className="w-full" />
                    <button 
                        onClick={() => setIsScanning(false)}
                        className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-rose-500 transition-colors"
                    >
                        <XCircle size={24} />
                    </button>
                </div>
            )}

            {isProcessing && (
                <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-12 flex flex-col items-center justify-center space-y-4">
                    <Loader2 size={48} className="animate-spin text-violet-500" />
                    <p className="text-sm font-black text-white uppercase tracking-widest">Memproses Presensi...</p>
                </div>
            )}

            {scanStatus === 'success' && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] p-10 text-center space-y-4 animate-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/20">
                        <CheckCircle2 size={32} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-xl font-bold text-white">Hadir Tercatat!</h4>
                        <p className="text-emerald-400/70 text-sm font-medium">Data Anda telah dikirim ke sistem sekolah.</p>
                    </div>
                    <button 
                        onClick={() => setScanStatus('idle')}
                        className="px-6 py-2 bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest rounded-xl"
                    >
                        SELESAI
                    </button>
                </div>
            )}

            {scanStatus === 'error' && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-[2.5rem] p-10 text-center space-y-4 animate-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-rose-500/20">
                        <AlertCircle size={32} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-xl font-bold text-white">Gagal Absen</h4>
                        <p className="text-rose-400/70 text-sm font-medium">Terjadi kendala saat memproses data.</p>
                    </div>
                    <button 
                        onClick={() => setScanStatus('idle')}
                        className="px-6 py-2 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-rose-600/20"
                    >
                        COBA LAGI
                    </button>
                </div>
            )}
        </div>
    );
}
