import { z } from 'zod';
import { Severity, AssetType, AssetEnvironment } from '@/types';

/**
 * Individual probing stage in a multi-stage security test DAG.
 */
export const testProbeStageSchema = z.object({
  stageId: z.string().min(1, 'Stage ID is required'),
  name: z.string().min(1, 'Stage name is required'),
  handler: z.string().min(1, 'Handler identifier is required'),
  probePayload: z.record(z.unknown()).default({}),
  dependsOn: z.array(z.string()).default([]),
  timeoutSeconds: z.number().int().positive().max(300).default(30),
  expectedObservation: z.string().min(1, 'Expected observation is required'),
  stopConditions: z.array(z.string()).default(['FATAL_ERROR', 'KILL_SWITCH_TRIGGERED']),
});

export type TestProbeStage = z.infer<typeof testProbeStageSchema>;

/**
 * Execution and safety constraints for a security test contract.
 */
export const testConstraintsSchema = z.object({
  maxRetries: z.number().int().min(0).max(3).default(0),
  rateLimitPerMinute: z.number().int().positive().default(10),
  maxConcurrentProbes: z.number().int().positive().max(5).default(1),
  allowedEnvironments: z.array(z.enum(['development', 'staging', 'production'])).default(['development', 'staging']),
  requiresHumanInTheLoop: z.boolean().default(false),
  blockDestructiveActions: z.boolean().default(true),
});

export type TestConstraints = z.infer<typeof testConstraintsSchema>;

/**
 * Explicit scope and authorization requirements for a test contract.
 */
export const authScopeRequirementsSchema = z.object({
  minimumRole: z.enum(['OWNER', 'ADMIN', 'SECURITY_LEAD']).default('SECURITY_LEAD'),
  requiresSignedCapability: z.boolean().default(true),
  targetAllowlistStrict: z.boolean().default(true),
  productionRequiresDualKey: z.boolean().default(true),
});

export type AuthScopeRequirements = z.infer<typeof authScopeRequirementsSchema>;

/**
 * Canonical DEFYRA Security Test Schema Contract (SecurityTestSchemaV1).
 * Adapted from CRE WorkflowSchemaV1 into a disciplined security evaluation contract.
 */
export const securityTestSchemaV1 = z.object({
  testId: z.string().regex(/^DEF-[A-Z]{3}-\d{3}$/, 'Test ID must match pattern DEF-XXX-000 (e.g. DEF-INJ-001)'),
  name: z.string().min(3, 'Test name is required'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must follow SemVer (e.g. 1.0.0)').default('1.0.0'),
  category: z.string().min(2, 'Category is required'),
  objective: z.string().min(10, 'Objective is required'),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL']),
  targetTypes: z.array(
    z.enum([
      'APPLICATION',
      'AGENT',
      'MODEL',
      'RAG',
      'MEMORY',
      'TOOL',
      'API',
      'IDENTITY',
      'PERMISSION',
      'DATA_SOURCE',
      'MCP_SERVER',
    ])
  ).min(1, 'At least one target type is required'),
  preconditions: z.array(z.string()).default([]),
  authorizationRequirements: authScopeRequirementsSchema.default({}),
  constraints: testConstraintsSchema.default({}),
  stages: z.array(testProbeStageSchema).min(1, 'Security test must have at least one execution stage'),
  evidenceRequirements: z.array(z.string()).default([]),
  expectedBehavior: z.string().min(5, 'Expected behavior definition is required'),
  remediationGuidance: z.string().min(5, 'Remediation guidance is required'),
  retestCriteria: z.string().min(5, 'Retest criteria is required'),
  active: z.boolean().default(true),
});

export type SecurityTestSchemaV1 = z.infer<typeof securityTestSchemaV1>;

/**
 * Validates that stage dependencies in a test form a valid Directed Acyclic Graph (DAG).
 */
export function validateTestDAG(test: SecurityTestSchemaV1): { valid: boolean; error?: string } {
  const stageIds = new Set<string>();

  for (const stage of test.stages) {
    if (stageIds.has(stage.stageId)) {
      return { valid: false, error: `Duplicate stage ID: ${stage.stageId}` };
    }
    stageIds.add(stage.stageId);
  }

  for (const stage of test.stages) {
    for (const dep of stage.dependsOn) {
      if (!stageIds.has(dep)) {
        return { valid: false, error: `Stage ${stage.stageId} depends on non-existent stage: ${dep}` };
      }
      if (dep === stage.stageId) {
        return { valid: false, error: `Stage ${stage.stageId} cannot depend on itself` };
      }
    }
  }

  return { valid: true };
}
