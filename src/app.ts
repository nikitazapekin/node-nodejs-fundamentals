import Fastify from 'fastify';
import cors from '@fastify/cors';
import { productRoutes } from './routes/products';
import { errorHandler } from './utils/errorHandler';
import dotenv from 'dotenv';

dotenv.config();

export async function buildApp() {
  const fastify = Fastify({
    logger: process.env.NODE_ENV === 'development'
      ? {
          transport: {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          },
        }
      : true,
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