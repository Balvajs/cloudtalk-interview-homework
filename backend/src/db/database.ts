import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from './schema.ts';

if (!process.env.DATABASE_URL) {
  throw new Error('env variable DATABASE_URL is not defined');
}

export const database = drizzle({
  schema,
  connection: process.env.DATABASE_URL,
});
