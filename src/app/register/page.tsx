'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [classesLoading, setClassesLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        setClassesLoading(true);
        try {
            // Fetch all classes ordered by name for student registration
            const { data, error } = await supabase
                .from('classes')
                .select('id, name')
                .order('name', { ascending: true });

            if (error) {
                console.error('Error fetching classes:', error);
                toast.error('Gagal memuat daftar kelas');
            } else {
                setClasses(data || []);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setClassesLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClass) {
            toast.warning('Silakan pilih kelas terlebih dahulu!');
            return;
        }

        setLoading(true);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: 'siswa',
                    class_id: selectedClass,
                }
            }
        });

        if (error) {
            console.error('Registration Error:', error.message);
            toast.error(`Pendaftaran Gagal: ${error.message}`);
        } else if (data.user) {
            toast.success('Pendaftaran Berhasil! Silakan masuk.');
            router.push('/login');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
            <div className="w-full max-w-md bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl shadow-black/50">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-tight">
                        Daftar Akun
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Gabung untuk mulai belajar digital</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label htmlFor="register-name" className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Nama Lengkap</label>
                        <input
                            id="register-name"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                            placeholder="Al Khawarizmi"
                            autoComplete="name"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="register-email" className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Email</label>
                        <input
                            id="register-email"
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
                        <label htmlFor="register-class" className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Pilih Kelas</label>
                        <select
                            id="register-class"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium appearance-none"
                            required
                            disabled={classesLoading}
                        >
                            <option value="" className="text-slate-900">
                                {classesLoading ? 'Memuat kelas...' : '-- Pilih Kelas --'}
                            </option>
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id} className="text-slate-900">
                                    {cls.name}
                                </option>
                            ))}
                        </select>
                        {!classesLoading && classes.length === 0 && (
                            <p className="text-rose-400 text-xs mt-2">Belum ada kelas. Guru harus membuat kelas terlebih dahulu.</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="register-password" className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Password</label>
                        <input
                            id="register-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                            placeholder="••••••••"
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transform active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
                    >
                        {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-400 text-sm">
                        Sudah punya akun? <Link href="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">Masuk di sini</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
