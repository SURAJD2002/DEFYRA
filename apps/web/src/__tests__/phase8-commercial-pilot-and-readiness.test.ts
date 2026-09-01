import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/store';
import { enforceAssessmentScope } from '@/lib/security/scope-enforcer';
import { SecretProvider } from '@/lib/security/target-adapter';
import { generateAssessmentReport } from '@/lib/security/report-generator';
import { Assessment, FindingRecord, RemediationRecord, RetestRecord } from '@/types';

describe('Phase 8: Commercial Pilot & Assessment Readiness Gate', () => {
  const orgId = 'org_phase8_commercial_01';
  const projectId = 'prj_phase8_commercial_01';
  const userId = 'usr_phase8_lead_architect';

  let assessment: Assessment;

  beforeEach(() => {
    assessment = {
      id: 'asm_p8_commercial_01',
      organizationId: orgId,
      projectId: projectId,
      name: 'DEFYRA Founding AI Security Assessment',
      description: 'First paid commercial assessment for SaaS customer AI endpoint',
      assessmentType: 'AI_SECURITY_VALIDATION',
      environment: 'staging',
      status: 'AUTHORIZED',
      paymentStatus: 'PAYMENT_CONFIRMED',
      paymentReference: 'INV-2026-001-PAID',
      scope: {
        authorizedAssetIds: ['ast_customer_ai_rest_01'],
        authorizedTestIds: ['DEF-INJ-001', 'DEF-DAT-003'],
        authorizedEnvironments: ['staging'],
        testingWindowStart: '2026-01-01T00:00:00Z',
        testingWindowEnd: '2026-12-31T23:59:59Z',
        emergencyContact: 'security-lead@customer.com',
        killSwitchAuthority: 'DEFYRA_AND_CUSTOMER',
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
  // 1. Commercial Payment Readiness Gate
  // ---------------------------------------------------------------------------
  it('1. Blocks execution when commercial payment is in QUOTE_SENT status', () => {
    const unconfirmed = { ...assessment, paymentStatus: 'QUOTE_SENT' as const };
    const res = enforceAssessmentScope(unconfirmed, {
      assetId: 'ast_customer_ai_rest_01',
      testId: 'DEF-INJ-001',
      environment: 'staging',
    });
    expect(res.allowed).toBe(false);
    expect(res.code).toBe('PAYMENT_NOT_CONFIRMED');
  });

  it('2. Blocks execution when commercial payment is in PAYMENT_PENDING status', () => {
    const pending = { ...assessment, paymentStatus: 'PAYMENT_PENDING' as const };
    const res = enforceAssessmentScope(pending, {
      assetId: 'ast_customer_ai_rest_01',
      testId: 'DEF-INJ-001',
      environment: 'staging',
    });
    expect(res.allowed).toBe(false);
    expect(res.code).toBe('PAYMENT_NOT_CONFIRMED');
  });

  it('3. Allows execution when payment status is PAYMENT_CONFIRMED', () => {
    const res = enforceAssessmentScope(assessment, {
      assetId: 'ast_customer_ai_rest_01',
      testId: 'DEF-INJ-001',
      environment: 'staging',
    });
    expect(res.allowed).toBe(true);
  });

  it('4. Allows execution when payment is explicitly WAIVED_FOR_PILOT', () => {
    const waived = { ...assessment, paymentStatus: 'WAIVED_FOR_PILOT' as const };
    const res = enforceAssessmentScope(waived, {
      assetId: 'ast_customer_ai_rest_01',
      testId: 'DEF-INJ-001',
      environment: 'staging',
    });
    expect(res.allowed).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // 2. Rules of Engagement & Technical Readiness
  // ---------------------------------------------------------------------------
  it('5. Refuses execution if Rules of Engagement are in DRAFT or PENDING_APPROVAL status', () => {
    const draft = { ...assessment, status: 'DRAFT' as const };
    const res = enforceAssessmentScope(draft, {
      assetId: 'ast_customer_ai_rest_01',
      testId: 'DEF-INJ-001',
      environment: 'staging',
    });
    expect(res.allowed).toBe(false);
    expect(res.code).toBe('ASSESSMENT_STATUS_INVALID');
  });

  it('6. Refuses execution if target asset is not in authorized scope', () => {
    const res = enforceAssessmentScope(assessment, {
      assetId: 'ast_unauthorized_external_02',
      testId: 'DEF-INJ-001',
      environment: 'staging',
    });
    expect(res.allowed).toBe(false);
    expect(res.code).toBe('ASSET_OUT_OF_SCOPE');
  });

  // ---------------------------------------------------------------------------
  // 3. Commercial Report Quality & Historical Truth
  // ---------------------------------------------------------------------------
  it('7. Report preserves initial confirmed findings, shows verified retest resolution, and computes residual risk', () => {
    const finding: FindingRecord = {
      id: 'fnd_commercial_01',
      organizationId: orgId,
      projectId: projectId,
      assessmentId: assessment.id,
      testId: 'DEF-INJ-001',
      title: 'Direct System Prompt Override Vulnerability',
      description: 'Model disclosed system instructions when presented with adversarial delimiter escape.',
      severity: 'HIGH',
      confidence: 0.95,
      riskScore: 7.8,
      riskModelVersion: 'v0.1',
      status: 'RESOLVED',
      impact: 'Instruction boundary bypass',
      attackScenario: 'Attacker submitted raw XML override tags',
      recommendation: 'Implement rigid XML instruction encapsulation and output guardrails.',
      observationIds: ['obs_1'],
      evidenceIds: ['ev_1'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const retest: RetestRecord = {
      id: 'rt_commercial_01',
      organizationId: orgId,
      projectId: projectId,
      assessmentId: assessment.id,
      findingId: finding.id,
      testRunId: 'tr_retest_commercial_01',
      previousResult: 'FAILED',
      retestResult: 'PASS',
      behaviorChange: 'Model rejected delimiter escape and adhered to system instructions.',
      performedBy: userId,
      createdAt: new Date().toISOString(),
    };

    const report = generateAssessmentReport({
      assessment,
      findings: [finding],
      remediations: [],
      retests: [retest],
      generatedByUserId: userId,
    });

    expect(report.content.riskSummary.originalFindingsCount).toBe(1);
    expect(report.content.riskSummary.resolvedFindingsCount).toBe(1);
    expect(report.content.riskSummary.openFindingsCount).toBe(0);
    expect(report.content.riskSummary.overallRiskScore).toBe(7.8);
    expect(report.content.riskSummary.residualRiskScore).toBe(0.0);
    expect(report.content.executiveSummary).toContain('1 confirmed finding(s)');
    expect(report.content.executiveSummary).toContain('1 resolved via verified retest');
    expect(report.content.executiveSummary).toContain('Residual Risk Score: 0/10');
    expect(report.reportHash.length).toBe(64);
  });
});
