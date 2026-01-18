// ============================================================
// SUPABASE CLIENT CONFIGURATION
// File ini mengkonfigurasi koneksi ke Supabase (Backend-as-a-Service)
// Digunakan di seluruh aplikasi untuk: auth, database, storage
// ============================================================

import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase Client Instance
 * 
 * Ini adalah singleton client yang digunakan di sisi browser.
 * Credentials diambil dari environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL: URL project Supabase Anda
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Public anon key (aman di expose ke browser)
 * 
 * Options:
 * - persistSession: Session disimpan di localStorage, tetap ada setelah refresh
 * - autoRefreshToken: Token JWT di-refresh otomatis sebelum expire
 * - detectSessionInUrl: Deteksi OAuth callback dari URL (untuk login Google, dll)
 */
export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        auth: {
            persistSession: true,     // Session bertahan setelah page refresh
            autoRefreshToken: true,   // Auto refresh JWT token
            detectSessionInUrl: true, // Untuk OAuth redirects
        }
    }
);
