import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function scanDirectory(dirPath, basePath) {
  const entries = [];
  const files = await fs.readdir(dirPath, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dirPath, file.name);
    const relativePath = path.relative(basePath, fullPath);

    if (file.isDirectory()) {
      entries.push({
        path: relativePath,
        type: 'directory'
      });
      const subEntries = await scanDirectory(fullPath, basePath);
      entries.push(...subEntries);
    } else if (file.isFile()) {
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

async function snapshot() {
  try {
    const workspacePath = path.join(process.cwd(), 'workspace');
    
    try {
      await fs.access(workspacePath);
    } catch {
      throw new Error('FS operation failed');
    }

    const rootPath = workspacePath;
    const entries = await scanDirectory(workspacePath, workspacePath);

    const snapshot = {
      rootPath,
      entries
    };

    await fs.writeFile(
      path.join(process.cwd(), 'snapshot.json'),
      JSON.stringify(snapshot, null, 2)
    );
  } catch (error) {
    if (error.message === 'FS operation failed') {
      throw error;
    }
    throw new Error('FS operation failed');
  }
}

await snapshot();