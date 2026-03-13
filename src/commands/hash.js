import fs from 'fs';
import crypto from 'crypto';
import { pipeline } from 'stream/promises';
import { resolvePath, validateFileExists, validateIsFile } from '../utils/pathResolver.js';
import path from 'path';

export async function hash(currentDir, inputPath, algorithm = 'sha256', save = false) {
  const resolvedInput = resolvePath(currentDir, inputPath);

  if (!validateFileExists(resolvedInput) || !validateIsFile(resolvedInput)) {
    return false;
  }

  const supportedAlgorithms = ['sha256', 'md5', 'sha512'];
  if (!supportedAlgorithms.includes(algorithm)) {
    return false;
  }

  const hash = crypto.createHash(algorithm);

  try {
    await pipeline(
      fs.createReadStream(resolvedInput),
      hash
    );

    const fileHash = hash.digest('hex');
    console.log(`${algorithm}: ${fileHash}`);

    if (save) {
      const hashFilePath = `${resolvedInput}.${algorithm}`;
      await fs.promises.writeFile(hashFilePath, fileHash);
    }

    return true;
  } catch {
    return false;
  }
}