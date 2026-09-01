import { NextRequest, NextResponse } from 'next/server';
import { requireProjectAccess } from '@/lib/auth/rbac';
import { updateProjectSchema } from '@/lib/validation';
import { db } from '@/lib/store';
import { logAuditEvent } from '@/lib/audit-logger';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectCheck = await requireProjectAccess(req, params.id, 'project:read');
  if (projectCheck.errorResponse || !projectCheck.ctx) return projectCheck.errorResponse!;

  const { project, organization, membership } = projectCheck.ctx;
  const assets = db.listAssetsForProject(project.id);
  const relationships = db.listRelationshipsForProject(project.id);

  return NextResponse.json({
    success: true,
    data: {
      ...project,
      organizationName: organization.name,
      role: membership.role,
      assetCount: assets.length,
      relationshipCount: relationships.length,
      findingCount: 0,
      testCount: 0,
    },
    error: null,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectCheck = await requireProjectAccess(req, params.id, 'project:update');
  if (projectCheck.errorResponse || !projectCheck.ctx) return projectCheck.errorResponse!;

  try {
    const rawBody = await req.json();
    const parseResult = updateProjectSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid update parameters.',
            details: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const updated = db.updateProject(params.id, parseResult.data);
    if (!updated) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Project not found' } },
        { status: 404 }
      );
    }

    await logAuditEvent({
      action: 'PROJECT_UPDATED',
      resourceType: 'Project',
      resourceId: updated.id,
      organizationId: projectCheck.ctx.organization.id,
      userId: projectCheck.ctx.user.id,
      metadata: parseResult.data,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: 'Failed to update project.' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectCheck = await requireProjectAccess(req, params.id, 'project:archive');
  if (projectCheck.errorResponse || !projectCheck.ctx) return projectCheck.errorResponse!;

  db.archiveProject(params.id);

  await logAuditEvent({
    action: 'PROJECT_ARCHIVED',
    resourceType: 'Project',
    resourceId: params.id,
    organizationId: projectCheck.ctx.organization.id,
    userId: projectCheck.ctx.user.id,
  });

  return NextResponse.json({
    success: true,
    data: { message: 'Project archived successfully.' },
    error: null,
  });
}
