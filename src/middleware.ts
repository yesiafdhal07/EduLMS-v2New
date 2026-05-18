import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit as checkRedisRateLimit, isRateLimitConfigured } from '@/lib/rate-limit';

// Middleware cache for user roles (5 minute TTL)
// Helps reduce latency on protected routes by preventing repeated DB calls
const roleCache = new Map<string, { role: string; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000;

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
    // SECURITY: Strict CSP — restrict script/connect sources
    const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '') || '';
    response.headers.set('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " + // Keep inline for Next.js hydration; consider nonces in future
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: blob: https:; " +
        `connect-src 'self' https://${supabaseHost} wss://${supabaseHost} https://*.sentry.io https://*.upstash.io; ` +
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

        // SECURITY FIX: Use getUser() instead of getSession().
        // getSession() only reads the cookie locally — does NOT verify with Supabase Auth server.
        // getUser() sends the JWT to Supabase to verify authenticity and expiry.
        // The DB role query at line 154 provides defense-in-depth.
        const { data: { user } } = await supabase.auth.getUser();

        const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
        const isKepsekPath = request.nextUrl.pathname.startsWith('/kepala-sekolah');
        const isGuruPath = request.nextUrl.pathname.startsWith('/guru');
        const isSiswaPath = request.nextUrl.pathname.startsWith('/siswa');
        const isOrtuPath = request.nextUrl.pathname.startsWith('/ortu');
        const isProtectedPath = isAdminPath || isKepsekPath || isGuruPath || isSiswaPath || isOrtuPath;

        if (!user && isProtectedPath) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        if (user && isProtectedPath) {
            // SECURITY: ALWAYS verify role from DB (or cache) — cookie is untrusted
            let role: string | null = null;
            const cached = roleCache.get(user.id);
            
            if (cached && cached.expires > Date.now()) {
                role = cached.role;
            } else {
                const { data: dbUser, error: profileError } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profileError || !dbUser?.role) {
                    return NextResponse.redirect(new URL('/login?error=profile_missing', request.url));
                }
                role = dbUser.role;
                
                // Keep cache size bounded to prevent Edge memory leaks
                if (roleCache.size > 10000) {
                    const firstKey = roleCache.keys().next().value;
                    if (firstKey) roleCache.delete(firstKey);
                }
                roleCache.set(user.id, { role: role!, expires: Date.now() + CACHE_TTL });
            }

            // Set cookie as UI hint only (with secure flags)
            response.cookies.set('user_role', role as string, { 
                maxAge: 60 * 60 * 24 * 7, // 1 week
                path: '/',
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
            });

            const roleRoutes: Record<string, string> = {
                admin: '/admin',
                kepala_sekolah: '/kepala-sekolah',
                guru: '/guru',
                siswa: '/siswa',
                orang_tua: '/ortu',
            };

            // role is now guaranteed to be a string
            const currentRole = role as string;
            const allowedRoute = roleRoutes[currentRole] || '/login';

            if (isAdminPath && role !== 'admin') {
                return NextResponse.redirect(new URL(allowedRoute, request.url));
            }
            if (isKepsekPath && role !== 'kepala_sekolah') {
                return NextResponse.redirect(new URL(allowedRoute, request.url));
            }
            if (isGuruPath && role !== 'guru') {
                return NextResponse.redirect(new URL(allowedRoute, request.url));
            }
            if (isSiswaPath && role !== 'siswa') {
                return NextResponse.redirect(new URL(allowedRoute, request.url));
            }
            if (isOrtuPath && role !== 'orang_tua') {
                return NextResponse.redirect(new URL(allowedRoute, request.url));
            }
        }

        return response;
    } catch (error) {
        console.error('Middleware Error:', error);
        // SECURITY: Fail CLOSED for protected routes — redirect to login
        const isProtected = request.nextUrl.pathname.match(/^\/(admin|guru|siswa|kepala-sekolah|ortu)/);
        if (isProtected) {
            return NextResponse.redirect(new URL('/login?error=service_error', request.url));
        }
        return NextResponse.next();
    }
}

export const config = {
    // Page routes only — skip /api so dev logging and setup are not wrapped in auth/getUser.
    matcher: ['/admin/:path*', '/kepala-sekolah/:path*', '/guru/:path*', '/siswa/:path*', '/ortu/:path*'],
};
