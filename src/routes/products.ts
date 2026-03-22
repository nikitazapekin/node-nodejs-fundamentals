import { FastifyInstance } from 'fastify';
import { productController } from '../controllers/productController';

export async function productRoutes(fastify: FastifyInstance) {
  fastify.get('/api/products', productController.getAllProducts.bind(productController));
  fastify.get('/api/products/:productId', productController.getProductById.bind(productController));
  fastify.post('/api/products', productController.createProduct.bind(productController));
  fastify.put('/api/products/:productId', productController.updateProduct.bind(productController));
  fastify.delete('/api/products/:productId', productController.deleteProduct.bind(productController));
}