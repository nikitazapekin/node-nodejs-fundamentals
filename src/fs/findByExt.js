import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function findFilesByExt(dir, ext, basePath, files = []) {
  const items = await fs.readdir(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      await findFilesByExt(fullPath, ext, basePath, files);
    } else if (item.isFile() && item.name.endsWith(`.${ext}`)) {
      files.push(path.relative(basePath, fullPath));
    }
  }

  return files;
}

export const findByExt = async () => {
  const workspacePath = path.join(__dirname, '../../workspace');
  const ext = process.argv.find(arg => arg.startsWith('--ext='))?.split('=')[1] || 'txt';

  try {
    await fs.access(workspacePath);
  } catch {
    throw new Error('FS operation failed');
  }

  const files = await findFilesByExt(workspacePath, ext, workspacePath);
  files.sort();

  files.forEach(file => console.log(file));
};