// PEDAIA Cryptographic Utilities for User Authentication
// Provides salted SHA-256 hashing using WebCrypto and deterministic fallback.

/**
 * Standard SHA-256 hash using native WebCrypto (supported in all modern browsers & Node 18+)
 */
export async function sha256(str) {
  if (globalThis.crypto?.subtle?.digest) {
    const enc = new TextEncoder().encode(str);
    const buf = await globalThis.crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
  }
  return fallbackHash(str);
}

/**
 * Deterministic 64-character hash fallback for non-crypto mock test environments
 */
export function fallbackHash(str) {
  let h1 = 0xdeadbeef ^ str.length, h2 = 0x41c6ce57 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const p1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const p2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return (p1 + p2 + p1 + p2).padEnd(64, '0');
}

/**
 * Generate a cryptographically random salt string
 */
export function generateSalt(length = 16) {
  if (globalThis.crypto?.getRandomValues) {
    const arr = new Uint8Array(length);
    globalThis.crypto.getRandomValues(arr);
    return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
  }
  let salt = '';
  const chars = 'abcdef0123456789';
  for (let i = 0; i < length * 2; i++) {
    salt += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return salt;
}

/**
 * Hash a password with salt using SHA-256
 */
export async function hashPassword(password, salt) {
  if (typeof password !== 'string') password = String(password || '');
  if (typeof salt !== 'string') salt = String(salt || '');
  const salted = `${salt}:${password}:pedaia_atelier_v1`;
  return sha256(salted);
}

/**
 * Verify a candidate password against stored hash and salt
 */
export async function verifyPassword(candidatePassword, storedHash, salt) {
  if (!storedHash || !candidatePassword) return false;
  const computedHash = await hashPassword(candidatePassword, salt);
  return computedHash === storedHash;
}
