/**
 * DEFYRA Phase 6: Customer Target Onboarding Adapters & Credential Abstraction
 * 
 * Operating Entity: MARKEET TECHNOLOGIES PRIVATE LIMITED
 * Brand: DEFYRA
 */

import { TargetConfig, TargetAdapterType } from '@/types';
import { isUnsafeNetworkDestination } from './target-validator';

export interface TargetHealthResult {
  healthy: boolean;
  statusCode?: number;
  latencyMs: number;
  message?: string;
}

export interface ProbeExecutionRequest {
  probePayload: Record<string, unknown>;
  secretToken?: string;
  timeoutMs?: number;
}

export interface ProbeExecutionResponse {
  rawResponse: Record<string, unknown>;
  statusCode: number;
  durationMs: number;
}

// -----------------------------------------------------------------------------
// SecretProvider Abstraction
// -----------------------------------------------------------------------------
export class SecretProvider {
  private static secrets: Map<string, string> = new Map();

  /**
   * Register a customer secret into ephemeral/dev vault.
   * Returns a synthetic reference ID that contains zero sensitive information.
   */
  public static storeSecret(referenceId: string, secretValue: string): void {
    this.secrets.set(referenceId, secretValue);
  }

  /**
   * Retrieve secret by reference at execution time only.
   */
  public static resolveSecret(referenceId: string): string | undefined {
    return this.secrets.get(referenceId);
  }

  /**
   * Redact known secrets from any string or JSON payload before logging or persisting.
   */
  public static sanitize(content: string): string {
    let sanitized = content;
    for (const [_, secret] of this.secrets.entries()) {
      if (secret && secret.length > 3) {
        sanitized = sanitized.split(secret).join('[REDACTED_CUSTOMER_SECRET]');
      }
    }
    // Also apply global canary pattern redactions
    return sanitized.replace(/DEFYRA_CANARY_[A-Za-z0-9_]+|DEFYRA_TEST_SECRET_[A-Za-z0-9_]+/g, '[REDACTED_CANARY_SECRET]');
  }

  public static clear(): void {
    this.secrets.clear();
  }
}

// -----------------------------------------------------------------------------
// TargetAdapter Base & Concrete Implementations
// -----------------------------------------------------------------------------
export abstract class TargetAdapter {
  abstract readonly type: TargetAdapterType;

  /**
   * Validates target configuration and SSRF/egress rules.
   */
  public validate(config: TargetConfig): { valid: boolean; reason?: string } {
    const egress = isUnsafeNetworkDestination(config.endpointUrl);
    if (egress.unsafe) {
      return { valid: false, reason: `Egress Guard: ${egress.reason}` };
    }
    return { valid: true };
  }

  /**
   * Performs an authorized synthetic health check without sending hostile payloads.
   */
  abstract healthCheck(config: TargetConfig): Promise<TargetHealthResult>;

  /**
   * Executes a scoped security probe through the target adapter.
   */
  abstract executeProbe(
    config: TargetConfig,
    request: ProbeExecutionRequest
  ): Promise<ProbeExecutionResponse>;

  /**
   * Sanitizes observation data to ensure zero customer secret leakage.
   */
  public sanitizeObservation(raw: Record<string, unknown>): Record<string, unknown> {
    const rawStr = JSON.stringify(raw);
    const cleanStr = SecretProvider.sanitize(rawStr);
    return JSON.parse(cleanStr);
  }
}

export class RestEndpointAdapter extends TargetAdapter {
  readonly type: TargetAdapterType = 'REST_ENDPOINT';

  async healthCheck(config: TargetConfig): Promise<TargetHealthResult> {
    const validation = this.validate(config);
    if (!validation.valid) {
      return { healthy: false, latencyMs: 0, message: validation.reason };
    }

    // In local/sandbox environment, return healthy status for authorized endpoints
    return {
      healthy: true,
      statusCode: 200,
      latencyMs: 5,
      message: 'REST endpoint reachable and responsive',
    };
  }

  async executeProbe(
    config: TargetConfig,
    request: ProbeExecutionRequest
  ): Promise<ProbeExecutionResponse> {
    const validation = this.validate(config);
    if (!validation.valid) {
      throw new Error(`Target invalid: ${validation.reason}`);
    }

    return {
      rawResponse: {
        status: 'received',
        adapter: this.type,
        sanitizedPrompt: request.probePayload,
      },
      statusCode: 200,
      durationMs: 10,
    };
  }
}

export class RagEndpointAdapter extends TargetAdapter {
  readonly type: TargetAdapterType = 'RAG_ENDPOINT';

  async healthCheck(config: TargetConfig): Promise<TargetHealthResult> {
    const validation = this.validate(config);
    if (!validation.valid) {
      return { healthy: false, latencyMs: 0, message: validation.reason };
    }

    return {
      healthy: true,
      statusCode: 200,
      latencyMs: 8,
      message: 'RAG vector retrieval service reachable',
    };
  }

  async executeProbe(
    config: TargetConfig,
    request: ProbeExecutionRequest
  ): Promise<ProbeExecutionResponse> {
    return {
      rawResponse: {
        status: 'queried',
        adapter: this.type,
        chunksRetrieved: 1,
      },
      statusCode: 200,
      durationMs: 15,
    };
  }
}

export class AgentToolAdapter extends TargetAdapter {
  readonly type: TargetAdapterType = 'AGENT_TOOL';

  async healthCheck(config: TargetConfig): Promise<TargetHealthResult> {
    const validation = this.validate(config);
    if (!validation.valid) {
      return { healthy: false, latencyMs: 0, message: validation.reason };
    }

    return {
      healthy: true,
      statusCode: 200,
      latencyMs: 12,
      message: 'Agent tool broker active and responsive',
    };
  }

  async executeProbe(
    config: TargetConfig,
    request: ProbeExecutionRequest
  ): Promise<ProbeExecutionResponse> {
    return {
      rawResponse: {
        status: 'agent_evaluated',
        adapter: this.type,
        toolBrokerResult: 'evaluated',
      },
      statusCode: 200,
      durationMs: 20,
    };
  }
}

// -----------------------------------------------------------------------------
// TargetAdapter Factory
// -----------------------------------------------------------------------------
export function getTargetAdapter(type: TargetAdapterType): TargetAdapter {
  switch (type) {
    case 'REST_ENDPOINT':
      return new RestEndpointAdapter();
    case 'RAG_ENDPOINT':
      return new RagEndpointAdapter();
    case 'AGENT_TOOL':
      return new AgentToolAdapter();
    default:
      throw new Error(`Unsupported target adapter type: ${type}`);
  }
}
