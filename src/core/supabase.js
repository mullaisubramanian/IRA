import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) || 'https://vlgviaijtzrxufbzvzps.supabase.co';
export const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || 'sb_publishable_dcta-ibySlmWcszgWE_b1w_NFX7uLUU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Test connectivity to public schema tables
 */
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('vacancies').select('id, title, status').limit(1);
    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        return { connected: true, tablesReady: false, message: 'Connected to Supabase. Execute 001_init.sql in SQL Editor to create public tables.' };
      }
      return { connected: false, tablesReady: false, error: error.message };
    }
    return { connected: true, tablesReady: true, count: data ? data.length : 0 };
  } catch (err) {
    return { connected: false, tablesReady: false, error: err.message };
  }
}

/**
 * Sign up user with metadata passed to auth trigger (which populates public.profiles)
 */
export async function signUpUser({ email, password, role = 'faculty', fullName = '', phone = '', institutionName = '' }) {
  return await supabase.auth.signUp({
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
}

/**
 * Sign in user
 */
export async function signInUser(email, password) {
  return await supabase.auth.signInWithPassword({ email, password });
}

/**
 * Fetch current user's profile from public.profiles
 */
export async function fetchCurrentProfile(userId) {
  return await supabase
    .from('profiles')
    .select('*, faculty_profiles(*), institutions(*)')
    .eq('id', userId)
    .single();
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
  return { data, error };
}

/**
 * Fetch all faculty profiles with joined profiles for matching
 */
export async function fetchLiveFacultyProfiles() {
  const { data, error } = await supabase
    .from('faculty_profiles')
    .select('*, profiles(full_name, email, role)');
  return { data, error };
}

/**
 * Upsert faculty profile in Supabase
 */
export async function upsertFacultyProfile(userId, { fullName, email, qualification, specialization, experienceYears, location, skills, phone }) {
  if (userId) {
    if (fullName || email) {
      await supabase.from('profiles').upsert({
        id: userId,
        full_name: fullName || '',
        email: email || '',
        role: 'faculty'
      }, { onConflict: 'id' });
    }
    return await supabase.from('faculty_profiles').upsert({
      id: userId,
      qualification: qualification || 'PG',
      specialization: specialization || '',
      experience_years: experienceYears || 0,
      location: location || 'Tamil Nadu',
      skills: skills || [],
      phone: phone || '',
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
  }
  return { data: null, error: new Error('User ID required') };
}

/**
 * Post a new vacancy in public.vacancies
 */
export async function createVacancy(institutionId, { title, department, qualificationRequired, experienceRequired, salaryRange, location, description }) {
  return await supabase.from('vacancies').insert({
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
}

/**
 * Faculty application submission in public.applications
 */
export async function applyToVacancy({ vacancyId, facultyId, matchScore = 85 }) {
  return await supabase
    .from('applications')
    .upsert({
      vacancy_id: vacancyId,
      faculty_id: facultyId,
      match_score: matchScore,
      status: 'applied'
    }, { onConflict: 'vacancy_id, faculty_id' });
}

/**
 * Fetch faculty applications
 */
export async function fetchFacultyApplications(facultyId) {
  return await supabase
    .from('applications')
    .select('*, vacancies(*, institutions(institution_name, city))')
    .eq('faculty_id', facultyId);
}

/**
 * Fetch vacancies belonging to an institution
 */
export async function fetchInstitutionVacancies(institutionId) {
  return await supabase
    .from('vacancies')
    .select('*, applications(*, faculty_profiles(*, profiles(full_name, email)))')
    .eq('institution_id', institutionId)
    .order('created_at', { ascending: false });
}

/**
 * Get current authenticated user
 */
export async function getAuthUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

/**
 * Chat messages in public.chat_messages
 */
export async function fetchChatMessages(userId) {
  return await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
}

export async function sendChatMessage({ userId, role, content }) {
  return await supabase
    .from('chat_messages')
    .insert({ user_id: userId, role, content });
}

/**
 * Notifications in public.notifications
 */
export async function fetchNotifications(userId) {
  return await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}
