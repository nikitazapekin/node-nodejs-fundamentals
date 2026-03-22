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
 
  await fastify.register(cors, {
    origin: true,
  });
 
  await fastify.register(productRoutes);
 
  await errorHandler(fastify);

  return fastify;
}