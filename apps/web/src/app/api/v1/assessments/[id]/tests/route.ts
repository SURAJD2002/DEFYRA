import { NextRequest, NextResponse } from 'next/server';
import { requireProjectAccess } from '@/lib/auth/rbac';
import { db } from '@/lib/store';
import { logAuditEvent } from '@/lib/audit-logger';
import { securityEngineDispatcher } from '@/lib/security-engine/dispatcher';
import { validateExecutionTarget } from '@/lib/security/target-validator';
import { evaluateRiskModelV01 } from '@/lib/security/risk-model';
import { FindingRecord, TestRun } from '@/types';

import { enforceAssessmentScope } from '@/lib/security/scope-enforcer';

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

  const projectCheck = await requireProjectAccess(req, assessment.projectId, 'test:execute');
  if (projectCheck.errorResponse || !projectCheck.ctx) return projectCheck.errorResponse!;

  const { project, organization, user, membership } = projectCheck.ctx;

  // 1. Initial Assessment Scope & Status Gate
  const validExecutableStatuses = new Set(['AUTHORIZED', 'READY', 'RUNNING', 'RETEST']);
  if (!validExecutableStatuses.has(assessment.status)) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: 'ASSESSMENT_STATUS_INVALID',
          message: `Assessment '${assessment.id}' is in status '${assessment.status}'. Execution requires an AUTHORIZED or READY assessment.`,
        },
      },
      { status: 403 }
    );
  }

  if (assessment.paymentStatus && !['PAYMENT_CONFIRMED', 'ASSESSMENT_AUTHORIZED', 'WAIVED_FOR_PILOT'].includes(assessment.paymentStatus)) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: 'PAYMENT_NOT_CONFIRMED',
          message: `Assessment execution blocked: Commercial payment status is '${assessment.paymentStatus}'.`,
        },
      },
      { status: 403 }
    );
  }

  // Execute all enabled tests in the assessment plan against authorized assets
  db.updateAssessment(assessment.id, { status: 'RUNNING', startedAt: new Date().toISOString() });

  const executionResults: any[] = [];
  const generatedFindings: FindingRecord[] = [];

  for (const testPlanItem of assessment.testPlan) {
    if (!testPlanItem.enabled) continue;

    for (const assetId of assessment.scope.authorizedAssetIds) {
      const asset = db.findAssetById(assetId);
      if (!asset) continue;

      // 1. Machine-Enforceable Assessment Scope Check
      const scopeCheck = enforceAssessmentScope(assessment, {
        assetId: asset.id,
        testId: testPlanItem.testId,
        environment: assessment.environment,
      });

      if (!scopeCheck.allowed) {
        testPlanItem.status = 'FAILED';
        continue;
      }

      const targetValidation = validateExecutionTarget({
        organizationId: organization.id,
        projectId: project.id,
        assetId: asset.id,
        testId: testPlanItem.testId,
        environment: assessment.environment,
        userRole: membership.role,
      });

      if (!targetValidation.valid) {
        testPlanItem.status = 'FAILED';
        continue;
      }

      const targetEndpoint = targetValidation.resolvedTarget.targetEndpoint;
      const testRunId = `tr_asm_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
      const requestId = `req_asm_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

      const testRun: TestRun = {
        id: testRunId,
        organizationId: organization.id,
        projectId: project.id,
        assetId: asset.id,
        testId: testPlanItem.testId,
        environment: assessment.environment,
        status: 'QUEUED',
        requestedBy: user.id,
        requestId,
        createdAt: new Date().toISOString(),
        observations: [],
        stageResults: [],
        evidence: [],
        metadata: {
          assessmentId: assessment.id,
          assetName: asset.name,
        },
      };
      db.createTestRun(testRun);

      // Dispatch to Sandboxed Python Engine
      const dispatchOutcome = await securityEngineDispatcher.dispatchTestRun({
        testRun,
        project,
        asset,
        authorizedTargetUrl: targetEndpoint,
        userId: user.id,
      });

      const updatedRun = db.findTestRunById(testRunId);
      executionResults.push(updatedRun);

      testPlanItem.status = updatedRun?.status === 'PASSED' ? 'PASSED' : 'FAILED';
      testPlanItem.lastRunId = testRunId;

      // If a finding candidate is produced, register in assessment findings
      if (updatedRun?.findingCandidate) {
        const fc = updatedRun.findingCandidate;
        const riskEval = evaluateRiskModelV01({
          severity: fc.severity,
          confidence: fc.confidence,
          assetCriticality: 'HIGH',
          autonomyLevel: 'HIGH',
        });

        const finding: FindingRecord = {
          id: `find_asm_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`,
          organizationId: organization.id,
          projectId: project.id,
          assessmentId: assessment.id,
          testRunId: testRun.id,
          affectedAssetId: asset.id,
          testId: testPlanItem.testId,
          title: fc.title,
          description: fc.description,
          severity: fc.severity,
          confidence: fc.confidence,
          riskScore: riskEval.riskScore,
          riskModelVersion: 'v0.1',
          status: 'CANDIDATE', // Enforce quality gate
          impact: 'Potential unauthorized system instruction manipulation or excessive tool access.',
          attackScenario: 'Adversarial instruction content injected into model context.',
          recommendation: fc.recommendation || 'Implement strict input-instruction boundary sanitization.',
          observationIds: (updatedRun.observations || []).map((o: any) => o.observationId),
          evidenceIds: (updatedRun.evidence || []).map((e: any) => e.evidenceId),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        db.createFinding(finding);
        generatedFindings.push(finding);
      }
    }
  }

  db.updateAssessment(assessment.id, {
    status: 'REVIEW',
    testPlan: assessment.testPlan,
  });

  await logAuditEvent({
    action: 'ASSESSMENT_PLAN_EXECUTED',
    resourceType: 'ASSESSMENT',
    resourceId: assessment.id,
    organizationId: organization.id,
    userId: user.id,
    metadata: {
      testsExecuted: executionResults.length,
      findingsGenerated: generatedFindings.length,
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      assessmentId: assessment.id,
      status: 'REVIEW',
      executionCount: executionResults.length,
      findingsCreated: generatedFindings.length,
      findings: generatedFindings,
    },
    error: null,
  });
}
