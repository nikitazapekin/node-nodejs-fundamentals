import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const restore = async () => {
  const workspacePath = path.join(__dirname, '../../workspace');
  const snapshotPath = path.join(workspacePath, 'snapshot.json');
  const restoredPath = path.join(workspacePath, 'workspace_restored');

  try {
    await fs.access(snapshotPath);
  } catch {
    throw new Error('FS operation failed');
  }

  try {
    await fs.access(restoredPath);
    throw new Error('FS operation failed');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  const snapshotContent = await fs.readFile(snapshotPath, 'utf-8');
  const snapshot = JSON.parse(snapshotContent);

  await fs.mkdir(restoredPath, { recursive: true });

  for (const entry of snapshot.entries) {
    const fullPath = path.join(restoredPath, entry.path);

    if (entry.type === 'directory') {
      await fs.mkdir(fullPath, { recursive: true });
    } else {
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      const content = Buffer.from(entry.content, 'base64');
      await fs.writeFile(fullPath, content);
    }
  }
};