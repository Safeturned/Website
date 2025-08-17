interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const store: RateLimitStore = {};

export interface RateLimitConfig {
    windowMs: number; // Time window in milliseconds
    maxRequests: number; // Maximum requests per window
}

export function createRateLimiter(config: RateLimitConfig) {
    return function rateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
        const now = Date.now();
        const key = identifier;
        
        // Clean up expired entries
        if (store[key] && store[key].resetTime <= now) {
            delete store[key];
        }
        
        // Initialize or get existing entry
        if (!store[key]) {
            store[key] = {
                count: 0,
                resetTime: now + config.windowMs
            };
        }
        
        // Check if limit exceeded
        if (store[key].count >= config.maxRequests) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: store[key].resetTime
            };
        }
        
        // Increment count
        store[key].count++;
        
        return {
            allowed: true,
            remaining: config.maxRequests - store[key].count,
            resetTime: store[key].resetTime
        };
    };
}

// Clean up old entries periodically (every 5 minutes)
setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach(key => {
        if (store[key].resetTime <= now) {
            delete store[key];
        }
    });
}, 5 * 60 * 1000);

export function getClientIP(request: Request): string {
    // Try to get real IP from various headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    
    if (forwardedFor) {
        // Take the first IP from the list
        return forwardedFor.split(',')[0].trim();
    }
    
    if (realIP) {
        return realIP;
    }
    
    if (cfConnectingIP) {
        return cfConnectingIP;
    }
    
    // Fallback to a default identifier
    return 'unknown';
}
