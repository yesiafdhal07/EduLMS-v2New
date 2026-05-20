import { getSupabaseAdmin } from '@/lib/supabase-admin';
import type { SupabaseClient } from '@supabase/supabase-js';

// All admin tools use supabaseAdmin since they need global read access

export async function executeAdminTool(toolName: string, args: any) {
    const supabase = getSupabaseAdmin();

    try {
        switch (toolName) {
            case 'search_users':
                return await searchUsers(supabase, args);
            case 'get_school_health_report':
                return await getSchoolHealthReport(supabase, args);
            case 'get_recent_audit_logs':
                return await getRecentAuditLogs(supabase, args);
            case 'get_inactive_schools':
                return await getInactiveSchools(supabase, args);
            case 'get_platform_anomaly_report':
                return await getPlatformAnomalyReport(supabase);
            default:
                throw new Error(`Admin tool ${toolName} not found`);
        }
    } catch (error: any) {
        console.error(`[AdminTools] Error executing ${toolName}:`, error);
        return { error: error.message || 'Tool execution failed' };
    }
}

async function searchUsers(supabase: SupabaseClient, args: { query: string, role_filter?: string }) {
    let query = supabase
        .from('users')
        .select('id, full_name, email, role, school_id, created_at')
        .or(`email.ilike.%${args.query}%,full_name.ilike.%${args.query}%`);

    if (args.role_filter && args.role_filter !== 'all') {
        query = query.eq('role', args.role_filter);
    }

    const { data, error } = await query.limit(20);
    if (error) throw error;
    return { data };
}

async function getSchoolHealthReport(supabase: SupabaseClient, args: { limit?: number, sort_by?: 'health_score' | 'login_rate_30d' | 'submission_rate' }) {
    let query = supabase
        .from('admin_school_health')
        .select('*');

    if (args.sort_by) {
        query = query.order(args.sort_by, { ascending: args.sort_by === 'health_score' }); // Ascending for health score (show worst first)
    }

    const { data, error } = await query.limit(args.limit || 20);
    if (error) throw error;
    
    // Calculate simple health score locally if not present in view
    const processed = data.map((row: any) => {
        const loginW = Math.min(row.login_rate_30d || 0, 100) * 0.25;
        const attendW = Math.min(row.avg_attendance_rate || 0, 100) * 0.25;
        const subW = Math.min(row.submission_rate || 0, 100) * 0.25;
        const gradeSpeedW = row.avg_grading_days <= 3 ? 25 : row.avg_grading_days <= 7 ? 15 : row.avg_grading_days <= 14 ? 5 : 0;
        const health_score = Math.round(loginW + attendW + subW + gradeSpeedW);
        return { ...row, health_score };
    });

    if (args.sort_by === 'health_score') {
        processed.sort((a, b) => a.health_score - b.health_score);
    }

    return { data: processed.slice(0, args.limit || 20) };
}

async function getRecentAuditLogs(supabase: SupabaseClient, args: { limit?: number }) {
    const { data, error } = await supabase
        .from('audit_logs')
        .select(`
            id,
            action,
            entity_type,
            entity_id,
            created_at,
            actor:users!actor_id (full_name, role)
        `)
        .order('created_at', { ascending: false })
        .limit(args.limit || 10);
    
    if (error) throw error;
    return { data };
}

async function getInactiveSchools(supabase: SupabaseClient, args: { inactive_days?: number }) {
    const days = args.inactive_days || 30;
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - days);

    // Get all schools and check their latest activity (e.g., from users' last_sign_in_at or submissions)
    // For simplicity, we'll look at admin_school_health login_rate_30d = 0 as a proxy
    const { data, error } = await supabase
        .from('admin_school_health')
        .select('*')
        .eq('login_rate_30d', 0)
        .eq('is_active', true);

    if (error) throw error;
    return { data, message: "Schools with 0% login rate in the last 30 days" };
}

async function getPlatformAnomalyReport(supabase: SupabaseClient) {
    const anomalies = [];

    // Check 1: Schools with critical health score
    const { data: healthData } = await getSchoolHealthReport(supabase, { limit: 100 });
    const criticalSchools = healthData?.filter((s: any) => s.health_score < 50);
    if (criticalSchools && criticalSchools.length > 0) {
        anomalies.push({
            type: "CRITICAL_SCHOOL_HEALTH",
            severity: "HIGH",
            count: criticalSchools.length,
            details: criticalSchools.map((s: any) => `${s.school_name} (Score: ${s.health_score})`),
            recommendation: "Review these schools and contact their administrators for support."
        });
    }

    // Check 2: Users without a school (orphans)
    const { count: orphanCount } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .is('school_id', null)
        .neq('role', 'admin');

    if (orphanCount && orphanCount > 0) {
        anomalies.push({
            type: "ORPHANED_USERS",
            severity: "MEDIUM",
            count: orphanCount,
            details: `${orphanCount} users registered but not linked to any school.`,
            recommendation: "Check user registration logs or clean up inactive orphaned accounts."
        });
    }

    return { data: anomalies };
}
