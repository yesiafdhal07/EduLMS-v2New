import { BarChart3, AlertCircle, CheckCircle2, Loader2, QrCode, MousePointerClick } from 'lucide-react';
import { AttendanceStat } from '@/components/ui';
import { ClassData, AttendanceLogs, AttendanceSession } from '@/types';
import { QRGenerator } from './attendance/QRGenerator';
import { AttendanceExport } from './AttendanceExport';

interface AttendancePanelProps {
    attendanceSession: AttendanceSession | null;
    selectedClassId: string | null;
    classes: ClassData[];
    onToggleSession: (type?: 'manual' | 'qr_code') => void;
    processing: boolean;
    logs: AttendanceLogs;
    students: { id: string; name: string }[];
    checkedInIds: string[];
    pendingRecords?: { studentId: string; status: string; timestamp: string }[];
    onSetStatus?: (studentId: string, status: 'hadir' | 'izin' | 'sakit' | 'alpa') => void;
    onApprove?: (studentId: string) => void;
    onReject?: (studentId: string) => void;
}

export function AttendancePanel({
    attendanceSession,
    selectedClassId,
    classes,
    onToggleSession,
    processing,
    logs,
    students,
    checkedInIds,
    pendingRecords = [],
    onSetStatus,
    onApprove,
    onReject
}: AttendancePanelProps) {
    const selectedClass = classes.find(c => c.id === selectedClassId);
    const isQR = attendanceSession?.type === 'qr_code';

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-6xl mx-auto space-y-8">
            {/* Export Section */}
            {selectedClassId && selectedClass && (
                <AttendanceExport classId={selectedClassId} className={selectedClass.name} />
            )}
            <div className={`p-6 md:p-16 rounded-[2.5rem] md:rounded-[4rem] border-2 transition-all duration-700 relative overflow-hidden ${attendanceSession?.is_open
                ? (isQR ? 'bg-indigo-50/40 border-indigo-200 shadow-2xl shadow-indigo-200/30' : 'bg-emerald-50/40 border-emerald-200 shadow-2xl shadow-emerald-200/30')
                : 'bg-white border-slate-100 shadow-2xl shadow-slate-200/50'}`}>

                {attendanceSession?.is_open && <div className={`absolute -top-10 -right-10 w-40 h-40 blur-[80px] animate-pulse ${isQR ? 'bg-indigo-500/10' : 'bg-emerald-500/10'}`}></div>}

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-14 text-center lg:text-left relative z-10">
                    <div className="flex-1">
                        <div className={`inline-flex items-center gap-3 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-2 ${attendanceSession?.is_open
                            ? (isQR ? 'bg-indigo-500 text-white border-white/50' : 'bg-emerald-500 text-white border-white/50')
                            : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                            <span className={`w-2 h-2 rounded-full ${attendanceSession?.is_open ? 'bg-white animate-ping' : 'bg-slate-400'}`}></span>
                            {attendanceSession?.is_open ? (isQR ? 'Live QR Session' : 'Live Manual Session') : 'Offline State'}
                        </div>
                        <h3 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter leading-tight">
                            {attendanceSession?.is_open
                                ? (isQR ? 'Scan QR Code' : 'Sesi Presensi Manual')
                                : 'Presensi Sedang Tidak Dibuka'}
                        </h3>
                        <p className="text-slate-500 font-bold text-lg leading-relaxed max-w-2xl opacity-70">
                            {selectedClassId
                                ? (attendanceSession?.is_open
                                    ? (isQR
                                        ? `Tampilkan QR Code ini di layar depan kelas. Siswa wajib scan untuk hadir.`
                                        : `Siswa dapat melakukan check-in mandiri melalui dashboard mereka. Check-in manual memerlukan verifikasi Guru.`)
                                    : `Pilih metode presensi untuk memulai sesi hari ini.`)
                                : 'Anda belum memilih kelas. Silakan buat kelas di menu Manajemen Kelas atau pilih kelas dari dropdown di header.'
                            }
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 w-full lg:w-auto">
                        {attendanceSession?.is_open ? (
                            <button
                                onClick={() => onToggleSession()}
                                disabled={processing}
                                className="group relative px-14 py-8 rounded-[2.5rem] text-xl font-black shadow-2xl transition-all duration-500 hover:scale-105 active:scale-95 flex flex-col items-center gap-3 bg-rose-600 text-white shadow-rose-600/40 hover:bg-rose-700 w-full"
                            >
                                {processing ? (
                                    <Loader2 className="animate-spin" size={32} />
                                ) : (
                                    <>
                                        <span className="leading-none uppercase tracking-widest">HENTIKAN SESI</span>
                                        <span className="text-[10px] opacity-60 font-medium">Tutup Absensi</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={() => onToggleSession('qr_code')}
                                    disabled={processing}
                                    className="flex-1 px-8 py-6 rounded-[2rem] font-bold shadow-xl transition-all hover:scale-105 active:scale-95 flex flex-col items-center gap-2 bg-indigo-600 text-white shadow-indigo-600/30 hover:bg-indigo-700"
                                >
                                    <QrCode size={24} />
                                    <span>Mulai QR Code</span>
                                </button>
                                <button
                                    onClick={() => onToggleSession('manual')}
                                    disabled={processing}
                                    className="flex-1 px-8 py-6 rounded-[2rem] font-bold shadow-xl transition-all hover:scale-105 active:scale-95 flex flex-col items-center gap-2 bg-emerald-500 text-white shadow-emerald-500/30 hover:bg-emerald-600"
                                >
                                    <MousePointerClick size={24} />
                                    <span>Mulai Manual</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* QR Generator Display */}
            {attendanceSession?.is_open && isQR && (
                <div className="mt-8 animate-in slide-in-from-top-4 duration-500">
                    <QRGenerator sessionId={attendanceSession.id} initialToken={attendanceSession.active_token} />
                </div>
            )}

            {/* Attendance Logs Area */}
            {attendanceSession?.is_open && (
                <div className="mt-16 animate-in slide-in-from-top-4 duration-500 space-y-12">

                    {/* Pending Approvals Section */}
                    {pendingRecords.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl">
                                    <AlertCircle size={24} className="text-amber-500" />
                                </div>
                                <h4 className="text-2xl font-black text-slate-900 tracking-tight">Menunggu Verifikasi ({pendingRecords.length})</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {pendingRecords.map((record) => {
                                    const student = students.find(s => s.id === record.studentId);
                                    if (!student) return null;
                                    return (
                                        <div key={record.studentId} className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-amber-500 shadow-sm">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{student.name}</p>
                                                    <p className="text-xs text-slate-500 capitalize">{record.status} • {new Date(record.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => onApprove?.(record.studentId)}
                                                    className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                                                    title="Terima"
                                                >
                                                    <CheckCircle2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onReject?.(record.studentId)}
                                                    className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                                                    title="Tolak"
                                                >
                                                    <AlertCircle size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl">
                                <BarChart3 size={24} className="text-indigo-600" />
                            </div>
                            <h4 className="text-2xl font-black text-slate-900 tracking-tight">Statistik Kehadiran Real-time</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <AttendanceStat label="Hadir" value={logs.hadir} color="text-indigo-600" bg="bg-indigo-50" />
                            <AttendanceStat label="Izin" value={logs.izin} color="text-amber-500" bg="bg-amber-50" />
                            <AttendanceStat label="Sakit" value={logs.sakit} color="text-blue-500" bg="bg-blue-50" />
                            <AttendanceStat label="Alpa" value={logs.alpa} color="text-rose-500" bg="bg-rose-50" />
                        </div>
                    </div>

                    {/* Missing Students Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl">
                                <AlertCircle size={24} className="text-rose-500" />
                            </div>
                            <h4 className="text-2xl font-black text-slate-900 tracking-tight">Siswa Belum Presensi ({students.length - checkedInIds.length})</h4>
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8">
                            {students.filter(s => !checkedInIds.includes(s.id)).length === 0 ? (
                                <div className="py-10 text-center">
                                    <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
                                    <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Semua siswa sudah presensi!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {students.filter(s => !checkedInIds.includes(s.id)).map(student => (
                                        <div key={student.id} className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:text-indigo-600 shadow-sm transition-colors">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-slate-700 text-sm">{student.name}</span>
                                            </div>
                                            {onSetStatus && (
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => onSetStatus(student.id, 'hadir')}
                                                        className="px-3 py-1.5 bg-indigo-500 text-white text-xs font-bold rounded-lg hover:bg-indigo-600 transition-colors"
                                                    >
                                                        Hadir
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onSetStatus(student.id, 'izin')}
                                                        className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-colors"
                                                    >
                                                        Izin
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onSetStatus(student.id, 'sakit')}
                                                        className="px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-colors"
                                                    >
                                                        Sakit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onSetStatus(student.id, 'alpa')}
                                                        className="px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600 transition-colors"
                                                    >
                                                        Alpha
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
