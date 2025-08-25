import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { seed } from 'drizzle-seed';

import * as databaseSchema from './schema.ts';

export const seedDatabase = ({
  database,
  count = 50,
}: {
  database: NodePgDatabase<typeof databaseSchema>;
  count?: number;
}) =>
  seed(database, databaseSchema, { count }).refine((funcs) => ({
    products: {
      columns: {
        quantity: funcs.int({ minValue: 0 }),
        price: funcs.number({ minValue: 0, precision: 2 }),
      },
    },
  }));
