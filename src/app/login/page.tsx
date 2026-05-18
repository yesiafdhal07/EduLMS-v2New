'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Footer, EntranceAnimation } from '@/components/ui';
import { AmbientBackground } from '@/components/landing-new/AmbientBackground';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('error') === 'profile_missing') {
            void supabase.auth.signOut();
            toast.error(
                'Sesi tidak memiliki profil di database. Silakan masuk lagi setelah admin memperbaiki akun, atau hubungi administrator.'
            );
            params.delete('error');
            const next = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
            window.history.replaceState({}, '', next);
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Login Error:', error.message);
            if (error.message.includes('Email not confirmed')) {
                toast.error('Login Gagal: Email Anda belum dikonfirmasi. Silakan buka inbox email Anda atau matikan pengaturan "Confirm Email" di Dashboard Supabase.');
            } else {
                toast.error(`Login Gagal: ${error.message}`);
            }
        } else if (data?.user) {
            // SECURITY FIX: Always verify role from database, not metadata
            // user_metadata is client-mutable and can be exploited
            const { data: dbUser, error: dbError } = await supabase
                .from('users')
                .select('role')
                .eq('id', data.user.id)
                .single();

            const roleRoutes: Record<string, string> = {
                admin: '/admin',
                kepala_sekolah: '/kepala-sekolah',
                guru: '/guru',
                siswa: '/siswa',
                orang_tua: '/ortu',
            };

            if (dbError || !dbUser) {
                console.error('Login blocked: auth user has no public.users row (cannot verify role)', dbError);
                toast.error(
                    'Profil akun tidak ditemukan di database. Hubungi admin atau pastikan trigger pendaftaran Supabase aktif.'
                );
                await supabase.auth.signOut();
            } else {
                document.cookie = `user_role=${dbUser.role}; path=/; max-age=604800; SameSite=Strict${window.location.protocol === 'https:' ? '; Secure' : ''}`;
                router.push(roleRoutes[dbUser.role] || '/siswa');
            }
        }
        setLoading(false);
    };

    // Google OAuth removed — login is email/password only

    return (
        <EntranceAnimation>
            <div className="min-h-screen flex items-center justify-center bg-[#0F1014] p-4 relative overflow-hidden">
                <AmbientBackground />
                <div className="w-full max-w-md bg-[#181A20]/80 backdrop-blur-xl rounded-[3rem] p-10 border border-white/5 shadow-2xl relative z-10">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-[#B4A3FF] rounded-2xl flex items-center justify-center font-black text-[#0F1014] text-3xl mx-auto mb-6 shadow-[0_10px_30px_rgba(180,163,255,0.3)]">K</div>
                        <h1 className="text-4xl font-black text-white tracking-tight">
                            Klolakelas
                        </h1>
                        <p className="text-slate-400 mt-3 font-medium text-sm">Masuk log ke portal eksekutif Anda.</p>
                    </div>

                    <div className="space-y-6">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label htmlFor="login-email" className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Email</label>
                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#0F1014] border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#B4A3FF] transition-all font-medium"
                                    placeholder="nama@sekolah.id"
                                    autoComplete="email"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="login-password" className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Password</label>
                                <input
                                    id="login-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#0F1014] border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#B4A3FF] transition-all font-medium"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white hover:bg-slate-200 text-[#0F1014] font-black py-4 rounded-2xl shadow-[0_10px_30px_rgba(255,255,255,0.1)] transform hover:-translate-y-1 transition-all disabled:opacity-50 tracking-wide text-[15px]"
                            >
                                {loading ? 'Memuat...' : 'Akses Portal'}
                            </button>
                        </form>
                    </div>

                    <div className="mt-8 text-center space-y-4">
                        <p className="text-slate-400 text-sm font-medium">
                            Belum mendaftar? <Link href="/register" className="text-[#86EAA5] font-bold hover:text-[#6cdb8d] transition-colors">Konsultasi ke Ahli</Link>
                        </p>
                        <p className="text-slate-500 text-xs">
                            Lupa password? <Link href="/forgot-password" className="hover:text-slate-300 cursor-pointer transition-colors">Reset di sini</Link>
                        </p>
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0">
                    <Footer />
                </div>
            </div>
        </EntranceAnimation>
    );
}
