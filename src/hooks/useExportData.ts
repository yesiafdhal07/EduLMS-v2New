import { useCallback } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { exportToExcel, type ExcelColumn, type ExcelSheetConfig } from '@/lib/utils/excel';

interface Student {
    id: string;
    name: string;
    email?: string;
    avg?: string;
    status?: string;
}

interface AttendanceRecord {
    studentName: string;
    date: string;
    status: 'hadir' | 'izin' | 'sakit' | 'alpha';
}

interface Grade {
    studentName: string;
    assignmentTitle: string;
    score: number;
    type: string;
    feedback?: string;
}

interface UseExportDataReturn {
    exportStudents: (students: Student[], className: string) => Promise<void>;
    exportAttendance: (records: AttendanceRecord[], className: string) => Promise<void>;
    exportGrades: (grades: Grade[], className: string) => Promise<void>;
    exportAll: (data: { students: Student[]; attendance: AttendanceRecord[]; grades: Grade[] }, className: string) => Promise<void>;
}

export function useExportData(): UseExportDataReturn {
    const formatDate = () => format(new Date(), 'yyyy-MM-dd', { locale: id });

    const exportStudents = useCallback(async (students: Student[], className: string) => {
        const columns: ExcelColumn[] = [
            { header: 'No', key: 'no', width: 5 },
            { header: 'Nama Siswa', key: 'name', width: 30 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Rata-rata Nilai', key: 'avg', width: 15 },
            { header: 'Status', key: 'status', width: 15 }
        ];

        const data = students.map((s, idx) => ({
            no: idx + 1,
            name: s.name,
            email: s.email || '-',
            avg: s.avg || '-',
            status: s.status || '-'
        }));

        await exportToExcel(data, columns, `Siswa_${className}_${formatDate()}`, 'Daftar Siswa');
    }, []);

    const exportAttendance = useCallback(async (records: AttendanceRecord[], className: string) => {
        const columns: ExcelColumn[] = [
            { header: 'No', key: 'no', width: 5 },
            { header: 'Nama Siswa', key: 'name', width: 30 },
            { header: 'Tanggal', key: 'date', width: 15 },
            { header: 'Status', key: 'status', width: 15 }
        ];

        const data = records.map((r, idx) => ({
            no: idx + 1,
            name: r.studentName,
            date: r.date,
            status: r.status.toUpperCase()
        }));

        await exportToExcel(data, columns, `Kehadiran_${className}_${formatDate()}`, 'Rekap Kehadiran');
    }, []);

    const exportGrades = useCallback(async (grades: Grade[], className: string) => {
        const columns: ExcelColumn[] = [
            { header: 'No', key: 'no', width: 5 },
            { header: 'Nama Siswa', key: 'name', width: 30 },
            { header: 'Tugas', key: 'assignment', width: 35 },
            { header: 'Nilai', key: 'score', width: 10 },
            { header: 'Jenis', key: 'type', width: 15 },
            { header: 'Feedback', key: 'feedback', width: 40 }
        ];

        const data = grades.map((g, idx) => ({
            no: idx + 1,
            name: g.studentName,
            assignment: g.assignmentTitle,
            score: g.score,
            type: g.type === 'formatif' ? 'Formatif' : 'Sumatif',
            feedback: g.feedback || '-'
        }));

        await exportToExcel(data, columns, `Nilai_${className}_${formatDate()}`, 'Daftar Nilai');
    }, []);

    const exportAll = useCallback(async (
        data: { students: Student[]; attendance: AttendanceRecord[]; grades: Grade[] },
        className: string
    ) => {
        const sheets: ExcelSheetConfig[] = [
            {
                name: 'Siswa',
                columns: [
                    { header: 'No', key: 'no', width: 5 },
                    { header: 'Nama Siswa', key: 'name', width: 30 },
                    { header: 'Email', key: 'email', width: 30 },
                    { header: 'Rata-rata', key: 'avg', width: 15 },
                    { header: 'Status', key: 'status', width: 15 }
                ],
                data: data.students.map((s, idx) => ({
                    no: idx + 1,
                    name: s.name,
                    email: s.email || '-',
                    avg: s.avg || '-',
                    status: s.status || '-'
                }))
            },
            {
                name: 'Kehadiran',
                columns: [
                    { header: 'No', key: 'no', width: 5 },
                    { header: 'Nama Siswa', key: 'name', width: 30 },
                    { header: 'Tanggal', key: 'date', width: 15 },
                    { header: 'Status', key: 'status', width: 15 }
                ],
                data: data.attendance.map((r, idx) => ({
                    no: idx + 1,
                    name: r.studentName,
                    date: r.date,
                    status: r.status.toUpperCase()
                }))
            },
            {
                name: 'Nilai',
                columns: [
                    { header: 'No', key: 'no', width: 5 },
                    { header: 'Nama Siswa', key: 'name', width: 30 },
                    { header: 'Tugas', key: 'assignment', width: 35 },
                    { header: 'Nilai', key: 'score', width: 10 },
                    { header: 'Jenis', key: 'type', width: 15 }
                ],
                data: data.grades.map((g, idx) => ({
                    no: idx + 1,
                    name: g.studentName,
                    assignment: g.assignmentTitle,
                    score: g.score,
                    type: g.type === 'formatif' ? 'Formatif' : 'Sumatif'
                }))
            }
        ];

        await exportToExcel(sheets, `LaporanKelas_${className}_${formatDate()}`);
    }, []);

    return { exportStudents, exportAttendance, exportGrades, exportAll };
}
