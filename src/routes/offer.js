import express from 'express';
import qrcode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { savePreAuthCode } from '../services/sessionStore.js';

const router = express.Router();

// GET /offer
// Shows a QR code page with a credential offer
router.get('/offer', async (req, res) => {
  const issuer = process.env.ISSUER || process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

  // Generate a pre-authorized code
  const preAuthCode = uuidv4();
  savePreAuthCode(preAuthCode);

  // Build the credential offer object
  const credentialOffer = {
    credential_issuer: issuer,
    credential_configuration_ids: ['mdl_iso18013_5'],
    grants: {
      'urn:ietf:params:oauth:grant-type:pre-authorized_code': {
        'pre-authorized_code': preAuthCode,
        user_pin_required: false
      }
    }
  };

  // Build the offer URI
  const offerJson = JSON.stringify(credentialOffer);
  const offerUri = `openid-credential-offer://?credential_offer=${encodeURIComponent(offerJson)}`;

  // Generate QR code as base64 image
  const qrDataUrl = await qrcode.toDataURL(offerUri, {
    width: 300,
    margin: 2,
    color: {
      dark: '#1B2B4B',
      light: '#FFFFFF'
    }
  });

  // Return HTML page with QR code
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>mDL Credential Offer</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: #1B2B4B;
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
        }
        h1 { color: #FFD700; }
        .card {
          background: #2C3E6B;
          padding: 32px;
          border-radius: 16px;
          text-align: center;
        }
        img {
          border-radius: 8px;
          display: block;
          margin: 16px auto;
        }
        .label {
          color: #FFD700;
          font-size: 14px;
          margin-top: 16px;
        }
        .code {
          font-size: 11px;
          color: rgba(255,255,255,0.5);
          word-break: break-all;
          max-width: 300px;
          margin-top: 8px;
        }
        a {
          color: #FFD700;
          margin-top: 16px;
          display: block;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>mDL Credential Offer</h1>
        <p>Scan with your EUDI Wallet app</p>
        <img src="${qrDataUrl}" width="300" height="300" />
        <p class="label">Or tap the link below on your phone:</p>
        <a href="${offerUri}">Open in Wallet App</a>
        <p class="code">${offerUri.substring(0, 100)}...</p>
      </div>
    </body>
    </html>
  `);
});

export default router;