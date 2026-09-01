import { Asset, Project, AssetEnvironment } from '@/types';
import { db } from '@/lib/store';

export interface TargetValidationParams {
  organizationId: string;
  projectId: string;
  assetId: string;
  testId: string;
  environment: AssetEnvironment;
  productionApproved?: boolean;
  userRole?: string;
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
        | 'ASSET_NOT_FOUND'
        | 'ASSET_INACTIVE'
        | 'TENANT_MISMATCH'
        | 'PROJECT_MISMATCH'
        | 'UNSAFE_DESTINATION'
        | 'PRODUCTION_UNAUTHORIZED'
        | 'DISALLOWED_PROTOCOL'
        | 'MISSING_ENDPOINT';
    };

const DISALLOWED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  '0.0.0.0',
  '169.254.169.254', // AWS/GCP/Azure Cloud Metadata
  'instance-data',
  'metadata.google.internal',
]);

/**
 * Checks if an IP or hostname falls within private, loopback, or cloud metadata ranges (SSRF defense).
 */
export function isUnsafeNetworkDestination(urlStr: string): { unsafe: boolean; reason?: string } {
  try {
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase();

    // 1. Exact Blacklist Match
    if (DISALLOWED_HOSTNAMES.has(hostname)) {
      return { unsafe: true, reason: `Direct access to '${hostname}' is prohibited (loopback/cloud-metadata).` };
    }

    // 2. Loopback 127.x.x.x
    if (/^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      return { unsafe: true, reason: 'Access to loopback network range (127.0.0.0/8) is prohibited.' };
    }

    // 3. RFC 1918 Private Ranges (unless explicitly sandboxed in dev)
    // 10.0.0.0/8
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      return { unsafe: true, reason: 'Access to private RFC 1918 IP range (10.0.0.0/8) is prohibited.' };
    }
    // 192.168.0.0/16
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      return { unsafe: true, reason: 'Access to private RFC 1918 IP range (192.168.0.0/16) is prohibited.' };
    }
    // 172.16.0.0/12 (172.16.x.x - 172.31.x.x)
    const match172 = hostname.match(/^172\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
    if (match172) {
      const secondOctet = parseInt(match172[1], 10);
      if (secondOctet >= 16 && secondOctet <= 31) {
        return { unsafe: true, reason: 'Access to private RFC 1918 IP range (172.16.0.0/12) is prohibited.' };
      }
    }

    // 4. Link-Local 169.254.0.0/16
    if (/^169\.254\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      return { unsafe: true, reason: 'Access to link-local / cloud metadata range (169.254.0.0/16) is prohibited.' };
    }

    // 5. Allowed Protocols
    if (!['http:', 'https:', 'mcp:', 'ws:', 'wss:'].includes(parsed.protocol)) {
      return { unsafe: true, reason: `Protocol '${parsed.protocol}' is not supported. Use HTTPS/HTTP/MCP.` };
    }

    return { unsafe: false };
  } catch {
    return { unsafe: true, reason: 'Invalid target URL format.' };
  }
}

/**
 * Resolves and strictly validates that a target is an authorized DEFYRA asset within permitted scope.
 */
export function validateExecutionTarget(params: TargetValidationResultParams): TargetValidationResult {
  const { organizationId, projectId, assetId, environment, productionApproved, userRole } = params;

  // 1. Fetch Asset
  const asset = db.findAssetById(assetId);
  if (!asset || asset.status === 'archived') {
    return { valid: false, error: 'Target asset was not found or has been archived.', code: 'ASSET_NOT_FOUND' };
  }

  // 2. Tenancy & Project Scoping
  if (asset.organizationId !== organizationId) {
    return { valid: false, error: 'Asset belongs to a different organization tenant (cross-tenant access blocked).', code: 'TENANT_MISMATCH' };
  }
  if (asset.projectId !== projectId) {
    return { valid: false, error: 'Asset does not belong to the authorized project scope.', code: 'PROJECT_MISMATCH' };
  }

  // 3. Resolve Target Endpoint from Asset Metadata
  const targetEndpoint =
    (asset.metadata?.endpointUrl as string) ||
    (asset.metadata?.apiUrl as string) ||
    (asset.metadata?.targetUrl as string) ||
    `https://${asset.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.internal.defyra.sandbox`;

  // 4. SSRF & Network Security Check
  const networkCheck = isUnsafeNetworkDestination(targetEndpoint);
  if (networkCheck.unsafe) {
    return {
      valid: false,
      error: `Security Guardrail: Target endpoint rejected: ${networkCheck.reason}`,
      code: 'UNSAFE_DESTINATION',
    };
  }

  // 5. Environment Policy & Production Dual-Approval Gate
  const isProduction = asset.environment === 'production' || environment === 'production';
  if (isProduction) {
    if (!productionApproved) {
      return {
        valid: false,
        error: 'Production Environment Gate: Execution against production assets requires explicit elevated dual-authorization approval.',
        code: 'PRODUCTION_UNAUTHORIZED',
      };
    }
    if (userRole && !['OWNER', 'SECURITY_LEAD'].includes(userRole)) {
      return {
        valid: false,
        error: 'Production Security Gate: Only OWNER or SECURITY_LEAD roles may authorize production tests.',
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
      targetEndpoint,
      environment: asset.environment,
      isProduction,
    },
  };
}

export type TargetValidationResultParams = TargetValidationParams;
