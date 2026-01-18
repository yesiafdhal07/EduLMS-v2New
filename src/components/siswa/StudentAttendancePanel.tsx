import { useState } from 'react';
import { MapPin, XCircle, CheckCircle, CheckSquare, QrCode } from 'lucide-react';
import { AttendanceSession, AttendanceRecord } from '@/types';
import { QRScanner } from './attendance/QRScanner';

interface StudentAttendancePanelProps {
    attendanceSession: AttendanceSession | null;
    attendanceRecord: AttendanceRecord | null;
    onCheckIn: () => void;
    studentId?: string;
}

export function StudentAttendancePanel({ attendanceSession, attendanceRecord, onCheckIn, studentId }: StudentAttendancePanelProps) {
    const [showScanner, setShowScanner] = useState(false);

    const handleQRSuccess = () => {
        // Refresh page or trigger callback
        window.location.reload(); // Simple refresh to fetch new status
    };

    if (showScanner && attendanceSession && studentId) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="max-w-xl mx-auto space-y-4 text-center">
                    <h3 className="text-2xl font-black text-white mb-4">Scan QR Code</h3>
                    <QRScanner
                        session={attendanceSession}
                        studentId={studentId}
                        onSuccess={handleQRSuccess}
                    />
                    <button
                        onClick={() => setShowScanner(false)}
                        className="text-slate-400 hover:text-white font-bold"
                    >
                        Batalkan Scan
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 p-16 text-center max-w-xl mx-auto">
                {/* Status Icon */}
                <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl ${attendanceRecord
                    ? 'bg-emerald-500 text-white shadow-emerald-200'
                    : (attendanceSession?.is_open
                        ? 'bg-emerald-500 text-white animate-pulse shadow-emerald-200'
                        : 'bg-slate-200 text-slate-400 shadow-slate-100')
                    }`}>
                    {attendanceRecord ? <CheckCircle size={64} /> : (attendanceSession?.is_open ? <MapPin size={64} /> : <XCircle size={64} />)}
                </div>

                {/* Status Text */}
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">
                    {attendanceRecord ? 'Kehadiran Tercatat ✓' : (attendanceSession?.is_open ? 'Sesi Absensi Terbuka' : 'Sesi Belum Dibuka')}
                </h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed mb-10">
                    {attendanceRecord
                        ? `Kehadiran Anda telah dicatat pada pukul ${new Date(attendanceRecord.recorded_at || Date.now()).toLocaleTimeString('id-ID')}`
                        : (attendanceSession?.is_open
                            ? (attendanceSession.type === 'qr_code'
                                ? 'Guru menggunakan sistem QR Code. Silakan scan QR yang ditampilkan di depan kelas.'
                                : 'Silakan tekan tombol di bawah untuk memberikan tanda hadir hari ini.')
                            : 'Sesi absen belum dibuka oleh Guru. Mohon tunggu informasi lebih lanjut.')}
                </p>

                {/* Action Button */}
                {attendanceSession?.is_open && !attendanceRecord && (
                    <>
                        {attendanceSession.type === 'qr_code' ? (
                            <button
                                onClick={() => setShowScanner(true)}
                                className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-lg shadow-2xl shadow-indigo-300 transform active:scale-95 transition-all hover:bg-indigo-700 uppercase tracking-widest flex items-center justify-center gap-3"
                            >
                                <QrCode size={24} />
                                Scan QR Code
                            </button>
                        ) : (
                            <button
                                onClick={onCheckIn}
                                className="w-full bg-emerald-500 text-white py-6 rounded-[2rem] font-black text-lg shadow-2xl shadow-emerald-200 transform active:scale-95 transition-all hover:bg-emerald-600 uppercase tracking-widest"
                            >
                                Hadir Sekarang
                            </button>
                        )}
                    </>
                )}

                {/* Already Checked In Status */}
                {attendanceRecord && (
                    <div className="flex items-center justify-center gap-3 text-emerald-600 font-black tracking-[0.2em] uppercase text-xs bg-emerald-50 py-4 rounded-2xl">
                        <CheckSquare size={18} />
                        Status: Sudah Absen
                    </div>
                )}
            </div>
        </div>
    );
}
