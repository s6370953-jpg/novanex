import fs from 'node:fs/promises';
import path from 'node:path';
import pool from '../config/database';

const migrationDirectory = path.resolve(process.cwd(), '..', 'database', 'migrations');

const runMigrations = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const migrations = (await fs.readdir(migrationDirectory))
      .filter((name) => /^\d+_[\w-]+\.sql$/.test(name))
      .sort();

    for (const name of migrations) {
      const alreadyApplied = await client.query(
        'SELECT 1 FROM schema_migrations WHERE name = $1',
        [name]
      );
      if (alreadyApplied.rowCount) {
        console.log(`Skipping applied migration ${name}`);
        continue;
      }

      const sql = await fs.readFile(path.join(migrationDirectory, name), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
        await client.query('COMMIT');
        console.log(`Applied migration ${name}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
};

runMigrations().catch((error: unknown) => {
  console.error('Database migration failed. Check the database connection and migration files.');
  if (error instanceof Error && 'code' in error) {
    console.error('PostgreSQL error code:', String(error.code));
  }
  process.exitCode = 1;
});
