import { parentPort, workerData } from 'worker_threads';

function processChunk(chunk) {
  const stats = {
    total: 0,
    levels: { INFO: 0, WARN: 0, ERROR: 0 },
    status: { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 },
    paths: new Map(),
    responseTimeSum: 0
  };

  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    stats.total++;
    
    const parts = line.split(' ');
    if (parts.length < 7) continue;

    const level = parts[1];
    const statusCode = parseInt(parts[3], 10);
    const responseTime = parseInt(parts[4], 10);
    const path = parts[6];
 
    if (stats.levels[level] !== undefined) {
      stats.levels[level]++;
    }
 
    if (statusCode >= 200 && statusCode < 300) stats.status['2xx']++;
    else if (statusCode >= 300 && statusCode < 400) stats.status['3xx']++;
    else if (statusCode >= 400 && statusCode < 500) stats.status['4xx']++;
    else if (statusCode >= 500 && statusCode < 600) stats.status['5xx']++;
 
    stats.paths.set(path, (stats.paths.get(path) || 0) + 1);
 
    stats.responseTimeSum += responseTime;
  }
 
  return {
    ...stats,
    paths: Array.from(stats.paths.entries())
  };
}

if (parentPort) {
  const result = processChunk(workerData.chunk);
  parentPort.postMessage(result);
}