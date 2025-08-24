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
 * Get all products
 */
productsRouter.get('/', async (req, res) => {
  const products = await database.query.products.findMany();
  res.json(products);
});

/**
 * Get product by ID
 */
const selectProductByIdSchema = createSelectSchema(
  databaseSchema.products,
).pick({
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
