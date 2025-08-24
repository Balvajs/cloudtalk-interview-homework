import { eq } from 'drizzle-orm';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { Router } from 'express';

import { database } from '../db/database.ts';
import { databaseSchema } from '../db/schema.ts';

export const productsRouter = Router();

productsRouter.get('/', async function (req, res) {
  const products = await database.select().from(databaseSchema.products);
  res.json(products);
});

const insertProductSchema = createInsertSchema(databaseSchema.products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
productsRouter.post('/', async function (req, res) {
  const newProduct = insertProductSchema.parse(req.body);
  const [product] = await database
    .insert(databaseSchema.products)
    .values(newProduct)
    .returning();
  res.status(201).json(product);
});

const updateProductSchema = createUpdateSchema(databaseSchema.products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
productsRouter.put('/:id', async function (req, res) {
  const updatedProduct = updateProductSchema.parse(req.body);
  const [product] = await database
    .update(databaseSchema.products)
    .set(updatedProduct)
    .where(eq(databaseSchema.products.id, req.params.id))
    .returning();
  res.status(200).json(product);
});

productsRouter.delete('/:id', async function (req, res) {
  const [product] = await database
    .delete(databaseSchema.products)
    .where(eq(databaseSchema.products.id, req.params.id))
    .returning();
  res.status(200).json(product);
});
