import { seed } from 'drizzle-seed';

import { database } from './database.ts';
import * as schema from './schema.ts';

await seed(database, schema).refine((funcs) => ({
  products: {
    columns: {
      quantity: funcs.int({ minValue: 0 }),
      price: funcs.int({ minValue: 0 }),
    },
  },
}));
