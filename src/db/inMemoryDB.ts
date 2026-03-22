import { Product } from '../types/product';

class InMemoryDB {
  private products: Map<string, Product> = new Map();

  getAll(): Product[] {
    return Array.from(this.products.values());
  }

  getById(id: string): Product | undefined {
    return this.products.get(id);
  }

  create(product: Product): Product {
    this.products.set(product.id, product);
    return product;
  }

  update(id: string, product: Product): Product | undefined {
    if (!this.products.has(id)) {
      return undefined;
    }
    this.products.set(id, product);
    return product;
  }

  delete(id: string): boolean {
    return this.products.delete(id);
  }

  clear(): void {
    this.products.clear();
  }
}

export const db = new InMemoryDB();