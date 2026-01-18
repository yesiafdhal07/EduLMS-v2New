'use client';

import { useState, useEffect } from 'react';
import { Scale, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { handleError } from '@/lib/error-handler';
import { toast } from 'sonner';

interface WeightageSettingsProps {
    subjectId: string | null;
    onSave?: () => void;
}

interface Weightage {
    tugas: number;
    keaktifan: number;
    ujian: number;
}

export function WeightageSettings({ subjectId, onSave }: WeightageSettingsProps) {
    const [weightage, setWeightage] = useState<Weightage>({
        tugas: 40,
        keaktifan: 30,
        ujian: 30
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (subjectId) fetchWeightage();
    }, [subjectId]);

    const fetchWeightage = async () => {
        if (!subjectId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('subjects')
                .select('weightage')
                .eq('id', subjectId)
                .single();

            if (error) throw error;
            if (data?.weightage) {
                setWeightage(data.weightage as Weightage);
            }
        } catch (error) {
            handleError(error, 'Gagal memuat bobot nilai');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key: keyof Weightage, value: number) => {
        setWeightage(prev => ({ ...prev, [key]: value }));
    };

    const total = weightage.tugas + weightage.keaktifan + weightage.ujian;
    const isValid = total === 100;

    const handleSave = async () => {
        if (!subjectId) {
            toast.error('Subject tidak ditemukan');
            return;
        }
        if (!isValid) {
            toast.error('Total bobot harus 100%');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('subjects')
                .update({ weightage })
                .eq('id', subjectId);

            if (error) throw error;
            toast.success('Bobot nilai berhasil disimpan!');
            onSave?.();
        } catch (error) {
            handleError(error, 'Gagal menyimpan bobot nilai');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-8 border border-white/10 animate-pulse">
                <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
                <div className="h-20 bg-white/10 rounded"></div>
            </div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
                    <Scale className="text-indigo-400" size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-white">Bobot Nilai</h3>
                    <p className="text-xs text-slate-400">Atur persentase untuk setiap komponen</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Tugas */}
                <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                        Tugas
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={weightage.tugas}
                            onChange={(e) => handleChange('tugas', parseInt(e.target.value) || 0)}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-2xl font-black text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="text-2xl font-black text-slate-400">%</span>
                    </div>
                </div>

                {/* Keaktifan */}
                <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                        Keaktifan
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={weightage.keaktifan}
                            onChange={(e) => handleChange('keaktifan', parseInt(e.target.value) || 0)}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-2xl font-black text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="text-2xl font-black text-slate-400">%</span>
                    </div>
                </div>

                {/* Ujian */}
                <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                        Ujian
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={weightage.ujian}
                            onChange={(e) => handleChange('ujian', parseInt(e.target.value) || 0)}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-2xl font-black text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="text-2xl font-black text-slate-400">%</span>
                    </div>
                </div>
            </div>

            {/* Total & Validation */}
            <div className={`flex items-center justify-between p-4 rounded-xl mb-6 ${isValid ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
                <div className="flex items-center gap-2">
                    {isValid ? (
                        <CheckCircle className="text-emerald-400" size={20} />
                    ) : (
                        <AlertCircle className="text-rose-400" size={20} />
                    )}
                    <span className={`font-bold ${isValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                        Total: {total}%
                    </span>
                </div>
                <span className={`text-sm ${isValid ? 'text-emerald-400/70' : 'text-rose-400/70'}`}>
                    {isValid ? 'Valid ✓' : 'Harus = 100%'}
                </span>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={!isValid || saving || !subjectId}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
            >
                <Save size={20} />
                {saving ? 'Menyimpan...' : 'Simpan Bobot Nilai'}
            </button>
        </div>
    );
}
