import fs from 'fs';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { Transform, pipeline } from 'stream';
import { once } from 'events';

async function split() {
  
  const linesIndex = process.argv.indexOf('--lines');
  let linesPerChunk = 10;

  if (linesIndex !== -1 && process.argv[linesIndex + 1]) {
    linesPerChunk = parseInt(process.argv[linesIndex + 1]) || 10;
  }

  const sourcePath = path.join(process.cwd(), 'source.txt');
  let chunkNumber = 1;
  let lineCount = 0;
  let currentChunkStream = null;
 
  function createChunkStream() {
    const chunkPath = path.join(process.cwd(), `chunk_${chunkNumber}.txt`);
    return createWriteStream(chunkPath);
  }
 
  currentChunkStream = createChunkStream();

  const splitter = new Transform({
    transform(chunk, encoding, callback) {
      const data = chunk.toString();
      const lines = data.split('\n');

      for (const line of lines) {
        if (lineCount >= linesPerChunk) {
     
          currentChunkStream.end();
          chunkNumber++;
          currentChunkStream = createChunkStream();
          lineCount = 0;
        }

        currentChunkStream.write(line + '\n');
        lineCount++;
      }

      callback();
    },

    flush(callback) {
      if (currentChunkStream) {
        currentChunkStream.end();
      }
      callback();
    }
  });

  const readStream = createReadStream(sourcePath);

  try {
    await pipeline(readStream, splitter);
  } catch (error) {
    console.error('Pipeline failed:', error);
    process.exit(1);
  }
}

await split();