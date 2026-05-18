'use client';

import { useState, useCallback } from 'react';
import { MapPin, Shield, ShieldCheck, ShieldAlert, Loader2, Navigation } from 'lucide-react';

// ============================================================
// GPS LOCATION VALIDATOR — USP #17
// Validates student's geolocation against school coordinates.
// Used inside AttendancePanel — wraps the existing QR check-in
// with an optional GPS radius check (configurable per school).
// ============================================================

export interface GpsValidationResult {
    valid: boolean;
    distance: number; // meters
    message: string;
}

// Haversine formula — distance in meters
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface GpsAttendanceValidatorProps {
    schoolLat: number;
    schoolLon: number;
    radiusMeters?: number;      // default 200m
    onValidated: (result: GpsValidationResult) => void;
    onSkip?: () => void;        // allow bypass for remote/online classes
}

type GpsState = 'idle' | 'checking' | 'valid' | 'invalid' | 'denied' | 'unavailable';

export function GpsAttendanceValidator({
    schoolLat,
    schoolLon,
    radiusMeters = 200,
    onValidated,
    onSkip,
}: GpsAttendanceValidatorProps) {
    const [state, setState] = useState<GpsState>('idle');
    const [distance, setDistance] = useState<number | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleCheck = useCallback(() => {
        if (!navigator.geolocation) {
            setState('unavailable');
            return;
        }

        setState('checking');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const d = haversine(
                    pos.coords.latitude, pos.coords.longitude,
                    schoolLat, schoolLon
                );
                setDistance(Math.round(d));

                const valid = d <= radiusMeters;
                const result: GpsValidationResult = {
                    valid,
                    distance: Math.round(d),
                    message: valid
                        ? `Lokasi terverifikasi — ${Math.round(d)}m dari sekolah`
                        : `Di luar jangkauan — ${Math.round(d)}m dari sekolah (maks ${radiusMeters}m)`,
                };

                setState(valid ? 'valid' : 'invalid');
                onValidated(result);
            },
            (err) => {
                if (err.code === err.PERMISSION_DENIED) {
                    setState('denied');
                    setErrorMsg('Akses lokasi ditolak. Aktifkan GPS di pengaturan browser.');
                } else {
                    setState('unavailable');
                    setErrorMsg('GPS tidak tersedia. Coba lagi atau hubungi guru.');
                }
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
    }, [schoolLat, schoolLon, radiusMeters, onValidated]);

    const stateConfig: Record<GpsState, {
        icon: React.ReactNode;
        bg: string;
        text: string;
        label: string;
    }> = {
        idle: {
            icon: <MapPin size={20} className="text-slate-400" />,
            bg: 'bg-white/5 border-white/10',
            text: 'text-slate-400',
            label: 'Verifikasi Lokasi GPS',
        },
        checking: {
            icon: <Loader2 size={20} className="animate-spin text-sky-400" />,
            bg: 'bg-sky-500/10 border-sky-500/20',
            text: 'text-sky-400',
            label: 'Memeriksa lokasi...',
        },
        valid: {
            icon: <ShieldCheck size={20} className="text-emerald-400" />,
            bg: 'bg-emerald-500/10 border-emerald-500/20',
            text: 'text-emerald-400',
            label: distance !== null ? `✓ Lokasi Valid · ${distance}m` : '✓ Lokasi Valid',
        },
        invalid: {
            icon: <ShieldAlert size={20} className="text-rose-400" />,
            bg: 'bg-rose-500/10 border-rose-500/20',
            text: 'text-rose-400',
            label: distance !== null ? `✗ Di luar sekolah · ${distance}m` : '✗ Di luar sekolah',
        },
        denied: {
            icon: <ShieldAlert size={20} className="text-amber-400" />,
            bg: 'bg-amber-500/10 border-amber-500/20',
            text: 'text-amber-400',
            label: 'GPS ditolak',
        },
        unavailable: {
            icon: <ShieldAlert size={20} className="text-slate-400" />,
            bg: 'bg-white/5 border-white/10',
            text: 'text-slate-400',
            label: 'GPS tidak tersedia',
        },
    };

    const cfg = stateConfig[state];

    return (
        <div className={`border rounded-xl p-4 space-y-3 transition-all duration-300 ${cfg.bg}`}>
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    {cfg.icon}
                    <div>
                        <p className={`text-sm font-black ${cfg.text}`}>{cfg.label}</p>
                        {errorMsg && <p className="text-xs text-slate-500 mt-0.5">{errorMsg}</p>}
                        {state === 'idle' && (
                            <p className="text-xs text-slate-500 mt-0.5">Radius validasi: {radiusMeters}m dari sekolah</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {(state === 'idle' || state === 'invalid' || state === 'denied' || state === 'unavailable') && (
                        <button
                            onClick={handleCheck}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 rounded-lg text-xs font-black text-white transition-all"
                        >
                            <Navigation size={11} />
                            {state === 'idle' ? 'Cek GPS' : 'Coba Lagi'}
                        </button>
                    )}

                    {onSkip && state !== 'valid' && (
                        <button
                            onClick={onSkip}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-slate-500 transition-all"
                        >
                            Lewati
                        </button>
                    )}
                </div>
            </div>

            {/* Progress bar for checking */}
            {state === 'checking' && (
                <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
            )}
        </div>
    );
}

// ─── Hook for programmatic GPS validation ────────────────────
export function useGpsValidator(schoolLat: number, schoolLon: number, radiusMeters = 200) {
    const validate = useCallback((): Promise<GpsValidationResult> => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve({ valid: false, distance: -1, message: 'GPS tidak didukung browser ini' });
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const d = haversine(pos.coords.latitude, pos.coords.longitude, schoolLat, schoolLon);
                    const valid = d <= radiusMeters;
                    resolve({
                        valid,
                        distance: Math.round(d),
                        message: valid
                            ? `Lokasi valid (${Math.round(d)}m)`
                            : `Di luar radius (${Math.round(d)}m > ${radiusMeters}m)`,
                    });
                },
                () => resolve({ valid: false, distance: -1, message: 'GPS error' }),
                { enableHighAccuracy: true, timeout: 8000 }
            );
        });
    }, [schoolLat, schoolLon, radiusMeters]);

    return { validate };
}
