import { drizzle } from 'drizzle-orm/node-postgres';

if (!process.env.DATABASE_URL) {
  throw new Error('env variable DATABASE_URL is not defined');
}

export const database = drizzle(process.env.DATABASE_URL);
