# DEFYRA Security Reporting & Report Integrity

---

## 1. Structure of Customer Security Report

Each generated report contains:
1. **Executive Summary**: High-level posture, overall risk score, critical/high vulnerability count.
2. **Assessment Scope**: Explicitly cataloged assets, environment bounds, and test window.
3. **Methodology**: Explanation of deterministic DAG probes and RiskModel v0.1.
4. **Key Findings**: Table of confirmed findings with severity and current status.
5. **Detailed Findings**: In-depth attack scenario, affected component, and recommendation.
6. **Remediation & Retest History**: Verified engineering fixes and retest results.
7. **Limitations & Boundaries**: Declarations of tested vs. out-of-scope boundaries.

---

## 2. Report Content Integrity

- Structured report content is canonicalized into a deterministic JSON string.
- Computed using standard **SHA-256**.
- **Important**: SHA-256 verifies point-in-time content integrity against tampering; it does not claim legal chain of custody.
