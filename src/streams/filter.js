import { Transform } from 'stream';

export const filter = () => {
  const patternArg = process.argv.find(arg => arg.startsWith('--pattern='));
  const pattern = patternArg ? patternArg.split('=')[1] : '';

  const transformer = new Transform({
    transform(chunk, encoding, callback) {
      const lines = chunk.toString().split(/\r?\n/);
      const filteredLines = lines.filter(line => line.includes(pattern));

      if (filteredLines.length > 0) {
        this.push(filteredLines.join('\n') + '\n');
      }
      callback();
    }
  });

  process.stdin.pipe(transformer).pipe(process.stdout);
};