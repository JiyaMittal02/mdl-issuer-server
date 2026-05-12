import express from 'express';

import { buildMdlCredential } from '../services/mdl.js';
import { signCredentialJwt } from '../services/signer.js';
import { getAccessTokenSession } from '../services/sessionStore.js';
import { saveIssuedCredential } from '../storage/issuedStore.js';

const router = express.Router();

// POST /credential
// Issues a mock mDL for a hardcoded user.
router.post('/credential', async (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null;
  if (!token) {
    return res.status(401).json({ error: 'invalid_token', error_description: 'Missing Bearer token' });
  }

  const session = getAccessTokenSession(token);
  if (!session) {
    return res.status(401).json({ error: 'invalid_token', error_description: 'Unknown/expired access token' });
  }

  // Hardcoded user as requested
  const mdl = buildMdlCredential({
    name: 'Jiya Sharma',
    licenceNumber: 'DL-12345'
  });

  const issuer = process.env.ISSUER || process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  const jwt = await signCredentialJwt({ issuer, mdl });

  await saveIssuedCredential({
    issued_at: new Date().toISOString(),
    issuer,
    subject: { name: 'Jiya Sharma', licenceNumber: 'DL-12345' },
    credential_format: 'jwt_vc_json',
    credential_jwt: jwt
  });

  res.json({
    format: 'jwt_vc_json',
    credential: jwt
  });
});

export default router;
