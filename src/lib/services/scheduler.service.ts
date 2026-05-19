import { aiService } from './ai.service';
import { supabase } from '@/lib/supabase';

export const schedulerService = {
    /**
     * Generate a weekly schedule using AI based on available teachers and subjects
     */
    async generateSmartSchedule(schoolId: string) {
        // 1. Fetch raw data
        const [teachers, subjects, classes] = await Promise.all([
            supabase.from('users').select('id, full_name').eq('school_id', schoolId).eq('role', 'guru'),
            supabase.from('subjects').select('id, title, class_id'),
            supabase.from('classes').select('id, name').eq('school_id', schoolId)
        ]);

        const prompt = `
            Bantu saya membuat jadwal pelajaran mingguan yang optimal untuk sekolah ini.
            
            Daftar Guru: ${JSON.stringify(teachers.data)}
            Daftar Mata Pelajaran: ${JSON.stringify(subjects.data)}
            Daftar Kelas: ${JSON.stringify(classes.data)}
            
            Aturan:
            1. Setiap kelas harus memiliki minimal 5 sesi per hari (Senin-Jumat).
            2. Satu guru tidak boleh mengajar di dua kelas di jam yang sama.
            3. Berikan output dalam format JSON yang berisi array of objects { day, time, class_name, subject_name, teacher_name }.
        `;

        // We can reuse aiService but with a specialized prompt
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) return null;

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": process.env.AI_GENERAL_MODEL || "deepseek/deepseek-chat:free",
                    "messages": [
                        { "role": "system", "content": "Anda adalah pakar manajemen sekolah (Smart Scheduler)." },
                        { "role": "user", "content": prompt }
                    ],
                    "response_format": { "type": "json_object" }
                })
            });

            const data = await response.json();
            return JSON.parse(data.choices[0].message.content);
        } catch (error) {
            console.error('[Scheduler] Error generating schedule:', error);
            return null;
        }
    }
};
