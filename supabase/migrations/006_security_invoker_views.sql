-- ========================================================
-- MIGRATION 006: Security Invoker for Views
-- Ensures views respect RLS of underlying tables
-- ========================================================

-- 1. Update admin_school_health
ALTER VIEW public.admin_school_health SET (security_invoker = true);

-- 2. Update school_class_performance
ALTER VIEW public.school_class_performance SET (security_invoker = true);

-- 3. Update teacher_work_queue
ALTER VIEW public.teacher_work_queue SET (security_invoker = true);

-- 4. Update student_dashboard_summary
ALTER VIEW public.student_dashboard_summary SET (security_invoker = true);

-- ========================================================
-- Fix for Kepala Sekolah access to teachers
-- Ensures they can only see users in their school
-- Uses security definer functions to prevent infinite recursion
-- ========================================================

CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS public.user_role AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_school_id(p_user_id UUID)
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT school_id FROM public.users WHERE id = p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP POLICY IF EXISTS "Kepsek view school users" ON public.users;
CREATE POLICY "Kepsek view school users" ON public.users
  FOR SELECT TO authenticated USING (
    school_id = public.get_user_school_id(auth.uid()) 
    AND public.get_user_role(auth.uid()) = 'kepala_sekolah'
  );

-- ========================================================
-- Fix for Admin global access
-- ========================================================
DROP POLICY IF EXISTS "Admin view all users" ON public.users;
CREATE POLICY "Admin view all users" ON public.users
  FOR ALL TO authenticated USING (
    public.get_user_role(auth.uid()) = 'admin'
  );

