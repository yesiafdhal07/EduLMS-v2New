// ============================================================
// ASSIGNMENT MODAL
// Modal untuk membuat tugas baru
// Logic form sudah diekstrak ke useAssignmentForm hook
// ============================================================

'use client';

import { XCircle, Upload, Loader2 } from 'lucide-react';
import type { ClassData } from '@/types';
import { useAssignmentForm } from '@/hooks/useAssignmentForm';

// ============================================================
// PROPS INTERFACE
// ============================================================

interface AssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    classes: ClassData[];
    selectedClassId: string | null;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

/**
 * AssignmentModal - Modal untuk membuat tugas baru
 * 
 * Fitur:
 * - Pilih kelas dan target (seluruh kelas atau siswa tertentu)
 * - Set deadline dan format file yang dibutuhkan
 * - Upload file soal/panduan (opsional)
 * - Broadcast notifikasi ke siswa setelah dibuat
 * 
 * Logic form menggunakan useAssignmentForm hook untuk maintainability
 */
export function AssignmentModal({
    isOpen,
    onClose,
    onSuccess,
    classes,
    selectedClassId
}: AssignmentModalProps) {
    // Gunakan custom hook untuk semua form logic
    const {
        form,
        students,
        uploading,
        submitting,
        updateField,
        fetchStudents,
        handleFileUpload,
        handleSubmit,
        resetForm
    } = useAssignmentForm(selectedClassId, onSuccess);

    // Handler untuk submit + close modal
    const handleFormSubmit = async () => {
        const success = await handleSubmit();
        if (success) {
            resetForm();
            onClose();
        }
    };

    // Handler untuk class change - fetch students
    const handleClassChange = (classId: string) => {
        updateField('classId', classId);
        fetchStudents(classId);
    };

    // Early return jika modal tidak terbuka
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            {/* Backdrop - klik untuk tutup */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                        Buat Tugas Baru
                    </h3>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
                        aria-label="Tutup modal"
                        type="button"
                    >
                        <XCircle size={24} />
                    </button>
                </div>

                {/* Form Content - scrollable */}
                <div className="p-10 space-y-6 max-h-[60vh] overflow-y-auto">
                    {/* Judul Tugas */}
                    <div className="space-y-3">
                        <label htmlFor="assignment-title" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                            Judul Tugas
                        </label>
                        <input
                            id="assignment-title"
                            type="text"
                            placeholder="Contoh: Latihan Vektor Bagian 1"
                            className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold transition-all text-slate-900 placeholder:text-slate-400"
                            value={form.title}
                            onChange={(e) => updateField('title', e.target.value)}
                        />
                    </div>

                    {/* Pilih Kelas */}
                    <div className="space-y-3">
                        <label htmlFor="assignment-class" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                            Pilih Kelas
                        </label>
                        <select
                            id="assignment-class"
                            className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold transition-all text-slate-900"
                            value={form.classId}
                            onChange={(e) => handleClassChange(e.target.value)}
                        >
                            <option value="">-- Pilih Kelas --</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Target Penerima */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                            Target Penerima
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => updateField('targetType', 'class')}
                                className={`py-4 rounded-xl border-2 font-black transition-all text-xs ${form.targetType === 'class' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-100'}`}
                            >
                                SELURUH KELAS
                            </button>
                            <button
                                type="button"
                                onClick={() => updateField('targetType', 'student')}
                                className={`py-4 rounded-xl border-2 font-black transition-all text-xs ${form.targetType === 'student' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-100'}`}
                            >
                                MURID TERTENTU
                            </button>
                        </div>
                    </div>

                    {/* Pilih Murid (conditional) */}
                    {form.targetType === 'student' && (
                        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                            <label htmlFor="assignment-student" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                                Pilih Murid
                            </label>
                            <select
                                id="assignment-student"
                                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold transition-all text-slate-900"
                                value={form.targetId}
                                onChange={(e) => updateField('targetId', e.target.value)}
                            >
                                <option value="">-- Pilih Murid --</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Deadline & Format */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <label htmlFor="assignment-deadline" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                                Deadline
                            </label>
                            <input
                                id="assignment-deadline"
                                type="datetime-local"
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-medium"
                                value={form.deadline}
                                onChange={(e) => updateField('deadline', e.target.value)}
                            />
                        </div>
                        <div className="space-y-3">
                            <label htmlFor="assignment-format" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                                Format File
                            </label>
                            <select
                                id="assignment-format"
                                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold transition-all text-sm text-slate-900"
                                value={form.requiredFormat}
                                onChange={(e) => updateField('requiredFormat', e.target.value)}
                            >
                                <option value="PDF">PDF ONLY</option>
                                <option value="DOCX">WORD</option>
                                <option value="ANY">BEBAS</option>
                            </select>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                            File Tugas (Opsional)
                        </label>
                        <div className="relative group">
                            <input
                                type="file"
                                id="assignment-file"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                            <label
                                htmlFor="assignment-file"
                                className="w-full flex items-center gap-4 px-8 py-5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-400 hover:bg-slate-100 transition-all cursor-pointer overflow-hidden"
                            >
                                <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-indigo-50 transition-colors">
                                    {uploading ? <Loader2 size={24} className="text-indigo-600 animate-spin" /> : <Upload size={24} className="text-indigo-600" />}
                                </div>
                                <div className="flex-1 truncate">
                                    <p className="text-sm font-black text-slate-700 truncate">
                                        {form.fileUrl ? 'File Terpilih' : 'Unggah File Tugas'}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                        {form.fileUrl ? 'Klik untuk mengganti' : 'Opsional: Berikan file panduan/soal'}
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Deskripsi */}
                    <div className="space-y-3">
                        <label htmlFor="assignment-desc" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                            Instruksi Tugas (Opsional)
                        </label>
                        <textarea
                            id="assignment-desc"
                            className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold transition-all h-24 resize-none text-slate-900 placeholder:text-slate-400"
                            value={form.description}
                            onChange={(e) => updateField('description', e.target.value)}
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-10 bg-slate-50 flex gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-5 bg-white border border-slate-200 text-slate-500 font-black rounded-2xl hover:bg-slate-100 transition-all"
                    >
                        BATAL
                    </button>
                    <button
                        type="button"
                        onClick={handleFormSubmit}
                        disabled={uploading || submitting}
                        className="flex-1 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transform active:scale-95 transition-all disabled:opacity-50"
                    >
                        {submitting ? 'MEMBUAT...' : uploading ? 'MENGUNGGAH...' : 'BUAT TUGAS'}
                    </button>
                </div>
            </div>
        </div>
    );
}
