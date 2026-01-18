'use client';

import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Sparkles, BookOpen, Users, PlayCircle } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';

interface OnboardingWizardProps {
    userId: string;
    userName?: string;
    onComplete?: () => void;
    onCreateClass?: () => void;
}

export function OnboardingWizard({ userId, userName = 'Guru', onComplete, onCreateClass }: OnboardingWizardProps) {
    const {
        isComplete,
        loading,
        currentStep,
        totalSteps,
        stepName,
        nextStep,
        prevStep,
        skipOnboarding,
    } = useOnboarding(userId);

    const [inviteCode] = useState(() => 
        Array.from({ length: 6 }, () => 
            'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
        ).join('')
    );

    if (loading || isComplete) return null;

    const handleNext = async () => {
        if (stepName === 'create_class' && onCreateClass) {
            onCreateClass();
        }
        
        if (stepName === 'complete') {
            await nextStep();
            onComplete?.();
        } else {
            await nextStep();
        }
    };

    const handleSkip = async () => {
        await skipOnboarding();
        onComplete?.();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                            <Sparkles className="text-indigo-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Selamat Datang!</h2>
                            <p className="text-sm text-slate-400">Setup akun dalam {totalSteps - 1} langkah</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSkip}
                        className="text-slate-400 hover:text-white transition-colors"
                        aria-label="Skip onboarding"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Progress */}
                <div className="px-6 py-3 bg-white/5">
                    <div className="flex gap-2">
                        {Array.from({ length: totalSteps - 1 }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full transition-all ${
                                    i < currentStep ? 'bg-indigo-500' :
                                    i === currentStep ? 'bg-indigo-500/50' :
                                    'bg-white/10'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 min-h-[300px]">
                    {stepName === 'welcome' && (
                        <WelcomeStep userName={userName} />
                    )}
                    {stepName === 'profile' && (
                        <ProfileStep />
                    )}
                    {stepName === 'create_class' && (
                        <CreateClassStep />
                    )}
                    {stepName === 'invite_students' && (
                        <InviteStudentsStep inviteCode={inviteCode} />
                    )}
                    {stepName === 'tour' && (
                        <TourStep />
                    )}
                    {stepName === 'complete' && (
                        <CompleteStep userName={userName} />
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex justify-between">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className="px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <ChevronLeft size={18} />
                        Kembali
                    </button>
                    <button
                        onClick={handleNext}
                        className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-all flex items-center gap-2"
                    >
                        {stepName === 'complete' ? (
                            <>
                                Mulai <Check size={18} />
                            </>
                        ) : (
                            <>
                                Lanjut <ChevronRight size={18} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function WelcomeStep({ userName }: { userName: string }) {
    return (
        <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center animate-bounce">
                <Sparkles className="text-white" size={40} />
            </div>
            <h3 className="text-2xl font-black text-white">Halo, {userName}! 👋</h3>
            <p className="text-slate-300 max-w-sm mx-auto">
                Selamat datang di <span className="text-indigo-400 font-bold">EduLMS</span>!
                Mari setup akun Anda agar siap mengajar.
            </p>
        </div>
    );
}

function ProfileStep() {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">📝 Lengkapi Profil</h3>
            <p className="text-slate-300 text-sm">
                Informasi ini akan ditampilkan kepada siswa Anda.
            </p>
            <div className="space-y-3">
                <div>
                    <label className="text-sm text-slate-400 block mb-1">Mata Pelajaran</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                        <option value="">Pilih Mata Pelajaran</option>
                        <option value="matematika">Matematika</option>
                        <option value="fisika">Fisika</option>
                        <option value="kimia">Kimia</option>
                        <option value="biologi">Biologi</option>
                        <option value="bahasa_indonesia">Bahasa Indonesia</option>
                        <option value="bahasa_inggris">Bahasa Inggris</option>
                        <option value="other">Lainnya</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm text-slate-400 block mb-1">Sekolah/Institusi</label>
                    <input 
                        type="text"
                        placeholder="SMA Negeri 1 Jakarta"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500"
                    />
                </div>
            </div>
        </div>
    );
}

function CreateClassStep() {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">🏫 Buat Kelas Pertama</h3>
            <p className="text-slate-300 text-sm">
                Buat kelas untuk mulai mengelola siswa dan materi.
            </p>
            <div>
                <label className="text-sm text-slate-400 block mb-1">Nama Kelas</label>
                <input 
                    type="text"
                    placeholder="Contoh: Kelas 10 IPA 1"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500"
                />
            </div>
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                <p className="text-sm text-indigo-300">
                    💡 <strong>Tips:</strong> Anda bisa membuat lebih banyak kelas nanti dari Dashboard.
                </p>
            </div>
        </div>
    );
}

function InviteStudentsStep({ inviteCode }: { inviteCode: string }) {
    const handleCopy = () => {
        navigator.clipboard.writeText(inviteCode);
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">👥 Undang Siswa</h3>
            <p className="text-slate-300 text-sm">
                Bagikan kode ini kepada siswa agar mereka bisa bergabung ke kelas Anda.
            </p>
            <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-6 text-center">
                <p className="text-sm text-slate-400 mb-2">Kode Undangan</p>
                <p className="text-4xl font-black text-white tracking-widest">{inviteCode}</p>
                <button
                    onClick={handleCopy}
                    className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-all"
                >
                    📋 Salin Kode
                </button>
            </div>
        </div>
    );
}

function TourStep() {
    const features = [
        { icon: <BookOpen size={20} />, title: 'Materi', desc: 'Upload dan kelola materi pembelajaran' },
        { icon: <Users size={20} />, title: 'Absensi', desc: 'Absensi dengan QR Code atau manual' },
        { icon: <PlayCircle size={20} />, title: 'Kuis', desc: 'Buat kuis interaktif untuk siswa' },
    ];

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">📚 Fitur Utama</h3>
            <p className="text-slate-300 text-sm">
                Berikut beberapa fitur yang bisa Anda gunakan.
            </p>
            <div className="space-y-3">
                {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
                            {f.icon}
                        </div>
                        <div>
                            <p className="font-bold text-white">{f.title}</p>
                            <p className="text-sm text-slate-400">{f.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CompleteStep({ userName }: { userName: string }) {
    return (
        <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mx-auto flex items-center justify-center">
                <Check className="text-white" size={40} />
            </div>
            <h3 className="text-2xl font-black text-white">Selesai! 🎉</h3>
            <p className="text-slate-300 max-w-sm mx-auto">
                Akun Anda sudah siap, <span className="text-emerald-400 font-bold">{userName}</span>!
                Selamat mengajar.
            </p>
        </div>
    );
}
