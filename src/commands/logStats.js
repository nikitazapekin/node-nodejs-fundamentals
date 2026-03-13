import fs from 'fs';
import { Worker } from 'worker_threads';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolvePath, validateFileExists, validateIsFile } from '../utils/pathResolver.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function logStats(currentDir, inputPath, outputPath) {
  const resolvedInput = resolvePath(currentDir, inputPath);
  const resolvedOutput = resolvePath(currentDir, outputPath);

  if (!validateFileExists(resolvedInput) || !validateIsFile(resolvedInput)) {
    return false;
  }

  try {
    const fileSize = (await fs.promises.stat(resolvedInput)).size;
    const numCores = os.cpus().length;
    const chunkSize = Math.ceil(fileSize / numCores);

    const workers = [];
    const chunks = [];
 
    const fileHandle = await fs.promises.open(resolvedInput, 'r');
    
    let start = 0;
    for (let i = 0; i < numCores; i++) {
      let end = Math.min(start + chunkSize, fileSize);
      
      if (i < numCores - 1 && end < fileSize) {
       
        const buffer = Buffer.alloc(1024);
        let readEnd = end;
        let foundNewline = false;
        
        while (readEnd < fileSize && !foundNewline) {
          const bytesToRead = Math.min(1024, fileSize - readEnd);
          await fileHandle.read(buffer, 0, bytesToRead, readEnd);
          
          for (let j = 0; j < bytesToRead; j++) {
            if (buffer[j] === 10) { // \n
              end = readEnd + j + 1;
              foundNewline = true;
              break;
            }
          }
          readEnd += bytesToRead;
        }
        
        if (!foundNewline) {
          end = fileSize;
        }
      }

      const chunkBuffer = Buffer.alloc(end - start);
      await fileHandle.read(chunkBuffer, 0, end - start, start);
      chunks.push(chunkBuffer.toString());
      
      start = end;
    }
    
    await fileHandle.close();
 
    const workerResults = await Promise.all(
      chunks.map((chunk, index) => {
        return new Promise((resolve, reject) => {
          const worker = new Worker(path.join(__dirname, '../workers/logWorker.js'), {
            workerData: { chunk }
          });
          
          worker.on('message', resolve);
          worker.on('error', reject);
          worker.on('exit', (code) => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
          });
        });
      })
    );
 
    const finalStats = {
      total: 0,
      levels: { INFO: 0, WARN: 0, ERROR: 0 },
      status: { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 },
      pathCounts: new Map(),
      responseTimeSum: 0
    };

    for (const result of workerResults) {
      finalStats.total += result.total;
       
      Object.keys(result.levels).forEach(level => {
        finalStats.levels[level] += result.levels[level];
      });
       
      Object.keys(result.status).forEach(status => {
        finalStats.status[status] += result.status[status];
      });
       
      result.paths.forEach(([path, count]) => {
        finalStats.pathCounts.set(path, (finalStats.pathCounts.get(path) || 0) + count);
      });
       
      finalStats.responseTimeSum += result.responseTimeSum;
    } 
    const avgResponseTime = finalStats.total > 0 
      ? (finalStats.responseTimeSum / finalStats.total).toFixed(2) 
      : 0;
 
    const topPaths = Array.from(finalStats.pathCounts.entries())
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
 
    const output = {
      total: finalStats.total,
      levels: finalStats.levels,
      status: finalStats.status,
      topPaths,
      avgResponseTimeMs: parseFloat(avgResponseTime)
    };

    await fs.promises.writeFile(resolvedOutput, JSON.stringify(output, null, 2));
    return true;
  } catch (error) {
    return false;
  }
}