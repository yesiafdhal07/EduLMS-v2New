import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { logError } from '@/lib/error-handler';

export interface AnalyticsStats {
    averageScore: number;
    passRate: number;
    attendanceRate: number;
    completedAssignments: number;
}

export function useAnalytics(classId?: string) {
    const [stats, setStats] = useState<AnalyticsStats>({
        averageScore: 0,
        passRate: 0,
        attendanceRate: 0,
        completedAssignments: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Grades Stats (Average & Pass Rate)
            let gradesQuery = supabase.from('grades').select('score');
            // Note: filtering by classId for grades requires joining submissions -> assignments -> subjects
            // For simplicity/performance in this summary, we might fetch all teacher's grades if classId is missing,
            // or filtering client-side if dataset is small. 
            // But to be proper, let's assume if classId is provided we want specific class.
            
            // However, RLS usually filters to "Teacher's Own Data". 
            // If classId is present, we should filter.
            if (classId) {
                // Complex filter not easily done in one simple query without join. 
                // We'll fetch all grades for simplicity as optimization later, OR specific query with RPC if needed.
                // For now, let's try to fetch all and filter in memory if volume isn't huge, 
                // OR better: use separate queries if we can't join easily.
                
                // Actually, let's use the same query pattern as charts:
                 const { data: grades } = await supabase
                    .from('grades')
                    .select(`
                        score,
                        submissions!inner(
                            assignments!inner(
                                subjects!inner(class_id)
                            )
                        )
                    `)
                    .eq('submissions.assignments.subjects.class_id', classId);
                 
                 processGrades(grades?.map(g => ({ score: g.score })) || []);
            } else {
                 const { data: grades } = await supabase.from('grades').select('score');
                 processGrades(grades || []);
            }

            // 2. Attendance Stats
            if (classId) {
                const { count: total, error: tErr } = await supabase
                    .from('attendance_records')
                    .select('*', { count: 'exact', head: true })
                    .eq('attendance.class_id', classId); // Joining implicitly via RLS? No, need explicit join or filter
                
                // Actually attendance_records -> attendance(class_id)
                const { data: recs } = await supabase
                    .from('attendance_records')
                    .select(`status, attendance!inner(class_id)`)
                    .eq('attendance.class_id', classId);
                
                processAttendance(recs || []);
            } else {
                const { data: recs } = await supabase.from('attendance_records').select('status');
                processAttendance(recs || []);
            }

            // 3. Completed Assignments (Submissions)
             if (classId) {
                 const { count } = await supabase
                    .from('submissions')
                    .select(`
                        id,
                        assignments!inner(
                            subjects!inner(class_id)
                        )
                    `, { count: 'exact', head: true })
                    .eq('assignments.subjects.class_id', classId);
                 
                 setStats(prev => ({ ...prev, completedAssignments: count || 0 }));
             } else {
                 const { count } = await supabase
                    .from('submissions')
                    .select('id', { count: 'exact', head: true });
                 
                 setStats(prev => ({ ...prev, completedAssignments: count || 0 }));
            }

        } catch (error) {
            logError(error, 'useAnalytics.fetchStats');
        } finally {
            setLoading(false);
        }
    }, [classId]);

    const processGrades = (grades: { score: number }[]) => {
        if (grades.length === 0) {
            setStats(prev => ({ ...prev, averageScore: 0, passRate: 0 }));
            return;
        }
        
        const totalScore = grades.reduce((acc, curr) => acc + curr.score, 0);
        const avg = totalScore / grades.length;
        
        const passedCount = grades.filter(g => g.score >= 70).length; // KKM assumption 70
        const passRate = (passedCount / grades.length) * 100;

        setStats(prev => ({ ...prev, averageScore: Math.round(avg * 10) / 10, passRate: Math.round(passRate) }));
    };

    const processAttendance = (records: { status: string }[]) => {
        if (records.length === 0) {
            setStats(prev => ({ ...prev, attendanceRate: 0 }));
            return;
        }

        const presentCount = records.filter(r => r.status === 'hadir').length;
        const rate = (presentCount / records.length) * 100;
        
        setStats(prev => ({ ...prev, attendanceRate: Math.round(rate) }));
    };

    useEffect(() => {
        fetchStats();

        // Subscribe to changes
        const channels = [
            supabase.channel('analytics_grades').on('postgres_changes', { event: '*', schema: 'public', table: 'grades' }, fetchStats),
            supabase.channel('analytics_attendance').on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_records' }, fetchStats),
            supabase.channel('analytics_submissions').on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, fetchStats)
        ];

        channels.forEach(c => c.subscribe());

        return () => {
            channels.forEach(c => supabase.removeChannel(c));
        };
    }, [fetchStats]);

    return { stats, loading, refresh: fetchStats };
}
