import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function inspectPolicies() {
  const { data, error } = await supabase.rpc('get_policies'); // Wait, get_policies RPC might not exist.
  // We can query pg_policies by running an ad-hoc query if we had SQL access, but via REST we can't run raw SQL.
  // Wait! Let's see if we can do it via a direct SELECT on a system view, but REST endpoint blocks system views.
  
  // Let's test reading public.users as an anon user vs authenticated user!
  console.log('Testing reading public.users via Service Role...');
  const { data: adminRead, error: adminErr } = await supabase
    .from('users')
    .select('role')
    .eq('email', 'yesiafdhal07@guru.sma.belajar.id');
  console.log('Admin Read:', adminRead, 'Error:', adminErr);

  // Let's test reading with a client initialized with ANON key (no auth session)
  const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data: anonRead, error: anonErr } = await anonClient
    .from('users')
    .select('role')
    .eq('email', 'yesiafdhal07@guru.sma.belajar.id');
  console.log('Anon Read (No Auth):', anonRead, 'Error:', anonErr);

  // Let's test logging in and reading
  console.log('Logging in as yesiafdhal07@guru.sma.belajar.id...');
  const authClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
  });
  
  const { data: authData, error: authErr } = await authClient.auth.signInWithPassword({
    email: 'yesiafdhal07@guru.sma.belajar.id',
    password: 'password123' // Wait, I don't know their password!
  });
  
  if (authErr) {
    console.error('❌ Failed login test:', authErr.message);
  } else {
    console.log('✅ Logged in successfully! ID:', authData.user.id);
    const { data: authRead, error: authReadErr } = await authClient
      .from('users')
      .select('role')
      .eq('id', authData.user.id)
      .single();
    console.log('Authenticated User Read:', authRead, 'Error:', authReadErr);
  }
}

inspectPolicies().catch(console.error);
