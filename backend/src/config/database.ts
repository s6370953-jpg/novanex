import dotenv from 'dotenv';
import path from 'node:path';
import { Pool, PoolConfig } from 'pg';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const connectionString = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
const poolConfig: PoolConfig = {
  ...(connectionString
    ? { connectionString }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_NAME || 'learnova',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
      }),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  const code = 'code' in err ? String(err.code) : 'unknown error';
  console.error('Unexpected PostgreSQL pool error', code);
});

export const query = (text: string, params?: unknown[]) => {
  return pool.query(text, params);
};

export const getClient = () => {
  return pool.connect();
};

export const healthCheck = async (): Promise<boolean> => {
  try {
    const result = await query('SELECT 1');
    return result.rowCount === 1;
  } catch (error) {
    const code = error instanceof Error && 'code' in error
      ? String(error.code)
      : 'unknown error';
    console.error('Database health check failed', code);
    return false;
  }
};

export const closeDatabase = async (): Promise<void> => {
  await pool.end();
};

export default pool;
