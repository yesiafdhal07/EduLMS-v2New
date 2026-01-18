import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit as checkRedisRateLimit, isRateLimitConfigured } from '@/lib/rate-limit';

// ========================================================
// RATE LIMITING CONFIGURATION
// ========================================================
const MAX_REQUESTS_PER_WINDOW = 100; // 100 requests per minute

// Fallback in-memory store for development (when Redis not configured)
// WARNING: This resets on every worker restart - not suitable for production
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in ms

function getRateLimitKey(request: NextRequest): string {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    return forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';
}

// Fallback in-memory rate limit (for development only)
function checkInMemoryRateLimit(ip: string): { success: boolean; remaining: number; reset: number } {
    const now = Date.now();
    const record = rateLimitStore.get(ip);

    // Cleanup expired entries
    if (record && now > record.resetTime) {
        rateLimitStore.delete(ip);
    }

    const existingRecord = rateLimitStore.get(ip);
    if (!existingRecord) {
        const resetTime = now + RATE_LIMIT_WINDOW;
        rateLimitStore.set(ip, { count: 1, resetTime });
        return { success: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, reset: Math.floor(resetTime / 1000) };
    }

    if (existingRecord.count >= MAX_REQUESTS_PER_WINDOW) {
        return { success: false, remaining: 0, reset: Math.floor(existingRecord.resetTime / 1000) };
    }

    existingRecord.count++;
    return {
        success: true,
        remaining: MAX_REQUESTS_PER_WINDOW - existingRecord.count,
        reset: Math.floor(existingRecord.resetTime / 1000)
    };
}

// ========================================================
// SECURITY HEADERS
// ========================================================
function addSecurityHeaders(response: NextResponse): NextResponse {
    // Content Security Policy - Prevent XSS attacks
    response.headers.set('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: blob: https:; " +
        "connect-src *; " +
        "prefetch-src 'self'; " +
        "frame-ancestors 'none';"
    );
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
    return response;
}

// ========================================================
// MAIN MIDDLEWARE
// ========================================================
export async function middleware(request: NextRequest) {
    try {
        const ip = getRateLimitKey(request);
        
        // Use Redis rate limiting if configured, otherwise fall back to in-memory
        const rateLimit = isRateLimitConfigured()
            ? await checkRedisRateLimit(ip)
            : checkInMemoryRateLimit(ip);

        if (!rateLimit.success) {
            const response = NextResponse.json(
                { error: 'Terlalu banyak request. Silakan coba lagi nanti.' },
                { status: 429 }
            );
            response.headers.set('Retry-After', String(rateLimit.reset - Math.floor(Date.now() / 1000)));
            response.headers.set('X-RateLimit-Limit', String(MAX_REQUESTS_PER_WINDOW));
            response.headers.set('X-RateLimit-Remaining', '0');
            response.headers.set('X-RateLimit-Reset', String(rateLimit.reset));
            return response;
        }

        let response = NextResponse.next({
            request: { headers: request.headers },
        });

        response.headers.set('X-RateLimit-Limit', String(MAX_REQUESTS_PER_WINDOW));
        response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
        response.headers.set('X-RateLimit-Reset', String(rateLimit.reset));
        response = addSecurityHeaders(response);

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) =>
                            request.cookies.set(name, value)
                        );
                        response = NextResponse.next({
                            request: { headers: request.headers },
                        });
                        response = addSecurityHeaders(response);
                        response.headers.set('X-RateLimit-Limit', String(MAX_REQUESTS_PER_WINDOW));
                        response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
                        response.headers.set('X-RateLimit-Reset', String(rateLimit.reset));

                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, options)
                        );
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        const isGuruPath = request.nextUrl.pathname.startsWith('/guru');
        const isSiswaPath = request.nextUrl.pathname.startsWith('/siswa');

        if (!user && (isGuruPath || isSiswaPath)) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        if (user) {
            const role = user.user_metadata?.role;

            if (isGuruPath && role !== 'guru' && role !== 'admin') {
                return NextResponse.redirect(new URL('/siswa', request.url));
            }

            if (isSiswaPath && role !== 'siswa') {
                if (role === 'guru' || role === 'admin') {
                    return NextResponse.redirect(new URL('/guru', request.url));
                }
            }
        }

        return response;
    } catch (error) {
        console.error('Middleware Error:', error);
        return NextResponse.next();
    }
}

export const config = {
    matcher: ['/guru/:path*', '/siswa/:path*', '/api/:path*'],
};
