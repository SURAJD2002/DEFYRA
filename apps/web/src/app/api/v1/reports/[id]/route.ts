import { NextRequest, NextResponse } from 'next/server';
import { requireProjectAccess } from '@/lib/auth/rbac';
import { db } from '@/lib/store';
import { logAuditEvent } from '@/lib/audit-logger';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const report = db.findReportById(params.id);
  if (!report) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Report not found' } },
      { status: 404 }
    );
  }

  const projectCheck = await requireProjectAccess(req, report.projectId, 'report:read');
  if (projectCheck.errorResponse || !projectCheck.ctx) return projectCheck.errorResponse!;

  return NextResponse.json({
    success: true,
    data: report,
    error: null,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const report = db.findReportById(params.id);
  if (!report) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Report not found' } },
      { status: 404 }
    );
  }

  const projectCheck = await requireProjectAccess(req, report.projectId, 'report:generate');
  if (projectCheck.errorResponse || !projectCheck.ctx) return projectCheck.errorResponse!;

  const { user } = projectCheck.ctx;

  try {
    const rawBody = await req.json();
    const { action, status, changeSummary } = rawBody;

    if (action === 'SEAL' || status === 'SEALED') {
      const sealed = db.sealReport(report.id, user.id);

      // Ensure assessment is sealed/completed as well
      db.updateAssessment(report.assessmentId, {
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
      });

      await logAuditEvent({
        action: 'REPORT_SEALED',
        resourceType: 'REPORT',
        resourceId: report.id,
        organizationId: report.organizationId,
        userId: user.id,
        metadata: {
          reportHash: report.reportHash,
          sealedAt: sealed?.sealedAt,
          version: report.version,
        },
      });

      return NextResponse.json({
        success: true,
        data: sealed,
        error: null,
      });
    }

    const updated = db.updateReport(report.id, {
      title: rawBody.title,
      status: status || report.status,
      approvedBy: user.id,
      approvedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: updated,
      error: null,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, data: null, error: { code: 'REPORT_MUTATION_BLOCKED', message: errorMsg } },
      { status: 400 }
    );
  }
}
