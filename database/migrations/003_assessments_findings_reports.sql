-- 003_assessments_findings_reports.sql
-- DEFYRA V0.1 Customer-Grade Security Assessment, Scoping, Remediation, and Reporting

-- 1. Assessments Table
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    assessment_type VARCHAR(100) NOT NULL CHECK (assessment_type IN ('AI_SECURITY_VALIDATION', 'AI_RED_TEAM', 'AGENT_SECURITY', 'RAG_SECURITY', 'TOOL_API_SECURITY', 'MCP_SECURITY')),
    environment VARCHAR(50) DEFAULT 'staging' NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT' NOT NULL CHECK (status IN ('DRAFT', 'SCOPING', 'READY', 'RUNNING', 'REVIEW', 'COMPLETED', 'CANCELLED')),
    scope JSONB DEFAULT '{}'::jsonb NOT NULL,
    test_plan JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    due_at TIMESTAMP WITH TIME ZONE
);

-- 2. Enhanced Findings Table
CREATE TABLE IF NOT EXISTS assessment_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    test_run_id UUID REFERENCES test_runs(id) ON DELETE SET NULL,
    affected_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    test_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL')),
    confidence NUMERIC(3,2) DEFAULT 1.0 NOT NULL,
    risk_score NUMERIC(4,2) DEFAULT 0.0 NOT NULL,
    risk_model_version VARCHAR(20) DEFAULT 'v0.1' NOT NULL,
    status VARCHAR(50) DEFAULT 'CANDIDATE' NOT NULL CHECK (status IN ('CANDIDATE', 'UNDER_REVIEW', 'CONFIRMED', 'FALSE_POSITIVE', 'ACCEPTED_RISK', 'REMEDIATION_REQUIRED', 'RETEST_PENDING', 'RESOLVED', 'REOPENED')),
    impact TEXT DEFAULT '',
    attack_scenario TEXT DEFAULT '',
    recommendation TEXT DEFAULT '',
    observation_ids JSONB DEFAULT '[]'::jsonb,
    evidence_ids JSONB DEFAULT '[]'::jsonb,
    review_notes TEXT,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. Remediations Table
CREATE TABLE IF NOT EXISTS remediations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    finding_id UUID NOT NULL REFERENCES assessment_findings(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    priority VARCHAR(50) DEFAULT 'HIGH' NOT NULL CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    recommended_action TEXT NOT NULL,
    owner VARCHAR(255) DEFAULT '',
    status VARCHAR(50) DEFAULT 'OPEN' NOT NULL CHECK (status IN ('OPEN', 'IN_PROGRESS', 'READY_FOR_RETEST', 'RESOLVED', 'WONT_FIX', 'ACCEPTED_RISK')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. Retests Table
CREATE TABLE IF NOT EXISTS assessment_retests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    finding_id UUID NOT NULL REFERENCES assessment_findings(id) ON DELETE CASCADE,
    test_run_id UUID REFERENCES test_runs(id) ON DELETE SET NULL,
    previous_result VARCHAR(50) NOT NULL,
    retest_result VARCHAR(50) NOT NULL CHECK (retest_result IN ('PASS', 'FAIL', 'INCONCLUSIVE')),
    original_evidence_id VARCHAR(100),
    retest_evidence_id VARCHAR(100),
    behavior_change TEXT DEFAULT '',
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. Security Reports Table
CREATE TABLE IF NOT EXISTS security_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    methodology_version VARCHAR(20) DEFAULT 'v0.1' NOT NULL,
    risk_model_version VARCHAR(20) DEFAULT 'v0.1' NOT NULL,
    report_hash VARCHAR(64) NOT NULL,
    content JSONB NOT NULL,
    generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for tenant isolation and query performance
CREATE INDEX IF NOT EXISTS idx_assessments_org_project ON assessments(organization_id, project_id);
CREATE INDEX IF NOT EXISTS idx_findings_assessment ON assessment_findings(assessment_id);
CREATE INDEX IF NOT EXISTS idx_remediations_finding ON remediations(finding_id);
CREATE INDEX IF NOT EXISTS idx_reports_assessment ON security_reports(assessment_id);
