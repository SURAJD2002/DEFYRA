import { randomBytes, createHmac } from 'crypto';
import { NextRequest } from 'next/server';

export const SESSION_COOKIE_NAME = 'defyra_session';
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const SECRET = process.env.SESSION_SECRET || 'defyra-default-development-secret-key-32-bytes-minimum!';

/**
 * Generates a cryptographically secure random session token.
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Signs a session token using HMAC-SHA256.
 */
export function signSessionToken(token: string): string {
  const hmac = createHmac('sha256', SECRET);
  hmac.update(token);
  const signature = hmac.digest('hex');
  return `${token}.${signature}`;
}

/**
 * Verifies a signed session token.
 */
export function verifySignedSessionToken(signedToken: string): string | null {
  try {
    const [token, signature] = signedToken.split('.');
    if (!token || !signature) return null;

    const hmac = createHmac('sha256', SECRET);
    hmac.update(token);
    const expectedSignature = hmac.digest('hex');

    if (signature === expectedSignature) {
      return token;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Extracts session token from incoming request cookies or Authorization header.
 */
export function extractSessionToken(req: NextRequest): string | null {
  // 1. From HttpOnly Cookie
  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  if (cookie?.value) {
    const verified = verifySignedSessionToken(cookie.value);
    if (verified) return verified;
  }

  // 2. From Authorization Bearer header (for CLI/API integrations)
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const verified = verifySignedSessionToken(token);
    return verified || token;
  }

  return null;
}
