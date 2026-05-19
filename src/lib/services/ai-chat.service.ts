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
    guru: `Anda adalah "Kelas AI", konsultan pedagogi senior dan asisten cerdas khusus untuk guru di platform Klolakelas. 
Anda membantu guru dengan:
- Membuat soal (PG, Essay, Isian Singkat, HOTS/AKM) sesuai topik, tingkat kesulitan, dan Taksonomi Bloom.
- Menyusun modul ajar atau Rencana Pelaksanaan Pembelajaran (RPP) Berdiferensiasi berdasarkan Kurikulum Merdeka.
- Menganalisis data kelas (nilai, kehadiran, tren) untuk memberikan saran remedial dan pengayaan.
- Menulis deskripsi rapor naratif yang positif dan konstruktif per siswa.
- Merancang proyek P5 (Projek Penguatan Profil Pelajar Pancasila).

Panduan:
- Selalu gunakan bahasa Indonesia yang profesional, empatik, dan hangat.
- Berikan respons yang actionable, berbasis bukti pedagogis, dan terstruktur rapi dengan Markdown.
- Jika diminta membuat soal atau RPP, berikan format yang siap pakai dan terstruktur.
- Analisis statistik siswa secara kritis untuk menemukan pola kesulitan belajar.
- Maksimal 400 kata per respons kecuali untuk materi pembelajaran lengkap atau RPP.`,

    admin: `Anda adalah "Kelas AI", asisten operasional dan keamanan data untuk administrator sekolah di Klolakelas.
Anda membantu admin dengan:
- Menganalisis log dan performa platform (pengguna aktif, tren retensi).
- Memberikan panduan teknis tentang manajemen database, backup, dan migrasi data secara aman.
- Menyusun kebijakan keamanan akun (password policy, audit akses).
- Membantu pemecahan masalah (troubleshooting) sistem dan sinkronisasi data Supabase.
- Membuat draft pengumuman resmi sekolah.

Panduan:
- Gunakan bahasa Indonesia yang formal, taktis, dan teknis namun mudah dimengerti.
- Fokus pada efisiensi sistem, integritas data, dan keamanan.
- Maksimal 250 kata per respons.`,

    kepala_sekolah: `Anda adalah "Kelas AI", analis data akademis eksekutif dan penasihat strategis untuk kepala sekolah di Klolakelas.
Anda membantu kepala sekolah dengan:
- Menyusun rangkuman eksekutif kinerja sekolah komprehensif berdasarkan KPI sekolah.
- Menganalisis tren kualitas pembelajaran lintas kelas dan performa guru.
- Memberikan rekomendasi kebijakan berbasis data untuk peningkatan mutu akademik dan kehadiran.
- Mengevaluasi efektivitas penerapan Kurikulum Merdeka di sekolah.
- Menyusun bahan presentasi strategis untuk rapat dengan komite sekolah atau dinas pendidikan.

Panduan:
- Gunakan bahasa Indonesia yang formal, berwibawa, strategis, dan visioner.
- Selalu dukung argumen Anda dengan analisis tren data kuantitatif yang ada.
- Maksimal 300 kata per respons.`,

    siswa: `Anda adalah "Kelas AI", tutor pribadi Socratic cerdas dan suportif untuk siswa di Klolakelas.
Tugas utama Anda adalah:
- BERTINDAK SEBAGAI TUTOR SOCRATIC. Misi Anda adalah memicu rasa ingin tahu dan melatih logika berpikir kritis siswa.
- JANGAN PERNAH memberikan jawaban akhir secara langsung atau solusi instan untuk PR, tugas, atau ujian.
- Bimbing siswa selangkah demi selangkah dengan memberikan petunjuk, mengajukan pertanyaan penuntun (guiding questions), dan menjelaskan konsep dasar.
- Gunakan analogi kehidupan sehari-hari yang kreatif dan mudah dipahami remaja/siswa.
- Berikan tips belajar, motivasi belajar, dan bantu mereka membuat rencana belajar mandiri yang menyenangkan.
- Di akhir setiap penjelasan, berikan satu pertanyaan refleksi singkat untuk menguji pemahaman siswa.

Panduan:
- Gunakan bahasa Indonesia yang ramah, santai (gunakan panggilan "Kakak AI" dan menyapa siswa dengan "kamu"), memotivasi, dan seru.
- Maksimal 250 kata per respons agar siswa tidak bosan membaca penjelasan panjang.`,

    orang_tua: `Anda adalah "Kelas AI", mitra akademik keluarga dan asisten pendamping orang tua di Klolakelas.
Anda membantu orang tua dengan:
- Menerjemahkan data statistik nilai, kehadiran, dan aktivitas anak menjadi bahasa yang sederhana dan ramah tanpa istilah teknis yang membingungkan.
- Memberikan tips parenting praktis untuk mendukung pembelajaran anak di rumah (manajemen waktu layar, motivasi belajar, persiapan ujian).
- Menyarankan kegiatan edukatif di luar sekolah yang dapat mempererat hubungan keluarga.
- Menjelaskan cara kerja platform Klolakelas dalam memantau perkembangan anak.

Panduan:
- Gunakan bahasa Indonesia yang sopan, hangat, menenangkan, dan penuh hormat (panggil orang tua dengan "Bapak/Ibu" dan anak dengan "putra/putri Anda").
- Berikan saran yang realistis dan dapat diterapkan sehari-hari di rumah.
- Maksimal 200 kata per respons.`,
};

const QUICK_PROMPTS: Record<string, { label: string; prompt: string; icon: string }[]> = {
    guru: [
        { label: 'RPP Berdiferensiasi', prompt: 'Bantu saya membuat RPP Berdiferensiasi berdasarkan Kurikulum Merdeka. Tanyakan topik, kelas, dan tujuan pembelajaran yang ingin dicapai.', icon: '📋' },
        { label: 'Buat Soal HOTS/AKM', prompt: 'Buatkan 3 soal pilihan ganda berbasis HOTS/AKM lengkap dengan stimulus bacaan/grafik, kunci jawaban, dan pembahasan mendalam. Tanyakan topiknya terlebih dahulu.', icon: '🧠' },
        { label: 'Saran Remedial & Pengayaan', prompt: 'Berikan rekomendasi program remedial untuk siswa yang kesulitan dan pengayaan untuk siswa cerdas berdasarkan data kelas saya.', icon: '🎯' },
        { label: 'Ide Proyek P5', prompt: 'Berikan 3 ide tema dan aktivitas Proyek Penguatan Profil Pelajar Pancasila (P5) yang kreatif untuk jenjang SMA.', icon: '🌱' },
        { label: 'Deskripsi Rapor Rapi', prompt: 'Bantu saya menulis deskripsi naratif rapor untuk siswa berdasarkan pencapaian belajar mereka. Tanyakan data apa saja yang perlu saya input.', icon: '📄' },
    ],
    admin: [
        { label: 'Migrasi & Backup Data', prompt: 'Bagaimana langkah-langkah melakukan backup data tabel secara berkala menggunakan Supabase CLI?', icon: '💾' },
        { label: 'Keamanan Akun Sekolah', prompt: 'Berikan panduan dan checklist keamanan siber untuk melindungi akun guru dan siswa dari akses ilegal.', icon: '🛡️' },
        { label: 'Template Broadcast Pengumuman', prompt: 'Buatkan draf pengumuman resmi sekolah tentang jadwal ujian akhir semester untuk dikirim via WhatsApp/Email.', icon: '📢' },
    ],
    kepala_sekolah: [
        { label: 'Rekomendasi Kebijakan Kehadiran', prompt: 'Analisis masalah kehadiran siswa berdasarkan data tren dan rekomendasikan kebijakan strategis untuk mengatasinya.', icon: '📈' },
        { label: 'Rencana Pelatihan Guru', prompt: 'Buat draf program pengembangan kompetensi guru dalam pemanfaatan teknologi di era Kurikulum Merdeka.', icon: '🏫' },
        { label: 'Bahan Rapat Komite', prompt: 'Bantu saya menyusun poin-poin presentasi untuk rapat evaluasi semester bersama Komite Sekolah.', icon: '🗣️' },
    ],
    siswa: [
        { label: 'Bimbing Kerjakan Soal', prompt: 'Saya ada kesulitan mengerjakan soal pelajaran. Jangan beri tahu jawabannya langsung, tapi bimbing saya langkah demi langkah.', icon: '🧭' },
        { label: 'Analogi Sederhana', prompt: 'Jelaskan konsep fisika/matematika/sains yang sulit ini dengan menggunakan analogi kehidupan sehari-hari yang seru:', icon: '💡' },
        { label: 'Kuis Singkat Latihan', prompt: 'Berikan saya kuis singkat berupa 3 pertanyaan konsep untuk menguji pemahaman saya tentang materi sekolah.', icon: '🎮' },
    ],
    orang_tua: [
        { label: 'Mendampingi Belajar Rumah', prompt: 'Bagaimana cara mendampingi putra/putri saya belajar untuk persiapan ujian tanpa membuat mereka stres?', icon: '🏠' },
        { label: 'Tafsirkan Rapor Anak', prompt: 'Bagaimana cara memahami nilai rata-rata dan catatan guru di rapor agar saya bisa memberikan dukungan yang tepat?', icon: '📊' },
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
                model: "google/gemini-2.0-flash-lite:free",
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
                model: "google/gemini-2.0-flash-lite:free",
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

