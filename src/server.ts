import { buildApp } from './app';

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = '0.0.0.0';

async function start() {
  try {
    const app = await buildApp();
    
    await app.listen({ port: PORT, host: HOST });
    console.log(`Server is running on http://${HOST}:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

start();