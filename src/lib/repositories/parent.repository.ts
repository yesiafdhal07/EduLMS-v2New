import { supabase } from '@/lib/supabase';

export const parentRepository = {
    async getLinkedStudents(parentId: string) {
        const { data, error } = await supabase
            .from('parent_student_links')
            .select(`
                id,
                relationship,
                is_verified,
                student:users!student_id (
                    id,
                    full_name,
                    email,
                    school_id
                )
            `)
            .eq('parent_id', parentId);
        
        if (error) throw error;
        return data;
    },

    async getStudentDashboard(studentId: string) {
        const { data, error } = await supabase
            .from('student_dashboard_summary')
            .select('*')
            .eq('student_id', studentId)
            .single();
        
        if (error) throw error;
        return data;
    },

    async linkStudent(parentId: string, studentId: string, relationship: string) {
        const { data, error } = await supabase
            .from('parent_student_links')
            .insert({ parent_id: parentId, student_id: studentId, relationship })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
};
