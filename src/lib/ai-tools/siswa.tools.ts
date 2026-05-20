import type { SupabaseClient } from '@supabase/supabase-js';
import { generateSoal } from '../services/soal-generator.service';

export async function executeSiswaTool(supabase: SupabaseClient, userId: string, toolName: string, args: any) {
    try {
        switch (toolName) {
            case 'get_my_pending_assignments':
                return await getMyPendingAssignments(supabase, userId);
            case 'get_my_grade_trajectory':
                return await getMyGradeTrajectory(supabase, userId, args);
            case 'get_class_materials_for_study':
                return await getClassMaterialsForStudy(supabase, userId, args);
            case 'generate_personal_study_plan':
                return await generatePersonalStudyPlan(supabase, userId, args);
            case 'generate_practice_quiz':
                return await generatePracticeQuiz(args);
            default:
                throw new Error(`Siswa tool ${toolName} not found`);
        }
    } catch (error: any) {
        console.error(`[SiswaTools] Error executing ${toolName}:`, error);
        return { error: error.message || 'Tool execution failed' };
    }
}

// Get the class ID the student belongs to
async function getStudentClassId(supabase: SupabaseClient, userId: string): Promise<string> {
    const { data, error } = await supabase
        .from('class_members')
        .select('class_id')
        .eq('user_id', userId)
        .limit(1)
        .single();
    
    if (error || !data) {
        throw new Error("Student is not enrolled in any class");
    }
    return data.class_id;
}

async function getMyPendingAssignments(supabase: SupabaseClient, userId: string) {
    const classId = await getStudentClassId(supabase, userId);
    
    // Get all assignments for the class
    const { data: assignments, error: aErr } = await supabase
        .from('assignments')
        .select('id, title, deadline, subjects!inner(name)')
        .eq('subjects.class_id', classId)
        .order('deadline', { ascending: true });

    if (aErr) throw aErr;

    // Get student's submissions
    const { data: submissions, error: sErr } = await supabase
        .from('submissions')
        .select('assignment_id')
        .eq('student_id', userId);

    if (sErr) throw sErr;

    const submittedIds = new Set(submissions.map((s: any) => s.assignment_id));
    
    const now = new Date();
    const pending = assignments
        .filter((a: any) => !submittedIds.has(a.id))
        .map((a: any) => {
            const deadline = new Date(a.deadline);
            const diffTime = deadline.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            return {
                id: a.id,
                title: a.title,
                subject: Array.isArray(a.subjects) ? a.subjects[0]?.name : a.subjects?.name,
                deadline: a.deadline,
                days_remaining: diffDays,
                is_overdue: diffDays < 0
            };
        });

    return { data: pending };
}

async function getMyGradeTrajectory(supabase: SupabaseClient, userId: string, args: { limit?: number }) {
    const { data, error } = await supabase
        .from('submissions')
        .select(`
            id, submitted_at,
            grades(score),
            assignments!inner(title, subjects!inner(name))
        `)
        .eq('student_id', userId)
        .not('grades', 'is', null)
        .order('submitted_at', { ascending: false })
        .limit(args.limit || 10);

    if (error) throw error;

    const processed = data.map((sub: any) => {
        const score = Array.isArray(sub.grades) ? sub.grades[0]?.score : sub.grades?.score;
        return {
            assignment_title: sub.assignments?.title,
            subject: Array.isArray(sub.assignments?.subjects) ? sub.assignments?.subjects[0]?.name : sub.assignments?.subjects?.name,
            score: score || 0,
            submitted_at: sub.submitted_at
        };
    }).filter((item: any) => typeof item.score === 'number');

    return { data: processed };
}

async function getClassMaterialsForStudy(supabase: SupabaseClient, userId: string, args: { limit?: number }) {
    const classId = await getStudentClassId(supabase, userId);
    const { data, error } = await supabase
        .from('materials')
        .select('title, description, created_at, subjects!inner(name)')
        .eq('subjects.class_id', classId)
        .order('created_at', { ascending: false })
        .limit(args.limit || 5);

    if (error) throw error;
    return { data: data.map((d: any) => ({ ...d, subject: Array.isArray(d.subjects) ? d.subjects[0]?.name : d.subjects?.name })) };
}

async function generatePersonalStudyPlan(supabase: SupabaseClient, userId: string, args: { days_available: number }) {
    // Collect data to feed the logic
    const pendingPromise = getMyPendingAssignments(supabase, userId);
    const gradesPromise = getMyGradeTrajectory(supabase, userId, { limit: 20 });
    
    const [pendingRes, gradesRes] = await Promise.all([pendingPromise, gradesPromise]);
    
    const pending = pendingRes.data || [];
    const grades = gradesRes.data || [];

    // Analyze weak subjects
    const subjectScores: Record<string, number[]> = {};
    grades.forEach((g: any) => {
        if (!subjectScores[g.subject]) subjectScores[g.subject] = [];
        subjectScores[g.subject].push(g.score);
    });

    const weakSubjects = Object.entries(subjectScores).map(([sub, scores]) => {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        return { subject: sub, avg };
    }).sort((a, b) => a.avg - b.avg).slice(0, 3);

    const days = Math.min(Math.max(args.days_available || 7, 1), 14);
    const plan = [];

    // Simple heuristic planner
    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        let focusTask = pending.length > i ? pending[i].title : null;
        let focusSubject = weakSubjects.length > 0 ? weakSubjects[i % weakSubjects.length].subject : "General Study";

        plan.push({
            day: i + 1,
            date: date.toISOString().split('T')[0],
            focus_subject: focusSubject,
            action: focusTask ? `Kerjakan tugas: ${focusTask}` : `Review materi untuk meningkatkan nilai rata-rata.`
        });
    }

    return {
        data: {
            analysis: {
                weakest_subjects: weakSubjects,
                pending_tasks_count: pending.length
            },
            daily_plan: plan
        }
    };
}

async function generatePracticeQuiz(args: { subject: string, based_on?: string, count?: number }) {
    const topicDesc = args.based_on ? `Materi: ${args.based_on}` : "Topik umum";
    
    const questions = await generateSoal({
        topik: topicDesc,
        mataPelajaran: args.subject,
        kelas: "Menengah",
        jumlah: Math.min(args.count || 5, 10),
        tipe: 'pilihan_ganda',
        tingkat: 'C3' // Application level
    });

    return { data: questions };
}
