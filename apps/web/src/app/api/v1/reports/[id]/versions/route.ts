import { NextRequest, NextResponse } from 'next/server';
import { requireProjectAccess } from '@/lib/auth/rbac';
import { db } from '@/lib/store';

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

  const versions = db.listReportVersions(report.id);

  return NextResponse.json({
    success: true,
    data: {
      currentVersion: report.version,
      currentReportHash: report.reportHash,
      status: report.status,
      sealedAt: report.sealedAt,
      versions,
    },
    error: null,
  });
}
