'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';

interface UseAuthReturn {
    user: User | null;
    loading: boolean;
    isGuru: boolean;
    isSiswa: boolean;
    signOut: () => Promise<void>;
}

export function useAuth(requiredRole?: 'guru' | 'siswa'): UseAuthReturn {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

            if (authError || !authUser) {
                // If checking auth failed or no user, redirect to login
                if (authError) console.error('Auth Check Error:', authError);
                router.push('/login');
                return;
            }

            // Hard role check from database
            const { data: dbUser, error } = await supabase
                .from('users')
                .select('id, email, full_name, role')
                .eq('id', authUser.id)
                .single();

            if (error || !dbUser) {
                // Log detailed error only in development
                if (process.env.NODE_ENV === 'development') {
                    console.error('CRITICAL AUTH ERROR: User exists in Auth but MISSING in Public DB', {
                        authId: authUser.id,
                        email: authUser.email,
                        dbError: error,
                        dbUser: dbUser
                    });
                }
                
                // User-friendly message (no sensitive data exposed)
                console.error('[Auth] User sync error - signing out');
                
                await supabase.auth.signOut();
                router.push('/login');
                return;
            }

            // Role-based redirect
            if (requiredRole && dbUser.role !== requiredRole) {
                console.warn(`Role Mismatch: Required ${requiredRole}, Got ${dbUser.role}`);
                if (dbUser.role === 'guru') {
                    router.push('/guru');
                } else if (dbUser.role === 'siswa') {
                    router.push('/siswa');
                } else {
                    await supabase.auth.signOut();
                    router.push('/login');
                }
                return;
            }

            setUser(dbUser as User);
        } catch (error) {
            console.error('Auth Unexpected Error:', error);
            router.push('/login');
        } finally {
            setLoading(false);
        }
    }

    async function signOut() {
        await supabase.auth.signOut();
        router.push('/login');
    }

    return {
        user,
        loading,
        isGuru: user?.role === 'guru',
        isSiswa: user?.role === 'siswa',
        signOut
    };
}
