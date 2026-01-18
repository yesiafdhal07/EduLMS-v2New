'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Submission } from '@/types';

interface DashboardStudent {
    id: string;
    name: string;
    avg: string;
    status: 'TUNTAS' | 'REMEDIAL';
    submissions: Submission[];
}

interface DashboardStats {
    avg: number;
    attendance: number;
    submissions: number;
}

// Type for Supabase nested query result
interface ClassMemberWithSubmissions {
    user_id: string;
    users: {
        id: string;
        full_name: string;
        submissions: Array<{
            id: string;
            grades: { score: number | null } | null;
        }>;
    };
}

interface UseDashboardDataReturn {
    teacherName: string;
    students: DashboardStudent[];
    stats: DashboardStats;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useDashboardData(
    classes: { id: string }[],
    selectedClassId: string | null,
    subjectId: string | null
): UseDashboardDataReturn {
    const [teacherName, setTeacherName] = useState('');
    const [students, setStudents] = useState<DashboardStudent[]>([]);
    const [stats, setStats] = useState<DashboardStats>({ avg: 0, attendance: 0, submissions: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch teacher name
            const { data: teacherProfileData } = await supabase
                .from('users')
                .select('full_name')
                .eq('id', user.id)
                .single();

            if (teacherProfileData) {
                setTeacherName(teacherProfileData.full_name);
            }

            if (!classes || classes.length === 0) {
                setLoading(false);
                return;
            }

            const targetClassId = selectedClassId || classes[0].id;

            // Fetch members with submissions and grades
            const { data: membersData, error: membersError } = await supabase
                .from('class_members')
                .select(`user_id, users!inner (id, full_name, submissions(id, grades(score)))`)
                .eq('class_id', targetClassId);

            if (membersError) throw membersError;

            // Process students with proper typing
            const processedStudents: DashboardStudent[] = (membersData as unknown as ClassMemberWithSubmissions[])?.map((m) => {
                const s = m.users;
                const submissions = (s.submissions || []) as Submission[];
                const totalScore = submissions.reduce((acc: number, sub) => {
                    const grade = sub.grades as { score: number | null } | null;
                    return acc + (grade?.score || 0);
                }, 0);
                const avg = submissions.length > 0 ? totalScore / submissions.length : 0;

                return {
                    id: s.id,
                    name: s.full_name,
                    avg: avg.toFixed(1),
                    status: avg >= 75 ? 'TUNTAS' as const : 'REMEDIAL' as const,
                    submissions: s.submissions as unknown as Submission[]
                };
            }) || [];

            setStudents(processedStudents);

            // Calculate stats
            const totalAvg = processedStudents.length > 0
                ? processedStudents.reduce((acc, s) => acc + parseFloat(s.avg), 0) / processedStudents.length
                : 0;

            const { count: attendanceCount } = await supabase
                .from('attendance')
                .select('*', { count: 'exact', head: true })
                .eq('class_id', targetClassId);

            setStats({
                avg: parseFloat(totalAvg.toFixed(1)),
                attendance: Math.min(100, Math.round(((attendanceCount || 0) / (processedStudents.length || 1)) * 100)),
                submissions: processedStudents.reduce((acc, s) => acc + (s.submissions?.length || 0), 0)
            });

        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal memuat data dashboard';
            console.error("Error fetching Dashboard Data:", message);
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [classes, selectedClassId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        teacherName,
        students,
        stats,
        loading,
        error,
        refetch: fetchData
    };
}
