import { eq } from 'drizzle-orm';
import { createUpdateSchema } from 'drizzle-zod';
import { Router } from 'express';
import { z } from 'zod';

import { database } from '../../../db/database.ts';
import * as databaseSchema from '../../../db/schema.ts';

export const putProductRouter = Router();

/**
 * Update an existing product
 */
const updateProductSchema = createUpdateSchema(databaseSchema.products, {
  // the id must be more relaxed, ZOD's uuid is not compatible with Drizzle's uuid
  id: z.guid(),
  price: z.number().min(0).multipleOf(0.01).optional(),
  quantity: z.number().min(0).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
putProductRouter.put('/:id', async (req, res) => {
  const updatedProduct = updateProductSchema.parse(req.body);
  const [product] = await database
    .update(databaseSchema.products)
    .set(updatedProduct)
    .where(eq(databaseSchema.products.id, req.params.id))
    .returning();

  if (!product) {
    return res
      .status(404)
      .json({ error: `Product with ID ${req.params.id} not found` });
  }
  res.status(200).json(product);
});
