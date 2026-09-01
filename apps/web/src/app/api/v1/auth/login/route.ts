import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validation';
import { verifyPassword } from '@/lib/auth/password';
import { generateSessionToken, signSessionToken, SESSION_COOKIE_NAME, SESSION_DURATION_MS } from '@/lib/auth/session';
import { checkRateLimit } from '@/lib/rate-limiter';
import { db } from '@/lib/store';
import { logAuditEvent } from '@/lib/audit-logger';

export async function POST(req: NextRequest) {
  const requestId = `req_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
  const timestamp = new Date().toISOString();
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

  try {
    // 1. Rate Limiting for Login (10 attempts per 10 minutes)
    const rateLimit = checkRateLimit(`login:${ip}`, 10, 600000);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'RATE_LIMITED',
            message: `Too many failed attempts. Please wait ${rateLimit.resetInSec} seconds before retrying.`,
          },
          meta: { requestId, timestamp },
        },
        { status: 429 }
      );
    }

    const rawBody = await req.json();
    const parseResult = loginSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid email or password format.',
          },
          meta: { requestId, timestamp },
        },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;
    const user = db.findUserByEmail(email);

    // Generic error to prevent email enumeration
    const invalidCredentialsResponse = NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email address or password.',
        },
        meta: { requestId, timestamp },
      },
      { status: 401 }
    );

    if (!user || user.status !== 'active') {
      await logAuditEvent({
        action: 'FAILED_LOGIN_ATTEMPT',
        resourceType: 'User',
        ipAddress: ip,
        metadata: { attemptedEmail: email, reason: 'user_not_found' },
      });
      return invalidCredentialsResponse;
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      await logAuditEvent({
        action: 'FAILED_LOGIN_ATTEMPT',
        resourceType: 'User',
        resourceId: user.id,
        userId: user.id,
        ipAddress: ip,
        metadata: { reason: 'invalid_password' },
      });
      return invalidCredentialsResponse;
    }

    // 2. Issue Session
    const token = generateSessionToken();
    db.createSession({
      id: `ses_${Math.random().toString(36).substring(2, 11)}`,
      userId: user.id,
      token,
      expiresAt: Date.now() + SESSION_DURATION_MS,
      createdAt: timestamp,
    });

    const userOrgs = db.listOrganizationsForUser(user.id);
    const primaryOrg = userOrgs[0]?.org;
    const primaryRole = userOrgs[0]?.role || 'VIEWER';

    await logAuditEvent({
      action: 'USER_LOGIN',
      resourceType: 'User',
      resourceId: user.id,
      organizationId: primaryOrg?.id,
      userId: user.id,
      ipAddress: ip,
    });

    const signedToken = signSessionToken(token);
    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            status: user.status,
            createdAt: user.createdAt,
          },
          organizations: userOrgs,
          activeOrganization: primaryOrg,
          role: primaryRole,
        },
        error: null,
        meta: { requestId, timestamp },
      },
      { status: 200 }
    );

    response.cookies.set(SESSION_COOKIE_NAME, signedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_DURATION_MS / 1000,
    });

    return response;
  } catch (error) {
    console.error(`[AUTH_LOGIN_ERROR] ${requestId}:`, error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to process login.' },
        meta: { requestId, timestamp },
      },
      { status: 500 }
    );
  }
}
