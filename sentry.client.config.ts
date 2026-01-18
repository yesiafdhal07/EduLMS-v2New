import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
    dsn: SENTRY_DSN,
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Session Replay for error debugging
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Only enable in production
    enabled: process.env.NODE_ENV === 'production',
    
    // Environment tag
    environment: process.env.NODE_ENV,
    
    // Filter out common non-errors
    ignoreErrors: [
        // Network errors
        'Network request failed',
        'Failed to fetch',
        'NetworkError',
        // User abort
        'AbortError',
        // React hydration warnings (not actual errors)
        'Hydration failed',
        'Text content does not match',
    ],
    
    // Don't send source maps in development
    debug: false,
});
