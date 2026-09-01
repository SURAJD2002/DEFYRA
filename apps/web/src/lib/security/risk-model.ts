/**
 * DEFYRA RiskModel v0.1
 * Transparent, deterministic risk scoring methodology for AI Agent & System evaluations.
 */

import { Severity } from '@/types';

export interface RiskFactors {
  severity: Severity;
  confidence: number; // 0.0 to 1.0
  assetCriticality?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  autonomyLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
  dataSensitivity?: 'RESTRICTED' | 'CONFIDENTIAL' | 'INTERNAL' | 'PUBLIC';
}

export interface RiskEvaluationResult {
  riskScore: number; // 0.0 to 10.0
  riskModelVersion: 'v0.1';
  severity: Severity;
  factors: {
    baseSeverityScore: number;
    confidenceMultiplier: number;
    criticalityWeight: number;
    autonomyMultiplier: number;
  };
  explanation: string;
}

const SEVERITY_BASE_SCORES: Record<Severity, number> = {
  CRITICAL: 10.0,
  HIGH: 8.0,
  MEDIUM: 5.5,
  LOW: 2.5,
  INFORMATIONAL: 0.0,
};

const CRITICALITY_WEIGHTS = {
  CRITICAL: 1.0,
  HIGH: 0.9,
  MEDIUM: 0.75,
  LOW: 0.6,
};

const AUTONOMY_MULTIPLIERS = {
  HIGH: 1.0, // Agent has direct tool/execution access
  MEDIUM: 0.9, // Agent has semi-autonomous workflows
  LOW: 0.8, // Pure advisory / chat model
};

/**
 * Evaluates risk score using DEFYRA RiskModel v0.1.
 * Formula: BaseSeverity * Confidence * CriticalityWeight * AutonomyMultiplier (clamped 0.0 - 10.0)
 */
export function evaluateRiskModelV01(factors: RiskFactors): RiskEvaluationResult {
  const base = SEVERITY_BASE_SCORES[factors.severity] || 5.0;
  const conf = Math.max(0.1, Math.min(1.0, factors.confidence || 1.0));
  const critWeight = CRITICALITY_WEIGHTS[factors.assetCriticality || 'HIGH'];
  const autoMult = AUTONOMY_MULTIPLIERS[factors.autonomyLevel || 'HIGH'];

  const rawScore = base * conf * critWeight * autoMult;
  const roundedScore = Math.round(rawScore * 10) / 10;
  const finalScore = Math.max(0.0, Math.min(10.0, roundedScore));

  return {
    riskScore: finalScore,
    riskModelVersion: 'v0.1',
    severity: factors.severity,
    factors: {
      baseSeverityScore: base,
      confidenceMultiplier: conf,
      criticalityWeight: critWeight,
      autonomyMultiplier: autoMult,
    },
    explanation: `Calculated from Base Severity (${base}) * Confidence (${conf}) * Asset Criticality (${critWeight}) * Autonomy (${autoMult}).`,
  };
}
