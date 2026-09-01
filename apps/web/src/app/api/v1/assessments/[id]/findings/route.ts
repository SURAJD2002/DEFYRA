import { NextRequest, NextResponse } from 'next/server';
import { requireProjectAccess } from '@/lib/auth/rbac';
import { db } from '@/lib/store';

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

  const projectCheck = await requireProjectAccess(req, assessment.projectId, 'finding:read');
  if (projectCheck.errorResponse || !projectCheck.ctx) return projectCheck.errorResponse!;

  const findings = db.listFindingsForAssessment(assessment.id);

  return NextResponse.json({
    success: true,
    data: findings,
    error: null,
  });
}
