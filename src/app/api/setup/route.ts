import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        // Security check: Only allow if a secret matches (MUST be defined in env)
        // This prevents random users from creating guru accounts.
        const EXPECTED_SECRET = process.env.SETUP_SECRET;

        if (!EXPECTED_SECRET) {
            return NextResponse.json({
                error: 'SETUP_SECRET environment variable is not configured. This endpoint is disabled for security.'
            }, { status: 503 });
        }

        if (secret !== EXPECTED_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const cookieStore = await cookies();

        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            return NextResponse.json({ error: 'Environment variables missing' }, { status: 500 });
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

        // ⚠️ SECURITY: Credentials MUST come from environment variables
        // Set these in your .env.local file:
        //   INITIAL_GURU_EMAIL=your-email@school.id
        //   INITIAL_GURU_PASSWORD=your-secure-password
        //   INITIAL_GURU_NAME=Teacher Name
        const email = process.env.INITIAL_GURU_EMAIL;
        const password = process.env.INITIAL_GURU_PASSWORD;
        const fullName = process.env.INITIAL_GURU_NAME || 'Guru Matematika';

        if (!email || !password) {
            return NextResponse.json({
                error: 'Missing required environment variables: INITIAL_GURU_EMAIL and INITIAL_GURU_PASSWORD'
            }, { status: 500 });
        }

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

        // ⚠️ SECURITY: Never return password in response
        return NextResponse.json({
            message: 'Selamat! Akun Guru berhasil dibuat.',
            info: { email, fullName, role: 'guru' }
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
