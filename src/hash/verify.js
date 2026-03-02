import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { createReadStream } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const calculateHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
};

export const verify = async () => {
  const workspacePath = path.join(__dirname, '../../workspace');
  const checksumsPath = path.join(workspacePath, 'checksums.json');

  try {
    await fs.promises.access(checksumsPath);
  } catch {
    throw new Error('FS operation failed');
  }

  const checksumsContent = await fs.promises.readFile(checksumsPath, 'utf-8');
  const checksums = JSON.parse(checksumsContent);

  for (const [file, expectedHash] of Object.entries(checksums)) {
    const filePath = path.join(workspacePath, file);
    
    try {
      const actualHash = await calculateHash(filePath);
      console.log(`${file} — ${actualHash === expectedHash ? 'OK' : 'FAIL'}`);
    } catch {
      console.log(`${file} — FAIL`);
    }
  }
};