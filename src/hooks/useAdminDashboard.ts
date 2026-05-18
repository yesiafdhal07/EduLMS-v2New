'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { School, SchoolCode } from '@/types';
import type { SchoolHealth } from '@/components/admin/SchoolHealthRadar';
import { toast } from 'sonner';

interface AdminStats {
    totalSchools: number;
    totalGuru: number;
    totalSiswa: number;
    totalKepsek: number;
    totalClasses: number;
}

interface SchoolWithCodes extends School {
    codes: SchoolCode[];
    guru_count: number;
    siswa_count: number;
    class_count: number;
}

interface AdminUser {
    id: string;
    email: string;
    full_name: string;
    role: string;
    school_id: string | null;
    created_at: string;
    school_name?: string;
}

function computeHealthScore(row: any): { score: number; status: 'healthy' | 'watch' | 'critical' } {
    const loginW = Math.min(row.login_rate_30d || 0, 100) * 0.25;
    const attendW = Math.min(row.avg_attendance_rate || 0, 100) * 0.25;
    const subW = Math.min(row.submission_rate || 0, 100) * 0.25;
    const gradeSpeedW = row.avg_grading_days <= 3 ? 25 : row.avg_grading_days <= 7 ? 15 : row.avg_grading_days <= 14 ? 5 : 0;
    const score = Math.round(loginW + attendW + subW + gradeSpeedW);
    const status = score >= 80 ? 'healthy' : score >= 50 ? 'watch' : 'critical';
    return { score, status };
}

export function useAdminDashboard() {
    const { user, loading: authLoading } = useAuth('admin');
    const [stats, setStats] = useState<AdminStats>({
        totalSchools: 0, totalGuru: 0, totalSiswa: 0, totalKepsek: 0, totalClasses: 0,
    });
    const [schools, setSchools] = useState<SchoolWithCodes[]>([]);
    const [schoolHealth, setSchoolHealth] = useState<SchoolHealth[]>([]);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHealthView = useCallback(async () => {
        const { data, error } = await supabase
            .from('admin_school_health')
            .select('*')
            .limit(200);

        if (!error && data) {
            const health: SchoolHealth[] = data.map((row: any) => {
                const { score, status } = computeHealthScore(row);
                return {
                    school_id: row.school_id,
                    school_name: row.school_name,
                    is_active: row.is_active,
                    guru_count: row.guru_count || 0,
                    siswa_count: row.siswa_count || 0,
                    class_count: row.class_count || 0,
                    assignment_count: row.assignment_count || 0,
                    submission_rate: row.submission_rate || 0,
                    avg_grade: row.avg_grade || 0,
                    avg_attendance_rate: row.avg_attendance_rate || 0,
                    avg_grading_days: row.avg_grading_days || 0,
                    login_rate_30d: row.login_rate_30d || 0,
                    health_score: score,
                    health_status: status,
                };
            });
            setSchoolHealth(health);

            setStats({
                totalSchools: health.length,
                totalGuru: health.reduce((acc, s) => acc + s.guru_count, 0),
                totalSiswa: health.reduce((acc, s) => acc + s.siswa_count, 0),
                totalKepsek: 0,
                totalClasses: health.reduce((acc, s) => acc + s.class_count, 0),
            });

            const { count: kepsekCount } = await supabase
                .from('users')
                .select('id', { count: 'exact', head: true })
                .eq('role', 'kepala_sekolah');

            setStats(prev => ({ ...prev, totalKepsek: kepsekCount || 0 }));
            return health; // Return data for sequential fetching
        }
        return [];
    }, []);

    const fetchSchools = useCallback(async (healthData: SchoolHealth[] = schoolHealth) => {
        const { data: schoolsData, error: schoolsErr } = await supabase
            .from('schools')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(200);

        if (schoolsErr || !schoolsData) return;

        const { data: codesData } = await supabase.from('school_codes').select('*');
        const codesBySchool = new Map<string, SchoolCode[]>();
        (codesData || []).forEach((code: any) => {
            const list = codesBySchool.get(code.school_id) || [];
            list.push(code);
            codesBySchool.set(code.school_id, list);
        });

        const healthMap = new Map(healthData.map(h => [h.school_id, h]));

        const result: SchoolWithCodes[] = schoolsData.map((school: School) => {
            const h = healthMap.get(school.id);
            return {
                ...school,
                codes: codesBySchool.get(school.id) || [],
                guru_count: h?.guru_count || 0,
                siswa_count: h?.siswa_count || 0,
                class_count: h?.class_count || 0,
            };
        });
        setSchools(result);
    }, [schoolHealth]);

    const fetchUsers = useCallback(async () => {
        const { data, error } = await supabase
            .from('users')
            .select('id, email, full_name, role, school_id, created_at')
            .order('created_at', { ascending: false })
            .limit(200);

        if (!error && data) {
            const schoolIds = [...new Set(data.filter(u => u.school_id).map(u => u.school_id))];
            const schoolMap = new Map<string, string>();

            if (schoolIds.length > 0) {
                const { data: schoolsData } = await supabase
                    .from('schools')
                    .select('id, name')
                    .in('id', schoolIds as string[]);
                schoolsData?.forEach((s: any) => schoolMap.set(s.id, s.name));
            }

            setUsers(data.map((u: any) => ({
                ...u,
                school_name: u.school_id ? schoolMap.get(u.school_id) || null : null,
            })));
        }
    }, []);

    const createSchool = useCallback(async (name: string, address?: string, phone?: string, schoolEmail?: string) => {
        const { data: school, error } = await supabase
            .from('schools')
            .insert({ name, address, phone, email: schoolEmail })
            .select()
            .single();

        if (error) {
            toast.error(`Gagal membuat sekolah: ${error.message}`);
            return null;
        }

        const prefix = name.substring(0, 4).toUpperCase().replace(/\s/g, '');
        const guruCode = prefix + '-G-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        const siswaCode = prefix + '-S-' + Math.random().toString(36).substring(2, 6).toUpperCase();

        await supabase.from('school_codes').insert([
            { school_id: school.id, code: guruCode, role: 'guru' },
            { school_id: school.id, code: siswaCode, role: 'siswa' },
        ]);

        await supabase.from('audit_logs').insert({
            actor_id: user?.id,
            actor_role: 'admin',
            action: 'create_school',
            entity_type: 'schools',
            entity_id: school.id,
            new_data: { name, address, phone, email: schoolEmail },
        });

        toast.success(`Sekolah "${name}" berhasil dibuat!`);
        await refreshData();
        return school;
    }, [user]);

    const toggleSchoolActive = useCallback(async (schoolId: string, isActive: boolean) => {
        await supabase.from('schools').update({ is_active: !isActive }).eq('id', schoolId);

        await supabase.from('audit_logs').insert({
            actor_id: user?.id,
            actor_role: 'admin',
            action: isActive ? 'deactivate_school' : 'activate_school',
            entity_type: 'schools',
            entity_id: schoolId,
            old_data: { is_active: isActive },
            new_data: { is_active: !isActive },
        });

        toast.success(isActive ? 'Sekolah dinonaktifkan' : 'Sekolah diaktifkan');
        refreshData();
    }, [user]);

    const regenerateCode = useCallback(async (codeId: string, schoolName: string, role: 'guru' | 'siswa') => {
        const prefix = schoolName.substring(0, 4).toUpperCase().replace(/\s/g, '');
        const suffix = role === 'guru' ? 'G' : 'S';
        const newCode = prefix + '-' + suffix + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

        await supabase.from('school_codes').update({ code: newCode }).eq('id', codeId);

        await supabase.from('audit_logs').insert({
            actor_id: user?.id,
            actor_role: 'admin',
            action: 'regenerate_code',
            entity_type: 'school_codes',
            entity_id: codeId,
            new_data: { code: newCode, role },
        });

        toast.success('Kode berhasil diperbarui');
        refreshData();
    }, [user]);

    const updateUserRole = useCallback(async (userId: string, newRole: string) => {
        const targetUser = users.find(u => u.id === userId);
        const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);
        if (error) {
            toast.error(`Gagal update role: ${error.message}`);
        } else {
            await supabase.from('audit_logs').insert({
                actor_id: user?.id,
                actor_role: 'admin',
                action: 'change_role',
                entity_type: 'users',
                entity_id: userId,
                old_data: { role: targetUser?.role },
                new_data: { role: newRole },
            });
            toast.success('Role berhasil diubah');
            fetchUsers();
        }
    }, [user, users, fetchUsers]);

    const updateUserSchool = useCallback(async (userId: string, schoolId: string | null) => {
        const targetUser = users.find(u => u.id === userId);
        const { error } = await supabase.from('users').update({ school_id: schoolId }).eq('id', userId);
        
        if (error) {
            toast.error(`Gagal update sekolah: ${error.message}`);
        } else {
            await supabase.from('audit_logs').insert({
                actor_id: user?.id,
                actor_role: 'admin',
                action: 'change_school',
                entity_type: 'users',
                entity_id: userId,
                old_data: { school_id: targetUser?.school_id },
                new_data: { school_id: schoolId },
            });
            toast.success('Sekolah berhasil diperbarui');
            fetchUsers();
        }
    }, [user, users, fetchUsers]);

    const refreshData = useCallback(async () => {
        await fetchHealthView();
        await fetchSchools();
        await fetchUsers();
    }, [fetchHealthView, fetchSchools, fetchUsers]);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        fetchHealthView()
            .then((health) => Promise.all([fetchSchools(health), fetchUsers()]))
            .finally(() => setLoading(false));
        // We only want this to run on mount or user change to avoid loops
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    return {
        user,
        authLoading,
        loading,
        stats,
        schools,
        schoolHealth,
        users,
        createSchool,
        toggleSchoolActive,
        regenerateCode,
        updateUserRole,
        updateUserSchool,
        refreshData,
    };
}
