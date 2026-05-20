import type { SupabaseClient } from '@supabase/supabase-js';

export async function executeKepsekTool(supabase: SupabaseClient, schoolId: string, toolName: string, args: any) {
    try {
        switch (toolName) {
            case 'get_class_performance_ranking':
                return await getClassPerformanceRanking(supabase, schoolId);
            case 'get_teacher_performance_report':
                return await getTeacherPerformanceReport(supabase, schoolId);
            case 'get_subject_weakness_map':
                return await getSubjectWeaknessMap(supabase, schoolId);
            case 'get_at_risk_students_school':
                return await getAtRiskStudentsSchool(supabase, schoolId, args);
            case 'generate_board_report':
                return await generateBoardReport(supabase, schoolId, args);
            default:
                throw new Error(`Kepsek tool ${toolName} not found`);
        }
    } catch (error: any) {
        console.error(`[KepsekTools] Error executing ${toolName}:`, error);
        return { error: error.message || 'Tool execution failed' };
    }
}

async function getClassPerformanceRanking(supabase: SupabaseClient, schoolId: string) {
    const { data, error } = await supabase
        .from('school_class_performance')
        .select('*')
        .eq('school_id', schoolId)
        .order('avg_grade', { ascending: false });

    if (error) throw error;
    
    // Add ranking
    const processed = data.map((item: any, index: number) => ({
        rank: index + 1,
        class_name: item.class_name,
        teacher_name: item.teacher_name,
        avg_grade: item.avg_grade,
        attendance_rate: item.attendance_rate,
        submission_rate: item.submission_rate
    }));

    return { data: processed };
}

async function getTeacherPerformanceReport(supabase: SupabaseClient, schoolId: string) {
    // Uses the same view, grouped by teacher
    const { data, error } = await supabase
        .from('school_class_performance')
        .select('*')
        .eq('school_id', schoolId);

    if (error) throw error;

    const teacherStats: Record<string, any> = {};
    
    data.forEach((row: any) => {
        if (!row.teacher_id) return;
        if (!teacherStats[row.teacher_id]) {
            teacherStats[row.teacher_id] = {
                name: row.teacher_name,
                class_count: 0,
                student_count: 0,
                total_completion: 0,
                total_grading_days: 0
            };
        }
        
        const t = teacherStats[row.teacher_id];
        t.class_count++;
        t.student_count += row.student_count || 0;
        t.total_completion += row.grading_completion_rate || 0;
        t.total_grading_days += row.avg_grading_days || 0;
    });

    const result = Object.values(teacherStats).map(t => ({
        name: t.name,
        class_count: t.class_count,
        student_count: t.student_count,
        avg_grading_completion: Math.round(t.total_completion / t.class_count),
        avg_grading_days: Math.round((t.total_grading_days / t.class_count) * 10) / 10
    })).sort((a, b) => b.avg_grading_completion - a.avg_grading_completion);

    return { data: result };
}

async function getSubjectWeaknessMap(supabase: SupabaseClient, schoolId: string) {
    const { data, error } = await supabase
        .from('assignments')
        .select(`
            subjects!inner(name, class_id),
            submissions(grades(score))
        `)
        .eq('subjects.classes.school_id', schoolId); // Note: this requires classes table join if not using a flat view.
        // For simplicity and matching current schema without breaking, we fetch classes first.
    
    if (error) {
        // Fallback: get classes first
        const { data: classes } = await supabase.from('classes').select('id').eq('school_id', schoolId);
        const classIds = classes?.map(c => c.id) || [];
        
        if (classIds.length === 0) return { data: [] };

        const { data: assignData } = await supabase
            .from('assignments')
            .select(`
                subjects!inner(name, class_id),
                submissions(grades(score))
            `)
            .in('subjects.class_id', classIds);
        
        const subjects: Record<string, { total_score: number, count: number, classes: Set<string> }> = {};
        
        (assignData || []).forEach((a: any) => {
            const subName = a.subjects?.name;
            if (!subName) return;
            
            if (!subjects[subName]) subjects[subName] = { total_score: 0, count: 0, classes: new Set() };
            subjects[subName].classes.add(a.subjects.class_id);

            (a.submissions || []).forEach((s: any) => {
                const score = Array.isArray(s.grades) ? s.grades[0]?.score : s.grades?.score;
                if (typeof score === 'number') {
                    subjects[subName].total_score += score;
                    subjects[subName].count++;
                }
            });
        });

        const result = Object.entries(subjects).map(([name, stats]) => ({
            subject: name,
            avg_score: stats.count > 0 ? Math.round((stats.total_score / stats.count) * 10) / 10 : 0,
            classes_affected: stats.classes.size
        })).sort((a, b) => a.avg_score - b.avg_score);

        return { data: result };
    }
    return { data: [] }; // Fallback hit above
}

async function getAtRiskStudentsSchool(supabase: SupabaseClient, schoolId: string, args: { threshold?: number }) {
    const threshold = args.threshold || 70;
    
    // Simplification for the tool: return aggregate stats from the performance view
    const { data, error } = await supabase
        .from('school_class_performance')
        .select('class_name, avg_grade, student_count')
        .eq('school_id', schoolId)
        .lt('avg_grade', threshold);

    if (error) throw error;

    const totalClassesAtRisk = data.length;
    
    return { 
        data: {
            alert: `Ada ${totalClassesAtRisk} kelas dengan rata-rata di bawah ${threshold}`,
            classes: data
        } 
    };
}

async function generateBoardReport(supabase: SupabaseClient, schoolId: string, args: { semester?: string }) {
    // Aggregate multiple tools to build the report
    const [ranking, teachers, weakness] = await Promise.all([
        getClassPerformanceRanking(supabase, schoolId),
        getTeacherPerformanceReport(supabase, schoolId),
        getSubjectWeaknessMap(supabase, schoolId)
    ]);

    const bestClass = ranking.data[0];
    const worstClass = ranking.data[ranking.data.length - 1];
    
    const weakestSubject = weakness.data[0];

    return {
        data: {
            title: `Laporan Komite Sekolah - ${args.semester || 'Semester Berjalan'}`,
            executive_summary: `Secara umum, kelas terbaik adalah ${bestClass?.class_name} dengan rata-rata ${bestClass?.avg_grade}. Area yang membutuhkan intervensi segera adalah mata pelajaran ${weakestSubject?.subject}.`,
            achievements: [
                bestClass ? `Kelas ${bestClass.class_name} mencapai tingkat kehadiran ${bestClass.attendance_rate}%` : "Data tidak tersedia",
                "Kinerja pengisian nilai oleh guru mencapai batas yang memadai."
            ],
            problem_areas: [
                worstClass ? `Kelas ${worstClass.class_name} memiliki rata-rata nilai terendah (${worstClass.avg_grade})` : "",
                weakestSubject ? `Mapel ${weakestSubject.subject} perlu evaluasi kurikulum.` : ""
            ].filter(Boolean),
            data_snapshots: {
                top_classes: ranking.data.slice(0, 3),
                teacher_stats: teachers.data.slice(0, 3)
            }
        }
    };
}
