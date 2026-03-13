import fs from 'fs';
import crypto from 'crypto';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';
import { resolvePath, validateFileExists, validateIsFile } from '../utils/pathResolver.js';

export async function encrypt(currentDir, inputPath, outputPath, password) {
  const resolvedInput = resolvePath(currentDir, inputPath);
  const resolvedOutput = resolvePath(currentDir, outputPath);

  if (!validateFileExists(resolvedInput) || !validateIsFile(resolvedInput)) {
    return false;
  }
 
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
 
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
 
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
 
  const writeStream = fs.createWriteStream(resolvedOutput);
  writeStream.write(salt);
  writeStream.write(iv);

  const encryptTransform = new Transform({
    transform(chunk, encoding, callback) {
      const encrypted = cipher.update(chunk);
      this.push(encrypted);
      callback();
    },
    flush(callback) {
      try {
        const final = cipher.final();
        this.push(final);
        const authTag = cipher.getAuthTag();
        this.push(authTag);
        callback();
      } catch (err) {
        callback(err);
      }
    }
  });

  try {
    await pipeline(
      fs.createReadStream(resolvedInput),
      encryptTransform,
      writeStream
    );
    return true;
  } catch {
    return false;
  }
}