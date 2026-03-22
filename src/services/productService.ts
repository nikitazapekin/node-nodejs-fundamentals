import { randomUUID } from 'crypto';
import { db } from '../db/inMemoryDB';
import { Product, CreateProductDTO, UpdateProductDTO } from '../types/product';
import { productSchema } from '../schemas/productSchemas';

export class ProductService {
  getAllProducts(): Product[] {
    return db.getAll();
  }

  getProductById(id: string): Product | undefined {
    return db.getById(id);
  }

  createProduct(data: CreateProductDTO): Product {
    const validatedData = productSchema.parse(data);
    
    const product: Product = {
      id: randomUUID(),
      ...validatedData
    };
    
    return db.create(product);
  }

  updateProduct(id: string, data: UpdateProductDTO): Product | undefined {
    const existingProduct = db.getById(id);
    if (!existingProduct) {
      return undefined;
    }
    
    const updatedProduct: Product = {
      ...existingProduct,
      ...data
    };
    
    // Validate the updated product
    productSchema.parse({
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: updatedProduct.price,
      category: updatedProduct.category,
      inStock: updatedProduct.inStock
    });
    
    return db.update(id, updatedProduct);
  }

  deleteProduct(id: string): boolean {
    return db.delete(id);
  }
}

export const productService = new ProductService();