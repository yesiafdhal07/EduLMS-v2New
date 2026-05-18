/**
 * useSemesterTrends — USP #14
 * 
 * Fetches and computes grade trend data across semesters.
 * Falls back to in-memory aggregation from grades table when
 * semester_snapshots table is not yet available.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface SemesterPoint {
    label: string;       // e.g. "Ganjil 2024"
    avgGrade: number;
    attendanceRate: number;
    submissionRate: number;
    period: string;      // "2024-1" sortable key
}

export type TrendDirection = 'up' | 'down' | 'stable';

interface UseSemesterTrendsResult {
    data: SemesterPoint[];
    trend: TrendDirection;
    loading: boolean;
    error: string | null;
}

function calcTrend(data: SemesterPoint[]): TrendDirection {
    if (data.length < 2) return 'stable';
    const last = data[data.length - 1].avgGrade;
    const prev = data[data.length - 2].avgGrade;
    const delta = last - prev;
    if (delta > 2) return 'up';
    if (delta < -2) return 'down';
    return 'stable';
}

/**
 * Derive semester label from date.
 * Jan–Jun = Genap, Jul–Dec = Ganjil
 */
function getSemesterLabel(date: Date): { label: string; period: string } {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-based
    if (month >= 6) {
        // July–December = Ganjil (semester 1 of academic year)
        return { label: `Ganjil ${year}`, period: `${year}-1` };
    } else {
        // Jan–June = Genap (semester 2 of previous academic year)
        return { label: `Genap ${year}`, period: `${year}-2` };
    }
}

export function useSemesterTrends(classId: string | null | undefined): UseSemesterTrendsResult {
    const [data, setData] = useState<SemesterPoint[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        if (!classId) return;
        setLoading(true);
        setError(null);

        try {
            // 1. Try semester_snapshots table first (faster, pre-computed)
            const { data: snapshots, error: snapErr } = await supabase
                .from('semester_snapshots')
                .select('semester, school_year, avg_grade, attendance_rate, snapshot_date')
                .eq('class_id', classId)
                .order('snapshot_date', { ascending: true })
                .limit(8);

            if (!snapErr && snapshots && snapshots.length >= 2) {
                setData(snapshots.map(s => ({
                    label: `${s.semester} ${s.school_year}`,
                    avgGrade: Math.round(s.avg_grade * 10) / 10,
                    attendanceRate: Math.round((s.attendance_rate || 0) * 10) / 10,
                    submissionRate: 0,
                    period: `${s.school_year}-${s.semester === 'Ganjil' ? '1' : '2'}`,
                })));
                setLoading(false);
                return;
            }

            // 2. Fallback: aggregate from raw grades table by semester
            const { data: memberData } = await supabase
                .from('class_members')
                .select('user_id, users!inner(id, grades(score, created_at))')
                .eq('class_id', classId);

            if (!memberData || memberData.length === 0) {
                setData([]);
                setLoading(false);
                return;
            }

            // Group all grades by semester
            const semesterMap: Record<string, { grades: number[]; period: string; label: string }> = {};

            memberData.forEach(m => {
                const user = Array.isArray(m.users) ? m.users[0] : m.users;
                const grades = (user as any)?.grades || [];
                grades.forEach((g: { score: number; created_at: string }) => {
                    if (g.score === null || g.score === undefined) return;
                    const { label, period } = getSemesterLabel(new Date(g.created_at));
                    if (!semesterMap[period]) semesterMap[period] = { grades: [], period, label };
                    semesterMap[period].grades.push(g.score);
                });
            });

            const points: SemesterPoint[] = Object.values(semesterMap)
                .sort((a, b) => a.period.localeCompare(b.period))
                .slice(-6)
                .map(s => ({
                    label: s.label,
                    avgGrade: s.grades.length > 0
                        ? Math.round((s.grades.reduce((a, b) => a + b, 0) / s.grades.length) * 10) / 10
                        : 0,
                    attendanceRate: 0, // not available in raw fallback
                    submissionRate: 0,
                    period: s.period,
                }));

            setData(points);
        } catch (err) {
            console.error('[useSemesterTrends]', err);
            setError('Gagal memuat data tren semester');
        } finally {
            setLoading(false);
        }
    }, [classId]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    return { data, trend: calcTrend(data), loading, error };
}
