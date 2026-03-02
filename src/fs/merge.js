import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const merge = async () => {
  const workspacePath = path.join(__dirname, '../../workspace');
  const partsPath = path.join(workspacePath, 'parts');
  const mergedPath = path.join(workspacePath, 'merged.txt');

  try {
    await fs.access(partsPath);
  } catch {
    throw new Error('FS operation failed');
  }

  let files = [];
  const filesArg = process.argv.find(arg => arg.startsWith('--files='));

  if (filesArg) {
    const fileList = filesArg.split('=')[1].split(',');
    files = fileList.map(f => f.trim());
    
    for (const file of files) {
      try {
        await fs.access(path.join(partsPath, file));
      } catch {
        throw new Error('FS operation failed');
      }
    }
  } else {
    const allFiles = await fs.readdir(partsPath);
    files = allFiles
      .filter(f => f.endsWith('.txt'))
      .sort();
    
    if (files.length === 0) {
      throw new Error('FS operation failed');
    }
  }

  let mergedContent = '';
  for (const file of files) {
    const content = await fs.readFile(path.join(partsPath, file), 'utf-8');
    mergedContent += content;
  }

  await fs.writeFile(mergedPath, mergedContent);
};