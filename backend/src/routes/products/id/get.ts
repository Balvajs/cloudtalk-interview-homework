import { createSelectSchema } from 'drizzle-zod';
import { Router } from 'express';
import { z } from 'zod';

import { database } from '../../../db/database.ts';
import * as databaseSchema from '../../../db/schema.ts';

export const getProductRouter = Router();

/**
 * Get product by ID
 */
export const selectProductByIdSchema = createSelectSchema(
  databaseSchema.products,
  {
    // the id must be more relaxed, ZOD's uuid is not compatible with Drizzle's uuid
    id: z.guid(),
  },
).pick({
  id: true,
});
getProductRouter.get('/:id', async (req, res) => {
  const { id } = selectProductByIdSchema.parse(req.params);
  const product = await database.query.products.findFirst({
    where: (products, { eq }) => eq(products.id, id),
  });

  if (!product) {
    return res
      .status(404)
      .json({ error: `Product with ID ${req.params.id} not found` });
  }
  res.json(product);
});
