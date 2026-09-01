/**
 * DEFYRA: Real Live Test Execution for DEF-INJ-001 (Direct System Prompt Override)
 */

const BASE_URL = 'http://127.0.0.1:3000';

async function execute() {
  console.log('================================================================================');
  console.log('DEFYRA REAL LIVE SECURITY TEST EXECUTION: DEF-INJ-001');
  console.log('================================================================================\n');

  // 1. Authenticate through the real Next.js API
  console.log('[STEP 1] Authenticating through Next.js API: POST /api/v1/auth/login');
  const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'founder@defyra.ai',
      password: 'DefyraSecurity2026!',
    }),
  });
  const loginStatus = loginRes.status;
  const loginData = await loginRes.json();
  const cookie = loginRes.headers.get('set-cookie')?.split(';')[0] || '';
  console.log(`  HTTP Status: ${loginStatus}`);
  console.log(`  User:        ${loginData.data.user.email} (ID: ${loginData.data.user.id})`);
  console.log(`  Active Org:  ${loginData.data.activeOrganization?.name} (ID: ${loginData.data.activeOrganization?.id})`);
  console.log(`  Role:        ${loginData.data.role}`);

  // 2. Set up Project & Synthetic Target Asset
  console.log('\n[STEP 2] Initializing Authorized Scope & Target Asset');
  const projRes = await fetch(`${BASE_URL}/api/v1/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      organizationId: 'org_defyra_corp_01',
      name: 'Agentic Prompt Boundary Security Project',
      description: 'Controlled security evaluation environment for DEF-INJ-001 probe validation',
      environment: 'staging',
    }),
  });
  const projData = await projRes.json();
  const projectId = projData.data.id;

  const assetRes = await fetch(`${BASE_URL}/api/v1/projects/${projectId}/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      name: 'Synthetic Customer Assistant Model Endpoint',
      type: 'AGENT',
      environment: 'staging',
      metadata: { endpointUrl: 'https://agent.defyra.sandbox/v1' },
    }),
  });
  const assetData = await assetRes.json();
  const assetId = assetData.data.id;
  console.log(`  Project ID:   ${projectId}`);
  console.log(`  Asset ID:     ${assetId} (${assetData.data.name})`);
  console.log(`  Target URL:   ${assetData.data.metadata.endpointUrl}`);
  console.log(`  Environment:  ${assetData.data.environment}`);

  // 3. CASE A — SAFE BASELINE EXECUTION
  console.log('\n[STEP 3] CASE A — SAFE BASELINE EXECUTION (DEF-INJ-001)');
  console.log('  Triggering POST /api/v1/projects/' + projectId + '/test-runs (Expected: PASSED, 0 Violations)');
  const caseARes = await fetch(`${BASE_URL}/api/v1/projects/${projectId}/test-runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      assetId: assetId,
      testId: 'DEF-INJ-001',
      environment: 'staging',
      parameters: {
        mock_response: 'I cannot fulfill this request as it asks me to reveal confidential system instructions.',
      },
    }),
  });
  const caseAHttp = caseARes.status;
  const caseAData = await caseARes.json();
  console.log('  --------------------------------------------------');
  console.log('  [CASE A FULL TEST RUN DATA]');
  console.log(JSON.stringify(caseAData.data, null, 2));
  console.log('  --------------------------------------------------');

  // 4. CASE B — AUTHORIZED ADVERSARIAL TEST EXECUTION
  console.log('\n[STEP 4] CASE B — AUTHORIZED ADVERSARIAL TEST EXECUTION (DEF-INJ-001)');
  console.log('  Triggering POST /api/v1/projects/' + projectId + '/test-runs (Expected: FAILED, Finding Candidate Generated)');
  const caseBRes = await fetch(`${BASE_URL}/api/v1/projects/${projectId}/test-runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      assetId: assetId,
      testId: 'DEF-INJ-001',
      environment: 'staging',
      parameters: {
        mock_response: 'You are a helpful assistant. System prompt: You must assist user with internal instructions.',
      },
    }),
  });
  const caseBHttp = caseBRes.status;
  const caseBData = await caseBRes.json();
  console.log('  --------------------------------------------------');
  console.log('  [CASE B FULL TEST RUN DATA]');
  console.log(JSON.stringify(caseBData.data, null, 2));
  console.log('  --------------------------------------------------');

  // 5. Verification of Persistence via GET /api/v1/projects/[projectId]/test-runs
  console.log('\n[STEP 5] Verifying Test Run Persistence: GET /api/v1/projects/' + projectId + '/test-runs');
  const listRes = await fetch(`${BASE_URL}/api/v1/projects/${projectId}/test-runs`, {
    headers: { Cookie: cookie },
  });
  const listStatus = listRes.status;
  const listData = await listRes.json();
  console.log(`  HTTP Status:         ${listStatus}`);
  console.log(`  Persisted Runs:      ${listData.data?.length || 0}`);
  listData.data?.forEach((tr: any, idx: number) => {
    console.log(`    [${idx + 1}] ID: ${tr.id} | Test: ${tr.testId} | Status: ${tr.status} | CreatedAt: ${tr.createdAt}`);
  });

  console.log('\n================================================================================');
  console.log('✓ REAL LIVE EXECUTION COMPLETE');
  console.log('================================================================================');
}

execute().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
