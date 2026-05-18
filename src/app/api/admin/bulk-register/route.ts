import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

/**
 * POST /api/admin/bulk-register
 * 
 * Bulk-create student accounts. Protected by session auth.
 * Only admin and guru roles can call this endpoint.
 * Guru can only create students within their own school.
 * Role is ALWAYS hardcoded to 'siswa' — never accepted from client.
 */

function generateSecurePassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    const bytes = randomBytes(12);
    let result = '';
    for (let i = 0; i < bytes.length; i++) {
        result += chars[bytes[i] % chars.length];
    }
    return result;
}

export async function POST(req: Request) {
    try {
        // ============================================================
        // 1. AUTH CHECK: Verify caller is authenticated
        // ============================================================
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll() {
                        // No-op: we don't need to set cookies in API responses
                    },
                },
            }
        );

        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // ============================================================
        // 2. ROLE CHECK: Only admin or guru can bulk-register
        // ============================================================
        const { data: caller, error: callerError } = await supabase
            .from('users')
            .select('role, school_id')
            .eq('id', authUser.id)
            .single();

        if (callerError || !caller || !['admin', 'guru'].includes(caller.role)) {
            return NextResponse.json({ message: 'Forbidden — insufficient permissions' }, { status: 403 });
        }

        // ============================================================
        // 3. PARSE & VALIDATE REQUEST
        // ============================================================
        const body = await req.json();
        const { email, fullName, password, classId, schoolId } = body;

        if (!email || !fullName || !classId || !schoolId) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // SECURITY: Guru can only create students in their own school
        if (caller.role === 'guru' && schoolId !== caller.school_id) {
            return NextResponse.json({ message: 'Cannot create users in another school' }, { status: 403 });
        }

        // SECURITY: Role is ALWAYS 'siswa' — never trust client input
        const role = 'siswa';

        // ============================================================
        // 4. CREATE AUTH USER (with secure password)
        // ============================================================
        const securePassword = password || generateSecurePassword();

        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: securePassword,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });

        if (authError) {
            if (authError.message.includes('already registered')) {
                return NextResponse.json({ message: 'Email sudah terdaftar' }, { status: 409 });
            }
            throw authError;
        }

        if (!authData.user) {
            throw new Error('User creation failed');
        }

        // ============================================================
        // 5. CREATE PROFILE in 'users' table
        // ============================================================
        const { error: profileError } = await supabaseAdmin
            .from('users')
            .insert({
                id: authData.user.id,
                email,
                full_name: fullName,
                role,
                school_id: schoolId,
                class_id: classId
            });

        if (profileError) {
            // Cleanup auth user if profile creation fails
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            throw profileError;
        }

        return NextResponse.json({ 
            message: 'User created successfully', 
            userId: authData.user.id 
        });

    } catch (error: unknown) {
        console.error('Bulk Register Error:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ message }, { status: 500 });
    }
}
