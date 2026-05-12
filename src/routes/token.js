import express from 'express';
import { v4 as uuidv4 } from 'uuid';

import { consumePreAuthCode, saveAccessToken } from '../services/sessionStore.js';

const router = express.Router();

// POST /token
// Implements a simplified pre-authorized code exchange.
router.post('/token', (req, res) => {
  const grantType = req.body?.grant_type;
  const preAuthCode = req.body?.['pre-authorized_code'];

  if (grantType !== 'urn:ietf:params:oauth:grant-type:pre-authorized_code') {
    return res.status(400).json({ error: 'unsupported_grant_type' });
  }
  if (!preAuthCode) {
    return res.status(400).json({ error: 'invalid_request', error_description: 'Missing pre-authorized_code' });
  }

  const ok = consumePreAuthCode(preAuthCode);
  if (!ok) {
    return res.status(400).json({ error: 'invalid_grant', error_description: 'Unknown/consumed pre-authorized_code' });
  }

  const accessToken = uuidv4();
  const cNonce = uuidv4();
  saveAccessToken(accessToken, { c_nonce: cNonce });

  res.json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 600,
    c_nonce: cNonce,
    c_nonce_expires_in: 600
  });
});

export default router;
