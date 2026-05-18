'use client';

import { useState, useCallback } from 'react';
import { Palette, Check, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ============================================================
// AVATAR SELECTOR — USP #11
// Visual identity customization. Students pick an emoji avatar
// + accent color. Stored in users.metadata.
// ============================================================

const AVATAR_OPTIONS = [
    // Animals
    '🦁', '🐯', '🦊', '🐺', '🦝', '🐼', '🐨', '🦄',
    // Space
    '🚀', '⭐', '🌙', '🪐', '☄️', '🛸',
    // Academic
    '📚', '🔬', '🎨', '🎯', '🏆', '💡', '🎮', '🎵',
    // Nature
    '🌊', '🌺', '🌿', '⚡', '🔥', '❄️',
];

const COLOR_ACCENTS = [
    { label: 'Indigo', value: '#6366f1', bg: 'bg-indigo-500' },
    { label: 'Emerald', value: '#10b981', bg: 'bg-emerald-500' },
    { label: 'Rose', value: '#f43f5e', bg: 'bg-rose-500' },
    { label: 'Amber', value: '#f59e0b', bg: 'bg-amber-500' },
    { label: 'Cyan', value: '#06b6d4', bg: 'bg-cyan-500' },
    { label: 'Violet', value: '#8b5cf6', bg: 'bg-violet-500' },
    { label: 'Pink', value: '#ec4899', bg: 'bg-pink-500' },
    { label: 'Lime', value: '#84cc16', bg: 'bg-lime-500' },
];

interface AvatarSelectorProps {
    userId: string;
    currentAvatar?: string;
    currentColor?: string;
    userName?: string;
    onSave?: (avatar: string, color: string) => void;
}

export function AvatarSelector({
    userId,
    currentAvatar = '🦁',
    currentColor = '#6366f1',
    userName = 'Siswa',
    onSave,
}: AvatarSelectorProps) {
    const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
    const [selectedColor, setSelectedColor] = useState(currentColor);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const hasChanges = selectedAvatar !== currentAvatar || selectedColor !== currentColor;

    const handleSave = useCallback(async () => {
        if (!hasChanges || saving) return;
        setSaving(true);

        try {
            const { error } = await supabase
                .from('users')
                .update({
                    metadata: {
                        avatar: selectedAvatar,
                        accentColor: selectedColor,
                    },
                })
                .eq('id', userId);

            if (error) throw error;

            setSaved(true);
            onSave?.(selectedAvatar, selectedColor);
            toast.success('✨ Avatar tersimpan!');
            setTimeout(() => setSaved(false), 2000);
        } catch {
            toast.error('Gagal menyimpan avatar');
        } finally {
            setSaving(false);
        }
    }, [hasChanges, saving, selectedAvatar, selectedColor, userId, onSave]);

    return (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-5">
            {/* Header + Preview */}
            <div className="flex items-center gap-4">
                <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 border-2 transition-all duration-300"
                    style={{ borderColor: selectedColor, backgroundColor: `${selectedColor}20` }}
                >
                    {selectedAvatar}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Palette size={14} className="text-indigo-400" />
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Avatar Saya</p>
                    </div>
                    <p className="text-sm font-black text-white truncate">{userName}</p>
                    <p className="text-xs text-slate-500">Pilih emoji & warna aksen</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        saved
                            ? 'bg-emerald-600/30 border border-emerald-500/40 text-emerald-300'
                            : hasChanges
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            : 'bg-white/5 border border-white/10 text-slate-600 cursor-not-allowed'
                    }`}
                >
                    {saving ? <Loader2 size={12} className="animate-spin" /> :
                     saved ? <Check size={12} /> :
                     <Sparkles size={12} />}
                    {saving ? 'Menyimpan...' : saved ? 'Tersimpan!' : 'Simpan'}
                </button>
            </div>

            {/* Emoji Grid */}
            <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Pilih Emoji</p>
                <div className="grid grid-cols-8 gap-1.5">
                    {AVATAR_OPTIONS.map(emoji => (
                        <button
                            key={emoji}
                            onClick={() => setSelectedAvatar(emoji)}
                            className={`w-full aspect-square rounded-xl text-xl flex items-center justify-center transition-all ${
                                selectedAvatar === emoji
                                    ? 'bg-indigo-500/30 border-2 scale-105'
                                    : 'bg-white/[0.03] border border-white/5 hover:bg-white/10'
                            }`}
                            style={selectedAvatar === emoji ? { borderColor: selectedColor } : {}}
                            title={emoji}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>

            {/* Color Picker */}
            <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Warna Aksen</p>
                <div className="flex items-center gap-2 flex-wrap">
                    {COLOR_ACCENTS.map(c => (
                        <button
                            key={c.value}
                            onClick={() => setSelectedColor(c.value)}
                            title={c.label}
                            className={`w-7 h-7 rounded-full transition-all ${c.bg} ${
                                selectedColor === c.value
                                    ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                                    : 'hover:scale-105 opacity-70 hover:opacity-100'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
