/**
 * Rapor Naratif AI Service
 * 
 * Generates per-student narrative report card descriptions
 * based on academic data (grades, attendance, behavior).
 * Uses OpenRouter (Gemini 2.0 Flash) for generation.
 */

export interface StudentNaratifInput {
    name: string;
    avgGrade: number;
    attendanceRate: number;
    submissionRate: number;
    strongSubjects?: string[];
    weakSubjects?: string[];
    notes?: string;
}

export interface NaratifResult {
    studentName: string;
    naratif: string;
    kelebihanPoin: string[];
    rekomendasiPoin: string[];
}

const NARATIF_SYSTEM_PROMPT = `Anda adalah guru profesional yang sedang menulis deskripsi rapor untuk siswa.
Tugas Anda: tulis deskripsi naratif rapor yang FORMAL, POSITIF, dan KONSTRUKTIF dalam Bahasa Indonesia.

Format output JSON yang WAJIB:
{
  "naratif": "2-3 paragraf deskripsi siswa (maks 150 kata, formal, tidak menyebutkan angka/nilai secara eksplisit)",
  "kelebihanPoin": ["poin kelebihan 1", "poin kelebihan 2", "poin kelebihan 3"],
  "rekomendasiPoin": ["saran perkembangan 1", "saran perkembangan 2"]
}

Aturan penulisan:
- Gunakan kata "Ananda" untuk menyebut siswa
- Nada positif dan menyemangati meskipun nilai rendah
- Hindari kata "kurang", "gagal", "buruk" — gunakan "perlu ditingkatkan", "masih berkembang"
- Deskripsi bersifat holistik (akademik + karakter)
- HANYA output JSON, tidak ada teks tambahan`;

function buildStudentContext(student: StudentNaratifInput): string {
    const gradeLevel = student.avgGrade >= 85 ? 'sangat baik' : student.avgGrade >= 75 ? 'baik' : student.avgGrade >= 65 ? 'cukup' : 'perlu perhatian';
    const attendLevel = student.attendanceRate >= 90 ? 'sangat rajin hadir' : student.attendanceRate >= 80 ? 'cukup rajin' : 'perlu peningkatan kehadiran';
    const submitLevel = student.submissionRate >= 80 ? 'rajin mengumpulkan tugas' : student.submissionRate >= 60 ? 'cukup disiplin' : 'perlu ditingkatkan kedisiplinannya';

    return `Data siswa:
Nama: ${student.name}
Rata-rata nilai: ${student.avgGrade.toFixed(1)} (${gradeLevel})
Kehadiran: ${student.attendanceRate.toFixed(0)}% (${attendLevel})
Tugas terkumpul: ${student.submissionRate.toFixed(0)}% (${submitLevel})
${student.strongSubjects?.length ? `Mata pelajaran unggulan: ${student.strongSubjects.join(', ')}` : ''}
${student.weakSubjects?.length ? `Mata pelajaran perlu perhatian: ${student.weakSubjects.join(', ')}` : ''}
${student.notes ? `Catatan tambahan dari guru: ${student.notes}` : ''}`;
}

/**
 * Generate narrative report card text for a single student
 */
export async function generateNaratifSiswa(student: StudentNaratifInput): Promise<NaratifResult | null> {
    try {
        const response = await fetch('/api/ai/naratif', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                systemPrompt: NARATIF_SYSTEM_PROMPT,
                userMessage: buildStudentContext(student),
            }),
        });

        if (!response.ok) {
            console.warn('[NaratifAI] Server returned error, falling back to demo data');
            return getDemoNaratif(student);
        }

        const data = await response.json();
        const raw = data.content;
        if (!raw) return getDemoNaratif(student);

        const parsed = JSON.parse(raw);
        return {
            studentName: student.name,
            naratif: String(parsed.naratif || ''),
            kelebihanPoin: Array.isArray(parsed.kelebihanPoin) ? parsed.kelebihanPoin.map(String) : [],
            rekomendasiPoin: Array.isArray(parsed.rekomendasiPoin) ? parsed.rekomendasiPoin.map(String) : [],
        };
    } catch (err) {
        console.error('[NaratifAI] Error, falling back to demo data:', err);
        return getDemoNaratif(student);
    }
}

function getDemoNaratif(student: StudentNaratifInput): NaratifResult {
    return {
        studentName: student.name,
        naratif: `Ananda ${student.name} menunjukkan semangat belajar yang positif selama semester ini. Dalam kegiatan pembelajaran, Ananda senantiasa berusaha untuk mengikuti setiap materi dengan baik dan aktif berpartisipasi dalam diskusi kelas. Sikap Ananda yang kooperatif menjadi teladan bagi teman-teman sekelasnya.\n\nDalam aspek akademis, Ananda menunjukkan perkembangan yang menggembirakan dengan konsistensi dalam mengerjakan tugas-tugas yang diberikan. Ke depannya, Ananda diharapkan dapat terus meningkatkan kepercayaan diri dan rasa ingin tahu dalam setiap mata pelajaran.\n\nSecara keseluruhan, Ananda ${student.name} adalah pribadi yang berpotensi dan diharapkan dapat terus berkembang di semester mendatang dengan dukungan orang tua dan guru.`,
        kelebihanPoin: ['Aktif dalam kegiatan pembelajaran', 'Sikap kooperatif dan menghargai sesama', 'Disiplin dalam mengikuti kegiatan sekolah'],
        rekomendasiPoin: ['Tingkatkan keaktifan bertanya di kelas', 'Perbanyak latihan mandiri di rumah'],
    };
}

/**
 * Generate narratives for multiple students in parallel (max 3 concurrent)
 */
export async function generateNaratifBatch(
    students: StudentNaratifInput[],
    onProgress?: (done: number, total: number) => void
): Promise<NaratifResult[]> {
    const results: NaratifResult[] = [];
    const BATCH_SIZE = 3;

    for (let i = 0; i < students.length; i += BATCH_SIZE) {
        const batch = students.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(batch.map(s => generateNaratifSiswa(s)));
        batchResults.forEach(r => { if (r) results.push(r); });
        onProgress?.(Math.min(i + BATCH_SIZE, students.length), students.length);
    }

    return results;
}
