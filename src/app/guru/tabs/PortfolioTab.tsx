'use client';

import { useState, useRef } from 'react';
import { GraduationCap, History, Trophy, Save, Loader2, Camera, Briefcase, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { TeacherProfile } from '@/types';
import { useToast } from '@/components/ui';

interface PortfolioTabProps {
    teacherName: string;
    initialProfile: TeacherProfile | null;
    portfolioStats: { total_students: number; total_classes: number };
}

export function PortfolioTab({ teacherName, initialProfile, portfolioStats }: PortfolioTabProps) {
    const toast = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(
        initialProfile || { id: '', photo_url: '', position: '', teaching_experience: '', education_history: '', achievements: '' }
    );
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('File harus berupa gambar!');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Ukuran file maksimal 2MB!');
            return;
        }

        setIsUploading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}_profile.${fileExt}`;
            const filePath = `teacher-photos/${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('uploads')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('uploads')
                .getPublicUrl(filePath);

            const photoUrl = urlData.publicUrl;

            // Update state
            setTeacherProfile(prev => prev ? { ...prev, photo_url: photoUrl } : prev);
            toast.success('Foto berhasil diupload!');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Gagal upload foto';
            toast.error(message);
        } finally {
            setIsUploading(false);
        }
    }

    async function savePortfolio() {
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase.from('teacher_profiles').upsert({
                id: user.id,
                ...teacherProfile,
                updated_at: new Date().toISOString()
            });

            if (error) throw error;
            toast.success('Portofolio berhasil diperbarui!');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Gagal menyimpan portofolio';
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Stats & Role Card */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[4rem] opacity-30"></div>

                        {/* Photo Upload Section */}
                        <div className="relative mx-auto mb-8 w-fit">
                            {teacherProfile?.photo_url ? (
                                <img
                                    src={teacherProfile.photo_url}
                                    alt={teacherName}
                                    className="w-32 h-32 rounded-[2.5rem] object-cover shadow-2xl shadow-indigo-600/30 border-4 border-white"
                                />
                            ) : (
                                <div className="w-32 h-32 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-indigo-600/30">
                                    {teacherName.charAt(0)}
                                </div>
                            )}

                            {/* Upload Button Overlay */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-colors border border-slate-100"
                            >
                                {isUploading ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <Camera size={20} />
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                aria-label="Upload foto profil"
                                onChange={handlePhotoUpload}
                            />
                        </div>

                        <h3 className="text-3xl font-black text-slate-900 mb-2">{teacherName}</h3>

                        {/* Position/Role Display */}
                        <p className="text-indigo-600 font-black text-xs uppercase tracking-[0.3em] mb-12">
                            {teacherProfile?.position || 'Guru Profesional'}
                        </p>

                        <div className="grid grid-cols-2 gap-6 pt-10 border-t border-slate-50">
                            <div className="text-center">
                                <p className="text-3xl font-black text-slate-900 tracking-tighter">{portfolioStats.total_students}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Murid</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-black text-slate-900 tracking-tighter">{portfolioStats.total_classes}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Kelas</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-900 p-10 rounded-[3rem] text-white shadow-2xl shadow-indigo-900/40 relative overflow-hidden">
                        <Trophy className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10 rotate-12" />
                        <h4 className="text-xl font-black mb-4 flex items-center gap-3">
                            <Trophy size={24} className="text-amber-400" />
                            Peran Sistem
                        </h4>
                        <p className="text-indigo-200 text-sm font-medium leading-relaxed">
                            Sebagai Guru, Anda memiliki kendali penuh atas manajemen kelas, penugasan tersegmentasi, dan pemantauan presensi real-time.
                        </p>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/40">
                        <div className="flex justify-between items-center mb-10">
                            <h4 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                                <GraduationCap size={28} className="text-indigo-600" />
                                Detail Kredibilitas
                            </h4>
                            <button
                                type="button"
                                onClick={savePortfolio}
                                disabled={isSaving}
                                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all uppercase text-xs tracking-widest disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                Simpan Portofolio
                            </button>
                        </div>

                        <div className="space-y-10">
                            {/* Position Field */}
                            <div className="space-y-4">
                                <label htmlFor="position" className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
                                    <Briefcase size={16} className="text-indigo-500" />
                                    Jabatan / Kedudukan
                                </label>
                                <input
                                    id="position"
                                    type="text"
                                    className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-700 transition-all"
                                    placeholder="Contoh: Guru Matematika, Wakil Kepala Sekolah, Wali Kelas XII IPA 1"
                                    value={teacherProfile?.position || ''}
                                    onChange={(e) => teacherProfile && setTeacherProfile({ ...teacherProfile, position: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <label htmlFor="teaching-exp" className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
                                    <History size={16} className="text-indigo-500" />
                                    Pengalaman Mengajar
                                </label>
                                <textarea
                                    id="teaching-exp"
                                    className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-700 h-40 resize-none transition-all"
                                    placeholder="Sebutkan pengalaman Anda mengajar..."
                                    value={teacherProfile?.teaching_experience || ''}
                                    onChange={(e) => teacherProfile && setTeacherProfile({ ...teacherProfile, teaching_experience: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="space-y-4">
                                <label htmlFor="education-hist" className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
                                    <GraduationCap size={16} className="text-indigo-500" />
                                    Riwayat Pendidikan
                                </label>
                                <textarea
                                    id="education-hist"
                                    className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-700 h-40 resize-none transition-all"
                                    placeholder="Sebutkan riwayat pendidikan formal Anda..."
                                    value={teacherProfile?.education_history || ''}
                                    onChange={(e) => teacherProfile && setTeacherProfile({ ...teacherProfile, education_history: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="space-y-4">
                                <label htmlFor="achievements" className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
                                    <Trophy size={16} className="text-indigo-500" />
                                    Prestasi Siswa
                                </label>
                                <textarea
                                    id="achievements"
                                    className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-700 h-40 resize-none transition-all"
                                    placeholder="Catat prestasi membanggakan yang diraih murid bimbingan Anda..."
                                    value={teacherProfile?.achievements || ''}
                                    onChange={(e) => teacherProfile && setTeacherProfile({ ...teacherProfile, achievements: e.target.value })}
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
