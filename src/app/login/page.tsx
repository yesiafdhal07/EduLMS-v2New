'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Footer, EntranceAnimation } from '@/components/ui';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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

            if (dbError || !dbUser) {
                // Fallback to metadata if DB query fails, but log warning
                console.warn('Could not verify role from database, using metadata');
                const role = data.user.user_metadata?.role;
                router.push(role === 'guru' ? '/guru' : '/siswa');
            } else {
                // Use database role as source of truth
                if (dbUser.role === 'guru' || dbUser.role === 'admin') {
                    router.push('/guru');
                } else {
                    router.push('/siswa');
                }
            }
        }
        setLoading(false);
    };

    return (
        <EntranceAnimation>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
                <div className="w-full max-w-md bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl shadow-black/50">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-tight">
                            EduLMS
                        </h1>
                        <p className="text-slate-400 mt-2 font-medium">Selamat datang di platform belajar digital</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="login-email" className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Email</label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
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
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transform active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
                        >
                            {loading ? 'Memuat...' : 'Masuk'}
                        </button>
                    </form>

                    <div className="mt-8 text-center space-y-4">
                        <p className="text-slate-400 text-sm">
                            Belum punya akun? <Link href="/register" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">Daftar di sini</Link>
                        </p>
                        <p className="text-slate-500 text-xs">
                            Lupa password? <span className="hover:text-slate-300 cursor-pointer transition-colors">Hubungi Admin</span>
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
