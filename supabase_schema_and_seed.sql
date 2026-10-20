-- ============================================================================
-- IRA (Intelligent Recruitment Assessment) Clean Supabase Setup
-- Target: Schema public (Direct execution in Supabase SQL Editor)
-- ============================================================================

-- 1. Reset any old tables in schema public
DROP TABLE IF EXISTS public.interviews CASCADE;
DROP TABLE IF EXISTS public.candidate_interactions CASCADE;
DROP TABLE IF EXISTS public.vacancy_applications CASCADE;
DROP TABLE IF EXISTS public.vacancies CASCADE;
DROP TABLE IF EXISTS public.institutions CASCADE;
DROP TABLE IF EXISTS public.faculty_activities CASCADE;
DROP TABLE IF EXISTS public.faculty_research CASCADE;
DROP TABLE IF EXISTS public.faculty_experiences CASCADE;
DROP TABLE IF EXISTS public.faculty_education CASCADE;
DROP TABLE IF EXISTS public.faculty_profiles CASCADE;
DROP TABLE IF EXISTS public.accounts CASCADE;

-- 2. Create Accounts
CREATE TABLE public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('faculty', 'institution')),
    full_name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Institutions
CREATE TABLE public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT DEFAULT 'Tamil Nadu',
    contact_person TEXT,
    contact_email TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Vacancies
CREATE TABLE public.vacancies (
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
    joining_timeline TEXT,
    accommodation TEXT DEFAULT 'No',
    transport TEXT DEFAULT 'No',
    job_description TEXT,
    contact_person TEXT,
    contact_email TEXT,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Faculty Profiles
CREATE TABLE public.faculty_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    gender TEXT,
    dob DATE,
    mobile TEXT,
    current_state TEXT DEFAULT 'Tamil Nadu',
    current_district TEXT,
    willing_to_relocate BOOLEAN DEFAULT FALSE,
    preferred_districts TEXT[] DEFAULT '{}',
    preferred_stay TEXT,
    preferred_domains TEXT[] DEFAULT '{}',
    departments JSONB DEFAULT '{}',
    subjects_taught JSONB DEFAULT '{}',
    target_designations TEXT[] DEFAULT '{}',
    current_salary NUMERIC,
    expected_salary_min NUMERIC,
    expected_salary_max NUMERIC,
    notice_period TEXT,
    trait_scores JSONB DEFAULT '{}',
    intro_type TEXT,
    marital_status TEXT,
    is_submitted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Faculty Education
CREATE TABLE public.faculty_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE,
    ug_degree TEXT,
    ug_specialisation TEXT,
    ug_college TEXT,
    ug_year INT,
    ug_percentage TEXT,
    has_pg BOOLEAN DEFAULT FALSE,
    pg_degree TEXT,
    pg_specialisation TEXT,
    pg_college TEXT,
    pg_year INT,
    has_phd BOOLEAN DEFAULT FALSE,
    phd_status TEXT,
    phd_university TEXT,
    eligibility_tests TEXT[] DEFAULT '{}'
);

-- 7. Create Faculty Experiences
CREATE TABLE public.faculty_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE,
    category TEXT CHECK (category IN ('academic', 'industry')),
    organization_name TEXT NOT NULL,
    role_designation TEXT,
    department_domain TEXT,
    from_year INT,
    to_year INT,
    is_current BOOLEAN DEFAULT FALSE
);

-- 8. Create Faculty Research
CREATE TABLE public.faculty_research (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE,
    papers_count INT DEFAULT 0,
    paper_list JSONB DEFAULT '[]',
    is_phd_guide BOOLEAN DEFAULT FALSE,
    guide_university TEXT
);

-- 9. Create Faculty Activities
CREATE TABLE public.faculty_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE,
    coordinator_roles TEXT[] DEFAULT '{}',
    accreditation_bodies TEXT[] DEFAULT '{}',
    ai_tools JSONB DEFAULT '[]'
);

-- 10. Create Vacancy Applications
CREATE TABLE public.vacancy_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vacancy_id UUID REFERENCES public.vacancies(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE,
    match_score INT,
    status TEXT DEFAULT 'applied',
    applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Create Interviews
CREATE TABLE public.interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE,
    vacancy_id UUID REFERENCES public.vacancies(id) ON DELETE SET NULL,
    mode TEXT NOT NULL,
    panel_details TEXT,
    slot_1 TIMESTAMPTZ,
    status TEXT DEFAULT 'Invite sent',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable Row Level Security so PostgREST allows immediate reads/writes
ALTER TABLE public.accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacancies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_education DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_experiences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_research DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacancy_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SEED DATA: 8 INSTITUTIONS & COLLEGE VACANCIES
-- ============================================================================

-- Institution Accounts
INSERT INTO public.accounts (id, email, password_hash, role, full_name, phone) VALUES
('10000000-0000-0000-0000-000000000001', 'principal@psgtech.edu', 'demo123', 'institution', 'PSG College of Technology', '0422-2572177'),
('10000000-0000-0000-0000-000000000002', 'careers@kct.ac.in', 'demo123', 'institution', 'Kumaraguru College of Technology', '0422-2669401'),
('10000000-0000-0000-0000-000000000003', 'recruitment@loyolacollege.edu', 'demo123', 'institution', 'Loyola College', '044-28178200'),
('10000000-0000-0000-0000-000000000004', 'hr@abirami.org', 'demo123', 'institution', 'Sree Abirami College of Physiotherapy', '0422-2462272'),
('10000000-0000-0000-0000-000000000005', 'nursing@kmch.ac.in', 'demo123', 'institution', 'KMCH College of Nursing', '0422-2627788'),
('10000000-0000-0000-0000-000000000006', 'director@psgim.ac.in', 'demo123', 'institution', 'PSG Institute of Management', '0422-4309333'),
('10000000-0000-0000-0000-000000000007', 'deanmmc@tn.gov.in', 'demo123', 'institution', 'Madras Medical College', '044-25305000'),
('10000000-0000-0000-0000-000000000008', 'principal@tce.edu', 'demo123', 'institution', 'Thiagarajar College of Engineering', '0452-2482240');

-- Institutions
INSERT INTO public.institutions (id, account_id, name, type, district, state, contact_person, contact_email) VALUES
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'PSG College of Technology', 'Engineering & Technology', 'Coimbatore', 'Tamil Nadu', 'Dr. K. Prakasan', 'principal@psgtech.edu'),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Kumaraguru College of Technology', 'Engineering & Technology', 'Coimbatore', 'Tamil Nadu', 'Dr. D. Saravanan', 'careers@kct.ac.in'),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Loyola College', 'Arts & Science', 'Chennai', 'Tamil Nadu', 'Rev. Dr. A. Louis Arockiaraj', 'recruitment@loyolacollege.edu'),
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Sree Abirami College of Physiotherapy', 'Physiotherapy', 'Coimbatore', 'Tamil Nadu', 'Dr. P. Senthil Kumar', 'hr@abirami.org'),
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'KMCH College of Nursing', 'Nursing', 'Coimbatore', 'Tamil Nadu', 'Prof. S. Madhavi', 'nursing@kmch.ac.in'),
('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', 'PSG Institute of Management', 'Management (MBA/BBA)', 'Coimbatore', 'Tamil Nadu', 'Director, PSG IM', 'director@psgim.ac.in'),
('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000007', 'Madras Medical College - Allied Health Sciences', 'Allied Health Sciences', 'Chennai', 'Tamil Nadu', 'Dean, MMC', 'deanmmc@tn.gov.in'),
('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000008', 'Thiagarajar College of Engineering', 'Engineering & Technology', 'Madurai', 'Tamil Nadu', 'Principal TCE', 'principal@tce.edu');

-- Vacancies
INSERT INTO public.vacancies (institution_id, role, department, required_subjects, vacancy_count, min_qualification, exp_min, exp_max, salary_min, salary_max, salary_display, joining_timeline, accommodation, transport, job_description, contact_person, contact_email) VALUES
('20000000-0000-0000-0000-000000000001', 'Assistant Professor', 'CSE', ARRAY['Machine Learning', 'Data Structures', 'Python Programming'], 2, 'PhD (pursuing accepted)', 3, 5, 55000, 75000, '₹55,000 – ₹75,000 / month', 'Immediate', 'Yes – Free', 'Yes – Free', 'Teaching CSE undergraduate and postgraduate courses, mentoring research and NBA accreditation.', 'Dr. K. Prakasan', 'principal@psgtech.edu'),
('20000000-0000-0000-0000-000000000002', 'Associate Professor', 'Mechanical', ARRAY['Thermodynamics', 'Heat Transfer', 'CAD/CAM'], 1, 'PhD', 5, 10, 80000, 100000, '₹80,000 – ₹1,00,000 / month', 'Within 30 days', 'Yes – Paid', 'Yes – Free', 'Lead research and academic delivery in thermal engineering and smart manufacturing.', 'Dr. D. Saravanan', 'careers@kct.ac.in'),
('20000000-0000-0000-0000-000000000003', 'Assistant Professor', 'Commerce', ARRAY['Financial Accounting', 'Cost Accounting', 'Corporate Finance'], 2, 'PG + NET/SET', 1, 3, 40000, 52000, '₹40,000 – ₹52,000 / month', 'Within 30 days', 'No', 'No', 'Classroom lectures and student mentoring in Commerce department.', 'Rev. Dr. A. Louis Arockiaraj', 'recruitment@loyolacollege.edu'),
('20000000-0000-0000-0000-000000000004', 'Assistant Professor', 'Physiotherapy', ARRAY['Orthopaedics', 'Neurology', 'Cardio-Respiratory'], 2, 'PG', 1, 3, 38000, 50000, '₹38,000 – ₹50,000 / month', 'Immediate', 'Yes – Free', 'Yes – Free', 'MPT graduates for clinical instruction and hospital postings.', 'Dr. P. Senthil Kumar', 'hr@abirami.org'),
('20000000-0000-0000-0000-000000000005', 'Assistant Professor', 'Medical-Surgical Nursing', ARRAY['Medical-Surgical Nursing', 'Critical Care Nursing'], 3, 'PG', 3, 5, 42000, 55000, '₹42,000 – ₹55,000 / month', 'Immediate', 'Yes – Free', 'Yes – Free', 'M.Sc Nursing faculty for classroom lectures and hospital clinical supervision.', 'Prof. S. Madhavi', 'nursing@kmch.ac.in'),
('20000000-0000-0000-0000-000000000006', 'Assistant Professor', 'Management (MBA/BBA)', ARRAY['Marketing', 'Finance', 'HR'], 2, 'PhD (pursuing accepted)', 3, 5, 60000, 80000, '₹60,000 – ₹80,000 / month', 'Within 30 days', 'Yes – Paid', 'Yes – Free', 'MBA faculty for case-study teaching, corporate placement and executive mentoring.', 'Director, PSG IM', 'director@psgim.ac.in'),
('20000000-0000-0000-0000-000000000007', 'Assistant Professor', 'Allied Health Sciences', ARRAY['Medical Lab Technology', 'Radiology & Imaging'], 2, 'PG', 2, 5, 45000, 60000, '₹45,000 – ₹60,000 / month', 'Immediate', 'No', 'No', 'Clinical diagnostic instruction and hands-on laboratory training.', 'Dean, MMC', 'deanmmc@tn.gov.in'),
('20000000-0000-0000-0000-000000000008', 'Assistant Professor', 'AI & DS', ARRAY['Machine Learning', 'Deep Learning', 'Python Programming'], 2, 'PhD (pursuing accepted)', 1, 3, 50000, 65000, '₹50,000 – ₹65,000 / month', 'Immediate', 'Yes – Paid', 'Yes – Free', 'AI & DS faculty with strong Python and machine learning hands-on background.', 'Principal TCE', 'principal@tce.edu');

-- ============================================================================
-- SEED DATA: 18 FACULTY CANDIDATES
-- ============================================================================

-- Faculty Accounts
INSERT INTO public.accounts (id, email, password_hash, role, full_name, phone) VALUES
('30000000-0000-0000-0000-000000000001', 'priya.raman@ira.ac.in', 'demo123', 'faculty', 'Dr. Priya Raman', '9876543201'),
('30000000-0000-0000-0000-000000000002', 'karthik.subramanian@ira.ac.in', 'demo123', 'faculty', 'Karthik Subramanian', '9876543202'),
('30000000-0000-0000-0000-000000000003', 'meena.lakshmi@ira.ac.in', 'demo123', 'faculty', 'Dr. Meena Lakshmi', '9876543203'),
('30000000-0000-0000-0000-000000000004', 'arvind.kumar@ira.ac.in', 'demo123', 'faculty', 'Arvind Kumar', '9876543204'),
('30000000-0000-0000-0000-000000000005', 'sathish.babu@ira.ac.in', 'demo123', 'faculty', 'Dr. Sathish Babu', '9876543205'),
('30000000-0000-0000-0000-000000000006', 'divya.natarajan@ira.ac.in', 'demo123', 'faculty', 'Divya Natarajan', '9876543206'),
('30000000-0000-0000-0000-000000000007', 'ramesh.chandran@ira.ac.in', 'demo123', 'faculty', 'Ramesh Chandran', '9876543207'),
('30000000-0000-0000-0000-000000000008', 'anitha.joseph@ira.ac.in', 'demo123', 'faculty', 'Dr. Anitha Joseph', '9876543208'),
('30000000-0000-0000-0000-000000000009', 'vignesh.prabhu@ira.ac.in', 'demo123', 'faculty', 'Vignesh Prabhu', '9876543209'),
('30000000-0000-0000-0000-000000000010', 'fathima.begum@ira.ac.in', 'demo123', 'faculty', 'Dr. Fathima Begum', '9876543210'),
('30000000-0000-0000-0000-000000000011', 'kavitha.sundaram@ira.ac.in', 'demo123', 'faculty', 'Dr. Kavitha Sundaram', '9876543211'),
('30000000-0000-0000-0000-000000000012', 'saravanan.murugesan@ira.ac.in', 'demo123', 'faculty', 'Saravanan Murugesan', '9876543212'),
('30000000-0000-0000-0000-000000000013', 'revathi.krishnan@ira.ac.in', 'demo123', 'faculty', 'Dr. Revathi Krishnan', '9876543213'),
('30000000-0000-0000-0000-000000000014', 'lakshmi.priya@ira.ac.in', 'demo123', 'faculty', 'Lakshmi Priya', '9876543214'),
('30000000-0000-0000-0000-000000000015', 'bala.murugan@ira.ac.in', 'demo123', 'faculty', 'Dr. Bala Murugan', '9876543215'),
('30000000-0000-0000-0000-000000000016', 'joseph.antony@ira.ac.in', 'demo123', 'faculty', 'Dr. Joseph Antony', '9876543216'),
('30000000-0000-0000-0000-000000000017', 'meenakshi.rajendran@ira.ac.in', 'demo123', 'faculty', 'Meenakshi Rajendran', '9876543217'),
('30000000-0000-0000-0000-000000000018', 'anand.ravichandran@ira.ac.in', 'demo123', 'faculty', 'Dr. Anand Ravichandran', '9876543218');

-- Faculty Profiles
INSERT INTO public.faculty_profiles (id, account_id, full_name, gender, current_district, willing_to_relocate, preferred_districts, target_designations, current_salary, notice_period, trait_scores) VALUES
('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Dr. Priya Raman', 'Female', 'Coimbatore', FALSE, ARRAY[]::TEXT[], ARRAY['Assistant Professor','Associate Professor'], 58000, '30 days', '{"CA":7,"SC":9,"IN":8,"CO":7,"OW":8,"PR":6,"RE":7}'),
('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'Karthik Subramanian', 'Male', 'Madurai', TRUE, ARRAY['Coimbatore','Chennai']::TEXT[], ARRAY['Assistant Professor'], 48000, '30 days', '{"CA":6,"SC":7,"IN":7,"CO":8,"OW":6,"PR":8,"RE":6}'),
('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 'Dr. Meena Lakshmi', 'Female', 'Chennai', FALSE, ARRAY[]::TEXT[], ARRAY['Professor','HOD'], 110000, '90 days', '{"CA":9,"SC":8,"IN":9,"CO":7,"OW":9,"PR":8,"RE":8}'),
('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', 'Arvind Kumar', 'Male', 'Erode', TRUE, ARRAY['Anywhere in Tamil Nadu']::TEXT[], ARRAY['Assistant Professor'], 42000, '15 days', '{"CA":6,"SC":8,"IN":7,"CO":8,"OW":7,"PR":5,"RE":7}'),
('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000005', 'Dr. Sathish Babu', 'Male', 'Salem', TRUE, ARRAY['Coimbatore','Erode']::TEXT[], ARRAY['Associate Professor','HOD'], 85000, '60 days', '{"CA":8,"SC":7,"IN":8,"CO":6,"OW":8,"PR":9,"RE":7}'),
('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000006', 'Divya Natarajan', 'Female', 'Coimbatore', FALSE, ARRAY[]::TEXT[], ARRAY['Assistant Professor'], 40000, '30 days', '{"CA":7,"SC":9,"IN":8,"CO":8,"OW":7,"PR":6,"RE":7}'),
('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000007', 'Ramesh Chandran', 'Male', 'Tiruchirappalli', FALSE, ARRAY[]::TEXT[], ARRAY['Professor','Principal'], 150000, '90 days', '{"CA":8,"SC":6,"IN":8,"CO":6,"OW":9,"PR":9,"RE":8}'),
('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000008', 'Dr. Anitha Joseph', 'Female', 'Kanniyakumari', TRUE, ARRAY['Coimbatore','Chennai','Bengaluru']::TEXT[], ARRAY['Assistant Professor','Associate Professor'], 65000, '30 days', '{"CA":7,"SC":8,"IN":8,"CO":9,"OW":8,"PR":7,"RE":8}'),
('40000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000009', 'Vignesh Prabhu', 'Male', 'Tiruppur', TRUE, ARRAY['Coimbatore']::TEXT[], ARRAY['Assistant Professor'], 52000, '30 days', '{"CA":7,"SC":7,"IN":7,"CO":7,"OW":8,"PR":7,"RE":8}'),
('40000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000010', 'Dr. Fathima Begum', 'Female', 'Madurai', FALSE, ARRAY[]::TEXT[], ARRAY['Professor','HOD'], 95000, '60 days', '{"CA":9,"SC":8,"IN":9,"CO":8,"OW":8,"PR":8,"RE":9}'),
('40000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000011', 'Dr. Kavitha Sundaram', 'Female', 'Coimbatore', FALSE, ARRAY[]::TEXT[], ARRAY['Assistant Professor','Associate Professor'], 55000, '30 days', '{"CA":8,"SC":9,"IN":8,"CO":8,"OW":7,"PR":7,"RE":8}'),
('40000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000012', 'Saravanan Murugesan', 'Male', 'Tiruppur', TRUE, ARRAY['Coimbatore','Erode']::TEXT[], ARRAY['Assistant Professor'], 42000, '30 days', '{"CA":7,"SC":8,"IN":7,"CO":8,"OW":8,"PR":7,"RE":7}'),
('40000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000013', 'Dr. Revathi Krishnan', 'Female', 'Erode', TRUE, ARRAY['Coimbatore','Salem']::TEXT[], ARRAY['Associate Professor','HOD'], 62000, '60 days', '{"CA":8,"SC":8,"IN":9,"CO":7,"OW":9,"PR":8,"RE":8}'),
('40000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000014', 'Lakshmi Priya', 'Female', 'Coimbatore', FALSE, ARRAY[]::TEXT[], ARRAY['Assistant Professor'], 38000, '30 days', '{"CA":7,"SC":9,"IN":8,"CO":8,"OW":7,"PR":7,"RE":7}'),
('40000000-0000-0000-0000-000000000015', '30000000-0000-0000-0000-000000000015', 'Dr. Bala Murugan', 'Male', 'Madurai', FALSE, ARRAY[]::TEXT[], ARRAY['Professor','HOD','Principal'], 92000, '90 days', '{"CA":9,"SC":7,"IN":9,"CO":7,"OW":9,"PR":8,"RE":8}'),
('40000000-0000-0000-0000-000000000016', '30000000-0000-0000-0000-000000000016', 'Dr. Joseph Antony', 'Male', 'Madurai', TRUE, ARRAY['Anywhere in Tamil Nadu']::TEXT[], ARRAY['Associate Professor','HOD'], 70000, '60 days', '{"CA":8,"SC":7,"IN":8,"CO":7,"OW":8,"PR":9,"RE":8}'),
('40000000-0000-0000-0000-000000000017', '30000000-0000-0000-0000-000000000017', 'Meenakshi Rajendran', 'Female', 'Salem', TRUE, ARRAY['Coimbatore','Namakkal']::TEXT[], ARRAY['Assistant Professor'], 45000, '30 days', '{"CA":8,"SC":9,"IN":8,"CO":8,"OW":8,"PR":8,"RE":9}'),
('40000000-0000-0000-0000-000000000018', '30000000-0000-0000-0000-000000000018', 'Dr. Anand Ravichandran', 'Male', 'Coimbatore', FALSE, ARRAY[]::TEXT[], ARRAY['Assistant Professor','Associate Professor'], 56000, '30 days', '{"CA":8,"SC":8,"IN":8,"CO":8,"OW":8,"PR":7,"RE":8}');

-- Faculty Education
INSERT INTO public.faculty_education (faculty_id, ug_degree, ug_specialisation, ug_college, ug_year, ug_percentage, has_pg, pg_degree, pg_specialisation, has_phd, phd_status, phd_university, eligibility_tests) VALUES
('40000000-0000-0000-0000-000000000001', 'B.E', 'Computer Science', 'Anna University', 2011, '84%', TRUE, 'M.E', 'Computer Science', TRUE, 'Completed', 'Anna University', ARRAY['GATE']),
('40000000-0000-0000-0000-000000000002', 'B.Tech', 'IT', 'Madurai Kamaraj University', 2014, '80%', TRUE, 'M.Tech', 'IT', TRUE, 'Pursuing', 'Anna University', ARRAY['GATE']),
('40000000-0000-0000-0000-000000000003', 'B.E', 'Computer Science', 'University of Madras', 2003, '88%', TRUE, 'M.E', 'Computer Science', TRUE, 'Completed', 'Anna University', ARRAY['GATE']),
('40000000-0000-0000-0000-000000000004', 'B.E', 'CSE', 'Bharathiar University', 2016, '81%', TRUE, 'M.E', 'AI & DS', FALSE, 'Not applicable', '', ARRAY['UGC-NET','SET']),
('40000000-0000-0000-0000-000000000005', 'B.E', 'Mechanical', 'Anna University', 2006, '82%', TRUE, 'M.E', 'Thermal Engg', TRUE, 'Completed', 'NIT Trichy', ARRAY['GATE']),
('40000000-0000-0000-0000-000000000006', 'B.E', 'Mechanical', 'Anna University', 2015, '79%', TRUE, 'M.E', 'CAD/CAM', FALSE, 'Not applicable', '', ARRAY['UGC-NET','SET']),
('40000000-0000-0000-0000-000000000007', 'B.E', 'Mechanical', 'Bharathidasan University', 1998, '86%', TRUE, 'M.E', 'Design', TRUE, 'Completed', 'IIT Madras', ARRAY['GATE']),
('40000000-0000-0000-0000-000000000008', 'BBA', 'Management', 'Manonmaniam Sundaranar Univ', 2009, '83%', TRUE, 'MBA', 'Marketing & HR', TRUE, 'Completed', 'Bharathiar University', ARRAY['UGC-NET']),
('40000000-0000-0000-0000-000000000009', 'B.Com', 'Finance', 'Bharathiar University', 2012, '80%', TRUE, 'MBA', 'Finance', FALSE, 'Not applicable', '', ARRAY['UGC-NET','SET']),
('40000000-0000-0000-0000-000000000010', 'B.Com', 'Commerce', 'Madurai Kamaraj University', 2000, '85%', TRUE, 'MBA', 'Human Resources', TRUE, 'Completed', 'MKU', ARRAY['UGC-NET']),
('40000000-0000-0000-0000-000000000011', 'B.A', 'English', 'Bharathiar University', 2007, '82%', TRUE, 'M.A', 'English Literature', TRUE, 'Completed', 'Bharathiar University', ARRAY['UGC-NET','SET']),
('40000000-0000-0000-0000-000000000012', 'B.Com', 'Corporate Secretaryship', 'Bharathiar University', 2013, '81%', TRUE, 'M.Com', 'Commerce', FALSE, 'Not applicable', '', ARRAY['SET']),
('40000000-0000-0000-0000-000000000013', 'BCA', 'Computer Applications', 'Bharathiar University', 2005, '85%', TRUE, 'MCA', 'Computer Applications', TRUE, 'Completed', 'Anna University', ARRAY['UGC-NET']),
('40000000-0000-0000-0000-000000000014', 'B.Sc', 'Mathematics', 'Bharathiar University', 2016, '89%', TRUE, 'M.Sc', 'Mathematics', FALSE, 'Not applicable', '', ARRAY['UGC-NET','SET']),
('40000000-0000-0000-0000-000000000015', 'B.Com', 'Commerce', 'Madurai Kamaraj University', 1997, '84%', TRUE, 'M.Com', 'Commerce', TRUE, 'Completed', 'Madurai Kamaraj University', ARRAY['UGC-NET']),
('40000000-0000-0000-0000-000000000016', 'B.Pharm', 'Pharmacy', 'Dr. MGR Medical University', 2004, '83%', TRUE, 'M.Pharm', 'Pharmaceutics', TRUE, 'Completed', 'Dr. MGR Medical University', ARRAY['GATE']),
('40000000-0000-0000-0000-000000000017', 'B.Sc Nursing', 'Nursing', 'Dr. MGR Medical University', 2010, '82%', TRUE, 'M.Sc Nursing', 'Medical Surgical', FALSE, 'Not applicable', '', ARRAY[]::TEXT[]),
('40000000-0000-0000-0000-000000000018', 'B.Com (CA)', 'Commerce', 'Bharathiar University', 2008, '86%', TRUE, 'M.Com', 'Commerce & Finance', TRUE, 'Completed', 'Bharathiar University', ARRAY['UGC-NET','SET']);

-- Reload schema cache in PostgREST
NOTIFY pgrst, 'reload schema';

-- Verification
SELECT 'Accounts in public' AS entity, COUNT(*) FROM public.accounts
UNION ALL
SELECT 'Institutions in public', COUNT(*) FROM public.institutions
UNION ALL
SELECT 'Vacancies in public', COUNT(*) FROM public.vacancies
UNION ALL
SELECT 'Faculty Profiles in public', COUNT(*) FROM public.faculty_profiles;
