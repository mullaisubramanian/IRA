-- ============================================================================
-- supabase/seed.sql
-- IRA (Intelligent Recruitment Assessment) Complete Mock/Demo Data Seed
-- Inserts all Institutions, Vacancies, Faculty Profiles, Applications & Notifications
-- Wrapped in a single transaction with hard-coded UUIDs for safe, idempotent re-runs.
-- ============================================================================

BEGIN;

-- Ensure pgcrypto extension is available for crypt() password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. AUTH USERS (8 Institutions + 18 Faculty = 26 Auth Users)
-- ----------------------------------------------------------------------------

INSERT INTO auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at, raw_app_meta_data,
    raw_user_meta_data, created_at, updated_at
)
VALUES
    -- 8 Institutions
    ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'principal@psgtech.edu', crypt('Test@1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"institution","full_name":"PSG College of Technology"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'careers@kct.ac.in', crypt('Test@1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"institution","full_name":"Kumaraguru College of Technology"}', now(), now()),
    ('00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'recruitment@loyolacollege.edu', crypt('Test@1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"institution","full_name":"Loyola College"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'hr@abirami.org', crypt('Test@1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"institution","full_name":"Sree Abirami College of Physiotherapy"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'nursing@kmch.ac.in', crypt('Test@1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"institution","full_name":"KMCH College of Nursing"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000006', 'authenticated', 'authenticated', 'director@psgim.ac.in', crypt('Test@1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"institution","full_name":"PSG Institute of Management"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000007', 'authenticated', 'authenticated', 'deanmmc@tn.gov.in', crypt('Test@1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"institution","full_name":"Madras Medical College - Allied Health Sciences"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000008', 'authenticated', 'authenticated', 'principal@tce.edu', crypt('Test@1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"institution","full_name":"Thiagarajar College of Engineering"}', now(), now()),

    -- 18 Faculty Profiles
    ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'priya.raman@faculty.ira.in', crypt('Test@1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"faculty","full_name":"Dr. Priya Raman"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'karthik.subramanian@faculty.ira.in', crypt('Test@1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"faculty","full_name":"Karthik Subramanian"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'meena.lakshmi@faculty.ira.in', crypt('Test@1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"faculty","full_name":"Dr. Meena Lakshmi"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'arvind.kumar@faculty.ira.in', crypt('Test@1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"faculty","full_name":"Arvind Kumar"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'sathish.babu@faculty.ira.in', crypt('Test@1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"faculty","full_name":"Dr. Sathish Babu"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000006', 'authenticated', 'authenticated', 'divya.natarajan@faculty.ira.in', crypt('Test@1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"faculty","full_name":"Divya Natarajan"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000007', 'authenticated', 'authenticated', 'ramesh.chandran@faculty.ira.in', crypt('Test@1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"faculty","full_name":"Ramesh Chandran"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000008', 'authenticated', 'authenticated', 'anitha.joseph@faculty.ira.in', crypt('Test@1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"faculty","full_name":"Dr. Anitha Joseph"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000009', 'authenticated', 'authenticated', 'vignesh.prabhu@faculty.ira.in', crypt('Test@1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"faculty","full_name":"Vignesh Prabhu"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000010', 'authenticated', 'authenticated', 'fathima.begum@faculty.ira.in', crypt('Test@1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"faculty","full_name":"Dr. Fathima Begum"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000011', 'authenticated', 'authenticated', 'kavitha.sundaram@faculty.ira.in', crypt('Test@1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"faculty","full_name":"Dr. Kavitha Sundaram"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000012', 'authenticated', 'authenticated', 'saravanan.murugesan@faculty.ira.in', crypt('Test@1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"faculty","full_name":"Saravanan Murugesan"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000013', 'authenticated', 'authenticated', 'revathi.krishnan@faculty.ira.in', crypt('Test@1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"faculty","full_name":"Dr. Revathi Krishnan"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000014', 'authenticated', 'authenticated', 'lakshmi.priya@faculty.ira.in', crypt('Test@1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"faculty","full_name":"Lakshmi Priya"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000015', 'authenticated', 'authenticated', 'bala.murugan@faculty.ira.in', crypt('Test@1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"faculty","full_name":"Dr. Bala Murugan"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000016', 'authenticated', 'authenticated', 'joseph.antony@faculty.ira.in', crypt('Test@1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"faculty","full_name":"Dr. Joseph Antony"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000017', 'authenticated', 'authenticated', 'meenakshi.rajendran@faculty.ira.in', crypt('Test@1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"faculty","full_name":"Meenakshi Rajendran"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000018', 'authenticated', 'authenticated', 'anand.ravichandran@faculty.ira.in', crypt('Test@1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"faculty","full_name":"Dr. Anand Ravichandran"}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. AUTH IDENTITIES (Safe Block Handling GoTrue Versions)
-- ----------------------------------------------------------------------------

DO $$
BEGIN
    INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES
        ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '{"sub":"10000000-0000-0000-0000-000000000001","email":"principal@psgtech.edu"}'::jsonb, 'email', now(), now(), now()),
        ('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '{"sub":"10000000-0000-0000-0000-000000000002","email":"careers@kct.ac.in"}'::jsonb, 'email', now(), now(), now()),
        ('10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '{"sub":"10000000-0000-0000-0000-000000000003","email":"recruitment@loyolacollege.edu"}'::jsonb, 'email', now(), now(), now()),
        ('10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', '{"sub":"10000000-0000-0000-0000-000000000004","email":"hr@abirami.org"}'::jsonb, 'email', now(), now(), now()),
        ('10000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', '{"sub":"10000000-0000-0000-0000-000000000005","email":"nursing@kmch.ac.in"}'::jsonb, 'email', now(), now(), now()),
        ('10000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', '{"sub":"10000000-0000-0000-0000-000000000006","email":"director@psgim.ac.in"}'::jsonb, 'email', now(), now(), now()),
        ('10000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000007', '{"sub":"10000000-0000-0000-0000-000000000007","email":"deanmmc@tn.gov.in"}'::jsonb, 'email', now(), now(), now()),
        ('10000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000008', '{"sub":"10000000-0000-0000-0000-000000000008","email":"principal@tce.edu"}'::jsonb, 'email', now(), now(), now()),
        ('30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '{"sub":"30000000-0000-0000-0000-000000000001","email":"priya.raman@faculty.ira.in"}'::jsonb, 'email', now(), now(), now()),
        ('30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '{"sub":"30000000-0000-0000-0000-000000000002","email":"karthik.subramanian@faculty.ira.in"}'::jsonb, 'email', now(), now(), now()),
        ('30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', '{"sub":"30000000-0000-0000-0000-000000000003","email":"meena.lakshmi@faculty.ira.in"}'::jsonb, 'email', now(), now(), now()),
        ('30000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', '{"sub":"30000000-0000-0000-0000-000000000004","email":"arvind.kumar@faculty.ira.in"}'::jsonb, 'email', now(), now(), now()),
        ('30000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000005', '{"sub":"30000000-0000-0000-0000-000000000005","email":"sathish.babu@faculty.ira.in"}'::jsonb, 'email', now(), now(), now()),
        ('30000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000006', '{"sub":"30000000-0000-0000-0000-000000000006","email":"divya.natarajan@faculty.ira.in"}'::jsonb, 'email', now(), now(), now()),
        ('30000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000007', '{"sub":"30000000-0000-0000-0000-000000000007","email":"ramesh.chandran@faculty.ira.in"}'::jsonb, 'email', now(), now(), now()),
        ('30000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000008', '{"sub":"30000000-0000-0000-0000-000000000008","email":"anitha.joseph@faculty.ira.in"}'::jsonb, 'email', now(), now(), now()),
        ('30000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000009', '{"sub":"30000000-0000-0000-0000-000000000009","email":"vignesh.prabhu@faculty.ira.in"}'::jsonb, 'email', now(), now(), now()),
        ('30000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000010', '{"sub":"30000000-0000-0000-0000-000000000010","email":"fathima.begum@faculty.ira.in"}'::jsonb, 'email', now(), now(), now()),
        ('30000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000011', '{"sub":"30000000-0000-0000-0000-000000000011","email":"kavitha.sundaram@faculty.ira.in"}'::jsonb, 'email', now(), now(), now()),
        ('30000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000012', '{"sub":"30000000-0000-0000-0000-000000000012","email":"saravanan.murugesan@faculty.ira.in"}'::jsonb, 'email', now(), now(), now()),
        ('30000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000013', '{"sub":"30000000-0000-0000-0000-000000000013","email":"revathi.krishnan@faculty.ira.in"}'::jsonb, 'email', now(), now(), now()),
        ('30000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000014', '{"sub":"30000000-0000-0000-0000-000000000014","email":"lakshmi.priya@faculty.ira.in"}'::jsonb, 'email', now(), now(), now()),
        ('30000000-0000-0000-0000-000000000015', '30000000-0000-0000-0000-000000000015', '{"sub":"30000000-0000-0000-0000-000000000015","email":"bala.murugan@faculty.ira.in"}'::jsonb, 'email', now(), now(), now()),
        ('30000000-0000-0000-0000-000000000016', '30000000-0000-0000-0000-000000000016', '{"sub":"30000000-0000-0000-0000-000000000016","email":"joseph.antony@faculty.ira.in"}'::jsonb, 'email', now(), now(), now()),
        ('30000000-0000-0000-0000-000000000017', '30000000-0000-0000-0000-000000000017', '{"sub":"30000000-0000-0000-0000-000000000017","email":"meenakshi.rajendran@faculty.ira.in"}'::jsonb, 'email', now(), now(), now()),
        ('30000000-0000-0000-0000-000000000018', '30000000-0000-0000-0000-000000000018', '{"sub":"30000000-0000-0000-0000-000000000018","email":"anand.ravichandran@faculty.ira.in"}'::jsonb, 'email', now(), now(), now())
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN OTHERS THEN
    -- Fallback for environments with required provider_id
    BEGIN
        INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
        VALUES
            ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '{"sub":"10000000-0000-0000-0000-000000000001","email":"principal@psgtech.edu"}'::jsonb, 'email', '10000000-0000-0000-0000-000000000001', now(), now(), now()),
            ('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '{"sub":"10000000-0000-0000-0000-000000000002","email":"careers@kct.ac.in"}'::jsonb, 'email', '10000000-0000-0000-0000-000000000002', now(), now(), now()),
            ('10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '{"sub":"10000000-0000-0000-0000-000000000003","email":"recruitment@loyolacollege.edu"}'::jsonb, 'email', '10000000-0000-0000-0000-000000000003', now(), now(), now()),
            ('10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', '{"sub":"10000000-0000-0000-0000-000000000004","email":"hr@abirami.org"}'::jsonb, 'email', '10000000-0000-0000-0000-000000000004', now(), now(), now()),
            ('10000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', '{"sub":"10000000-0000-0000-0000-000000000005","email":"nursing@kmch.ac.in"}'::jsonb, 'email', '10000000-0000-0000-0000-000000000005', now(), now(), now()),
            ('10000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', '{"sub":"10000000-0000-0000-0000-000000000006","email":"director@psgim.ac.in"}'::jsonb, 'email', '10000000-0000-0000-0000-000000000006', now(), now(), now()),
            ('10000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000007', '{"sub":"10000000-0000-0000-0000-000000000007","email":"deanmmc@tn.gov.in"}'::jsonb, 'email', '10000000-0000-0000-0000-000000000007', now(), now(), now()),
            ('10000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000008', '{"sub":"10000000-0000-0000-0000-000000000008","email":"principal@tce.edu"}'::jsonb, 'email', '10000000-0000-0000-0000-000000000008', now(), now(), now()),
            ('30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '{"sub":"30000000-0000-0000-0000-000000000001","email":"priya.raman@faculty.ira.in"}'::jsonb, 'email', '30000000-0000-0000-0000-000000000001', now(), now(), now()),
            ('30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '{"sub":"30000000-0000-0000-0000-000000000002","email":"karthik.subramanian@faculty.ira.in"}'::jsonb, 'email', '30000000-0000-0000-0000-000000000002', now(), now(), now()),
            ('30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', '{"sub":"30000000-0000-0000-0000-000000000003","email":"meena.lakshmi@faculty.ira.in"}'::jsonb, 'email', '30000000-0000-0000-0000-000000000003', now(), now(), now()),
            ('30000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', '{"sub":"30000000-0000-0000-0000-000000000004","email":"arvind.kumar@faculty.ira.in"}'::jsonb, 'email', '30000000-0000-0000-0000-000000000004', now(), now(), now()),
            ('30000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000005', '{"sub":"30000000-0000-0000-0000-000000000005","email":"sathish.babu@faculty.ira.in"}'::jsonb, 'email', '30000000-0000-0000-0000-000000000005', now(), now(), now()),
            ('30000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000006', '{"sub":"30000000-0000-0000-0000-000000000006","email":"divya.natarajan@faculty.ira.in"}'::jsonb, 'email', '30000000-0000-0000-0000-000000000006', now(), now(), now()),
            ('30000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000007', '{"sub":"30000000-0000-0000-0000-000000000007","email":"ramesh.chandran@faculty.ira.in"}'::jsonb, 'email', '30000000-0000-0000-0000-000000000007', now(), now(), now()),
            ('30000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000008', '{"sub":"30000000-0000-0000-0000-000000000008","email":"anitha.joseph@faculty.ira.in"}'::jsonb, 'email', '30000000-0000-0000-0000-000000000008', now(), now(), now()),
            ('30000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000009', '{"sub":"30000000-0000-0000-0000-000000000009","email":"vignesh.prabhu@faculty.ira.in"}'::jsonb, 'email', '30000000-0000-0000-0000-000000000009', now(), now(), now()),
            ('30000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000010', '{"sub":"30000000-0000-0000-0000-000000000010","email":"fathima.begum@faculty.ira.in"}'::jsonb, 'email', '30000000-0000-0000-0000-000000000010', now(), now(), now()),
            ('30000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000011', '{"sub":"30000000-0000-0000-0000-000000000011","email":"kavitha.sundaram@faculty.ira.in"}'::jsonb, 'email', '30000000-0000-0000-0000-000000000011', now(), now(), now()),
            ('30000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000012', '{"sub":"30000000-0000-0000-0000-000000000012","email":"saravanan.murugesan@faculty.ira.in"}'::jsonb, 'email', '30000000-0000-0000-0000-000000000012', now(), now(), now()),
            ('30000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000013', '{"sub":"30000000-0000-0000-0000-000000000013","email":"revathi.krishnan@faculty.ira.in"}'::jsonb, 'email', '30000000-0000-0000-0000-000000000013', now(), now(), now()),
            ('30000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000014', '{"sub":"30000000-0000-0000-0000-000000000014","email":"lakshmi.priya@faculty.ira.in"}'::jsonb, 'email', '30000000-0000-0000-0000-000000000014', now(), now(), now()),
            ('30000000-0000-0000-0000-000000000015', '30000000-0000-0000-0000-000000000015', '{"sub":"30000000-0000-0000-0000-000000000015","email":"bala.murugan@faculty.ira.in"}'::jsonb, 'email', '30000000-0000-0000-0000-000000000015', now(), now(), now()),
            ('30000000-0000-0000-0000-000000000016', '30000000-0000-0000-0000-000000000016', '{"sub":"30000000-0000-0000-0000-000000000016","email":"joseph.antony@faculty.ira.in"}'::jsonb, 'email', '30000000-0000-0000-0000-000000000016', now(), now(), now()),
            ('30000000-0000-0000-0000-000000000017', '30000000-0000-0000-0000-000000000017', '{"sub":"30000000-0000-0000-0000-000000000017","email":"meenakshi.rajendran@faculty.ira.in"}'::jsonb, 'email', '30000000-0000-0000-0000-000000000017', now(), now(), now()),
            ('30000000-0000-0000-0000-000000000018', '30000000-0000-0000-0000-000000000018', '{"sub":"30000000-0000-0000-0000-000000000018","email":"anand.ravichandran@faculty.ira.in"}'::jsonb, 'email', '30000000-0000-0000-0000-000000000018', now(), now(), now())
        ON CONFLICT DO NOTHING;
    END;
END $$;

-- ----------------------------------------------------------------------------
-- 3. PUBLIC.PROFILES (Update name, email & role on conflict)
-- ----------------------------------------------------------------------------

INSERT INTO public.profiles (id, email, full_name, role, created_at)
VALUES
    -- 8 Institutions
    ('10000000-0000-0000-0000-000000000001', 'principal@psgtech.edu', 'PSG College of Technology', 'institution', now()),
    ('10000000-0000-0000-0000-000000000002', 'careers@kct.ac.in', 'Kumaraguru College of Technology', 'institution', now()),
    ('10000000-0000-0000-0000-000000000003', 'recruitment@loyolacollege.edu', 'Loyola College', 'institution', now()),
    ('10000000-0000-0000-0000-000000000004', 'hr@abirami.org', 'Sree Abirami College of Physiotherapy', 'institution', now()),
    ('10000000-0000-0000-0000-000000000005', 'nursing@kmch.ac.in', 'KMCH College of Nursing', 'institution', now()),
    ('10000000-0000-0000-0000-000000000006', 'director@psgim.ac.in', 'PSG Institute of Management', 'institution', now()),
    ('10000000-0000-0000-0000-000000000007', 'deanmmc@tn.gov.in', 'Madras Medical College - Allied Health Sciences', 'institution', now()),
    ('10000000-0000-0000-0000-000000000008', 'principal@tce.edu', 'Thiagarajar College of Engineering', 'institution', now()),

    -- 18 Faculty Profiles
    ('30000000-0000-0000-0000-000000000001', 'priya.raman@faculty.ira.in', 'Dr. Priya Raman', 'faculty', now()),
    ('30000000-0000-0000-0000-000000000002', 'karthik.subramanian@faculty.ira.in', 'Karthik Subramanian', 'faculty', now()),
    ('30000000-0000-0000-0000-000000000003', 'meena.lakshmi@faculty.ira.in', 'Dr. Meena Lakshmi', 'faculty', now()),
    ('30000000-0000-0000-0000-000000000004', 'arvind.kumar@faculty.ira.in', 'Arvind Kumar', 'faculty', now()),
    ('30000000-0000-0000-0000-000000000005', 'sathish.babu@faculty.ira.in', 'Dr. Sathish Babu', 'faculty', now()),
    ('30000000-0000-0000-0000-000000000006', 'divya.natarajan@faculty.ira.in', 'Divya Natarajan', 'faculty', now()),
    ('30000000-0000-0000-0000-000000000007', 'ramesh.chandran@faculty.ira.in', 'Ramesh Chandran', 'faculty', now()),
    ('30000000-0000-0000-0000-000000000008', 'anitha.joseph@faculty.ira.in', 'Dr. Anitha Joseph', 'faculty', now()),
    ('30000000-0000-0000-0000-000000000009', 'vignesh.prabhu@faculty.ira.in', 'Vignesh Prabhu', 'faculty', now()),
    ('30000000-0000-0000-0000-000000000010', 'fathima.begum@faculty.ira.in', 'Dr. Fathima Begum', 'faculty', now()),
    ('30000000-0000-0000-0000-000000000011', 'kavitha.sundaram@faculty.ira.in', 'Dr. Kavitha Sundaram', 'faculty', now()),
    ('30000000-0000-0000-0000-000000000012', 'saravanan.murugesan@faculty.ira.in', 'Saravanan Murugesan', 'faculty', now()),
    ('30000000-0000-0000-0000-000000000013', 'revathi.krishnan@faculty.ira.in', 'Dr. Revathi Krishnan', 'faculty', now()),
    ('30000000-0000-0000-0000-000000000014', 'lakshmi.priya@faculty.ira.in', 'Lakshmi Priya', 'faculty', now()),
    ('30000000-0000-0000-0000-000000000015', 'bala.murugan@faculty.ira.in', 'Dr. Bala Murugan', 'faculty', now()),
    ('30000000-0000-0000-0000-000000000016', 'joseph.antony@faculty.ira.in', 'Dr. Joseph Antony', 'faculty', now()),
    ('30000000-0000-0000-0000-000000000017', 'meenakshi.rajendran@faculty.ira.in', 'Meenakshi Rajendran', 'faculty', now()),
    ('30000000-0000-0000-0000-000000000018', 'anand.ravichandran@faculty.ira.in', 'Dr. Anand Ravichandran', 'faculty', now())
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

-- ----------------------------------------------------------------------------
-- 4. PUBLIC.INSTITUTIONS (8 Institutions)
-- ----------------------------------------------------------------------------

INSERT INTO public.institutions (
    id, institution_name, type, city, state, website, contact_person, phone, logo_url, verified
)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'PSG College of Technology', 'Engineering & Technology', 'Coimbatore', 'Tamil Nadu', 'https://www.psgtech.edu', 'Dr. K. Prakasan (Principal)', '+91 422 2572177', NULL, true),
    ('10000000-0000-0000-0000-000000000002', 'Kumaraguru College of Technology', 'Engineering & Technology', 'Coimbatore', 'Tamil Nadu', 'https://www.kct.ac.in', 'Dr. D. Saravanan (Principal)', '+91 422 2669401', NULL, true),
    ('10000000-0000-0000-0000-000000000003', 'Loyola College', 'Arts & Science', 'Chennai', 'Tamil Nadu', 'https://www.loyolacollege.edu', 'Rev. Dr. A. Louis Arockiaraj SJ', '+91 44 28178200', NULL, true),
    ('10000000-0000-0000-0000-000000000004', 'Sree Abirami College of Physiotherapy', 'Physiotherapy', 'Coimbatore', 'Tamil Nadu', 'https://www.abirami.org', 'Dr. P. Senthil Kumar', '+91 422 2462272', NULL, true),
    ('10000000-0000-0000-0000-000000000005', 'KMCH College of Nursing', 'Nursing', 'Coimbatore', 'Tamil Nadu', 'https://www.kmch.ac.in', 'Prof. S. Madhavi', '+91 422 4323800', NULL, true),
    ('10000000-0000-0000-0000-000000000006', 'PSG Institute of Management', 'Management (MBA/BBA)', 'Coimbatore', 'Tamil Nadu', 'https://www.psgim.ac.in', 'Director, PSG IM', '+91 422 4309300', NULL, true),
    ('10000000-0000-0000-0000-000000000007', 'Madras Medical College - Allied Health Sciences', 'Allied Health Sciences', 'Chennai', 'Tamil Nadu', 'https://www.mmc.ac.in', 'Dean, Madras Medical College', '+91 44 25305000', NULL, true),
    ('10000000-0000-0000-0000-000000000008', 'Thiagarajar College of Engineering', 'Engineering & Technology', 'Madurai', 'Tamil Nadu', 'https://www.tce.edu', 'Principal TCE', '+91 452 2482240', NULL, true)
ON CONFLICT (id) DO UPDATE
SET institution_name = EXCLUDED.institution_name,
    type = EXCLUDED.type,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    website = EXCLUDED.website,
    contact_person = EXCLUDED.contact_person,
    phone = EXCLUDED.phone,
    verified = EXCLUDED.verified;

-- ----------------------------------------------------------------------------
-- 5. PUBLIC.FACULTY_PROFILES (18 Faculty Profiles)
-- ----------------------------------------------------------------------------

INSERT INTO public.faculty_profiles (
    id, qualification, specialization, experience_years, current_institution, location, skills, resume_url, phone, updated_at
)
VALUES
    ('30000000-0000-0000-0000-000000000001', 'PhD', 'CSE, AI & DS', 8.0, 'Coimbatore Institute of Engineering', 'Coimbatore', ARRAY['Data Structures','Machine Learning','DBMS','Python Programming'], NULL, '+91 9441000001', now()),
    ('30000000-0000-0000-0000-000000000002', 'PhD (pursuing)', 'CSE, IT', 7.0, 'Madurai Institute of Technology', 'Madurai', ARRAY['Data Structures','Operating Systems','Computer Networks','DBMS','Cloud Computing'], NULL, '+91 9441000002', now()),
    ('30000000-0000-0000-0000-000000000003', 'PhD', 'CSE', 16.0, 'Chennai Engineering College', 'Chennai', ARRAY['Machine Learning','Data Structures','Compiler Design'], NULL, '+91 9441000003', now()),
    ('30000000-0000-0000-0000-000000000004', 'PG + NET/SET', 'CSE, AI & DS, AI & ML', 5.0, 'Erode Institute of Engineering', 'Erode', ARRAY['Python Programming','Machine Learning','Deep Learning'], NULL, '+91 9441000004', now()),
    ('30000000-0000-0000-0000-000000000005', 'PhD', 'Mechanical', 15.0, 'Salem College of Engineering', 'Salem', ARRAY['Thermodynamics','Heat Transfer','Fluid Mechanics'], NULL, '+91 9441000005', now()),
    ('30000000-0000-0000-0000-000000000006', 'PG + NET/SET', 'Mechanical', 6.0, 'Coimbatore Technical Institute', 'Coimbatore', ARRAY['CAD/CAM','Strength of Materials','Manufacturing Technology'], NULL, '+91 9441000006', now()),
    ('30000000-0000-0000-0000-000000000007', 'PhD', 'Mechanical', 24.0, 'Tiruchirappalli College of Technology', 'Tiruchirappalli', ARRAY['Design of Machine Elements','Kinematics of Machinery'], NULL, '+91 9441000007', now()),
    ('30000000-0000-0000-0000-000000000008', 'PhD', 'MBA, Marketing, HR', 13.0, 'Kanniyakumari Business School', 'Kanniyakumari', ARRAY['Marketing Management','Digital Marketing','Consumer Behaviour'], NULL, '+91 9441000008', now()),
    ('30000000-0000-0000-0000-000000000009', 'PG + NET/SET', 'MBA, Finance', 9.0, 'Tiruppur Institute of Management', 'Tiruppur', ARRAY['Financial Management','Investment Analysis','Accounting for Managers'], NULL, '+91 9441000009', now()),
    ('30000000-0000-0000-0000-000000000010', 'PhD', 'MBA, HR', 21.0, 'Madurai Management Academy', 'Madurai', ARRAY['Human Resource Management','Organisational Behaviour'], NULL, '+91 9441000010', now()),
    ('30000000-0000-0000-0000-000000000011', 'PhD', 'English, Science & Humanities', 9.0, 'Coimbatore Arts & Science College', 'Coimbatore', ARRAY['British Literature','Communication Skills','Linguistics','Communicative English'], NULL, '+91 9441000011', now()),
    ('30000000-0000-0000-0000-000000000012', 'PG + NET/SET', 'Commerce, Commerce (CA)', 8.0, 'Tiruppur Commerce College', 'Tiruppur', ARRAY['Financial Accounting','Cost Accounting','Income Tax','Tally & GST'], NULL, '+91 9441000012', now()),
    ('30000000-0000-0000-0000-000000000013', 'PhD', 'Computer Science, BCA', 13.0, 'Erode Arts & Science College', 'Erode', ARRAY['Python Programming','Data Structures','Web Technology','DBMS'], NULL, '+91 9441000013', now()),
    ('30000000-0000-0000-0000-000000000014', 'PG + NET/SET', 'Mathematics, Science & Humanities', 4.0, 'Coimbatore Institute of Science', 'Coimbatore', ARRAY['Linear Algebra','Probability & Statistics','Discrete Mathematics','Engineering Mathematics'], NULL, '+91 9441000014', now()),
    ('30000000-0000-0000-0000-000000000015', 'PhD', 'Commerce', 23.0, 'Madurai College of Commerce', 'Madurai', ARRAY['Financial Accounting','Business Law','Cost Accounting'], NULL, '+91 9441000015', now()),
    ('30000000-0000-0000-0000-000000000016', 'PhD', 'Pharmaceutics, Pharmacology', 14.0, 'Madurai College of Pharmacy', 'Madurai', ARRAY['Industrial Pharmacy','Biopharmaceutics','Physical Pharmaceutics'], NULL, '+91 9441000016', now()),
    ('30000000-0000-0000-0000-000000000017', 'PG', 'Medical-Surgical Nursing, Community Health Nursing', 9.0, 'Salem College of Nursing', 'Salem', ARRAY['Adult Health Nursing','Nursing Foundations','Critical Care Nursing'], NULL, '+91 9441000017', now()),
    ('30000000-0000-0000-0000-000000000018', 'PhD', 'Commerce, Commerce (CA)', 8.0, 'Coimbatore Commerce Institute', 'Coimbatore', ARRAY['Financial Accounting','Income Tax','Cost Accounting','E-Commerce'], NULL, '+91 9441000018', now())
ON CONFLICT (id) DO UPDATE
SET qualification = EXCLUDED.qualification,
    specialization = EXCLUDED.specialization,
    experience_years = EXCLUDED.experience_years,
    current_institution = EXCLUDED.current_institution,
    location = EXCLUDED.location,
    skills = EXCLUDED.skills,
    phone = EXCLUDED.phone,
    updated_at = EXCLUDED.updated_at;

-- ----------------------------------------------------------------------------
-- 6. PUBLIC.VACANCIES (8 College Vacancies)
-- ----------------------------------------------------------------------------

INSERT INTO public.vacancies (
    id, institution_id, title, department, qualification_required, experience_required,
    salary_range, location, description, status, created_at
)
VALUES
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Assistant Professor', 'CSE', 'PhD (pursuing accepted)', '3-5 years', '₹55,000 – ₹75,000 / month', 'Coimbatore, Tamil Nadu', 'Looking for enthusiastic faculty members to teach undergraduate and postgraduate Computer Science courses. Must have publications in peer-reviewed journals and willingness to mentor student technical projects, hackathons, and NBA accreditation documentation. (Openings: 2. Accommodation: Yes - Free. Transport: Yes - Free)', 'open', now()),
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Associate Professor', 'Mechanical', 'PhD', '5-10 years', '₹80,000 – ₹1,00,000 / month', 'Coimbatore, Tamil Nadu', 'Seeking an experienced Associate Professor to lead research and academic delivery in thermal engineering and smart manufacturing. Responsibilities include mentoring junior faculty, industry-sponsored research, and curriculum design. (Openings: 1. Accommodation: Yes - Paid. Transport: Yes - Free)', 'open', now()),
    ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Assistant Professor', 'Commerce', 'PG + NET/SET', '1-3 years', '₹40,000 – ₹52,000 / month', 'Chennai, Tamil Nadu', 'Required Assistant Professor for the Department of Commerce. Candidate should have cleared UGC-NET or SET and demonstrate excellent classroom presence and student mentoring skills. (Openings: 2. Accommodation: No. Transport: No)', 'open', now()),
    ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Assistant Professor', 'Physiotherapy', 'PG', '1-3 years', '₹38,000 – ₹50,000 / month', 'Coimbatore, Tamil Nadu', 'Opening for Master of Physiotherapy (MPT) graduates in Orthopaedics or Neurology. Responsibilities include clinical instruction, student clinical postings at multispeciality hospital, and academic lectures. (Openings: 2. Accommodation: Yes - Free. Transport: Yes - Free)', 'open', now()),
    ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'Assistant Professor', 'Medical-Surgical Nursing', 'PG', '3-5 years', '₹42,000 – ₹55,000 / month', 'Coimbatore, Tamil Nadu', 'Seeking M.Sc Nursing candidates registered with the Tamil Nadu Nurses and Midwives Council. Role involves classroom lectures, simulation lab training, and hospital clinical supervision. (Openings: 3. Accommodation: Yes - Free. Transport: Yes - Free)', 'open', now()),
    ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', 'Assistant Professor', 'Management (MBA/BBA)', 'PhD (pursuing accepted)', '3-5 years', '₹60,000 – ₹80,000 / month', 'Coimbatore, Tamil Nadu', 'Faculty position in MBA department for candidates with MBA + PhD/NET. Experience in case study teaching methodology, executive training, and corporate placement assistance is highly valued. (Openings: 2. Accommodation: Yes - Paid. Transport: Yes - Free)', 'open', now()),
    ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000007', 'Assistant Professor', 'Allied Health Sciences', 'PG', '2-5 years', '₹45,000 – ₹60,000 / month', 'Chennai, Tamil Nadu', 'Recruiting faculty for Allied Health Sciences programs. Hands-on laboratory training, clinical diagnostic instruction, and university curriculum delivery. (Openings: 2. Accommodation: No. Transport: No)', 'open', now()),
    ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000008', 'Assistant Professor', 'AI & DS', 'PhD (pursuing accepted)', '1-3 years', '₹50,000 – ₹65,000 / month', 'Madurai, Tamil Nadu', 'Faculty needed for the Department of Artificial Intelligence & Data Science. Strong coding background in Python and hands-on ML framework experience required. (Openings: 2. Accommodation: Yes - Paid. Transport: Yes - Free)', 'open', now())
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 7. PUBLIC.APPLICATIONS (Sample Applications Linking Faculty & Vacancies)
-- ----------------------------------------------------------------------------

INSERT INTO public.applications (
    id, vacancy_id, faculty_id, status, match_score, applied_at
)
VALUES
    ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'shortlisted', 94.0, now()),
    ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000002', 'applied', 88.0, now()),
    ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000005', 'shortlisted', 96.0, now()),
    ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000012', 'applied', 91.0, now())
ON CONFLICT (vacancy_id, faculty_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 8. PUBLIC.NOTIFICATIONS (Sample Notifications for Faculty and Institutions)
-- ----------------------------------------------------------------------------

INSERT INTO public.notifications (
    id, user_id, type, message, is_read, created_at
)
VALUES
    ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'application_shortlisted', 'PSG College of Technology shortlisted your profile for Assistant Professor in CSE.', false, now()),
    ('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'new_application', 'Dr. Priya Raman submitted an application for Assistant Professor in CSE (94% match).', true, now()),
    ('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'application_submitted', 'Your application for Assistant Professor in AI & DS at Thiagarajar College of Engineering is active.', false, now()),
    ('50000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'new_application', 'Dr. Sathish Babu submitted an application for Associate Professor in Mechanical (96% match).', true, now())
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- ----------------------------------------------------------------------------
-- 9. VERIFICATION QUERY (Record Counts)
-- ----------------------------------------------------------------------------
SELECT 'faculty' AS entity, count(*) FROM public.faculty_profiles
UNION ALL
SELECT 'institutions', count(*) FROM public.institutions
UNION ALL
SELECT 'vacancies', count(*) FROM public.vacancies
UNION ALL
SELECT 'applications', count(*) FROM public.applications
UNION ALL
SELECT 'notifications', count(*) FROM public.notifications;
