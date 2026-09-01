import { NextRequest, NextResponse } from 'next/server';
import { extractSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { db } from '@/lib/store';
import { logAuditEvent } from '@/lib/audit-logger';

export async function POST(req: NextRequest) {
  const token = extractSessionToken(req);

  if (token) {
    const session = db.findSessionByToken(token);
    if (session) {
      db.deleteSession(token);
      await logAuditEvent({
        action: 'USER_LOGOUT',
        resourceType: 'User',
        resourceId: session.userId,
        userId: session.userId,
      });
    }
  }

  const response = NextResponse.json({
    success: true,
    data: { message: 'Logged out successfully' },
    error: null,
  });

  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
