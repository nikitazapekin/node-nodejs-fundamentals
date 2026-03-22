import Fastify from 'fastify';
import cors from '@fastify/cors';
import { productRoutes } from './routes/products';
import { errorHandler } from './utils/errorHandler';
import dotenv from 'dotenv';

dotenv.config();

export async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'development' ? 'info' : 'warn',
    },
  });

  // Register plugins
  await fastify.register(cors, {
    origin: true,
  });

  // Register routes
  await fastify.register(productRoutes);

  // Register error handler
  await errorHandler(fastify);

  return fastify;
}