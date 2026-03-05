import fs from 'fs/promises';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import zlib from 'zlib';

async function decompressDir() {
  try {
    const compressedDir = path.join(process.cwd(), 'workspace', 'compressed');
    const archivePath = path.join(compressedDir, 'archive.br');
    const decompressedDir = path.join(process.cwd(), 'workspace', 'decompressed');

  
    try {
      await fs.access(compressedDir);
      await fs.access(archivePath);
    } catch {
      throw new Error('FS operation failed');
    }

   
    await fs.mkdir(decompressedDir, { recursive: true });
 
    const brotli = zlib.createBrotliDecompress();
    const readStream = createReadStream(archivePath);
    const tempPath = path.join(decompressedDir, 'temp.tar');
    const writeStream = createWriteStream(tempPath);

    await pipeline(readStream, brotli, writeStream);
 
    const tempContent = await fs.readFile(tempPath);
    await fs.writeFile(path.join(decompressedDir, 'extracted.dat'), tempContent);
 
    await fs.unlink(tempPath);

  } catch (error) {
    if (error.message === 'FS operation failed') {
      throw error;
    }
    throw new Error('FS operation failed');
  }
}

await decompressDir();