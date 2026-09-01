import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../lib/store';
import { hasPermission } from '../lib/auth/rbac';
import { User, Organization, Project, Asset } from '../types';

describe('Centralized RBAC Engine & Tenant Isolation Rules', () => {
  // Test Tenants & Users
  const userA: User = {
    id: 'usr_alpha_01',
    email: 'alpha@enterprise-a.com',
    passwordHash: 'hash_alpha',
    fullName: 'Alpha Lead',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const userB: User = {
    id: 'usr_beta_01',
    email: 'beta@enterprise-b.com',
    passwordHash: 'hash_beta',
    fullName: 'Beta Lead',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const orgA: Organization = {
    id: 'org_alpha_tenancy',
    name: 'Alpha Corp Security',
    slug: 'alpha-corp',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const orgB: Organization = {
    id: 'org_beta_tenancy',
    name: 'Beta Corp Security',
    slug: 'beta-corp',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const projectA: Project = {
    id: 'prj_alpha_agent_01',
    organizationId: orgA.id,
    name: 'Alpha Secret Agent',
    description: 'Classified Alpha LLM Tooling',
    environment: 'production',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const projectB: Project = {
    id: 'prj_beta_agent_02',
    organizationId: orgB.id,
    name: 'Beta Proprietary Agent',
    description: 'Beta Financial Analysis Agent',
    environment: 'production',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const assetB: Asset = {
    id: 'ast_beta_db_tool_01',
    organizationId: orgB.id,
    projectId: projectB.id,
    type: 'TOOL',
    name: 'Beta Internal SQL Tool',
    description: 'Direct SQL execution tool inside Beta Corp',
    environment: 'production',
    metadata: { isolated: true },
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    db.createUser(userA);
    db.createUser(userB);
    db.createOrganization(orgA, userA.id);
    db.createOrganization(orgB, userB.id);
    db.createProject(projectA);
    db.createProject(projectB);
    db.createAsset(assetB);
  });

  describe('1. Tenant Boundary Isolation & Anti-IDOR Protections', () => {
    it('proves User A belongs to Org A and NOT Org B', () => {
      const memA = db.findMembership(orgA.id, userA.id);
      const memB = db.findMembership(orgB.id, userA.id);

      expect(memA).toBeDefined();
      expect(memA?.role).toBe('OWNER');
      expect(memB).toBeUndefined();
    });

    it('proves Project B cannot be retrieved when querying projects for Org A', () => {
      const orgAProjects = db.listProjectsForOrg(orgA.id);
      const containsProjectB = orgAProjects.some((p) => p.id === projectB.id);

      expect(containsProjectB).toBe(false);
      expect(orgAProjects.some((p) => p.id === projectA.id)).toBe(true);
    });

    it('proves Asset B belongs to Org B / Project B and never leaks into Org A lists', () => {
      const orgAAssets = db.listAssetsForOrg(orgA.id);
      const containsAssetB = orgAAssets.some((a) => a.id === assetB.id);

      expect(containsAssetB).toBe(false);
    });
  });

  describe('2. Centralized RBAC Matrix Verification', () => {
    it('OWNER role has full organization and project modification permissions', () => {
      expect(hasPermission('OWNER', 'org:update')).toBe(true);
      expect(hasPermission('OWNER', 'member:manage')).toBe(true);
      expect(hasPermission('OWNER', 'project:create')).toBe(true);
      expect(hasPermission('OWNER', 'asset:create')).toBe(true);
      expect(hasPermission('OWNER', 'test:execute')).toBe(true);
    });

    it('ADMIN role can manage members and projects but cannot delete organization', () => {
      expect(hasPermission('ADMIN', 'member:manage')).toBe(true);
      expect(hasPermission('ADMIN', 'project:create')).toBe(true);
      expect(hasPermission('ADMIN', 'asset:create')).toBe(true);
      expect(hasPermission('ADMIN', 'org:delete')).toBe(false);
    });

    it('SECURITY_LEAD role can run security tests and manage findings, but cannot manage org members', () => {
      expect(hasPermission('SECURITY_LEAD', 'test:execute')).toBe(true);
      expect(hasPermission('SECURITY_LEAD', 'asset:create')).toBe(true);
      expect(hasPermission('SECURITY_LEAD', 'member:manage')).toBe(false);
      expect(hasPermission('SECURITY_LEAD', 'org:update')).toBe(false);
    });

    it('ANALYST role can manage assigned findings but cannot create projects or execute arbitrary tests', () => {
      expect(hasPermission('ANALYST', 'finding:manage')).toBe(true);
      expect(hasPermission('ANALYST', 'project:read')).toBe(true);
      expect(hasPermission('ANALYST', 'project:create')).toBe(false);
      expect(hasPermission('ANALYST', 'test:execute')).toBe(false);
    });

    it('VIEWER role is strictly read-only and cannot modify projects, assets, or findings', () => {
      expect(hasPermission('VIEWER', 'project:read')).toBe(true);
      expect(hasPermission('VIEWER', 'asset:read')).toBe(true);
      expect(hasPermission('VIEWER', 'project:create')).toBe(false);
      expect(hasPermission('VIEWER', 'project:update')).toBe(false);
      expect(hasPermission('VIEWER', 'asset:create')).toBe(false);
      expect(hasPermission('VIEWER', 'asset:update')).toBe(false);
      expect(hasPermission('VIEWER', 'finding:manage')).toBe(false);
    });
  });
});
