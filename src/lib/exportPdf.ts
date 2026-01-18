/**
 * PDF Export Library
 * Utility functions for generating PDF reports in Math-LMS
 * Uses jsPDF + jsPDF-AutoTable for table generation
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ============================================================
// TYPES
// ============================================================

export interface StudentGrade {
    studentName: string;
    assignmentTitle: string;
    score: number;
    type: 'formatif' | 'sumatif' | 'keaktifan';
    feedback?: string;
    date: string;
}

export interface AttendanceRecord {
    studentName: string;
    date: string;
    status: 'hadir' | 'izin' | 'sakit' | 'alpa';
    time?: string;
}

export interface ReportCardData {
    studentName: string;
    className: string;
    semester: string;
    teacherName: string;
    grades: StudentGrade[];
    attendance: {
        hadir: number;
        izin: number;
        sakit: number;
        alpa: number;
    };
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

const getLetterGrade = (score: number): string => {
    if (score >= 85) return 'A';
    if (score >= 70) return 'B';
    if (score >= 55) return 'C';
    return 'D';
};

const addHeader = (doc: jsPDF, title: string, subtitle?: string): void => {
    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 105, 25, { align: 'center' });

    // Subtitle
    if (subtitle) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(subtitle, 105, 33, { align: 'center' });
    }

    // Line separator
    doc.setDrawColor(100, 100, 100);
    doc.line(20, 38, 190, 38);
};

const addFooter = (doc: jsPDF, pageNumber: number): void => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Halaman ${pageNumber}`, 105, 290, { align: 'center' });
    doc.text(`Dibuat: ${new Date().toLocaleDateString('id-ID')}`, 190, 290, { align: 'right' });
};

// ============================================================
// EXPORT FUNCTIONS
// ============================================================

/**
 * Export grades to PDF
 */
export function exportGradesToPdf(
    grades: StudentGrade[],
    className: string,
    teacherName: string
): void {
    const doc = new jsPDF();

    addHeader(doc, 'LAPORAN NILAI SISWA', `Kelas: ${className} | Guru: ${teacherName}`);

    // Summary stats
    const avgScore = grades.length > 0
        ? Math.round(grades.reduce((sum, g) => sum + g.score, 0) / grades.length)
        : 0;
    const highestScore = grades.length > 0 ? Math.max(...grades.map(g => g.score)) : 0;

    doc.setFontSize(10);
    doc.text(`Total Nilai: ${grades.length} | Rata-rata: ${avgScore} | Tertinggi: ${highestScore}`, 20, 48);

    // Table
    autoTable(doc, {
        startY: 55,
        head: [['No', 'Nama Siswa', 'Tugas', 'Nilai', 'Grade', 'Tipe', 'Tanggal']],
        body: grades.map((g, i) => [
            (i + 1).toString(),
            g.studentName,
            g.assignmentTitle,
            g.score.toString(),
            getLetterGrade(g.score),
            g.type.charAt(0).toUpperCase() + g.type.slice(1),
            formatDate(g.date)
        ]),
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [79, 70, 229] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    addFooter(doc, 1);
    doc.save(`Nilai_${className}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Export attendance to PDF
 */
export function exportAttendanceToPdf(
    records: AttendanceRecord[],
    className: string,
    period: string
): void {
    const doc = new jsPDF();

    addHeader(doc, 'LAPORAN KEHADIRAN SISWA', `Kelas: ${className} | Periode: ${period}`);

    // Summary
    const stats = {
        hadir: records.filter(r => r.status === 'hadir').length,
        izin: records.filter(r => r.status === 'izin').length,
        sakit: records.filter(r => r.status === 'sakit').length,
        alpa: records.filter(r => r.status === 'alpa').length
    };
    const total = stats.hadir + stats.izin + stats.sakit + stats.alpa;
    const rate = total > 0 ? Math.round((stats.hadir / total) * 100) : 0;

    doc.setFontSize(10);
    doc.text(`Tingkat Kehadiran: ${rate}% | Hadir: ${stats.hadir} | Izin: ${stats.izin} | Sakit: ${stats.sakit} | Alpha: ${stats.alpa}`, 20, 48);

    // Table
    autoTable(doc, {
        startY: 55,
        head: [['No', 'Nama Siswa', 'Tanggal', 'Status', 'Waktu']],
        body: records.map((r, i) => [
            (i + 1).toString(),
            r.studentName,
            formatDate(r.date),
            r.status.charAt(0).toUpperCase() + r.status.slice(1),
            r.time || '-'
        ]),
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [79, 70, 229] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didParseCell: (data) => {
            // Color-code status column
            if (data.section === 'body' && data.column.index === 3) {
                const status = data.cell.raw?.toString().toLowerCase();
                if (status === 'hadir') data.cell.styles.textColor = [16, 185, 129];
                else if (status === 'alpa') data.cell.styles.textColor = [239, 68, 68];
                else if (status === 'sakit') data.cell.styles.textColor = [245, 158, 11];
                else if (status === 'izin') data.cell.styles.textColor = [59, 130, 246];
            }
        }
    });

    addFooter(doc, 1);
    doc.save(`Kehadiran_${className}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Generate student report card (Rapor)
 */
export function generateReportCard(data: ReportCardData): void {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('LAPORAN HASIL BELAJAR', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('(Rapor Siswa)', 105, 28, { align: 'center' });

    doc.line(20, 35, 190, 35);

    // Student Info
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    let y = 45;

    doc.text(`Nama Siswa  : ${data.studentName}`, 20, y);
    doc.text(`Kelas       : ${data.className}`, 20, y + 8);
    doc.text(`Semester    : ${data.semester}`, 20, y + 16);
    doc.text(`Wali Kelas  : ${data.teacherName}`, 120, y);

    // Grades Table
    y = 75;
    doc.setFont('helvetica', 'bold');
    doc.text('A. NILAI AKADEMIK', 20, y);

    const gradesByType = {
        formatif: data.grades.filter(g => g.type === 'formatif'),
        sumatif: data.grades.filter(g => g.type === 'sumatif'),
        keaktifan: data.grades.filter(g => g.type === 'keaktifan')
    };

    const avgFormatif = gradesByType.formatif.length > 0
        ? Math.round(gradesByType.formatif.reduce((s, g) => s + g.score, 0) / gradesByType.formatif.length)
        : 0;
    const avgSumatif = gradesByType.sumatif.length > 0
        ? Math.round(gradesByType.sumatif.reduce((s, g) => s + g.score, 0) / gradesByType.sumatif.length)
        : 0;
    const avgKeaktifan = gradesByType.keaktifan.length > 0
        ? Math.round(gradesByType.keaktifan.reduce((s, g) => s + g.score, 0) / gradesByType.keaktifan.length)
        : 0;

    autoTable(doc, {
        startY: y + 5,
        head: [['Komponen Penilaian', 'Nilai', 'Grade', 'Keterangan']],
        body: [
            ['Penilaian Formatif', avgFormatif.toString(), getLetterGrade(avgFormatif), `${gradesByType.formatif.length} tugas`],
            ['Penilaian Sumatif', avgSumatif.toString(), getLetterGrade(avgSumatif), `${gradesByType.sumatif.length} ujian`],
            ['Keaktifan', avgKeaktifan.toString(), getLetterGrade(avgKeaktifan), `${gradesByType.keaktifan.length} penilaian`],
        ],
        styles: { fontSize: 10 },
        headStyles: { fillColor: [79, 70, 229] },
    });

    // Attendance Summary
    y = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 120;
    y += 15;

    doc.setFont('helvetica', 'bold');
    doc.text('B. KEHADIRAN', 20, y);

    const totalAttendance = data.attendance.hadir + data.attendance.izin + data.attendance.sakit + data.attendance.alpa;
    const attendanceRate = totalAttendance > 0 ? Math.round((data.attendance.hadir / totalAttendance) * 100) : 0;

    autoTable(doc, {
        startY: y + 5,
        head: [['Hadir', 'Izin', 'Sakit', 'Alpha', 'Total', 'Persentase']],
        body: [[
            data.attendance.hadir.toString(),
            data.attendance.izin.toString(),
            data.attendance.sakit.toString(),
            data.attendance.alpa.toString(),
            totalAttendance.toString(),
            `${attendanceRate}%`
        ]],
        styles: { fontSize: 10, halign: 'center' },
        headStyles: { fillColor: [16, 185, 129] },
    });

    // Signature section
    y = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 160;
    y += 25;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Mengetahui,`, 150, y, { align: 'center' });
    doc.text(`Wali Kelas`, 150, y + 6, { align: 'center' });
    doc.text(`_________________________`, 150, y + 35, { align: 'center' });
    doc.text(data.teacherName, 150, y + 42, { align: 'center' });

    addFooter(doc, 1);
    doc.save(`Rapor_${data.studentName.replace(/\s+/g, '_')}_${data.semester}.pdf`);
}
