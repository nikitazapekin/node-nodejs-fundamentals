import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { createReadStream } from 'fs';

async function calculateSHA256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

async function verify() {
  try {
    const checksumsPath = path.join(process.cwd(), 'checksums.json');

     
    try {
      await fs.access(checksumsPath);
    } catch {
      throw new Error('FS operation failed');
    }
 
    const checksumsData = await fs.readFile(checksumsPath, 'utf-8');
    const checksums = JSON.parse(checksumsData);
 
    for (const [fileName, expectedHash] of Object.entries(checksums)) {
      const filePath = path.join(process.cwd(), fileName);
      
      try {
        const actualHash = await calculateSHA256(filePath);
        console.log(`${fileName} — ${actualHash === expectedHash ? 'OK' : 'FAIL'}`);
      } catch {
        console.log(`${fileName} — FAIL`);
      }
    }

  } catch (error) {
    if (error.message === 'FS operation failed') {
      throw error;
    }
    throw new Error('FS operation failed');
  }
}

await verify();