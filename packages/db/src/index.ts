import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export * from './schema';
export { schema };

export function createDb(d1: any) {
  return drizzle(d1, { schema });
}

export type Database = ReturnType<typeof createDb>;
