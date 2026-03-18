export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
}

export type CreateProductDTO = Omit<Product, 'id'>;

export interface ProductRepository {
  findAll(): Product[];
  findById(id: string): Product | undefined;
  create(product: CreateProductDTO): Product;
  update(id: string, product: Partial<CreateProductDTO>): Product | undefined;
  delete(id: string): boolean;
}