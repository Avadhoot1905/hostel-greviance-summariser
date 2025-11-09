import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const url = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_2zMLuWY6sqlk@ep-curly-night-adng21zf-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";

export default {
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: url,
  },
  verbose: true,
  strict: true,
} satisfies Config;
