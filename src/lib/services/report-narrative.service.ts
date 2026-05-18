/**
 * Report Narrative AI Service
 * USP #3 — Rapor Naratif AI
 *
 * Generates formal Indonesian narrative descriptions for student report cards
 * based on their academic data (grades, attendance, activity).
 */

export interface StudentNarrativeData {
    name: string;
    avgScore: number;
    attendanceRate: number; // 0-100
    submissionRate: number; // 0-100
    status: 'TUNTAS' | 'REMEDIAL';
    className: string;
    semester?: string;
}

export interface NarrativeResult {
    studentName: string;
    narrative: string;
    loading: boolean;
    error?: string;
}

/**
 * Safely extract content from OpenRouter response
 */
function extractContent(data: unknown): string | null {
    if (!data || typeof data !== 'object') return null;
    const obj = data as Record<string, unknown>;
    if (!Array.isArray(obj.choices) || obj.choices.length === 0) return null;
    const choice = obj.choices[0] as Record<string, unknown> | undefined;
    if (!choice?.message || typeof choice.message !== 'object') return null;
    const message = choice.message as Record<string, unknown>;
    return typeof message.content === 'string' ? message.content : null;
}

/**
 * Generate a formal narrative description for a single student's report card.
 */
export async function generateStudentNarrative(
    student: StudentNarrativeData
): Promise<string | null> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        console.warn('[Narrative Service] OpenRouter API key not configured');
        return null;
    }

    const kehadiranStatus =
        student.attendanceRate >= 90
            ? 'sangat baik'
            : student.attendanceRate >= 75
            ? 'cukup baik'
            : 'perlu ditingkatkan';

    const nilaiStatus =
        student.avgScore >= 85
            ? 'sangat memuaskan'
            : student.avgScore >= 75
            ? 'memuaskan'
            : student.avgScore >= 60
            ? 'cukup'
            : 'perlu bimbingan intensif';

    const systemPrompt = `Anda adalah wali kelas profesional yang menulis narasi rapor siswa dalam bahasa Indonesia yang formal, hangat, dan memotivasi.

ATURAN PENULISAN:
1. Gunakan 3 paragraf: (1) pencapaian akademik, (2) kehadiran & kedisiplinan, (3) pesan motivasi & rekomendasi
2. Bahasa formal namun tidak kaku, hindari kata "sangat" berulang
3. Sebutkan nama siswa minimal 2 kali
4. Spesifik berdasarkan angka yang diberikan
5. Panjang: 150-200 kata total
6. JANGAN gunakan poin/bullet, harus paragraf mengalir`;

    const userMessage = `Tulis narasi rapor untuk:
- Nama: ${student.name}
- Kelas: ${student.className}
- Rata-rata Nilai: ${student.avgScore.toFixed(1)} (${nilaiStatus})
- Status: ${student.status}
- Tingkat Kehadiran: ${student.attendanceRate.toFixed(0)}% (${kehadiranStatus})
- Tingkat Pengumpulan Tugas: ${student.submissionRate.toFixed(0)}%
- Semester: ${student.semester || 'Ganjil'}`;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://klolakelas.com',
                'X-Title': 'Klolakelas Rapor Naratif',
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat-v3-0324:free',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage },
                ],
                max_tokens: 600,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            console.error(`[Narrative Service] API error: ${response.status}`);
            return null;
        }

        const data = await response.json();
        return extractContent(data);
    } catch (error) {
        console.error('[Narrative Service] Error generating narrative:', error);
        return null;
    }
}

/**
 * Generate narratives for all students in a class (batch processing).
 * Returns a map of studentId -> narrative text.
 */
export async function generateBatchNarratives(
    students: (StudentNarrativeData & { id: string })[]
): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    // Process sequentially to avoid rate limits
    for (const student of students) {
        const narrative = await generateStudentNarrative(student);
        if (narrative) {
            results.set(student.id, narrative);
        }
        // Small delay to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 300));
    }

    return results;
}
