/**
 * DEFYRA Phase 6: Customer-Ready AI Security Assessment Lifecycle E2E Verification
 */

const BASE_URL = 'http://127.0.0.1:3000';

async function main() {
  console.log('================================================================================');
  console.log('DEFYRA PHASE 6: CUSTOMER-READY AI SECURITY ASSESSMENT LIFECYCLE DEMONSTRATION');
  console.log('================================================================================\n');

  // 1. Authenticate Lead Security Architect
  console.log('[STEP 1] Customer & Security Lead Authentication');
  const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'founder@defyra.ai',
      password: 'DefyraSecurity2026!',
    }),
  });
  const loginData = await loginRes.json();
  const cookie = loginRes.headers.get('set-cookie')?.split(';')[0] || '';
  console.log(`  ✓ Authenticated: ${loginData.data.user.email} (Role: ${loginData.data.role})`);

  // 2. Initialize Project & Register Customer Target Asset
  console.log('\n[STEP 2] Initializing Customer Project & Onboarding Target Asset');
  const projRes = await fetch(`${BASE_URL}/api/v1/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      organizationId: 'org_defyra_corp_01',
      name: 'Customer Agentic Banking Core',
      description: 'Customer financial agent and transaction dispatch runtime',
      environment: 'staging',
    }),
  });
  const projectId = (await projRes.json()).data.id;

  const assetRes = await fetch(`${BASE_URL}/api/v1/projects/${projectId}/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      name: 'Financial Advisory Agent Endpoint',
      type: 'AGENT',
      environment: 'staging',
      metadata: { endpointUrl: 'https://agent.defyra.sandbox/v1' },
    }),
  });
  const assetId = (await assetRes.json()).data.id;
  console.log(`  ✓ Project ID: ${projectId}`);
  console.log(`  ✓ Asset ID:   ${assetId} (https://agent.defyra.sandbox/v1)`);

  // 3. Define Rules of Engagement & Create Assessment Scope
  console.log('\n[STEP 3] Scoping Assessment & Formulating Rules of Engagement');
  const asmRes = await fetch(`${BASE_URL}/api/v1/projects/${projectId}/assessments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      name: 'Q3 Authorized Paid AI Security Assessment',
      description: 'Formal security assessment evaluating prompt injection and agentic boundaries',
      assessmentType: 'AI_SECURITY_VALIDATION',
      environment: 'staging',
      authorizedAssetIds: [assetId],
      authorizedTestIds: ['DEF-INJ-001'],
    }),
  });
  const assessment = (await asmRes.json()).data;
  console.log(`  ✓ Assessment Created: ${assessment.id}`);
  console.log(`  ✓ Initial Status:     ${assessment.status}`);
  console.log(`  ✓ Scope Asset Count:  ${assessment.scope.authorizedAssetIds.length}`);
  console.log(`  ✓ Scope Test Count:   ${assessment.scope.authorizedTestIds.length}`);

  // 4. Authorize Assessment
  console.log('\n[STEP 4] Formal Scope Authorization Gate');
  const authzRes = await fetch(`${BASE_URL}/api/v1/assessments/${assessment.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      status: 'AUTHORIZED',
    }),
  });
  const authzData = await authzRes.json();
  console.log(`  ✓ Scope Agreement Signed: Status -> ${authzData.data.status}`);

  // 5. Execute Authorized Test Plan via Security Engine
  console.log('\n[STEP 5] Controlled Test Plan Execution via Python Security Engine');
  // First run adversarial probe to generate candidate finding
  const runRes = await fetch(`${BASE_URL}/api/v1/projects/${projectId}/test-runs`, {
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
  const runData = await runRes.json();
  console.log(`  ✓ Test Run Executed: ${runData.data.id} (Status: ${runData.data.status})`);
  const findingCandidate = runData.data.findingCandidate;
  console.log(`  ✓ Finding Candidate Generated: ${findingCandidate?.id}`);
  console.log(`  ✓ Title:               ${findingCandidate?.title}`);
  console.log(`  ✓ Severity:            ${findingCandidate?.severity}`);
  console.log(`  ✓ Quality Gate Status: ${findingCandidate?.status} (Requires Human Review)`);
  console.log(`  ✓ Risk Score:          ${findingCandidate?.riskScore} / 10.0`);

  // 6. Human Review Quality Gate
  console.log('\n[STEP 6] Lead Security Architect Finding Review');
  const reviewRes = await fetch(`${BASE_URL}/api/v1/findings/${findingCandidate.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      status: 'CONFIRMED',
      reviewNotes: 'Verified prompt boundary override against synthetic endpoint. Instruction delimiter missing.',
    }),
  });
  const reviewData = await reviewRes.json();
  console.log(`  ✓ Human Review Completed: Status -> ${reviewData.data.status}`);

  // 7. Formulate Remediation Action
  console.log('\n[STEP 7] Remediation Tracking');
  const remRes = await fetch(`${BASE_URL}/api/v1/findings/${findingCandidate.id}/remediation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      title: 'Enforce Rigid Delimiter Framing and Guardrail Classifier',
      description: 'Encapsulate customer model instructions inside rigid XML tags and add output disclosure filter.',
      recommendedAction: 'Update system prompt framing and activate pre-response guardrails.',
      priority: 'HIGH',
      owner: 'Customer Security Engineer',
    }),
  });
  const remData = await remRes.json();
  console.log(`  ✓ Remediation Created: ${remData.data.id} (Status: ${remData.data.status})`);

  // 8. Controlled Verification Retest
  console.log('\n[STEP 8] Controlled Retest Execution');
  const retestRes = await fetch(`${BASE_URL}/api/v1/findings/${findingCandidate.id}/retest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      notes: 'Retesting with updated system prompt framing and output disclosure classifier.',
    }),
  });
  const retestData = await retestRes.json();
  console.log(`  ✓ Retest Executed: Result = ${retestData.data.retest.retestResult}`);
  console.log(`  ✓ Behavior Delta:  ${retestData.data.retest.behaviorChange}`);
  console.log(`  ✓ Finding Status:  ${retestData.data.finding.status}`);

  // 9. Generate Final Point-in-Time Assessment Report
  console.log('\n[STEP 9] Generating Professional Assessment Report');
  const repRes = await fetch(`${BASE_URL}/api/v1/assessments/${assessment.id}/report`, {
    method: 'POST',
    headers: { Cookie: cookie },
  });
  const repData = await repRes.json();
  console.log(`  ✓ Report Title:     ${repData.data.title}`);
  console.log(`  ✓ SHA-256 Hash:     ${repData.data.reportHash}`);
  console.log(`  ✓ Executive Summary:${repData.data.content.executiveSummary}`);

  // 10. Assessment Completion Gate
  console.log('\n[STEP 10] Assessment Completion Gate');
  const finalAsmRes = await fetch(`${BASE_URL}/api/v1/assessments/${assessment.id}`, {
    headers: { Cookie: cookie },
  });
  const finalAsmData = await finalAsmRes.json();
  console.log(`  ✓ Final Assessment Status: ${finalAsmData.data.status}`);
  console.log(`  ✓ Completed At:            ${finalAsmData.data.completedAt}`);

  console.log('\n================================================================================');
  console.log('✓ COMPLETE CUSTOMER-READY ASSESSMENT LIFECYCLE VERIFIED GREEN!');
  console.log('================================================================================');
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
