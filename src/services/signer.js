import { generateKeyPairSync } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SignJWT, importPKCS8, importSPKI, exportJWK } from 'jose';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keysDir = path.resolve(__dirname, '../../keys');
const privPath = path.join(keysDir, 'issuer-private.pem');
const pubPath = path.join(keysDir, 'issuer-public.pem');

async function ensureKeys() {
  if (existsSync(privPath) && existsSync(pubPath)) return;
  await mkdir(keysDir, { recursive: true });

  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  await writeFile(privPath, privateKey, 'utf8');
  await writeFile(pubPath, publicKey, 'utf8');
  console.log(`Generated RSA keypair in ${keysDir}`);
}

async function loadPrivateKey() {
  await ensureKeys();
  const pem = await readFile(privPath, 'utf8');
  return importPKCS8(pem, 'RS256');
}

export async function loadPublicKey() {
  await ensureKeys();
  const pem = await readFile(pubPath, 'utf8');
  return importSPKI(pem, 'RS256');
}

export async function getIssuerJwks() {
  const publicKey = await loadPublicKey();
  const jwk = await exportJWK(publicKey);
  jwk.use = 'sig';
  jwk.alg = 'RS256';
  jwk.kid = 'issuer-key-1';
  return { keys: [jwk] };
}

// Signs the credential using a private key (JWT)
export async function signCredentialJwt({ issuer, mdl }) {
  const key = await loadPrivateKey();

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: issuer,
    sub: 'urn:example:holder',
    iat: now,
    exp: now + 10 * 60,
    jti: uuidv4(),
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', 'mDL'],
      credentialSubject: mdl
    }
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT', kid: 'issuer-key-1' })
    .sign(key);
}
