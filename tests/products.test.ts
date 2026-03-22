import { buildApp } from '../src/app';
import { FastifyInstance } from 'fastify';
import { db } from '../src/db/inMemoryDB';

describe('Product API Tests', () => {
  let app: FastifyInstance;
  
  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });
  
  afterAll(async () => {
    await app.close();
  });
  
  beforeEach(async () => {
    await db.clear();
  });
  
  describe('GET /api/products', () => {
    it('should return empty array when no products exist', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/products'
      });
      
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toEqual([]);
    });
    
    it('should return all products', async () => {
      // Create a test product
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          name: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          category: 'electronics',
          inStock: true
        }
      });
      
      const product = JSON.parse(createResponse.payload);
      
      const response = await app.inject({
        method: 'GET',
        url: '/api/products'
      });
      
      expect(response.statusCode).toBe(200);
      const products = JSON.parse(response.payload);
      expect(products).toHaveLength(1);
      expect(products[0]).toEqual(product);
    });
  });
  
  describe('GET /api/products/:productId', () => {
    it('should return product by id', async () => {
      // Create a product first
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          name: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          category: 'electronics',
          inStock: true
        }
      });
      
      const product = JSON.parse(createResponse.payload);
      
      const response = await app.inject({
        method: 'GET',
        url: `/api/products/${product.id}`
      });
      
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toEqual(product);
    });
    
    it('should return 400 for invalid UUID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/products/invalid-uuid'
      });
      
      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.payload)).toHaveProperty('message');
    });
    
    it('should return 404 for non-existent product', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/products/123e4567-e89b-12d3-a456-426614174000'
      });
      
      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.payload)).toHaveProperty('message');
    });
  });
  
  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const productData = {
        name: 'New Product',
        description: 'Product Description',
        price: 49.99,
        category: 'books',
        inStock: true
      };
      
      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: productData
      });
      
      expect(response.statusCode).toBe(201);
      const product = JSON.parse(response.payload);
      expect(product).toHaveProperty('id');
      expect(product.name).toBe(productData.name);
      expect(product.description).toBe(productData.description);
      expect(product.price).toBe(productData.price);
      expect(product.category).toBe(productData.category);
      expect(product.inStock).toBe(productData.inStock);
    });
    
    it('should return 400 for missing required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          name: 'Incomplete Product'
        }
      });
      
      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.payload)).toHaveProperty('message');
    });
    
    it('should return 400 for invalid price', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          name: 'Test Product',
          description: 'Test Description',
          price: -10,
          category: 'electronics',
          inStock: true
        }
      });
      
      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.payload)).toHaveProperty('message');
    });
  });
  
  describe('PUT /api/products/:productId', () => {
    it('should update an existing product', async () => {
      // Create a product first
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          name: 'Original Product',
          description: 'Original Description',
          price: 29.99,
          category: 'clothing',
          inStock: true
        }
      });
      
      const product = JSON.parse(createResponse.payload);
      
      const updateData = {
        name: 'Updated Product',
        price: 39.99
      };
      
      const response = await app.inject({
        method: 'PUT',
        url: `/api/products/${product.id}`,
        payload: updateData
      });
      
      expect(response.statusCode).toBe(200);
      const updatedProduct = JSON.parse(response.payload);
      expect(updatedProduct.id).toBe(product.id);
      expect(updatedProduct.name).toBe('Updated Product');
      expect(updatedProduct.price).toBe(39.99);
      expect(updatedProduct.description).toBe('Original Description');
    });
    
    it('should return 404 for non-existent product', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/products/123e4567-e89b-12d3-a456-426614174000',
        payload: {
          name: 'Updated Product'
        }
      });
      
      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.payload)).toHaveProperty('message');
    });
  });
  
  describe('DELETE /api/products/:productId', () => {
    it('should delete an existing product', async () => {
      // Create a product first
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          name: 'Product to Delete',
          description: 'Will be deleted',
          price: 19.99,
          category: 'electronics',
          inStock: false
        }
      });
      
      const product = JSON.parse(createResponse.payload);
      
      const deleteResponse = await app.inject({
        method: 'DELETE',
        url: `/api/products/${product.id}`
      });
      
      expect(deleteResponse.statusCode).toBe(204);
      
      // Verify product is deleted
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/products/${product.id}`
      });
      
      expect(getResponse.statusCode).toBe(404);
    });
    
    it('should return 404 for non-existent product', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/products/123e4567-e89b-12d3-a456-426614174000'
      });
      
      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.payload)).toHaveProperty('message');
    });
  });
  
  describe('Non-existing endpoints', () => {
    it('should return 404 for non-existing endpoints', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/non-existing'
      });
      
      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.payload)).toHaveProperty('message');
    });
  });
});