import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Fix for TypeScript missing autoTable method on jsPDF
declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

interface ReportData {
    studentName: string;
    className: string;
    schoolName: string;
    semester: string;
    academicYear: string;
    grades: {
        subject: string;
        score: number;
        category: string;
        status: string;
    }[];
    attendance: {
        present: number;
        absent: number;
        sick: number;
        totalDays: number;
    };
    teacherName: string;
}

export async function generateReportCardPDF(data: ReportData) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. HEADER
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(data.schoolName.toUpperCase(), pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Laporan Hasil Belajar Siswa (Rapor)', pageWidth / 2, 28, { align: 'center' });
    
    doc.setLineWidth(0.5);
    doc.line(20, 32, pageWidth - 20, 32);

    // 2. STUDENT INFO
    doc.setFontSize(10);
    const leftCol = 20;
    const rightCol = pageWidth / 2 + 10;
    
    doc.text(`Nama Siswa: ${data.studentName}`, leftCol, 45);
    doc.text(`Kelas: ${data.className}`, leftCol, 52);
    
    doc.text(`Semester: ${data.semester}`, rightCol, 45);
    doc.text(`Tahun Ajaran: ${data.academicYear}`, rightCol, 52);

    // 3. ACADEMIC TABLE
    const tableBody = data.grades.map((g, i) => [
        i + 1,
        g.subject,
        g.category,
        g.score,
        g.status
    ]);

    doc.autoTable({
        startY: 65,
        head: [['No', 'Mata Pelajaran', 'Kategori', 'Nilai', 'Keterangan']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' }, // Indigo-600
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
            0: { cellWidth: 10 },
            3: { fontStyle: 'bold', halign: 'center' },
            4: { halign: 'center' }
        }
    });

    // 4. ATTENDANCE SUMMARY
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Kehadiran & Kedisiplinan', 20, finalY + 15);
    
    doc.autoTable({
        startY: finalY + 20,
        body: [
            ['Hadir', `${data.attendance.present} Hari`],
            ['Sakit', `${data.attendance.sick} Hari`],
            ['Alpa/Tanpa Keterangan', `${data.attendance.absent} Hari`],
            ['Persentase Kehadiran', `${Math.round((data.attendance.present / data.attendance.totalDays) * 100)}%`]
        ],
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
    });

    // 5. SIGNATURES
    const signatureY = pageWidth > 200 ? 250 : 230; // Handle page overflow if needed
    
    doc.setFontSize(10);
    doc.text('Mengetahui,', 20, signatureY);
    doc.text('Orang Tua/Wali,', 20, signatureY + 7);
    doc.line(20, signatureY + 35, 70, signatureY + 35);
    
    doc.text(`Jakarta, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth - 80, signatureY);
    doc.text('Guru Mata Pelajaran,', pageWidth - 80, signatureY + 7);
    doc.setFont('helvetica', 'bold');
    doc.text(data.teacherName, pageWidth - 80, signatureY + 35);
    doc.setFont('helvetica', 'normal');
    doc.line(pageWidth - 80, signatureY + 37, pageWidth - 20, signatureY + 37);

    // 6. FOOTER
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Dicetak otomatis melalui Klolakelas Universe pada ${new Date().toLocaleString()}`, pageWidth / 2, 285, { align: 'center' });

    // SAVE
    doc.save(`Rapor_${data.studentName.replace(/\s+/g, '_')}_${data.semester}.pdf`);
}
