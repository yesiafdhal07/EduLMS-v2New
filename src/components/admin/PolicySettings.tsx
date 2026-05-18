'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Settings, Save, Shield, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

type PolicyValue = boolean | number;

interface PolicyConfig {
    key: string;
    label: string;
    description: string;
    type: 'toggle' | 'number';
    defaultValue: PolicyValue;
}

const POLICIES: PolicyConfig[] = [
    { key: 'require_email_confirmation', label: 'Wajib Konfirmasi Email', description: 'User harus verifikasi email sebelum bisa login.', type: 'toggle', defaultValue: false },
    { key: 'max_classes_per_school', label: 'Maks Kelas per Sekolah', description: 'Batas jumlah kelas yang bisa dibuat per sekolah.', type: 'number', defaultValue: 50 },
    { key: 'max_quiz_attempts', label: 'Maks Percobaan Kuis', description: 'Berapa kali siswa bisa mengerjakan kuis yang sama.', type: 'number', defaultValue: 3 },
    { key: 'password_min_length', label: 'Panjang Min. Password', description: 'Panjang minimum password saat registrasi.', type: 'number', defaultValue: 8 },
    { key: 'allow_peer_review', label: 'Aktifkan Peer Review', description: 'Izinkan fitur peer review antar siswa.', type: 'toggle', defaultValue: true },
    { key: 'data_retention_days', label: 'Retensi Data (Hari)', description: 'Berapa lama data yang dihapus disimpan sebelum dihapus permanen.', type: 'number', defaultValue: 90 },
];

export function PolicySettings() {
    const [values, setValues] = useState<Record<string, PolicyValue>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const initialValuesRef = useRef<Record<string, PolicyValue>>({});

    const fetchPolicies = useCallback(async () => {
        const { data } = await supabase
            .from('school_policies')
            .select('policy_key, policy_value')
            .is('school_id', null);

        const mapped: Record<string, PolicyValue> = {};
        POLICIES.forEach(p => { mapped[p.key] = p.defaultValue; });
        (data || []).forEach((row: { policy_key: string; policy_value: PolicyValue }) => {
            mapped[row.policy_key] = row.policy_value;
        });
        setValues(mapped);
        initialValuesRef.current = { ...mapped };
        setIsDirty(false);
        setLoading(false);
    }, []);

    useEffect(() => {
        const t = setTimeout(() => { void fetchPolicies(); }, 0);
        return () => clearTimeout(t);
    }, [fetchPolicies]);

    const handleSave = async () => {
        setSaving(true);
        try {
            for (const policy of POLICIES) {
                await supabase.from('school_policies').upsert({
                    school_id: null,
                    policy_key: policy.key,
                    policy_value: values[policy.key],
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'school_id,policy_key' });
            }
            toast.success('Kebijakan berhasil disimpan');
            initialValuesRef.current = { ...values };
            setIsDirty(false);
        } catch {
            toast.error('Gagal menyimpan kebijakan');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="animate-pulse space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl" />)}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Shield size={20} className="text-rose-400" />
                    <h3 className="text-lg font-black text-white">Kebijakan Global</h3>
                </div>
                <button onClick={handleSave} disabled={saving || !isDirty}
                    className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-400 transition-colors disabled:opacity-50">
                    <Save size={14} />
                    {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
            </div>

            {/* BUG-14 FIX: Unsaved changes indicator */}
            {isDirty && (
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle size={14} className="text-amber-400 shrink-0" />
                    <p className="text-xs text-amber-300 font-medium">Ada perubahan yang belum disimpan.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {POLICIES.map(policy => (
                    <div key={policy.key} className="bg-[#181A20] border border-white/5 rounded-2xl p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <p className="text-sm font-bold text-white">{policy.label}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{policy.description}</p>
                            </div>
                            {policy.type === 'toggle' ? (
                                <button
                                    onClick={() => {
                                        setValues(v => {
                                            const newV = { ...v, [policy.key]: !v[policy.key] };
                                            setIsDirty(JSON.stringify(newV) !== JSON.stringify(initialValuesRef.current));
                                            return newV;
                                        });
                                    }}
                                    className={`w-12 h-6 rounded-full transition-colors shrink-0 ${values[policy.key] ? 'bg-rose-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${values[policy.key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            ) : (
                                <input
                                    type="number"
                                    min={0}
                                    value={(() => {
                                        const v = values[policy.key];
                                        return typeof v === 'number' ? v : '';
                                    })()}
                                    onChange={e => {
                                        const num = Math.max(0, parseInt(e.target.value, 10) || 0);
                                        setValues(v => {
                                            const newV = { ...v, [policy.key]: num };
                                            setIsDirty(JSON.stringify(newV) !== JSON.stringify(initialValuesRef.current));
                                            return newV;
                                        });
                                    }}
                                    className="w-20 bg-[#0F1014] border border-white/5 rounded-xl px-3 py-2 text-white text-sm font-bold text-center focus:outline-none focus:border-rose-500/50"
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
