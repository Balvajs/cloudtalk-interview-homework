import path from 'node:path';

import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { vi } from 'vitest';

import * as database from '../db/database.ts';
import * as databaseSchema from '../db/schema.ts';

export const setupTestDatabase = async () => {
  const container = await new PostgreSqlContainer('postgres:17.6')
    .withEnvironment({
      POSTGRES_USER: 'test',
      POSTGRES_PASSWORD: 'test',
      POSTGRES_DB: 'test',
    })
    .start();

  const testDatabase = drizzle({
    schema: databaseSchema,
    connection: container.getConnectionUri(),
  });
  await migrate(testDatabase, {
    migrationsFolder: path.join(import.meta.dirname, '../../drizzle'),
  });

  vi.spyOn(database, 'database', 'get').mockReturnValue(testDatabase);

  return {
    testDatabase,
    container,
    cleanupTestDatabase: async () => {
      await testDatabase.$client.end();
      await container.stop();
    },
  };
};
