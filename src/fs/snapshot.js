import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function scanDirectory(dirPath, basePath) {
  const entries = [];
  const items = await fs.readdir(dirPath, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    const relativePath = path.relative(basePath, fullPath);

    if (item.isDirectory()) {
      entries.push({
        path: relativePath,
        type: 'directory'
      });
      
      const subEntries = await scanDirectory(fullPath, basePath);
      entries.push(...subEntries);
    } else if (item.isFile()) {
      const stats = await fs.stat(fullPath);
      const content = await fs.readFile(fullPath);
      
      entries.push({
        path: relativePath,
        type: 'file',
        size: stats.size,
        content: content.toString('base64')
      });
    }
  }

  return entries;
}

export const snapshot = async () => {
  const workspacePath = path.join(__dirname, '../../workspace');
  
  try {
    await fs.access(workspacePath);
  } catch {
    throw new Error('FS operation failed');
  }

  const rootPath = path.resolve(workspacePath);
  const entries = await scanDirectory(workspacePath, workspacePath);
  
  const snapshot = {
    rootPath,
    entries
  };

  await fs.writeFile(
    path.join(workspacePath, 'snapshot.json'),
    JSON.stringify(snapshot, null, 2)
  );
};