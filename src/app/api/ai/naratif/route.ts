import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * POST /api/ai/naratif
 * 
 * Server-side proxy for report card narrative generation.
 * Protected by session auth — only logged-in users (usually teachers) can access.
 */

const USER_RATE_LIMIT = new Map<string, { count: number; resetTime: number }>();
const MAX_AI_REQUESTS = 30;
const RATE_WINDOW = 60 * 1000;

function checkAIRateLimit(userId: string): boolean {
    const now = Date.now();
    const record = USER_RATE_LIMIT.get(userId);
    if (record && now > record.resetTime) USER_RATE_LIMIT.delete(userId);
    
    const existing = USER_RATE_LIMIT.get(userId);
    if (!existing) {
        USER_RATE_LIMIT.set(userId, { count: 1, resetTime: now + RATE_WINDOW });
        return true;
    }
    if (existing.count >= MAX_AI_REQUESTS) return false;
    existing.count++;
    return true;
}

export async function POST(req: Request) {
    try {
        // 1. Auth check
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll(); },
                    setAll() { /* no-op */ },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Rate limit
        if (!checkAIRateLimit(user.id)) {
            return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
        }

        // 3. API key
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'AI not configured' }, { status: 503 });
        }

        // 4. Parse body
        const body = await req.json();
        const { systemPrompt, userMessage } = body;

        if (!systemPrompt || !userMessage) {
            return NextResponse.json({ error: 'System prompt and message required' }, { status: 400 });
        }

        // 5. Proxy to OpenRouter
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://klolakelas.com",
                "X-Title": "Klolakelas Rapor Naratif"
            },
            body: JSON.stringify({
                model: process.env.AI_GENERAL_MODEL || "deepseek/deepseek-chat:free",
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                response_format: { type: 'json_object' },
                max_tokens: 600,
                temperature: 0.8,
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[AI Naratif Proxy] OpenRouter error ${response.status}:`, errorText);
            return NextResponse.json({ error: 'AI service error' }, { status: response.status });
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        
        return NextResponse.json({ content });

    } catch (error) {
        console.error('[AI Naratif Proxy] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
