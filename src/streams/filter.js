import { Transform, pipeline } from 'stream';
 
const patternIndex = process.argv.indexOf('--pattern');
let pattern = '';

if (patternIndex !== -1 && process.argv[patternIndex + 1]) {
  pattern = process.argv[patternIndex + 1];
}

const filter = new Transform({
  transform(chunk, encoding, callback) {
    const lines = chunk.toString().split('\n');
    const filteredLines = lines.filter(line => line.includes(pattern));
    
    if (filteredLines.length > 0) {
      this.push(filteredLines.join('\n') + (filteredLines.length > 0 ? '\n' : ''));
    }
    
    callback();
  }
});

pipeline(
  process.stdin,
  filter,
  process.stdout,
  (err) => {
    if (err) {
      console.error('Pipeline failed:', err);
    }
  }
);