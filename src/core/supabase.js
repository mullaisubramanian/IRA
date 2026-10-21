import { createClient } from '@supabase/supabase-js';

export function sanitizeSupabaseUrl(rawUrl) {
  if (!rawUrl) return 'https://vlgviaijtzrxufbzvzps.supabase.co';
  let url = String(rawUrl).trim();
  // Automatically correct dashboard URLs like https://supabase.com/dashboard/project/vlgviaijtzrxufbzvzps/settings/api-keys
  const dashMatch = url.match(/supabase\.com\/dashboard\/project\/([a-zA-Z0-9_-]+)/);
  if (dashMatch) {
    return `https://${dashMatch[1]}.supabase.co`;
  }
  return url;
}

const rawSupabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) || 'https://vlgviaijtzrxufbzvzps.supabase.co';
export const SUPABASE_URL = sanitizeSupabaseUrl(rawSupabaseUrl);
export const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || 'sb_publishable_dcta-ibySlmWcszgWE_b1w_NFX7uLUU';

// Runtime masked logging as requested
console.log(
  `[IRA Supabase Runtime] URL: ${SUPABASE_URL} | Key: ${SUPABASE_ANON_KEY.slice(0, 16)}...${SUPABASE_ANON_KEY.slice(-4)}`
);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Test connectivity to public schema tables
 */
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('vacancies').select('id, title, status').limit(1);
    if (error) {
      console.warn('[IRA Supabase] testConnection error:', error.message);
      return { connected: false, tablesReady: false, error: error.message };
    }
    return { connected: true, tablesReady: true, count: data ? data.length : 0 };
  } catch (err) {
    console.error('[IRA Supabase] testConnection exception:', err);
    return { connected: false, tablesReady: false, error: err.message };
  }
}

/**
 * Sign up user with metadata passed to auth trigger (which populates public.profiles)
 */
export async function signUpUser({ email, password, role = 'faculty', fullName = '', phone = '', institutionName = '' }) {
  const res = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        full_name: fullName,
        phone,
        institution_name: institutionName
      }
    }
  });
  if (res.error) {
    console.error('[IRA Supabase] signUpUser error:', res.error);
  } else {
    console.log('[IRA Supabase] signUpUser success for:', email, 'userId:', res.data?.user?.id);
  }
  return res;
}

/**
 * Sign in user with password
 */
export async function signInUser(email, password) {
  const res = await supabase.auth.signInWithPassword({ email, password });
  if (res.error) {
    console.error('[IRA Supabase] signInUser error:', res.error);
  } else {
    console.log('[IRA Supabase] signInUser success for:', email, 'userId:', res.data?.user?.id);
  }
  return res;
}

/**
 * Sign out user
 */
export async function signOutUser() {
  const res = await supabase.auth.signOut();
  if (res.error) console.error('[IRA Supabase] signOut error:', res.error);
  return res;
}

/**
 * Get current active session
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) console.error('[IRA Supabase] getSession error:', error);
  return { session, error };
}

/**
 * Fetch current user's profile from public.profiles
 */
export async function fetchCurrentProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, faculty_profiles(*), institutions(*)')
    .eq('id', userId)
    .single();
  if (error) console.warn('[IRA Supabase] fetchCurrentProfile error:', error.message);
  return { data, error };
}

/**
 * Fetch open vacancies from public.vacancies with joined institutions
 */
export async function fetchOpenVacancies() {
  const { data, error } = await supabase
    .from('vacancies')
    .select('*, institutions(institution_name, city, state, type, contact_person, phone, website)')
    .eq('status', 'open')
    .order('created_at', { ascending: false });
  if (error) console.error('[IRA Supabase] fetchOpenVacancies error:', error.message);
  return { data, error };
}

/**
 * Fetch all faculty profiles with joined profiles for matching
 */
export async function fetchLiveFacultyProfiles() {
  const { data, error } = await supabase
    .from('faculty_profiles')
    .select('*, profiles(full_name, email, role)');
  if (error) console.error('[IRA Supabase] fetchLiveFacultyProfiles error:', error.message);
  return { data, error };
}

/**
 * Upsert faculty profile in Supabase
 */
export async function upsertFacultyProfile(userId, { fullName, email, qualification, specialization, experienceYears, currentInstitution, location, skills, resumeUrl, phone, details }) {
  if (!userId) {
    const err = new Error('User ID required to update faculty profile');
    console.error('[IRA Supabase] upsertFacultyProfile error:', err);
    return { data: null, error: err };
  }

  // Update profile full_name if present
  if (fullName || email) {
    const { error: pErr } = await supabase.from('profiles').upsert({
      id: userId,
      full_name: fullName || '',
      email: email || '',
      role: 'faculty'
    }, { onConflict: 'id' });
    if (pErr) console.warn('[IRA Supabase] profiles upsert notice:', pErr.message);
  }

  const basePayload = {
    id: userId,
    qualification: qualification || 'PG',
    specialization: specialization || '',
    experience_years: experienceYears != null ? experienceYears : 0,
    current_institution: currentInstitution || '',
    location: location || 'Tamil Nadu',
    skills: skills || [],
    resume_url: resumeUrl || '',
    phone: phone || '',
    updated_at: new Date().toISOString()
  };

  let res;
  if (details && typeof details === 'object') {
    res = await supabase.from('faculty_profiles').upsert({
      ...basePayload,
      details
    }, { onConflict: 'id' }).select();

    // If 'details' column is not in schema cache (PGRST204), fallback gracefully to basePayload
    if (res.error && res.error.code === 'PGRST204') {
      console.warn('[IRA Supabase] details column not yet present in schema, falling back to standard columns.');
      res = await supabase.from('faculty_profiles').upsert(basePayload, { onConflict: 'id' }).select();
    }
  } else {
    res = await supabase.from('faculty_profiles').upsert(basePayload, { onConflict: 'id' }).select();
  }

  if (res.error) {
    console.error('[IRA Supabase] faculty_profiles upsert error:', res.error);
  } else {
    console.log('[IRA Supabase] faculty_profiles upsert success for:', userId);
  }
  return res;
}

/**
 * Post a new vacancy in public.vacancies
 */
export async function createVacancy(institutionId, { title, department, qualificationRequired, experienceRequired, salaryRange, location, description }) {
  if (!institutionId) {
    const err = new Error('Institution ID required to post vacancy');
    console.error('[IRA Supabase] createVacancy error:', err);
    return { data: null, error: err };
  }

  const res = await supabase.from('vacancies').insert({
    institution_id: institutionId,
    title,
    department,
    qualification_required: qualificationRequired,
    experience_required: experienceRequired,
    salary_range: salaryRange,
    location,
    description,
    status: 'open'
  }).select().single();

  if (res.error) {
    console.error('[IRA Supabase] createVacancy error:', res.error);
  } else {
    console.log('[IRA Supabase] createVacancy success:', res.data);
  }
  return res;
}

/**
 * Faculty application submission in public.applications
 */
export async function applyToVacancy({ vacancyId, facultyId, matchScore = 85 }) {
  if (!facultyId || !vacancyId) {
    const err = new Error('facultyId and vacancyId are required to apply');
    console.error('[IRA Supabase] applyToVacancy error:', err);
    return { data: null, error: err };
  }

  const res = await supabase
    .from('applications')
    .upsert({
      vacancy_id: vacancyId,
      faculty_id: facultyId,
      match_score: matchScore,
      status: 'applied'
    }, { onConflict: 'vacancy_id, faculty_id' })
    .select();

  if (res.error) {
    console.error('[IRA Supabase] applyToVacancy error:', res.error);
  } else {
    console.log('[IRA Supabase] applyToVacancy success:', res.data);
  }
  return res;
}

/**
 * Fetch faculty applications
 */
export async function fetchFacultyApplications(facultyId) {
  const { data, error } = await supabase
    .from('applications')
    .select('*, vacancies(*, institutions(institution_name, city))')
    .eq('faculty_id', facultyId);
  if (error) console.error('[IRA Supabase] fetchFacultyApplications error:', error.message);
  return { data, error };
}

/**
 * Fetch vacancies belonging to an institution
 */
export async function fetchInstitutionVacancies(institutionId) {
  const { data, error } = await supabase
    .from('vacancies')
    .select('*, applications(*, faculty_profiles(*, profiles(full_name, email, phone)))')
    .eq('institution_id', institutionId)
    .order('created_at', { ascending: false });
  if (error) console.error('[IRA Supabase] fetchInstitutionVacancies error:', error.message);
  return { data, error };
}

/**
 * Get current authenticated user
 */
export async function getAuthUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) console.warn('[IRA Supabase] getAuthUser error:', error.message);
  return { user, error };
}

/**
 * Chat messages in public.chat_messages
 */
export async function fetchChatMessages(userId) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) console.error('[IRA Supabase] fetchChatMessages error:', error.message);
  return { data, error };
}

export async function sendChatMessage({ userId, role, content }) {
  const res = await supabase
    .from('chat_messages')
    .insert({ user_id: userId, role, content })
    .select();
  if (res.error) console.error('[IRA Supabase] sendChatMessage error:', res.error);
  return res;
}

/**
 * Notifications in public.notifications
 */
export async function fetchNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) console.error('[IRA Supabase] fetchNotifications error:', error.message);
  return { data, error };
}

export async function sendNotification({ userId, type, message }) {
  const res = await supabase
    .from('notifications')
    .insert({ user_id: userId, type, message })
    .select();
  if (res.error) console.error('[IRA Supabase] sendNotification error:', res.error);
  return res;
}
