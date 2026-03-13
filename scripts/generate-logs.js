import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const services = ['user-service', 'order-service', 'product-service', 'auth-service'];
const methods = ['GET', 'POST', 'PUT', 'DELETE'];
const paths = [
  '/api/users',
  '/api/users/:id',
  '/api/orders',
  '/api/orders/:id',
  '/api/products',
  '/api/products/:id',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/health'
];

const levels = ['INFO', 'WARN', 'ERROR'];
const statusCodes = {
  '2xx': [200, 201, 204],
  '3xx': [301, 302, 304],
  '4xx': [400, 401, 403, 404],
  '5xx': [500, 502, 503]
};

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateLogLine(timestamp) {
  const level = randomElement(levels);
  const service = randomElement(services);
 
  let statusClass;
  if (level === 'ERROR') {
    statusClass = randomElement(['4xx', '5xx']);
  } else if (level === 'WARN') {
    statusClass = randomElement(['3xx', '4xx']);
  } else {
    statusClass = randomElement(['2xx', '3xx']);
  }
  
  const statusCode = randomElement(statusCodes[statusClass]);
  const responseTime = level === 'ERROR' 
    ? randomInt(500, 2000) 
    : randomInt(10, 500);
  const method = randomElement(methods);
  
  let path = randomElement(paths);
  if (path.includes(':id')) {
    path = path.replace(':id', randomInt(1, 1000).toString());
  }

  return `${timestamp.toISOString()} ${level} ${service} ${statusCode} ${responseTime} ${method} ${path}`;
}

function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    const [key, value] = arg.split('=');
    if (key.startsWith('--')) {
      args[key.slice(2)] = value;
    }
  });
  return args;
}

async function main() {
  const args = parseArgs();
  const outputPath = args.output || path.join(process.cwd(), 'logs.txt');
  const lines = parseInt(args.lines) || 100000;

  console.log(`Generating ${lines} log lines to ${outputPath}`);

  const writeStream = fs.createWriteStream(outputPath);
  
  const startTime = Date.now();
  const baseTime = new Date('2026-02-01T00:00:00.000Z');

  for (let i = 0; i < lines; i++) {
   
    const timestamp = new Date(baseTime.getTime() + (i * 86400000 / lines));
    const line = generateLogLine(timestamp);
    writeStream.write(line + '\n');

    if ((i + 1) % 100000 === 0) {
      console.log(`Generated ${i + 1} lines...`);
    }
  }

  writeStream.end();
  
  writeStream.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;
    console.log(`Done! Generated ${lines} lines in ${duration.toFixed(2)}s`);
  });
}

main().catch(console.error);