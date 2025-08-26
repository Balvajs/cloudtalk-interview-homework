import { createInsertSchema } from 'drizzle-zod';
import { Router } from 'express';
import { z } from 'zod';

import { database } from '../../../db/database.ts';
import * as databaseSchema from '../../../db/schema.ts';

export const postProductRouter = Router();

/**
 * Create a new product
 */
const insertProductSchema = createInsertSchema(databaseSchema.products, {
  price: z.number().min(0).multipleOf(0.01),
  quantity: z.number().min(0),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
postProductRouter.post('/', async (req, res) => {
  const newProduct = insertProductSchema.parse(req.body);
  const [product] = await database
    .insert(databaseSchema.products)
    .values(newProduct)
    .returning();
  res.status(201).json(product);
});
