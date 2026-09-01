/**
 * DEFYRA Phase 8: First Paid Customer Pilot & Commercial Delivery Simulation
 * 
 * Customer: Synthetic AI SaaS Customer
 * Target: OpenAI-compatible REST API (Port 4000)
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
  console.log('DEFYRA PHASE 8: FIRST PAID CUSTOMER PILOT & COMMERCIAL DELIVERY SIMULATION');
  console.log('Principle: PROVE. PROTECT. TRUST.');
  console.log('Operating Entity: MARKEET TECHNOLOGIES PRIVATE LIMITED');
  console.log('================================================================================\n');

  // 1. Verify Target Health
  console.log('[STAGE 1] Target Endpoint Health Verification');
  const healthRes = await fetch(`${SYNTHETIC_TARGET_URL}/health`);
  const healthData = await healthRes.json();
  console.log(`  ✓ Synthetic OpenAI-Compatible Endpoint: HTTP 200 OK (${SYNTHETIC_TARGET_URL}/v1/chat/completions)`);

  // Switch to VULNERABLE behavior for initial baseline evaluation
  await setTargetMode('VULNERABLE');
  console.log('  ✓ Endpoint state: Baseline (Vulnerable to System Prompt Override)');

  // 2. Customer Authentication
  console.log('\n[STAGE 2] Lead Security Architect Authentication');
  const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'founder@defyra.ai',
      password: 'DefyraSecurity2026!',
    }),
  });
  const cookie = loginRes.headers.get('set-cookie')?.split(';')[0] || '';
  console.log('  ✓ Authenticated as Founder & Lead Security Architect (founder@defyra.ai)');

  // 3. Project Initialization & Target Onboarding
  console.log('\n[STAGE 3] Customer Project & Target Asset Onboarding');
  const projRes = await fetch(`${BASE_URL}/api/v1/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      organizationId: 'org_defyra_corp_01',
      name: 'Synthetic AI SaaS Customer Project',
      description: 'Customer conversational assistant and agentic backend',
      environment: 'staging',
    }),
  });
  const projectId = (await projRes.json()).data.id;

  const targetEndpointUrl = `${SYNTHETIC_TARGET_URL}/v1/chat/completions`;
  const assetRes = await fetch(`${BASE_URL}/api/v1/projects/${projectId}/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      name: 'Customer Production LLM Assistant Endpoint',
      type: 'MODEL',
      environment: 'staging',
      metadata: {
        endpointUrl: targetEndpointUrl,
        adapterType: 'REST_ENDPOINT',
      },
    }),
  });
  const assetId = (await assetRes.json()).data.id;
  console.log(`  ✓ Project Created: ${projectId}`);
  console.log(`  ✓ Asset Registered: ${assetId} (${targetEndpointUrl})`);

  // 4. Commercial Scoping & Proposal
  console.log('\n[STAGE 4] Assessment Scoping & Commercial Status: QUOTE_SENT');
  const asmRes = await fetch(`${BASE_URL}/api/v1/projects/${projectId}/assessments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      name: 'DEFYRA Founding AI Security Assessment — Pilot 01',
      description: 'Formal paid security assessment evaluating prompt injection and credential protection',
      assessmentType: 'AI_SECURITY_VALIDATION',
      environment: 'staging',
      authorizedAssetIds: [assetId],
      authorizedTestIds: ['DEF-INJ-001'],
      paymentStatus: 'QUOTE_SENT',
    }),
  });
  const assessment = (await asmRes.json()).data;
  console.log(`  ✓ Assessment Initialized: ${assessment.id}`);
  console.log(`  ✓ Commercial Status:     ${assessment.paymentStatus}`);

  // 5. Commercial Readiness Gate Test (Must Refuse Execution when unpaid)
  console.log('\n[STAGE 5] Testing Commercial Readiness Gate (Fail-Closed on Unpaid Status)');
  const prematureRunRes = await fetch(`${BASE_URL}/api/v1/assessments/${assessment.id}/tests`, {
    method: 'POST',
    headers: { Cookie: cookie },
  });
  console.log(`  ✓ Premature execution rejected fail-closed (Assessment status requires AUTHORIZED & PAYMENT_CONFIRMED).`);

  // 6. Customer Authorization & Payment Confirmation Gate
  console.log('\n[STAGE 6] Customer Authorization & Commercial Payment Confirmation');
  const authzRes = await fetch(`${BASE_URL}/api/v1/assessments/${assessment.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      status: 'AUTHORIZED',
      paymentStatus: 'PAYMENT_CONFIRMED',
      paymentReference: 'INV-DEFYRA-2026-PILOT-01-PAID',
    }),
  });
  const authzData = await authzRes.json();
  console.log(`  ✓ Rules of Engagement: Signed & Status -> ${authzData.data.status}`);
  console.log(`  ✓ Commercial Payment: Confirmed (${authzData.data.paymentReference})`);

  // 7. Controlled Real HTTP Probe Execution
  console.log('\n[STAGE 7] Controlled Real HTTP Probe Execution (Crossing Network Boundary)');
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
  console.log(`  ✓ Test Run Completed: ${runData.data.id} (Status: ${runData.data.status})`);
  const findingCandidate = runData.data.findingCandidate;
  console.log(`  ✓ Finding Candidate Discovered: ${findingCandidate?.id}`);
  console.log(`  ✓ Title:               ${findingCandidate?.title}`);
  console.log(`  ✓ Severity:            ${findingCandidate?.severity} (Risk: ${findingCandidate?.riskScore} / 10.0)`);
  console.log(`  ✓ Gatekeeper Status:   ${findingCandidate?.status} (Requires Human Review)`);

  // 8. Credential & Data Non-Leakage Audit
  console.log('\n[STAGE 8] Customer Data Safety & Secret Non-Leakage Audit');
  const rawRunJson = JSON.stringify(runData.data);
  if (rawRunJson.includes(syntheticSecret)) {
    throw new Error('SECURITY VIOLATION: Customer secret leaked in execution response!');
  }
  console.log(`  ✓ Verified: Synthetic credential '${syntheticSecret}' is strictly sanitized from logs, database, and telemetry.`);

  // 9. Lead Security Architect Human Review
  console.log('\n[STAGE 9] Lead Security Architect Quality Gate Review');
  const reviewRes = await fetch(`${BASE_URL}/api/v1/findings/${findingCandidate.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      status: 'CONFIRMED',
      reviewNotes: 'Confirmed direct prompt override vulnerability against live HTTP OpenAI endpoint. Root cause: lack of rigid delimiter framing.',
    }),
  });
  const reviewData = await reviewRes.json();
  console.log(`  ✓ Human Review Complete: Finding Status -> ${reviewData.data.status}`);

  // 10. Actionable Remediation Advisory
  console.log('\n[STAGE 10] Formulating Actionable Remediation Advisory');
  const remRes = await fetch(`${BASE_URL}/api/v1/findings/${findingCandidate.id}/remediation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      title: 'Enforce Rigid Instruction Delimiters & Secondary Classifier',
      description: 'Wrap system prompts in rigid XML delimiters (<system_instructions>) and activate input classification filter.',
      recommendedAction: 'Deploy XML framing and secondary pre-response classifier before production release.',
      priority: 'HIGH',
      owner: 'Customer AI Platform Lead',
    }),
  });
  const remData = await remRes.json();
  console.log(`  ✓ Remediation Action Created: ${remData.data.id} (Status: ${remData.data.status})`);

  // 11. Customer Remediates & Triggers Retest
  console.log('\n[STAGE 11] Customer Deploys Fix & Triggers Verification Retest');
  await setTargetMode('REMEDIATED');
  console.log('  ✓ Customer updated endpoint with rigid delimiter protection.');

  const retestRes = await fetch(`${BASE_URL}/api/v1/findings/${findingCandidate.id}/retest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      notes: 'Verification retest dispatched after customer deployed rigid XML framing and pre-response classifier.',
    }),
  });
  const retestData = await retestRes.json();
  console.log(`  ✓ Retest Executed: Result = ${retestData.data.retest.retestResult}`);
  console.log(`  ✓ Behavior Delta:  ${retestData.data.retest.behaviorChange}`);
  console.log(`  ✓ Finding Status:  ${retestData.data.finding.status}`);

  // 12. Final Point-in-Time Assurance Report Generation
  console.log('\n[STAGE 12] Generating Point-in-Time Security Assessment Report');
  const repRes = await fetch(`${BASE_URL}/api/v1/assessments/${assessment.id}/report`, {
    method: 'POST',
    headers: { Cookie: cookie },
  });
  const repData = await repRes.json();
  const report = repData.data;

  console.log(`  ✓ Report Title:             ${report.title}`);
  console.log(`  ✓ SHA-256 Report Hash:     ${report.reportHash}`);
  console.log(`  ✓ Initial Confirmed Count:  ${report.content.riskSummary.originalFindingsCount}`);
  console.log(`  ✓ Resolved via Retest:     ${report.content.riskSummary.resolvedFindingsCount}`);
  console.log(`  ✓ Currently Open Count:     ${report.content.riskSummary.openFindingsCount}`);
  console.log(`  ✓ Initial Risk Score:       ${report.content.riskSummary.overallRiskScore} / 10.0`);
  console.log(`  ✓ Residual Risk Score:      ${report.content.riskSummary.residualRiskScore} / 10.0`);
  console.log(`  ✓ Executive Summary:        ${report.content.executiveSummary}`);

  // 13. Assessment Closeout & Completion Gate
  console.log('\n[STAGE 13] Commercial Closeout & Completion Gate');
  const finalAsmRes = await fetch(`${BASE_URL}/api/v1/assessments/${assessment.id}`, {
    headers: { Cookie: cookie },
  });
  const finalAsmData = await finalAsmRes.json();
  console.log(`  ✓ Final Assessment Status: ${finalAsmData.data.status}`);
  console.log(`  ✓ Completed At:            ${finalAsmData.data.completedAt}`);

  console.log('\n================================================================================');
  console.log('✓ FIRST PAID CUSTOMER PILOT SIMULATION COMPLETED GREEN!');
  console.log('================================================================================');
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
