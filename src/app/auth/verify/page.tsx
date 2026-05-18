'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { UniverseSkeleton } from '@/components/ui';

export default function VerifyPage() {
    const router = useRouter();
    const [status, setStatus] = useState<'verifying' | 'needs_profile'>('verifying');
    const [schoolCode, setSchoolCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const verifyAndRedirect = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            // 1. Check for pending registration data from localStorage
            const pendingDataStr = localStorage.getItem('pending_registration');
            
            if (pendingDataStr) {
                try {
                    const pendingData = JSON.parse(pendingDataStr);
                    localStorage.removeItem('pending_registration');

                    const { data: codeData, error: codeError } = await supabase
                        .rpc('validate_school_code', { p_code: pendingData.school_code });

                    if (!codeError && codeData?.valid) {
                        await supabase
                            .from('users')
                            .update({
                                full_name: pendingData.full_name || user.user_metadata.full_name || user.user_metadata.name || 'User Baru',
                                school_id: codeData.school_id,
                                role: codeData.role
                            })
                            .eq('id', user.id);

                        if (codeData.role === 'siswa' && pendingData.class_id) {
                            await supabase.from('class_members').insert({ class_id: pendingData.class_id, user_id: user.id });
                        }
                        toast.success('Pendaftaran Google Berhasil!');
                    }
                } catch (e) { console.error(e); }
            }

            // 2. Check if user already has a school association
            const { data: dbUser } = await supabase
                .from('users')
                .select('role, school_id')
                .eq('id', user.id)
                .single();

            if (dbUser?.school_id) {
                const roleRoutes: Record<string, string> = {
                    admin: '/admin',
                    kepala_sekolah: '/kepala-sekolah',
                    guru: '/guru',
                    siswa: '/siswa',
                };
                router.push(roleRoutes[dbUser.role] || '/siswa');
            } else {
                // User has no school, show the form
                setStatus('needs_profile');
            }
        };

        verifyAndRedirect();
    }, [router]);

    const handleCompleteProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: codeData, error: codeError } = await supabase
            .rpc('validate_school_code', { p_code: schoolCode.trim().toUpperCase() });

        if (codeError || !codeData?.valid) {
            toast.error(codeData?.message || 'Kode sekolah tidak valid.');
            setIsSubmitting(false);
            return;
        }

        const { error: updateError } = await supabase
            .from('users')
            .update({
                school_id: codeData.school_id,
                role: codeData.role,
                full_name: user.user_metadata.full_name || user.user_metadata.name || 'User Google'
            })
            .eq('id', user.id);

        if (updateError) {
            toast.error('Gagal memperbarui profil.');
        } else {
            toast.success('Profil berhasil diperbarui!');
            window.location.reload(); // Refresh to trigger the main effect again
        }
        setIsSubmitting(false);
    };

    if (status === 'needs_profile') {
        return (
            <div className="min-h-screen bg-[#0F1014] flex items-center justify-center p-8">
                <div className="max-w-md w-full universe-card p-10 border border-white/10">
                    <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Satu Langkah Lagi</h2>
                    <p className="text-slate-400 text-sm mb-8">Akun Google Anda berhasil terhubung. Masukkan kode sekolah untuk menyelesaikan pendaftaran.</p>
                    
                    <form onSubmit={handleCompleteProfile} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Kode Sekolah</label>
                            <input
                                type="text"
                                value={schoolCode}
                                onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-mono font-bold tracking-widest"
                                placeholder="KODE-SEKOLAH"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Memproses...' : 'Selesaikan Pendaftaran'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F1014] flex items-center justify-center p-8 text-center">
            <div className="max-w-md w-full">
                <div className="h-16 w-16 mx-auto mb-8 rounded-2xl bg-white/5 animate-pulse" />
                <h1 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">Menyelaraskan Sesi</h1>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest animate-pulse">
                    Memverifikasi kredensial dan menghubungkan ke pusat data...
                </p>
            </div>
        </div>
    );
}
