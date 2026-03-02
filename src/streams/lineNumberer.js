import { Transform } from 'stream';

export const lineNumberer = () => {
  let lineNumber = 1;

  const transformer = new Transform({
    transform(chunk, encoding, callback) {
      const lines = chunk.toString().split(/\r?\n/);
      const numberedLines = lines
        .filter(line => line.length > 0)
        .map(line => `${lineNumber++} | ${line}`)
        .join('\n');

      this.push(numberedLines + (lines[lines.length - 1] === '' ? '\n' : ''));
      callback();
    }
  });

  process.stdin.pipe(transformer).pipe(process.stdout);
};