import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function restore() {
  try {
    const snapshotPath = path.join(process.cwd(), 'snapshot.json');
    const restoredPath = path.join(process.cwd(), 'workspace_restored');
 
    try {
      await fs.access(snapshotPath);
    } catch {
      throw new Error('FS operation failed');
    }
 
    try {
      await fs.access(restoredPath);
      throw new Error('FS operation failed');
    } catch (error) {
      if (error.message === 'FS operation failed') {
        throw error;
      }
     
    }

    
    const snapshotData = await fs.readFile(snapshotPath, 'utf-8');
    const snapshot = JSON.parse(snapshotData);

    
    await fs.mkdir(restoredPath, { recursive: true });
 
    for (const entry of snapshot.entries) {
      const fullPath = path.join(restoredPath, entry.path);
      
      if (entry.type === 'directory') {
        await fs.mkdir(fullPath, { recursive: true });
      } else if (entry.type === 'file') {
       
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
     
        const content = Buffer.from(entry.content, 'base64');
        await fs.writeFile(fullPath, content);
      }
    }
  } catch (error) {
    if (error.message === 'FS operation failed') {
      throw error;
    }
    throw new Error('FS operation failed');
  }
}

await restore();