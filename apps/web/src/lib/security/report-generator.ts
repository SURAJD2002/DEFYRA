/**
 * Assessment Security Report Generator with SHA-256 Report Integrity
 */

import { createHash } from 'crypto';
import { Assessment, FindingRecord, RemediationRecord, RetestRecord, SecurityReport, SecurityReportContent } from '@/types';
import { db } from '@/lib/store';

export function generateAssessmentReport(params: {
  assessment: Assessment;
  findings: FindingRecord[];
  remediations: RemediationRecord[];
  retests: RetestRecord[];
  generatedByUserId: string;
}): SecurityReport {
  const { assessment, findings, remediations, retests, generatedByUserId } = params;

  const assets = assessment.scope.authorizedAssetIds
    .map((id) => db.findAssetById(id))
    .filter(Boolean)
    .map((a) => ({ id: a!.id, name: a!.name, type: a!.type }));

  const nonFpFindings = findings.filter((f) => f.status !== 'FALSE_POSITIVE');
  const criticalCount = nonFpFindings.filter((f) => f.severity === 'CRITICAL').length;
  const highCount = nonFpFindings.filter((f) => f.severity === 'HIGH').length;
  const mediumCount = nonFpFindings.filter((f) => f.severity === 'MEDIUM').length;
  const lowCount = nonFpFindings.filter((f) => f.severity === 'LOW').length;

  const resolvedFindings = findings.filter((f) => f.status === 'RESOLVED');
  const openFindings = findings.filter(
    (f) =>
      f.status === 'CONFIRMED' ||
      f.status === 'UNDER_REVIEW' ||
      f.status === 'CANDIDATE' ||
      f.status === 'REMEDIATION_REQUIRED' ||
      f.status === 'RETEST_PENDING'
  );
  const acceptedRisks = findings.filter((f) => f.status === 'ACCEPTED_RISK');

  const totalOriginalScore = nonFpFindings.reduce((sum, f) => sum + (f.riskScore || 0), 0);
  const overallRiskScore =
    nonFpFindings.length > 0 ? Math.round((totalOriginalScore / nonFpFindings.length) * 10) / 10 : 0.0;

  const totalOpenScore = openFindings.reduce((sum, f) => sum + (f.riskScore || 0), 0);
  const residualRiskScore =
    openFindings.length > 0 ? Math.round((totalOpenScore / openFindings.length) * 10) / 10 : 0.0;

  const testCoverage = assessment.testPlan.map((tp) => ({
    testId: tp.testId,
    status: tp.status,
    result: tp.status === 'PASSED' ? 'PASS' : tp.status === 'FAILED' ? 'FAIL' : 'PENDING',
  }));

  const keyFindings = findings.map((f) => ({
    id: f.id,
    title: f.title,
    severity: f.severity,
    riskScore: f.riskScore,
    status: f.status,
  }));

  const evidenceRefs = findings.flatMap((f) => f.evidenceIds || []);

  const content: SecurityReportContent = {
    executiveSummary: `DEFYRA Security Validation Assessment '${assessment.name}' completed for ${assessment.assessmentType}. Assessed ${assets.length} authorized asset(s). Discovered ${nonFpFindings.length} confirmed finding(s) (${criticalCount} Critical, ${highCount} High, ${mediumCount} Medium, ${lowCount} Low). Post-remediation status: ${resolvedFindings.length} resolved via verified retest, ${openFindings.length} currently open. Initial Risk Score: ${overallRiskScore}/10; Residual Risk Score: ${residualRiskScore}/10.`,
    scopeSummary: `Assessed ${assets.length} cataloged assets across ${assessment.environment} environment within declared testing boundaries.`,
    methodology: `Evaluated using DEFYRA Deterministic Security Engine and RiskModel v0.1 with cryptographic capability scoping, fail-closed kill switches, and empirical retest verification.`,
    assetsAssessed: assets,
    testCoverage,
    keyFindings,
    riskSummary: {
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      overallRiskScore,
      originalFindingsCount: nonFpFindings.length,
      resolvedFindingsCount: resolvedFindings.length,
      openFindingsCount: openFindings.length,
      acceptedRiskCount: acceptedRisks.length,
      residualRiskScore,
    },
    detailedFindings: findings,
    evidenceReferences: Array.from(new Set(evidenceRefs)),
    remediationSummary: remediations,
    retestResults: retests,
    limitations: [
      'Evaluation conducted strictly against declared synthetic/sandbox test scope and authorized test IDs.',
      'Does not evaluate uncataloged third-party infrastructure or external vendor services.',
      'Cryptographic SHA-256 hash confirms report and evidence content integrity at generation time.',
    ],
    conclusion:
      openFindings.length === 0
        ? 'All identified findings have been successfully remediated and verified through cryptographic retests.'
        : `Action required: Remediate ${openFindings.length} remaining open finding(s) and perform verification retests.`,
  };

  const canonical = JSON.stringify(content);
  const reportHash = createHash('sha256').update(canonical).digest('hex');
  const now = new Date().toISOString();

  const report: SecurityReport = {
    id: `rep_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`,
    organizationId: assessment.organizationId,
    projectId: assessment.projectId,
    assessmentId: assessment.id,
    title: `DEFYRA Security Assessment Report: ${assessment.name}`,
    methodologyVersion: 'v0.1',
    riskModelVersion: 'v0.1',
    reportHash,
    content,
    generatedBy: generatedByUserId,
    generatedAt: now,
  };

  db.createReport(report);
  return report;
}
