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

            // Parallel queries for members and attendance count
            const [membersResult, attendanceResult] = await Promise.all([
                supabase
                    .from('class_members')
                    .select(`user_id, users!inner (id, full_name, submissions(id, grades(score)))`, { count: 'exact' })
                    .eq('class_id', classId)
                    .range(start, end),
                
                supabase
                    .from('attendance')
                    .select('*', { count: 'exact', head: true })
                    .eq('class_id', classId)
            ]);

            if (membersResult.error) throw membersResult.error;
            
            // Process Students
            const students: DashboardStudent[] = (membersResult.data || [])
                .map((m: any) => {
                    // Handle both array and object cases from Supabase join
                    const s = Array.isArray(m.users) ? m.users[0] : m.users;
                    if (!s) return null;

                    const submissions = s.submissions || [];
                    const totalScore = submissions.reduce((acc: number, sub: any) => acc + (sub.grades?.[0]?.score || 0), 0);
                    const avg = submissions.length > 0 ? totalScore / submissions.length : 0;
                    
                    return {
                        id: s.id,
                        name: s.full_name,
                        avg: avg.toFixed(1),
                        status: avg >= 75 ? 'TUNTAS' : 'REMEDIAL',
                        submissions
                    };
                })
                .filter(Boolean) as DashboardStudent[];

            // Calculate derived stats
            const totalAvg = students.length > 0
                ? students.reduce((acc, s) => acc + parseFloat(s.avg), 0) / students.length
                : 0;

            const stats: DashboardStats = {
                avg: parseFloat(totalAvg.toFixed(1)),
                attendance: Math.min(100, Math.round((attendanceResult.count || 0) / (students.length || 1) * 100)),
                submissions: students.reduce((acc, s) => acc + (s.submissions?.length || 0), 0)
            };

            return { 
                students, 
                stats,
                pagination: {
                    total: membersResult.count || 0,
                    page,
                    pageSize,
                    totalPages: Math.ceil((membersResult.count || 0) / pageSize)
                }
            };
        },
        enabled: !!classId && enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
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
