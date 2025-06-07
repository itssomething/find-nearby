import assert from 'node:assert/strict';
import { test } from 'node:test';

import pool, { findNearbyDoctors } from '../src/db';

// Ensure TypeScript types don't leak
interface QueryArgs {
  text: string;
  values?: any[];
}

test('findNearbyDoctors passes correct parameters to pg query', async () => {
  const args: any[] = [];
  const fakeRows = [{ id: 1, name: 'Dr. Example' }];
  const originalQuery = pool.query.bind(pool);

  // stub query
  (pool as any).query = async (text: string, params: any[]) => {
    args.push(text, params);
    return { rows: fakeRows } as any;
  };

  try {
    const result = await findNearbyDoctors(100, 50, 1234);
    assert.deepEqual(args[1], [100, 50, 1234]);
    assert.deepEqual(result, fakeRows);
  } finally {
    (pool as any).query = originalQuery;
  }
});
