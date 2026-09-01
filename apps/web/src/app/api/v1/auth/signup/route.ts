import { NextRequest, NextResponse } from 'next/server';
import { signupSchema } from '@/lib/validation';
import { hashPassword } from '@/lib/auth/password';
import { generateSessionToken, signSessionToken, SESSION_COOKIE_NAME, SESSION_DURATION_MS } from '@/lib/auth/session';
import { db } from '@/lib/store';
import { logAuditEvent } from '@/lib/audit-logger';
import { User, Organization } from '@/types';

export async function POST(req: NextRequest) {
  const requestId = `req_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
  const timestamp = new Date().toISOString();

  try {
    const rawBody = await req.json();
    const parseResult = signupSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid registration details',
            details: parseResult.error.flatten().fieldErrors,
          },
          meta: { requestId, timestamp },
        },
        { status: 400 }
      );
    }

    const { email, password, fullName, organizationName } = parseResult.data;

    // Check if user already exists
    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'CONFLICT',
            message: 'An account with this email address already exists.',
          },
          meta: { requestId, timestamp },
        },
        { status: 409 }
      );
    }

    // 1. Create User
    const passwordHash = await hashPassword(password);
    const userId = `usr_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
    const user: User = {
      id: userId,
      email,
      passwordHash,
      fullName,
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    db.createUser(user);

    // 2. Create Organization with user as OWNER
    const orgSlug = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 40) || 'org';
    const orgId = `org_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
    const org: Organization = {
      id: orgId,
      name: organizationName,
      slug: `${orgSlug}-${Math.floor(100 + Math.random() * 900)}`,
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const { membership } = db.createOrganization(org, user.id);

    // 3. Create Default Project
    const projectId = `prj_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
    db.createProject({
      id: projectId,
      organizationId: org.id,
      name: 'Default AI Agent Project',
      description: 'Initial scoped workspace for validating models, agents, and RAG pipelines.',
      environment: 'staging',
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    // 4. Create Session & Cookie
    const token = generateSessionToken();
    db.createSession({
      id: `ses_${Math.random().toString(36).substring(2, 11)}`,
      userId: user.id,
      token,
      expiresAt: Date.now() + SESSION_DURATION_MS,
      createdAt: timestamp,
    });

    await logAuditEvent({
      action: 'USER_SIGNUP',
      resourceType: 'User',
      resourceId: user.id,
      organizationId: org.id,
      userId: user.id,
      metadata: { email: user.email, organizationName: org.name },
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
          organization: org,
          role: membership.role,
        },
        error: null,
        meta: { requestId, timestamp },
      },
      { status: 201 }
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
    console.error(`[AUTH_SIGNUP_ERROR] ${requestId}:`, error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to process registration.' },
        meta: { requestId, timestamp },
      },
      { status: 500 }
    );
  }
}
