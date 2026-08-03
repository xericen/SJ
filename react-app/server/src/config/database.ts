import mysql, { type Pool } from 'mysql2/promise';
import { env } from './env.js';

let pool: Pool | undefined;
let connected = false;

export const getDatabasePool = (): Pool => {
  if (!pool) throw new Error('MySQL is not connected');
  return pool;
};

export const databaseStatus = () => ({
  connected,
  name: connected ? env.MYSQL_DATABASE : null,
});

export const connectDatabase = async (): Promise<void> => {
  try {
    pool = mysql.createPool({
      host: env.MYSQL_HOST,
      port: env.MYSQL_PORT,
      user: env.MYSQL_USER,
      password: env.MYSQL_PASSWORD,
      database: env.MYSQL_DATABASE,
      connectionLimit: env.MYSQL_CONNECTION_LIMIT,
      connectTimeout: 8_000,
      charset: 'utf8mb4',
    });
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jochwon_documents (
        collection_name VARCHAR(80) NOT NULL,
        document_id VARCHAR(64) NOT NULL,
        document_data LONGTEXT NOT NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (collection_name, document_id),
        KEY idx_jochwon_documents_collection (collection_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    connected = true;
    console.log(`[Database] MySQL connected (database: ${env.MYSQL_DATABASE})`);
  } catch (error) {
    connected = false;
    await pool?.end().catch(() => undefined);
    pool = undefined;
    console.error('[Database] MySQL connection failed:', error instanceof Error ? error.message : error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  connected = false;
  await pool?.end();
  pool = undefined;
  console.log('[Database] MySQL disconnected');
};
