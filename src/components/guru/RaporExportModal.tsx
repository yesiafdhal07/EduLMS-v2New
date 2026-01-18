'use client';

import { useState, useEffect } from 'react';
import { X, Download, FileText, Loader2, User, Users, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Student {
    id: string;
    name: string;
    email: string;
}

interface RaporExportModalProps {
    classId: string;
    className: string;
    subjectName?: string;
    teacherName?: string;
    isOpen: boolean;
    onClose: () => void;
}

type ExportMode = 'single' | 'class';

interface GradeData {
    studentId: string;
    studentName: string;
    assignments: { name: string; score: number; maxScore: number }[];
    attendance: { present: number; late: number; absent: number; excused: number };
    average: number;
    grade: string;
}

export function RaporExportModal({
    classId,
    className,
    subjectName = 'Mata Pelajaran',
    teacherName = 'Guru',
    isOpen,
    onClose,
}: RaporExportModalProps) {
    const [mode, setMode] = useState<ExportMode>('class');
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchStudents();
        }
    }, [isOpen, classId]);

    async function fetchStudents() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('class_members')
                .select(`user_id, users!inner(id, full_name, email)`)
                .eq('class_id', classId);

            if (error) throw error;

            const studentList = (data || []).map((m: any) => ({
                id: m.users.id,
                name: m.users.full_name,
                email: m.users.email,
            }));

            setStudents(studentList);
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Gagal memuat data siswa');
        } finally {
            setLoading(false);
        }
    }

    async function handleExport() {
        setExporting(true);
        
        try {
            // Fetch grade data
            const studentIds = mode === 'single' && selectedStudentId 
                ? [selectedStudentId] 
                : students.map(s => s.id);

            const gradeData = await fetchGradeData(studentIds);
            
            // Generate PDF
            generatePDF(gradeData);
            
            toast.success('Rapor berhasil di-export!');
            onClose();
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Gagal mengexport rapor');
        } finally {
            setExporting(false);
        }
    }

    async function fetchGradeData(studentIds: string[]): Promise<GradeData[]> {
        const result: GradeData[] = [];

        for (const studentId of studentIds) {
            const student = students.find(s => s.id === studentId);
            if (!student) continue;

            // Fetch submissions and grades
            const { data: submissions } = await supabase
                .from('submissions')
                .select(`
                    grade, 
                    assignments!inner(title, max_score, subjects!inner(class_id))
                `)
                .eq('student_id', studentId)
                .eq('assignments.subjects.class_id', classId);

            // Fetch attendance
            const { data: attendance } = await supabase
                .from('attendance_records')
                .select(`
                    status,
                    attendance!inner(class_id)
                `)
                .eq('student_id', studentId)
                .eq('attendance.class_id', classId);

            // Process assignments
            const assignments = (submissions || []).map((s: any) => ({
                name: s.assignments?.title || 'Tugas',
                score: s.grade || 0,
                maxScore: s.assignments?.max_score || 100,
            }));

            // Process attendance
            const attendanceSummary = {
                present: 0,
                late: 0,
                absent: 0,
                excused: 0,
            };
            (attendance || []).forEach((a: any) => {
                const status = a.status?.toLowerCase();
                if (status === 'hadir' || status === 'present') attendanceSummary.present++;
                else if (status === 'terlambat' || status === 'late') attendanceSummary.late++;
                else if (status === 'izin' || status === 'excused' || status === 'sakit') attendanceSummary.excused++;
                else attendanceSummary.absent++;
            });

            // Calculate average
            const totalScore = assignments.reduce((acc, a) => acc + a.score, 0);
            const average = assignments.length > 0 ? totalScore / assignments.length : 0;
            const grade = getLetterGrade(average);

            result.push({
                studentId,
                studentName: student.name,
                assignments,
                attendance: attendanceSummary,
                average,
                grade,
            });
        }

        return result;
    }

    function getLetterGrade(score: number): string {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'E';
    }

    function generatePDF(gradeData: GradeData[]) {
        // Create printable HTML content
        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Rapor ${className}</title>
                <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: 'Arial', sans-serif; padding: 20px; color: #333; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                    .header h1 { font-size: 24px; margin-bottom: 10px; }
                    .header p { color: #666; }
                    .student-section { page-break-after: always; margin-bottom: 40px; }
                    .student-section:last-child { page-break-after: auto; }
                    .student-name { font-size: 18px; font-weight: bold; margin-bottom: 15px; padding: 10px; background: #f5f5f5; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background: #f0f0f0; font-weight: bold; }
                    .summary { display: flex; gap: 20px; margin-top: 20px; }
                    .summary-box { flex: 1; padding: 15px; border: 1px solid #ddd; text-align: center; }
                    .summary-box .value { font-size: 24px; font-weight: bold; color: #4f46e5; }
                    .grade-a { color: #059669; }
                    .grade-b { color: #3b82f6; }
                    .grade-c { color: #f59e0b; }
                    .grade-d { color: #ef4444; }
                    .grade-e { color: #dc2626; }
                    .footer { text-align: right; margin-top: 30px; font-style: italic; color: #666; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>LAPORAN HASIL BELAJAR</h1>
                    <p><strong>${className}</strong> | ${subjectName}</p>
                    <p>Guru: ${teacherName}</p>
                </div>

                ${gradeData.map(student => `
                    <div class="student-section">
                        <div class="student-name">📚 ${student.studentName}</div>
                        
                        <h3>Nilai Tugas</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Tugas</th>
                                    <th>Nilai</th>
                                    <th>Maks</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${student.assignments.length > 0 
                                    ? student.assignments.map((a, i) => `
                                        <tr>
                                            <td>${i + 1}</td>
                                            <td>${a.name}</td>
                                            <td>${a.score}</td>
                                            <td>${a.maxScore}</td>
                                        </tr>
                                    `).join('')
                                    : '<tr><td colspan="4" style="text-align:center">Belum ada nilai</td></tr>'
                                }
                            </tbody>
                        </table>

                        <h3>Kehadiran</h3>
                        <table>
                            <tr>
                                <th>Hadir</th>
                                <th>Terlambat</th>
                                <th>Izin/Sakit</th>
                                <th>Alpha</th>
                            </tr>
                            <tr>
                                <td>${student.attendance.present}</td>
                                <td>${student.attendance.late}</td>
                                <td>${student.attendance.excused}</td>
                                <td>${student.attendance.absent}</td>
                            </tr>
                        </table>

                        <div class="summary">
                            <div class="summary-box">
                                <div>Rata-rata</div>
                                <div class="value">${student.average.toFixed(1)}</div>
                            </div>
                            <div class="summary-box">
                                <div>Predikat</div>
                                <div class="value grade-${student.grade.toLowerCase()}">${student.grade}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}

                <div class="footer">
                    Digenerate oleh EduLMS pada ${new Date().toLocaleDateString('id-ID', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </div>
            </body>
            </html>
        `;

        // Open in new window for printing
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(content);
            printWindow.document.close();
            printWindow.onload = () => {
                printWindow.print();
            };
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                            <FileText className="text-purple-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Export Rapor PDF</h2>
                            <p className="text-sm text-slate-400">{className}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Mode Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-300">Pilih Mode Export</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setMode('class')}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                    mode === 'class'
                                        ? 'border-indigo-500 bg-indigo-500/10'
                                        : 'border-white/10 hover:border-white/30'
                                }`}
                            >
                                <Users className={`w-8 h-8 mx-auto mb-2 ${mode === 'class' ? 'text-indigo-400' : 'text-slate-500'}`} />
                                <p className={`font-medium ${mode === 'class' ? 'text-white' : 'text-slate-400'}`}>
                                    Seluruh Kelas
                                </p>
                                <p className="text-xs text-slate-500">{students.length} siswa</p>
                            </button>
                            <button
                                onClick={() => setMode('single')}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                    mode === 'single'
                                        ? 'border-indigo-500 bg-indigo-500/10'
                                        : 'border-white/10 hover:border-white/30'
                                }`}
                            >
                                <User className={`w-8 h-8 mx-auto mb-2 ${mode === 'single' ? 'text-indigo-400' : 'text-slate-500'}`} />
                                <p className={`font-medium ${mode === 'single' ? 'text-white' : 'text-slate-400'}`}>
                                    Siswa Tertentu
                                </p>
                                <p className="text-xs text-slate-500">Pilih 1 siswa</p>
                            </button>
                        </div>
                    </div>

                    {/* Student Selection (for single mode) */}
                    {mode === 'single' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Pilih Siswa</label>
                            {loading ? (
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Loader2 className="animate-spin" size={16} />
                                    Memuat...
                                </div>
                            ) : (
                                <div className="max-h-48 overflow-y-auto space-y-1 border border-white/10 rounded-xl p-2">
                                    {students.map(student => (
                                        <button
                                            key={student.id}
                                            onClick={() => setSelectedStudentId(student.id)}
                                            className={`w-full p-3 rounded-lg text-left transition-all flex items-center gap-3 ${
                                                selectedStudentId === student.id
                                                    ? 'bg-indigo-500/20 border border-indigo-500/50'
                                                    : 'hover:bg-white/5'
                                            }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                selectedStudentId === student.id
                                                    ? 'border-indigo-500 bg-indigo-500'
                                                    : 'border-white/30'
                                            }`}>
                                                {selectedStudentId === student.id && (
                                                    <Check size={12} className="text-white" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{student.name}</p>
                                                <p className="text-xs text-slate-500">{student.email}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={exporting || (mode === 'single' && !selectedStudentId)}
                        className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {exporting ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Mengexport...
                            </>
                        ) : (
                            <>
                                <Download size={18} />
                                Export PDF
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
