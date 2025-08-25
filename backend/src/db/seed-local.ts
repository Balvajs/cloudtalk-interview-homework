import { parseArgs } from 'node:util';

import { reset } from 'drizzle-seed';

import { database } from './database.ts';
import * as databaseSchema from './schema.ts';
import { seedDatabase } from './seed.ts';

const {
  values: { count },
} = parseArgs({
  args: process.argv.slice(2),
  options: { count: { type: 'string', default: '50' } },
});

const parsedCount = Number.parseInt(count);

if (Number.isNaN(parsedCount) || parsedCount < 0) {
  throw new Error(`The argument 'count' must be a positive integer.`);
}

await reset(database, databaseSchema);
await seedDatabase({ database, count: parsedCount });
