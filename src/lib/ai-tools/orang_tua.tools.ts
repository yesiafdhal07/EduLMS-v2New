import type { SupabaseClient } from '@supabase/supabase-js';

export async function executeOrangTuaTool(supabase: SupabaseClient, userId: string, toolName: string, args: any) {
    try {
        switch (toolName) {
            case 'get_child_academic_overview':
                return await getChildAcademicOverview(supabase, userId);
            case 'get_child_upcoming_deadlines':
                return await getChildUpcomingDeadlines(supabase, userId, args);
            case 'get_child_attendance_summary':
                return await getChildAttendanceSummary(supabase, userId, args);
            case 'get_parenting_tips_for_weak_subject':
                return await getParentingTips(supabase, userId, args);
            default:
                throw new Error(`Orang Tua tool ${toolName} not found`);
        }
    } catch (error: any) {
        console.error(`[OrangTuaTools] Error executing ${toolName}:`, error);
        return { error: error.message || 'Tool execution failed' };
    }
}

// Verify parent has access to child
async function getVerifiedChildren(supabase: SupabaseClient, parentId: string) {
    const { data, error } = await supabase
        .from('parent_student_links')
        .select('student_id, is_verified')
        .eq('parent_id', parentId)
        .eq('is_verified', true);
    
    if (error || !data || data.length === 0) {
        throw new Error("Anda belum memiliki anak yang terhubung dan terverifikasi di akun ini.");
    }
    return data.map(d => d.student_id);
}

async function getChildAcademicOverview(supabase: SupabaseClient, parentId: string) {
    const childIds = await getVerifiedChildren(supabase, parentId);
    
    // Using the student_dashboard_summary view (from sprint 5/6)
    const { data, error } = await supabase
        .from('student_dashboard_summary')
        .select('*')
        .in('user_id', childIds);

    if (error) throw error;
    return { data };
}

async function getChildUpcomingDeadlines(supabase: SupabaseClient, parentId: string, args: { student_id?: string, days_ahead?: number }) {
    const childIds = await getVerifiedChildren(supabase, parentId);
    const targetStudentId = args.student_id && childIds.includes(args.student_id) ? args.student_id : childIds[0];

    // Simplification: We need to get the class first
    const { data: classData } = await supabase
        .from('class_members')
        .select('class_id')
        .eq('user_id', targetStudentId)
        .limit(1)
        .single();
    
    if (!classData) return { data: [] };

    // Get all assignments
    const { data: assignments } = await supabase
        .from('assignments')
        .select('id, title, deadline, subjects!inner(name)')
        .eq('subjects.class_id', classData.class_id);
    
    // Get submissions
    const { data: submissions } = await supabase
        .from('submissions')
        .select('assignment_id')
        .eq('student_id', targetStudentId);

    const submittedIds = new Set(submissions?.map(s => s.assignment_id) || []);
    const pending = (assignments || []).filter(a => !submittedIds.has(a.id));

    return { 
        data: pending.map((a: any) => ({
            title: a.title,
            subject: a.subjects?.name,
            deadline: a.deadline,
            is_submitted: false
        }))
    };
}

async function getChildAttendanceSummary(supabase: SupabaseClient, parentId: string, args: { student_id?: string }) {
    const childIds = await getVerifiedChildren(supabase, parentId);
    const targetStudentId = args.student_id && childIds.includes(args.student_id) ? args.student_id : childIds[0];

    const { data, error } = await supabase
        .from('attendance_records')
        .select('status, date')
        .eq('student_id', targetStudentId)
        .order('date', { ascending: false })
        .limit(30);
    
    if (error) throw error;

    const total = data.length;
    const present = data.filter(d => d.status === 'hadir').length;
    const absent = data.filter(d => d.status === 'alfa').length;
    const sick = data.filter(d => d.status === 'sakit' || d.status === 'izin').length;

    return {
        data: {
            last_30_days: {
                total_days: total,
                present,
                absent,
                sick_or_leave: sick,
                attendance_rate: total > 0 ? Math.round((present / total) * 100) : 100
            }
        }
    };
}

async function getParentingTips(supabase: SupabaseClient, parentId: string, args: { student_id?: string }) {
    const childIds = await getVerifiedChildren(supabase, parentId);
    const targetStudentId = args.student_id && childIds.includes(args.student_id) ? args.student_id : childIds[0];

    // Fetch grades
    const { data: submissions } = await supabase
        .from('submissions')
        .select(`
            grades(score),
            assignments!inner(subjects!inner(name))
        `)
        .eq('student_id', targetStudentId)
        .not('grades', 'is', null);
    
    if (!submissions || submissions.length === 0) {
        return { data: { message: "Belum ada data nilai untuk dianalisis." } };
    }

    const subjectScores: Record<string, number[]> = {};
    submissions.forEach((s: any) => {
        const score = Array.isArray(s.grades) ? s.grades[0]?.score : s.grades?.score;
        const subject = s.assignments?.subjects?.name;
        if (typeof score === 'number' && subject) {
            if (!subjectScores[subject]) subjectScores[subject] = [];
            subjectScores[subject].push(score);
        }
    });

    const weakSubjects = Object.entries(subjectScores).map(([sub, scores]) => {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        return { subject: sub, score: Math.round(avg * 10) / 10 };
    }).sort((a, b) => a.score - b.score);

    const weakest = weakSubjects[0];

    return {
        data: {
            weakest_subject: weakest,
            all_subjects: weakSubjects,
            system_prompt_hint: `Generate specific, actionable, and encouraging parenting tips to help their child improve in ${weakest?.subject || 'general studies'} considering their current average score is ${weakest?.score || 0}.`
        }
    };
}
