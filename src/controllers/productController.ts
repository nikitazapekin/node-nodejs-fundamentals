import { FastifyRequest, FastifyReply } from 'fastify';
import { productService } from '../services/productService';
import { productSchema, productIdSchema } from '../schemas/productSchemas';
import { ZodError } from 'zod';

export class ProductController {
  async getAllProducts(request: FastifyRequest, reply: FastifyReply) {
    try {
      const products = productService.getAllProducts();
      return reply.status(200).send(products);
    } catch (error) {
      throw error;
    }
  }

  async getProductById(
    request: FastifyRequest<{ Params: { productId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { productId } = productIdSchema.parse(request.params);
      const product = productService.getProductById(productId);
      
      if (!product) {
        return reply.status(404).send({ 
          message: `Product with id ${productId} not found` 
        });
      }
      
      return reply.status(200).send(product);
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({ 
          message: error.errors[0].message 
        });
      }
      throw error;
    }
  }

  async createProduct(
    request: FastifyRequest<{ Body: any }>,
    reply: FastifyReply
  ) {
    try {
      const validatedData = productSchema.parse(request.body);
      const product = productService.createProduct(validatedData);
      return reply.status(201).send(product);
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({ 
          message: error.errors.map(e => e.message).join(', ')
        });
      }
      throw error;
    }
  }

  async updateProduct(
    request: FastifyRequest<{ Params: { productId: string }; Body: any }>,
    reply: FastifyReply
  ) {
    try {
      const { productId } = productIdSchema.parse(request.params);
      const validatedData = productSchema.partial().parse(request.body);
      
      const updatedProduct = productService.updateProduct(productId, validatedData);
      
      if (!updatedProduct) {
        return reply.status(404).send({ 
          message: `Product with id ${productId} not found` 
        });
      }
      
      return reply.status(200).send(updatedProduct);
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({ 
          message: error.errors.map(e => e.message).join(', ')
        });
      }
      throw error;
    }
  }

  async deleteProduct(
    request: FastifyRequest<{ Params: { productId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { productId } = productIdSchema.parse(request.params);
      const deleted = productService.deleteProduct(productId);
      
      if (!deleted) {
        return reply.status(404).send({ 
          message: `Product with id ${productId} not found` 
        });
      }
      
      return reply.status(204).send();
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({ 
          message: error.errors[0].message 
        });
      }
      throw error;
    }
  }
}

export const productController = new ProductController();