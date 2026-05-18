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
            <div className="bg-[#0C0B12] border border-[var(--guru-border-default)] w-full max-w-xl rounded-[3rem] shadow-2xl shadow-black/50 relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-10 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-2xl font-black text-white tracking-tight uppercase">
                        Buat Tugas Baru
                    </h3>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-rose-400 transition-colors"
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
                            className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--guru-accent)]/20 font-bold transition-all text-white placeholder:text-slate-500"
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
                            className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--guru-accent)]/20 font-bold transition-all text-white"
                            value={form.classId}
                            onChange={(e) => handleClassChange(e.target.value)}
                        >
                            <option value="" className="bg-[#0C0B12]">-- Pilih Kelas --</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id} className="bg-[#0C0B12]">{c.name}</option>
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
                                className={`py-4 rounded-xl border-2 font-black transition-all text-xs ${form.targetType === 'class' ? 'bg-[var(--guru-accent)] text-white border-[var(--guru-accent)]' : 'bg-white/5 text-slate-400 border-white/10'}`}
                            >
                                SELURUH KELAS
                            </button>
                            <button
                                type="button"
                                onClick={() => updateField('targetType', 'student')}
                                className={`py-4 rounded-xl border-2 font-black transition-all text-xs ${form.targetType === 'student' ? 'bg-[var(--guru-accent)] text-white border-[var(--guru-accent)]' : 'bg-white/5 text-slate-400 border-white/10'}`}
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
                                className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--guru-accent)]/20 font-bold transition-all text-white"
                                value={form.targetId}
                                onChange={(e) => updateField('targetId', e.target.value)}
                            >
                                <option value="" className="bg-[#0C0B12]">-- Pilih Murid --</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id} className="bg-[#0C0B12]">{s.name}</option>
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
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--guru-accent)]/20 text-white font-medium [color-scheme:dark]"
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
                                className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--guru-accent)]/20 font-bold transition-all text-sm text-white"
                                value={form.requiredFormat}
                                onChange={(e) => updateField('requiredFormat', e.target.value)}
                            >
                                <option value="PDF" className="bg-[#0C0B12]">PDF ONLY</option>
                                <option value="DOCX" className="bg-[#0C0B12]">WORD</option>
                                <option value="ANY" className="bg-[#0C0B12]">BEBAS</option>
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
                                className="w-full flex items-center gap-4 px-8 py-5 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl hover:border-[var(--guru-accent)]/50 hover:bg-white/10 transition-all cursor-pointer overflow-hidden"
                            >
                                <div className="p-3 bg-[#0C0B12] rounded-xl shadow-sm border border-white/5 group-hover:border-[var(--guru-accent)]/30 transition-colors">
                                    {uploading ? <Loader2 size={24} className="text-[var(--guru-accent)] animate-spin" /> : <Upload size={24} className="text-[var(--guru-accent)]" />}
                                </div>
                                <div className="flex-1 truncate">
                                    <p className="text-sm font-black text-white truncate">
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
                            className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--guru-accent)]/20 font-bold transition-all h-24 resize-none text-white placeholder:text-slate-500"
                            value={form.description}
                            onChange={(e) => updateField('description', e.target.value)}
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-10 border-t border-white/10 bg-[#08080C] flex gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-5 bg-white/5 border border-white/10 text-slate-400 font-black rounded-2xl hover:bg-white/10 hover:text-white transition-all"
                    >
                        BATAL
                    </button>
                    <button
                        type="button"
                        onClick={handleFormSubmit}
                        disabled={uploading || submitting}
                        className="flex-1 py-5 bg-[var(--guru-accent)] text-white font-black rounded-2xl hover:opacity-90 shadow-xl shadow-[var(--guru-accent)]/20 transform active:scale-95 transition-all disabled:opacity-50"
                    >
                        {submitting ? 'MEMBUAT...' : uploading ? 'MENGUNGGAH...' : 'BUAT TUGAS'}
                    </button>
                </div>
            </div>
        </div>
    );
}
