 
import fs from 'fs';
import { resolvePath, validateFileExists, validateIsFile } from '../utils/pathResolver.js';
import readline from 'readline';

export async function csvToJson(currentDir, inputPath, outputPath) {
  console.log('Converting CSV to JSON...');
  console.log('Input:', inputPath);
  console.log('Output:', outputPath);
  console.log('Current directory:', currentDir);
  
  const resolvedInput = resolvePath(currentDir, inputPath);
  const resolvedOutput = resolvePath(currentDir, outputPath);

  console.log('Resolved input:', resolvedInput);
  console.log('Resolved output:', resolvedOutput);

  if (!validateFileExists(resolvedInput) || !validateIsFile(resolvedInput)) {
    console.log('Input file does not exist or is not a file');
    return false;
  }

  try {
    const readStream = fs.createReadStream(resolvedInput);
    const writeStream = fs.createWriteStream(resolvedOutput);
    
    const rl = readline.createInterface({
      input: readStream,
      crlfDelay: Infinity
    });

    let headers = [];
    let isFirstLine = true;
    let isFirstObject = true;

    // Write opening bracket
    writeStream.write('[\n');

    for await (const line of rl) {
      if (line.trim() === '') continue;
      
      const values = line.split(',').map(v => v.trim());
      
      if (isFirstLine) {
        headers = values;
        console.log('Headers:', headers);
        isFirstLine = false;
        continue;
      }

      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });

      // Add comma between objects
      if (!isFirstObject) {
        writeStream.write(',\n');
      }
      writeStream.write(JSON.stringify(obj));
      isFirstObject = false;
    }

    // Write closing bracket
    writeStream.write('\n]');
    writeStream.end();

    console.log('Conversion completed successfully');
    return true;
  } catch (error) {
    console.error('Error in csv-to-json:', error.message);
    return false;
  }
}
 