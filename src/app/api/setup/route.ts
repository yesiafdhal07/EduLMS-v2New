import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { timingSafeEqual } from 'crypto';

/**
 * POST /api/setup
 * 
 * System provisioning endpoint — creates the initial guru account.
 * Protected by SETUP_SECRET (passed via X-Setup-Secret header, NOT query string).
 * 
 * Usage:
 *   curl -X POST https://your-domain/api/setup \
 *     -H "X-Setup-Secret: YOUR_SECRET" \
 *     -H "Content-Type: application/json"
 */
export async function POST(request: NextRequest) {
    // 1. Artificial Delay to prevent Brute-Force Timing Attacks
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        // 2. Read secret from header (NOT query string — prevents log/referrer leaks)
        const secret = request.headers.get('X-Setup-Secret');
        const EXPECTED_SECRET = process.env.SETUP_SECRET;

        // 3. Strict Environment Check
        if (!EXPECTED_SECRET) {
            console.error('[SECURITY] SETUP_SECRET not configured.');
            return NextResponse.json({
                error: 'Service Unavailable',
                code: 'SETUP_DISABLED'
            }, { status: 503 });
        }

        // 4. Constant-time comparison to prevent timing attacks
        if (!secret || !safeCompare(secret, EXPECTED_SECRET)) {
            console.warn(`[SECURITY] Unauthorized setup attempt from ${request.headers.get('x-forwarded-for') || 'unknown'}`);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const cookieStore = await cookies();

        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            return NextResponse.json({ error: 'Server Configuration Error' }, { status: 500 });
        }

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            // Silently handle cookie errors in production
                        }
                    },
                },
            }
        );

        const email = process.env.INITIAL_GURU_EMAIL;
        const password = process.env.INITIAL_GURU_PASSWORD;
        const fullName = process.env.INITIAL_GURU_NAME || 'Guru Matematika';

        if (!email || !password) {
            return NextResponse.json({
                error: 'Missing initial credentials configuration.'
            }, { status: 500 });
        }

        // 5. Create User — role is hardcoded server-side, never from client input
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: 'guru',
                },
            },
        });

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        // 6. Audit Log (Best Effort)
        if (authData.user) {
            await supabase.from('audit_logs').insert({
                user_id: authData.user.id,
                action: 'SYSTEM_SETUP',
                entity_type: 'system',
                entity_id: authData.user.id,
                new_data: { role: 'guru' },
                ip_address: request.headers.get('x-forwarded-for') || 'unknown',
                user_agent: request.headers.get('user-agent')
            });
        }

        // 7. Minimal response — do NOT leak email/name/role info
        return NextResponse.json({ message: 'Setup successful.' });

    } catch (err: unknown) {
        console.error('[SETUP ERROR]', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function safeCompare(a: string, b: string): boolean {
    try {
        const bufA = Buffer.from(a, 'utf8');
        const bufB = Buffer.from(b, 'utf8');
        if (bufA.length !== bufB.length) {
            // Compare against self to keep constant time, then return false
            timingSafeEqual(bufA, bufA);
            return false;
        }
        return timingSafeEqual(bufA, bufB);
    } catch {
        return false;
    }
}
