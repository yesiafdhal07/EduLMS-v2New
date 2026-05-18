'use client';

import { useState, useCallback } from 'react';
import { X, Brain, Download, Copy, Check, Loader2, Users, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    generateStudentNarrative,
    generateBatchNarratives,
    type StudentNarrativeData,
} from '@/lib/services/report-narrative.service';
import { exportToExcel, type ExcelSheetConfig } from '@/lib/utils/excel';

interface NarrativeReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    students: (StudentNarrativeData & { id: string })[];
    className: string;
}

interface NarrativeEntry {
    id: string;
    name: string;
    narrative: string | null;
    loading: boolean;
    copied: boolean;
}

export function NarrativeReportModal({
    isOpen,
    onClose,
    students,
    className,
}: NarrativeReportModalProps) {
    const [semester, setSemester] = useState('Ganjil');
    const [academicYear, setAcademicYear] = useState(
        `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`
    );
    const [entries, setEntries] = useState<NarrativeEntry[]>([]);
    const [generatingAll, setGeneratingAll] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const initEntries = useCallback(() => {
        setEntries(
            students.map((s) => ({
                id: s.id,
                name: s.name,
                narrative: null,
                loading: false,
                copied: false,
            }))
        );
    }, [students]);

    // Generate for a single student
    const generateOne = async (studentId: string) => {
        const student = students.find((s) => s.id === studentId);
        if (!student) return;

        setEntries((prev) =>
            prev.map((e) => (e.id === studentId ? { ...e, loading: true } : e))
        );

        const narrative = await generateStudentNarrative({ ...student, semester });

        setEntries((prev) =>
            prev.map((e) =>
                e.id === studentId ? { ...e, loading: false, narrative } : e
            )
        );

        if (!narrative) toast.error(`Gagal generate naratif untuk ${student.name}`);
        else setExpandedId(studentId);
    };

    // Generate for all students
    const generateAll = async () => {
        setGeneratingAll(true);
        if (entries.length === 0) initEntries();

        setEntries(students.map((s) => ({ id: s.id, name: s.name, narrative: null, loading: true, copied: false })));

        const narrativeMap = await generateBatchNarratives(
            students.map((s) => ({ ...s, semester }))
        );

        setEntries(
            students.map((s) => ({
                id: s.id,
                name: s.name,
                narrative: narrativeMap.get(s.id) || null,
                loading: false,
                copied: false,
            }))
        );

        setGeneratingAll(false);
        toast.success(`✅ ${narrativeMap.size} naratif berhasil di-generate!`);
    };

    const copyToClipboard = async (entryId: string, text: string) => {
        await navigator.clipboard.writeText(text);
        setEntries((prev) =>
            prev.map((e) => (e.id === entryId ? { ...e, copied: true } : e))
        );
        setTimeout(
            () => setEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, copied: false } : e))),
            2000
        );
    };

    const exportAllToExcel = async () => {
        const done = entries.filter((e) => e.narrative);
        if (done.length === 0) {
            toast.warning('Belum ada naratif yang di-generate!');
            return;
        }

        const sheets: ExcelSheetConfig[] = [
            {
                name: 'Narasi Rapor',
                columns: [
                    { header: 'No', key: 'no', width: 6 },
                    { header: 'Nama Siswa', key: 'nama', width: 30 },
                    { header: 'Status', key: 'status', width: 12 },
                    { header: 'Narasi Rapor', key: 'narasi', width: 80 },
                ],
                data: done.map((e, i) => {
                    const student = students.find((s) => s.id === e.id);
                    return { no: i + 1, nama: e.name, status: student?.status ?? '-', narasi: e.narrative ?? '-' };
                }),
            },
        ];
        await exportToExcel(sheets, `Naratif_Rapor_${className}_${semester}_${academicYear}`);
        toast.success('Export Excel berhasil!');
    };

    if (!isOpen) return null;

    const generated = entries.filter((e) => e.narrative).length;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative z-10 w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                            <Brain size={20} className="text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white">Rapor Naratif AI</h2>
                            <p className="text-xs text-slate-400">
                                {students.length} siswa · {className}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Config Bar */}
                <div className="flex items-center gap-3 px-6 py-4 bg-white/[0.02] border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Semester</label>
                        <select
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                        >
                            <option value="Ganjil">Ganjil</option>
                            <option value="Genap">Genap</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tahun Ajaran</label>
                        <input
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/40 w-28"
                        />
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        {generated > 0 && (
                            <button
                                onClick={exportAllToExcel}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-lg text-xs font-bold text-emerald-400 transition-all"
                            >
                                <Download size={12} />
                                Export Excel ({generated})
                            </button>
                        )}
                        <button
                            onClick={() => { initEntries(); generateAll(); }}
                            disabled={generatingAll}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-xs font-black text-white transition-all"
                        >
                            {generatingAll ? (
                                <Loader2 size={12} className="animate-spin" />
                            ) : (
                                <Users size={12} />
                            )}
                            {generatingAll ? 'Generating...' : 'Generate Semua'}
                        </button>
                    </div>
                </div>

                {/* Student List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {students.map((student) => {
                        const entry = entries.find((e) => e.id === student.id);
                        const isExpanded = expandedId === student.id;

                        return (
                            <div
                                key={student.id}
                                className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden"
                            >
                                <div className="flex items-center gap-3 p-4">
                                    <div
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                                            student.status === 'TUNTAS'
                                                ? 'bg-emerald-500/15 text-emerald-400'
                                                : 'bg-rose-500/15 text-rose-400'
                                        }`}
                                    >
                                        {student.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white truncate">{student.name}</p>
                                        <p className="text-[10px] text-slate-500">
                                            Nilai: {student.avgScore.toFixed(1)} · Hadir: {student.attendanceRate.toFixed(0)}%
                                        </p>
                                    </div>

                                    {/* Status & Actions */}
                                    {entry?.loading ? (
                                        <Loader2 size={16} className="animate-spin text-indigo-400 shrink-0" />
                                    ) : entry?.narrative ? (
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                                onClick={() => copyToClipboard(entry.id, entry.narrative!)}
                                                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                                                title="Salin teks"
                                            >
                                                {entry.copied ? (
                                                    <Check size={12} className="text-emerald-400" />
                                                ) : (
                                                    <Copy size={12} />
                                                )}
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setExpandedId(isExpanded ? null : student.id)
                                                }
                                                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                                            >
                                                {isExpanded ? (
                                                    <ChevronUp size={12} />
                                                ) : (
                                                    <ChevronDown size={12} />
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { if (!entry) initEntries(); generateOne(student.id); }}
                                            disabled={generatingAll}
                                            className="shrink-0 flex items-center gap-1 px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-lg text-[10px] font-bold text-indigo-400 transition-all disabled:opacity-40"
                                        >
                                            <FileText size={10} />
                                            Generate
                                        </button>
                                    )}
                                </div>

                                {/* Expanded Narrative */}
                                <AnimatePresence>
                                    {isExpanded && entry?.narrative && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4 pt-0 border-t border-white/5">
                                                <textarea
                                                    value={entry.narrative}
                                                    onChange={(ev) =>
                                                        setEntries((prev) =>
                                                            prev.map((e) =>
                                                                e.id === student.id
                                                                    ? { ...e, narrative: ev.target.value }
                                                                    : e
                                                            )
                                                        )
                                                    }
                                                    className="w-full mt-3 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-slate-200 leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                                                    rows={6}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}

                    {students.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                            <Users size={32} className="mb-3 opacity-40" />
                            <p className="text-sm">Pilih kelas dengan siswa terlebih dahulu</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
