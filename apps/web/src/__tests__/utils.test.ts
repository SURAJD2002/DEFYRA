import { describe, it, expect } from 'vitest';
import { sanitizeInput, calculateRiskScore } from '../lib/utils';

describe('Utility Functions', () => {
  it('sanitizes dangerous HTML brackets from user inputs', () => {
    const raw = '<script>alert("xss")</script>Hello & welcome!';
    const cleaned = sanitizeInput(raw);
    expect(cleaned).not.toContain('<');
    expect(cleaned).not.toContain('>');
    expect(cleaned).toBe('scriptalert("xss")/scriptHello & welcome!');
  });

  it('calculates risk score based on severity and blast radius accurately', () => {
    const criticalScore = calculateRiskScore('CRITICAL', 0.9, 0.9);
    expect(criticalScore).toBeGreaterThanOrEqual(9.0);
    expect(criticalScore).toBeLessThanOrEqual(10.0);

    const lowScore = calculateRiskScore('LOW', 0.2, 0.2);
    expect(lowScore).toBeLessThan(5.0);
  });
});
