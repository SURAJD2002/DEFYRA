import { describe, it, expect, beforeEach } from 'vitest';
import {
  killSwitchRegistry,
  KillSwitchTier,
  KillSwitchCheckResult,
} from '../lib/security/kill-switch';
import {
  canonicalizeAndValidateUrl,
  isProhibitedIP,
  parseIPv4Representation,
  parseIPv4MappedIPv6,
  resolveAndValidateTargetIPs,
  safeEgressFetch,
} from '../lib/security/network-egress';
import { validateExecutionTarget } from '../lib/security/target-validator';
import { db } from '../lib/store';
import { Asset, Project, Organization } from '../types';

describe('Milestones D & E — 4-Tier Kill Switch & Secure Network Egress Engine', () => {
  // Test Tenancy Fixtures
  const orgAlpha: Organization = {
    id: 'org_ks_alpha',
    name: 'Alpha Organization',
    slug: 'alpha-org',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const orgBeta: Organization = {
    id: 'org_ks_beta',
    name: 'Beta Organization',
    slug: 'beta-org',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const projectAlpha1: Project = {
    id: 'prj_ks_alpha_01',
    organizationId: orgAlpha.id,
    name: 'Alpha Customer Agent Project',
    description: 'Project Alpha 1 Scope',
    environment: 'staging',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const projectAlpha2: Project = {
    id: 'prj_ks_alpha_02',
    organizationId: orgAlpha.id,
    name: 'Alpha Internal Analytics Project',
    description: 'Project Alpha 2 Scope',
    environment: 'staging',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const assetAlpha1: Asset = {
    id: 'ast_ks_agent_01',
    organizationId: orgAlpha.id,
    projectId: projectAlpha1.id,
    type: 'AGENT',
    name: 'Alpha Staging Agent',
    description: 'Staging Chat Agent',
    environment: 'staging',
    metadata: { endpointUrl: 'https://alpha-agent.defyra.internal/v1' },
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    killSwitchRegistry.clearAll();
    db.createOrganization(orgAlpha, 'usr_founder');
    db.createOrganization(orgBeta, 'usr_beta');
    db.createProject(projectAlpha1);
    db.createProject(projectAlpha2);
    db.createAsset(assetAlpha1);
  });

  // =========================================================================
  // MILESTONE D: 4-TIER FAIL-CLOSED KILL SWITCH
  // =========================================================================
  describe('Milestone D: 4-Tier Kill Switch Hierarchy & Fail-Closed Enforcement', () => {
    it('1. Allows execution when all kill switch tiers are ACTIVE (clear)', () => {
      const check = killSwitchRegistry.check({
        organizationId: orgAlpha.id,
        projectId: projectAlpha1.id,
        testRunId: 'tr_001',
      });
      expect(check.blocked).toBe(false);
      expect(check.state).toBe('ACTIVE');
    });

    it('2. GLOBAL Kill Switch blocks all executions across all tenants', async () => {
      const triggerRes = await killSwitchRegistry.trigger({
        tier: 'GLOBAL',
        targetId: 'GLOBAL',
        reason: 'Critical 0-day vulnerability identified in underlying platform runtime.',
        userId: 'usr_owner_01',
        userRole: 'OWNER',
      });
      expect(triggerRes.success).toBe(true);

      // Check Org Alpha
      const checkAlpha = killSwitchRegistry.check({
        organizationId: orgAlpha.id,
        projectId: projectAlpha1.id,
        testRunId: 'tr_001',
      });
      expect(checkAlpha.blocked).toBe(true);
      if (checkAlpha.blocked && checkAlpha.state === 'TRIGGERED') {
        expect(checkAlpha.triggeredTier).toBe('GLOBAL');
      }

      // Check Org Beta
      const checkBeta = killSwitchRegistry.check({
        organizationId: orgBeta.id,
        projectId: 'prj_beta_01',
        testRunId: 'tr_002',
      });
      expect(checkBeta.blocked).toBe(true);
    });

    it('3. ORGANIZATION Kill Switch blocks only the specified organization', async () => {
      await killSwitchRegistry.trigger({
        tier: 'ORGANIZATION',
        targetId: orgAlpha.id,
        reason: 'Security Lead requested tenant-wide pause for maintenance.',
        userId: 'usr_admin_01',
        userRole: 'ADMIN',
      });

      // Org Alpha is blocked
      const checkAlpha = killSwitchRegistry.check({
        organizationId: orgAlpha.id,
        projectId: projectAlpha1.id,
        testRunId: 'tr_001',
      });
      expect(checkAlpha.blocked).toBe(true);
      if (checkAlpha.blocked && checkAlpha.state === 'TRIGGERED') {
        expect(checkAlpha.triggeredTier).toBe('ORGANIZATION');
        expect(checkAlpha.triggeredTargetId).toBe(orgAlpha.id);
      }

      // Org Beta remains ACTIVE
      const checkBeta = killSwitchRegistry.check({
        organizationId: orgBeta.id,
        projectId: 'prj_beta_01',
        testRunId: 'tr_002',
      });
      expect(checkBeta.blocked).toBe(false);
    });

    it('4. PROJECT Kill Switch blocks executions within that project only', async () => {
      await killSwitchRegistry.trigger({
        tier: 'PROJECT',
        targetId: projectAlpha1.id,
        reason: 'Agent runaway tool call loop detected in Project 1.',
        userId: 'usr_lead_01',
        userRole: 'SECURITY_LEAD',
      });

      // Project 1 in Org Alpha is blocked
      const checkProj1 = killSwitchRegistry.check({
        organizationId: orgAlpha.id,
        projectId: projectAlpha1.id,
        testRunId: 'tr_001',
      });
      expect(checkProj1.blocked).toBe(true);

      // Project 2 in Org Alpha remains ACTIVE
      const checkProj2 = killSwitchRegistry.check({
        organizationId: orgAlpha.id,
        projectId: projectAlpha2.id,
        testRunId: 'tr_002',
      });
      expect(checkProj2.blocked).toBe(false);
    });

    it('5. TEST_RUN Kill Switch aborts exactly the specified execution job', async () => {
      await killSwitchRegistry.trigger({
        tier: 'TEST_RUN',
        targetId: 'tr_emergency_abort_99',
        reason: 'User clicked emergency Stop Test Run in Dashboard.',
        userId: 'usr_lead_01',
        userRole: 'SECURITY_LEAD',
      });

      const checkTr = killSwitchRegistry.check({
        organizationId: orgAlpha.id,
        projectId: projectAlpha1.id,
        testRunId: 'tr_emergency_abort_99',
      });
      expect(checkTr.blocked).toBe(true);
      if (checkTr.blocked && checkTr.state === 'TRIGGERED') {
        expect(checkTr.triggeredTier).toBe('TEST_RUN');
        expect(checkTr.triggeredTargetId).toBe('tr_emergency_abort_99');
      }

      // Another test run in same project remains ACTIVE
      const checkOtherTr = killSwitchRegistry.check({
        organizationId: orgAlpha.id,
        projectId: projectAlpha1.id,
        testRunId: 'tr_safe_job_100',
      });
      expect(checkOtherTr.blocked).toBe(false);
    });

    it('6. Fails closed when kill-switch state store is unreachable', () => {
      killSwitchRegistry.setSimulateStoreFailure(true);

      const check = killSwitchRegistry.check({
        organizationId: orgAlpha.id,
        projectId: projectAlpha1.id,
        testRunId: 'tr_001',
      });

      expect(check.blocked).toBe(true);
      expect(check.state).toBe('UNAVAILABLE');
      if (check.blocked && check.state === 'UNAVAILABLE') {
        expect(check.reason).toContain('Failing closed');
      }
    });

    it('7. Enforces strict RBAC permissions when activating kill switches', async () => {
      // ANALYST trying to trigger Global kill switch is rejected
      const analystGlobal = await killSwitchRegistry.trigger({
        tier: 'GLOBAL',
        targetId: 'GLOBAL',
        reason: 'Unauthorized global stop attempt',
        userId: 'usr_analyst_01',
        userRole: 'ANALYST',
      });
      expect(analystGlobal.success).toBe(false);

      // VIEWER trying to trigger Project kill switch is rejected
      const viewerProject = await killSwitchRegistry.trigger({
        tier: 'PROJECT',
        targetId: projectAlpha1.id,
        reason: 'Viewer abort attempt',
        userId: 'usr_viewer_01',
        userRole: 'VIEWER',
      });
      expect(viewerProject.success).toBe(false);
    });

    it('8. Allows authorized reset of a triggered kill switch', async () => {
      await killSwitchRegistry.trigger({
        tier: 'PROJECT',
        targetId: projectAlpha1.id,
        reason: 'Testing pause',
        userId: 'usr_admin_01',
        userRole: 'ADMIN',
      });

      const beforeReset = killSwitchRegistry.check({ projectId: projectAlpha1.id });
      expect(beforeReset.blocked).toBe(true);

      const resetRes = await killSwitchRegistry.reset({
        tier: 'PROJECT',
        targetId: projectAlpha1.id,
        userId: 'usr_admin_01',
        userRole: 'ADMIN',
      });
      expect(resetRes.success).toBe(true);

      const afterReset = killSwitchRegistry.check({ projectId: projectAlpha1.id });
      expect(afterReset.blocked).toBe(false);
      expect(afterReset.state).toBe('ACTIVE');
    });
  });

  // =========================================================================
  // MILESTONE E: NETWORK EGRESS & SSRF PROTECTION ENGINE
  // =========================================================================
  describe('Milestone E: Network Egress Canonicalization & SSRF Defense', () => {
    it('1. Detects and normalizes numeric decimal IPv4 representations', () => {
      // 2130706433 is 127.0.0.1
      const decimalLoopback = parseIPv4Representation('2130706433');
      expect(decimalLoopback.isIPv4).toBe(true);
      expect(decimalLoopback.normalized).toBe('127.0.0.1');

      // 2852039166 is 169.254.169.254
      const decimalMetadata = parseIPv4Representation('2852039166');
      expect(decimalMetadata.isIPv4).toBe(true);
      expect(decimalMetadata.normalized).toBe('169.254.169.254');
    });

    it('2. Detects and normalizes hexadecimal and octal IPv4 representations', () => {
      // Hex 0x7f000001 is 127.0.0.1
      const hexLoopback = parseIPv4Representation('0x7f000001');
      expect(hexLoopback.isIPv4).toBe(true);
      expect(hexLoopback.normalized).toBe('127.0.0.1');

      // Octal 0177.0.0.1 is 127.0.0.1
      const octalLoopback = parseIPv4Representation('0177.0.0.1');
      expect(octalLoopback.isIPv4).toBe(true);
      expect(octalLoopback.normalized).toBe('127.0.0.1');
    });

    it('3. Detects and evaluates IPv4-mapped IPv6 addresses', () => {
      const mappedLoopback = parseIPv4MappedIPv6('::ffff:127.0.0.1');
      expect(mappedLoopback.isMapped).toBe(true);
      expect(mappedLoopback.embeddedIPv4).toBe('127.0.0.1');

      const mappedCheck = isProhibitedIP('::ffff:127.0.0.1');
      expect(mappedCheck.prohibited).toBe(true);

      const mappedMetadataCheck = isProhibitedIP('::ffff:169.254.169.254');
      expect(mappedMetadataCheck.prohibited).toBe(true);
    });

    it('4. Blocks comprehensive IPv4 private and reserved subnets', () => {
      // Loopback
      expect(isProhibitedIP('127.0.0.1').prohibited).toBe(true);
      expect(isProhibitedIP('127.255.255.254').prohibited).toBe(true);

      // Cloud Metadata & Link-Local
      expect(isProhibitedIP('169.254.169.254').prohibited).toBe(true);
      expect(isProhibitedIP('169.254.1.1').prohibited).toBe(true);

      // Private RFC 1918
      expect(isProhibitedIP('10.0.0.1').prohibited).toBe(true);
      expect(isProhibitedIP('172.16.0.1').prohibited).toBe(true);
      expect(isProhibitedIP('172.31.255.254').prohibited).toBe(true);
      expect(isProhibitedIP('192.168.1.100').prohibited).toBe(true);

      // CGNAT & Reserved
      expect(isProhibitedIP('100.64.0.1').prohibited).toBe(true);
      expect(isProhibitedIP('0.0.0.0').prohibited).toBe(true);
      expect(isProhibitedIP('240.0.0.1').prohibited).toBe(true);
      expect(isProhibitedIP('255.255.255.255').prohibited).toBe(true);

      // Valid Public IPs
      expect(isProhibitedIP('8.8.8.8').prohibited).toBe(false);
      expect(isProhibitedIP('104.244.42.1').prohibited).toBe(false);
    });

    it('5. Blocks comprehensive IPv6 loopback, link-local, and unique local subnets', () => {
      expect(isProhibitedIP('::1').prohibited).toBe(true);
      expect(isProhibitedIP('::').prohibited).toBe(true);
      expect(isProhibitedIP('fe80::1').prohibited).toBe(true); // Link local
      expect(isProhibitedIP('fc00::1').prohibited).toBe(true); // Unique local
      expect(isProhibitedIP('fd12:3456:789a::1').prohibited).toBe(true); // Unique local
      expect(isProhibitedIP('ff02::1').prohibited).toBe(true); // Multicast
      expect(isProhibitedIP('2001:db8::1').prohibited).toBe(true); // Documentation
    });

    it('6. Rejects Userinfo in URL (preventing credential injection & bypasses)', () => {
      const userinfoResult = canonicalizeAndValidateUrl('https://admin:secret@customer-agent.com/v1');
      expect(userinfoResult.valid).toBe(false);
      expect(userinfoResult.code).toBe('USERINFO_PROHIBITED');

      const userinfoNoPass = canonicalizeAndValidateUrl('https://admin@customer-agent.com/v1');
      expect(userinfoNoPass.valid).toBe(false);
      expect(userinfoNoPass.code).toBe('USERINFO_PROHIBITED');
    });

    it('7. Rejects disallowed protocols (only HTTPS/HTTP/WSS/WS/MCP allowed)', () => {
      expect(canonicalizeAndValidateUrl('file:///etc/passwd').valid).toBe(false);
      expect(canonicalizeAndValidateUrl('gopher://127.0.0.1:70').valid).toBe(false);
      expect(canonicalizeAndValidateUrl('ftp://internal-server.corp/data').valid).toBe(false);
      expect(canonicalizeAndValidateUrl('data:text/html,<html>').valid).toBe(false);
    });

    it('8. Defends against DNS Rebinding attacks by validating resolved IP addresses', async () => {
      // Mock DNS Resolver that returns private internal IP for a public-looking domain
      const mockRebindingDNS = async (host: string) => {
        if (host === 'rebind-attack.com') {
          return ['10.0.0.15']; // Resolved to internal AWS VPC IP!
        }
        return ['93.184.216.34']; // Clean public IP
      };

      const cleanCheck = await resolveAndValidateTargetIPs('example.com', mockRebindingDNS);
      expect(cleanCheck.valid).toBe(true);

      const rebindCheck = await resolveAndValidateTargetIPs('rebind-attack.com', mockRebindingDNS);
      expect(rebindCheck.valid).toBe(false);
      expect(rebindCheck.error).toContain('prohibited IP');
    });
  });

  // =========================================================================
  // INTEGRATED TARGET VALIDATION WITH KILL SWITCH & EGRESS
  // =========================================================================
  describe('Integrated Target Validation with Kill Switch & Egress', () => {
    it('Blocks execution if Project Kill Switch is triggered during validation', async () => {
      await killSwitchRegistry.trigger({
        tier: 'PROJECT',
        targetId: projectAlpha1.id,
        reason: 'Project under active security review',
        userId: 'usr_admin_01',
        userRole: 'ADMIN',
      });

      const res = validateExecutionTarget({
        organizationId: orgAlpha.id,
        projectId: projectAlpha1.id,
        assetId: assetAlpha1.id,
        testId: 'DEF-INJ-001',
        environment: 'staging',
      });

      expect(res.valid).toBe(false);
      if (!res.valid) {
        expect(res.code).toBe('KILL_SWITCH_ACTIVE');
      }
    });

    it('Passes validation when all safety, tenancy, allowlist, and egress conditions are satisfied', () => {
      const res = validateExecutionTarget({
        organizationId: orgAlpha.id,
        projectId: projectAlpha1.id,
        assetId: assetAlpha1.id,
        testId: 'DEF-INJ-001',
        environment: 'staging',
      });

      expect(res.valid).toBe(true);
      if (res.valid) {
        expect(res.resolvedTarget.assetId).toBe(assetAlpha1.id);
        expect(res.resolvedTarget.targetEndpoint).toBe('https://alpha-agent.defyra.internal/v1');
      }
    });
  });
});
