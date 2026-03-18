import { CreateProductDTO } from '../types/product';

export function validateProduct(product: any): product is CreateProductDTO {
  return (
    typeof product.name === 'string' &&
    product.name.trim().length > 0 &&
    typeof product.description === 'string' &&
    product.description.trim().length > 0 &&
    typeof product.price === 'number' &&
    product.price > 0 &&
    typeof product.category === 'string' &&
    product.category.trim().length > 0 &&
    typeof product.inStock === 'boolean'
  );
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}