'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { EntranceAnimation } from '@/components/ui';
import { AmbientBackground } from '@/components/landing-new/AmbientBackground';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            toast.error(`Gagal mengirim email: ${error.message}`);
        } else {
            setIsSent(true);
            toast.success('Email instruksi telah dikirim!');
        }
        setLoading(false);
    };

    return (
        <EntranceAnimation>
            <div className="min-h-screen flex items-center justify-center bg-[#0F1014] p-4 relative overflow-hidden">
                <AmbientBackground />
                <div className="w-full max-w-md bg-[#181A20]/80 backdrop-blur-xl rounded-[3rem] p-10 border border-white/5 shadow-2xl relative z-10">
                    <div className="mb-6">
                        <Link href="/login" className="inline-flex items-center text-slate-400 hover:text-white transition-colors text-sm font-medium">
                            <ArrowLeft size={16} className="mr-2" /> Kembali ke Login
                        </Link>
                    </div>
                    
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-[#B4A3FF] rounded-2xl flex items-center justify-center font-black text-[#0F1014] text-3xl mx-auto mb-6 shadow-[0_10px_30px_rgba(180,163,255,0.3)]">
                            <Mail size={32} />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Lupa Password?</h1>
                        <p className="text-slate-400 mt-3 font-medium text-sm">
                            Masukkan email terdaftar Anda. Kami akan mengirimkan tautan untuk mengatur ulang password.
                        </p>
                    </div>

                    {!isSent ? (
                        <form onSubmit={handleReset} className="space-y-6">
                            <div>
                                <label htmlFor="reset-email" className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Email</label>
                                <input
                                    id="reset-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#0F1014] border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#B4A3FF] transition-all font-medium"
                                    placeholder="nama@sekolah.id"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white hover:bg-slate-200 text-[#0F1014] font-black py-4 rounded-2xl shadow-[0_10px_30px_rgba(255,255,255,0.1)] transform hover:-translate-y-1 transition-all disabled:opacity-50 tracking-wide text-[15px]"
                            >
                                {loading ? 'Mengirim...' : 'Kirim Tautan Reset'}
                            </button>
                        </form>
                    ) : (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center">
                            <h3 className="text-emerald-400 font-bold mb-2">Periksa Inbox Anda</h3>
                            <p className="text-sm text-slate-300">
                                Kami telah mengirimkan instruksi ke <span className="font-bold text-white">{email}</span>. Silakan klik tautan di email tersebut.
                            </p>
                            <button 
                                onClick={() => setIsSent(false)}
                                className="mt-4 text-xs font-bold text-[#B4A3FF] hover:text-white transition-colors"
                            >
                                Kirim ulang email
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </EntranceAnimation>
    );
}
