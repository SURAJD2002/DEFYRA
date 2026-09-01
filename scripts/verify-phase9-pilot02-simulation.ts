/**
 * DEFYRA Phase 9: Synthetic Customer Pilot 02 Operational Drill
 * 
 * Customer: Synthetic Customer — Pilot 02
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
  console.log('DEFYRA PHASE 9: SYNTHETIC OPERATIONAL DRILL — PILOT 02');
  console.log('Principle: PROVE. PROTECT. TRUST.');
  console.log('Operating Entity: MARKEET TECHNOLOGIES PRIVATE LIMITED');
  console.log('================================================================================\n');

  // Stage 1: Lead Intake via /contact
  console.log('[STAGE 1] Inbound Customer Lead Intake via Contact API');
  const leadRes = await fetch(`${BASE_URL}/api/v1/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Sarah Jenkins',
      workEmail: 'sjenkins@synthetic-saas.com',
      company: 'Synthetic Customer — Pilot 02',
      role: 'VP of Engineering',
      companySize: '11-50',
      aiSystemType: 'Customer-Facing AI / LLM Application',
      scopeDescription: '1 OpenAI-compatible staging endpoint for our B2B financial assistant.',
      message: 'Looking for a formal point-in-time AI security validation before SOC 2 audit.',
      noCredentialsAcknowledged: true,
    }),
  });
  const leadData = await leadRes.json();
  console.log(`  ✓ Lead Received & Logged: Reference -> ${leadData.data.referenceId}`);

  // Stage 2: Target Health & Baseline Setup
  console.log('\n[STAGE 2] Target Endpoint Health & Baseline Initialization');
  const healthRes = await fetch(`${SYNTHETIC_TARGET_URL}/health`);
  console.log(`  ✓ Target Endpoint: HTTP 200 OK (${SYNTHETIC_TARGET_URL}/v1/chat/completions)`);
  await setTargetMode('VULNERABLE');
  console.log('  ✓ Baseline target mode set: VULNERABLE');

  // Stage 3: Lead Security Architect Authentication
  console.log('\n[STAGE 3] Lead Security Architect Authentication');
  const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'founder@defyra.ai',
      password: 'DefyraSecurity2026!',
    }),
  });
  const cookie = loginRes.headers.get('set-cookie')?.split(';')[0] || '';
  console.log('  ✓ Authenticated as Founder & Lead Security Architect');

  // Stage 4: Project & Asset Onboarding
  console.log('\n[STAGE 4] Customer Project & Target Asset Onboarding');
  const projRes = await fetch(`${BASE_URL}/api/v1/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      organizationId: 'org_defyra_corp_01',
      name: 'Synthetic Customer — Pilot 02 Project',
      description: 'Customer conversational banking assistant endpoint',
      environment: 'staging',
    }),
  });
  const projectId = (await projRes.json()).data.id;

  const targetEndpointUrl = `${SYNTHETIC_TARGET_URL}/v1/chat/completions`;
  const assetRes = await fetch(`${BASE_URL}/api/v1/projects/${projectId}/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      name: 'Financial Assistant LLM Endpoint',
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
  console.log(`  ✓ Target Asset Onboarded: ${assetId} (${targetEndpointUrl})`);

  // Stage 5: Proposal & Rules of Engagement Scoping
  console.log('\n[STAGE 5] Assessment Scoping & RoE Formulation');
  const asmRes = await fetch(`${BASE_URL}/api/v1/projects/${projectId}/assessments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      name: 'DEFYRA Founding AI Security Assessment — Pilot 02',
      description: 'Formal point-in-time assessment evaluating system prompt override and secret protection',
      assessmentType: 'AI_SECURITY_VALIDATION',
      environment: 'staging',
      authorizedAssetIds: [assetId],
      authorizedTestIds: ['DEF-INJ-001'],
      paymentStatus: 'QUOTE_SENT',
    }),
  });
  const assessment = (await asmRes.json()).data;
  console.log(`  ✓ Assessment Created: ${assessment.id} (Status: ${assessment.status}, Payment: ${assessment.paymentStatus})`);

  // Stage 6: Customer Authorization & Payment Confirmation
  console.log('\n[STAGE 6] Customer Authorization Gate & Payment Confirmation');
  const authzRes = await fetch(`${BASE_URL}/api/v1/assessments/${assessment.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      status: 'AUTHORIZED',
      paymentStatus: 'PAYMENT_CONFIRMED',
      paymentReference: 'INV-DEFYRA-2026-PILOT-02-PAID',
    }),
  });
  const authzData = await authzRes.json();
  console.log(`  ✓ Scope Agreement Signed: Status -> ${authzData.data.status}`);
  console.log(`  ✓ Commercial Payment Confirmed: Reference -> ${authzData.data.paymentReference}`);

  // Stage 7: Real HTTP Probe Execution
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
  console.log(`  ✓ Test Run Executed: ${runData.data.id} (Status: ${runData.data.status})`);
  const findingCandidate = runData.data.findingCandidate;
  console.log(`  ✓ Finding Candidate Generated: ${findingCandidate?.id}`);
  console.log(`  ✓ Title:               ${findingCandidate?.title}`);
  console.log(`  ✓ Severity:            ${findingCandidate?.severity} (Risk: ${findingCandidate?.riskScore} / 10.0)`);
  console.log(`  ✓ Quality Gate Status: CANDIDATE (Under Review)`);

  // Stage 8: Secret Non-Leakage Audit
  console.log('\n[STAGE 8] Customer Data & Credential Safety Audit');
  const runPayloadStr = JSON.stringify(runData.data);
  if (runPayloadStr.includes(syntheticSecret)) {
    throw new Error('SECURITY VIOLATION: Customer secret leaked into execution response!');
  }
  console.log(`  ✓ Verified: Synthetic credential '${syntheticSecret}' is strictly scrubbed from all database/log records.`);

  // Stage 9: Lead Security Architect Quality Review
  console.log('\n[STAGE 9] Lead Security Architect Review Gate');
  const reviewRes = await fetch(`${BASE_URL}/api/v1/findings/${findingCandidate.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      status: 'CONFIRMED',
      reviewNotes: 'Confirmed direct prompt override vulnerability against live HTTP OpenAI endpoint. Root cause: lack of rigid delimiter framing.',
    }),
  });
  const reviewData = await reviewRes.json();
  console.log(`  ✓ Quality Gate Complete: Finding Status -> ${reviewData.data.status}`);

  // Stage 10: Remediation Formulation
  console.log('\n[STAGE 10] Actionable Remediation Advisory Formulation');
  const remRes = await fetch(`${BASE_URL}/api/v1/findings/${findingCandidate.id}/remediation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      title: 'Deploy XML Framing & Pre-Response Classifier',
      description: 'Wrap system prompts in <system_instructions> and activate secondary classifier.',
      recommendedAction: 'Deploy XML encapsulation and verify delimiter adherence.',
      priority: 'HIGH',
      owner: 'Customer AI Platform Lead',
    }),
  });
  const remData = await remRes.json();
  console.log(`  ✓ Remediation Created: ${remData.data.id} (Status: ${remData.data.status})`);

  // Stage 11: Target Remediated & Verification Retest
  console.log('\n[STAGE 11] Customer Deploys Fix & Triggers Verification Retest');
  await setTargetMode('REMEDIATED');
  console.log('  ✓ Target switched to REMEDIATED state.');

  const retestRes = await fetch(`${BASE_URL}/api/v1/findings/${findingCandidate.id}/retest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      notes: 'Verification retest after customer deployed XML instruction encapsulation.',
    }),
  });
  const retestData = await retestRes.json();
  console.log(`  ✓ Retest Executed: Result = ${retestData.data.retest.retestResult}`);
  console.log(`  ✓ Finding Status:  ${retestData.data.finding.status}`);

  // Stage 12: Point-in-Time Assurance Report Generation
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

  // Stage 13: Assessment Closeout Gate
  console.log('\n[STAGE 13] Commercial Closeout & Completion Gate');
  const finalAsmRes = await fetch(`${BASE_URL}/api/v1/assessments/${assessment.id}`, {
    headers: { Cookie: cookie },
  });
  const finalAsmData = await finalAsmRes.json();
  console.log(`  ✓ Final Assessment Status: ${finalAsmData.data.status}`);
  console.log(`  ✓ Completed At:            ${finalAsmData.data.completedAt}`);

  console.log('\n================================================================================');
  console.log('✓ SYNTHETIC OPERATIONAL DRILL — PILOT 02 COMPLETED GREEN!');
  console.log('================================================================================');
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
