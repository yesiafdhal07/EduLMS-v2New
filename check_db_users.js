const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
    console.log('Checking project:', supabaseUrl);
    
    // Check public.users
    const { data: users, error } = await supabase
        .from('users')
        .select('id, email, role, full_name');
    
    if (error) {
        console.error('Error fetching users:', error);
    } else {
        console.log('Users found in public.users:', users.length);
        users.forEach(u => console.log(`- ${u.email} (${u.role}) ID: ${u.id}`));
    }

    // Check if we can find the specific teacher
    const teacherEmail = 'yesiafdhal07@guru.sma.belajar.id';
    const { data: teacher, error: tError } = await supabase
        .from('users')
        .select('*')
        .eq('email', teacherEmail)
        .single();
    
    if (tError) {
        console.log(`Teacher ${teacherEmail} not found or error:`, tError.message);
    } else {
        console.log(`Teacher ${teacherEmail} found:`, teacher);
    }
}

checkUsers();
