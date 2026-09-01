import { logAuditEvent } from '@/lib/audit-logger';
import { UserRole } from '@/types';

export type KillSwitchTier = 'GLOBAL' | 'ORGANIZATION' | 'PROJECT' | 'TEST_RUN';
export type KillSwitchState = 'ACTIVE' | 'TRIGGERED' | 'DISABLED';

export interface KillSwitchRecord {
  id: string;
  tier: KillSwitchTier;
  targetId: string; // 'GLOBAL' or orgId or projectId or testRunId
  state: KillSwitchState;
  reason?: string;
  triggeredByUserId?: string;
  triggeredAt?: string;
  resetByUserId?: string;
  resetAt?: string;
}

export interface KillSwitchScope {
  organizationId?: string;
  projectId?: string;
  testRunId?: string;
}

export type KillSwitchCheckResult =
  | { blocked: false; state: 'ACTIVE' }
  | {
      blocked: true;
      state: 'TRIGGERED';
      triggeredTier: KillSwitchTier;
      triggeredTargetId: string;
      reason: string;
      triggeredAt: string;
    }
  | {
      blocked: true;
      state: 'UNAVAILABLE';
      reason: string;
    };

/**
 * In-memory thread-safe state repository for Kill Switches.
 * In distributed production, backed by Redis pub/sub + PostgreSQL fail-closed cache.
 */
class KillSwitchRegistry {
  private records: Map<string, KillSwitchRecord> = new Map();
  private simulateStoreFailure = false;

  constructor() {
    // Default: Global kill switch is inactive/clear
    this.records.set('GLOBAL', {
      id: 'ks_global',
      tier: 'GLOBAL',
      targetId: 'GLOBAL',
      state: 'ACTIVE',
    });
  }

  private getKey(tier: KillSwitchTier, targetId: string): string {
    return `${tier}:${targetId}`;
  }

  /**
   * For testing resilience: simulates store failure to verify fail-closed behavior.
   */
  public setSimulateStoreFailure(failure: boolean) {
    this.simulateStoreFailure = failure;
  }

  /**
   * Evaluates the 4-tier hierarchy: GLOBAL -> ORGANIZATION -> PROJECT -> TEST_RUN.
   * If ANY tier is TRIGGERED (or if store fails), returns blocked: true.
   */
  public check(scope: KillSwitchScope): KillSwitchCheckResult {
    if (this.simulateStoreFailure) {
      return {
        blocked: true,
        state: 'UNAVAILABLE',
        reason: 'Kill switch state store is unreachable. Failing closed to protect systems.',
      };
    }

    try {
      // 1. Check GLOBAL Tier
      const globalRecord = this.records.get('GLOBAL');
      if (globalRecord && globalRecord.state === 'TRIGGERED') {
        return {
          blocked: true,
          state: 'TRIGGERED',
          triggeredTier: 'GLOBAL',
          triggeredTargetId: 'GLOBAL',
          reason: globalRecord.reason || 'Global emergency kill switch is active.',
          triggeredAt: globalRecord.triggeredAt || new Date().toISOString(),
        };
      }

      // 2. Check ORGANIZATION Tier
      if (scope.organizationId) {
        const orgRecord = this.records.get(this.getKey('ORGANIZATION', scope.organizationId));
        if (orgRecord && orgRecord.state === 'TRIGGERED') {
          return {
            blocked: true,
            state: 'TRIGGERED',
            triggeredTier: 'ORGANIZATION',
            triggeredTargetId: scope.organizationId,
            reason: orgRecord.reason || `Organization kill switch is active for ${scope.organizationId}.`,
            triggeredAt: orgRecord.triggeredAt || new Date().toISOString(),
          };
        }
      }

      // 3. Check PROJECT Tier
      if (scope.projectId) {
        const projRecord = this.records.get(this.getKey('PROJECT', scope.projectId));
        if (projRecord && projRecord.state === 'TRIGGERED') {
          return {
            blocked: true,
            state: 'TRIGGERED',
            triggeredTier: 'PROJECT',
            triggeredTargetId: scope.projectId,
            reason: projRecord.reason || `Project kill switch is active for ${scope.projectId}.`,
            triggeredAt: projRecord.triggeredAt || new Date().toISOString(),
          };
        }
      }

      // 4. Check TEST_RUN Tier
      if (scope.testRunId) {
        const trRecord = this.records.get(this.getKey('TEST_RUN', scope.testRunId));
        if (trRecord && trRecord.state === 'TRIGGERED') {
          return {
            blocked: true,
            state: 'TRIGGERED',
            triggeredTier: 'TEST_RUN',
            triggeredTargetId: scope.testRunId,
            reason: trRecord.reason || `Test run ${scope.testRunId} has been manually aborted.`,
            triggeredAt: trRecord.triggeredAt || new Date().toISOString(),
          };
        }
      }

      return { blocked: false, state: 'ACTIVE' };
    } catch (err) {
      // Fail closed on any internal evaluation exception
      return {
        blocked: true,
        state: 'UNAVAILABLE',
        reason: 'Internal error checking kill switch state. Failing closed.',
      };
    }
  }

  /**
   * Activates a Kill Switch at a specific tier with RBAC authorization check.
   */
  public async trigger(params: {
    tier: KillSwitchTier;
    targetId: string;
    reason: string;
    userId: string;
    userRole: UserRole;
  }): Promise<{ success: boolean; error?: string }> {
    const { tier, targetId, reason, userId, userRole } = params;

    // RBAC Authorization Matrix for Kill Switches:
    // GLOBAL: OWNER only
    // ORGANIZATION: OWNER or ADMIN
    // PROJECT: OWNER, ADMIN, or SECURITY_LEAD
    // TEST_RUN: OWNER, ADMIN, or SECURITY_LEAD
    if (tier === 'GLOBAL' && userRole !== 'OWNER') {
      return { success: false, error: 'Only OWNER role can activate the Global Kill Switch.' };
    }
    if (tier === 'ORGANIZATION' && !['OWNER', 'ADMIN'].includes(userRole)) {
      return { success: false, error: 'Only OWNER or ADMIN roles can activate an Organization Kill Switch.' };
    }
    if (tier === 'PROJECT' && !['OWNER', 'ADMIN', 'SECURITY_LEAD'].includes(userRole)) {
      return { success: false, error: 'Role lacks permission to activate Project Kill Switch.' };
    }
    if (tier === 'TEST_RUN' && !['OWNER', 'ADMIN', 'SECURITY_LEAD'].includes(userRole)) {
      return { success: false, error: 'Role lacks permission to abort Test Run.' };
    }

    const key = tier === 'GLOBAL' ? 'GLOBAL' : this.getKey(tier, targetId);
    const now = new Date().toISOString();

    const record: KillSwitchRecord = {
      id: `ks_${Math.random().toString(36).substring(2, 9)}`,
      tier,
      targetId,
      state: 'TRIGGERED',
      reason,
      triggeredByUserId: userId,
      triggeredAt: now,
    };

    this.records.set(key, record);

    await logAuditEvent({
      action: 'KILL_SWITCH_TRIGGERED',
      resourceType: tier,
      resourceId: targetId,
      userId,
      metadata: { tier, targetId, reason, state: 'TRIGGERED' },
      createdAt: now,
    });

    return { success: true };
  }

  /**
   * Resets / deactivates a Kill Switch with RBAC authorization check.
   */
  public async reset(params: {
    tier: KillSwitchTier;
    targetId: string;
    userId: string;
    userRole: UserRole;
  }): Promise<{ success: boolean; error?: string }> {
    const { tier, targetId, userId, userRole } = params;

    if (tier === 'GLOBAL' && userRole !== 'OWNER') {
      return { success: false, error: 'Only OWNER role can reset the Global Kill Switch.' };
    }
    if (tier === 'ORGANIZATION' && !['OWNER', 'ADMIN'].includes(userRole)) {
      return { success: false, error: 'Only OWNER or ADMIN roles can reset an Organization Kill Switch.' };
    }
    if (tier === 'PROJECT' && !['OWNER', 'ADMIN', 'SECURITY_LEAD'].includes(userRole)) {
      return { success: false, error: 'Role lacks permission to reset Project Kill Switch.' };
    }

    const key = tier === 'GLOBAL' ? 'GLOBAL' : this.getKey(tier, targetId);
    const existing = this.records.get(key);
    const now = new Date().toISOString();

    if (existing) {
      existing.state = 'ACTIVE';
      existing.resetByUserId = userId;
      existing.resetAt = now;
      this.records.set(key, existing);
    }

    await logAuditEvent({
      action: 'KILL_SWITCH_RESET',
      resourceType: tier,
      resourceId: targetId,
      userId,
      metadata: { tier, targetId, state: 'ACTIVE' },
      createdAt: now,
    });

    return { success: true };
  }

  public clearAll() {
    this.records.clear();
    this.records.set('GLOBAL', {
      id: 'ks_global',
      tier: 'GLOBAL',
      targetId: 'GLOBAL',
      state: 'ACTIVE',
    });
    this.simulateStoreFailure = false;
  }
}

// Global Singleton
declare global {
  var __defyra_kill_switch: KillSwitchRegistry | undefined;
}

export const killSwitchRegistry: KillSwitchRegistry =
  globalThis.__defyra_kill_switch || new KillSwitchRegistry();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__defyra_kill_switch = killSwitchRegistry;
}
