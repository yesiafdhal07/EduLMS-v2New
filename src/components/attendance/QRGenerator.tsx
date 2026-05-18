'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
    MapPin, RefreshCw, Clock, ShieldCheck, 
    AlertCircle, Users, CheckCircle2 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface QRGeneratorProps {
    sessionId: string;
    classId: string;
}

export function QRGenerator({ sessionId, classId }: QRGeneratorProps) {
    const [token, setToken] = useState('');
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [studentCount, setStudentCount] = useState(0);

    useEffect(() => {
        setupSession();
        const interval = setInterval(rotateToken, 30000);
        const timer = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 30), 1000);
        
        // Listen for new records
        const channel = supabase
            .channel(`attendance_${sessionId}`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'attendance_records',
                filter: `attendance_id=eq.${sessionId}`
            }, () => {
                setStudentCount(c => c + 1);
            })
            .subscribe();

        return () => {
            clearInterval(interval);
            clearInterval(timer);
            supabase.removeChannel(channel);
        };
    }, []);

    const setupSession = async () => {
        // Get Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setLocation(loc);
                    rotateToken(loc);
                },
                (err) => {
                    toast.error("Gagal mendapatkan lokasi. Geo-fencing dinonaktifkan.");
                    rotateToken();
                }
            );
        } else {
            rotateToken();
        }

        // Initial count
        const { count } = await supabase
            .from('attendance_records')
            .select('*', { count: 'exact', head: true })
            .eq('attendance_id', sessionId);
        setStudentCount(count || 0);
    };

    const rotateToken = async (loc = location) => {
        const newToken = Math.random().toString(36).substring(2, 15);
        setToken(newToken);
        setTimeLeft(30);

        await supabase
            .from('attendance_sessions')
            .update({ 
                active_token: newToken,
                location_lat: loc?.lat,
                location_long: loc?.lng,
                type: 'qr_code',
                is_open: true
            })
            .eq('id', sessionId);
    };

    return (
        <div className="flex flex-col items-center gap-8 p-10 bg-white/[0.03] border border-white/10 rounded-[3rem] backdrop-blur-xl relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 blur-[100px] pointer-events-none" />
            
            <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-violet-400">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">High-Security Attendance</span>
                </div>
                <h3 className="text-3xl font-black text-white font-fraunces">Pindai Presensi</h3>
                <p className="text-slate-500 text-sm font-medium">Buka menu Absensi di aplikasi Klolakelas Siswa</p>
            </div>

            <div className="relative group">
                {/* QR Container */}
                <div className="p-8 bg-white rounded-[2.5rem] shadow-2xl shadow-violet-600/20 group-hover:scale-[1.02] transition-transform duration-500">
                    {token ? (
                        <QRCodeSVG 
                            value={JSON.stringify({ s: sessionId, t: token, c: classId })} 
                            size={240}
                            level="H"
                            includeMargin={false}
                        />
                    ) : (
                        <div className="w-[240px] h-[240px] flex items-center justify-center">
                            <RefreshCw className="animate-spin text-slate-200" size={48} />
                        </div>
                    )}
                </div>
                
                {/* Timer Overlay */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-violet-600 text-white px-4 py-2 rounded-full text-[10px] font-black shadow-lg flex items-center gap-2">
                    <Clock size={12} />
                    REFRESH DALAM {timeLeft}S
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase">Tercatat</p>
                    <div className="flex items-center gap-2">
                        <Users size={16} className="text-violet-400" />
                        <span className="text-xl font-black text-white">{studentCount}</span>
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase">Status Lokasi</p>
                    <div className="flex items-center gap-2">
                        {location ? (
                            <>
                                <MapPin size={16} className="text-emerald-400" />
                                <span className="text-xs font-bold text-emerald-400">AKTIF</span>
                            </>
                        ) : (
                            <>
                                <AlertCircle size={16} className="text-amber-400" />
                                <span className="text-xs font-bold text-amber-400">PASIF</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <button 
                onClick={() => rotateToken()}
                className="text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest flex items-center gap-2"
            >
                <RefreshCw size={12} />
                Refresh Manual
            </button>
        </div>
    );
}
