import { seed } from 'drizzle-seed';

import { database } from './database.ts';
import { databaseSchema } from './schema.ts';

await seed(database, databaseSchema).refine((funcs) => ({
  products: {
    columns: {
      quantity: funcs.int({ minValue: 0 }),
      price: funcs.int({ minValue: 0 }),
    },
  },
}));
