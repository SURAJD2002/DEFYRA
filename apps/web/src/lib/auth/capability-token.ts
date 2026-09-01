import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { AssetEnvironment } from '@/types';

export interface ExecutionCapabilityPayload {
  organizationId: string;
  projectId: string;
  assetId: string;
  testRunId: string;
  allowedTargetUrl: string;
  allowedTestIds: string[];
  environment: AssetEnvironment;
  requestId: string;
  nonce: string;
  issuedAt: number;
  expiresAt: number;
}

export interface SignedExecutionCapabilityToken {
  payload: ExecutionCapabilityPayload;
  signature: string;
  rawToken: string;
}

const SECRET = process.env.ENCRYPTION_KEY || 'defyra-execution-engine-shared-secret-key-32bytes!';
const CAPABILITY_DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

// In-memory set of consumed nonces to prevent replay attacks
const consumedNonces = new Set<string>();

/**
 * Computes canonical payload string for HMAC signing.
 */
function canonicalizePayload(payload: ExecutionCapabilityPayload): string {
  return [
    payload.organizationId,
    payload.projectId,
    payload.assetId,
    payload.testRunId,
    payload.allowedTargetUrl,
    payload.allowedTestIds.slice().sort().join(','),
    payload.environment,
    payload.requestId,
    payload.nonce,
    payload.issuedAt.toString(),
    payload.expiresAt.toString(),
  ].join('|');
}

/**
 * Issues a cryptographically bound single-use execution capability token.
 */
export function issueExecutionCapabilityToken(params: {
  organizationId: string;
  projectId: string;
  assetId: string;
  testRunId: string;
  allowedTargetUrl: string;
  allowedTestIds: string[];
  environment: AssetEnvironment;
  requestId?: string;
  ttlMs?: number;
}): SignedExecutionCapabilityToken {
  const now = Date.now();
  const ttl = params.ttlMs || CAPABILITY_DEFAULT_TTL_MS;

  const payload: ExecutionCapabilityPayload = {
    organizationId: params.organizationId,
    projectId: params.projectId,
    assetId: params.assetId,
    testRunId: params.testRunId,
    allowedTargetUrl: params.allowedTargetUrl,
    allowedTestIds: params.allowedTestIds,
    environment: params.environment,
    requestId: params.requestId || `req_${randomBytes(8).toString('hex')}`,
    nonce: `non_${randomBytes(16).toString('hex')}`,
    issuedAt: now,
    expiresAt: now + ttl,
  };

  const canonical = canonicalizePayload(payload);
  const hmac = createHmac('sha256', SECRET);
  hmac.update(canonical);
  const signature = hmac.digest('hex');

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const rawToken = `${base64Payload}.${signature}`;

  return {
    payload,
    signature,
    rawToken,
  };
}

export type CapabilityVerificationResult =
  | { valid: true; payload: ExecutionCapabilityPayload }
  | { valid: false; error: string; code: 'INVALID_FORMAT' | 'SIGNATURE_MISMATCH' | 'EXPIRED' | 'REPLAYED' | 'SCOPE_MISMATCH' };

/**
 * Verifies that an execution capability token is authentic, unexpired, unconsumed, and matches target scope.
 */
export function verifyExecutionCapabilityToken(
  rawToken: string,
  expectedScope?: {
    organizationId?: string;
    projectId?: string;
    assetId?: string;
    testId?: string;
    targetUrl?: string;
  },
  consumeNonce = true
): CapabilityVerificationResult {
  try {
    const parts = rawToken.split('.');
    if (parts.length !== 2) {
      return { valid: false, error: 'Malformed token structure', code: 'INVALID_FORMAT' };
    }

    const [base64Payload, receivedSignature] = parts;
    const payloadStr = Buffer.from(base64Payload, 'base64url').toString('utf8');
    const payload: ExecutionCapabilityPayload = JSON.parse(payloadStr);

    // 1. Signature Verification
    const canonical = canonicalizePayload(payload);
    const hmac = createHmac('sha256', SECRET);
    hmac.update(canonical);
    const expectedSignature = hmac.digest('hex');

    const sigBuf = Buffer.from(receivedSignature, 'hex');
    const expBuf = Buffer.from(expectedSignature, 'hex');

    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false, error: 'Cryptographic signature mismatch. Token is forged or tampered.', code: 'SIGNATURE_MISMATCH' };
    }

    // 2. Expiration Check
    const now = Date.now();
    if (now > payload.expiresAt) {
      return { valid: false, error: 'Execution capability token has expired.', code: 'EXPIRED' };
    }

    // 3. Replay Protection
    if (consumedNonces.has(payload.nonce)) {
      return { valid: false, error: 'Execution capability token has already been consumed (replay blocked).', code: 'REPLAYED' };
    }

    // 4. Expected Scope Checks
    if (expectedScope) {
      if (expectedScope.organizationId && payload.organizationId !== expectedScope.organizationId) {
        return { valid: false, error: 'Token organization scope does not match execution context.', code: 'SCOPE_MISMATCH' };
      }
      if (expectedScope.projectId && payload.projectId !== expectedScope.projectId) {
        return { valid: false, error: 'Token project scope does not match execution context.', code: 'SCOPE_MISMATCH' };
      }
      if (expectedScope.assetId && payload.assetId !== expectedScope.assetId) {
        return { valid: false, error: 'Token asset scope does not match execution context.', code: 'SCOPE_MISMATCH' };
      }
      if (expectedScope.testId && !payload.allowedTestIds.includes(expectedScope.testId)) {
        return { valid: false, error: `Test ID '${expectedScope.testId}' is not authorized in this execution capability token.`, code: 'SCOPE_MISMATCH' };
      }
      if (expectedScope.targetUrl && payload.allowedTargetUrl !== expectedScope.targetUrl) {
        return { valid: false, error: 'Target URL does not match the explicitly authorized target in capability token.', code: 'SCOPE_MISMATCH' };
      }
    }

    if (consumeNonce) {
      consumedNonces.add(payload.nonce);
    }

    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: 'Failed to parse capability token', code: 'INVALID_FORMAT' };
  }
}
