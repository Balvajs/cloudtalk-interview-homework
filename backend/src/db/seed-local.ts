import { database } from './database.ts';
import { seedDatabase } from './seed.ts';

await seedDatabase({ database });
