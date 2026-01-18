'use client';

import { useCallback } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

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
        // Dynamic import xlsx - reduces initial bundle size by ~300KB
        const XLSX = await import('xlsx');

        const data = students.map((s, idx) => ({
            'No': idx + 1,
            'Nama Siswa': s.name,
            'Email': s.email || '-',
            'Rata-rata Nilai': s.avg || '-',
            'Status': s.status || '-'
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Daftar Siswa');
        ws['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 30 }, { wch: 15 }, { wch: 15 }];
        XLSX.writeFile(wb, `Siswa_${className}_${formatDate()}.xlsx`);
    }, []);

    const exportAttendance = useCallback(async (records: AttendanceRecord[], className: string) => {
        const XLSX = await import('xlsx');

        const data = records.map((r, idx) => ({
            'No': idx + 1,
            'Nama Siswa': r.studentName,
            'Tanggal': r.date,
            'Status': r.status.toUpperCase()
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Rekap Kehadiran');
        ws['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 15 }, { wch: 15 }];
        XLSX.writeFile(wb, `Kehadiran_${className}_${formatDate()}.xlsx`);
    }, []);

    const exportGrades = useCallback(async (grades: Grade[], className: string) => {
        const XLSX = await import('xlsx');

        const data = grades.map((g, idx) => ({
            'No': idx + 1,
            'Nama Siswa': g.studentName,
            'Tugas': g.assignmentTitle,
            'Nilai': g.score,
            'Jenis': g.type === 'formatif' ? 'Formatif' : 'Sumatif',
            'Feedback': g.feedback || '-'
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Daftar Nilai');
        ws['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 35 }, { wch: 10 }, { wch: 15 }, { wch: 40 }];
        XLSX.writeFile(wb, `Nilai_${className}_${formatDate()}.xlsx`);
    }, []);

    const exportAll = useCallback(async (
        data: { students: Student[]; attendance: AttendanceRecord[]; grades: Grade[] },
        className: string
    ) => {
        const XLSX = await import('xlsx');
        const wb = XLSX.utils.book_new();

        // Students sheet
        const studentsData = data.students.map((s, idx) => ({
            'No': idx + 1,
            'Nama Siswa': s.name,
            'Email': s.email || '-',
            'Rata-rata': s.avg || '-',
            'Status': s.status || '-'
        }));
        const ws1 = XLSX.utils.json_to_sheet(studentsData);
        ws1['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 30 }, { wch: 15 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, ws1, 'Siswa');

        // Attendance sheet
        const attendanceData = data.attendance.map((r, idx) => ({
            'No': idx + 1,
            'Nama Siswa': r.studentName,
            'Tanggal': r.date,
            'Status': r.status.toUpperCase()
        }));
        const ws2 = XLSX.utils.json_to_sheet(attendanceData);
        ws2['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 15 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, ws2, 'Kehadiran');

        // Grades sheet
        const gradesData = data.grades.map((g, idx) => ({
            'No': idx + 1,
            'Nama Siswa': g.studentName,
            'Tugas': g.assignmentTitle,
            'Nilai': g.score,
            'Jenis': g.type === 'formatif' ? 'Formatif' : 'Sumatif'
        }));
        const ws3 = XLSX.utils.json_to_sheet(gradesData);
        ws3['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 35 }, { wch: 10 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, ws3, 'Nilai');

        XLSX.writeFile(wb, `LaporanKelas_${className}_${formatDate()}.xlsx`);
    }, []);

    return { exportStudents, exportAttendance, exportGrades, exportAll };
}
