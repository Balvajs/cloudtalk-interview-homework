import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { seed } from 'drizzle-seed';

import * as databaseSchema from './schema.ts';

export const seedDatabase = ({
  database,
}: {
  database: NodePgDatabase<typeof databaseSchema>;
}) =>
  seed(database, databaseSchema).refine((funcs) => ({
    products: {
      columns: {
        quantity: funcs.int({ minValue: 0 }),
        price: funcs.number({ minValue: 0, precision: 2 }),
      },
    },
  }));
