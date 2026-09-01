import { NextRequest, NextResponse } from 'next/server';
import { requireOrgMembership } from '@/lib/auth/rbac';
import { updateOrgSchema } from '@/lib/validation';
import { db } from '@/lib/store';
import { logAuditEvent } from '@/lib/audit-logger';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const orgCheck = await requireOrgMembership(req, params.id, 'org:read');
  if (orgCheck.errorResponse || !orgCheck.ctx) return orgCheck.errorResponse!;

  const { organization, membership } = orgCheck.ctx;
  return NextResponse.json({
    success: true,
    data: {
      organization,
      role: membership.role,
    },
    error: null,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const orgCheck = await requireOrgMembership(req, params.id, 'org:update');
  if (orgCheck.errorResponse || !orgCheck.ctx) return orgCheck.errorResponse!;

  try {
    const rawBody = await req.json();
    const parseResult = updateOrgSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid update data.',
            details: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const updated = db.updateOrganization(params.id, parseResult.data);
    if (!updated) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Organization not found' } },
        { status: 404 }
      );
    }

    await logAuditEvent({
      action: 'ORGANIZATION_UPDATED',
      resourceType: 'Organization',
      resourceId: updated.id,
      organizationId: updated.id,
      userId: orgCheck.ctx.user.id,
      metadata: parseResult.data,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: 'Failed to update organization.' } },
      { status: 500 }
    );
  }
}
