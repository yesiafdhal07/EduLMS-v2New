import { executeAdminTool } from './admin.tools';
import { executeGuruTool } from './guru.tools';
import { executeSiswaTool } from './siswa.tools';
import { executeKepsekTool } from './kepsek.tools';
import { executeOrangTuaTool } from './orang_tua.tools';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { createClient } from '@supabase/supabase-js';

// Get a scoped supabase client for the user (Service role is only used for Admin/Kepsek where RLS bypass is required for complex views temporarily)
// In a real production setup, we would use RLS properly and pass the user's token.
function getScopedClient() {
    return getSupabaseAdmin(); 
}

export async function executeTool(role: string, userId: string, schoolId: string | null, toolName: string, args: any) {
    const supabase = getScopedClient(); // Using admin client for backend tool execution to bypass RLS, we rely on server-side validations
    
    console.log(`[ToolExecutor] Executing ${toolName} for role ${role} (User: ${userId})`);

    try {
        switch (role) {
            case 'admin':
                return await executeAdminTool(toolName, args);
            case 'guru':
                return await executeGuruTool(supabase, userId, toolName, args);
            case 'siswa':
                return await executeSiswaTool(supabase, userId, toolName, args);
            case 'kepala_sekolah':
                if (!schoolId) throw new Error("Kepala Sekolah missing school_id");
                return await executeKepsekTool(supabase, schoolId, toolName, args);
            case 'orang_tua':
                return await executeOrangTuaTool(supabase, userId, toolName, args);
            default:
                throw new Error(`Role ${role} does not have tool execution privileges.`);
        }
    } catch (error: any) {
        console.error(`[ToolExecutor] Tool execution error:`, error);
        return { error: error.message || 'Execution failed' };
    }
}
