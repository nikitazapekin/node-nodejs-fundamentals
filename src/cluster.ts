import cluster from 'cluster';
import os from 'os';
import { buildApp } from './app';

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = '0.0.0.0';

if (cluster.isPrimary) {
  const numWorkers = os.cpus().length - 1;
  console.log(`Primary process ${process.pid} is running`);
  console.log(`Starting ${numWorkers} worker instances...`);

  // Fork workers
  for (let i = 0; i < numWorkers; i++) {
    const workerPort = PORT + i + 1;
    cluster.fork({ WORKER_PORT: workerPort });
  }

  // Handle worker exit
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });

  // Simple round-robin load balancer
  let currentWorker = 0;
  const workers = Object.values(cluster.workers || {});
  
  // Create a simple HTTP server as load balancer
  const http = require('http');
  const balancer = http.createServer((req: any, res: any) => {
    const worker = workers[currentWorker % workers.length];
    currentWorker++;
    
    if (worker) {
      const workerPort = worker.process.env.WORKER_PORT;
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