import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});

const startTime = Date.now();

rl.prompt();

rl.on('line', (line) => {
  const command = line.trim();

  switch (command) {
    case 'uptime':
      const uptimeSeconds = (Date.now() - startTime) / 1000;
      console.log(`Uptime: ${uptimeSeconds.toFixed(2)}s`);
      break;
    
    case 'cwd':
      console.log(process.cwd());
      break;
    
    case 'date':
      console.log(new Date().toISOString());
      break;
    
    case 'exit':
      console.log('Goodbye!');
      process.exit(0);
      break;
    
    default:
      console.log('Unknown command');
  }

  rl.prompt();
});

rl.on('SIGINT', () => {
  console.log('\nGoodbye!');
  process.exit(0);
});