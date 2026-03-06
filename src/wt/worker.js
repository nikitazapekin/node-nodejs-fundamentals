import { parentPort } from 'worker_threads';

if (parentPort) {
  parentPort.on('message', (numbers) => {
  
    const sorted = numbers.sort((a, b) => a - b);
    parentPort.postMessage(sorted);
  });
}