import fs from 'fs';
import crypto from 'crypto';
import { pipeline } from 'stream/promises';
import { resolvePath, validateFileExists, validateIsFile } from '../utils/pathResolver.js';

export async function hashCompare(currentDir, inputPath, hashFilePath, algorithm = 'sha256') {
  const resolvedInput = resolvePath(currentDir, inputPath);
  const resolvedHashFile = resolvePath(currentDir, hashFilePath);

  if (!validateFileExists(resolvedInput) || !validateIsFile(resolvedInput) ||
      !validateFileExists(resolvedHashFile) || !validateIsFile(resolvedHashFile)) {
    return null;
  }

  const supportedAlgorithms = ['sha256', 'md5', 'sha512'];
  if (!supportedAlgorithms.includes(algorithm)) {
    return null;
  }

  try {
   
    const expectedHash = (await fs.promises.readFile(resolvedHashFile, 'utf8')).trim().toLowerCase();
 
    const hash = crypto.createHash(algorithm);
    await pipeline(
      fs.createReadStream(resolvedInput),
      hash
    );
    const actualHash = hash.digest('hex').toLowerCase();

    return actualHash === expectedHash ? 'OK' : 'MISMATCH';
  } catch {
    return null;
  }
}