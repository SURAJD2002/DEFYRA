-- 004_comprehensive_reporting_system.sql
-- DEFYRA Production Security Assessment Reporting System, Versioning, and Integrity Seals

-- 1. Enhanced Reports Table with Lifecycle & Cryptographic Immutability
CREATE TABLE IF NOT EXISTS security_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    report_version INTEGER DEFAULT 1 NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT' NOT NULL CHECK (status IN ('DRAFT', 'GENERATING', 'READY_FOR_REVIEW', 'APPROVED', 'SEALED', 'DELIVERED', 'SUPERSEDED')),
    title VARCHAR(255) NOT NULL,
    classification VARCHAR(100) DEFAULT 'CONFIDENTIAL' NOT NULL,
    methodology_version VARCHAR(20) DEFAULT 'v0.1' NOT NULL,
    risk_model_version VARCHAR(20) DEFAULT 'v0.1' NOT NULL,
    canonical_payload_hash VARCHAR(64) NOT NULL,
    sha256_algorithm VARCHAR(20) DEFAULT 'SHA-256' NOT NULL,
    content JSONB NOT NULL,
    total_findings INTEGER DEFAULT 0 NOT NULL,
    critical_findings INTEGER DEFAULT 0 NOT NULL,
    high_findings INTEGER DEFAULT 0 NOT NULL,
    medium_findings INTEGER DEFAULT 0 NOT NULL,
    low_findings INTEGER DEFAULT 0 NOT NULL,
    informational_findings INTEGER DEFAULT 0 NOT NULL,
    open_findings INTEGER DEFAULT 0 NOT NULL,
    resolved_findings INTEGER DEFAULT 0 NOT NULL,
    initial_risk_score NUMERIC(4,2) DEFAULT 0.0 NOT NULL,
    residual_risk_score NUMERIC(4,2) DEFAULT 0.0 NOT NULL,
    page_count INTEGER DEFAULT 0,
    generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    sealed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    sealed_at TIMESTAMP WITH TIME ZONE
);

-- 2. Report Versions Table (Immutable Historical Archives)
CREATE TABLE IF NOT EXISTS report_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    report_id UUID NOT NULL REFERENCES security_reports(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    report_hash VARCHAR(64) NOT NULL,
    canonical_payload JSONB NOT NULL,
    change_summary TEXT DEFAULT '',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (report_id, version_number)
);

-- 3. Report Evidence Join & Integrity Archive Table
CREATE TABLE IF NOT EXISTS report_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    report_id UUID NOT NULL REFERENCES security_reports(id) ON DELETE CASCADE,
    evidence_id VARCHAR(100) NOT NULL,
    evidence_type VARCHAR(100) NOT NULL,
    test_run_id VARCHAR(100) NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    redacted_payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. Report Findings Snapshot Table (Historical Immutability)
CREATE TABLE IF NOT EXISTS report_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    report_id UUID NOT NULL REFERENCES security_reports(id) ON DELETE CASCADE,
    finding_id VARCHAR(100) NOT NULL,
    test_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    risk_score NUMERIC(4,2) NOT NULL,
    status_at_report_time VARCHAR(50) NOT NULL,
    remediation_status VARCHAR(50) DEFAULT 'NONE',
    retest_result VARCHAR(50) DEFAULT 'NONE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for Tenant Isolation, Version Resolution, and Fast Queries
CREATE INDEX IF NOT EXISTS idx_reports_org_id ON security_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_reports_assessment_id ON security_reports(assessment_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON security_reports(status);
CREATE INDEX IF NOT EXISTS idx_report_versions_report_id ON report_versions(report_id);
CREATE INDEX IF NOT EXISTS idx_report_evidence_report_id ON report_evidence(report_id);
CREATE INDEX IF NOT EXISTS idx_report_findings_report_id ON report_findings(report_id);
