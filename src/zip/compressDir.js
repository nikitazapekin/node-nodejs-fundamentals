import fs from 'fs/promises';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import zlib from 'zlib';
import { createGzip } from 'zlib';
import archiver from 'archiver';
 

async function compressDir() {
  try {
    const toCompressPath = path.join(process.cwd(), 'workspace', 'toCompress');
    const compressedDir = path.join(process.cwd(), 'workspace', 'compressed');
    const archivePath = path.join(compressedDir, 'archive.br');
 
    try {
      await fs.access(toCompressPath);
    } catch {
      throw new Error('FS operation failed');
    }
 
    await fs.mkdir(compressedDir, { recursive: true });

  
    const brotli = zlib.createBrotliCompress();
    const output = createWriteStream(archivePath);
 
    async function getAllFiles(dir) {
      const files = await fs.readdir(dir, { withFileTypes: true });
      const results = [];

      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
          const subFiles = await getAllFiles(fullPath);
          results.push(...subFiles);
        } else {
          results.push(fullPath);
        }
      }

      return results;
    }

    const files = await getAllFiles(toCompressPath);
     
    const tempPath = path.join(compressedDir, 'temp.tar');
    const tempStream = createWriteStream(tempPath);

    for (const file of files) {
      const readStream = createReadStream(file);
      await pipeline(readStream, tempStream, { end: false });
    }
    tempStream.end();
 
    const readStream = createReadStream(tempPath);
    await pipeline(readStream, brotli, output);

 
    await fs.unlink(tempPath);

  } catch (error) {
    if (error.message === 'FS operation failed') {
      throw error;
    }
    throw new Error('FS operation failed');
  }
}

await compressDir();