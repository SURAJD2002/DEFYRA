import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/store';
import { generateAssessmentReport, verifyReportIntegrity } from '@/lib/security/report-generator';
import { generateSecurityReportPdfResult } from '@/lib/security/pdf-report-generator';
import { Assessment, FindingRecord, RemediationRecord, RetestRecord, Asset } from '@/types';

describe('Comprehensive Customer Security Reporting System & SHA-256 PDF Engine', () => {
  const orgAId = 'org_tenant_alpha';
  const orgBId = 'org_tenant_beta';
  const projectAId = 'prj_alpha_agent';
  const userLeadAId = 'usr_alpha_sec_lead';
  const userViewerAId = 'usr_alpha_viewer';
  const userLeadBId = 'usr_beta_sec_lead';

  let assessmentA: Assessment;
  let finding1: FindingRecord;
  let findingCandidate: FindingRecord;
  let remediation1: RemediationRecord;
  let retest1: RetestRecord;
  let asset1: Asset;

  beforeEach(() => {
    // Reset and seed database entities
    db.reports.clear();
    db.reportVersions.clear();

    db.createOrganization({
      id: orgAId,
      name: 'Alpha Corporation',
      slug: 'alpha-corp',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, userLeadAId);

    db.createOrganization({
      id: orgBId,
      name: 'Beta Global Industries',
      slug: 'beta-global',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, userLeadBId);

    db.createProject({
      id: projectAId,
      organizationId: orgAId,
      name: 'Alpha Financial LLM Agent',
      description: 'Staging financial assistant',
      environment: 'staging',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    asset1 = db.createAsset({
      id: 'ast_alpha_llm_01',
      organizationId: orgAId,
      projectId: projectAId,
      name: 'Alpha Financial Advisor Endpoint',
      description: 'Customer advisory model',
      type: 'MODEL',
      environment: 'staging',
      status: 'active',
      metadata: { endpointUrl: 'https://staging.alpha.internal/v1/chat' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    assessmentA = {
      id: 'asm_alpha_audit_01',
      organizationId: orgAId,
      projectId: projectAId,
      name: 'Alpha Q3 AI Security Assessment',
      description: 'Staging red team evaluation',
      assessmentType: 'AI_SECURITY_VALIDATION',
      environment: 'staging',
      status: 'READY',
      paymentStatus: 'PAYMENT_CONFIRMED',
      scope: {
        authorizedAssetIds: [asset1.id],
        authorizedTestIds: ['DEF-INJ-001', 'DEF-DAT-003'],
        authorizedEnvironments: ['staging'],
        testingWindowStart: '2026-01-01T00:00:00Z',
        testingWindowEnd: '2026-12-31T23:59:59Z',
        emergencyContact: 'secops@alpha.corp',
        productionApproved: false,
      },
      testPlan: [
        { testId: 'DEF-INJ-001', enabled: true, priority: 'HIGH', order: 1, status: 'PASSED' },
      ],
      createdBy: userLeadAId,
      createdAt: new Date().toISOString(),
    };
    db.createAssessment(assessmentA);

    finding1 = {
      id: 'fnd_alpha_01',
      organizationId: orgAId,
      projectId: projectAId,
      assessmentId: assessmentA.id,
      testId: 'DEF-INJ-001',
      affectedAssetId: asset1.id,
      title: 'Direct System Prompt Override',
      description: 'Model revealed system prompt instructions under delimiter manipulation.',
      severity: 'HIGH',
      confidence: 0.95,
      riskScore: 7.8,
      riskModelVersion: 'v0.1',
      status: 'RESOLVED',
      impact: 'Confidential business prompt disclosed.',
      attackScenario: 'Delimiters injected.',
      recommendation: 'Use XML encapsulation.',
      observationIds: ['obs_01'],
      evidenceIds: ['ev_alpha_01'],
      reviewNotes: 'Confirmed by Lead Reviewer.',
      reviewedBy: userLeadAId,
      reviewedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    findingCandidate = {
      id: 'fnd_alpha_candidate_02',
      organizationId: orgAId,
      projectId: projectAId,
      assessmentId: assessmentA.id,
      testId: 'DEF-DAT-003',
      affectedAssetId: asset1.id,
      title: 'Unreviewed Secret Reflection Candidate',
      description: 'Candidate finding pending human review.',
      severity: 'CRITICAL',
      confidence: 0.9,
      riskScore: 8.5,
      riskModelVersion: 'v0.1',
      status: 'CANDIDATE',
      impact: 'Potential credential disclosure.',
      attackScenario: 'Recursive prompt extraction.',
      recommendation: 'Redact secrets from context buffer.',
      observationIds: ['obs_cand_01'],
      evidenceIds: ['ev_cand_01'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    remediation1 = {
      id: 'rem_alpha_01',
      organizationId: orgAId,
      projectId: projectAId,
      assessmentId: assessmentA.id,
      findingId: finding1.id,
      title: 'Deploy XML Delimiters',
      description: 'Encapsulate user prompt in XML tags.',
      priority: 'HIGH',
      recommendedAction: 'Apply XML encapsulation.',
      owner: 'Alpha AppSec',
      status: 'RESOLVED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    retest1 = {
      id: 'rt_alpha_01',
      organizationId: orgAId,
      projectId: projectAId,
      assessmentId: assessmentA.id,
      findingId: finding1.id,
      testRunId: 'tr_retest_alpha_01',
      previousResult: 'FAIL',
      retestResult: 'PASS',
      originalEvidenceId: 'ev_alpha_01',
      retestEvidenceId: 'ev_alpha_01_pass',
      behaviorChange: 'Prompt override rejected; boundary respected.',
      performedBy: userLeadAId,
      createdAt: new Date().toISOString(),
    };

    db.createFinding(finding1);
    db.createFinding(findingCandidate);
    db.createRemediation(remediation1);
    db.createRetest(retest1);
  });

  // ---------------------------------------------------------------------------
  // 1. Report Creation & Metrics
  // ---------------------------------------------------------------------------
  it('1. Generates a canonical security report with RiskModel v0.1 scores and SHA-256 seal', () => {
    const report = generateAssessmentReport({
      assessment: assessmentA,
      findings: [finding1, findingCandidate],
      remediations: [remediation1],
      retests: [retest1],
      generatedByUserId: userLeadAId,
    });

    expect(report.id).toBeDefined();
    expect(report.status).toBe('READY_FOR_REVIEW');
    expect(report.version).toBe(1);
    expect(report.classification).toBe('CONFIDENTIAL');
    expect(report.reportHash).toHaveLength(64);
    expect(report.sha256Algorithm).toBe('SHA-256');
    expect(report.totalFindings).toBe(2);
    expect(report.resolvedFindings).toBe(1);
    expect(report.openFindings).toBe(1); // candidate is open
    expect(report.initialRiskScore).toBeGreaterThan(0);
    expect(report.content.assetsAssessed).toHaveLength(1);
    expect(report.content.retestResults).toHaveLength(1);
  });

  // ---------------------------------------------------------------------------
  // 2. Cryptographic Integrity Verification
  // ---------------------------------------------------------------------------
  it('2. Successfully validates report integrity against unmodified canonical payload', () => {
    const report = generateAssessmentReport({
      assessment: assessmentA,
      findings: [finding1],
      remediations: [remediation1],
      retests: [retest1],
      generatedByUserId: userLeadAId,
    });

    const verify = verifyReportIntegrity(report.id);
    expect(verify.valid).toBe(true);
    expect(verify.calculatedHash).toBe(report.reportHash);
    expect(verify.storedHash).toBe(report.reportHash);
    expect(verify.message).toContain('Cryptographic integrity verified');
  });

  it('3. Detects tampering when report content is modified post-generation', () => {
    const report = generateAssessmentReport({
      assessment: assessmentA,
      findings: [finding1],
      remediations: [remediation1],
      retests: [retest1],
      generatedByUserId: userLeadAId,
    });

    // Tamper with report content directly in database
    const tampered = db.findReportById(report.id)!;
    tampered.content.executiveSummary = 'TAMPERED CONTENT: Attacker removed finding notice';

    const verify = verifyReportIntegrity(report.id);
    expect(verify.valid).toBe(false);
    expect(verify.calculatedHash).not.toBe(report.reportHash);
    expect(verify.message).toContain('INTEGRITY MISMATCH DETECTED');
  });

  // ---------------------------------------------------------------------------
  // 3. Sealed Report Immutability
  // ---------------------------------------------------------------------------
  it('4. Enforces sealed report immutability, refusing mutations fail-closed', () => {
    const report = generateAssessmentReport({
      assessment: assessmentA,
      findings: [finding1],
      remediations: [remediation1],
      retests: [retest1],
      generatedByUserId: userLeadAId,
    });

    // Seal report
    db.sealReport(report.id, userLeadAId);
    const sealed = db.findReportById(report.id)!;
    expect(sealed.status).toBe('SEALED');
    expect(sealed.sealedBy).toBe(userLeadAId);
    expect(sealed.sealedAt).toBeDefined();

    // Attempting to mutate sealed report must throw fail-closed
    expect(() => {
      db.updateReport(report.id, { title: 'Illegal Modified Title' });
    }).toThrow(/Cannot mutate a SEALED security report/);
  });

  // ---------------------------------------------------------------------------
  // 4. Report Versioning
  // ---------------------------------------------------------------------------
  it('5. Creates immutable historical report versions when regenerated', () => {
    const reportV1 = generateAssessmentReport({
      assessment: assessmentA,
      findings: [finding1],
      remediations: [remediation1],
      retests: [retest1],
      generatedByUserId: userLeadAId,
    });
    expect(reportV1.version).toBe(1);

    // Regenerate report (e.g. after adding second finding)
    const reportV2 = generateAssessmentReport({
      assessment: assessmentA,
      findings: [finding1, findingCandidate],
      remediations: [remediation1],
      retests: [retest1],
      generatedByUserId: userLeadAId,
    });

    expect(reportV2.version).toBe(2);
    const versions = db.listReportVersions(reportV1.id);
    expect(versions).toHaveLength(1);
    expect(versions[0].versionNumber).toBe(1);
    expect(versions[0].reportHash).toBe(reportV1.reportHash);
  });

  // ---------------------------------------------------------------------------
  // 5. PDF Generation & Exact Page Count Verification
  // ---------------------------------------------------------------------------
  it('6. Generates valid binary PDF buffer with branding, sections, and exact 100-page mode', async () => {
    const report = generateAssessmentReport({
      assessment: assessmentA,
      findings: [finding1],
      remediations: [remediation1],
      retests: [retest1],
      generatedByUserId: userLeadAId,
    });

    // Standard mode
    const stdResult = await generateSecurityReportPdfResult(report, { comprehensiveMode: false });
    expect(stdResult.buffer.length).toBeGreaterThan(1000);
    expect(stdResult.pageCount).toBeGreaterThan(0);
    expect(stdResult.buffer.toString('utf8', 0, 5)).toBe('%PDF-');

    // Comprehensive ~100-page mode
    const compResult = await generateSecurityReportPdfResult(report, {
      comprehensiveMode: true,
      includeFullAppendices: true,
    });
    expect(compResult.buffer.length).toBeGreaterThan(100000);
    expect(compResult.pageCount).toBe(100);
  });
});
