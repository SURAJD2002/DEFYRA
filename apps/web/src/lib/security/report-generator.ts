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

  const criticalCount = findings.filter((f) => f.severity === 'CRITICAL' && f.status !== 'FALSE_POSITIVE').length;
  const highCount = findings.filter((f) => f.severity === 'HIGH' && f.status !== 'FALSE_POSITIVE').length;
  const mediumCount = findings.filter((f) => f.severity === 'MEDIUM' && f.status !== 'FALSE_POSITIVE').length;
  const lowCount = findings.filter((f) => f.severity === 'LOW' && f.status !== 'FALSE_POSITIVE').length;

  const totalScore = findings
    .filter((f) => f.status !== 'FALSE_POSITIVE')
    .reduce((sum, f) => sum + (f.riskScore || 0), 0);
  const avgScore = findings.length > 0 ? Math.round((totalScore / findings.length) * 10) / 10 : 0.0;

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
    executiveSummary: `DEFYRA Security Validation Assessment '${assessment.name}' completed for ${assessment.assessmentType}. Overall Risk Score: ${avgScore}/10. Identified ${criticalCount} Critical, ${highCount} High, and ${mediumCount} Medium severity findings.`,
    scopeSummary: `Assessed ${assets.length} cataloged assets across ${assessment.environment} environment within declared testing boundaries.`,
    methodology: `Evaluated using DEFYRA Deterministic Security Engine and RiskModel v0.1 with cryptographic capability scoping and fail-closed kill switches.`,
    assetsAssessed: assets,
    testCoverage,
    keyFindings,
    riskSummary: {
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      overallRiskScore: avgScore,
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
      criticalCount === 0 && highCount === 0
        ? 'Target assets demonstrated strong adherence to declared AI security and autonomy boundaries.'
        : 'Action required: Remediate confirmed Critical/High vulnerabilities and perform verification retests.',
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
