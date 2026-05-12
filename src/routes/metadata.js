import express from 'express';

const router = express.Router();

// GET /.well-known/openid-credential-issuer
router.get('/.well-known/openid-credential-issuer', (req, res) => {
  const issuer = process.env.ISSUER || process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

  // Minimal OID4VCI issuer metadata (simplified)
  res.json({
    credential_issuer: issuer,
    token_endpoint: `${issuer}/token`,
    credential_endpoint: `${issuer}/credential`,
    credential_configurations_supported: {
      mdl_iso18013_5: {
        format: 'jwt_vc_json',
        scope: 'mdl',
        cryptographic_binding_methods_supported: ['did'],
        credential_signing_alg_values_supported: ['RS256'],
        credential_definition: {
          type: ['mDL'],
          name: 'Mobile Driving Licence (Mock)'
        }
      }
    }
  });
});

export default router;
