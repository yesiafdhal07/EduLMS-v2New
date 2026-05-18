import { supabase } from '@/lib/supabase';
import type { User, AppRole } from '@/types';

export const userRepository = {
    async getProfile(userId: string) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        return data as User;
    },

    async updateProfile(userId: string, updates: Partial<User>) {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();
        
        if (error) throw error;
        return data as User;
    },

    async getByRole(role: AppRole, schoolId?: string) {
        let query = supabase.from('users').select('*').eq('role', role);
        if (schoolId) {
            query = query.eq('school_id', schoolId);
        }
        const { data, error } = await query;
        if (error) throw error;
        return data as User[];
    }
};
