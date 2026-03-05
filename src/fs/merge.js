import fs from 'fs/promises';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

async function merge() {
  try {
    const partsPath = path.join(process.cwd(), 'workspace', 'parts');
    const mergedPath = path.join(process.cwd(), 'workspace', 'merged.txt');
 
    try {
      await fs.access(partsPath);
    } catch {
      throw new Error('FS operation failed');
    }
 
    let filesToMerge = [];
    const filesArgIndex = process.argv.indexOf('--files');

    if (filesArgIndex !== -1 && process.argv[filesArgIndex + 1]) {
     
      const fileList = process.argv[filesArgIndex + 1].split(',');
      
      for (const file of fileList) {
        const filePath = path.join(partsPath, file.trim());
        try {
          await fs.access(filePath);
          filesToMerge.push(filePath);
        } catch {
          throw new Error('FS operation failed');
        }
      }
    } else {
      
      const files = await fs.readdir(partsPath);
      filesToMerge = files
        .filter(file => file.endsWith('.txt'))
        .sort()
        .map(file => path.join(partsPath, file));
    }

    if (filesToMerge.length === 0) {
      throw new Error('FS operation failed');
    }
 
    const writeStream = createWriteStream(mergedPath);

    for (const file of filesToMerge) {
      const readStream = createReadStream(file);
      await pipeline(readStream, writeStream, { end: false });
    }

    writeStream.end();

  } catch (error) {
    if (error.message === 'FS operation failed') {
      throw error;
    }
    throw new Error('FS operation failed');
  }
}

await merge();