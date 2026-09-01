export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export type TestRunStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type TestResult = 'PASS' | 'FAIL' | 'INCONCLUSIVE' | 'ERROR';

export type FindingStatus =
  | 'Open'
  | 'Acknowledged'
  | 'Remediating'
  | 'Ready for Retest'
  | 'Resolved'
  | 'Accepted Risk';

export type AssetType =
  | 'Application'
  | 'Agent'
  | 'Model'
  | 'RAG'
  | 'Memory'
  | 'Tool'
  | 'API'
  | 'Identity'
  | 'Permission'
  | 'Data Source'
  | 'MCP Server';

export type UserRole = 'Owner' | 'Admin' | 'Security Lead' | 'Analyst' | 'Viewer';

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

export interface AttackPathNode {
  id: string;
  title: string;
  subtitle: string;
  category: 'Input' | 'Core AI' | 'Knowledge' | 'Execution' | 'Governance' | 'External' | 'Impact';
  description: string;
  threatExamples: string[];
  validationMethod: string;
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
