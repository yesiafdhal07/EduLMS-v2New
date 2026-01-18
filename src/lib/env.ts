/**
 * Environment Variables Validation
 * Ensures all required environment variables are present at startup
 */

import { z } from 'zod';

const envSchema = z.object({
    // Supabase (Required)
    NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),

    // Firebase (Optional - for push notifications)
    NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
    NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),
    NEXT_PUBLIC_FIREBASE_VAPID_KEY: z.string().optional(),

    // Setup (Optional - only for initial setup)
    SETUP_SECRET: z.string().optional(),
    INITIAL_GURU_EMAIL: z.string().email().optional(),
    INITIAL_GURU_PASSWORD: z.string().min(8).optional(),
    INITIAL_GURU_NAME: z.string().optional(),
});

/**
 * Validates environment variables and returns typed env object
 * Call this at application startup to catch missing env vars early
 */
export function validateEnv() {
    const result = envSchema.safeParse({
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        NEXT_PUBLIC_FIREBASE_VAPID_KEY: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        SETUP_SECRET: process.env.SETUP_SECRET,
        INITIAL_GURU_EMAIL: process.env.INITIAL_GURU_EMAIL,
        INITIAL_GURU_PASSWORD: process.env.INITIAL_GURU_PASSWORD,
        INITIAL_GURU_NAME: process.env.INITIAL_GURU_NAME,
    });

    if (!result.success) {
        const errors = result.error.issues.map(issue =>
            `${issue.path.join('.')}: ${issue.message}`
        );
        throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
    }

    return result.data;
}

// Export validated env type
export type Env = z.infer<typeof envSchema>;

// Check if Firebase is configured
export function isFirebaseConfigured(): boolean {
    return !!(
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
        process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    );
}

// Check if setup endpoint is enabled
export function isSetupEnabled(): boolean {
    return !!process.env.SETUP_SECRET;
}
