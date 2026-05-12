import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storageDir = path.resolve(__dirname);
const issuedPath = path.join(storageDir, 'issued.json');

async function ensureIssuedFile() {
  await mkdir(storageDir, { recursive: true });
  if (!existsSync(issuedPath)) {
    await writeFile(issuedPath, JSON.stringify([], null, 2), 'utf8');
  }
}

export async function saveIssuedCredential(record) {
  await ensureIssuedFile();
  const raw = await readFile(issuedPath, 'utf8');
  const arr = JSON.parse(raw || '[]');
  arr.push(record);
  await writeFile(issuedPath, JSON.stringify(arr, null, 2), 'utf8');
}
