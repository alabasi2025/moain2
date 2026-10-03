/**
 * Password/PIN hashing behind one interface (ADR-0012 P4).
 * Default: PBKDF2-SHA256 at the workerd cap (100k) + pepper. Hash strings carry their algorithm prefix
 * so a later switch to Argon2id-WASM upgrades transparently on next login.
 */
const ITER = 100_000;
const enc = new TextEncoder();

const toHex = (b: ArrayBuffer | Uint8Array): string => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
const fromHex = (h: string): Uint8Array => new Uint8Array((h.match(/.{2}/g) ?? []).map((x) => parseInt(x, 16)));

export function randomHex(bytes = 32): string {
  return toHex(crypto.getRandomValues(new Uint8Array(bytes)));
}

async function pbkdf2(secret: string, salt: Uint8Array, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
  return toHex(bits);
}

export async function hashSecret(secret: string, pepper: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${ITER}$${toHex(salt)}$${await pbkdf2(secret + pepper, salt, ITER)}`;
}

export async function verifySecret(secret: string, stored: string | null, pepper: string): Promise<boolean> {
  if (!stored) return false;
  const [alg, iter, saltHex, hash] = stored.split('$');
  if (alg !== 'pbkdf2' || !iter || !saltHex || !hash) return false;
  const got = await pbkdf2(secret + pepper, fromHex(saltHex), Number(iter));
  if (got.length !== hash.length) return false;
  let diff = 0;
  for (let i = 0; i < got.length; i++) diff |= got.charCodeAt(i) ^ hash.charCodeAt(i);
  return diff === 0;
}
