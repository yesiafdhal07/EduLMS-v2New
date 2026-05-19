import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });
        }

        const body = await req.json();
        const { systemPrompt, studentStats } = body;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://klolakelas.com",
                "X-Title": "Klolakelas"
            },
            body: JSON.stringify({
                "model": process.env.AI_GENERAL_MODEL || "deepseek/deepseek-chat:free",
                "messages": [
                    { "role": "system", "content": systemPrompt },
                    { "role": "user", "content": `Data Siswa: ${JSON.stringify(studentStats)}` }
                ]
            })
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'API Error' }, { status: response.status });
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        
        return NextResponse.json({ content });
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
