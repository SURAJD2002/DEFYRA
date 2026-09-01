import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { verifyReportIntegrity } from '@/lib/security/report-generator';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const report = db.findReportById(params.id);
  if (!report) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: 'Report not found for verification.' },
      },
      { status: 404 }
    );
  }

  const verification = verifyReportIntegrity(report.id);

  return NextResponse.json({
    success: true,
    data: verification,
    error: null,
  });
}
