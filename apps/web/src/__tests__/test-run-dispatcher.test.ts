import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/store';
import { securityEngineDispatcher } from '@/lib/security-engine/dispatcher';
import { Asset, Project, TestRun } from '@/types';

describe('Milestones L & M: Next.js Test-Run Dispatcher & Engine Integration', () => {
  const testOrgId = 'org_test_dispatcher_01';
  const testUserId = 'usr_test_dispatcher_01';

  let project: Project;
  let asset: Asset;

  beforeEach(() => {
    // Clean and initialize project & asset
    project = {
      id: 'prj_dispatch_test_01',
      organizationId: testOrgId,
      name: 'Agentic Test Environment',
      description: 'Staging environment for test run dispatcher',
      environment: 'staging',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.createProject(project);

    asset = {
      id: 'ast_dispatch_agent_01',
      organizationId: testOrgId,
      projectId: project.id,
      type: 'AGENT',
      name: 'Customer Support LLM Agent',
      description: 'Support agent with tool access',
      environment: 'staging',
      metadata: { endpointUrl: 'https://agent.defyra.sandbox/v1' },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.createAsset(asset);
  });

  it('1. Correctly initializes a QUEUED TestRun and records in store', () => {
    const testRun: TestRun = {
      id: 'tr_unit_01',
      organizationId: testOrgId,
      projectId: project.id,
      assetId: asset.id,
      testId: 'DEF-INJ-001',
      environment: 'staging',
      status: 'QUEUED',
      requestedBy: testUserId,
      requestId: 'req_unit_01',
      createdAt: new Date().toISOString(),
      observations: [],
      stageResults: [],
      evidence: [],
    };

    db.createTestRun(testRun);
    const retrieved = db.findTestRunById('tr_unit_01');
    expect(retrieved).toBeDefined();
    expect(retrieved?.status).toBe('QUEUED');
    expect(retrieved?.testId).toBe('DEF-INJ-001');
  });

  it('2. Gracefully handles Python engine unreachable by setting ERROR status', async () => {
    const testRun: TestRun = {
      id: 'tr_unit_unreachable_02',
      organizationId: testOrgId,
      projectId: project.id,
      assetId: asset.id,
      testId: 'DEF-INJ-001',
      environment: 'staging',
      status: 'QUEUED',
      requestedBy: testUserId,
      requestId: 'req_unit_02',
      createdAt: new Date().toISOString(),
      observations: [],
      stageResults: [],
      evidence: [],
    };
    db.createTestRun(testRun);

    // Point dispatcher to dead port to verify fault-tolerance
    const offlineDispatcher = Object.create(securityEngineDispatcher);
    (offlineDispatcher as any).engineUrl = 'http://127.0.0.1:59999';
    (offlineDispatcher as any).bearerToken = 'test';

    const result = await offlineDispatcher.dispatchTestRun({
      testRun,
      project,
      asset,
      authorizedTargetUrl: 'https://agent.defyra.sandbox/v1',
      userId: testUserId,
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe('ERROR');

    const updated = db.findTestRunById('tr_unit_unreachable_02');
    expect(updated?.status).toBe('ERROR');
    expect(updated?.errorCode).toBe('ENGINE_UNREACHABLE');
  });
});
