import { eq } from 'drizzle-orm';
import { Router } from 'express';

import { database } from '../../../db/database.ts';
import * as databaseSchema from '../../../db/schema.ts';

import { selectProductByIdSchema } from './get.ts';

export const deleteProductRouter = Router();

/**
 * Delete an existing product
 */
deleteProductRouter.delete('/:id', async (req, res) => {
  const { id } = selectProductByIdSchema.parse(req.params);
  const [product] = await database
    .delete(databaseSchema.products)
    .where(eq(databaseSchema.products.id, id))
    .returning();

  if (!product) {
    return res
      .status(404)
      .json({ error: `Product with ID ${req.params.id} not found` });
  }
  res.status(200).json(product);
});
