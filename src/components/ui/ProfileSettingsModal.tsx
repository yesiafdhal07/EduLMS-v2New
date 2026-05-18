'use client';

import { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Camera, Shield, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { AppRole } from '@/types';
import { getRoleTheme } from '@/lib/theme/roleTheme';

interface ProfileSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    role: AppRole;
    user: any;
}

export function ProfileSettingsModal({ isOpen, onClose, role, user }: ProfileSettingsModalProps) {
    const theme = getRoleTheme(role);
    
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFullName(user.full_name || '');
            setEmail(user.email || '');
        }
    }, [user]);

    if (!isOpen) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            });

            if (error) throw error;
            
            // Also update the users table
            const { error: dbError } = await supabase
                .from('users')
                .update({ full_name: fullName })
                .eq('id', user.id);
                
            if (dbError) throw dbError;

            toast.success('Profil berhasil diperbarui!');
            onClose();
            // Refresh to show changes (or rely on context update if we had one)
            setTimeout(() => window.location.reload(), 1000);
        } catch (error: any) {
            toast.error(`Gagal menyimpan: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <button 
                type="button" 
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm cursor-default transition-opacity"
                onClick={onClose}
                aria-label="Tutup modal"
            />
            
            <div className="bg-[#0A0B0E] border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className={`h-2 w-full bg-gradient-to-r ${theme.navItemGlow}`} />
                
                <div className="p-6 md:p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Pengaturan Profil</h2>
                            <p className="text-slate-400 text-sm mt-1">Kelola identitas dan preferensi akun Anda.</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Avatar Section */}
                        <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                            <div className={`w-16 h-16 rounded-2xl ${theme.accentBgStrong} flex items-center justify-center font-black text-white text-2xl relative overflow-hidden group`}>
                                {(fullName || 'U').charAt(0).toUpperCase()}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera size={20} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-base">{fullName || 'User'}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Shield size={12} className={theme.accentText} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${theme.accentText}`}>
                                        {role.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 ml-1">Nama Lengkap</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                        <User size={16} />
                                    </div>
                                    <input 
                                        type="text" 
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/20 transition-colors"
                                        placeholder="Nama Lengkap"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 ml-1">Email (Tidak dapat diubah)</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                        <Mail size={16} />
                                    </div>
                                    <input 
                                        type="email" 
                                        value={email}
                                        disabled
                                        className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-slate-500 text-sm cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                            <button 
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                type="submit"
                                disabled={loading || !fullName.trim()}
                                className={`px-6 py-2.5 rounded-xl text-sm font-black text-white ${theme.accentBgStrong} hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50`}
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Save size={16} />
                                )}
                                Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
