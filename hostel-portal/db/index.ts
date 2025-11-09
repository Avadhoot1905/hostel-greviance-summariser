import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Database connection configuration for Neon
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2zMLuWY6sqlk@ep-curly-night-adng21zf-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

// Create the connection optimized for Neon
const sql = postgres(connectionString, {
  max: 10, // Increased for better performance
  connect_timeout: 30,
  idle_timeout: 30,
  ssl: 'require', // Required for Neon
  onnotice: () => {}, // Suppress notices
});

// Create the Drizzle database instance
export const db = drizzle(sql, { schema });

// Function to test database connection
export async function testDatabaseConnection() {
  try {
    await sql`SELECT 1 as test`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Function to gracefully close the connection
export async function closeDatabaseConnection() {
  try {
    await sql.end();
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}

// Export the connection for cleanup if needed
export { sql };
