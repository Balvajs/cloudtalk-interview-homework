import { drizzle } from 'drizzle-orm/node-postgres';

import * as databaseSchema from '../schema.ts';

export const database = drizzle.mock({ schema: databaseSchema });
