import fs from 'fs';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';
import { resolvePath, validateFileExists, validateIsFile } from '../utils/pathResolver.js';

export async function count(currentDir, inputPath) {
  const resolvedInput = resolvePath(currentDir, inputPath);

  if (!validateFileExists(resolvedInput) || !validateIsFile(resolvedInput)) {
    return false;
  }

  let lines = 0;
  let words = 0;
  let chars = 0;
  let inWord = false;

  const countTransform = new Transform({
    transform(chunk, encoding, callback) {
      const text = chunk.toString();
      chars += text.length;

      for (let i = 0; i < text.length; i++) {
        const c = text[i];
       
        if (c === '\n') {
          lines++;
        }
        
        const isWhitespace = c === ' ' || c === '\t' || c === '\n' || c === '\r';
        
        if (!isWhitespace && !inWord) {
       
          words++;
          inWord = true;
        } else if (isWhitespace && inWord) {
      
          inWord = false;
        }
      }

      callback();
    },

    flush(callback) {
      
      if (chars > 0 && lines === 0) {
        lines = 1;
      }
     
      
      callback();
    }
  });

  try {
    await pipeline(
      fs.createReadStream(resolvedInput),
      countTransform
    );

    console.log(`Lines: ${lines}`);
    console.log(`Words: ${words}`);
    console.log(`Characters: ${chars}`);
    return true;
  } catch (error) {
    console.error('Error in count:', error.message);
    return false;
  }
}