// ============================================================
// DATA ARCHIVE MODAL
// Modal untuk export dan hapus data absensi/nilai per kelas
// Logic export/purge sudah diekstrak ke useDataArchive hook
// ============================================================

'use client';

import { useState } from 'react';
import { Calendar, AlertTriangle, CheckCircle, FileSpreadsheet, Archive } from 'lucide-react';
import { ClassData } from '@/types';
import { useDataArchive, ArchiveType } from '@/hooks/useDataArchive';

// ============================================================
// PROPS INTERFACE
// ============================================================

interface DataArchiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    classes: ClassData[];
}

// ============================================================
// MAIN COMPONENT
// ============================================================

/**
 * DataArchiveModal - Modal untuk mengarsipkan (export + hapus) data
 * 
 * Flow:
 * 1. Pilih kelas dan tipe data (absensi/nilai)
 * 2. Konfirmasi penghapusan
 * 3. Export ke Excel lalu hapus dari database
 * 4. Tampilkan status sukses
 * 
 * Logic export menggunakan useDataArchive hook untuk maintainability
 */
export function DataArchiveModal({ isOpen, onClose, classes }: DataArchiveModalProps) {
    // Local state hanya untuk form selections
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [archiveType, setArchiveType] = useState<ArchiveType>('attendance');

    // Gunakan custom hook untuk semua export/purge logic
    const {
        loading,
        step,
        stats,
        fetchStats,
        exportAndPurge,
        resetState,
        setStep
    } = useDataArchive();

    // Derived state
    const selectedClassName = classes.find(c => c.id === selectedClassId)?.name || 'Kelas';

    // Handler untuk fetch statistik
    const handleFetchStats = () => {
        if (selectedClassId) {
            fetchStats(selectedClassId, archiveType);
        }
    };

    // Handler untuk export dan purge
    const handleExportAndPurge = async () => {
        await exportAndPurge(selectedClassId, selectedClassName, archiveType);
    };

    // Handler untuk close modal
    const handleClose = () => {
        resetState();
        setSelectedClassId('');
        onClose();
    };

    // Early return jika modal tidak terbuka
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
                            <Archive className="text-indigo-600" size={24} />
                            Arsip & Reset Data
                        </h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Export lalu Hapus Permanen
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                        aria-label="Tutup modal"
                        type="button"
                    >
                        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">

                    {/* Step 1: Selection */}
                    {step === 'select' && (
                        <div className="space-y-6">
                            {/* Pilih Kelas */}
                            <div className="space-y-2">
                                <label htmlFor="archive-class" className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                                    Pilih Kelas
                                </label>
                                <select
                                    id="archive-class"
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    value={selectedClassId}
                                    onChange={(e) => setSelectedClassId(e.target.value)}
                                >
                                    <option value="">-- Pilih Kelas --</option>
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Pilih Tipe Arsip */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setArchiveType('attendance')}
                                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${archiveType === 'attendance'
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                            : 'border-slate-100 hover:border-indigo-200 text-slate-400'
                                        }`}
                                >
                                    <Calendar size={32} />
                                    <span className="font-bold text-sm">Arsip Absensi</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setArchiveType('grades')}
                                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${archiveType === 'grades'
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                            : 'border-slate-100 hover:border-indigo-200 text-slate-400'
                                        }`}
                                >
                                    <FileSpreadsheet size={32} />
                                    <span className="font-bold text-sm">Arsip Nilai</span>
                                </button>
                            </div>

                            {/* Tombol Lanjut */}
                            <button
                                type="button"
                                onClick={handleFetchStats}
                                disabled={!selectedClassId || loading}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                            >
                                {loading ? 'Memuat...' : 'Lanjut ke Konfirmasi'}
                            </button>
                        </div>
                    )}

                    {/* Step 2: Confirmation */}
                    {step === 'confirm' && (
                        <div className="text-center space-y-6 animate-in slide-in-from-right-8">
                            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 mb-4">
                                <AlertTriangle size={40} />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-slate-800 mb-2">Konfirmasi Penghapusan</h4>
                                <p className="text-slate-500">
                                    Anda akan mengarsipkan <strong>{stats?.count} {stats?.label}</strong> dari kelas <strong>{selectedClassName}</strong>.
                                </p>
                                <p className="text-rose-500 font-bold text-sm mt-4 bg-rose-50 p-3 rounded-xl border border-rose-100">
                                    ⚠️ Data akan DIDOWNLOAD lalu DIHAPUS PERMANEN dari database.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setStep('select')}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleExportAndPurge}
                                    className="flex-1 py-4 bg-rose-600 text-white font-black rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all active:scale-95"
                                >
                                    Export & Hapus
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Processing */}
                    {step === 'processing' && (
                        <div className="text-center py-12 space-y-6">
                            <div className="relative w-20 h-20 mx-auto">
                                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <h4 className="text-xl font-bold text-slate-800 animate-pulse">Sedang Memproses...</h4>
                            <p className="text-slate-400 text-sm">Jangan tutup jendela ini.</p>
                        </div>
                    )}

                    {/* Step 4: Success */}
                    {step === 'success' && (
                        <div className="text-center space-y-6 animate-in zoom-in-50">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 mb-4">
                                <CheckCircle size={40} />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-slate-800 mb-2">Berhasil!</h4>
                                <p className="text-slate-500">File telah didownload dan data di database telah dibersihkan.</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="w-full py-4 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all"
                            >
                                Selesai
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
