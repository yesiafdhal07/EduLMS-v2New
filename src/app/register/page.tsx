'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Footer, EntranceAnimation } from '@/components/ui';
import { AmbientBackground } from '@/components/landing-new/AmbientBackground';
import { CheckCircle, School, Users, BookOpen, AlertTriangle } from 'lucide-react';
import { registerSchema } from '@/lib/validations';

interface ValidatedCode {
    school_id: string;
    school_name: string;
    role: 'guru' | 'siswa';
}

export default function RegisterPage() {
    const [schoolCode, setSchoolCode] = useState('');
    const [validatedCode, setValidatedCode] = useState<ValidatedCode | null>(null);
    const [validating, setValidating] = useState(false);

    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
    const [classesLoading, setClassesLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const validateCode = useCallback(async () => {
        if (schoolCode.trim().length < 3) return;
        setValidating(true);
        setClasses([]);
        setSelectedClass('');

        const { data, error } = await supabase
            .rpc('validate_school_code', { p_code: schoolCode.trim().toUpperCase() });

        if (error || !data || !data.valid) {
            toast.error(data?.message || 'Kode sekolah tidak ditemukan.');
            setValidatedCode(null);
            setValidating(false);
            return;
        }

        setValidatedCode({
            school_id: data.school_id,
            school_name: data.school_name,
            role: data.role as 'guru' | 'siswa',
        });
        setValidating(false);
        toast.success(`Terhubung ke ${data.school_name}`);
    }, [schoolCode]);

    useEffect(() => {
        if (!validatedCode || validatedCode.role !== 'siswa') return;

        const fetchClasses = async () => {
            setClassesLoading(true);
            const { data, error } = await supabase
                .from('classes')
                .select('id, name')
                .eq('school_id', validatedCode.school_id)
                .is('deleted_at', null)
                .order('name', { ascending: true });

            if (!error && data) setClasses(data);
            setClassesLoading(false);
        };
        fetchClasses();
    }, [validatedCode]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validatedCode) {
            toast.warning('Silakan cek kode sekolah terlebih dahulu.');
            return;
        }

        if (validatedCode.role === 'siswa' && !selectedClass) {
            toast.warning('Silakan pilih kelas.');
            return;
        }

        const validation = registerSchema.safeParse({
            fullName,
            email,
            password,
            confirmPassword,
            schoolCode: schoolCode.trim().toUpperCase(),
        });

        if (!validation.success) {
            validation.error.issues.forEach((issue) => toast.error(issue.message));
            return;
        }

        setLoading(true);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    school_code: schoolCode.trim().toUpperCase(),
                    class_id: validatedCode.role === 'siswa' ? selectedClass : undefined,
                }
            }
        });

        if (error) {
            toast.error(`Pendaftaran Gagal: ${error.message}`);
        } else if (data.user) {
            toast.success('Pendaftaran Berhasil! Silakan masuk.');
            router.push('/login');
        }
        setLoading(false);
    };

    const roleConfig = validatedCode?.role === 'guru'
        ? { label: 'Guru', icon: BookOpen, color: 'indigo', text: 'text-indigo-400' }
        : { label: 'Siswa', icon: Users, color: 'emerald', text: 'text-emerald-400' };

    return (
        <EntranceAnimation>
            <div className="min-h-screen flex items-center justify-center bg-[#0F1014] p-4 relative overflow-hidden">
                <AmbientBackground />
                <div className="w-full max-w-md bg-[#181A20]/80 backdrop-blur-xl rounded-[3rem] p-10 border border-white/5 shadow-2xl relative z-10">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-[#B4A3FF] rounded-2xl flex items-center justify-center font-black text-[#0F1014] text-3xl mx-auto mb-6 shadow-[0_10px_30px_rgba(180,163,255,0.3)]">K</div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Daftar Akun</h1>
                        <p className="text-slate-400 mt-3 font-medium text-sm">Buat akun untuk mulai belajar.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        {/* Nama Lengkap */}
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Nama Lengkap</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-[#0F1014] border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#B4A3FF] transition-all font-medium"
                                placeholder="Nama lengkap Anda"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#0F1014] border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#B4A3FF] transition-all font-medium"
                                placeholder="nama@email.com"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#0F1014] border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#B4A3FF] transition-all font-medium"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {/* Konfirmasi Password */}
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Konfirmasi Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-[#0F1014] border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#B4A3FF] transition-all font-medium"
                                placeholder="••••••••"
                                required
                            />
                        </div>


                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Kode Sekolah</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={schoolCode}
                                    onChange={(e) => {
                                        setSchoolCode(e.target.value.toUpperCase());
                                        if (validatedCode) setValidatedCode(null);
                                    }}
                                    className="flex-1 bg-[#0F1014] border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#B4A3FF] transition-all font-mono font-bold tracking-widest uppercase"
                                    placeholder="KODE-SEKOLAH"
                                    maxLength={12}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={validateCode}
                                    disabled={validating || schoolCode.trim().length < 3}
                                    className="px-5 bg-[#B4A3FF] text-[#0F1014] rounded-2xl font-black text-sm hover:bg-white transition-colors disabled:opacity-40"
                                >
                                    {validating ? '...' : 'Cek'}
                                </button>
                            </div>
                        </div>

                        {/* Validated Info */}
                        {validatedCode && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#B4A3FF]/20 flex items-center justify-center">
                                        <School size={20} className="text-[#B4A3FF]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-bold text-sm leading-tight">{validatedCode.school_name}</p>
                                        <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${roleConfig.text}`}>
                                            Mendaftar sebagai {roleConfig.label}
                                        </p>
                                    </div>
                                    <CheckCircle size={18} className="text-emerald-400" />
                                </div>

                                {validatedCode.role === 'siswa' && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide text-xs">Pilih Kelas</label>
                                        <select
                                            value={selectedClass}
                                            onChange={(e) => setSelectedClass(e.target.value)}
                                            className="w-full bg-[#0F1014] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#B4A3FF] transition-all font-medium appearance-none"
                                            required
                                            disabled={classesLoading}
                                        >
                                            <option value="" className="text-slate-900">
                                                {classesLoading ? 'Memuat...' : '-- Pilih Kelas --'}
                                            </option>
                                            {classes.map((cls) => (
                                                <option key={cls.id} value={cls.id} className="text-slate-900">{cls.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white hover:bg-slate-200 text-[#0F1014] font-black py-4 rounded-2xl shadow-[0_10px_30px_rgba(255,255,255,0.1)] transform hover:-translate-y-1 transition-all disabled:opacity-50 tracking-wide text-[15px] mt-2"
                        >
                            {loading ? 'Memproses...' : 'Daftar Sekarang'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-400 text-sm font-medium">
                            Sudah punya akun? <Link href="/login" className="text-[#B4A3FF] font-bold hover:text-white transition-colors">Masuk di sini</Link>
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
