 
const args = process.argv.slice(2);
let duration = 5000; 
let interval = 100;  
let length = 30; 
let color = null;

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--duration':
      duration = parseInt(args[++i]) || duration;
      break;
    case '--interval':
      interval = parseInt(args[++i]) || interval;
      break;
    case '--length':
      length = parseInt(args[++i]) || length;
      break;
    case '--color':
      color = args[++i];
     
      if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
        color = null;
      }
      break;
  }
}

const steps = duration / interval;
let currentStep = 0;

function renderProgress() {
  const percent = Math.min(100, (currentStep / steps) * 100);
  const filledLength = Math.floor((percent / 100) * length);
  const emptyLength = length - filledLength;

  const filled = '█'.repeat(filledLength);
  const empty = '░'.repeat(emptyLength);

  let bar = `[${filled}${empty}] ${percent.toFixed(0)}%`;

  if (color && filledLength > 0) {
   
    const coloredFilled = `\x1b[38;2;${parseInt(color.slice(1,3), 16)};${parseInt(color.slice(3,5), 16)};${parseInt(color.slice(5,7), 16)}m${filled}\x1b[0m`;
    bar = `[${coloredFilled}${empty}] ${percent.toFixed(0)}%`;
  }

  process.stdout.write(`\r${bar}`);

  if (currentStep >= steps) {
    console.log('\nDone!');
    clearInterval(timer);
  }

  currentStep++;
}

const timer = setInterval(renderProgress, interval);
renderProgress();  