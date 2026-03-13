import fs from 'fs';
import crypto from 'crypto';
import { pipeline } from 'stream/promises';
import { resolvePath, validateFileExists, validateIsFile } from '../utils/pathResolver.js';
import path from 'path';

export async function hash(currentDir, inputPath, algorithm = 'sha256', save = false) {
  const resolvedInput = resolvePath(currentDir, inputPath);

  console.log('Hash command - input:', resolvedInput);
  console.log('Algorithm:', algorithm);
  console.log('Save flag:', save);

  if (!validateFileExists(resolvedInput) || !validateIsFile(resolvedInput)) {
    console.log('File does not exist or is not a file');
    return false;
  }

  const supportedAlgorithms = ['sha256', 'md5', 'sha512'];
  if (!supportedAlgorithms.includes(algorithm)) {
    console.log('Unsupported algorithm:', algorithm);
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
      console.log('Saving hash to:', hashFilePath);
      await fs.promises.writeFile(hashFilePath, fileHash);
      console.log('Hash saved successfully');
    }

    return true;
  } catch (error) {
    console.error('Error in hash command:', error.message);
    return false;
  }
}