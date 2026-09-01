import { NextRequest, NextResponse } from 'next/server';
import { requireProjectAccess } from '@/lib/auth/rbac';
import { createRemediationSchema } from '@/lib/validation';
import { db } from '@/lib/store';
import { logAuditEvent } from '@/lib/audit-logger';
import { RemediationRecord } from '@/types';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const finding = db.findFindingById(params.id);
  if (!finding) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Finding not found' } },
      { status: 404 }
    );
  }

  const projectCheck = await requireProjectAccess(req, finding.projectId, 'finding:manage');
  if (projectCheck.errorResponse || !projectCheck.ctx) return projectCheck.errorResponse!;

  try {
    const rawBody = await req.json();
    const parseResult = createRemediationSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid remediation parameters.',
            details: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const now = new Date().toISOString();

    const remediation: RemediationRecord = {
      id: `rem_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`,
      organizationId: finding.organizationId,
      projectId: finding.projectId,
      assessmentId: finding.assessmentId || '',
      findingId: finding.id,
      title: data.title,
      description: data.description,
      priority: data.priority,
      recommendedAction: data.recommendedAction,
      owner: data.owner || projectCheck.ctx.user.fullName,
      status: 'IN_PROGRESS',
      createdAt: now,
      updatedAt: now,
    };

    db.createRemediation(remediation);

    // Update finding status to REMEDIATION_REQUIRED
    db.updateFinding(finding.id, { status: 'REMEDIATION_REQUIRED' });

    await logAuditEvent({
      action: 'REMEDIATION_CREATED',
      resourceType: 'REMEDIATION',
      resourceId: remediation.id,
      organizationId: finding.organizationId,
      userId: projectCheck.ctx.user.id,
      metadata: {
        findingId: finding.id,
        priority: remediation.priority,
      },
    });

    return NextResponse.json({
      success: true,
      data: remediation,
      error: null,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: 'INTERNAL_ERROR', message: `Failed to create remediation: ${errorMsg}` },
      },
      { status: 500 }
    );
  }
}
