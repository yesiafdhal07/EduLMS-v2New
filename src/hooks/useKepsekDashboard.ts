'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface KepsekStats {
    totalGuru: number;
    totalSiswa: number;
    totalClasses: number;
    avgAttendance: number;
    avgGrade: number;
    submissionRate: number;
}

export interface TeacherInfo {
    id: string;
    full_name: string;
    email: string;
    class_count: number;
    student_count: number;
    grading_completion: number;
    avg_grading_days: number;
}

export interface ClassOverview {
    id: string;
    name: string;
    teacher_name: string;
    student_count: number;
    avg_grade: number;
    attendance_rate: number;
    submission_rate: number;
    kkm_status: string;
    assignment_count: number;
}

export interface AlertItem {
    id: string;
    type: 'student' | 'teacher' | 'class';
    severity: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    entity_id: string;
}

export function useKepsekDashboard() {
    const { user, loading: authLoading } = useAuth('kepala_sekolah');
    const [stats, setStats] = useState<KepsekStats>({
        totalGuru: 0, totalSiswa: 0, totalClasses: 0, avgAttendance: 0, avgGrade: 0, submissionRate: 0,
    });
    const [teachers, setTeachers] = useState<TeacherInfo[]>([]);
    const [classOverviews, setClassOverviews] = useState<ClassOverview[]>([]);
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [schoolName, setSchoolName] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchAll = useCallback(async () => {
        if (!user?.school_id) return;
        const schoolId = user.school_id;

        const [schoolRes, classPerf, guruRes] = await Promise.all([
            supabase.from('schools').select('name').eq('id', schoolId).single(),
            supabase.from('school_class_performance').select('*').eq('school_id', schoolId),
            supabase.from('users').select('id, full_name, email').eq('school_id', schoolId).eq('role', 'guru'),
        ]);

        if (schoolRes.data) setSchoolName(schoolRes.data.name);

        const classes = (classPerf.data || []) as any[];
        const guruList = guruRes.data || [];

        const classData: ClassOverview[] = classes.map(c => ({
            id: c.class_id,
            name: c.class_name,
            teacher_name: c.teacher_name || 'N/A',
            student_count: c.student_count || 0,
            avg_grade: c.avg_grade || 0,
            attendance_rate: c.attendance_rate || 0,
            submission_rate: c.submission_rate || 0,
            kkm_status: c.kkm_status || 'below_kkm',
            assignment_count: c.assignment_count || 0,
        }));

        const teacherInfos: TeacherInfo[] = guruList.map((g: any) => {
            const teacherClasses = classes.filter(c => c.teacher_id === g.id);
            const totalStudents = teacherClasses.reduce((sum, c) => sum + (c.student_count || 0), 0);
            const avgCompletion = teacherClasses.length > 0
                ? teacherClasses.reduce((sum, c) => sum + (c.grading_completion_rate || 0), 0) / teacherClasses.length
                : 0;
            return {
                id: g.id,
                full_name: g.full_name,
                email: g.email,
                class_count: teacherClasses.length,
                student_count: totalStudents,
                grading_completion: Math.round(avgCompletion),
                avg_grading_days: 0,
            };
        });

        const totalStudents = classData.reduce((sum, c) => sum + c.student_count, 0);
        const avgGrade = classData.length > 0
            ? Math.round(classData.reduce((sum, c) => sum + c.avg_grade, 0) / classData.filter(c => c.avg_grade > 0).length * 10) / 10 || 0
            : 0;
        const avgAttendance = classData.length > 0
            ? Math.round(classData.reduce((sum, c) => sum + c.attendance_rate, 0) / classData.length * 10) / 10
            : 0;
        const avgSubmission = classData.length > 0
            ? Math.round(classData.reduce((sum, c) => sum + c.submission_rate, 0) / classData.length * 10) / 10
            : 0;

        setStats({
            totalGuru: guruList.length,
            totalSiswa: totalStudents,
            totalClasses: classData.length,
            avgAttendance,
            avgGrade,
            submissionRate: avgSubmission,
        });
        setTeachers(teacherInfos);
        setClassOverviews(classData);

        const newAlerts: AlertItem[] = [];
        classData.forEach(c => {
            if (c.avg_grade > 0 && c.avg_grade < 60) {
                newAlerts.push({
                    id: `class-grade-${c.id}`,
                    type: 'class',
                    severity: 'critical',
                    title: `${c.name} di bawah KKM`,
                    description: `Rata-rata nilai ${c.avg_grade} (target: 75). Perlu perhatian segera.`,
                    entity_id: c.id,
                });
            }
            if (c.attendance_rate > 0 && c.attendance_rate < 70) {
                newAlerts.push({
                    id: `class-att-${c.id}`,
                    type: 'class',
                    severity: 'warning',
                    title: `Kehadiran rendah: ${c.name}`,
                    description: `Tingkat kehadiran ${c.attendance_rate}%. Perlu tindakan.`,
                    entity_id: c.id,
                });
            }
            if (c.submission_rate > 0 && c.submission_rate < 50) {
                newAlerts.push({
                    id: `class-sub-${c.id}`,
                    type: 'class',
                    severity: 'warning',
                    title: `Submission rendah: ${c.name}`,
                    description: `Hanya ${c.submission_rate}% tugas dikumpulkan.`,
                    entity_id: c.id,
                });
            }
        });
        setAlerts(newAlerts);
    }, [user?.school_id]);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        fetchAll().finally(() => setLoading(false));
    }, [user, fetchAll]);

    return {
        user,
        authLoading,
        loading,
        stats,
        teachers,
        classOverviews,
        alerts,
        schoolName,
        refreshData: fetchAll,
    };
}
