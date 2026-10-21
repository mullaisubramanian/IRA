-- ============================================================================
-- 002_add_faculty_details.sql
-- IRA (Intelligent Recruitment Assistant) - Rich Faculty Profile Details
-- Adds JSONB column to public.faculty_profiles to store 13-step comprehensive form data
-- (conditional fields, family details, relocation preferences, research, AI skills, etc.)
-- ============================================================================

SET search_path = public, pg_catalog;

-- Add details column if not exists (backward compatible, non-breaking)
ALTER TABLE public.faculty_profiles
ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}'::jsonb;

-- Comment for database schema documentation
COMMENT ON COLUMN public.faculty_profiles.details IS 'Structured JSON containing all 13-step faculty application details, conditional sections, research publications, and assessment results';
