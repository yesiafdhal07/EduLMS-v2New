/**
 * Question Generator AI Service
 * USP #2 — Soal Generator AI
 *
 * Generates quiz questions (PG, Essay, HOTS) from a topic/KD input
 * using OpenRouter/Gemini, formatted for direct insertion into quiz_questions table.
 */

export type QuestionType = 'multiple_choice' | 'essay' | 'hots';
export type DifficultyLevel = 'mudah' | 'sedang' | 'sulit';

export interface GeneratedQuestion {
    type: QuestionType;
    question: string;
    options?: string[]; // for multiple_choice: ['A. ...', 'B. ...', 'C. ...', 'D. ...']
    correctAnswer: string; // for MC: 'A'/'B'/'C'/'D', for essay: ideal answer
    explanation: string;
    difficulty: DifficultyLevel;
    bloomsLevel?: string; // C1-C6
}

export interface QuestionGeneratorParams {
    topic: string;
    kd?: string; // Kompetensi Dasar
    count: number;
    types: QuestionType[];
    difficulty: DifficultyLevel;
    gradeLevel?: string; // e.g. "X", "XI", "XII"
    subject?: string;
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
 * Generate quiz questions using AI based on topic and parameters.
 */
export async function generateQuestions(
    params: QuestionGeneratorParams
): Promise<GeneratedQuestion[] | null> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        console.warn('[Question Generator] OpenRouter API key not configured');
        return null;
    }

    const typeDescriptions: Record<QuestionType, string> = {
        multiple_choice: 'Pilihan Ganda (4 opsi, 1 jawaban benar)',
        essay: 'Esai (jawaban uraian, sertakan kunci jawaban ideal)',
        hots: 'HOTS - Higher Order Thinking Skills (analisis/evaluasi/kreasi, C4-C6 Bloom)',
    };

    const requestedTypes = params.types.map((t) => typeDescriptions[t]).join(', ');

    const systemPrompt = `Anda adalah guru berpengalaman yang membuat soal ujian berkualitas tinggi. 
Buat soal dalam bahasa Indonesia yang jelas, tidak ambigu, dan sesuai kurikulum.

ATURAN:
1. Setiap soal HARUS memiliki: question, type, options (jika PG), correctAnswer, explanation, difficulty, bloomsLevel
2. Untuk Pilihan Ganda: 4 opsi format ["A. ...", "B. ...", "C. ...", "D. ..."], correctAnswer = "A"/"B"/"C"/"D"
3. Untuk Esai: options = null, correctAnswer = kunci jawaban ideal 2-3 kalimat
4. Untuk HOTS: tandai bloomsLevel sebagai C4/C5/C6, pertanyaan harus membutuhkan analisis kritis
5. Tingkat kesulitan sesuai parameter yang diberikan
6. Berikan respon JSON array murni tanpa markdown`;

    const userMessage = `Buat ${params.count} soal dengan ketentuan:
- Topik: ${params.topic}
${params.kd ? `- Kompetensi Dasar: ${params.kd}` : ''}
${params.subject ? `- Mata Pelajaran: ${params.subject}` : ''}
${params.gradeLevel ? `- Tingkat Kelas: ${params.gradeLevel} SMA` : ''}
- Jenis Soal: ${requestedTypes}
- Tingkat Kesulitan: ${params.difficulty}

Format JSON array:
[{
  "type": "multiple_choice|essay|hots",
  "question": "...",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."] atau null,
  "correctAnswer": "...",
  "explanation": "...",
  "difficulty": "${params.difficulty}",
  "bloomsLevel": "C1-C6"
}]`;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://klolakelas.com',
                'X-Title': 'Klolakelas Soal Generator',
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat-v3-0324:free',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage },
                ],
                response_format: { type: 'json_object' },
                max_tokens: 4000,
                temperature: 0.8,
            }),
        });

        if (!response.ok) {
            console.error(`[Question Generator] API error: ${response.status}`);
            return null;
        }

        const data = await response.json();
        const content = extractContent(data);
        if (!content) return null;

        const parsed = JSON.parse(content);

        // Handle both array and wrapped array responses
        const raw: unknown[] = Array.isArray(parsed)
            ? parsed
            : Array.isArray(parsed.questions)
            ? parsed.questions
            : Array.isArray(parsed.soal)
            ? parsed.soal
            : [];

        // Validate and sanitize each question
        const validated: GeneratedQuestion[] = raw
            .filter(
                (q): q is Record<string, unknown> =>
                    q !== null && typeof q === 'object' && 'question' in q && 'type' in q
            )
            .map((q) => ({
                type: (['multiple_choice', 'essay', 'hots'].includes(q.type as string)
                    ? q.type
                    : 'multiple_choice') as QuestionType,
                question: String(q.question || '').slice(0, 1000),
                options: Array.isArray(q.options) ? q.options.map(String) : undefined,
                correctAnswer: String(q.correctAnswer || ''),
                explanation: String(q.explanation || ''),
                difficulty: (['mudah', 'sedang', 'sulit'].includes(q.difficulty as string)
                    ? q.difficulty
                    : params.difficulty) as DifficultyLevel,
                bloomsLevel: q.bloomsLevel ? String(q.bloomsLevel) : undefined,
            }))
            .slice(0, params.count);

        return validated;
    } catch (error) {
        console.error('[Question Generator] Error:', error);
        return null;
    }
}
