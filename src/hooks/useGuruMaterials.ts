import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Material } from '@/types';

interface UseGuruMaterialsProps {
    classId: string | null;
    page?: number;
    pageSize?: number;
    enabled?: boolean;
}

export function useGuruMaterials({ classId, page = 1, pageSize = 50, enabled = true }: UseGuruMaterialsProps) {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['materials', classId, page, pageSize],
        queryFn: async () => {
            if (!classId) throw new Error('Class ID required');

            const start = (page - 1) * pageSize;
            const end = start + pageSize - 1;

            const { data, error, count } = await supabase
                .from('materials')
                .select(`*, subjects!inner(class_id)`, { count: 'exact' })
                .eq('subjects.class_id', classId)
                .is('deleted_at', null)
                .order('created_at', { ascending: false })
                .range(start, end);

            if (error) throw error;
            
            return {
                materials: data as Material[],
                pagination: {
                    total: count || 0,
                    page,
                    pageSize,
                    totalPages: Math.ceil((count || 0) / pageSize)
                }
            };
        },
        enabled: !!classId && enabled,
    });

    return {
        materials: data?.materials || [],
        pagination: data?.pagination || { total: 0, page: 1, pageSize: 50, totalPages: 0 },
        loading: isLoading,
        error,
        refetch
    };
}
