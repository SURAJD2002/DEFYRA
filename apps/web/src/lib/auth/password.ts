import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/**
 * Securely hashes a password using scrypt with a unique cryptographically random salt.
 * Formatted as: salt:derivedKeyHex
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH).toString('hex');
  const derivedKey = scryptSync(password, salt, KEY_LENGTH);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verifies a plaintext password against an scrypt hash in constant time to prevent timing attacks.
 */
export async function verifyPassword(password: string, combinedHash: string): Promise<boolean> {
  try {
    const parts = combinedHash.split(':');
    if (parts.length !== 2) return false;

    const [salt, originalHashHex] = parts;
    const derivedKey = scryptSync(password, salt, KEY_LENGTH);
    const originalHash = Buffer.from(originalHashHex, 'hex');

    if (derivedKey.length !== originalHash.length) return false;

    return timingSafeEqual(derivedKey, originalHash);
  } catch {
    return false;
  }
}
