'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CheckCircle, XCircle, MapPin, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logError } from '@/lib/error-handler';
import { useToast } from '@/components/ui';

interface QRScannerProps {
    studentId: string;
    onSuccess?: () => void;
    schoolLocation?: { lat: number; lng: number };
    maxRadiusMeters?: number;
}

export function QRScanner({
    studentId,
    onSuccess,
    schoolLocation,
    maxRadiusMeters = 100
}: QRScannerProps) {
    const toast = useToast();
    const [scanning, setScanning] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [location, setLocation] = useState<GeolocationPosition | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Get user location
    useEffect(() => {
        if (schoolLocation && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation(pos),
                (err) => setLocationError('Izinkan akses lokasi untuk absensi'),
                { enableHighAccuracy: true }
            );
        }
    }, [schoolLocation]);

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    const startScanning = async () => {
        if (!containerRef.current) return;

        try {
            scannerRef.current = new Html5Qrcode('qr-reader');
            setScanning(true);
            setStatus('scanning');

            await scannerRef.current.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                handleScanSuccess,
                () => { } // Ignore errors during scanning
            );
        } catch (error) {
            logError(error, 'QRScanner.startScanning');
            setStatus('error');
            setMessage('Gagal mengakses kamera');
        }
    };

    const stopScanning = async () => {
        if (scannerRef.current?.isScanning) {
            await scannerRef.current.stop();
        }
        setScanning(false);
    };

    const handleScanSuccess = async (decodedText: string) => {
        await stopScanning();
        setVerifying(true);

        try {
            // Parse QR code: ATTEND:attendanceId:timestamp:random
            const parts = decodedText.split(':');
            if (parts.length !== 4 || parts[0] !== 'ATTEND') {
                throw new Error('Kode QR tidak valid');
            }

            const [, attendanceId, timestamp] = parts;
            const codeTime = parseInt(timestamp);
            const now = Date.now();

            // Check if code expired (30 seconds + 5 second buffer)
            if (now - codeTime > 35000) {
                throw new Error('Kode QR sudah kedaluwarsa. Minta guru refresh kode.');
            }

            // Check location if required
            if (schoolLocation && location) {
                const distance = calculateDistance(
                    location.coords.latitude,
                    location.coords.longitude,
                    schoolLocation.lat,
                    schoolLocation.lng
                );

                if (distance > maxRadiusMeters) {
                    throw new Error(`Kamu terlalu jauh dari sekolah (${Math.round(distance)}m). Maksimal ${maxRadiusMeters}m.`);
                }
            }

            // Submit attendance
            const { error } = await supabase
                .from('attendance_records')
                .upsert({
                    attendance_id: attendanceId,
                    student_id: studentId,
                    status: 'hadir',
                    checked_in_at: new Date().toISOString(),
                    location_lat: location?.coords.latitude,
                    location_lng: location?.coords.longitude
                }, {
                    onConflict: 'attendance_id,student_id'
                });

            if (error) throw error;

            setStatus('success');
            setMessage('Absensi berhasil dicatat!');
            toast.success('Kamu sudah absen hari ini!');
            onSuccess?.();

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Gagal memproses absensi';
            setStatus('error');
            setMessage(errorMessage);
            toast.error(errorMessage);
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 max-w-md mx-auto">
            {/* Location Warning */}
            {locationError && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                    <AlertTriangle size={20} className="text-amber-600" />
                    <p className="text-amber-700 text-sm">{locationError}</p>
                </div>
            )}

            {/* Scanner Container */}
            <div className="relative mb-6">
                {status === 'idle' && (
                    <div className="bg-slate-100 rounded-2xl h-64 flex flex-col items-center justify-center">
                        <Camera size={48} className="text-slate-400 mb-4" />
                        <p className="text-slate-500 text-sm">Klik tombol untuk mulai scan</p>
                    </div>
                )}

                {status === 'scanning' && (
                    <div id="qr-reader" ref={containerRef} className="rounded-2xl overflow-hidden h-64"></div>
                )}

                {status === 'success' && (
                    <div className="bg-emerald-50 rounded-2xl h-64 flex flex-col items-center justify-center">
                        <CheckCircle size={64} className="text-emerald-500 mb-4" />
                        <p className="text-emerald-700 font-bold text-lg">Berhasil!</p>
                        <p className="text-emerald-600 text-sm">{message}</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="bg-rose-50 rounded-2xl h-64 flex flex-col items-center justify-center p-6">
                        <XCircle size={64} className="text-rose-500 mb-4" />
                        <p className="text-rose-700 font-bold text-lg">Gagal</p>
                        <p className="text-rose-600 text-sm text-center">{message}</p>
                    </div>
                )}

                {verifying && (
                    <div className="absolute inset-0 bg-white/90 rounded-2xl flex flex-col items-center justify-center">
                        <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
                        <p className="text-slate-600 font-medium">Memverifikasi...</p>
                    </div>
                )}
            </div>

            {/* Location Status */}
            {location && schoolLocation && (
                <div className="bg-emerald-50 rounded-xl p-3 mb-6 flex items-center gap-2">
                    <MapPin size={16} className="text-emerald-600" />
                    <span className="text-emerald-700 text-sm">Lokasi terverifikasi</span>
                </div>
            )}

            {/* Action Button */}
            {status === 'idle' && (
                <button
                    type="button"
                    onClick={startScanning}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all"
                >
                    <Camera size={20} />
                    Mulai Scan QR
                </button>
            )}

            {status === 'scanning' && (
                <button
                    type="button"
                    onClick={stopScanning}
                    className="w-full py-4 bg-slate-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-700 transition-all"
                >
                    <XCircle size={20} />
                    Batal
                </button>
            )}

            {(status === 'success' || status === 'error') && (
                <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-200 transition-all"
                >
                    Scan Ulang
                </button>
            )}
        </div>
    );
}
