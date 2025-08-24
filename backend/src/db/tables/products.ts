import { sql } from 'drizzle-orm';
import {
  check,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const products = pgTable(
  'products',
  {
    id: uuid().primaryKey().defaultRandom(),
    name: varchar({ length: 255 }).notNull(),
    quantity: integer().notNull(),
    price: integer().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp()
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check('quantity_positive', sql`${table.quantity} >= 0`),
    check('price_positive', sql`${table.price} >= 0`),
  ],
);
