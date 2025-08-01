// Rate limiting utility for protecting API endpoints
interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map()
  private readonly windowMs: number
  private readonly maxRequests: number

  constructor(windowMs: number = 60000, maxRequests: number = 5) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  // Clean up expired entries
  private cleanup() {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    // Collect keys to delete to avoid modifying map during iteration
    this.requests.forEach((entry, key) => {
      if (now > entry.resetTime) {
        keysToDelete.push(key)
      }
    })
    
    // Delete expired entries
    keysToDelete.forEach(key => {
      this.requests.delete(key)
    })
  }

  // Check if request is allowed
  isAllowed(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    this.cleanup()
    
    const now = Date.now()
    const entry = this.requests.get(identifier)
    
    if (!entry) {
      // First request for this identifier
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs
      }
    }
    
    if (now > entry.resetTime) {
      // Window has expired, reset
      const newEntry = {
        count: 1,
        resetTime: now + this.windowMs
      }
      this.requests.set(identifier, newEntry)
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs
      }
    }
    
    if (entry.count >= this.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      }
    }
    
    // Increment count
    entry.count++
    this.requests.set(identifier, entry)
    
    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime
    }
  }
}

// Create rate limiter instances
export const registerPlayerRateLimiter = new RateLimiter(60000, 3) // 3 requests per minute
export const generalAPIRateLimiter = new RateLimiter(60000, 10) // 10 requests per minute

// Helper function to get client IP
function getClientIP(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // Fallback to a default identifier
  return 'unknown'
}

// Check rate limit for a request
export function checkRateLimit(request: Request, rateLimiter: RateLimiter) {
  const identifier = getClientIP(request)
  return rateLimiter.isAllowed(identifier)
}

// Create rate limit headers
export function createRateLimitHeaders(remaining: number, resetTime: number) {
  const headers = new Headers()
  headers.set('X-RateLimit-Remaining', remaining.toString())
  headers.set('X-RateLimit-Reset', resetTime.toString())
  headers.set('Retry-After', Math.ceil((resetTime - Date.now()) / 1000).toString())
  return headers
} 