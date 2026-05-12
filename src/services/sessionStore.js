// In-memory store for pre-authorized codes and access tokens.
// This is intentionally simple for a demo issuer.

const preAuthCodes = new Set();
const accessTokens = new Map();

export function savePreAuthCode(code) {
  preAuthCodes.add(code);
}

export function consumePreAuthCode(code) {
  if (!preAuthCodes.has(code)) return false;
  preAuthCodes.delete(code);
  return true;
}

export function saveAccessToken(token, session) {
  accessTokens.set(token, { ...session, createdAt: Date.now() });
}

export function getAccessTokenSession(token) {
  return accessTokens.get(token) || null;
}
