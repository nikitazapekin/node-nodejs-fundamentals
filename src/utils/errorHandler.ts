import { FastifyInstance } from 'fastify';

export async function errorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);
    
    // Handle 404 for non-existing routes
    if (error.code === 'FST_ERR_NOT_FOUND') {
      return reply.status(404).send({ 
        message: 'Resource not found' 
      });
    }
    
    // Handle validation errors
    if (error.validation) {
      return reply.status(400).send({ 
        message: error.message 
      });
    }
    
    // Default server error
    return reply.status(500).send({ 
      message: 'Internal server error' 
    });
  });
}