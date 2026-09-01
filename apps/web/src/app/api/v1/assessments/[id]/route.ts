import { NextRequest, NextResponse } from 'next/server';
import { requireProjectAccess } from '@/lib/auth/rbac';
import { updateAssessmentSchema } from '@/lib/validation';
import { db } from '@/lib/store';
import { logAuditEvent } from '@/lib/audit-logger';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const assessment = db.findAssessmentById(params.id);
  if (!assessment) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Assessment not found' } },
      { status: 404 }
    );
  }

  const projectCheck = await requireProjectAccess(req, assessment.projectId, 'project:read');
  if (projectCheck.errorResponse || !projectCheck.ctx) return projectCheck.errorResponse!;

  const findings = db.listFindingsForAssessment(assessment.id);
  const remediations = db.listRemediationsForAssessment(assessment.id);
  const report = db.findReportByAssessmentId(assessment.id);

  return NextResponse.json({
    success: true,
    data: {
      ...assessment,
      findingsCount: findings.length,
      remediationsCount: remediations.length,
      hasReport: !!report,
    },
    error: null,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const assessment = db.findAssessmentById(params.id);
  if (!assessment) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Assessment not found' } },
      { status: 404 }
    );
  }

  const projectCheck = await requireProjectAccess(req, assessment.projectId, 'project:update');
  if (projectCheck.errorResponse || !projectCheck.ctx) return projectCheck.errorResponse!;

  try {
    const rawBody = await req.json();
    const parseResult = updateAssessmentSchema.safeParse(rawBody);

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

    const updated = db.updateAssessment(params.id, parseResult.data);

    await logAuditEvent({
      action: 'ASSESSMENT_UPDATED',
      resourceType: 'ASSESSMENT',
      resourceId: assessment.id,
      organizationId: assessment.organizationId,
      userId: projectCheck.ctx.user.id,
      metadata: parseResult.data,
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
        error: { code: 'INTERNAL_ERROR', message: `Failed to update assessment: ${errorMsg}` },
      },
      { status: 500 }
    );
  }
}
