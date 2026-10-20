-- ============================================================================
-- IRA MIGRATION SCRIPT: Move Application Tables from `auth` to `public`
-- Safe, Idempotent, Non-Destructive to Supabase Auth System Objects
-- ============================================================================

-- Ensure standard search path
SET search_path = public, pg_catalog;

-- ----------------------------------------------------------------------------
-- STEP 1: IDENTIFY & MOVE APPLICATION TABLES FROM `auth` TO `public`
-- (Preserves all Supabase-managed internal auth objects)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    sys_tables TEXT[] := ARRAY[
        'users',
        'refresh_tokens',
        'instances',
        'audit_log_entries',
        'schema_migrations',
        'identities',
        'sessions',
        'mfa_factors',
        'mfa_challenges',
        'mfa_amr_claims',
        'sso_providers',
        'sso_domains',
        'saml_providers',
        'saml_relay_states',
        'flow_state',
        'one_time_tokens'
    ];
    app_tbl RECORD;
    target_exists BOOLEAN;
BEGIN
    RAISE NOTICE '--- Starting inspection of auth schema for application tables ---';
    
    FOR app_tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'auth' 
          AND table_type = 'BASE TABLE'
          AND table_name != ALL(sys_tables)
    LOOP
        RAISE NOTICE 'Found application table in auth schema: %', app_tbl.table_name;
        
        -- Check if table already exists in public
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = app_tbl.table_name
        ) INTO target_exists;
        
        IF NOT target_exists THEN
            -- Safely move table to public schema
            EXECUTE format('ALTER TABLE auth.%I SET SCHEMA public;', app_tbl.table_name);
            RAISE NOTICE 'Successfully moved auth.% to public.%', app_tbl.table_name, app_tbl.table_name;
        ELSE
            -- Merge existing data into public table if both exist
            BEGIN
                EXECUTE format('INSERT INTO public.%I SELECT * FROM auth.%I ON CONFLICT DO NOTHING;', app_tbl.table_name, app_tbl.table_name);
                EXECUTE format('DROP TABLE auth.%I CASCADE;', app_tbl.table_name);
                RAISE NOTICE 'Merged data from auth.% into public.% and cleaned up auth duplicate.', app_tbl.table_name, app_tbl.table_name;
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Notice: Could not merge auth.% automatically: %', app_tbl.table_name, SQLERRM;
            END;
        END IF;
    END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- STEP 2: ENSURE ALL APPLICATION TABLES EXIST IN `public` WITH FULL COLUMNS
-- ----------------------------------------------------------------------------

-- 1. Accounts Table (public.accounts)
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('faculty', 'institution')),
    full_name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Faculty Profiles Table (public.faculty_profiles)
CREATE TABLE IF NOT EXISTS public.faculty_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    gender TEXT,
    dob DATE,
    photo_url TEXT,
    mobile TEXT,
    linkedin_url TEXT,
    marital_status TEXT,
    spouse_name TEXT,
    has_kids BOOLEAN DEFAULT FALSE,
    kids_count INT,
    father_name TEXT,
    mother_name TEXT,
    parent_phone TEXT,
    
    current_state TEXT DEFAULT 'Tamil Nadu',
    current_district TEXT,
    willing_to_relocate BOOLEAN DEFAULT FALSE,
    preferred_districts TEXT[] DEFAULT '{}',
    preferred_stay TEXT,
    commute_mode TEXT,
    max_commute_time TEXT,
    
    preferred_domains TEXT[] DEFAULT '{}',
    departments JSONB DEFAULT '{}',
    subjects_taught JSONB DEFAULT '{}',
    target_designations TEXT[] DEFAULT '{}',
    
    exp_type TEXT,
    current_salary NUMERIC,
    salary_unit TEXT DEFAULT 'Per month',
    is_salary_negotiable BOOLEAN DEFAULT FALSE,
    expected_salary_min NUMERIC,
    expected_salary_max NUMERIC,
    notice_period TEXT,
    reason_for_change TEXT,
    
    quiz_answers JSONB DEFAULT '{}',
    trait_scores JSONB DEFAULT '{}',
    
    intro_type TEXT,
    voice_url TEXT,
    voice_duration INT,
    video_url TEXT,
    video_duration INT,
    video_link TEXT,
    resume_url TEXT,
    visibility TEXT DEFAULT 'all',
    consent_given BOOLEAN DEFAULT TRUE,
    
    step_completed INT DEFAULT 13,
    is_submitted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Faculty Education Table (public.faculty_education)
CREATE TABLE IF NOT EXISTS public.faculty_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE,
    ug_degree TEXT,
    ug_other_degree TEXT,
    ug_specialisation TEXT,
    ug_college TEXT,
    ug_year INT,
    ug_percentage TEXT,
    has_pg BOOLEAN DEFAULT FALSE,
    pg_degree TEXT,
    pg_other_degree TEXT,
    pg_specialisation TEXT,
    pg_college TEXT,
    pg_year INT,
    pg_percentage TEXT,
    has_phd BOOLEAN DEFAULT FALSE,
    phd_status TEXT,
    phd_university TEXT,
    phd_topic TEXT,
    phd_year INT,
    has_postdoc BOOLEAN DEFAULT FALSE,
    postdoc_institution TEXT,
    eligibility_tests TEXT[] DEFAULT '{}',
    certifications TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Faculty Experiences Table (public.faculty_experiences)
CREATE TABLE IF NOT EXISTS public.faculty_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE,
    category TEXT CHECK (category IN ('academic', 'industry')),
    organization_name TEXT NOT NULL,
    role_designation TEXT,
    department_domain TEXT,
    subjects_or_work TEXT,
    from_month INT,
    from_year INT NOT NULL,
    to_month INT,
    to_year INT,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Faculty Research Table (public.faculty_research)
CREATE TABLE IF NOT EXISTS public.faculty_research (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE,
    papers_count INT DEFAULT 0,
    paper_list JSONB DEFAULT '[]',
    patents_count INT DEFAULT 0,
    books_count INT DEFAULT 0,
    is_phd_guide BOOLEAN DEFAULT FALSE,
    guide_university TEXT,
    scholars_count INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Faculty Activities Table (public.faculty_activities)
CREATE TABLE IF NOT EXISTS public.faculty_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE,
    coordinator_roles TEXT[] DEFAULT '{}',
    coordinator_durations JSONB DEFAULT '{}',
    accreditation_done BOOLEAN DEFAULT FALSE,
    accreditation_bodies TEXT[] DEFAULT '{}',
    accreditation_work JSONB DEFAULT '{}',
    industry_projects JSONB DEFAULT '[]',
    startups_mentored JSONB DEFAULT '[]',
    ai_none BOOLEAN DEFAULT FALSE,
    ai_tools JSONB DEFAULT '[]',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Institutions Table (public.institutions)
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT DEFAULT 'Tamil Nadu',
    contact_person TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Vacancies Table (public.vacancies)
CREATE TABLE IF NOT EXISTS public.vacancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    department TEXT NOT NULL,
    required_subjects TEXT[] DEFAULT '{}',
    vacancy_count INT DEFAULT 1,
    min_qualification TEXT DEFAULT 'PG',
    exp_min NUMERIC DEFAULT 0,
    exp_max NUMERIC DEFAULT 0,
    salary_min NUMERIC,
    salary_max NUMERIC,
    salary_display TEXT,
    gender_preference TEXT DEFAULT 'Any',
    age_range TEXT,
    joining_timeline TEXT,
    accommodation TEXT DEFAULT 'No',
    transport TEXT DEFAULT 'No',
    desired_traits TEXT[] DEFAULT '{}',
    job_description TEXT,
    contact_person TEXT,
    contact_email TEXT,
    is_confirmed BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'open' CHECK (status IN ('draft', 'open', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Vacancy Applications Table (public.vacancy_applications)
CREATE TABLE IF NOT EXISTS public.vacancy_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vacancy_id UUID REFERENCES public.vacancies(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE,
    match_score INT,
    match_tier TEXT CHECK (match_tier IN ('best', 'similar', 'suggested')),
    status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'viewed', 'shortlisted', 'rejected', 'interview_scheduled')),
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_vac_fac UNIQUE (vacancy_id, faculty_id)
);

-- 10. Candidate Interactions Table (public.candidate_interactions)
CREATE TABLE IF NOT EXISTS public.candidate_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE,
    vacancy_id UUID REFERENCES public.vacancies(id) ON DELETE SET NULL,
    is_favourite BOOLEAN DEFAULT FALSE,
    is_interested BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT '',
    internal_notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_inst_fac UNIQUE (institution_id, faculty_id)
);

-- 11. Interviews Table (public.interviews)
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE,
    vacancy_id UUID REFERENCES public.vacancies(id) ON DELETE SET NULL,
    mode TEXT NOT NULL,
    panel_details TEXT,
    slot_1 TIMESTAMPTZ,
    slot_2 TIMESTAMPTZ,
    slot_3 TIMESTAMPTZ,
    confirmed_slot TIMESTAMPTZ,
    message TEXT,
    status TEXT DEFAULT 'Invite sent' CHECK (status IN ('Invite sent', 'Accepted', 'Rescheduled', 'Declined', 'Completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- STEP 3: CONFIGURE PERMISSIONS & ROW LEVEL SECURITY (RLS) IN `public`
-- ----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- Setup RLS policies on public tables
DO $$
DECLARE
    t TEXT;
    policy_name TEXT;
    tbls TEXT[] := ARRAY[
        'accounts',
        'faculty_profiles',
        'faculty_education',
        'faculty_experiences',
        'faculty_research',
        'faculty_activities',
        'institutions',
        'vacancies',
        'vacancy_applications',
        'candidate_interactions',
        'interviews'
    ];
BEGIN
    FOREACH t IN ARRAY tbls LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
        policy_name := 'allow_public_all_' || t;
        
        -- Drop existing policy if any to avoid collision
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', policy_name, t);
        
        -- Create permissive public policy
        EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING (true) WITH CHECK (true);', policy_name, t);
    END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- STEP 4: SEED INITIAL BASELINE DATA (SAFE: USES ON CONFLICT DO NOTHING)
-- ----------------------------------------------------------------------------

-- Institutions
INSERT INTO public.accounts (id, email, password_hash, role, full_name, phone) VALUES
('10000000-0000-0000-0000-000000000001', 'principal@psgtech.edu', 'demo123', 'institution', 'PSG College of Technology', '0422-2572177'),
('10000000-0000-0000-0000-000000000002', 'careers@kct.ac.in', 'demo123', 'institution', 'Kumaraguru College of Technology', '0422-2669401'),
('10000000-0000-0000-0000-000000000003', 'recruitment@loyolacollege.edu', 'demo123', 'institution', 'Loyola College', '044-28178200'),
('10000000-0000-0000-0000-000000000004', 'hr@abirami.org', 'demo123', 'institution', 'Sree Abirami College of Physiotherapy', '0422-2462272'),
('10000000-0000-0000-0000-000000000005', 'nursing@kmch.ac.in', 'demo123', 'institution', 'KMCH College of Nursing', '0422-2627788'),
('10000000-0000-0000-0000-000000000006', 'director@psgim.ac.in', 'demo123', 'institution', 'PSG Institute of Management', '0422-4309333'),
('10000000-0000-0000-0000-000000000007', 'deanmmc@tn.gov.in', 'demo123', 'institution', 'Madras Medical College - Allied Health Sciences', '044-25305000'),
('10000000-0000-0000-0000-000000000008', 'principal@tce.edu', 'demo123', 'institution', 'Thiagarajar College of Engineering', '0452-2482240')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.institutions (id, account_id, name, type, district, state, contact_person, contact_email, website) VALUES
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'PSG College of Technology', 'Engineering & Technology', 'Coimbatore', 'Tamil Nadu', 'Dr. K. Prakasan', 'principal@psgtech.edu', 'https://www.psgtech.edu'),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Kumaraguru College of Technology', 'Engineering & Technology', 'Coimbatore', 'Tamil Nadu', 'Dr. D. Saravanan', 'careers@kct.ac.in', 'https://www.kct.ac.in'),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Loyola College', 'Arts & Science', 'Chennai', 'Tamil Nadu', 'Rev. Dr. A. Louis Arockiaraj', 'recruitment@loyolacollege.edu', 'https://www.loyolacollege.edu'),
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Sree Abirami College of Physiotherapy', 'Physiotherapy', 'Coimbatore', 'Tamil Nadu', 'Dr. P. Senthil Kumar', 'hr@abirami.org', 'https://abirami.org'),
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'KMCH College of Nursing', 'Nursing', 'Coimbatore', 'Tamil Nadu', 'Prof. S. Madhavi', 'nursing@kmch.ac.in', 'https://kmch.ac.in'),
('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', 'PSG Institute of Management', 'Management (MBA/BBA)', 'Coimbatore', 'Tamil Nadu', 'Director, PSG IM', 'director@psgim.ac.in', 'https://psgim.ac.in'),
('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000007', 'Madras Medical College - Allied Health Sciences', 'Allied Health Sciences', 'Chennai', 'Tamil Nadu', 'Dean, MMC', 'deanmmc@tn.gov.in', 'https://mmc.tn.gov.in'),
('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000008', 'Thiagarajar College of Engineering', 'Engineering & Technology', 'Madurai', 'Tamil Nadu', 'Principal TCE', 'principal@tce.edu', 'https://www.tce.edu')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.vacancies (id, institution_id, role, department, required_subjects, vacancy_count, min_qualification, exp_min, exp_max, salary_min, salary_max, salary_display, joining_timeline, accommodation, transport, job_description, contact_person, contact_email) VALUES
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Assistant Professor', 'CSE', ARRAY['Machine Learning', 'Data Structures', 'Python Programming'], 2, 'PhD (pursuing accepted)', 3, 5, 55000, 75000, '₹55,000 – ₹75,000 / month', 'Immediate', 'Yes – Free', 'Yes – Free', 'Teaching CSE undergraduate and postgraduate courses, mentoring research and NBA accreditation.', 'Dr. K. Prakasan', 'principal@psgtech.edu'),
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Associate Professor', 'Mechanical', ARRAY['Thermodynamics', 'Heat Transfer', 'CAD/CAM'], 1, 'PhD', 5, 10, 80000, 100000, '₹80,000 – ₹1,00,000 / month', 'Within 30 days', 'Yes – Paid', 'Yes – Free', 'Lead research and academic delivery in thermal engineering and smart manufacturing.', 'Dr. D. Saravanan', 'careers@kct.ac.in'),
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'Assistant Professor', 'Commerce', ARRAY['Financial Accounting', 'Cost Accounting', 'Corporate Finance'], 2, 'PG + NET/SET', 1, 3, 40000, 52000, '₹40,000 – ₹52,000 / month', 'Within 30 days', 'No', 'No', 'Classroom lectures and student mentoring in Commerce department.', 'Rev. Dr. A. Louis Arockiaraj', 'recruitment@loyolacollege.edu'),
('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 'Assistant Professor', 'Physiotherapy', ARRAY['Orthopaedics', 'Neurology', 'Cardio-Respiratory'], 2, 'PG', 1, 3, 38000, 50000, '₹38,000 – ₹50,000 / month', 'Immediate', 'Yes – Free', 'Yes – Free', 'MPT graduates for clinical instruction and hospital postings.', 'Dr. P. Senthil Kumar', 'hr@abirami.org'),
('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', 'Assistant Professor', 'Medical-Surgical Nursing', ARRAY['Medical-Surgical Nursing', 'Critical Care Nursing'], 3, 'PG', 3, 5, 42000, 55000, '₹42,000 – ₹55,000 / month', 'Immediate', 'Yes – Free', 'Yes – Free', 'M.Sc Nursing faculty for classroom lectures and hospital clinical supervision.', 'Prof. S. Madhavi', 'nursing@kmch.ac.in'),
('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000006', 'Assistant Professor', 'Management (MBA/BBA)', ARRAY['Marketing', 'Finance', 'HR'], 2, 'PhD (pursuing accepted)', 3, 5, 60000, 80000, '₹60,000 – ₹80,000 / month', 'Within 30 days', 'Yes – Paid', 'Yes – Free', 'MBA faculty for case-study teaching, corporate placement and executive mentoring.', 'Director, PSG IM', 'director@psgim.ac.in'),
('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000007', 'Assistant Professor', 'Allied Health Sciences', ARRAY['Medical Lab Technology', 'Radiology & Imaging'], 2, 'PG', 2, 5, 45000, 60000, '₹45,000 – ₹60,000 / month', 'Immediate', 'No', 'No', 'Clinical diagnostic instruction and hands-on laboratory training.', 'Dean, MMC', 'deanmmc@tn.gov.in'),
('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000008', 'Assistant Professor', 'AI & DS', ARRAY['Machine Learning', 'Deep Learning', 'Python Programming'], 2, 'PhD (pursuing accepted)', 1, 3, 50000, 65000, '₹50,000 – ₹65,000 / month', 'Immediate', 'Yes – Paid', 'Yes – Free', 'AI & DS faculty with strong Python and machine learning hands-on background.', 'Principal TCE', 'principal@tce.edu')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- STEP 5: RELOAD POSTGREST SCHEMA CACHE
-- ----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';

-- ----------------------------------------------------------------------------
-- STEP 6: VERIFICATION SUMMARY
-- ----------------------------------------------------------------------------
SELECT 'public.accounts' AS table_name, COUNT(*) AS total_rows FROM public.accounts
UNION ALL
SELECT 'public.institutions', COUNT(*) FROM public.institutions
UNION ALL
SELECT 'public.vacancies', COUNT(*) FROM public.vacancies
UNION ALL
SELECT 'public.faculty_profiles', COUNT(*) FROM public.faculty_profiles;
