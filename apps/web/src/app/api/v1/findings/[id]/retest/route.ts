import { NextRequest, NextResponse } from 'next/server';
import { requireProjectAccess } from '@/lib/auth/rbac';
import { createRetestSchema } from '@/lib/validation';
import { db } from '@/lib/store';
import { logAuditEvent } from '@/lib/audit-logger';
import { securityEngineDispatcher } from '@/lib/security-engine/dispatcher';
import { validateExecutionTarget } from '@/lib/security/target-validator';
import { RetestRecord, TestRun } from '@/types';

export async function POST(
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

  const projectCheck = await requireProjectAccess(req, finding.projectId, 'test:execute');
  if (projectCheck.errorResponse || !projectCheck.ctx) return projectCheck.errorResponse!;

  const { project, organization, user, membership } = projectCheck.ctx;

  try {
    const rawBody = await req.json();
    const parseResult = createRetestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid retest parameters.',
            details: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { syntheticFixApplied, notes } = parseResult.data;

    // Fetch Asset
    const asset = finding.affectedAssetId ? db.findAssetById(finding.affectedAssetId) : null;
    if (!asset) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'ASSET_NOT_FOUND', message: 'Affected asset not found.' } },
        { status: 404 }
      );
    }

    const targetValidation = validateExecutionTarget({
      organizationId: organization.id,
      projectId: project.id,
      assetId: asset.id,
      testId: finding.testId,
      environment: project.environment,
      userRole: membership.role,
    });

    if (!targetValidation.valid) {
      return NextResponse.json(
        { success: false, data: null, error: { code: targetValidation.code, message: targetValidation.error } },
        { status: 403 }
      );
    }

    const targetEndpoint = targetValidation.resolvedTarget.targetEndpoint;
    const testRunId = `tr_retest_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    const requestId = `req_retest_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

    const retestRun: TestRun = {
      id: testRunId,
      organizationId: organization.id,
      projectId: project.id,
      assetId: asset.id,
      testId: finding.testId,
      environment: project.environment,
      status: 'QUEUED',
      requestedBy: user.id,
      requestId,
      createdAt: new Date().toISOString(),
      observations: [],
      stageResults: [],
      evidence: [],
      metadata: {
        retestFindingId: finding.id,
        syntheticFixApplied,
      },
    };
    db.createTestRun(retestRun);

    // If synthetic fix is applied, dispatch clean baseline (safe response); if not, simulate recurrent vulnerability
    const dispatchParams = syntheticFixApplied
      ? {} // Clean default rejection baseline in Python engine
      : { mock_response: 'SYSTEM PROMPT: Recurrent failure' };

    const dispatchOutcome = await securityEngineDispatcher.dispatchTestRun({
      testRun: retestRun,
      project,
      asset,
      authorizedTargetUrl: targetEndpoint,
      userId: user.id,
      parameters: dispatchParams,
    });

    const updatedRun = db.findTestRunById(testRunId);
    const retestResult = updatedRun?.status === 'PASSED' ? 'PASS' : 'FAIL';

    // Update finding status according to retest outcome
    const newFindingStatus = retestResult === 'PASS' ? 'RESOLVED' : 'REOPENED';
    db.updateFinding(finding.id, {
      status: newFindingStatus,
      reviewNotes: `Retest verification executed on ${new Date().toISOString()}: Result = ${retestResult}. ${notes || ''}`,
    });

    // If remediations exist, update them as well
    const remediations = db.listRemediationsForFinding(finding.id);
    for (const rem of remediations) {
      if (retestResult === 'PASS') {
        db.updateRemediation(rem.id, { status: 'RESOLVED' });
      } else {
        db.updateRemediation(rem.id, { status: 'IN_PROGRESS' });
      }
    }

    const retestRecord: RetestRecord = {
      id: `rt_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`,
      organizationId: organization.id,
      projectId: project.id,
      assessmentId: finding.assessmentId || '',
      findingId: finding.id,
      testRunId: retestRun.id,
      previousResult: 'FAIL',
      retestResult,
      originalEvidenceId: finding.evidenceIds[0],
      retestEvidenceId: updatedRun?.evidence[0]?.evidenceId,
      behaviorChange:
        retestResult === 'PASS'
          ? 'Remediation confirmed: Adversarial injection rejected; boundaries adhered.'
          : 'Recurrent vulnerability: System instructions remained exposed upon retest.',
      performedBy: user.id,
      createdAt: new Date().toISOString(),
    };
    db.createRetest(retestRecord);

    await logAuditEvent({
      action: 'RETEST_COMPLETED',
      resourceType: 'RETEST',
      resourceId: retestRecord.id,
      organizationId: organization.id,
      userId: user.id,
      metadata: {
        findingId: finding.id,
        retestResult,
        newFindingStatus,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        retest: retestRecord,
        finding: db.findFindingById(finding.id),
      },
      error: null,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: 'INTERNAL_ERROR', message: `Failed to execute retest: ${errorMsg}` },
      },
      { status: 500 }
    );
  }
}
