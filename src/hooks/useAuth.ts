'use client';

import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import type { User, AppRole } from '@/types';

const ROLE_ROUTES: Record<AppRole, string> = {
    admin: '/admin',
    kepala_sekolah: '/kepala-sekolah',
    guru: '/guru',
    siswa: '/siswa',
    orang_tua: '/ortu',
};

interface UseAuthReturn {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    isKepsek: boolean;
    isGuru: boolean;
    isSiswa: boolean;
    isOrangTua: boolean;
    signOut: () => Promise<void>;
}

export function useAuth(requiredRole?: AppRole): UseAuthReturn {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        let cancelled = false;

        const syncFromSession = async (session: Session | null, authEvent: string) => {
            try {
                if (!session?.user) {
                    if (!cancelled) {
                        setUser(null);
                        document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                        router.push('/login');
                    }
                    return;
                }

                const authUser = session.user;

                const { data: dbUser, error } = await supabase
                    .from('users')
                    .select('id, email, full_name, role, school_id, metadata')
                    .eq('id', authUser.id)
                    .single();

                if (error || !dbUser) {
                    console.error('CRITICAL AUTH DEBUG:', {
                        authId: authUser.id,
                        email: authUser.email,
                        errorCode: error?.code,
                        errorMessage: error?.message,
                        errorDetails: error?.details,
                        dbUser: dbUser,
                        sessionUserId: session.user.id,
                        sessionEmail: session.user.email
                    });
                    
                    if (error) {
                        console.error('SUPABASE QUERY ERROR:', error);
                    }
                    
                    if (process.env.NODE_ENV === 'development') {
                        console.error('CRITICAL AUTH ERROR: User exists in Auth but MISSING in Public DB', {
                            authId: authUser.id,
                            email: authUser.email,
                            dbError: error,
                        });
                    }
                    console.error('[Auth] User sync error - signing out');
                    if (!cancelled) {
                        document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                        await supabase.auth.signOut();
                        router.push('/login');
                    }
                    return;
                }

                if (requiredRole && dbUser.role !== requiredRole) {
                    const targetRoute = ROLE_ROUTES[dbUser.role as AppRole];
                    if (!cancelled) {
                        if (targetRoute) {
                            router.push(targetRoute);
                        } else {
                            await supabase.auth.signOut();
                            router.push('/login');
                        }
                    }
                    return;
                }

                if (!cancelled) {
                    setUser(dbUser as User);
                }
            } catch (error) {
                console.error('Auth Unexpected Error:', error);
                if (!cancelled) {
                    router.push('/login');
                }
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            void Promise.resolve().then(async () => {
                setLoading(true);
                try {
                    await syncFromSession(session, event);
                } finally {
                    if (!cancelled) {
                        setLoading(false);
                    }
                }
            });
        });

        return () => {
            cancelled = true;
            subscription.unsubscribe();
        };
    }, [router, requiredRole]);

    async function signOut() {
        document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        await supabase.auth.signOut();
        router.push('/login');
    }

    return {
        user,
        loading,
        isAdmin: user?.role === 'admin',
        isKepsek: user?.role === 'kepala_sekolah',
        isGuru: user?.role === 'guru',
        isSiswa: user?.role === 'siswa',
        isOrangTua: user?.role === 'orang_tua',
        signOut
    };
}
