import type { SupabaseClient } from '@supabase/supabase-js';
import { generateSoal, SoalItem } from '../services/soal-generator.service';

export async function executeGuruTool(supabase: SupabaseClient, userId: string, toolName: string, args: any) {
    try {
        switch (toolName) {
            case 'get_latest_materials':
                return await getLatestMaterials(supabase, userId, args);
            case 'get_assignment_history':
                return await getAssignmentHistory(supabase, userId, args);
            case 'get_at_risk_students':
                return await getAtRiskStudents(supabase, userId, args);
            case 'get_submission_stats':
                return await getSubmissionStats(supabase, userId, args);
            case 'draft_assignment':
                return await draftAssignment(supabase, userId, args);
            case 'generate_differentiated_tasks':
                return await generateDifferentiatedTasks(supabase, userId, args);
            default:
                throw new Error(`Guru tool ${toolName} not found`);
        }
    } catch (error: any) {
        console.error(`[GuruTools] Error executing ${toolName}:`, error);
        return { error: error.message || 'Tool execution failed' };
    }
}

// Ensure teacher has access to the class
async function verifyClassAccess(supabase: SupabaseClient, userId: string, classId: string) {
    const { data, error } = await supabase
        .from('subjects')
        .select('id')
        .eq('teacher_id', userId)
        .eq('class_id', classId)
        .limit(1);
    
    if (error || !data || data.length === 0) {
        throw new Error("Access denied: You do not teach this class or it does not exist.");
    }
}

async function getLatestMaterials(supabase: SupabaseClient, userId: string, args: { class_id: string, limit?: number }) {
    await verifyClassAccess(supabase, userId, args.class_id);
    const { data, error } = await supabase
        .from('materials')
        .select(`
            id, title, description, file_url, created_at,
            subjects!inner(name)
        `)
        .eq('subjects.class_id', args.class_id)
        .order('created_at', { ascending: false })
        .limit(args.limit || 3);
    
    if (error) throw error;
    return { data: data.map((m: any) => ({ ...m, subject_name: m.subjects?.name || (Array.isArray(m.subjects) ? m.subjects[0]?.name : undefined) })) };
}

async function getAssignmentHistory(supabase: SupabaseClient, userId: string, args: { class_id: string, limit?: number }) {
    await verifyClassAccess(supabase, userId, args.class_id);
    const { data, error } = await supabase
        .from('assignments')
        .select(`
            id, title, deadline,
            subjects!inner(name),
            submissions(id, grades(score))
        `)
        .eq('subjects.class_id', args.class_id)
        .order('created_at', { ascending: false })
        .limit(args.limit || 10);
    
    if (error) throw error;

    const processed = data.map((a: any) => {
        const subs = a.submissions || [];
        const validGrades = subs.map((s: any) => Array.isArray(s.grades) ? s.grades[0]?.score : s.grades?.score).filter((s: any) => typeof s === 'number');
        const avgScore = validGrades.length > 0 ? validGrades.reduce((acc: number, val: number) => acc + val, 0) / validGrades.length : 0;
        
        return {
            id: a.id,
            title: a.title,
            deadline: a.deadline,
            subject_name: Array.isArray(a.subjects) ? a.subjects[0]?.name : a.subjects?.name,
            submission_count: subs.length,
            avg_score: Math.round(avgScore * 10) / 10
        };
    });

    return { data: processed };
}

async function getAtRiskStudents(supabase: SupabaseClient, userId: string, args: { class_id: string, grade_threshold?: number, attendance_threshold?: number }) {
    await verifyClassAccess(supabase, userId, args.class_id);
    const gThresh = args.grade_threshold || 70;
    const aThresh = args.attendance_threshold || 75;

    // Fetch members and their data
    const { data, error } = await supabase
        .from('class_members')
        .select(`
            user_id,
            users!inner(full_name),
            attendance_records(status),
            submissions(grades(score))
        `)
        .eq('class_id', args.class_id);

    if (error) throw error;

    const atRisk: any[] = [];

    data.forEach((member: any) => {
        const attRecords = member.attendance_records || [];
        const presentCount = attRecords.filter((a: any) => a.status === 'hadir').length;
        const attRate = attRecords.length > 0 ? (presentCount / attRecords.length) * 100 : 100;

        const subs = member.submissions || [];
        let totalScore = 0;
        let gradedCount = 0;
        subs.forEach((s: any) => {
            const score = Array.isArray(s.grades) ? s.grades[0]?.score : s.grades?.score;
            if (typeof score === 'number') {
                totalScore += score;
                gradedCount++;
            }
        });
        const avgGrade = gradedCount > 0 ? totalScore / gradedCount : 100; // If no grades, don't flag yet

        if (avgGrade < gThresh || attRate < aThresh) {
            atRisk.push({
                student_id: member.user_id,
                name: member.users?.full_name,
                avg_grade: Math.round(avgGrade * 10) / 10,
                attendance_rate: Math.round(attRate * 10) / 10,
                risk_level: avgGrade < gThresh - 10 || attRate < aThresh - 15 ? 'HIGH' : 'MEDIUM'
            });
        }
    });

    return { data: atRisk };
}

async function getSubmissionStats(supabase: SupabaseClient, userId: string, args: { assignment_id: string }) {
    // 1. Get assignment details
    const { data: assignment, error: aErr } = await supabase
        .from('assignments')
        .select(`
            id, title, deadline,
            subjects!inner(class_id)
        `)
        .eq('id', args.assignment_id)
        .single();
    
    if (aErr || !assignment) throw new Error("Assignment not found");
    const classId = Array.isArray(assignment.subjects) ? assignment.subjects[0]?.class_id : (assignment.subjects as any)?.class_id;
    await verifyClassAccess(supabase, userId, classId);

    // 2. Get class members
    const { data: members, error: mErr } = await supabase
        .from('class_members')
        .select('user_id, users!inner(full_name)')
        .eq('class_id', classId);

    if (mErr) throw mErr;

    // 3. Get submissions
    const { data: submissions, error: sErr } = await supabase
        .from('submissions')
        .select('student_id, submitted_at, grades(score)')
        .eq('assignment_id', args.assignment_id);

    if (sErr) throw sErr;

    const totalStudents = members.length;
    const submittedIds = new Set(submissions.map((s: any) => s.student_id));
    const submittedCount = submittedIds.size;
    const pendingNames = members.filter((m: any) => !submittedIds.has(m.user_id)).map((m: any) => m.users?.full_name);

    let totalScore = 0;
    let gradedCount = 0;
    submissions.forEach((s: any) => {
        const score = Array.isArray(s.grades) ? s.grades[0]?.score : s.grades?.score;
        if (typeof score === 'number') {
            totalScore += score;
            gradedCount++;
        }
    });

    const avgScore = gradedCount > 0 ? totalScore / gradedCount : 0;

    return {
        data: {
            title: assignment.title,
            total_students: totalStudents,
            submitted: submittedCount,
            pending: totalStudents - submittedCount,
            pending_names: pendingNames,
            avg_score: Math.round(avgScore * 10) / 10
        }
    };
}

async function draftAssignment(supabase: SupabaseClient, userId: string, args: { class_id: string, based_on_material_id?: string, type: 'essay' | 'pilihan_ganda', bloom_level: any, topic?: string }) {
    await verifyClassAccess(supabase, userId, args.class_id);
    
    let topicDesc = args.topic || "Materi Pelajaran Umum";
    let subjectName = "Mata Pelajaran";

    if (args.based_on_material_id) {
        const { data: material } = await supabase
            .from('materials')
            .select('title, description, subjects!inner(name)')
            .eq('id', args.based_on_material_id)
            .single();
        if (material) {
            topicDesc = `${material.title} - ${material.description}`;
            subjectName = Array.isArray(material.subjects) ? material.subjects[0]?.name : (material.subjects as any)?.name || "Mata Pelajaran";
        }
    }

    // Use existing soal generator service
    const questions = await generateSoal({
        topik: topicDesc,
        mataPelajaran: subjectName,
        kelas: "Menengah", // Generic
        jumlah: 5,
        tipe: args.type,
        tingkat: args.bloom_level || 'C4'
    });

    const suggestedDeadline = new Date();
    suggestedDeadline.setDate(suggestedDeadline.getDate() + 3);

    return {
        data: {
            title: `Tugas: ${args.topic || (args.based_on_material_id ? "Evaluasi Materi" : "Latihan Baru")}`,
            description: `Selesaikan tugas berikut yang dirancang untuk melatih kemampuan ${args.bloom_level} Anda.`,
            questions,
            suggested_deadline: suggestedDeadline.toISOString(),
            rubric: "1. Ketepatan jawaban (40%)\n2. Pemahaman konsep (40%)\n3. Kerapihan/Penulisan (20%)"
        }
    };
}

async function generateDifferentiatedTasks(supabase: SupabaseClient, userId: string, args: { topic: string, class_id: string }) {
    await verifyClassAccess(supabase, userId, args.class_id);

    // Call soal generator 3 times in parallel
    const [remedial, standard, advanced] = await Promise.all([
        generateSoal({
            topik: args.topic,
            mataPelajaran: "Umum",
            kelas: "Umum",
            jumlah: 3,
            tipe: 'essay',
            tingkat: 'C2',
            konteks: "Sederhana, berfokus pada ingatan dan pemahaman dasar."
        }),
        generateSoal({
            topik: args.topic,
            mataPelajaran: "Umum",
            kelas: "Umum",
            jumlah: 3,
            tipe: 'essay',
            tingkat: 'C4',
            konteks: "Standar, berfokus pada aplikasi dan analisis."
        }),
        generateSoal({
            topik: args.topic,
            mataPelajaran: "Umum",
            kelas: "Umum",
            jumlah: 3,
            tipe: 'essay',
            tingkat: 'C6',
            konteks: "Kompleks, berfokus pada evaluasi dan penciptaan (HOTS)."
        })
    ]);

    return {
        data: {
            remedial: { level: 'C1-C2 (Pemahaman Dasar)', questions: remedial },
            standard: { level: 'C3-C4 (Aplikasi & Analisis)', questions: standard },
            advanced: { level: 'C5-C6 (HOTS & Sintesis)', questions: advanced }
        }
    };
}
