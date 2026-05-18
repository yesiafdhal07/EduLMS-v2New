'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { EntranceAnimation } from '@/components/ui';
import { AmbientBackground } from '@/components/landing-new/AmbientBackground';
import { KeyRound, AlertTriangle } from 'lucide-react';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
    const router = useRouter();

    // Pastikan user ada di session sebelum reset
    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (!data.session) {
                // Supabase hash params are handled by the library natively on load
                // but if we are here and still have no session, the link might be invalid
                const hash = window.location.hash;
                if (!hash || !hash.includes('access_token')) {
                    toast.error('Tautan tidak valid atau sudah kedaluwarsa.');
                    router.push('/login');
                }
            }
        };
        checkSession();
    }, [router]);

    const validatePasswordLive = (val: string) => {
        const errors: string[] = [];
        if (val.length > 0 && val.length < 8) errors.push('Minimal 8 karakter');
        if (val.length > 0 && !/[A-Z]/.test(val)) errors.push('Harus ada huruf besar');
        if (val.length > 0 && !/[0-9]/.test(val)) errors.push('Harus ada angka');
        setPasswordErrors(errors);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (passwordErrors.length > 0) {
            toast.error('Password tidak memenuhi syarat keamanan.');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Konfirmasi password tidak cocok.');
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            toast.error(`Gagal mengubah password: ${error.message}`);
        } else {
            toast.success('Password berhasil diubah! Silakan login dengan password baru.');
            await supabase.auth.signOut(); // Force clear session
            router.push('/login');
        }
        setLoading(false);
    };

    return (
        <EntranceAnimation>
            <div className="min-h-screen flex items-center justify-center bg-[#0F1014] p-4 relative overflow-hidden">
                <AmbientBackground />
                <div className="w-full max-w-md bg-[#181A20]/80 backdrop-blur-xl rounded-[3rem] p-10 border border-white/5 shadow-2xl relative z-10">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-[#86EAA5] rounded-2xl flex items-center justify-center font-black text-[#0F1014] text-3xl mx-auto mb-6 shadow-[0_10px_30px_rgba(134,234,165,0.3)]">
                            <KeyRound size={32} />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Set Password Baru</h1>
                        <p className="text-slate-400 mt-3 font-medium text-sm">
                            Buat password baru yang kuat untuk akun Anda.
                        </p>
                    </div>

                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Password Baru</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    validatePasswordLive(e.target.value);
                                }}
                                className="w-full bg-[#0F1014] border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#86EAA5] transition-all font-medium"
                                placeholder="Min 8 karakter, huruf besar + angka"
                                minLength={8}
                                required
                            />
                            {passwordErrors.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {passwordErrors.map((err, i) => (
                                        <p key={i} className="text-amber-400 text-xs flex items-center gap-1">
                                            <AlertTriangle size={12} />
                                            {err}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Konfirmasi Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-[#0F1014] border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#86EAA5] transition-all font-medium"
                                placeholder="Ulangi password baru"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || passwordErrors.length > 0}
                            className="w-full bg-white hover:bg-slate-200 text-[#0F1014] font-black py-4 rounded-2xl shadow-[0_10px_30px_rgba(255,255,255,0.1)] transform hover:-translate-y-1 transition-all disabled:opacity-50 tracking-wide text-[15px]"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
                        </button>
                    </form>
                </div>
            </div>
        </EntranceAnimation>
    );
}
