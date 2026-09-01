-- 002_test_runs_and_results.sql
-- Enhanced Test Run Execution, Findings, and Telemetry Storage for DEFYRA V0.1

ALTER TABLE test_runs 
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS environment VARCHAR(50) DEFAULT 'staging' NOT NULL,
    ADD COLUMN IF NOT EXISTS requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS request_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS error_code VARCHAR(100),
    ADD COLUMN IF NOT EXISTS error_message TEXT,
    ADD COLUMN IF NOT EXISTS duration_ms INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS observations JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS stage_results JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;

-- Index for tenant-scoped test run lookup
CREATE INDEX IF NOT EXISTS idx_test_runs_org_project ON test_runs(organization_id, project_id);
CREATE INDEX IF NOT EXISTS idx_test_runs_asset ON test_runs(asset_id);
CREATE INDEX IF NOT EXISTS idx_test_runs_status ON test_runs(status);
