import { Asset, Project, AssetEnvironment, UserRole } from '@/types';
import { db } from '@/lib/store';
import { canonicalizeAndValidateUrl, isProhibitedIP } from './network-egress';
import { killSwitchRegistry } from './kill-switch';

export interface ProductionDualApproval {
  approvedByOwnerId: string;
  approvedBySecurityLeadId: string;
  approvalTimestamp: string;
  writtenScopeAgreementHash: string;
}

export interface TargetValidationParams {
  organizationId: string;
  projectId: string;
  assetId: string;
  testId: string;
  testRunId?: string;
  environment: AssetEnvironment;
  productionApproval?: ProductionDualApproval;
  userRole?: UserRole;
}

export type TargetValidationResult =
  | {
      valid: true;
      resolvedTarget: {
        assetId: string;
        assetName: string;
        assetType: string;
        targetEndpoint: string;
        environment: AssetEnvironment;
        isProduction: boolean;
      };
    }
  | {
      valid: false;
      error: string;
      code:
        | 'KILL_SWITCH_ACTIVE'
        | 'ASSET_NOT_FOUND'
        | 'ASSET_INACTIVE'
        | 'TENANT_MISMATCH'
        | 'PROJECT_MISMATCH'
        | 'UNSAFE_DESTINATION'
        | 'PRODUCTION_UNAUTHORIZED'
        | 'DISALLOWED_PROTOCOL'
        | 'MISSING_ENDPOINT';
    };

/**
 * Checks if a target endpoint URL is safe from SSRF, private network, and cloud metadata access.
 */
export function isUnsafeNetworkDestination(urlStr: string): { unsafe: boolean; reason?: string } {
  const canonical = canonicalizeAndValidateUrl(urlStr);
  if (!canonical.valid) {
    return { unsafe: true, reason: canonical.error };
  }
  return { unsafe: false };
}

/**
 * Resolves and strictly validates that a target is an authorized DEFYRA asset within permitted scope,
 * checking 4-Tier Kill Switch, Tenancy, SSRF Egress policy, and Production Dual-Approval.
 */
export function validateExecutionTarget(params: TargetValidationParams): TargetValidationResult {
  const {
    organizationId,
    projectId,
    assetId,
    testRunId,
    environment,
    productionApproval,
    userRole,
  } = params;

  // 1. Check 4-Tier Fail-Closed Kill Switch
  const ksCheck = killSwitchRegistry.check({ organizationId, projectId, testRunId });
  if (ksCheck.blocked) {
    return {
      valid: false,
      error: `Execution Blocked: Kill Switch is active (${ksCheck.reason})`,
      code: 'KILL_SWITCH_ACTIVE',
    };
  }

  // 2. Fetch Asset from Database / Store
  const asset = db.findAssetById(assetId);
  if (!asset || asset.status === 'archived') {
    return { valid: false, error: 'Target asset was not found or has been archived.', code: 'ASSET_NOT_FOUND' };
  }

  // 3. Tenancy & Project Scoping
  if (asset.organizationId !== organizationId) {
    return {
      valid: false,
      error: 'Asset belongs to a different organization tenant (cross-tenant access blocked).',
      code: 'TENANT_MISMATCH',
    };
  }
  if (asset.projectId !== projectId) {
    return {
      valid: false,
      error: 'Asset does not belong to the authorized project scope.',
      code: 'PROJECT_MISMATCH',
    };
  }

  // 4. Resolve Target Endpoint from Asset Metadata
  const targetEndpoint =
    (asset.metadata?.endpointUrl as string) ||
    (asset.metadata?.apiUrl as string) ||
    (asset.metadata?.targetUrl as string) ||
    `https://${asset.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.internal.defyra.sandbox`;

  // 5. SSRF & Network Security Canonicalization Check
  const canonicalCheck = canonicalizeAndValidateUrl(targetEndpoint);
  if (!canonicalCheck.valid) {
    return {
      valid: false,
      error: `Security Guardrail: Target endpoint rejected: ${canonicalCheck.error}`,
      code: 'UNSAFE_DESTINATION',
    };
  }

  // 6. Environment Policy & Production Dual-Approval Gate
  const isProduction = asset.environment === 'production' || environment === 'production';
  if (isProduction) {
    // Production testing requires valid dual approval signatures (Owner + Security Lead)
    if (!productionApproval) {
      return {
        valid: false,
        error: 'Production Environment Gate: Execution against production assets requires explicit elevated dual-authorization approval (Owner + Security Lead).',
        code: 'PRODUCTION_UNAUTHORIZED',
      };
    }

    if (
      !productionApproval.approvedByOwnerId ||
      !productionApproval.approvedBySecurityLeadId ||
      !productionApproval.writtenScopeAgreementHash
    ) {
      return {
        valid: false,
        error: 'Production Environment Gate: Incomplete dual-authorization approval record. Both Owner and Security Lead IDs are required.',
        code: 'PRODUCTION_UNAUTHORIZED',
      };
    }

    // Owner and Security Lead must be distinct authorized approvers
    if (productionApproval.approvedByOwnerId === productionApproval.approvedBySecurityLeadId) {
      return {
        valid: false,
        error: 'Production Security Gate: Dual-key approval requires two distinct authorizing individuals (Owner and Security Lead cannot be the same entity).',
        code: 'PRODUCTION_UNAUTHORIZED',
      };
    }
  }

  return {
    valid: true,
    resolvedTarget: {
      assetId: asset.id,
      assetName: asset.name,
      assetType: asset.type,
      targetEndpoint: canonicalCheck.canonicalUrl || targetEndpoint,
      environment: asset.environment,
      isProduction,
    },
  };
}

export type TargetValidationResultParams = TargetValidationParams;
