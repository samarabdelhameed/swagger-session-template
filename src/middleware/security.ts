// src/middleware/security.ts
import { sessions } from '../lib/storage';

console.log('Current sessions:', sessions);


import { Elysia } from 'elysia';

export const securityMiddleware = new Elysia()
  .onBeforeHandle(({ request, cookie, set }) => {
    // Enforce HTTPS in production
    if (
      !request.headers.get('x-forwarded-proto')?.includes('https') &&
      process.env.NODE_ENV === 'production'
    ) {
      set.status = 301;
      set.headers['Location'] = `https://${request.headers.get('host')}${request.url}`;
      return 'Redirecting to HTTPS';
    }

    // CSRF protection for /api/register/*
    if (request.url.includes('/api/register/')) {
      const csrfToken = cookie.csrfToken?.value;
      if (!csrfToken) {
        const newToken = crypto.randomUUID();
        cookie.csrfToken.set({
          value: newToken,
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });
      } else if (!isValidCsrfToken(csrfToken, request)) {
        set.status = 403;
        return 'Invalid CSRF token';
      }
    }
  });

function isValidCsrfToken(token: string, request: Request) {
  return token.length === 36; // simple UUID check
}
