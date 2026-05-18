/**
 * AI Chat Service
 * 
 * Provides conversational AI capabilities for all roles.
 * Context-aware: receives user role, class data, and statistics 
 * to provide relevant, personalized responses.
 * 
 * Powered by OpenRouter (Gemini 2.0 Flash)
 */

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

export interface ChatContext {
    userRole: 'guru' | 'admin' | 'kepala_sekolah' | 'siswa' | 'orang_tua';
    userName: string;
    schoolName?: string;
    className?: string;
    stats?: {
        totalStudents?: number;
        totalClasses?: number;
        averageGrade?: number;
        attendanceRate?: number;
        pendingGrades?: number;
    };
}

// Role-specific system prompts
const ROLE_PROMPTS: Record<string, string> = {
    guru: `Anda adalah "Kelas AI", asisten cerdas khusus untuk guru di platform Klolakelas. 
Anda membantu guru dengan:
- Membuat soal (PG, Essay, Isian Singkat) sesuai topik dan tingkat kesulitan
- Membuat rubrik penilaian
- Menganalisis data kelas (nilai, kehadiran, tren)
- Membuat RPP singkat dan rangkuman materi
- Memberikan saran strategi mengajar dan remedial
- Menulis deskripsi rapor per siswa
- Merekomendasikan materi pembelajaran

Panduan:
- Selalu gunakan bahasa Indonesia yang profesional dan hangat
- Berikan respons yang actionable dan spesifik
- Jika diminta membuat soal, berikan format yang siap pakai
- Jika menerima data statistik, analisis dengan insight yang bermakna
- Gunakan emoji secukupnya untuk membuat percakapan lebih hidup
- Maksimal 300 kata per respons kecuali membuat soal/RPP`,

    admin: `Anda adalah "Kelas AI", asisten platform untuk admin sekolah di Klolakelas.
Anda membantu admin dengan:
- Menganalisis data platform (pengguna aktif, tren penggunaan)
- Membuat laporan ringkas tentang aktivitas sekolah
- Memberikan insight operasional
- Menjawab pertanyaan tentang fitur platform
- Membantu troubleshooting masalah umum

Gunakan bahasa Indonesia yang profesional. Maksimal 200 kata per respons.`,

    kepala_sekolah: `Anda adalah "Kelas AI", penasihat strategis untuk kepala sekolah di Klolakelas.
Anda membantu kepala sekolah dengan:
- Membuat rangkuman eksekutif kinerja sekolah
- Menganalisis tren akademik lintas kelas
- Memberikan rekomendasi kebijakan berbasis data
- Membandingkan performa antar kelas/mata pelajaran
- Menyusun laporan untuk rapat dinas

Gunakan bahasa Indonesia yang formal dan strategis. Maksimal 250 kata per respons.`,

    siswa: `Anda adalah "Kelas AI", tutor pintar dan pengarah yang sangat edukatif untuk siswa di Klolakelas.
Tugas utama Anda adalah:
- BERTINDAK SEBAGAI GURU/TUTOR SOCRATIC. Misi Anda adalah mencerdaskan siswa, bukan menjadi kunci jawaban!
- JANGAN PERNAH memberikan jawaban akhir atau solusi langsung secara cuma-cuma, terutama untuk tugas atau ujian.
- Bimbing siswa untuk menemukan jawaban mereka sendiri melalui pertanyaan pancingan, petunjuk langkah demi langkah, dan penjelasan konsep dasar.
- Jelaskan konsep pelajaran dengan analogi yang sangat mudah dipahami.
- Memberikan tips belajar efektif dan motivasi akademik.

PENTING: Jika siswa meminta jawaban, tolak dengan halus dan ajak mereka memecahkan masalahnya bersama-sama dari langkah pertama. Membuat siswa bergantung pada Anda untuk jawaban instan akan membuat mereka "bodoh". Jadikan mereka pintar dengan melatih kemampuan berpikir kritis mereka.
Gunakan bahasa Indonesia yang ramah, memotivasi, dan mudah dipahami. Maksimal 200 kata per respons.`,

    orang_tua: `Anda adalah "Kelas AI", asisten informasi untuk orang tua di Klolakelas.
Anda membantu orang tua dengan:
- Menjelaskan data akademik anak dalam bahasa yang mudah dipahami
- Memberikan saran cara mendukung belajar anak di rumah
- Menjawab pertanyaan umum tentang platform

Gunakan bahasa Indonesia yang hangat dan mudah dipahami. Maksimal 150 kata per respons.`,
};

const QUICK_PROMPTS: Record<string, { label: string; prompt: string; icon: string }[]> = {
    guru: [
        { label: 'Buat 5 Soal PG', prompt: 'Buatkan 5 soal pilihan ganda untuk topik yang saya sebutkan berikut ini. Tanyakan saya topiknya.', icon: '📝' },
        { label: 'Buat Rubrik', prompt: 'Bantu saya membuat rubrik penilaian. Tanyakan saya jenis tugasnya.', icon: '📏' },
        { label: 'Analisis Kelas', prompt: 'Analisis kondisi kelas saya berdasarkan data yang tersedia dan berikan saran perbaikan.', icon: '📊' },
        { label: 'Buat RPP Singkat', prompt: 'Bantu saya membuat RPP singkat. Tanyakan saya topik dan alokasi waktunya.', icon: '📋' },
        { label: 'Deskripsi Rapor', prompt: 'Bantu saya menulis deskripsi rapor untuk siswa. Tanyakan saya data siswa yang diperlukan.', icon: '📄' },
        { label: 'Strategi Remedial', prompt: 'Berikan strategi remedial yang efektif berdasarkan data kelas saya.', icon: '🎯' },
    ],
    admin: [
        { label: 'Laporan Platform', prompt: 'Buat ringkasan laporan aktivitas platform berdasarkan data yang ada.', icon: '📊' },
        { label: 'Insight Operasional', prompt: 'Berikan insight operasional tentang kondisi platform saat ini.', icon: '💡' },
    ],
    kepala_sekolah: [
        { label: 'Rangkuman Eksekutif', prompt: 'Buatkan rangkuman eksekutif kinerja sekolah berdasarkan data yang tersedia.', icon: '📋' },
        { label: 'Analisis Lintas Kelas', prompt: 'Bandingkan performa antar kelas dan berikan rekomendasi.', icon: '📊' },
    ],
    siswa: [
        { label: 'Jelaskan Konsep', prompt: 'Tolong jelaskan konsep berikut dengan bahasa yang mudah saya pahami:', icon: '💡' },
        { label: 'Tips Belajar', prompt: 'Berikan tips belajar efektif untuk menghadapi ujian.', icon: '📚' },
    ],
    orang_tua: [
        { label: 'Perkembangan Anak', prompt: 'Jelaskan cara membaca data akademik anak saya di platform ini.', icon: '👨‍👩‍👧' },
    ],
};

/**
 * Get quick prompts for a specific role
 */
export function getQuickPrompts(role: string) {
    return QUICK_PROMPTS[role] || QUICK_PROMPTS.guru;
}

/**
 * Generate a unique message ID
 */
function generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
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
 * Build the API messages array from conversation + context
 */
function buildApiMessages(messages: ChatMessage[], context: ChatContext) {
    const systemPrompt = ROLE_PROMPTS[context.userRole] || ROLE_PROMPTS.guru;
    const statsContext = context.stats ? `
Data saat ini:
- Nama: ${context.userName}
${context.schoolName ? `- Sekolah: ${context.schoolName}` : ''}
${context.className ? `- Kelas aktif: ${context.className}` : ''}
${context.stats.totalStudents ? `- Total siswa: ${context.stats.totalStudents}` : ''}
${context.stats.totalClasses ? `- Total kelas: ${context.stats.totalClasses}` : ''}
${context.stats.averageGrade ? `- Rata-rata nilai: ${context.stats.averageGrade}` : ''}
${context.stats.attendanceRate ? `- Tingkat kehadiran: ${context.stats.attendanceRate}%` : ''}
${context.stats.pendingGrades ? `- Tugas belum dinilai: ${context.stats.pendingGrades}` : ''}` : '';

    return [
        { role: 'system', content: `${systemPrompt}\n\n${statsContext}` },
        ...messages.slice(-10).map(m => ({ role: m.role as string, content: m.content })),
    ];
}

/**
 * Send a STREAMING chat message. Calls onChunk for each token received.
 * Returns the final complete message.
 */
export async function sendStreamingChatMessage(
    messages: ChatMessage[],
    context: ChatContext,
    onChunk: (text: string) => void,
): Promise<ChatMessage | null> {
    const apiMessages = buildApiMessages(messages, context);

    try {
        const response = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: apiMessages,
                model: "deepseek/deepseek-chat-v3-0324:free",
                max_tokens: 1000,
                temperature: 0.7,
                stream: true,
            })
        });

        if (!response.ok) {
            console.error(`[AI Chat] Stream error: ${response.status}`);
            return {
                id: generateId(), role: 'assistant',
                content: '❌ Maaf, terjadi kesalahan saat menghubungi AI. Silakan coba lagi.',
                timestamp: new Date(),
            };
        }

        const reader = response.body?.getReader();
        if (!reader) {
            return {
                id: generateId(), role: 'assistant',
                content: '❌ Streaming tidak didukung oleh browser ini.',
                timestamp: new Date(),
            };
        }

        const decoder = new TextDecoder();
        let fullContent = '';
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // keep incomplete line in buffer

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data: ')) continue;

                const data = trimmed.slice(6);
                if (data === '[DONE]') continue;

                try {
                    const parsed = JSON.parse(data);
                    const delta = parsed?.choices?.[0]?.delta?.content;
                    if (typeof delta === 'string' && delta.length > 0) {
                        fullContent += delta;
                        onChunk(fullContent);
                    }
                } catch {
                    // Skip malformed SSE lines
                }
            }
        }

        if (!fullContent) {
            return {
                id: generateId(), role: 'assistant',
                content: '❌ AI tidak menghasilkan respons. Coba pertanyaan lain.',
                timestamp: new Date(),
            };
        }

        return {
            id: generateId(),
            role: 'assistant',
            content: fullContent.trim(),
            timestamp: new Date(),
        };
    } catch (error) {
        console.error('[AI Chat] Stream error:', error);
        return {
            id: generateId(), role: 'assistant',
            content: '❌ Koneksi ke AI terputus. Periksa koneksi internet Anda.',
            timestamp: new Date(),
        };
    }
}

/**
 * Send a chat message (non-streaming fallback).
 */
export async function sendChatMessage(
    messages: ChatMessage[],
    context: ChatContext
): Promise<ChatMessage | null> {
    const apiMessages = buildApiMessages(messages, context);

    try {
        const response = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: apiMessages,
                model: "deepseek/deepseek-chat-v3-0324:free",
                max_tokens: 1000,
                temperature: 0.7,
                stream: false,
            })
        });

        if (!response.ok) {
            return {
                id: generateId(), role: 'assistant',
                content: '❌ Maaf, terjadi kesalahan saat menghubungi AI.',
                timestamp: new Date(),
            };
        }

        const data = await response.json();
        const content = extractContent(data);

        if (!content) {
            return {
                id: generateId(), role: 'assistant',
                content: '❌ AI tidak dapat menghasilkan respons.',
                timestamp: new Date(),
            };
        }

        return {
            id: generateId(), role: 'assistant',
            content: content.trim(),
            timestamp: new Date(),
        };
    } catch (error) {
        console.error('[AI Chat] Error:', error);
        return {
            id: generateId(), role: 'assistant',
            content: '❌ Koneksi ke AI terputus.',
            timestamp: new Date(),
        };
    }
}

/**
 * Create a new user message object
 */
export function createUserMessage(content: string): ChatMessage {
    return {
        id: generateId(),
        role: 'user',
        content,
        timestamp: new Date(),
    };
}

