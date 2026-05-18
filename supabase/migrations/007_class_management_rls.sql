-- Migration 007: Tighten RLS for Class Management & Students
-- This migration ensures that only the OWNER of a class can modify the class settings,
-- delete the class, or kick students from the class.

-- 1. Ensure RLS is active on classes and class_students
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing less-secure policies on classes if any
DROP POLICY IF EXISTS "Guru can update their own classes" ON classes;
DROP POLICY IF EXISTS "Guru can delete their own classes" ON classes;
DROP POLICY IF EXISTS "Guru can remove students from their classes" ON class_students;

-- 3. Create STRICT Owner-only update policy for classes
CREATE POLICY "Strict: Guru can update their own classes"
ON classes
FOR UPDATE
TO authenticated
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

-- 4. Create STRICT Owner-only delete policy for classes
CREATE POLICY "Strict: Guru can delete their own classes"
ON classes
FOR DELETE
TO authenticated
USING (teacher_id = auth.uid());

-- 5. Create STRICT policy for class_students: only the class owner can remove a student
CREATE POLICY "Strict: Guru can remove students from owned classes"
ON class_students
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM classes c 
        WHERE c.id = class_students.class_id 
        AND c.teacher_id = auth.uid()
    )
);

-- 6. Students can only leave a class (delete their own record)
CREATE POLICY "Strict: Student can leave class"
ON class_students
FOR DELETE
TO authenticated
USING (student_id = auth.uid());

-- 7. Audit Logging trigger for class deletion
CREATE OR REPLACE FUNCTION audit_class_deletion()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (action, table_name, record_id, user_id, old_data)
    VALUES ('DELETE', 'classes', OLD.id, auth.uid(), row_to_json(OLD));
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_class_deletion ON classes;
CREATE TRIGGER trg_audit_class_deletion
AFTER DELETE ON classes
FOR EACH ROW EXECUTE FUNCTION audit_class_deletion();
