// Types for Math-LMS Application

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: 'guru' | 'siswa' | 'admin';
    created_at?: string;
}

export interface Student {
    id: string;
    name: string;
    email?: string;
}

export interface ClassData {
    id: string;
    name: string;
    teacher_id: string;
    created_at?: string;
}

export interface Subject {
    id: string;
    title: string;
    class_id: string;
}

export interface Material {
    id: string;
    title: string;
    content?: string;
    content_url: string;
    type: 'file' | 'link';
    subject_id: string;
    created_at?: string;
}

export interface Assignment {
    id: string;
    title: string;
    description?: string;
    file_url?: string;
    deadline: string;
    required_format: string;
    subject_id: string;
    student_id?: string;
    peer_review_enabled?: boolean;
    created_at?: string;
}

export interface Grade {
    id: string;
    score: number;
    submission_id: string;
}

export interface Submission {
    id: string;
    assignment_id: string;
    student_id: string;
    file_url: string;
    submitted_at: string;
    grades?: Grade;
}

export interface AttendanceSession {
    id: string;
    class_id: string;
    date: string;
    is_open: boolean;
    created_at?: string;
    type?: 'manual' | 'qr_code'; // New field for Sprint 5
    // QR Code specific fields
    active_token?: string;
    location_lat?: number;
    location_long?: number;
    radius_meters?: number;
}

export interface AttendanceRecord {
    id: string;
    attendance_id: string;
    student_id: string;
    status: 'hadir' | 'izin' | 'sakit' | 'alpa';
    recorded_at?: string;
}

export interface AttendanceLogs {
    hadir: number;
    izin: number;
    sakit: number;
    alpa: number;
}

export interface DashboardStats {
    avg: number;
    attendance: number;
    submissions: number;
}

export interface TeacherProfile {
    id: string;
    photo_url?: string;
    position?: string;
    teaching_experience?: string;
    education_history?: string;
    achievements?: string;
    updated_at?: string;
}

export interface PortfolioStats {
    total_students: number;
    total_classes: number;
}

// Form State Types
export interface NewMaterialForm {
    title: string;
    type: 'file' | 'link';
    content: string;
    url: string;
}

export interface NewAssignmentForm {
    title: string;
    description: string;
    deadline: string;
    targetType: 'class' | 'student';
    targetId: string;
    classId: string;
    requiredFormat: string;
    fileUrl: string;
}


export interface StudentUser {
    id: string;
    email: string;
    full_name?: string;
    role: 'siswa' | 'guru' | 'admin';
    className?: string;
}

export interface StudentAssignment {
    id: string;
    title: string;
    deadline: string;
    required_format: string;
    subject_id?: string;
    submissions?: {
        id: string;
        file_url: string;
        submitted_at: string;
        grades?: {
            id: string;
            score: number | null;
            type: string;
            feedback: string | null;
        } | null;
    }[];
}

