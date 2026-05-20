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
        { label: 'Buat Tugas dari Materi 🤖', prompt: 'Buatkan draf tugas lengkap dari materi yang terakhir saya unggah, level kognitif C4.', icon: '🤖' },
        { label: 'Siapa Siswa Berisiko? ⚠️', prompt: 'Tolong analisis data kelas saya, siapa saja siswa yang berisiko karena nilai atau kehadiran rendah?', icon: '⚠️' },
        { label: 'RPP Berdiferensiasi', prompt: 'Bantu saya membuat RPP Berdiferensiasi berdasarkan Kurikulum Merdeka. Tanyakan topik, kelas, dan tujuan pembelajaran yang ingin dicapai.', icon: '📋' },
        { label: 'Saran Remedial', prompt: 'Berikan rekomendasi program remedial untuk siswa yang kesulitan berdasarkan data kelas saya.', icon: '🎯' },
    ],
    admin: [
        { label: 'Cek Anomali Platform 🔍', prompt: 'Tolong jalankan pemeriksaan anomali platform hari ini. Adakah sekolah yang kritis?', icon: '🔍' },
        { label: 'Cek Log Terbaru', prompt: 'Tampilkan aktivitas terbaru di platform (audit logs).', icon: '📋' },
        { label: 'Sekolah Tidak Aktif', prompt: 'Adakah sekolah yang sudah tidak aktif dalam 30 hari terakhir?', icon: '📉' },
    ],
    kepala_sekolah: [
        { label: 'Buat Laporan Komite 📋', prompt: 'Buatkan laporan eksekutif untuk rapat komite sekolah semester ini.', icon: '📋' },
        { label: 'Peringkat Kelas', prompt: 'Tampilkan peringkat performa kelas di sekolah ini.', icon: '🏆' },
        { label: 'Peta Kelemahan', prompt: 'Mata pelajaran apa yang paling banyak masalah di sekolah ini?', icon: '🗺️' },
    ],
    siswa: [
        { label: 'Buat Jadwal Belajar 📅', prompt: 'Bantu aku buat jadwal belajar 7 hari ke depan berdasarkan tugasku yang belum selesai dan nilai-nilaiku.', icon: '📅' },
        { label: 'Tugas yang Belum 🔔', prompt: 'Tugas apa saja yang belum aku kumpulkan?', icon: '🔔' },
        { label: 'Kuis Latihan Praktis', prompt: 'Buatkan aku kuis latihan pilihan ganda dari materi terakhir yang diajarkan.', icon: '🎮' },
    ],
    orang_tua: [
        { label: 'Kondisi Akademik Anak 👦', prompt: 'Bagaimana kondisi akademik anak saya saat ini?', icon: '👦' },
        { label: 'Saran Belajar Spesifik 💡', prompt: 'Mata pelajaran apa yang paling lemah bagi anak saya, dan bagaimana saran membantunya di rumah?', icon: '💡' },
        { label: 'Tugas Mendatang', prompt: 'Apakah ada tugas anak saya yang belum dikumpulkan dan hampir deadline?', icon: '📅' },
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
    userId: string,
    schoolId: string | null
): Promise<ChatMessage | null> {
    const apiMessages = buildApiMessages(messages, context);

    try {
        // We use the new agent endpoint which handles tool calling. 
        // It currently returns a standard JSON response to ensure tool execution completes safely.
        const response = await fetch("/api/ai/agent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: apiMessages,
                userRole: context.userRole,
                userId: userId,
                schoolId: schoolId
            })
        });

        if (!response.ok) {
            console.error(`[AI Agent] Error: ${response.status}`);
            return {
                id: generateId(), role: 'assistant',
                content: '❌ Maaf, terjadi kesalahan saat menghubungi AI Agent. Silakan coba lagi.',
                timestamp: new Date(),
            };
        }

        const data = await response.json();
        const content = data.content;

        if (!content) {
            return {
                id: generateId(), role: 'assistant',
                content: '❌ AI tidak menghasilkan respons.',
                timestamp: new Date(),
            };
        }

        // Simulate streaming for the UI
        onChunk(content);

        return {
            id: generateId(),
            role: 'assistant',
            content: content.trim(),
            timestamp: new Date(),
        };
    } catch (error) {
        console.error('[AI Chat] Agent error:', error);
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
    context: ChatContext,
    userId: string,
    schoolId: string | null
): Promise<ChatMessage | null> {
    const apiMessages = buildApiMessages(messages, context);

    try {
        const response = await fetch("/api/ai/agent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: apiMessages,
                userRole: context.userRole,
                userId: userId,
                schoolId: schoolId
            })
        });

        if (!response.ok) {
            return {
                id: generateId(), role: 'assistant',
                content: '❌ Maaf, terjadi kesalahan saat menghubungi AI Agent.',
                timestamp: new Date(),
            };
        }

        const data = await response.json();
        const content = data.content;

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

