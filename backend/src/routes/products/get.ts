import { Router } from 'express';
import { z } from 'zod';

import { database } from '../../db/database.ts';

export const getProductsRouter = Router();

/**
 * Get all products with pagination
 */
const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  // TODO: we should validate that the cursor is a valid combination of timestamp and uuid
  cursor: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
});
getProductsRouter.get('/', async (req, res) => {
  const { limit, cursor, order } = paginationSchema.parse(req.query);

  const [dateCursor = '', idCursor = ''] = cursor ? cursor.split(',') : [];

  const products = await database.query.products.findMany({
    limit: limit + 1, // Fetch one extra to check if there are more results
    where: cursor
      ? (products, { gt, lt, and, or, eq }) =>
          or(
            (order === 'asc' ? gt : lt)(
              products.createdAt,
              new Date(Number.parseInt(dateCursor)),
            ),
            and(
              eq(products.createdAt, new Date(Number.parseInt(dateCursor))),
              (order === 'asc' ? gt : lt)(products.id, idCursor),
            ),
          )
      : undefined,
    orderBy: (products, { asc, desc }) =>
      order === 'asc'
        ? [asc(products.createdAt), asc(products.id)]
        : [desc(products.createdAt), desc(products.id)],
  });

  const hasNextPage = products.length > limit;
  const data = hasNextPage ? products.slice(0, -1) : products;
  const lastItem = data.at(-1);
  const nextCursor =
    hasNextPage && lastItem
      ? `${lastItem.createdAt.getTime()},${lastItem.id}`
      : undefined;

  res.json({
    data,
    pagination: {
      hasNextPage,
      nextCursor,
      limit,
      order,
    },
  });
});
