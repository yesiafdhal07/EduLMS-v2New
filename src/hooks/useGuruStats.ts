import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Types specialized for this hook
export interface DashboardStudent {
    id: string;
    name: string;
    avg: string;
    status: 'TUNTAS' | 'REMEDIAL';
    submissions: { id: string; grades: { score: number }[] }[];
}

export interface DashboardStats {
    avg: number;
    attendance: number;
    submissions: number;
}

interface UseGuruStatsProps {
    classId: string | null;
    page?: number;
    pageSize?: number;
    enabled?: boolean;
}

export function useGuruStats({ classId, page = 1, pageSize = 50, enabled = true }: UseGuruStatsProps) {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['guru-stats', classId, page, pageSize],
        queryFn: async () => {
            if (!classId) throw new Error('Class ID required');

            const start = (page - 1) * pageSize;
            const end = start + pageSize - 1;

            // 1. Fetch Class Members
            const { data: membersResult, count, error: membersError } = await supabase
                .from('class_members')
                .select(`user_id, users!inner (id, full_name)`, { count: 'exact' })
                .eq('class_id', classId)
                .range(start, end);

            if (membersError) throw membersError;

            // 2. Fetch Assignments for this class
            const { data: assignments } = await supabase
                .from('assignments')
                .select('id')
                .eq('class_id', classId);
            const assignmentIds = (assignments || []).map(a => a.id);

            // 3. Parallel Queries for Stats
            const [attendanceResult, assignmentGradesResult, keaktifanGradesResult, submissionsResult] = await Promise.all([
                supabase.from('attendance').select('id').eq('class_id', classId),
                assignmentIds.length > 0 ? supabase.from('grades').select('student_id, score').in('assignment_id', assignmentIds) : Promise.resolve({ data: [] }),
                supabase.from('grades').select('student_id, score').eq('class_id', classId),
                assignmentIds.length > 0 ? supabase.from('submissions').select('student_id').in('assignment_id', assignmentIds) : Promise.resolve({ data: [] })
            ]);

            const allGrades = [...(assignmentGradesResult.data || []), ...(keaktifanGradesResult.data || [])];
            const allSubmissions = submissionsResult.data || [];

            // Handle Attendance
            const sessionIds = (attendanceResult.data || []).map(a => a.id);
            let attendancePercent = 0;
            if (sessionIds.length > 0) {
                const { count: presentCount } = await supabase
                    .from('attendance_records')
                    .select('*', { count: 'exact', head: true })
                    .in('attendance_id', sessionIds)
                    .eq('status', 'hadir');
                
                const totalPossible = (count || 1) * sessionIds.length;
                attendancePercent = Math.min(100, Math.round(((presentCount || 0) / (totalPossible || 1)) * 100));
            }

            // Process Students
            const students: DashboardStudent[] = (membersResult || [])
                .map((m: any) => {
                    const s = Array.isArray(m.users) ? m.users[0] : m.users;
                    if (!s) return null;

                    // Filter grades just for this student
                    const studentGrades = allGrades.filter(g => g.student_id === s.id);
                    const totalScore = studentGrades.reduce((acc: number, g: any) => acc + (g.score || 0), 0);
                    const avg = studentGrades.length > 0 ? totalScore / studentGrades.length : 0;
                    
                    return {
                        id: s.id,
                        name: s.full_name,
                        avg: avg.toFixed(1),
                        status: avg >= 75 ? 'TUNTAS' : 'REMEDIAL',
                        submissions: [] 
                    };
                })
                .filter(Boolean) as DashboardStudent[];

            // Calculate derived stats
            const totalAvg = students.length > 0
                ? students.reduce((acc, s) => acc + parseFloat(s.avg), 0) / students.length
                : 0;

            const stats: DashboardStats = {
                avg: parseFloat(totalAvg.toFixed(1)),
                attendance: attendancePercent,
                submissions: allSubmissions.length
            };

            return { 
                students, 
                stats,
                pagination: {
                    total: count || 0,
                    page,
                    pageSize,
                    totalPages: Math.ceil((count || 0) / pageSize)
                }
            };
        },
        enabled: !!classId && enabled,
        staleTime: 1000 * 10, // 10 seconds for more "real-time" feel without over-querying
    });

    return {
        students: data?.students || [],
        stats: data?.stats || { avg: 0, attendance: 0, submissions: 0 },
        pagination: data?.pagination || { total: 0, page: 1, pageSize: 50, totalPages: 0 },
        loading: isLoading,
        error,
        refetch
    };
}
