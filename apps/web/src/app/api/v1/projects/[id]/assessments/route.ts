import { NextRequest, NextResponse } from 'next/server';
import { requireProjectAccess } from '@/lib/auth/rbac';
import { createAssessmentSchema } from '@/lib/validation';
import { db } from '@/lib/store';
import { logAuditEvent } from '@/lib/audit-logger';
import { Assessment, TestCasePlan } from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectCheck = await requireProjectAccess(req, params.id, 'project:read');
  if (projectCheck.errorResponse || !projectCheck.ctx) return projectCheck.errorResponse!;

  const assessments = db.listAssessmentsForProject(params.id);

  return NextResponse.json({
    success: true,
    data: assessments,
    error: null,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectCheck = await requireProjectAccess(req, params.id, 'project:update');
  if (projectCheck.errorResponse || !projectCheck.ctx) return projectCheck.errorResponse!;

  const { project, organization, user } = projectCheck.ctx;

  try {
    const rawBody = await req.json();
    const parseResult = createAssessmentSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid assessment creation parameters.',
            details: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Validate that all authorized assets belong to this project
    const projectAssets = db.listAssetsForProject(project.id);
    const validAssetIds = new Set(projectAssets.map((a) => a.id));

    for (const assetId of data.authorizedAssetIds) {
      if (!validAssetIds.has(assetId)) {
        return NextResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: 'ASSET_SCOPE_VIOLATION',
              message: `Asset '${assetId}' does not belong to project '${project.name}'.`,
            },
          },
          { status: 403 }
        );
      }
    }

    // Build initial test plan
    const testPlan: TestCasePlan[] = data.authorizedTestIds.map((testId, idx) => ({
      testId,
      enabled: true,
      priority: 'HIGH',
      order: idx + 1,
      status: 'PENDING',
      expectedBehavior: 'Target model/agent must adhere to security constraints and reject unauthorized instructions.',
    }));

    const now = new Date().toISOString();
    const assessment: Assessment = {
      id: `asm_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`,
      organizationId: organization.id,
      projectId: project.id,
      name: data.name,
      description: data.description,
      assessmentType: data.assessmentType,
      environment: data.environment,
      status: 'READY',
      paymentStatus: data.paymentStatus || 'PAYMENT_CONFIRMED',
      paymentReference: data.paymentReference || null,
      scope: {
        authorizedAssetIds: data.authorizedAssetIds,
        authorizedTestIds: data.authorizedTestIds,
        authorizedEnvironments: [data.environment],
        testingWindowStart: data.testingWindowStart,
        testingWindowEnd: data.testingWindowEnd,
        productionApproved: data.productionApproved,
        writtenAuthorizationReference: data.writtenAuthorizationReference,
      },
      testPlan,
      createdBy: user.id,
      createdAt: now,
    };

    db.createAssessment(assessment);

    await logAuditEvent({
      action: 'ASSESSMENT_CREATED',
      resourceType: 'ASSESSMENT',
      resourceId: assessment.id,
      organizationId: organization.id,
      userId: user.id,
      metadata: {
        projectId: project.id,
        assessmentType: assessment.assessmentType,
        authorizedAssetsCount: data.authorizedAssetIds.length,
        testCount: testPlan.length,
      },
    });

    return NextResponse.json({
      success: true,
      data: assessment,
      error: null,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: 'INTERNAL_ERROR', message: `Failed to create assessment: ${errorMsg}` },
      },
      { status: 500 }
    );
  }
}
