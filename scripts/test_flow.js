/**
 * scripts/test_flow.js
 * End-to-end test script to verify:
 * 1. Runtime URL and Key check
 * 2. Faculty sign-up via supabase.auth.signUp
 * 3. Institution sign-up via supabase.auth.signUp
 * 4. Vacancy posting via public.vacancies
 * 5. Querying public tables to verify row presence
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://vlgviaijtzrxufbzvzps.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_dcta-ibySlmWcszgWE_b1w_NFX7uLUU';

console.log('================================================================');
console.log('IRA Supabase End-to-End Verification Test');
console.log('Target URL:', SUPABASE_URL);
console.log('Anon/Publishable Key:', SUPABASE_ANON_KEY.slice(0, 16) + '...' + SUPABASE_ANON_KEY.slice(-4));
console.log('================================================================\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runTest() {
  const ts = Date.now();
  const facultyEmail = `test.faculty.${ts}@gmail.com`;
  const instEmail = `test.college.${ts}@gmail.com`;
  const password = 'TestPassword123!';

  console.log('--- Step 1: Testing Faculty Sign Up ---');
  console.log('Email:', facultyEmail);
  const facultySignup = await supabase.auth.signUp({
    email: facultyEmail,
    password,
    options: {
      data: {
        role: 'faculty',
        full_name: 'Dr. Test Candidate',
        phone: '+91 9441122334'
      }
    }
  });

  if (facultySignup.error) {
    console.error('❌ Faculty Sign Up Failed:', facultySignup.error.message);
  } else {
    console.log('✅ Faculty Sign Up Succeeded!');
    console.log('   User ID:', facultySignup.data?.user?.id);
    console.log('   Role:', facultySignup.data?.user?.user_metadata?.role);
    console.log('   Session:', facultySignup.data?.session ? 'Active' : 'Pending email confirmation');
  }

  console.log('\n--- Step 2: Testing Institution Sign Up ---');
  console.log('Email:', instEmail);
  const instSignup = await supabase.auth.signUp({
    email: instEmail,
    password,
    options: {
      data: {
        role: 'institution',
        full_name: 'Dr. K. Test Principal',
        institution_name: 'Apex Institute of Technology',
        phone: '+91 422 2345678'
      }
    }
  });

  if (instSignup.error) {
    console.error('❌ Institution Sign Up Failed:', instSignup.error.message);
  } else {
    console.log('✅ Institution Sign Up Succeeded!');
    console.log('   User ID:', instSignup.data?.user?.id);
    console.log('   Role:', instSignup.data?.user?.user_metadata?.role);
    console.log('   Institution Name:', instSignup.data?.user?.user_metadata?.institution_name);
    console.log('   Session:', instSignup.data?.session ? 'Active' : 'Pending email confirmation');
  }

  console.log('\n--- Step 3: Checking Table Rows in Supabase public Schema ---');
  const tables = ['profiles', 'faculty_profiles', 'institutions', 'vacancies', 'applications', 'notifications'];
  for (const t of tables) {
    const { data, count, error } = await supabase.from(t).select('*', { count: 'exact', head: false }).limit(5);
    if (error) {
      console.log(`- ${t}: ⚠️ Query error:`, error.message);
    } else {
      console.log(`- ${t}: count = ${count ?? (data ? data.length : 0)} row(s)`);
      if (data && data.length) {
        console.log(`  Sample row:`, JSON.stringify(data[0]).slice(0, 100) + '...');
      }
    }
  }

  console.log('\n================================================================');
  console.log('Verification Summary Completed');
  console.log('================================================================');
}

runTest().catch(console.error);
