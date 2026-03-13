import fs from 'fs';
import crypto from 'crypto';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';
import { resolvePath, validateFileExists, validateIsFile } from '../utils/pathResolver.js';

export async function decrypt(currentDir, inputPath, outputPath, password) {
  const resolvedInput = resolvePath(currentDir, inputPath);
  const resolvedOutput = resolvePath(currentDir, outputPath);

  if (!validateFileExists(resolvedInput) || !validateIsFile(resolvedInput)) {
    return false;
  }

  try {
 
    const fileHandle = await fs.promises.open(resolvedInput, 'r');
    const fileSize = (await fileHandle.stat()).size;
    
    if (fileSize < 44) {  
      await fileHandle.close();
      return false;
    }

    
    const saltBuffer = Buffer.alloc(16);
    await fileHandle.read(saltBuffer, 0, 16, 0);
 
    const ivBuffer = Buffer.alloc(12);
    await fileHandle.read(ivBuffer, 0, 12, 16);

   
    const authTagBuffer = Buffer.alloc(16);
    await fileHandle.read(authTagBuffer, 0, 16, fileSize - 16);

    await fileHandle.close();
 
    const key = crypto.pbkdf2Sync(password, saltBuffer, 100000, 32, 'sha256');
 
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, ivBuffer);
    decipher.setAuthTag(authTagBuffer);
 
    const readStream = fs.createReadStream(resolvedInput, {
      start: 28,  
      end: fileSize - 17 
    });

    const writeStream = fs.createWriteStream(resolvedOutput);

    const decryptTransform = new Transform({
      transform(chunk, encoding, callback) {
        try {
          const decrypted = decipher.update(chunk);
          this.push(decrypted);
          callback();
        } catch (err) {
          callback(err);
        }
      },
      flush(callback) {
        try {
          const final = decipher.final();
          this.push(final);
          callback();
        } catch (err) {
          callback(err);
        }
      }
    });

    await pipeline(
      readStream,
      decryptTransform,
      writeStream
    );

    return true;
  } catch {
    return false;
  }
}