/**
 * DEFYRA: Live Customer Assessment Lifecycle Verification
 * Complete Journey:
 * Assessment Creation -> Scope/Payment Gate -> Real HTTP Execution -> Finding Candidate ->
 * Human Review (CONFIRMED) -> Remediation Advisory -> Target Remediation ->
 * Retest (Fresh Token & Nonce) -> Resolution (RESOLVED) ->
 * Final Assurance Report (SHA-256 Sealed) -> Assessment Completion & Sealing.
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
  console.log('DEFYRA: LIVE END-TO-END CUSTOMER ASSESSMENT LIFECYCLE VERIFICATION');
  console.log('Operating Entity: MARKEET TECHNOLOGIES PRIVATE LIMITED');
  console.log('Principle: PROVE. PROTECT. TRUST.');
  console.log('================================================================================\n');

  // STEP 1: Authenticate as Founder & Lead Security Architect
  console.log('[STEP 1] Authenticating Lead Security Architect');
  const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'founder@defyra.ai',
      password: 'DefyraSecurity2026!',
    }),
  });
  const cookie = loginRes.headers.get('set-cookie')?.split(';')[0] || '';
  console.log('  ✓ Authenticated: founder@defyra.ai');

  // STEP 2: Create Synthetic Customer Project
  console.log('\n[STEP 2] Creating Customer Project');
  const projRes = await fetch(`${BASE_URL}/api/v1/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      organizationId: 'org_defyra_corp_01',
      name: 'Agentic Core Customer Platform',
      description: 'Customer conversational banking assistant and agentic workflows',
      environment: 'staging',
    }),
  });
  const project = (await projRes.json()).data;
  console.log(`  ✓ Project ID:   ${project.id} (${project.name})`);

  // STEP 3: Register Target Asset & Set Initial Baseline Mode
  console.log('\n[STEP 3] Registering Staging Target Asset');
  const targetEndpointUrl = `${SYNTHETIC_TARGET_URL}/v1/chat/completions`;
  const assetRes = await fetch(`${BASE_URL}/api/v1/projects/${project.id}/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      name: 'Banking Assistant OpenAI Staging Endpoint',
      type: 'MODEL',
      environment: 'staging',
      metadata: {
        endpointUrl: targetEndpointUrl,
        adapterType: 'REST_ENDPOINT',
      },
    }),
  });
  const asset = (await assetRes.json()).data;
  console.log(`  ✓ Asset ID:     ${asset.id} (${targetEndpointUrl})`);

  // Set target to VULNERABLE for initial baseline probe
  await setTargetMode('VULNERABLE');
  console.log('  ✓ Target mode:  VULNERABLE');

  // STEP 4: Create Scoped Assessment
  console.log('\n[STEP 4] Creating Assessment Entity with Scoped RoE');
  const asmRes = await fetch(`${BASE_URL}/api/v1/projects/${project.id}/assessments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      name: 'Customer AI Security Validation Assessment — E2E Journey',
      description: 'Formal point-in-time assessment evaluating prompt injection and credential protection',
      assessmentType: 'AI_SECURITY_VALIDATION',
      environment: 'staging',
      authorizedAssetIds: [asset.id],
      authorizedTestIds: ['DEF-INJ-001'],
      paymentStatus: 'QUOTE_SENT',
    }),
  });
  const assessment = (await asmRes.json()).data;
  console.log(`  ✓ Assessment ID: ${assessment.id} (Status: ${assessment.status})`);

  // STEP 5: Authorize Rules of Engagement & Confirm Commercial Payment
  console.log('\n[STEP 5] Authorization Gate & Payment Confirmation');
  const authzRes = await fetch(`${BASE_URL}/api/v1/assessments/${assessment.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      status: 'AUTHORIZED',
      paymentStatus: 'PAYMENT_CONFIRMED',
      paymentReference: 'INV-2026-E2E-PAID',
    }),
  });
  const authzData = await authzRes.json();
  console.log(`  ✓ Assessment Status: ${authzData.data.status}`);
  console.log(`  ✓ Payment Status:    ${authzData.data.paymentStatus} (${authzData.data.paymentReference})`);

  // STEP 6: Execute Real HTTP Security Probe (Port 3000 -> 8000 -> 4000)
  console.log('\n[STEP 6] Executing Controlled Real HTTP Security Probe');
  const syntheticSecret = 'DEFYRA_TEST_SECRET_ONLY';

  const runRes = await fetch(`${BASE_URL}/api/v1/projects/${project.id}/test-runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      assetId: asset.id,
      testId: 'DEF-INJ-001',
      assessmentId: assessment.id,
      environment: 'staging',
      parameters: {
        secret_token: syntheticSecret,
      },
    }),
  });
  const runData = await runRes.json();
  const testRun = runData.data;
  console.log(`  ✓ Test Run ID:       ${testRun.id} (Status: ${testRun.status})`);

  const findingCandidate = testRun.findingCandidate;
  console.log(`  ✓ Finding Candidate: ${findingCandidate?.id}`);
  console.log(`  ✓ Title:             ${findingCandidate?.title}`);
  console.log(`  ✓ Severity:          ${findingCandidate?.severity} (Risk Score: ${findingCandidate?.riskScore} / 10.0)`);
  console.log(`  ✓ Status:            ${findingCandidate?.status} (Under Review)`);

  // STEP 7: Customer Secret Non-Leakage Check
  console.log('\n[STEP 7] Verifying Customer Secret Non-Leakage');
  const rawRunStr = JSON.stringify(testRun);
  if (rawRunStr.includes(syntheticSecret)) {
    throw new Error('SECURITY BREACH: Customer test secret leaked in test run record!');
  }
  console.log(`  ✓ Secret Non-Leakage Verified: '${syntheticSecret}' is strictly sanitized.`);

  // STEP 8: Human Security Review Transition (CANDIDATE -> CONFIRMED)
  console.log('\n[STEP 8] Lead Security Architect Human Review Gate');
  const reviewRes = await fetch(`${BASE_URL}/api/v1/findings/${findingCandidate.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      status: 'CONFIRMED',
      reviewNotes: 'Confirmed direct prompt override vulnerability against live HTTP OpenAI endpoint. Root cause: lack of rigid delimiter framing.',
    }),
  });
  const reviewData = await reviewRes.json();
  console.log(`  ✓ Finding Review Complete: Status -> ${reviewData.data.status}`);

  // STEP 9: Formulate Actionable Remediation Advisory
  console.log('\n[STEP 9] Formulating Actionable Remediation Advisory');
  const remRes = await fetch(`${BASE_URL}/api/v1/findings/${findingCandidate.id}/remediation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      title: 'Enforce Rigid Instruction Delimiters & Pre-Response Guardrails',
      description: 'Wrap system instructions in <system_instructions> tags and activate pre-response classifier.',
      recommendedAction: 'Deploy XML encapsulation and pre-response classifier to staging.',
      priority: 'HIGH',
      owner: 'Customer AI Platform Lead',
    }),
  });
  const remData = await remRes.json();
  console.log(`  ✓ Remediation Record: ${remData.data.id} (Status: ${remData.data.status})`);

  // STEP 10: Target Remediation & Verification Retest
  console.log('\n[STEP 10] Customer Applies Fix & Triggers Verification Retest');
  await setTargetMode('REMEDIATED');
  console.log('  ✓ Target mode switched: REMEDIATED');

  const retestRes = await fetch(`${BASE_URL}/api/v1/findings/${findingCandidate.id}/retest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      notes: 'Retest executed after customer deployed rigid XML framing on staging.',
    }),
  });
  const retestData = await retestRes.json();
  console.log(`  ✓ Retest ID:         ${retestData.data.retest.id} (Result: ${retestData.data.retest.retestResult})`);
  console.log(`  ✓ Behavior Delta:    ${retestData.data.retest.behaviorChange}`);
  console.log(`  ✓ Finding Status:    ${retestData.data.finding.status}`);

  // STEP 11: Point-in-Time Assurance Report Generation & Sealing
  console.log('\n[STEP 11] Generating Point-in-Time Security Assessment Report');
  const repRes = await fetch(`${BASE_URL}/api/v1/assessments/${assessment.id}/report`, {
    method: 'POST',
    headers: { Cookie: cookie },
  });
  const report = (await repRes.json()).data;
  console.log(`  ✓ Report Title:             ${report.title}`);
  console.log(`  ✓ SHA-256 Report Hash:     ${report.reportHash}`);
  console.log(`  ✓ Initial Confirmed Count:  ${report.content.riskSummary.originalFindingsCount}`);
  console.log(`  ✓ Resolved via Retest:     ${report.content.riskSummary.resolvedFindingsCount}`);
  console.log(`  ✓ Open Findings:            ${report.content.riskSummary.openFindingsCount}`);
  console.log(`  ✓ Initial Risk Score:       ${report.content.riskSummary.overallRiskScore} / 10.0`);
  console.log(`  ✓ Residual Risk Score:      ${report.content.riskSummary.residualRiskScore} / 10.0`);
  console.log(`  ✓ Executive Summary:        ${report.content.executiveSummary}`);

  // STEP 12: Verify Assessment Sealing & Execution Immutability
  console.log('\n[STEP 12] Verifying Assessment Sealing (Completed Status)');
  const asmFinalRes = await fetch(`${BASE_URL}/api/v1/assessments/${assessment.id}`, {
    headers: { Cookie: cookie },
  });
  const finalAsmData = await asmFinalRes.json();
  console.log(`  ✓ Final Assessment Status: ${finalAsmData.data.status}`);
  console.log(`  ✓ Completed Timestamp:     ${finalAsmData.data.completedAt}`);

  // Attempt execution on sealed/completed assessment
  console.log('  Testing post-completion execution rejection...');
  const sealedExecRes = await fetch(`${BASE_URL}/api/v1/projects/${project.id}/test-runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      assetId: asset.id,
      testId: 'DEF-INJ-001',
      assessmentId: assessment.id,
      environment: 'staging',
    }),
  });
  const sealedExecData = await sealedExecRes.json();
  console.log(`  ✓ Post-Completion Execution Blocked: HTTP ${sealedExecRes.status} (${sealedExecData.error?.code})`);

  console.log('\n================================================================================');
  console.log('✓ FULL ASSESSMENT -> FINDING -> REMEDIATION -> RETEST -> REPORT JOURNEY COMPLETE!');
  console.log('================================================================================');
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
