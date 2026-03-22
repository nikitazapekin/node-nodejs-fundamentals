import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be a positive number'),
  category: z.string().min(1, 'Category is required'),
  inStock: z.boolean()
});

export const productIdSchema = z.object({
  productId: z.string().uuid('Invalid UUID format')
});

export type ProductInput = z.infer<typeof productSchema>;