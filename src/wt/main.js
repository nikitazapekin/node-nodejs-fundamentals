import fs from 'fs/promises';
import path from 'path';
import { Worker } from 'worker_threads';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function mergeKSortedArrays(arrays) {
  const result = [];
  const indices = new Array(arrays.length).fill(0);
  
  while (true) {
    let minValue = Infinity;
    let minIndex = -1;
    
    for (let i = 0; i < arrays.length; i++) {
      if (indices[i] < arrays[i].length && arrays[i][indices[i]] < minValue) {
        minValue = arrays[i][indices[i]];
        minIndex = i;
      }
    }
    
    if (minIndex === -1) break;
    
    result.push(minValue);
    indices[minIndex]++;
  }
  
  return result;
}

export const main = async () => {
  const dataPath = path.join(__dirname, '../../workspace/data.json');
  
  try {
    const dataContent = await fs.readFile(dataPath, 'utf-8');
    const numbers = JSON.parse(dataContent);
    
    const numCores = os.cpus().length;
    const chunkSize = Math.ceil(numbers.length / numCores);
    const chunks = [];
    
    for (let i = 0; i < numCores; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, numbers.length);
      if (start < numbers.length) {
        chunks.push(numbers.slice(start, end));
      }
    }
    
    const workers = [];
    const results = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const worker = new Worker(path.join(__dirname, 'worker.js'));
      
      workers.push(new Promise((resolve, reject) => {
        worker.on('message', (sortedChunk) => {
          results[i] = sortedChunk;
          resolve();
        });
        
        worker.on('error', reject);
        
        worker.postMessage(chunks[i]);
      }));
    }
    
    await Promise.all(workers);
    
    const sortedArray = mergeKSortedArrays(results);
    console.log(sortedArray);
    
  } catch {
    throw new Error('FS operation failed');
  }
};