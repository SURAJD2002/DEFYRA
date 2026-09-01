export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export type TestResult = 'PASS' | 'FAIL' | 'INCONCLUSIVE' | 'ERROR';

export type FindingStatus =
  | 'Open'
  | 'Acknowledged'
  | 'Remediating'
  | 'Ready for Retest'
  | 'Resolved'
  | 'Accepted Risk';

export type AssetType =
  | 'APPLICATION'
  | 'AGENT'
  | 'MODEL'
  | 'RAG'
  | 'MEMORY'
  | 'TOOL'
  | 'API'
  | 'IDENTITY'
  | 'PERMISSION'
  | 'DATA_SOURCE'
  | 'MCP_SERVER';

export type AssetEnvironment = 'development' | 'staging' | 'production';

export type UserRole = 'OWNER' | 'ADMIN' | 'SECURITY_LEAD' | 'ANALYST' | 'VIEWER';

export type OrganizationStatus = 'active' | 'suspended' | 'archived';

export type ProjectEnvironment = 'development' | 'staging' | 'production';

export type ProjectStatus = 'active' | 'archived';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  status: 'active' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  status: 'active' | 'disabled';
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  id: string;
  organizationId: string;
  userId: string;
  role: UserRole;
  createdAt: string;
}

export interface MembershipWithUser extends Membership {
  user: UserProfile;
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  environment: ProjectEnvironment;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithStats extends Project {
  assetCount: number;
  findingCount: number;
  testCount: number;
}

export interface Asset {
  id: string;
  organizationId: string;
  projectId: string;
  type: AssetType;
  name: string;
  description: string;
  environment: AssetEnvironment;
  metadata: Record<string, unknown>;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export type RelationshipType =
  | 'USES'
  | 'INVOKES'
  | 'CALLS'
  | 'AUTHENTICATED_BY'
  | 'HAS_PERMISSION'
  | 'RETRIEVES_FROM'
  | 'WRITES_TO';

export interface AssetRelationship {
  id: string;
  projectId: string;
  sourceAssetId: string;
  targetAssetId: string;
  relationshipType: RelationshipType;
  createdAt: string;
}

export interface AssetWithRelationships extends Asset {
  outgoingRelationships: Array<{
    id: string;
    targetAssetId: string;
    targetAssetName: string;
    relationshipType: RelationshipType;
  }>;
  incomingRelationships: Array<{
    id: string;
    sourceAssetId: string;
    sourceAssetName: string;
    relationshipType: RelationshipType;
  }>;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: number;
  createdAt: string;
}

export interface SecurityTestDefinition {
  testId: string;
  name: string;
  category: string;
  objective: string;
  targetType: string;
  severity: Severity;
  preconditions: string[];
  expectedBehavior: string;
  evidenceRequirements: string[];
  remediationGuidance: string;
  retestCriteria: string;
  active: boolean;
}

export type TestRunStatus =
  | 'QUEUED'
  | 'DISPATCHED'
  | 'RUNNING'
  | 'PASSED'
  | 'FAILED'
  | 'BLOCKED'
  | 'STOPPED'
  | 'ERROR';

export interface ObservationRecord {
  observationId: string;
  stageId: string;
  timestamp: string;
  description: string;
  rawProbeInput?: Record<string, unknown>;
  rawTargetOutput?: Record<string, unknown>;
  policyViolated: boolean;
  details?: Record<string, unknown>;
}

export interface EvidenceRecord {
  evidenceId: string;
  testRunId: string;
  findingId?: string | null;
  type: string;
  sequence: number;
  createdAt: string;
  contentHash: string;
  payload: Record<string, unknown>;
  retentionUntil?: string | null;
}

// Phase 4 Assessment Types
export type AssessmentType =
  | 'AI_SECURITY_VALIDATION'
  | 'AI_RED_TEAM'
  | 'AGENT_SECURITY'
  | 'RAG_SECURITY'
  | 'TOOL_API_SECURITY'
  | 'MCP_SECURITY';

export type AssessmentStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'AUTHORIZED'
  | 'SCOPING'
  | 'READY'
  | 'RUNNING'
  | 'REVIEW'
  | 'REMEDIATION'
  | 'RETEST'
  | 'COMPLETED'
  | 'CANCELLED';

export interface AssessmentScope {
  authorizedAssetIds: string[];
  authorizedTestIds: string[];
  authorizedEnvironments: AssetEnvironment[];
  authorizedTargetBoundaries?: string[];
  testingWindowStart?: string;
  testingWindowEnd?: string;
  prohibitedActions?: string[];
  dataHandlingRules?: string[];
  emergencyContact?: string;
  killSwitchAuthority?: string;
  productionApproved?: boolean;
  writtenAuthorizationReference?: string;
}

export interface TestCasePlan {
  testId: string;
  enabled: boolean;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  order: number;
  status: 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED' | 'SKIPPED';
  expectedBehavior?: string;
  lastRunId?: string;
}

export interface Assessment {
  id: string;
  organizationId: string;
  projectId: string;
  name: string;
  description: string;
  assessmentType: AssessmentType;
  environment: AssetEnvironment;
  status: AssessmentStatus;
  scope: AssessmentScope;
  testPlan: TestCasePlan[];
  rulesOfEngagementVersion?: string;
  scopeAgreementHash?: string;
  startAt?: string | null;
  endAt?: string | null;
  approvedBy?: string | null;
  createdBy: string;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  dueAt?: string | null;
}

// Phase 6 Target Adapter and Credential Abstractions
export type TargetAdapterType = 'REST_ENDPOINT' | 'RAG_ENDPOINT' | 'AGENT_TOOL';

export interface TargetConfig {
  adapterType: TargetAdapterType;
  endpointUrl: string;
  authHeaderName?: string;
  secretReferenceId?: string;
  timeoutMs?: number;
}

export type FindingLifecycleStatus =
  | 'CANDIDATE'
  | 'UNDER_REVIEW'
  | 'CONFIRMED'
  | 'FALSE_POSITIVE'
  | 'ACCEPTED_RISK'
  | 'REMEDIATION_REQUIRED'
  | 'RETEST_PENDING'
  | 'RESOLVED'
  | 'REOPENED';

export interface FindingRecord {
  id: string;
  organizationId: string;
  projectId: string;
  assessmentId?: string | null;
  testRunId?: string | null;
  affectedAssetId?: string | null;
  testId: string;
  title: string;
  description: string;
  severity: Severity;
  confidence: number;
  riskScore: number;
  riskModelVersion: string;
  status: FindingLifecycleStatus;
  impact: string;
  attackScenario: string;
  recommendation: string;
  observationIds: string[];
  evidenceIds: string[];
  reviewNotes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type RemediationStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'READY_FOR_RETEST'
  | 'RESOLVED'
  | 'WONT_FIX'
  | 'ACCEPTED_RISK';

export interface RemediationRecord {
  id: string;
  organizationId: string;
  projectId: string;
  assessmentId: string;
  findingId: string;
  title: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAction: string;
  owner: string;
  status: RemediationStatus;
  createdAt: string;
  updatedAt: string;
}

export type RetestResultType = 'PASS' | 'FAIL' | 'INCONCLUSIVE';

export interface RetestRecord {
  id: string;
  organizationId: string;
  projectId: string;
  assessmentId: string;
  findingId: string;
  testRunId: string;
  previousResult: string;
  retestResult: RetestResultType;
  originalEvidenceId?: string;
  retestEvidenceId?: string;
  behaviorChange: string;
  performedBy: string;
  createdAt: string;
}

export interface SecurityReportContent {
  executiveSummary: string;
  scopeSummary: string;
  methodology: string;
  assetsAssessed: Array<{ id: string; name: string; type: string }>;
  testCoverage: Array<{ testId: string; status: string; result: string }>;
  keyFindings: Array<{ id: string; title: string; severity: string; riskScore: number; status: string }>;
  riskSummary: {
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    overallRiskScore: number;
    originalFindingsCount?: number;
    resolvedFindingsCount?: number;
    openFindingsCount?: number;
    acceptedRiskCount?: number;
    residualRiskScore?: number;
  };
  detailedFindings: FindingRecord[];
  evidenceReferences: string[];
  remediationSummary: RemediationRecord[];
  retestResults: RetestRecord[];
  limitations: string[];
  conclusion: string;
}

export interface SecurityReport {
  id: string;
  organizationId: string;
  projectId: string;
  assessmentId: string;
  title: string;
  methodologyVersion: string;
  riskModelVersion: string;
  reportHash: string;
  content: SecurityReportContent;
  generatedBy: string;
  generatedAt: string;
}

export interface TestRun {
  id: string;
  organizationId: string;
  projectId: string;
  assessmentId?: string | null;
  assetId: string;
  testId: string;
  environment: AssetEnvironment;
  status: 'QUEUED' | 'RUNNING' | 'PASSED' | 'FAILED' | 'BLOCKED' | 'STOPPED' | 'ERROR';
  requestedBy: string;
  requestId: string;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  durationMs?: number;
  errorCode?: string | null;
  errorMessage?: string | null;
  observations: ObservationRecord[];
  stageResults: Array<Record<string, unknown>>;
  evidence: EvidenceRecord[];
  findingCandidate?: FindingRecord | null;
  metadata?: Record<string, unknown>;
}

export interface ContactSubmissionPayload {
  name: string;
  workEmail: string;
  company: string;
  role: string;
  companySize: string;
  aiSystemType: string;
  scopeDescription: string;
  message: string;
  noCredentialsAcknowledged: boolean;
}

export interface AuditEventPayload {
  id?: string;
  organizationId?: string | null;
  userId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt?: string;
}

// Export Security Contracts & Execution Types
export * from '../lib/contracts/test-contract';
export * from '../lib/auth/capability-token';
export * from '../lib/security/target-validator';
export * from '../lib/security/kill-switch';
export * from '../lib/security/network-egress';
