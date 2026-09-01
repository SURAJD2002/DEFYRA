import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/store';
import { enforceAssessmentScope } from '@/lib/security/scope-enforcer';
import { SecretProvider, RestEndpointAdapter, RagEndpointAdapter, AgentToolAdapter } from '@/lib/security/target-adapter';
import { generateAssessmentReport } from '@/lib/security/report-generator';
import { Assessment, FindingRecord, RemediationRecord, RetestRecord } from '@/types';

describe('Phase 6: Customer-Ready AI Security Assessment Foundation', () => {
  const orgId = 'org_phase6_test_01';
  const projectId = 'prj_phase6_test_01';
  const userId = 'usr_phase6_lead_01';

  let assessment: Assessment;

  beforeEach(() => {
    assessment = {
      id: 'asm_p6_01',
      organizationId: orgId,
      projectId: projectId,
      name: 'Q3 Enterprise AI Security Assessment',
      description: 'Customer assessment evaluating agentic tools and RAG boundaries',
      assessmentType: 'AGENT_SECURITY',
      environment: 'staging',
      status: 'AUTHORIZED',
      rulesOfEngagementVersion: 'v1.0.0',
      scopeAgreementHash: 'a1b2c3d4e5f678901234567890abcdef',
      scope: {
        authorizedAssetIds: ['ast_target_agent_01', 'ast_target_rag_01'],
        authorizedTestIds: ['DEF-INJ-001', 'DEF-AUT-001', 'DEF-RAG-001'],
        authorizedEnvironments: ['staging'],
        testingWindowStart: '2026-01-01T00:00:00Z',
        testingWindowEnd: '2026-12-31T23:59:59Z',
        prohibitedActions: ['NO_DENIAL_OF_SERVICE', 'NO_UNAUTHORIZED_EXTERNAL_SCANS'],
        emergencyContact: 'security-ops@customer.com',
        killSwitchAuthority: 'DEFYRA_AND_CUSTOMER_LEAD',
        productionApproved: false,
      },
      testPlan: [
        { testId: 'DEF-INJ-001', enabled: true, priority: 'HIGH', order: 1, status: 'PENDING' },
        { testId: 'DEF-AUT-001', enabled: true, priority: 'CRITICAL', order: 2, status: 'PENDING' },
      ],
      createdBy: userId,
      createdAt: new Date().toISOString(),
    };
    db.createAssessment(assessment);
  });

  // ---------------------------------------------------------------------------
  // 1. Rules of Engagement & Scope Enforcement
  // ---------------------------------------------------------------------------
  it('1. Allows execution when request strictly complies with authorized scope', () => {
    const check = enforceAssessmentScope(assessment, {
      assetId: 'ast_target_agent_01',
      testId: 'DEF-INJ-001',
      environment: 'staging',
      timestamp: '2026-06-01T12:00:00Z',
    });
    expect(check.allowed).toBe(true);
  });

  it('2. Blocks execution when test ID is outside authorized scope', () => {
    const check = enforceAssessmentScope(assessment, {
      assetId: 'ast_target_agent_01',
      testId: 'DEF-MCP-001', // NOT in authorizedTestIds
      environment: 'staging',
    });
    expect(check.allowed).toBe(false);
    expect(check.code).toBe('TEST_OUT_OF_SCOPE');
  });

  it('3. Blocks execution when asset ID is outside authorized scope', () => {
    const check = enforceAssessmentScope(assessment, {
      assetId: 'ast_unauthorized_external_99',
      testId: 'DEF-INJ-001',
      environment: 'staging',
    });
    expect(check.allowed).toBe(false);
    expect(check.code).toBe('ASSET_OUT_OF_SCOPE');
  });

  it('4. Blocks execution when environment does not match authorized scope', () => {
    const check = enforceAssessmentScope(assessment, {
      assetId: 'ast_target_agent_01',
      testId: 'DEF-INJ-001',
      environment: 'production', // Mismatch with staging
    });
    expect(check.allowed).toBe(false);
    expect(check.code).toBe('ENVIRONMENT_MISMATCH');
  });

  it('5. Blocks execution when testing window has expired', () => {
    const check = enforceAssessmentScope(assessment, {
      assetId: 'ast_target_agent_01',
      testId: 'DEF-INJ-001',
      environment: 'staging',
      timestamp: '2027-01-01T00:00:00Z', // Expired
    });
    expect(check.allowed).toBe(false);
    expect(check.code).toBe('TESTING_WINDOW_EXPIRED');
  });

  it('6. Blocks execution when assessment status is DRAFT or COMPLETED', () => {
    const draftAsm = { ...assessment, status: 'DRAFT' as const };
    const check = enforceAssessmentScope(draftAsm, {
      assetId: 'ast_target_agent_01',
      testId: 'DEF-INJ-001',
      environment: 'staging',
    });
    expect(check.allowed).toBe(false);
    expect(check.code).toBe('ASSESSMENT_STATUS_INVALID');
  });

  // ---------------------------------------------------------------------------
  // 2. Target Adapters & Secret Redaction
  // ---------------------------------------------------------------------------
  it('7. Target adapters validate safe endpoints and reject prohibited SSRF targets', () => {
    const adapter = new RestEndpointAdapter();
    const safeCheck = adapter.validate({
      adapterType: 'REST_ENDPOINT',
      endpointUrl: 'https://agent.defyra.sandbox/v1',
    });
    expect(safeCheck.valid).toBe(true);

    const ssrfCheck = adapter.validate({
      adapterType: 'REST_ENDPOINT',
      endpointUrl: 'http://169.254.169.254/latest/meta-data',
    });
    expect(ssrfCheck.valid).toBe(false);
    expect(ssrfCheck.reason).toContain('Egress Guard');
  });

  it('8. SecretProvider redacts customer secrets and canary tokens in evidence', () => {
    SecretProvider.storeSecret('sec_ref_01', 'sk-customer-live-secret-999');
    const rawObs = 'Agent output exposed key: sk-customer-live-secret-999 and DEFYRA_CANARY_TOKEN_001';
    const clean = SecretProvider.sanitize(rawObs);

    expect(clean).not.toContain('sk-customer-live-secret-999');
    expect(clean).not.toContain('DEFYRA_CANARY_TOKEN_001');
    expect(clean).toContain('[REDACTED_CUSTOMER_SECRET]');
    expect(clean).toContain('[REDACTED_CANARY_SECRET]');
    SecretProvider.clear();
  });

  // ---------------------------------------------------------------------------
  // 3. Finding Review, Remediation & Retest
  // ---------------------------------------------------------------------------
  it('9. Human review transitions finding candidate to confirmed, opens remediation, and resolves via retest', () => {
    const finding = db.createFinding({
      id: 'fnd_p6_01',
      organizationId: orgId,
      projectId: projectId,
      assessmentId: assessment.id,
      testId: 'DEF-AUT-001',
      title: 'Tool Permission Boundary Bypass',
      description: 'Agent tool broker allowed unauthorized caller execution.',
      severity: 'CRITICAL',
      confidence: 0.95,
      riskScore: 9.5,
      riskModelVersion: 'v0.1',
      status: 'CANDIDATE',
      impact: 'Privilege Escalation',
      attackScenario: 'Standard user called export_all_customers',
      recommendation: 'Enforce server-side capability check',
      observationIds: ['obs_1'],
      evidenceIds: ['ev_1'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Human Review: Confirm finding
    const confirmed = db.updateFinding(finding.id, {
      status: 'CONFIRMED',
      reviewedBy: userId,
      reviewedAt: new Date().toISOString(),
      reviewNotes: 'Verified vulnerability on tool proxy.',
    });
    expect(confirmed?.status).toBe('CONFIRMED');

    // Create Remediation
    const remediation = db.createRemediation({
      id: 'rem_p6_01',
      organizationId: orgId,
      projectId: projectId,
      assessmentId: assessment.id,
      findingId: finding.id,
      title: 'Implement RBAC filter in tool dispatcher',
      description: 'Check caller session scope before executing tools.',
      priority: 'CRITICAL',
      recommendedAction: 'Apply verify_capability middleware.',
      owner: 'Customer Lead Dev',
      status: 'READY_FOR_RETEST',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    expect(remediation.status).toBe('READY_FOR_RETEST');

    // Execute Retest
    const retest = db.createRetest({
      id: 'rt_p6_01',
      organizationId: orgId,
      projectId: projectId,
      assessmentId: assessment.id,
      findingId: finding.id,
      testRunId: 'tr_p6_retest_01',
      previousResult: 'FAILED',
      retestResult: 'PASS',
      behaviorChange: 'Middleware returned 403 Forbidden.',
      performedBy: userId,
      createdAt: new Date().toISOString(),
    });
    expect(retest.retestResult).toBe('PASS');

    // Finding updated to RESOLVED
    const resolvedFinding = db.updateFinding(finding.id, { status: 'RESOLVED' });
    expect(resolvedFinding?.status).toBe('RESOLVED');
  });

  // ---------------------------------------------------------------------------
  // 4. Professional Assessment Report & SHA-256 Integrity
  // ---------------------------------------------------------------------------
  it('10. Generates customer assessment report with SHA-256 content integrity hash', () => {
    const report = generateAssessmentReport({
      assessment,
      findings: [],
      remediations: [],
      retests: [],
      generatedByUserId: userId,
    });

    expect(report.title).toContain(assessment.name);
    expect(report.reportHash.length).toBe(64); // Valid SHA-256 hex string
    expect(report.content.methodology).toContain('DEFYRA');
    expect(report.content.limitations[2]).toContain('integrity');
  });
});
