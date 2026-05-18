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

            // 1. Get Class Members if classId is provided
            let studentIds: string[] = [];
            if (classId) {
                const { data: members } = await supabase
                    .from('class_members')
                    .select('user_id')
                    .eq('class_id', classId);
                studentIds = members?.map(m => m.user_id) || [];
                
                if (studentIds.length === 0) {
                    setStats({ averageScore: 0, passRate: 0, attendanceRate: 0, completedAssignments: 0 });
                    setLoading(false);
                    return;
                }
            }

            // 2. Fetch Assignments for this class
            const { data: assignments } = await supabase
                .from('assignments')
                .select('id')
                .eq('class_id', classId);
            const assignmentIds = (assignments || []).map(a => a.id);

            // 3. Parallel Queries for Data
            const [assignmentGradesResult, keaktifanGradesResult, submissionsResult] = await Promise.all([
                assignmentIds.length > 0 ? supabase.from('grades').select('score, type, created_at, student_id').in('assignment_id', assignmentIds) : Promise.resolve({ data: [] }),
                supabase.from('grades').select('score, type, created_at, student_id').eq('class_id', classId),
                assignmentIds.length > 0 ? supabase.from('submissions').select('id, student_id').in('assignment_id', assignmentIds) : Promise.resolve({ data: [] })
            ]);

            const allGrades = [...(assignmentGradesResult.data || []), ...(keaktifanGradesResult.data || [])];
            const allSubmissions = submissionsResult.data || [];

            // Filter grades and submissions strictly to enrolled students
            const validGrades = allGrades.filter(g => studentIds.includes(g.student_id)).filter(g => g.score !== null);
            const validSubmissions = allSubmissions.filter(s => studentIds.includes(s.student_id));
            
            processGrades(validGrades);

            // 4. Attendance Stats 
            const attendanceQuery = supabase.from('attendance_records').select(`
                status, 
                attendance!inner(id)
            `).eq('attendance.class_id', classId);
            
            const { data: recs } = await attendanceQuery;
            processAttendance(recs || []);

            // 5. Submissions Count
            setStats(prev => ({ ...prev, completedAssignments: validSubmissions.length }));

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
