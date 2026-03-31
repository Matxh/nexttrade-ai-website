# Security Policy for PriceAction AI

## Reporting Security Issues

If you discover a security vulnerability, please email: security@priceaction.it.com

DO NOT create public issues for security bugs.

## Security Measures Implemented

### Authentication & Authorization
- JWT tokens with strong secret (min 32 chars required)
- Password hashing with scrypt and salt
- Rate limiting: 5 auth attempts per 15 minutes
- Rate limiting: 100 API calls per 15 minutes

### Input Validation
- Symbol validation: Alphanumeric, 1-20 characters
- Email validation: RFC-compliant regex
- Timeframe validation: Whitelist approach
- TradeMode validation: Enum whitelist
- Password minimum: 8 characters
- String sanitization: HTML entity encoding

### Transport & Headers
- CORS restricted to specific origins
- Helmet.js security headers
- Content Security Policy implemented
- X-Frame-Options: DENY
- Strict-Transport-Security enabled

### XSS Protection
- `sanitizeHTML()` function for all DOM insertion
- HTML entity encoding for user content
- Content Security Policy restrictions

### Rate Limiting
```javascript
Auth endpoints: 5 attempts per 15 minutes
API endpoints: 100 requests per 15 minutes
```

## Environment Variables Required

```bash
JWT_SECRET=minimum-32-character-random-string
ANTHROPIC_API_KEY=your-anthropic-key
STRIPE_SECRET_KEY=sk_... (optional)
STRIPE_WEBHOOK_SECRET=whsec_... (optional)
```

## Security Changelog

### 2026-03-31 - Critical Security Update
- Fixed hardcoded JWT_SECRET fallback
- Restricted CORS to whitelist origins
- Added express-rate-limit
- Added Helmet.js security headers
- Implemented input validation middleware
- Added XSS sanitization functions
- Created .env.example template
