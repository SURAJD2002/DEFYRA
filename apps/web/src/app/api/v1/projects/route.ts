import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireOrgMembership } from '@/lib/auth/rbac';
import { createProjectSchema } from '@/lib/validation';
import { db } from '@/lib/store';
import { logAuditEvent } from '@/lib/audit-logger';
import { Project } from '@/types';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.errorResponse || !auth.ctx) return auth.errorResponse!;

  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('organizationId');

  if (!orgId) {
    // If no orgId specified, return all projects across user's authorized organizations
    const userOrgs = db.listOrganizationsForUser(auth.ctx.user.id);
    const allProjects = userOrgs.flatMap(({ org }) => db.listProjectsForOrg(org.id));
    return NextResponse.json({ success: true, data: allProjects, error: null });
  }

  // Enforce organization membership check
  const orgCheck = await requireOrgMembership(req, orgId, 'project:read');
  if (orgCheck.errorResponse) return orgCheck.errorResponse;

  const projects = db.listProjectsForOrg(orgId);
  const projectsWithStats = projects.map((p) => {
    const assets = db.listAssetsForProject(p.id);
    return {
      ...p,
      assetCount: assets.length,
      findingCount: 0,
      testCount: 0,
    };
  });

  return NextResponse.json({
    success: true,
    data: projectsWithStats,
    error: null,
  });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const parseResult = createProjectSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid project parameters.',
            details: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { organizationId, name, description, environment } = parseResult.data;

    // Enforce authorization on the organization
    const orgCheck = await requireOrgMembership(req, organizationId, 'project:create');
    if (orgCheck.errorResponse || !orgCheck.ctx) return orgCheck.errorResponse!;

    const projectId = `prj_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newProject: Project = {
      id: projectId,
      organizationId,
      name,
      description: description || '',
      environment,
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    db.createProject(newProject);

    await logAuditEvent({
      action: 'PROJECT_CREATED',
      resourceType: 'Project',
      resourceId: newProject.id,
      organizationId,
      userId: orgCheck.ctx.user.id,
      metadata: { name: newProject.name, environment: newProject.environment },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...newProject,
          assetCount: 0,
          findingCount: 0,
          testCount: 0,
        },
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: 'Failed to create project.' } },
      { status: 500 }
    );
  }
}
