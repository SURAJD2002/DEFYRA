/**
 * DEFYRA: Comprehensive PDF Security Report Generator & Verification Script
 * Generates an actual ~100-page customer security assessment report PDF, saves it to disk,
 * and inspects its exact page count, byte size, and SHA-256 integrity seal.
 */

import fs from 'fs';
import path from 'path';
import { db } from '../apps/web/src/lib/store';
import { generateAssessmentReport, verifyReportIntegrity } from '../apps/web/src/lib/security/report-generator';
import { generateSecurityReportPdfBuffer, generateSecurityReportPdfResult } from '../apps/web/src/lib/security/pdf-report-generator';
import { Assessment, FindingRecord, RemediationRecord, RetestRecord, Asset } from '../apps/web/src/types';

async function main() {
  console.log('================================================================================');
  console.log('DEFYRA: COMPREHENSIVE ~100-PAGE SECURITY REPORT PDF ENGINE & INTEGRITY SEAL');
  console.log('Operating Entity: MARKEET TECHNOLOGIES PRIVATE LIMITED');
  console.log('Principle: PROVE. PROTECT. TRUST.');
  console.log('================================================================================\n');

  const orgId = 'org_enterprise_fintech_01';
  const projectId = 'prj_wealth_agent_01';
  const userId = 'usr_defyra_founder_01';

  // 1. Provision Organization & Project
  db.createOrganization({
    id: orgId,
    name: 'Apex Global Financial Technologies Inc.',
    slug: 'apex-global-fintech',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }, userId);

  db.createProject({
    id: projectId,
    organizationId: orgId,
    name: 'Autonomous Wealth Advisory & Execution Platform',
    description: 'Enterprise generative AI wealth advisor and agentic transaction executor',
    environment: 'staging',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // 2. Register Target Assets
  const asset1: Asset = db.createAsset({
    id: 'ast_advisory_llm_01',
    organizationId: orgId,
    projectId: projectId,
    name: 'Wealth Advisory OpenAI Staging Endpoint',
    description: 'Customer-facing LLM wealth advisory endpoint',
    type: 'MODEL',
    environment: 'staging',
    status: 'active',
    metadata: { endpointUrl: 'https://staging.apex-fintech.io/v1/chat/completions', adapterType: 'REST_ENDPOINT' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const asset2: Asset = db.createAsset({
    id: 'ast_transaction_tool_02',
    organizationId: orgId,
    projectId: projectId,
    name: 'Agentic Fund Transfer Tool API',
    description: 'Autonomous tool executor for fund movements and balance queries',
    type: 'TOOL',
    environment: 'staging',
    status: 'active',
    metadata: { endpointUrl: 'https://staging.apex-fintech.io/v1/tools/transfer', adapterType: 'TOOL_ENDPOINT' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // 3. Create Assessment
  const assessment: Assessment = {
    id: 'asm_comprehensive_eval_2026',
    organizationId: orgId,
    projectId: projectId,
    name: 'DEFYRA Founding AI Security Validation Assessment',
    description: 'Comprehensive point-in-time AI red team and security validation of LLM advisory and tool execution boundaries',
    assessmentType: 'AI_SECURITY_VALIDATION',
    environment: 'staging',
    status: 'COMPLETED',
    paymentStatus: 'PAYMENT_CONFIRMED',
    paymentReference: 'INV-2026-APEX-ENTERPRISE-PAID',
    scope: {
      authorizedAssetIds: [asset1.id, asset2.id],
      authorizedTestIds: [
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
      ],
      authorizedEnvironments: ['staging'],
      testingWindowStart: '2026-01-01T00:00:00Z',
      testingWindowEnd: '2026-12-31T23:59:59Z',
      emergencyContact: 'ciso@apex-fintech.io',
      productionApproved: false,
    },
    testPlan: [
      { testId: 'DEF-INJ-001', enabled: true, priority: 'HIGH', order: 1, status: 'PASSED' },
      { testId: 'DEF-DAT-003', enabled: true, priority: 'CRITICAL', order: 2, status: 'PASSED' },
      { testId: 'DEF-AUT-001', enabled: true, priority: 'HIGH', order: 3, status: 'PASSED' },
      { testId: 'DEF-IDN-001', enabled: true, priority: 'HIGH', order: 4, status: 'PASSED' },
      { testId: 'DEF-CHN-001', enabled: true, priority: 'CRITICAL', order: 5, status: 'PASSED' },
    ],
    createdBy: userId,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
  db.createAssessment(assessment);

  // 4. Create Detailed Confirmed Findings
  const finding1: FindingRecord = {
    id: 'fnd_apex_inj_01',
    organizationId: orgId,
    projectId: projectId,
    assessmentId: assessment.id,
    testId: 'DEF-INJ-001',
    affectedAssetId: asset1.id,
    title: 'Direct System Prompt Override Vulnerability',
    description: 'Adversarial user prompt successfully bypassed system delimiters and forced the model to disclose confidential core trading algorithms and internal policy instructions verbatim.',
    severity: 'HIGH',
    confidence: 0.95,
    riskScore: 7.8,
    riskModelVersion: 'v0.1',
    status: 'RESOLVED',
    impact: 'Disclosure of proprietary investment heuristics, confidential compliance parameters, and internal guardrail prompts.',
    attackScenario: 'Attacker injected raw XML delimiter escape sequences `</system_instructions><user_override>` followed by administrative disclosure commands.',
    recommendation: 'Implement rigid multi-layer XML encapsulation, deploy pre-response output classifiers, and sanitize all user input before context ingestion.',
    observationIds: ['obs_inj_001', 'obs_inj_002'],
    evidenceIds: ['ev_inj_001_raw', 'ev_inj_001_trace'],
    reviewNotes: 'Confirmed by DEFYRA Lead Security Architect. Root cause: unescaped delimiter boundaries.',
    reviewedBy: userId,
    reviewedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const finding2: FindingRecord = {
    id: 'fnd_apex_dat_02',
    organizationId: orgId,
    projectId: projectId,
    assessmentId: assessment.id,
    testId: 'DEF-DAT-003',
    affectedAssetId: asset2.id,
    title: 'Ephemeral Canary Credential Reflection in Context',
    description: 'Under specific conversational perturbation, agent reflected backend API credential token when prompted with iterative context replay requests.',
    severity: 'CRITICAL',
    confidence: 0.98,
    riskScore: 8.9,
    riskModelVersion: 'v0.1',
    status: 'RESOLVED',
    impact: 'Direct exfiltration of downstream transactional API keys allowing unauthorized balance modifications.',
    attackScenario: 'Recursive prompt extraction forced model to dump token context buffer.',
    recommendation: 'Migrate from raw bearer token context injection to ephemeral capability vaults with zero model visibility.',
    observationIds: ['obs_dat_001'],
    evidenceIds: ['ev_dat_001_canary'],
    reviewNotes: 'Confirmed critical finding. Ephemeral canary token was successfully extracted prior to fix.',
    reviewedBy: userId,
    reviewedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.createFinding(finding1);
  db.createFinding(finding2);

  // 5. Create Remediation Advisories
  const rem1: RemediationRecord = {
    id: 'rem_apex_01',
    organizationId: orgId,
    projectId: projectId,
    assessmentId: assessment.id,
    findingId: finding1.id,
    title: 'Deploy XML Delimiter Guardrails & Pre-Response Classifier',
    description: 'Enforce strict boundary tagging and deploy secondary classifier to intercept prompt overrides.',
    priority: 'HIGH',
    recommendedAction: 'Apply XML encapsulation and activate secondary classifier.',
    owner: 'Customer AI Platform Security Lead',
    status: 'RESOLVED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const rem2: RemediationRecord = {
    id: 'rem_apex_02',
    organizationId: orgId,
    projectId: projectId,
    assessmentId: assessment.id,
    findingId: finding2.id,
    title: 'Migrate to Ephemeral Capability Token Vault',
    description: 'Remove raw secrets from model prompt context; use server-side capability proxy.',
    priority: 'CRITICAL',
    recommendedAction: 'Deploy DEFYRA ephemeral SecretProvider proxy.',
    owner: 'Customer Infrastructure Engineering Lead',
    status: 'RESOLVED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.createRemediation(rem1);
  db.createRemediation(rem2);

  // 6. Create Verification Retests
  const rt1: RetestRecord = {
    id: 'rt_apex_01',
    organizationId: orgId,
    projectId: projectId,
    assessmentId: assessment.id,
    findingId: finding1.id,
    testRunId: 'tr_retest_inj_01',
    previousResult: 'FAIL',
    retestResult: 'PASS',
    originalEvidenceId: 'ev_inj_001_raw',
    retestEvidenceId: 'ev_inj_001_retest_pass',
    behaviorChange: 'Remediation verified: Adversarial delimiter injections strictly rejected; core boundaries preserved.',
    performedBy: userId,
    createdAt: new Date().toISOString(),
  };

  const rt2: RetestRecord = {
    id: 'rt_apex_02',
    organizationId: orgId,
    projectId: projectId,
    assessmentId: assessment.id,
    findingId: finding2.id,
    testRunId: 'tr_retest_dat_02',
    previousResult: 'FAIL',
    retestResult: 'PASS',
    originalEvidenceId: 'ev_dat_001_canary',
    retestEvidenceId: 'ev_dat_002_retest_pass',
    behaviorChange: 'Remediation verified: Zero credential leakage observed across 50 adversarial perturbations.',
    performedBy: userId,
    createdAt: new Date().toISOString(),
  };

  db.createRetest(rt1);
  db.createRetest(rt2);

  // 7. Generate Canonical Report Entity
  console.log('[STEP 1] Generating Canonical Report Data & Calculating SHA-256 Hash');
  const report = generateAssessmentReport({
    assessment,
    findings: [finding1, finding2],
    remediations: [rem1, rem2],
    retests: [rt1, rt2],
    generatedByUserId: userId,
  });

  // Seal Report
  db.sealReport(report.id, userId);
  report.status = 'SEALED';
  report.sealedAt = new Date().toISOString();
  report.sealedBy = userId;

  console.log(`  ✓ Report ID:           ${report.id}`);
  console.log(`  ✓ Title:               ${report.title}`);
  console.log(`  ✓ Report Status:       ${report.status} (Cryptographically Sealed)`);
  console.log(`  ✓ SHA-256 Report Hash: ${report.reportHash}`);
  console.log(`  ✓ Total Findings:      ${report.totalFindings} (Resolved via Retest: ${report.resolvedFindings})`);
  console.log(`  ✓ Initial Risk Score:  ${report.initialRiskScore} / 10.0`);
  console.log(`  ✓ Residual Risk Score: ${report.residualRiskScore} / 10.0`);

  // 8. Generate Comprehensive PDF (~100 pages)
  console.log('\n[STEP 2] Rendering Comprehensive Cybersecurity PDF Document (~100 Pages)');
  const startTime = Date.now();
  const pdfResult = await generateSecurityReportPdfResult(report, {
    comprehensiveMode: true,
    includeFullAppendices: true,
  });
  const pdfBuffer = pdfResult.buffer;
  const actualPageCount = pdfResult.pageCount;
  const durationMs = Date.now() - startTime;

  // 9. Save PDF Artifact to Disk
  const outputDir = path.join(process.cwd(), 'scratch');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, `DEFYRA-Assessment-Report-${assessment.id}.pdf`);
  fs.writeFileSync(outputPath, pdfBuffer);

  console.log(`  ✓ PDF File Created:    ${outputPath}`);
  console.log(`  ✓ PDF Size:            ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB (${pdfBuffer.length} bytes)`);
  console.log(`  ✓ Generation Time:     ${durationMs} ms`);
  console.log(`  ✓ EXACT PDF PAGE COUNT: ${actualPageCount} PAGES`);

  // 10. Verify Cryptographic Integrity Seal
  console.log('\n[STEP 3] Verifying SHA-256 Report Integrity via Independent API Engine');
  const verification = verifyReportIntegrity(report.id);
  console.log(`  ✓ Integrity Valid:      ${verification.valid}`);
  console.log(`  ✓ Calculated Hash:     ${verification.calculatedHash}`);
  console.log(`  ✓ Stored Hash:         ${verification.storedHash}`);
  console.log(`  ✓ Message:             ${verification.message}`);

  if (!verification.valid) {
    throw new Error('FATAL: SHA-256 Report Integrity verification failed!');
  }

  console.log('\n================================================================================');
  console.log(`✓ COMPREHENSIVE PDF REPORT GENERATED & VERIFIED: ${actualPageCount} PAGES [GREEN]`);
  console.log('================================================================================');
}

main().catch((err) => {
  console.error('Fatal error during report generation:', err);
  process.exit(1);
});
