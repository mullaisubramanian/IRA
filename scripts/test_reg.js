import { createClient } from '@supabase/supabase-js';
import { sanitizeSupabaseUrl, sanitizeSupabaseKey } from '../src/core/supabase.js';

console.log('--- Test 1: URL & Key Sanitization ---');
const testCases = [
  'https://supabase.com/dashboard/project/vlgviaijtzrxufbzvzps/settings/api-keys',
  'https://vlgviaijtzrxufbzvzps.supabase.co/',
  '"https://vlgviaijtzrxufbzvzps.supabase.co"',
  'vlgviaijtzrxufbzvzps.supabase.co',
  ''
];
for (const tc of testCases) {
  const result = sanitizeSupabaseUrl(tc);
  console.log(`Input: "${tc}" => Sanitized: "${result}"`);
  if (result !== 'https://vlgviaijtzrxufbzvzps.supabase.co') {
    throw new Error(`Sanitizer failed for ${tc}`);
  }
}
console.log('✓ All URL sanitization cases passed!\n');

const SUPABASE_URL = sanitizeSupabaseUrl(process.env.VITE_SUPABASE_URL);
const SUPABASE_ANON_KEY = sanitizeSupabaseKey(process.env.VITE_SUPABASE_ANON_KEY);
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('--- Test 2: Database Institutions Table Inspection ---');
async function run() {
  const { data: insts, error: instErr } = await supabase.from('institutions').select('*').limit(5);
  if (instErr) {
    console.error('Error selecting from institutions:', instErr);
  } else {
    console.log(`✓ Successfully queried public.institutions. Found ${insts.length} existing records.`);
    if (insts.length > 0) {
      console.log('Columns present in first record:', Object.keys(insts[0]));
    }
  }

  const { data: profs, error: profErr } = await supabase.from('profiles').select('id, full_name, role').limit(5);
  if (profErr) {
    console.error('Error selecting from profiles:', profErr);
  } else {
    console.log(`✓ Successfully queried public.profiles. Found ${profs.length} existing records.`);
  }

  console.log('\n--- Test 3: Auth Endpoint & Validation ---');
  // Weak password test
  const weakRes = await supabase.auth.signUp({
    email: 'test_inst_validation@example.com',
    password: '123'
  });
  console.log('Weak password test result code:', weakRes.error?.code, '| message:', weakRes.error?.message);

  console.log('\n--- Test 4: Check RLS policies on public.institutions ---');
  // Anonymous / client select test
  const { data: publicInst, error: pErr } = await supabase.from('institutions').select('id, institution_name, type, city').limit(3);
  console.log('Institutions query status:', pErr ? pErr.message : `OK (${publicInst.length} records returned)`);

  console.log('\nAll automated checks completed!');
}

run().catch(console.error);
