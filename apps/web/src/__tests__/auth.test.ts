import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../lib/auth/password';
import { generateSessionToken, signSessionToken, verifySignedSessionToken } from '../lib/auth/session';

describe('Authentication Cryptography & Session Engine', () => {
  it('correctly hashes passwords and verifies valid password', async () => {
    const password = 'DefyraSecretPassword2026!';
    const hash = await hashPassword(password);

    expect(hash).toContain(':');
    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it('rejects incorrect passwords during verification', async () => {
    const password = 'DefyraSecretPassword2026!';
    const hash = await hashPassword(password);

    const isWrong = await verifyPassword('IncorrectPassword123!', hash);
    expect(isWrong).toBe(false);
  });

  it('signs session tokens and verifies authentic token signatures', () => {
    const token = generateSessionToken();
    const signed = signSessionToken(token);

    expect(signed).toContain('.');
    const verified = verifySignedSessionToken(signed);
    expect(verified).toBe(token);
  });

  it('rejects tampered session token signatures', () => {
    const token = generateSessionToken();
    const signed = signSessionToken(token);
    const tampered = signed.slice(0, -4) + 'abcd';

    const verified = verifySignedSessionToken(tampered);
    expect(verified).toBeNull();
  });
});
