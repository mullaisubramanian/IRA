/**
 * scripts/seed.js
 * 
 * Node script to migrate all mock faculty profiles and institution vacancies
 * into Supabase PUBLIC schema tables (profiles, faculty_profiles, institutions,
 * vacancies, applications, notifications) linked with Supabase auth users.
 * 
 * Uses SUPABASE_SERVICE_ROLE_KEY (backend only - never exposed in frontend).
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables from .env if present
function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://vlgviaijtzrxufbzvzps.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('\n❌ ERROR: SUPABASE_SERVICE_ROLE_KEY is required to seed users and public tables.');
  console.error('Please add SUPABASE_SERVICE_ROLE_KEY to your .env file:');
  console.error('SUPABASE_SERVICE_ROLE_KEY=ey...\n');
  console.error('You can find it in: Supabase Dashboard → Settings → API → service_role secret key\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Import archived mock data sources for initial seeding
import { POOL as MOCK_FACULTY } from '../src/data/archive_sampleFaculty.js';
import { SAMPLE_VACANCIES as MOCK_VACANCIES } from '../src/data/archive_sampleVacancies.js';

// Helper to sanitize name into deterministic email
function emailFromName(name, domain = 'faculty.ira.in') {
  const clean = name.toLowerCase()
    .replace(/^dr\.\s*/, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
  return `${clean}@${domain}`;
}

// Helper to create or find an auth user idempotently
async function getOrCreateAuthUser({ email, password = 'Test@1234', fullName, role }) {
  const cleanEmail = email.toLowerCase().trim();

  // Try creating the user first
  const { data: createData, error: createError } = await supabase.auth.admin.createUser({
    email: cleanEmail,
    password,
    email_confirm: true,
    user_metadata: {
      role,
      full_name: fullName
    }
  });

  if (!createError && createData?.user) {
    return createData.user;
  }

  // If already exists, retrieve user from auth list
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (!listError && listData?.users) {
    const existing = listData.users.find(u => u.email?.toLowerCase() === cleanEmail);
    if (existing) {
      return existing;
    }
  }

  throw new Error(`Failed to create or retrieve auth user [${cleanEmail}]: ${createError?.message || listError?.message}`);
}

async function seed() {
  console.log('🚀 IRA Database Seed Started');
  console.log(`Connecting to: ${supabaseUrl}\n`);

  // 1. SEED INSTITUTIONS
  console.log('🏫 1/4 Seeding Institutions...');
  const institutionMap = new Map(); // Name -> Institution Record

  // Group unique institutions from mock vacancies
  const uniqueInstitutions = [];
  const seenInst = new Set();
  for (const v of MOCK_VACANCIES) {
    if (!seenInst.has(v.instName)) {
      seenInst.add(v.instName);
      uniqueInstitutions.push({
        instName: v.instName,
        type: v.type,
        city: v.dist,
        email: v.email,
        contact: v.contact
      });
    }
  }

  for (const inst of uniqueInstitutions) {
    const user = await getOrCreateAuthUser({
      email: inst.email,
      fullName: inst.instName,
      role: 'institution'
    });

    // Upsert public.profiles
    const { error: pErr } = await supabase.from('profiles').upsert({
      id: user.id,
      email: inst.email.toLowerCase(),
      full_name: inst.instName,
      role: 'institution'
    }, { onConflict: 'id' });

    if (pErr) console.warn(`   ⚠️ profiles error for ${inst.instName}:`, pErr.message);

    // Upsert public.institutions
    const instPayload = {
      id: user.id,
      institution_name: inst.instName,
      type: inst.type,
      city: inst.city,
      state: 'Tamil Nadu',
      website: `https://${inst.email.split('@')[1] || 'institution.edu'}`,
      contact_person: inst.contact,
      phone: '+91 422 2570000',
      logo_url: null,
      verified: true
    };

    const { data: instData, error: iErr } = await supabase.from('institutions').upsert(instPayload, { onConflict: 'id' }).select().single();
    if (iErr) {
      console.error(`   ❌ Failed to upsert institution [${inst.instName}]:`, iErr.message);
    } else {
      institutionMap.set(inst.instName, instData || instPayload);
      console.log(`   ✓ Institution seeded: ${inst.instName} (${inst.city})`);
    }
  }

  // 2. SEED VACANCIES
  console.log('\n💼 2/4 Seeding College Vacancies...');
  const vacancyMap = new Map();

  for (const v of MOCK_VACANCIES) {
    const inst = institutionMap.get(v.instName);
    if (!inst) {
      console.warn(`   ⚠️ Skipping vacancy for unmapped institution: ${v.instName}`);
      continue;
    }

    const { data: vacData, error: vErr } = await supabase.from('vacancies').insert({
      institution_id: inst.id,
      title: v.role,
      department: v.dept,
      qualification_required: v.qual,
      experience_required: v.exp,
      salary_range: v.salary,
      location: `${v.dist}, Tamil Nadu`,
      description: `${v.jd} (Openings: ${v.count}. Accommodation: ${v.accom}. Transport: ${v.transport})`,
      status: 'open'
    }).select().single();

    if (vErr) {
      console.error(`   ❌ Failed to insert vacancy [${v.role} - ${v.dept}]:`, vErr.message);
    } else {
      vacancyMap.set(v.id, vacData);
      console.log(`   ✓ Vacancy seeded: ${v.role} (${v.dept}) at ${v.instName}`);
    }
  }

  // 3. SEED FACULTY PROFILES
  console.log('\n👩‍🏫 3/4 Seeding Faculty Profiles...');
  const facultyUserMap = new Map();

  for (let i = 0; i < MOCK_FACULTY.length; i++) {
    const f = MOCK_FACULTY[i];
    const email = emailFromName(f.name);
    const user = await getOrCreateAuthUser({
      email,
      fullName: f.name,
      role: 'faculty'
    });

    facultyUserMap.set(f.id, user);

    // Upsert public.profiles
    const { error: pfErr } = await supabase.from('profiles').upsert({
      id: user.id,
      email: email.toLowerCase(),
      full_name: f.name,
      role: 'faculty'
    }, { onConflict: 'id' });

    if (pfErr) console.warn(`   ⚠️ profiles error for ${f.name}:`, pfErr.message);

    // Map fields to public.faculty_profiles
    const expYears = Number((f.expA || 0) + (f.expI || 0));
    const { error: fpErr } = await supabase.from('faculty_profiles').upsert({
      id: user.id,
      qualification: f.qual,
      specialization: (f.depts || []).join(', '),
      experience_years: Math.round(expYears * 10) / 10,
      current_institution: `${f.dist} Higher Education Institution`,
      location: f.dist,
      skills: Array.isArray(f.subj) ? f.subj : [],
      resume_url: null,
      phone: `+91 944${String(1000000 + i).slice(0, 7)}`,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

    if (fpErr) {
      console.error(`   ❌ Failed to upsert faculty profile [${f.name}]:`, fpErr.message);
    } else {
      console.log(`   ✓ Faculty seeded: ${f.name} (${f.qual}, ${expYears} yrs exp, ${f.dist})`);
    }
  }

  // 4. SEED SAMPLE APPLICATIONS & NOTIFICATIONS
  console.log('\n📄 4/4 Seeding Sample Applications & Notifications...');
  const c1User = facultyUserMap.get('c1'); // Dr. Priya Raman
  const c2User = facultyUserMap.get('c2'); // Karthik Subramanian
  const psgVac = Array.from(vacancyMap.values()).find(v => v.title === 'Assistant Professor' && v.department === 'CSE');
  const kctVac = Array.from(vacancyMap.values()).find(v => v.title === 'Associate Professor' && v.department === 'Mechanical');

  if (c1User && psgVac) {
    const { error: appErr1 } = await supabase.from('applications').upsert({
      vacancy_id: psgVac.id,
      faculty_id: c1User.id,
      status: 'shortlisted',
      match_score: 94
    }, { onConflict: 'vacancy_id, faculty_id' });

    if (!appErr1) {
      console.log('   ✓ Application seeded: Dr. Priya Raman -> PSG College CSE (Shortlisted, 94% match)');
      await supabase.from('notifications').insert([
        {
          user_id: c1User.id,
          type: 'application_shortlisted',
          message: 'PSG College of Technology has reviewed and shortlisted your profile for Assistant Professor in CSE.',
          is_read: false
        },
        {
          user_id: psgVac.institution_id,
          type: 'new_application',
          message: 'Dr. Priya Raman submitted an application for Assistant Professor in CSE (94% match).',
          is_read: true
        }
      ]);
    }
  }

  if (c2User && kctVac) {
    const { error: appErr2 } = await supabase.from('applications').upsert({
      vacancy_id: kctVac.id,
      faculty_id: c2User.id,
      status: 'applied',
      match_score: 86
    }, { onConflict: 'vacancy_id, faculty_id' });

    if (!appErr2) {
      console.log('   ✓ Application seeded: Karthik Subramanian -> KCT Mechanical (Applied, 86% match)');
      await supabase.from('notifications').insert([
        {
          user_id: c2User.id,
          type: 'application_submitted',
          message: 'Your application for Associate Professor in Mechanical at Kumaraguru College of Technology is active.',
          is_read: false
        }
      ]);
    }
  }

  console.log('\n🎉 ALL MOCK DATA SUCCESSFULLY SEEDED INTO SUPABASE PUBLIC TABLES!');
  console.log(`- Institutions created: ${uniqueInstitutions.length}`);
  console.log(`- Vacancies created: ${vacancyMap.size}`);
  console.log(`- Faculty profiles created: ${MOCK_FACULTY.length}`);
  console.log('- Sample applications and notifications created.');
}

seed().catch(err => {
  console.error('\n❌ Unhandled Seed Error:', err);
  process.exit(1);
});
