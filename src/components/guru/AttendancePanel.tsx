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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-6xl mx-auto space-y-10 pb-20">
            {/* Export Section */}
            {selectedClassId && selectedClass && (
                <div className="flex justify-end">
                    <AttendanceExport classId={selectedClassId} className={selectedClass.name} />
                </div>
            )}

            <div className={`gs-card p-8 md:p-16 border-2 transition-all duration-700 relative overflow-hidden ${attendanceSession?.is_open
                ? (isQR ? 'border-indigo-500/50 shadow-2xl shadow-indigo-500/20' : 'border-emerald-500/50 shadow-2xl shadow-emerald-500/20')
                : 'border-white/5 shadow-2xl shadow-black/40'}`}>

                {attendanceSession?.is_open && (
                    <div className={`absolute -top-20 -right-20 w-64 h-64 blur-[120px] animate-pulse opacity-20 ${isQR ? 'bg-indigo-500' : 'bg-emerald-500'}`}></div>
                )}

                <div className="flex flex-col lg:flex-row justify-between items-center gap-12 relative z-10">
                    <div className="flex-1 text-center lg:text-left">
                        <div className={`inline-flex items-center gap-3 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 border ${attendanceSession?.is_open
                            ? (isQR ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30')
                            : 'bg-white/5 text-slate-500 border-white/10'}`}>
                            <span className={`w-2 h-2 rounded-full ${attendanceSession?.is_open ? (isQR ? 'bg-indigo-400 animate-ping' : 'bg-emerald-400 animate-ping') : 'bg-slate-700'}`}></span>
                            {attendanceSession?.is_open ? (isQR ? 'Sesi QR Aktif' : 'Sesi Manual Aktif') : 'Belum Aktif'}
                        </div>
                        <h3 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter leading-tight">
                            {attendanceSession?.is_open
                                ? (isQR ? 'Sesi QR Code' : 'Presensi Manual')
                                : 'Portal Presensi'}
                        </h3>
                        <p className="text-slate-400 font-bold text-base leading-relaxed max-w-xl">
                            {selectedClassId
                                ? (attendanceSession?.is_open
                                    ? (isQR
                                        ? `Tampilkan QR code di layar utama. Siswa harus scan untuk mencatat kehadiran.`
                                        : `Presensi manual aktif. Siswa dapat check-in dari dashboard mereka.`)
                                    : `Mulai sesi baru untuk catatan hari ini. Pilih metode verifikasi di bawah.`)
                                : 'Pilih kelas dari header untuk mengelola presensi.'
                            }
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 w-full lg:w-72">
                        {attendanceSession?.is_open ? (
                            <button
                                onClick={() => onToggleSession()}
                                disabled={processing}
                                className="group relative p-8 rounded-[2.5rem] text-xl font-black shadow-2xl transition-all duration-500 hover:scale-105 active:scale-95 flex flex-col items-center gap-2 bg-rose-600 text-white shadow-rose-600/40 hover:bg-rose-700 w-full"
                            >
                                {processing ? (
                                    <Loader2 className="animate-spin" size={32} />
                                ) : (
                                    <>
                                        <span className="leading-none uppercase tracking-widest text-base">AKHIRI</span>
                                        <span className="text-[10px] opacity-70 font-bold uppercase">Tutup Sesi</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={() => onToggleSession('qr_code')}
                                    disabled={processing || !selectedClassId}
                                    className="px-8 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-30 disabled:grayscale"
                                >
                                    <QrCode size={20} />
                                    <span>Mulai QR</span>
                                </button>
                                <button
                                    onClick={() => onToggleSession('manual')}
                                    disabled={processing || !selectedClassId}
                                    className="px-8 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 bg-white/[0.05] text-white border border-white/10 hover:bg-white/[0.08] disabled:opacity-30 disabled:grayscale"
                                >
                                    <MousePointerClick size={20} />
                                    <span>Mode Manual</span>
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
                            <div className="flex items-center gap-4 px-2">
                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                                    <AlertCircle size={24} className="text-amber-500" />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-white tracking-tight leading-none">Perlu Verifikasi</h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">{pendingRecords.length} Students Awaiting Approval</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[...pendingRecords]
                                    .sort((a, b) => {
                                        const nameA = students.find(s => s.id === a.studentId)?.name || '';
                                        const nameB = students.find(s => s.id === b.studentId)?.name || '';
                                        return nameA.localeCompare(nameB, 'id');
                                    })
                                    .map((record) => {
                                    const student = students.find(s => s.id === record.studentId);
                                    if (!student) return null;
                                    return (
                                        <div key={record.studentId} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-3xl border border-white/5 hover:bg-white/[0.04] transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center font-black text-amber-500 border border-amber-500/20">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">{student.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                                                        {new Date(record.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => onApprove?.(record.studentId)}
                                                    className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
                                                    title="Approve"
                                                >
                                                    <CheckCircle2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onReject?.(record.studentId)}
                                                    className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
                                                    title="Reject"
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

                    {/* Stats Bento */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 px-2">
                            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                                <BarChart3 size={24} className="text-indigo-400" />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-white tracking-tight leading-none">Live Analytics</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Real-time Class Composition</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            <div className="universe-card p-6 border-emerald-500/10 hover:border-emerald-500/30 transition-all group">
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Hadir</p>
                                <p className="text-3xl font-black text-emerald-400 tracking-tighter group-hover:scale-105 transition-transform origin-left">{logs.hadir}</p>
                            </div>
                            <div className="universe-card p-6 border-amber-500/10 hover:border-amber-500/30 transition-all group">
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Izin</p>
                                <p className="text-3xl font-black text-amber-400 tracking-tighter group-hover:scale-105 transition-transform origin-left">{logs.izin}</p>
                            </div>
                            <div className="universe-card p-6 border-blue-500/10 hover:border-blue-500/30 transition-all group">
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Sakit</p>
                                <p className="text-3xl font-black text-blue-400 tracking-tighter group-hover:scale-105 transition-transform origin-left">{logs.sakit}</p>
                            </div>
                            <div className="universe-card p-6 border-rose-500/10 hover:border-rose-500/30 transition-all group">
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Alpa</p>
                                <p className="text-3xl font-black text-rose-400 tracking-tighter group-hover:scale-105 transition-transform origin-left">{logs.alpa}</p>
                            </div>
                        </div>
                    </div>

                    {/* Registry List */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 px-2">
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                                <AlertCircle size={24} className="text-rose-500" />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-white tracking-tight leading-none">Unregistered Students</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">{students.length - checkedInIds.length} Missing from Registry</p>
                            </div>
                        </div>

                        <div className="universe-card overflow-hidden">
                            {students.filter(s => !checkedInIds.includes(s.id)).length === 0 ? (
                                <div className="py-20 text-center">
                                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                                        <CheckCircle2 size={40} className="text-emerald-500 animate-bounce" />
                                    </div>
                                    <h5 className="text-xl font-black text-white mb-2 tracking-tight">Full Attendance Reached</h5>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Every student has checked in!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {students
                                        .filter(s => !checkedInIds.includes(s.id))
                                        .sort((a, b) => a.name.localeCompare(b.name, 'id'))
                                        .map(student => (
                                        <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-white/[0.02] transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-slate-200 text-sm group-hover:text-indigo-400 transition-colors">{student.name}</span>
                                            </div>
                                            {onSetStatus && (
                                                <div className="grid grid-cols-2 sm:flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => onSetStatus(student.id, 'hadir')}
                                                        className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-indigo-500/20 transition-all"
                                                    >
                                                        Hadir
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onSetStatus(student.id, 'izin')}
                                                        className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-amber-500/20 transition-all"
                                                    >
                                                        Izin
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onSetStatus(student.id, 'sakit')}
                                                        className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-blue-500/20 transition-all"
                                                    >
                                                        Sakit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onSetStatus(student.id, 'alpa')}
                                                        className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-rose-500/20 transition-all"
                                                    >
                                                        Alpa
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
