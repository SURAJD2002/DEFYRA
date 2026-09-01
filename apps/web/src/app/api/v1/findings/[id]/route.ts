import { NextRequest, NextResponse } from 'next/server';
import { requireProjectAccess } from '@/lib/auth/rbac';
import { updateFindingReviewSchema } from '@/lib/validation';
import { db } from '@/lib/store';
import { logAuditEvent } from '@/lib/audit-logger';

export async function GET(
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

  const projectCheck = await requireProjectAccess(req, finding.projectId, 'finding:read');
  if (projectCheck.errorResponse || !projectCheck.ctx) return projectCheck.errorResponse!;

  const remediations = db.listRemediationsForFinding(finding.id);
  const retests = db.listRetestsForFinding(finding.id);
  const testRun = finding.testRunId ? db.findTestRunById(finding.testRunId) : null;

  return NextResponse.json({
    success: true,
    data: {
      ...finding,
      remediations,
      retests,
      evidence: testRun?.evidence || [],
      observations: testRun?.observations || [],
    },
    error: null,
  });
}

export async function PATCH(
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
    const parseResult = updateFindingReviewSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid finding review parameters.',
            details: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { status, reviewNotes } = parseResult.data;
    const now = new Date().toISOString();

    const updated = db.updateFinding(finding.id, {
      status,
      reviewNotes: reviewNotes || finding.reviewNotes,
      reviewedBy: projectCheck.ctx.user.id,
      reviewedAt: now,
    });

    await logAuditEvent({
      action: `FINDING_STATUS_${status}`,
      resourceType: 'FINDING',
      resourceId: finding.id,
      organizationId: finding.organizationId,
      userId: projectCheck.ctx.user.id,
      metadata: {
        previousStatus: finding.status,
        newStatus: status,
        reviewNotes,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      error: null,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: 'INTERNAL_ERROR', message: `Failed to review finding: ${errorMsg}` },
      },
      { status: 500 }
    );
  }
}
