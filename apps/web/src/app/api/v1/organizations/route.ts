import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/rbac';
import { createOrgSchema } from '@/lib/validation';
import { db } from '@/lib/store';
import { logAuditEvent } from '@/lib/audit-logger';
import { Organization } from '@/types';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.errorResponse || !auth.ctx) return auth.errorResponse!;

  const orgs = db.listOrganizationsForUser(auth.ctx.user.id);
  return NextResponse.json({
    success: true,
    data: orgs,
    error: null,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.errorResponse || !auth.ctx) return auth.errorResponse!;

  try {
    const rawBody = await req.json();
    const parseResult = createOrgSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid organization details.',
            details: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { name, slug } = parseResult.data;

    // Check slug uniqueness
    const existing = db.findOrganizationBySlug(slug);
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: 'CONFLICT', message: 'An organization with this slug already exists.' },
        },
        { status: 409 }
      );
    }

    const orgId = `org_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
    const newOrg: Organization = {
      id: orgId,
      name,
      slug,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { org, membership } = db.createOrganization(newOrg, auth.ctx.user.id);

    await logAuditEvent({
      action: 'ORGANIZATION_CREATED',
      resourceType: 'Organization',
      resourceId: org.id,
      organizationId: org.id,
      userId: auth.ctx.user.id,
      metadata: { name: org.name, slug: org.slug },
    });

    return NextResponse.json(
      {
        success: true,
        data: { organization: org, role: membership.role },
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: 'Failed to create organization.' } },
      { status: 500 }
    );
  }
}
