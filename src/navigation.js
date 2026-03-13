import fs from 'fs/promises';
import path from 'path';
import { resolvePath } from './utils/pathResolver.js';

export function up(currentDir) {
  const parentDir = path.dirname(currentDir);
  return parentDir; 
}

export async function cd(currentDir, targetPath) {
  try {
    const resolvedPath = resolvePath(currentDir, targetPath);
     
    const stats = await fs.stat(resolvedPath).catch(() => null);
    
    if (!stats) {
      console.log(`Directory does not exist: ${resolvedPath}`);
      return null;
    }
    
    if (stats.isDirectory()) {
      return resolvedPath;
    } else {
      console.log(`Path is not a directory: ${resolvedPath}`);
      return null;
    }
  } catch (error) {
    console.log(`Error accessing path: ${error.message}`);
    return null;
  }
}

export async function ls(currentDir) {
  try {
    const items = await fs.readdir(currentDir);
    const itemsWithStats = await Promise.all(
      items.map(async (item) => {
        const fullPath = path.join(currentDir, item);
        try {
          const stats = await fs.stat(fullPath);
          return {
            name: item,
            type: stats.isDirectory() ? 'folder' : 'file'
          };
        } catch {
         
          return {
            name: item,
            type: 'unknown'
          };
        }
      })
    );

   
    const sorted = itemsWithStats.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      
      if (a.type === 'unknown') return 1;
      if (b.type === 'unknown') return -1;
      return a.type === 'folder' ? -1 : 1;
    });

    
    const maxNameLength = Math.max(...sorted.map(item => item.name.length), 10) + 2;
    
    for (const item of sorted) {
      const paddedName = item.name.padEnd(maxNameLength);
      console.log(`${paddedName}[${item.type}]`);
    }
    
    return true;
  } catch (error) {
    console.log(`Cannot list directory: ${error.message}`);
    return false;
  }
}