import { Transform, pipeline } from 'stream';

let lineNumber = 1;

const lineNumberer = new Transform({
  transform(chunk, encoding, callback) {
    const lines = chunk.toString().split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].length > 0) {
        lines[i] = `${lineNumber} | ${lines[i]}`;
        lineNumber++;
      }
    }
    
    this.push(lines.join('\n'));
    callback();
  }
});

pipeline(
  process.stdin,
  lineNumberer,
  process.stdout,
  (err) => {
    if (err) {
      console.error('Pipeline failed:', err);
    }
  }
);