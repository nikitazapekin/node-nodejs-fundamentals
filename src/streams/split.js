import fs from 'fs';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { Transform } from 'stream';

async function split() {
 
  const linesIndex = process.argv.indexOf('--lines');
  let linesPerChunk = 10;

  if (linesIndex !== -1 && process.argv[linesIndex + 1]) {
    linesPerChunk = parseInt(process.argv[linesIndex + 1]) || 10;
  }

  const sourcePath = path.join(process.cwd(), 'source.txt');
 
  try {
    await fs.promises.access(sourcePath);
  } catch {
    console.error('source.txt not found');
    process.exit(1);
  }

  let chunkNumber = 1;
  let lineCount = 0;
  let currentChunkStream = null;
 
  function createChunkStream() {
    const chunkPath = path.join(process.cwd(), `chunk_${chunkNumber}.txt`);
    console.log(`Создаю файл: chunk_${chunkNumber}.txt`);
    return createWriteStream(chunkPath);
  }
 
  currentChunkStream = createChunkStream();
 
  const splitter = new Transform({
    transform(chunk, encoding, callback) {
      const data = chunk.toString();
      const lines = data.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
         
        if (i === lines.length - 1 && line === '') {
          continue;
        }

        if (lineCount >= linesPerChunk) {
 
          currentChunkStream.end();
          chunkNumber++;
          currentChunkStream = createChunkStream();
          lineCount = 0;
        }

        currentChunkStream.write(line + (i < lines.length - 1 ? '\n' : ''));
        lineCount++;
      }

      callback();
    },

    flush(callback) {
     
      if (currentChunkStream) {
        currentChunkStream.end();
        console.log(`Готово! Создано ${chunkNumber} файлов.`);
      }
      callback();
    }
  });

 
  const readStream = createReadStream(sourcePath, { encoding: 'utf8' });

 
  readStream.on('error', (err) => {
    console.error('Ошибка чтения файла:', err);
    process.exit(1);
  });

  splitter.on('error', (err) => {
    console.error('Ошибка обработки:', err);
    process.exit(1);
  });

  
  readStream.pipe(splitter);
 
  return new Promise((resolve, reject) => {
    splitter.on('finish', resolve);
    splitter.on('error', reject);
  });
}

await split().catch(err => {
  console.error('Ошибка:', err);
  process.exit(1);
});