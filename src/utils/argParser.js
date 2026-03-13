export function parseArgs(argsString) {
  const args = {};
  
  const regex = /--(\w+)(?:\s+("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\S+))?/g;
  let match;

  while ((match = regex.exec(argsString)) !== null) {
    const key = match[1];
    let value = match[2];

    if (value === undefined) {
     
      args[key] = true;
    } else {
       
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      args[key] = value;
    }
  }

  console.log('Parsed args:', args);  
  return args;
}