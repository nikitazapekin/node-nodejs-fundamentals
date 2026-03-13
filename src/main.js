import readline from 'readline';
import { homedir } from 'os';
import { startRepl } from './repl.js';

let currentWorkingDirectory = homedir();

console.log('Welcome to Data Processing CLI!');
console.log(`You are currently in ${currentWorkingDirectory}`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});

startRepl(rl, currentWorkingDirectory, (newCwd) => {
  currentWorkingDirectory = newCwd;
});

rl.on('SIGINT', () => {
  console.log('\nThank you for using Data Processing CLI!');
  process.exit(0);
});