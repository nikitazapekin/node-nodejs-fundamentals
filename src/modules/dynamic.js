import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function dynamic() {
  const pluginName = process.argv[2];
  
  if (!pluginName) {
    console.error('Plugin not found');
    process.exit(1);
  }

  try {
    const pluginPath = path.join(__dirname, 'plugins', `${pluginName}.js`);
    const plugin = await import(pluginPath);
    
    if (typeof plugin.run === 'function') {
      const result = plugin.run();
      console.log(result);
    } else {
      console.error('Plugin not found');
      process.exit(1);
    }
  } catch (error) {
    console.error('Plugin not found');
    process.exit(1);
  }
}

await dynamic();