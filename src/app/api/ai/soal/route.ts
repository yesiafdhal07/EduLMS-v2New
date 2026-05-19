import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API Key is missing on the server' }, { status: 500 });
        }

        const body = await req.json();
        const { prompt } = body;

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://klolakelas.com',
                'X-Title': 'Klolakelas Soal Generator',
            },
            body: JSON.stringify({
                model: process.env.AI_GENERAL_MODEL || 'deepseek/deepseek-chat:free',
                messages: [
                    { role: 'system', content: 'Anda adalah pembuat soal ahli kurikulum Indonesia. Output HANYA JSON array yang valid, tidak ada teks lain. Pastikan output diawali dengan [ dan diakhiri dengan ].' },
                    { role: 'user', content: prompt },
                ],
                // Gunakan response_format type json_object jika model mendukung, tapi karena kita minta array, cukup minta JSON murni.
                response_format: { type: 'json_object' },
                max_tokens: 2000,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`OpenRouter Error: ${response.status} ${errText}`);
        }

        const data = await response.json();
        const raw = data?.choices?.[0]?.message?.content;
        
        if (!raw) {
            throw new Error('No content returned from AI');
        }

        return NextResponse.json({ content: raw });
    } catch (err: any) {
        console.error('[API/AI/Soal] Error:', err);
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}
