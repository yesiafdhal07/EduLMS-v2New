export type Role = 'admin' | 'kepala_sekolah' | 'guru' | 'siswa';

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: Role;
    school_id?: string;
}

export interface School {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    logo_url?: string;
    is_active: boolean;
    created_at: string;
}

export interface SchoolCode {
    id: string;
    school_id: string;
    code: string;
    role: 'guru' | 'siswa';
    is_active: boolean;
    created_at: string;
    school?: School;
}

export interface Class {
    id: string;
    name: string;
    teacher_id: string;
    school_id?: string;
}

export interface Subject {
    id: string;
    title: string;
    class_id: string;
}

export interface Material {
    id: string;
    title: string;
    content_url: string;
    subject_id: string;
}

export interface Assignment {
    id: string;
    title: string;
    description: string;
    deadline: string;
    subject_id: string;
}

export interface Submission {
    id: string;
    assignment_id: string;
    student_id: string;
    file_url: string;
    submitted_at: string;
}

export interface Grade {
    id: string;
    submission_id: string;
    score: number;
    type: 'formatif' | 'sumatif';
    feedback?: string;
}

export interface Attendance {
    id: string;
    class_id: string;
    date: string;
    location_center?: string;
    radius?: number;
}

export interface AttendanceRecord {
    id: string;
    attendance_id: string;
    student_id: string;
    status: 'hadir' | 'izin' | 'sakit' | 'alpa';
    recorded_at: string;
}
