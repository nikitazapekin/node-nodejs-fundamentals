import { FastifyInstance } from 'fastify';

export async function errorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler((error, _request, reply) => {
    fastify.log.error(error);
     
    if (error.code === 'FST_ERR_NOT_FOUND') {
      return reply.status(404).send({ 
        message: 'Resource not found' 
      });
    }
     
    if (error.validation) {
      return reply.status(400).send({ 
        message: error.message 
      });
    }
     
    return reply.status(500).send({ 
      message: 'Internal server error' 
    });
  });
}