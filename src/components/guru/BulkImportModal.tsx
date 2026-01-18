'use client';

import { useState, useCallback } from 'react';
import { X, Upload, Download, AlertCircle, CheckCircle, Loader2, Users, FileSpreadsheet } from 'lucide-react';
import { parseCSV, downloadCSVTemplate, ParsedStudent, CSVParseResult } from '@/lib/csv-parser';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface BulkImportModalProps {
    classId: string;
    className?: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

type ImportStep = 'upload' | 'preview' | 'importing' | 'complete';

export function BulkImportModal({ classId, className, isOpen, onClose, onSuccess }: BulkImportModalProps) {
    const [step, setStep] = useState<ImportStep>('upload');
    const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
    const [importing, setImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const [importResults, setImportResults] = useState<{
        success: number;
        failed: number;
        errors: string[];
    }>({ success: 0, failed: 0, errors: [] });

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.name.endsWith('.csv')) {
            toast.error('Mohon upload file CSV');
            return;
        }

        try {
            const content = await file.text();
            const result = parseCSV(content);
            setParseResult(result);
            setStep('preview');
        } catch (error) {
            toast.error('Gagal membaca file. Pastikan file adalah CSV yang valid.');
        }
    }, []);

    const handleImport = async () => {
        if (!parseResult || parseResult.data.length === 0) return;

        setStep('importing');
        setImporting(true);
        setImportProgress(0);

        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[],
        };

        const total = parseResult.data.length;

        for (let i = 0; i < parseResult.data.length; i++) {
            const student = parseResult.data[i];
            setImportProgress(Math.round(((i + 1) / total) * 100));

            try {
                // Create user account
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: student.email,
                    password: student.password || 'siswa123', // Default password
                    options: {
                        data: {
                            full_name: student.fullName,
                            role: 'siswa',
                        },
                    },
                });

                if (authError) {
                    results.failed++;
                    results.errors.push(`${student.email}: ${authError.message}`);
                    continue;
                }

                if (authData.user) {
                    // Add to class
                    const { error: memberError } = await supabase
                        .from('class_members')
                        .insert({
                            class_id: classId,
                            user_id: authData.user.id,
                        });

                    if (memberError) {
                        results.failed++;
                        results.errors.push(`${student.email}: Gagal menambahkan ke kelas`);
                    } else {
                        results.success++;
                    }
                }
            } catch (error) {
                results.failed++;
                results.errors.push(`${student.email}: Unknown error`);
            }

            // Small delay to prevent rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        setImportResults(results);
        setImporting(false);
        setStep('complete');

        if (results.success > 0) {
            toast.success(`Berhasil import ${results.success} siswa`);
            onSuccess?.();
        }
    };

    const handleReset = () => {
        setStep('upload');
        setParseResult(null);
        setImportProgress(0);
        setImportResults({ success: 0, failed: 0, errors: [] });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                            <Users className="text-emerald-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Import Siswa Massal</h2>
                            <p className="text-sm text-slate-400">{className || 'Kelas'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                        disabled={importing}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {step === 'upload' && (
                        <UploadStep onFileSelect={handleFileSelect} />
                    )}
                    {step === 'preview' && parseResult && (
                        <PreviewStep 
                            result={parseResult} 
                            onImport={handleImport}
                            onBack={handleReset}
                        />
                    )}
                    {step === 'importing' && (
                        <ImportingStep progress={importProgress} />
                    )}
                    {step === 'complete' && (
                        <CompleteStep 
                            results={importResults}
                            onClose={onClose}
                            onReset={handleReset}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

function UploadStep({ onFileSelect }: { onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <label className="block border-2 border-dashed border-white/20 rounded-2xl p-8 text-center cursor-pointer hover:border-indigo-500/50 transition-all">
                <input type="file" accept=".csv" onChange={onFileSelect} className="hidden" />
                <FileSpreadsheet className="w-16 h-16 mx-auto text-slate-500 mb-4" />
                <p className="text-white font-medium mb-1">Klik untuk upload file CSV</p>
                <p className="text-sm text-slate-400">atau drag & drop file di sini</p>
            </label>

            {/* Template Download */}
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <Download className="text-indigo-400 shrink-0 mt-0.5" size={20} />
                    <div>
                        <p className="text-sm text-indigo-200 mb-2">
                            Belum punya template? Download template CSV kami yang sudah diformat.
                        </p>
                        <button
                            onClick={downloadCSVTemplate}
                            className="text-sm text-indigo-400 hover:text-indigo-300 font-bold"
                        >
                            Download Template CSV →
                        </button>
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="text-sm text-slate-400 space-y-2">
                <p><strong className="text-white">Format CSV:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Kolom wajib: <code className="bg-white/10 px-1 rounded">Nama Lengkap</code>, <code className="bg-white/10 px-1 rounded">Email</code></li>
                    <li>Kolom opsional: <code className="bg-white/10 px-1 rounded">Password</code> (default: siswa123)</li>
                    <li>Baris pertama adalah header</li>
                </ul>
            </div>
        </div>
    );
}

function PreviewStep({ 
    result, 
    onImport, 
    onBack 
}: { 
    result: CSVParseResult; 
    onImport: () => void;
    onBack: () => void;
}) {
    return (
        <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-emerald-400">{result.data.length}</p>
                    <p className="text-sm text-slate-400">Siswa Valid</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-red-400">{result.errors.length}</p>
                    <p className="text-sm text-slate-400">Error</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-amber-400">{result.warnings.length}</p>
                    <p className="text-sm text-slate-400">Warning</p>
                </div>
            </div>

            {/* Errors */}
            {result.errors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 max-h-40 overflow-y-auto">
                    <p className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
                        <AlertCircle size={16} /> Errors (Tidak akan diimport)
                    </p>
                    <ul className="text-sm text-red-300 space-y-1">
                        {result.errors.map((err, i) => (
                            <li key={i}>Baris {err.row}: {err.message}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Preview Table */}
            {result.data.length > 0 && (
                <div className="max-h-60 overflow-y-auto border border-white/10 rounded-xl">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 sticky top-0">
                            <tr>
                                <th className="px-4 py-2 text-left text-slate-400">#</th>
                                <th className="px-4 py-2 text-left text-slate-400">Nama</th>
                                <th className="px-4 py-2 text-left text-slate-400">Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.data.slice(0, 10).map((student, i) => (
                                <tr key={i} className="border-t border-white/5">
                                    <td className="px-4 py-2 text-slate-500">{i + 1}</td>
                                    <td className="px-4 py-2 text-white">{student.fullName}</td>
                                    <td className="px-4 py-2 text-slate-300">{student.email}</td>
                                </tr>
                            ))}
                            {result.data.length > 10 && (
                                <tr className="border-t border-white/5">
                                    <td colSpan={3} className="px-4 py-2 text-center text-slate-400">
                                        ... dan {result.data.length - 10} lainnya
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-4">
                <button
                    onClick={onBack}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                    ← Kembali
                </button>
                <button
                    onClick={onImport}
                    disabled={result.data.length === 0}
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                >
                    Import {result.data.length} Siswa
                </button>
            </div>
        </div>
    );
}

function ImportingStep({ progress }: { progress: number }) {
    return (
        <div className="text-center py-8 space-y-4">
            <Loader2 className="w-16 h-16 mx-auto text-indigo-400 animate-spin" />
            <p className="text-lg font-bold text-white">Mengimport siswa...</p>
            <p className="text-slate-400">{progress}%</p>
            <div className="w-full bg-white/10 rounded-full h-2 max-w-xs mx-auto">
                <div 
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="text-sm text-slate-500">Mohon tunggu, jangan tutup halaman ini...</p>
        </div>
    );
}

function CompleteStep({ 
    results, 
    onClose,
    onReset 
}: { 
    results: { success: number; failed: number; errors: string[] };
    onClose: () => void;
    onReset: () => void;
}) {
    return (
        <div className="space-y-6">
            {/* Success Summary */}
            <div className="text-center">
                <CheckCircle className="w-16 h-16 mx-auto text-emerald-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Import Selesai!</h3>
                <p className="text-slate-400">
                    {results.success} siswa berhasil ditambahkan
                    {results.failed > 0 && `, ${results.failed} gagal`}
                </p>
            </div>

            {/* Error Details */}
            {results.errors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 max-h-40 overflow-y-auto">
                    <p className="text-sm font-bold text-red-400 mb-2">Gagal Diimport:</p>
                    <ul className="text-sm text-red-300 space-y-1">
                        {results.errors.map((err, i) => (
                            <li key={i}>{err}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-center gap-4">
                <button
                    onClick={onReset}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                >
                    Import Lagi
                </button>
                <button
                    onClick={onClose}
                    className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-all"
                >
                    Selesai
                </button>
            </div>
        </div>
    );
}
