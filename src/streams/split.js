import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createReadStream, createWriteStream } from 'fs';
import { Transform } from 'stream';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const split = () => {
  const linesArg = process.argv.find(arg => arg.startsWith('--lines='));
  const maxLines = linesArg ? parseInt(linesArg.split('=')[1]) : 10;

  const sourcePath = path.join(__dirname, '../../workspace/source.txt');
  const readStream = createReadStream(sourcePath, { encoding: 'utf-8' });

  let chunkNumber = 1;
  let linesBuffer = [];
  let writeStream = null;

  const lineSplitter = new Transform({
    transform(chunk, encoding, callback) {
      const lines = chunk.toString().split(/\r?\n/);
      
      for (const line of lines) {
        if (line.length === 0) continue;

        linesBuffer.push(line);

        if (linesBuffer.length >= maxLines) {
          if (writeStream) {
            writeStream.end();
          }
          
          const chunkPath = path.join(__dirname, `../../workspace/chunk_${chunkNumber}.txt`);
          writeStream = createWriteStream(chunkPath);
          writeStream.write(linesBuffer.join('\n'));
          
          linesBuffer = [];
          chunkNumber++;
        }
      }
      
      callback();
    },

    flush(callback) {
      if (linesBuffer.length > 0) {
        const chunkPath = path.join(__dirname, `../../workspace/chunk_${chunkNumber}.txt`);
        writeStream = createWriteStream(chunkPath);
        writeStream.write(linesBuffer.join('\n'));
        writeStream.end();
      }
      callback();
    }
  });

  readStream.pipe(lineSplitter);
};