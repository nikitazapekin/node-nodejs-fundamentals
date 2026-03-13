export function parseArgs(argsString) {
  const args = {};
  const regex = /--(\w+)(?:\s+("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\S+))?/g;
  let match;

  while ((match = regex.exec(argsString)) !== null) {
    const key = match[1];
    let value = match[2] || true;

    if (value && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value && value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }

    args[key] = value;
  }

  return args;
}