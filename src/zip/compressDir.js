import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { createGzip } from 'zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function* walkDir(dir, baseDir) {
  const files = await fs.promises.readdir(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    const relativePath = path.relative(baseDir, fullPath);
    
    if (file.isDirectory()) {
      yield* walkDir(fullPath, baseDir);
    } else {
      yield { fullPath, relativePath };
    }
  }
}

export const compressDir = async () => {
  const workspacePath = path.join(__dirname, '../../workspace');
  const toCompressPath = path.join(workspacePath, 'toCompress');
  const compressedPath = path.join(workspacePath, 'compressed');

  try {
    await fs.promises.access(toCompressPath);
  } catch {
    throw new Error('FS operation failed');
  }

  await fs.promises.mkdir(compressedPath, { recursive: true });

  const archivePath = path.join(compressedPath, 'archive.br');
  const writeStream = createWriteStream(archivePath);
  const brotli = zlib.createBrotliCompress();

  const entries = [];
  for await (const entry of walkDir(toCompressPath, toCompressPath)) {
    entries.push(entry);
  }

  // Write header with file list
  const header = JSON.stringify(entries.map(e => e.relativePath));
  writeStream.write(Buffer.from(header.length.toString().padStart(10, '0')));
  writeStream.write(Buffer.from(header));

  // Compress and write files
  for (const entry of entries) {
    const fileStream = createReadStream(entry.fullPath);
    const compressedStream = fileStream.pipe(zlib.createBrotliCompress());
    
    for await (const chunk of compressedStream) {
      writeStream.write(chunk);
    }
  }

  writeStream.end();
};