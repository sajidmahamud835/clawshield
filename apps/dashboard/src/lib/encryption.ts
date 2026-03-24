/**
 * Derives a strong AES-GCM 256-bit CryptoKey from the provided hardware JWT string.
 * Uses PBKDF2 with a fixed salt (since this encrypts local config only on this specific device).
 */
async function deriveKey(jwt: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(jwt),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('clawshield-local-salt-01'), // Bound to local device only
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a string (e.g., API config) using the hardware JWT.
 */
export async function encryptData(plaintext: string, jwt: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await deriveKey(jwt);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext)
  );

  const out = new Uint8Array(iv.length + cipher.byteLength);
  out.set(iv, 0);
  out.set(new Uint8Array(cipher), iv.length);

  return Buffer.from(out).toString('base64');
}

/**
 * Decrypts data using the hardware JWT.
 */
export async function decryptData(cipherTextBase64: string, jwt: string): Promise<string> {
  const key = await deriveKey(jwt);
  const data = Buffer.from(cipherTextBase64, 'base64');
  
  const iv = data.slice(0, 12);
  const cipher = data.slice(12);

  const plainBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    cipher
  );

  return new TextDecoder().decode(plainBuffer);
}
