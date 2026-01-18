// ============================================================
// MANUAL GRADE MODAL
// Modal untuk input nilai manual per siswa
// Logic nilai sudah diekstrak ke useManualGrade hook
// ============================================================

'use client';

import { useEffect } from 'react';
import { XCircle, User, Save, Loader2, Star, BookOpen } from 'lucide-react';
import { useManualGrade, GradeMode } from '@/hooks/useManualGrade';

// ============================================================
// PROPS INTERFACE
// ============================================================

interface ManualGradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    classId: string | null;
    assignment?: { id: string; title: string } | null;
    mode: GradeMode;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

/**
 * ManualGradeModal - Modal untuk input nilai manual
 * 
 * Mode:
 * - 'manual': Nilai tugas manual untuk assignment tertentu
 * - 'keaktifan': Nilai partisipasi, hanya untuk siswa yang sudah absen hari ini
 * 
 * Logic menggunakan useManualGrade hook untuk maintainability
 */
export function ManualGradeModal({
    isOpen,
    onClose,
    classId,
    assignment,
    mode
}: ManualGradeModalProps) {
    // Gunakan custom hook untuk semua grading logic
    const {
        students,
        grades,
        loading,
        saving,
        updateGrade,
        saveGrade,
        fetchStudents
    } = useManualGrade(classId, mode, assignment);

    // Fetch ulang saat modal dibuka
    useEffect(() => {
        if (isOpen && classId) {
            fetchStudents();
        }
    }, [isOpen, classId, fetchStudents]);

    // Early return jika modal tidak terbuka
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Backdrop */}
            <button
                type="button"
                className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
                onClick={onClose}
                aria-label="Tutup modal"
            />

            {/* Modal Container */}
            <div className="bg-slate-800 w-full max-w-2xl max-h-[85vh] rounded-[2rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${mode === 'keaktifan' ? 'bg-emerald-500/20' : 'bg-indigo-500/20'} rounded-xl flex items-center justify-center`}>
                            {mode === 'keaktifan'
                                ? <Star className="text-emerald-400" size={20} />
                                : <BookOpen className="text-indigo-400" size={20} />
                            }
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white">
                                {mode === 'keaktifan' ? 'Nilai Keaktifan Siswa' : 'Nilai Manual'}
                            </h3>
                            {assignment && (
                                <p className="text-xs text-slate-400">{assignment.title}</p>
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        aria-label="Tutup"
                    >
                        <XCircle size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-indigo-400" size={32} />
                        </div>
                    ) : students.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <User size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Tidak ada siswa di kelas ini</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {students.map(student => (
                                <div key={student.id} className="bg-slate-700/50 rounded-2xl p-4 border border-white/5">
                                    {/* Student Info */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-600 rounded-xl flex items-center justify-center text-white font-bold">
                                                {student.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">{student.full_name}</p>
                                                {student.existingGrade !== undefined && (
                                                    <p className="text-xs text-emerald-400">
                                                        Nilai saat ini: {student.existingGrade}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Grade Input */}
                                    <div className="flex gap-3">
                                        <input
                                            type="number"
                                            placeholder="0-100"
                                            min="0"
                                            max="100"
                                            value={grades[student.id]?.score || ''}
                                            onChange={(e) => updateGrade(student.id, 'score', e.target.value)}
                                            className="w-24 px-4 py-2 bg-slate-600 border border-white/10 rounded-xl text-white font-bold text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Catatan (opsional)"
                                            value={grades[student.id]?.feedback || ''}
                                            onChange={(e) => updateGrade(student.id, 'feedback', e.target.value)}
                                            className="flex-1 px-4 py-2 bg-slate-600 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => saveGrade(student.id)}
                                            disabled={saving === student.id || !grades[student.id]?.score}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                        >
                                            {saving === student.id ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Save size={16} />
                                            )}
                                            Simpan
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
