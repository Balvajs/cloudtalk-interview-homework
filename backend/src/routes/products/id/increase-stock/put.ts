import { eq, sql } from 'drizzle-orm';
import { Router } from 'express';
import { z } from 'zod';

import { database } from '../../../../db/database.ts';
import * as databaseSchema from '../../../../db/schema.ts';
import { selectProductByIdSchema } from '../get.ts';

export const putIncreaseStockRouter = Router();

/**
 * Increase stock for a product
 */
const increaseStockSchema = z.object({
  amount: z.number().min(1).optional().default(1),
});
putIncreaseStockRouter.put('/:id/increase-stock', async (req, res) => {
  const { id } = selectProductByIdSchema.parse(req.params);
  const { amount } = increaseStockSchema.parse(req.body);
  const [product] = await database
    .update(databaseSchema.products)
    .set({ quantity: sql`${databaseSchema.products.quantity} + ${amount}` })
    .where(eq(databaseSchema.products.id, id))
    .returning();

  if (!product) {
    return res
      .status(404)
      .json({ error: `Product with ID ${req.params.id} not found` });
  }
  res.status(200).json(product);
});
