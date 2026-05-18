/**
 * Soal Generator AI Service
 * 
 * Generates quiz questions (PG, Essay, True/False) from a topic
 * using OpenRouter (Gemini 2.0 Flash).
 */

export type SoalType = 'pilihan_ganda' | 'essay' | 'benar_salah' | 'isian_singkat';
export type TingkatKesulitan = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6';

export interface SoalPG {
    type: 'pilihan_ganda';
    pertanyaan: string;
    opsi: { key: 'A' | 'B' | 'C' | 'D'; teks: string }[];
    jawaban: 'A' | 'B' | 'C' | 'D';
    pembahasan: string;
    tingkat: TingkatKesulitan;
}

export interface SoalEssay {
    type: 'essay';
    pertanyaan: string;
    panduan_jawaban: string;
    skor_max: number;
    tingkat: TingkatKesulitan;
}

export interface SoalBenarSalah {
    type: 'benar_salah';
    pernyataan: string;
    jawaban: boolean;
    penjelasan: string;
    tingkat: TingkatKesulitan;
}

export interface SoalIsian {
    type: 'isian_singkat';
    pertanyaan: string;
    jawaban: string;
    tingkat: TingkatKesulitan;
}

export type SoalItem = SoalPG | SoalEssay | SoalBenarSalah | SoalIsian;

export interface GeneratorInput {
    topik: string;
    mataPelajaran: string;
    kelas: string; // e.g. "X", "XI", "12"
    jumlah: number;
    tipe: SoalType;
    tingkat: TingkatKesulitan;
    konteks?: string; // extra context/KD
}

const BLOOM_LABEL: Record<TingkatKesulitan, string> = {
    C1: 'Mengingat', C2: 'Memahami', C3: 'Mengaplikasikan',
    C4: 'Menganalisis', C5: 'Mengevaluasi', C6: 'Mencipta',
};

function buildGeneratorPrompt(input: GeneratorInput): string {
    const typeMap: Record<SoalType, string> = {
        pilihan_ganda: `soal PILIHAN GANDA dengan 4 opsi (A,B,C,D), kunci jawaban, dan pembahasan singkat`,
        essay: `soal ESSAY dengan panduan jawaban dan skor maksimal`,
        benar_salah: `soal BENAR/SALAH berupa pernyataan dengan penjelasan`,
        isian_singkat: `soal ISIAN SINGKAT dengan kunci jawaban`,
    };

    return `Buatkan ${input.jumlah} ${typeMap[input.tipe]} untuk:
- Mata Pelajaran: ${input.mataPelajaran}
- Topik/KD: ${input.topik}
- Kelas: ${input.kelas} SMA/SMK
- Taksonomi Bloom: ${input.tingkat} (${BLOOM_LABEL[input.tingkat]})
${input.konteks ? `- Konteks tambahan: ${input.konteks}` : ''}

Output HANYA JSON array dengan format:
${input.tipe === 'pilihan_ganda' ? `[{"type":"pilihan_ganda","pertanyaan":"...","opsi":[{"key":"A","teks":"..."},{"key":"B","teks":"..."},{"key":"C","teks":"..."},{"key":"D","teks":"..."}],"jawaban":"A","pembahasan":"...","tingkat":"${input.tingkat}"}]` : ''}
${input.tipe === 'essay' ? `[{"type":"essay","pertanyaan":"...","panduan_jawaban":"...","skor_max":25,"tingkat":"${input.tingkat}"}]` : ''}
${input.tipe === 'benar_salah' ? `[{"type":"benar_salah","pernyataan":"...","jawaban":true,"penjelasan":"...","tingkat":"${input.tingkat}"}]` : ''}
${input.tipe === 'isian_singkat' ? `[{"type":"isian_singkat","pertanyaan":"...","jawaban":"...","tingkat":"${input.tingkat}"}]` : ''}

Buat soal yang berkualitas, sesuai kurikulum Merdeka Belajar, dan tidak menyontek soal yang sudah dikenal.`;
}

// Demo fallback data
function buildDemoSoal(input: GeneratorInput): SoalItem[] {
    if (input.tipe === 'pilihan_ganda') {
        return Array.from({ length: input.jumlah }, (_, i) => ({
            type: 'pilihan_ganda' as const,
            pertanyaan: `[Demo] Soal ${i + 1} tentang ${input.topik}: Manakah pernyataan yang paling tepat mengenai ${input.topik}?`,
            opsi: [
                { key: 'A' as const, teks: `Pernyataan pertama tentang ${input.topik}` },
                { key: 'B' as const, teks: `Pernyataan kedua tentang ${input.topik}` },
                { key: 'C' as const, teks: `Pernyataan ketiga tentang ${input.topik}` },
                { key: 'D' as const, teks: `Pernyataan keempat tentang ${input.topik}` },
            ],
            jawaban: 'A' as const,
            pembahasan: `[Demo] Isi API key OpenRouter di .env.local untuk mengaktifkan pembuatan soal nyata.`,
            tingkat: input.tingkat,
        }));
    }
    return Array.from({ length: input.jumlah }, (_, i) => ({
        type: 'essay' as const,
        pertanyaan: `[Demo] Soal essay ${i + 1}: Jelaskan konsep ${input.topik} dan berikan contoh penerapannya!`,
        panduan_jawaban: `Siswa harus menjelaskan konsep ${input.topik} secara tepat beserta contoh yang relevan.`,
        skor_max: 25,
        tingkat: input.tingkat,
    }));
}

/**
 * Generate soal using AI
 */
export async function generateSoal(input: GeneratorInput): Promise<SoalItem[]> {
    try {
        const response = await fetch('/api/ai/soal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: buildGeneratorPrompt(input),
            }),
        });

        if (!response.ok) return buildDemoSoal(input);

        const data = await response.json();
        const raw = data.content;
        
        if (!raw) return buildDemoSoal(input);

        // Parse — the model may return {soal: [...]} or just [...]
        const parsed = JSON.parse(raw);
        const arr = Array.isArray(parsed) ? parsed : (parsed.soal ?? parsed.questions ?? Object.values(parsed)[0] ?? []);
        return Array.isArray(arr) ? arr as SoalItem[] : buildDemoSoal(input);
    } catch (err) {
        console.error('[SoalGenerator] Error:', err);
        return buildDemoSoal(input);
    }
}
