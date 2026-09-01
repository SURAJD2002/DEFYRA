import { NextRequest, NextResponse } from 'next/server';
import { requireProjectAccess } from '@/lib/auth/rbac';
import { db } from '@/lib/store';
import { generateSecurityReportPdfBuffer } from '@/lib/security/pdf-report-generator';

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

  try {
    const url = new URL(req.url);
    const comprehensive = url.searchParams.get('comprehensive') === 'true';

    const pdfBuffer = await generateSecurityReportPdfBuffer(report, {
      comprehensiveMode: comprehensive,
      includeFullAppendices: true,
    });

    const filename = `DEFYRA-Security-Report-${report.assessmentId}-v${report.version}.pdf`;

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.length),
        'X-Report-SHA256': report.reportHash,
        'X-Report-Version': String(report.version),
        'X-Report-Status': report.status,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, data: null, error: { code: 'PDF_GENERATION_FAILED', message: errorMsg } },
      { status: 500 }
    );
  }
}
