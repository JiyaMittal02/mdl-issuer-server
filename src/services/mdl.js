import { v4 as uuidv4 } from 'uuid';

// Builds a mock mDL JSON structure (simplified, not ISO-compliant)
export function buildMdlCredential({ name, licenceNumber }) {
  return {
    id: `urn:uuid:${uuidv4()}`,
    type: ['mDL'],
    issuer_country: 'IN',
    family_name: name.split(' ').slice(-1)[0],
    given_name: name.split(' ').slice(0, -1).join(' ') || name,
    licence_number: licenceNumber,
    issue_date: new Date().toISOString().slice(0, 10),
    expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  };
}
