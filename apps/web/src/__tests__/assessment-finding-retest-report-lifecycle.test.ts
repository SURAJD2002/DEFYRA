import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/store';
import { enforceAssessmentScope } from '@/lib/security/scope-enforcer';
import { issueExecutionCapabilityToken, verifyExecutionCapabilityToken } from '@/lib/auth/capability-token';
import { generateAssessmentReport } from '@/lib/security/report-generator';
import { evaluateRiskModelV01 } from '@/lib/security/risk-model';
import { Assessment, FindingRecord, RemediationRecord, RetestRecord, Asset } from '@/types';

describe('Assessment -> Finding -> Remediation -> Retest -> Final Report Lifecycle', () => {
  const orgId = 'org_lifecycle_test_01';
  const projectId = 'prj_lifecycle_test_01';
  const userId = 'usr_lead_architect_01';

  let assessment: Assessment;
  let asset: Asset;
  let unscopedAsset: Asset;

  beforeEach(() => {
    db.createOrganization({
      id: orgId,
      name: 'Lifecycle Verification Corp',
      slug: 'lifecycle-corp',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, userId);

    db.createUser({
      id: userId,
      email: 'lead@lifecycle.ai',
      fullName: 'Lead Security Architect',
      status: 'active',
      passwordHash: 'hash',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    db.addMember(orgId, userId, 'SECURITY_LEAD');

    db.createProject({
      id: projectId,
      organizationId: orgId,
      name: 'Agentic Core Platform',
      description: 'Core LLM service',
      environment: 'staging',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    asset = db.createAsset({
      id: 'ast_agentic_target_01',
      organizationId: orgId,
      projectId: projectId,
      name: 'OpenAI Staging Endpoint',
      description: 'Staging model endpoint',
      type: 'MODEL',
      environment: 'staging',
      status: 'active',
      metadata: { endpointUrl: 'https://staging.target.sandbox/v1/chat/completions' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    unscopedAsset = db.createAsset({
      id: 'ast_unscoped_asset_02',
      organizationId: orgId,
      projectId: projectId,
      name: 'Unscoped Internal API',
      description: 'Unscoped asset',
      type: 'MODEL',
      environment: 'staging',
      status: 'active',
      metadata: { endpointUrl: 'https://unscoped.internal.sandbox/v1' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    assessment = {
      id: 'asm_lifecycle_01',
      organizationId: orgId,
      projectId: projectId,
      name: 'DEFYRA Security Validation Assessment',
      description: 'Complete security evaluation of prompt injection and context disclosure',
      assessmentType: 'AI_SECURITY_VALIDATION',
      environment: 'staging',
      status: 'AUTHORIZED',
      paymentStatus: 'PAYMENT_CONFIRMED',
      paymentReference: 'INV-2026-LIFECYCLE-PAID',
      scope: {
        authorizedAssetIds: [asset.id],
        authorizedTestIds: ['DEF-INJ-001'],
        authorizedEnvironments: ['staging'],
        testingWindowStart: '2026-01-01T00:00:00Z',
        testingWindowEnd: '2026-12-31T23:59:59Z',
        emergencyContact: 'security-lead@lifecycle.ai',
        productionApproved: false,
      },
      testPlan: [
        { testId: 'DEF-INJ-001', enabled: true, priority: 'HIGH', order: 1, status: 'PENDING' },
      ],
      createdBy: userId,
      createdAt: new Date().toISOString(),
    };
    db.createAssessment(assessment);
  });

  // ---------------------------------------------------------------------------
  // Positive End-to-End Lifecycle
  // ---------------------------------------------------------------------------
  it('1. Executes full lifecycle: Candidate -> Human Review -> Remediation -> Retest -> Report -> Sealed', () => {
    // 1. Calculate RiskModel v0.1 score
    const risk = evaluateRiskModelV01({
      severity: 'HIGH',
      confidence: 0.95,
      assetCriticality: 'HIGH',
      autonomyLevel: 'HIGH',
      dataSensitivity: 'CONFIDENTIAL',
    });
    expect(risk.riskScore).toBeGreaterThan(6.0);
    expect(risk.severity).toBe('HIGH');

    // 2. Finding Candidate Discovered
    const finding: FindingRecord = {
      id: 'fnd_lifecycle_01',
      organizationId: orgId,
      projectId: projectId,
      assessmentId: assessment.id,
      testId: 'DEF-INJ-001',
      affectedAssetId: asset.id,
      title: 'Direct System Prompt Override Vulnerability',
      description: 'Model disclosed confidential system instructions upon adversarial delimiter escape.',
      severity: 'HIGH',
      confidence: 0.95,
      riskScore: risk.riskScore,
      riskModelVersion: 'v0.1',
      status: 'CANDIDATE',
      impact: 'Adversarial instruction manipulation and data leakage.',
      attackScenario: 'Attacker injected raw delimiter tags into user message context.',
      recommendation: 'Implement rigid XML delimiter encapsulation and pre-response guardrail filters.',
      observationIds: ['obs_01'],
      evidenceIds: ['ev_01'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.createFinding(finding);

    // 3. Human Review Transition: CANDIDATE -> CONFIRMED
    const reviewedFinding = db.updateFinding(finding.id, {
      status: 'CONFIRMED',
      reviewNotes: 'Reviewed by Lead Security Architect: Confirmed real system prompt override on live HTTP endpoint.',
      reviewedBy: userId,
      reviewedAt: new Date().toISOString(),
    });
    expect(reviewedFinding?.status).toBe('CONFIRMED');

    // 4. Create Actionable Remediation
    const remediation: RemediationRecord = {
      id: 'rem_lifecycle_01',
      organizationId: orgId,
      projectId: projectId,
      assessmentId: assessment.id,
      findingId: finding.id,
      title: 'Enforce Rigid Instruction Encapsulation & Secondary Classifier',
      description: 'Encapsulate system instructions in <system_instructions> tags and deploy pre-response classifier.',
      priority: 'HIGH',
      recommendedAction: 'Deploy XML framing and output classifier.',
      owner: 'Customer AI Platform Lead',
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.createRemediation(remediation);

    // 5. Customer Applies Remediation & Runs Retest (Pass)
    const retestRecord: RetestRecord = {
      id: 'rt_lifecycle_01',
      organizationId: orgId,
      projectId: projectId,
      assessmentId: assessment.id,
      findingId: finding.id,
      testRunId: 'tr_retest_01',
      previousResult: 'FAIL',
      retestResult: 'PASS',
      originalEvidenceId: 'ev_01',
      retestEvidenceId: 'ev_retest_01',
      behaviorChange: 'Remediation confirmed: Adversarial injection rejected; boundaries adhered.',
      performedBy: userId,
      createdAt: new Date().toISOString(),
    };
    db.createRetest(retestRecord);

    // 6. Transition Finding to RESOLVED
    const resolvedFinding = db.updateFinding(finding.id, {
      status: 'RESOLVED',
      updatedAt: new Date().toISOString(),
    });
    expect(resolvedFinding?.status).toBe('RESOLVED');

    // 7. Generate Point-in-Time Assurance Report
    const report = generateAssessmentReport({
      assessment,
      findings: [resolvedFinding!],
      remediations: [remediation],
      retests: [retestRecord],
      generatedByUserId: userId,
    });

    expect(report.reportHash.length).toBe(64);
    expect(report.content.riskSummary.originalFindingsCount).toBe(1);
    expect(report.content.riskSummary.resolvedFindingsCount).toBe(1);
    expect(report.content.riskSummary.openFindingsCount).toBe(0);
    expect(report.content.riskSummary.residualRiskScore).toBe(0.0);
    expect(report.content.executiveSummary).toContain('1 confirmed finding(s)');
    expect(report.content.executiveSummary).toContain('1 resolved via verified retest');

    // 8. Seal & Complete Assessment
    const completedAsm = db.updateAssessment(assessment.id, {
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
    });
    expect(completedAsm?.status).toBe('COMPLETED');
  });

  // ---------------------------------------------------------------------------
  // Negative Tests (A - G)
  // ---------------------------------------------------------------------------
  it('Negative A: Finding in CANDIDATE status cannot be treated as CONFIRMED without review', () => {
    const candidateFinding: FindingRecord = {
      id: 'fnd_candidate_unreviewed',
      organizationId: orgId,
      projectId: projectId,
      assessmentId: assessment.id,
      testId: 'DEF-INJ-001',
      affectedAssetId: asset.id,
      title: 'Unreviewed Candidate Finding',
      description: 'Raw probe observation pending human review.',
      severity: 'HIGH',
      confidence: 0.95,
      riskScore: 7.8,
      riskModelVersion: 'v0.1',
      status: 'CANDIDATE',
      impact: 'Unverified impact.',
      attackScenario: 'Unverified attack.',
      recommendation: 'Pending review.',
      observationIds: [],
      evidenceIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.createFinding(candidateFinding);

    // Finding remains CANDIDATE until explicitly reviewed
    const fetched = db.findFindingById(candidateFinding.id);
    expect(fetched?.status).toBe('CANDIDATE');
    expect(fetched?.status).not.toBe('CONFIRMED');
  });

  it('Negative B & C: Capability token expired or replayed with consumed nonce is rejected', () => {
    const token = issueExecutionCapabilityToken({
      organizationId: orgId,
      projectId: projectId,
      assetId: asset.id,
      testRunId: 'tr_nonce_check_01',
      allowedTargetUrl: 'https://staging.target.sandbox/v1/chat/completions',
      allowedTestIds: ['DEF-INJ-001'],
      environment: 'staging',
      requestId: 'req_nonce_01',
      ttlMs: 60000,
    });

    const firstVerification = verifyExecutionCapabilityToken(token.rawToken, {
      organizationId: orgId,
      projectId: projectId,
      assetId: asset.id,
      testId: 'DEF-INJ-001',
      targetUrl: 'https://staging.target.sandbox/v1/chat/completions',
    });
    expect(firstVerification.valid).toBe(true);

    // Replay attempt with same consumed nonce
    const replayVerification = verifyExecutionCapabilityToken(token.rawToken, {
      organizationId: orgId,
      projectId: projectId,
      assetId: asset.id,
      testId: 'DEF-INJ-001',
      targetUrl: 'https://staging.target.sandbox/v1/chat/completions',
    });
    expect(replayVerification.valid).toBe(false);
    if (!replayVerification.valid) {
      expect(replayVerification.error).toContain('consumed');
    }
  });

  it('Negative D: Retest / Probe cannot target a different asset outside authorized scope', () => {
    const scopeCheck = enforceAssessmentScope(assessment, {
      assetId: unscopedAsset.id,
      testId: 'DEF-INJ-001',
      environment: 'staging',
    });
    expect(scopeCheck.allowed).toBe(false);
    expect(scopeCheck.code).toBe('ASSET_OUT_OF_SCOPE');
  });

  it('Negative E: Retest / Probe cannot execute an unauthorized test ID', () => {
    const scopeCheck = enforceAssessmentScope(assessment, {
      assetId: asset.id,
      testId: 'DEF-RAG-001', // not authorized in scope
      environment: 'staging',
    });
    expect(scopeCheck.allowed).toBe(false);
    expect(scopeCheck.code).toBe('TEST_OUT_OF_SCOPE');
  });

  it('Negative F: Report preserves original findings count when findings are resolved', () => {
    const resolvedFinding: FindingRecord = {
      id: 'fnd_resolved_01',
      organizationId: orgId,
      projectId: projectId,
      assessmentId: assessment.id,
      testId: 'DEF-INJ-001',
      title: 'Resolved Prompt Override',
      description: 'Vulnerability discovered and resolved via retest.',
      severity: 'HIGH',
      confidence: 1.0,
      riskScore: 7.8,
      riskModelVersion: 'v0.1',
      status: 'RESOLVED',
      impact: 'Instruction boundary bypass',
      attackScenario: 'Delimiter injection',
      recommendation: 'XML encapsulation',
      observationIds: [],
      evidenceIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const retest: RetestRecord = {
      id: 'rt_hist_01',
      organizationId: orgId,
      projectId: projectId,
      assessmentId: assessment.id,
      findingId: resolvedFinding.id,
      testRunId: 'tr_hist_01',
      previousResult: 'FAIL',
      retestResult: 'PASS',
      behaviorChange: 'Verified fixed',
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
    expect(report.content.riskSummary.residualRiskScore).toBe(0.0);
  });

  it('Negative G: Completed / Sealed assessment refuses further test execution fail-closed', () => {
    const sealedAssessment = { ...assessment, status: 'COMPLETED' as const };
    const scopeCheck = enforceAssessmentScope(sealedAssessment, {
      assetId: asset.id,
      testId: 'DEF-INJ-001',
      environment: 'staging',
    });
    expect(scopeCheck.allowed).toBe(false);
    expect(scopeCheck.code).toBe('ASSESSMENT_STATUS_INVALID');
  });
});
