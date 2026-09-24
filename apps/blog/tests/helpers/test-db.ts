/**
 * @file test-db.ts
 * @description In-memory Cloudflare D1 test harness powered by Node.js built-in DatabaseSync.
 * 
 * POC & Architectural Rationale:
 * - Rather than faking query responses with static maps or relying on a running Miniflare daemon,
 *   this harness wraps Node 22's native SQLite engine into the Cloudflare D1Database API contract.
 * - Why this is the optimal testing approach:
 *   1. Full SQL Compliance: Foreign keys, cascade deletes, unique indices, and SQLite dialect features
 *      are genuinely evaluated by the SQLite engine.
 *   2. Zero Latency: Entire migrations run in <2ms entirely in memory (:memory:).
 *   3. Complete Isolation: Each test file or test case can instantiate an independent, fresh database.
 */

import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { createDb, type Database } from '@repo/db';

export interface TestDatabaseContext {
  d1: any;
  db: Database;
  sqlite: DatabaseSync;
  locals: App.Locals;
}

export function createTestD1(sqliteDb: DatabaseSync): any {
  return {
    prepare(sql: string) {
      let boundParams: any[] = [];
      const statement = {
        bind(...args: any[]) {
          boundParams = args;
          return statement;
        },
        async all() {
          const stmt = sqliteDb.prepare(sql);
          const results = stmt.all(...boundParams);
          return {
            results,
            success: true,
            meta: { duration: 0 },
          };
        },
        async run() {
          const stmt = sqliteDb.prepare(sql);
          const info = stmt.run(...boundParams);
          return {
            success: true,
            meta: {
              changes: info.changes,
              last_row_id: Number(info.lastInsertRowid),
              duration: 0,
            },
          };
        },
        async raw() {
          const stmt = sqliteDb.prepare(sql);
          const rows = stmt.all(...boundParams);
          return rows.map((r: any) => Object.values(r));
        },
        // D1 contract: first row (or null); used by health checks.
        async first(column?: string) {
          const row: any = sqliteDb.prepare(sql).get(...boundParams);
          if (!row) return null;
          return column ? row[column] : row;
        },
      };
      return statement;
    },
    async exec(sql: string) {
      sqliteDb.exec(sql);
      return { count: 0, duration: 0 };
    },
    async batch(statements: any[]) {
      const results: any[] = [];
      for (const stmt of statements) {
        results.push(await stmt.run());
      }
      return results;
    },
  };
}

export function createTestDatabase(): TestDatabaseContext {
  const sqlite = new DatabaseSync(':memory:');

  // Enable foreign keys
  sqlite.exec('PRAGMA foreign_keys = ON;');

  // Read and execute initial schema migration
  const migrationPath = path.resolve(import.meta.dirname, '../../../../packages/db/migrations/0000_initial.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  // Split and execute statements
  const statements = migrationSql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    sqlite.exec(statement + ';');
  }

  const d1 = createTestD1(sqlite);
  const db = createDb(d1);

  // In-memory mock R2 bucket
  const storageMap = new Map<string, { body: Uint8Array; metadata: any }>();
  const mockBucket = {
    async put(key: string, stream: any, options?: any) {
      let buffer: Buffer;
      if (typeof stream?.arrayBuffer === 'function') {
        buffer = Buffer.from(await stream.arrayBuffer());
      } else if (stream instanceof ArrayBuffer) {
        buffer = Buffer.from(new Uint8Array(stream));
      } else if (stream instanceof Uint8Array || Buffer.isBuffer(stream)) {
        buffer = Buffer.from(stream);
      } else {
        buffer = Buffer.from(String(stream));
      }
      storageMap.set(key, { body: buffer, metadata: options?.httpMetadata });
      return { key };
    },
    async get(key: string) {
      const item = storageMap.get(key);
      if (!item) return null;
      return {
        key,
        body: item.body,
        size: item.body.byteLength,
        httpMetadata: item.metadata,
        httpEtag: '"test-etag"',
        async text() {
          return Buffer.from(item.body).toString('utf8');
        },
        writeHttpMetadata(headers: Headers) {
          if (item.metadata?.contentType) {
            headers.set('content-type', item.metadata.contentType);
          }
        },
      };
    },
    async head(key: string) {
      const obj = await mockBucket.get(key);
      if (!obj) return null;
      const { body: _omit, ...meta } = obj;
      return meta;
    },
    async list(options?: { limit?: number; prefix?: string }) {
      const keys = [...storageMap.keys()].filter((k) => !options?.prefix || k.startsWith(options.prefix));
      const limited = keys.slice(0, options?.limit ?? 1000);
      return { objects: limited.map((key) => ({ key })), truncated: limited.length < keys.length };
    },
    async delete(key: string) {
      storageMap.delete(key);
    },
  };

  const locals: any = {
    runtime: {
      env: {
        DB: d1,
        BUCKET: mockBucket,
        SITE_URL: 'http://localhost:4321',
        DEV_MODE: 'true',
        R2_PUBLIC_DOMAIN: '/api/media',
      },
    },
  };

  return { d1, db, sqlite, locals };
}
