import { up, cd, ls } from './navigation.js';
import { csvToJson } from './commands/csvToJson.js';
import { jsonToCsv } from './commands/jsonToCsv.js';
import { count } from './commands/count.js';
import { hash } from './commands/hash.js';
import { hashCompare } from './commands/hashCompare.js';
import { encrypt } from './commands/encrypt.js';
import { decrypt } from './commands/decrypt.js';
import { logStats } from './commands/logStats.js';
import { parseArgs } from './utils/argParser.js';

export function startRepl(rl, initialCwd, onCwdChange) {
  let cwd = initialCwd;

  rl.on('line', async (input) => {
    const trimmed = input.trim();
    
    if (trimmed === '.exit') {
      console.log('Thank you for using Data Processing CLI!');
      rl.close();
      process.exit(0);
    }

    if (trimmed === '') {
      rl.prompt();
      return;
    }

    const parts = trimmed.split(' ');
    const command = parts[0];
    const args = parts.slice(1).join(' ');

    try {
      let success = false;

      switch (command) {
        case 'up':
          cwd = up(cwd);
          success = true;
          break;

        case 'cd':
          if (!args) {
            console.log('Invalid input: missing directory path');
          } else {
            const newCwd = await cd(cwd, args);
            if (newCwd) {
              cwd = newCwd;
              success = true;
            } else {
              console.log('Operation failed');
            }
          }
          break;

        case 'ls':
          success = await ls(cwd);
          if (!success) {
            console.log('Operation failed');
          }
          break;

        case 'csv-to-json':
          {
            const parsed = parseArgs(args);
            if (!parsed.input || !parsed.output) {
              console.log('Invalid input: missing --input or --output');
            } else {
              const result = await csvToJson(cwd, parsed.input, parsed.output);
              if (result) {
                success = true;
              } else {
                console.log('Operation failed');
              }
            }
          }
          break;

        case 'json-to-csv':
          {
            const parsed = parseArgs(args);
            if (!parsed.input || !parsed.output) {
              console.log('Invalid input: missing --input or --output');
            } else {
              const result = await jsonToCsv(cwd, parsed.input, parsed.output);
              if (result) {
                success = true;
              } else {
                console.log('Operation failed');
              }
            }
          }
          break;

        case 'count':
          {
            const parsed = parseArgs(args);
            if (!parsed.input) {
              console.log('Invalid input: missing --input');
            } else {
              const result = await count(cwd, parsed.input);
              if (result) {
                success = true;
              } else {
                console.log('Operation failed');
              }
            }
          }
          break;

     case 'hash':
  {
    console.log('Processing hash command...');
    const parsed = parseArgs(args);
    console.log('Parsed arguments:', parsed);
    
    if (!parsed.input) {
      console.log('Invalid input: missing --input');
    } else {
      const algorithm = parsed.algorithm || 'sha256';
    
      const save = parsed.save === true || parsed.save === 'true';
      console.log('Using algorithm:', algorithm);
      console.log('Save flag:', save);
      
      const result = await hash(cwd, parsed.input, algorithm, save);
      if (result) {
        success = true;
      } else {
        console.log('Operation failed');
      }
    }
  }
  break;

        case 'hash-compare':
          {
            const parsed = parseArgs(args);
            if (!parsed.input || !parsed.hash) {
              console.log('Invalid input: missing --input or --hash');
            } else {
              const algorithm = parsed.algorithm || 'sha256';
              const result = await hashCompare(cwd, parsed.input, parsed.hash, algorithm);
              if (result !== null) {
                console.log(result);
                success = true;
              } else {
                console.log('Operation failed');
              }
            }
          }
          break;

        case 'encrypt':
          {
            const parsed = parseArgs(args);
            if (!parsed.input || !parsed.output || !parsed.password) {
              console.log('Invalid input: missing --input, --output, or --password');
            } else {
              const result = await encrypt(cwd, parsed.input, parsed.output, parsed.password);
              if (result) {
                success = true;
              } else {
                console.log('Operation failed');
              }
            }
          }
          break;

        case 'decrypt':
          {
            const parsed = parseArgs(args);
            if (!parsed.input || !parsed.output || !parsed.password) {
              console.log('Invalid input: missing --input, --output, or --password');
            } else {
              const result = await decrypt(cwd, parsed.input, parsed.output, parsed.password);
              if (result) {
                success = true;
              } else {
                console.log('Operation failed');
              }
            }
          }
          break;

        case 'log-stats':
          {
            const parsed = parseArgs(args);
            if (!parsed.input || !parsed.output) {
              console.log('Invalid input: missing --input or --output');
            } else {
              const result = await logStats(cwd, parsed.input, parsed.output);
              if (result) {
                success = true;
              } else {
                console.log('Operation failed');
              }
            }
          }
          break;

        default:
          console.log('Invalid input: unknown command');
      }

      if (success) {
        console.log(`You are currently in ${cwd}`);
        onCwdChange(cwd);
      }
    } catch (error) {
      console.log('Operation failed:', error.message);
    }

    rl.prompt();
  });

  rl.prompt();
}