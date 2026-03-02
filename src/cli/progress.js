const parseArgs = () => {
  const args = {
    duration: 5000,
    interval: 100,
    length: 30,
    color: null
  };

  process.argv.forEach(arg => {
    if (arg.startsWith('--duration=')) args.duration = parseInt(arg.split('=')[1]);
    if (arg.startsWith('--interval=')) args.interval = parseInt(arg.split('=')[1]);
    if (arg.startsWith('--length=')) args.length = parseInt(arg.split('=')[1]);
    if (arg.startsWith('--color=')) {
      const color = arg.split('=')[1];
      if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
        args.color = color;
      }
    }
  });

  return args;
};

const hexToAnsi = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `\x1b[38;2;${r};${g};${b}m`;
};

export const progress = () => {
  const { duration, interval, length, color } = parseArgs();
  const steps = duration / interval;
  let currentStep = 0;

  const updateProgress = () => {
    currentStep++;
    const percentage = Math.min(100, Math.round((currentStep / steps) * 100));
    const filledLength = Math.round((percentage / 100) * length);
    const emptyLength = length - filledLength;

    let bar = '';
    if (color) {
      bar = `${hexToAnsi(color)}${'█'.repeat(filledLength)}\x1b[0m${' '.repeat(emptyLength)}`;
    } else {
      bar = `${'█'.repeat(filledLength)}${' '.repeat(emptyLength)}`;
    }

    process.stdout.write(`\r[${bar}] ${percentage}%`);

    if (currentStep >= steps) {
      clearInterval(timer);
      console.log('\nDone!');
    }
  };

  const timer = setInterval(updateProgress, interval);
  updateProgress();
};