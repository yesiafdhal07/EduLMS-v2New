import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const filesToCombine = [
  // Base & Features (Idempotent)
  'UNIFIED_MASTER_SCRIPT.sql',
  'FEATURES_SCHEMA.sql',
  'gamification_schema.sql',
  'time_capsule_schema.sql',
  'soft_delete_setup.sql',
  
  // Fixes
  'fix_analytics_final.sql',
  'fix_analytics_realtime.sql',
  'fix_manual_grades_rls.sql',
  'fix_registration_and_enrollment.sql',
  'fix_rls_final.sql',
  'fix_teacher_account.sql',
  'soft_delete_visibility_fix.sql',

  // Sprint B-E Migrations (011 - 013)
  'supabase/migrations/011_semester_snapshots.sql',
  'supabase/migrations/012_ptm_and_wa_log.sql',
  'supabase/migrations/013_kas_kelas.sql'
];

let combinedSql = `-- ============================================================
-- KLOLAKELAS — ALL-IN-ONE MASTER MIGRATION
-- Menggabungkan semua schema, fitur, fix, dan migration terakhir
-- Script ini IDEMPOTENT (Aman dijalankan berkali-kali)
-- ============================================================\n\n`;

for (const file of filesToCombine) {
  const fullPath = join(ROOT, file);
  if (existsSync(fullPath)) {
    combinedSql += `\n-- ------------------------------------------------------------\n`;
    combinedSql += `-- SOURCE: ${file}\n`;
    combinedSql += `-- ------------------------------------------------------------\n\n`;
    combinedSql += readFileSync(fullPath, 'utf8') + '\n\n';
  }
}

const outputPath = join(ROOT, 'ALL_IN_ONE_MIGRATION.sql');
writeFileSync(outputPath, combinedSql);
console.log('✅ Berhasil membuat ALL_IN_ONE_MIGRATION.sql');
