import { describe, it, expect } from 'vitest';
import { checkRateLimit } from '../lib/rate-limiter';

describe('Rate Limiter', () => {
  it('allows requests within limit and throttles after threshold', () => {
    const testId = `test_ip_${Date.now()}`;
    const limit = 3;

    const req1 = checkRateLimit(testId, limit, 10000);
    expect(req1.success).toBe(true);
    expect(req1.remaining).toBe(2);

    const req2 = checkRateLimit(testId, limit, 10000);
    expect(req2.success).toBe(true);
    expect(req2.remaining).toBe(1);

    const req3 = checkRateLimit(testId, limit, 10000);
    expect(req3.success).toBe(true);
    expect(req3.remaining).toBe(0);

    // 4th request must be blocked
    const req4 = checkRateLimit(testId, limit, 10000);
    expect(req4.success).toBe(false);
    expect(req4.remaining).toBe(0);
    expect(req4.resetInSec).toBeGreaterThan(0);
  });
});
