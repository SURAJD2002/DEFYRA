import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/store';
import { enforceAssessmentScope } from '@/lib/security/scope-enforcer';
import { Assessment, UserProfile, Organization, Project, Asset } from '@/types';

describe('Customer Assessment Onboarding Journey & Scope Enforcement', () => {
  const orgId = 'org_onboarding_test_01';
  const foreignOrgId = 'org_foreign_attacker_99';
  const projectId = 'prj_onboarding_test_01';
  const foreignProjectId = 'prj_foreign_attacker_99';
  const userId = 'usr_onboarding_lead_01';
  const foreignUserId = 'usr_foreign_user_99';

  let assessment: Assessment;
  let asset1: Asset;
  let asset2: Asset;
  let foreignAsset: Asset;

  beforeEach(() => {
    // 1. Setup Organizations
    db.createOrganization({
      id: orgId,
      name: 'Onboarding Customer Corp',
      slug: 'onboarding-customer-corp',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, userId);

    db.createOrganization({
      id: foreignOrgId,
      name: 'Foreign Adversary Corp',
      slug: 'foreign-adversary-corp',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, foreignUserId);

    // 2. Setup Users & Memberships
    db.createUser({
      id: userId,
      email: 'lead@customer.com',
      fullName: 'Customer Tech Lead',
      status: 'active',
      passwordHash: 'hash',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    db.addMember(orgId, userId, 'SECURITY_LEAD');

    db.createUser({
      id: foreignUserId,
      email: 'attacker@foreign.com',
      fullName: 'Foreign User',
      status: 'active',
      passwordHash: 'hash',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    db.addMember(foreignOrgId, foreignUserId, 'SECURITY_LEAD');

    // 3. Setup Projects
    db.createProject({
      id: projectId,
      organizationId: orgId,
      name: 'AI Banking Assistant',
      description: 'Customer-facing LLM banking chatbot',
      environment: 'staging',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    db.createProject({
      id: foreignProjectId,
      organizationId: foreignOrgId,
      name: 'Foreign Project',
      description: 'Foreign project',
      environment: 'staging',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 4. Setup Assets
    asset1 = db.createAsset({
      id: 'ast_banking_agent_01',
      organizationId: orgId,
      projectId: projectId,
      name: 'OpenAI Staging Endpoint',
      description: 'Staging model endpoint',
      type: 'MODEL',
      environment: 'staging',
      status: 'active',
      metadata: { endpointUrl: 'https://staging.customer.bank/v1/chat/completions' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    asset2 = db.createAsset({
      id: 'ast_banking_agent_02',
      organizationId: orgId,
      projectId: projectId,
      name: 'Customer Support LLM',
      description: 'Customer support model',
      type: 'MODEL',
      environment: 'staging',
      status: 'active',
      metadata: { endpointUrl: 'https://staging.customer.bank/v1/support' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    foreignAsset = db.createAsset({
      id: 'ast_foreign_agent_99',
      organizationId: foreignOrgId,
      projectId: foreignProjectId,
      name: 'Foreign Agent Endpoint',
      description: 'Foreign agent endpoint',
      type: 'MODEL',
      environment: 'staging',
      status: 'active',
      metadata: { endpointUrl: 'https://foreign.domain/v1' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 5. Setup Assessment in DRAFT
    assessment = {
      id: 'asm_onboarding_01',
      organizationId: orgId,
      projectId: projectId,
      name: 'DEFYRA Founding AI Security Assessment — Customer Onboarding',
      description: 'Scoped security assessment evaluating direct prompt injection and data exposure',
      assessmentType: 'AI_SECURITY_VALIDATION',
      environment: 'staging',
      status: 'DRAFT',
      paymentStatus: 'PAYMENT_CONFIRMED',
      paymentReference: 'INV-ONBOARDING-01-PAID',
      scope: {
        authorizedAssetIds: [asset1.id],
        authorizedTestIds: ['DEF-INJ-001'],
        authorizedEnvironments: ['staging'],
        testingWindowStart: '2026-01-01T00:00:00Z',
        testingWindowEnd: '2026-12-31T23:59:59Z',
        emergencyContact: 'security-lead@customer.com',
        productionApproved: false,
      },
      testPlan: [
        { testId: 'DEF-INJ-001', enabled: true, priority: 'HIGH', order: 1, status: 'PENDING' },
      ],
      createdBy: userId,
      createdAt: new Date().toISOString(),
    };
    db.createAssessment(assessment);
  });

  // ---------------------------------------------------------------------------
  // Negative Tests: Assessment Lifecycle & Authorization Gates
  // ---------------------------------------------------------------------------
  it('1. Blocks execution when Assessment is in DRAFT status', () => {
    const res = enforceAssessmentScope(assessment, {
      assetId: asset1.id,
      testId: 'DEF-INJ-001',
      environment: 'staging',
    });
    expect(res.allowed).toBe(false);
    expect(res.code).toBe('ASSESSMENT_STATUS_INVALID');
  });

  it('2. Blocks execution when Assessment is in PENDING_APPROVAL status', () => {
    const pendingAsm = { ...assessment, status: 'PENDING_APPROVAL' as const };
    const res = enforceAssessmentScope(pendingAsm, {
      assetId: asset1.id,
      testId: 'DEF-INJ-001',
      environment: 'staging',
    });
    expect(res.allowed).toBe(false);
    expect(res.code).toBe('ASSESSMENT_STATUS_INVALID');
  });

  it('3. Blocks execution when attempting to probe an asset not authorized in assessment scope', () => {
    const authorizedAsm = { ...assessment, status: 'AUTHORIZED' as const };
    const res = enforceAssessmentScope(authorizedAsm, {
      assetId: asset2.id, // asset2 is in same project but not in assessment.scope.authorizedAssetIds
      testId: 'DEF-INJ-001',
      environment: 'staging',
    });
    expect(res.allowed).toBe(false);
    expect(res.code).toBe('ASSET_OUT_OF_SCOPE');
  });

  it('4. Blocks execution when attempting to probe a foreign tenant asset', () => {
    const authorizedAsm = { ...assessment, status: 'AUTHORIZED' as const };
    const res = enforceAssessmentScope(authorizedAsm, {
      assetId: foreignAsset.id,
      testId: 'DEF-INJ-001',
      environment: 'staging',
    });
    expect(res.allowed).toBe(false);
    expect(res.code).toBe('ASSET_OUT_OF_SCOPE');
  });

  it('5. Blocks execution when test ID is not authorized in scope', () => {
    const authorizedAsm = { ...assessment, status: 'AUTHORIZED' as const };
    const res = enforceAssessmentScope(authorizedAsm, {
      assetId: asset1.id,
      testId: 'DEF-RAG-001', // not authorized in scope
      environment: 'staging',
    });
    expect(res.allowed).toBe(false);
    expect(res.code).toBe('TEST_OUT_OF_SCOPE');
  });

  it('6. Blocks execution when environment does not match authorized scope', () => {
    const authorizedAsm = { ...assessment, status: 'AUTHORIZED' as const };
    const res = enforceAssessmentScope(authorizedAsm, {
      assetId: asset1.id,
      testId: 'DEF-INJ-001',
      environment: 'production', // unauthorized environment
    });
    expect(res.allowed).toBe(false);
    expect(res.code).toBe('ENVIRONMENT_MISMATCH');
  });

  it('7. Blocks execution when current timestamp is outside testing window', () => {
    const authorizedAsm = {
      ...assessment,
      status: 'AUTHORIZED' as const,
      scope: {
        ...assessment.scope,
        testingWindowStart: '2026-06-01T00:00:00Z',
        testingWindowEnd: '2026-06-05T23:59:59Z',
      },
    };
    const res = enforceAssessmentScope(authorizedAsm, {
      assetId: asset1.id,
      testId: 'DEF-INJ-001',
      environment: 'staging',
      timestamp: '2026-06-10T00:00:00Z', // expired
    });
    expect(res.allowed).toBe(false);
    expect(res.code).toBe('TESTING_WINDOW_EXPIRED');
  });

  // ---------------------------------------------------------------------------
  // Positive Tests: Full Authorization & Execution Readiness
  // ---------------------------------------------------------------------------
  it('8. Permits execution when Assessment is formally AUTHORIZED with valid scope', () => {
    const authorizedAsm = { ...assessment, status: 'AUTHORIZED' as const };
    const res = enforceAssessmentScope(authorizedAsm, {
      assetId: asset1.id,
      testId: 'DEF-INJ-001',
      environment: 'staging',
    });
    expect(res.allowed).toBe(true);
    expect(res.code).toBeUndefined();
  });

  it('9. Permits execution when Assessment status transitions to READY', () => {
    const readyAsm = { ...assessment, status: 'READY' as const };
    const res = enforceAssessmentScope(readyAsm, {
      assetId: asset1.id,
      testId: 'DEF-INJ-001',
      environment: 'staging',
    });
    expect(res.allowed).toBe(true);
  });
});
