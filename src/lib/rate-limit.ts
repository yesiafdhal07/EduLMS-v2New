/**
 * Redis Rate Limiter using Upstash
 * 
 * Production-ready distributed rate limiting that works across
 * multiple serverless instances (Vercel, AWS Lambda, etc.)
 * 
 * Setup:
 * 1. Create account at https://upstash.com
 * 2. Create a Redis database
 * 3. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env.local
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Check if Upstash is configured
const isUpstashConfigured: boolean = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && 
    process.env.UPSTASH_REDIS_REST_TOKEN
);

// Create Redis client (lazy initialization)
let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

function getRedisClient(): Redis | null {
    if (!isUpstashConfigured) return null;
    
    if (!redis) {
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL!,
            token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        });
    }
    return redis;
}

function getRateLimiter(): Ratelimit | null {
    if (!isUpstashConfigured) return null;
    
    const client = getRedisClient();
    if (!client) return null;
    
    if (!ratelimit) {
        ratelimit = new Ratelimit({
            redis: client,
            limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
            analytics: true, // Enable analytics in Upstash dashboard
            prefix: 'edulms_ratelimit',
        });
    }
    return ratelimit;
}

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number; // Unix timestamp in seconds
}

/**
 * Check rate limit for a given identifier (usually IP address)
 * Falls back to allowing all requests if Upstash is not configured
 */
export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
    const limiter = getRateLimiter();
    
    // Fallback: Allow all requests if Upstash not configured (dev mode)
    if (!limiter) {
        return {
            success: true,
            limit: 100,
            remaining: 100,
            reset: Math.floor(Date.now() / 1000) + 60,
        };
    }
    
    try {
        const result = await limiter.limit(identifier);
        
        return {
            success: result.success,
            limit: result.limit,
            remaining: result.remaining,
            reset: Math.floor(result.reset / 1000), // Convert to seconds
        };
    } catch (error) {
        // On Redis error, fail open (allow request) to prevent service disruption
        console.error('[RateLimit] Redis error, failing open:', error);
        return {
            success: true,
            limit: 100,
            remaining: 100,
            reset: Math.floor(Date.now() / 1000) + 60,
        };
    }
}

/**
 * Check if Upstash Redis is properly configured
 */
export function isRateLimitConfigured(): boolean {
    return isUpstashConfigured;
}
