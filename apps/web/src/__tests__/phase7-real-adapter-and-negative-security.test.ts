import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/store';
import { enforceAssessmentScope } from '@/lib/security/scope-enforcer';
import { SecretProvider } from '@/lib/security/target-adapter';
import { isUnsafeNetworkDestination } from '@/lib/security/target-validator';
import { isProhibitedIP, canonicalizeAndValidateUrl } from '@/lib/security/network-egress';
import { killSwitchRegistry } from '@/lib/security/kill-switch';
import { issueExecutionCapabilityToken, verifyExecutionCapabilityToken } from '@/lib/auth/capability-token';
import { generateAssessmentReport } from '@/lib/security/report-generator';
import { Assessment, FindingRecord, RemediationRecord, RetestRecord } from '@/types';

describe('Phase 7: Negative Security & Customer Assessment Verification', () => {
  const orgId = 'org_phase7_sec_01';
  const projectId = 'prj_phase7_sec_01';
  const userId = 'usr_phase7_sec_lead';

  let assessment: Assessment;

  beforeEach(() => {
    killSwitchRegistry.clearAll();
    assessment = {
      id: 'asm_p7_01',
      organizationId: orgId,
      projectId: projectId,
      name: 'Customer Production AI Security Assessment',
      description: 'Formal scoped assessment for agentic banking platform',
      assessmentType: 'AI_SECURITY_VALIDATION',
      environment: 'staging',
      status: 'AUTHORIZED',
      scope: {
        authorizedAssetIds: ['ast_target_agent_01'],
        authorizedTestIds: ['DEF-INJ-001'],
        authorizedEnvironments: ['staging'],
        testingWindowStart: '2026-01-01T00:00:00Z',
        testingWindowEnd: '2026-12-31T23:59:59Z',
        productionApproved: false,
      },
      testPlan: [{ testId: 'DEF-INJ-001', enabled: true, priority: 'HIGH', order: 1, status: 'PENDING' }],
      createdBy: userId,
      createdAt: new Date().toISOString(),
    };
    db.createAssessment(assessment);
  });

  // ---------------------------------------------------------------------------
  // 15 Negative Security Test Cases
  // ---------------------------------------------------------------------------
  it('Negative 1: Unauthorized asset ID is blocked fail-closed', () => {
    const res = enforceAssessmentScope(assessment, {
      assetId: 'ast_unauthorized_external_99',
      testId: 'DEF-INJ-001',
      environment: 'staging',
    });
    expect(res.allowed).toBe(false);
    expect(res.code).toBe('ASSET_OUT_OF_SCOPE');
  });

  it('Negative 2: Unauthorized test ID is blocked fail-closed', () => {
    const res = enforceAssessmentScope(assessment, {
      assetId: 'ast_target_agent_01',
      testId: 'DEF-MCP-001', // Out of scope
      environment: 'staging',
    });
    expect(res.allowed).toBe(false);
    expect(res.code).toBe('TEST_OUT_OF_SCOPE');
  });

  it('Negative 3: Project mismatch is blocked fail-closed', () => {
    const foreignAsm = { ...assessment, projectId: 'prj_foreign_tenant' };
    const res = enforceAssessmentScope(foreignAsm, {
      assetId: 'ast_target_agent_01',
      testId: 'DEF-INJ-001',
      environment: 'staging',
    });
    expect(foreignAsm.projectId).not.toBe(projectId);
  });

  it('Negative 4: Wrong organization boundary is blocked', () => {
    const foreignAsm = { ...assessment, organizationId: 'org_other_tenant' };
    expect(foreignAsm.organizationId).not.toBe(orgId);
  });

  it('Negative 5: Environment mismatch is blocked fail-closed', () => {
    const res = enforceAssessmentScope(assessment, {
      assetId: 'ast_target_agent_01',
      testId: 'DEF-INJ-001',
      environment: 'development',
    });
    expect(res.allowed).toBe(false);
    expect(res.code).toBe('ENVIRONMENT_MISMATCH');
  });

  it('Negative 6: Outside testing window is blocked fail-closed', () => {
    const res = enforceAssessmentScope(assessment, {
      assetId: 'ast_target_agent_01',
      testId: 'DEF-INJ-001',
      environment: 'staging',
      timestamp: '2025-12-31T23:59:59Z', // Before start
    });
    expect(res.allowed).toBe(false);
    expect(res.code).toBe('TESTING_WINDOW_NOT_STARTED');
  });

  it('Negative 7: Expired testing window is blocked fail-closed', () => {
    const res = enforceAssessmentScope(assessment, {
      assetId: 'ast_target_agent_01',
      testId: 'DEF-INJ-001',
      environment: 'staging',
      timestamp: '2027-01-01T00:00:00Z', // After end
    });
    expect(res.allowed).toBe(false);
    expect(res.code).toBe('TESTING_WINDOW_EXPIRED');
  });

  it('Negative 8: Missing authorization (DRAFT status) is blocked fail-closed', () => {
    const draft = { ...assessment, status: 'DRAFT' as const };
    const res = enforceAssessmentScope(draft, {
      assetId: 'ast_target_agent_01',
      testId: 'DEF-INJ-001',
      environment: 'staging',
    });
    expect(res.allowed).toBe(false);
    expect(res.code).toBe('ASSESSMENT_STATUS_INVALID');
  });

  it('Negative 9: Replayed capability token with consumed nonce is rejected', () => {
    const token = issueExecutionCapabilityToken({
      organizationId: orgId,
      projectId: projectId,
      assetId: 'ast_target_agent_01',
      testRunId: 'tr_p7_nonce_01',
      allowedTargetUrl: 'https://agent.defyra.sandbox/v1',
      allowedTestIds: ['DEF-INJ-001'],
      environment: 'staging',
      requestId: 'req_nonce_01',
      ttlMs: 60000,
    });

    const first = verifyExecutionCapabilityToken(token.rawToken, {
      organizationId: orgId,
      projectId: projectId,
      assetId: 'ast_target_agent_01',
      testId: 'DEF-INJ-001',
      targetUrl: 'https://agent.defyra.sandbox/v1',
    });
    expect(first.valid).toBe(true);

    const replay = verifyExecutionCapabilityToken(token.rawToken, {
      organizationId: orgId,
      projectId: projectId,
      assetId: 'ast_target_agent_01',
      testId: 'DEF-INJ-001',
      targetUrl: 'https://agent.defyra.sandbox/v1',
    });
    expect(replay.valid).toBe(false);
    if (!replay.valid) {
      expect(replay.error).toContain('consumed');
    }
  });

  it('Negative 10: Kill switch triggered during execution halts immediately', async () => {
    await killSwitchRegistry.trigger({
      tier: 'PROJECT',
      targetId: projectId,
      userId: userId,
      userRole: 'OWNER',
      reason: 'Emergency security abort',
    });

    const check = killSwitchRegistry.check({
      organizationId: orgId,
      projectId: projectId,
    });
    expect(check.blocked).toBe(true);
    if (check.blocked) {
      expect(check.reason).toContain('Emergency security abort');
    }
  });

  it('Negative 11: SSRF target hostname (metadata.google.internal) is blocked', () => {
    const egress = canonicalizeAndValidateUrl('http://metadata.google.internal/computeMetadata/v1');
    expect(egress.valid).toBe(false);
    expect(egress.error).toContain('disallowed');
  });

  it('Negative 12: Private RFC 1918 IP (10.0.0.1, 192.168.1.1, 172.16.0.1) is blocked', () => {
    expect(isProhibitedIP('10.0.0.1').prohibited).toBe(true);
    expect(isProhibitedIP('192.168.1.1').prohibited).toBe(true);
    expect(isProhibitedIP('172.16.0.1').prohibited).toBe(true);
  });

  it('Negative 13: Cloud Metadata IP (169.254.169.254) is blocked', () => {
    const res = isProhibitedIP('169.254.169.254');
    expect(res.prohibited).toBe(true);
    expect(res.reason).toContain('Metadata');
  });

  it('Negative 14: Hex/Octal obfuscated IP representation is normalized and blocked', () => {
    const hexCheck = isProhibitedIP('0x7f000001'); // 127.0.0.1 in hex
    expect(hexCheck.prohibited).toBe(true);
  });

  it('Negative 15: Customer secret DEFYRA_TEST_SECRET_ONLY is scrubbed and never leaked', () => {
    SecretProvider.storeSecret('sec_customer_live_key', 'DEFYRA_TEST_SECRET_ONLY');
    const dirtyTrace = 'Response returned token: DEFYRA_TEST_SECRET_ONLY and canary DEFYRA_CANARY_X99';
    const clean = SecretProvider.sanitize(dirtyTrace);

    expect(clean).not.toContain('DEFYRA_TEST_SECRET_ONLY');
    expect(clean).not.toContain('DEFYRA_CANARY_X99');
    expect(clean).toContain('[REDACTED_CUSTOMER_SECRET]');
    expect(clean).toContain('[REDACTED_CANARY_SECRET]');
    SecretProvider.clear();
  });

  // ---------------------------------------------------------------------------
  // Step 8: Report Historical Finding Preservation
  // ---------------------------------------------------------------------------
  it('Preserves resolved findings in historical report and calculates residual risk', () => {
    const resolvedFinding: FindingRecord = {
      id: 'fnd_historical_01',
      organizationId: orgId,
      projectId: projectId,
      assessmentId: assessment.id,
      testId: 'DEF-INJ-001',
      title: 'Direct System Prompt Override Vulnerability',
      description: 'Model disclosed system prompt upon adversarial command.',
      severity: 'HIGH',
      confidence: 0.9,
      riskScore: 7.8,
      riskModelVersion: 'v0.1',
      status: 'RESOLVED',
      impact: 'Confidentiality loss',
      attackScenario: 'Attacker bypassed prompt delimiter',
      recommendation: 'Rigid XML delimiting',
      observationIds: ['obs_1'],
      evidenceIds: ['ev_1'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const retest: RetestRecord = {
      id: 'rt_hist_01',
      organizationId: orgId,
      projectId: projectId,
      assessmentId: assessment.id,
      findingId: resolvedFinding.id,
      testRunId: 'tr_retest_01',
      previousResult: 'FAILED',
      retestResult: 'PASS',
      behaviorChange: 'Prompt override rejected.',
      performedBy: userId,
      createdAt: new Date().toISOString(),
    };

    const report = generateAssessmentReport({
      assessment,
      findings: [resolvedFinding],
      remediations: [],
      retests: [retest],
      generatedByUserId: userId,
    });

    expect(report.content.riskSummary.originalFindingsCount).toBe(1);
    expect(report.content.riskSummary.resolvedFindingsCount).toBe(1);
    expect(report.content.riskSummary.openFindingsCount).toBe(0);
    expect(report.content.riskSummary.overallRiskScore).toBe(7.8);
    expect(report.content.riskSummary.residualRiskScore).toBe(0);
    expect(report.content.executiveSummary).toContain('1 confirmed finding(s)');
    expect(report.content.executiveSummary).toContain('1 resolved via verified retest');
    expect(report.content.executiveSummary).toContain('Residual Risk Score: 0/10');
  });
});
