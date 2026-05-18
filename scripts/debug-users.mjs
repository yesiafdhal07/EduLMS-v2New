import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function debug() {
  console.log('🔗 Connecting to Supabase at:', supabaseUrl);
  
  // 1. Get auth users
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('❌ Error listing auth users:', authError.message);
  } else {
    console.log(`\n👥 Auth Users (Total: ${users.length}):`);
    users.forEach(u => {
      console.log(`- ID: ${u.id} | Email: ${u.email} | Role: ${u.role} | Metadata:`, JSON.stringify(u.user_metadata));
    });
  }

  // 2. Get public users
  const { data: publicUsers, error: publicError } = await supabase
    .from('users')
    .select('*');
    
  if (publicError) {
    console.error('❌ Error listing public users:', publicError.message);
  } else {
    console.log(`\n🏠 Public Users (Total: ${publicUsers.length}):`);
    publicUsers.forEach(u => {
      console.log(`- ID: ${u.id} | Email: ${u.email} | Full Name: ${u.full_name} | Role: ${u.role}`);
    });
  }
}

debug().catch(console.error);
