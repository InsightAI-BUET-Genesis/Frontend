import * as dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';

dotenv.config();
// const { DATABASE_URL } = process.env;
// console.log(DATABASE_URL)

export default {
    schema: './src/lib/server/schema.ts',
    out: './drizzle',
    // driver: 'pg', // This line might not be needed anymore.
    dialect: 'postgresql', // Add this line to specify the database dialect.
    verbose: true,
    dbCredentials: {
        connectionString: process.env.DATABASE_URL!,
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        ssl: "require",
        url: process.env.PUBLIC_SUPABASE_URL,

    },
} satisfies Config;