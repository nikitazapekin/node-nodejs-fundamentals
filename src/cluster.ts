import cluster from 'cluster';
import os from 'os';
import { buildApp } from './app';
import type { Worker } from 'cluster';

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = '0.0.0.0';

if (cluster.isPrimary) {
  const numWorkers = os.cpus().length - 1;
  console.log(`Primary process ${process.pid} is running`);
  console.log(`Starting ${numWorkers} worker instances...`);

  const workerPorts = new Map<Worker, number>();

  // Fork workers
  for (let i = 0; i < numWorkers; i++) {
    const workerPort = PORT + i + 1;
    const worker = cluster.fork({ WORKER_PORT: workerPort });
    workerPorts.set(worker, workerPort);
  }

  // Handle worker exit
  cluster.on('exit', (_worker, _code, _signal) => {
    console.log(`Worker ${_worker.process.pid} died. Restarting...`);
    const workerPort = workerPorts.get(_worker) || PORT + 1;
    const newWorker = cluster.fork({ WORKER_PORT: workerPort });
    workerPorts.set(newWorker, workerPort);
  });

  // Simple round-robin load balancer
  let currentWorker = 0;
  
  // Create a simple HTTP server as load balancer
  const http = require('http');
  const balancer = http.createServer((req: any, res: any) => {
    const workers = Object.values(cluster.workers || {});
    const worker = workers[currentWorker % workers.length];
    currentWorker++;
    
    if (worker) {
      const workerPort = workerPorts.get(worker);
      if (workerPort) {
        const proxyReq = http.request({
          host: 'localhost',
          port: workerPort,
          path: req.url,
          method: req.method,
          headers: req.headers
        }, (proxyRes: any) => {
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(res);
        });
        
        req.pipe(proxyReq);
      } else {
        res.writeHead(503);
        res.end('Worker port not available');
      }
    } else {
      res.writeHead(503);
      res.end('No workers available');
    }
  });
  
  balancer.listen(PORT, HOST, () => {
    console.log(`Load balancer listening on http://${HOST}:${PORT}`);
  });
  
} else {
  // Worker process
  const workerPort = parseInt(process.env.WORKER_PORT || (PORT + 1).toString(), 10);
  
  async function startWorker() {
    try {
      const app = await buildApp();
      await app.listen({ port: workerPort, host: HOST });
      console.log(`Worker ${process.pid} started on http://${HOST}:${workerPort}`);
    } catch (err) {
      console.error(`Error starting worker ${process.pid}:`, err);
      process.exit(1);
    }
  }
  
  startWorker();
}