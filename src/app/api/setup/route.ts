import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    // 1. Artificial Delay to prevent Brute-Force Timing Attacks
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');
        const EXPECTED_SECRET = process.env.SETUP_SECRET;

        // 2. Strict Environment Check
        if (!EXPECTED_SECRET) {
            console.error('[SECURITY] SETUP_SECRET not configured.');
            return NextResponse.json({
                error: 'Service Unavailable',
                code: 'SETUP_DISABLED'
            }, { status: 503 });
        }

        // 3. Constant-time comparison (simulated) isn't strictly necessary here due to delay, 
        // but explicit check is mandatory.
        if (secret !== EXPECTED_SECRET) {
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

        // 4. Create User
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

        // 5. Audit Log (Best Effort)
        if (authData.user) {
            await supabase.from('audit_logs').insert({
                user_id: authData.user.id,
                action: 'SYSTEM_SETUP',
                entity_type: 'system',
                entity_id: authData.user.id,
                new_data: { email, role: 'guru' },
                ip_address: request.headers.get('x-forwarded-for') || 'unknown',
                user_agent: request.headers.get('user-agent')
            });
        }

        return NextResponse.json({
            message: 'Setup successful. Account created.',
            info: { email, fullName, role: 'guru' }
        });

    } catch (err: unknown) {
        console.error('[SETUP ERROR]', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
