import {
  User,
  Organization,
  Membership,
  Project,
  Asset,
  AssetRelationship,
  Session,
  UserProfile,
  UserRole,
  ProjectEnvironment,
  AssetType,
  AssetEnvironment,
  RelationshipType,
  TestRun,
  FindingRecord,
} from '@/types';

import { scryptSync } from 'crypto';

// Global in-memory storage simulating PostgreSQL schema for v0.1 dev/tests
class DatabaseStore {
  public users: Map<string, User> = new Map();
  public organizations: Map<string, Organization> = new Map();
  public memberships: Map<string, Membership> = new Map();
  public projects: Map<string, Project> = new Map();
  public assets: Map<string, Asset> = new Map();
  public assetRelationships: Map<string, AssetRelationship> = new Map();
  public sessions: Map<string, Session> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Default Demo Admin User (Password: "DefyraSecurity2026!")
    const defaultUserId = 'usr_defyra_founder_01';
    const defaultOrgId = 'org_defyra_corp_01';
    const defaultProjectId = 'prj_agent_nexus_01';

    const salt = '88ff72cb25055caee996f01bb4ddf69c';
    const derivedKey = scryptSync('DefyraSecurity2026!', salt, 64);
    const demoPasswordHash = `${salt}:${derivedKey.toString('hex')}`;

    const founderUser: User = {
      id: defaultUserId,
      email: 'founder@defyra.ai',
      passwordHash: demoPasswordHash,
      fullName: 'DEFYRA Security Lead',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.set(founderUser.id, founderUser);

    const defaultOrg: Organization = {
      id: defaultOrgId,
      name: 'DEFYRA Autonomous Lab',
      slug: 'defyra-lab',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.organizations.set(defaultOrg.id, defaultOrg);

    const founderMembership: Membership = {
      id: 'mem_founder_01',
      organizationId: defaultOrg.id,
      userId: founderUser.id,
      role: 'OWNER',
      createdAt: new Date().toISOString(),
    };
    this.memberships.set(founderMembership.id, founderMembership);

    const nexusProject: Project = {
      id: defaultProjectId,
      organizationId: defaultOrg.id,
      name: 'Nexus Agent Orchestrator',
      description: 'Autonomous financial analysis and RAG agent pipeline with multi-tool calling.',
      environment: 'staging',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.projects.set(nexusProject.id, nexusProject);

    // Initial Assets for Nexus Project
    const agentAsset: Asset = {
      id: 'ast_agent_01',
      organizationId: defaultOrg.id,
      projectId: nexusProject.id,
      type: 'AGENT',
      name: 'Financial Query Planner Agent',
      description: 'Primary reasoning agent orchestrating database lookups and document synthesis.',
      environment: 'staging',
      metadata: { model: 'gpt-4o', autonomyLevel: 'high', maxTokens: 4096 },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.assets.set(agentAsset.id, agentAsset);

    const ragAsset: Asset = {
      id: 'ast_rag_01',
      organizationId: defaultOrg.id,
      projectId: nexusProject.id,
      type: 'RAG',
      name: 'Enterprise SEC Filings Vector DB',
      description: 'Pinecone vector index containing chunked corporate financial disclosures.',
      environment: 'staging',
      metadata: { vectorDim: 1536, similarity: 'cosine', index: 'sec-filings-v2' },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.assets.set(ragAsset.id, ragAsset);

    const toolAsset: Asset = {
      id: 'ast_tool_01',
      organizationId: defaultOrg.id,
      projectId: nexusProject.id,
      type: 'TOOL',
      name: 'Python Data Analytics REPL',
      description: 'Sandboxed Python runtime for executing mathematical data aggregation scripts.',
      environment: 'staging',
      metadata: { runtime: 'docker-isolated', timeoutSec: 15 },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.assets.set(toolAsset.id, toolAsset);

    const mcpAsset: Asset = {
      id: 'ast_mcp_01',
      organizationId: defaultOrg.id,
      projectId: nexusProject.id,
      type: 'MCP_SERVER',
      name: 'Internal ERP Connector MCP Server',
      description: 'Model Context Protocol server interfacing with internal enterprise ledgers.',
      environment: 'staging',
      metadata: { protocolVersion: '2024-11-05', capabilities: ['read_ledger', 'query_invoice'] },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.assets.set(mcpAsset.id, mcpAsset);

    // Relationships
    this.assetRelationships.set('rel_01', {
      id: 'rel_01',
      projectId: nexusProject.id,
      sourceAssetId: agentAsset.id,
      targetAssetId: ragAsset.id,
      relationshipType: 'RETRIEVES_FROM',
      createdAt: new Date().toISOString(),
    });

    this.assetRelationships.set('rel_02', {
      id: 'rel_02',
      projectId: nexusProject.id,
      sourceAssetId: agentAsset.id,
      targetAssetId: toolAsset.id,
      relationshipType: 'INVOKES',
      createdAt: new Date().toISOString(),
    });

    this.assetRelationships.set('rel_03', {
      id: 'rel_03',
      projectId: nexusProject.id,
      sourceAssetId: agentAsset.id,
      targetAssetId: mcpAsset.id,
      relationshipType: 'CALLS',
      createdAt: new Date().toISOString(),
    });
  }

  // --- Users ---
  public findUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  public findUserByEmail(email: string): User | undefined {
    const normalized = email.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalized) {
        return user;
      }
    }
    return undefined;
  }

  public createUser(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  // --- Sessions ---
  public createSession(session: Session): Session {
    this.sessions.set(session.token, session);
    return session;
  }

  public findSessionByToken(token: string): Session | undefined {
    const session = this.sessions.get(token);
    if (!session) return undefined;
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(token);
      return undefined;
    }
    return session;
  }

  public deleteSession(token: string): boolean {
    return this.sessions.delete(token);
  }

  // --- Organizations & Memberships ---
  public findOrganizationById(id: string): Organization | undefined {
    return this.organizations.get(id);
  }

  public findOrganizationBySlug(slug: string): Organization | undefined {
    for (const org of this.organizations.values()) {
      if (org.slug === slug) return org;
    }
    return undefined;
  }

  public createOrganization(org: Organization, creatorUserId: string): { org: Organization; membership: Membership } {
    this.organizations.set(org.id, org);
    const membership: Membership = {
      id: `mem_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`,
      organizationId: org.id,
      userId: creatorUserId,
      role: 'OWNER',
      createdAt: new Date().toISOString(),
    };
    this.memberships.set(membership.id, membership);
    return { org, membership };
  }

  public updateOrganization(id: string, updates: Partial<Organization>): Organization | undefined {
    const existing = this.organizations.get(id);
    if (!existing) return undefined;
    const updated: Organization = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.organizations.set(id, updated);
    return updated;
  }

  public listOrganizationsForUser(userId: string): Array<{ org: Organization; role: UserRole }> {
    const results: Array<{ org: Organization; role: UserRole }> = [];
    for (const mem of this.memberships.values()) {
      if (mem.userId === userId) {
        const org = this.organizations.get(mem.organizationId);
        if (org && org.status !== 'archived') {
          results.push({ org, role: mem.role });
        }
      }
    }
    return results;
  }

  public findMembership(organizationId: string, userId: string): Membership | undefined {
    for (const mem of this.memberships.values()) {
      if (mem.organizationId === organizationId && mem.userId === userId) {
        return mem;
      }
    }
    return undefined;
  }

  public listMembersForOrg(organizationId: string): Array<{ membership: Membership; user: UserProfile }> {
    const list: Array<{ membership: Membership; user: UserProfile }> = [];
    for (const mem of this.memberships.values()) {
      if (mem.organizationId === organizationId) {
        const user = this.users.get(mem.userId);
        if (user) {
          const { passwordHash, ...profile } = user;
          list.push({ membership: mem, user: profile });
        }
      }
    }
    return list;
  }

  public addMember(organizationId: string, userId: string, role: UserRole): Membership {
    const existing = this.findMembership(organizationId, userId);
    if (existing) {
      existing.role = role;
      return existing;
    }
    const mem: Membership = {
      id: `mem_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`,
      organizationId,
      userId,
      role,
      createdAt: new Date().toISOString(),
    };
    this.memberships.set(mem.id, mem);
    return mem;
  }

  public removeMember(organizationId: string, userId: string): boolean {
    const mem = this.findMembership(organizationId, userId);
    if (!mem) return false;
    return this.memberships.delete(mem.id);
  }

  // --- Projects ---
  public listProjectsForOrg(organizationId: string): Project[] {
    const results: Project[] = [];
    for (const project of this.projects.values()) {
      if (project.organizationId === organizationId && project.status !== 'archived') {
        results.push(project);
      }
    }
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public findProjectById(id: string): Project | undefined {
    return this.projects.get(id);
  }

  public createProject(project: Project): Project {
    this.projects.set(project.id, project);
    return project;
  }

  public updateProject(id: string, updates: Partial<Project>): Project | undefined {
    const existing = this.projects.get(id);
    if (!existing) return undefined;
    const updated: Project = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.projects.set(id, updated);
    return updated;
  }

  public archiveProject(id: string): boolean {
    const existing = this.projects.get(id);
    if (!existing) return false;
    existing.status = 'archived';
    existing.updatedAt = new Date().toISOString();
    return true;
  }

  // --- Assets ---
  public listAssetsForProject(projectId: string): Asset[] {
    const results: Asset[] = [];
    for (const asset of this.assets.values()) {
      if (asset.projectId === projectId && asset.status !== 'archived') {
        results.push(asset);
      }
    }
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public listAssetsForOrg(organizationId: string): Asset[] {
    const results: Asset[] = [];
    for (const asset of this.assets.values()) {
      if (asset.organizationId === organizationId && asset.status !== 'archived') {
        results.push(asset);
      }
    }
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public findAssetById(id: string): Asset | undefined {
    return this.assets.get(id);
  }

  public createAsset(asset: Asset): Asset {
    this.assets.set(asset.id, asset);
    return asset;
  }

  public updateAsset(id: string, updates: Partial<Asset>): Asset | undefined {
    const existing = this.assets.get(id);
    if (!existing) return undefined;
    const updated: Asset = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.assets.set(id, updated);
    return updated;
  }

  public archiveAsset(id: string): boolean {
    const existing = this.assets.get(id);
    if (!existing) return false;
    existing.status = 'archived';
    existing.updatedAt = new Date().toISOString();
    return true;
  }

  // --- Test Runs & Findings ---
  public testRuns: Map<string, TestRun> = new Map();
  public findings: Map<string, FindingRecord> = new Map();

  public listTestRunsForProject(projectId: string): TestRun[] {
    const results: TestRun[] = [];
    for (const tr of this.testRuns.values()) {
      if (tr.projectId === projectId) {
        results.push(tr);
      }
    }
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public findTestRunById(id: string): TestRun | undefined {
    return this.testRuns.get(id);
  }

  public createTestRun(testRun: TestRun): TestRun {
    this.testRuns.set(testRun.id, testRun);
    return testRun;
  }

  public updateTestRun(id: string, updates: Partial<TestRun>): TestRun | undefined {
    const existing = this.testRuns.get(id);
    if (!existing) return undefined;
    const updated: TestRun = {
      ...existing,
      ...updates,
    };
    this.testRuns.set(id, updated);
    return updated;
  }

  public createFinding(finding: FindingRecord): FindingRecord {
    this.findings.set(finding.id, finding);
    return finding;
  }

  public listFindingsForProject(projectId: string): FindingRecord[] {
    const results: FindingRecord[] = [];
    for (const f of this.findings.values()) {
      if (f.projectId === projectId) {
        results.push(f);
      }
    }
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // --- Relationships ---
  public listRelationshipsForProject(projectId: string): AssetRelationship[] {
    const list: AssetRelationship[] = [];
    for (const rel of this.assetRelationships.values()) {
      if (rel.projectId === projectId) {
        list.push(rel);
      }
    }
    return list;
  }

  public createRelationship(rel: AssetRelationship): AssetRelationship {
    this.assetRelationships.set(rel.id, rel);
    return rel;
  }
}

// Global Singleton Instance
declare global {
  var __defyra_db: DatabaseStore | undefined;
}

export const db: DatabaseStore = globalThis.__defyra_db || new DatabaseStore();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__defyra_db = db;
}
