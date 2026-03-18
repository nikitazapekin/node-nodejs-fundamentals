import { randomUUID } from 'crypto';
import { Product, CreateProductDTO, ProductRepository } from '../types/product';

 
class InMemoryProductRepository implements ProductRepository {
  private products: Map<string, Product> = new Map();

  findAll(): Product[] {
    return Array.from(this.products.values());
  }

  findById(id: string): Product | undefined {
    return this.products.get(id);
  }

  create(productData: CreateProductDTO): Product {
    const product: Product = {
      id: randomUUID(),
      ...productData,
    };
    this.products.set(product.id, product);
    return product;
  }

  update(id: string, productData: Partial<CreateProductDTO>): Product | undefined {
    const existingProduct = this.products.get(id);
    if (!existingProduct) {
      return undefined;
    }

    const updatedProduct = {
      ...existingProduct,
      ...productData,
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  delete(id: string): boolean {
    return this.products.delete(id);
  }
}
 
export const productRepository = new InMemoryProductRepository();

export const productService = {
  getAllProducts: () => productRepository.findAll(),

  getProductById: (id: string) => productRepository.findById(id),

  createProduct: (productData: CreateProductDTO) => productRepository.create(productData),

  updateProduct: (id: string, productData: Partial<CreateProductDTO>) => 
    productRepository.update(id, productData),

  deleteProduct: (id: string) => productRepository.delete(id),
};