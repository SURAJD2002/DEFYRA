/**
 * Server-Side Security Engine Dispatcher
 * Bridges Next.js Authenticated Context to Internal Sandboxed Python Worker
 */

import { issueExecutionCapabilityToken } from '@/lib/auth/capability-token';
import { auditLogger } from '@/lib/audit-logger';
import { db } from '@/lib/store';
import { Asset, FindingRecord, Project, TestRun } from '@/types';

export interface DispatchResult {
  success: boolean;
  status: 'DISPATCHED' | 'PASSED' | 'FAILED' | 'BLOCKED' | 'STOPPED' | 'ERROR';
  testRunId: string;
  error?: string;
}

export class SecurityEngineDispatcher {
  private engineUrl: string;
  private bearerToken: string;

  constructor() {
    this.engineUrl = process.env.SECURITY_ENGINE_URL || 'http://127.0.0.1:8000';
    this.bearerToken = process.env.SERVICE_BEARER_TOKEN || 'defyra-internal-service-token-secret-32bytes!';
  }

  /**
   * Dispatches a scoped test run to the internal Python security engine and persists the result.
   */
  public async dispatchTestRun(params: {
    testRun: TestRun;
    project: Project;
    asset: Asset;
    authorizedTargetUrl: string;
    userId: string;
    parameters?: Record<string, unknown>;
  }): Promise<DispatchResult> {
    const { testRun, project, asset, authorizedTargetUrl, userId, parameters } = params;

    // 1. Issue Cryptographic Scoped Capability Token
    const capability = issueExecutionCapabilityToken({
      organizationId: project.organizationId,
      projectId: project.id,
      assetId: asset.id,
      testRunId: testRun.id,
      allowedTargetUrl: authorizedTargetUrl,
      allowedTestIds: [testRun.testId],
      environment: project.environment,
      requestId: testRun.requestId,
      ttlMs: 300000, // 5 minutes TTL
    });

    // 2. Update status to RUNNING
    db.updateTestRun(testRun.id, {
      status: 'RUNNING',
      startedAt: new Date().toISOString(),
    });

    auditLogger.logSync({
      organizationId: project.organizationId,
      userId,
      action: 'TEST_RUN_DISPATCHED',
      resourceType: 'TEST_RUN',
      resourceId: testRun.id,
      metadata: {
        projectId: project.id,
        assetId: asset.id,
        testId: testRun.testId,
        requestId: testRun.requestId,
      },
    });

    // 3. Dispatch to Python Security Engine
    const dispatchPayload = {
      request_id: testRun.requestId,
      execution_capability: capability.rawToken,
      test_run_id: testRun.id,
      org_id: project.organizationId,
      project_id: project.id,
      asset_id: asset.id,
      test_id: testRun.testId,
      environment: project.environment,
      target_reference: authorizedTargetUrl,
      parameters: parameters || {},
    };

    let response: Response;
    try {
      response = await fetch(`${this.engineUrl}/internal/v1/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.bearerToken}`,
        },
        body: JSON.stringify(dispatchPayload),
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      db.updateTestRun(testRun.id, {
        status: 'ERROR',
        errorCode: 'ENGINE_UNREACHABLE',
        errorMessage: `Failed to connect to Python security engine: ${errorMsg}`,
        completedAt: new Date().toISOString(),
      });

      auditLogger.logSync({
        organizationId: project.organizationId,
        userId,
        action: 'EXECUTION_FAILED',
        resourceType: 'TEST_RUN',
        resourceId: testRun.id,
        metadata: { error: errorMsg, code: 'ENGINE_UNREACHABLE' },
      });

      return {
        success: false,
        status: 'ERROR',
        testRunId: testRun.id,
        error: `Security engine connection failed: ${errorMsg}`,
      };
    }

    if (!response.ok) {
      const errBody = await response.text();
      db.updateTestRun(testRun.id, {
        status: 'ERROR',
        errorCode: `HTTP_${response.status}`,
        errorMessage: `Python engine error response (${response.status}): ${errBody}`,
        completedAt: new Date().toISOString(),
      });

      return {
        success: false,
        status: 'ERROR',
        testRunId: testRun.id,
        error: `Engine returned ${response.status}: ${errBody}`,
      };
    }

    // 4. Parse & Persist Engine Result
    const engineResult = await response.json();
    const completedAt = new Date().toISOString();

    let findingCandidate: FindingRecord | null = null;
    if (engineResult.finding_candidate) {
      const fc = engineResult.finding_candidate;
      findingCandidate = {
        id: `fnd_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`,
        projectId: project.id,
        organizationId: project.organizationId,
        assessmentId: testRun.assessmentId || null,
        testRunId: testRun.id,
        affectedAssetId: asset.id,
        testId: testRun.testId,
        title: fc.title,
        severity: fc.severity,
        riskScore: fc.risk_score || 0,
        riskModelVersion: fc.risk_model_version || 'v0.1',
        description: fc.description,
        confidence: fc.confidence || 1.0,
        evidenceIds: fc.evidence_ids || [],
        observationIds: [],
        impact: fc.impact || 'Potential unauthorized system instruction manipulation or excessive tool access.',
        attackScenario: fc.attack_scenario || 'Adversarial instruction content injected into model context.',
        recommendation: fc.remediation || 'Implement strict input-instruction boundary sanitization.',
        status: 'CANDIDATE',
        createdAt: completedAt,
        updatedAt: completedAt,
      };
      db.createFinding(findingCandidate);

      auditLogger.logSync({
        organizationId: project.organizationId,
        userId,
        action: 'FINDING_CANDIDATE_CREATED',
        resourceType: 'FINDING',
        resourceId: findingCandidate.id,
        metadata: {
          title: findingCandidate.title,
          severity: findingCandidate.severity,
          riskScore: findingCandidate.riskScore,
          testRunId: testRun.id,
        },
      });
    }

    const observations = (engineResult.observations || []).map((o: any) => ({
      observationId: o.observation_id,
      stageId: o.stage_id,
      timestamp: o.timestamp,
      description: o.description,
      rawProbeInput: o.raw_probe_input,
      rawTargetOutput: o.raw_target_output,
      policyViolated: o.policy_violated,
      details: o.details,
    }));

    const evidence = (engineResult.evidence || []).map((e: any) => ({
      evidenceId: e.evidence_id,
      testRunId: e.test_run_id,
      findingId: e.finding_id,
      type: e.type,
      sequence: e.sequence,
      createdAt: e.created_at,
      contentHash: e.content_hash,
      payload: e.payload,
      retentionUntil: e.retention_until,
    }));

    db.updateTestRun(testRun.id, {
      status: engineResult.status,
      completedAt,
      durationMs: engineResult.total_duration_ms || 0,
      errorCode: engineResult.error ? 'EXECUTION_REJECTED' : null,
      errorMessage: engineResult.error || null,
      observations,
      stageResults: engineResult.stage_results || [],
      evidence,
      findingCandidate,
      metadata: engineResult.metrics || {},
    });

    auditLogger.logSync({
      organizationId: project.organizationId,
      userId,
      action: engineResult.status === 'PASSED' ? 'EXECUTION_COMPLETED' : 'EXECUTION_FAILED',
      resourceType: 'TEST_RUN',
      resourceId: testRun.id,
      metadata: {
        status: engineResult.status,
        durationMs: engineResult.total_duration_ms,
        findingCandidateId: findingCandidate?.id,
      },
    });

    return {
      success: engineResult.status === 'PASSED' || engineResult.status === 'FAILED',
      status: engineResult.status,
      testRunId: testRun.id,
      error: engineResult.error,
    };
  }
}

export const securityEngineDispatcher = new SecurityEngineDispatcher();
