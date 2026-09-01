import { describe, it, expect } from 'vitest';
import { contactSubmissionSchema } from '../lib/validation';

describe('Contact & Assessment Request Validation Schema', () => {
  const validPayload = {
    name: 'Sarah Connor',
    workEmail: 'sconnor@cyberdyne-defense.com',
    company: 'Cyberdyne Systems',
    role: 'Chief Security Officer',
    companySize: '51-200',
    aiSystemType: 'Autonomous Agentic Workflow (Multi-Tool)',
    scopeDescription: 'Evaluating agent tool execution and RAG context leak boundaries.',
    message: 'Looking to schedule validation testing for Q4 agent release.',
    noCredentialsAcknowledged: true,
  };

  it('accepts a valid assessment inquiry payload', () => {
    const result = contactSubmissionSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('rejects payload when noCredentialsAcknowledged is false', () => {
    const result = contactSubmissionSchema.safeParse({
      ...validPayload,
      noCredentialsAcknowledged: false,
    });
    expect(result.success).toBe(false);
  });

  it('detects and blocks OpenAI API key leaks in scope description', () => {
    const result = contactSubmissionSchema.safeParse({
      ...validPayload,
      scopeDescription: 'Please test our agent using key sk-abcdef12345678901234567890',
    });
    expect(result.success).toBe(false);
  });

  it('detects and blocks GitHub token leaks in message', () => {
    const result = contactSubmissionSchema.safeParse({
      ...validPayload,
      message: 'Here is repo access: ghp_123456789012345678901234567890123456',
    });
    expect(result.success).toBe(false);
  });

  it('detects and blocks AWS Access Key ID patterns', () => {
    const result = contactSubmissionSchema.safeParse({
      ...validPayload,
      scopeDescription: 'Target AWS bucket under AKIAIOSFODNN7EXAMPLE credentials',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email formats', () => {
    const result = contactSubmissionSchema.safeParse({
      ...validPayload,
      workEmail: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });
});
