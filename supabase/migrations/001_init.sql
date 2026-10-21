-- ============================================================================
-- 001_init.sql
-- IRA (Intelligent Recruitment Assistant) Database Initialization
-- All tables created in schema: public and linked to auth.users
-- ============================================================================

-- Ensure active search path is public
SET search_path = public, pg_catalog;

-- Enable UUID generation if not already available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. PUBLIC SCHEMA TABLES
-- ----------------------------------------------------------------------------

-- 1.1 Profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('faculty', 'institution', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 Faculty Profiles
CREATE TABLE IF NOT EXISTS public.faculty_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    qualification TEXT,
    specialization TEXT,
    experience_years NUMERIC DEFAULT 0,
    current_institution TEXT,
    location TEXT,
    skills TEXT[] DEFAULT '{}',
    resume_url TEXT,
    phone TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 Institutions
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    institution_name TEXT NOT NULL,
    type TEXT,
    city TEXT,
    state TEXT DEFAULT 'Tamil Nadu',
    website TEXT,
    contact_person TEXT,
    phone TEXT,
    logo_url TEXT,
    verified BOOLEAN DEFAULT FALSE
);

-- 1.4 Vacancies
CREATE TABLE IF NOT EXISTS public.vacancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    qualification_required TEXT,
    experience_required TEXT,
    salary_range TEXT,
    location TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5 Applications
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vacancy_id UUID NOT NULL REFERENCES public.vacancies(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES public.faculty_profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'rejected', 'hired')),
    match_score NUMERIC,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_vacancy_faculty UNIQUE (vacancy_id, faculty_id)
);

-- 1.6 Chat Messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.7 Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. TRIGGER FUNCTION: AUTO-INSERT INTO public.profiles ON auth.users INSERT
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        CASE 
            WHEN NEW.raw_user_meta_data->>'role' IN ('faculty', 'institution', 'admin') 
            THEN NEW.raw_user_meta_data->>'role'
            ELSE 'faculty'
        END
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;

    -- Automatically initialize role sub-profile
    IF COALESCE(NEW.raw_user_meta_data->>'role', 'faculty') = 'faculty' THEN
        INSERT INTO public.faculty_profiles (id, phone)
        VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'phone', ''))
        ON CONFLICT (id) DO NOTHING;
    ELSIF COALESCE(NEW.raw_user_meta_data->>'role', 'faculty') = 'institution' THEN
        INSERT INTO public.institutions (id, institution_name, type, city, contact_person, phone)
        VALUES (
            NEW.id, 
            COALESCE(NEW.raw_user_meta_data->>'institution_name', COALESCE(NEW.raw_user_meta_data->>'full_name', 'College')),
            COALESCE(NEW.raw_user_meta_data->>'type', 'Engineering & Technology'),
            COALESCE(NEW.raw_user_meta_data->>'city', 'Coimbatore'),
            COALESCE(NEW.raw_user_meta_data->>'contact_person', COALESCE(NEW.raw_user_meta_data->>'full_name', '')),
            COALESCE(NEW.raw_user_meta_data->>'phone', '')
        )
        ON CONFLICT (id) DO UPDATE
        SET institution_name = EXCLUDED.institution_name,
            type = COALESCE(EXCLUDED.type, public.institutions.type),
            city = COALESCE(EXCLUDED.city, public.institutions.city),
            contact_person = COALESCE(EXCLUDED.contact_person, public.institutions.contact_person),
            phone = COALESCE(EXCLUDED.phone, public.institutions.phone);
    END IF;

    RETURN NEW;
END;
$$;

-- Drop and re-create trigger safely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 3. PERMISSIONS & ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------

-- Grant schema usage and object access to standard roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- Enable RLS on all 7 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3.1 Policies for profiles
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles
    FOR SELECT TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 3.2 Policies for faculty_profiles
DROP POLICY IF EXISTS "faculty_profiles_select" ON public.faculty_profiles;
CREATE POLICY "faculty_profiles_select" ON public.faculty_profiles
    FOR SELECT TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "faculty_profiles_insert_own" ON public.faculty_profiles;
CREATE POLICY "faculty_profiles_insert_own" ON public.faculty_profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "faculty_profiles_update_own" ON public.faculty_profiles;
CREATE POLICY "faculty_profiles_update_own" ON public.faculty_profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 3.3 Policies for institutions
DROP POLICY IF EXISTS "institutions_select_all" ON public.institutions;
CREATE POLICY "institutions_select_all" ON public.institutions
    FOR SELECT TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "institutions_insert_own" ON public.institutions;
CREATE POLICY "institutions_insert_own" ON public.institutions
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "institutions_update_own" ON public.institutions;
CREATE POLICY "institutions_update_own" ON public.institutions
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 3.4 Policies for vacancies
-- Anyone signed in can read open vacancies; only the owning institution can insert/update/delete its vacancies
DROP POLICY IF EXISTS "vacancies_select_open" ON public.vacancies;
CREATE POLICY "vacancies_select_open" ON public.vacancies
    FOR SELECT TO authenticated, anon
    USING (status = 'open' OR auth.uid() = institution_id);

DROP POLICY IF EXISTS "vacancies_insert_owner" ON public.vacancies;
CREATE POLICY "vacancies_insert_owner" ON public.vacancies
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = institution_id);

DROP POLICY IF EXISTS "vacancies_update_owner" ON public.vacancies;
CREATE POLICY "vacancies_update_owner" ON public.vacancies
    FOR UPDATE TO authenticated
    USING (auth.uid() = institution_id)
    WITH CHECK (auth.uid() = institution_id);

DROP POLICY IF EXISTS "vacancies_delete_owner" ON public.vacancies;
CREATE POLICY "vacancies_delete_owner" ON public.vacancies
    FOR DELETE TO authenticated
    USING (auth.uid() = institution_id);

-- 3.5 Policies for applications
-- Faculty can insert/read their own applications; institutions can read and update applications for their own vacancies
DROP POLICY IF EXISTS "applications_select_parties" ON public.applications;
CREATE POLICY "applications_select_parties" ON public.applications
    FOR SELECT TO authenticated
    USING (
        auth.uid() = faculty_id OR 
        EXISTS (
            SELECT 1 FROM public.vacancies v 
            WHERE v.id = applications.vacancy_id AND v.institution_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "applications_insert_faculty" ON public.applications;
CREATE POLICY "applications_insert_faculty" ON public.applications
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = faculty_id);

DROP POLICY IF EXISTS "applications_update_parties" ON public.applications;
CREATE POLICY "applications_update_parties" ON public.applications
    FOR UPDATE TO authenticated
    USING (
        auth.uid() = faculty_id OR 
        EXISTS (
            SELECT 1 FROM public.vacancies v 
            WHERE v.id = applications.vacancy_id AND v.institution_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.uid() = faculty_id OR 
        EXISTS (
            SELECT 1 FROM public.vacancies v 
            WHERE v.id = applications.vacancy_id AND v.institution_id = auth.uid()
        )
    );

-- 3.6 Policies for chat_messages
-- Users can read/write only their own chat_messages
DROP POLICY IF EXISTS "chat_messages_select_own" ON public.chat_messages;
CREATE POLICY "chat_messages_select_own" ON public.chat_messages
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "chat_messages_insert_own" ON public.chat_messages;
CREATE POLICY "chat_messages_insert_own" ON public.chat_messages
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "chat_messages_update_own" ON public.chat_messages;
CREATE POLICY "chat_messages_update_own" ON public.chat_messages
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "chat_messages_delete_own" ON public.chat_messages;
CREATE POLICY "chat_messages_delete_own" ON public.chat_messages
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- 3.7 Policies for notifications
-- Users can read/write only their own notifications
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert_own" ON public.notifications;
CREATE POLICY "notifications_insert_own" ON public.notifications
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
CREATE POLICY "notifications_delete_own" ON public.notifications
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 4. RELOAD POSTGREST SCHEMA CACHE
-- ----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
