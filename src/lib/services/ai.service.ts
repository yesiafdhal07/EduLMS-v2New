/**
 * AI Service (Sprint 6: AI & Differentiation)
 * Powered by OpenRouter
 */

export interface AIGradeResponse {
    score: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
}

/**
 * Safely extract content from OpenRouter response with validation.
 * Moved to server side, no longer needed here.
 */

export const aiService = {
    /**
     * Grade an essay submission using AI
     */
    async gradeEssay(
        prompt: string, 
        studentWork: string, 
        rubric?: string
    ): Promise<AIGradeResponse | null> {
        const systemPrompt = `
            Anda adalah asisten guru profesional. Tugas Anda adalah memberikan nilai (0-100) dan umpan balik formatif untuk tugas esai siswa.
            ${rubric ? `Gunakan rubrik berikut: ${rubric}` : 'Berikan penilaian berdasarkan kejelasan, relevansi topik, dan tata bahasa.'}
            
            Berikan respon dalam format JSON:
            {
                "score": number,
                "feedback": "string (bahasa indonesia yang menyemangati)",
                "strengths": ["list string"],
                "weaknesses": ["list string"]
            }
        `;

        try {
            const response = await fetch("/api/ai/grade", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    systemPrompt,
                    studentWork,
                    prompt
                })
            });

            if (!response.ok) {
                console.error(`[AI Service] API returned status ${response.status}`);
                return null;
            }

            const data = await response.json();
            const content = data.content;

            if (!content) {
                console.error('[AI Service] Empty or malformed response from API:', JSON.stringify(data).slice(0, 200));
                return null;
            }

            const result = JSON.parse(content);
            
            // Validate required fields
            if (typeof result.score !== 'number' || !result.feedback) {
                console.error('[AI Service] Response missing required fields');
                return null;
            }

            return {
                score: Math.min(100, Math.max(0, result.score)),
                feedback: String(result.feedback),
                strengths: Array.isArray(result.strengths) ? result.strengths.map(String) : [],
                weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses.map(String) : [],
            };
        } catch (error) {
            console.error('[AI Service] Error during grading:', error);
            return null;
        }
    },

    /**
     * Generate personalized feedback for a student based on their history
     */
    async generatePersonalizedFeedback(studentStats: Record<string, unknown>): Promise<string | null> {
        const systemPrompt = "Anda adalah konselor akademik. Berikan pesan motivasi singkat (max 2 kalimat) untuk siswa berdasarkan data mereka.";
        
        try {
            const response = await fetch("/api/ai/feedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    systemPrompt,
                    studentStats
                })
            });

            if (!response.ok) return null;

            const data = await response.json();
            return data.content;
        } catch (error) {
            console.error('[AI Service] Personalized feedback error:', error);
            return null;
        }
    }
};
