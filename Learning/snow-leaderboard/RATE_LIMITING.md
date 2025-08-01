# Rate Limiting System

This document explains the rate limiting system implemented to protect the Riot API key from abuse.

## Overview

The rate limiting system prevents external users from overloading your Riot API key by limiting the number of requests per IP address within a specified time window.

## Implementation

### Rate Limiter Classes

Located in `lib/rateLimit.ts`:

- **RateLimiter**: Core class that tracks requests by IP address
- **registerPlayerRateLimiter**: 3 requests per minute for player registration
- **generalAPIRateLimiter**: 10 requests per minute for general API access

### Protected Endpoints

1. **`/api/register-player`** (POST)
   - Rate limit: 3 requests per minute per IP
   - Purpose: Prevents abuse of Riot API calls for player registration

2. **`/api/players`** (GET)
   - Rate limit: 10 requests per minute per IP
   - Purpose: Prevents excessive leaderboard data requests

### How It Works

1. **IP Detection**: Extracts client IP from various headers:
   - `x-forwarded-for`
   - `x-real-ip`
   - `cf-connecting-ip`

2. **Request Tracking**: Maintains a Map of IP addresses with:
   - Request count
   - Reset time (when the window expires)

3. **Rate Limit Check**: Before processing any request:
   - Checks if IP has exceeded the limit
   - Returns 429 status if limit exceeded
   - Includes retry-after header with seconds to wait

4. **Automatic Cleanup**: Expired entries are automatically removed

## Configuration

### Rate Limits

You can adjust the rate limits in `lib/rateLimit.ts`:

```typescript
// For player registration (more restrictive)
export const registerPlayerRateLimiter = new RateLimiter(60000, 3) // 3 requests per minute

// For general API access (less restrictive)
export const generalAPIRateLimiter = new RateLimiter(60000, 10) // 10 requests per minute
```

### Parameters

- **windowMs**: Time window in milliseconds (default: 60000 = 1 minute)
- **maxRequests**: Maximum requests allowed in the window (default: 5)

## Response Headers

Rate-limited responses include these headers:

- `X-RateLimit-Remaining`: Number of requests remaining
- `X-RateLimit-Reset`: ISO timestamp when the limit resets
- `Retry-After`: Seconds to wait before retrying

## Error Handling

### Frontend

The registration page (`app/register/page.tsx`) handles rate limit errors:

```typescript
if (response.status === 429) {
  const retryAfter = data.retryAfter || 60
  throw new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`)
}
```

### Backend

API routes return structured error responses:

```json
{
  "error": "Rate limit exceeded. Please try again later.",
  "retryAfter": 45
}
```

## Security Features

### Middleware Protection

The `middleware.ts` file adds additional security:

- Security headers (XSS protection, content type options)
- CORS headers for API routes
- Request logging for monitoring

### IP Detection

The system tries multiple headers to get the real client IP:

1. `x-forwarded-for` (most common)
2. `x-real-ip` (Nginx/other proxies)
3. `cf-connecting-ip` (Cloudflare)
4. Falls back to 'unknown' if no IP detected

## Monitoring

### Logging

API requests are logged with timestamp, method, path, and IP:

```
[2024-01-15T10:30:45.123Z] POST /api/register-player - 192.168.1.100
```

### Rate Limit Events

Rate limit violations are logged with details:

```
Rate limit exceeded for IP: 192.168.1.100, remaining: 0, reset: 2024-01-15T10:31:45.123Z
```

## Best Practices

1. **Monitor Usage**: Check logs regularly for rate limit violations
2. **Adjust Limits**: Increase limits if legitimate users are being blocked
3. **Whitelist**: Consider whitelisting known good IPs if needed
4. **Caching**: Implement caching to reduce API calls
5. **User Feedback**: Clear error messages help users understand limits

## Troubleshooting

### Common Issues

1. **Legitimate users blocked**: Increase rate limits or add whitelist
2. **IP detection issues**: Check proxy configuration
3. **Memory usage**: Rate limiter uses in-memory storage (cleans up automatically)

### Testing

Test rate limits locally:

```bash
# Test rate limiting
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/register-player \
    -H "Content-Type: application/json" \
    -d '{"summonerName":"test","tagLine":"NA1","region":"na1"}'
done
```

## Future Enhancements

1. **Persistent Storage**: Use Redis/database for distributed rate limiting
2. **User Authentication**: Rate limit by user ID instead of IP
3. **Dynamic Limits**: Adjust limits based on user behavior
4. **Analytics**: Track rate limit usage patterns
5. **Admin Panel**: Web interface to manage rate limits 