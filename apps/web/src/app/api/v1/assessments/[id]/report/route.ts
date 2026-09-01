import { NextRequest, NextResponse } from 'next/server';
import { requireProjectAccess } from '@/lib/auth/rbac';
import { db } from '@/lib/store';
import { logAuditEvent } from '@/lib/audit-logger';
import { generateAssessmentReport } from '@/lib/security/report-generator';

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

  const projectCheck = await requireProjectAccess(req, assessment.projectId, 'report:read');
  if (projectCheck.errorResponse || !projectCheck.ctx) return projectCheck.errorResponse!;

  let report = db.findReportByAssessmentId(assessment.id);
  if (!report) {
    const findings = db.listFindingsForAssessment(assessment.id);
    const remediations = db.listRemediationsForAssessment(assessment.id);
    const retests: any[] = [];
    for (const f of findings) {
      retests.push(...db.listRetestsForFinding(f.id));
    }
    report = generateAssessmentReport({
      assessment,
      findings,
      remediations,
      retests,
      generatedByUserId: projectCheck.ctx.user.id,
    });
  }

  return NextResponse.json({
    success: true,
    data: report,
    error: null,
  });
}

export async function POST(
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

  const projectCheck = await requireProjectAccess(req, assessment.projectId, 'report:generate');
  if (projectCheck.errorResponse || !projectCheck.ctx) return projectCheck.errorResponse!;

  const findings = db.listFindingsForAssessment(assessment.id);
  const remediations = db.listRemediationsForAssessment(assessment.id);
  const retests: any[] = [];
  for (const f of findings) {
    retests.push(...db.listRetestsForFinding(f.id));
  }

  const report = generateAssessmentReport({
    assessment,
    findings,
    remediations,
    retests,
    generatedByUserId: projectCheck.ctx.user.id,
  });

  // Mark assessment as COMPLETED
  db.updateAssessment(assessment.id, {
    status: 'COMPLETED',
    completedAt: new Date().toISOString(),
  });

  await logAuditEvent({
    action: 'REPORT_GENERATED',
    resourceType: 'REPORT',
    resourceId: report.id,
    organizationId: assessment.organizationId,
    userId: projectCheck.ctx.user.id,
    metadata: {
      assessmentId: assessment.id,
      reportHash: report.reportHash,
      findingsCount: findings.length,
    },
  });

  return NextResponse.json({
    success: true,
    data: report,
    error: null,
  });
}
