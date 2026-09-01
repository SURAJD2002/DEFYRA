import { z } from 'zod';

const SECRET_PATTERNS = [
  /sk-[a-zA-Z0-9]{20,}/i,
  /ghp_[a-zA-Z0-9]{20,}/i,
  /AKIA[0-9A-Z]{16}/i,
  /-----BEGIN [A-Z ]+PRIVATE KEY-----/i,
  /password\s*=\s*['"][^'"]+['"]/i,
];

function containsSecrets(val: string): boolean {
  return SECRET_PATTERNS.some((pattern) => pattern.test(val));
}

// --- Contact Form ---
export const contactSubmissionSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .refine((val) => !containsSecrets(val), 'Please do not include credentials or API keys'),
  workEmail: z
    .string()
    .email('Please enter a valid work email address')
    .max(150, 'Email is too long')
    .refine(
      (email) => !email.endsWith('@example.com') && !email.endsWith('@test.com'),
      'Please use an active corporate or organization email address'
    ),
  company: z
    .string()
    .min(2, 'Company name is required')
    .max(120, 'Company name is too long')
    .refine((val) => !containsSecrets(val), 'Please do not include credentials or API keys'),
  role: z.string().min(2, 'Role/Title is required').max(100, 'Role is too long'),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+'], {
    errorMap: () => ({ message: 'Please select a valid company size range' }),
  }),
  aiSystemType: z
    .string()
    .min(3, 'Please specify your AI system type')
    .max(200, 'Description too long'),
  scopeDescription: z
    .string()
    .min(10, 'Please provide context on what you are seeking to secure (min 10 chars)')
    .max(1000, 'Scope description must be under 1000 characters')
    .refine(
      (val) => !containsSecrets(val),
      'Security Warning: API keys, passwords, or production secrets must not be submitted.'
    ),
  message: z
    .string()
    .max(2000, 'Message must be under 2000 characters')
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || !containsSecrets(val),
      'Security Warning: API keys, passwords, or production secrets must not be submitted.'
    ),
  noCredentialsAcknowledged: z.boolean().refine((val) => val === true, {
    message: 'You must confirm that no credentials, secrets, or production keys are enclosed.',
  }),
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;

// --- Authentication Schemas ---
export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  fullName: z.string().min(2, 'Full name is required').max(100, 'Full name is too long'),
  organizationName: z.string().min(2, 'Organization name is required').max(100),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// --- Organization Schemas ---
export const createOrgSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters').max(100),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and dashes'),
});

export const updateOrgSchema = z.object({
  name: z.string().min(2).max(100),
});

export const addMemberSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  role: z.enum(['OWNER', 'ADMIN', 'SECURITY_LEAD', 'ANALYST', 'VIEWER']),
});

// --- Project Schemas ---
export const createProjectSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  name: z.string().min(2, 'Project name is required').max(120),
  description: z.string().max(500).default(''),
  environment: z.enum(['development', 'staging', 'production']).default('staging'),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(500).optional(),
  environment: z.enum(['development', 'staging', 'production']).optional(),
});

// --- Asset Schemas ---
export const createAssetSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  type: z.enum([
    'APPLICATION',
    'AGENT',
    'MODEL',
    'RAG',
    'MEMORY',
    'TOOL',
    'API',
    'IDENTITY',
    'PERMISSION',
    'DATA_SOURCE',
    'MCP_SERVER',
  ]),
  name: z.string().min(2, 'Asset name is required').max(150),
  description: z.string().max(1000).default(''),
  environment: z.enum(['development', 'staging', 'production']).default('staging'),
  metadata: z.record(z.unknown()).default({}),
});

export const updateAssetSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  type: z
    .enum([
      'APPLICATION',
      'AGENT',
      'MODEL',
      'RAG',
      'MEMORY',
      'TOOL',
      'API',
      'IDENTITY',
      'PERMISSION',
      'DATA_SOURCE',
      'MCP_SERVER',
    ])
    .optional(),
  description: z.string().max(1000).optional(),
  environment: z.enum(['development', 'staging', 'production']).optional(),
  metadata: z.record(z.unknown()).optional(),
  status: z.enum(['active', 'archived']).optional(),
});

export const createRelationshipSchema = z.object({
  sourceAssetId: z.string().min(1),
  targetAssetId: z.string().min(1),
  relationshipType: z.enum([
    'USES',
    'INVOKES',
    'CALLS',
    'AUTHENTICATED_BY',
    'HAS_PERMISSION',
    'RETRIEVES_FROM',
    'WRITES_TO',
  ]),
});

// --- Test Run Schemas ---
export const createTestRunSchema = z.object({
  testId: z.string().min(1, 'Test ID is required'),
  assetId: z.string().min(1, 'Asset ID is required'),
  parameters: z.record(z.unknown()).optional(),
});

// --- Phase 4 Assessment Schemas ---
export const createAssessmentSchema = z.object({
  name: z.string().min(3, 'Assessment name is required').max(150),
  description: z.string().max(1000).default(''),
  assessmentType: z.enum([
    'AI_SECURITY_VALIDATION',
    'AI_RED_TEAM',
    'AGENT_SECURITY',
    'RAG_SECURITY',
    'TOOL_API_SECURITY',
    'MCP_SECURITY',
  ]),
  environment: z.enum(['development', 'staging', 'production']).default('staging'),
  authorizedAssetIds: z.array(z.string()).min(1, 'At least one authorized asset is required in scope'),
  authorizedTestIds: z.array(z.string()).min(1, 'At least one security test definition is required in scope'),
  testingWindowStart: z.string().optional(),
  testingWindowEnd: z.string().optional(),
  productionApproved: z.boolean().default(false),
  writtenAuthorizationReference: z.string().optional(),
});

export const updateAssessmentSchema = z.object({
  name: z.string().min(3).max(150).optional(),
  description: z.string().max(1000).optional(),
  status: z
    .enum([
      'DRAFT',
      'PENDING_APPROVAL',
      'AUTHORIZED',
      'SCOPING',
      'READY',
      'RUNNING',
      'REVIEW',
      'REMEDIATION',
      'RETEST',
      'COMPLETED',
      'CANCELLED',
    ])
    .optional(),
  dueAt: z.string().optional(),
});

export const updateFindingReviewSchema = z.object({
  status: z.enum([
    'CANDIDATE',
    'UNDER_REVIEW',
    'CONFIRMED',
    'FALSE_POSITIVE',
    'ACCEPTED_RISK',
    'REMEDIATION_REQUIRED',
    'RETEST_PENDING',
    'RESOLVED',
    'REOPENED',
  ]),
  reviewNotes: z.string().max(2000).optional(),
});

export const createRemediationSchema = z.object({
  title: z.string().min(3, 'Title is required').max(200),
  description: z.string().max(2000).default(''),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).default('HIGH'),
  recommendedAction: z.string().min(5, 'Recommended action is required').max(2000),
  owner: z.string().max(100).default(''),
});

export const updateRemediationSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  recommendedAction: z.string().min(5).max(2000).optional(),
  owner: z.string().max(100).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'READY_FOR_RETEST', 'RESOLVED', 'WONT_FIX', 'ACCEPTED_RISK']).optional(),
});

export const createRetestSchema = z.object({
  syntheticFixApplied: z.boolean().default(true),
  notes: z.string().max(1000).optional(),
});
