import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export type TrashType = 'class' | 'assignment' | 'material';

export interface TrashItem {
    id: string;
    title: string;
    type: TrashType;
    deleted_at: string;
    description?: string;
}

export function useTrash(userId?: string) {
    const queryClient = useQueryClient();

    const { data: trashItems = [], isLoading } = useQuery({
        queryKey: ['trash', userId],
        queryFn: async () => {
            if (!userId) return [];

            // Fetch deleted Classes
            const { data: classes, error: classError } = await supabase
                .from('classes')
                .select('id, name, description, deleted_at')
                .eq('teacher_id', userId)
                .not('deleted_at', 'is', null);

            if (classError) throw classError;

            // Fetch deleted Assignments (via Subjects -> Classes -> Teacher)
            // Note: RLS 'Teachers view trash assignments' handles the join check
            const { data: assignments, error: assignError } = await supabase
                .from('assignments')
                .select('id, title, description, deleted_at')
                .not('deleted_at', 'is', null);

            if (assignError) throw assignError;

            // Fetch deleted Materials
            const { data: materials, error: matError } = await supabase
                .from('materials')
                .select('id, title, content, deleted_at')
                .not('deleted_at', 'is', null);

            if (matError) throw matError;

            // Combine and format
            const combined: TrashItem[] = [
                ...(classes || []).map(c => ({
                    id: c.id,
                    title: c.name,
                    description: c.description,
                    type: 'class' as const,
                    deleted_at: c.deleted_at
                })),
                ...(assignments || []).map(a => ({
                    id: a.id,
                    title: a.title,
                    description: a.description,
                    type: 'assignment' as const,
                    deleted_at: a.deleted_at
                })),
                ...(materials || []).map(m => ({
                    id: m.id,
                    title: m.title,
                    description: m.content ? m.content.substring(0, 50) + '...' : '',
                    type: 'material' as const,
                    deleted_at: m.deleted_at
                }))
            ];

            // Sort by deleted_at desc
            return combined.sort((a, b) => 
                new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime()
            );
        },
        enabled: !!userId
    });

    // Restore Mutation
    const restoreMutation = useMutation({
        mutationFn: async ({ id, type }: { id: string; type: TrashType }) => {
            const table = type === 'class' ? 'classes' : type === 'assignment' ? 'assignments' : 'materials';
            
            const { error } = await supabase
                .from(table)
                .update({ deleted_at: null })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('Data berhasil dipulihkan!');
            queryClient.invalidateQueries({ queryKey: ['trash'] });
            queryClient.invalidateQueries({ queryKey: ['classes'] }); // Refresh main lists
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
            queryClient.invalidateQueries({ queryKey: ['materials'] });
        },
        onError: (error: Error) => {
            console.error('Restore error:', error);
            toast.error('Gagal memulihkan data.');
        }
    });

    // Permanent Delete Mutation
    const deletePermanentMutation = useMutation({
        mutationFn: async ({ id, type }: { id: string; type: TrashType }) => {
            const table = type === 'class' ? 'classes' : type === 'assignment' ? 'assignments' : 'materials';
            
            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('Data dihapus permanen.');
            queryClient.invalidateQueries({ queryKey: ['trash'] });
        },
        onError: (error: Error) => {
            toast.error('Gagal menghapus permanen.');
        }
    });

    return {
        trashItems,
        isLoading,
        restoreItem: restoreMutation.mutate,
        deletePermanent: deletePermanentMutation.mutate
    };
}
