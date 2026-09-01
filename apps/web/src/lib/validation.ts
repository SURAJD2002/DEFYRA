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
