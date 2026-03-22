import { Product } from '../types/product';
import { promises as fs } from 'fs';
import { join } from 'path';

const DB_FILE = join(process.cwd(), 'db.json');

interface DBData {
  products: Record<string, Product>;
}

class InMemoryDB {
  private cache: Map<string, Product> = new Map();
  private initialized = false;

  private async init(): Promise<void> {
    if (this.initialized) return;
    
    try {
      const data = await fs.readFile(DB_FILE, 'utf-8');
      const dbData: DBData = JSON.parse(data);
      this.cache = new Map(Object.entries(dbData.products));
    } catch (error) {
      const dbData: DBData = { products: {} };
      await fs.writeFile(DB_FILE, JSON.stringify(dbData, null, 2));
    }
    
    this.initialized = true;
  }

  private async save(): Promise<void> {
    const dbData: DBData = {
      products: Object.fromEntries(this.cache)
    };
    await fs.writeFile(DB_FILE, JSON.stringify(dbData, null, 2));
  }

  private async load(): Promise<void> {
    try {
      const data = await fs.readFile(DB_FILE, 'utf-8');
      const dbData: DBData = JSON.parse(data);
      this.cache = new Map(Object.entries(dbData.products));
    } catch (error) {
      this.cache.clear();
    }
  }

  async getAll(): Promise<Product[]> {
    await this.init();
    await this.load();
    return Array.from(this.cache.values());
  }

  async getById(id: string): Promise<Product | undefined> {
    await this.init();
    await this.load();
    return this.cache.get(id);
  }

  async create(product: Product): Promise<Product> {
    await this.init();
    await this.load();
    this.cache.set(product.id, product);
    await this.save();
    return product;
  }

  async update(id: string, product: Product): Promise<Product | undefined> {
    await this.init();
    await this.load();
    if (!this.cache.has(id)) {
      return undefined;
    }
    this.cache.set(id, product);
    await this.save();
    return product;
  }

  async delete(id: string): Promise<boolean> {
    await this.init();
    await this.load();
    const result = this.cache.delete(id);
    if (result) {
      await this.save();
    }
    return result;
  }

  async clear(): Promise<void> {
    this.cache.clear();
    const dbData: DBData = { products: {} };
    await fs.writeFile(DB_FILE, JSON.stringify(dbData, null, 2));
  }
}

export const db = new InMemoryDB();