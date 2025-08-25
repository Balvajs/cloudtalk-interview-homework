import { eq } from 'drizzle-orm';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { Router } from 'express';
import { z } from 'zod';

import { database } from '../db/database.ts';
import * as databaseSchema from '../db/schema.ts';

export const productsRouter = Router();

/**
 * Get all products with pagination
 */
const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  // TODO: we should validate that the cursor is a valid combination of timestamp and uuid
  cursor: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
});
productsRouter.get('/', async (req, res) => {
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

/**
 * Get product by ID
 */
const selectProductByIdSchema = createSelectSchema(databaseSchema.products, {
  // the id must be more relaxed, ZOD's uuid is not compatible with Drizzle's uuid
  id: z.guid(),
}).pick({
  id: true,
});
productsRouter.get('/:id', async (req, res) => {
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
productsRouter.post('/', async (req, res) => {
  const newProduct = insertProductSchema.parse(req.body);
  const [product] = await database
    .insert(databaseSchema.products)
    .values(newProduct)
    .returning();
  res.status(201).json(product);
});

/**
 * Update an existing product
 */
const updateProductSchema = createUpdateSchema(databaseSchema.products, {
  price: z.number().min(0).multipleOf(0.01).optional(),
  quantity: z.number().min(0).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
productsRouter.put('/:id', async (req, res) => {
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

/**
 * Delete an existing product
 */
productsRouter.delete('/:id', async (req, res) => {
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
