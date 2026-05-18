/**
 * AI Dashboard Insights Service
 * 
 * Provides database-aware AI summaries for guru, admin, and kepsek dashboards.
 * AI receives pre-fetched statistical data and generates actionable insights.
 * 
 * USP: Intelligent, contextual dashboard summaries powered by AI
 */

export interface DashboardInsight {
    title: string;
    summary: string;
    type: 'performance' | 'alert' | 'suggestion' | 'highlight';
    actionSuggestion?: string;
    icon?: string;
}

export interface InsightContext {
    role: 'guru' | 'admin' | 'kepala_sekolah';
    schoolName?: string;
    className?: string;
    stats: {
        totalStudents?: number;
        averageGrade?: number;
        attendanceRate?: number;
        submissionRate?: number;
        pendingGrades?: number;
        totalClasses?: number;
        totalTeachers?: number;
        activeAssignments?: number;
    };
    recentTrends?: {
        gradeChange?: number; // positive = improving
        attendanceChange?: number;
        submissionChange?: number;
    };
    extraContext?: string;
}

// Simple in-memory cache (30-minute TTL)
const insightCache = new Map<string, { data: DashboardInsight[]; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCacheKey(context: InsightContext): string {
    return `${context.role}_${context.className || 'all'}_${context.stats.totalStudents}_${context.stats.averageGrade}`;
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
 * Generate AI-powered dashboard insights based on database statistics.
 * 
 * @param context - Pre-fetched statistics and role context
 * @returns Array of 3-4 insight cards, or null if AI unavailable
 */
export async function generateDashboardInsights(
    context: InsightContext
): Promise<DashboardInsight[] | null> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        console.warn('[AI Insights] OpenRouter API key not configured');
        return null;
    }

    // Check cache
    const cacheKey = getCacheKey(context);
    const cached = insightCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    const rolePrompts: Record<string, string> = {
        guru: `Anda adalah asisten AI untuk guru. Berdasarkan data kelas berikut, berikan 3 insight singkat dalam bahasa Indonesia yang membantu guru memahami kondisi kelas dan mengambil aksi. Fokus pada: kinerja siswa, kehadiran, dan tugas yang perlu dinilai.`,
        
        kepala_sekolah: `Anda adalah penasihat eksekutif untuk kepala sekolah. Berdasarkan data sekolah berikut, berikan 3 insight strategis dalam bahasa Indonesia. Fokus pada: tren kinerja sekolah, area yang perlu intervensi, dan pencapaian yang patut dirayakan.`,
        
        admin: `Anda adalah analyst platform untuk admin. Berdasarkan data platform berikut, berikan 3 insight operasional dalam bahasa Indonesia. Fokus pada: kesehatan platform, aktivitas pengguna, dan potensi masalah teknis.`,
    };

    const systemPrompt = `${rolePrompts[context.role] || rolePrompts.guru}

Berikan respon dalam format JSON array:
[
    {
        "title": "judul singkat (max 6 kata)",
        "summary": "penjelasan 1-2 kalimat yang actionable",
        "type": "performance|alert|suggestion|highlight",
        "actionSuggestion": "saran aksi konkret 1 kalimat (opsional)",
        "icon": "emoji yang relevan"
    }
]

PENTING: 
- Gunakan bahasa Indonesia yang profesional tapi hangat
- Berikan insight yang SPESIFIK berdasarkan angka yang diberikan
- Jangan gunakan placeholder, gunakan data real
- Jika ada masalah (kehadiran rendah, nilai turun), prioritaskan sebagai "alert"
- Jika ada pencapaian, tandai sebagai "highlight"`;

    const userMessage = `Data Dashboard:
- Role: ${context.role}
${context.schoolName ? `- Sekolah: ${context.schoolName}` : ''}
${context.className ? `- Kelas: ${context.className}` : ''}
- Total Siswa: ${context.stats.totalStudents ?? 'N/A'}
- Rata-rata Nilai: ${context.stats.averageGrade ?? 'N/A'}
- Tingkat Kehadiran: ${context.stats.attendanceRate ?? 'N/A'}%
- Tingkat Pengumpulan Tugas: ${context.stats.submissionRate ?? 'N/A'}%
- Tugas Belum Dinilai: ${context.stats.pendingGrades ?? 0}
- Tugas Aktif: ${context.stats.activeAssignments ?? 'N/A'}
${context.stats.totalClasses ? `- Total Kelas: ${context.stats.totalClasses}` : ''}
${context.stats.totalTeachers ? `- Total Guru: ${context.stats.totalTeachers}` : ''}
${context.recentTrends ? `
Tren 7 Hari Terakhir:
- Perubahan Nilai: ${context.recentTrends.gradeChange ?? 'N/A'}%
- Perubahan Kehadiran: ${context.recentTrends.attendanceChange ?? 'N/A'}%
- Perubahan Pengumpulan: ${context.recentTrends.submissionChange ?? 'N/A'}%` : ''}
${context.extraContext ? `\nKonteks Tambahan: ${context.extraContext}` : ''}`;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://klolakelas.com",
                "X-Title": "Klolakelas AI Insights"
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-chat-v3-0324:free",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ],
                response_format: { type: "json_object" },
                max_tokens: 800,
                temperature: 0.7,
            })
        });

        if (!response.ok) {
            console.error(`[AI Insights] API error: ${response.status}`);
            return null;
        }

        const data = await response.json();
        const content = extractContent(data);

        if (!content) {
            console.error('[AI Insights] Empty response from API');
            return null;
        }

        const parsed = JSON.parse(content);
        
        // Handle both array and object-with-array responses
        const insights: DashboardInsight[] = Array.isArray(parsed) 
            ? parsed 
            : Array.isArray(parsed.insights) 
                ? parsed.insights 
                : [];

        // Validate and sanitize
        const validated = insights
            .filter((i) => i.title && i.summary && i.type)
            .map((i) => ({
                title: String(i.title).slice(0, 50),
                summary: String(i.summary).slice(0, 200),
                type: (['performance', 'alert', 'suggestion', 'highlight'].includes(i.type as string) 
                    ? i.type 
                    : 'performance') as DashboardInsight['type'],
                actionSuggestion: i.actionSuggestion ? String(i.actionSuggestion).slice(0, 150) : undefined,
                icon: i.icon ? String(i.icon).slice(0, 4) : undefined,
            }))
            .slice(0, 4);

        // Cache the result
        insightCache.set(cacheKey, { data: validated, timestamp: Date.now() });

        return validated;
    } catch (error) {
        console.error('[AI Insights] Error generating insights:', error);
        return null;
    }
}

/**
 * Generate a brief AI executive summary from existing briefing data.
 * Used by Kepala Sekolah ExecutiveBriefing component.
 */
export async function generateExecutiveSummary(
    briefingPoints: { type: string; text: string; metric?: string }[],
    schoolName?: string
): Promise<string | null> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return null;

    const systemPrompt = `Anda adalah penasihat eksekutif. Berdasarkan poin-poin briefing berikut, buat rangkuman eksekutif dalam 2-3 kalimat bahasa Indonesia yang profesional dan actionable. Gunakan data spesifik yang disebutkan.`;

    const userMessage = `Sekolah: ${schoolName || 'Tidak diketahui'}
Briefing Points:
${briefingPoints.map((p, i) => `${i + 1}. [${p.type.toUpperCase()}] ${p.text}${p.metric ? ` (${p.metric})` : ''}`).join('\n')}`;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://klolakelas.com",
                "X-Title": "Klolakelas Executive Summary"
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-chat-v3-0324:free",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ],
                max_tokens: 300,
                temperature: 0.5,
            })
        });

        if (!response.ok) return null;

        const data = await response.json();
        return extractContent(data);
    } catch (error) {
        console.error('[AI Insights] Executive summary error:', error);
        return null;
    }
}
