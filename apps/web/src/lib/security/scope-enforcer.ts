/**
 * DEFYRA Phase 6: Machine-Enforceable Assessment Scope & Rules of Engagement Validator
 * 
 * Operating Entity: MARKEET TECHNOLOGIES PRIVATE LIMITED
 * Brand: DEFYRA
 */

import { Assessment } from '@/types';

export interface ScopeEnforcementResult {
  allowed: boolean;
  code?: string;
  reason?: string;
}

export function enforceAssessmentScope(
  assessment: Assessment,
  request: {
    assetId: string;
    testId: string;
    environment: string;
    targetUrl?: string;
    timestamp?: string;
  }
): ScopeEnforcementResult {
  // 1. Assessment Status Check
  const validExecutableStatuses = new Set([
    'AUTHORIZED',
    'READY',
    'RUNNING',
    'REVIEW',
    'REMEDIATION',
    'RETEST',
  ]);

  if (!validExecutableStatuses.has(assessment.status)) {
    return {
      allowed: false,
      code: 'ASSESSMENT_STATUS_INVALID',
      reason: `Assessment '${assessment.id}' is in status '${assessment.status}'. Execution requires an AUTHORIZED or READY assessment.`,
    };
  }

  // 2. Asset Scope Verification
  if (!assessment.scope.authorizedAssetIds.includes(request.assetId)) {
    return {
      allowed: false,
      code: 'ASSET_OUT_OF_SCOPE',
      reason: `Asset '${request.assetId}' is not included in the authorized scope for assessment '${assessment.id}'.`,
    };
  }

  // 3. Test ID Scope Verification
  if (!assessment.scope.authorizedTestIds.includes(request.testId)) {
    return {
      allowed: false,
      code: 'TEST_OUT_OF_SCOPE',
      reason: `Security test definition '${request.testId}' is not authorized in scope for assessment '${assessment.id}'.`,
    };
  }

  // 4. Environment Verification
  if (
    request.environment !== assessment.environment ||
    !assessment.scope.authorizedEnvironments.includes(request.environment as any)
  ) {
    return {
      allowed: false,
      code: 'ENVIRONMENT_MISMATCH',
      reason: `Environment '${request.environment}' does not match authorized scope environment '${assessment.environment}'.`,
    };
  }

  // 5. Testing Window Verification (if specified)
  const now = new Date(request.timestamp || new Date().toISOString()).getTime();

  if (assessment.scope.testingWindowStart) {
    const windowStart = new Date(assessment.scope.testingWindowStart).getTime();
    if (now < windowStart) {
      return {
        allowed: false,
        code: 'TESTING_WINDOW_NOT_STARTED',
        reason: `Testing window has not started yet (Start: ${assessment.scope.testingWindowStart}).`,
      };
    }
  }

  if (assessment.scope.testingWindowEnd) {
    const windowEnd = new Date(assessment.scope.testingWindowEnd).getTime();
    if (now > windowEnd) {
      return {
        allowed: false,
        code: 'TESTING_WINDOW_EXPIRED',
        reason: `Testing window expired at ${assessment.scope.testingWindowEnd}.`,
      };
    }
  }

  // 6. Production Dual-Approval Gate
  if (request.environment === 'production' && !assessment.scope.productionApproved) {
    return {
      allowed: false,
      code: 'PRODUCTION_DUAL_APPROVAL_REQUIRED',
      reason: 'Production environment testing requires explicit dual-approval signature on Rules of Engagement scope agreement.',
    };
  }

  return { allowed: true };
}
