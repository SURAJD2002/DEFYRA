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
