import fs from 'fs';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';
import { resolvePath, validateFileExists, validateIsFile } from '../utils/pathResolver.js';

export async function csvToJson(currentDir, inputPath, outputPath) {
  const resolvedInput = resolvePath(currentDir, inputPath);
  const resolvedOutput = resolvePath(currentDir, outputPath);

  if (!validateFileExists(resolvedInput) || !validateIsFile(resolvedInput)) {
    return false;
  }

  let headers = [];
  let isFirstLine = true;

  const csvToJsonTransform = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      const lines = chunk.toString().split('\n');
      
      for (const line of lines) {
        if (line.trim() === '') continue;
        
        const values = line.split(',').map(v => v.trim());
        
        if (isFirstLine) {
          headers = values;
          isFirstLine = false;
          continue;
        }

        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });

        this.push(JSON.stringify(obj) + '\n');
      }
      callback();
    }
  });

  const writeStream = fs.createWriteStream(resolvedOutput);
  writeStream.write('[\n');

  let isFirstObject = true;
  const jsonArrayTransform = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      const objStr = chunk.toString().trim();
      if (objStr) {
        if (!isFirstObject) {
          this.push(',\n');
        }
        this.push(objStr);
        isFirstObject = false;
      }
      callback();
    }
  });

  try {
    await pipeline(
      fs.createReadStream(resolvedInput),
      csvToJsonTransform,
      jsonArrayTransform,
      writeStream
    );
    writeStream.write('\n]');
    return true;
  } catch {
    return false;
  }
}