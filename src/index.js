import express from 'express';
import dotenv from 'dotenv';

import metadataRoute from './routes/metadata.js';
import offerRoute from './routes/offer.js';
import tokenRoute from './routes/token.js';
import credentialRoute from './routes/credential.js';

dotenv.config();

const app = express();
app.use(express.json({ limit: '1mb' }));

// Log all requests to console
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });
  next();
});
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true })); // ← add this
app.use('/', metadataRoute);
app.use('/', offerRoute);
app.use('/', tokenRoute);
app.use('/', credentialRoute);

app.get('/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 3000;
const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;

app.listen(port, '0.0.0.0', () => {
  console.log(`mDL OID4VCI issuer listening on ${port}`);
  console.log(`Open offer page: ${baseUrl}/offer`);
});
