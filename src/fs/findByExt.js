import fs from 'fs/promises';
import path from 'path';

async function findByExt() {
  try {
    const workspacePath = path.join(process.cwd(), 'workspace');
    
    try {
      await fs.access(workspacePath);
    } catch {
      throw new Error('FS operation failed');
    }
 
    const extArgIndex = process.argv.indexOf('--ext');
    let extension = 'txt';
    
    if (extArgIndex !== -1 && process.argv[extArgIndex + 1]) {
      extension = process.argv[extArgIndex + 1].replace(/^\./, '');
    }
 
    async function findFiles(dir, baseDir) {
      const files = await fs.readdir(dir, { withFileTypes: true });
      const results = [];

      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        
        if (file.isDirectory()) {
          const subResults = await findFiles(fullPath, baseDir);
          results.push(...subResults);
        } else if (file.isFile() && file.name.endsWith(`.${extension}`)) {
          results.push(path.relative(baseDir, fullPath));
        }
      }

      return results;
    }

    const foundFiles = await findFiles(workspacePath, workspacePath);
    
    foundFiles.sort().forEach(file => console.log(file));

  } catch (error) {
    if (error.message === 'FS operation failed') {
      throw error;
    }
    throw new Error('FS operation failed');
  }
}

await findByExt();