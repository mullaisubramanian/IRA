# Database Schema & Migration Report: `auth` to `public`

## 1. Executive Summary
This report documents the architectural analysis and migration of all application-specific tables from the Supabase `auth` schema into the `public` schema for the **IRA (Intelligent Recruitment Assessment)** platform.

All Supabase system-managed internal authentication objects (e.g., `auth.users`, `auth.refresh_tokens`, `auth.sessions`, etc.) have been strictly protected and left untouched to ensure that Supabase's Auth service continues to function normally. All custom application objects are now consolidated and targeted exclusively under `public`.

---

## 2. Database Inspection & Separation Analysis

### 2.1 Protected Supabase Internal Objects (MUST NOT BE MOVED)
The following internal objects in schema `auth` are managed by Supabase GoTrue / Auth engine:
- `auth.users`
- `auth.refresh_tokens`
- `auth.instances`
- `auth.audit_log_entries`
- `auth.schema_migrations`
- `auth.identities`
- `auth.sessions`
- `auth.mfa_factors`
- `auth.mfa_challenges`
- `auth.mfa_amr_claims`
- `auth.sso_providers`
- `auth.sso_domains`
- `auth.saml_providers`
- `auth.saml_relay_states`
- `auth.flow_state`
- `auth.one_time_tokens`

*Action*: **Zero modifications, no deletion, and no schema transfer.**

### 2.2 Application Tables Migrated to `public` Schema
The following application tables, columns, constraints, and relationships are migrated and ensured under `public`:

| Table Name | Primary Key | Foreign Keys / Dependencies | Description |
| :--- | :--- | :--- | :--- |
| **`public.accounts`** | `id` (UUID) | None | Application accounts (faculty & institutions), email uniqueness, credentials |
| **`public.institutions`** | `id` (UUID) | `account_id -> public.accounts(id)` | College name, type, district, contact person, email |
| **`public.vacancies`** | `id` (UUID) | `institution_id -> public.institutions(id)` | College faculty job vacancies, full JDs, subjects, qualifications, salary ranges |
| **`public.faculty_profiles`** | `id` (UUID) | `account_id -> public.accounts(id)` | Personal info, Tamil Nadu relocation, domains, salary, traits, media |
| **`public.faculty_education`** | `id` (UUID) | `faculty_id -> public.faculty_profiles(id)` | UG details, PG completion gate (`has_pg`), Doctorate gate (`has_phd`) |
| **`public.faculty_experiences`**| `id` (UUID) | `faculty_id -> public.faculty_profiles(id)` | Academic teaching and industry experience rows |
| **`public.faculty_research`** | `id` (UUID) | `faculty_id -> public.faculty_profiles(id)` | Publications count, Scopus papers, patents, books, Ph.D. guideship |
| **`public.faculty_activities`** | `id` (UUID) | `faculty_id -> public.faculty_profiles(id)` | Coordinator roles, accreditations (NAAC/NBA), AI tool proficiencies |
| **`public.vacancy_applications`**| `id` (UUID) | `vacancy_id -> vacancies(id)`, `faculty_id -> faculty_profiles(id)` | Direct applications submitted by faculty via "Apply with IRA Profile" |
| **`public.candidate_interactions`**| `id` (UUID) | `institution_id -> institutions(id)`, `faculty_id -> faculty_profiles(id)` | Shortlists, bookmarks, and status notes by college hiring teams |
| **`public.interviews`** | `id` (UUID) | `institution_id -> institutions(id)`, `faculty_id -> faculty_profiles(id)` | Scheduled interview slots, interview mode, status |

---

## 3. Migration Execution & Safety Measures

### 3.1 Idempotency & Safety
The migration script is written to be executed safely and repeatedly:
1. **Dynamic Detection**: Inspects `information_schema.tables` in schema `auth`. If any application table exists, it alters its schema to `public`.
2. **Conflict Resolution**: If a table already exists in `public`, existing rows are preserved via `INSERT INTO public.<table_name> ... ON CONFLICT DO NOTHING`.
3. **Data Integrity**: Foreign keys use `ON DELETE CASCADE` or `ON DELETE SET NULL` as appropriate, maintaining referential integrity.
4. **Cache Invalidation**: Triggers `NOTIFY pgrst, 'reload schema';` so that PostgREST and the Supabase Table Editor refresh immediately.

### 3.2 Security & Row Level Security (RLS)
- `GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;`
- `GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;`
- Enabled Row Level Security on all 11 tables with explicit policies:
  ```sql
  CREATE POLICY allow_public_all_<table_name> ON public.<table_name> FOR ALL USING (true) WITH CHECK (true);
  ```

---

## 4. Codebase Reference Verification

All code files within the project were audited to ensure they reference `public` tables:
1. **[src/core/supabase.js](file:///Users/mullaisubramaniyan/Documents/IRA/src/core/supabase.js)**:
   - Queries `supabase.from('accounts')`, `supabase.from('vacancies')`, `supabase.from('vacancy_applications')`.
   - Verified that all queries target `public` by default.
2. **[.env](file:///Users/mullaisubramaniyan/Documents/IRA/.env)**:
   - Configured with project endpoint: `https://vlgviaijtzrxufbzvzps.supabase.co`
   - Configured with publishable key: `sb_publishable_dcta-ibySlmWcszgWE_b1w_NFX7uLUU`
3. **[src/views/facultyDone.js](file:///Users/mullaisubramaniyan/Documents/IRA/src/views/facultyDone.js)** & **[src/app/events.js](file:///Users/mullaisubramaniyan/Documents/IRA/src/app/events.js)**:
   - Direct integration with `submitVacancyApplication()` and live college vacancies.

---

## 5. Migration Artifacts

The following migration scripts have been created:
1. **[supabase_migration_auth_to_public.sql](file:///Users/mullaisubramaniyan/Documents/IRA/supabase_migration_auth_to_public.sql)**: Complete migration script that transfers application tables from `auth` to `public`, establishes schemas, grants, RLS policies, and populates existing demo data.
2. **[supabase_schema_and_seed.sql](file:///Users/mullaisubramaniyan/Documents/IRA/supabase_schema_and_seed.sql)**: Direct public schema definition and pre-loaded dataset (18 faculty, 8 colleges).
