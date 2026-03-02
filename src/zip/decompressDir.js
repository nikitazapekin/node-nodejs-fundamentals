import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const decompressDir = async () => {
  const workspacePath = path.join(__dirname, '../../workspace');
  const compressedPath = path.join(workspacePath, 'compressed');
  const decompressedPath = path.join(workspacePath, 'decompressed');
  const archivePath = path.join(compressedPath, 'archive.br');

  try {
    await fs.promises.access(compressedPath);
    await fs.promises.access(archivePath);
  } catch {
    throw new Error('FS operation failed');
  }

  await fs.promises.mkdir(decompressedPath, { recursive: true });

  const readStream = createReadStream(archivePath);
  
  // Read header
  const headerLengthBuffer = await new Promise((resolve, reject) => {
    const buffer = Buffer.alloc(10);
    let bytesRead = 0;
    
    readStream.on('readable', function() {
      while (bytesRead < 10) {
        const chunk = this.read(10 - bytesRead);
        if (!chunk) return;
        chunk.copy(buffer, bytesRead);
        bytesRead += chunk.length;
      }
      resolve(buffer);
    }).on('error', reject);
  });

  const headerLength = parseInt(headerLengthBuffer.toString().trim());
  const headerBuffer = await new Promise((resolve, reject) => {
    const buffer = Buffer.alloc(headerLength);
    let bytesRead = 0;
    
    readStream.on('readable', function() {
      while (bytesRead < headerLength) {
        const chunk = this.read(headerLength - bytesRead);
        if (!chunk) return;
        chunk.copy(buffer, bytesRead);
        bytesRead += chunk.length;
      }
      resolve(buffer);
    }).on('error', reject);
  });

  const entries = JSON.parse(headerBuffer.toString());
  const brotli = zlib.createBrotliDecompress();

  // Decompress and write files
  for (const relativePath of entries) {
    const filePath = path.join(decompressedPath, relativePath);
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    
    const writeStream = createWriteStream(filePath);
    const decompressStream = zlib.createBrotliDecompress();
    
    await new Promise((resolve, reject) => {
      readStream.pipe(decompressStream).pipe(writeStream)
        .on('finish', resolve)
        .on('error', reject);
    });
  }
};