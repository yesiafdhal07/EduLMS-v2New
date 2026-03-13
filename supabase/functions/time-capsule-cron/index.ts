// ========================================================
// TIME CAPSULE CRON - Auto-Unlock Function (Optional)
// 
// This is an OPTIONAL backup function that auto-unlocks
// capsules server-side. The primary unlock mechanism is
// now CLIENT-SIDE in useTimeCapsule.ts hook.
//
// This function only needs to be deployed if you want
// a server-side backup to ensure capsules are unlocked
// even if the student hasn't logged in.
// ========================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Auto-unlock capsules that have reached their unlock date.
 * No email is sent — notifications happen in-app when the
 * student opens their dashboard (via useTimeCapsule hook).
 */
async function autoUnlockCapsules() {
    const { data, error } = await supabase
        .from('time_capsules')
        .update({ 
            is_unlocked: true, 
            unlocked_at: new Date().toISOString() 
        })
        .lte('unlock_date', new Date().toISOString().split('T')[0])
        .eq('is_unlocked', false)
        .select('id');

    if (error) {
        console.error('[TimeCapsule] Error:', error);
        return { success: false, error: error.message };
    }

    const count = data?.length || 0;
    console.log(`[TimeCapsule] Unlocked ${count} capsules`);
    return { success: true, unlocked: count };
}

// Edge Function handler
// @ts-ignore - Deno types
Deno.serve(async (req: Request) => {
    const cronSecret = req.headers.get('x-cron-secret');
    const expectedSecret = Deno.env.get('CRON_SECRET');
    
    if (expectedSecret && cronSecret !== expectedSecret) {
        return new Response('Unauthorized', { status: 401 });
    }

    const result = await autoUnlockCapsules();
    
    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
    });
});
