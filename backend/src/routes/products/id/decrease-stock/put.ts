import { DrizzleQueryError, eq, sql } from 'drizzle-orm';
import { Router } from 'express';
import { z } from 'zod';

import { database } from '../../../../db/database.ts';
import * as databaseSchema from '../../../../db/schema.ts';
import { selectProductByIdSchema } from '../get.ts';

export const putDecreaseStockRouter = Router();

/**
 * Decrease stock for a product
 */
const decreaseStockSchema = z.object({
  amount: z.number().min(1).optional().default(1),
});
putDecreaseStockRouter.put('/:id/decrease-stock', async (req, res) => {
  const { id } = selectProductByIdSchema.parse(req.params);
  const { amount } = decreaseStockSchema.parse(req.body);

  const [product] = await database
    .update(databaseSchema.products)
    .set({ quantity: sql`${databaseSchema.products.quantity} - ${amount}` })
    .where(eq(databaseSchema.products.id, id))
    .returning()
    .catch(async (error) => {
      // Stock can't be negative so return the current product without a change
      if (
        error instanceof DrizzleQueryError &&
        error.cause &&
        'constraint' in error.cause &&
        error.cause.constraint === 'quantity_positive'
      ) {
        return [
          await database.query.products.findFirst({
            where: eq(databaseSchema.products.id, id),
          }),
        ];
      }
      throw error;
    });

  if (!product) {
    return res
      .status(404)
      .json({ error: `Product with ID ${req.params.id} not found` });
  }
  res.status(200).json(product);
});
