import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/store';
import { evaluateRiskModelV01 } from '@/lib/security/risk-model';
import { generateAssessmentReport } from '@/lib/security/report-generator';
import { Assessment, FindingRecord, RemediationRecord, RetestRecord, Project, Asset } from '@/types';

describe('Phase 4: Customer-Grade Security Assessment, Risk Model, and Report Integrity', () => {
  const orgId = 'org_phase4_test_01';
  const userId = 'usr_phase4_lead_01';

  let project: Project;
  let asset: Asset;
  let assessment: Assessment;

  beforeEach(() => {
    project = {
      id: 'prj_p4_01',
      organizationId: orgId,
      name: 'Agentic Core Staging',
      description: 'Staging environment for Phase 4 assessments',
      environment: 'staging',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.createProject(project);

    asset = {
      id: 'ast_p4_agent_01',
      organizationId: orgId,
      projectId: project.id,
      type: 'AGENT',
      name: 'Autonomous Operations Agent',
      description: 'Operations agent with file and shell tool bindings',
      environment: 'staging',
      metadata: { endpointUrl: 'https://agent.defyra.sandbox/v1' },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.createAsset(asset);

    assessment = {
      id: 'asm_p4_01',
      organizationId: orgId,
      projectId: project.id,
      name: 'Q3 Autonomous Security Validation',
      description: 'Formal validation of agentic tool boundaries',
      assessmentType: 'AI_SECURITY_VALIDATION',
      environment: 'staging',
      status: 'READY',
      scope: {
        authorizedAssetIds: [asset.id],
        authorizedTestIds: ['DEF-INJ-001', 'DEF-AGC-001'],
        authorizedEnvironments: ['staging'],
      },
      testPlan: [
        {
          testId: 'DEF-INJ-001',
          enabled: true,
          priority: 'CRITICAL',
          order: 1,
          status: 'PENDING',
        },
      ],
      createdBy: userId,
      createdAt: new Date().toISOString(),
    };
    db.createAssessment(assessment);
  });

  it('1. Correctly calculates risk scores using DEFYRA RiskModel v0.1', () => {
    // Critical severity, 1.0 confidence, high criticality, high autonomy -> 10.0 * 1.0 * 0.9 * 1.0 = 9.0
    const risk1 = evaluateRiskModelV01({
      severity: 'CRITICAL',
      confidence: 1.0,
      assetCriticality: 'HIGH',
      autonomyLevel: 'HIGH',
    });
    expect(risk1.riskScore).toBe(9.0);
    expect(risk1.riskModelVersion).toBe('v0.1');

    // Medium severity, 0.8 confidence, low criticality, low autonomy
    // 5.5 * 0.8 * 0.6 * 0.8 = 2.112 -> 2.1
    const risk2 = evaluateRiskModelV01({
      severity: 'MEDIUM',
      confidence: 0.8,
      assetCriticality: 'LOW',
      autonomyLevel: 'LOW',
    });
    expect(risk2.riskScore).toBe(2.1);
  });

  it('2. Enforces finding quality gate: CANDIDATE -> CONFIRMED -> RESOLVED', () => {
    const finding: FindingRecord = {
      id: 'fnd_p4_gate_01',
      organizationId: orgId,
      projectId: project.id,
      assessmentId: assessment.id,
      testId: 'DEF-INJ-001',
      title: 'Direct Prompt Override Vulnerability',
      description: 'Model instructions overridden via raw injection',
      severity: 'HIGH',
      confidence: 1.0,
      riskScore: 7.2,
      riskModelVersion: 'v0.1',
      status: 'CANDIDATE', // Quality Gate initial state
      impact: 'Arbitrary control of agent behavior',
      attackScenario: 'Attacker supplies system override tag',
      recommendation: 'Sanitize prompts with rigid system delimiters',
      observationIds: ['obs_1'],
      evidenceIds: ['ev_1'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.createFinding(finding);

    // Initial state is CANDIDATE
    let stored = db.findFindingById('fnd_p4_gate_01');
    expect(stored?.status).toBe('CANDIDATE');

    // Confirm finding
    db.updateFinding('fnd_p4_gate_01', { status: 'CONFIRMED' });
    stored = db.findFindingById('fnd_p4_gate_01');
    expect(stored?.status).toBe('CONFIRMED');

    // Create remediation
    const rem: RemediationRecord = {
      id: 'rem_p4_01',
      organizationId: orgId,
      projectId: project.id,
      assessmentId: assessment.id,
      findingId: finding.id,
      title: 'Add Input Delimiters',
      description: 'Wrap inputs in rigid XML boundaries',
      priority: 'HIGH',
      recommendedAction: 'Sanitize all dynamic inputs',
      owner: 'SecOps Lead',
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.createRemediation(rem);
    db.updateFinding('fnd_p4_gate_01', { status: 'REMEDIATION_REQUIRED' });
    stored = db.findFindingById('fnd_p4_gate_01');
    expect(stored?.status).toBe('REMEDIATION_REQUIRED');

    // Retest passes -> RESOLVED
    const retest: RetestRecord = {
      id: 'rt_p4_01',
      organizationId: orgId,
      projectId: project.id,
      assessmentId: assessment.id,
      findingId: finding.id,
      testRunId: 'tr_p4_retest_01',
      previousResult: 'FAIL',
      retestResult: 'PASS',
      behaviorChange: 'Injection rejected cleanly',
      performedBy: userId,
      createdAt: new Date().toISOString(),
    };
    db.createRetest(retest);
    db.updateFinding('fnd_p4_gate_01', { status: 'RESOLVED' });
    stored = db.findFindingById('fnd_p4_gate_01');
    expect(stored?.status).toBe('RESOLVED');
  });

  it('3. Generates cryptographic SHA-256 report hash and confirms content integrity', () => {
    const findings = db.listFindingsForAssessment(assessment.id);
    const remediations = db.listRemediationsForAssessment(assessment.id);
    const retests = db.listRetestsForFinding('fnd_p4_gate_01');

    const report = generateAssessmentReport({
      assessment,
      findings,
      remediations,
      retests,
      generatedByUserId: userId,
    });

    expect(report.reportHash).toBeDefined();
    expect(report.reportHash.length).toBe(64); // Valid SHA-256 hex string
    expect(report.content.assetsAssessed.length).toBe(1);
    expect(report.content.keyFindings.length).toBe(1);
    expect(report.content.retestResults.length).toBe(1);
  });
});
