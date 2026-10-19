import { describe, it, expect, beforeEach } from 'vitest';
import { hashPassword, verifyPassword, AdminRateLimiter } from '../../src/main/config';

describe('Admin Security: PBKDF2 Password Hashing', () => {
  it('hashes passwords with a unique 64-character hex salt', () => {
    const res1 = hashPassword('AdminSecret123');
    const res2 = hashPassword('AdminSecret123');

    expect(res1.salt).toBeDefined();
    expect(res1.salt.length).toBe(64); // 32 bytes in hex
    expect(res1.hash.length).toBe(128); // 64 bytes in hex
    // Distinct salts generate distinct hashes even for same password
    expect(res1.salt).not.toBe(res2.salt);
    expect(res1.hash).not.toBe(res2.hash);
  });

  it('verifies correct password against stored hash and salt', () => {
    const { hash, salt } = hashPassword('SuperSecretPin99');
    expect(verifyPassword('SuperSecretPin99', hash, salt)).toBe(true);
    expect(verifyPassword('WrongPassword', hash, salt)).toBe(false);
    expect(verifyPassword('', hash, salt)).toBe(false);
  });
});

describe('Admin Security: Rate Limiter & Lockout', () => {
  let rateLimiter: AdminRateLimiter;

  beforeEach(() => {
    rateLimiter = new AdminRateLimiter();
  });

  it('allows valid attempt and resets counter', () => {
    const res = rateLimiter.recordAttempt(true);
    expect(res.success).toBe(true);
    expect(rateLimiter.canAttempt().allowed).toBe(true);
  });

  it('tracks remaining attempts and triggers 30s lockout after 5 failures', () => {
    // 4 failures
    for (let i = 1; i <= 4; i++) {
      const res = rateLimiter.recordAttempt(false);
      expect(res.success).toBe(false);
      expect(res.remainingAttempts).toBe(5 - i);
    }

    // 5th failure -> triggers lockout
    const fifth = rateLimiter.recordAttempt(false);
    expect(fifth.success).toBe(false);
    expect(fifth.remainingAttempts).toBe(0);
    expect(fifth.lockoutRemainingMs).toBeGreaterThan(0);
    expect(fifth.error).toContain('locked for 30 seconds');

    // 6th attempt while locked
    const sixth = rateLimiter.recordAttempt(true);
    expect(sixth.success).toBe(false);
    expect(sixth.error).toContain('Too many failed attempts');
  });

  it('resets correctly', () => {
    rateLimiter.recordAttempt(false);
    rateLimiter.recordAttempt(false);
    rateLimiter.reset();
    expect(rateLimiter.canAttempt().allowed).toBe(true);
  });
});
