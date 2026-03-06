import fs from 'fs/promises';
import path from 'path';
import { Worker } from 'worker_threads';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  try {
  
    const dataPath = path.join(process.cwd(), 'data.json');
    const data = JSON.parse(await fs.readFile(dataPath, 'utf-8'));

    const numCPUs = os.cpus().length;
    const chunkSize = Math.ceil(data.length / numCPUs);
    const chunks = [];
 
    for (let i = 0; i < numCPUs; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, data.length);
      if (start < data.length) {
        chunks.push(data.slice(start, end));
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
        worker.on('exit', (code) => {
          if (code !== 0) {
            reject(new Error(`Worker stopped with exit code ${code}`));
          }
        });

        worker.postMessage(chunks[i]);
      }));
    }
 
    await Promise.all(workers);

 
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

    const merged = mergeKSortedArrays(results);
    console.log(merged);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

await main();