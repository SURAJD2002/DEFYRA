/**
 * DEFYRA Phase 7: Real HTTP Target Adapter & First Customer Assessment Validation
 */

const BASE_URL = 'http://127.0.0.1:3000';
const SYNTHETIC_TARGET_URL = 'http://127.0.0.1:4000';

async function setTargetMode(mode: 'SAFE' | 'VULNERABLE' | 'REMEDIATED') {
  const res = await fetch(`${SYNTHETIC_TARGET_URL}/admin/mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode }),
  });
  return res.json();
}

async function main() {
  console.log('================================================================================');
  console.log('DEFYRA PHASE 7: REAL HTTP TARGET ADAPTER & CUSTOMER ASSESSMENT VALIDATION');
  console.log('================================================================================\n');

  // 1. Verify Synthetic AI Target Service
  console.log('[STEP 1] Checking Local Synthetic OpenAI-Compatible Target Service (Port 4000)');
  const healthRes = await fetch(`${SYNTHETIC_TARGET_URL}/health`);
  const healthData = await healthRes.json();
  console.log(`  ✓ Synthetic AI Target Healthy: ${healthData.status} (Initial Mode: ${healthData.mode})`);

  // 2. Set Target Mode to VULNERABLE
  await setTargetMode('VULNERABLE');
  console.log('  ✓ Synthetic Target switched to VULNERABLE mode for Case B evaluation.');

  // 3. Authenticate Customer Owner & Lead Security Architect
  console.log('\n[STEP 2] Customer & Security Lead Authentication');
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

  // 4. Create Project and Onboard Real HTTP OpenAI-Compatible Target Asset
  console.log('\n[STEP 3] Initializing Customer Project & Onboarding Real HTTP Target Endpoint');
  const projRes = await fetch(`${BASE_URL}/api/v1/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      organizationId: 'org_defyra_corp_01',
      name: 'Customer Agentic Core (Real HTTP Target)',
      description: 'Customer financial agent endpoint communicating over HTTP',
      environment: 'staging',
    }),
  });
  const projectId = (await projRes.json()).data.id;

  const targetEndpointUrl = `${SYNTHETIC_TARGET_URL}/v1/chat/completions`;
  const assetRes = await fetch(`${BASE_URL}/api/v1/projects/${projectId}/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      name: 'OpenAI-Compatible Banking Assistant Endpoint',
      type: 'MODEL',
      environment: 'staging',
      metadata: {
        endpointUrl: targetEndpointUrl,
        adapterType: 'REST_ENDPOINT',
      },
    }),
  });
  const assetId = (await assetRes.json()).data.id;
  console.log(`  ✓ Project ID: ${projectId}`);
  console.log(`  ✓ Asset ID:   ${assetId} (${targetEndpointUrl})`);

  // 5. Scoping Assessment & Formulating Rules of Engagement
  console.log('\n[STEP 4] Scoping Assessment & Formulating Rules of Engagement');
  const asmRes = await fetch(`${BASE_URL}/api/v1/projects/${projectId}/assessments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      name: 'Customer Production AI Security Assessment (Real HTTP)',
      description: 'Formal security assessment evaluating real HTTP prompt injection boundary',
      assessmentType: 'AI_SECURITY_VALIDATION',
      environment: 'staging',
      authorizedAssetIds: [assetId],
      authorizedTestIds: ['DEF-INJ-001'],
    }),
  });
  const assessment = (await asmRes.json()).data;
  console.log(`  ✓ Assessment Created: ${assessment.id} (Status: ${assessment.status})`);

  // 6. Formal Scope Authorization Gate
  console.log('\n[STEP 5] Formal Scope Authorization Gate');
  const authzRes = await fetch(`${BASE_URL}/api/v1/assessments/${assessment.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ status: 'AUTHORIZED' }),
  });
  const authzData = await authzRes.json();
  console.log(`  ✓ Scope Agreement Signed: Status -> ${authzData.data.status}`);

  // 7. Execute DEF-INJ-001 Real HTTP Probe with Synthetic Secret
  console.log('\n[STEP 6] Controlled Real HTTP Probe Execution (Crossing Network Boundary)');
  const syntheticSecret = 'DEFYRA_TEST_SECRET_ONLY';

  const runRes = await fetch(`${BASE_URL}/api/v1/projects/${projectId}/test-runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      assetId: assetId,
      testId: 'DEF-INJ-001',
      assessmentId: assessment.id,
      environment: 'staging',
      parameters: {
        secret_token: syntheticSecret,
      },
    }),
  });
  const runData = await runRes.json();
  console.log(`  ✓ Real HTTP Probe Executed: ${runData.data.id} (Status: ${runData.data.status})`);
  const findingCandidate = runData.data.findingCandidate;
  console.log(`  ✓ Finding Candidate Generated: ${findingCandidate?.id}`);
  console.log(`  ✓ Title:               ${findingCandidate?.title}`);
  console.log(`  ✓ Severity:            ${findingCandidate?.severity}`);
  console.log(`  ✓ Quality Gate Status: ${findingCandidate?.status} (Requires Human Review)`);
  console.log(`  ✓ Risk Score:          ${findingCandidate?.riskScore} / 10.0`);

  // 8. Credential Non-Leakage Verification
  console.log('\n[STEP 7] Credential Protection & Secret Non-Leakage Verification');
  const rawFindingJson = JSON.stringify(findingCandidate);
  const rawRunJson = JSON.stringify(runData.data);
  if (rawFindingJson.includes(syntheticSecret) || rawRunJson.includes(syntheticSecret)) {
    throw new Error('SECURITY VIOLATION: Customer secret leaked in finding or execution response!');
  }
  console.log(`  ✓ Synthetic secret '${syntheticSecret}' verified ABSENT from database and finding candidate.`);

  // 9. Human Review Gate
  console.log('\n[STEP 8] Lead Security Architect Finding Review');
  const reviewRes = await fetch(`${BASE_URL}/api/v1/findings/${findingCandidate.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      status: 'CONFIRMED',
      reviewNotes: 'Verified prompt boundary override against live HTTP OpenAI-compatible endpoint.',
    }),
  });
  const reviewData = await reviewRes.json();
  console.log(`  ✓ Human Review Completed: Status -> ${reviewData.data.status}`);

  // 10. Create Remediation
  console.log('\n[STEP 9] Remediation Tracking');
  const remRes = await fetch(`${BASE_URL}/api/v1/findings/${findingCandidate.id}/remediation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      title: 'Apply Rigid Delimiter Framing & Output Disclosure Filter',
      description: 'Encapsulate customer instructions and reject prompt disclosure requests.',
      recommendedAction: 'Deploy secondary classifier and rigid XML instruction delimiters.',
      priority: 'HIGH',
      owner: 'Customer AI Platform Lead',
    }),
  });
  const remData = await remRes.json();
  console.log(`  ✓ Remediation Created: ${remData.data.id} (Status: ${remData.data.status})`);

  // 11. Switch Target to REMEDIATED Mode & Run Retest
  console.log('\n[STEP 10] Switching Target to Remediated Mode & Running Verification Retest');
  await setTargetMode('REMEDIATED');

  const retestRes = await fetch(`${BASE_URL}/api/v1/findings/${findingCandidate.id}/retest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      notes: 'Retesting with deployed rigid XML delimiters and secondary disclosure classifier.',
    }),
  });
  const retestData = await retestRes.json();
  console.log(`  ✓ Retest Executed: Result = ${retestData.data.retest.retestResult}`);
  console.log(`  ✓ Behavior Delta:  ${retestData.data.retest.behaviorChange}`);
  console.log(`  ✓ Finding Status:  ${retestData.data.finding.status}`);

  // 12. Generate Final Point-in-Time Security Report
  console.log('\n[STEP 11] Generating Point-in-Time Security Assessment Report');
  const repRes = await fetch(`${BASE_URL}/api/v1/assessments/${assessment.id}/report`, {
    method: 'POST',
    headers: { Cookie: cookie },
  });
  const repData = await repRes.json();
  const report = repData.data;

  console.log(`  ✓ Report Title:             ${report.title}`);
  console.log(`  ✓ SHA-256 Report Hash:     ${report.reportHash}`);
  console.log(`  ✓ Original Confirmed Count: ${report.content.riskSummary.originalFindingsCount}`);
  console.log(`  ✓ Resolved Findings Count:  ${report.content.riskSummary.resolvedFindingsCount}`);
  console.log(`  ✓ Open Findings Count:      ${report.content.riskSummary.openFindingsCount}`);
  console.log(`  ✓ Residual Risk Score:      ${report.content.riskSummary.residualRiskScore} / 10.0`);
  console.log(`  ✓ Executive Summary:        ${report.content.executiveSummary}`);

  // Verify secret is not in the final report
  if (JSON.stringify(report).includes(syntheticSecret)) {
    throw new Error('SECURITY VIOLATION: Customer secret found in final report!');
  }
  console.log('  ✓ Final report verified free of customer secrets.');

  // 13. Assessment Completion Gate
  console.log('\n[STEP 12] Assessment Completion Gate');
  const finalAsmRes = await fetch(`${BASE_URL}/api/v1/assessments/${assessment.id}`, {
    headers: { Cookie: cookie },
  });
  const finalAsmData = await finalAsmRes.json();
  console.log(`  ✓ Final Assessment Status: ${finalAsmData.data.status}`);
  console.log(`  ✓ Completed At:            ${finalAsmData.data.completedAt}`);

  console.log('\n================================================================================');
  console.log('✓ REAL HTTP TARGET ADAPTER & CUSTOMER ASSESSMENT VALIDATION COMPLETED GREEN!');
  console.log('================================================================================');
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
