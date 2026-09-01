import { NextRequest, NextResponse } from 'next/server';
import { requireProjectAccess } from '@/lib/auth/rbac';
import { createTestRunSchema } from '@/lib/validation';
import { db } from '@/lib/store';
import { logAuditEvent } from '@/lib/audit-logger';
import { validateExecutionTarget } from '@/lib/security/target-validator';
import { killSwitchRegistry } from '@/lib/security/kill-switch';
import { securityEngineDispatcher } from '@/lib/security-engine/dispatcher';
import { TestRun } from '@/types';

// Supported test catalog IDs in security-engine Phase 5
const SUPPORTED_TEST_IDS = new Set([
  'DEF-INJ-001',
  'DEF-INJ-002',
  'DEF-AGC-001',
  'DEF-AUT-001',
  'DEF-AUT-002',
  'DEF-RAG-001',
  'DEF-RAG-002',
  'DEF-MEM-001',
  'DEF-DAT-003',
  'DEF-IDN-001',
  'DEF-MCP-001',
  'DEF-CHN-001',
]);

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectCheck = await requireProjectAccess(req, params.id, 'project:read');
  if (projectCheck.errorResponse || !projectCheck.ctx) return projectCheck.errorResponse!;

  const testRuns = db.listTestRunsForProject(params.id);

  return NextResponse.json({
    success: true,
    data: testRuns,
    error: null,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. RBAC: User must have 'test:execute' permission on the project
  const projectCheck = await requireProjectAccess(req, params.id, 'test:execute');
  if (projectCheck.errorResponse || !projectCheck.ctx) return projectCheck.errorResponse!;

  const { project, organization, user, membership } = projectCheck.ctx;

  try {
    const rawBody = await req.json();
    const parseResult = createTestRunSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid test run request parameters.',
            details: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { testId, assetId, parameters, assessmentId } = parseResult.data;

    // 2. Validate that test ID exists in the engine catalog
    if (!SUPPORTED_TEST_IDS.has(testId)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'TEST_NOT_FOUND',
            message: `Security test '${testId}' is not registered or active in DEFYRA catalog.`,
          },
        },
        { status: 400 }
      );
    }

    // 3. Validate that Asset belongs to this project (Tenant Isolation)
    const asset = db.findAssetById(assetId);
    if (!asset || asset.projectId !== project.id || asset.organizationId !== organization.id) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'ASSET_SCOPE_VIOLATION',
            message: 'Requested asset does not exist within the authorized project scope.',
          },
        },
        { status: 403 }
      );
    }

    // 4. Resolve Target URL strictly from Asset metadata/configuration
    const rawTarget =
      (asset.metadata?.endpointUrl as string) ||
      (asset.metadata?.url as string) ||
      `https://${asset.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.defyra.sandbox/v1`;

    // 5. Check Kill Switch & Target Policy Gate
    const targetValidation = validateExecutionTarget({
      organizationId: organization.id,
      projectId: project.id,
      assetId: asset.id,
      testId,
      environment: project.environment,
      userRole: membership.role,
    });

    if (!targetValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: targetValidation.code,
            message: targetValidation.error,
          },
        },
        { status: 403 }
      );
    }

    // 6. Create Initial QUEUED Test Run Record
    const now = new Date().toISOString();
    const testRunId = `tr_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
    const requestId = `req_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

    const targetEndpoint = targetValidation.resolvedTarget.targetEndpoint;

    const newTestRun: TestRun = {
      id: testRunId,
      organizationId: organization.id,
      projectId: project.id,
      assessmentId: assessmentId || null,
      assetId: asset.id,
      testId,
      environment: project.environment,
      status: 'QUEUED',
      requestedBy: user.id,
      requestId,
      createdAt: now,
      observations: [],
      stageResults: [],
      evidence: [],
      metadata: {
        assetName: asset.name,
        projectName: project.name,
        targetUrl: targetEndpoint,
      },
    };

    db.createTestRun(newTestRun);

    await logAuditEvent({
      action: 'TEST_RUN_CREATED',
      resourceType: 'TEST_RUN',
      resourceId: newTestRun.id,
      organizationId: organization.id,
      userId: user.id,
      metadata: {
        projectId: project.id,
        assetId: asset.id,
        testId,
        environment: project.environment,
      },
    });

    // 7. Dispatch to Sandboxed Python Engine
    const dispatchOutcome = await securityEngineDispatcher.dispatchTestRun({
      testRun: newTestRun,
      project,
      asset,
      authorizedTargetUrl: targetEndpoint,
      userId: user.id,
      parameters,
    });

    const updatedTestRun = db.findTestRunById(testRunId) || newTestRun;

    return NextResponse.json({
      success: dispatchOutcome.success,
      data: updatedTestRun,
      error: dispatchOutcome.error
        ? {
            code: 'DISPATCH_ERROR',
            message: dispatchOutcome.error,
          }
        : null,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: 'INTERNAL_ERROR',
          message: `Failed to process security test run: ${errorMsg}`,
        },
      },
      { status: 500 }
    );
  }
}
