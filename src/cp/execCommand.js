import { spawn } from 'child_process';

function execCommand() {
 
  const command = process.argv.slice(2).join(' ');
  
  if (!command) {
    console.error('No command provided');
    process.exit(1);
  }
 
  const [cmd, ...args] = command.split(' ');
 
  const child = spawn(cmd, args, {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    env: process.env  
  });

 
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
 
  child.on('exit', (code) => {
    process.exit(code);
  });

  child.on('error', (err) => {
    console.error('Failed to start child process:', err);
    process.exit(1);
  });
}

execCommand();