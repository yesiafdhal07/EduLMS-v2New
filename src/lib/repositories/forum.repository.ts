import { supabase } from '@/lib/supabase';

export const forumRepository = {
    async getPosts(schoolId: string, classId?: string) {
        let query = supabase
            .from('forum_posts')
            .select(`
                *,
                author:users (id, full_name, role)
            `)
            .eq('school_id', schoolId)
            .eq('is_hidden', false)
            .order('created_at', { ascending: false });
        
        if (classId) {
            query = query.or(`class_id.eq.${classId},class_id.is.null`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    async createPost(post: { author_id: string, school_id: string, class_id?: string, title: string, content: string, is_announcement?: boolean }) {
        const { data, error } = await supabase
            .from('forum_posts')
            .insert(post)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    async getComments(postId: string) {
        const { data, error } = await supabase
            .from('forum_comments')
            .select(`
                *,
                author:users (id, full_name, role)
            `)
            .eq('post_id', postId)
            .eq('is_hidden', false)
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        return data;
    },

    async addComment(postId: string, authorId: string, content: string) {
        const { data, error } = await supabase
            .from('forum_comments')
            .insert({ post_id: postId, author_id: authorId, content })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    async flagPost(postId: string) {
        // Increment flag count
        const { data, error } = await supabase.rpc('increment_forum_flag', { target_id: postId, target_type: 'post' });
        if (error) throw error;
        return data;
    }
};
