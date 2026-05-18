-- ========================================================
-- MIGRATION: Multi-School Architecture
-- Adds schools, school_codes tables, kepala_sekolah role,
-- school_id FK on users/classes, and updated triggers/RLS
-- ========================================================

-- 1. Add 'kepala_sekolah' to user_role enum
DO $$ BEGIN
  ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'kepala_sekolah';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Schools table
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- 3. School codes table (each school gets a guru code + siswa code)
CREATE TABLE IF NOT EXISTS public.school_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  code VARCHAR(12) UNIQUE NOT NULL,
  role public.user_role NOT NULL CHECK (role IN ('guru', 'siswa')),
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.school_codes ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_school_codes_code ON public.school_codes(code);
CREATE INDEX IF NOT EXISTS idx_school_codes_school_id ON public.school_codes(school_id);

-- 4. Add school_id to users
DO $$ BEGIN
  ALTER TABLE public.users ADD COLUMN school_id UUID REFERENCES public.schools(id);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_school_id ON public.users(school_id);

-- 5. Add school_id to classes
DO $$ BEGIN
  ALTER TABLE public.classes ADD COLUMN school_id UUID REFERENCES public.schools(id);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_classes_school_id ON public.classes(school_id);

-- ========================================================
-- 6. Updated handle_new_user trigger
-- Now resolves school_code -> school_id + role
-- ========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
DECLARE
  v_class_id UUID;
  v_role public.user_role;
  v_school_id UUID;
  v_school_code TEXT;
  v_code_record RECORD;
BEGIN
  v_school_code := new.raw_user_meta_data->>'school_code';

  IF v_school_code IS NOT NULL AND v_school_code != '' THEN
    SELECT sc.school_id, sc.role
    INTO v_code_record
    FROM public.school_codes sc
    WHERE sc.code = v_school_code AND sc.is_active = true;

    IF v_code_record IS NOT NULL THEN
      v_school_id := v_code_record.school_id;
      v_role := v_code_record.role;
    ELSE
      v_role := 'siswa'::public.user_role;
    END IF;
  ELSE
    v_role := COALESCE(
      (new.raw_user_meta_data->>'role')::public.user_role,
      'siswa'::public.user_role
    );
  END IF;

  INSERT INTO public.users (id, email, full_name, role, school_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User Baru'),
    v_role,
    v_school_id
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    school_id = COALESCE(EXCLUDED.school_id, public.users.school_id);

  IF v_role = 'siswa' THEN
    BEGIN
      v_class_id := (new.raw_user_meta_data->>'class_id')::UUID;
    EXCEPTION WHEN OTHERS THEN
      v_class_id := NULL;
    END;

    IF v_class_id IS NOT NULL THEN
      INSERT INTO public.class_members (class_id, user_id)
      VALUES (v_class_id, new.id)
      ON CONFLICT (class_id, user_id) DO NOTHING;
    END IF;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================================
-- 7. RLS Policies
-- ========================================================

-- schools: admin can do everything, others read their own school
DROP POLICY IF EXISTS "Admin full access schools" ON public.schools;
CREATE POLICY "Admin full access schools" ON public.schools
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users view own school" ON public.schools;
CREATE POLICY "Users view own school" ON public.schools
  FOR SELECT USING (
    id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Anon view active schools" ON public.schools;
CREATE POLICY "Anon view active schools" ON public.schools
  FOR SELECT TO anon USING (is_active = true);

-- school_codes: admin full access, anon can validate codes
DROP POLICY IF EXISTS "Admin full access school_codes" ON public.school_codes;
CREATE POLICY "Admin full access school_codes" ON public.school_codes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Anon validate codes" ON public.school_codes;
CREATE POLICY "Anon validate codes" ON public.school_codes
  FOR SELECT TO anon USING (is_active = true);

DROP POLICY IF EXISTS "Auth validate codes" ON public.school_codes;
CREATE POLICY "Auth validate codes" ON public.school_codes
  FOR SELECT TO authenticated USING (is_active = true);

-- Sync user role to auth metadata
CREATE OR REPLACE FUNCTION public.sync_user_role_to_auth() RETURNS trigger AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
    || jsonb_build_object('role', new.role)
    || jsonb_build_object('school_id', new.school_id)
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_role_update ON public.users;
CREATE TRIGGER on_user_role_update
  AFTER UPDATE OF role, school_id ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_role_to_auth();

-- ========================================================
-- 8. Helper: Generate random school code
-- ========================================================
CREATE OR REPLACE FUNCTION public.generate_school_code(prefix TEXT, suffix TEXT)
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    v_code := upper(prefix) || '-' || suffix || '-' || substring(md5(random()::text) from 1 for 4);
    SELECT EXISTS(SELECT 1 FROM public.school_codes WHERE code = v_code) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN upper(v_code);
END;
$$ LANGUAGE plpgsql;
