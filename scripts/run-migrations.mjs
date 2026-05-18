/**
 * run-migrations.mjs
 * 
 * Menjalankan semua SQL migration yang BELUM ada di Supabase
 * menggunakan Supabase Management API + service_role key
 * 
 * Usage: node scripts/run-migrations.mjs
 * 
 * Env yang dibutuhkan (baca dari .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (buka di Supabase Dashboard > Settings > API)
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Load .env.local manually ─────────────────────────────────
function loadEnv() {
  const envPath = join(ROOT, '.env.local');
  if (!existsSync(envPath)) throw new Error('.env.local not found');
  const lines = readFileSync(envPath, 'utf8').split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    env[key] = val;
  }
  return env;
}

// ── Execute SQL via Supabase REST API ─────────────────────────
async function runSQL(supabaseUrl, serviceRoleKey, sql) {
  const url = `${supabaseUrl}/rest/v1/rpc/exec_sql`;
  
  // Try via pg endpoint (requires service role)
  const response = await fetch(`${supabaseUrl}/pg`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!response.ok) {
    // Fallback: use postgres endpoint via Supabase CLI style
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

// ── Read SQL file ─────────────────────────────────────────────
function readSql(filename) {
  const fullPath = join(ROOT, filename);
  if (!existsSync(fullPath)) {
    console.warn(`  ⚠️  File not found: ${filename}`);
    return null;
  }
  return readFileSync(fullPath, 'utf8');
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  const env = loadEnv();
  const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'];
  const SERVICE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'];

  if (!SUPABASE_URL) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL tidak ditemukan di .env.local');
    process.exit(1);
  }

  if (!SERVICE_KEY) {
    console.error(`
❌ SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env.local

Cara mendapatkan key:
1. Buka https://supabase.com/dashboard/project/mjoqlbdvgsclfmhjugvc/settings/api
2. Scroll ke bagian "Project API Keys"
3. Copy "service_role" key
4. Tambahkan ke .env.local:
   SUPABASE_SERVICE_ROLE_KEY=eyJ...

Kemudian jalankan ulang: node scripts/run-migrations.mjs
`);
    process.exit(1);
  }

  console.log('🔗 Connecting to Supabase:', SUPABASE_URL);
  console.log('');

  // Migration files to run in order
  const migrations = [
    { name: 'Migration 011 — Semester Snapshots', file: 'supabase/migrations/011_semester_snapshots.sql' },
    { name: 'Migration 012 — PTM & WA Log', file: 'supabase/migrations/012_ptm_and_wa_log.sql' },
    { name: 'Migration 013 — Kas Kelas', file: 'supabase/migrations/013_kas_kelas.sql' },
  ];

  let ok = 0, failed = 0;

  for (const m of migrations) {
    const sql = readSql(m.file);
    if (!sql) { failed++; continue; }

    process.stdout.write(`⏳ Running: ${m.name}...`);
    try {
      await runSQL(SUPABASE_URL, SERVICE_KEY, sql);
      console.log(` ✅`);
      ok++;
    } catch (err) {
      console.log(` ❌`);
      console.error(`   Error: ${err.message}`);
      failed++;
    }
  }

  console.log('');
  console.log(`✅ ${ok} berhasil, ❌ ${failed} gagal`);

  if (failed > 0) {
    console.log('\n💡 Tip: Jika gagal, jalankan manual di:');
    console.log('   https://supabase.com/dashboard/project/mjoqlbdvgsclfmhjugvc/sql/new');
    console.log('   File: supabase/migrations/COMBINED_011_013_run_in_supabase.sql');
  }
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
