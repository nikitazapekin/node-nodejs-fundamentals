import { randomUUID } from 'crypto';
import { db } from '../db/inMemoryDB';
import { Product, CreateProductDTO, UpdateProductDTO } from '../types/product';
import { productSchema } from '../schemas/productSchemas';

export class ProductService {
  async getAllProducts(): Promise<Product[]> {
    return db.getAll();
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return db.getById(id);
  }

  async createProduct(data: CreateProductDTO): Promise<Product> {
    const validatedData = productSchema.parse(data);
    
    const product: Product = {
      id: randomUUID(),
      ...validatedData
    };
    
    return db.create(product);
  }

  async updateProduct(id: string, data: UpdateProductDTO): Promise<Product | undefined> {
    const existingProduct = await db.getById(id);
    if (!existingProduct) {
      return undefined;
    }
    
    const updatedProduct: Product = {
      ...existingProduct,
      ...data
    };
    
    productSchema.parse({
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: updatedProduct.price,
      category: updatedProduct.category,
      inStock: updatedProduct.inStock
    });
    
    return db.update(id, updatedProduct);
  }

  async deleteProduct(id: string): Promise<boolean> {
    return db.delete(id);
  }
}

export const productService = new ProductService();