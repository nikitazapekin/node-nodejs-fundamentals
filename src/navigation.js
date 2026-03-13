import fs from 'fs/promises';
import path from 'path';
import { resolvePath } from './utils/pathResolver.js';

export function up(currentDir) {
  const parentDir = path.dirname(currentDir);
  return parentDir; 
}

export function cd(currentDir, targetPath) {
  try {
    const resolvedPath = resolvePath(currentDir, targetPath);
    const stats = fs.statSync(resolvedPath);
    
    if (stats.isDirectory()) {
      return resolvedPath;
    }
    return null;
  } catch {
    return null;
  }
}

export async function ls(currentDir) {
  try {
    const items = await fs.readdir(currentDir);
    const itemsWithStats = await Promise.all(
      items.map(async (item) => {
        const fullPath = path.join(currentDir, item);
        const stats = await fs.stat(fullPath);
        return {
          name: item,
          type: stats.isDirectory() ? 'folder' : 'file'
        };
      })
    );

  
    const sorted = itemsWithStats.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === 'folder' ? -1 : 1;
    });

 
    const maxNameLength = Math.max(...sorted.map(item => item.name.length)) + 2;
    
    for (const item of sorted) {
      const paddedName = item.name.padEnd(maxNameLength);
      console.log(`${paddedName}[${item.type}]`);
    }
  } catch {
    console.log('Operation failed');
  }
}