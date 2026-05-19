import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * POST /api/ai/chat
 * 
 * Server-side proxy for OpenRouter AI API with STREAMING support.
 * SECURITY: API key is server-side only (no NEXT_PUBLIC_ prefix).
 * Protected by session auth — only logged-in users can use AI.
 * Per-user rate limiting: 30 messages per minute.
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
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }

        // 2. Rate limit
        if (!checkAIRateLimit(user.id)) {
            return new Response(JSON.stringify({ error: 'Rate limited' }), { status: 429, headers: { 'Content-Type': 'application/json' } });
        }

        // 3. API key
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'AI not configured' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
        }

        // 4. Parse body
        const body = await req.json();
        const { messages, model, max_tokens, temperature, stream } = body;

        if (!Array.isArray(messages) || messages.length === 0) {
            return new Response(JSON.stringify({ error: 'Messages required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // 5. Sanitize
        const sanitizedMessages = messages.slice(-12).map((m: { role: string; content: string }) => ({
            role: ['system', 'user', 'assistant'].includes(m.role) ? m.role : 'user',
            content: typeof m.content === 'string' ? m.content.slice(0, 5000) : '',
        }));

        const useStream = stream !== false; // default to streaming

        // 6. Proxy to OpenRouter
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://klolakelas.com",
                "X-Title": "Klolakelas AI Chat"
            },
            body: JSON.stringify({
                model: model || process.env.AI_CHAT_MODEL || "google/gemini-2.0-flash-lite:free",
                messages: sanitizedMessages,
                max_tokens: Math.min(max_tokens || 1000, 2000),
                temperature: Math.min(Math.max(temperature || 0.7, 0), 1.5),
                stream: useStream,
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[AI Proxy] OpenRouter error ${response.status}:`, errorText);
            return new Response(JSON.stringify({ error: 'AI service error' }), { status: response.status, headers: { 'Content-Type': 'application/json' } });
        }

        // 7. If streaming, pipe the response directly
        if (useStream && response.body) {
            return new Response(response.body, {
                status: 200,
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                },
            });
        }

        // 8. Non-streaming fallback
        const data = await response.json();
        return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error('[AI Proxy] Error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
