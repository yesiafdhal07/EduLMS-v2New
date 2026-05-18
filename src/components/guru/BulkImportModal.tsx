'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    X, Upload, FileText, CheckCircle, 
    AlertCircle, Download, Loader2, Users 
} from 'lucide-react';
import { parseCSV, downloadCSVTemplate, type ParsedStudent } from '@/lib/csv-parser';
import { toast } from 'sonner';

interface BulkImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    classId: string;
    schoolId: string;
    onSuccess?: () => void;
}

export function BulkImportModal({ isOpen, onClose, classId, schoolId, onSuccess }: BulkImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<ParsedStudent[]>([]);
    const [errors, setErrors] = useState<{ row: number; message: string }[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.name.endsWith('.csv')) {
            toast.error('Format file harus .csv');
            return;
        }

        setFile(selectedFile);
        setIsParsing(true);
        setErrors([]);
        setParsedData([]);

        const reader = new FileReader();
        reader.onload = async (event) => {
            const content = event.target?.result as string;
            const result = parseCSV(content);
            
            if (result.success) {
                setParsedData(result.data);
                toast.success(`${result.data.length} siswa siap diimpor`);
            } else {
                setErrors(result.errors);
                toast.error('Terdapat kesalahan pada file CSV');
            }
            setIsParsing(false);
        };
        reader.readAsText(selectedFile);
    };

    const handleImport = async () => {
        if (parsedData.length === 0) return;

        setIsImporting(true);
        setProgress(0);

        let successCount = 0;
        let failCount = 0;

        // Note: For production, this should be handled by a single API call with Service Role
        // to avoid rate limits and handle transactions properly.
        // For now, we'll use a loop as a placeholder for the logic.
        
        for (let i = 0; i < parsedData.length; i++) {
            const student = parsedData[i];
            try {
                // Call API route to handle student creation securely
                const response = await fetch('/api/admin/bulk-register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: student.email,
                        fullName: student.fullName,
                        password: student.password || 'Siswa123!', // Default password
                        classId,
                        schoolId,
                        role: 'siswa'
                    })
                });

                if (response.ok) {
                    successCount++;
                } else {
                    failCount++;
                    const err = await response.json();
                    console.error(`Gagal mengimpor ${student.email}:`, err.message);
                }
            } catch (err) {
                failCount++;
                console.error(`Error importing ${student.email}:`, err);
            }
            
            setProgress(Math.round(((i + 1) / parsedData.length) * 100));
        }

        setIsImporting(false);
        
        if (successCount > 0) {
            toast.success(`Berhasil mengimpor ${successCount} siswa.`);
            if (onSuccess) onSuccess();
            if (failCount === 0) onClose();
        }

        if (failCount > 0) {
            toast.error(`${failCount} siswa gagal diimpor. Periksa konsol untuk detail.`);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-[#181A20] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
                            <Upload size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white">Impor Siswa Massal</h3>
                            <p className="text-slate-400 text-sm font-medium">Unggah file CSV untuk mendaftarkan banyak siswa sekaligus.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-500 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {/* Instructions & Template */}
                    {!file && (
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4">
                            <h4 className="font-bold text-white flex items-center gap-2">
                                <FileText size={18} className="text-indigo-400" />
                                Panduan CSV
                            </h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Pastikan file CSV Anda memiliki kolom berikut: 
                                <span className="text-indigo-300 font-mono mx-1">Nama Lengkap</span>, 
                                <span className="text-indigo-300 font-mono mx-1">Email</span>, dan 
                                <span className="text-indigo-300 font-mono mx-1">Password</span> (opsional).
                            </p>
                            <button 
                                onClick={downloadCSVTemplate}
                                className="flex items-center gap-2 text-indigo-400 text-sm font-bold hover:text-white transition-colors"
                            >
                                <Download size={16} /> Unduh Template CSV
                            </button>
                        </div>
                    )}

                    {/* Upload Area */}
                    {!file ? (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-white/10 rounded-[2rem] p-12 text-center hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer group"
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                accept=".csv" 
                                className="hidden" 
                            />
                            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <Upload size={32} className="text-indigo-400" />
                            </div>
                            <h4 className="text-lg font-bold text-white mb-2">Klik untuk Unggah CSV</h4>
                            <p className="text-slate-500 text-sm font-medium">Maksimal ukuran file 2MB</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* File Info */}
                            <div className="flex items-center justify-between bg-white/5 rounded-2xl p-4 border border-white/10">
                                <div className="flex items-center gap-3">
                                    <FileText size={24} className="text-indigo-400" />
                                    <div>
                                        <p className="text-white font-bold text-sm">{file.name}</p>
                                        <p className="text-slate-500 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => { setFile(null); setParsedData([]); setErrors([]); }}
                                    className="text-rose-400 text-xs font-black uppercase hover:text-rose-300"
                                >
                                    Ganti File
                                </button>
                            </div>

                            {/* Parsing State */}
                            {isParsing && (
                                <div className="text-center py-10">
                                    <Loader2 size={32} className="text-indigo-500 animate-spin mx-auto mb-4" />
                                    <p className="text-slate-400 font-bold">Menganalisis file...</p>
                                </div>
                            )}

                            {/* Error List */}
                            {errors.length > 0 && (
                                <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-6 space-y-3">
                                    <h4 className="text-rose-400 font-bold flex items-center gap-2 mb-2">
                                        <AlertCircle size={18} /> Kesalahan Terdeteksi ({errors.length})
                                    </h4>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                        {errors.map((err, i) => (
                                            <div key={i} className="text-xs text-rose-300 bg-rose-500/5 p-2 rounded-lg border border-rose-500/10">
                                                <span className="font-black opacity-50 mr-2">Baris {err.row}:</span> {err.message}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Preview List */}
                            {parsedData.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-emerald-400 font-bold flex items-center gap-2">
                                        <CheckCircle size={18} /> Siap Diimpor ({parsedData.length} Siswa)
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                        {parsedData.map((student, i) => (
                                            <div key={i} className="bg-white/5 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
                                                    {i + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-bold text-sm truncate">{student.fullName}</p>
                                                    <p className="text-slate-500 text-xs truncate">{student.email}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer / Progress */}
                <div className="p-8 border-t border-white/5 bg-[#121418]">
                    {isImporting ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm font-bold">
                                <span className="text-indigo-400">Sedang mengimpor data...</span>
                                <span className="text-white">{progress}%</span>
                            </div>
                            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div 
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <button 
                                onClick={onClose}
                                className="flex-1 px-6 py-4 rounded-2xl bg-white/5 text-white font-black hover:bg-white/10 transition-all uppercase tracking-widest text-sm"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={handleImport}
                                disabled={parsedData.length === 0 || errors.length > 0}
                                className="flex-[2] px-6 py-4 rounded-2xl bg-indigo-500 text-white font-black hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                            >
                                <Users size={18} /> Mulai Impor Massal
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
